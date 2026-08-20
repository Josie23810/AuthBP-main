import { changeLabel } from '../../utils/adminFormat';

export default function StatCard({
  label,
  value,
  change,
  warning = false,
  accent = 'cyan',
}) {
  const glow =
    accent === 'red'
      ? 'shadow-[0_0_24px_rgba(255,77,77,0.12)]'
      : accent === 'gold'
        ? 'shadow-[0_0_24px_rgba(255,215,0,0.1)]'
        : 'shadow-[0_0_24px_rgba(64,196,255,0.12)]';

  return (
    <div className={`admin-glass rounded-3xl p-5 ${glow} ${warning ? 'border-neon-red/40' : ''}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-black tracking-tight text-white">{value ?? 0}</p>
      {change !== undefined && change !== null && (
        <p className={`mt-2 text-xs font-medium ${Number(change) >= 0 ? 'text-cyan-300' : 'text-rose-300'}`}>
          {changeLabel(change)} vs previous period
        </p>
      )}
      {warning && <p className="mt-2 text-xs font-semibold text-neon-red">Unusually high</p>}
    </div>
  );
}
