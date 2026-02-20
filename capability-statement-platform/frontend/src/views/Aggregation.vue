<template>
  <div class="animate-fade-in">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Data Aggregation</h1>
      <p class="page-subtitle">Select lawyers, deals, and awards to include in your capability statement</p>
    </div>
    
    <!-- Error Alert -->
    <Transition name="fade">
      <div v-if="dataStore.error" class="alert alert-error mb-6 flex items-start gap-3">
        <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ dataStore.error }}</span>
      </div>
    </Transition>

    <!-- Filters Card -->
    <div class="card mb-6">
      <div class="flex flex-col lg:flex-row lg:items-end gap-4">
        <div class="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="input-group">
            <label class="label">Practice Group</label>
            <select v-model="localFilters.practice_group" @change="applyFilters" class="select">
              <option value="">All Practice Groups</option>
              <option value="Corporate Law">Corporate Law</option>
              <option value="Intellectual Property">Intellectual Property</option>
              <option value="Litigation">Litigation</option>
            </select>
          </div>
          <div class="input-group">
            <label class="label">Industry</label>
            <select v-model="localFilters.industry" @change="applyFilters" class="select">
              <option value="">All Industries</option>
              <option value="Technology">Technology</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Manufacturing">Manufacturing</option>
            </select>
          </div>
          <div class="input-group">
            <label class="label">Year</label>
            <input 
              type="number" 
              v-model="localFilters.year" 
              @change="applyFilters"
              placeholder="Enter year"
              class="input"
            />
          </div>
        </div>
        <button @click="clearFilters" class="btn btn-secondary flex-shrink-0">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Selected Items Summary -->
    <Transition name="slide">
      <div v-if="dataStore.selectedCount > 0" class="card mb-6 bg-gradient-to-r from-primary-50 to-primary-100/50 border-primary-200">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 class="font-semibold text-secondary-900">{{ dataStore.selectedCount }} Items Selected</h2>
              <p class="text-sm text-secondary-600">
                {{ dataStore.selectedLawyers.length }} lawyers, 
                {{ dataStore.selectedDeals.length }} deals, 
                {{ dataStore.selectedAwards.length }} awards
              </p>
            </div>
          </div>
          <div class="flex gap-3">
            <button @click="dataStore.clearSelections" class="btn btn-secondary btn-sm">
              Clear All
            </button>
            <button class="btn btn-primary btn-sm" @click="continueToConfig">
              Continue
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Tabs -->
    <div class="tabs-underline mb-6">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="tab-underline"
        :class="{ 'tab-underline-active': activeTab === tab.id }"
      >
        <span class="flex items-center gap-2">
          <component :is="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
          <span 
            v-if="getSelectionCount(tab.id) > 0" 
            class="badge badge-primary"
          >
            {{ getSelectionCount(tab.id) }}
          </span>
        </span>
      </button>
    </div>

    <!-- Lawyers Tab -->
    <div v-show="activeTab === 'lawyers'" class="card">
      <div v-if="dataStore.loading" class="py-12 text-center">
        <div class="spinner mx-auto mb-4"></div>
        <p class="text-secondary-500">Loading lawyers...</p>
      </div>
      <div v-else-if="dataStore.lawyers.length === 0" class="empty-state">
        <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 class="empty-state-title">No lawyers found</h3>
        <p class="empty-state-description">Try adjusting your filters or add lawyers to the database.</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th class="w-12">
                <input
                  type="checkbox"
                  @change="toggleAllLawyers"
                  :checked="allLawyersSelected"
                  :indeterminate="someLawyersSelected && !allLawyersSelected"
                  class="checkbox"
                />
              </th>
              <th>Name</th>
              <th>Practice Group</th>
              <th>Title</th>
              <th>Experience</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="lawyer in dataStore.lawyers"
              :key="lawyer.id"
              @click="dataStore.toggleLawyerSelection(lawyer)"
              class="cursor-pointer"
              :class="{ 'bg-primary-50/50': dataStore.isLawyerSelected(lawyer) }"
            >
              <td @click.stop>
                <input
                  type="checkbox"
                  :checked="dataStore.isLawyerSelected(lawyer)"
                  @change="dataStore.toggleLawyerSelection(lawyer)"
                  class="checkbox"
                />
              </td>
              <td>
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-medium">
                    {{ lawyer.first_name?.[0] }}{{ lawyer.last_name?.[0] }}
                  </div>
                  <span class="font-medium text-secondary-900">{{ lawyer.first_name }} {{ lawyer.last_name }}</span>
                </div>
              </td>
              <td>
                <span class="badge badge-secondary">{{ lawyer.practice_group }}</span>
              </td>
              <td>{{ lawyer.title }}</td>
              <td>{{ lawyer.years_experience }} years</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Deals Tab -->
    <div v-show="activeTab === 'deals'" class="card">
      <div v-if="dataStore.loading" class="py-12 text-center">
        <div class="spinner mx-auto mb-4"></div>
        <p class="text-secondary-500">Loading deals...</p>
      </div>
      <div v-else-if="dataStore.deals.length === 0" class="empty-state">
        <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="empty-state-title">No deals found</h3>
        <p class="empty-state-description">Try adjusting your filters or add deals to the database.</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th class="w-12">
                <input
                  type="checkbox"
                  @change="toggleAllDeals"
                  :checked="allDealsSelected"
                  :indeterminate="someDealsSelected && !allDealsSelected"
                  class="checkbox"
                />
              </th>
              <th>Deal Name</th>
              <th>Client</th>
              <th>Value</th>
              <th>Year</th>
              <th>Industry</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="deal in dataStore.deals"
              :key="deal.id"
              @click="dataStore.toggleDealSelection(deal)"
              class="cursor-pointer"
              :class="{ 'bg-primary-50/50': dataStore.isDealSelected(deal) }"
            >
              <td @click.stop>
                <input
                  type="checkbox"
                  :checked="dataStore.isDealSelected(deal)"
                  @change="dataStore.toggleDealSelection(deal)"
                  class="checkbox"
                />
              </td>
              <td class="font-medium text-secondary-900">{{ deal.deal_name }}</td>
              <td>{{ deal.client_name }}</td>
              <td>
                <span class="font-medium text-emerald-600">{{ formatCurrency(deal.deal_value, deal.deal_currency) }}</span>
              </td>
              <td>{{ deal.deal_year }}</td>
              <td>
                <span class="badge badge-info">{{ deal.industry }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Awards Tab -->
    <div v-show="activeTab === 'awards'" class="card">
      <div v-if="dataStore.loading" class="py-12 text-center">
        <div class="spinner mx-auto mb-4"></div>
        <p class="text-secondary-500">Loading awards...</p>
      </div>
      <div v-else-if="dataStore.awards.length === 0" class="empty-state">
        <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
        <h3 class="empty-state-title">No awards found</h3>
        <p class="empty-state-description">Try adjusting your filters or add awards to the database.</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th class="w-12">
                <input
                  type="checkbox"
                  @change="toggleAllAwards"
                  :checked="allAwardsSelected"
                  :indeterminate="someAwardsSelected && !allAwardsSelected"
                  class="checkbox"
                />
              </th>
              <th>Award Name</th>
              <th>Organization</th>
              <th>Year</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="award in dataStore.awards"
              :key="award.id"
              @click="dataStore.toggleAwardSelection(award)"
              class="cursor-pointer"
              :class="{ 'bg-primary-50/50': dataStore.isAwardSelected(award) }"
            >
              <td @click.stop>
                <input
                  type="checkbox"
                  :checked="dataStore.isAwardSelected(award)"
                  @change="dataStore.toggleAwardSelection(award)"
                  class="checkbox"
                />
              </td>
              <td>
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span class="font-medium text-secondary-900">{{ award.award_name }}</span>
                </div>
              </td>
              <td>{{ award.awarding_organization }}</td>
              <td>{{ award.award_year }}</td>
              <td>
                <span class="badge badge-warning">{{ award.category }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { useDataStore } from '../stores/dataStore'
import { useRouter } from 'vue-router'
import { useCreateFlowStore } from '../stores/createFlowStore'
const router = useRouter()
const flow = useCreateFlowStore()

function continueToConfig() {
  console.log('Continue clicked. selectedCount=', dataStore.selectedCount)
  router.push('/configuration')
}

const dataStore = useDataStore()
const activeTab = ref('lawyers')
const localFilters = ref({
  practice_group: '',
  industry: '',
  year: null
})

// Tab icons as render functions
const LawyersIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '1.5', d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' })
])
const DealsIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '1.5', d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' })
])
const AwardsIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '1.5', d: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' })
])

