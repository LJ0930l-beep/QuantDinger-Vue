<template>
  <a-card title="Recent Orders & Fills" class="order-card">
    <a-table
      :columns="columns"
      :dataSource="orders"
      :pagination="{ pageSize: 10 }"
      size="small"
      rowKey="id"
    >
      <template slot="side" slot-scope="text">
        <span :style="{ color: text === 'BUY' ? '#cf1322' : '#3f8600', fontWeight: 500 }">{{ text }}</span>
      </template>
      <template slot="status" slot-scope="text">
        <a-tag :color="statusColor(text)">{{ text }}</a-tag>
      </template>
    </a-table>
  </a-card>
</template>

<script>
export default {
  name: 'OrderFillList',
  props: {
    orders: { type: Array, default: () => [] }
  },
  data () {
    return {
      columns: [
        { title: 'Time', dataIndex: 'time', key: 'time', width: 160 },
        { title: 'Side', dataIndex: 'side', key: 'side', scopedSlots: { customRender: 'side' }, width: 70 },
        { title: 'Instrument', dataIndex: 'instrument', key: 'instrument' },
        { title: 'Qty', dataIndex: 'qty', key: 'qty', width: 80 },
        { title: 'Price', dataIndex: 'price', key: 'price', width: 100 },
        { title: 'Status', dataIndex: 'status', key: 'status', scopedSlots: { customRender: 'status' }, width: 100 }
      ]
    }
  },
  methods: {
    statusColor (s) {
      const map = { FILLED: 'green', PARTIAL: 'orange', PENDING: 'blue', CANCELLED: 'default', REJECTED: 'red' }
      return map[s] || 'default'
    }
  }
}
</script>

<style scoped>
.order-card { margin-bottom: 16px; }
</style>
