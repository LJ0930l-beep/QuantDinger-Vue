<template>
  <main class="quant-dashboard" data-testid="quant-dashboard">
    <header class="dashboard-header">
      <div class="hero-copy">
        <div class="hero-tags" aria-label="模拟环境状态">
          <span class="hero-chip demo">DEMO</span>
          <span class="hero-chip paper">PAPER</span>
          <span class="hero-chip shadow">SHADOW</span>
          <span class="active-strategy"><a-icon type="thunderbolt" /> 当前策略：ICT Liquidity Sweep</span>
        </div>
        <h1>量化交易指挥中心</h1>
        <p>只读展示准入、风控与系统健康状态；未连接交易所、执行器或任何实盘下单路径。</p>
      </div>
      <div class="header-actions">
        <span class="mock-note" aria-live="polite">{{ interactionNote }}</span>
        <a-button icon="sync" @click="refreshMock">刷新模拟数据</a-button>
        <a-button icon="eye" @click="toggleExpanded">{{ expanded ? '收起事件' : '展开事件' }}</a-button>
      </div>
    </header>

    <section class="status-bar" aria-label="交易状态">
      <div v-for="item in statusItems" :key="item.label" class="status-item" :class="item.tone">
        <a-icon :type="item.icon" />
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </div>
      <div class="status-item timestamp"><a-icon type="clock-circle" /><span>最后更新</span><strong>{{ dashboard.status.lastUpdated }}</strong></div>
    </section>

    <section class="section-shell overview-shell" aria-labelledby="overview-heading">
      <div class="section-heading compact-heading">
        <div><span class="section-kicker">账户总览</span><h2 id="overview-heading">核心资金指标</h2></div>
        <span class="read-only-badge"><a-icon type="lock" /> 只读模拟数据</span>
      </div>
      <div class="metric-grid">
        <article v-for="metric in headlineMetrics" :key="metric.label" class="metric-card" :class="metric.tone">
          <span>{{ metric.label }}</span><strong>{{ metric.value }}</strong><small>{{ metric.detail }}</small>
        </article>
      </div>
    </section>

    <section class="dashboard-grid performance-risk-grid">
      <article class="section-shell chart-shell" aria-labelledby="equity-chart-heading">
        <div class="section-heading compact-heading">
          <div><span class="section-kicker">账户曲线</span><h2 id="equity-chart-heading">权益与当日盈亏</h2></div>
          <span class="chart-caption">静态 Mock 数据 · 非真实账户</span>
        </div>
        <div ref="equityChart" class="equity-chart" aria-label="模拟账户权益与当日盈亏曲线"></div>
        <div class="chart-footer"><span><i class="legend-dot equity"></i>账户权益</span><span><i class="legend-dot pnl"></i>当日累计盈亏</span><strong>模拟盘 / 只读</strong></div>
      </article>

      <article class="section-shell risk-summary-shell" aria-labelledby="risk-summary-heading">
        <div class="section-heading compact-heading"><div><span class="section-kicker">风险摘要</span><h2 id="risk-summary-heading">敞口与预留</h2></div><a-button class="table-action" type="link" icon="search" @click="inspect('风险摘要')">查看</a-button></div>
        <dl class="summary-list">
          <div v-for="metric in accountRiskSummary" :key="metric.label"><dt>{{ metric.label }}</dt><dd :class="metric.tone"><strong>{{ metric.value }}</strong><small>{{ metric.detail }}</small></dd></div>
        </dl>
        <div class="risk-callout"><a-icon type="safety-certificate" /><span>对账状态健康；当前模拟数据允许新增风险。</span></div>
      </article>
    </section>

    <section class="section-shell" aria-labelledby="positions-heading">
      <div class="section-heading">
        <div><span class="section-kicker">敞口</span><h2 id="positions-heading">持仓</h2></div>
        <a-button icon="filter" @click="filterPositions">筛选</a-button>
      </div>
      <div class="table-wrap" tabindex="0" aria-label="模拟持仓表">
        <table class="terminal-table">
          <thead><tr><th>标的</th><th>方向</th><th>数量</th><th>平均入场价</th><th>标记价格</th><th>未实现盈亏</th><th>杠杆</th><th>风险状态</th><th>保护状态</th><th>查看</th></tr></thead>
          <tbody>
            <tr v-for="position in dashboard.positions" :key="position.symbol">
              <td><strong>{{ position.symbol }}</strong></td><td><span class="pill" :class="position.side.toLowerCase()">{{ position.side === 'LONG' ? '多' : '空' }}</span></td><td>{{ position.quantity }}</td><td>{{ position.entry }}</td><td>{{ position.mark }}</td><td class="positive">{{ position.pnl }}</td><td>{{ position.leverage }}</td><td><span class="text-status healthy">{{ position.risk }}</span></td><td><span class="text-status shadow">{{ position.protection }}</span></td>
              <td><a-button class="table-action" type="link" size="small" icon="search" @click="inspect(position.symbol)">查看</a-button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="section-shell" aria-labelledby="strategy-heading">
      <div class="section-heading"><div><span class="section-kicker">策略工厂</span><h2 id="strategy-heading">策略卡片</h2></div><span class="mock-copy">仅用于视觉占位</span></div>
      <div class="strategy-grid">
        <article v-for="strategy in dashboard.strategies" :key="strategy.name" class="strategy-card" :class="strategy.accent">
          <div class="strategy-title"><div><span class="mode-chip">{{ modeLabel(strategy.mode) }}</span><h3>{{ strategy.name }}</h3></div><span class="text-status" :class="strategy.status === '运行中' ? 'healthy' : 'warning'">{{ strategy.status }}</span></div>
          <dl><div><dt>最新信号</dt><dd>{{ strategy.signal }}</dd></div><div><dt>置信度</dt><dd>{{ strategy.confidence }}</dd></div><div><dt>当前敞口</dt><dd>{{ strategy.exposure }}</dd></div><div><dt>风险预算</dt><dd>{{ strategy.budget }}</dd></div></dl>
          <div class="strategy-footer"><span><a-icon type="safety" /> 熔断开关：<strong>{{ strategy.kill }}</strong></span><a-button class="table-action" type="link" size="small" icon="eye" @click="view(strategy.name)">查看</a-button></div>
        </article>
      </div>
    </section>

    <section class="dashboard-grid signals-risk-grid">
      <article class="section-shell signal-panel" aria-labelledby="signals-heading">
        <div class="section-heading"><div><span class="section-kicker">准入</span><h2 id="signals-heading">最近信号</h2></div><a-button icon="filter" @click="filterSignals">筛选</a-button></div>
        <div class="table-wrap compact" tabindex="0">
          <table class="terminal-table"><thead><tr><th>时间</th><th>标的</th><th>动作</th><th>来源</th><th>经济指纹</th><th>风险影响</th><th>准入状态</th><th>风控决定</th><th>原因</th></tr></thead>
            <tbody><tr v-for="signal in visibleSignals" :key="`${signal.time}-${signal.fingerprint}`"><td>{{ signal.time }}</td><td>{{ signal.symbol }}</td><td><strong>{{ actionLabel(signal.action) }}</strong></td><td>{{ sourceLabel(signal.source) }}</td><td><code>{{ signal.fingerprint }}</code></td><td>{{ riskEffectLabel(signal.effect) }}</td><td><span class="text-status" :class="admissionTone(signal.admission)">{{ admissionLabel(signal.admission) }}</span></td><td>{{ decisionLabel(signal.decision) }}</td><td>{{ signal.reason }}</td></tr></tbody>
          </table>
        </div>
      </article>

      <article class="section-shell risk-panel" aria-labelledby="risk-heading">
        <div class="section-heading"><div><span class="section-kicker">硬风控</span><h2 id="risk-heading">风控面板</h2></div><a-button class="table-action" type="link" icon="search" @click="inspect('风控规则')">查看</a-button></div>
        <dl class="risk-list"><div v-for="item in dashboard.risk" :key="item.label"><dt>{{ item.label }}</dt><dd><strong :class="item.tone">{{ item.value }}</strong><small>{{ item.detail }}</small></dd></div></dl>
      </article>
    </section>

    <section class="section-shell" aria-labelledby="pipeline-heading">
      <div class="section-heading"><div><span class="section-kicker">G4-A 已锁定链路</span><h2 id="pipeline-heading">准入流程</h2></div><a-button icon="play-circle" @click="simulateFlow">模拟</a-button></div>
      <div class="pipeline" aria-label="模拟准入流程">
        <template v-for="(step, index) in dashboard.pipeline">
          <article :key="step.id" class="pipeline-step" :class="step.tone"><span class="pipeline-index">0{{ index + 1 }}</span><h3>{{ step.label }}</h3><p>{{ step.sublabel }}</p><strong>{{ step.status }}</strong></article>
          <span v-if="index < dashboard.pipeline.length - 1" :key="`${step.id}-arrow`" class="pipeline-arrow" aria-hidden="true">→</span>
        </template>
      </div>
      <div class="pipeline-cases"><span>模拟请求结果：</span><strong class="cyan">已创建</strong><strong class="purple">已重放</strong><strong class="risk">风控拒绝</strong><strong class="neutral">撤单</strong><strong class="healthy">保护单</strong></div>
    </section>

    <section class="dashboard-grid health-grid">
      <article class="section-shell" aria-labelledby="shadow-heading">
        <div class="section-heading"><div><span class="section-kicker">影子验证</span><h2 id="shadow-heading">Shadow 差异</h2></div><a-button class="table-action" type="link" icon="eye" @click="view('shadow-diff')">查看</a-button></div>
        <dl class="detail-list"><div><dt>候选状态</dt><dd>{{ dashboard.shadow.candidate }}</dd></div><div><dt>旧系统状态</dt><dd>{{ dashboard.shadow.legacy }}</dd></div><div><dt>差异数量</dt><dd>{{ dashboard.shadow.differences }}</dd></div><div><dt>匹配状态</dt><dd class="healthy">{{ dashboard.shadow.match }}</dd></div><div><dt>容差版本</dt><dd>{{ dashboard.shadow.tolerance }}</dd></div><div><dt>最后比较</dt><dd>{{ dashboard.shadow.comparison }}</dd></div></dl>
      </article>
      <article class="section-shell" aria-labelledby="reconciliation-heading">
        <div class="section-heading"><div><span class="section-kicker">健康度</span><h2 id="reconciliation-heading">对账与健康度</h2></div><a-button icon="reload" @click="refreshMock">刷新模拟数据</a-button></div>
        <dl class="detail-list"><div><dt>上次运行</dt><dd>{{ dashboard.reconciliation.lastRun }}</dd></div><div><dt>检查点状态</dt><dd class="healthy">{{ dashboard.reconciliation.checkpoint }}</dd></div><div><dt>差异数量</dt><dd>{{ dashboard.reconciliation.discrepancies }}</dd></div><div><dt>投影水位</dt><dd>{{ dashboard.reconciliation.watermark }}</dd></div><div><dt>派生健康度</dt><dd class="healthy">{{ dashboard.reconciliation.derivedHealth }}</dd></div><div><dt>下次检查</dt><dd>{{ dashboard.reconciliation.nextCheck }}</dd></div></dl>
      </article>
    </section>

    <section class="section-shell timeline-shell" aria-labelledby="timeline-heading">
      <div class="section-heading"><div><span class="section-kicker">事件</span><h2 id="timeline-heading">事件时间线</h2></div><a-button icon="down" @click="toggleExpanded">{{ expanded ? '收起' : '展开' }}</a-button></div>
      <ol class="timeline"><li v-for="event in timelineEvents" :key="`${event.time}-${event.type}`"><span class="timeline-dot" :class="event.tone"></span><time>{{ event.time }}</time><strong>{{ eventTypeLabel(event.type) }}</strong><p>{{ event.text }}</p></li></ol>
    </section>
  </main>
