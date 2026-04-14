import './style.css'

const landing = document.querySelector('.landing-shell')

if (landing) {
  const emojis = ['🎈', '✨', '🌈', '🎵', '💖', '🫧', '⭐']

  for (let i = 0; i < 18; i += 1) {
    const bubble = document.createElement('span')
    bubble.className = 'floating-confetti'
    bubble.textContent = emojis[i % emojis.length]
    bubble.style.left = `${Math.random() * 100}%`
    bubble.style.animationDelay = `${Math.random() * 8}s`
    bubble.style.animationDuration = `${8 + Math.random() * 6}s`
    bubble.style.fontSize = `${1.2 + Math.random() * 1.8}rem`
    landing.appendChild(bubble)
  }
}
