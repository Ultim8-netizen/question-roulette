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
  read?:      boolean
}

type TrendDay = { date: string; total: number; complete: number }

type DepthBuckets = { '0': number; '1': number; '2-5': number; '6-10': number; '11+': number }

type Stats = {
  totalRooms:              number
  completeRooms:           number
  totalMessages:           number
  totalCardsDrawn:         number
  activeToday:             number
  thisWeek:                number
  lastWeek:                number
  conversionRate:          number
  trend:                   TrendDay[]
  avgCardsPerSession:      number
  avgMessagesPerCard:      number
  depthBuckets:            DepthBuckets
  peakHour:                number
  customQuestionsAccepted: number
}

type RoomRow = {
  id:           string
  player1Name:  string
  player2Name:  string | null
  cardsDrawn:   number
  messageCount: number
  createdAt:    string
  expiresAt:    string
  currentTurn:  number
  isComplete:   boolean
  isExpired:    boolean
}

type Tab = 'overview' | 'feedback' | 'rooms'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PIN_SESSION_KEY  = 'dev-pin'
const READ_KEY         = 'dev-feedback-read'

const TYPE_CONFIG: Record<FeedbackType, { emoji: string; color: string }> = {
  general:  { emoji: '💬', color: '#94a3b8' },
  bug:      { emoji: '🐛', color: '#f87171' },
  idea:     { emoji: '💡', color: '#fbbf24' },
  question: { emoji: '🙋', color: '#60a5fa' },
}

// ---------------------------------------------------------------------------
// Module-level helpers
// ---------------------------------------------------------------------------

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

async function fetchRooms(pin: string): Promise<RoomRow[]> {
  const r = await fetch('/api/dev/rooms', { headers: { 'x-dev-pin': pin } })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  const data = await r.json()
  return (data.rooms ?? []) as RoomRow[]
}

function loadReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch { return new Set() }
}

function saveReadIds(ids: Set<string>): void {
  try { localStorage.setItem(READ_KEY, JSON.stringify(Array.from(ids))) } catch {}
}

const MODULE_LOAD_TIME = Date.now()