const tabs = [
  { id: 'lawyers', label: 'Lawyers', icon: LawyersIcon },
  { id: 'deals', label: 'Deals', icon: DealsIcon },
  { id: 'awards', label: 'Awards', icon: AwardsIcon }
]

// Selection computed properties
const allLawyersSelected = computed(() => {
  return dataStore.lawyers.length > 0 && dataStore.lawyers.every(l => dataStore.isLawyerSelected(l))
})
const someLawyersSelected = computed(() => {
  return dataStore.lawyers.some(l => dataStore.isLawyerSelected(l))
})
const allDealsSelected = computed(() => {
  return dataStore.deals.length > 0 && dataStore.deals.every(d => dataStore.isDealSelected(d))
})
const someDealsSelected = computed(() => {
  return dataStore.deals.some(d => dataStore.isDealSelected(d))
})
const allAwardsSelected = computed(() => {
  return dataStore.awards.length > 0 && dataStore.awards.every(a => dataStore.isAwardSelected(a))
})
const someAwardsSelected = computed(() => {
  return dataStore.awards.some(a => dataStore.isAwardSelected(a))
})

function getSelectionCount(tabId) {
  if (tabId === 'lawyers') return dataStore.selectedLawyers.length
  if (tabId === 'deals') return dataStore.selectedDeals.length
  if (tabId === 'awards') return dataStore.selectedAwards.length
  return 0
}

