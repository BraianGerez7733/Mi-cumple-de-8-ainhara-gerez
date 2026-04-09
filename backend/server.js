import express from 'express'
import cors from 'cors'
import db from './db.js'

const app = express()
app.use(cors())
app.use(express.json())

const PORT = 3001

// RSVPS
app.get('/api/rsvps', (req, res) => {
  db.all('SELECT * FROM rsvps ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(rows)
  })
})

app.post('/api/rsvps', (req, res) => {
  const { id, name, attendance, created_at } = req.body
  const dateStr = created_at || new Date().toISOString()
  db.run(
    'INSERT INTO rsvps (id, name, attendance, created_at) VALUES (?, ?, ?, ?)',
    [id, name, attendance, dateStr],
    function (err) {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ success: true, id })
    }
  )
})

// Mensajes
app.get('/api/messages', (req, res) => {
  db.all('SELECT * FROM messages ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(rows)
  })
})

app.post('/api/messages', (req, res) => {
  const { id, name, message, created_at } = req.body
  const dateStr = created_at || new Date().toISOString()
  db.run(
    'INSERT INTO messages (id, name, message, created_at) VALUES (?, ?, ?, ?)',
    [id, name, message, dateStr],
    function (err) {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ success: true, id })
    }
  )
})

// Puntuaciones Top 5
app.get('/api/scores', (req, res) => {
  db.all('SELECT * FROM scores ORDER BY puntuacion DESC LIMIT 5', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(rows)
  })
})

app.post('/api/scores', (req, res) => {
  const { id, nombre_jugador, puntuacion, creado_en } = req.body
  const dateStr = creado_en || new Date().toISOString()
  db.run(
    'INSERT INTO scores (id, nombre_jugador, puntuacion, creado_en) VALUES (?, ?, ?, ?)',
    [id, nombre_jugador, puntuacion, dateStr],
    function (err) {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ success: true, id })
    }
  )
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[BACKEND] Servidor API local corriendo en http://localhost:${PORT}`)
})
