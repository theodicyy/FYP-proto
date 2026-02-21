<template>
  <div class="config-page animate-fade-in">
    <!-- Page header -->
    <header class="page-header mb-6 sm:mb-8">
      <h1 class="page-title">Configure Capability Statement</h1>
      <p class="page-subtitle">
        Fill proposal details and assign roles for your document
      </p>
    </header>

    <!-- Summary bar: selected counts -->
    <section class="card mb-6" aria-label="Selection summary">
      <div class="flex flex-wrap items-center gap-3 gap-y-2">
        <span class="section-title mb-0 mr-1">Selected for this statement</span>
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
    </section>

    <!-- Error alert -->
    <Transition name="fade">
      <div
        v-if="capStore.error"
        class="alert alert-error mb-6 flex items-start gap-3"
        role="alert"
      >
        <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ capStore.error.friendlyMessage || capStore.error.message || 'Generate failed' }}</span>
      </div>
    </Transition>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-8">
      <!-- Card 1: Proposal details -->
      <article class="card config-card">
        <div class="card-header">
          <h2 class="card-title">Proposal details</h2>
          <p class="card-subtitle">Client, matter and document information</p>
        </div>

        <!-- Client & document -->
        <p class="section-title">Client & document</p>
        <div class="space-y-4 mb-6">
          <div class="input-group">
            <label class="label" for="client_name">Client name</label>
            <input
              id="client_name"
              v-model="capStore.manualFields.client_name"
              type="text"
              class="input"
              placeholder="e.g. Acme Corporation"
              autocomplete="organization"
            />
          </div>
          <div class="input-group">
            <label class="label" for="client_shortname">Client short name</label>
            <input
              id="client_shortname"
              v-model="capStore.manualFields.client_shortname"
              type="text"
              class="input"
              placeholder="e.g. Acme"
            />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="input-group">
              <label class="label" for="date">Date</label>
              <input
                id="date"
                v-model="capStore.manualFields.date"
                type="date"
                class="input"
              />
            </div>
            <div class="input-group">
              <label class="label" for="tender_number">Tender number</label>
              <input
                id="tender_number"
                v-model="capStore.manualFields.tender_number"
                type="text"
                class="input"
                placeholder="Optional"
              />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="input-group">
              <label class="label" for="doc_type">Document type</label>
              <select id="doc_type" v-model="capStore.manualFields.doc_type" class="select">
                <option value="">Select</option>
                <option value="credential">Credential</option>
                <option value="proposal">Proposal</option>
              </select>
            </div>
            <div class="input-group">
              <label class="label" for="matter_type">Matter type</label>
              <select id="matter_type" v-model="capStore.manualFields.matter_type" class="select">
                <option value="">Select</option>
                <option value="transaction">Transaction</option>
                <option value="project">Project</option>
              </select>
            </div>
            <div class="input-group">
              <label class="label" for="client_type">Client type</label>
              <select id="client_type" v-model="capStore.manualFields.client_type" class="select">
                <option value="">Select</option>
                <option value="business">Business</option>
                <option value="organisation">Organisation</option>
              </select>
            </div>
          </div>
          <div class="input-group">
            <label class="label" for="main_practice_area">Main practice area</label>
            <input
              id="main_practice_area"
              v-model="capStore.manualFields.main_practice_area"
              type="text"
              class="input"
              placeholder="e.g. Corporate M&A"
            />
          </div>
          <div class="input-group">
            <label class="label" for="matter_desc">Matter description</label>
            <textarea
              id="matter_desc"
              v-model="capStore.manualFields.matter_desc"
              class="input min-h-[4.5rem]"
              rows="3"
              placeholder="Brief description of the matter"
            />
          </div>
        </div>

        <!-- Scope & fees -->
        <p class="section-title">Scope & fees</p>
        <div class="space-y-4 mb-6">
          <div class="input-group">
            <label class="label" for="scope_of_work">Scope summary</label>
            <textarea
              id="scope_of_work"
              v-model="capStore.manualFields.scope_of_work"
              class="input min-h-[3.5rem]"
              rows="2"
              placeholder="High-level scope"
            />
          </div>
          <div class="input-group">
            <label class="label" for="scope_of_work_list">Detailed scope</label>
            <textarea
              id="scope_of_work_list"
              v-model="capStore.manualFields.scope_of_work_list"
              class="input min-h-[4.5rem]"
              rows="3"
              placeholder="Point-by-point or paragraph"
            />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="input-group">
              <label class="label" for="discount_rate">Discount rate (%)</label>
              <input
                id="discount_rate"
                v-model="capStore.manualFields.discount_rate"
                type="text"
                class="input"
                placeholder="e.g. 10"
                inputmode="decimal"
              />
            </div>
            <div class="input-group">
              <label class="label" for="fee_assumptions">Fee assumptions</label>
              <textarea
                id="fee_assumptions"
                v-model="capStore.manualFields.fee_assumptions"
                class="input min-h-[3.5rem]"
                rows="2"
                placeholder="Brief assumptions"
              />
            </div>
          </div>
        </div>

        <!-- Options -->
        <p class="section-title">Options</p>
        <div class="flex flex-wrap gap-x-6 gap-y-3">
          <label class="checkbox-row">
            <input
              v-model="capStore.manualFields.cross_border_bool"
              type="checkbox"
              class="checkbox-input"
              aria-describedby="opt-cross-border"
            />
            <span id="opt-cross-border">Cross border</span>
          </label>
          <label class="checkbox-row">
            <input
              v-model="capStore.manualFields.show_highlights"
              type="checkbox"
              class="checkbox-input"
              aria-describedby="opt-highlights"
            />
            <span id="opt-highlights">Include highlights</span>
          </label>
          <label class="checkbox-row">
            <input
              v-model="capStore.manualFields.show_track_record"
              type="checkbox"
              class="checkbox-input"
              aria-describedby="opt-track"
            />
            <span id="opt-track">Include track record</span>
          </label>
        </div>
      </article>

      <!-- Card 2: Team & recognition -->
      <article class="card config-card">
        <div class="card-header">
          <h2 class="card-title">Team & recognition</h2>
          <p class="card-subtitle">Practices, lead partners, roles and awards</p>
        </div>

        <!-- Practices -->
        <p class="section-title">Practice areas</p>
        <div class="flex flex-wrap gap-2 mb-6">
          <label
            v-for="p in practices"
            :key="p"
            class="practice-pill"
            :class="{ 'practice-pill-active': (capStore.manualFields.practice_list || []).includes(p) }"
          >
            <input
              type="checkbox"
              :value="p"
              v-model="capStore.manualFields.practice_list"
              class="sr-only"
              :aria-label="`Toggle ${p}`"
            />
            <span>{{ p }}</span>
          </label>
        </div>
        <p v-if="practices.length === 0" class="text-muted text-sm mb-6">
          Select deals in Aggregation to see practice areas here.
        </p>

        <!-- Lawyer roles + Lead (exactly 2 required) -->
        <p class="section-title">Lawyer roles</p>
        <div class="lead-partner-block mb-6">
          <p class="input-helper mb-2">
            Select <strong>exactly 2</strong> lead partners (required).
          </p>
          <div
            class="rounded-lg px-3 py-2 mb-3 text-sm font-medium lead-counter"
            :class="leadPartnersValid ? 'lead-counter-valid' : 'lead-counter-invalid'"
            role="status"
            aria-live="polite"
          >
            {{ leadPartnerCount }} of 2 lead partners selected
          </div>
          <div class="space-y-3">
            <div
              v-for="l in lawyers"
              :key="l.id"
              class="lawyer-row"
            >
              <span class="lawyer-name">{{ l.first_name || 'Test' }} {{ l.last_name || 'Lawyer' }}</span>
              <select
                v-model="capStore.manualFields.lawyer_roles[l.id]"
                class="select select-sm"
                :aria-label="`Role for ${l.first_name} ${l.last_name}`"
              >
                <option value="">—</option>
                <option value="Head">Head</option>
                <option value="Co-head">Co-head</option>
                <option value="Partner">Partner</option>
                <option value="Associate">Associate</option>
              </select>
              <label
                class="checkbox-row checkbox-row-sm"
                :class="{ 'opacity-60 cursor-not-allowed': isLeadCheckboxDisabled(l.id) }"
              >
                <input
                  type="checkbox"
                  :value="l.id"
                  v-model="capStore.manualFields.lead_partner_ids"
                  :disabled="isLeadCheckboxDisabled(l.id)"
                  :aria-label="`${capStore.manualFields.lead_partner_ids.includes(l.id) ? 'Deselect' : 'Select'} ${l.first_name} ${l.last_name} as lead partner`"
                />
                <span>Lead</span>
              </label>
            </div>
          </div>
          <p
            v-if="!leadPartnersValid && leadPartnerCount > 0"
            id="lead-validation-msg"
            class="input-helper mt-2 text-amber-700"
            role="alert"
          >
            Select exactly 2 lead partners to continue.
          </p>
        </div>

        <!-- Most relevant awards -->
        <p class="section-title">Most relevant awards</p>
        <div class="space-y-2">
          <label
            v-for="a in awards"
            :key="a.id"
            class="checkbox-row"
          >
            <input
              type="checkbox"
              :value="a.id"
              v-model="capStore.manualFields.most_rel_award"
              class="checkbox-input"
            />
            <span>{{ a.award_name || 'Test Award' }}</span>
          </label>
        </div>
      </article>
    </div>

    <!-- CTA -->
    <footer class="mt-8 pt-6 border-t border-[var(--color-border)]">
      <p
        v-if="!leadPartnersValid && !capStore.loading"
        id="generate-helper"
        class="text-sm text-muted mb-3"
      >
        Select exactly 2 lead partners above to enable generation.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-end items-stretch sm:items-center">
        <button
          type="button"
          class="btn btn-primary btn-lg order-last sm:order-none w-full sm:w-auto min-w-[12rem]"
          :disabled="capStore.loading || !leadPartnersValid"
          :aria-describedby="!leadPartnersValid ? 'generate-helper' : undefined"
          @click="generate"
        >
          <span v-if="capStore.loading" class="spinner mr-2" aria-hidden="true" />
          <span>{{ capStore.loading ? 'Generating…' : 'Generate capability statement' }}</span>
        </button>
      </div>
    </footer>
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

