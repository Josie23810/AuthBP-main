import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../components/admin/GlassCard';
import StatusBadge from '../../components/admin/StatusBadge';
import ProfilePhotoPicker from '../../components/ProfilePhotoPicker';
import { apiFetch } from '../../utils/api';
import { adminSignOut, adminUpdate } from '../../redux/admin/adminSlice';
import { formatDateTime } from '../../utils/adminFormat';

export default function Settings() {
  const { currentAdmin } = useSelector((state) => state.admin);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [profile, setProfile] = useState({
    username: currentAdmin?.username || '',
    email: currentAdmin?.email || '',
    profilePicture: currentAdmin?.profilePicture || '',
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/api/admin/settings')
      .then((payload) => {
        if (payload.success === false) setError(payload.message);
        else setSettings(payload);
      })
      .catch((err) => setError(err.message));
  }, []);

  const saveSettings = async (updates) => {
    const payload = await apiFetch('/api/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    if (payload.success === false) {
      setError(payload.message);
      return;
    }
    setSettings(payload);
    setMessage('Settings saved');
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    const payload = await apiFetch('/api/admin/profile', {
      method: 'PATCH',
      body: JSON.stringify(profile),
    });
    if (payload.success === false) {
      setError(payload.message);
      return;
    }
    dispatch(adminUpdate(payload));
    setProfile({
      username: payload.username,
      email: payload.email,
      profilePicture: payload.profilePicture,
    });
    setMessage('Profile updated');
  };

  const changePassword = async (e) => {
    e.preventDefault();
    const payload = await apiFetch('/api/admin/change-password', {
      method: 'POST',
      body: JSON.stringify(passwords),
    });
    if (payload.success === false) {
      setError(payload.message);
      return;
    }
    setPasswords({ currentPassword: '', newPassword: '' });
    setMessage('Password updated');
  };

  const logout = async () => {
    await apiFetch('/api/admin/signout');
    dispatch(adminSignOut());
    navigate('/admin/sign-in');
  };

  if (!settings) return <p className="text-slate-400">Loading settings...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black">Settings</h2>
        <p className="mt-1 text-slate-400">Administrator profile, auth controls, and notification preferences.</p>
      </div>
      {message && <p className="text-sm text-emerald-300">{message}</p>}
      {error && <p className="text-sm text-neon-red">{error}</p>}

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard>
          <h3 className="text-lg font-black">Admin Profile</h3>
          <div className="mt-4">
            <ProfilePhotoPicker
              value={profile.profilePicture || currentAdmin?.profilePicture}
              name={profile.username || currentAdmin?.username}
              sizeClassName="h-16 w-16 text-lg"
              onChange={(profilePicture) => setProfile((prev) => ({ ...prev, profilePicture }))}
            />
            <div className="mt-4">
              <p className="font-semibold">{currentAdmin?.username}</p>
              <p className="text-sm text-slate-400">{currentAdmin?.email}</p>
              <div className="mt-2 flex gap-2">
                <StatusBadge value="Administrator" />
                <StatusBadge value={currentAdmin?.status || 'active'} />
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">Last login: {formatDateTime(currentAdmin?.lastLoginAt)}</p>
          <form onSubmit={saveProfile} className="mt-5 space-y-3">
            <input value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm" />
            <input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm" />
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="rounded-2xl bg-neon-blue px-4 py-2 text-sm font-bold text-slate-950">Save profile photo & details</button>
              <button type="button" onClick={logout} className="rounded-2xl border border-neon-red/40 px-4 py-2 text-sm text-neon-red">Logout</button>
            </div>
          </form>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-black">Security Settings</h3>
          <form onSubmit={changePassword} className="mt-4 space-y-3">
            <input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} placeholder="Current password" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm" />
            <input type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} placeholder="New password" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm" />
            <button type="submit" className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold">Change password</button>
          </form>
          <div className="mt-6 space-y-3 text-sm">
            <label className="flex items-center justify-between">
              Session timeout (minutes)
              <input type="number" value={settings.sessionTimeoutMinutes} onChange={(e) => saveSettings({ sessionTimeoutMinutes: Number(e.target.value) })} className="w-24 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2" />
            </label>
            <label className="flex items-center justify-between">
              Max login attempts
              <input type="number" value={settings.maxLoginAttempts} onChange={(e) => saveSettings({ maxLoginAttempts: Number(e.target.value) })} className="w-24 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2" />
            </label>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-black">Authentication Settings</h3>
          <div className="mt-4 space-y-3 text-sm">
            {[
              ['passwordAuthEnabled', 'Password authentication'],
              ['googleAuthEnabled', 'Google OAuth'],
              ['jwtSessionEnabled', 'JWT session management'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-950/40 px-4 py-3">
                {label}
                <input type="checkbox" checked={Boolean(settings[key])} onChange={(e) => saveSettings({ [key]: e.target.checked })} />
              </label>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-black">Notification Settings</h3>
          <div className="mt-4 space-y-3 text-sm">
            {[
              ['notifySecurity', 'Security alerts'],
              ['notifyLogin', 'Login alerts'],
              ['notifySystem', 'System notifications'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-950/40 px-4 py-3">
                {label}
                <input type="checkbox" checked={Boolean(settings[key])} onChange={(e) => saveSettings({ [key]: e.target.checked })} />
              </label>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
