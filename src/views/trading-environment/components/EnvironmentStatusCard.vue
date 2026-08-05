<template>
  <a-card :title="'Strategy Status — ' + env.toUpperCase()" class="env-card">
    <a-table
      :columns="columns"
      :dataSource="strategies"
      :pagination="false"
      size="small"
      rowKey="id"
    >
      <template slot="status" slot-scope="text">
        <a-badge :status="text === 'active' ? 'processing' : 'default'" :text="text" />
      </template>
      <template slot="pnl" slot-scope="text">
        <span :style="{ color: text >= 0 ? '#cf1322' : '#3f8600' }">
          {{ text >= 0 ? '+' : '' }}{{ text }}%
        </span>
      </template>
    </a-table>
  </a-card>
</template>

<script>
export default {
  name: 'EnvironmentStatusCard',
  props: {
    env: { type: String, default: 'paper' },
    strategies: { type: Array, default: () => [] }
  },
  data () {
    return {
      columns: [
        { title: 'Strategy', dataIndex: 'name', key: 'name' },
        { title: 'Status', dataIndex: 'status', key: 'status', scopedSlots: { customRender: 'status' } },
        { title: 'Instrument', dataIndex: 'instrument', key: 'instrument' },
        { title: 'Position', dataIndex: 'position', key: 'position' },
        { title: 'PnL', dataIndex: 'pnl', key: 'pnl', scopedSlots: { customRender: 'pnl' } }
      ]
    }
  }
}
</script>

<style scoped>
.env-card { margin-bottom: 16px; }
</style>
