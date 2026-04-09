import { computed, onMounted, ref } from 'vue'
import { getCachedMessages, listMessages, saveMessage } from '../lib/storage'

export function useGuestbook() {
  const messages = ref(getCachedMessages())
  const loading = ref(false)
  const submitting = ref(false)
  const feedback = ref('')
  const error = ref('')

  const total = computed(() => messages.value.length)

  const load = async () => {
    loading.value = !messages.value.length
    error.value = ''

    try {
      messages.value = await listMessages()
    } catch (err) {
      error.value = 'No pudimos cargar los mensajes por ahora.'
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
      await saveMessage(payload)
      await load()
      feedback.value = '¡Tu mensaje quedo guardado!'
      return true
    } catch (err) {
      error.value = 'No pudimos guardar tu mensaje. Intenta nuevamente.'
      console.error(err)
      return false
    } finally {
      submitting.value = false
    }
  }

  onMounted(load)

  return {
    messages,
    total,
    loading,
    submitting,
    feedback,
    error,
    load,
    submit,
  }
}
