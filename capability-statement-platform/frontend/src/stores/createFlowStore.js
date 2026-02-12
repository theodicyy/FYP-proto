import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCreateFlowStore = defineStore('createFlow', () => {

  const selectedTemplateId = ref(null)

  const include = ref({
    lawyers: true,
    deals: true,
    awards: true
  })


  function setTemplateId(id) {
    selectedTemplateId.value = id
  }

  function setInclude(partial) {
    include.value = { ...include.value, ...partial }
  }

  function reset() {
    selectedTemplateId.value = null
    include.value = { lawyers: true, deals: true, awards: true }
  }

  return {
    
    selectedTemplateId,
    include,
    setTemplateId,
    setInclude,
    reset
  }
})
