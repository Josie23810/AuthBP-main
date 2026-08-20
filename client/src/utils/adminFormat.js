export function timeAgo(value) {
  if (!value) return 'Never';
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(value).toLocaleDateString();
}

export function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

export function authMethodLabel(provider) {
  if (provider === 'google') return 'Google';
  if (provider === 'credentials') return 'Password';
  return provider || 'JWT / Other';
}

export function changeLabel(value) {
  const n = Number(value || 0);
  const prefix = n > 0 ? '+' : '';
  return `${prefix}${n}%`;
}

export function eventCopy(type) {
  const map = {
    login_success: 'Successful login',
    login_failed: 'Failed login attempt',
    admin_login: 'Administrator login',
    registration: 'New account registered',
    session_created: 'New session',
    session_revoked: 'Session revoked',
    password_change: 'Password change',
    account_disabled: 'Account disabled',
    account_enabled: 'Account enabled',
    role_change: 'Role changed',
    lockout: 'Account lockout',
    suspicious: 'Suspicious authentication activity',
  };
  return map[type] || type;
}
