import { useEffect, useState } from 'react';
import GlassCard from '../../components/admin/GlassCard';
import StatCard from '../../components/admin/StatCard';
import AreaChart from '../../components/admin/AreaChart';
import DonutChart from '../../components/admin/DonutChart';
import RangeTabs from '../../components/admin/RangeTabs';
import { apiFetch } from '../../utils/api';

export default function Analytics() {
  const [range, setRange] = useState('7d');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch(`/api/admin/analytics?range=${range}`)
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
  if (!data) return <p className="text-slate-400">Loading analytics...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-black">Analytics</h2>
          <p className="mt-1 text-slate-400">Login, registration, session, and method trends from MongoDB.</p>
        </div>
        <RangeTabs
          value={range}
          onChange={setRange}
          options={[
            { id: 'today', label: 'Today' },
            { id: '7d', label: 'Last 7 days' },
            { id: '30d', label: 'Last 30 days' },
            { id: '90d', label: 'Last 90 days' },
          ]}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active users" value={data.activeUsers} />
        <StatCard label="Active sessions" value={data.sessionStatus.active} />
        <StatCard label="Idle sessions" value={data.sessionStatus.idle} accent="gold" />
        <StatCard label="Revoked sessions" value={data.sessionStatus.revoked} accent="red" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard>
          <h3 className="text-lg font-black">Login activity</h3>
          <AreaChart
            labels={data.labels}
            series={[{ name: 'Successful logins', data: data.loginActivity, stroke: '#40C4FF', fill: 'rgba(64,196,255,0.16)' }]}
          />
        </GlassCard>
        <GlassCard>
          <h3 className="text-lg font-black">Failed login activity</h3>
          <AreaChart
            labels={data.labels}
            series={[{ name: 'Failed logins', data: data.failedLogins, stroke: '#FF4D4D', fill: 'rgba(255,77,77,0.12)' }]}
          />
        </GlassCard>
        <GlassCard>
          <h3 className="text-lg font-black">New user registrations</h3>
          <AreaChart
            labels={data.labels}
            series={[{ name: 'Registrations', data: data.registrations, stroke: '#FFD700', fill: 'rgba(255,215,0,0.1)' }]}
          />
        </GlassCard>
        <GlassCard>
          <h3 className="text-lg font-black">Session activity</h3>
          <AreaChart
            labels={data.labels}
            series={[{ name: 'Sessions created', data: data.sessionActivity, stroke: '#67e8f9', fill: 'rgba(103,232,249,0.1)' }]}
          />
        </GlassCard>
      </div>

      <GlassCard>
        <h3 className="text-lg font-black">Authentication method distribution</h3>
        <div className="mt-6">
          <DonutChart
            slices={[
              { label: 'Password', value: data.methods.password, percent: 0, color: '#40C4FF' },
              { label: 'Google OAuth', value: data.methods.google, percent: 0, color: '#FF4D4D' },
              { label: 'Other', value: data.methods.other, percent: 0, color: '#FFD700' },
            ].map((slice) => {
              const total = data.methods.password + data.methods.google + data.methods.other || 1;
              return { ...slice, percent: Number(((slice.value / total) * 100).toFixed(1)) };
            })}
          />
        </div>
      </GlassCard>
    </div>
  );
}
