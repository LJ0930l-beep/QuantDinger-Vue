<template>
  <a-card title="Kill Switch" class="ks-card">
    <a-alert
      v-if="anyEnabled"
      type="warning"
      message="Trading Halted"
      description="One or more kill switches are active. All new orders are blocked."
      showIcon
      style="margin-bottom: 12px"
    />
    <div v-for="sw in switches" :key="sw.scope" class="ks-row">
      <div class="ks-info">
        <div class="ks-label">{{ sw.label }}</div>
        <div class="ks-scope">{{ sw.scope }}</div>
      </div>
      <a-switch
        :checked="sw.enabled"
        :loading="sw.pending"
        @change="(val) => $emit('toggle', sw.scope, val)"
      >
        <a-icon slot="checkedChildren" type="check" />
        <a-icon slot="unCheckedChildren" type="close" />
      </a-switch>
    </div>
  </a-card>
</template>

<script>
export default {
  name: 'KillSwitchPanel',
  props: {
    switches: { type: Array, default: () => [] }
  },
  computed: {
    anyEnabled () {
      return this.switches.some(s => s.enabled)
    }
  }
}
</script>

<style scoped>
.ks-card { margin-bottom: 16px; }
.ks-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
.ks-row:last-child { border-bottom: none; }
.ks-label { font-size: 14px; font-weight: 500; }
.ks-scope { font-size: 12px; color: #8c8c8c; }
</style>
