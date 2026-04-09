import { onMounted, ref } from 'vue'
import { listTopScores, saveScore } from '../lib/storage'

export function useLeaderboard() {
  const scores = ref([])
  const loading = ref(false)

  const load = async () => {
    loading.value = true
    try {
      scores.value = await listTopScores()
    } catch (err) {
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const submit = async (payload) => {
    try {
      await saveScore(payload)
      await load()
    } catch (err) {
      console.error(err)
    }
  }

  onMounted(load)

  return {
    scores,
    loading,
    load,
    submit,
  }
}
