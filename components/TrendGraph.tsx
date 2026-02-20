type TrendGraphProps = {
  points: number[];
  hideNumbers: boolean;
};

export default function TrendGraph({ points, hideNumbers }: TrendGraphProps) {
  const safePoints = points.length > 0 ? points : [0];
  const max = Math.max(...safePoints, 1);
  const width = 320;
  const height = 140;
  const pad = 14;
  const xStep = (width - pad * 2) / Math.max(1, safePoints.length - 1);

  const chartPoints = safePoints.map((value, idx) => {
    const x = pad + idx * xStep;
    const y = height - pad - (value / max) * (height - pad * 2);
    return { x, y, value };
  });

  const polyline = chartPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="trend-card">
      <div className="trend-head">
        <h3>Debt Trend (Next Paycheck B Cycles)</h3>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="trend-svg" role="img">
        <polyline className="trend-line" fill="none" points={polyline} />
        {chartPoints.map((point, index) => (
          <circle key={index} cx={point.x} cy={point.y} r="3.5" className="trend-dot" />
        ))}
      </svg>
      <div className="trend-labels">
        {chartPoints.map((point, index) => (
          <span key={index}>
            {hideNumbers ? "$••••" : `$${Math.round(point.value).toLocaleString("en-US")}`}
          </span>
        ))}
      </div>
    </div>
  );
}

