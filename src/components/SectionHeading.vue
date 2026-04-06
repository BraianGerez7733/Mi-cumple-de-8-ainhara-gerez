<script setup>
defineProps({
  eyebrow: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    default: '',
  },
  align: {
    type: String,
    default: 'left',
  },
})
</script>

<template>
  <div :class="align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'">
    <p
      v-if="eyebrow"
      class="mb-3 font-display text-lg font-bold text-glam"
    >
      {{ eyebrow }}
    </p>
    <h2 class="font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
      {{ title }}
    </h2>
    <p
      v-if="text"
      class="mt-4 text-base leading-7 text-ink/80 sm:text-lg"
    >
      {{ text }}
    </p>
  </div>
</template>
