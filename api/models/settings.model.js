import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: 'global' },
    sessionTimeoutMinutes: { type: Number, default: 60 },
    idleTimeoutMinutes: { type: Number, default: 15 },
    maxLoginAttempts: { type: Number, default: 5 },
    passwordAuthEnabled: { type: Boolean, default: true },
    googleAuthEnabled: { type: Boolean, default: true },
    jwtSessionEnabled: { type: Boolean, default: true },
    notifySecurity: { type: Boolean, default: true },
    notifyLogin: { type: Boolean, default: true },
    notifySystem: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Settings = mongoose.model('AppSettings', settingsSchema);

export default Settings;
