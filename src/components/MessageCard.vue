<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
})

const formattedDate = computed(() => {
  if (!props.message.created_at) return ''
  try {
    const d = new Date(props.message.created_at)
    if (isNaN(d.getTime())) return ''
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d)
  } catch (e) {
    return ''
  }
})
</script>

<template>
  <article class="rounded-[1.5rem] border border-white/90 bg-white/90 p-4 shadow-card">
    <div class="flex flex-col items-start justify-between gap-3 sm:flex-row">
      <div>
        <h3 class="font-display text-xl font-bold text-ink">{{ message.name }}</h3>
        <p class="mt-1 text-sm font-semibold uppercase tracking-[0.18em] text-glam/70">
          Mensaje con amor
        </p>
      </div>
      <span class="rounded-full bg-blush px-3 py-1 text-xs font-bold text-ink/75">
        {{ formattedDate }}
      </span>
    </div>
    <p class="mt-4 text-base leading-7 text-ink/85">
      {{ message.message }}
    </p>
  </article>
</template>
