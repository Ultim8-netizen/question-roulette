import { ImageResponse } from 'next/og'

// ---------------------------------------------------------------------------
// Next.js app router auto-discovers this file and wires up the OG meta tags.
// No changes to layout.tsx are needed — metadataBase is already set there.
// ---------------------------------------------------------------------------

export const alt = 'Room 13 — question roulette. Two players. Blind draws. No map.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const TIERS = [
  { label: 'LIGHT',  color: '#4ade80' },
  { label: 'MEDIUM', color: '#60a5fa' },
  { label: 'DEEP',   color: '#f87171' },
  { label: 'SPICY',  color: '#c084fc' },
] as const

// ---------------------------------------------------------------------------
// Font loader — fetches from Google Fonts CSS2 API and extracts the woff2 URL.
// Grabs the last @font-face block which is always the latin subset.
// ---------------------------------------------------------------------------

async function fetchGoogleFont(
  family: string,
  variant: string,
): Promise<ArrayBuffer> {
  const url =
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:${variant}&display=swap`

  const css = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  }).then(r => r.text())

  const matches = [
    ...css.matchAll(
      /src:\s*url\(['"]?(https:\/\/fonts\.gstatic\.com[^'")\s]+)['"]?\)/g,
    ),
  ]
  const last = matches[matches.length - 1]
  if (!last?.[1]) throw new Error(`Font parse failed: ${family} ${variant}`)

  return fetch(last[1]).then(r => r.arrayBuffer())
}

// ---------------------------------------------------------------------------
// Image
// ---------------------------------------------------------------------------

export default async function Image() {
  const [semiBold, italic] = await Promise.all([
    fetchGoogleFont('Cormorant Garamond', 'wght@600'),
    fetchGoogleFont('Cormorant Garamond', 'ital,wght@1,400'),
  ])

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#020308',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: '"Cormorant Garamond"',
        }}
      >
        {/* ── Atmosphere orbs ── */}
        <div style={{
          position: 'absolute', top: -80, left: -80,
          width: 420, height: 420, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(74,222,128,0.07) 0%, transparent 70%)',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute', bottom: -80, right: -80,
          width: 420, height: 420, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(192,132,252,0.07) 0%, transparent 70%)',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute', top: -60, right: 100,
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(96,165,250,0.05) 0%, transparent 70%)',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: 100,
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(248,113,113,0.05) 0%, transparent 70%)',
          display: 'flex',
        }} />

        {/* ── Corner brackets ── */}
        {/* top-left */}
        <div style={{ position: 'absolute', top: 44, left: 60, width: 44, height: 44, borderTop: '1px solid rgba(255,255,255,0.10)', borderLeft: '1px solid rgba(255,255,255,0.10)', display: 'flex' }} />
        {/* top-right */}
        <div style={{ position: 'absolute', top: 44, right: 60, width: 44, height: 44, borderTop: '1px solid rgba(255,255,255,0.10)', borderRight: '1px solid rgba(255,255,255,0.10)', display: 'flex' }} />
        {/* bottom-left */}
        <div style={{ position: 'absolute', bottom: 44, left: 60, width: 44, height: 44, borderBottom: '1px solid rgba(255,255,255,0.10)', borderLeft: '1px solid rgba(255,255,255,0.10)', display: 'flex' }} />
        {/* bottom-right */}
        <div style={{ position: 'absolute', bottom: 44, right: 60, width: 44, height: 44, borderBottom: '1px solid rgba(255,255,255,0.10)', borderRight: '1px solid rgba(255,255,255,0.10)', display: 'flex' }} />

        {/* ── Main content ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>

          {/* Tier dots + rule */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 52 }}>
            <div style={{ width: 140, height: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.09))', display: 'flex' }} />
            {TIERS.map(({ color }, i) => (
              <div
                key={i}
                style={{
                  width: 11, height: 11, borderRadius: '50%',
                  background: color,
                  boxShadow: `0 0 14px ${color}, 0 0 28px ${color}66`,
                  display: 'flex',
                }}
              />
            ))}
            <div style={{ width: 140, height: 1, background: 'linear-gradient(to left, transparent, rgba(255,255,255,0.09))', display: 'flex' }} />
          </div>

          {/* Wordmark small */}
          <div style={{
            display: 'flex',
            color: '#1e2535',
            fontSize: 15,
            letterSpacing: '0.22em',
            marginBottom: 18,
            fontFamily: '"Cormorant Garamond"',
            fontWeight: 600,
          }}>
            abyssprotocol
          </div>

          {/* Room 13 — main heading */}
          <div style={{
            display: 'flex',
            color: '#c8d0de',
            fontSize: 134,
            fontWeight: 600,
            letterSpacing: '0.06em',
            lineHeight: 1,
            marginBottom: 28,
            fontFamily: '"Cormorant Garamond"',
          }}>
            Room 13
          </div>

          {/* Divider hairline */}
          <div style={{
            width: 480, height: 1,
            background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)',
            marginBottom: 28,
            display: 'flex',
          }} />

          {/* Tagline */}
          <div style={{
            display: 'flex',
            color: '#475569',
            fontSize: 30,
            fontStyle: 'italic',
            fontWeight: 400,
            letterSpacing: '0.06em',
            marginBottom: 52,
            fontFamily: '"Cormorant Garamond"',
          }}>
            Two players. Blind draws. No map.
          </div>

          {/* Tier pill badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {TIERS.map(({ label, color }, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  padding: '7px 20px',
                  borderRadius: 99,
                  border: `1px solid ${color}30`,
                  background: `${color}0c`,
                  color: color,
                  fontSize: 13,
                  letterSpacing: '0.14em',
                  fontFamily: '"Cormorant Garamond"',
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Cormorant Garamond', data: semiBold, weight: 600, style: 'normal'  },
        { name: 'Cormorant Garamond', data: italic,   weight: 400, style: 'italic'  },
      ],
    },
  )
}