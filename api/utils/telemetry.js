import SecurityEvent from '../models/securityEvent.model.js';
import Session from '../models/session.model.js';
import Notification from '../models/notification.model.js';
import Settings from '../models/settings.model.js';

export function parseUserAgent(ua = '') {
  let browser = 'Unknown';
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = 'Chrome';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';
  else if (/Safari\//i.test(ua)) browser = 'Safari';

  let os = 'Unknown';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad/i.test(ua)) os = 'iOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  let device = 'Desktop';
  if (/Mobi|Android|iPhone/i.test(ua)) device = 'Mobile';
  else if (/iPad|Tablet/i.test(ua)) device = 'Tablet';

  return { browser, os, device };
}

export function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return String(forwarded).split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

export async function getSettings() {
  const existing = await Settings.findOne({ key: 'global' });
  if (existing) return existing;
  return Settings.create({ key: 'global' });
}

export async function logSecurityEvent({
  type,
  severity = 'info',
  user,
  message,
  req,
  metadata = {},
  notify = false,
  notifyTitle,
}) {
  const event = await SecurityEvent.create({
    type,
    severity,
    userId: user?._id,
    username: user?.username || metadata.username || '',
    email: user?.email || metadata.email || '',
    message,
    ip: req ? clientIp(req) : metadata.ip || '',
    userAgent: req?.headers?.['user-agent'] || '',
    metadata,
  });

  if (notify) {
    await Notification.create({
      type,
      title: notifyTitle || message,
      message,
      severity: severity === 'success' ? 'success' : severity,
    });
  }

  return event;
}

export async function createSession({ user, req, portal = 'user' }) {
  const ua = req?.headers?.['user-agent'] || '';
  const parsed = parseUserAgent(ua);
  return Session.create({
    userId: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    device: parsed.device,
    browser: parsed.browser,
    os: parsed.os,
    ip: clientIp(req),
    userAgent: ua,
    status: 'active',
    portal,
    loginAt: new Date(),
    lastActiveAt: new Date(),
  });
}

export function resolveSessionStatus(session, settings) {
  if (session.status === 'revoked') return 'revoked';
  const loginAt = new Date(session.loginAt || session.createdAt).getTime();
  const lastActive = new Date(session.lastActiveAt || session.loginAt).getTime();
  const now = Date.now();
  const expireMs = (settings.sessionTimeoutMinutes || 60) * 60 * 1000;
  const idleMs = (settings.idleTimeoutMinutes || 15) * 60 * 1000;
  if (now - loginAt > expireMs) return 'expired';
  if (now - lastActive > idleMs) return 'idle';
  return 'active';
}

export function periodWindow(range = '7d') {
  const end = new Date();
  const start = new Date(end);
  if (range === 'today') {
    start.setHours(0, 0, 0, 0);
  } else if (range === '30d') {
    start.setDate(start.getDate() - 30);
  } else if (range === '90d') {
    start.setDate(start.getDate() - 90);
  } else {
    start.setDate(start.getDate() - 7);
  }
  const duration = end.getTime() - start.getTime();
  const prevEnd = new Date(start);
  const prevStart = new Date(start.getTime() - duration);
  return { start, end, prevStart, prevEnd };
}

export function percentChange(current, previous) {
  if (!previous) return current ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

export function bucketKey(date, range) {
  const d = new Date(date);
  if (range === 'today') {
    return `${String(d.getHours()).padStart(2, '0')}:00`;
  }
  return d.toISOString().slice(0, 10);
}

export function buildBuckets(range, start, end) {
  const labels = [];
  if (range === 'today') {
    for (let hour = 0; hour < 24; hour += 1) {
      labels.push(`${String(hour).padStart(2, '0')}:00`);
    }
    return labels;
  }
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const last = new Date(end);
  last.setHours(0, 0, 0, 0);
  while (cursor <= last) {
    labels.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }
  return labels;
}
