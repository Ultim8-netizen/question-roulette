'use client'

import { useState } from 'react'
import type { QuestionTier, PlayerSlot, Message } from '@/lib/supabase'
import { getTierConfig } from '@/lib/tierConfig'
import { useTheme } from '@/context/ThemeContext'
import { MessageThread } from '@/components/MessageThread'

function makeWatermarkBg(name: string): string {
  const text = `${name} · abyssprotocol`
  const svg = [`<svg xmlns="http://www.w3.org/2000/svg" width="240" height="90">`,`<text x="120" y="45" font-family="monospace" font-size="9" fill="rgba(128,128,128,0.07)" text-anchor="middle" dominant-baseline="middle" transform="rotate(-22 120 45)">${text}</text>`,`</svg>`].join('')
  try { return `url("data:image/svg+xml;base64,${btoa(svg)}")` } catch { return 'none' }
}

function BotanicaPattern({ color }: { color: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><pattern id="p-botanica" x="0" y="0" width="52" height="52" patternUnits="userSpaceOnUse">
        {[0,60,120,180,240,300].map(deg=><ellipse key={deg} cx="26" cy="26" rx="7.5" ry="17" fill="none" stroke={color} strokeWidth="0.65" opacity="0.26" transform={`rotate(${deg} 26 26)`}/>)}
        <circle cx="26" cy="26" r="1.8" fill={color} opacity="0.32"/>
        <circle cx="26" cy="26" r="20" fill="none" stroke={color} strokeWidth="0.4" opacity="0.12"/>
        {[0,52].flatMap(x=>[0,52].map(y=><circle key={`${x}-${y}`} cx={x} cy={y} r="1.2" fill={color} opacity="0.14"/>))}
      </pattern></defs>
      <rect width="100%" height="100%" fill="url(#p-botanica)"/>
    </svg>
  )
}
function TidalPattern({ color }: { color: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><pattern id="p-tidal" x="0" y="0" width="70" height="70" patternUnits="userSpaceOnUse">
        {[10,20,30,40,50,60,70].map(r=><circle key={`a${r}`} cx="0" cy="0" r={r} fill="none" stroke={color} strokeWidth="0.55" opacity="0.20"/>)}
        {[8,18,28,38,48,58].map(r=><circle key={`b${r}`} cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="0.55" opacity="0.20"/>)}
      </pattern></defs>
      <rect width="100%" height="100%" fill="url(#p-tidal)"/>
    </svg>
  )
}
function SeismicPattern({ color }: { color: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><pattern id="p-seismic" x="0" y="0" width="90" height="90" patternUnits="userSpaceOnUse">
        <path d="M0 38 L16 24 L38 42 L54 18 L90 32" fill="none" stroke={color} strokeWidth="0.85" opacity="0.30" strokeLinejoin="round"/>
        <path d="M0 72 L24 58 L45 78 L66 52 L90 68" fill="none" stroke={color} strokeWidth="0.85" opacity="0.26" strokeLinejoin="round"/>
        {[[16,24],[38,42],[54,18],[24,58],[66,52]].map(([cx,cy])=><circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.5" fill={color} opacity="0.28"/>)}
      </pattern></defs>
      <rect width="100%" height="100%" fill="url(#p-seismic)"/>
    </svg>
  )
}
function VoltagePattern({ color }: { color: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><pattern id="p-voltage" x="0" y="0" width="44" height="22" patternUnits="userSpaceOnUse">
        <polyline points="0,11 11,2 22,11 33,2 44,11" fill="none" stroke={color} strokeWidth="0.9" opacity="0.30" strokeLinejoin="bevel"/>
        <polyline points="0,19 11,10 22,19 33,10 44,19" fill="none" stroke={color} strokeWidth="0.5" opacity="0.16" strokeLinejoin="bevel"/>
        {[[11,2],[33,2],[22,11]].map(([cx,cy])=><circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.2" fill={color} opacity="0.26"/>)}
      </pattern></defs>
      <rect width="100%" height="100%" fill="url(#p-voltage)"/>
    </svg>
  )
}

const PATTERNS: Record<QuestionTier, React.FC<{color:string}>> = {
  light:BotanicaPattern, medium:TidalPattern, deep:SeismicPattern, spicy:VoltagePattern,
}

function TierSymbol({ tier, color, size }: { tier:QuestionTier; color:string; size:number }) {
  if (tier==='light') return <svg width={size} height={size} viewBox="0 0 24 24" fill="none">{[0,60,120].map(r=><ellipse key={r} cx="12" cy="12" rx="4" ry="9" fill={color} opacity={r===0?0.75:0.60} transform={`rotate(${r} 12 12)`}/>)}<circle cx="12" cy="12" r="2.5" fill={color} opacity="0.95"/></svg>
  if (tier==='medium') return <svg width={size} height={size} viewBox="0 0 24 24" fill="none">{[10,7,4].map((r,i)=><circle key={r} cx="12" cy="12" r={r} stroke={color} strokeWidth="1.2" opacity={0.5+i*0.15} fill="none"/>)}<circle cx="12" cy="12" r="1.8" fill={color} opacity="0.95"/></svg>
  if (tier==='deep') return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 3 L21 20 H3 Z" stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.18" strokeLinejoin="round" opacity="0.85"/><path d="M12 8 L17 18 H7 Z" fill={color} opacity="0.55"/><circle cx="12" cy="8" r="1.5" fill={color} opacity="0.95"/></svg>
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M14 2 L5 13 H11 L10 22 L19 11 H13 Z" fill={color} opacity="0.80" stroke={color} strokeWidth="0.5" strokeLinejoin="round"/></svg>
}

type PickModalProps = {
  questionText:     string
  tier:             QuestionTier
  isCustom:         boolean
  drawnByName:      string
  isMyDraw:         boolean
  onClose:          () => void
  questionIndex:    number
  mySlot:           PlayerSlot
  myName:           string
  messages:         Message[]
  onSendMessage:    (content: string, replyToId?: string) => Promise<void>
  onEdit:           (messageId: string, content: string) => Promise<void>
  isSendingMessage: boolean
  onTyping:         () => void
  isOtherTyping:    boolean
  draftKey:         string
}

type TapState = 'idle' | 'flipping' | 'revealed'

export function PickModal({
  questionText, tier, isCustom, drawnByName, isMyDraw, onClose,
  questionIndex: _qi, mySlot, myName, messages, onSendMessage, onEdit,
  isSendingMessage, onTyping, isOtherTyping, draftKey,
}: PickModalProps) {
  const [tapState, setTapState] = useState<TapState>('idle')
  const { isDark }  = useTheme()
  const TIER_CONFIG = getTierConfig(isDark)
  const conf        = TIER_CONFIG[tier]
  const Pattern     = PATTERNS[tier]
  const watermarkBg = makeWatermarkBg(myName)

  function handleTap() { if (tapState!=='idle') return; setTapState('flipping'); setTimeout(()=>setTapState('revealed'),740) }

  const attributionLabel = isMyDraw ? 'Your draw' : `${drawnByName}'s draw`
  const tapHintLabel     = isMyDraw ? 'tap to reveal your question' : `tap to see ${drawnByName}'s card`
  const taglineOverride  = isMyDraw ? conf.tagline : `from ${drawnByName}`
  const cardFaceStyle    = { background:`linear-gradient(160deg,${conf.midBg} 0%,${conf.darkBg} 100%)`, border:`1.5px solid ${conf.border}`, boxShadow:`0 24px 64px ${conf.glow}` }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&family=Figtree:wght@300;400;500;600&display=swap');

        @keyframes pm-backdrop{from{opacity:0}to{opacity:1}}
        @keyframes pm-rise    {from{opacity:0;transform:translateY(48px) scale(0.94)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes pm-shimmer {0%{transform:translateX(-120%) skewX(-12deg);opacity:0}15%{opacity:1}85%{opacity:1}100%{transform:translateX(280%) skewX(-12deg);opacity:0}}
        @keyframes pm-tap-float{0%,100%{transform:translateY(0);opacity:0.55}50%{transform:translateY(-3px);opacity:0.85}}
        @keyframes pm-text-in {from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pm-bar-in  {from{transform:scaleX(0)}to{transform:scaleX(1)}}
        @keyframes pm-btn-in  {from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pm-flat-in {from{opacity:0;transform:scale(0.98)}to{opacity:1;transform:scale(1)}}

        .pm-backdrop{animation:pm-backdrop 0.28s ease both}
        .pm-rise    {animation:pm-rise     0.50s cubic-bezier(0.22,1.20,0.36,1) both}
        .pm-shimmer {animation:pm-shimmer  2.2s  ease-in-out 0.4s both}
        .pm-tap-hint{animation:pm-tap-float 2.0s ease-in-out 1.0s infinite}
        .pm-text-in {animation:pm-text-in  0.45s ease 0.08s both}
        .pm-bar-in  {animation:pm-bar-in   0.50s cubic-bezier(0.22,1,0.36,1) 0.05s both;transform-origin:left}
        .pm-btn-in  {animation:pm-btn-in   0.35s ease both}
        .pm-flat-in {animation:pm-flat-in  0.30s ease both}
        .pm-no-select{-webkit-user-select:none;-moz-user-select:none;user-select:none}
      `}</style>

      <div
        className="pm-backdrop fixed inset-0 z-50 flex items-end justify-center px-4 pb-6"
        style={{ background:'var(--th-overlay)', backdropFilter:'blur(8px)', overflowY:tapState==='revealed'?'auto':'hidden', fontFamily:"'Figtree',system-ui,sans-serif" }}
        onClick={e=>{if(tapState==='revealed'&&e.target===e.currentTarget)onClose()}}
      >
        <div className="pm-rise w-full" style={{ maxWidth:390 }}>

          {/* Attribution header */}
          <div className="flex items-center justify-between mb-3 px-0.5">
            <div className="flex items-center gap-2">
              <div style={{ width:6, height:6, borderRadius:'50%', background:conf.primary, boxShadow:`0 0 8px ${conf.primary}` }}/>
              <span style={{ fontFamily:"'Figtree',system-ui,sans-serif", color:'var(--th-text-2)', fontSize:'0.78rem', fontWeight:400 }}>{attributionLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              {isCustom && <span style={{ fontFamily:"'Syne',system-ui,sans-serif", fontSize:'0.64rem', fontWeight:700, padding:'2px 8px', borderRadius:99, background:`${conf.primary}14`, border:`1px solid ${conf.border}`, color:conf.primary, letterSpacing:'0.08em' }}>CUSTOM</span>}
              <span style={{ fontFamily:"'Syne',system-ui,sans-serif", fontSize:'0.64rem', fontWeight:700, padding:'2px 10px', borderRadius:99, background:`${conf.primary}12`, border:`1px solid ${conf.border}`, color:conf.primary, letterSpacing:'0.12em', textTransform:'uppercase' }}>{conf.label}</span>
            </div>
          </div>

          {/* Flip phase */}
          {tapState !== 'revealed' && (
            <div style={{ height:340, perspective:'1400px' }}>
              <div style={{ position:'absolute', inset:0, transformStyle:'preserve-3d', transition:'transform 0.72s cubic-bezier(0.4,0.0,0.2,1)', transform:tapState==='flipping'?'rotateY(180deg)':'rotateY(0deg)', cursor:tapState==='idle'?'pointer':'default', borderRadius:22, width:'100%', height:340 }} onClick={handleTap}>

                {/* Front */}
                <div className="absolute inset-0 overflow-hidden" style={{ borderRadius:22, backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden', ...cardFaceStyle }}>
                  <Pattern color={conf.primary}/>
                  <div className="absolute inset-0 pointer-events-none" style={{ background:`radial-gradient(ellipse 70% 60% at 50% 50%,transparent 30%,${conf.darkBg}e0 100%)` }}/>
                  <div className="pm-shimmer absolute pointer-events-none" style={{ top:0, bottom:0, width:'45%', background:`linear-gradient(90deg,transparent,${conf.primary}16,transparent)` }}/>
                  <div className="absolute top-5 left-5" style={{ opacity:0.38 }}><TierSymbol tier={tier} color={conf.primary} size={18}/></div>
                  <div className="absolute bottom-5 right-5" style={{ opacity:0.38, transform:'rotate(180deg)' }}><TierSymbol tier={tier} color={conf.primary} size={18}/></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
                    <div style={{ opacity:0.72 }}><TierSymbol tier={tier} color={conf.primary} size={52}/></div>
                    <span style={{ fontFamily:"'Figtree',system-ui,sans-serif", color:`${conf.primary}90`, fontSize:'0.85rem', fontWeight:400, fontStyle:'italic' }}>{taglineOverride}</span>
                  </div>
                  <div className="pm-tap-hint absolute bottom-0 left-0 right-0 flex justify-center pb-6 pointer-events-none">
                    <div className="flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 10V6a3 3 0 0 1 6 0v4" stroke={conf.primary} strokeWidth="1.8" strokeLinecap="round" opacity="0.7"/><path d="M12 14v3" stroke={conf.primary} strokeWidth="2" strokeLinecap="round" opacity="0.7"/><rect x="5" y="10" width="14" height="12" rx="3" stroke={conf.primary} strokeWidth="1.5" opacity="0.55"/></svg>
                      <span style={{ fontFamily:"'Figtree',system-ui,sans-serif", color:`${conf.primary}70`, fontSize:'0.72rem', fontWeight:400, letterSpacing:'0.06em' }}>{tapHintLabel}</span>
                    </div>
                  </div>
                </div>

                {/* Back */}
                <div className="absolute inset-0 flex flex-col pm-no-select" style={{ borderRadius:22, backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden', transform:'rotateY(180deg)', ...cardFaceStyle, padding:'28px 26px 24px', overflow:'hidden' }}>
                  <div aria-hidden="true" style={{ position:'absolute', inset:0, backgroundImage:watermarkBg, backgroundSize:'240px 90px', pointerEvents:'none' }}/>
                  <div className="pm-bar-in" style={{ height:3, borderRadius:2, flexShrink:0, background:`linear-gradient(90deg,${conf.primary},${conf.secondary}88)`, marginBottom:24 }}/>
                  <div className="pm-text-in flex-1 flex items-center">
                    <p style={{ fontFamily:"'Syne',system-ui,sans-serif", color:conf.textLight, fontSize:'1.18rem', fontWeight:600, lineHeight:1.55, letterSpacing:'0.01em' }}>{questionText}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Revealed flat */}
          {tapState === 'revealed' && (
            <div className="pm-flat-in pm-no-select" style={{ position:'relative', borderRadius:22, ...cardFaceStyle, padding:'28px 26px 24px', overflow:'hidden' }}>
              <div aria-hidden="true" style={{ position:'absolute', inset:0, backgroundImage:watermarkBg, backgroundSize:'240px 90px', pointerEvents:'none', zIndex:0 }}/>
              <div style={{ position:'relative', zIndex:1 }}>
                <div className="pm-bar-in" style={{ height:3, borderRadius:2, background:`linear-gradient(90deg,${conf.primary},${conf.secondary}88)`, marginBottom:24 }}/>
                <div className="pm-text-in">
                  <p style={{ fontFamily:"'Syne',system-ui,sans-serif", color:conf.textLight, fontSize:'1.18rem', fontWeight:600, lineHeight:1.55, letterSpacing:'0.01em', marginBottom:0 }}>{questionText}</p>
                </div>
                {!isMyDraw && (
                  <p style={{ fontFamily:"'Figtree',system-ui,sans-serif", color:`${conf.primary}80`, fontSize:'0.70rem', marginTop:10, lineHeight:1.55 }}>
                    {drawnByName} drew this card. Both of you can respond below.
                  </p>
                )}
                <div className="flex items-center justify-between mt-4 mb-0">
                  <div className="flex items-center gap-2">
                    <TierSymbol tier={tier} color={conf.primary} size={14}/>
                    <span style={{ fontFamily:"'Syne',system-ui,sans-serif", color:`${conf.primary}70`, fontSize:'0.62rem', fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase' }}>{conf.label}</span>
                  </div>
                  {isCustom && <span style={{ fontFamily:"'Figtree',system-ui,sans-serif", color:`${conf.primary}70`, fontSize:'0.68rem' }}>custom question</span>}
                </div>
                <MessageThread
                  messages={messages}
                  mySlot={mySlot}
                  myName={myName}
                  onSend={onSendMessage}
                  onEdit={onEdit}
                  isSending={isSendingMessage}
                  accentColor={conf.primary}
                  onTyping={onTyping}
                  isOtherTyping={isOtherTyping}
                  draftKey={draftKey}
                />
              </div>
            </div>
          )}

          {/* Done button */}
          {tapState === 'revealed' && (
            <button
              className="pm-btn-in mt-4 w-full rounded-2xl text-sm font-medium active:opacity-60"
              style={{ padding:'15px 0', background:'var(--th-surface)', border:'1px solid var(--th-border-2)', color:'var(--th-text-1)', letterSpacing:'0.06em', cursor:'pointer', fontFamily:"'Figtree',system-ui,sans-serif", fontWeight:500, transition:'background 0.2s ease' }}
              onMouseEnter={e=>((e.currentTarget as HTMLButtonElement).style.background='var(--th-surface-2)')}
              onMouseLeave={e=>((e.currentTarget as HTMLButtonElement).style.background='var(--th-surface)')}
              onClick={onClose}
            >
              Done
            </button>
          )}
        </div>
      </div>
    </>
  )
}