<script setup>
import BaseButton from '../components/BaseButton.vue'
import CapybaraIllustration from '../components/CapybaraIllustration.vue'
import FloatingDecorations from '../components/FloatingDecorations.vue'
import SparkleBadge from '../components/SparkleBadge.vue'
import { eventData } from '../data/event'
</script>

<template>
  <section class="relative overflow-hidden pt-6 sm:pt-8">
    <div class="container-shell">
      <div
        class="glass-panel relative overflow-hidden px-5 pb-8 pt-8 shadow-soft sm:px-8 sm:pb-10 sm:pt-10"
      >
        <FloatingDecorations />

        <div class="relative z-10 grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
          <div class="max-w-2xl">
            <SparkleBadge />
            <div class="mt-4 inline-flex rounded-full bg-gold px-4 py-2 text-sm font-extrabold text-ink shadow-card">
              Invitación actualizada
            </div>

            <h1
              class="mt-5 font-display text-[2.4rem] font-extrabold leading-none text-ink sm:text-6xl"
            >
              {{ eventData.title }}
            </h1>

            <p class="mt-4 text-lg font-bold text-glam sm:text-2xl">
              {{ eventData.subtitle }}
            </p>

            <p class="mt-5 max-w-xl text-base leading-8 text-ink/85 sm:text-lg">
              {{ eventData.description }}
            </p>

            <div class="mt-8 flex flex-col gap-3 sm:flex-row">
              <BaseButton href="#rsvp">Confirmar asistencia</BaseButton>
              <BaseButton
                href="#mensajes"
                variant="secondary"
              >
                Dejar mensaje
              </BaseButton>
            </div>

            <div class="mt-8 grid grid-cols-2 gap-3 sm:max-w-md">
              <div class="rounded-[1.5rem] bg-white/85 p-4 shadow-card ring-1 ring-white/70">
                <p class="text-sm font-bold uppercase tracking-[0.2em] text-glam/70">Fecha</p>
                <p class="mt-2 font-display text-2xl font-extrabold text-ink">
                  {{ eventData.date }}
                </p>
              </div>
              <div class="rounded-[1.5rem] bg-white/85 p-4 shadow-card ring-1 ring-white/70">
                <p class="text-sm font-bold uppercase tracking-[0.2em] text-glam/70">Tema</p>
                <p class="mt-2 font-display text-2xl font-extrabold text-ink">
                  Capibaras y princesa
                </p>
              </div>
            </div>
          </div>

          <div class="relative">
            <div
              class="absolute inset-x-8 top-12 -z-10 h-[76%] rounded-full bg-[radial-gradient(circle,rgba(245,215,142,0.72),rgba(249,168,212,0.18),transparent_72%)] blur-2xl"
            ></div>
            <CapybaraIllustration />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
