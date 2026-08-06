<template>
  <a-card title="Audit Timeline" class="at-card">
    <a-timeline>
      <a-timeline-item
        v-for="e in events"
        :key="e.id"
        :color="eventColor(e.type)"
      >
        <div class="at-item">
          <div class="at-type">
            <a-tag :color="eventColor(e.type)">{{ e.type }}</a-tag>
            <span class="at-time">{{ e.time }}</span>
          </div>
          <div class="at-desc">{{ e.description }}</div>
          <div class="at-corr" v-if="e.correlationId">
            <small>{{ e.correlationId }}</small>
          </div>
        </div>
      </a-timeline-item>
      <a-timeline-item v-if="events.length === 0" color="gray">
        No audit events yet.
      </a-timeline-item>
    </a-timeline>
  </a-card>
</template>

<script>
export default {
  name: 'AuditTimeline',
  props: {
    events: { type: Array, default: () => [] }
  },
  methods: {
    eventColor (type) {
      const map = { ADMIT: 'blue', ORDER: 'green', FILL: 'cyan', CANCEL: 'orange', REJECT: 'red', RECONCILE: 'purple' }
      return map[type] || 'default'
    }
  }
}
</script>

<style scoped>
.at-card { margin-bottom: 16px; }
.at-item { margin-bottom: 4px; }
.at-type { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; }
.at-time { font-size: 12px; color: #8c8c8c; }
.at-desc { font-size: 13px; color: #595959; }
.at-corr { font-size: 11px; color: #bfbfbf; font-family: monospace; margin-top: 2px; }
</style>
