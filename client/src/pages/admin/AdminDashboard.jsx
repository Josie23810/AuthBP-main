import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import GlassCard from '../../components/admin/GlassCard';
import StatCard from '../../components/admin/StatCard';
import AreaChart from '../../components/admin/AreaChart';
import RangeTabs from '../../components/admin/RangeTabs';
import StatusBadge from '../../components/admin/StatusBadge';
import { apiFetch } from '../../utils/api';
import { authMethodLabel, eventCopy, timeAgo } from '../../utils/adminFormat';

export default function AdminDashboard() {
  const { currentAdmin } = useSelector((state) => state.admin);
  const navigate = useNavigate();
  const [range, setRange] = useState('7d');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    apiFetch(`/api/admin/dashboard-stats?range=${range}`)
      .then((payload) => {
        if (payload.success === false) {
          setError(payload.message);
          return;
        }
        setData(payload);
        setError(null);
      })
      .catch((err) => setError(err.message));
  }, [range]);

  const filteredUsers = useMemo(() => {
    const users = data?.recentUsers || [];
    return users.filter((user) => {
      const haystack = `${user.username} ${user.email} ${user.role}`.toLowerCase();
      const matchesQuery = haystack.includes(query.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [data, query, roleFilter]);

  if (error) return <p className="text-red-400">{error}</p>;
  if (!data) return <p className="text-slate-400">Loading command center...</p>;

  const { stats, activity, recentEvents } = data;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black">Welcome back, {currentAdmin?.username || 'Admin'}</h2>
        <p className="mt-1 text-slate-400">Here's what's happening across AuraKey today.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Users" value={stats.totalUsers} change={stats.totalUsersChange} />
        <StatCard label="Active Users" value={stats.activeUsers} change={stats.activeUsersChange} />
        <StatCard label="Active Sessions" value={stats.activeSessions} accent="gold" />
        <StatCard label="Successful Logins" value={stats.successfulLogins} change={stats.successfulLoginsChange} />
        <StatCard
          label="Failed Logins"
          value={stats.failedLogins}
          change={stats.failedLoginsChange}
          warning={stats.failedLoginsHigh}
          accent="red"
        />
        <StatCard label="New Registrations" value={stats.newRegistrations} change={stats.newRegistrationsChange} />
      </div>

      <GlassCard>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-black">Authentication Activity</h3>
            <p className="text-sm text-slate-400">Successful logins, failed attempts, and new registrations.</p>
          </div>
          <RangeTabs value={range} onChange={setRange} />
        </div>
        <div className="mt-6">
          <AreaChart
            labels={activity.labels}
            series={[
              {
                name: 'Successful logins',
                data: activity.successful,
                stroke: '#40C4FF',
                fill: 'rgba(64,196,255,0.16)',
              },
              {
                name: 'Failed logins',
                data: activity.failed,
                stroke: '#FF4D4D',
                fill: 'rgba(255,77,77,0.12)',
              },
              {
                name: 'New registrations',
                data: activity.registrations,
                stroke: '#FFD700',
                fill: 'rgba(255,215,0,0.08)',
              },
            ]}
          />
        </div>
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <GlassCard>
          <h3 className="text-lg font-black">Recent Security Activity</h3>
          <div className="mt-4 space-y-3">
            {recentEvents.length === 0 && <p className="text-sm text-slate-400">No security events yet.</p>}
            {recentEvents.map((event) => (
              <div key={event._id} className="flex items-start justify-between gap-3 rounded-2xl border border-white/5 bg-slate-950/40 px-4 py-3">
                <div>
                  <StatusBadge value={event.severity === 'success' ? 'SUCCESS' : event.severity === 'critical' ? 'CRITICAL' : 'WARNING'} />
                  <p className="mt-2 font-semibold">{event.username || event.email || 'Unknown user'}</p>
                  <p className="text-sm text-slate-400">{event.message || eventCopy(event.type)}</p>
                </div>
                <p className="shrink-0 text-xs text-slate-500">{timeAgo(event.createdAt)}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-lg font-black">Recent Users</h3>
              <p className="text-sm text-slate-400">Latest identities across AuraKey.</p>
            </div>
            <div className="flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm outline-none focus:border-neon-blue"
              />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm"
              >
                <option value="all">All roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-[720px] w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                <tr>
                  <th className="pb-3">User</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Auth</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Last Login</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="border-t border-white/5">
                    <td className="py-3 font-medium">{user.username}</td>
                    <td className="py-3 text-slate-400">{user.email}</td>
                    <td className="py-3">{authMethodLabel(user.authProvider)}</td>
                    <td className="py-3"><StatusBadge value={user.role} /></td>
                    <td className="py-3"><StatusBadge value={user.status || 'active'} /></td>
                    <td className="py-3 text-slate-400">{timeAgo(user.lastLoginAt)}</td>
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/users/${user._id}`)}
                        className="text-neon-blue hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && <p className="py-6 text-center text-sm text-slate-400">No matching users.</p>}
          </div>
          <Link to="/admin/users" className="mt-4 inline-block text-sm text-neon-blue hover:underline">
            Open user management
          </Link>
        </GlassCard>
      </div>
    </div>
  );
}
