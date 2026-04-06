<script setup>
import { nextTick, reactive, ref } from 'vue'
import BaseButton from '../components/BaseButton.vue'
import MessageCard from '../components/MessageCard.vue'
import SectionHeading from '../components/SectionHeading.vue'

const props = defineProps({
  guestbook: {
    type: Object,
    required: true,
  },
})

const form = reactive({
  name: '',
  message: '',
})

const wallRef = ref(null)

const errors = reactive({
  name: '',
  message: '',
})

const reset = () => {
  form.name = ''
  form.message = ''
}

const handleSubmit = async () => {
  errors.name = ''
  errors.message = ''

  if (!form.name.trim()) {
    errors.name = 'Escribi tu nombre para guardar el mensaje.'
  }

  if (!form.message.trim()) {
    errors.message = 'Escribi un mensaje bonito para Ainhara.'
  }

  if (errors.name || errors.message) {
    return
  }

  const saved = await props.guestbook.submit({
    name: form.name.trim(),
    message: form.message.trim(),
  })

  if (saved) {
    reset()
    await nextTick()
    wallRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <section
    id="mensajes"
    class="container-shell mt-8 sm:mt-12"
  >
    <div
      data-reveal
      class="section-frame reveal"
    >
      <SectionHeading
        eyebrow="Muro de mensajes"
        title="Dejale un mensaje a la cumpleanera"
        text="Podes escribir un mensajito bonito para recordar este dia tan especial."
      />

      <div class="mt-6 rounded-[1.85rem] border border-white/90 bg-white/90 p-5 shadow-card sm:p-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-sm font-bold uppercase tracking-[0.18em] text-glam/70">
              Mensajes guardados
            </p>
            <p class="mt-2 font-display text-4xl font-extrabold text-ink">
              {{ guestbook.total }}
            </p>
          </div>
          <div class="self-start rounded-full bg-blush px-4 py-2 text-sm font-bold text-ink">
            Recuerdos con amor
          </div>
        </div>

        <form
          class="mt-6 space-y-4"
          @submit.prevent="handleSubmit"
        >
          <label class="block">
            <span class="mb-2 block text-sm font-bold uppercase tracking-[0.18em] text-glam/70">
              Nombre
            </span>
            <input
              v-model="form.name"
              type="text"
              placeholder="Tu nombre"
              class="w-full rounded-2xl border border-glam/15 bg-cream px-4 py-3.5 text-base text-ink outline-none transition focus:border-glam focus:ring-4 focus:ring-glam/10"
            />
            <span
              v-if="errors.name"
              class="mt-2 block text-sm font-semibold text-glam"
            >
              {{ errors.name }}
            </span>
          </label>

          <label class="block">
            <span class="mb-2 block text-sm font-bold uppercase tracking-[0.18em] text-glam/70">
              Mensaje
            </span>
            <textarea
              v-model="form.message"
              rows="5"
              placeholder="Escribi un deseo tierno y feliz para Ainhara"
              class="w-full rounded-2xl border border-glam/15 bg-cream px-4 py-3.5 text-base text-ink outline-none transition focus:border-glam focus:ring-4 focus:ring-glam/10"
            ></textarea>
            <span
              v-if="errors.message"
              class="mt-2 block text-sm font-semibold text-glam"
            >
              {{ errors.message }}
            </span>
          </label>

          <BaseButton
            type="submit"
            :disabled="guestbook.submitting"
            full
          >
            {{ guestbook.submitting ? 'Guardando...' : 'Guardar mensaje' }}
          </BaseButton>

          <p
            v-if="guestbook.feedback"
            class="rounded-2xl bg-[#fff3c9] px-4 py-3 text-sm font-bold text-ink"
          >
            {{ guestbook.feedback }}
          </p>

          <p
            v-if="guestbook.error"
            class="rounded-2xl bg-[#ffe1ec] px-4 py-3 text-sm font-bold text-glam"
          >
            {{ guestbook.error }}
          </p>
        </form>

        <div
          ref="wallRef"
          class="mt-6 rounded-[1.8rem] border border-white/90 bg-blush/35 p-4 shadow-card"
        >
          <div class="mb-4 flex items-center justify-between gap-4">
            <p class="font-display text-2xl font-extrabold text-ink">Mensajes bonitos</p>
            <p class="rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-glam/70">
              Siempre visibles
            </p>
          </div>

          <p
            v-if="guestbook.loading && !guestbook.messages.length"
            class="mb-4 rounded-2xl bg-white/80 px-4 py-3 text-sm font-semibold text-ink/70"
          >
            Cargando mensajes guardados...
          </p>

          <div class="grid gap-4 md:grid-cols-2">
            <MessageCard
              v-for="entry in guestbook.messages"
              :key="entry.id"
              :message="entry"
            />

            <article
              v-if="!guestbook.loading && !guestbook.messages.length"
              class="rounded-[1.5rem] border border-dashed border-glam/30 bg-white/80 p-5 text-sm leading-7 text-ink/75"
            >
              Todavia no hay mensajes guardados. El primero puede ser el tuyo.
            </article>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
