<script setup>
import { reactive } from 'vue'
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
  maybe: 'Todavia no se',
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
            title="Confirma tu asistencia"
            text="Nos encantaria saber si vas a venir. Por favor, deja tu nombre y confirma tu asistencia."
          />

          <div class="mt-6 grid grid-cols-3 gap-3">
            <BaseCard tone="blush">
              <p class="text-xs font-bold uppercase tracking-[0.18em] text-glam/70">Si van</p>
              <p class="mt-2 font-display text-3xl font-extrabold text-ink">{{ rsvp.summary.yes }}</p>
            </BaseCard>
            <BaseCard>
              <p class="text-xs font-bold uppercase tracking-[0.18em] text-glam/70">Aun no saben</p>
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
    </div>
  </section>
</template>
