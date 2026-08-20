import mongoose from 'mongoose';

const securityEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        'login_success',
        'login_failed',
        'admin_login',
        'registration',
        'session_created',
        'session_revoked',
        'password_change',
        'account_disabled',
        'account_enabled',
        'role_change',
        'lockout',
        'suspicious',
      ],
    },
    severity: {
      type: String,
      enum: ['success', 'warning', 'critical', 'info'],
      default: 'info',
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: { type: String, default: '' },
    email: { type: String, default: '' },
    message: { type: String, required: true },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

securityEventSchema.index({ createdAt: -1 });
securityEventSchema.index({ type: 1, createdAt: -1 });

const SecurityEvent = mongoose.model('SecurityEvent', securityEventSchema);

export default SecurityEvent;
