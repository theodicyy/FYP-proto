import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dataService from '../services/dataService'

export const useDataStore = defineStore('data', () => {
  // State
  const lawyers = ref([])
  const deals = ref([])
  const awards = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Selected items
  const selectedLawyers = ref([])
  const selectedDeals = ref([])
  const selectedAwards = ref([])

  // Filters
  const filters = ref({
    practice_group: null,
    industry: null,
    year: null,
    source_system: null
  })

  // Computed
  const selectedCount = computed(() => {
    return selectedLawyers.value.length + selectedDeals.value.length + selectedAwards.value.length
  })

  // Actions
  async function fetchLawyers(customFilters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await dataService.getLawyers({ ...filters.value, ...customFilters })
      lawyers.value = response.data || []
    } catch (err) {
      error.value = err.message
      console.error('Error fetching lawyers:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchDeals(customFilters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await dataService.getDeals({ ...filters.value, ...customFilters })
      deals.value = response.data || []
    } catch (err) {
      error.value = err.message
      console.error('Error fetching deals:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchAwards(customFilters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await dataService.getAwards({ ...filters.value, ...customFilters })
      awards.value = response.data || []
    } catch (err) {
      error.value = err.message
      console.error('Error fetching awards:', err)
    } finally {
      loading.value = false
    }
  }

  function toggleLawyerSelection(lawyer) {
    const index = selectedLawyers.value.findIndex(l => l.id === lawyer.id)
    if (index > -1) {
      selectedLawyers.value.splice(index, 1)
    } else {
      selectedLawyers.value.push(lawyer)
    }
  }

  function toggleDealSelection(deal) {
    const index = selectedDeals.value.findIndex(d => d.id === deal.id)
    if (index > -1) {
      selectedDeals.value.splice(index, 1)
    } else {
      selectedDeals.value.push(deal)
    }
  }

  function toggleAwardSelection(award) {
    const index = selectedAwards.value.findIndex(a => a.id === award.id)
    if (index > -1) {
      selectedAwards.value.splice(index, 1)
    } else {
      selectedAwards.value.push(award)
    }
  }

  function clearSelections() {
    selectedLawyers.value = []
    selectedDeals.value = []
    selectedAwards.value = []
  }

  function updateFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function isLawyerSelected(lawyer) {
    return selectedLawyers.value.some(l => l.id === lawyer.id)
  }

  function isDealSelected(deal) {
    return selectedDeals.value.some(d => d.id === deal.id)
  }

  function isAwardSelected(award) {
    return selectedAwards.value.some(a => a.id === award.id)
  }

  return {
    // State
    lawyers,
    deals,
    awards,
    loading,
    error,
    selectedLawyers,
    selectedDeals,
    selectedAwards,
    filters,
    // Computed
    selectedCount,
    // Actions
    fetchLawyers,
    fetchDeals,
    fetchAwards,
    toggleLawyerSelection,
    toggleDealSelection,
    toggleAwardSelection,
    clearSelections,
    updateFilters,
    isLawyerSelected,
    isDealSelected,
    isAwardSelected
  }
})
