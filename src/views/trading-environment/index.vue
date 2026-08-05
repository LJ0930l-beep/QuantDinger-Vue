<template>
  <div class="trading-environment">
    <div class="te-header">
      <h2 class="te-title">
        <a-icon type="thunderbolt" />
        {{ $t('tradingEnv.title') || 'Trading Environment' }}
      </h2>
      <p class="te-subtitle">{{ $t('tradingEnv.subtitle') || 'Switch between execution environments and monitor strategy status' }}</p>
    </div>

    <a-row :gutter="16" class="te-cards">
      <a-col :span="6" v-for="env in environments" :key="env.key">
        <div
          class="te-env-card"
          :class="{ active: currentEnv === env.key, disabled: env.disabled }"
          @click="switchEnv(env.key)"
        >
          <div class="te-env-badge" :style="{ background: env.color }">{{ env.label }}</div>
          <div class="te-env-name">{{ env.name }}</div>
          <div class="te-env-status">
            <span class="te-dot" :class="env.status"></span>
            {{ env.statusText }}
          </div>
        </div>
      </a-col>
    </a-row>

    <a-divider />

    <EnvironmentStatusCard :env="currentEnv" :strategies="activeStrategies" />
    <OrderFillList :orders="recentOrders" />
  </div>
</template>

<script>
import EnvironmentStatusCard from './components/EnvironmentStatusCard.vue'
import OrderFillList from './components/OrderFillList.vue'

export default {
  name: 'TradingEnvironment',
  components: { EnvironmentStatusCard, OrderFillList },
  data () {
    return {
      currentEnv: 'paper',
      environments: [
        { key: 'disabled', label: 'D', name: 'Disabled', color: '#8c8c8c', status: 'off', statusText: 'Offline', disabled: false },
        { key: 'paper', label: 'P', name: 'Paper', color: '#1890ff', status: 'green', statusText: 'Running', disabled: false },
        { key: 'shadow', label: 'S', name: 'Shadow', color: '#722ed1', status: 'green', statusText: 'Mirroring', disabled: false },
        { key: 'testnet', label: 'T', name: 'TestNet', color: '#fa8c16', status: 'yellow', statusText: 'Read-only', disabled: false }
      ],
      activeStrategies: [],
      recentOrders: []
    }
  },
  methods: {
    switchEnv (key) {
      if (this.environments.find(e => e.key === key).disabled) return
      this.currentEnv = key
    }
  }
}
</script>

<style scoped>
.trading-environment { padding: 24px; }
.te-header { margin-bottom: 24px; }
.te-title { font-size: 20px; font-weight: 500; margin: 0 0 4px; }
.te-subtitle { color: #8c8c8c; margin: 0; font-size: 14px; }
.te-cards { margin-bottom: 16px; }
.te-env-card {
  padding: 16px; border-radius: 8px; border: 1px solid #e8e8e8;
  cursor: pointer; transition: all 0.2s; text-align: center;
}
.te-env-card:hover { border-color: #1890ff; box-shadow: 0 2px 8px rgba(24,144,255,0.15); }
.te-env-card.active { border-color: #1890ff; background: #e6f7ff; }
.te-env-card.disabled { opacity: 0.5; cursor: not-allowed; }
.te-env-badge {
  display: inline-block; width: 32px; height: 32px; line-height: 32px;
  border-radius: 50%; color: #fff; font-weight: 600; font-size: 16px; margin-bottom: 8px;
}
.te-env-name { font-size: 15px; font-weight: 500; margin-bottom: 4px; }
.te-env-status { font-size: 12px; color: #8c8c8c; }
.te-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-right: 4px; }
.te-dot.green { background: #52c41a; }
.te-dot.yellow { background: #faad14; }
.te-dot.off { background: #d9d9d9; }
</style>
