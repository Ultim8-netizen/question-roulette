import type { QuestionTier } from './supabase'

// ---------------------------------------------------------------------------
// Tier visual style — one record per QuestionTier.
// Used in PickModal (card face) and QuestionGrid (mini card).
// ---------------------------------------------------------------------------

export type TierStyle = {
  label:     string
  tagline:   string
  primary:   string  // main tier accent colour
  secondary: string  // deeper / shadow variant
  darkBg:    string  // gradient stop A (card face bg)
  midBg:     string  // gradient stop B
  textLight: string  // readable text on the card face
  border:    string  // CSS colour for border
  glow:      string  // CSS colour for box-shadow glow
}

export type TierConfig = Record<QuestionTier, TierStyle>

// ---------------------------------------------------------------------------
// getTierConfig — call with isDark from useTheme().
// Exported for PickModal and QuestionGrid.
// ---------------------------------------------------------------------------

export function getTierConfig(isDark: boolean): TierConfig {
  return isDark ? DARK : LIGHT
}

// ── Dark mode tier config (original values) ──────────────────────────────

const DARK: TierConfig = {
  light: {
    label: 'Light', tagline: 'Easy terrain',
    primary:   '#4ade80', secondary: '#15803d',
    darkBg:    '#040d07', midBg:     '#071a0f',
    textLight: '#bbf7d0',
    border:    'rgba(74,222,128,0.22)',
    glow:      'rgba(74,222,128,0.16)',
  },
  medium: {
    label: 'Medium', tagline: 'Going deeper',
    primary:   '#60a5fa', secondary: '#1d4ed8',
    darkBg:    '#020815', midBg:     '#050f24',
    textLight: '#bfdbfe',
    border:    'rgba(96,165,250,0.22)',
    glow:      'rgba(96,165,250,0.16)',
  },
  deep: {
    label: 'Deep', tagline: 'Raw territory',
    primary:   '#f87171', secondary: '#991b1b',
    darkBg:    '#0e0202', midBg:     '#1c0404',
    textLight: '#fecaca',
    border:    'rgba(248,113,113,0.22)',
    glow:      'rgba(248,113,113,0.16)',
  },
  spicy: {
    label: 'Spicy', tagline: 'No going back',
    primary:   '#c084fc', secondary: '#6b21a8',
    darkBg:    '#070012', midBg:     '#0f0120',
    textLight: '#e9d5ff',
    border:    'rgba(192,132,252,0.22)',
    glow:      'rgba(192,132,252,0.16)',
  },
}

// ── Light mode tier config ────────────────────────────────────────────────
// Darker, more saturated primaries for legibility on pale backgrounds.
// Card face backgrounds become pastel tints of each tier colour.

const LIGHT: TierConfig = {
  light: {
    label: 'Light', tagline: 'Easy terrain',
    primary:   '#16a34a', secondary: '#14532d',
    darkBg:    '#f0fdf4', midBg:     '#dcfce7',
    textLight: '#14532d',
    border:    'rgba(22,163,74,0.20)',
    glow:      'rgba(22,163,74,0.08)',
  },
  medium: {
    label: 'Medium', tagline: 'Going deeper',
    primary:   '#2563eb', secondary: '#1e3a8a',
    darkBg:    '#eff6ff', midBg:     '#dbeafe',
    textLight: '#1e3a8a',
    border:    'rgba(37,99,235,0.20)',
    glow:      'rgba(37,99,235,0.08)',
  },
  deep: {
    label: 'Deep', tagline: 'Raw territory',
    primary:   '#dc2626', secondary: '#7f1d1d',
    darkBg:    '#fff1f2', midBg:     '#ffe4e6',
    textLight: '#7f1d1d',
    border:    'rgba(220,38,38,0.20)',
    glow:      'rgba(220,38,38,0.08)',
  },
  spicy: {
    label: 'Spicy', tagline: 'No going back',
    primary:   '#9333ea', secondary: '#581c87',
    darkBg:    '#faf5ff', midBg:     '#f3e8ff',
    textLight: '#581c87',
    border:    'rgba(147,51,234,0.20)',
    glow:      'rgba(147,51,234,0.08)',
  },
}