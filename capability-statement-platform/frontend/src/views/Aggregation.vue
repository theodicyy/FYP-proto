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
            <label class="label">
              Practice Group (Lawyers)
              <span v-if="practiceGroupFilter.length > 0" class="ml-1 text-sm text-primary-600">
                ({{ practiceGroupFilter.length }} selected)
              </span>
            </label>
            <MultiSelectDropdown
              v-model="practiceGroupFilter"
              :options="uniquePracticeGroups"
              placeholder="All practice groups"
            />
          </div>
          <div class="input-group">
            <label class="label">
              Industry (Deals)
              <span v-if="industryFilter.length > 0" class="ml-1 text-sm text-primary-600">
                ({{ industryFilter.length }} selected)
              </span>
            </label>
            <MultiSelectDropdown
              v-model="industryFilter"
              :options="uniqueIndustries"
              placeholder="All industries"
            />
          </div>
          <div class="input-group">
            <label class="label">Year</label>
            <input
              type="text"
              v-model="localFilters.year"
              @input="applyFilters"
              placeholder="e.g. 2024"
              class="input"
              list="year-options"
              autocomplete="off"
            />
            <datalist id="year-options">
              <option v-for="y in uniqueYears" :key="y" :value="y" />
            </datalist>
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

    <!-- Tab search: live filter on every keystroke, current tab only -->
    <div class="card mb-4">
      <div class="flex flex-col sm:flex-row sm:items-center gap-3">
        <div class="flex-1">
          <label for="aggregation-search" class="sr-only">Search {{ activeTab }}</label>
          <input
            id="aggregation-search"
            v-model="searchQuery"
            type="text"
            :placeholder="searchPlaceholder"
            class="input w-full"
            aria-label="Search"
          />
        </div>
        <button
          v-if="searchTerm"
          type="button"
          @click="clearSearch"
          class="btn btn-secondary flex-shrink-0"
        >
          Clear
        </button>
      </div>
    </div>

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
      <div v-else-if="filteredLawyers.length === 0" class="empty-state">
        <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 class="empty-state-title">{{ searchTerm ? 'No lawyers match your search' : 'No lawyers found' }}</h3>
        <p class="empty-state-description">{{ searchTerm ? 'Try a different search term or clear the search.' : 'Try adjusting your filters or add lawyers to the database.' }}</p>
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
              <th>Awards</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="lawyer in filteredLawyers"
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
                <div class="practice-group-pills">
                  <template v-if="parsePracticeGroups(lawyer).length">
                    <span
                      v-for="(pg, idx) in parsePracticeGroups(lawyer)"
                      :key="idx"
                      class="practice-group-pill"
                    >{{ pg }}</span>
                  </template>
                  <span v-else class="practice-group-empty">—</span>
                </div>
              </td>
              <td>{{ lawyer.title }}</td>
<td>{{ lawyer.lawyer_awards || '—' }}</td>
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
      <div v-else-if="filteredDeals.length === 0" class="empty-state">
        <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="empty-state-title">{{ (searchTerm || industryFilter) ? 'No deals match your filters' : 'No deals found' }}</h3>
        <p class="empty-state-description">{{ (searchTerm || industryFilter) ? 'Try a different search term or industry, or clear filters.' : 'Try adjusting your filters or add deals to the database.' }}</p>
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
              v-for="deal in filteredDeals"
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
<td>{{ getDealYearFromDate(deal.deal_date) }}</td>              <td>
                <span class="badge badge-info">{{ String(deal.deal_industry ?? deal.industry ?? '').trim() || '—' }}</span>
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
      <div v-else-if="filteredAwards.length === 0" class="empty-state">
        <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
        <h3 class="empty-state-title">{{ searchTerm ? 'No awards match your search' : 'No awards found' }}</h3>
        <p class="empty-state-description">{{ searchTerm ? 'Try a different search term or clear the search.' : 'Try adjusting your filters or add awards to the database.' }}</p>
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
              <th>Publication</th>
              <th>Year</th>
              <th>Practice Group</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="award in filteredAwards"
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
              <td>{{ award.publications }}</td>
              <td>{{ award.award_year }}</td>
<td>
  <div class="practice-group-pills">
    <template v-if="parseAwardPracticeGroups(award).length">
      <span
        v-for="(pg, idx) in parseAwardPracticeGroups(award)"
        :key="idx"
        class="practice-group-pill"
      >
        {{ pg }}
      </span>
    </template>
    <span v-else class="practice-group-empty">—</span>
  </div>
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
import MultiSelectDropdown from '../components/MultiSelectDropdown.vue'
const router = useRouter()
const flow = useCreateFlowStore()

