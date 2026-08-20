import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';
import {
  createSession,
  getSettings,
  logSecurityEvent,
} from '../utils/telemetry.js';

function sendAuthResponse(res, user) {
  const token = jwt.sign(
    { id: user._id, role: user.role || 'user' },
    process.env.JWT_SECRET
  );
  const { password, ...rest } = user._doc;
  const expiryDate = new Date(Date.now() + 3600000);

  return res
    .cookie('access_token', token, {
      httpOnly: true,
      expires: expiryDate,
      sameSite: 'lax',
      path: '/',
    })
    .status(200)
    .json(rest);
}

async function assertUserCanSignIn(user, req) {
  if (user.status === 'disabled') {
    await logSecurityEvent({
      type: 'login_failed',
      severity: 'warning',
      user,
      message: 'Sign-in blocked for disabled account',
      req,
      notify: true,
      notifyTitle: 'Disabled account login attempt',
    });
    return 'This account has been disabled.';
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    await logSecurityEvent({
      type: 'lockout',
      severity: 'critical',
      user,
      message: 'Sign-in blocked while account is locked',
      req,
      notify: true,
      notifyTitle: 'Locked account login attempt',
    });
    return 'Account temporarily locked after repeated failed logins.';
  }

  return null;
}

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  const settings = await getSettings();

  if (!settings.passwordAuthEnabled) {
    return next(errorHandler(403, 'Password registration is currently disabled'));
  }

  if (!username || !email || !password) {
    return next(errorHandler(400, 'Username, email, and password are required'));
  }

  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    authProvider: 'credentials',
    role: 'user',
    status: 'active',
  });
  try {
    await newUser.save();
    await logSecurityEvent({
      type: 'registration',
      severity: 'success',
      user: newUser,
      message: 'New account registered',
      req,
      notify: true,
      notifyTitle: 'New user registered',
    });
    res.status(201).json({ success: true, message: 'User created successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return next(errorHandler(409, 'Username or email already exists'));
    }
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  const settings = await getSettings();

  if (!settings.passwordAuthEnabled) {
    return next(errorHandler(403, 'Password authentication is currently disabled'));
  }

  if (!email || !password) {
    return next(errorHandler(400, 'Email and password are required'));
  }

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) {
      await logSecurityEvent({
        type: 'login_failed',
        severity: 'warning',
        message: 'Failed login for unknown email',
        req,
        metadata: { email },
        notify: true,
        notifyTitle: 'Failed login attempt',
      });
      return next(errorHandler(404, 'User not found. Sign up first, or use Google if you created the account with Google.'));
    }
    if (validUser.role === 'admin') {
      return next(errorHandler(403, 'Admin accounts must use the staff portal at /admin/sign-in'));
    }

    const blocked = await assertUserCanSignIn(validUser, req);
    if (blocked) return next(errorHandler(403, blocked));

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      validUser.failedLoginCount = (validUser.failedLoginCount || 0) + 1;
      const maxAttempts = settings.maxLoginAttempts || 5;
      if (validUser.failedLoginCount >= maxAttempts) {
        validUser.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        await validUser.save();
        await logSecurityEvent({
          type: 'lockout',
          severity: 'critical',
          user: validUser,
          message: 'Account locked after repeated failed logins',
          req,
          notify: true,
          notifyTitle: 'Account lockout',
        });
        return next(errorHandler(401, 'Wrong email or password. Account temporarily locked.'));
      }
      await validUser.save();
      await logSecurityEvent({
        type: 'login_failed',
        severity: 'warning',
        user: validUser,
        message: 'Failed login attempt',
        req,
        notify: validUser.failedLoginCount >= 3,
        notifyTitle: 'Multiple failed login attempts',
      });
      return next(errorHandler(401, 'Wrong email or password'));
    }

    validUser.lastLoginAt = new Date();
    validUser.failedLoginCount = 0;
    validUser.lockedUntil = null;
    await validUser.save();
    await createSession({ user: validUser, req, portal: 'user' });
    await logSecurityEvent({
      type: 'login_success',
      severity: 'success',
      user: validUser,
      message: 'Successful login',
      req,
    });
    await logSecurityEvent({
      type: 'session_created',
      severity: 'info',
      user: validUser,
      message: 'New session created',
      req,
    });
    return sendAuthResponse(res, validUser);
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  const { name, email, photo } = req.body;
  const settings = await getSettings();

  if (!settings.googleAuthEnabled) {
    return next(errorHandler(403, 'Google authentication is currently disabled'));
  }

  if (!email) {
    return next(errorHandler(400, 'Email is required'));
  }

  try {
    const user = await User.findOne({ email });
    if (user) {
      if (user.role === 'admin') {
        return next(errorHandler(403, 'Admin accounts must use the staff portal'));
      }
      const blocked = await assertUserCanSignIn(user, req);
      if (blocked) return next(errorHandler(403, blocked));
      user.lastLoginAt = new Date();
      if (!user.authProvider) user.authProvider = 'google';
      user.failedLoginCount = 0;
      await user.save();
      await createSession({ user, req, portal: 'user' });
      await logSecurityEvent({
        type: 'login_success',
        severity: 'success',
        user,
        message: 'Successful Google login',
        req,
      });
      return sendAuthResponse(res, user);
    }

    const generatedPassword =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).slice(-8);
    const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
    const baseName = (name || email.split('@')[0]).split(' ').join('').toLowerCase();
    const newUser = new User({
      username: baseName + Math.random().toString(36).slice(-8),
      email,
      password: hashedPassword,
      profilePicture: photo,
      authProvider: 'google',
      role: 'user',
      status: 'active',
    });
    await newUser.save();
    newUser.lastLoginAt = new Date();
    await newUser.save();
    await createSession({ user: newUser, req, portal: 'user' });
    await logSecurityEvent({
      type: 'registration',
      severity: 'success',
      user: newUser,
      message: 'New account registered with Google',
      req,
      notify: true,
      notifyTitle: 'New user registered',
    });
    await logSecurityEvent({
      type: 'login_success',
      severity: 'success',
      user: newUser,
      message: 'Successful Google login',
      req,
    });
    return sendAuthResponse(res, newUser);
  } catch (error) {
    next(error);
  }
};

export const signout = (req, res) => {
  res.clearCookie('access_token').status(200).json('Signout success!');
};
