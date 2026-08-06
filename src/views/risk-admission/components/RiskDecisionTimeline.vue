<template>
  <a-card title="Risk Decisions" class="rd-card">
    <a-timeline>
      <a-timeline-item
        v-for="d in decisions"
        :key="d.id"
        :color="d.verdict === 'ALLOW' ? 'green' : 'red'"
      >
        <div class="rd-item">
          <div class="rd-verdict">
            <a-tag :color="d.verdict === 'ALLOW' ? 'green' : 'red'">{{ d.verdict }}</a-tag>
            <span class="rd-time">{{ d.time }}</span>
          </div>
          <div class="rd-reason" v-if="d.reason">{{ d.reason }}</div>
          <div class="rd-meta" v-if="d.correlationId">
            <small>corr: {{ d.correlationId }}</small>
          </div>
        </div>
      </a-timeline-item>
      <a-timeline-item v-if="decisions.length === 0" color="gray">
        No risk decisions recorded yet.
      </a-timeline-item>
    </a-timeline>
  </a-card>
</template>

<script>
export default {
  name: 'RiskDecisionTimeline',
  props: {
    decisions: { type: Array, default: () => [] }
  }
}
</script>

<style scoped>
.rd-card { margin-bottom: 16px; }
.rd-item { margin-bottom: 4px; }
.rd-verdict { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; }
.rd-time { font-size: 12px; color: #8c8c8c; }
.rd-reason { font-size: 13px; color: #595959; margin-bottom: 2px; }
.rd-meta { font-size: 11px; color: #bfbfbf; font-family: monospace; }
</style>
