<script setup>
import BaseButton from '../components/BaseButton.vue'
</script>

<template>
  <section class="container-shell mt-8 sm:mt-12">
    <div
      data-reveal
      class="reveal overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,rgba(236,72,153,0.9),rgba(249,168,212,0.96),rgba(245,215,142,0.95))] px-5 py-8 text-white shadow-soft sm:px-8"
    >
      <div class="max-w-2xl">
        <p class="font-display text-lg font-bold text-white/90">Nos encantará compartir este día</p>
        <h2 class="mt-3 font-display text-4xl font-extrabold leading-tight">
          ¡Te esperamos con mucho cariño!
        </h2>
        <p class="mt-4 text-base leading-8 text-white/90">
          Gracias por visitar esta invitación. No te olvides de confirmar asistencia y dejarnos un mensaje bonito.
        </p>
      </div>

      <div class="mt-7 flex flex-col gap-3 sm:flex-row">
        <BaseButton
          href="#rsvp"
          variant="gold"
        >
          Confirmar asistencia
        </BaseButton>
        <BaseButton
          href="#mensajes"
          variant="secondary"
        >
          Dejar mensaje
        </BaseButton>
      </div>
    </div>
  </section>
</template>
