'use client'

import { useEffect } from 'react'

type ToastProps = {
  message: string
  onDone:  () => void
}

export function Toast({ message, onDone }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <>
      <style>{`
        @keyframes toast-in  {
          from { opacity: 0; transform: translateY(8px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @keyframes toast-out { from { opacity: 1; } to { opacity: 0; } }
        .toast-anim {
          animation:
            toast-in  0.28s ease         both,
            toast-out 0.28s ease 2.3s    both;
        }
      `}</style>

      <div
        className="toast-anim"
        style={{
          position:      'fixed',
          top:            20,
          left:           0,
          right:          0,
          display:       'flex',
          justifyContent:'center',
          zIndex:         60,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            fontFamily:   "'DM Sans', system-ui, sans-serif",
            background:   'var(--th-surface-2)',
            border:       '1px solid var(--th-border-2)',
            borderRadius:  99,
            padding:      '9px 18px',
            color:        'var(--th-text-1)',
            fontSize:     '0.78rem',
            fontWeight:    400,
            boxShadow:    '0 8px 32px rgba(0,0,0,0.18)',
          }}
        >
          {message}
        </div>
      </div>
    </>
  )
}