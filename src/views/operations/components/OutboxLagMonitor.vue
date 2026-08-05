<template>
  <a-card title="Outbox Lag" class="ol-card">
    <a-statistic title="Pending Events" :value="lag.pending || 0" :valueStyle="{ fontSize: '28px' }" />
    <a-divider style="margin: 12px 0" />
    <div class="ol-row">
      <span>Oldest Age</span>
      <strong>{{ lag.oldestAge || '0s' }}</strong>
    </div>
    <div class="ol-row">
      <span>Consumer</span>
      <a-badge
        :status="lag.consumerStatus === 'RUNNING' ? 'processing' : 'error'"
        :text="lag.consumerStatus || 'STOPPED'"
      />
    </div>
  </a-card>
</template>

<script>
export default {
  name: 'OutboxLagMonitor',
  props: {
    lag: { type: Object, default: () => ({ pending: 0, oldestAge: '0s', consumerStatus: 'RUNNING' }) }
  }
}
</script>

<style scoped>
.ol-card { margin-bottom: 16px; }
.ol-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
</style>
