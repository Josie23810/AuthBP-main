import User from '../models/user.model.js';
import SecurityEvent from '../models/securityEvent.model.js';
import Session from '../models/session.model.js';
import Notification from '../models/notification.model.js';
import { errorHandler } from '../utils/error.js';
import { hash } from 'bcryptjs';
import { runtime } from '../runtime.js';
import {
  buildBuckets,
  bucketKey,
  getSettings,
  logSecurityEvent,
  percentChange,
  periodWindow,
  resolveSessionStatus,
} from '../utils/telemetry.js';

function publicUser(user) {
  const { password, ...rest } = user.toObject ? user.toObject() : user;
  return rest;
}

export const dashboardStats = async (req, res, next) => {
  try {
    const range = req.query.range || '7d';
    const { start, end, prevStart } = periodWindow(range);
    const settings = await getSettings();
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      prevTotalUsers,
      activeUsers,
      prevActiveUsers,
      newRegistrations,
      prevRegistrations,
      successfulLogins,
      prevSuccessfulLogins,
      failedLogins,
      prevFailedLogins,
      sessions,
      recentEvents,
      recentUsers,
      googleCount,
      passwordCount,
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $lte: end } }),
      User.countDocuments({ createdAt: { $lt: start } }),
      User.countDocuments({ lastLoginAt: { $gte: dayAgo }, status: 'active' }),
      User.countDocuments({
        lastLoginAt: { $gte: new Date(dayAgo.getTime() - 24 * 60 * 60 * 1000), $lt: dayAgo },
        status: 'active',
      }),
      User.countDocuments({ createdAt: { $gte: start, $lte: end } }),
      User.countDocuments({ createdAt: { $gte: prevStart, $lt: start } }),
      SecurityEvent.countDocuments({
        type: { $in: ['login_success', 'admin_login'] },
        createdAt: { $gte: start, $lte: end },
      }),
      SecurityEvent.countDocuments({
        type: { $in: ['login_success', 'admin_login'] },
        createdAt: { $gte: prevStart, $lt: start },
      }),
      SecurityEvent.countDocuments({
        type: 'login_failed',
        createdAt: { $gte: start, $lte: end },
      }),
      SecurityEvent.countDocuments({
        type: 'login_failed',
        createdAt: { $gte: prevStart, $lt: start },
      }),
      Session.find().sort({ loginAt: -1 }).limit(400),
      SecurityEvent.find().sort({ createdAt: -1 }).limit(10),
      User.find().sort({ createdAt: -1 }).limit(8).select('-password'),
      User.countDocuments({ authProvider: 'google' }),
      User.countDocuments({ authProvider: 'credentials' }),
    ]);

    const liveSessions = sessions
      .map((session) => {
        const doc = session.toObject();
        return { ...doc, status: resolveSessionStatus(doc, settings) };
      })
      .filter((session) => session.status === 'active');

    const labels = buildBuckets(range, start, end);
    const seriesMap = {
      successful: Object.fromEntries(labels.map((label) => [label, 0])),
      failed: Object.fromEntries(labels.map((label) => [label, 0])),
      registrations: Object.fromEntries(labels.map((label) => [label, 0])),
    };

    const activityEvents = await SecurityEvent.find({
      createdAt: { $gte: start, $lte: end },
      type: { $in: ['login_success', 'admin_login', 'login_failed', 'registration'] },
    }).select('type createdAt');

    activityEvents.forEach((event) => {
      const key = bucketKey(event.createdAt, range);
      if (event.type === 'login_failed' && seriesMap.failed[key] !== undefined) {
        seriesMap.failed[key] += 1;
      } else if (event.type === 'registration' && seriesMap.registrations[key] !== undefined) {
        seriesMap.registrations[key] += 1;
      } else if (seriesMap.successful[key] !== undefined) {
        seriesMap.successful[key] += 1;
      }
    });

    res.status(200).json({
      range,
      stats: {
        totalUsers,
        totalUsersChange: percentChange(totalUsers, prevTotalUsers),
        activeUsers,
        activeUsersChange: percentChange(activeUsers, prevActiveUsers),
        activeSessions: liveSessions.length,
        successfulLogins,
        successfulLoginsChange: percentChange(successfulLogins, prevSuccessfulLogins),
        failedLogins,
        failedLoginsChange: percentChange(failedLogins, prevFailedLogins),
        failedLoginsHigh: failedLogins > 20 || (successfulLogins > 0 && failedLogins / successfulLogins > 0.15),
        newRegistrations,
        newRegistrationsChange: percentChange(newRegistrations, prevRegistrations),
      },
      activity: {
        labels,
        successful: labels.map((label) => seriesMap.successful[label]),
        failed: labels.map((label) => seriesMap.failed[label]),
        registrations: labels.map((label) => seriesMap.registrations[label]),
      },
      recentEvents,
      recentUsers: recentUsers.map(publicUser),
      methods: {
        password: passwordCount,
        google: googleCount,
        other: Math.max(totalUsers - passwordCount - googleCount, 0),
      },
      system: {
        app: 'AuraKey',
        status: 'ok',
        database: runtime.dbMode,
        startedAt: runtime.startedAt,
        uptimeSeconds: Math.round(process.uptime()),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (req, res, next) => {
  try {
    const search = (req.query.search || '').trim();
    const role = (req.query.role || '').trim();
    const status = (req.query.status || '').trim();
    const filter = {};

    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
      ];
    }
    if (role && ['user', 'admin'].includes(role)) filter.role = role;
    if (status && ['active', 'disabled'].includes(status)) filter.status = status;

    const [users, totalUsers, activeUsers, disabledUsers, adminCount] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).select('-password'),
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'disabled' }),
      User.countDocuments({ role: 'admin' }),
    ]);

    res.status(200).json({
      users: users.map(publicUser),
      count: users.length,
      summary: { totalUsers, activeUsers, disabledUsers, adminCount },
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return next(errorHandler(404, 'User not found'));
    const [events, sessions] = await Promise.all([
      SecurityEvent.find({ userId: user._id }).sort({ createdAt: -1 }).limit(12),
      Session.find({ userId: user._id }).sort({ loginAt: -1 }).limit(8),
    ]);
    res.status(200).json({ user: publicUser(user), events, sessions });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(errorHandler(404, 'User not found'));

    const { role, status, username, email } = req.body;
    const actor = req.admin;

    if (role && ['user', 'admin'].includes(role) && role !== user.role) {
      if (user.role === 'admin' && role !== 'admin') {
        const adminCount = await User.countDocuments({ role: 'admin' });
        if (adminCount <= 1) {
          return next(errorHandler(403, 'The last administrator cannot be demoted'));
        }
      }
      await logSecurityEvent({
        type: 'role_change',
        severity: role === 'admin' ? 'warning' : 'info',
        user,
        message: `Role changed to ${role}`,
        req,
        notify: role === 'admin',
        notifyTitle: 'New administrator created',
        metadata: { actor: actor?.id },
      });
      user.role = role;
    }

    if (status && ['active', 'disabled'].includes(status) && status !== user.status) {
      user.status = status;
      if (status === 'disabled') {
        user.lockedUntil = null;
        await Session.updateMany(
          { userId: user._id, status: 'active' },
          { $set: { status: 'revoked', revokedAt: new Date() } }
        );
        await logSecurityEvent({
          type: 'account_disabled',
          severity: 'critical',
          user,
          message: 'Account disabled',
          req,
          notify: true,
          notifyTitle: 'Account disabled',
        });
      } else {
        await logSecurityEvent({
          type: 'account_enabled',
          severity: 'success',
          user,
          message: 'Account enabled',
          req,
        });
      }
    }

    if (username) user.username = username.trim();
    if (email) user.email = email.trim().toLowerCase();
    if (req.body.profilePicture) user.profilePicture = req.body.profilePicture;

    await user.save();
    res.status(200).json(publicUser(user));
  } catch (error) {
    if (error.code === 11000) {
      return next(errorHandler(409, 'Username or email already exists'));
    }
    next(error);
  }
};

