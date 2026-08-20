const styles = {
  active: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/20',
  disabled: 'bg-rose-400/15 text-rose-300 border-rose-400/20',
  idle: 'bg-amber-400/15 text-amber-200 border-amber-400/20',
  expired: 'bg-slate-400/15 text-slate-300 border-white/10',
  revoked: 'bg-rose-400/15 text-rose-300 border-rose-400/20',
  success: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/20',
  warning: 'bg-amber-400/15 text-amber-200 border-amber-400/20',
  critical: 'bg-neon-red/15 text-neon-red border-neon-red/30',
  info: 'bg-cyan-400/15 text-cyan-200 border-cyan-400/20',
  admin: 'bg-gold-accent/15 text-gold-accent border-gold-accent/20',
  user: 'bg-cyan-400/10 text-cyan-200 border-cyan-400/20',
};

export default function StatusBadge({ value }) {
  const key = String(value || 'info').toLowerCase();
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${styles[key] || styles.info}`}>
      {value || 'unknown'}
    </span>
  );
}