</template>

<script>
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { quantDashboardMock } from '@/mocks/quantDashboard'
import { getReadonlyQuantState } from '@/api/quant-readonly'

echarts.use([LineChart, GridComponent, TooltipComponent, CanvasRenderer])

export default {
  name: 'QuantDashboard',
  data () {
    return {
      dashboard: quantDashboardMock,
      readonlyState: null,
      expanded: false,
      signalFilterOn: false,
      interactionNote: '静态模拟数据 · 未连接实盘',
      chartInstance: null
    }
  },
  computed: {
    statusItems () {
      const status = this.dashboard.status
      const reconciliation = this.readonlyState && this.readonlyState.reconciliation
      const derivedHealth = reconciliation && reconciliation.derived_health
      return [
        { label: '运行模式', value: status.environment, icon: 'experiment', tone: 'shadow' },
        { label: '实盘交易', value: status.liveTrading, icon: 'poweroff', tone: 'risk' },
        { label: '对账状态', value: derivedHealth === 'HEALTHY' ? '健康' : (derivedHealth || '健康'), icon: 'safety-certificate', tone: derivedHealth === 'HEALTHY' ? 'healthy' : 'warning' },
        { label: '市场数据', value: '正常', icon: 'database', tone: 'healthy' },
        { label: '账户数据', value: '已核验', icon: 'check-circle', tone: 'healthy' }
      ]
    },
    headlineMetrics () {
      const names = ['账户总权益', '当日盈亏', '可用保证金', '回撤']
      return names.map(name => this.dashboard.account.find(metric => metric.label === name)).filter(Boolean)
    },
    accountRiskSummary () {
      const names = ['总敞口', '净敞口', '活动预留']
      return names.map(name => this.dashboard.account.find(metric => metric.label === name)).filter(Boolean)
    },
    visibleSignals () {
      return this.signalFilterOn
        ? this.dashboard.signals.filter(signal => signal.admission !== 'REPLAYED')
        : this.dashboard.signals
    },
    timelineEvents () {
      return this.expanded ? this.dashboard.timeline : this.dashboard.timeline.slice(0, 5)
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.initEquityChart()
      this._resizeChart = () => this.chartInstance && this.chartInstance.resize()
      window.addEventListener('resize', this._resizeChart)
    })
    this.loadReadonlyState()
  },
  beforeDestroy () {
    window.removeEventListener('resize', this._resizeChart)
    if (this.chartInstance) this.chartInstance.dispose()
  },
  methods: {
    async loadReadonlyState () {
      try {
        const response = await getReadonlyQuantState()
        const body = response && response.data ? response.data : response
        if (body && (body.status === 'READY' || body.status === 'STALE')) {
          this.readonlyState = body
          this.interactionNote = body.status === 'STALE'
            ? '已连接只读投影 · 状态陈旧，继续显示安全摘要'
            : '已连接只读投影 · 未启用任何交易写入路径'
        }
      } catch (e) {
        // The mock remains the safe default when the provider is unavailable.
      }
    },
    initEquityChart () {
      const chart = this.dashboard.equityChart
      const numeric = values => values.map(value => Number(String(value).replace(/,/g, '')))
      if (this.chartInstance) this.chartInstance.dispose()
      this.chartInstance = echarts.init(this.$refs.equityChart)
      this.chartInstance.setOption({
        animation: false,
        color: ['#39c6df', '#52c98c'],
        grid: { top: 28, right: 28, bottom: 34, left: 56 },
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#111a23',
          borderColor: '#263847',
          textStyle: { color: '#eef5f8' },
          valueFormatter: value => `${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`
        },
        xAxis: { type: 'category', boundaryGap: false, data: chart.labels, axisLine: { lineStyle: { color: '#263847' } }, axisLabel: { color: '#8fa2b3' }, axisTick: { show: false } },
        yAxis: [
          { type: 'value', scale: true, axisLabel: { color: '#8fa2b3', formatter: value => `${Math.round(value / 1000)}k` }, splitLine: { lineStyle: { color: 'rgba(38, 56, 71, .55)' } } },
          { type: 'value', scale: true, axisLabel: { color: '#8fa2b3', formatter: value => `${value >= 0 ? '+' : ''}${value}` }, splitLine: { show: false } }
        ],
        series: [
          { name: '账户权益', type: 'line', smooth: true, showSymbol: false, data: numeric(chart.equity), lineStyle: { width: 3 }, areaStyle: { color: 'rgba(57, 198, 223, .12)' } },
          { name: '当日累计盈亏', type: 'line', smooth: true, showSymbol: false, yAxisIndex: 1, data: numeric(chart.dailyPnl), lineStyle: { width: 2 }, areaStyle: { color: 'rgba(82, 201, 140, .06)' } }
        ]
      })
    },
    refreshMock () {
      this.interactionNote = '已刷新模拟数据 · 模拟盘 / 影子模式静态预览'
      this.initEquityChart()
    },
    toggleExpanded () {
      this.expanded = !this.expanded
      this.interactionNote = this.expanded ? '已展开模拟事件详情' : '已收起模拟事件详情'
    },
    filterPositions () {
      this.interactionNote = '已查看持仓筛选 · 未查询任何数据源'
    },
    filterSignals () {
      this.signalFilterOn = !this.signalFilterOn
      this.interactionNote = this.signalFilterOn ? '已筛选模拟重放记录' : '已恢复全部模拟信号'
    },
    inspect (target) {
      this.interactionNote = `正在查看模拟 ${target}`
    },
    view (target) {
      this.interactionNote = `正在查看模拟 ${target}`
    },
    simulateFlow () {
      this.interactionNote = '已模拟类型化准入流程 · 未调用持久化或执行路径'
    },
    modeLabel (mode) {
      return ({ PAPER: '模拟盘', SHADOW: '影子模式', DISABLED: '已禁用' })[mode] || mode
    },
    actionLabel (action) {
      return ({ OPEN: '开仓', INCREASE: '加仓', REDUCE: '减仓', CLOSE: '平仓', CANCEL: '撤单', EMERGENCY_CLOSE: '紧急平仓', PROTECTION: '保护单' })[action] || action
    },
    sourceLabel (source) {
      return ({ STRATEGY: '策略', HUMAN: '人工', AGENT: 'Agent', MCP: 'MCP', GRID: '网格', PROTECTION: '保护' })[source] || source
    },
    riskEffectLabel (effect) {
      return ({ INCREASE_RISK: '增加风险', REDUCE_RISK: '降低风险', NEUTRAL: '中性' })[effect] || effect
    },
    admissionLabel (status) {
      return ({ CREATED: '已创建', REPLAYED: '已重放', RISK_REJECTED: '风控拒绝' })[status] || status
    },
    decisionLabel (decision) {
      return ({ ALLOW: '允许', DENY: '拒绝', '-': '-' })[decision] || decision
    },
    eventTypeLabel (type) {
      return ({ ENTRY_ADMITTED: '准入成功', CANCEL_ADMITTED: '撤单准入', RISK_ALLOWED: '风控允许', RISK_DENIED: '风控拒绝', RESERVATION_CREATED: '预留已创建', OUTBOX_CREATED: '事件已写入', RECOVERY_COMPLETED: '恢复完成', RECONCILIATION_HEALTHY: '对账健康' })[type] || type
    },
    admissionTone (status) {
      if (status === 'RISK_REJECTED') return 'risk'
      if (status === 'REPLAYED') return 'purple'
      return 'healthy'
    }
  }
}
</script>

