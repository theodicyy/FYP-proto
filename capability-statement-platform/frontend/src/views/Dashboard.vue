<template>
  <div class="animate-fade-in">
    <!-- Page Header -->
    <div class="page-header">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Welcome back! Here's an overview of your capability statements.</p>
        </div>
        <div class="page-actions">
          <router-link to="/aggregation" class="btn btn-primary">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
            </svg>
            Create Statement
          </router-link>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Lawyers Card -->
      <div class="stat-card card-hover group">
        <div class="flex items-start justify-between">
          <div>
            <p class="stat-label">Total Lawyers</p>
            <p class="stat-value text-primary-600">{{ stats.lawyers }}</p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-500 group-hover:scale-110 transition-transform duration-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
        <p class="stat-change text-secondary-500 flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Available in database
        </p>
      </div>

      <!-- Deals Card -->
      <div class="stat-card card-hover group">
        <div class="flex items-start justify-between">
          <div>
            <p class="stat-label">Total Deals</p>
            <p class="stat-value text-emerald-600">{{ stats.deals }}</p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform duration-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        <p class="stat-change text-secondary-500 flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Completed transactions
        </p>
      </div>

      <!-- Awards Card -->
      <div class="stat-card card-hover group">
        <div class="flex items-start justify-between">
          <div>
            <p class="stat-label">Total Awards</p>
            <p class="stat-value text-amber-600">{{ stats.awards }}</p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        </div>
        <p class="stat-change text-secondary-500 flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          Recognition received
        </p>
      </div>
    </div>

    <!-- Quick Actions Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Quick Actions -->
      <div class="lg:col-span-2 card">
        <div class="card-header">
          <h2 class="card-title">Quick Actions</h2>
          <p class="card-subtitle">Get started with common tasks</p>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <router-link 
            to="/aggregation" 
            class="group p-5 rounded-xl border border-secondary-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all duration-200"
          >
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform duration-200">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 class="font-medium text-secondary-900 group-hover:text-primary-700 transition-colors">Create New Statement</h3>
                <p class="text-sm text-secondary-500 mt-1">Select data and generate a new capability statement</p>
              </div>
            </div>
          </router-link>

          <router-link 
            to="/library" 
            class="group p-5 rounded-xl border border-secondary-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-200"
          >
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-200">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
              </div>
              <div>
                <h3 class="font-medium text-secondary-900 group-hover:text-emerald-700 transition-colors">View Library</h3>
                <p class="text-sm text-secondary-500 mt-1">Browse and manage saved capability statements</p>
              </div>
            </div>
          </router-link>

          <router-link 
            v-if="authStore.isAdmin"
            to="/admin/lawyers" 
            class="group p-5 rounded-xl border border-secondary-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200"
          >
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-200">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h3 class="font-medium text-secondary-900 group-hover:text-blue-700 transition-colors">Manage Lawyers</h3>
                <p class="text-sm text-secondary-500 mt-1">Add, edit, or remove lawyer profiles</p>
              </div>
            </div>
          </router-link>

          <router-link 
            v-if="authStore.isAdmin"
            to="/admin/templates" 
            class="group p-5 rounded-xl border border-secondary-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200"
          >
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform duration-200">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <div>
                <h3 class="font-medium text-secondary-900 group-hover:text-purple-700 transition-colors">Manage Templates</h3>
                <p class="text-sm text-secondary-500 mt-1">Create and customize document templates</p>
              </div>
            </div>
          </router-link>
        </div>
      </div>

      <!-- Getting Started / Tips -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Getting Started</h2>
          <p class="card-subtitle">Follow these steps</p>
        </div>
        
        <div class="space-y-4">
          <div class="flex gap-3">
            <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium text-sm flex-shrink-0">
              1
            </div>
            <div>
              <p class="text-sm font-medium text-secondary-900">Select your data</p>
              <p class="text-xs text-secondary-500 mt-0.5">Choose lawyers, deals, and awards</p>
            </div>
          </div>
          
          <div class="flex gap-3">
            <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium text-sm flex-shrink-0">
              2
            </div>
            <div>
              <p class="text-sm font-medium text-secondary-900">Choose a template</p>
              <p class="text-xs text-secondary-500 mt-0.5">Pick from available templates</p>
            </div>
          </div>
          
          <div class="flex gap-3">
            <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium text-sm flex-shrink-0">
              3
            </div>
            <div>
              <p class="text-sm font-medium text-secondary-900">Generate statement</p>
              <p class="text-xs text-secondary-500 mt-0.5">Create and preview your document</p>
            </div>
          </div>
          
          <div class="flex gap-3">
            <div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-secondary-900">Save to library</p>
              <p class="text-xs text-secondary-500 mt-0.5">Store and manage versions</p>
            </div>
          </div>
        </div>

        <div class="mt-6 pt-6 border-t border-secondary-100">
          <router-link to="/aggregation" class="btn btn-primary w-full">
            Start Creating
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDataStore } from '../stores/dataStore'
import { useAuthStore } from '../stores/authStore'

const dataStore = useDataStore()
const authStore = useAuthStore()

const stats = ref({
  lawyers: 0,
  deals: 0,
  awards: 0
})

onMounted(async () => {
  await Promise.all([
    dataStore.fetchLawyers(),
    dataStore.fetchDeals(),
    dataStore.fetchAwards()
  ])
  
  stats.value = {
    lawyers: dataStore.lawyers.length,
    deals: dataStore.deals.length,
    awards: dataStore.awards.length
  }
})
</script>
