<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Awards Management</h1>
      <button @click="showCreateModal = true" class="btn btn-primary">
        + Add Award
      </button>
    </div>

    <!-- Search and Filters -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Search</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search awards..."
            class="input"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Industry</label>
          <select v-model="filterIndustry" class="input">
            <option value="">All</option>
            <option value="Technology">Technology</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Manufacturing">Manufacturing</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Year</label>
          <input v-model.number="filterYear" type="number" placeholder="Year" class="input" />
        </div>
        <div class="flex items-end">
          <button @click="clearFilters" class="btn btn-secondary w-full">
            Clear
          </button>
        </div>
      </div>
    </div>

    <!-- Awards Table -->
    <div class="card">
      <div v-if="loading" class="text-center py-8">Loading...</div>
      <div v-else>
        <table class="table">
          <thead>
            <tr>
              <th>Award Name</th>
              <th>Organization</th>
              <th>Year</th>
              <th>Category</th>
              <th>Practice Group</th>
              <th>Industry</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="award in filteredAwards" :key="award.id">
              <td>{{ award.award_name }}</td>
              <td>{{ award.awarding_organization || '-' }}</td>
              <td>{{ award.award_year || '-' }}</td>
              <td>{{ award.category || '-' }}</td>
              <td>{{ award.practice_group || '-' }}</td>
              <td>{{ award.industry || '-' }}</td>
              <td>
                <div class="flex gap-2">
                  <button @click="editAward(award)" class="text-primary-600 hover:text-primary-800 text-sm">
                    Edit
                  </button>
                  <button @click="confirmDelete(award)" class="text-red-600 hover:text-red-800 text-sm">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredAwards.length === 0">
              <td colspan="7" class="text-center py-8 text-gray-500">
                No awards found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || editingAward" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-semibold mb-4">
          {{ editingAward ? 'Edit Award' : 'Add New Award' }}
        </h3>
        
        <form @submit.prevent="saveAward" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Award Name *</label>
            <input v-model="awardForm.award_name" type="text" required class="input" />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Awarding Organization</label>
            <input v-model="awardForm.awarding_organization" type="text" class="input" />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Award Year</label>
              <input v-model.number="awardForm.award_year" type="number" class="input" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Category</label>
              <input v-model="awardForm.category" type="text" class="input" />
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Practice Group</label>
              <input v-model="awardForm.practice_group" type="text" class="input" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Industry</label>
              <input v-model="awardForm.industry" type="text" class="input" />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Description</label>
            <textarea v-model="awardForm.description" rows="4" class="input"></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Source System</label>
            <input v-model="awardForm.source_system" type="text" class="input" />
          </div>
          
          <div class="flex gap-2 justify-end">
            <button type="button" @click="closeModal" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="awardToDelete" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-xl font-semibold mb-4">Delete Award</h3>
        <p class="mb-4">
          Are you sure you want to delete <strong>{{ awardToDelete.award_name }}</strong>?
        </p>
        <p class="text-sm text-red-600 mb-4">
          This action cannot be undone if the award has associated lawyers.
        </p>
        <div class="flex gap-2 justify-end">
          <button @click="awardToDelete = null" class="btn btn-secondary">Cancel</button>
          <button @click="deleteAward" class="btn btn-danger" :disabled="deleting">
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import dataService from '../../services/dataService'

const awards = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const searchQuery = ref('')
const filterIndustry = ref('')
const filterYear = ref(null)
const showCreateModal = ref(false)
const editingAward = ref(null)
const awardToDelete = ref(null)

const awardForm = ref({
  award_name: '',
  awarding_organization: '',
  award_year: null,
  category: '',
  practice_group: '',
  industry: '',
  description: '',
  source_system: 'admin'
})

const filteredAwards = computed(() => {
  let filtered = [...awards.value]
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(a => 
      a.award_name.toLowerCase().includes(query) ||
      (a.awarding_organization && a.awarding_organization.toLowerCase().includes(query))
    )
  }
  
  if (filterIndustry.value) {
    filtered = filtered.filter(a => a.industry === filterIndustry.value)
  }
  
  if (filterYear.value) {
    filtered = filtered.filter(a => a.award_year === filterYear.value)
  }
  
  return filtered
})

onMounted(async () => {
  await fetchAwards()
})

async function fetchAwards() {
  loading.value = true
  try {
    const response = await dataService.getAwards()
    awards.value = response.data || []
  } catch (error) {
    console.error('Error fetching awards:', error)
    alert('Error loading awards: ' + error.message)
  } finally {
    loading.value = false
  }
}

function clearFilters() {
  searchQuery.value = ''
  filterIndustry.value = ''
  filterYear.value = null
}

function editAward(award) {
  editingAward.value = award
  awardForm.value = {
    award_name: award.award_name,
    awarding_organization: award.awarding_organization || '',
    award_year: award.award_year || null,
    category: award.category || '',
    practice_group: award.practice_group || '',
    industry: award.industry || '',
    description: award.description || '',
    source_system: award.source_system || 'admin'
  }
}

function closeModal() {
  showCreateModal.value = false
  editingAward.value = null
  awardForm.value = {
    award_name: '',
    awarding_organization: '',
    award_year: null,
    category: '',
    practice_group: '',
    industry: '',
    description: '',
    source_system: 'admin'
  }
}

async function saveAward() {
  saving.value = true
  try {
    if (editingAward.value) {
      await dataService.updateAward(editingAward.value.id, awardForm.value)
      alert('Award updated successfully!')
    } else {
      await dataService.createAward(awardForm.value)
      alert('Award created successfully!')
    }
    closeModal()
    await fetchAwards()
  } catch (error) {
    alert('Error saving award: ' + error.message)
  } finally {
    saving.value = false
  }
}

function confirmDelete(award) {
  awardToDelete.value = award
}

async function deleteAward() {
  if (!awardToDelete.value) return
  
  deleting.value = true
  try {
    await dataService.deleteAward(awardToDelete.value.id)
    alert('Award deleted successfully!')
    awardToDelete.value = null
    await fetchAwards()
  } catch (error) {
    alert('Error deleting award: ' + error.message)
  } finally {
    deleting.value = false
  }
}
</script>
