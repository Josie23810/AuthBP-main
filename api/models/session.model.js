import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    email: { type: String, default: '' },
    role: { type: String, default: 'user' },
    device: { type: String, default: 'Desktop' },
    browser: { type: String, default: 'Unknown' },
    os: { type: String, default: 'Unknown' },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    status: {
      type: String,
      enum: ['active', 'idle', 'expired', 'revoked'],
      default: 'active',
    },
    loginAt: { type: Date, default: Date.now },
    lastActiveAt: { type: Date, default: Date.now },
    revokedAt: { type: Date },
    portal: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  { timestamps: true }
);

sessionSchema.index({ userId: 1, status: 1 });
sessionSchema.index({ createdAt: -1 });

const Session = mongoose.model('Session', sessionSchema);

export default Session;