export const adminDeleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(errorHandler(404, 'User not found'));
    if (user.role === 'admin') {
      return next(errorHandler(403, 'Admin accounts cannot be deleted from the directory'));
    }

    await Session.deleteMany({ userId: user._id });
    await user.deleteOne();
    await logSecurityEvent({
      type: 'account_disabled',
      severity: 'critical',
      message: `Account deleted (${user.username})`,
      req,
      metadata: { email: user.email, username: user.username },
      notify: true,
      notifyTitle: 'Account deleted',
    });
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

export const securityEvents = async (req, res, next) => {
  try {
    const { status, type, search, range = '30d' } = req.query;
    const { start, end } = periodWindow(range);
    const filter = { createdAt: { $gte: start, $lte: end } };

    if (status && status !== 'all') {
      const map = {
        successful: 'success',
        failed: 'warning',
        warning: 'warning',
        critical: 'critical',
      };
      if (status === 'failed') filter.type = 'login_failed';
      else if (status === 'successful') filter.severity = 'success';
      else if (map[status]) filter.severity = map[status];
    }
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    const [events, total, failed, successful, lockouts, suspicious] = await Promise.all([
      SecurityEvent.find(filter).sort({ createdAt: -1 }).limit(200),
      SecurityEvent.countDocuments({ createdAt: { $gte: start, $lte: end } }),
      SecurityEvent.countDocuments({ type: 'login_failed', createdAt: { $gte: start, $lte: end } }),
      SecurityEvent.countDocuments({
        type: { $in: ['login_success', 'admin_login'] },
        createdAt: { $gte: start, $lte: end },
      }),
      SecurityEvent.countDocuments({ type: 'lockout', createdAt: { $gte: start, $lte: end } }),
      SecurityEvent.countDocuments({
        type: { $in: ['suspicious', 'lockout'] },
        createdAt: { $gte: start, $lte: end },
      }),
    ]);

    res.status(200).json({
      events,
      summary: {
        total,
        failed,
        successful,
        lockouts,
        suspicious,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const listSessions = async (req, res, next) => {
  try {
    const { search, status, range = '30d' } = req.query;
    const { start, end } = periodWindow(range);
    const settings = await getSettings();
    const filter = { loginAt: { $gte: start, $lte: end } };
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { device: { $regex: search, $options: 'i' } },
        { browser: { $regex: search, $options: 'i' } },
        { os: { $regex: search, $options: 'i' } },
      ];
    }

    const sessions = await Session.find(filter).sort({ loginAt: -1 }).limit(250);
    const hydrated = sessions.map((session) => {
      const doc = session.toObject();
      return { ...doc, status: resolveSessionStatus(doc, settings) };
    }).filter((session) => !status || status === 'all' || session.status === status);

    const counts = hydrated.reduce(
      (acc, session) => {
        acc[session.status] = (acc[session.status] || 0) + 1;
        acc.total += 1;
        return acc;
      },
      { total: 0, active: 0, idle: 0, expired: 0, revoked: 0 }
    );

    res.status(200).json({ sessions: hydrated, summary: counts });
  } catch (error) {
    next(error);
  }
};

export const getSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return next(errorHandler(404, 'Session not found'));
    const settings = await getSettings();
    const doc = session.toObject();
    res.status(200).json({ ...doc, status: resolveSessionStatus(doc, settings) });
  } catch (error) {
    next(error);
  }
};

export const revokeSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return next(errorHandler(404, 'Session not found'));
    session.status = 'revoked';
    session.revokedAt = new Date();
    await session.save();
    await logSecurityEvent({
      type: 'session_revoked',
      severity: 'warning',
      message: `Session revoked for ${session.username}`,
      req,
      metadata: { sessionId: session._id, username: session.username },
      notify: true,
      notifyTitle: 'Session revoked',
    });
    res.status(200).json({ success: true, session });
  } catch (error) {
    next(error);
  }
};

