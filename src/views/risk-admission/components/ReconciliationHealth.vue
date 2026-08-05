<template>
  <a-card title="Reconciliation" class="rh-card">
    <div class="rh-status">
      <div class="rh-indicator" :class="health.status.toLowerCase()"></div>
      <div>
        <div class="rh-status-text">{{ health.status }}</div>
        <div class="rh-status-sub">
          {{ health.discrepancies }} discrepancies
          <span v-if="health.lastCheck"> | Last: {{ health.lastCheck }}</span>
        </div>
      </div>
    </div>
    <a-divider style="margin: 12px 0" />
    <div class="rh-details">
      <div class="rh-row">
        <span>Local Fills</span>
        <strong>{{ health.localFills || 0 }}</strong>
      </div>
      <div class="rh-row">
        <span>External Fills</span>
        <strong>{{ health.externalFills || 0 }}</strong>
      </div>
      <div class="rh-row">
        <span>Position Match</span>
        <strong :style="{ color: health.positionMatch ? '#52c41a' : '#f5222d' }">
          {{ health.positionMatch ? 'OK' : 'MISMATCH' }}
        </strong>
      </div>
    </div>
  </a-card>
</template>

<script>
export default {
  name: 'ReconciliationHealth',
  props: {
    health: { type: Object, default: () => ({ status: 'HEALTHY', discrepancies: 0 }) }
  }
}
</script>

<style scoped>
.rh-card { margin-bottom: 16px; }
.rh-status { display: flex; align-items: center; gap: 12px; }
.rh-indicator { width: 12px; height: 12px; border-radius: 50%; }
.rh-indicator.healthy { background: #52c41a; }
.rh-indicator.degraded { background: #faad14; }
.rh-indicator.critical { background: #f5222d; }
.rh-status-text { font-size: 16px; font-weight: 500; }
.rh-status-sub { font-size: 12px; color: #8c8c8c; }
.rh-details { font-size: 13px; }
.rh-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f5f5f5; }
.rh-row:last-child { border-bottom: none; }
</style>
