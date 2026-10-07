const cord = (() => {
  const [x0, y0, cx, cy, x1, y1] = [60, 122, 18, 186, 70, 236];
  const points: string[] = [];
  for (let index = 0; index <= 160; index++) {
    const t = index / 160;
    const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t ** 2 * x1;
    const y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t ** 2 * y1;
    const tx = 2 * (1 - t) * (cx - x0) + 2 * t * (x1 - cx);
    const ty = 2 * (1 - t) * (cy - y0) + 2 * t * (y1 - cy);
    const length = Math.hypot(tx, ty);
    const wave = Math.sin(t * Math.PI * 2 * 14) * 5;
    points.push(`${(x - ty / length * wave).toFixed(1)} ${(y + tx / length * wave).toFixed(1)}`);
  }
  return `M${points.join(" L")}`;
})();

const holes = Array.from({ length: 10 }, (_, index) => {
  const angle = (80 + index * 30) * Math.PI / 180;
  return { x: 160 + Math.cos(angle) * 31, y: 190 + Math.sin(angle) * 31 };
});

export function ContactPhone() {
  return (
    <svg className="contact-phone-art" viewBox="0 0 320 320" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="contact-phone-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3c7eff" />
          <stop offset=".55" stopColor="#2a41f1" />
          <stop offset="1" stopColor="#1b2bb5" />
        </linearGradient>
        <linearGradient id="contact-phone-handset" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#99bcff" />
          <stop offset=".45" stopColor="#3c7eff" />
          <stop offset="1" stopColor="#2a41f1" />
        </linearGradient>
        <radialGradient id="contact-phone-dial" cx=".38" cy=".32" r=".8">
          <stop offset="0" stopColor="#f2f3f4" />
          <stop offset=".6" stopColor="#a2e8f9" />
          <stop offset="1" stopColor="#99bcff" />
        </radialGradient>
      </defs>
      <g className="phone-rings" fill="none" stroke="#a2e8f9" strokeWidth="1.5">
        <circle cx="160" cy="160" r="96" />
        <circle cx="160" cy="160" r="96" />
        <circle cx="160" cy="160" r="96" />
      </g>
      <ellipse cx="160" cy="262" rx="104" ry="9" fill="#000" opacity=".35" />
      <path className="phone-cord" d={cord} fill="none" stroke="#a2e8f9" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" opacity=".85" />
      <g className="phone-body">
        <path d="M70 252 L250 252 Q264 252 260 238 L234 142 Q230 128 216 128 L104 128 Q90 128 86 142 L60 238 Q56 252 70 252 Z" fill="url(#contact-phone-body)" />
        <path d="M104 128 L216 128 Q230 128 234 142 L237 152 L83 152 L86 142 Q90 128 104 128 Z" fill="#a2e8f9" opacity=".22" />
        <rect x="80" y="250" width="22" height="8" rx="3" fill="#050926" />
        <rect x="218" y="250" width="22" height="8" rx="3" fill="#050926" />
        <rect x="100" y="114" width="16" height="18" rx="4" fill="#1b2bb5" />
        <rect x="204" y="114" width="16" height="18" rx="4" fill="#1b2bb5" />
        <g className="phone-dial">
          <circle cx="160" cy="190" r="45" fill="url(#contact-phone-dial)" />
          {holes.map((hole) => <circle key={`${hole.x}-${hole.y}`} cx={hole.x} cy={hole.y} r="6.6" fill="#050926" />)}
          <circle cx="160" cy="190" r="15" fill="#2a41f1" />
          <circle cx="160" cy="190" r="4" fill="#a2e8f9" />
        </g>
        <path d="M193 214 L203 224" stroke="#050926" strokeWidth="4" strokeLinecap="round" />
      </g>
      <g className="phone-handset">
        <path d="M54 112 Q56 82 90 82 L230 82 Q264 82 266 112 Q267 126 252 126 L234 126 Q222 126 220 113 Q218 104 207 104 L113 104 Q102 104 100 113 Q98 126 86 126 L68 126 Q53 126 54 112 Z" fill="url(#contact-phone-handset)" />
        <path d="M92 88 L228 88" stroke="#f2f3f4" strokeWidth="3" strokeLinecap="round" opacity=".55" />
      </g>
    </svg>
  );
}
