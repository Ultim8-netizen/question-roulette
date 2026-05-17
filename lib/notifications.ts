// lib/notifications.ts
// ---------------------------------------------------------------------------
// Thin wrapper around the Web Notifications API.
//
// Design notes:
//   • Notifications only fire when document.visibilityState !== 'visible'
//     (i.e. the tab is in the background, minimised, or the user switched
//     apps). If the player is looking at the tab they don't need a ping.
//   • No service worker required — `new Notification()` from the main
//     thread is enough for the backgrounded-tab use case.
//   • Permission is requested at most once per device (localStorage flag).
//   • Clicking any notification focuses the originating tab/window.
// ---------------------------------------------------------------------------

const ASKED_KEY = 'r13-notif-asked'
const ICON_PATH = '/favicon.svg'

// ---------------------------------------------------------------------------
// Permission
// ---------------------------------------------------------------------------

/** Returns true if the browser supports and has granted notifications. */
export function notificationsGranted(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    Notification.permission === 'granted'
  )
}

/** Returns true if we've never asked on this device before. */
export function notificationsNeverAsked(): boolean {
  if (typeof window === 'undefined') return false
  if (!('Notification' in window)) return false
  if (Notification.permission !== 'default') return false
  try {
    return !localStorage.getItem(ASKED_KEY)
  } catch {
    return false
  }
}

/**
 * Request notification permission from the browser.
 * Records that we asked so we never pester the user again.
 * Returns the resulting permission state.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied'
  }

  // Mark as asked regardless of outcome — we never re-prompt.
  try { localStorage.setItem(ASKED_KEY, '1') } catch { /* ignore */ }

  if (Notification.permission !== 'default') {
    return Notification.permission
  }

  return Notification.requestPermission()
}

// ---------------------------------------------------------------------------
// Sending
// ---------------------------------------------------------------------------

type NotificationPayload = {
  title:   string
  body?:   string
  /** How long the notification lives in ms before auto-close. Default 6 s. */
  ttl?:    number
}

// The TS DOM lib types NotificationOptions conservatively — renotify and
// silent are defined in the Push API spec but omitted from the basic
// Notification constructor's type. Extend locally rather than casting to any.
type ExtendedNotificationOptions = NotificationOptions & {
  renotify?: boolean
  silent?:   boolean
}

/**
 * Fire a browser notification if:
 *   1. Permission is granted.
 *   2. The document is not currently visible (user is elsewhere).
 *
 * Clicking the notification brings the tab to the front.
 */
export function sendNotification({ title, body, ttl = 6_000 }: NotificationPayload): void {
  if (!notificationsGranted()) return
  if (typeof document !== 'undefined' && document.visibilityState === 'visible') return

  try {
    const options: ExtendedNotificationOptions = {
      body,
      icon:     ICON_PATH,
      badge:    ICON_PATH,
      // tag: group by game so rapid events don't stack infinitely
      tag:      'room13-game',
      // renotify: true means even same-tag notifications get a sound/badge
      renotify: true,
      silent:   false,
    }

    const n = new Notification(title, options as NotificationOptions)

    // Auto-close after ttl
    const t = setTimeout(() => n.close(), ttl)

    // Clicking focuses the tab that owns this notification
    n.onclick = () => {
      clearTimeout(t)
      try { window.focus() } catch { /* ignore */ }
      n.close()
    }
  } catch (err) {
    // Notification constructor can throw in some sandboxed environments
    console.warn('[notifications] failed to create notification:', err)
  }
}