export const authenticationStats = async (req, res, next) => {
  try {
    const range = req.query.range || '30d';
    const { start, end } = periodWindow(range);
    const [password, google, other, successful, failed, totalUsers] = await Promise.all([
      User.countDocuments({ authProvider: 'credentials' }),
      User.countDocuments({ authProvider: 'google' }),
      User.countDocuments({ authProvider: { $nin: ['credentials', 'google'] } }),
      SecurityEvent.countDocuments({
        type: { $in: ['login_success', 'admin_login'] },
        createdAt: { $gte: start, $lte: end },
      }),
      SecurityEvent.countDocuments({ type: 'login_failed', createdAt: { $gte: start, $lte: end } }),
      User.countDocuments(),
    ]);

    const methods = [
      { id: 'password', label: 'Password', count: password },
      { id: 'google', label: 'Google OAuth', count: google },
      { id: 'other', label: 'Other / JWT session', count: other },
    ];
    const mostUsed = [...methods].sort((a, b) => b.count - a.count)[0];

    res.status(200).json({
      totalUsers,
      authenticatedUsers: totalUsers,
      methods: methods.map((method) => ({
        ...method,
        percent: totalUsers ? Number(((method.count / totalUsers) * 100).toFixed(1)) : 0,
      })),
      mostUsed: mostUsed.label,
      successful,
      failed,
      jwtEnabled: true,
    });
  } catch (error) {
    next(error);
  }
};

