import { createClient, SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Check your .env.local file.')
}

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

export type PlayerSlot = 1 | 2

export type QuestionTier = 'light' | 'medium' | 'deep' | 'spicy'

export type PoolQuestion = {
  text: string
  tier: QuestionTier
  isCustom: boolean
}

export type PendingQuestion = {
  text: string
  tier: QuestionTier
  proposedBy: PlayerSlot
}

export type Message = {
  id: string
  room_id: string
  question_index: number
  player: PlayerSlot
  player_name: string
  content: string
  created_at: string
  reply_to_message_id?: string | null
  edited_at?: string | null
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

export type RoomEvent =
  | { type: 'PLAYER_JOINED';     player: PlayerSlot; name: string }
  | { type: 'QUESTION_DRAWN';    player: PlayerSlot; questionIndex: number; questionText: string; tier: QuestionTier; isCustom: boolean }
  | { type: 'TURN_ADVANCED';     nextTurn: PlayerSlot }
  | { type: 'QUESTION_PROPOSED'; proposedBy: PlayerSlot; text: string; tier: QuestionTier }
  | { type: 'QUESTION_ACCEPTED'; questionIndex: number; text: string; tier: QuestionTier }
  | { type: 'QUESTION_DECLINED'; proposedBy: PlayerSlot }
  | {
      type: 'MESSAGE_SENT'
      questionIndex: number
      player: PlayerSlot
      playerName: string
      content: string
      messageId: string
      createdAt: string
      reply_to_message_id?: string | null
    }
  | {
      type: 'MESSAGE_EDITED'
      messageId: string
      content: string
      editedAt: string
    }
  | {
      type: 'TYPING'
      questionIndex: number
      player: PlayerSlot
    }
  | {
      type: 'CARD_CLOSED'
      questionIndex: number
    }

export type DrawnCard = {
  questionIndex: number
  questionText: string
  tier: QuestionTier
  isCustom: boolean
  drawnBy: PlayerSlot
  drawnByName: string
}