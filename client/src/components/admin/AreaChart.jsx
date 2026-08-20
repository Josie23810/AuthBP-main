export default function AreaChart({ labels = [], series = [], height = 220 }) {
  const width = 760;
  const padding = { top: 18, right: 16, bottom: 28, left: 36 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const max = Math.max(1, ...series.flatMap((item) => item.data));

  const pointX = (index, total) =>
    padding.left + (total <= 1 ? innerW / 2 : (index / (total - 1)) * innerW);
  const pointY = (value) => padding.top + innerH - (value / max) * innerH;

  const toPath = (data, close) => {
    if (!data.length) return '';
    const line = data
      .map((value, index) => `${index === 0 ? 'M' : 'L'} ${pointX(index, data.length)} ${pointY(value)}`)
      .join(' ');
    if (!close) return line;
    return `${line} L ${pointX(data.length - 1, data.length)} ${padding.top + innerH} L ${pointX(0, data.length)} ${padding.top + innerH} Z`;
  };

  const tickEvery = Math.max(1, Math.ceil(labels.length / 6));

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full min-w-[520px]">
        {[0.25, 0.5, 0.75, 1].map((frac) => (
          <line
            key={frac}
            x1={padding.left}
            x2={width - padding.right}
            y1={padding.top + innerH * (1 - frac)}
            y2={padding.top + innerH * (1 - frac)}
            stroke="rgba(148,163,184,0.18)"
          />
        ))}
        {series.map((item) => (
          <g key={item.name}>
            <path d={toPath(item.data, true)} fill={item.fill} />
            <path d={toPath(item.data, false)} fill="none" stroke={item.stroke} strokeWidth="2.5" />
          </g>
        ))}
        {labels.map((label, index) =>
          index % tickEvery === 0 ? (
            <text
              key={label + index}
              x={pointX(index, labels.length)}
              y={height - 8}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="10"
            >
              {label.length > 10 ? label.slice(5) : label}
            </text>
          ) : null
        )}
      </svg>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
        {series.map((item) => (
          <span key={item.name} className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: item.stroke }} />
            {item.name}
          </span>
        ))}
      </div>
    </div>
  );
}
