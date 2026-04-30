// ---------------------------------------------------------------------------
// Theme system — single source of truth for all palettes.
//
// Each theme declares a flat map of CSS custom property values.
// The ThemeContext writes these to :root at runtime, meaning every
// component can reference var(--th-*) without knowing which theme is active.
//
// CSS variable contract
// ---------------------------------------------------------------------------
// --th-bg          Main page background
// --th-bg-alt      Subtle alternate background (e.g. input tray)
// --th-surface     Card / panel background
// --th-surface-2   Deeper surface (nested panels, modals)
// --th-border      Hairline border (subtle)
// --th-border-2    Visible border (interactive elements)
// --th-fg          Primary body text
// --th-text-1      High-emphasis text (headings, labels)
// --th-text-2      Medium-emphasis text
// --th-text-3      Low-emphasis / placeholder text
// --th-text-4      Ghost text (nearly invisible)
// --th-brand       Brand accent (wordmark, sigil)
// --th-input-bg    Input / textarea background
// --th-input-border Input border at rest
// --th-overlay     Modal backdrop colour (include alpha)
// ---------------------------------------------------------------------------

export type ThemeId =
  | 'void'        // deep black — original
  | 'midnight'    // midnight blue
  | 'graphite'    // cool grey
  | 'lemon'       // soft yellow
  | 'rose'        // soft pink
  | 'sky'         // soft blue
  | 'cream'       // warm white

export type ThemeMode = 'dark' | 'light'

export type ThemeVars = Record<string, string>

