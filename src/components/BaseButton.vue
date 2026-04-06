<script setup>
const props = defineProps({
  href: {
    type: String,
    default: '',
  },
  variant: {
    type: String,
    default: 'primary',
  },
  type: {
    type: String,
    default: 'button',
  },
  full: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const classes = {
  primary:
    'bg-glam text-white shadow-soft hover:-translate-y-0.5 hover:shadow-glow focus-visible:ring-glam/30',
  secondary:
    'bg-white text-ink ring-1 ring-glam/15 shadow-card hover:-translate-y-0.5 hover:bg-blush/80 focus-visible:ring-gold/40',
  gold: 'bg-gold text-ink shadow-soft hover:-translate-y-0.5 hover:brightness-105 focus-visible:ring-gold/40',
}
</script>

<template>
  <a
    v-if="href"
    :href="href"
    class="inline-flex items-center justify-center rounded-full px-6 py-3.5 text-base font-extrabold transition duration-300 focus-visible:outline-none focus-visible:ring-4"
    :class="[classes[variant], full ? 'w-full' : 'w-full sm:w-auto']"
  >
    <slot />
  </a>

  <button
    v-else
    :type="type"
    :disabled="disabled"
    class="inline-flex items-center justify-center rounded-full px-6 py-3.5 text-base font-extrabold transition duration-300 focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-70"
    :class="[classes[variant], full ? 'w-full' : 'w-full sm:w-auto']"
  >
    <slot />
  </button>
</template>
