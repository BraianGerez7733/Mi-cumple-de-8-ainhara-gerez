import './style.css'

const frequencies = {
  C4: 261.63,
  Db4: 277.18,
  D4: 293.66,
  Eb4: 311.13,
  E4: 329.63,
  F4: 349.23,
  Gb4: 369.99,
  G4: 392.0,
  Ab4: 415.3,
  A4: 440.0,
  Bb4: 466.16,
  B4: 493.88,
  C5: 523.25,
}

const noteNames = {
  C4: 'Do',
  Db4: 'Do sostenido',
  D4: 'Re',
  Eb4: 'Re sostenido',
  E4: 'Mi',
  F4: 'Fa',
  Gb4: 'Fa sostenido',
  G4: 'Sol',
  Ab4: 'Sol sostenido',
  A4: 'La',
  Bb4: 'La sostenido',
  B4: 'Si',
  C5: 'Do agudo',
}

const challenges = [
  'Probá esta fila: C - D - E - F',
  'Jugá a responder: G - A - G - E',
  'Hacé una mini fanfarria: C - G - A - C',
  'Tocá suave y rápido: E - F - G - A',
]

const keyElements = [...document.querySelectorAll('.piano-key')]
const lightWall = document.getElementById('light-wall')
const noteName = document.getElementById('note-name')
const lastKey = document.getElementById('last-key')
const challengeText = document.getElementById('challenge-text')
const modeButtons = [...document.querySelectorAll('.mode-button')]

let audioContext
let currentMode = 'rainbow'
let challengeIndex = 0
const pressedKeys = new Set()

const keyboardMap = new Map(
  keyElements.map((element) => [element.dataset.key.toLowerCase(), element])
)

function getAudioContext() {
  if (!audioContext) {
    audioContext = new window.AudioContext()
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }

  return audioContext
}

function playNote(note) {
  const context = getAudioContext()
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  const filter = context.createBiquadFilter()
  const now = context.currentTime

  oscillator.type = 'triangle'
  oscillator.frequency.value = frequencies[note]

  filter.type = 'lowpass'
  filter.frequency.value = 2200

  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.32, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9)

  oscillator.connect(filter)
  filter.connect(gain)
  gain.connect(context.destination)

  oscillator.start(now)
  oscillator.stop(now + 0.95)
}

function popLight(note, keyRect) {
  const glow = document.createElement('span')
  glow.className = `music-pop mode-${currentMode}`
  glow.textContent = currentMode === 'sparkle' ? '✦' : currentMode === 'bounce' ? '●' : '♪'

  const boardRect = lightWall.getBoundingClientRect()
  const x = keyRect.left - boardRect.left + keyRect.width / 2
  const y = keyRect.top - boardRect.top + keyRect.height / 2

  glow.style.left = `${x}px`
  glow.style.top = `${y}px`
  glow.style.setProperty('--pop-hue', `${Math.round(Math.random() * 360)}deg`)

  lightWall.appendChild(glow)
  window.setTimeout(() => glow.remove(), 900)

  noteName.textContent = `${noteNames[note]} (${note})`
  lastKey.textContent = `Sonó ${noteNames[note]} con la tecla ${note}`
}

function activateKey(element) {
  const note = element.dataset.note
  playNote(note)
  element.classList.add('active')
  const rect = element.getBoundingClientRect()
  popLight(note, rect)

  window.clearTimeout(element._releaseTimer)
  element._releaseTimer = window.setTimeout(() => {
    element.classList.remove('active')
  }, 180)
}

function advanceChallenge() {
  challengeIndex = (challengeIndex + 1) % challenges.length
  challengeText.textContent = challenges[challengeIndex]
}

function handlePress(element) {
  activateKey(element)

  if (Math.random() > 0.72) {
    advanceChallenge()
  }
}

for (const element of keyElements) {
  element.addEventListener('pointerdown', () => handlePress(element))
}

window.addEventListener('keydown', (event) => {
  if (event.repeat) return

  const element = keyboardMap.get(event.key.toLowerCase())
  if (!element || pressedKeys.has(event.key.toLowerCase())) return

  pressedKeys.add(event.key.toLowerCase())
  handlePress(element)
})

window.addEventListener('keyup', (event) => {
  pressedKeys.delete(event.key.toLowerCase())
})

for (const button of modeButtons) {
  button.addEventListener('click', () => {
    currentMode = button.id.replace('mode-', '')
    modeButtons.forEach((item) => item.classList.toggle('active', item === button))
    document.body.dataset.mode = currentMode
  })
}
