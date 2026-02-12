<template>
  <div class="animate-fade-in">
    <div class="page-header">
      <h1 class="page-title">Start Creating</h1>
      <p class="page-subtitle">Choose how you want to create your capability statement</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- DATA MODE (DEFAULT) -->
      <div class="card border-2 border-primary-500 bg-primary-50/40">
        <div class="card-header">
          <h2 class="card-title">Use existing data</h2>
          <p class="card-subtitle">Select lawyers, deals, and awards first</p>
        </div>

        <button class="btn btn-primary w-full" @click="goData">
          Continue (Recommended)
        </button>
      </div>

      <!-- MANUAL MODE -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Manual input</h2>
          <p class="card-subtitle">Fill details manually, then generate</p>
        </div>

        <button class="btn btn-secondary w-full" @click="goManual">
          Manual input instead
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useCreateFlowStore } from '../stores/createFlowStore'

const router = useRouter()
const flow = useCreateFlowStore()

function goData() {
  flow.setMode('data')
  router.push('/aggregation')
}

function goManual() {
  flow.setMode('manual')
  router.push('/configuration?mode=manual')
}
</script>
