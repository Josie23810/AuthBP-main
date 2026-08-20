import { useEffect, useState } from 'react';
import GlassCard from '../../components/admin/GlassCard';
import StatCard from '../../components/admin/StatCard';
import StatusBadge from '../../components/admin/StatusBadge';
import RangeTabs from '../../components/admin/RangeTabs';
import { apiFetch } from '../../utils/api';
import { eventCopy, formatDateTime } from '../../utils/adminFormat';

const filters = [
  { id: 'all', label: 'All events' },
  { id: 'successful', label: 'Successful' },
  { id: 'failed', label: 'Failed' },
  { id: 'warning', label: 'Warning' },
  { id: 'critical', label: 'Critical' },
];

export default function Security() {
  const [range, setRange] = useState('30d');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    const params = new URLSearchParams({ range, status });
    if (search) params.set('search', search);
    const payload = await apiFetch(`/api/admin/security-events?${params.toString()}`);
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

  if (error) return <p className="text-neon-red">{error}</p>;
  if (!data) return <p className="text-slate-400">Loading security events...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black">Security</h2>
        <p className="mt-1 text-slate-400">Identity threat activity, lockouts, and authentication failures.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total security events" value={data.summary.total} />
        <StatCard label="Failed login attempts" value={data.summary.failed} accent="red" warning={data.summary.failed > 20} />
        <StatCard label="Successful logins" value={data.summary.successful} />
        <StatCard label="Account lockouts" value={data.summary.lockouts} accent="red" />
        <StatCard label="Suspicious activities" value={data.summary.suspicious} accent="gold" />
      </div>

      <GlassCard>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <RangeTabs value={range} onChange={setRange} />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              load();
            }}
            className="flex gap-2"
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by user or event"
              className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm outline-none focus:border-neon-blue"
            />
            <button type="submit" className="rounded-2xl bg-neon-blue px-4 py-2 text-sm font-bold text-slate-950">
              Search
            </button>
          </form>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setStatus(item.id)}
              className={`rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.14em] ${
                status === item.id ? 'bg-neon-blue/20 text-neon-blue' : 'border border-white/10 text-slate-400'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-[860px] w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="pb-3">User</th>
                <th className="pb-3">Event</th>
                <th className="pb-3">IP / Session</th>
                <th className="pb-3">Date / time</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.events.map((event) => (
                <tr key={event._id} className="border-t border-white/5">
                  <td className="py-3">
                    <p className="font-medium">{event.username || 'Unknown'}</p>
                    <p className="text-xs text-slate-500">{event.email}</p>
                  </td>
                  <td className="py-3">{event.message || eventCopy(event.type)}</td>
                  <td className="py-3 text-slate-400">{event.ip || '—'}</td>
                  <td className="py-3 text-slate-400">{formatDateTime(event.createdAt)}</td>
                  <td className="py-3"><StatusBadge value={event.severity} /></td>
                  <td className="py-3 text-slate-500">Logged</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.events.length === 0 && <p className="py-8 text-center text-sm text-slate-400">No events in this window.</p>}
        </div>
      </GlassCard>
    </div>
  );
}
