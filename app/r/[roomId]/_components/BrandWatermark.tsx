'use client'

// ---------------------------------------------------------------------------
// Room13Mark — compact clock-face / card hybrid logo mark.
// Used as the brand sigil throughout the room flow.
// ---------------------------------------------------------------------------

export function Room13Mark({
  size = 10,
  opacity = 1,
}: {
  size?: number
  opacity?: number
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ opacity, flexShrink: 0 }}
    >
      <circle
        cx="16" cy="20" r="10"
        fill="var(--th-surface)"
        stroke="var(--th-brand)"
        strokeWidth="1.1"
      />
      <circle
        cx="16" cy="20" r="7.5"
        fill="none"
        stroke="var(--th-brand)"
        strokeWidth="0.4"
        opacity="0.35"
      />
      <g stroke="var(--th-brand)" strokeWidth="0.65" strokeLinecap="round" opacity="0.55">
        <line x1="21.3" y1="14.7" x2="23.1" y2="12.9" />
        <line x1="23.5" y1="20"   x2="26"   y2="20"   />
        <line x1="21.3" y1="25.3" x2="23.1" y2="27.1" />
        <line x1="16"   y1="27.5" x2="16"   y2="30"   />
        <line x1="10.7" y1="25.3" x2="8.9"  y2="27.1" />
        <line x1="8.5"  y1="20"   x2="6"    y2="20"   />
        <line x1="10.7" y1="14.7" x2="8.9"  y2="12.9" />
      </g>
      <circle cx="16" cy="20" r="1.8" fill="var(--th-brand)" />
      <rect
        x="11" y="5" width="10" height="14" rx="1.8"
        fill="var(--th-surface)"
        stroke="var(--th-brand)"
        strokeWidth="1.2"
      />
      <line
        x1="13.5" y1="9"    x2="18.5" y2="9"
        stroke="var(--th-brand)" strokeWidth="0.9"
        strokeLinecap="round" opacity="0.60"
      />
      <line
        x1="13.5" y1="11.5" x2="18.5" y2="11.5"
        stroke="var(--th-brand)" strokeWidth="0.9"
        strokeLinecap="round" opacity="0.38"
      />
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
        display:       'flex',
        alignItems:    'center',
        justifyContent:'center',
        gap:            5,
        opacity:        0.18,
        userSelect:    'none',
        pointerEvents: 'none',
        marginTop:      24,
      }}
    >
      <Room13Mark size={10} opacity={1} />
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