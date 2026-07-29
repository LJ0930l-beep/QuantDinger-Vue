<template>
  <main class="quant-dashboard" data-testid="quant-dashboard">
    <header class="dashboard-header">
      <div>
        <div class="eyebrow"><a-icon type="safety-certificate" /> {{ dashboard.label }}</div>
        <h1>量化交易指挥中心</h1>
        <p>只读展示准入、风控与系统健康状态；未连接交易所、执行器或任何实盘下单路径。</p>
      </div>
      <div class="header-actions">
        <span class="mock-note" aria-live="polite">{{ interactionNote }}</span>
        <a-button icon="sync" @click="refreshMock">刷新模拟数据</a-button>
        <a-button icon="eye" @click="toggleExpanded">展开</a-button>
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
      <div class="section-heading">
        <div><span class="section-kicker">账户</span><h2 id="overview-heading">账户概览</h2></div>
        <span class="read-only-badge"><a-icon type="lock" /> 只读</span>
      </div>
      <div class="metric-grid">
        <article v-for="metric in dashboard.account" :key="metric.label" class="metric-card" :class="metric.tone">
          <span>{{ metric.label }}</span><strong>{{ metric.value }}</strong><small>{{ metric.detail }}</small>
        </article>
      </div>
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
              <td><a-button size="small" icon="search" @click="inspect(position.symbol)">查看</a-button></td>
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
          <div class="strategy-footer"><span><a-icon type="safety" /> 熔断开关：<strong>{{ strategy.kill }}</strong></span><a-button size="small" icon="eye" @click="view(strategy.name)">查看</a-button></div>
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
        <div class="section-heading"><div><span class="section-kicker">硬风控</span><h2 id="risk-heading">风控面板</h2></div><a-button icon="search" @click="inspect('风控规则')">查看</a-button></div>
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
        <div class="section-heading"><div><span class="section-kicker">影子验证</span><h2 id="shadow-heading">Shadow 差异</h2></div><a-button icon="eye" @click="view('shadow-diff')">查看</a-button></div>
        <dl class="detail-list"><div><dt>候选状态</dt><dd>{{ dashboard.shadow.candidate }}</dd></div><div><dt>旧系统状态</dt><dd>{{ dashboard.shadow.legacy }}</dd></div><div><dt>差异数量</dt><dd>{{ dashboard.shadow.differences }}</dd></div><div><dt>匹配状态</dt><dd class="healthy">{{ dashboard.shadow.match }}</dd></div><div><dt>容差版本</dt><dd>{{ dashboard.shadow.tolerance }}</dd></div><div><dt>最后比较</dt><dd>{{ dashboard.shadow.comparison }}</dd></div></dl>
      </article>
      <article class="section-shell" aria-labelledby="reconciliation-heading">
        <div class="section-heading"><div><span class="section-kicker">健康度</span><h2 id="reconciliation-heading">对账与健康度</h2></div><a-button icon="reload" @click="refreshMock">刷新模拟数据</a-button></div>
        <dl class="detail-list"><div><dt>上次运行</dt><dd>{{ dashboard.reconciliation.lastRun }}</dd></div><div><dt>检查点状态</dt><dd class="healthy">{{ dashboard.reconciliation.checkpoint }}</dd></div><div><dt>差异数量</dt><dd>{{ dashboard.reconciliation.discrepancies }}</dd></div><div><dt>投影水位</dt><dd>{{ dashboard.reconciliation.watermark }}</dd></div><div><dt>派生健康度</dt><dd class="healthy">{{ dashboard.reconciliation.derivedHealth }}</dd></div><div><dt>下次检查</dt><dd>{{ dashboard.reconciliation.nextCheck }}</dd></div></dl>
      </article>
    </section>

    <section class="section-shell timeline-shell" aria-labelledby="timeline-heading">
      <div class="section-heading"><div><span class="section-kicker">事件</span><h2 id="timeline-heading">事件时间线</h2></div><a-button icon="down" @click="toggleExpanded">展开</a-button></div>
      <ol class="timeline"><li v-for="event in timelineEvents" :key="`${event.time}-${event.type}`"><span class="timeline-dot" :class="event.tone"></span><time>{{ event.time }}</time><strong>{{ eventTypeLabel(event.type) }}</strong><p>{{ event.text }}</p></li></ol>
    </section>
  </main>
</template>

<script>
import { quantDashboardMock } from '@/mocks/quantDashboard'

