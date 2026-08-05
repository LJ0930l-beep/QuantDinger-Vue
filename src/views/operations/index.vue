<template>
  <div class="operations">
    <div class="ops-header">
      <h2 class="ops-title">
        <a-icon type="dashboard" />
        {{ $t('operations.title') || 'Operations' }}
      </h2>
      <p class="ops-subtitle">Monitor outbox lag, projection pipeline, shadow diff, and audit trail</p>
    </div>

    <a-row :gutter="16">
      <a-col :span="8">
        <OutboxLagMonitor :lag="outboxLag" />
      </a-col>
      <a-col :span="8">
        <ProjectionPipelineStatus :pipeline="pipelineStatus" />
      </a-col>
      <a-col :span="8">
        <AuditTimeline :events="auditEvents" />
      </a-col>
    </a-row>
  </div>
</template>

<script>
import OutboxLagMonitor from './components/OutboxLagMonitor.vue'
import ProjectionPipelineStatus from './components/ProjectionPipelineStatus.vue'
import AuditTimeline from './components/AuditTimeline.vue'

export default {
  name: 'Operations',
  components: { OutboxLagMonitor, ProjectionPipelineStatus, AuditTimeline },
  data () {
    return {
      outboxLag: { pending: 0, oldestAge: '0s', consumerStatus: 'RUNNING' },
      pipelineStatus: { authority: 'HEALTHY', reconciliation: 'HEALTHY', projection: 'HEALTHY' },
      auditEvents: []
    }
  }
}
</script>

<style scoped>
.operations { padding: 24px; }
.ops-header { margin-bottom: 24px; }
.ops-title { font-size: 20px; font-weight: 500; margin: 0 0 4px; }
.ops-subtitle { color: #8c8c8c; margin: 0; font-size: 14px; }
</style>