const lawyers = computed(() =>
  dataStore.selectedLawyers.length ? dataStore.selectedLawyers : [{ id: 1 }]
)
const awards = computed(() =>
  dataStore.selectedAwards.length ? dataStore.selectedAwards : [{ id: 1 }]
)

const practices = computed(() => {
  const set = new Set()
  dataStore.selectedDeals.forEach((d) => {
    if (!d.deal_pg) return
    let pgs = []
    if (Array.isArray(d.deal_pg)) {
      pgs = d.deal_pg
    } else if (typeof d.deal_pg === 'string') {
      try {
        const parsed = JSON.parse(d.deal_pg)
        if (Array.isArray(parsed)) pgs = parsed
        else pgs = d.deal_pg.split(',')
      } catch {
        pgs = d.deal_pg.split(',')
      }
    }
    pgs.forEach((pg) => pg && set.add(pg.trim()))
  })
  return [...set]
})

const LEAD_PARTNER_REQUIRED = 2

const leadPartnerCount = computed(() => (capStore.manualFields.lead_partner_ids || []).length)

const leadPartnersValid = computed(() => leadPartnerCount.value === LEAD_PARTNER_REQUIRED)

function isLeadCheckboxDisabled(lawyerId) {
  const ids = capStore.manualFields.lead_partner_ids || []
  const isSelected = ids.includes(lawyerId)
  if (isSelected) return false
  return ids.length >= LEAD_PARTNER_REQUIRED
}

