import { onMounted, onUnmounted } from 'vue'

export function useScrollReveal() {
  let observer

  onMounted(() => {
    const elements = document.querySelectorAll('[data-reveal]')

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.16 },
    )

    elements.forEach((element) => observer.observe(element))
  })

  onUnmounted(() => {
    observer?.disconnect()
  })
}
