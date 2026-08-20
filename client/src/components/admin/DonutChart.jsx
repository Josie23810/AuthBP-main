export default function DonutChart({ slices = [] }) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0) || 1;
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <svg viewBox="0 0 140 140" className="h-36 w-36">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="16" />
        {slices.map((slice) => {
          const length = (slice.value / total) * circ;
          const dash = `${length} ${circ - length}`;
          const current = offset;
          offset += length;
          return (
            <circle
              key={slice.label}
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth="16"
              strokeDasharray={dash}
              strokeDashoffset={-current}
              transform="rotate(-90 70 70)"
            />
          );
        })}
      </svg>
      <div className="space-y-2 text-sm">
        {slices.map((slice) => (
          <p key={slice.label} className="flex items-center justify-between gap-6 text-slate-300">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: slice.color }} />
              {slice.label}
            </span>
            <span className="font-semibold text-white">{slice.percent ?? 0}%</span>
          </p>
        ))}
      </div>
    </div>
  );
}