function timeAgo(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  <  1) return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function fullDate(iso: string): string {
  return new Date(iso).toLocaleString('en-NG', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

function fmt(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

function hourLabel(h: number): string {
  const ampm = h < 12 ? 'AM' : 'PM'
  const h12  = h % 12 === 0 ? 12 : h % 12
  return `${h12}${ampm}`
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
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      if (res.ok) {
        try { sessionStorage.setItem(PIN_SESSION_KEY, pin) } catch {}
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
      <div style={{ minHeight:'100dvh', background:'#020308', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 24px', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
        <div className="pg-root" style={{ width:'100%', maxWidth:320 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:32, justifyContent:'center' }}>
            <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="9" stroke="#c8d0de" strokeWidth="1.4" strokeDasharray="22 6" strokeDashoffset="3"/>
              <line x1="16" y1="4" x2="16" y2="28" stroke="#c8d0de" strokeWidth="1.6" strokeLinecap="round"/>
              <circle cx="16" cy="16" r="2" fill="#c8d0de"/>
            </svg>
            <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:'0.70rem', color:'#475569', letterSpacing:'0.18em' }}>dev console</span>
          </div>
          <div style={{ background:'#07080f', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:'28px 22px' }}>
            <div style={{ fontFamily:"'Geist Mono',monospace", color:'#475569', fontSize:'0.60rem', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:6 }}>Access required</div>
            <div style={{ color:'#c8d0de', fontSize:'1.0rem', fontWeight:500, marginBottom:22, lineHeight:1.3 }}>Enter your PIN to continue</div>
            <input
              type="password" inputMode="numeric" value={pin} autoFocus
              onChange={e => { setPin(e.target.value); setError(false) }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="••••••"
              style={{ width:'100%', height:50, borderRadius:12, background:'#06070d', border:`1px solid ${error?'rgba(248,113,113,0.40)':'rgba(255,255,255,0.07)'}`, color:'#ededed', fontSize:'1.1rem', padding:'0 16px', outline:'none', fontFamily:"'DM Sans',system-ui,sans-serif", letterSpacing:'0.18em', boxSizing:'border-box', marginBottom:error?8:16, transition:'border-color 0.2s ease' }}
            />
            {error && <div style={{ color:'#f87171', fontSize:'0.72rem', marginBottom:12 }}>Incorrect PIN.</div>}
            <button onClick={handleSubmit} disabled={!pin.trim()||loading}
              style={{ width:'100%', height:48, borderRadius:12, background:pin.trim()?'#0c0e16':'#06070d', border:`1px solid ${pin.trim()?'rgba(255,255,255,0.11)':'rgba(255,255,255,0.05)'}`, color:pin.trim()?'#c8d0de':'#1e2535', fontSize:'0.82rem', fontWeight:500, cursor:pin.trim()&&!loading?'pointer':'default', fontFamily:"'DM Sans',system-ui,sans-serif", transition:'all 0.2s ease' }}>
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

function StatCard({ label, value, sub, accent='#c8d0de' }: {
  label: string; value: string|number; sub?: string; accent?: string
}) {
  return (
    <div style={{ background:'#07080f', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:'14px 14px 12px', display:'flex', flexDirection:'column', gap:3 }}>
      <span style={{ color:'#334155', fontSize:'0.56rem', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', fontFamily:"'DM Sans',system-ui" }}>{label}</span>
      <span style={{ color:accent, fontSize:'1.7rem', fontWeight:500, fontFamily:"'Geist Mono',monospace", lineHeight:1.05 }}>{value}</span>
      {sub && <span style={{ color:'#1e2535', fontSize:'0.60rem', fontFamily:"'DM Sans',system-ui", lineHeight:1.4 }}>{sub}</span>}
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
    <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:40 }}>
      {last7.map((day, i) => {
        const pct = (day.total / maxVal) * 100
        return (
          <div key={i} title={`${day.date.slice(5)}: ${day.total} sessions`}
            style={{ flex:1, height:`max(${pct}%,${day.total>0?3:0}px)`, background:'#4ade8022', borderRadius:'2px 2px 0 0', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', bottom:0, left:0, right:0, height:day.total>0?`${(day.complete/day.total)*100}%`:'0%', background:'#4ade80', opacity:0.70, borderRadius:'2px 2px 0 0' }}/>
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Depth bar chart
// ---------------------------------------------------------------------------

function DepthChart({ buckets }: { buckets: DepthBuckets }) {
  const labels  = ['0', '1', '2-5', '6-10', '11+'] as const
  const colors  = ['#334155', '#60a5fa', '#4ade80', '#c084fc', '#f87171']
  const maxVal  = Math.max(...labels.map(l => buckets[l]), 1)

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      {labels.map((label, i) => {
        const val = buckets[label]
        const pct = Math.round((val / maxVal) * 100)
        return (
          <div key={label} style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontFamily:"'Geist Mono',monospace", color:'#334155', fontSize:'0.58rem', width:32, flexShrink:0, textAlign:'right' }}>{label}</span>
            <div style={{ flex:1, height:14, background:'rgba(255,255,255,0.04)', borderRadius:3, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${pct}%`, background:colors[i], borderRadius:3, opacity:0.80, transition:'width 0.4s ease' }}/>
            </div>
            <span style={{ fontFamily:"'Geist Mono',monospace", color:colors[i], fontSize:'0.62rem', width:20, flexShrink:0 }}>{val}</span>
          </div>
        )
      })}
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:2 }}>
        <span style={{ color:'#1e2535', fontSize:'0.52rem', fontFamily:"'DM Sans',system-ui" }}>cards drawn per session</span>
        <span style={{ color:'#1e2535', fontSize:'0.52rem', fontFamily:"'DM Sans',system-ui" }}>completed sessions only</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Feedback card
// ---------------------------------------------------------------------------

function FeedbackCard({ item, isRead, onMarkRead }: {
  item: FeedbackRow; isRead: boolean; onMarkRead: (id: string) => void
}) {
  const [expanded,   setExpanded]   = useState(false)
  const [copiedContact, setCopiedContact] = useState(false)
  const conf   = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.general
  const isLong = item.message.length > 140

  function handleCopyContact() {
    if (!item.contact) return
    navigator.clipboard.writeText(item.contact).then(() => {
      setCopiedContact(true)
      setTimeout(() => setCopiedContact(false), 2000)
    }).catch(() => {})
  }

  return (
    <div style={{ background:'#07080f', border:`1px solid ${isRead?'rgba(255,255,255,0.04)':'rgba(255,255,255,0.10)'}`, borderRadius:14, padding:'14px 16px', display:'flex', flexDirection:'column', gap:8, opacity:isRead?0.65:1, transition:'opacity 0.2s ease,border-color 0.2s ease' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:'0.88rem' }}>{conf.emoji}</span>
        <span style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.60rem', fontWeight:700, color:conf.color, letterSpacing:'0.12em', textTransform:'uppercase', background:`${conf.color}14`, border:`1px solid ${conf.color}30`, borderRadius:99, padding:'2px 8px' }}>
          {item.type}
        </span>
        {!isRead && (
          <div style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80', boxShadow:'0 0 6px #4ade80', flexShrink:0 }}/>
        )}
        <div style={{ marginLeft:'auto', display:'flex', flexDirection:'column', alignItems:'flex-end', gap:1 }}>
          <span style={{ color:'#475569', fontSize:'0.58rem', fontFamily:"'DM Sans',system-ui" }}>{timeAgo(item.created_at)}</span>
          <span style={{ color:'#1e2535', fontSize:'0.54rem', fontFamily:"'Geist Mono',monospace" }}>{fullDate(item.created_at)}</span>
        </div>
      </div>

      {/* Message */}
      <div
        onClick={() => isLong && setExpanded(p => !p)}
        style={{ color:'#94a3b8', fontSize:'0.82rem', lineHeight:1.6, fontFamily:"'DM Sans',system-ui", cursor:isLong?'pointer':'default', display:!expanded&&isLong?'-webkit-box':'block', WebkitLineClamp:!expanded&&isLong?3:undefined, WebkitBoxOrient:!expanded&&isLong?'vertical':undefined, overflow:!expanded&&isLong?'hidden':'visible' } as React.CSSProperties}
      >
        {item.message}
      </div>

      {isLong && (
        <button onClick={() => setExpanded(p=>!p)} style={{ background:'none', border:'none', color:'#334155', fontSize:'0.62rem', cursor:'pointer', textAlign:'left', padding:0, fontFamily:"'DM Sans',system-ui" }}>
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}

      {/* Contact + URL */}
      {(item.contact || item.page_url) && (
        <div style={{ display:'flex', flexDirection:'column', gap:4, paddingTop:6, borderTop:'1px solid rgba(255,255,255,0.05)' }}>
          {item.contact && (
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ color:'#1e2535', fontSize:'0.58rem', fontFamily:"'DM Sans',system-ui", flexShrink:0 }}>contact</span>
              <span style={{ color:'#475569', fontSize:'0.72rem', fontFamily:"'Geist Mono',monospace", flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.contact}</span>
              <button
                onClick={handleCopyContact}
                style={{ background:'none', border:'1px solid rgba(255,255,255,0.07)', borderRadius:6, padding:'2px 8px', color:copiedContact?'#4ade80':'#334155', fontSize:'0.56rem', cursor:'pointer', fontFamily:"'DM Sans',system-ui", flexShrink:0, transition:'color 0.2s ease,border-color 0.2s ease' }}
              >
                {copiedContact ? '✓ copied' : 'copy'}
              </button>
            </div>
          )}
          {item.page_url && (
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ color:'#1e2535', fontSize:'0.58rem', fontFamily:"'DM Sans',system-ui", flexShrink:0 }}>page</span>
              <span style={{ color:'#334155', fontSize:'0.62rem', fontFamily:"'Geist Mono',monospace", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {item.page_url.replace(/^https?:\/\/[^/]+/, '')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Mark as read */}
      {!isRead && (
        <button
          onClick={() => onMarkRead(item.id)}
          style={{ alignSelf:'flex-end', background:'none', border:'1px solid rgba(255,255,255,0.06)', borderRadius:7, padding:'3px 10px', color:'#334155', fontSize:'0.58rem', cursor:'pointer', fontFamily:"'DM Sans',system-ui", transition:'border-color 0.15s ease,color 0.15s ease' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color='#475569'; (e.currentTarget as HTMLButtonElement).style.borderColor='rgba(255,255,255,0.12)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color='#334155'; (e.currentTarget as HTMLButtonElement).style.borderColor='rgba(255,255,255,0.06)' }}
        >
          Mark as read
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Room row
// ---------------------------------------------------------------------------

function RoomCard({ room }: { room: RoomRow }) {
  const age      = timeAgo(room.createdAt)
  const expired  = room.isExpired
  const complete = room.isComplete

  return (
    <div style={{ background:'#07080f', border:`1px solid ${expired?'rgba(255,255,255,0.03)':complete?'rgba(74,222,128,0.10)':'rgba(255,255,255,0.06)'}`, borderRadius:14, padding:'12px 14px', display:'flex', flexDirection:'column', gap:6, opacity:expired?0.45:1 }}>

      {/* Players row */}
      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
        <span style={{ fontFamily:"'DM Sans',system-ui", color:'#c8d0de', fontSize:'0.80rem', fontWeight:500 }}>{room.player1Name}</span>
        {complete && (
          <>
            <span style={{ color:'#334155', fontSize:'0.62rem' }}>×</span>
            <span style={{ fontFamily:"'DM Sans',system-ui", color:'#94a3b8', fontSize:'0.80rem' }}>{room.player2Name}</span>
          </>
        )}
        {!complete && (
          <span style={{ fontFamily:"'DM Sans',system-ui", color:'#1e2535', fontSize:'0.72rem', fontStyle:'italic' }}>waiting for guest</span>
        )}
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:5 }}>
          {expired
            ? <span style={{ fontFamily:"'DM Sans',system-ui", color:'#1e2535', fontSize:'0.58rem' }}>expired</span>
            : complete
            ? <div style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80', boxShadow:'0 0 5px #4ade80' }}/>
            : <div style={{ width:6, height:6, borderRadius:'50%', background:'#fbbf24', boxShadow:'0 0 5px #fbbf24' }}/>
          }
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
            <rect x="2" y="3" width="7" height="9" rx="1.2" stroke="#334155" strokeWidth="1.1"/>
            <rect x="5" y="1" width="7" height="9" rx="1.2" stroke="#334155" strokeWidth="1.1"/>
          </svg>
          <span style={{ fontFamily:"'Geist Mono',monospace", color:'#475569', fontSize:'0.66rem' }}>{room.cardsDrawn} cards</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
            <path d="M7 1.5C4 1.5 1.5 3.5 1.5 6c0 .9.3 1.8.8 2.5L1.5 12.5l3.2-1A5.7 5.7 0 0 0 7 12c3 0 5.5-2 5.5-4.5S10 1.5 7 1.5z" stroke="#334155" strokeWidth="1.1" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontFamily:"'Geist Mono',monospace", color:'#475569', fontSize:'0.66rem' }}>{room.messageCount} msgs</span>
        </div>
        <span style={{ marginLeft:'auto', color:'#1e2535', fontSize:'0.58rem', fontFamily:"'DM Sans',system-ui" }}>{age}</span>
      </div>

      {/* Full date */}
      <span style={{ color:'#1e2535', fontSize:'0.54rem', fontFamily:"'Geist Mono',monospace" }}>
        {fullDate(room.createdAt)}
      </span>
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
  const [rooms,    setRooms]    = useState<RoomRow[]>([])
  const [readIds,  setReadIds]  = useState<Set<string>>(new Set())

  const [statsLoading,    setStatsLoading]    = useState(true)
  const [feedbackLoading, setFeedbackLoading] = useState(true)
  const [roomsLoading,    setRoomsLoading]    = useState(true)
  const [statsError,    setStatsError]    = useState(false)
  const [feedbackError, setFeedbackError] = useState(false)
  const [roomsError,    setRoomsError]    = useState(false)
  const [lastRefresh,   setLastRefresh]   = useState(MODULE_LOAD_TIME)

  // Load persisted read IDs once on mount
  useEffect(() => {
    Promise.resolve().then(() => {
      setReadIds(loadReadIds())
    })
  }, [])

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

  const loadRooms = useCallback(() => {
    setRoomsLoading(true)
    setRoomsError(false)
    fetchRooms(pin)
      .then(data => setRooms(data))
      .catch(() => setRoomsError(true))
      .finally(() => setRoomsLoading(false))
  }, [pin])

  // Initial loads
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

  useEffect(() => {
    let cancelled = false
    fetchRooms(pin)
      .then(data  => { if (!cancelled) setRooms(data) })
      .catch(()   => { if (!cancelled) setRoomsError(true) })
      .finally(() => { if (!cancelled) setRoomsLoading(false) })
    return () => { cancelled = true }
  }, [pin])

  function handleRefresh() { loadStats(); loadFeedback(); loadRooms() }

  function handleMarkRead(id: string) {
    setReadIds(prev => {
      const next = new Set(prev)
      next.add(id)
      saveReadIds(next)
      return next
    })
  }

  function handleMarkAllRead() {
    setReadIds(prev => {
      const next = new Set(prev)
      feedback.forEach(f => next.add(f.id))
      saveReadIds(next)
      return next
    })
  }

  const unreadCount = feedback.filter(f => !readIds.has(f.id)).length

  const weekDelta = stats
    ? stats.lastWeek === 0 && stats.thisWeek === 0 ? '—'
    : stats.lastWeek === 0 ? 'new'
    : `${stats.thisWeek >= stats.lastWeek ? '+' : ''}${Math.round(((stats.thisWeek - stats.lastWeek) / stats.lastWeek) * 100)}%`
    : '—'

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
          flex: 1; height: 36px; border-radius: 10px;
          border: 1px solid transparent; background: transparent;
          color: #334155; font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 0.76rem; font-weight: 500; cursor: pointer;
          transition: all 0.18s ease; position: relative;
        }
        .dev-tab.active { background: #0c0e16; border-color: rgba(255,255,255,0.10); color: #c8d0de; }
        .dev-tab:not(.active):hover { color: #475569; }

        .dev-scroll::-webkit-scrollbar { width: 3px; }
        .dev-scroll::-webkit-scrollbar-track { background: transparent; }
        .dev-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 99px; }
      `}</style>

      <main style={{ minHeight:'100dvh', background:'#020308', color:'#ededed', fontFamily:"'DM Sans',system-ui,sans-serif", maxWidth:480, margin:'0 auto', padding:'0 0 80px' }}>

        {/* ── Header ── */}
        <div className="d-1" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 18px 0', marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div className="d-pulse">
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="9" stroke="#c8d0de" strokeWidth="1.4" strokeDasharray="22 6" strokeDashoffset="3"/>
                <line x1="16" y1="4" x2="16" y2="28" stroke="#c8d0de" strokeWidth="1.6" strokeLinecap="round"/>
                <circle cx="16" cy="16" r="2" fill="#c8d0de"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:'0.56rem', color:'#1e2535', letterSpacing:'0.18em', marginBottom:1 }}>room13 /</div>
              <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:'0.88rem', fontWeight:500, color:'#c8d0de', lineHeight:1 }}>dev console</div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ color:'#1e2535', fontSize:'0.56rem', fontFamily:"'Geist Mono',monospace" }}>{lastRefreshLabel}</span>
            <button onClick={handleRefresh} disabled={statsLoading||feedbackLoading||roomsLoading} title="Refresh all"
              style={{ background:'#07080f', border:'1px solid rgba(255,255,255,0.07)', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:statsLoading||feedbackLoading||roomsLoading?'default':'pointer', color:'#334155', fontSize:'0.85rem', flexShrink:0 }}>
              {statsLoading||feedbackLoading||roomsLoading
                ? <div className="d-spin" style={{ width:11, height:11, borderRadius:'50%', border:'1.5px solid #1e2535', borderTopColor:'#475569' }}/>
                : '↻'
              }
            </button>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="d-2" style={{ display:'flex', gap:6, padding:'0 18px', marginBottom:18 }}>
          {(['overview','feedback','rooms'] as Tab[]).map(t => (
            <button key={t} className={`dev-tab${tab===t?' active':''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'feedback' && unreadCount > 0 && (
                <span style={{ position:'absolute', top:6, right:8, width:16, height:16, borderRadius:'50%', background:'#4ade80', color:'#020308', fontSize:'0.50rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1 }}>
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Overview tab ── */}
        {tab === 'overview' && (
          <div className="d-3" style={{ padding:'0 18px', display:'flex', flexDirection:'column', gap:10 }}>

            {statsError && (
              <div style={{ padding:'12px 14px', borderRadius:12, background:'#0e0202', border:'1px solid rgba(248,113,113,0.18)', color:'#f87171', fontSize:'0.76rem' }}>
                Failed to load stats.{' '}
                <button onClick={loadStats} style={{ background:'none', border:'none', color:'#f87171', textDecoration:'underline', cursor:'pointer', fontSize:'0.76rem', padding:0 }}>Retry</button>
              </div>
            )}

            {statsLoading && !stats && (
              <div style={{ display:'flex', justifyContent:'center', paddingTop:40 }}>
                <div className="d-spin" style={{ width:24, height:24, borderRadius:'50%', border:'2px solid #1e2535', borderTopColor:'#4ade80' }}/>
              </div>
            )}

            {stats && (
              <>
                {/* Primary */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  <StatCard label="Total rooms"  value={fmt(stats.totalRooms)}      sub="all time"                         accent="#c8d0de"/>
                  <StatCard label="Conversion"   value={`${stats.conversionRate}%`} sub={`${stats.completeRooms} completed`} accent="#4ade80"/>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                  <StatCard label="Today"    value={stats.activeToday}          accent="#60a5fa"/>
                  <StatCard label="Cards"    value={fmt(stats.totalCardsDrawn)} accent="#c084fc"/>
                  <StatCard label="Messages" value={fmt(stats.totalMessages)}   accent="#f87171"/>
                </div>

                {/* Engagement */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  <StatCard label="Avg cards / session" value={stats.avgCardsPerSession}  sub="completed sessions" accent="#4ade80"/>
                  <StatCard label="Avg msgs / card"     value={stats.avgMessagesPerCard}  sub="across all threads" accent="#60a5fa"/>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  <StatCard label="Peak hour"       value={hourLabel(stats.peakHour)}          sub="most sessions created"    accent="#fbbf24"/>
                  <StatCard label="Custom Qs added" value={stats.customQuestionsAccepted}       sub="accepted into pools"      accent="#c084fc"/>
                </div>

                {/* Session depth */}
                <div style={{ background:'#07080f', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:'14px 16px' }}>
                  <div style={{ color:'#334155', fontSize:'0.56rem', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:14, fontFamily:"'DM Sans',system-ui" }}>
                    Session depth
                  </div>
                  <DepthChart buckets={stats.depthBuckets}/>
                </div>

                {/* Week over week */}
                <div style={{ background:'#07080f', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:'14px 16px' }}>
                  <div style={{ color:'#334155', fontSize:'0.56rem', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:12, fontFamily:"'DM Sans',system-ui" }}>
                    Week over week
                  </div>
                  <div style={{ display:'flex', alignItems:'flex-end', gap:12 }}>
                    <div>
                      <div style={{ color:'#1e2535', fontSize:'0.56rem', marginBottom:2, fontFamily:"'DM Sans',system-ui" }}>this week</div>
                      <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:'2.0rem', color:'#c8d0de', lineHeight:1 }}>{stats.thisWeek}</div>
                    </div>
                    <div style={{ color:'#1e2535', fontSize:'0.75rem', paddingBottom:4 }}>vs</div>
                    <div>
                      <div style={{ color:'#1e2535', fontSize:'0.56rem', marginBottom:2, fontFamily:"'DM Sans',system-ui" }}>last week</div>
                      <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:'1.4rem', color:'#334155', lineHeight:1 }}>{stats.lastWeek}</div>
                    </div>
                    <div style={{ marginLeft:'auto', paddingBottom:4 }}>
                      <span style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.76rem', fontWeight:600, color:stats.thisWeek>=stats.lastWeek?'#4ade80':'#f87171', background:stats.thisWeek>=stats.lastWeek?'#4ade8010':'#f8717110', border:`1px solid ${stats.thisWeek>=stats.lastWeek?'#4ade8030':'#f8717130'}`, borderRadius:99, padding:'3px 10px' }}>
                        {weekDelta}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 7-day trend */}
                <div style={{ background:'#07080f', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:'14px 16px' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                    <span style={{ color:'#334155', fontSize:'0.56rem', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', fontFamily:"'DM Sans',system-ui" }}>Last 7 days</span>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:3 }}>
                        <div style={{ width:7, height:7, borderRadius:1, background:'#4ade8016', border:'1px solid #4ade8030' }}/>
                        <span style={{ color:'#1e2535', fontSize:'0.52rem', fontFamily:"'DM Sans',system-ui" }}>started</span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:3 }}>
                        <div style={{ width:7, height:7, borderRadius:1, background:'#4ade80', opacity:0.65 }}/>
                        <span style={{ color:'#1e2535', fontSize:'0.52rem', fontFamily:"'DM Sans',system-ui" }}>completed</span>
                      </div>
                    </div>
                  </div>
                  <MiniTrend trend={stats.trend}/>
                </div>

                {/* Feedback teaser */}
                <div onClick={() => setTab('feedback')}
                  style={{ background:'#07080f', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:'14px 16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:'1.1rem' }}>💬</span>
                    <div>
                      <div style={{ color:'#c8d0de', fontSize:'0.80rem', fontWeight:500, marginBottom:2 }}>
                        {feedback.length} feedback message{feedback.length!==1?'s':''}
                      </div>
                      <div style={{ color:'#1e2535', fontSize:'0.60rem', fontFamily:"'DM Sans',system-ui" }}>
                        {unreadCount > 0 ? `${unreadCount} unread` : 'tap to view all'}
                      </div>
                    </div>
                  </div>
                  {unreadCount > 0 && (
                    <span style={{ width:20, height:20, borderRadius:'50%', background:'#4ade80', color:'#020308', fontSize:'0.56rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>
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
          <div className="d-3 dev-scroll" style={{ padding:'0 18px', display:'flex', flexDirection:'column', gap:10, overflowY:'auto' }}>

            {/* Toolbar */}
            {!feedbackLoading && feedback.length > 0 && (
              <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                {(['general','bug','idea','question'] as FeedbackType[]).map(type => {
                  const count = feedback.filter(f => f.type===type).length
                  if (!count) return null
                  const conf = TYPE_CONFIG[type]
                  return (
                    <span key={type} style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.60rem', fontWeight:600, color:conf.color, background:`${conf.color}10`, border:`1px solid ${conf.color}22`, borderRadius:99, padding:'2px 8px' }}>
                      {conf.emoji} {count} {type}
                    </span>
                  )
                })}
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead}
                    style={{ marginLeft:'auto', background:'none', border:'1px solid rgba(255,255,255,0.07)', borderRadius:8, padding:'3px 10px', color:'#334155', fontSize:'0.60rem', cursor:'pointer', fontFamily:"'DM Sans',system-ui" }}>
                    Mark all read
                  </button>
                )}
              </div>
            )}

            {feedbackError && (
              <div style={{ padding:'12px 14px', borderRadius:12, background:'#0e0202', border:'1px solid rgba(248,113,113,0.18)', color:'#f87171', fontSize:'0.76rem' }}>
                Failed to load feedback.{' '}
                <button onClick={loadFeedback} style={{ background:'none', border:'none', color:'#f87171', textDecoration:'underline', cursor:'pointer', fontSize:'0.76rem', padding:0 }}>Retry</button>
              </div>
            )}

            {feedbackLoading && feedback.length===0 && (
              <div style={{ display:'flex', justifyContent:'center', paddingTop:40 }}>
                <div className="d-spin" style={{ width:24, height:24, borderRadius:'50%', border:'2px solid #1e2535', borderTopColor:'#4ade80' }}/>
              </div>
            )}

            {!feedbackLoading && feedback.length===0 && (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', paddingTop:60, gap:10 }}>
                <span style={{ fontSize:'1.8rem', opacity:0.4 }}>💬</span>
                <span style={{ color:'#1e2535', fontSize:'0.76rem', fontFamily:"'DM Sans',system-ui" }}>No feedback yet</span>
              </div>
            )}

            {feedback.map(item => (
              <FeedbackCard key={item.id} item={item} isRead={readIds.has(item.id)} onMarkRead={handleMarkRead}/>
            ))}
          </div>
        )}

        {/* ── Rooms tab ── */}
        {tab === 'rooms' && (
          <div className="d-3 dev-scroll" style={{ padding:'0 18px', display:'flex', flexDirection:'column', gap:10, overflowY:'auto' }}>

            {/* Summary row */}
            {!roomsLoading && rooms.length > 0 && (
              <div style={{ display:'flex', gap:8, marginBottom:4 }}>
                <span style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.60rem', fontWeight:600, color:'#4ade80', background:'rgba(74,222,128,0.08)', border:'1px solid rgba(74,222,128,0.18)', borderRadius:99, padding:'2px 8px' }}>
                  {rooms.filter(r=>r.isComplete&&!r.isExpired).length} active
                </span>
                <span style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.60rem', fontWeight:600, color:'#fbbf24', background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.18)', borderRadius:99, padding:'2px 8px' }}>
                  {rooms.filter(r=>!r.isComplete&&!r.isExpired).length} waiting
                </span>
                <span style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.60rem', fontWeight:600, color:'#334155', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:99, padding:'2px 8px' }}>
                  {rooms.filter(r=>r.isExpired).length} expired
                </span>
              </div>
            )}

            {roomsError && (
              <div style={{ padding:'12px 14px', borderRadius:12, background:'#0e0202', border:'1px solid rgba(248,113,113,0.18)', color:'#f87171', fontSize:'0.76rem' }}>
                Failed to load rooms.{' '}
                <button onClick={loadRooms} style={{ background:'none', border:'none', color:'#f87171', textDecoration:'underline', cursor:'pointer', fontSize:'0.76rem', padding:0 }}>Retry</button>
              </div>
            )}

            {roomsLoading && rooms.length===0 && (
              <div style={{ display:'flex', justifyContent:'center', paddingTop:40 }}>
                <div className="d-spin" style={{ width:24, height:24, borderRadius:'50%', border:'2px solid #1e2535', borderTopColor:'#4ade80' }}/>
              </div>
            )}

            {!roomsLoading && rooms.length===0 && (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', paddingTop:60, gap:10 }}>
                <span style={{ fontSize:'1.8rem', opacity:0.4 }}>🚪</span>
                <span style={{ color:'#1e2535', fontSize:'0.76rem', fontFamily:"'DM Sans',system-ui" }}>No rooms yet</span>
              </div>
            )}

            {rooms.map(room => <RoomCard key={room.id} room={room}/>)}

            {rooms.length > 0 && (
              <div style={{ textAlign:'center', color:'#1e2535', fontSize:'0.58rem', fontFamily:"'DM Sans',system-ui", paddingTop:4 }}>
                Showing last 20 rooms
              </div>
            )}
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

  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        const stored = sessionStorage.getItem(PIN_SESSION_KEY)
        if (stored) setPin(stored)
      } catch { /* private browsing */ }
    })
  }, [])

  if (pin === null) return <PinGate onUnlock={setPin}/>
  return <Dashboard pin={pin}/>
}