export type Theme = {
  id:      ThemeId
  name:    string
  mode:    ThemeMode
  /** Swatch colour shown in the theme picker */
  swatch:  string
  vars:    ThemeVars
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function t(vars: ThemeVars): ThemeVars { return vars }

// ---------------------------------------------------------------------------
// Dark themes
// ---------------------------------------------------------------------------

const void_: Theme = {
  id: 'void', name: 'Void', mode: 'dark',
  swatch: '#020308',
  vars: t({
    '--th-bg':           '#020308',
    '--th-bg-alt':       '#06070d',
    '--th-surface':      '#07080f',
    '--th-surface-2':    '#0c0e16',
    '--th-border':       'rgba(255,255,255,0.06)',
    '--th-border-2':     'rgba(255,255,255,0.11)',
    '--th-fg':           '#ededed',
    '--th-text-1':       '#c8d0de',
    '--th-text-2':       '#94a3b8',
    '--th-text-3':       '#475569',
    '--th-text-4':       '#1e2535',
    '--th-brand':        '#c8d0de',
    '--th-input-bg':     '#06070d',
    '--th-input-border': 'rgba(255,255,255,0.07)',
    '--th-overlay':      'rgba(2,3,8,0.88)',
  }),
}

const midnight: Theme = {
  id: 'midnight', name: 'Midnight', mode: 'dark',
  swatch: '#020d1f',
  vars: t({
    '--th-bg':           '#020d1f',
    '--th-bg-alt':       '#011428',
    '--th-surface':      '#031a30',
    '--th-surface-2':    '#052040',
    '--th-border':       'rgba(96,165,250,0.08)',
    '--th-border-2':     'rgba(96,165,250,0.16)',
    '--th-fg':           '#e8eef5',
    '--th-text-1':       '#b8d4f0',
    '--th-text-2':       '#6ca4d8',
    '--th-text-3':       '#2e5a80',
    '--th-text-4':       '#0e2035',
    '--th-brand':        '#b8d4f0',
    '--th-input-bg':     '#020d1a',
    '--th-input-border': 'rgba(96,165,250,0.09)',
    '--th-overlay':      'rgba(2,13,31,0.90)',
  }),
}

const graphite: Theme = {
  id: 'graphite', name: 'Graphite', mode: 'dark',
  swatch: '#141414',
  vars: t({
    '--th-bg':           '#111111',
    '--th-bg-alt':       '#161616',
    '--th-surface':      '#1a1a1a',
    '--th-surface-2':    '#222222',
    '--th-border':       'rgba(255,255,255,0.07)',
    '--th-border-2':     'rgba(255,255,255,0.13)',
    '--th-fg':           '#e4e4e4',
    '--th-text-1':       '#c2c2c2',
    '--th-text-2':       '#868686',
    '--th-text-3':       '#4a4a4a',
    '--th-text-4':       '#2a2a2a',
    '--th-brand':        '#c2c2c2',
    '--th-input-bg':     '#151515',
    '--th-input-border': 'rgba(255,255,255,0.08)',
    '--th-overlay':      'rgba(17,17,17,0.90)',
  }),
}

// ---------------------------------------------------------------------------
// Light themes
// ---------------------------------------------------------------------------

const lemon: Theme = {
  id: 'lemon', name: 'Lemon', mode: 'light',
  swatch: '#fefce8',
  vars: t({
    '--th-bg':           '#fefce8',
    '--th-bg-alt':       '#fef9c3',
    '--th-surface':      '#fef9c3',
    '--th-surface-2':    '#fef08a',
    '--th-border':       'rgba(133,100,0,0.14)',
    '--th-border-2':     'rgba(133,100,0,0.24)',
    '--th-fg':           '#1c1500',
    '--th-text-1':       '#3d2e00',
    '--th-text-2':       '#7c5c00',
    '--th-text-3':       '#a37c00',
    '--th-text-4':       '#c9a800',
    '--th-brand':        '#3d2e00',
    '--th-input-bg':     '#fffef5',
    '--th-input-border': 'rgba(133,100,0,0.16)',
    '--th-overlay':      'rgba(254,252,232,0.88)',
  }),
}

const rose: Theme = {
  id: 'rose', name: 'Rose', mode: 'light',
  swatch: '#fff0f3',
  vars: t({
    '--th-bg':           '#fff0f3',
    '--th-bg-alt':       '#ffe4e8',
    '--th-surface':      '#ffe4e8',
    '--th-surface-2':    '#fecdd3',
    '--th-border':       'rgba(180,10,50,0.12)',
    '--th-border-2':     'rgba(180,10,50,0.22)',
    '--th-fg':           '#1a0009',
    '--th-text-1':       '#4c0519',
    '--th-text-2':       '#881337',
    '--th-text-3':       '#be1d4d',
    '--th-text-4':       '#e85d7e',
    '--th-brand':        '#4c0519',
    '--th-input-bg':     '#fff5f7',
    '--th-input-border': 'rgba(180,10,50,0.14)',
    '--th-overlay':      'rgba(255,240,243,0.90)',
  }),
}

const sky: Theme = {
  id: 'sky', name: 'Sky', mode: 'light',
  swatch: '#eff6ff',
  vars: t({
    '--th-bg':           '#eff6ff',
    '--th-bg-alt':       '#dbeafe',
    '--th-surface':      '#dbeafe',
    '--th-surface-2':    '#bfdbfe',
    '--th-border':       'rgba(29,78,216,0.12)',
    '--th-border-2':     'rgba(29,78,216,0.22)',
    '--th-fg':           '#00112a',
    '--th-text-1':       '#1e3a8a',
    '--th-text-2':       '#1d4ed8',
    '--th-text-3':       '#3b82f6',
    '--th-text-4':       '#93c5fd',
    '--th-brand':        '#1e3a8a',
    '--th-input-bg':     '#f5f9ff',
    '--th-input-border': 'rgba(29,78,216,0.14)',
    '--th-overlay':      'rgba(239,246,255,0.90)',
  }),
}

const cream: Theme = {
  id: 'cream', name: 'Cream', mode: 'light',
  swatch: '#faf7f2',
  vars: t({
    '--th-bg':           '#faf7f2',
    '--th-bg-alt':       '#f5ede0',
    '--th-surface':      '#f5ede0',
    '--th-surface-2':    '#ede0cc',
    '--th-border':       'rgba(110,70,10,0.12)',
    '--th-border-2':     'rgba(110,70,10,0.20)',
    '--th-fg':           '#1a1208',
    '--th-text-1':       '#3d2c1a',
    '--th-text-2':       '#7c5c38',
    '--th-text-3':       '#a07850',
    '--th-text-4':       '#c4a07a',
    '--th-brand':        '#3d2c1a',
    '--th-input-bg':     '#fdf9f4',
    '--th-input-border': 'rgba(110,70,10,0.13)',
    '--th-overlay':      'rgba(250,247,242,0.90)',
  }),
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const THEMES: Theme[] = [
  void_, midnight, graphite,
  lemon, rose, sky, cream,
]

export const DARK_THEMES  = THEMES.filter(t => t.mode === 'dark')
export const LIGHT_THEMES = THEMES.filter(t => t.mode === 'light')

export const DEFAULT_THEME_ID: ThemeId = 'void'

export function getTheme(id: ThemeId): Theme {
  return THEMES.find(t => t.id === id) ?? void_
}