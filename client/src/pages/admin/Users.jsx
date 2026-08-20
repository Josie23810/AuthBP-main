import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GlassCard from '../../components/admin/GlassCard';
import StatCard from '../../components/admin/StatCard';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { apiFetch } from '../../utils/api';
import { authMethodLabel, formatDateTime, timeAgo } from '../../utils/adminFormat';
import Avatar from '../../components/Avatar';

export default function Users() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialSearch = new URLSearchParams(location.search).get('search') || '';
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({});
  const [search, setSearch] = useState(initialSearch);
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(null);

  const loadUsers = async () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (role) params.set('role', role);
    if (status) params.set('status', status);
    const data = await apiFetch(`/api/admin/users?${params.toString()}`);
    if (data.success === false) {
      setError(data.message);
      return;
    }
    setUsers(data.users || []);
    setSummary(data.summary || {});
    setError('');
  };

  useEffect(() => {
    loadUsers().catch((err) => setError(err.message));
  }, []);

  const runAction = async () => {
    if (!confirm) return;
    const { id, kind, payload } = confirm;
    let data;
    if (kind === 'delete') {
      data = await apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    } else {
      data = await apiFetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    }
    if (data.success === false) {
      setError(data.message);
    } else {
      await loadUsers();
    }
    setConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black">Users</h2>
        <p className="mt-1 text-slate-400">Search, filter, and manage every AuraKey identity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={summary.totalUsers} />
        <StatCard label="Active users" value={summary.activeUsers} />
        <StatCard label="Disabled users" value={summary.disabledUsers} accent="red" />
        <StatCard label="Administrators" value={summary.adminCount} accent="gold" />
      </div>

      <GlassCard>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadUsers();
          }}
          className="flex flex-col gap-3 lg:flex-row"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, or role"
            className="flex-1 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm outline-none focus:border-neon-blue"
          />
          <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm">
            <option value="">All roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm">
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
          <button type="submit" className="rounded-2xl bg-neon-blue px-5 py-3 text-sm font-bold text-slate-950">
            Filter
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-neon-red">{error}</p>}

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-[980px] w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="pb-3">User</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Auth</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Registered</th>
                <th className="pb-3">Last login</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t border-white/5">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={user.profilePicture} name={user.username} className="h-9 w-9 text-sm" />
                      <span className="font-medium">{user.username}</span>
                    </div>
                  </td>
                  <td className="py-3 text-slate-400">{user.email}</td>
                  <td className="py-3"><StatusBadge value={user.role} /></td>
                  <td className="py-3">{authMethodLabel(user.authProvider)}</td>
                  <td className="py-3"><StatusBadge value={user.status || 'active'} /></td>
                  <td className="py-3 text-slate-400">{formatDateTime(user.createdAt)}</td>
                  <td className="py-3 text-slate-400">{timeAgo(user.lastLoginAt)}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <button type="button" className="text-neon-blue" onClick={() => navigate(`/admin/users/${user._id}`)}>View</button>
                      <button type="button" className="text-cyan-200" onClick={() => navigate(`/admin/users/${user._id}?edit=1`)}>Edit</button>
                      <button
                        type="button"
                        className="text-gold-accent"
                        onClick={() =>
                          setConfirm({
                            id: user._id,
                            kind: 'role',
                            payload: { role: user.role === 'admin' ? 'user' : 'admin' },
                            title: 'Change role',
                            message: `Change ${user.username} to ${user.role === 'admin' ? 'user' : 'admin'}?`,
                          })
                        }
                      >
                        Role
                      </button>
                      <button
                        type="button"
                        className="text-amber-300"
                        onClick={() =>
                          setConfirm({
                            id: user._id,
                            kind: 'status',
                            payload: { status: user.status === 'disabled' ? 'active' : 'disabled' },
                            title: user.status === 'disabled' ? 'Enable account' : 'Disable account',
                            message: `${user.status === 'disabled' ? 'Enable' : 'Disable'} ${user.username}?`,
                          })
                        }
                      >
                        {user.status === 'disabled' ? 'Enable' : 'Disable'}
                      </button>
                      {user.role !== 'admin' && (
                        <button
                          type="button"
                          className="text-neon-red"
                          onClick={() =>
                            setConfirm({
                              id: user._id,
                              kind: 'delete',
                              title: 'Delete account',
                              message: `Permanently delete ${user.username}? This cannot be undone.`,
                            })
                          }
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel="Continue"
        onCancel={() => setConfirm(null)}
        onConfirm={runAction}
      />
    </div>
  );
}
