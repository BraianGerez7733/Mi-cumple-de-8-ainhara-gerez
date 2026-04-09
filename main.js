import './style.css'
import Matter from 'matter-js'
import { createClient } from '@supabase/supabase-js'

// ============================================================
// SUPABASE CLIENT
// ============================================================
const SUPA_URL = import.meta.env.VITE_SUPABASE_URL
const SUPA_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = (SUPA_URL && SUPA_KEY) ? createClient(SUPA_URL, SUPA_KEY) : null

// ============================================================
// SECTION 1: ANTI-GRAVITY WORLD
// ============================================================
function initGravity() {
  const canvas = document.getElementById('gravity-canvas')
  // Use actual pixel dimensions, fallback to window size
  const W = canvas.offsetWidth || window.innerWidth
  const H = canvas.offsetHeight || window.innerHeight
  canvas.width = W
  canvas.height = H

  const engine = Matter.Engine.create()
  const render = Matter.Render.create({
    canvas,
    engine,
    options: { width: W, height: H, wireframes: false, background: 'transparent' }
  })

  // Emoji objects with custom rendering
  const ITEMS = ['🎀','🎁','🌈','⭐','🦋','🌸','💖','🧁','🎈','🐾','✨','🍭']
  const bodies = []

  const wall = (x, y, w, h) => Matter.Bodies.rectangle(x, y, w, h, { isStatic: true, render: { visible: false } })
  const ground = wall(W/2, H+30, W*2, 60)
  const wallL = wall(-30, H/2, 60, H*2)
  const wallR = wall(W+30, H/2, 60, H*2)
  const ceiling = wall(W/2, -30, W*2, 60)
  Matter.World.add(engine.world, [ground, wallL, wallR, ceiling])

  // Create emoji physics bodies
  function spawnEmoji(emoji, x, y) {
    const size = 40 + Math.random() * 20
    const body = Matter.Bodies.circle(
      x ?? Math.random() * W,
      y ?? -50,
      size / 2,
      {
        restitution: 0.8,
        friction: 0.2,
        frictionAir: 0.01,
        density: 0.002,
        render: { visible: false }
      }
    )
    body._emoji = emoji
    body._size = size
    Matter.World.add(engine.world, body)
    bodies.push(body)
    if (bodies.length > 80) {
      Matter.World.remove(engine.world, bodies.shift())
    }
    return body
  }

  // Spawn initial items
  for (let i = 0; i < 20; i++) {
    setTimeout(() => spawnEmoji(ITEMS[i % ITEMS.length]), i * 150)
  }

  // Mouse interaction
  const mouse = Matter.Mouse.create(canvas)
  const mouseConstraint = Matter.MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.3, render: { visible: false } }
  })
  Matter.World.add(engine.world, mouseConstraint)
  render.mouse = mouse
  mouse.element.removeEventListener('mousewheel', mouse.mousewheel)
  mouse.element.removeEventListener('DOMMouseScroll', mouse.mousewheel)

  // HTML canvas overlay for emoji rendering
  const ctx = canvas.getContext('2d')

  Matter.Events.on(render, 'afterRender', () => {
    bodies.forEach(b => {
      ctx.save()
      ctx.translate(b.position.x, b.position.y)
      ctx.rotate(b.angle)
      ctx.font = `${b._size}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(b._emoji, 0, 0)
      ctx.restore()
    })
  })

  Matter.Render.run(render)
  const runner = Matter.Runner.create()
  Matter.Runner.run(runner, engine)

  // Resize handling
  function resize() {
    const nW = canvas.offsetWidth
    const nH = canvas.offsetHeight
    render.canvas.width = nW; render.canvas.height = nH
    render.options.width = nW; render.options.height = nH
    Matter.Body.setPosition(ground, { x: nW/2, y: nH+30 })
    Matter.Body.setPosition(wallR, { x: nW+30, y: nH/2 })
  }
  window.addEventListener('resize', resize)

  // Controls
  let gravityUp = false
  document.getElementById('toggle-gravity').addEventListener('click', () => {
    gravityUp = !gravityUp
    engine.world.gravity.y = gravityUp ? -0.8 : 1
    document.getElementById('toggle-gravity').textContent = gravityUp ? '⬇️ Gravedad Normal' : '⬆️ Anti-Gravedad'
    bodies.forEach(b => Matter.Body.setVelocity(b, { x: (Math.random()-0.5)*5, y: gravityUp ? -8 : 5 }))
  })

  document.getElementById('rain-hearts').addEventListener('click', () => {
    const hearts = ['💖','💗','💕','💞','💓','🌸','✨','🦋']
    for (let i = 0; i < 8; i++) {
      setTimeout(() => spawnEmoji(hearts[Math.floor(Math.random()*hearts.length)]), i * 80)
    }
  })

  document.getElementById('rain-gifts').addEventListener('click', () => {
    const gifts = ['🎁','🎀','🧁','🍭','🎈','⭐','🌈','🏆']
    for (let i = 0; i < 8; i++) {
      setTimeout(() => spawnEmoji(gifts[Math.floor(Math.random()*gifts.length)]), i * 80)
    }
  })
}

// ============================================================
// SECTION 2: CAPYBARA RUNNER GAME
// ============================================================
function initGame() {
  const canvas = document.getElementById('game-canvas')
  const ctx = canvas.getContext('2d')

  const W = 500, H = 300
  canvas.width = W; canvas.height = H

  let state = 'idle'
  let score = 0
  let lives = 3
  let level = 1
  let gameLoop = null
  let playerName = ''
  let spawnTimer = 0
  let scrollX = 0

  // Capybara player
  const capy = {
    x: 80, y: H - 70, w: 52, h: 42,
    vy: 0, grounded: true,
    jump() {
      if (this.grounded) { this.vy = -10; this.grounded = false }
    }
  }

  const GROUND_Y = H - 50
  const obstacles = []  // { x, y, w, h, type: 'puddle'|'rock' }
  const gifts = []      // { x, y, collected }
  let particles = []

  function spawnObstacle() {
    const type = Math.random() > 0.5 ? 'puddle' : 'rock'
    if (type === 'puddle') {
      obstacles.push({ x: W + 20, y: GROUND_Y + 10, w: 50, h: 18, type })
    } else {
      obstacles.push({ x: W + 20, y: GROUND_Y - 28, w: 22, h: 30, type })
    }
  }

  function spawnGift() {
    gifts.push({ x: W + 20, y: GROUND_Y - 50 - Math.random() * 60, collected: false })
  }

  function particle(x, y, color, emoji) {
    for (let i = 0; i < 6; i++) {
      particles.push({
        x, y, vx: (Math.random()-0.5)*5, vy: -Math.random()*4,
        life: 1, color, emoji, size: 14 + Math.random()*8
      })
    }
  }

  function collides(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  }

  function drawGround(ctx) {
    // Grass strip
    ctx.fillStyle = '#86efac'
    ctx.fillRect(0, GROUND_Y + 20, W, H - GROUND_Y - 20)
    // Ground line
    ctx.fillStyle = '#4ade80'
    ctx.fillRect(0, GROUND_Y + 18, W, 4)
    // Scrolling ground dots
    ctx.fillStyle = '#22c55e'
    for (let i = 0; i < 10; i++) {
      const x = ((i * 55 - scrollX * 0.8) % W + W) % W
      ctx.beginPath(); ctx.arc(x, GROUND_Y + 25, 3, 0, Math.PI*2); ctx.fill()
    }
    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y)
    sky.addColorStop(0, '#e0e7ff')
    sky.addColorStop(1, '#f5e8ff')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, W, GROUND_Y + 20)

    // Clouds
    for (let i = 0; i < 3; i++) {
      const cx = ((i * 180 + 60 - scrollX * 0.2) % (W + 100) + W + 100) % (W + 100) - 50
      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      ctx.beginPath()
      ctx.ellipse(cx, 50 + i*25, 40, 20, 0, 0, Math.PI*2); ctx.fill()
      ctx.beginPath()
      ctx.ellipse(cx+20, 42 + i*25, 28, 16, 0, 0, Math.PI*2); ctx.fill()
    }
  }

  function drawCapy(ctx) {
    const x = capy.x, y = capy.y

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.1)'
    ctx.beginPath(); ctx.ellipse(x + capy.w/2, GROUND_Y + 18, 22, 7, 0, 0, Math.PI*2); ctx.fill()

    // Body
    ctx.fillStyle = '#c8a46e'
    ctx.beginPath(); ctx.roundRect(x, y + 14, capy.w, capy.h - 14, 14); ctx.fill()

    // Head
    ctx.fillStyle = '#c8a46e'
    ctx.beginPath(); ctx.ellipse(x + capy.w - 16, y + 16, 18, 15, 0.1, 0, Math.PI*2); ctx.fill()

    // Snout
    ctx.fillStyle = '#b8936a'
    ctx.beginPath(); ctx.ellipse(x + capy.w + 2, y + 20, 8, 6, 0, 0, Math.PI*2); ctx.fill()

    // Eye
    ctx.fillStyle = '#3d1f00'
    ctx.beginPath(); ctx.arc(x + capy.w - 8, y + 13, 3.5, 0, Math.PI*2); ctx.fill()
    ctx.fillStyle = 'white'
    ctx.beginPath(); ctx.arc(x + capy.w - 7, y + 12, 1.2, 0, Math.PI*2); ctx.fill()

    // Party hat
    ctx.fillStyle = '#ec4899'
    ctx.beginPath()
    ctx.moveTo(x + capy.w - 16, y + 2)
    ctx.lineTo(x + capy.w - 28, y - 20)
    ctx.lineTo(x + capy.w - 4, y - 20)
    ctx.closePath(); ctx.fill()
    ctx.fillStyle = '#fde68a'
    ctx.beginPath(); ctx.arc(x + capy.w - 16, y + 2, 7, 0, Math.PI*2); ctx.fill()

    // Legs
    const legOff = capy.grounded ? Math.sin(scrollX * 0.15) * 4 : 0
    ctx.fillStyle = '#b8936a'
    ctx.beginPath(); ctx.roundRect(x + 8, y + capy.h - 8, 10, 16 + legOff, 4); ctx.fill()
    ctx.beginPath(); ctx.roundRect(x + 22, y + capy.h - 8, 10, 12 - legOff, 4); ctx.fill()
    ctx.beginPath(); ctx.roundRect(x + capy.w - 22, y + capy.h - 8, 10, 12 + legOff, 4); ctx.fill()
    ctx.beginPath(); ctx.roundRect(x + capy.w - 10, y + capy.h - 8, 10, 16 - legOff, 4); ctx.fill()
  }

  function drawObstacles(ctx) {
    obstacles.forEach(o => {
      if (o.type === 'puddle') {
        ctx.fillStyle = '#6b7280'
        ctx.beginPath(); ctx.ellipse(o.x + o.w/2, o.y + o.h/2, o.w/2, o.h/2, 0, 0, Math.PI*2); ctx.fill()
        ctx.fillStyle = 'rgba(100,116,139,0.5)'
        ctx.beginPath(); ctx.ellipse(o.x + o.w/2, o.y + o.h/2, o.w/2 - 5, o.h/2 - 3, 0, 0, Math.PI*2); ctx.fill()
      } else {
        ctx.fillStyle = '#78716c'
        ctx.beginPath(); ctx.roundRect(o.x, o.y, o.w, o.h, 4); ctx.fill()
        ctx.fillStyle = '#a8a29e'
        ctx.fillRect(o.x + 4, o.y + 6, 6, 4)
      }
    })
  }

  function drawGifts(ctx) {
    gifts.forEach(g => {
      if (g.collected) return
      ctx.font = '22px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('🎁', g.x, g.y)
    })
  }

  function drawParticles(ctx) {
    particles.forEach(p => {
      ctx.globalAlpha = p.life
      ctx.font = `${p.size}px serif`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(p.emoji, p.x, p.y)
    })
    ctx.globalAlpha = 1
  }

  function drawHUD(ctx) {
    if (state !== 'playing') return
    ctx.fillStyle = 'rgba(45,31,61,0.7)'
    ctx.beginPath(); ctx.roundRect(10, 10, 130, 36, 20); ctx.fill()
    ctx.fillStyle = 'white'; ctx.font = 'bold 14px Nunito, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
    ctx.fillText(`⭐ ${score}   ❤️ ${lives}`, 20, 28)
  }

  function update() {
    if (state !== 'playing') return
    scrollX += 4 + level * 0.5
    spawnTimer++
    const interval = Math.max(40, 100 - level * 8)
    if (spawnTimer % interval === 0) spawnObstacle()
    if (spawnTimer % 120 === 0) spawnGift()

    // Capy physics
    capy.vy += 0.6
    capy.y += capy.vy
    if (capy.y >= GROUND_Y - capy.h) {
      capy.y = GROUND_Y - capy.h; capy.vy = 0; capy.grounded = true
    }

    // Move obstacles
    const speed = 4 + level * 0.5
    for (let i = obstacles.length - 1; i >= 0; i--) {
      obstacles[i].x -= speed
      if (obstacles[i].x < -80) { obstacles.splice(i, 1); continue }
      if (collides({ x: capy.x+4, y: capy.y+4, w: capy.w-8, h: capy.h-8 }, obstacles[i])) {
        obstacles.splice(i, 1)
        lives--
        particle(capy.x + capy.w/2, capy.y, 'red', '💥')
        document.getElementById('lives-display').textContent = lives
        if (lives <= 0) { state = 'gameover'; showGameOver() }
      }
    }

    // Move gifts
    for (let i = gifts.length - 1; i >= 0; i--) {
      gifts[i].x -= speed * 0.8
      if (gifts[i].x < -40) { gifts.splice(i, 1); continue }
      if (!gifts[i].collected) {
        const gBox = { x: gifts[i].x - 14, y: gifts[i].y - 14, w: 28, h: 28 }
        if (collides({ x: capy.x, y: capy.y, w: capy.w, h: capy.h }, gBox)) {
          gifts[i].collected = true
          score += 10 * level
          particle(gifts[i].x, gifts[i].y, 'gold', '✨')
          document.getElementById('score-display').textContent = score
          if (score % 100 === 0 && score > 0) {
            level++; document.getElementById('level-display').textContent = level
          }
        }
      }
    }

    // Particles
    particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life -= 0.04 })
    particles = particles.filter(p => p.life > 0)
  }

  function draw() {
    ctx.clearRect(0, 0, W, H)
    drawGround(ctx)
    drawGifts(ctx)
    drawObstacles(ctx)
    drawCapy(ctx)
    drawParticles(ctx)
    drawHUD(ctx)
  }

  function tick() {
    update(); draw()
    gameLoop = requestAnimationFrame(tick)
  }

  function showGameOver() {
    cancelAnimationFrame(gameLoop)
    document.getElementById('game-over-overlay').classList.remove('hidden')
    document.getElementById('overlay-title').textContent = score > 100 ? '¡Increíble, Capy!' : '¡Bien jugado!'
    document.getElementById('overlay-score').textContent = `Puntaje: ${score} puntos`
    // Save score to Supabase
    if (supabase && playerName) {
      supabase.from('juego_puntuaciones').insert({ nombre_jugador: playerName, puntuacion: score })
        .then(() => loadRanking())
    }
  }

  function startGame() {
    playerName = document.getElementById('player-name').value.trim() || 'Invitado'
    score = 0; lives = 3; level = 1; obstacles.length = 0; gifts.length = 0; particles = []
    capy.y = GROUND_Y - capy.h; capy.vy = 0; capy.grounded = true
    spawnTimer = 0; scrollX = 0
    state = 'playing'
    document.getElementById('player-setup').classList.add('hidden')
    document.getElementById('game-stats').classList.remove('hidden')
    document.getElementById('game-over-overlay').classList.add('hidden')
    document.getElementById('score-display').textContent = 0
    document.getElementById('lives-display').textContent = 3
    document.getElementById('level-display').textContent = 1
    cancelAnimationFrame(gameLoop)
    tick()
  }

  // Controls
  document.getElementById('start-game-btn').addEventListener('click', startGame)
  document.getElementById('play-again-btn').addEventListener('click', () => {
    document.getElementById('player-setup').classList.remove('hidden')
    document.getElementById('game-stats').classList.add('hidden')
    document.getElementById('game-over-overlay').classList.add('hidden')
    state = 'idle'
    cancelAnimationFrame(gameLoop)
    draw()
  })

  const jump = () => { if (state === 'playing') capy.jump() }
  canvas.addEventListener('click', jump)
  canvas.addEventListener('touchstart', e => { e.preventDefault(); jump() }, { passive: false })
  // Only intercept Space/Arrow when NOT typing in an input or textarea
  document.addEventListener('keydown', e => {
    const tag = document.activeElement?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA') return
    if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump() }
  })

  // Initial draw
  draw()
}

// ============================================================
// SECTION 3: MESSAGES WALL
// ============================================================
const MSG_COLORS = ['', 'blue', 'pink', 'mint']
const ROTATIONS = ['-2deg', '1.5deg', '-1deg', '2.5deg', '-0.5deg', '1deg']

function formatDate(iso) {
  if (!iso) return ''
  try {
    return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short' }).format(new Date(iso))
  } catch { return '' }
}

function createMsgCard(msg, idx) {
  const div = document.createElement('article')
  div.className = `message-card ${MSG_COLORS[idx % 4]}`
  div.style.setProperty('--rot', ROTATIONS[idx % 6])
  div.innerHTML = `
    <h4>${escapeHtml(msg.name)}</h4>
    <p>${escapeHtml(msg.message)}</p>
    ${msg.created_at ? `<div class="msg-date">${formatDate(msg.created_at)}</div>` : ''}
  `
  return div
}

async function loadMessages() {
  const wall = document.getElementById('messages-wall')
  if (!supabase) {
    wall.innerHTML = '<div class="wall-loading">Conéctate a internet para ver mensajes 🌐</div>'
    return
  }
  try {
    const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(50)
    if (error) throw error
    wall.innerHTML = ''
    if (!data || data.length === 0) {
      wall.innerHTML = '<div class="wall-loading">¡Sé el primero en dejar un mensaje! 💌</div>'
      return
    }
    data.forEach((msg, i) => wall.appendChild(createMsgCard(msg, i)))
  } catch (err) {
    console.error(err)
    wall.innerHTML = '<div class="wall-loading">Error al cargar mensajes 😢</div>'
  }
}

function initMessages() {
  loadMessages()
  document.getElementById('send-message-btn').addEventListener('click', async () => {
    const name = document.getElementById('msg-name').value.trim()
    const message = document.getElementById('msg-text').value.trim()
    const fb = document.getElementById('msg-feedback')

    fb.className = 'form-feedback'
    if (!name || !message) {
      fb.textContent = '¡Escribí tu nombre y mensaje! 💕'
      fb.classList.add('error'); return
    }

    const btn = document.getElementById('send-message-btn')
    btn.disabled = true; btn.textContent = 'Enviando... ✨'

    try {
      if (supabase) {
        const { error } = await supabase.from('messages').insert({ name, message })
        if (error) throw error
      }
      fb.textContent = '¡Mensaje enviado! Ainhara lo va a adorar 💖'
      fb.classList.add('success')
      document.getElementById('msg-name').value = ''
      document.getElementById('msg-text').value = ''
      await loadMessages()
    } catch (err) {
      fb.textContent = 'Error al enviar. Intenta de nuevo 😢'
      fb.classList.add('error')
      console.error(err)
    } finally {
      btn.disabled = false; btn.textContent = '💖 Enviar mensaje'
    }
  })
}

// ============================================================
// SECTION 4: RSVP
// ============================================================
async function loadRsvp() {
  const list = document.getElementById('rsvp-list')
  if (!supabase) { list.innerHTML = '<div class="wall-loading">Sin conexión 🌐</div>'; return }

  try {
    const { data, error } = await supabase.from('rsvps').select('*').order('created_at', { ascending: false }).limit(50)
    if (error) throw error

    let yes = 0, no = 0, maybe = 0
    list.innerHTML = ''
    ;(data || []).forEach(r => {
      if (r.attendance === 'yes') yes++
      else if (r.attendance === 'no') no++
      else maybe++
      const card = document.createElement('div')
      card.className = `rsvp-card ${r.attendance}`
      const labels = { yes: '🎉 Va', no: '😢 No puede', maybe: '🤔 Tal vez' }
      card.innerHTML = `
        <span class="rsvp-badge ${r.attendance}">${labels[r.attendance] || r.attendance}</span>
        <h4>${escapeHtml(r.name)}</h4>
        ${r.extra_message ? `<p>${escapeHtml(r.extra_message)}</p>` : ''}
      `
      list.appendChild(card)
    })
    if (!data || data.length === 0) list.innerHTML = '<div class="wall-loading">¡Sé el primero en confirmar! 🎈</div>'

    document.getElementById('count-yes').textContent = yes
    document.getElementById('count-no').textContent = no
    document.getElementById('count-maybe').textContent = maybe
  } catch (err) {
    list.innerHTML = '<div class="wall-loading">Error al cargar 😢</div>'
    console.error(err)
  }
}

function initRsvp() {
  loadRsvp()

  // Highlight radio choices
  document.querySelectorAll('.choice-card input').forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('.choice-card').forEach(c => c.style.background = '')
    })
  })

  document.getElementById('send-rsvp-btn').addEventListener('click', async () => {
    const name = document.getElementById('rsvp-name').value.trim()
    const attendance = document.querySelector('input[name="attendance"]:checked')?.value
    const extra_message = document.getElementById('rsvp-msg').value.trim()
    const fb = document.getElementById('rsvp-feedback')

    fb.className = 'form-feedback'
    if (!name) { fb.textContent = '¡Escribí tu nombre! 💕'; fb.classList.add('error'); return }
    if (!attendance) { fb.textContent = '¡Elegí si vas o no! 🎈'; fb.classList.add('error'); return }

    const btn = document.getElementById('send-rsvp-btn')
    btn.disabled = true; btn.textContent = 'Guardando... ✨'

    try {
      if (supabase) {
        // Table only has: id, name, attendance, created_at
        const { error } = await supabase.from('rsvps').insert({ name, attendance })
        if (error) throw error
      }
      const msgs = { yes: '¡Genial! Te esperamos 🎉', no: 'Gracias por avisar 💕', maybe: '¡Ojalá puedas venir! 🤞' }
      fb.textContent = msgs[attendance] || 'Respuesta guardada 💖'
      fb.classList.add('success')
      document.getElementById('rsvp-name').value = ''
      document.getElementById('rsvp-msg').value = ''
      document.querySelectorAll('input[name="attendance"]').forEach(r => r.checked = false)
      await loadRsvp()
    } catch (err) {
      fb.textContent = 'Error al guardar. Intenta de nuevo 😢'; fb.classList.add('error')
      console.error(err)
    } finally {
      btn.disabled = false; btn.textContent = '✅ Confirmar asistencia'
    }
  })
}

// ============================================================
// SECTION 5: RANKING
// ============================================================
async function loadRanking() {
  const board = document.getElementById('ranking-board')
  if (!supabase) { board.innerHTML = '<div class="wall-loading">Sin conexión 🌐</div>'; return }

  try {
    const { data, error } = await supabase.from('juego_puntuaciones').select('*').order('puntuacion', { ascending: false }).limit(10)
    if (error) throw error

    board.innerHTML = ''
    const medals = ['🥇','🥈','🥉']
    if (!data || data.length === 0) {
      board.innerHTML = '<div class="wall-loading">¡Juega y aparece aquí! 🐾</div>'
      return
    }
    data.forEach((row, i) => {
      const card = document.createElement('div')
      card.className = 'rank-card'
      card.innerHTML = `
        <div class="rank-medal">${medals[i] || '🐾'}</div>
        <div class="rank-name">${escapeHtml(row.nombre_jugador)}</div>
        <div class="rank-score">${row.puntuacion} pts</div>
      `
      board.appendChild(card)
    })
  } catch (err) {
    board.innerHTML = '<div class="wall-loading">Error al cargar el ranking 😢</div>'
    console.error(err)
  }
}

// ============================================================
// UTILITY
// ============================================================
function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

// ============================================================
// INIT ALL
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initGravity()
  initGame()
  initMessages()
  initRsvp()
  loadRanking()
})
