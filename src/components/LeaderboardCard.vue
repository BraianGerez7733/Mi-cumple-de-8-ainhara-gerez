<script setup>
defineProps({
  leaderboard: {
    type: Object,
    required: true,
  },
})

const getMedalColor = (index) => {
  if (index === 0) return 'text-[#FFD700] bg-[#FFF9C4]' // Oro
  if (index === 1) return 'text-[#C0C0C0] bg-[#F5F5F5]' // Plata
  if (index === 2) return 'text-[#CD7F32] bg-[#FBE9E7]' // Bronce
  return 'text-ink/60 bg-blush/40' // Normal
}
</script>

<template>
  <div class="rounded-[1.75rem] border border-white/90 bg-white/90 p-5 shadow-card">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="font-display text-2xl font-extrabold text-ink">Top 5 Mejores</h3>
      <span class="rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-widest text-ink/80">
        Ranking
      </span>
    </div>

    <div v-if="leaderboard.loading" class="text-sm font-semibold text-ink/70">
      Cargando posiciones...
    </div>
    
    <div v-else-if="!leaderboard.scores.length" class="rounded-[1.5rem] border border-dashed border-glam/30 bg-blush/30 p-4 text-sm leading-6 text-ink/75">
      Sé el primero en la tabla de puntajes anotando tu nombre.
    </div>

    <ul v-else class="space-y-3">
      <li 
        v-for="(score, index) in leaderboard.scores" 
        :key="score.id"
        class="flex items-center justify-between rounded-2xl bg-white/50 p-3 ring-1 ring-glam/10"
      >
        <div class="flex items-center gap-3">
          <span 
            class="flex h-8 w-8 items-center justify-center rounded-full font-display text-lg font-bold"
            :class="getMedalColor(index)"
          >
            {{ index + 1 }}
          </span>
          <span class="font-bold text-ink">{{ score.nombre_jugador }}</span>
        </div>
        <span class="rounded-xl bg-candy px-3 py-1 font-display text-lg font-extrabold text-white">
          {{ score.puntuacion }}
        </span>
      </li>
    </ul>
  </div>
</template>
