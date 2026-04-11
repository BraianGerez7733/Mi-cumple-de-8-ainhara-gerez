import './style.css'
import { createClient } from '@supabase/supabase-js'

// ============================================================
// SUPABASE
// ============================================================
const SUPA_URL = import.meta.env.VITE_SUPABASE_URL
const SUPA_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = (SUPA_URL && SUPA_KEY) ? createClient(SUPA_URL, SUPA_KEY) : null

// ============================================================
// SECTION 1: ANTI-GRAVITY — física vanilla pura
// ============================================================
function initGravity() {
  const canvas  = document.getElementById('gravity-canvas')
  const ctx     = canvas.getContext('2d')
  const section = document.getElementById('gravity')

  let W = section.offsetWidth  || window.innerWidth
  let H = section.offsetHeight || window.innerHeight
  canvas.width  = W
  canvas.height = H

  const GRAV     = 0.14
  const FRICTION = 0.995
  const BOUNCE   = 0.52
  const ITEMS    = ['🎀','🎁','🌈','⭐','🦋','🌸','💖','🧁','🎈','🐾','✨','🍭','🦄','🍰','🌺','💫','🌟','🎊','🍬']

  let particles = []
  let gravDir   = 1

  function makeParticle(emoji, x, y) {
    return {
      emoji,
      size : 36 + Math.random() * 22,
      x    : x  ?? (30 + Math.random() * (W - 60)),
      y    : y  ?? -(30 + Math.random() * 80),
      vx   : (Math.random() - 0.5) * 3,
      vy   : Math.random() * 2,
      angle: Math.random() * Math.PI * 2,
      av   : (Math.random() - 0.5) * 0.08
    }
  }

  function spawnEmoji(emoji, x, y) {
    particles.push(makeParticle(emoji, x, y))
    if (particles.length > 80) particles.shift()
  }

  // Birthday card
  const CARD_W = Math.min(340, W * 0.82)
  const CARD_H = 130
  const card = {
    x: W / 2, y: -(CARD_H / 2 + 20),
    vx: (Math.random() - 0.5) * 1.5, vy: 0.5,
    angle: (Math.random() - 0.5) * 0.25,
    av: (Math.random() - 0.5) * 0.012,
    anchored: false,
    anchorStarted: false
  }
  const ANCHOR_DELAY = 8000   // ms hasta que el cartel se centra
  const cardStartTime = performance.now()

  function updateParticle(p) {
    p.vy += GRAV * gravDir
    p.vx *= FRICTION; p.vy *= FRICTION
    p.x  += p.vx;     p.y  += p.vy
    p.angle += p.av
    const r = p.size / 2
    if (gravDir ===  1 && p.y + r > H) { p.y = H - r; p.vy *= -BOUNCE; p.av *= 0.8 }
    if (gravDir === -1 && p.y - r < 0) { p.y = r;     p.vy *= -BOUNCE; p.av *= 0.8 }
    if (p.x - r < 0) { p.x = r;     p.vx =  Math.abs(p.vx) * BOUNCE }
    if (p.x + r > W) { p.x = W - r; p.vx = -Math.abs(p.vx) * BOUNCE }
    if (gravDir ===  1 && p.y - r > H + 100) p.y = -50
    if (gravDir === -1 && p.y + r < -100)    p.y = H + 50
  }

  function updateCard() {
    if (card === dragging) return  // no update if being dragged

    const elapsed = performance.now() - cardStartTime

    if (!card.anchored && elapsed > ANCHOR_DELAY) {
      card.anchored = true
    }

    if (card.anchored) {
      // Resorte suave hacia el centro
      const tx = W / 2
      const ty = H / 2
      const k = 0.028           // fuerza del resorte
      const damp = 0.88         // amortiguación
      card.vx += (tx - card.x) * k
      card.vy += (ty - card.y) * k
      card.vx *= damp
      card.vy *= damp
      card.x  += card.vx
      card.y  += card.vy
      // Enderezar ángulo hacia 0
      card.av += (0 - card.angle) * 0.06
      card.av *= 0.80
      card.angle += card.av
    } else {
      // Física normal
      card.vy += GRAV * gravDir * 0.35
      card.vx *= FRICTION; card.vy *= FRICTION
      card.x  += card.vx;  card.y  += card.vy
      card.angle += card.av; card.av *= 0.97
      const hW = CARD_W / 2, hH = CARD_H / 2
      if (gravDir ===  1 && card.y + hH > H)   { card.y = H - hH; card.vy *= -BOUNCE * 0.7; card.av *= 0.6 }
      if (gravDir === -1 && card.y - hH < 0)   { card.y = hH;     card.vy *= -BOUNCE * 0.7; card.av *= 0.6 }
      if (card.x - hW < 0) { card.x = hW;     card.vx =  Math.abs(card.vx) * BOUNCE }
      if (card.x + hW > W) { card.x = W - hW; card.vx = -Math.abs(card.vx) * BOUNCE }
    }
  }

  function drawBg() {
    const g = ctx.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, '#fff0fb'); g.addColorStop(1, '#ede9fe')
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
  }

  function drawParticles() {
    particles.forEach(p => {
      ctx.save()
      ctx.translate(p.x, p.y); ctx.rotate(p.angle)
      if (p === dragging) { ctx.shadowColor = '#ff6fb7'; ctx.shadowBlur = 16 }
      ctx.font = `${p.size}px serif`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(p.emoji, 0, 0)
      ctx.restore()
    })
  }

  function drawCard() {
    ctx.save()
    ctx.translate(card.x, card.y); ctx.rotate(card.angle)
    ctx.shadowColor = 'rgba(214,58,138,0.2)'; ctx.shadowBlur = 18
    const grd = ctx.createLinearGradient(-CARD_W/2, -CARD_H/2, CARD_W/2, CARD_H/2)
    grd.addColorStop(0, 'rgba(255,255,255,0.94)')
    grd.addColorStop(1, 'rgba(255,215,245,0.90)')
    ctx.fillStyle = grd
    ctx.beginPath(); ctx.roundRect(-CARD_W/2, -CARD_H/2, CARD_W, CARD_H, 22); ctx.fill()
    ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,111,183,0.55)'; ctx.lineWidth = 2; ctx.stroke()
    const fs = Math.min(26, CARD_W / 8)
    ctx.font = `900 ${fs}px Fredoka One, cursive`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    const tg = ctx.createLinearGradient(-70, 0, 70, 0)
    tg.addColorStop(0, '#d63a8a'); tg.addColorStop(1, '#7c3aed')
    ctx.fillStyle = tg
    ctx.fillText('¡Feliz Cumpleaños Ainhara!', 0, -26)
    ctx.font = `bold ${Math.round(fs*0.68)}px Nunito,sans-serif`
    ctx.fillStyle = '#7c3aed'; ctx.fillText('🎀 8 Añitos mágicos 🎀', 0, 16)
    ctx.font = `${Math.round(fs*0.52)}px Nunito,sans-serif`
    ctx.fillStyle = '#b06cd0'; ctx.fillText('¡Tocá todo para jugar! ✨', 0, 48)
    ctx.restore()
  }

  // Drag
  let dragging = null, dragOffX = 0, dragOffY = 0

  function getPos(e) {
    const rect = canvas.getBoundingClientRect()
    const src  = e.touches ? e.touches[0] : e
    return { x: (src.clientX - rect.left) * (W / rect.width), y: (src.clientY - rect.top) * (H / rect.height) }
  }

  function hitTest(px, py) {
    if (Math.abs(px - card.x) < CARD_W/2+4 && Math.abs(py - card.y) < CARD_H/2+4) return card
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i], r = p.size/2+4
      if ((px-p.x)**2 + (py-p.y)**2 < r*r) return p
    }
    return null
  }

  function startDrag(obj, p) {
    dragging = obj; dragOffX = p.x - obj.x; dragOffY = p.y - obj.y
    obj._px = obj.x; obj._py = obj.y
  }
  function moveDrag(p) {
    if (!dragging) return
    dragging._px = dragging.x; dragging._py = dragging.y
    dragging.x = p.x - dragOffX; dragging.y = p.y - dragOffY
  }
  function endDrag() {
    if (!dragging) return
    dragging.vx = (dragging.x - (dragging._px ?? dragging.x)) * 0.4
    dragging.vy = (dragging.y - (dragging._py ?? dragging.y)) * 0.4
    dragging.av = (Math.random() - 0.5) * 0.04
    // If the card was anchored and dragged, keep its anchor but let spring pull it back
    if (dragging === card && card.anchored) {
      card.vx *= 0.3; card.vy *= 0.3
    }
    dragging = null
  }

  canvas.addEventListener('mousedown',  e => { const p=getPos(e); const h=hitTest(p.x,p.y); if(h){startDrag(h,p);canvas.style.cursor='grabbing'} })
  canvas.addEventListener('mousemove',  e => { moveDrag(getPos(e)); if(!dragging) canvas.style.cursor=hitTest(getPos(e).x,getPos(e).y)?'grab':'default' })
  canvas.addEventListener('mouseup',    () => { endDrag(); canvas.style.cursor='default' })
  canvas.addEventListener('mouseleave', () => endDrag())
  canvas.addEventListener('touchstart', e => { const p=getPos(e); const h=hitTest(p.x,p.y); if(h){e.preventDefault();startDrag(h,p)} }, {passive:false})
  canvas.addEventListener('touchmove',  e => { if(dragging){e.preventDefault();moveDrag(getPos(e))} }, {passive:false})
  canvas.addEventListener('touchend',   () => endDrag(), {passive:true})

  function loop() {
    requestAnimationFrame(loop)
    particles.forEach(p => { if(p !== dragging) updateParticle(p) })
    if (card !== dragging) updateCard()
    ctx.clearRect(0, 0, W, H)
    drawBg(); drawParticles(); drawCard()
  }
  requestAnimationFrame(loop)

  // Spawn inicial
  ITEMS.forEach((emoji, i) => setTimeout(() => spawnEmoji(emoji), i * 90))

  window.addEventListener('resize', () => {
    W = section.offsetWidth || window.innerWidth
    H = section.offsetHeight || window.innerHeight
    canvas.width = W; canvas.height = H
  })

  let gravUp = false
  document.getElementById('toggle-gravity').addEventListener('click', () => {
    gravUp = !gravUp; gravDir = gravUp ? -1 : 1
    document.getElementById('toggle-gravity').textContent = gravUp ? '⬇️ Gravedad Normal' : '⬆️ Anti-Gravedad'
    particles.forEach(p => { p.vy = gravUp ? -3 : 2; p.vx = (Math.random()-0.5)*4 })
    card.vy = gravUp ? -3 : 2
  })
  document.getElementById('rain-hearts').addEventListener('click', () => {
    const s = ['💖','💗','💕','💞','💓','🌸','✨','🦋','💝','💘']
    for (let i=0; i<10; i++) setTimeout(() => spawnEmoji(s[i%s.length]), i*55)
  })
  document.getElementById('rain-gifts').addEventListener('click', () => {
    const s = ['🎁','🎀','🧁','🍭','🎈','⭐','🌈','🏆','🦄','🍰']
    for (let i=0; i<10; i++) setTimeout(() => spawnEmoji(s[i%s.length]), i*55)
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

  let state = 'idle', score = 0, lives = 3, level = 1
  let gameLoop = null, playerName = '', spawnTimer = 0, scrollX = 0

  const capy = {
    x: 80, y: H - 70, w: 52, h: 42, vy: 0, grounded: true,
    jump() { if (this.grounded) { this.vy = -10; this.grounded = false } }
  }

  const GROUND_Y = H - 50
  const obstacles = [], gifts = []
  let particles = []

  function spawnObstacle() {
    const type = Math.random() > 0.5 ? 'puddle' : 'rock'
    obstacles.push(type === 'puddle'
      ? { x: W+20, y: GROUND_Y+10, w: 50, h: 18, type }
      : { x: W+20, y: GROUND_Y-28, w: 22, h: 30, type })
  }
  function spawnGift() { gifts.push({ x: W+20, y: GROUND_Y-50-Math.random()*60, collected: false }) }

  function particle(x, y, emoji) {
    for (let i=0; i<6; i++) particles.push({ x, y, vx:(Math.random()-.5)*5, vy:-Math.random()*4, life:1, emoji, size:14+Math.random()*8 })
  }

  function collides(a, b) { return a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y }

  function drawGround() {
    ctx.fillStyle='#86efac'; ctx.fillRect(0,GROUND_Y+20,W,H-GROUND_Y-20)
    ctx.fillStyle='#4ade80'; ctx.fillRect(0,GROUND_Y+18,W,4)
    ctx.fillStyle='#22c55e'
    for (let i=0;i<10;i++) { const x=((i*55-scrollX*.8)%W+W)%W; ctx.beginPath();ctx.arc(x,GROUND_Y+25,3,0,Math.PI*2);ctx.fill() }
    const sky=ctx.createLinearGradient(0,0,0,GROUND_Y)
    sky.addColorStop(0,'#e0e7ff'); sky.addColorStop(1,'#f5e8ff')
    ctx.fillStyle=sky; ctx.fillRect(0,0,W,GROUND_Y+20)
    for (let i=0;i<3;i++) {
      const cx=((i*180+60-scrollX*.2)%(W+100)+W+100)%(W+100)-50
      ctx.fillStyle='rgba(255,255,255,0.85)'
      ctx.beginPath(); ctx.ellipse(cx,50+i*25,40,20,0,0,Math.PI*2); ctx.fill()
      ctx.beginPath(); ctx.ellipse(cx+20,42+i*25,28,16,0,0,Math.PI*2); ctx.fill()
    }
  }

  function drawCapy() {
    const x=capy.x, y=capy.y
    ctx.fillStyle='rgba(0,0,0,0.1)'; ctx.beginPath(); ctx.ellipse(x+capy.w/2,GROUND_Y+18,22,7,0,0,Math.PI*2); ctx.fill()
    ctx.fillStyle='#c8a46e'; ctx.beginPath(); ctx.roundRect(x,y+14,capy.w,capy.h-14,14); ctx.fill()
    ctx.fillStyle='#c8a46e'; ctx.beginPath(); ctx.ellipse(x+capy.w-16,y+16,18,15,0.1,0,Math.PI*2); ctx.fill()
    ctx.fillStyle='#b8936a'; ctx.beginPath(); ctx.ellipse(x+capy.w+2,y+20,8,6,0,0,Math.PI*2); ctx.fill()
    ctx.fillStyle='#3d1f00'; ctx.beginPath(); ctx.arc(x+capy.w-8,y+13,3.5,0,Math.PI*2); ctx.fill()
    ctx.fillStyle='white';   ctx.beginPath(); ctx.arc(x+capy.w-7,y+12,1.2,0,Math.PI*2); ctx.fill()
    ctx.fillStyle='#ec4899'; ctx.beginPath(); ctx.moveTo(x+capy.w-16,y+2); ctx.lineTo(x+capy.w-28,y-20); ctx.lineTo(x+capy.w-4,y-20); ctx.closePath(); ctx.fill()
    ctx.fillStyle='#fde68a'; ctx.beginPath(); ctx.arc(x+capy.w-16,y+2,7,0,Math.PI*2); ctx.fill()
    const lo=capy.grounded?Math.sin(scrollX*.15)*4:0; ctx.fillStyle='#b8936a'
    ctx.beginPath(); ctx.roundRect(x+8,y+capy.h-8,10,16+lo,4); ctx.fill()
    ctx.beginPath(); ctx.roundRect(x+22,y+capy.h-8,10,12-lo,4); ctx.fill()
    ctx.beginPath(); ctx.roundRect(x+capy.w-22,y+capy.h-8,10,12+lo,4); ctx.fill()
    ctx.beginPath(); ctx.roundRect(x+capy.w-10,y+capy.h-8,10,16-lo,4); ctx.fill()
  }

  function drawObstacles() {
    obstacles.forEach(o => {
      if (o.type==='puddle') {
        ctx.fillStyle='#6b7280'; ctx.beginPath(); ctx.ellipse(o.x+o.w/2,o.y+o.h/2,o.w/2,o.h/2,0,0,Math.PI*2); ctx.fill()
        ctx.fillStyle='rgba(100,116,139,0.5)'; ctx.beginPath(); ctx.ellipse(o.x+o.w/2,o.y+o.h/2,o.w/2-5,o.h/2-3,0,0,Math.PI*2); ctx.fill()
      } else {
        ctx.fillStyle='#78716c'; ctx.beginPath(); ctx.roundRect(o.x,o.y,o.w,o.h,4); ctx.fill()
        ctx.fillStyle='#a8a29e'; ctx.fillRect(o.x+4,o.y+6,6,4)
      }
    })
  }

  function drawGifts() {
    gifts.forEach(g => { if(!g.collected){ctx.font='22px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🎁',g.x,g.y)} })
  }

  function drawParticlesGame() {
    particles.forEach(p => { ctx.globalAlpha=p.life; ctx.font=`${p.size}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(p.emoji,p.x,p.y) })
    ctx.globalAlpha=1
  }

  function drawHUD() {
    if(state!=='playing') return
    ctx.fillStyle='rgba(45,31,61,0.7)'; ctx.beginPath(); ctx.roundRect(10,10,130,36,20); ctx.fill()
    ctx.fillStyle='white'; ctx.font='bold 14px Nunito,sans-serif'; ctx.textAlign='left'; ctx.textBaseline='middle'
    ctx.fillText(`⭐ ${score}   ❤️ ${lives}`,20,28)
  }

  function update() {
    if(state!=='playing') return
    scrollX += 4+level*.5; spawnTimer++
    const interval=Math.max(40,100-level*8)
    if(spawnTimer%interval===0) spawnObstacle()
    if(spawnTimer%120===0) spawnGift()
    capy.vy+=0.6; capy.y+=capy.vy
    if(capy.y>=GROUND_Y-capy.h){capy.y=GROUND_Y-capy.h;capy.vy=0;capy.grounded=true}
    const speed=4+level*.5
    for(let i=obstacles.length-1;i>=0;i--){
      obstacles[i].x-=speed
      if(obstacles[i].x<-80){obstacles.splice(i,1);continue}
      if(collides({x:capy.x+4,y:capy.y+4,w:capy.w-8,h:capy.h-8},obstacles[i])){
        obstacles.splice(i,1); lives--
        particle(capy.x+capy.w/2,capy.y,'💥')
        document.getElementById('lives-display').textContent=lives
        if(lives<=0){state='gameover';showGameOver()}
      }
    }
    for(let i=gifts.length-1;i>=0;i--){
      gifts[i].x-=speed*.8
      if(gifts[i].x<-40){gifts.splice(i,1);continue}
      if(!gifts[i].collected){
        const gBox={x:gifts[i].x-14,y:gifts[i].y-14,w:28,h:28}
        if(collides({x:capy.x,y:capy.y,w:capy.w,h:capy.h},gBox)){
          gifts[i].collected=true; score+=10*level
          particle(gifts[i].x,gifts[i].y,'✨')
          document.getElementById('score-display').textContent=score
          if(score%100===0&&score>0){level++;document.getElementById('level-display').textContent=level}
        }
      }
    }
    particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=0.15;p.life-=0.04})
    particles=particles.filter(p=>p.life>0)
  }

  function draw() {
    ctx.clearRect(0,0,W,H)
    drawGround(); drawGifts(); drawObstacles(); drawCapy(); drawParticlesGame(); drawHUD()
  }

  function tick(){update();draw();gameLoop=requestAnimationFrame(tick)}

  function showGameOver() {
    cancelAnimationFrame(gameLoop)
    document.getElementById('game-over-overlay').classList.remove('hidden')
    document.getElementById('overlay-title').textContent=score>100?'¡Increíble, Capy!':'¡Bien jugado!'
    document.getElementById('overlay-score').textContent=`Puntaje: ${score} puntos`
    if(supabase&&playerName){
      supabase.from('juego_puntuaciones').insert({nombre_jugador:playerName,puntuacion:score}).then(()=>loadRanking())
    }
  }

  function startGame() {
    playerName=document.getElementById('player-name').value.trim()||'Invitado'
    score=0;lives=3;level=1;obstacles.length=0;gifts.length=0;particles=[]
    capy.y=GROUND_Y-capy.h;capy.vy=0;capy.grounded=true
    spawnTimer=0;scrollX=0;state='playing'
    document.getElementById('player-setup').classList.add('hidden')
    document.getElementById('game-stats').classList.remove('hidden')
    document.getElementById('game-over-overlay').classList.add('hidden')
    document.getElementById('score-display').textContent=0
    document.getElementById('lives-display').textContent=3
    document.getElementById('level-display').textContent=1
    cancelAnimationFrame(gameLoop);tick()
  }

  document.getElementById('start-game-btn').addEventListener('click', startGame)
  document.getElementById('play-again-btn').addEventListener('click', () => {
    document.getElementById('player-setup').classList.remove('hidden')
    document.getElementById('game-stats').classList.add('hidden')
    document.getElementById('game-over-overlay').classList.add('hidden')
    state='idle';cancelAnimationFrame(gameLoop);draw()
  })

  const jump=()=>{if(state==='playing')capy.jump()}
  canvas.addEventListener('click',jump)
  canvas.addEventListener('touchstart',e=>{e.preventDefault();jump()},{passive:false})
  document.addEventListener('keydown',e=>{
    const tag=document.activeElement?.tagName
    if(tag==='INPUT'||tag==='TEXTAREA') return
    if(e.code==='Space'||e.code==='ArrowUp'){e.preventDefault();jump()}
  })
  draw()
}

// ============================================================
// SECTION 3: MESSAGES
// ============================================================
const MSG_COLORS=['','blue','pink','mint']
const ROTATIONS=['-2deg','1.5deg','-1deg','2.5deg','-0.5deg','1deg']

function formatDate(iso){
  if(!iso) return ''
  try{return new Intl.DateTimeFormat('es-AR',{day:'2-digit',month:'short'}).format(new Date(iso))}catch{return ''}
}

function createMsgCard(msg,idx){
  const div=document.createElement('article')
  div.className=`message-card ${MSG_COLORS[idx%4]}`
  div.style.setProperty('--rot',ROTATIONS[idx%6])
  div.innerHTML=`<h4>${escapeHtml(msg.name)}</h4><p>${escapeHtml(msg.message)}</p>${msg.created_at?`<div class="msg-date">${formatDate(msg.created_at)}</div>`:''}`
  return div
}

async function loadMessages(){
  const wall=document.getElementById('messages-wall')
  if(!supabase){wall.innerHTML='<div class="wall-loading">Conéctate a internet para ver mensajes 🌐</div>';return}
  try{
    const{data,error}=await supabase.from('messages').select('*').order('created_at',{ascending:false}).limit(50)
    if(error) throw error
    wall.innerHTML=''
    // Filtrar los mensajes de prueba que no se pueden borrar por seguridad de la base de datos (RLS)
    const hiddenIds = ['1ea21128-a39a-4a22-ae2f-fe0c7a2725bd', 'b0cda649-b27b-4d25-8843-4631e60b1098', 'dc2cd935-e017-4677-a88b-50bec6ac0352', 'f5c4cbbb-9208-41c6-a724-df61e58eae2b']
    const validData = (data || []).filter(m => !hiddenIds.includes(m.id))
    
    if(!validData||validData.length===0){wall.innerHTML='<div class="wall-loading">¡Sé el primero en dejar un mensaje! 💌</div>';return}
    validData.forEach((msg,i)=>wall.appendChild(createMsgCard(msg,i)))
  }catch(err){console.error(err);wall.innerHTML='<div class="wall-loading">Error al cargar mensajes 😢</div>'}
}

function initMessages(){
  loadMessages()
  document.getElementById('send-message-btn').addEventListener('click',async()=>{
    const name=document.getElementById('msg-name').value.trim()
    const message=document.getElementById('msg-text').value.trim()
    const fb=document.getElementById('msg-feedback')
    fb.className='form-feedback'
    if(!name||!message){fb.textContent='¡Escribí tu nombre y mensaje! 💕';fb.classList.add('error');return}
    const btn=document.getElementById('send-message-btn')
    btn.disabled=true;btn.textContent='Enviando... ✨'
    try{
      if(supabase){const{error}=await supabase.from('messages').insert({name,message});if(error)throw error}
      fb.textContent='¡Mensaje enviado! Ainhara lo va a adorar 💖';fb.classList.add('success')
      document.getElementById('msg-name').value=''
      document.getElementById('msg-text').value=''
      await loadMessages()
    }catch(err){fb.textContent='Error al enviar. Intenta de nuevo 😢';fb.classList.add('error');console.error(err)}
    finally{btn.disabled=false;btn.textContent='💖 Enviar mensaje'}
  })
}

// ============================================================
// SECTION 4: RSVP
// ============================================================
async function loadRsvp(){
  const list=document.getElementById('rsvp-list')
  if(!supabase){list.innerHTML='<div class="wall-loading">Sin conexión 🌐</div>';return}
  try{
    const{data,error}=await supabase.from('rsvps').select('*').order('created_at',{ascending:false}).limit(50)
    if(error) throw error
    let yes=0,no=0
    list.innerHTML=''
    ;(data||[]).forEach(r=>{
      if(r.attendance==='yes') yes++
      else if(r.attendance==='no') no++
      const card=document.createElement('div')
      card.className=`rsvp-card ${r.attendance}`
      const labels={yes:'🎉 Va',no:'😢 No puede'}
      card.innerHTML=`<span class="rsvp-badge ${r.attendance}">${labels[r.attendance]||r.attendance}</span><h4>${escapeHtml(r.name)}</h4>`
      list.appendChild(card)
    })
    if(!data||data.length===0) list.innerHTML='<div class="wall-loading">¡Sé el primero en confirmar! 🎈</div>'
    document.getElementById('count-yes').textContent=yes
    document.getElementById('count-no').textContent=no
  }catch(err){list.innerHTML='<div class="wall-loading">Error al cargar 😢</div>';console.error(err)}
}

function initRsvp(){
  loadRsvp()
  document.getElementById('send-rsvp-btn').addEventListener('click',async()=>{
    const name=document.getElementById('rsvp-name').value.trim()
    const attendance=document.querySelector('input[name="attendance"]:checked')?.value
    const fb=document.getElementById('rsvp-feedback')
    fb.className='form-feedback'
    if(!name){fb.textContent='¡Escribí tu nombre! 💕';fb.classList.add('error');return}
    if(!attendance){fb.textContent='¡Elegí si vas o no! 🎈';fb.classList.add('error');return}
    const btn=document.getElementById('send-rsvp-btn')
    btn.disabled=true;btn.textContent='Guardando... ✨'
    try{
      if(supabase){const{error}=await supabase.from('rsvps').insert({name,attendance});if(error)throw error}
      const msgs={yes:'¡Genial! Te esperamos 🎉',no:'Gracias por avisar 💕'}
      fb.textContent=msgs[attendance]||'Respuesta guardada 💖';fb.classList.add('success')
      document.getElementById('rsvp-name').value=''
      document.getElementById('rsvp-msg').value=''
      document.querySelectorAll('input[name="attendance"]').forEach(r=>r.checked=false)
      await loadRsvp()
    }catch(err){fb.textContent='Error al guardar. Intenta de nuevo 😢';fb.classList.add('error');console.error(err)}
    finally{btn.disabled=false;btn.textContent='✅ Confirmar asistencia'}
  })
}

// ============================================================
// SECTION 5: RANKING
// ============================================================
async function loadRanking(){
  const board=document.getElementById('ranking-board')
  if(!supabase){board.innerHTML='<div class="wall-loading">Sin conexión 🌐</div>';return}
  try{
    const{data,error}=await supabase.from('juego_puntuaciones').select('*').order('puntuacion',{ascending:false}).limit(10)
    if(error) throw error
    board.innerHTML=''
    const medals=['🥇','🥈','🥉']
    if(!data||data.length===0){board.innerHTML='<div class="wall-loading">¡Juega y aparece aquí! 🐾</div>';return}
    data.forEach((row,i)=>{
      const card=document.createElement('div')
      card.className='rank-card'
      card.innerHTML=`<div class="rank-medal">${medals[i]||'🐾'}</div><div class="rank-name">${escapeHtml(row.nombre_jugador)}</div><div class="rank-score">${row.puntuacion} pts</div>`
      board.appendChild(card)
    })
  }catch(err){board.innerHTML='<div class="wall-loading">Error al cargar el ranking 😢</div>';console.error(err)}
}

// ============================================================
// SECTION 6: CAROUSEL
// ============================================================
function initCarousel() {
  let slideIndex = 1;
  const slides = document.getElementsByClassName("carousel-slide");
  const dots = document.getElementsByClassName("dot");
  
  if (!slides.length) return;

  function showSlides(n) {
    if (n > slides.length) slideIndex = 1;
    if (n < 1) slideIndex = slides.length;
    for (let i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
    }
    for (let i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(" active", "");
    }
    slides[slideIndex - 1].style.display = "block";
    if (dots.length > 0) dots[slideIndex - 1].className += " active";
  }

  showSlides(slideIndex);

  document.getElementById('c-prev')?.addEventListener('click', () => {
    showSlides(slideIndex -= 1);
  });
  
  document.getElementById('c-next')?.addEventListener('click', () => {
    showSlides(slideIndex += 1);
  });

  Array.from(dots).forEach(dot => {
    dot.addEventListener('click', (e) => {
      const idx = parseInt(e.target.getAttribute('data-slide'));
      if (idx) showSlides(slideIndex = idx);
    });
  });

  // Autoplay
  setInterval(() => {
    showSlides(slideIndex += 1);
  }, 4000);
}

// ============================================================
// UTILITY
// ============================================================
function escapeHtml(str){
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded',()=>{
  initGravity()
  initGame()
  initMessages()
  initRsvp()
  loadRanking()
  initCarousel()
})
