import { useEffect, useState } from 'react';
import GlassCard from '../../components/admin/GlassCard';
import StatCard from '../../components/admin/StatCard';
import DonutChart from '../../components/admin/DonutChart';
import RangeTabs from '../../components/admin/RangeTabs';
import { apiFetch } from '../../utils/api';

export default function Authentication() {
  const [range, setRange] = useState('30d');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch(`/api/admin/authentication-stats?range=${range}`)
      .then((payload) => {
        if (payload.success === false) {
          setError(payload.message);
          return;
        }
        setData(payload);
      })
      .catch((err) => setError(err.message));
  }, [range]);

  if (error) return <p className="text-neon-red">{error}</p>;
  if (!data) return <p className="text-slate-400">Loading authentication methods...</p>;

  const slices = data.methods.map((method, index) => ({
    label: method.label,
    value: method.count,
    percent: method.percent,
    color: ['#40C4FF', '#FF4D4D', '#FFD700'][index] || '#94a3b8',
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-black">Authentication</h2>
          <p className="mt-1 text-slate-400">Password, Google OAuth, and JWT session mix across AuraKey.</p>
        </div>
        <RangeTabs value={range} onChange={setRange} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total authenticated users" value={data.authenticatedUsers} />
        <StatCard label="Most-used method" value={data.mostUsed} accent="gold" />
        <StatCard label="Successful attempts" value={data.successful} />
        <StatCard label="Failed attempts" value={data.failed} accent="red" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <h3 className="text-lg font-black">Method distribution</h3>
          <div className="mt-6">
            <DonutChart slices={slices} />
          </div>
        </GlassCard>
        <GlassCard>
          <h3 className="text-lg font-black">Method cards</h3>
          <div className="mt-4 space-y-3">
            {data.methods.map((method) => (
              <div key={method.id} className="rounded-2xl border border-white/5 bg-slate-950/40 px-4 py-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{method.label}</p>
                  <p className="text-2xl font-black text-neon-blue">{method.percent}%</p>
                </div>
                <p className="mt-1 text-sm text-slate-400">{method.count} users</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
