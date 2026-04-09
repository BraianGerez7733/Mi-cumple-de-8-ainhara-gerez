import { hasSupabase, supabase } from './supabase'

const RSVP_KEY = 'ainhara-birthday-rsvp'
const MESSAGES_KEY = 'ainhara-birthday-messages'
const SCORES_KEY = 'ainhara-birthday-scores'
const REMOTE_TIMEOUT_MS = 3500

const memoryStore = {
  [RSVP_KEY]: [],
  [MESSAGES_KEY]: [],
  [SCORES_KEY]: [],
}

const sortByNewest = (items) =>
  [...items].sort((a, b) => new Date(b.created_at || b.creado_en).getTime() - new Date(a.created_at || a.creado_en).getTime())

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
  if (typeof window === 'undefined') return memoryStore[key] ?? []
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
  if (typeof window === 'undefined') return true
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
  if (!hasSupabase) return localItems

  try {
    const { data, error } = await withTimeout(
      supabase.from('rsvps').select('*').order('created_at', { ascending: false }),
    )
    if (error) throw error
    const merged = sortByNewest(dedupeById([...(data ?? []), ...localItems]))
    localWrite(RSVP_KEY, merged)
    return merged
  } catch (error) {
    console.warn('RSVP fallback to localStorage', error)
    return localItems
  }
}

export async function saveRsvp(payload) {
  const fallbackId = Math.random().toString(36).substring(2) + Date.now().toString(36)
  const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : fallbackId

  const record = { id, created_at: new Date().toISOString(), ...payload }

  if (hasSupabase) {
    const { error } = await withTimeout(supabase.from('rsvps').insert(record))
    if (error) {
      console.warn('RSVP remota sync falló', error)
      throw new Error('Supabase sync failed')
    }
  }

  const current = localRead(RSVP_KEY)
  const next = sortByNewest(dedupeById([record, ...current]))
  localWrite(RSVP_KEY, next)

  return record
}

export async function listMessages() {
  const localItems = sortByNewest(localRead(MESSAGES_KEY))
  if (!hasSupabase) return localItems

  try {
    const { data, error } = await withTimeout(
      supabase.from('messages').select('*').order('created_at', { ascending: false }),
    )
    if (error) throw error
    const merged = sortByNewest(dedupeById([...(data ?? []), ...localItems]))
    localWrite(MESSAGES_KEY, merged)
    return merged
  } catch (error) {
    console.warn('Messages fallback to localStorage', error)
    return localItems
  }
}

export async function saveMessage(payload) {
  const fallbackId = Math.random().toString(36).substring(2) + Date.now().toString(36)
  const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : fallbackId

  const record = { id, created_at: new Date().toISOString(), ...payload }

  if (hasSupabase) {
    const { error } = await withTimeout(supabase.from('messages').insert(record))
    if (error) {
      console.warn('Messages remote sync falló', error)
      throw new Error('Supabase sync failed')
    }
  }

  const current = localRead(MESSAGES_KEY)
  const next = sortByNewest(dedupeById([record, ...current]))
  localWrite(MESSAGES_KEY, next)

  return record
}

export async function listTopScores() {
  const localItems = [...localRead(SCORES_KEY)].sort((a, b) => b.puntuacion - a.puntuacion).slice(0, 5)
  if (!hasSupabase) return localItems

  try {
    const { data, error } = await withTimeout(
      supabase.from('juego_puntuaciones').select('*').order('puntuacion', { ascending: false }).limit(5)
    )
    if (error) throw error
    const mergedData = dedupeById([...(data ?? []), ...localItems])
    const bestFive = mergedData.sort((a, b) => b.puntuacion - a.puntuacion).slice(0, 5)
    localWrite(SCORES_KEY, bestFive)
    return bestFive
  } catch (error) {
    console.warn('Leaderboard fetch failed', error)
    return localItems
  }
}

export async function saveScore(payload) {
  const fallbackId = Math.random().toString(36).substring(2) + Date.now().toString(36)
  const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : fallbackId

  const record = {
    id,
    creado_en: new Date().toISOString(),
    nombre_jugador: payload.nombre_jugador,
    puntuacion: payload.puntuacion
  }

  if (hasSupabase) {
    const { error } = await withTimeout(supabase.from('juego_puntuaciones').insert(record))
    if (error) {
      console.warn('Score remote sync falló', error)
      return null
    }
  }

  const current = localRead(SCORES_KEY)
  const merged = dedupeById([record, ...current])
  const bestFive = merged.sort((a, b) => b.puntuacion - a.puntuacion).slice(0, 5)
  localWrite(SCORES_KEY, bestFive)

  return record
}
