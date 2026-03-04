const HeroIllustration = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 520 480"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Background building - tall */}
    <rect x="320" y="80" width="120" height="340" rx="8" fill="white" fillOpacity="0.08" />
    <rect x="340" y="110" width="24" height="28" rx="4" fill="white" fillOpacity="0.12" />
    <rect x="376" y="110" width="24" height="28" rx="4" fill="white" fillOpacity="0.12" />
    <rect x="340" y="155" width="24" height="28" rx="4" fill="white" fillOpacity="0.12" />
    <rect x="376" y="155" width="24" height="28" rx="4" fill="white" fillOpacity="0.12" />
    <rect x="340" y="200" width="24" height="28" rx="4" fill="white" fillOpacity="0.12" />
    <rect x="376" y="200" width="24" height="28" rx="4" fill="white" fillOpacity="0.12" />
    <rect x="340" y="245" width="24" height="28" rx="4" fill="white" fillOpacity="0.12" />
    <rect x="376" y="245" width="24" height="28" rx="4" fill="white" fillOpacity="0.12" />
    <rect x="340" y="290" width="24" height="28" rx="4" fill="white" fillOpacity="0.12" />
    <rect x="376" y="290" width="24" height="28" rx="4" fill="white" fillOpacity="0.15" />
    <rect x="355" y="355" width="30" height="65" rx="4" fill="white" fillOpacity="0.15" />

    {/* Background building - medium */}
    <rect x="200" y="160" width="110" height="260" rx="8" fill="white" fillOpacity="0.06" />
    <rect x="218" y="186" width="22" height="26" rx="3" fill="white" fillOpacity="0.1" />
    <rect x="252" y="186" width="22" height="26" rx="3" fill="white" fillOpacity="0.1" />
    <rect x="218" y="226" width="22" height="26" rx="3" fill="white" fillOpacity="0.1" />
    <rect x="252" y="226" width="22" height="26" rx="3" fill="white" fillOpacity="0.1" />
    <rect x="218" y="266" width="22" height="26" rx="3" fill="white" fillOpacity="0.1" />
    <rect x="252" y="266" width="22" height="26" rx="3" fill="white" fillOpacity="0.1" />
    <rect x="218" y="306" width="22" height="26" rx="3" fill="white" fillOpacity="0.1" />
    <rect x="252" y="306" width="22" height="26" rx="3" fill="white" fillOpacity="0.1" />
    <rect x="237" y="362" width="28" height="58" rx="3" fill="white" fillOpacity="0.12" />

    {/* Main house - front */}
    <rect x="60" y="200" width="160" height="220" rx="10" fill="white" fillOpacity="0.12" />
    {/* Roof */}
    <path
      d="M40 210 L140 130 L240 210"
      stroke="white"
      strokeOpacity="0.25"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="white"
      fillOpacity="0.06"
    />
    {/* Chimney */}
    <rect x="180" y="148" width="20" height="42" rx="3" fill="white" fillOpacity="0.1" />
    {/* Windows row 1 */}
    <rect x="85" y="230" width="34" height="38" rx="5" fill="white" fillOpacity="0.2" />
    <rect x="161" y="230" width="34" height="38" rx="5" fill="white" fillOpacity="0.2" />
    {/* Window cross bars */}
    <line x1="102" y1="230" x2="102" y2="268" stroke="white" strokeOpacity="0.15" strokeWidth="1.5" />
    <line x1="85" y1="249" x2="119" y2="249" stroke="white" strokeOpacity="0.15" strokeWidth="1.5" />
    <line x1="178" y1="230" x2="178" y2="268" stroke="white" strokeOpacity="0.15" strokeWidth="1.5" />
    <line x1="161" y1="249" x2="195" y2="249" stroke="white" strokeOpacity="0.15" strokeWidth="1.5" />
    {/* Windows row 2 */}
    <rect x="85" y="290" width="34" height="38" rx="5" fill="white" fillOpacity="0.15" />
    <rect x="161" y="290" width="34" height="38" rx="5" fill="white" fillOpacity="0.15" />
    {/* Door */}
    <rect x="120" y="355" width="40" height="65" rx="6" fill="white" fillOpacity="0.22" />
    <circle cx="152" cy="390" r="3" fill="white" fillOpacity="0.35" />

    {/* Tree left */}
    <rect x="20" y="360" width="8" height="60" rx="4" fill="white" fillOpacity="0.1" />
    <circle cx="24" cy="340" r="22" fill="white" fillOpacity="0.08" />
    <circle cx="15" cy="350" r="16" fill="white" fillOpacity="0.06" />
    <circle cx="36" cy="348" r="14" fill="white" fillOpacity="0.06" />

    {/* Tree right */}
    <rect x="460" y="340" width="8" height="80" rx="4" fill="white" fillOpacity="0.08" />
    <circle cx="464" cy="310" r="28" fill="white" fillOpacity="0.06" />
    <circle cx="450" cy="325" r="18" fill="white" fillOpacity="0.05" />
    <circle cx="478" cy="320" r="16" fill="white" fillOpacity="0.05" />

    {/* Ground line */}
    <line x1="0" y1="420" x2="520" y2="420" stroke="white" strokeOpacity="0.08" strokeWidth="2" />

    {/* Walking student figure */}
    <g transform="translate(420, 350)">
      {/* Body */}
      <circle cx="12" cy="10" r="8" fill="white" fillOpacity="0.2" />
      <path d="M12 18 L12 42" stroke="white" strokeOpacity="0.2" strokeWidth="3" strokeLinecap="round" />
      {/* Arms */}
      <path d="M12 24 L0 34" stroke="white" strokeOpacity="0.18" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12 24 L24 32" stroke="white" strokeOpacity="0.18" strokeWidth="2.5" strokeLinecap="round" />
      {/* Legs */}
      <path d="M12 42 L4 60" stroke="white" strokeOpacity="0.18" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12 42 L22 58" stroke="white" strokeOpacity="0.18" strokeWidth="2.5" strokeLinecap="round" />
      {/* Backpack */}
      <rect x="14" y="20" width="8" height="14" rx="3" fill="white" fillOpacity="0.12" />
    </g>

    {/* Floating location pin */}
    <g transform="translate(130, 70)">
      <path
        d="M16 0C7.16 0 0 7.16 0 16c0 12 16 28 16 28s16-16 16-28C32 7.16 24.84 0 16 0z"
        fill="white"
        fillOpacity="0.2"
      />
      <circle cx="16" cy="15" r="6" fill="white" fillOpacity="0.35" />
    </g>

    {/* Sparkle dots */}
    <circle cx="480" cy="120" r="3" fill="white" fillOpacity="0.2" />
    <circle cx="490" cy="180" r="2" fill="white" fillOpacity="0.15" />
    <circle cx="60" cy="130" r="2.5" fill="white" fillOpacity="0.18" />
    <circle cx="300" cy="60" r="2" fill="white" fillOpacity="0.15" />
    <circle cx="450" cy="240" r="2" fill="white" fillOpacity="0.12" />
  </svg>
);

export default HeroIllustration;
