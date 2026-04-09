<script setup>
import { computed, reactive } from 'vue'
import BaseButton from '../components/BaseButton.vue'
import BaseCard from '../components/BaseCard.vue'
import SectionHeading from '../components/SectionHeading.vue'

const props = defineProps({
  rsvp: {
    type: Object,
    required: true,
  },
})

const form = reactive({
  name: '',
  attendance: 'yes',
})

const errors = reactive({
  name: '',
})

const attendanceLabels = {
  yes: 'Si, voy a asistir',
  no: 'No puedo asistir',
  maybe: 'Todavía no sé',
}

const attendanceTone = {
  yes: 'bg-[#ecfdf3] text-[#17653a]',
  maybe: 'bg-[#fff6dd] text-[#8a5b00]',
  no: 'bg-[#ffe6ef] text-[#a03868]',
}

import { unref } from 'vue'

const visibleEntries = computed(() => unref(props.rsvp.entries).slice(0, 12))

const formatDate = (value) => {
  if (!value) return ''
  try {
    const d = new Date(value)
    if (isNaN(d.getTime())) return ''
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: 'short',
    }).format(d)
  } catch (e) {
    return ''
  }
}

const reset = () => {
  form.name = ''
  form.attendance = 'yes'
}

const handleSubmit = async () => {
  errors.name = ''

  if (!form.name.trim()) {
    errors.name = 'Por favor, escribi un nombre.'
    return
  }

  const saved = await props.rsvp.submit({
    name: form.name.trim(),
    attendance: form.attendance,
  })

  if (saved) {
    reset()
  }
}
</script>

<template>
  <section
    id="rsvp"
    class="container-shell mt-8 sm:mt-12"
  >
    <div
      data-reveal
      class="section-frame reveal"
    >
      <div class="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <SectionHeading
            eyebrow="RSVP"
            title="Confirmá tu asistencia"
            text="Nos encantaría saber si vas a venir. Por favor, dejá tu nombre y confirmá tu asistencia."
          />

          <div class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <BaseCard tone="blush">
              <p class="text-xs font-bold uppercase tracking-[0.18em] text-glam/70">Si van</p>
              <p class="mt-2 font-display text-3xl font-extrabold text-ink">{{ rsvp.summary.yes }}</p>
            </BaseCard>
            <BaseCard>
              <p class="text-xs font-bold uppercase tracking-[0.18em] text-glam/70">Aún no saben</p>
              <p class="mt-2 font-display text-3xl font-extrabold text-ink">{{ rsvp.summary.maybe }}</p>
            </BaseCard>
            <BaseCard tone="gold">
              <p class="text-xs font-bold uppercase tracking-[0.18em] text-glam/70">No pueden</p>
              <p class="mt-2 font-display text-3xl font-extrabold text-ink">{{ rsvp.summary.no }}</p>
            </BaseCard>
          </div>
        </div>

        <form
          class="rounded-[1.8rem] border border-white/90 bg-white/90 p-5 shadow-card"
          @submit.prevent="handleSubmit"
        >
          <label class="block">
            <span class="mb-2 block text-sm font-bold uppercase tracking-[0.18em] text-glam/70">
              Nombre
            </span>
            <input
              v-model="form.name"
              type="text"
              placeholder="Escribi tu nombre"
              class="w-full rounded-2xl border border-glam/15 bg-cream px-4 py-3.5 text-base text-ink outline-none transition focus:border-glam focus:ring-4 focus:ring-glam/10"
            />
            <span
              v-if="errors.name"
              class="mt-2 block text-sm font-semibold text-glam"
            >
              {{ errors.name }}
            </span>
          </label>

          <fieldset class="mt-5">
            <legend class="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-glam/70">
              ¿Vas a asistir?
            </legend>

            <div class="space-y-3">
              <label
                v-for="(label, value) in attendanceLabels"
                :key="value"
                class="flex cursor-pointer items-center gap-3 rounded-2xl border border-glam/12 bg-blush/35 px-4 py-3 transition hover:border-glam/35"
              >
                <input
                  v-model="form.attendance"
                  type="radio"
                  name="attendance"
                  :value="value"
                  class="h-5 w-5 border-glam text-glam focus:ring-glam/20"
                />
                <span class="font-semibold text-ink">{{ label }}</span>
              </label>
            </div>
          </fieldset>

          <div class="mt-6">
            <BaseButton
              type="submit"
              :disabled="rsvp.submitting"
              full
            >
              {{ rsvp.submitting ? 'Guardando...' : 'Guardar confirmacion' }}
            </BaseButton>
          </div>

          <p
            v-if="rsvp.feedback"
            class="mt-4 rounded-2xl bg-[#fff3c9] px-4 py-3 text-sm font-bold text-ink"
          >
            {{ rsvp.feedback }}
          </p>

          <p
            v-if="rsvp.error"
            class="mt-4 rounded-2xl bg-[#ffe1ec] px-4 py-3 text-sm font-bold text-glam"
          >
            {{ rsvp.error }}
          </p>
        </form>
      </div>

      <div class="mt-6 rounded-[1.8rem] border border-white/90 bg-blush/35 p-4 shadow-card sm:p-5">
        <div class="mb-4 flex items-center justify-between gap-3">
          <div>
            <p class="font-display text-2xl font-extrabold text-ink">Confirmaciones visibles</p>
            <p class="text-sm leading-6 text-ink/75">
              Aca se ven las respuestas guardadas de los invitados.
            </p>
          </div>
          <p class="rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-glam/70">
            {{ rsvp.entries.length }} respuestas
          </p>
        </div>

        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <article
            v-if="rsvp.loading"
            class="rounded-[1.5rem] bg-white/85 p-4 text-sm font-semibold text-ink/70"
          >
            Cargando confirmaciones...
          </article>

          <article
            v-for="entry in visibleEntries"
            :key="entry.id"
            class="rounded-[1.5rem] border border-white/90 bg-white/90 p-4 shadow-card"
          >
            <div class="flex flex-col items-start justify-between gap-3 sm:flex-row">
              <div>
                <h3 class="font-display text-xl font-bold text-ink">{{ entry.name }}</h3>
                <p class="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-glam/65">
                  Invitado
                </p>
              </div>
              <span
                class="rounded-full px-3 py-1 text-xs font-bold"
                :class="attendanceTone[entry.attendance]"
              >
                {{ attendanceLabels[entry.attendance] }}
              </span>
            </div>
            <p class="mt-4 text-sm font-semibold text-ink/65">
              Respondio el {{ formatDate(entry.created_at) }}
            </p>
          </article>

          <article
            v-if="!rsvp.loading && !rsvp.entries.length"
            class="rounded-[1.5rem] border border-dashed border-glam/30 bg-white/80 p-5 text-sm leading-7 text-ink/75"
          >
              Todavía no hay confirmaciones guardadas. La primera puede aparecer acá.
            </article>
          </div>
        </div>
      </div>
  </section>
</template>
