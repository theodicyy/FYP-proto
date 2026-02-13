<template>
  <div class="animate-fade-in max-w-6xl mx-auto">

    <!-- HEADER -->
    <div class="page-header">
      <h1 class="page-title">Configure Capability Statement</h1>
      <p class="page-subtitle">Fill proposal details and assign roles for your document</p>
    </div>

    <!-- SUMMARY BAR -->
    <div class="card mb-6">
      <div class="flex flex-wrap items-center gap-3">
        <span class="section-title mb-0">Selected for this statement</span>
        <span class="badge badge-primary">
          {{ dataStore.selectedLawyers.length || 0 }} Lawyers
        </span>
        <span class="badge badge-accent">
          {{ dataStore.selectedDeals.length || 0 }} Deals
        </span>
        <span class="badge badge-secondary">
          {{ dataStore.selectedAwards.length || 0 }} Awards
        </span>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- LEFT: MANUAL FIELDS -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Proposal details</h2>
          <p class="card-subtitle">Client, matter and document information</p>
        </div>

        <!-- Client & document -->
        <p class="section-title">Client & document</p>
        <div class="input-group space-y-4 mb-6">
          <div>
            <label class="label">Client name</label>
            <input v-model="capStore.manualFields.client_name" class="input" placeholder="e.g. Acme Corporation" />
          </div>
          <div>
            <label class="label">Client short name</label>
            <input v-model="capStore.manualFields.client_shortname" class="input" placeholder="e.g. Acme" />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="label">Date</label>
              <input type="date" v-model="capStore.manualFields.date" class="input" />
            </div>
            <div>
              <label class="label">Tender number</label>
              <input v-model="capStore.manualFields.tender_number" class="input" placeholder="Optional" />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="label">Document type</label>
              <select v-model="capStore.manualFields.doc_type" class="select">
                <option value="">Select</option>
                <option value="credential">Credential</option>
                <option value="proposal">Proposal</option>
              </select>
            </div>
            <div>
              <label class="label">Matter type</label>
              <select v-model="capStore.manualFields.matter_type" class="select">
                <option value="">Select</option>
                <option value="transaction">Transaction</option>
                <option value="project">Project</option>
              </select>
            </div>
            <div>
              <label class="label">Client type</label>
              <select v-model="capStore.manualFields.client_type" class="select">
                <option value="">Select</option>
                <option value="business">Business</option>
                <option value="organisation">Organisation</option>
              </select>
            </div>
          </div>
          <div>
            <label class="label">Main practice area</label>
            <input v-model="capStore.manualFields.main_practice_area" class="input" placeholder="e.g. Corporate M&A" />
          </div>
          <div>
            <label class="label">Matter description</label>
            <textarea v-model="capStore.manualFields.matter_desc" class="input" rows="3" placeholder="Brief description of the matter" />
          </div>
        </div>

        <!-- Scope & fees -->
        <p class="section-title">Scope & fees</p>
        <div class="input-group space-y-4 mb-6">
          <div>
            <label class="label">Scope summary</label>
            <textarea v-model="capStore.manualFields.scope_of_work" class="input" rows="2" placeholder="High-level scope" />
          </div>
          <div>
            <label class="label">Detailed scope</label>
            <textarea v-model="capStore.manualFields.scope_of_work_list" class="input" rows="3" placeholder="Point-by-point or paragraph" />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="label">Discount rate (%)</label>
              <input v-model="capStore.manualFields.discount_rate" class="input" type="text" placeholder="e.g. 10" />
            </div>
            <div>
              <label class="label">Fee assumptions</label>
              <textarea v-model="capStore.manualFields.fee_assumptions" class="input" rows="2" placeholder="Brief assumptions" />
            </div>
          </div>
        </div>

        <!-- Options -->
        <p class="section-title">Options</p>
        <div class="flex flex-wrap gap-6">
          <label class="checkbox-row">
            <input type="checkbox" v-model="capStore.manualFields.cross_border_bool" class="checkbox-input" />
            <span>Cross border</span>
          </label>
          <label class="checkbox-row">
            <input type="checkbox" v-model="capStore.manualFields.show_highlights" class="checkbox-input" />
            <span>Include highlights</span>
          </label>
          <label class="checkbox-row">
            <input type="checkbox" v-model="capStore.manualFields.show_track_record" class="checkbox-input" />
            <span>Include track record</span>
          </label>
        </div>
      </div>

      <!-- RIGHT: TEAM & AWARDS -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Team & recognition</h2>
          <p class="card-subtitle">Practices, lead partners, roles and awards</p>
        </div>

        <!-- Practices -->
        <p class="section-title">Practices</p>
        <div class="flex flex-wrap gap-2 mb-6">
          <label
            v-for="p in practices"
            :key="p"
            class="practice-pill"
            :class="{ 'practice-pill-active': (capStore.manualFields.practice_list || []).includes(p) }"
          >
            <input type="checkbox" :value="p" v-model="capStore.manualFields.practice_list" class="sr-only" />
            <span>{{ p }}</span>
          </label>
        </div>

        <!-- Lead partners -->
        <p class="section-title">Lead partners</p>
        <div class="mb-6">
          <select multiple class="select min-h-[7rem]" v-model="capStore.manualFields.lead_partners">
            <option
              v-for="l in lawyers"
              :key="l.id"
              :value="l.id"
            >
              {{ l.first_name || 'Test' }} {{ l.last_name || 'Lawyer' }}
            </option>
          </select>
          <p class="input-helper">Hold Ctrl/Cmd to select multiple</p>
        </div>

        <!-- Lawyer roles -->
        <p class="section-title">Lawyer roles</p>
        <div class="space-y-3 mb-6">
          <div
            v-for="l in lawyers"
            :key="l.id"
            class="flex items-center gap-4 py-2 border-b border-[var(--color-border)] last:border-0"
          >
            <span class="w-36 text-sm font-medium" style="color: var(--color-text);">
              {{ l.first_name || 'Test' }} {{ l.last_name || 'Lawyer' }}
            </span>
            <select class="select flex-1 max-w-[12rem]" v-model="capStore.manualFields.lawyer_roles[l.id]">
              <option value="">—</option>
              <option value="Head">Head</option>
              <option value="Co-head">Co-head</option>
              <option value="Partner">Partner</option>
              <option value="Associate">Associate</option>
            </select>
          </div>
        </div>

        <!-- Most relevant awards -->
        <p class="section-title">Most relevant awards</p>
        <div class="space-y-2">
          <label
            v-for="a in awards"
            :key="a.id"
            class="checkbox-row"
          >
            <input type="checkbox" :value="a.id" v-model="capStore.manualFields.most_rel_award" class="checkbox-input" />
            <span>{{ a.award_name || 'Test Award' }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- ERROR & CTA -->
    <div class="mt-8 flex flex-col gap-4">
      <Transition name="fade">
        <div v-if="capStore.error" class="alert alert-error flex items-start gap-3">
          <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ capStore.error.friendlyMessage || capStore.error.message || 'Generate failed' }}</span>
        </div>
      </Transition>
      <div class="flex justify-end">
        <button
          class="btn btn-primary btn-lg"
          @click="generate"
          :disabled="capStore.loading"
        >
          <span v-if="capStore.loading" class="spinner inline-block align-middle mr-2" />
          {{ capStore.loading ? 'Generating…' : 'Generate capability statement' }}
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '../stores/dataStore'
import { useCapStatementStore } from '../stores/capStatementStore'
import { useCreateFlowStore } from '../stores/createFlowStore'

