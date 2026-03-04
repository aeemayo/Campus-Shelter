const CtaIllustration = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 440 400"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Main cozy house */}
    <rect x="100" y="150" width="180" height="190" rx="10" fill="white" fillOpacity="0.1" />

    {/* Roof */}
    <path
      d="M70 158 L190 68 L310 158"
      stroke="white"
      strokeOpacity="0.2"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="white"
      fillOpacity="0.06"
    />

    {/* Chimney with smoke */}
    <rect x="245" y="95" width="22" height="46" rx="3" fill="white" fillOpacity="0.1" />
    <circle cx="256" cy="82" r="6" fill="white" fillOpacity="0.08" />
    <circle cx="262" cy="68" r="5" fill="white" fillOpacity="0.06" />
    <circle cx="258" cy="55" r="4" fill="white" fillOpacity="0.04" />

    {/* Windows - warm glow effect */}
    <rect x="125" y="185" width="44" height="48" rx="6" fill="white" fillOpacity="0.22" />
    <rect x="211" y="185" width="44" height="48" rx="6" fill="white" fillOpacity="0.22" />
    {/* Window panes */}
    <line x1="147" y1="185" x2="147" y2="233" stroke="white" strokeOpacity="0.12" strokeWidth="1.5" />
    <line x1="125" y1="209" x2="169" y2="209" stroke="white" strokeOpacity="0.12" strokeWidth="1.5" />
    <line x1="233" y1="185" x2="233" y2="233" stroke="white" strokeOpacity="0.12" strokeWidth="1.5" />
    <line x1="211" y1="209" x2="255" y2="209" stroke="white" strokeOpacity="0.12" strokeWidth="1.5" />

    {/* Door */}
    <rect x="168" y="272" width="44" height="68" rx="6" fill="white" fillOpacity="0.18" />
    <circle cx="203" cy="308" r="3.5" fill="white" fillOpacity="0.3" />
    {/* Door top window */}
    <rect x="176" y="280" width="28" height="18" rx="4" fill="white" fillOpacity="0.1" />

    {/* Path/walkway */}
    <path
      d="M175 340 L165 380 Q160 400 155 400 L225 400 Q220 400 215 380 L205 340"
      fill="white"
      fillOpacity="0.06"
    />

    {/* Garden/bushes left */}
    <ellipse cx="78" cy="335" rx="28" ry="18" fill="white" fillOpacity="0.06" />
    <ellipse cx="60" cy="328" rx="18" ry="14" fill="white" fillOpacity="0.05" />
    {/* Flowers */}
    <circle cx="65" cy="318" r="3" fill="white" fillOpacity="0.15" />
    <circle cx="80" cy="322" r="2.5" fill="white" fillOpacity="0.12" />
    <circle cx="55" cy="324" r="2" fill="white" fillOpacity="0.1" />

    {/* Garden/bushes right */}
    <ellipse cx="340" cy="335" rx="28" ry="18" fill="white" fillOpacity="0.06" />
    <ellipse cx="360" cy="328" rx="18" ry="14" fill="white" fillOpacity="0.05" />
    {/* Flowers */}
    <circle cx="345" cy="318" r="3" fill="white" fillOpacity="0.15" />
    <circle cx="330" cy="322" r="2.5" fill="white" fillOpacity="0.12" />
    <circle cx="358" cy="324" r="2" fill="white" fillOpacity="0.1" />

    {/* Key icon floating */}
    <g transform="translate(330, 100)">
      <circle cx="16" cy="16" r="28" fill="white" fillOpacity="0.06" />
      <circle cx="16" cy="12" r="8" stroke="white" strokeOpacity="0.25" strokeWidth="2.5" fill="none" />
      <path d="M16 20 L16 36" stroke="white" strokeOpacity="0.25" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M16 30 L22 30" stroke="white" strokeOpacity="0.25" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M16 36 L20 36" stroke="white" strokeOpacity="0.25" strokeWidth="2.5" strokeLinecap="round" />
    </g>

    {/* Shield/check icon floating */}
    <g transform="translate(40, 110)">
      <circle cx="22" cy="22" r="24" fill="white" fillOpacity="0.05" />
      <path
        d="M22 6 L38 14 L38 26 C38 34 30 40 22 44 C14 40 6 34 6 26 L6 14 Z"
        stroke="white"
        strokeOpacity="0.2"
        strokeWidth="2"
        fill="white"
        fillOpacity="0.05"
      />
      <path d="M14 24 L20 30 L32 18" stroke="white" strokeOpacity="0.25" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>

    {/* Heart / home love icon */}
    <g transform="translate(350, 220)">
      <path
        d="M20 36 C8 26 0 20 0 12 C0 5 5 0 12 0 C16 0 19 2 20 5 C21 2 24 0 28 0 C35 0 40 5 40 12 C40 20 32 26 20 36Z"
        fill="white"
        fillOpacity="0.1"
      />
    </g>

    {/* Sparkle/star elements */}
    <g transform="translate(90, 60)">
      <path d="M8 0 L10 6 L16 8 L10 10 L8 16 L6 10 L0 8 L6 6 Z" fill="white" fillOpacity="0.18" />
    </g>
    <g transform="translate(310, 50)">
      <path d="M6 0 L7.5 4.5 L12 6 L7.5 7.5 L6 12 L4.5 7.5 L0 6 L4.5 4.5 Z" fill="white" fillOpacity="0.14" />
    </g>

    {/* Floating dots */}
    <circle cx="30" cy="200" r="2.5" fill="white" fillOpacity="0.12" />
    <circle cx="410" cy="170" r="2" fill="white" fillOpacity="0.1" />
    <circle cx="400" cy="300" r="3" fill="white" fillOpacity="0.08" />
    <circle cx="20" cy="290" r="2" fill="white" fillOpacity="0.1" />
    <circle cx="190" cy="40" r="2.5" fill="white" fillOpacity="0.12" />

    {/* Ground */}
    <line x1="20" y1="342" x2="420" y2="342" stroke="white" strokeOpacity="0.06" strokeWidth="1.5" />
  </svg>
);

export default CtaIllustration;
