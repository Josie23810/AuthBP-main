import User from '../models/user.model.js';
import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { errorHandler } from '../utils/error.js';
import { getAdminCredentials } from '../utils/ensureAdmin.js';
import { createSession, logSecurityEvent } from '../utils/telemetry.js';
import { dashboardStats } from './admin.data.controller.js';

function sendAdminResponse(res, user) {
  const token = jwt.sign(
    { id: user._id, role: 'admin' },
    process.env.JWT_SECRET
  );
  const { password, ...rest } = user._doc;
  const expiryDate = new Date(Date.now() + 8 * 3600000);

  return res
    .cookie('admin_access_token', token, {
      httpOnly: true,
      expires: expiryDate,
      sameSite: 'lax',
      path: '/',
    })
    .status(200)
    .json(rest);
}

async function passwordMatches(plain, hashed, envPassword) {
  if (plain === envPassword) return true;
  try {
    return await compare(plain, String(hashed || ''));
  } catch {
    return false;
  }
}

export const adminSignin = async (req, res, next) => {
  const username = String(req.body?.username || '').trim();
  const password = String(req.body?.password || '').trim();
  const accessCode = String(req.body?.accessCode || '').trim();
  const adminCreds = getAdminCredentials();

  if (!username || !password || !accessCode) {
    return next(
      errorHandler(400, 'Admin ID, password, and access code are required')
    );
  }

  if (accessCode !== adminCreds.accessCode) {
    return next(errorHandler(401, 'Invalid admin access code'));
  }

  try {
    const admin = await User.findOne({
      username,
      role: 'admin',
    });

    if (!admin) {
      return next(errorHandler(404, 'Admin account not found'));
    }

    const validPassword = await passwordMatches(
      password,
      admin.password,
      adminCreds.password
    );
    if (!validPassword) {
      await logSecurityEvent({
        type: 'login_failed',
        severity: 'critical',
        user: admin,
        message: 'Failed administrator login',
        req,
        notify: true,
        notifyTitle: 'Failed admin login',
      });
      return next(errorHandler(401, 'Wrong admin credentials'));
    }

    admin.lastLoginAt = new Date();
    admin.failedLoginCount = 0;
    await admin.save();
    await createSession({ user: admin, req, portal: 'admin' });
    await logSecurityEvent({
      type: 'admin_login',
      severity: 'success',
      user: admin,
      message: 'Administrator signed in',
      req,
    });
    return sendAdminResponse(res, admin);
  } catch (error) {
    next(error);
  }
};

export const adminSignout = (req, res) => {
  res.clearCookie('admin_access_token').status(200).json({
    success: true,
    message: 'Admin signed out',
  });
};

export const adminOverview = dashboardStats;