async function generate() {
  capStore.error = null
  try {
    await capStore.generateStatement({
      selectedIds: {
        lawyerIds: lawyers.value.map((x) => x.id),
        dealIds: dataStore.selectedDeals.map((x) => x.id),
        awardIds: awards.value.map((x) => x.id),
      },
      manualFields: capStore.manualFields,
    })
    router.push('/preview')
  } catch (_) {
    // Error shown via capStore.error in template
  }
}
</script>

<style scoped>
.config-page {
  max-width: 72rem;
  margin-left: auto;
  margin-right: auto;
}

.config-card {
  @apply flex flex-col;
}

/* Responsive lawyer row: stack on small screens */
.lawyer-row {
  @apply flex flex-wrap items-center gap-3 py-2.5;
  border-bottom: 1px solid var(--color-border);
}
.lawyer-row:last-child {
  border-bottom: none;
}

.lawyer-name {
  @apply text-sm font-medium min-w-0;
  color: var(--color-text);
  flex: 1 1 8rem;
}

.select-sm {
  @apply max-w-[11rem] flex-shrink-0;
}

.checkbox-row {
  @apply flex items-center gap-2.5 cursor-pointer text-sm select-none;
  color: var(--color-text);
}

.checkbox-row-sm {
  @apply flex-shrink-0;
}

.lead-counter {
  @apply border;
}

.lead-counter-valid {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.lead-counter-invalid {
  background-color: rgba(245, 158, 11, 0.12);
  color: #b45309;
  border-color: rgba(245, 158, 11, 0.4);
}

.checkbox-input {
  @apply w-4 h-4 rounded border-2 border-[var(--color-border)];
  accent-color: var(--color-primary);
}

.practice-pill {
  @apply inline-flex items-center px-3.5 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-150 select-none;
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

/* Spinner (matches design system) */
.spinner {
  @apply inline-block w-5 h-5 rounded-full border-2 border-[var(--color-border)];
  border-top-color: var(--color-primary);
  animation: spin 0.8s linear infinite;
  vertical-align: middle;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive: full-width button on very small screens */
@media (max-width: 475px) {
  .lawyer-row {
    flex-direction: column;
    align-items: stretch;
  }

  .lawyer-name {
    flex: none;
  }

  .select-sm {
    max-width: none;
  }
}
</style>
