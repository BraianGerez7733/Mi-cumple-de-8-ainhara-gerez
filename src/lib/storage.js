const RSVP_KEY = 'ainhara-birthday-rsvp'
const MESSAGES_KEY = 'ainhara-birthday-messages'

const memoryStore = {
  [RSVP_KEY]: [],
  [MESSAGES_KEY]: [],
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

// --- RSVPs ---
export async function listRsvps() {
  const localItems = sortByNewest(localRead(RSVP_KEY))
  try {
    const res = await fetch('/api/rsvps')
    if (!res.ok) throw new Error('API Error')
    const data = await res.json()
    const merged = sortByNewest(dedupeById([...data, ...localItems]))
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

  try {
    const res = await fetch('/api/rsvps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    })
    if (!res.ok) throw new Error('API Error')
  } catch (error) {
    console.warn('RSVP remota sync falló', error)
    throw new Error('Sync failed')
  }

  const current = localRead(RSVP_KEY)
  const next = sortByNewest(dedupeById([record, ...current]))
  localWrite(RSVP_KEY, next)

  return record
}

// --- Mensajes ---
export async function listMessages() {
  const localItems = sortByNewest(localRead(MESSAGES_KEY))
  try {
    const res = await fetch('/api/messages')
    if (!res.ok) throw new Error('API Error')
    const data = await res.json()
    const merged = sortByNewest(dedupeById([...data, ...localItems]))
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

  try {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    })
    if (!res.ok) throw new Error('API Error')
  } catch (error) {
    console.warn('Messages remote sync falló', error)
    throw new Error('Sync failed')
  }

  const current = localRead(MESSAGES_KEY)
  const next = sortByNewest(dedupeById([record, ...current]))
  localWrite(MESSAGES_KEY, next)

  return record
}

// --- Leaderboard ---
export async function listTopScores() {
  try {
    const res = await fetch('/api/scores')
    if (!res.ok) throw new Error('API Error')
    return await res.json()
  } catch (error) {
    console.warn('Leaderboard fetch failed', error)
    return []
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

  try {
    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    })
    if (!res.ok) throw new Error('API Error')
  } catch (error) {
    console.warn('Score remote sync falló', error)
    return null
  }

  return record
}
