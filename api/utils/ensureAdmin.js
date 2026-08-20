import User from '../models/user.model.js';
import { hash } from 'bcryptjs';
import { getSettings } from './telemetry.js';

function clean(value, fallback) {
  const next = typeof value === 'string' ? value.trim().replace(/^['"]|['"]$/g, '') : '';
  return next || fallback;
}

export function getAdminCredentials() {
  return {
    username: clean(process.env.ADMIN_USERNAME, 'aurakey-admin'),
    email: clean(process.env.ADMIN_EMAIL, 'admin@aurakey.local').toLowerCase(),
    password: clean(process.env.ADMIN_PASSWORD, 'AuraKeyAdmin1'),
    accessCode: clean(process.env.ADMIN_ACCESS_CODE, 'AURA-7749'),
  };
}

export async function ensureAdminUser() {
  const { username, email, password } = getAdminCredentials();
  const hashedPassword = await hash(password, 10);

  const existing = await User.findOne({
    $or: [{ email }, { username }, { role: 'admin' }],
  });

  if (existing) {
    existing.username = username;
    existing.email = email;
    existing.password = hashedPassword;
    existing.role = 'admin';
    existing.authProvider = 'credentials';
    existing.status = 'active';
    await existing.save();
    await getSettings();
    console.log(`✅ Admin account ready (${username})`);
    return existing;
  }

  const admin = await User.create({
    username,
    email,
    password: hashedPassword,
    role: 'admin',
    authProvider: 'credentials',
    status: 'active',
  });
  await getSettings();

  console.log(`✅ Admin account created (${username})`);
  return admin;
}
