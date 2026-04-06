<script setup>
import BaseCard from '../components/BaseCard.vue'
import SectionHeading from '../components/SectionHeading.vue'
import { eventData } from '../data/event'

const cards = [
  {
    title: 'Fecha',
    value: eventData.date,
    detail: 'Reserva este dia para una fiesta adorable y llena de sonrisas.',
    tone: 'blush',
  },
  {
    title: 'Tematica',
    value: eventData.theme,
    detail: 'Una mezcla tierna de capibaras suaves, coronitas y brillo festivo.',
    tone: 'default',
  },
  {
    title: 'Nota',
    value: 'Detalles por mensaje',
    detail: eventData.detailNote,
    tone: 'gold',
  },
]
</script>

<template>
  <section
    id="invitacion"
    class="container-shell mt-8 sm:mt-12"
  >
    <div
      data-reveal
      class="section-frame reveal"
    >
      <SectionHeading
        eyebrow="Invitacion"
        :title="eventData.invitationTitle"
        :text="eventData.invitationText"
      />

      <div class="mt-8 grid gap-4 sm:grid-cols-3">
        <BaseCard
          v-for="card in cards"
          :key="card.title"
          :tone="card.tone"
        >
          <p class="text-sm font-bold uppercase tracking-[0.18em] text-glam/70">{{ card.title }}</p>
          <h3 class="mt-3 font-display text-2xl font-extrabold text-ink">{{ card.value }}</h3>
          <p class="mt-3 text-sm leading-7 text-ink/80">{{ card.detail }}</p>
        </BaseCard>
      </div>
    </div>
  </section>
</template>
