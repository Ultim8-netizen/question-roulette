'use client'

import { useState, useRef, useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { DARK_THEMES, LIGHT_THEMES, type ThemeId } from '@/lib/theme'

// ---------------------------------------------------------------------------
// Small icons for dark / light section labels
// ---------------------------------------------------------------------------

function MoonIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M12.5 9.5A6 6 0 0 1 4.5 1.5a6 6 0 1 0 8 8z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.3" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
        const r = deg * Math.PI / 180
        const x1 = 7 + Math.cos(r) * 4.2
        const y1 = 7 + Math.sin(r) * 4.2
        const x2 = 7 + Math.cos(r) * 5.6
        const y2 = 7 + Math.sin(r) * 5.6
        return (
          <line
            key={deg}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"
          />
        )
      })}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Current-theme icon shown in the toggle pill
// ---------------------------------------------------------------------------

function ThemeIcon({ isDark }: { isDark: boolean }) {
  return isDark ? <MoonIcon /> : <SunIcon />
}

// ---------------------------------------------------------------------------
// ThemeToggle
// ---------------------------------------------------------------------------

export function ThemeToggle() {
  const { themeId, isDark, setTheme } = useTheme()
  const [open, setOpen]   = useState(false)
  const panelRef          = useRef<HTMLDivElement>(null)
  const triggerRef        = useRef<HTMLButtonElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current  && !panelRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  function pick(id: ThemeId) {
    setTheme(id)
    setOpen(false)
  }

  return (
    <>
      <style>{`
        @keyframes tt-panel-in {
          from { opacity: 0; transform: translateY(6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        .tt-panel { animation: tt-panel-in 0.22s cubic-bezier(0.22,1,0.36,1) both; }

        .tt-swatch {
          cursor: pointer;
          border-radius: 50%;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          flex-shrink: 0;
        }
        .tt-swatch:hover {
          transform: scale(1.15);
        }
        .tt-trigger {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 11px;
          border-radius: 99px;
          border: 1px solid var(--th-border-2);
          background: var(--th-surface);
          color: var(--th-text-2);
          cursor: pointer;
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 0.70rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          transition: border-color 0.18s ease, background 0.18s ease, color 0.18s ease;
          white-space: nowrap;
        }
        .tt-trigger:hover {
          border-color: var(--th-border-2);
          color: var(--th-text-1);
          background: var(--th-surface-2);
        }
      `}</style>

      <div style={{ position: 'relative', display: 'inline-block' }}>

        {/* Pill trigger */}
        <button
          ref={triggerRef}
          className="tt-trigger"
          onClick={() => setOpen(o => !o)}
          aria-label="Change theme"
          aria-expanded={open}
        >
          <ThemeIcon isDark={isDark} />
          <span style={{ color: 'var(--th-text-3)', textTransform: 'capitalize' }}>
            Theme
          </span>
        </button>

        {/* Picker panel */}
        {open && (
          <div
            ref={panelRef}
            className="tt-panel"
            style={{
              position:    'absolute',
              top:         'calc(100% + 8px)',
              right:       0,
              zIndex:      200,
              width:       204,
              background:  'var(--th-surface)',
              border:      '1px solid var(--th-border-2)',
              borderRadius: 16,
              padding:     '14px 14px 12px',
              boxShadow:   '0 16px 48px rgba(0,0,0,0.28)',
            }}
          >

            {/* Dark section */}
            <div style={{
              display:       'flex',
              alignItems:    'center',
              gap:           6,
              marginBottom:  10,
              color:         'var(--th-text-3)',
              fontSize:      '0.58rem',
              fontWeight:    600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontFamily:    "'DM Sans', system-ui, sans-serif",
            }}>
              <MoonIcon />
              Dark
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              {DARK_THEMES.map(t => (
                <SwatchButton
                  key={t.id}
                  id={t.id}
                  name={t.name}
                  swatch={t.swatch}
                  active={themeId === t.id}
                  onPick={pick}
                />
              ))}
            </div>

            {/* Divider */}
            <div style={{
              height:       1,
              background:   'var(--th-border)',
              marginBottom: 12,
            }} />

            {/* Light section */}
            <div style={{
              display:       'flex',
              alignItems:    'center',
              gap:           6,
              marginBottom:  10,
              color:         'var(--th-text-3)',
              fontSize:      '0.58rem',
              fontWeight:    600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontFamily:    "'DM Sans', system-ui, sans-serif",
            }}>
              <SunIcon />
              Light
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {LIGHT_THEMES.map(t => (
                <SwatchButton
                  key={t.id}
                  id={t.id}
                  name={t.name}
                  swatch={t.swatch}
                  active={themeId === t.id}
                  onPick={pick}
                />
              ))}
            </div>

          </div>
        )}
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// SwatchButton — circle + label
// ---------------------------------------------------------------------------

function SwatchButton({
  id, name, swatch, active, onPick,
}: {
  id:     ThemeId
  name:   string
  swatch: string
  active: boolean
  onPick: (id: ThemeId) => void
}) {
  return (
    <button
      title={name}
      aria-label={`${name} theme${active ? ' (active)' : ''}`}
      aria-pressed={active}
      onClick={() => onPick(id)}
      style={{
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        gap:           4,
        background:    'none',
        border:        'none',
        padding:       0,
        cursor:        'pointer',
      }}
    >
      {/* Circle swatch */}
      <span
        className="tt-swatch"
        style={{
          width:     28,
          height:    28,
          background: swatch,
          boxShadow: active
            ? `0 0 0 2px var(--th-bg), 0 0 0 3.5px var(--th-text-2)`
            : `0 0 0 1px var(--th-border-2)`,
          display:   'inline-block',
        }}
      />
      {/* Label */}
      <span style={{
        fontFamily:    "'DM Sans', system-ui, sans-serif",
        fontSize:      '0.52rem',
        fontWeight:    active ? 600 : 400,
        color:         active ? 'var(--th-text-1)' : 'var(--th-text-3)',
        letterSpacing: '0.04em',
        lineHeight:    1,
        transition:    'color 0.15s ease',
      }}>
        {name}
      </span>
    </button>
  )
}