<style scoped>
.quant-dashboard { --bg: #0b1117; --surface: #111a23; --surface-2: #172330; --line: #263847; --muted: #8fa2b3; --text: #eef5f8; --cyan: #39c6df; --green: #52c98c; --orange: #f4a261; --red: #ec6f73; --purple: #a584ff; min-height: 100%; padding: 20px 24px 28px; color: var(--text); background: radial-gradient(circle at 90% 0%, rgba(57, 198, 223, .07), transparent 28%), var(--bg); }
.dashboard-header, .section-heading, .strategy-title, .strategy-footer, .header-actions, .pipeline, .pipeline-cases, .hero-tags, .chart-footer { display: flex; align-items: center; }
.dashboard-header { justify-content: space-between; gap: 24px; margin-bottom: 12px; }.hero-copy { min-width: 0; }.hero-tags { gap: 6px; margin-bottom: 7px; flex-wrap: wrap; }.hero-chip, .active-strategy { display: inline-flex; align-items: center; gap: 5px; padding: 3px 7px; border: 1px solid var(--line); border-radius: 999px; font-size: 10px; font-weight: 800; letter-spacing: .7px; }.hero-chip.demo { color: var(--cyan); }.hero-chip.paper { color: var(--green); }.hero-chip.shadow { color: var(--purple); }.active-strategy { color: #bed0da; letter-spacing: 0; }.active-strategy .anticon { color: var(--cyan); }
h1, h2, h3, p { margin: 0; } h1, h2, h3 { color: var(--text) !important; } h1 { margin: 0 0 5px; font-size: clamp(22px, 1.85vw, 30px); letter-spacing: -.45px; } h2 { margin-top: 2px; font-size: 18px; } h3 { font-size: 16px; } .dashboard-header p { max-width: 720px; color: var(--muted); font-size: 12px; }
.header-actions { justify-content: flex-end; gap: 8px; flex-wrap: wrap; }.mock-note { color: var(--muted); font-size: 11px; margin-right: 6px; }.quant-dashboard .ant-btn { height: 30px; color: #c7d8e1; border-color: #355164; background: rgba(17, 26, 35, .55); box-shadow: none; }.quant-dashboard .ant-btn:hover, .quant-dashboard .ant-btn:focus { color: var(--cyan); border-color: var(--cyan); background: rgba(57, 198, 223, .08); }.quant-dashboard .ant-btn.table-action { height: 23px; padding: 0 4px; color: #94bcca; border-color: transparent; background: transparent; }.quant-dashboard .ant-btn.table-action:hover, .quant-dashboard .ant-btn.table-action:focus { color: var(--cyan); border-color: transparent; background: transparent; }
.read-only-badge, .mode-chip, .pill, .text-status { display: inline-flex; align-items: center; gap: 5px; padding: 3px 8px; border: 1px solid var(--line); border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: .25px; white-space: nowrap; }.read-only-badge { color: var(--muted); }.mock-copy, .chart-caption { color: var(--muted); font-size: 11px; }
.status-bar { display: grid; grid-template-columns: repeat(5, minmax(128px, 1fr)) minmax(260px, 1.4fr); gap: 1px; overflow-x: auto; margin-bottom: 14px; padding: 1px; border: 1px solid var(--line); background: var(--line); }.status-item { display: grid; grid-template-columns: auto 1fr; gap: 2px 8px; min-width: 0; padding: 9px 11px; background: var(--surface); }.status-item .anticon { grid-row: span 2; align-self: center; }.status-item span { color: var(--muted); font-size: 10px; }.status-item strong { font-size: 12px; }.status-item.timestamp { grid-template-columns: auto auto 1fr; align-items: center; }.status-item.timestamp .anticon { grid-row: auto; }.status-item.timestamp strong { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }.healthy { color: var(--green) !important; }.risk { color: var(--red) !important; }.warning { color: var(--orange) !important; }.shadow, .purple { color: var(--purple) !important; }.cyan { color: var(--cyan) !important; }.neutral { color: var(--text) !important; }
.section-shell { margin-bottom: 14px; padding: 16px; border: 1px solid var(--line); border-radius: 10px; background: linear-gradient(145deg, rgba(23, 35, 48, .96), rgba(13, 22, 30, .96)); box-shadow: 0 16px 45px rgba(0, 0, 0, .14); }.section-heading { justify-content: space-between; gap: 16px; margin-bottom: 14px; }.compact-heading { margin-bottom: 12px; }.section-kicker { color: var(--cyan); font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
.metric-grid { display: grid; grid-template-columns: minmax(240px, 1.28fr) repeat(3, minmax(170px, 1fr)); gap: 9px; }.metric-card { min-width: 0; padding: 13px; border: 1px solid var(--line); background: rgba(7, 14, 20, .45); }.metric-card:first-child { border-color: rgba(57, 198, 223, .55); background: linear-gradient(145deg, rgba(57, 198, 223, .11), rgba(7, 14, 20, .45)); }.metric-card.healthy strong { color: var(--green); }.metric-card.warning strong { color: var(--orange); }.metric-card span, .metric-card small { display: block; color: var(--muted); font-size: 11px; }.metric-card strong { display: block; margin: 7px 0 5px; font-size: 18px; white-space: nowrap; font-variant-numeric: tabular-nums; }.metric-card:first-child strong { color: var(--cyan); font-size: 22px; }
.dashboard-grid { display: grid; gap: 14px; }.performance-risk-grid { grid-template-columns: minmax(0, 2fr) minmax(300px, 1fr); }.chart-shell { min-height: 300px; }.equity-chart { width: 100%; height: 230px; }.chart-footer { justify-content: flex-start; gap: 16px; padding-top: 3px; color: var(--muted); font-size: 11px; }.chart-footer strong { margin-left: auto; color: var(--purple); font-size: 11px; }.legend-dot { display: inline-block; width: 7px; height: 7px; margin-right: 5px; border-radius: 50%; }.legend-dot.equity { background: var(--cyan); }.legend-dot.pnl { background: var(--green); }
.risk-summary-shell { background: linear-gradient(145deg, rgba(23, 35, 48, .96), rgba(17, 22, 30, .98)); }.summary-list { display: grid; gap: 1px; margin: 0; border: 1px solid var(--line); background: var(--line); }.summary-list > div { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 11px; background: rgba(7, 14, 20, .48); }.summary-list dt { color: var(--muted); font-size: 11px; }.summary-list dd { margin: 0; text-align: right; }.summary-list strong, .summary-list small { display: block; }.summary-list strong { font-size: 13px; }.summary-list small { margin-top: 3px; color: var(--muted); font-size: 10px; }.risk-callout { display: flex; gap: 8px; margin-top: 12px; padding: 10px; border: 1px solid rgba(82, 201, 140, .28); background: rgba(82, 201, 140, .06); color: #b6dbc8; font-size: 11px; line-height: 1.5; }.risk-callout .anticon { margin-top: 2px; color: var(--green); }
.table-wrap { overflow-x: auto; border: 1px solid var(--line); }.terminal-table { width: 100%; min-width: 1110px; border-collapse: collapse; font-size: 12px; }.terminal-table th { padding: 10px 12px; color: #a9bbc9; text-align: left; background: rgba(5, 11, 16, .65); font-size: 10px; letter-spacing: .6px; text-transform: uppercase; }.terminal-table td { padding: 10px 12px; border-top: 1px solid rgba(38, 56, 71, .7); white-space: nowrap; }.terminal-table tr:hover td { background: rgba(57, 198, 223, .045); }.pill.long { color: var(--green); }.pill.short { color: var(--orange); } code { color: var(--cyan); font-size: 11px; }
.strategy-grid { display: grid; grid-template-columns: repeat(4, minmax(225px, 1fr)); gap: 10px; overflow-x: auto; }.strategy-card { min-width: 225px; padding: 15px; border: 1px solid var(--line); background: rgba(7, 14, 20, .4); }.strategy-card.purple { box-shadow: inset 2px 0 var(--purple); }.strategy-card.green { box-shadow: inset 2px 0 var(--green); }.strategy-card.orange { box-shadow: inset 2px 0 var(--orange); }.strategy-title { align-items: flex-start; justify-content: space-between; gap: 8px; }.mode-chip { margin-bottom: 7px; padding: 1px 6px; color: var(--muted); }.strategy-card dl, .detail-list, .risk-list { margin: 16px 0; }.strategy-card dl { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }.strategy-card dt, .detail-list dt, .risk-list dt { color: var(--muted); font-size: 10px; }.strategy-card dd, .detail-list dd, .risk-list dd { margin: 4px 0 0; font-size: 12px; }.strategy-footer { justify-content: space-between; gap: 10px; padding-top: 12px; border-top: 1px solid var(--line); color: var(--muted); font-size: 11px; }
.signals-risk-grid { grid-template-columns: minmax(0, 1.7fr) minmax(300px, .8fr); }.health-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }.risk-list, .detail-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1px; background: var(--line); border: 1px solid var(--line); }.risk-list > div, .detail-list > div { padding: 12px; background: rgba(7, 14, 20, .55); }.risk-list small { display: block; margin-top: 4px; color: var(--muted); font-size: 11px; }
.pipeline { align-items: stretch; gap: 8px; overflow-x: auto; padding-bottom: 4px; }.pipeline-step { flex: 1 0 156px; position: relative; padding: 14px; border: 1px solid var(--line); background: rgba(7, 14, 20, .42); }.pipeline-step.green { box-shadow: inset 0 2px var(--green); }.pipeline-step.orange { box-shadow: inset 0 2px var(--orange); }.pipeline-step.purple { box-shadow: inset 0 2px var(--purple); }.pipeline-step.cyan { box-shadow: inset 0 2px var(--cyan); }.pipeline-index { color: var(--muted); font-size: 11px; }.pipeline-step h3 { margin: 10px 0 6px; }.pipeline-step p { min-height: 28px; color: var(--muted); font-size: 11px; }.pipeline-step strong { color: var(--cyan); font-size: 11px; }.pipeline-arrow { align-self: center; color: var(--muted); font-size: 22px; }.pipeline-cases { gap: 12px; flex-wrap: wrap; margin-top: 16px; color: var(--muted); font-size: 12px; }.pipeline-cases strong { font-size: 11px; }
.timeline { position: relative; margin: 0; padding: 0 0 0 8px; list-style: none; }.timeline::before { position: absolute; top: 10px; bottom: 10px; left: 12px; width: 1px; background: var(--line); content: ''; }.timeline li { position: relative; display: grid; grid-template-columns: 90px 185px 1fr; gap: 12px; align-items: baseline; padding: 9px 0 9px 27px; }.timeline-dot { position: absolute; top: 15px; left: 0; width: 9px; height: 9px; border-radius: 50%; background: var(--cyan); box-shadow: 0 0 0 4px var(--surface-2); }.timeline-dot.green { background: var(--green); }.timeline-dot.orange { background: var(--orange); }.timeline-dot.purple { background: var(--purple); }.timeline-dot.risk { background: var(--red); }.timeline time { color: var(--muted); font-size: 11px; }.timeline strong { font-size: 12px; }.timeline p { color: #b9c8d3; font-size: 12px; }
@media (max-width: 1220px) { .status-bar { grid-template-columns: repeat(3, minmax(150px, 1fr)); }.status-item.timestamp { grid-column: span 2; }.metric-grid { grid-template-columns: repeat(2, minmax(180px, 1fr)); }.performance-risk-grid, .signals-risk-grid, .health-grid { grid-template-columns: 1fr; }.strategy-grid { grid-template-columns: repeat(2, minmax(245px, 1fr)); } }
@media (max-width: 760px) { .quant-dashboard { padding: 14px; }.dashboard-header { align-items: flex-start; flex-direction: column; }.header-actions { justify-content: flex-start; }.status-bar { grid-template-columns: repeat(2, minmax(145px, 1fr)); }.status-item.timestamp { grid-column: span 2; }.metric-grid { grid-template-columns: 1fr; }.strategy-grid { grid-template-columns: 1fr; }.risk-list, .detail-list { grid-template-columns: 1fr; }.timeline li { grid-template-columns: 70px 1fr; }.timeline p { grid-column: 2; }.pipeline-arrow { display: none; }.chart-footer { flex-wrap: wrap; }.chart-footer strong { width: 100%; margin-left: 0; } }
</style>