export const analytics = async (req, res, next) => {
  try {
    const range = req.query.range || '7d';
    const { start, end } = periodWindow(range);
    const settings = await getSettings();
    const labels = buildBuckets(range, start, end);
    const empty = () => Object.fromEntries(labels.map((label) => [label, 0]));
    const login = empty();
    const failed = empty();
    const registrations = empty();
    const sessions = empty();

    const events = await SecurityEvent.find({
      createdAt: { $gte: start, $lte: end },
      type: { $in: ['login_success', 'admin_login', 'login_failed', 'registration', 'session_created'] },
    }).select('type createdAt');

    events.forEach((event) => {
      const key = bucketKey(event.createdAt, range);
      if (!(key in login)) return;
      if (event.type === 'login_failed') failed[key] += 1;
      else if (event.type === 'registration') registrations[key] += 1;
      else if (event.type === 'session_created') sessions[key] += 1;
      else login[key] += 1;
    });

    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [activeUsers, password, google, sessionDocs] = await Promise.all([
      User.countDocuments({ lastLoginAt: { $gte: dayAgo } }),
      User.countDocuments({ authProvider: 'credentials' }),
      User.countDocuments({ authProvider: 'google' }),
      Session.find({ loginAt: { $gte: start, $lte: end } }),
    ]);

    const sessionStatus = { active: 0, idle: 0, expired: 0, revoked: 0 };
    sessionDocs.forEach((session) => {
      const status = resolveSessionStatus(session.toObject(), settings);
      sessionStatus[status] = (sessionStatus[status] || 0) + 1;
    });

    res.status(200).json({
      range,
      labels,
      loginActivity: labels.map((label) => login[label]),
      failedLogins: labels.map((label) => failed[label]),
      registrations: labels.map((label) => registrations[label]),
      sessionActivity: labels.map((label) => sessions[label]),
      activeUsers,
      methods: {
        password,
        google,
        other: 0,
      },
      sessionStatus,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminSettings = async (req, res, next) => {
  try {
    const settings = await getSettings();
    res.status(200).json(settings);
  } catch (error) {
    next(error);
  }
};

export const updateAdminSettings = async (req, res, next) => {
  try {
    const settings = await getSettings();
    const allowed = [
      'sessionTimeoutMinutes',
      'idleTimeoutMinutes',
      'maxLoginAttempts',
      'passwordAuthEnabled',
      'googleAuthEnabled',
      'jwtSessionEnabled',
      'notifySecurity',
      'notifyLogin',
      'notifySystem',
    ];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) settings[key] = req.body[key];
    });
    await settings.save();
    res.status(200).json(settings);
  } catch (error) {
    next(error);
  }
};

export const listNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(30);
    const unread = await Notification.countDocuments({ read: false });
    res.status(200).json({ notifications, unread });
  } catch (error) {
    next(error);
  }
};

export const markNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ read: false }, { $set: { read: true } });
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const updateAdminProfile = async (req, res, next) => {
  try {
    const admin = await User.findById(req.admin.id);
    if (!admin) return next(errorHandler(404, 'Admin account not found'));
    if (req.body.username) admin.username = req.body.username.trim();
    if (req.body.email) admin.email = req.body.email.trim().toLowerCase();
    if (req.body.profilePicture) admin.profilePicture = req.body.profilePicture;
    await admin.save();
    res.status(200).json(publicUser(admin));
  } catch (error) {
    next(error);
  }
};

export const changeAdminPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return next(errorHandler(400, 'Current and new password are required'));
    }
    const admin = await User.findById(req.admin.id);
    if (!admin) return next(errorHandler(404, 'Admin account not found'));
    const { compare } = await import('bcryptjs');
    const matches = await compare(currentPassword, admin.password);
    const { getAdminCredentials } = await import('../utils/ensureAdmin.js');
    const envOk = currentPassword === getAdminCredentials().password;
    if (!matches && !envOk) {
      return next(errorHandler(401, 'Current password is incorrect'));
    }
    admin.password = await hash(newPassword, 10);
    await admin.save();
    await logSecurityEvent({
      type: 'password_change',
      severity: 'warning',
      user: admin,
      message: 'Administrator password changed',
      req,
      notify: true,
      notifyTitle: 'Admin password changed',
    });
    res.status(200).json({ success: true, message: 'Password updated' });
  } catch (error) {
    next(error);
  }
};

export { publicUser };