function toggleAllLawyers() {
  if (allLawyersSelected.value) {
    dataStore.lawyers.forEach(l => {
      if (dataStore.isLawyerSelected(l)) dataStore.toggleLawyerSelection(l)
    })
  } else {
    dataStore.lawyers.forEach(l => {
      if (!dataStore.isLawyerSelected(l)) dataStore.toggleLawyerSelection(l)
    })
  }
}

function toggleAllDeals() {
  if (allDealsSelected.value) {
    dataStore.deals.forEach(d => {
      if (dataStore.isDealSelected(d)) dataStore.toggleDealSelection(d)
    })
  } else {
    dataStore.deals.forEach(d => {
      if (!dataStore.isDealSelected(d)) dataStore.toggleDealSelection(d)
    })
  }
}

function toggleAllAwards() {
  if (allAwardsSelected.value) {
    dataStore.awards.forEach(a => {
      if (dataStore.isAwardSelected(a)) dataStore.toggleAwardSelection(a)
    })
  } else {
    dataStore.awards.forEach(a => {
      if (!dataStore.isAwardSelected(a)) dataStore.toggleAwardSelection(a)
    })
  }
}

function applyFilters() {
  dataStore.updateFilters({
    practice_group: localFilters.value.practice_group || null,
    industry: localFilters.value.industry || null,
    deal_year: localFilters.value.year || null,
    award_year: localFilters.value.year || null
  })
  
  if (activeTab.value === 'lawyers') {
    dataStore.fetchLawyers()
  } else if (activeTab.value === 'deals') {
    dataStore.fetchDeals()
  } else if (activeTab.value === 'awards') {
    dataStore.fetchAwards()
  }
}

function clearFilters() {
  localFilters.value = {
    practice_group: '',
    industry: '',
    year: null
  }
  dataStore.updateFilters({
    practice_group: null,
    industry: null,
    deal_year: null,
    award_year: null
  })
  applyFilters()
}

function formatCurrency(value, currency = 'USD') {
  if (!value) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(value)
}

onMounted(async () => {
  await Promise.all([
    dataStore.fetchLawyers(),
    dataStore.fetchDeals(),
    dataStore.fetchAwards()
  ])
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
