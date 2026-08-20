import { useEffect, useState } from 'react';
import GlassCard from '../../components/admin/GlassCard';
import StatCard from '../../components/admin/StatCard';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import RangeTabs from '../../components/admin/RangeTabs';
import { apiFetch } from '../../utils/api';
import { formatDateTime, timeAgo } from '../../utils/adminFormat';

export default function Sessions() {
  const [range, setRange] = useState('30d');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [revokeId, setRevokeId] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    const params = new URLSearchParams({ range, status });
    if (search) params.set('search', search);
    const payload = await apiFetch(`/api/admin/sessions?${params.toString()}`);
    if (payload.success === false) {
      setError(payload.message);
      return;
    }
    setData(payload);
    setError('');
  };

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, [range, status]);

  const revoke = async () => {
    const payload = await apiFetch(`/api/admin/sessions/${revokeId}/revoke`, { method: 'POST' });
    if (payload.success === false) setError(payload.message);
    setRevokeId(null);
    setSelected(null);
    await load();
  };

  if (error) return <p className="text-neon-red">{error}</p>;
  if (!data) return <p className="text-slate-400">Loading sessions...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black">Sessions</h2>
        <p className="mt-1 text-slate-400">Inspect live authentication sessions and revoke suspicious access.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active" value={data.summary.active} />
        <StatCard label="Idle" value={data.summary.idle} accent="gold" />
        <StatCard label="Expired" value={data.summary.expired} />
        <StatCard label="Revoked" value={data.summary.revoked} accent="red" />
      </div>

      <GlassCard>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <RangeTabs value={range} onChange={setRange} />
          <div className="flex flex-wrap gap-2">
            {['all', 'active', 'idle', 'expired', 'revoked'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setStatus(item)}
                className={`rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.14em] ${
                  status === item ? 'bg-neon-blue/20 text-neon-blue' : 'border border-white/10 text-slate-400'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
          className="mt-4 flex gap-2"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by user, device, or browser"
            className="flex-1 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm outline-none focus:border-neon-blue"
          />
          <button type="submit" className="rounded-2xl bg-neon-blue px-4 py-2 text-sm font-bold text-slate-950">
            Search
          </button>
        </form>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-[980px] w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="pb-3">User</th>
                <th className="pb-3">Device</th>
                <th className="pb-3">Browser</th>
                <th className="pb-3">OS</th>
                <th className="pb-3">Login time</th>
                <th className="pb-3">Last active</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.sessions.map((session) => (
                <tr key={session._id} className="border-t border-white/5">
                  <td className="py-3">
                    <p className="font-medium">{session.username}</p>
                    <p className="text-xs text-slate-500">{session.email}</p>
                  </td>
                  <td className="py-3">{session.device}</td>
                  <td className="py-3">{session.browser}</td>
                  <td className="py-3">{session.os}</td>
                  <td className="py-3 text-slate-400">{formatDateTime(session.loginAt)}</td>
                  <td className="py-3 text-slate-400">{timeAgo(session.lastActiveAt)}</td>
                  <td className="py-3"><StatusBadge value={session.status} /></td>
                  <td className="py-3">
                    <div className="flex gap-3 text-xs">
                      <button type="button" className="text-neon-blue" onClick={() => setSelected(session)}>View</button>
                      {session.status !== 'revoked' && (
                        <button type="button" className="text-neon-red" onClick={() => setRevokeId(session._id)}>
                          Revoke
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

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4" onClick={() => setSelected(null)}>
          <div className="admin-glass w-full max-w-lg rounded-3xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-black">Session detail</h3>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <p>User: {selected.username}</p>
              <p>Portal: {selected.portal}</p>
              <p>IP: {selected.ip || '—'}</p>
              <p>Device: {selected.device} / {selected.browser} / {selected.os}</p>
              <p>User agent: {selected.userAgent || '—'}</p>
              <p>Status: {selected.status}</p>
            </div>
            <button type="button" onClick={() => setSelected(null)} className="mt-5 rounded-xl border border-white/10 px-4 py-2 text-sm">
              Close
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(revokeId)}
        title="Revoke session"
        message="This will mark the session as revoked in AuraKey's session inventory."
        confirmLabel="Revoke"
        onCancel={() => setRevokeId(null)}
        onConfirm={revoke}
      />
    </div>
  );
}
