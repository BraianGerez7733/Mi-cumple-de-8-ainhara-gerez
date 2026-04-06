import { hasSupabase, supabase } from './supabase'

const RSVP_KEY = 'ainhara-birthday-rsvp'
const MESSAGES_KEY = 'ainhara-birthday-messages'
const REMOTE_TIMEOUT_MS = 3500
const memoryStore = {
  [RSVP_KEY]: [],
  [MESSAGES_KEY]: [],
}

const sortByNewest = (items) =>
  [...items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

const dedupeById = (items) => {
  const seen = new Map()

  items.forEach((item) => {
    if (item?.id) {
      seen.set(item.id, item)
    }
  })

  return [...seen.values()]
}

const withTimeout = async (promise, timeoutMs = REMOTE_TIMEOUT_MS) => {
  return await Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error('Supabase timeout')), timeoutMs)
    }),
  ])
}

const localRead = (key) => {
  if (typeof window === 'undefined') {
    return memoryStore[key] ?? []
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? '[]')
    if (Array.isArray(parsed)) {
      memoryStore[key] = parsed
      return parsed
    }
    return memoryStore[key] ?? []
  } catch {
    return memoryStore[key] ?? []
  }
}

const localWrite = (key, items) => {
  memoryStore[key] = items

  if (typeof window === 'undefined') {
    return true
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(items))
    return true
  } catch (error) {
    console.warn('localStorage write fallback to memory', error)
    return false
  }
}

export const getCachedRsvps = () => sortByNewest(localRead(RSVP_KEY))

export const getCachedMessages = () => sortByNewest(localRead(MESSAGES_KEY))

export async function listRsvps() {
  const localItems = sortByNewest(localRead(RSVP_KEY))

  if (!hasSupabase) {
    return localItems
  }

  try {
    const { data, error } = await withTimeout(
      supabase.from('rsvps').select('*').order('created_at', { ascending: false }),
    )

    if (error) {
      throw error
    }

    const merged = sortByNewest(dedupeById([...(data ?? []), ...localItems]))
    localWrite(RSVP_KEY, merged)
    return merged
  } catch (error) {
    console.warn('RSVP fallback to localStorage', error)
    return localItems
  }
}

export async function saveRsvp(payload) {
  const record = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    ...payload,
  }

  const current = localRead(RSVP_KEY)
  const next = sortByNewest(dedupeById([record, ...current]))
  localWrite(RSVP_KEY, next)

  if (hasSupabase) {
    try {
      const { error } = await withTimeout(supabase.from('rsvps').upsert(record))

      if (error) {
        throw error
      }
    } catch (error) {
      console.warn('RSVP remote sync failed, kept locally', error)
    }
  }

  return record
}

export async function listMessages() {
  const localItems = sortByNewest(localRead(MESSAGES_KEY))

  if (!hasSupabase) {
    return localItems
  }

  try {
    const { data, error } = await withTimeout(
      supabase.from('messages').select('*').order('created_at', { ascending: false }),
    )

    if (error) {
      throw error
    }

    const merged = sortByNewest(dedupeById([...(data ?? []), ...localItems]))
    localWrite(MESSAGES_KEY, merged)
    return merged
  } catch (error) {
    console.warn('Messages fallback to localStorage', error)
    return localItems
  }
}

export async function saveMessage(payload) {
  const record = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    ...payload,
  }

  const current = localRead(MESSAGES_KEY)
  const next = sortByNewest(dedupeById([record, ...current]))
  localWrite(MESSAGES_KEY, next)

  if (hasSupabase) {
    try {
      const { error } = await withTimeout(supabase.from('messages').upsert(record))

      if (error) {
        throw error
      }
    } catch (error) {
      console.warn('Messages remote sync failed, kept locally', error)
    }
  }

  return record
}
