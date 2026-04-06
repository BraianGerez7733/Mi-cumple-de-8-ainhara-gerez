import { hasSupabase, supabase } from './supabase'

const RSVP_KEY = 'ainhara-birthday-rsvp'
const MESSAGES_KEY = 'ainhara-birthday-messages'

const sortByNewest = (items) =>
  [...items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

const localRead = (key) => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const localWrite = (key, items) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(items))
}

export async function listRsvps() {
  if (hasSupabase) {
    const { data, error } = await supabase
      .from('rsvps')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return data
  }

  return sortByNewest(localRead(RSVP_KEY))
}

export async function saveRsvp(payload) {
  const record = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    ...payload,
  }

  if (hasSupabase) {
    const { data, error } = await supabase.from('rsvps').insert(payload).select().single()

    if (error) {
      throw error
    }

    return data
  }

  const current = localRead(RSVP_KEY)
  const next = sortByNewest([record, ...current])
  localWrite(RSVP_KEY, next)
  return record
}

export async function listMessages() {
  if (hasSupabase) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return data
  }

  return sortByNewest(localRead(MESSAGES_KEY))
}

export async function saveMessage(payload) {
  const record = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    ...payload,
  }

  if (hasSupabase) {
    const { data, error } = await supabase.from('messages').insert(payload).select().single()

    if (error) {
      throw error
    }

    return data
  }

  const current = localRead(MESSAGES_KEY)
  const next = sortByNewest([record, ...current])
  localWrite(MESSAGES_KEY, next)
  return record
}
