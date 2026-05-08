import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// ─── Auth helpers ─────────────────────────────────────────────────────────────

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession()
  return { session: data.session, error }
}

// ─── Profile helpers ──────────────────────────────────────────────────────────

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  return { data, error }
}

export const updateProfile = async (userId: string, updates: Record<string, unknown>) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ user_id: userId, ...updates, updated_at: new Date().toISOString() })
    .select()
    .single()
  return { data, error }
}

// ─── Matching helpers ─────────────────────────────────────────────────────────

export const getMatches = async (userId: string) => {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      profile_a:profiles!matches_user_id_a_fkey(*),
      profile_b:profiles!matches_user_id_b_fkey(*)
    `)
    .or(`user_id_a.eq.${userId},user_id_b.eq.${userId}`)
    .eq('status', 'matched')
    .order('created_at', { ascending: false })
  return { data, error }
}

export const sendMatchRequest = async (fromUserId: string, toUserId: string) => {
  const { data, error } = await supabase
    .from('matches')
    .insert({
      user_id_a: fromUserId,
      user_id_b: toUserId,
      status: 'pending',
      initiated_by: fromUserId,
    })
    .select()
    .single()
  return { data, error }
}

// ─── Discover (paginated) ─────────────────────────────────────────────────────

export const discoverProfiles = async (userId: string, page = 0, limit = 12) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .neq('user_id', userId)
    .eq('is_hidden', false)
    .eq('is_stealth', false)
    .range(page * limit, (page + 1) * limit - 1)
  return { data, error }
}

// ─── Boundaries ───────────────────────────────────────────────────────────────

export const getUserBoundaries = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_boundaries')
    .select('*, boundary:boundary_categories(*)')
    .eq('user_id', userId)
  return { data, error }
}

export const saveBoundary = async (
  userId: string,
  boundaryId: string,
  level: string,
  notes?: string
) => {
  const { data, error } = await supabase
    .from('user_boundaries')
    .upsert({ user_id: userId, boundary_id: boundaryId, level, notes })
    .select()
    .single()
  return { data, error }
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export const getConversations = async (userId: string) => {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      messages(content, created_at, sender_id)
    `)
    .contains('participant_ids', [userId])
    .order('updated_at', { ascending: false })
  return { data, error }
}

export const sendMessage = async (
  conversationId: string,
  senderId: string,
  content: string,
  expiresAt?: string
) => {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      expires_at: expiresAt,
      status: 'sent',
    })
    .select()
    .single()
  return { data, error }
}

// ─── Storage ──────────────────────────────────────────────────────────────────

export const uploadPhoto = async (userId: string, file: File) => {
  const ext = file.name.split('.').pop()
  const path = `${userId}/${Date.now()}.${ext}`

  const { data, error } = await supabase.storage
    .from('photos')
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error) return { url: null, error }

  const { data: urlData } = supabase.storage.from('photos').getPublicUrl(path)
  return { url: urlData.publicUrl, error: null }
}
