'use client'

// ---------------------------------------------------------------------------
// Room13Logo — the full multi-card / wheel mark (matches the home page logo).
// Exported so JoinScreen and WaitingScreen can use it with the glow animation.
// ---------------------------------------------------------------------------

export function Room13Logo({
  width  = 140,
  height = 64,
}: {
  width?:  number
  height?: number
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 680 310"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0, display: 'block' }}
    >
      <circle cx="340" cy="172" r="64" fill="var(--th-surface)" stroke="currentColor" strokeWidth="2.2"/>
      <circle cx="340" cy="172" r="48" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.38"/>
      <g opacity="0.11" fill="currentColor">
        <path d="M340,172 L340,124 A48,48 0 0,1 373.9,137.9 Z"/>
        <path d="M340,172 L388,172 A48,48 0 0,1 373.9,206.1 Z"/>
        <path d="M340,172 L340,220 A48,48 0 0,1 306.1,206.1 Z"/>
        <path d="M340,172 L292,172 A48,48 0 0,1 306.1,137.9 Z"/>
      </g>
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.60">
        <line x1="340" y1="124" x2="340" y2="108"/>
        <line x1="373.9" y1="137.9" x2="385.3" y2="126.5"/>
        <line x1="388" y1="172" x2="404" y2="172"/>
        <line x1="373.9" y1="206.1" x2="385.3" y2="217.5"/>
        <line x1="340" y1="220" x2="340" y2="236"/>
        <line x1="306.1" y1="206.1" x2="294.7" y2="217.5"/>
        <line x1="292" y1="172" x2="276" y2="172"/>
        <line x1="306.1" y1="137.9" x2="294.7" y2="126.5"/>
      </g>
      <circle cx="340" cy="172" r="8" fill="var(--th-surface)" stroke="currentColor" strokeWidth="1.6"/>
      <circle cx="340" cy="172" r="2.5" fill="currentColor"/>
      <g transform="rotate(-56,340,242)"><rect x="318" y="166" width="44" height="76" rx="5" fill="var(--th-surface)" stroke="currentColor" strokeWidth="1.0" opacity="0.62"/><line x1="325" y1="179" x2="355" y2="179" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.28"/><circle cx="340" cy="216" r="8" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.22"/></g>
      <g transform="rotate(56,340,242)"><rect x="318" y="166" width="44" height="76" rx="5" fill="var(--th-surface)" stroke="currentColor" strokeWidth="1.0" opacity="0.62"/><line x1="325" y1="179" x2="355" y2="179" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.28"/><circle cx="340" cy="216" r="8" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.22"/></g>
      <g transform="rotate(-40,340,242)"><rect x="318" y="166" width="44" height="76" rx="5" fill="var(--th-surface)" stroke="currentColor" strokeWidth="1.1" opacity="0.74"/><line x1="325" y1="179" x2="355" y2="179" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" opacity="0.35"/><circle cx="340" cy="216" r="8" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.28"/></g>
      <g transform="rotate(40,340,242)"><rect x="318" y="166" width="44" height="76" rx="5" fill="var(--th-surface)" stroke="currentColor" strokeWidth="1.1" opacity="0.74"/><line x1="325" y1="179" x2="355" y2="179" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" opacity="0.35"/><circle cx="340" cy="216" r="8" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.28"/></g>
      <g transform="rotate(-24,340,242)"><rect x="318" y="166" width="44" height="76" rx="5" fill="var(--th-surface)" stroke="currentColor" strokeWidth="1.3" opacity="0.86"/><line x1="325" y1="179" x2="355" y2="179" stroke="currentColor" strokeWidth="1.0" strokeLinecap="round" opacity="0.44"/><line x1="325" y1="186" x2="355" y2="186" stroke="currentColor" strokeWidth="1.0" strokeLinecap="round" opacity="0.28"/><circle cx="340" cy="216" r="8" fill="none" stroke="currentColor" strokeWidth="1.0" opacity="0.38"/><circle cx="340" cy="216" r="2.2" fill="currentColor" opacity="0.38"/></g>
      <g transform="rotate(24,340,242)"><rect x="318" y="166" width="44" height="76" rx="5" fill="var(--th-surface)" stroke="currentColor" strokeWidth="1.3" opacity="0.86"/><line x1="325" y1="179" x2="355" y2="179" stroke="currentColor" strokeWidth="1.0" strokeLinecap="round" opacity="0.44"/><line x1="325" y1="186" x2="355" y2="186" stroke="currentColor" strokeWidth="1.0" strokeLinecap="round" opacity="0.28"/><circle cx="340" cy="216" r="8" fill="none" stroke="currentColor" strokeWidth="1.0" opacity="0.38"/><circle cx="340" cy="216" r="2.2" fill="currentColor" opacity="0.38"/></g>
      <rect x="318" y="166" width="44" height="76" rx="5" fill="var(--th-surface)" stroke="currentColor" strokeWidth="1.6"/>
      <line x1="325" y1="179" x2="355" y2="179" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.60"/>
      <line x1="325" y1="186" x2="355" y2="186" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.38"/>
      <circle cx="340" cy="216" r="8" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.65"/>
      <circle cx="340" cy="216" r="2.5" fill="currentColor" opacity="0.80"/>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// BrandWatermark — low-opacity footer stamp shown on loading / join / waiting
// screens and at the bottom of the main room view.
// ---------------------------------------------------------------------------

export function BrandWatermark() {
  return (
    <div
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        gap:             6,
        opacity:         0.18,
        userSelect:     'none',
        pointerEvents:  'none',
        marginTop:       24,
      }}
    >
      <Room13Logo width={36} height={16} />
      <span
        style={{
          fontFamily:    "'Geist Mono', ui-monospace, monospace",
          fontSize:      '0.55rem',
          fontWeight:     400,
          letterSpacing: '0.18em',
          color:         'var(--th-brand)',
          textTransform: 'lowercase',
        }}
      >
        room 13
      </span>
    </div>
  )
}