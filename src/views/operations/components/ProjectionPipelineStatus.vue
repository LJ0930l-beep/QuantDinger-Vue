<template>
  <a-card title="Projection Pipeline" class="pp-card">
    <div class="pp-stage" v-for="stage in stages" :key="stage.key">
      <div class="pp-label">{{ stage.label }}</div>
      <div class="pp-bar">
        <div class="pp-fill" :class="stage.status.toLowerCase()" :style="{ width: stage.status === 'HEALTHY' ? '100%' : '60%' }"></div>
      </div>
      <a-badge :status="stage.status === 'HEALTHY' ? 'success' : 'warning'" :text="stage.status" />
    </div>
  </a-card>
</template>

<script>
export default {
  name: 'ProjectionPipelineStatus',
  props: {
    pipeline: { type: Object, default: () => ({ authority: 'HEALTHY', reconciliation: 'HEALTHY', projection: 'HEALTHY' }) }
  },
  computed: {
    stages () {
      return [
        { key: 'authority', label: 'Authority', status: this.pipeline.authority || 'UNKNOWN' },
        { key: 'reconciliation', label: 'Recon', status: this.pipeline.reconciliation || 'UNKNOWN' },
        { key: 'projection', label: 'Projection', status: this.pipeline.projection || 'UNKNOWN' }
      ]
    }
  }
}
</script>

<style scoped>
.pp-card { margin-bottom: 16px; }
.pp-stage { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.pp-label { width: 80px; font-size: 13px; color: #595959; text-align: right; }
.pp-bar { flex: 1; height: 8px; background: #f0f0f0; border-radius: 4px; overflow: hidden; }
.pp-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }
.pp-fill.healthy { background: #52c41a; }
.pp-fill.degraded { background: #faad14; }
.pp-fill.unknown { background: #d9d9d9; }
</style>