function continueToConfig() {
  console.log('Continue clicked. selectedCount=', dataStore.selectedCount)
  router.push('/configuration')
}

const dataStore = useDataStore()
const activeTab = ref('lawyers')
const searchQuery = ref('')
const practiceGroupFilter = ref([])
const industryFilter = ref([])
const localFilters = ref({
  year: null
})

// Live search: filter on every keystroke (trimmed term), current tab only; source data unchanged
const searchTerm = computed(() => (searchQuery.value || '').trim())
function clearSearch() {
  searchQuery.value = ''
}
const searchPlaceholder = computed(() => {
  if (activeTab.value === 'lawyers') return 'Search by name, practice group, title...'
  if (activeTab.value === 'deals') return 'Search by deal name, client, industry, year...'
  if (activeTab.value === 'awards') return 'Search by award name, organization, category, year...'
  return 'Search'
})

function matchText(term, ...values) {
  if (!term) return true
  const q = term.toLowerCase()
  return values.some(v => (v != null && String(v).toLowerCase().includes(q)))
}

/** Parse practice_group string (comma-separated) into trimmed array. Frontend-only, no schema change. */
function parsePracticeGroups(lawyer) {
  const raw = lawyer.practice_group ?? lawyer.practiceGroup ?? ''
  if (!raw || typeof raw !== 'string') return []
  return raw.split(',').map(s => s.trim()).filter(Boolean)
}
function parseAwardPracticeGroups(award) {
  const raw = award.award_pg ?? ''
  if (!raw) return []

  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return parsed
      .flatMap(v => String(v).split(','))
      .map(s => s.trim())
      .filter(Boolean)
  } catch {
    return String(raw)
      .replace(/[\[\]"]/g, '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
  }
}


/** Lawyer matches search if text fields match OR any practice group (after split/trim) contains the query (case-insensitive). */
function lawyerMatchesSearch(lawyer, term) {
  if (!term) return true
  const q = term.toLowerCase()
  if (matchText(term, lawyer.first_name, lawyer.last_name, lawyer.title, lawyer.email)) return true
  const groups = parsePracticeGroups(lawyer)
  return groups.some(pg => pg.toLowerCase().includes(q))
}

/** True if lawyer belongs to the given practice group (case-insensitive). */
function lawyerInPracticeGroup(lawyer, selectedGroup) {
  if (!selectedGroup) return true
  const groups = parsePracticeGroups(lawyer)
  return groups.some(pg => pg.toLowerCase() === selectedGroup.toLowerCase())
}

/** Unique practice groups from current lawyers dataset: split by comma, trim, dedupe (case-insensitive), sorted. */
const uniquePracticeGroups = computed(() => {
  const seen = new Map()
  for (const lawyer of dataStore.lawyers) {
    for (const pg of parsePracticeGroups(lawyer)) {
      const key = pg.toLowerCase()
      if (!seen.has(key)) seen.set(key, pg)
    }
  }
  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
})

/** Industry value for a deal (schema: deal_industry). */
function getDealIndustry(deal) {
  return String(deal.deal_industry ?? deal.industry ?? '').trim()
}

/** True if deal belongs to the given industry (case-insensitive). */
function dealInIndustry(deal, selectedIndustry) {
  if (!selectedIndustry) return true
  const ind = getDealIndustry(deal)
  return ind && ind.toLowerCase() === selectedIndustry.toLowerCase()
}

/** Unique years from deals + awards datasets, sorted descending. */
const uniqueYears = computed(() => {
  const seen = new Set()
  for (const deal of dataStore.deals) {
    const y = getDealYearFromDate(deal.deal_date)
    if (y) seen.add(String(y))
  }
  for (const award of dataStore.awards) {
    if (award.award_year) seen.add(String(award.award_year))
  }
  return Array.from(seen).sort((a, b) => b - a)
})

/** Unique industries from current deals dataset; dedupe case-insensitive, sorted. */
const uniqueIndustries = computed(() => {
  const seen = new Map()
  for (const deal of dataStore.deals) {
    const ind = getDealIndustry(deal)
    if (!ind) continue
    const key = ind.toLowerCase()
    if (!seen.has(key)) seen.set(key, ind)
  }
  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
})

const filteredLawyers = computed(() => {
  let list = dataStore.lawyers
  if (practiceGroupFilter.value.length > 0) {
    list = list.filter(l => practiceGroupFilter.value.some(sg => lawyerInPracticeGroup(l, sg)))
  }
  if (searchTerm.value) {
    list = list.filter(l => lawyerMatchesSearch(l, searchTerm.value))
  }
  return list
})
function getDealYearFromDate(date) {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d)) return ''
  return d.getFullYear()
}
const filteredDeals = computed(() => {
  let list = dataStore.deals

  if (industryFilter.value.length > 0) {
    list = list.filter(d => industryFilter.value.some(si => dealInIndustry(d, si)))
  }

  // FIX: filter using year extracted from deal_date
  if (localFilters.value.year) {
    list = list.filter(
      d => String(getDealYearFromDate(d.deal_date)) === String(localFilters.value.year)
    )
  }

  if (searchTerm.value) {
    list = list.filter(d =>
      matchText(
        searchTerm.value,
        d.deal_name,
        d.client_name,
        d.industry,
        d.deal_industry,
        getDealYearFromDate(d.deal_date),
        d.deal_value
      )
    )
  }

  return list
})
const filteredAwards = computed(() => {
  let list = dataStore.awards

  if (practiceGroupFilter.value.length > 0) {
    list = list.filter(a =>
      practiceGroupFilter.value.some(sg =>
        parseAwardPracticeGroups(a).some(pg => pg.toLowerCase() === sg.toLowerCase())
      )
    )
  }

  if (searchTerm.value) {
    list = list.filter(a =>
      matchText(
        searchTerm.value,
        a.award_name,
        a.awarding_organization,
        a.award_year,
        ...parseAwardPracticeGroups(a)
      )
    )
  }

  return list
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

// Selection computed properties (based on filtered lists so "select all" matches visible rows)
const allLawyersSelected = computed(() => {
  return filteredLawyers.value.length > 0 && filteredLawyers.value.every(l => dataStore.isLawyerSelected(l))
})
const someLawyersSelected = computed(() => {
  return filteredLawyers.value.some(l => dataStore.isLawyerSelected(l))
})
const allDealsSelected = computed(() => {
  return filteredDeals.value.length > 0 && filteredDeals.value.every(d => dataStore.isDealSelected(d))
})
const someDealsSelected = computed(() => {
  return filteredDeals.value.some(d => dataStore.isDealSelected(d))
})
const allAwardsSelected = computed(() => {
  return filteredAwards.value.length > 0 && filteredAwards.value.every(a => dataStore.isAwardSelected(a))
})
const someAwardsSelected = computed(() => {
  return filteredAwards.value.some(a => dataStore.isAwardSelected(a))
})

function getSelectionCount(tabId) {
  if (tabId === 'lawyers') return dataStore.selectedLawyers.length
  if (tabId === 'deals') return dataStore.selectedDeals.length
  if (tabId === 'awards') return dataStore.selectedAwards.length
  return 0
}

function toggleAllLawyers() {
  const list = filteredLawyers.value
  if (allLawyersSelected.value) {
    list.forEach(l => { if (dataStore.isLawyerSelected(l)) dataStore.toggleLawyerSelection(l) })
  } else {
    list.forEach(l => { if (!dataStore.isLawyerSelected(l)) dataStore.toggleLawyerSelection(l) })
  }
}

function toggleAllDeals() {
  const list = filteredDeals.value
  if (allDealsSelected.value) {
    list.forEach(d => { if (dataStore.isDealSelected(d)) dataStore.toggleDealSelection(d) })
  } else {
    list.forEach(d => { if (!dataStore.isDealSelected(d)) dataStore.toggleDealSelection(d) })
  }
}

function toggleAllAwards() {
  const list = filteredAwards.value
  if (allAwardsSelected.value) {
    list.forEach(a => { if (dataStore.isAwardSelected(a)) dataStore.toggleAwardSelection(a) })
  } else {
    list.forEach(a => { if (!dataStore.isAwardSelected(a)) dataStore.toggleAwardSelection(a) })
  }
}

function applyFilters() {
  dataStore.updateFilters({
    practice_group: null,
    industry: null,
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
  practiceGroupFilter.value = []
  industryFilter.value = []
  localFilters.value = {
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

/* Practice group pills: wrap, spacing, pill shape, light bg, subtle border */
.practice-group-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem 0.5rem;
  align-items: center;
}
.practice-group-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.2;
  color: #54585B;
  background-color: #f6f6f7;
  border: 1px solid #ededee;
  border-radius: 9999px;
  white-space: nowrap;
}
.practice-group-empty {
  color: #a0a1a4;
  font-size: 0.875rem;
}
</style>
