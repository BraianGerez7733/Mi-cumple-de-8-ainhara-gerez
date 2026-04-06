<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import BaseButton from '../components/BaseButton.vue'
import SectionHeading from '../components/SectionHeading.vue'

const canvasRef = ref(null)
const status = reactive({
  running: false,
  score: 0,
  best: 0,
})

const game = reactive({
  width: 320,
  height: 420,
  targetX: 160,
  lastSpawn: 0,
  lastFrame: 0,
  ended: false,
  items: [],
  player: {
    x: 160,
    y: 358,
    size: 28,
  },
})

let animationFrame = 0
const BEST_SCORE_KEY = 'ainhara-capybara-best-score'

const saveBestScore = (value) => {
  try {
    window.localStorage.setItem(BEST_SCORE_KEY, String(value))
  } catch (error) {
    console.warn('Best score could not be persisted', error)
  }
}

const readBestScore = () => {
  try {
    const saved = window.localStorage.getItem(BEST_SCORE_KEY)
    return saved ? Number(saved) || 0 : 0
  } catch (error) {
    console.warn('Best score could not be restored', error)
    return 0
  }
}

const drawRoundedRect = (ctx, x, y, width, height, radius) => {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + width - r, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + r)
  ctx.lineTo(x + width, y + height - r)
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
  ctx.lineTo(x + r, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

const bestLabel = computed(() => status.best)

const resizeCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const containerWidth = Math.min(canvas.parentElement?.clientWidth ?? 320, 420)
  game.width = containerWidth
  game.height = Math.max(380, Math.round(containerWidth * 1.08))
  canvas.width = game.width * window.devicePixelRatio
  canvas.height = game.height * window.devicePixelRatio
  canvas.style.width = `${game.width}px`
  canvas.style.height = `${game.height}px`
  const ctx = canvas.getContext('2d')
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0)
  game.player.y = game.height - 54
}

const spawnItem = () => {
  const kind = Math.random() > 0.23 ? 'gift' : 'mud'
  game.items.push({
    id: crypto.randomUUID(),
    kind,
    x: 34 + Math.random() * (game.width - 68),
    y: -24,
    size: kind === 'gift' ? 19 + Math.random() * 10 : 18 + Math.random() * 12,
    speed: kind === 'gift' ? 1.8 + Math.random() * 1.6 : 2.4 + Math.random() * 1.4,
    wobble: Math.random() * Math.PI * 2,
  })
}

