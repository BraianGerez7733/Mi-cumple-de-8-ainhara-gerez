import { computed, onMounted, ref } from 'vue'
import { getCachedRsvps, listRsvps, saveRsvp } from '../lib/storage'
import { backendLabel, backendMode } from '../lib/supabase'

export function useRsvp() {
  const entries = ref(getCachedRsvps())
  const loading = ref(false)
  const submitting = ref(false)
  const feedback = ref('')
  const error = ref('')

  const summary = computed(() => {
    return entries.value.reduce(
      (acc, item) => {
        if (item.attendance === 'yes') acc.yes += 1
        if (item.attendance === 'no') acc.no += 1
        if (item.attendance === 'maybe') acc.maybe += 1
        return acc
      },
      { yes: 0, no: 0, maybe: 0 },
    )
  })

  const load = async () => {
    loading.value = !entries.value.length
    error.value = ''

    try {
      entries.value = await listRsvps()
    } catch (err) {
      error.value = 'No pudimos cargar las confirmaciones en este momento.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const submit = async (payload) => {
    submitting.value = true
    feedback.value = ''
    error.value = ''

    try {
      const record = await saveRsvp(payload)
      entries.value = [record, ...entries.value].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      feedback.value = '¡Gracias por confirmar!'
      return true
    } catch (err) {
      error.value = 'No pudimos guardar tu confirmacion. Intenta nuevamente.'
      console.error(err)
      return false
    } finally {
      submitting.value = false
    }
  }

  onMounted(load)

  return {
    entries,
    loading,
    submitting,
    feedback,
    error,
    summary,
    backendMode,
    backendLabel,
    load,
    submit,
  }
}
