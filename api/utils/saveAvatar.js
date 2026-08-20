import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const avatarDir = path.join(__dirname, '../../uploads/avatars');

export function saveAvatarFromDataUrl(userId, dataUrl) {
  const match = String(dataUrl || '').match(/^data:image\/[a-zA-Z0-9+.-]+;base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid image data');
  }

  const buffer = Buffer.from(match[1], 'base64');
  if (!buffer.length) {
    throw new Error('Empty image data');
  }

  fs.mkdirSync(avatarDir, { recursive: true });
  const filename = `${String(userId)}.jpg`;
  fs.writeFileSync(path.join(avatarDir, filename), buffer);
  return `/uploads/avatars/${filename}?v=${Date.now()}`;
}

export function resolveProfilePicture(userId, value) {
  if (typeof value === 'string' && value.startsWith('data:image/')) {
    return saveAvatarFromDataUrl(userId, value);
  }
  return value;
}
