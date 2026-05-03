'use client'

import { useState, useEffect, useCallback } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FeedbackType = 'general' | 'bug' | 'idea' | 'question'

type FeedbackRow = {
  id:         string
  type:       FeedbackType
  message:    string
  contact:    string | null
  page_url:   string | null
  created_at: string
}

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

type Tab = 'overview' | 'feedback'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PIN_SESSION_KEY = 'dev-pin'

const TYPE_CONFIG: Record<FeedbackType, { emoji: string; color: string }> = {
  general:  { emoji: '💬', color: '#94a3b8' },
  bug:      { emoji: '🐛', color: '#f87171' },
  idea:     { emoji: '💡', color: '#fbbf24' },
  question: { emoji: '🙋', color: '#60a5fa' },
}

// ---------------------------------------------------------------------------
// Module-level helpers
// ---------------------------------------------------------------------------

// Pure async fetchers — zero setState calls inside.
// Safe to call from effect bodies without triggering set-state-in-effect rule.
async function fetchStats(): Promise<Stats> {
  const r = await fetch('/api/stats')
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json() as Promise<Stats>
}

async function fetchFeedback(pin: string): Promise<FeedbackRow[]> {
  const r = await fetch('/api/dev/feedback', { headers: { 'x-dev-pin': pin } })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  const data = await r.json()
  return (data.feedback ?? []) as FeedbackRow[]
}

