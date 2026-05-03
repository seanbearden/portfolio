interface Props {
  className?: string;
}

export function AboutSynthesisIllustration({ className }: Props) {
  return (
    <svg
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Isometric synthesis of physics wave equations, financial growth charts, and neural network nodes."
    >
      <style>
        {`.line { fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
          .muted { stroke-opacity: 0.3; }
          .accent { stroke: currentColor; stroke-width: 2; }
          .text { fill: currentColor; font-family: 'Geist Variable', sans-serif; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }`}
      </style>

      <path className="line muted" d="M200 80 L360 160 L200 240 L40 160 Z" />
      <path className="line muted" d="M40 160 L40 180 L200 260 L360 180 L360 160" />
      <path className="line muted" d="M200 240 L200 260" />

      <g transform="translate(120, 165)">
        <path className="line accent" d="M-40 0 C-20 -20, -20 20, 0 0 C20 -20, 20 20, 40 0" transform="skewY(26.5)" />
        <path className="line muted" d="M-30 10 L10 30" />
        <path className="line muted" d="M-10 0 L30 20" />
      </g>

      <g transform="translate(280, 165)">
        <path className="line muted" d="M-30 15 L-30 35" transform="skewY(-26.5)" />
        <path className="line muted" d="M-10 5 L-10 25" transform="skewY(-26.5)" />
        <path className="line muted" d="M10 -5 L10 15" transform="skewY(-26.5)" />
        <path className="line muted" d="M30 -20 L30 0" transform="skewY(-26.5)" />
        <path className="line accent" d="M-35 20 L35 -25" transform="skewY(-26.5)" />
      </g>

      <g transform="translate(200, 100)">
        {[
          { cx: -30, cy: -20 },
          { cx: -30, cy: 20 },
          { cx: 0, cy: -30 },
          { cx: 0, cy: 0 },
          { cx: 0, cy: 30 },
          { cx: 30, cy: 0 },
        ].map(({ cx, cy }) => (
          <circle key={`${cx},${cy}`} className="line accent" cx={cx} cy={cy} r="3" />
        ))}
        <path className="line muted" d="M-27 -20 L-3 -30" />
        <path className="line muted" d="M-27 -20 L-3 0" />
        <path className="line muted" d="M-27 20 L-3 0" />
        <path className="line muted" d="M-27 20 L-3 30" />
        <path className="line muted" d="M3 -30 L27 0" />
        <path className="line muted" d="M3 0 L27 0" />
        <path className="line muted" d="M3 30 L27 0" />
      </g>

      <g transform="translate(60, 250)">
        <rect x="0" y="0" width="36" height="16" rx="2" className="line" />
        <text x="7" y="12" className="text">BIO</text>
      </g>

      <g transform="translate(304, 250)">
        <rect x="0" y="0" width="32" height="16" rx="2" className="line" />
        <text x="8" y="12" className="text">CV</text>
      </g>

      <path className="line muted" d="M96 258 L140 210" />
      <path className="line muted" d="M304 258 L260 210" />
    </svg>
  );
}
