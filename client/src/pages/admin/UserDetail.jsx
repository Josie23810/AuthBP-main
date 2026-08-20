import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import GlassCard from '../../components/admin/GlassCard';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import ProfilePhotoPicker from '../../components/ProfilePhotoPicker';
import Avatar from '../../components/Avatar';
import { apiFetch } from '../../utils/api';
import { authMethodLabel, eventCopy, formatDateTime } from '../../utils/adminFormat';
import { adminUpdate } from '../../redux/admin/adminSlice';

export default function UserDetail() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentAdmin } = useSelector((state) => state.admin);
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(params.get('edit') === '1');
  const [form, setForm] = useState({ username: '', email: '' });
  const [confirm, setConfirm] = useState(null);

  const load = async () => {
    const data = await apiFetch(`/api/admin/users/${id}`);
    if (data.success === false) {
      setError(data.message);
      return;
    }
    setPayload(data);
    setForm({
      username: data.user.username,
      email: data.user.email,
      profilePicture: data.user.profilePicture || '',
    });
  };

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, [id]);

  const save = async (e) => {
    e.preventDefault();
    const data = await apiFetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(form),
    });
    if (data.success === false) {
      setError(data.message);
      return;
    }
    if (currentAdmin && data._id === currentAdmin._id) {
      dispatch(adminUpdate(data));
    }
    setEditing(false);
    await load();
  };

  const runConfirm = async () => {
    if (confirm?.kind === 'delete') {
      const data = await apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (data.success === false) setError(data.message);
      else navigate('/admin/users');
    } else {
      const data = await apiFetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(confirm.payload),
      });
      if (data.success === false) setError(data.message);
      else await load();
    }
    setConfirm(null);
  };

  if (error) return <p className="text-neon-red">{error}</p>;
  if (!payload) return <p className="text-slate-400">Loading user...</p>;
  const { user, events = [], sessions = [] } = payload;

  return (
    <div className="space-y-6">
      <Link to="/admin/users" className="text-sm text-neon-blue hover:underline">Back to users</Link>
      <GlassCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar src={form.profilePicture || user.profilePicture} name={user.username} className="h-16 w-16 text-xl" />
            <div>
              <h2 className="text-2xl font-black">{user.username}</h2>
              <p className="text-sm text-slate-400">{user.email}</p>
              <div className="mt-2 flex gap-2">
                <StatusBadge value={user.role} />
                <StatusBadge value={user.status || 'active'} />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setEditing((open) => !open)} className="rounded-xl border border-white/10 px-4 py-2 text-sm">Edit</button>
            <button
              type="button"
              onClick={() => setConfirm({ kind: 'role', payload: { role: user.role === 'admin' ? 'user' : 'admin' }, title: 'Change role', message: `Switch ${user.username} to ${user.role === 'admin' ? 'user' : 'admin'}?` })}
              className="rounded-xl border border-gold-accent/30 px-4 py-2 text-sm text-gold-accent"
            >
              Change role
            </button>
            <button
              type="button"
              onClick={() => setConfirm({ kind: 'status', payload: { status: user.status === 'disabled' ? 'active' : 'disabled' }, title: user.status === 'disabled' ? 'Enable account' : 'Disable account', message: `${user.status === 'disabled' ? 'Enable' : 'Disable'} ${user.username}?` })}
              className="rounded-xl border border-amber-300/30 px-4 py-2 text-sm text-amber-200"
            >
              {user.status === 'disabled' ? 'Enable' : 'Disable'}
            </button>
            {user.role !== 'admin' && (
              <button
                type="button"
                onClick={() => setConfirm({ kind: 'delete', title: 'Delete account', message: `Delete ${user.username}? This cannot be undone.` })}
                className="rounded-xl border border-neon-red/40 px-4 py-2 text-sm text-neon-red"
              >
                Delete
              </button>
            )}
          </div>
        </div>

        {editing && (
          <form onSubmit={save} className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <ProfilePhotoPicker
                value={form.profilePicture || user.profilePicture}
                name={form.username || user.username}
                onChange={(profilePicture) => setForm((prev) => ({ ...prev, profilePicture }))}
              />
            </div>
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm" />
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm" />
            <button type="submit" className="rounded-2xl bg-neon-blue px-4 py-3 text-sm font-bold text-slate-950 sm:col-span-2">Save profile</button>
          </form>
        )}

        <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <p><span className="text-slate-400">Auth method:</span> {authMethodLabel(user.authProvider)}</p>
          <p><span className="text-slate-400">Registered:</span> {formatDateTime(user.createdAt)}</p>
          <p><span className="text-slate-400">Last login:</span> {formatDateTime(user.lastLoginAt)}</p>
          <p><span className="text-slate-400">User ID:</span> {user._id}</p>
        </div>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <h3 className="font-black">Recent events</h3>
          <div className="mt-4 space-y-3 text-sm">
            {events.length === 0 && <p className="text-slate-400">No events.</p>}
            {events.map((event) => (
              <div key={event._id} className="rounded-2xl border border-white/5 bg-slate-950/40 px-4 py-3">
                <p className="font-medium">{eventCopy(event.type)}</p>
                <p className="text-xs text-slate-500">{formatDateTime(event.createdAt)}</p>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard>
          <h3 className="font-black">Sessions</h3>
          <div className="mt-4 space-y-3 text-sm">
            {sessions.length === 0 && <p className="text-slate-400">No sessions.</p>}
            {sessions.map((session) => (
              <div key={session._id} className="rounded-2xl border border-white/5 bg-slate-950/40 px-4 py-3">
                <p className="font-medium">{session.browser} on {session.os}</p>
                <p className="text-xs text-slate-500">{formatDateTime(session.loginAt)} · {session.status}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.title}
        message={confirm?.message}
        onCancel={() => setConfirm(null)}
        onConfirm={runConfirm}
      />
    </div>
  );
}
