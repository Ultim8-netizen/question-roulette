'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TrendDay = { date: string; total: number; complete: number }

type Stats = {
  totalRooms:      number
  completeRooms:   number
  totalMessages:   number
  totalCardsDrawn: number
  activeToday:     number
  thisWeek:        number
  lastWeek:        number
  conversionRate:  number
  trend:           TrendDay[]
}

// ---------------------------------------------------------------------------
// Sigil
// ---------------------------------------------------------------------------

function AbyssSignil({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="16" cy="16" r="9" stroke="#c8d0de" strokeWidth="1.4" strokeDasharray="22 6" strokeDashoffset="3" />
      <line x1="16" y1="4" x2="16" y2="28" stroke="#c8d0de" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="16" cy="16" r="2" fill="#c8d0de" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  sub,
  accent = '#c8d0de',
  large = false,
}: {
  label:   string
  value:   string | number
  sub?:    string
  accent?: string
  large?:  boolean
}) {
  return (
    <div style={{
      background:    'linear-gradient(150deg, #07080f, #050609)',
      border:        '1px solid rgba(255,255,255,0.06)',
      borderRadius:  16,
      padding:       large ? '20px 18px 18px' : '14px 14px 12px',
      display:       'flex',
      flexDirection: 'column',
      gap:           3,
    }}>
      <span style={{
        color:         '#334155',
        fontSize:      '0.58rem',
        fontWeight:    600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        fontFamily:    'DM Sans, system-ui, sans-serif',
      }}>
        {label}
      </span>
      <span style={{
        color:      accent,
        fontSize:   large ? '2.4rem' : '1.7rem',
        fontWeight: 500,
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        lineHeight: 1.05,
      }}>
        {value}
      </span>
      {sub && (
        <span style={{
          color:      '#1e2535',
          fontSize:   '0.62rem',
          fontFamily: 'DM Sans, system-ui, sans-serif',
          lineHeight: 1.4,
        }}>
          {sub}
        </span>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 14-day trend bar chart
// ---------------------------------------------------------------------------

function TrendChart({ trend }: { trend: TrendDay[] }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const maxVal = Math.max(...trend.map(d => d.total), 1)

  return (
    <div style={{ position: 'relative' }}>
      {/* Bar container */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 80, position: 'relative' }}>

        {/* Horizontal gridlines */}
        {[0, 0.5, 1].map(frac => (
          <div
            key={frac}
            style={{
              position:      'absolute',
              left:          0, right: 0,
              bottom:        `${frac * 100}%`,
              height:        1,
              background:    'rgba(255,255,255,0.04)',
              pointerEvents: 'none',
            }}
          />
        ))}

        {trend.map((day, i) => {
          const totalPct    = maxVal > 0 ? (day.total    / maxVal) * 100 : 0
          const completePct = day.total > 0 ? (day.complete / day.total) * 100 : 0
          const isHovered   = hovered === i
          const barMinH     = day.total > 0 ? 4 : 0

          return (
            <div
              key={day.date}
              style={{
                flex:       1,
                height:     '100%',
                display:    'flex',
                alignItems: 'flex-end',
                position:   'relative',
                cursor:     'default',
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Total bar */}
              <div style={{
                width:        '100%',
                height:       `max(${totalPct}%, ${barMinH}px)`,
                background:   isHovered ? '#4ade8030' : '#4ade8016',
                borderRadius: '3px 3px 0 0',
                position:     'relative',
                overflow:     'hidden',
                transition:   'background 0.15s ease',
              }}>
                {/* Completed overlay */}
                <div style={{
                  position:     'absolute',
                  bottom:       0, left: 0, right: 0,
                  height:       `max(${completePct}%, ${day.complete > 0 ? 3 : 0}px)`,
                  background:   '#4ade80',
                  opacity:      isHovered ? 0.85 : 0.62,
                  borderRadius: '2px 2px 0 0',
                  transition:   'opacity 0.15s ease',
                }} />
              </div>

              {/* Hover tooltip */}
              {isHovered && day.total > 0 && (
                <div style={{
                  position:      'absolute',
                  bottom:        'calc(100% + 8px)',
                  left:          '50%',
                  transform:     'translateX(-50%)',
                  background:    '#0b0d14',
                  border:        '1px solid rgba(255,255,255,0.10)',
                  borderRadius:  7,
                  padding:       '6px 9px',
                  whiteSpace:    'nowrap',
                  zIndex:        10,
                  pointerEvents: 'none',
                }}>
                  <div style={{ color: '#64748b', fontSize: '0.58rem', fontFamily: 'DM Sans, system-ui', marginBottom: 2 }}>
                    {day.date.slice(5)}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.60rem', fontFamily: 'DM Sans, system-ui' }}>
                    {day.total} started
                  </div>
                  <div style={{ color: '#4ade80', fontSize: '0.58rem', fontFamily: 'DM Sans, system-ui' }}>
                    {day.complete} completed
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* x-axis */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 0 6px' }} />

      {/* Date bookends */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#1e2535', fontSize: '0.55rem', fontFamily: 'DM Sans, system-ui' }}>
          {trend[0]?.date.slice(5)}
        </span>
        <span style={{ color: '#1e2535', fontSize: '0.55rem', fontFamily: 'DM Sans, system-ui' }}>
          today
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function StatsPage() {
  const [stats,       setStats]       = useState<Stats | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // FIX 1: wrap in useCallback so the function reference is stable.
  // useEffect then lists it as a dependency — this satisfies
  // react-hooks/set-state-in-effect, which objects to setState being
  // called synchronously in the effect body rather than inside a
  // stable, memoised callback.
  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stats')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: Stats = await res.json()
      setStats(data)
      setLastRefresh(new Date())
    } catch {
      setError('Could not load stats. Check your Supabase connection.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Week-over-week delta label
  const weekDelta = stats
    ? stats.lastWeek === 0 && stats.thisWeek === 0
      ? '—'
      : stats.lastWeek === 0
      ? 'new ↑'
      : `${stats.thisWeek >= stats.lastWeek ? '+' : ''}${Math.round(
          ((stats.thisWeek - stats.lastWeek) / stats.lastWeek) * 100
        )}%`
    : '—'

  const weekPositive = !stats || stats.thisWeek >= stats.lastWeek

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { background: #020308; margin: 0; }

        @keyframes s-in   { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes s-spin  { to { transform: rotate(360deg) } }
        @keyframes s-pulse { 0%,100%{opacity:0.6} 50%{opacity:1} }

        .s-1  { animation: s-in 0.42s cubic-bezier(0.22,1,0.36,1)       both; }
        .s-2  { animation: s-in 0.42s cubic-bezier(0.22,1,0.36,1) 0.07s both; }
        .s-3  { animation: s-in 0.42s cubic-bezier(0.22,1,0.36,1) 0.14s both; }
        .s-4  { animation: s-in 0.42s cubic-bezier(0.22,1,0.36,1) 0.21s both; }
        .s-spin-anim { animation: s-spin 0.85s linear infinite; }
        .s-pulse-anim{ animation: s-pulse 2.8s ease-in-out infinite; }
      `}</style>

      <main style={{
        minHeight:  '100dvh',
        background: '#020308',
        color:      '#ededed',
        fontFamily: 'DM Sans, system-ui, sans-serif',
        padding:    '28px 20px 72px',
        maxWidth:   480,
        margin:     '0 auto',
      }}>

        {/* ── Header ── */}
        <div className="s-1" style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          marginBottom:   32,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="s-pulse-anim">
              <AbyssSignil size={22} />
            </div>
            <div>
              <div style={{
                fontFamily:    'Geist Mono, ui-monospace, monospace',
                fontSize:      '0.62rem',
                color:         '#2a3244',
                letterSpacing: '0.20em',
                textTransform: 'lowercase',
                marginBottom:  1,
              }}>
                abyssprotocol
              </div>
              <div style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize:   '1.35rem',
                fontWeight: 500,
                color:      '#c8d0de',
                lineHeight: 1,
              }}>
                analytics
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {!loading && stats && (
              <span style={{ color: '#1e2535', fontSize: '0.58rem' }}>
                {lastRefresh.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </span>
            )}

            {/* Refresh */}
            <button
              onClick={load}
              disabled={loading}
              title="Refresh"
              style={{
                background:  'none',
                border:      '1px solid rgba(255,255,255,0.07)',
                borderRadius: 8,
                padding:     '5px 10px',
                cursor:      loading ? 'default' : 'pointer',
                color:       '#334155',
                fontSize:    '0.80rem',
                lineHeight:  1,
                transition:  'border-color 0.2s ease, color 0.2s ease',
              }}
              onMouseEnter={e => {
                if (!loading) {
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.14)'
                  ;(e.currentTarget as HTMLButtonElement).style.color = '#64748b'
                }
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)'
                ;(e.currentTarget as HTMLButtonElement).style.color = '#334155'
              }}
            >
              {loading ? (
                <div className="s-spin-anim" style={{
                  width: 11, height: 11, borderRadius: '50%',
                  border: '1.5px solid #1e2535',
                  borderTopColor: '#64748b',
                  display: 'inline-block',
                }} />
              ) : '↻'}
            </button>

            {/* FIX 2: <a href="/"> replaced with Next.js <Link href="/"> */}
            <Link
              href="/"
              style={{
                color:          '#1e2535',
                fontSize:       '0.65rem',
                textDecoration: 'none',
                letterSpacing:  '0.04em',
                transition:     'color 0.2s ease',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#334155')}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#1e2535')}
            >
              ← game
            </Link>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={{
            background:   '#0e0202',
            border:       '1px solid rgba(248,113,113,0.18)',
            borderRadius: 12,
            padding:      '12px 16px',
            color:        '#f87171',
            fontSize:     '0.78rem',
            marginBottom: 20,
          }}>
            {error}
          </div>
        )}

        {/* ── Loading skeleton ── */}
        {loading && !stats && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, paddingTop: 72 }}>
            <div className="s-spin-anim" style={{
              width:          28, height: 28,
              borderRadius:   '50%',
              border:         '2px solid #1e2535',
              borderTopColor: '#4ade80',
            }} />
            <span style={{ color: '#1e2535', fontSize: '0.72rem' }}>loading metrics...</span>
          </div>
        )}

        {/* ── Content ── */}
        {stats && (
          <>
            {/* Primary stats: 2 big cards */}
            <div className="s-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <StatCard
                label="Total sessions"
                value={stats.totalRooms.toLocaleString()}
                sub="rooms created all time"
                accent="#c8d0de"
                large
              />
              <StatCard
                label="Completion rate"
                value={`${stats.conversionRate}%`}
                sub={`${stats.completeRooms.toLocaleString()} two-player games`}
                accent="#4ade80"
                large
              />
            </div>

            {/* Secondary stats: 3 smaller cards */}
            <div className="s-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
              <StatCard
                label="Active today"
                value={stats.activeToday}
                accent="#60a5fa"
              />
              <StatCard
                label="Cards drawn"
                value={stats.totalCardsDrawn.toLocaleString()}
                sub="all time"
                accent="#c084fc"
              />
              <StatCard
                label="Messages"
                value={stats.totalMessages.toLocaleString()}
                sub="sent"
                accent="#f87171"
              />
            </div>

            {/* 14-day trend chart */}
            <div className="s-3" style={{
              background:   'linear-gradient(150deg, #07080f, #050609)',
              border:       '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16,
              padding:      '18px 16px 14px',
              marginBottom: 10,
            }}>
              <div style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                marginBottom:   16,
              }}>
                <span style={{
                  color:         '#475569',
                  fontSize:      '0.62rem',
                  fontWeight:    600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}>
                  Sessions · last 14 days
                </span>
                {/* Legend */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: 2,
                      background: '#4ade8016',
                      border: '1px solid #4ade8030',
                    }} />
                    <span style={{ color: '#1e2535', fontSize: '0.56rem' }}>started</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: 2,
                      background: '#4ade80',
                      opacity: 0.65,
                    }} />
                    <span style={{ color: '#1e2535', fontSize: '0.56rem' }}>completed</span>
                  </div>
                </div>
              </div>
              <TrendChart trend={stats.trend} />
            </div>

            {/* Week-over-week */}
            <div className="s-4" style={{
              background:   'linear-gradient(150deg, #07080f, #050609)',
              border:       '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16,
              padding:      '18px 18px 16px',
              marginBottom: 20,
            }}>
              <span style={{
                color:         '#475569',
                fontSize:      '0.62rem',
                fontWeight:    600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                display:       'block',
                marginBottom:  14,
              }}>
                Week over week
              </span>

              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
                {/* This week */}
                <div>
                  <div style={{ color: '#1e2535', fontSize: '0.58rem', marginBottom: 3 }}>this week</div>
                  <div style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize:   '2.2rem',
                    fontWeight: 500,
                    color:      '#c8d0de',
                    lineHeight: 1,
                  }}>
                    {stats.thisWeek}
                  </div>
                </div>

                <div style={{ color: '#1e2535', fontSize: '0.78rem', paddingBottom: 5 }}>vs</div>

                {/* Last week */}
                <div>
                  <div style={{ color: '#1e2535', fontSize: '0.58rem', marginBottom: 3 }}>last week</div>
                  <div style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize:   '1.5rem',
                    fontWeight: 400,
                    color:      '#334155',
                    lineHeight: 1,
                  }}>
                    {stats.lastWeek}
                  </div>
                </div>

                {/* Delta badge */}
                <div style={{ marginLeft: 'auto', paddingBottom: 4 }}>
                  <span style={{
                    fontFamily:   'DM Sans, system-ui, sans-serif',
                    fontSize:     '0.80rem',
                    fontWeight:   600,
                    color:        weekPositive ? '#4ade80' : '#f87171',
                    background:   weekPositive ? '#4ade8010' : '#f8717110',
                    border:       `1px solid ${weekPositive ? '#4ade8030' : '#f8717130'}`,
                    borderRadius: 99,
                    padding:      '4px 11px',
                  }}>
                    {weekDelta}
                  </span>
                </div>
              </div>

              {/* Proportional bar */}
              {(stats.thisWeek > 0 || stats.lastWeek > 0) && (
                <div style={{ marginTop: 16 }}>
                  <div style={{
                    height:       4, borderRadius: 2,
                    background:   'rgba(255,255,255,0.04)',
                    overflow:     'hidden',
                    position:     'relative',
                  }}>
                    <div style={{
                      height:       '100%',
                      width:        `${Math.min(
                        100,
                        Math.round(
                          (stats.thisWeek / Math.max(stats.thisWeek, stats.lastWeek)) * 100
                        )
                      )}%`,
                      background:   'linear-gradient(90deg, #4ade80, #22c55e)',
                      borderRadius: 2,
                      transition:   'width 0.6s ease',
                    }} />
                  </div>
                </div>
              )}
            </div>

            {/* Vercel Analytics note */}
            <div style={{
              padding:      '12px 14px',
              background:   '#050608',
              border:       '1px solid rgba(255,255,255,0.04)',
              borderRadius: 12,
              display:      'flex',
              alignItems:   'flex-start',
              gap:          10,
            }}>
              <div style={{
                width:      5, height: 5, borderRadius: '50%',
                background: '#60a5fa',
                boxShadow:  '0 0 6px #60a5fa88',
                flexShrink: 0,
                marginTop:  4,
              }} />
              <span style={{ color: '#1e2535', fontSize: '0.64rem', lineHeight: 1.7 }}>
                Real web traffic — page views, unique visitors, and geographic data — is tracked via{' '}
                <a
                  href="https://vercel.com/analytics"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#334155', textDecoration: 'underline', textUnderlineOffset: 2 }}
                >
                  Vercel Analytics
                </a>
                . View it in your Vercel project dashboard under the{' '}
                <span style={{ color: '#2a3550' }}>Analytics</span> tab.
              </span>
            </div>
          </>
        )}
      </main>
    </>
  )
}