export default {
  name: 'QuantDashboard',
  data () {
    return {
      dashboard: quantDashboardMock,
      expanded: false,
      signalFilterOn: false,
      interactionNote: '静态模拟数据 · 未连接实盘'
    }
  },
  computed: {
    statusItems () {
      const status = this.dashboard.status
      return [
        { label: '环境', value: '模拟盘', icon: 'experiment', tone: 'shadow' },
        { label: '实盘交易', value: '关闭', icon: 'poweroff', tone: 'risk' },
        { label: '对账', value: '健康', icon: 'safety-certificate', tone: 'healthy' },
        { label: '行情数据', value: '当前', icon: 'database', tone: 'healthy' },
        { label: '账户事实', value: '已验证', icon: 'check-circle', tone: 'healthy' }
      ]
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
  methods: {
    refreshMock () {
      this.interactionNote = '已刷新模拟数据 · 模拟盘 / 影子模式静态预览'
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
.quant-dashboard { --bg: #0b1117; --surface: #111a23; --surface-2: #172330; --line: #263847; --muted: #8fa2b3; --text: #eef5f8; --cyan: #39c6df; --green: #52c98c; --orange: #f4a261; --red: #ec6f73; --purple: #a584ff; min-height: 100%; padding: 26px; color: var(--text); background: radial-gradient(circle at 90% 0%, rgba(57, 198, 223, .08), transparent 28%), var(--bg); }
.dashboard-header, .section-heading, .strategy-title, .strategy-footer, .status-bar, .header-actions, .pipeline, .pipeline-cases { display: flex; align-items: center; }
.dashboard-header { justify-content: space-between; gap: 24px; margin-bottom: 20px; }
.eyebrow, .section-kicker { color: var(--cyan); font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; }
h1, h2, h3, p { margin: 0; } h1, h2, h3 { color: var(--text) !important; } h1 { margin: 5px 0 8px; font-size: clamp(26px, 2.4vw, 38px); letter-spacing: -.7px; } h2 { margin-top: 3px; font-size: 19px; } h3 { font-size: 16px; } .dashboard-header p { max-width: 720px; color: var(--muted); }
.header-actions { justify-content: flex-end; gap: 8px; flex-wrap: wrap; }.mock-note { color: var(--muted); font-size: 12px; margin-right: 8px; }.read-only-badge, .mode-chip, .pill, .text-status { display: inline-flex; align-items: center; gap: 5px; padding: 3px 8px; border: 1px solid var(--line); border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: .25px; white-space: nowrap; }.read-only-badge { color: var(--muted); }.mock-copy { color: var(--muted); font-size: 12px; }
.status-bar { gap: 1px; overflow-x: auto; margin-bottom: 18px; padding: 1px; border: 1px solid var(--line); background: var(--line); }.status-item { display: grid; grid-template-columns: auto 1fr; gap: 2px 8px; min-width: 166px; padding: 12px 14px; background: var(--surface); }.status-item .anticon { grid-row: span 2; align-self: center; }.status-item span { color: var(--muted); font-size: 11px; }.status-item strong { font-size: 12px; }.status-item.timestamp { min-width: 242px; }.healthy { color: var(--green) !important; }.risk { color: var(--red) !important; }.warning { color: var(--orange) !important; }.shadow, .purple { color: var(--purple) !important; }.cyan { color: var(--cyan) !important; }.neutral { color: var(--text) !important; }
.section-shell { margin-bottom: 18px; padding: 18px; border: 1px solid var(--line); border-radius: 10px; background: linear-gradient(145deg, rgba(23, 35, 48, .96), rgba(13, 22, 30, .96)); box-shadow: 0 16px 45px rgba(0, 0, 0, .16); }.section-heading { justify-content: space-between; gap: 16px; margin-bottom: 16px; }.metric-grid { display: grid; grid-template-columns: repeat(7, minmax(148px, 1fr)); gap: 10px; overflow-x: auto; }.metric-card { min-width: 148px; padding: 14px; border: 1px solid var(--line); border-top: 2px solid var(--text); background: rgba(7, 14, 20, .45); }.metric-card.healthy { border-top-color: var(--green); }.metric-card.risk { border-top-color: var(--red); }.metric-card.warning { border-top-color: var(--orange); }.metric-card.shadow { border-top-color: var(--purple); }.metric-card span, .metric-card small { display: block; color: var(--muted); font-size: 11px; }.metric-card strong { display: block; margin: 7px 0 5px; font-size: 17px; white-space: nowrap; }
.table-wrap { overflow-x: auto; border: 1px solid var(--line); }.terminal-table { width: 100%; min-width: 1110px; border-collapse: collapse; font-size: 12px; }.terminal-table th { padding: 10px 12px; color: #a9bbc9; text-align: left; background: rgba(5, 11, 16, .65); font-size: 10px; letter-spacing: .6px; text-transform: uppercase; }.terminal-table td { padding: 11px 12px; border-top: 1px solid rgba(38, 56, 71, .7); white-space: nowrap; }.terminal-table tr:hover td { background: rgba(57, 198, 223, .045); }.pill.long { color: var(--green); }.pill.short { color: var(--orange); } code { color: var(--cyan); font-size: 11px; }
.strategy-grid { display: grid; grid-template-columns: repeat(4, minmax(225px, 1fr)); gap: 12px; overflow-x: auto; }.strategy-card { min-width: 225px; padding: 16px; border: 1px solid var(--line); border-left: 3px solid var(--cyan); background: rgba(7, 14, 20, .4); }.strategy-card.purple { border-left-color: var(--purple); }.strategy-card.green { border-left-color: var(--green); }.strategy-card.orange { border-left-color: var(--orange); }.strategy-title { align-items: flex-start; justify-content: space-between; gap: 8px; }.mode-chip { margin-bottom: 7px; padding: 1px 6px; color: var(--muted); }.strategy-card dl, .detail-list, .risk-list { margin: 16px 0; }.strategy-card dl { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }.strategy-card dt, .detail-list dt, .risk-list dt { color: var(--muted); font-size: 10px; }.strategy-card dd, .detail-list dd, .risk-list dd { margin: 4px 0 0; font-size: 12px; }.strategy-footer { justify-content: space-between; gap: 10px; padding-top: 12px; border-top: 1px solid var(--line); color: var(--muted); font-size: 11px; }
.dashboard-grid { display: grid; gap: 18px; }.signals-risk-grid { grid-template-columns: minmax(0, 1.7fr) minmax(300px, .8fr); }.health-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }.risk-list, .detail-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1px; background: var(--line); border: 1px solid var(--line); }.risk-list > div, .detail-list > div { padding: 12px; background: rgba(7, 14, 20, .55); }.risk-list small { display: block; margin-top: 4px; color: var(--muted); font-size: 11px; }
.pipeline { align-items: stretch; gap: 8px; overflow-x: auto; padding-bottom: 4px; }.pipeline-step { flex: 1 0 156px; position: relative; padding: 14px; border: 1px solid var(--line); border-top: 2px solid var(--cyan); background: rgba(7, 14, 20, .42); }.pipeline-step.green { border-top-color: var(--green); }.pipeline-step.orange { border-top-color: var(--orange); }.pipeline-step.purple { border-top-color: var(--purple); }.pipeline-index { color: var(--muted); font-size: 11px; }.pipeline-step h3 { margin: 10px 0 6px; }.pipeline-step p { min-height: 28px; color: var(--muted); font-size: 11px; }.pipeline-step strong { color: var(--cyan); font-size: 11px; }.pipeline-arrow { align-self: center; color: var(--muted); font-size: 22px; }.pipeline-cases { gap: 12px; flex-wrap: wrap; margin-top: 16px; color: var(--muted); font-size: 12px; }.pipeline-cases strong { font-size: 11px; }
.timeline { position: relative; margin: 0; padding: 0 0 0 8px; list-style: none; }.timeline::before { position: absolute; top: 10px; bottom: 10px; left: 12px; width: 1px; background: var(--line); content: ''; }.timeline li { position: relative; display: grid; grid-template-columns: 90px 185px 1fr; gap: 12px; align-items: baseline; padding: 9px 0 9px 27px; }.timeline-dot { position: absolute; top: 15px; left: 0; width: 9px; height: 9px; border-radius: 50%; background: var(--cyan); box-shadow: 0 0 0 4px var(--surface-2); }.timeline-dot.green { background: var(--green); }.timeline-dot.orange { background: var(--orange); }.timeline-dot.purple { background: var(--purple); }.timeline-dot.risk { background: var(--red); }.timeline time { color: var(--muted); font-size: 11px; }.timeline strong { font-size: 12px; }.timeline p { color: #b9c8d3; font-size: 12px; }
@media (max-width: 1220px) { .metric-grid { grid-template-columns: repeat(4, minmax(148px, 1fr)); }.strategy-grid { grid-template-columns: repeat(2, minmax(245px, 1fr)); }.signals-risk-grid, .health-grid { grid-template-columns: 1fr; } }
@media (max-width: 760px) { .quant-dashboard { padding: 14px; }.dashboard-header { align-items: flex-start; flex-direction: column; }.header-actions { justify-content: flex-start; }.metric-grid { grid-template-columns: repeat(2, minmax(148px, 1fr)); }.strategy-grid { grid-template-columns: 1fr; }.risk-list, .detail-list { grid-template-columns: 1fr; }.timeline li { grid-template-columns: 70px 1fr; }.timeline p { grid-column: 2; }.pipeline-arrow { display: none; } }
</style>