const drawCapybara = (ctx, x, y) => {
  ctx.save()
  ctx.translate(x, y)

  ctx.fillStyle = '#B08968'
  ctx.beginPath()
  ctx.ellipse(0, 0, 22, 18, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#9B765A'
  ctx.beginPath()
  ctx.ellipse(-12, -13, 6, 8, 0, 0, Math.PI * 2)
  ctx.ellipse(12, -13, 6, 8, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#2B2229'
  ctx.beginPath()
  ctx.arc(-6, -2, 2.6, 0, Math.PI * 2)
  ctx.arc(6, -2, 2.6, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#F0D7C4'
  ctx.beginPath()
  ctx.ellipse(0, 5, 8, 6, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = '#5B4B5A'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(-4, 7)
  ctx.quadraticCurveTo(0, 10, 4, 7)
  ctx.stroke()

  ctx.fillStyle = '#F5D78E'
  ctx.beginPath()
  ctx.moveTo(-9, -23)
  ctx.lineTo(0, -37)
  ctx.lineTo(9, -23)
  ctx.closePath()
  ctx.fill()

  ctx.restore()
}

const drawGift = (ctx, item) => {
  if (item.kind === 'gift') {
    ctx.save()
    ctx.translate(item.x, item.y)
    ctx.fillStyle = '#F9A8D4'
    drawRoundedRect(ctx, -11, -9, 22, 18, 7)
    ctx.fill()
    ctx.fillStyle = '#FFF9FB'
    ctx.fillRect(-2, -9, 4, 18)
    ctx.fillRect(-11, -1, 22, 4)
    ctx.fillStyle = '#F5D78E'
    ctx.beginPath()
    ctx.arc(-4, -10, 4, 0, Math.PI * 2)
    ctx.arc(4, -10, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  } else {
    ctx.save()
    ctx.translate(item.x, item.y)
    ctx.fillStyle = '#B08968'
    ctx.beginPath()
    ctx.ellipse(0, 0, item.size * 0.72, item.size * 0.48, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(91,75,90,0.2)'
    ctx.beginPath()
    ctx.ellipse(0, 0, item.size * 0.45, item.size * 0.24, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

const draw = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  ctx.clearRect(0, 0, game.width, game.height)

  const gradient = ctx.createLinearGradient(0, 0, 0, game.height)
  gradient.addColorStop(0, '#FFF9FB')
  gradient.addColorStop(1, '#FCE7F3')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, game.width, game.height)

  ctx.fillStyle = 'rgba(245, 215, 142, 0.35)'
  ctx.beginPath()
  ctx.arc(56, 58, 38, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.arc(268, 70, 18, 0, Math.PI * 2)
  ctx.arc(244, 76, 15, 0, Math.PI * 2)
  ctx.arc(286, 78, 13, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#F5D78E'
  ctx.font = '18px "Baloo 2"'
  ctx.fillText('✦', 44, 64)

  ctx.fillStyle = '#EC4899'
  ctx.font = '16px "Nunito"'
  ctx.fillText(`Puntaje: ${status.score}`, 18, 28)
  ctx.fillText(`Record: ${status.best}`, game.width - 108, 28)

  game.items.forEach((item) => drawGift(ctx, item))
  drawCapybara(ctx, game.player.x, game.player.y)

  if (game.ended) {
    ctx.fillStyle = 'rgba(91, 75, 90, 0.3)'
    ctx.fillRect(0, 0, game.width, game.height)
    ctx.fillStyle = '#FFF9FB'
    ctx.textAlign = 'center'
    ctx.font = '700 28px "Baloo 2"'
    ctx.fillText('Fin del juego', game.width / 2, game.height / 2 - 6)
    ctx.font = '700 16px "Nunito"'
    ctx.fillText('Toca reiniciar para jugar otra vez', game.width / 2, game.height / 2 + 24)
    ctx.textAlign = 'left'
  }
}

const update = (timestamp) => {
  if (!status.running) return

  if (!game.lastFrame) {
    game.lastFrame = timestamp
  }

  const delta = Math.min((timestamp - game.lastFrame) / 16.67, 2.2)
  game.lastFrame = timestamp

  game.player.x += (game.targetX - game.player.x) * 0.12 * delta
  game.player.x = Math.max(28, Math.min(game.width - 28, game.player.x))

  if (timestamp - game.lastSpawn > 720) {
    spawnItem()
    game.lastSpawn = timestamp
  }

  game.items = game.items
    .map((item) => ({
      ...item,
      y: item.y + item.speed * delta,
      x: item.x + Math.sin(timestamp / 400 + item.wobble) * 0.55,
    }))
    .filter((item) => item.y < game.height + 32)

  game.items.forEach((item) => {
    const dx = item.x - game.player.x
    const dy = item.y - game.player.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance < game.player.size + item.size * 0.75) {
      if (item.kind === 'gift') {
        status.score += 1
        status.best = Math.max(status.best, status.score)
        saveBestScore(status.best)
      } else {
        game.ended = true
        status.running = false
      }
      item.y = game.height + 100
    }
  })

  draw()

  if (status.running) {
    animationFrame = requestAnimationFrame(update)
  } else {
    draw()
  }
}

const startGame = () => {
  cancelAnimationFrame(animationFrame)
  status.score = 0
  game.items = []
  game.lastSpawn = 0
  game.lastFrame = 0
  game.ended = false
  status.running = true
  animationFrame = requestAnimationFrame(update)
}

const resetGame = () => {
  cancelAnimationFrame(animationFrame)
  startGame()
}

const moveTo = (clientX) => {
  const rect = canvasRef.value?.getBoundingClientRect()
  if (!rect) return
  game.targetX = clientX - rect.left
}

onMounted(() => {
  status.best = readBestScore()
  resizeCanvas()
  draw()
  window.addEventListener('resize', resizeCanvas)
  startGame()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame)
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<template>
  <section
    id="juego"
    class="container-shell mt-8 sm:mt-12"
  >
    <div
      data-reveal
      class="section-frame reveal"
    >
      <div class="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionHeading
            eyebrow="Mini juego"
            title="Mini juego de capibara"
            text="Toca para mover a la capibara y junta la mayor cantidad de regalitos."
          />

          <div class="mt-6 rounded-[1.75rem] border border-white/90 bg-white/90 p-5 shadow-card">
            <p class="text-sm leading-7 text-ink/80">
              El objetivo es simple: mueve a la capibara con tu dedo, junta regalos rosados y evita los charquitos marrones.
            </p>

            <div class="mt-5 grid grid-cols-2 gap-3">
              <div class="rounded-2xl bg-blush/55 p-4">
                <p class="text-xs font-bold uppercase tracking-[0.16em] text-glam/70">Puntaje actual</p>
                <p class="mt-2 font-display text-3xl font-extrabold text-ink">{{ status.score }}</p>
              </div>
              <div class="rounded-2xl bg-[#fff6dd] p-4">
                <p class="text-xs font-bold uppercase tracking-[0.16em] text-glam/70">Mejor puntaje</p>
                <p class="mt-2 font-display text-3xl font-extrabold text-ink">{{ bestLabel }}</p>
              </div>
            </div>

            <div class="mt-5 flex flex-col gap-3 sm:flex-row">
              <BaseButton
                type="button"
                @click="resetGame"
              >
                Reiniciar
              </BaseButton>
              <BaseButton
                type="button"
                variant="secondary"
                @click="startGame"
              >
                Jugar otra vez
              </BaseButton>
            </div>
          </div>
        </div>

        <div class="rounded-[1.8rem] border border-white/90 bg-white/80 p-4 shadow-card">
          <canvas
            ref="canvasRef"
            class="mx-auto touch-none rounded-[1.6rem] border border-white/80 shadow-inner"
            @pointerdown="moveTo($event.clientX)"
            @pointermove="($event.pressure > 0 || $event.buttons === 1) && moveTo($event.clientX)"
            @touchstart.prevent="moveTo($event.touches[0].clientX)"
            @touchmove.prevent="moveTo($event.touches[0].clientX)"
          ></canvas>
        </div>
      </div>
    </div>
  </section>
</template>
