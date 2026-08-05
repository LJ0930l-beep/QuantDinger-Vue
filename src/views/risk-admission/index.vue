<template>
  <div class="risk-admission">
    <div class="ra-header">
      <h2 class="ra-title">
        <a-icon type="safety" />
        {{ $t('riskAdmission.title') || 'Risk & Admission' }}
      </h2>
      <p class="ra-subtitle">Kill Switch control, risk decisions, and reservation status</p>
    </div>

    <a-row :gutter="16">
      <a-col :span="8">
        <KillSwitchPanel :switches="killSwitches" @toggle="handleKillToggle" />
      </a-col>
      <a-col :span="8">
        <RiskDecisionTimeline :decisions="riskDecisions" />
      </a-col>
      <a-col :span="8">
        <ReconciliationHealth :health="reconciliationHealth" />
      </a-col>
    </a-row>
  </div>
</template>

<script>
import KillSwitchPanel from './components/KillSwitchPanel.vue'
import RiskDecisionTimeline from './components/RiskDecisionTimeline.vue'
import ReconciliationHealth from './components/ReconciliationHealth.vue'

export default {
  name: 'RiskAdmission',
  components: { KillSwitchPanel, RiskDecisionTimeline, ReconciliationHealth },
  data () {
    return {
      killSwitches: [
        { scope: 'GLOBAL', label: 'Global', enabled: false },
        { scope: 'ACCOUNT', label: 'Account', enabled: false },
        { scope: 'STRATEGY', label: 'Strategy', enabled: false }
      ],
      riskDecisions: [],
      reconciliationHealth: { status: 'HEALTHY', discrepancies: 0, lastCheck: null }
    }
  },
  methods: {
    handleKillToggle (scope, enabled) {
      const sw = this.killSwitches.find(s => s.scope === scope)
      if (sw) sw.enabled = enabled
    }
  }
}
</script>

<style scoped>
.risk-admission { padding: 24px; }
.ra-header { margin-bottom: 24px; }
.ra-title { font-size: 20px; font-weight: 500; margin: 0 0 4px; }
.ra-subtitle { color: #8c8c8c; margin: 0; font-size: 14px; }
</style>
