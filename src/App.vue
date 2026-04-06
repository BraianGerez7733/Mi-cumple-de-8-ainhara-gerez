<script setup>
import { onMounted } from 'vue'
import FooterSection from './sections/FooterSection.vue'
import FinalCtaSection from './sections/FinalCtaSection.vue'
import GameSection from './sections/GameSection.vue'
import HeroSection from './sections/HeroSection.vue'
import InvitationSection from './sections/InvitationSection.vue'
import MessageWallSection from './sections/MessageWallSection.vue'
import RsvpSection from './sections/RsvpSection.vue'
import { eventData } from './data/event'
import { useGuestbook } from './composables/useGuestbook'
import { useRsvp } from './composables/useRsvp'
import { useScrollReveal } from './composables/useScrollReveal'

const guestbook = useGuestbook()
const rsvp = useRsvp()

useScrollReveal()

onMounted(() => {
  document.title = 'Invitacion de cumpleanos | Capibaras y princesa'
  const description = document.querySelector('meta[name="description"]')
  if (description) {
    description.setAttribute(
      'content',
      'Invitacion interactiva de cumpleanos infantil con confirmacion de asistencia, muro de mensajes y mini juego de capibara.',
    )
  }
})
</script>

<template>
  <main class="relative overflow-hidden pb-4">
    <div
      class="absolute inset-x-0 top-0 -z-10 h-[40rem] bg-hero-glow"
      aria-hidden="true"
    ></div>

    <div class="container-shell pt-4">
      <div class="flex items-center justify-between rounded-full bg-white/75 px-4 py-3 shadow-card backdrop-blur">
        <div>
          <p class="font-display text-2xl font-extrabold text-ink">{{ eventData.celebrant }}</p>
          <p class="text-sm font-semibold text-glam/80">{{ eventData.supportText }}</p>
        </div>
        <a
          href="#rsvp"
          class="rounded-full bg-glam px-4 py-2 text-sm font-extrabold text-white shadow-soft transition hover:-translate-y-0.5"
        >
          RSVP
        </a>
      </div>
    </div>

    <HeroSection />
    <InvitationSection />
    <RsvpSection :rsvp="rsvp" />
    <MessageWallSection :guestbook="guestbook" />
    <GameSection />
    <FinalCtaSection />
    <FooterSection />
  </main>
</template>