const router = useRouter()
const dataStore = useDataStore()
const capStore = useCapStatementStore()
const flow = useCreateFlowStore()

const lawyers = computed(() => dataStore.selectedLawyers.length ? dataStore.selectedLawyers : [{ id: 1 }])
const awards = computed(() => dataStore.selectedAwards.length ? dataStore.selectedAwards : [{ id: 1 }])

const practices = computed(() => {
  const set = new Set()
  lawyers.value.forEach(l => l.practice_group && set.add(l.practice_group))
  return [...set]
})

async function generate() {
  capStore.error = null
  try {
    await capStore.generateStatement({
      selectedIds: {
        lawyerIds: lawyers.value.map(x => x.id),
        dealIds: dataStore.selectedDeals.map(x => x.id),
        awardIds: awards.value.map(x => x.id)
      },
      manualFields: capStore.manualFields
    })
    router.push('/preview')
  } catch (_) {
    // Error shown via capStore.error in template
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.checkbox-row {
  @apply flex items-center gap-2.5 cursor-pointer text-sm;
  color: var(--color-text);
}
.checkbox-input {
  @apply w-4 h-4 rounded border-2 border-[var(--color-border)];
  accent-color: var(--color-primary);
}

.practice-pill {
  @apply inline-flex items-center px-3.5 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-150;
  background-color: var(--color-neutral-light);
  color: var(--color-text-light);
  border: 1px solid var(--color-neutral-border);
}
.practice-pill:hover {
  border-color: var(--color-border-strong);
  color: var(--color-text);
}
.practice-pill-active {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  border-color: var(--color-primary);
}
</style>
