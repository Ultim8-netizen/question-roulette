import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// NOTE: single source of truth for all shared types.
// API routes, hooks, and components all import from here.
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Check your .env.local file.')
}

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

let _browserClient: SupabaseClient | null = null

export function getSupabaseBrowserClient(): SupabaseClient {
  if (!_browserClient) {
    _browserClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  return _browserClient
}

export function createSupabaseServerClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

// ---------------------------------------------------------------------------
// Core types
// ---------------------------------------------------------------------------

export type PlayerSlot = 1 | 2

export type QuestionTier = 'light' | 'medium' | 'deep' | 'spicy'

/**
 * A question as it lives inside the room's question_pool column.
 * Static questions (snapshotted from questions.ts at room creation) have isCustom: false.
 * Questions added mid-session by either player have isCustom: true.
 */
export type PoolQuestion = {
  text: string
  tier: QuestionTier
  isCustom: boolean
}

/**
 * A custom question waiting for the other player's consent.
 * Stored in pending_question on the room row until resolved.
 */
export type PendingQuestion = {
  text: string
  tier: QuestionTier
  proposedBy: PlayerSlot
}

export type Room = {
  id: string
  player1_name: string
  player2_name: string | null
  current_turn: PlayerSlot
  drawn_indices: number[]
  question_pool: PoolQuestion[]
  pending_question: PendingQuestion | null
  created_at: string
  expires_at: string
}

// ---------------------------------------------------------------------------
// Realtime broadcast event shapes
// Every event broadcast through the channel must match one of these.
// ---------------------------------------------------------------------------

export type RoomEvent =
  | { type: 'PLAYER_JOINED';     player: PlayerSlot; name: string }
  | { type: 'QUESTION_DRAWN';    player: PlayerSlot; questionIndex: number; questionText: string; tier: QuestionTier; isCustom: boolean }
  | { type: 'TURN_ADVANCED';     nextTurn: PlayerSlot }
  | { type: 'QUESTION_PROPOSED'; proposedBy: PlayerSlot; text: string; tier: QuestionTier }
  | { type: 'QUESTION_ACCEPTED'; questionIndex: number; text: string; tier: QuestionTier }
  | { type: 'QUESTION_DECLINED'; proposedBy: PlayerSlot }

/**
 * A question card that has been drawn and exists in both clients' state.
 * Consumed by QuestionGrid (history display) and PickModal (reveal moment).
 */
export type DrawnCard = {
  questionIndex: number
  questionText: string
  tier: QuestionTier
  isCustom: boolean
  drawnBy: PlayerSlot
  drawnByName: string
}