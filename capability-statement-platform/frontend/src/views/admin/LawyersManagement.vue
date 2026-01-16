<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Lawyers Management</h1>
      <button @click="showCreateModal = true" class="btn btn-primary">
        + Add Lawyer
      </button>
    </div>

    <!-- Search and Filters -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Search</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name..."
            class="input"
            @input="filterLawyers"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Practice Group</label>
          <select v-model="filterPracticeGroup" @change="filterLawyers" class="input">
            <option value="">All</option>
            <option value="Corporate Law">Corporate Law</option>
            <option value="Intellectual Property">Intellectual Property</option>
            <option value="Litigation">Litigation</option>
          </select>
        </div>
        <div class="flex items-end">
          <button @click="clearFilters" class="btn btn-secondary w-full">
            Clear Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Lawyers Table -->
    <div class="card">
      <div v-if="loading" class="text-center py-8">Loading...</div>
      <div v-else>
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Title</th>
              <th>Practice Group</th>
              <th>Experience</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lawyer in filteredLawyers" :key="lawyer.id">
              <td>{{ lawyer.first_name }} {{ lawyer.last_name }}</td>
              <td>{{ lawyer.email || '-' }}</td>
              <td>{{ lawyer.title || '-' }}</td>
              <td>{{ lawyer.practice_group || '-' }}</td>
              <td>{{ lawyer.years_experience ? `${lawyer.years_experience} years` : '-' }}</td>
              <td>
                <div class="flex gap-2">
                  <button @click="editLawyer(lawyer)" class="text-primary-600 hover:text-primary-800 text-sm">
                    Edit
                  </button>
                  <button @click="confirmDelete(lawyer)" class="text-red-600 hover:text-red-800 text-sm">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredLawyers.length === 0">
              <td colspan="6" class="text-center py-8 text-gray-500">
                No lawyers found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || editingLawyer" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-semibold mb-4">
          {{ editingLawyer ? 'Edit Lawyer' : 'Add New Lawyer' }}
        </h3>
        
        <form @submit.prevent="saveLawyer" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">First Name *</label>
              <input v-model="lawyerForm.first_name" type="text" required class="input" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Last Name *</label>
              <input v-model="lawyerForm.last_name" type="text" required class="input" />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Email</label>
            <input v-model="lawyerForm.email" type="email" class="input" />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Title</label>
              <input v-model="lawyerForm.title" type="text" class="input" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Practice Group</label>
              <input v-model="lawyerForm.practice_group" type="text" class="input" />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Years of Experience</label>
            <input v-model.number="lawyerForm.years_experience" type="number" min="0" class="input" />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Bio</label>
            <textarea v-model="lawyerForm.bio" rows="3" class="input"></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Source System</label>
            <input v-model="lawyerForm.source_system" type="text" class="input" />
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
    <div v-if="lawyerToDelete" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-xl font-semibold mb-4">Delete Lawyer</h3>
        <p class="mb-4">
          Are you sure you want to delete 
          <strong>{{ lawyerToDelete.first_name }} {{ lawyerToDelete.last_name }}</strong>?
        </p>
        <p class="text-sm text-red-600 mb-4">
          This action cannot be undone if the lawyer is referenced in deals or awards.
        </p>
        <div class="flex gap-2 justify-end">
          <button @click="lawyerToDelete = null" class="btn btn-secondary">
            Cancel
          </button>
          <button @click="deleteLawyer" class="btn btn-danger" :disabled="deleting">
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import dataService from '../../services/dataService'

const authStore = useAuthStore()
const lawyers = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const searchQuery = ref('')
const filterPracticeGroup = ref('')
const showCreateModal = ref(false)
const editingLawyer = ref(null)
const lawyerToDelete = ref(null)

const lawyerForm = ref({
  first_name: '',
  last_name: '',
  email: '',
  title: '',
  practice_group: '',
  years_experience: null,
  bio: '',
  source_system: 'admin'
})

const filteredLawyers = computed(() => {
  let filtered = [...lawyers.value]
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(l => 
      l.first_name.toLowerCase().includes(query) ||
      l.last_name.toLowerCase().includes(query) ||
      (l.email && l.email.toLowerCase().includes(query))
    )
  }
  
  if (filterPracticeGroup.value) {
    filtered = filtered.filter(l => l.practice_group === filterPracticeGroup.value)
  }
  
  return filtered
})

onMounted(async () => {
  await fetchLawyers()
})

async function fetchLawyers() {
  loading.value = true
  try {
    const response = await dataService.getLawyers()
    lawyers.value = response.data || []
  } catch (error) {
    console.error('Error fetching lawyers:', error)
    alert('Error loading lawyers: ' + error.message)
  } finally {
    loading.value = false
  }
}

function filterLawyers() {
  // Filtering is handled by computed property
}

function clearFilters() {
  searchQuery.value = ''
  filterPracticeGroup.value = ''
}

function editLawyer(lawyer) {
  editingLawyer.value = lawyer
  lawyerForm.value = {
    first_name: lawyer.first_name,
    last_name: lawyer.last_name,
    email: lawyer.email || '',
    title: lawyer.title || '',
    practice_group: lawyer.practice_group || '',
    years_experience: lawyer.years_experience || null,
    bio: lawyer.bio || '',
    source_system: lawyer.source_system || 'admin'
  }
}

function closeModal() {
  showCreateModal.value = false
  editingLawyer.value = null
  lawyerForm.value = {
    first_name: '',
    last_name: '',
    email: '',
    title: '',
    practice_group: '',
    years_experience: null,
    bio: '',
    source_system: 'admin'
  }
}

async function saveLawyer() {
  saving.value = true
  try {
    if (editingLawyer.value) {
      // Update
      await dataService.updateLawyer(editingLawyer.value.id, lawyerForm.value)
      alert('Lawyer updated successfully!')
    } else {
      // Create
      await dataService.createLawyer(lawyerForm.value)
      alert('Lawyer created successfully!')
    }
    closeModal()
    await fetchLawyers()
  } catch (error) {
    alert('Error saving lawyer: ' + error.message)
  } finally {
    saving.value = false
  }
}

function confirmDelete(lawyer) {
  lawyerToDelete.value = lawyer
}

async function deleteLawyer() {
  if (!lawyerToDelete.value) return
  
  deleting.value = true
  try {
    await dataService.deleteLawyer(lawyerToDelete.value.id)
    alert('Lawyer deleted successfully!')
    lawyerToDelete.value = null
    await fetchLawyers()
  } catch (error) {
    alert('Error deleting lawyer: ' + error.message)
  } finally {
    deleting.value = false
  }
}
</script>
