export default function RangeTabs({ value, onChange, options }) {
  const items = options || [
    { id: 'today', label: 'Today' },
    { id: '7d', label: '7 days' },
    { id: '30d', label: '30 days' },
    { id: '90d', label: '90 days' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition ${
            value === item.id
              ? 'bg-neon-blue/20 text-neon-blue shadow-[0_0_18px_rgba(64,196,255,0.2)]'
              : 'border border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
