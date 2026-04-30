'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import {
  THEMES,
  DEFAULT_THEME_ID,
  getTheme,
  type Theme,
  type ThemeId,
} from '@/lib/theme'

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

type ThemeContextValue = {
  theme:    Theme
  themeId:  ThemeId
  isDark:   boolean
  setTheme: (id: ThemeId) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}

// ---------------------------------------------------------------------------
// Helpers — apply CSS variables to the document root
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'abyss-theme'

function applyTheme(theme: Theme): void {
  const root = document.documentElement
  root.setAttribute('data-theme', theme.id)
  root.setAttribute('data-mode',  theme.mode)
  for (const [prop, value] of Object.entries(theme.vars)) {
    root.style.setProperty(prop, value)
  }
}

function readStoredId(): ThemeId {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeId | null
    if (stored && THEMES.some(t => t.id === stored)) return stored
  } catch { /* SSR or private browsing */ }
  return DEFAULT_THEME_ID
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Lazy initializer: runs once on the client at first render.
  // Returns DEFAULT_THEME_ID during SSR (window is undefined),
  // then reads the real stored value on the client — zero extra renders.
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    if (typeof window === 'undefined') return DEFAULT_THEME_ID
    return readStoredId()
  })

  // Effect is DOM-only (external system sync). Never calls setState.
  // Runs whenever themeId changes — including on first mount — so CSS
  // vars and data attributes are always in sync with React state.
  useEffect(() => {
    applyTheme(getTheme(themeId))
  }, [themeId])

  const setTheme = useCallback((id: ThemeId) => {
    setThemeId(id)
    try { localStorage.setItem(STORAGE_KEY, id) } catch { /* ignore */ }
  }, [])

  const theme  = getTheme(themeId)
  const isDark = theme.mode === 'dark'

  return (
    <ThemeContext.Provider value={{ theme, themeId, isDark, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Flash-prevention script
//
// Inlined as a blocking <script> in <head> before React hydrates.
// Reads localStorage and writes CSS vars + data attributes synchronously
// so the correct theme is painted on the first frame — no flash.
//
// This is a plain string that layout.tsx injects via dangerouslySetInnerHTML.
// It intentionally duplicates the minimal applyTheme logic so it has zero
// imports and can run in a raw <script> tag.
// ---------------------------------------------------------------------------

export const THEME_INIT_SCRIPT = /* js */`
(function(){
  var STORAGE_KEY = 'abyss-theme';
  var THEMES = ${JSON.stringify(THEMES.map(t => ({ id: t.id, mode: t.mode, vars: t.vars })))};
  var DEFAULT = '${DEFAULT_THEME_ID}';
  try {
    var stored = localStorage.getItem(STORAGE_KEY);
    var theme = THEMES.find(function(t){ return t.id === stored; }) ||
                THEMES.find(function(t){ return t.id === DEFAULT; });
    if (theme) {
      var root = document.documentElement;
      root.setAttribute('data-theme', theme.id);
      root.setAttribute('data-mode', theme.mode);
      var vars = theme.vars;
      for (var k in vars) {
        if (Object.prototype.hasOwnProperty.call(vars, k)) {
          root.style.setProperty(k, vars[k]);
        }
      }
    }
  } catch(e){}
})();
`