// Module-level timestamp — computed once at module load, never during render.
// Avoids the react-hooks/purity violation from calling Date.now() inline.
const MODULE_LOAD_TIME = Date.now()

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  <  1) return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function fmt(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

// ---------------------------------------------------------------------------
// PIN gate
// ---------------------------------------------------------------------------

function PinGate({ onUnlock }: { onUnlock: (pin: string) => void }) {
  const [pin,     setPin]     = useState('')
  const [error,   setError]   = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!pin.trim() || loading) return
    setLoading(true)
    setError(false)

    try {
      const res = await fetch('/api/dev/verify', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ pin }),
      })

      if (res.ok) {
        try { sessionStorage.setItem(PIN_SESSION_KEY, pin) } catch { /* ignore */ }
        onUnlock(pin)
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes pg-in { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .pg-root { animation: pg-in 0.38s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>
      <div style={{
        minHeight:      '100dvh',
        background:     '#020308',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '0 24px',
        fontFamily:     "'DM Sans', system-ui, sans-serif",
      }}>
        <div className="pg-root" style={{ width: '100%', maxWidth: 320 }}>

          {/* Wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="9" stroke="#c8d0de" strokeWidth="1.4" strokeDasharray="22 6" strokeDashoffset="3"/>
              <line x1="16" y1="4" x2="16" y2="28" stroke="#c8d0de" strokeWidth="1.6" strokeLinecap="round"/>
              <circle cx="16" cy="16" r="2" fill="#c8d0de"/>
            </svg>
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '0.70rem', color: '#475569', letterSpacing: '0.18em' }}>
              dev console
            </span>
          </div>

          <div style={{
            background:   '#07080f',
            border:       '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20,
            padding:      '28px 22px',
          }}>
            <div style={{ fontFamily: "'Geist Mono', monospace", color: '#475569', fontSize: '0.60rem', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>
              Access required
            </div>
            <div style={{ color: '#c8d0de', fontSize: '1.0rem', fontWeight: 500, marginBottom: 22, lineHeight: 1.3 }}>
              Enter your PIN to continue
            </div>

            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={e => { setPin(e.target.value); setError(false) }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="••••••"
              autoFocus
              style={{
                width:         '100%',
                height:        50,
                borderRadius:  12,
                background:    '#06070d',
                border:        `1px solid ${error ? 'rgba(248,113,113,0.40)' : 'rgba(255,255,255,0.07)'}`,
                color:         '#ededed',
                fontSize:      '1.1rem',
                padding:       '0 16px',
                outline:       'none',
                fontFamily:    "'DM Sans', system-ui, sans-serif",
                letterSpacing: '0.18em',
                boxSizing:     'border-box',
                marginBottom:  error ? 8 : 16,
                transition:    'border-color 0.2s ease',
              }}
            />

            {error && (
              <div style={{ color: '#f87171', fontSize: '0.72rem', marginBottom: 12 }}>
                Incorrect PIN.
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!pin.trim() || loading}
              style={{
                width:        '100%',
                height:       48,
                borderRadius: 12,
                background:   pin.trim() ? '#0c0e16' : '#06070d',
                border:       `1px solid ${pin.trim() ? 'rgba(255,255,255,0.11)' : 'rgba(255,255,255,0.05)'}`,
                color:        pin.trim() ? '#c8d0de' : '#1e2535',
                fontSize:     '0.82rem',
                fontWeight:   500,
                cursor:       pin.trim() && !loading ? 'pointer' : 'default',
                fontFamily:   "'DM Sans', system-ui, sans-serif",
                transition:   'all 0.2s ease',
              }}
            >
              {loading ? 'Verifying...' : 'Enter'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

function StatCard({ label, value, sub, accent = '#c8d0de' }: {
  label:   string
  value:   string | number
  sub?:    string
  accent?: string
}) {
  return (
    <div style={{
      background:    '#07080f',
      border:        '1px solid rgba(255,255,255,0.06)',
      borderRadius:  14,
      padding:       '14px 14px 12px',
      display:       'flex',
      flexDirection: 'column',
      gap:            3,
    }}>
      <span style={{ color: '#334155', fontSize: '0.56rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'DM Sans', system-ui" }}>
        {label}
      </span>
      <span style={{ color: accent, fontSize: '1.7rem', fontWeight: 500, fontFamily: "'Geist Mono', monospace", lineHeight: 1.05 }}>
        {value}
      </span>
      {sub && (
        <span style={{ color: '#1e2535', fontSize: '0.60rem', fontFamily: "'DM Sans', system-ui", lineHeight: 1.4 }}>
          {sub}
        </span>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Mini trend chart
// ---------------------------------------------------------------------------

function MiniTrend({ trend }: { trend: TrendDay[] }) {
  const maxVal = Math.max(...trend.map(d => d.total), 1)
  const last7  = trend.slice(-7)

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 40 }}>
      {last7.map((day, i) => {
        const pct = (day.total / maxVal) * 100
        return (
          <div key={i} title={`${day.date.slice(5)}: ${day.total} sessions`} style={{
            flex:         1,
            height:       `max(${pct}%, ${day.total > 0 ? 3 : 0}px)`,
            background:   '#4ade8022',
            borderRadius: '2px 2px 0 0',
            position:     'relative',
            overflow:     'hidden',
            cursor:       'default',
          }}>
            <div style={{
              position:     'absolute',
              bottom:       0, left: 0, right: 0,
              height:       day.total > 0 ? `${(day.complete / day.total) * 100}%` : '0%',
              background:   '#4ade80',
              opacity:       0.70,
              borderRadius: '2px 2px 0 0',
            }}/>
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Feedback card
// ---------------------------------------------------------------------------

function FeedbackCard({ item }: { item: FeedbackRow }) {
  const [expanded, setExpanded] = useState(false)
  const conf   = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.general
  const isLong = item.message.length > 140

  return (
    <div style={{
      background:    '#07080f',
      border:        '1px solid rgba(255,255,255,0.06)',
      borderRadius:  14,
      padding:       '14px 16px',
      display:       'flex',
      flexDirection: 'column',
      gap:            8,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '0.88rem' }}>{conf.emoji}</span>
        <span style={{
          fontFamily:    "'DM Sans', system-ui",
          fontSize:      '0.60rem',
          fontWeight:    700,
          color:         conf.color,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          background:    `${conf.color}14`,
          border:        `1px solid ${conf.color}30`,
          borderRadius:  99,
          padding:       '2px 8px',
        }}>
          {item.type}
        </span>
        <span style={{ marginLeft: 'auto', color: '#1e2535', fontSize: '0.60rem', fontFamily: "'DM Sans', system-ui" }}>
          {timeAgo(item.created_at)}
        </span>
      </div>

      {/* Message */}
      <div
        onClick={() => isLong && setExpanded(p => !p)}
        style={{
          color:           '#94a3b8',
          fontSize:        '0.82rem',
          lineHeight:       1.6,
          fontFamily:      "'DM Sans', system-ui",
          cursor:          isLong ? 'pointer' : 'default',
          display:         !expanded && isLong ? '-webkit-box' : 'block',
          WebkitLineClamp: !expanded && isLong ? 3 : undefined,
          WebkitBoxOrient: !expanded && isLong ? 'vertical' : undefined,
          overflow:        !expanded && isLong ? 'hidden' : 'visible',
        } as React.CSSProperties}
      >
        {item.message}
      </div>

      {isLong && (
        <button
          onClick={() => setExpanded(p => !p)}
          style={{ background: 'none', border: 'none', color: '#334155', fontSize: '0.62rem', cursor: 'pointer', textAlign: 'left', padding: 0, fontFamily: "'DM Sans', system-ui" }}
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}

      {/* Contact + URL */}
      {(item.contact || item.page_url) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {item.contact && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#1e2535', fontSize: '0.58rem', fontFamily: "'DM Sans', system-ui" }}>contact</span>
              <span style={{ color: '#475569', fontSize: '0.72rem', fontFamily: "'Geist Mono', monospace" }}>{item.contact}</span>
            </div>
          )}
          {item.page_url && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#1e2535', fontSize: '0.58rem', fontFamily: "'DM Sans', system-ui" }}>page</span>
              <span style={{ color: '#334155', fontSize: '0.62rem', fontFamily: "'Geist Mono', monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.page_url.replace(/^https?:\/\/[^/]+/, '')}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main dashboard
// ---------------------------------------------------------------------------

function Dashboard({ pin }: { pin: string }) {
  const [tab,      setTab]      = useState<Tab>('overview')
  const [stats,    setStats]    = useState<Stats | null>(null)
  const [feedback, setFeedback] = useState<FeedbackRow[]>([])
  const [statsLoading,    setStatsLoading]    = useState(true)
  const [feedbackLoading, setFeedbackLoading] = useState(true)
  const [statsError,    setStatsError]    = useState(false)
  const [feedbackError, setFeedbackError] = useState(false)

  // lastRefresh stored as number to avoid calling Date.now() during render
  const [lastRefresh, setLastRefresh] = useState(MODULE_LOAD_TIME)

  // loadStats / loadFeedback used by the manual refresh button.
  // All setState calls are inside .then()/.catch()/.finally() — never
  // synchronously in the effect body — satisfying set-state-in-effect rule.
  const loadStats = useCallback(() => {
    setStatsLoading(true)
    setStatsError(false)
    fetchStats()
      .then(data => { setStats(data); setLastRefresh(Date.now()) })
      .catch(() => setStatsError(true))
      .finally(() => setStatsLoading(false))
  }, [])

  const loadFeedback = useCallback(() => {
    setFeedbackLoading(true)
    setFeedbackError(false)
    fetchFeedback(pin)
      .then(data => setFeedback(data))
      .catch(() => setFeedbackError(true))
      .finally(() => setFeedbackLoading(false))
  }, [pin])

  // Initial load effects — setState only fires inside async callbacks,
  // never synchronously in the effect body.
  useEffect(() => {
    let cancelled = false
    fetchStats()
      .then(data  => { if (!cancelled) { setStats(data); setLastRefresh(Date.now()) } })
      .catch(()   => { if (!cancelled) setStatsError(true) })
      .finally(() => { if (!cancelled) setStatsLoading(false) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchFeedback(pin)
      .then(data  => { if (!cancelled) setFeedback(data) })
      .catch(()   => { if (!cancelled) setFeedbackError(true) })
      .finally(() => { if (!cancelled) setFeedbackLoading(false) })
    return () => { cancelled = true }
  }, [pin])

  function handleRefresh() { loadStats(); loadFeedback() }

  const weekDelta = stats
    ? stats.lastWeek === 0 && stats.thisWeek === 0
      ? '—'
      : stats.lastWeek === 0
      ? 'new'
      : `${stats.thisWeek >= stats.lastWeek ? '+' : ''}${Math.round(((stats.thisWeek - stats.lastWeek) / stats.lastWeek) * 100)}%`
    : '—'

  // unreadCount uses lastRefresh (stable state number) rather than Date.now()
  // inline, avoiding the react-hooks/purity violation.
  const unreadCount = feedback.filter(f => {
    const age = lastRefresh - new Date(f.created_at).getTime()
    return age < 24 * 60 * 60 * 1000
  }).length

  const lastRefreshLabel = new Date(lastRefresh).toLocaleTimeString('en-NG', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { background: #020308; margin: 0; }

        @keyframes d-in   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes d-spin  { to{transform:rotate(360deg)} }
        @keyframes d-pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }

        .d-1 { animation: d-in 0.35s cubic-bezier(0.22,1,0.36,1)       both; }
        .d-2 { animation: d-in 0.35s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
        .d-3 { animation: d-in 0.35s cubic-bezier(0.22,1,0.36,1) 0.10s both; }
        .d-spin  { animation: d-spin  0.8s linear infinite; }
        .d-pulse { animation: d-pulse 2.4s ease-in-out infinite; }

        .dev-tab {
          flex: 1;
          height: 36px;
          border-radius: 10px;
          border: 1px solid transparent;
          background: transparent;
          color: #334155;
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 0.76rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.18s ease;
          position: relative;
        }
        .dev-tab.active {
          background: #0c0e16;
          border-color: rgba(255,255,255,0.10);
          color: #c8d0de;
        }
        .dev-tab:not(.active):hover { color: #475569; }

        .dev-scroll::-webkit-scrollbar { width: 3px; }
        .dev-scroll::-webkit-scrollbar-track { background: transparent; }
        .dev-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 99px; }
      `}</style>

      <main style={{
        minHeight:  '100dvh',
        background: '#020308',
        color:      '#ededed',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        maxWidth:   480,
        margin:     '0 auto',
        padding:    '0 0 80px',
      }}>

        {/* ── Header ── */}
        <div className="d-1" style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        '20px 18px 0',
          marginBottom:   20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="d-pulse">
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="9" stroke="#c8d0de" strokeWidth="1.4" strokeDasharray="22 6" strokeDashoffset="3"/>
                <line x1="16" y1="4" x2="16" y2="28" stroke="#c8d0de" strokeWidth="1.6" strokeLinecap="round"/>
                <circle cx="16" cy="16" r="2" fill="#c8d0de"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '0.56rem', color: '#1e2535', letterSpacing: '0.18em', marginBottom: 1 }}>
                room13 /
              </div>
              <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '0.88rem', fontWeight: 500, color: '#c8d0de', lineHeight: 1 }}>
                dev console
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#1e2535', fontSize: '0.56rem', fontFamily: "'Geist Mono', monospace" }}>
              {lastRefreshLabel}
            </span>
            <button
              onClick={handleRefresh}
              disabled={statsLoading || feedbackLoading}
              title="Refresh all"
              style={{
                background:     '#07080f',
                border:         '1px solid rgba(255,255,255,0.07)',
                borderRadius:   8,
                width:          32,
                height:         32,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                cursor:         statsLoading || feedbackLoading ? 'default' : 'pointer',
                color:          '#334155',
                fontSize:       '0.85rem',
                flexShrink:     0,
              }}
            >
              {statsLoading || feedbackLoading
                ? <div className="d-spin" style={{ width: 11, height: 11, borderRadius: '50%', border: '1.5px solid #1e2535', borderTopColor: '#475569' }}/>
                : '↻'
              }
            </button>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="d-2" style={{ display: 'flex', gap: 6, padding: '0 18px', marginBottom: 18 }}>
          <button className={`dev-tab${tab === 'overview' ? ' active' : ''}`} onClick={() => setTab('overview')}>
            Overview
          </button>
          <button className={`dev-tab${tab === 'feedback' ? ' active' : ''}`} onClick={() => setTab('feedback')}>
            Feedback
            {unreadCount > 0 && (
              <span style={{
                position:       'absolute',
                top:            6,
                right:          8,
                width:          16,
                height:         16,
                borderRadius:   '50%',
                background:     '#4ade80',
                color:          '#020308',
                fontSize:       '0.50rem',
                fontWeight:     700,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                lineHeight:     1,
              }}>
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* ── Overview tab ── */}
        {tab === 'overview' && (
          <div className="d-3" style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>

            {statsError && (
              <div style={{ padding: '12px 14px', borderRadius: 12, background: '#0e0202', border: '1px solid rgba(248,113,113,0.18)', color: '#f87171', fontSize: '0.76rem' }}>
                Failed to load stats.{' '}
                <button onClick={loadStats} style={{ background: 'none', border: 'none', color: '#f87171', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.76rem', padding: 0 }}>Retry</button>
              </div>
            )}

            {statsLoading && !stats && (
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
                <div className="d-spin" style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #1e2535', borderTopColor: '#4ade80' }}/>
              </div>
            )}

            {stats && (
              <>
                {/* Primary grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <StatCard label="Total rooms" value={fmt(stats.totalRooms)}      sub="all time"                        accent="#c8d0de"/>
                  <StatCard label="Conversion"  value={`${stats.conversionRate}%`} sub={`${stats.completeRooms} completed`} accent="#4ade80"/>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  <StatCard label="Today"    value={stats.activeToday}          accent="#60a5fa"/>
                  <StatCard label="Cards"    value={fmt(stats.totalCardsDrawn)} accent="#c084fc"/>
                  <StatCard label="Messages" value={fmt(stats.totalMessages)}   accent="#f87171"/>
                </div>

                {/* Week over week */}
                <div style={{ background: '#07080f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ color: '#334155', fontSize: '0.56rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12, fontFamily: "'DM Sans', system-ui" }}>
                    Week over week
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
                    <div>
                      <div style={{ color: '#1e2535', fontSize: '0.56rem', marginBottom: 2, fontFamily: "'DM Sans', system-ui" }}>this week</div>
                      <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '2.0rem', color: '#c8d0de', lineHeight: 1 }}>{stats.thisWeek}</div>
                    </div>
                    <div style={{ color: '#1e2535', fontSize: '0.75rem', paddingBottom: 4 }}>vs</div>
                    <div>
                      <div style={{ color: '#1e2535', fontSize: '0.56rem', marginBottom: 2, fontFamily: "'DM Sans', system-ui" }}>last week</div>
                      <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '1.4rem', color: '#334155', lineHeight: 1 }}>{stats.lastWeek}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', paddingBottom: 4 }}>
                      <span style={{
                        fontFamily:   "'DM Sans', system-ui",
                        fontSize:     '0.76rem',
                        fontWeight:   600,
                        color:        stats.thisWeek >= stats.lastWeek ? '#4ade80' : '#f87171',
                        background:   stats.thisWeek >= stats.lastWeek ? '#4ade8010' : '#f8717110',
                        border:       `1px solid ${stats.thisWeek >= stats.lastWeek ? '#4ade8030' : '#f8717130'}`,
                        borderRadius: 99,
                        padding:      '3px 10px',
                      }}>
                        {weekDelta}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 7-day trend */}
                <div style={{ background: '#07080f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ color: '#334155', fontSize: '0.56rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'DM Sans', system-ui" }}>
                      Last 7 days
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <div style={{ width: 7, height: 7, borderRadius: 1, background: '#4ade8016', border: '1px solid #4ade8030' }}/>
                        <span style={{ color: '#1e2535', fontSize: '0.52rem', fontFamily: "'DM Sans', system-ui" }}>started</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <div style={{ width: 7, height: 7, borderRadius: 1, background: '#4ade80', opacity: 0.65 }}/>
                        <span style={{ color: '#1e2535', fontSize: '0.52rem', fontFamily: "'DM Sans', system-ui" }}>completed</span>
                      </div>
                    </div>
                  </div>
                  <MiniTrend trend={stats.trend}/>
                </div>

                {/* Feedback teaser */}
                <div
                  onClick={() => setTab('feedback')}
                  style={{ background: '#07080f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.1rem' }}>💬</span>
                    <div>
                      <div style={{ color: '#c8d0de', fontSize: '0.80rem', fontWeight: 500, marginBottom: 2 }}>
                        {feedback.length} feedback message{feedback.length !== 1 ? 's' : ''}
                      </div>
                      <div style={{ color: '#1e2535', fontSize: '0.60rem', fontFamily: "'DM Sans', system-ui" }}>
                        {unreadCount > 0 ? `${unreadCount} in the last 24h` : 'tap to view all'}
                      </div>
                    </div>
                  </div>
                  {unreadCount > 0 && (
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#4ade80', color: '#020308', fontSize: '0.56rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {unreadCount}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Feedback tab ── */}
        {tab === 'feedback' && (
          <div className="d-3 dev-scroll" style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>

            {!feedbackLoading && feedback.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                {(['general','bug','idea','question'] as FeedbackType[]).map(type => {
                  const count = feedback.filter(f => f.type === type).length
                  if (!count) return null
                  const conf = TYPE_CONFIG[type]
                  return (
                    <span key={type} style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.60rem', fontWeight: 600, color: conf.color, background: `${conf.color}10`, border: `1px solid ${conf.color}22`, borderRadius: 99, padding: '2px 8px' }}>
                      {conf.emoji} {count} {type}
                    </span>
                  )
                })}
              </div>
            )}

            {feedbackError && (
              <div style={{ padding: '12px 14px', borderRadius: 12, background: '#0e0202', border: '1px solid rgba(248,113,113,0.18)', color: '#f87171', fontSize: '0.76rem' }}>
                Failed to load feedback.{' '}
                <button onClick={loadFeedback} style={{ background: 'none', border: 'none', color: '#f87171', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.76rem', padding: 0 }}>Retry</button>
              </div>
            )}

            {feedbackLoading && feedback.length === 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
                <div className="d-spin" style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #1e2535', borderTopColor: '#4ade80' }}/>
              </div>
            )}

            {!feedbackLoading && feedback.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 10 }}>
                <span style={{ fontSize: '1.8rem', opacity: 0.4 }}>💬</span>
                <span style={{ color: '#1e2535', fontSize: '0.76rem', fontFamily: "'DM Sans', system-ui" }}>No feedback yet</span>
              </div>
            )}

            {feedback.map(item => <FeedbackCard key={item.id} item={item}/>)}
          </div>
        )}
      </main>
    </>
  )
}

// ---------------------------------------------------------------------------
// Page — PIN gate wrapper
// ---------------------------------------------------------------------------

export default function DevPage() {
  const [pin, setPin] = useState<string | null>(null)

  // sessionStorage read is a side effect — belongs in useEffect.
  // setState called inside Promise.resolve().then() callback, not
  // synchronously in the effect body — satisfies set-state-in-effect rule.
  useEffect(() => {
    Promise.resolve()
      .then(() => {
        try {
          const stored = sessionStorage.getItem(PIN_SESSION_KEY)
          if (stored) setPin(stored)
        } catch { /* private browsing */ }
      })
  }, [])

  if (pin === null) return <PinGate onUnlock={setPin}/>
  return <Dashboard pin={pin}/>
}