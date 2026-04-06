<script setup>
defineProps({
  tone: {
    type: String,
    default: 'default',
  },
})

const toneClasses = {
  default: 'bg-white/85 border-white/80',
  blush: 'bg-blush/70 border-white/90',
  gold: 'bg-[#fff6dd] border-[#fff0b6]',
}
</script>

<template>
  <div
    class="rounded-[1.75rem] border p-5 shadow-card backdrop-blur"
    :class="toneClasses[tone]"
  >
    <slot />
  </div>
</template>
