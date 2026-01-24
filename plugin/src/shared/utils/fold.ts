import { ref } from 'vue'

export function useCodeFold(defaultFold?: boolean) {
  const isCodeFold = ref(typeof defaultFold === 'boolean' ? defaultFold : true)
  const setCodeFold = (value: boolean) => {
    isCodeFold.value = value
  }
  return {
    isCodeFold,
    setCodeFold,
  }
}
