import sqlite3 from 'sqlite3'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Creamos o nos conectamos al archivo local
const db = new sqlite3.Database(join(__dirname, 'database.sqlite'), (err) => {
  if (err) {
    console.error('Error connecting to local SQLite', err)
  } else {
    console.log('Connected to SQLite local database.')
  }
})

// Inicializamos las tablas
db.serialize(() => {
  // Tabla de RSVPs
  db.run(`
    CREATE TABLE IF NOT EXISTS rsvps (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      attendance TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Tabla de Mensajes
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Tabla de Puntuaciones (Leaderboard)
  db.run(`
    CREATE TABLE IF NOT EXISTS scores (
      id TEXT PRIMARY KEY,
      nombre_jugador TEXT NOT NULL,
      puntuacion INTEGER NOT NULL,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
})

export default db
