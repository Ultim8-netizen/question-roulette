'use client'

import type { PlayerSlot } from '@/lib/supabase'
import type { ChannelStatus } from '@/hooks/useRoomChannel'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TurnBannerProps = {
  currentTurn:  PlayerSlot
  mySlot:       PlayerSlot
  player1Name:  string
  player2Name:  string
  channelStatus: ChannelStatus
}

const STATUS_CONFIG: Record<ChannelStatus, { color: string; label: string; pulse: boolean }> = {
  connected:    { color: '#4ade80', label: 'Live',       pulse: false },
  connecting:   { color: '#fbbf24', label: 'Connecting', pulse: true  },
  disconnected: { color: '#ef4444', label: 'Offline',    pulse: false },
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TurnBanner({
  currentTurn,
  mySlot,
  player1Name,
  player2Name,
  channelStatus,
}: TurnBannerProps) {
  const isMyTurn   = currentTurn === mySlot
  const otherName  = mySlot === 1 ? player2Name : player1Name
  const statusConf = STATUS_CONFIG[channelStatus]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes tb-glow-ring {
          0%, 100% { box-shadow: 0 0 0 0 rgba(74,222,128,0), inset 0 1px 0 rgba(74,222,128,0.08); }
          50%       { box-shadow: 0 0 28px 2px rgba(74,222,128,0.10), inset 0 1px 0 rgba(74,222,128,0.14); }
        }
        @keyframes tb-orb-breathe {
          0%, 100% { transform: scale(1);    filter: brightness(1);   }
          50%       { transform: scale(1.06); filter: brightness(1.2); }
        }
        @keyframes tb-dot-wave {
          0%, 60%, 100% { transform: translateY(0);    opacity: 0.35; }
          30%            { transform: translateY(-3px); opacity: 1;    }
        }
        @keyframes tb-status-blink {
          0%, 100% { opacity: 1;   }
          50%       { opacity: 0.3; }
        }
        @keyframes tb-enter {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0);     }
        }

        .tb-root       { font-family: 'DM Sans', system-ui, sans-serif; animation: tb-enter 0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .tb-active     { animation: tb-glow-ring 3s ease-in-out infinite; }
        .tb-orb-active { animation: tb-orb-breathe 2.8s ease-in-out infinite; }
        .tb-dot-1      { animation: tb-dot-wave 1.3s ease-in-out 0s   infinite; }
        .tb-dot-2      { animation: tb-dot-wave 1.3s ease-in-out 0.18s infinite; }
        .tb-dot-3      { animation: tb-dot-wave 1.3s ease-in-out 0.36s infinite; }
        .tb-status-pulse { animation: tb-status-blink 1.4s ease-in-out infinite; }
      `}</style>

      <div
        className={`tb-root relative flex items-center justify-between mx-4 mt-4 px-5 py-3.5 rounded-2xl ${isMyTurn ? 'tb-active' : ''}`}
        style={{
          background: isMyTurn
            ? 'linear-gradient(140deg, #071a0f 0%, #081509 40%, #05100a 100%)'
            : 'linear-gradient(140deg, #08090e 0%, #0c0e16 100%)',
          border: isMyTurn
            ? '1px solid rgba(74,222,128,0.18)'
            : '1px solid rgba(255,255,255,0.055)',
          transition: 'background 0.7s ease, border-color 0.7s ease',
        }}
      >
        {/* Left: orb + text */}
        <div className="flex items-center gap-3.5">
          {/* Indicator orb */}
          <div
            className={isMyTurn ? 'tb-orb-active' : ''}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              flexShrink: 0,
              background: isMyTurn
                ? 'radial-gradient(circle at 38% 32%, #86efac 0%, #22c55e 45%, #15803d 100%)'
                : 'radial-gradient(circle at 38% 32%, #334155 0%, #1e293b 60%, #0f172a 100%)',
              boxShadow: isMyTurn
                ? '0 0 18px rgba(74,222,128,0.38), inset 0 1px 0 rgba(255,255,255,0.18)'
                : 'inset 0 1px 0 rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.6s ease',
            }}
          >
            {isMyTurn ? (
              /* Stylised draw icon: stacked cards */
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2"  y="4"  width="10" height="13" rx="1.8" fill="rgba(0,0,0,0.35)" stroke="rgba(255,255,255,0.55)" strokeWidth="0.9"/>
                <rect x="5"  y="2"  width="10" height="13" rx="1.8" fill="rgba(0,0,0,0.25)" stroke="rgba(255,255,255,0.80)" strokeWidth="0.9"/>
                <line x1="8" y1="7" x2="12" y2="7" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" strokeLinecap="round"/>
                <line x1="8" y1="9.5" x2="12" y2="9.5" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" strokeLinecap="round"/>
              </svg>
            ) : (
              /* Hourglass icon */
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M3 1.5h9M3 13.5h9" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M4 1.5 C4 5.5 7.5 7.5 7.5 7.5 C7.5 7.5 11 5.5 11 1.5" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.35)" strokeWidth="0.9"/>
                <path d="M4 13.5 C4 9.5 7.5 7.5 7.5 7.5 C7.5 7.5 11 9.5 11 13.5" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="0.9"/>
              </svg>
            )}
          </div>

          {/* Text block */}
          <div className="flex flex-col gap-0.75">
            {isMyTurn ? (
              <>
                <span
                  style={{
                    color: '#4ade80',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                  }}
                >
                  Your draw
                </span>
                <span style={{ color: '#e2e8f0', fontSize: '0.875rem', fontWeight: 400 }}>
                  Pick a card when you are ready
                </span>
              </>
            ) : (
              <>
                <span
                  style={{
                    color: '#475569',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                  }}
                >
                  Waiting
                </span>
                <div className="flex items-center gap-1.5">
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 400 }}>
                    {otherName} is deciding
                  </span>
                  {/* Animated ellipsis */}
                  <div className="flex items-end gap-0.5 pb-px">
                    <span className="tb-dot-1 inline-block w-[3.5px] h-[3.5px] rounded-full" style={{ background: '#475569' }} />
                    <span className="tb-dot-2 inline-block w-[3.5px] h-[3.5px] rounded-full" style={{ background: '#475569' }} />
                    <span className="tb-dot-3 inline-block w-[3.5px] h-[3.5px] rounded-full" style={{ background: '#475569' }} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: connection status */}
        <div className="flex flex-col items-end gap-1.25">
          <div className="flex items-center gap-1.5">
            <div
              className={statusConf.pulse ? 'tb-status-pulse' : ''}
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: statusConf.color,
                boxShadow: `0 0 6px ${statusConf.color}bb`,
                flexShrink: 0,
              }}
            />
            <span style={{ color: '#334155', fontSize: '0.7rem', fontWeight: 500 }}>
              {statusConf.label}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}