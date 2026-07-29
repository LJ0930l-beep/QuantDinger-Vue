<template>
  <main class="quant-dashboard" data-testid="quant-dashboard">
    <header class="dashboard-header">
      <div>
        <div class="eyebrow"><a-icon type="safety-certificate" /> {{ dashboard.label }}</div>
        <h1>Quant Command Center</h1>
        <p>Read-only admission, risk and health preview. No exchange, executor or live order path is connected.</p>
      </div>
      <div class="header-actions">
        <span class="mock-note" aria-live="polite">{{ interactionNote }}</span>
        <a-button icon="sync" @click="refreshMock">Refresh Mock Data</a-button>
        <a-button icon="eye" @click="toggleExpanded">Expand</a-button>
      </div>
    </header>

    <section class="status-bar" aria-label="Trading status">
      <div v-for="item in statusItems" :key="item.label" class="status-item" :class="item.tone">
        <a-icon :type="item.icon" />
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </div>
      <div class="status-item timestamp"><a-icon type="clock-circle" /><span>Last Updated</span><strong>{{ dashboard.status.lastUpdated }}</strong></div>
    </section>

    <section class="section-shell overview-shell" aria-labelledby="overview-heading">
      <div class="section-heading">
        <div><span class="section-kicker">ACCOUNT</span><h2 id="overview-heading">Account Overview</h2></div>
        <span class="read-only-badge"><a-icon type="lock" /> Read only</span>
      </div>
      <div class="metric-grid">
        <article v-for="metric in dashboard.account" :key="metric.label" class="metric-card" :class="metric.tone">
          <span>{{ metric.label }}</span><strong>{{ metric.value }}</strong><small>{{ metric.detail }}</small>
        </article>
      </div>
    </section>

    <section class="section-shell" aria-labelledby="positions-heading">
      <div class="section-heading">
        <div><span class="section-kicker">EXPOSURE</span><h2 id="positions-heading">Positions</h2></div>
        <a-button icon="filter" @click="filterPositions">Filter</a-button>
      </div>
      <div class="table-wrap" tabindex="0" aria-label="Mock positions table">
        <table class="terminal-table">
          <thead><tr><th>Symbol</th><th>Side</th><th>Quantity</th><th>Average Entry</th><th>Mark Price</th><th>Unrealized PnL</th><th>Leverage</th><th>Risk Status</th><th>Protection</th><th>Inspect</th></tr></thead>
          <tbody>
            <tr v-for="position in dashboard.positions" :key="position.symbol">
              <td><strong>{{ position.symbol }}</strong></td><td><span class="pill" :class="position.side.toLowerCase()">{{ position.side }}</span></td><td>{{ position.quantity }}</td><td>{{ position.entry }}</td><td>{{ position.mark }}</td><td class="positive">{{ position.pnl }}</td><td>{{ position.leverage }}</td><td><span class="text-status healthy">{{ position.risk }}</span></td><td><span class="text-status shadow">{{ position.protection }}</span></td>
              <td><a-button size="small" icon="search" @click="inspect(position.symbol)">Inspect</a-button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="section-shell" aria-labelledby="strategy-heading">
      <div class="section-heading"><div><span class="section-kicker">STRATEGY FACTORY</span><h2 id="strategy-heading">Strategy Cards</h2></div><span class="mock-copy">Visual placeholders only</span></div>
      <div class="strategy-grid">
        <article v-for="strategy in dashboard.strategies" :key="strategy.name" class="strategy-card" :class="strategy.accent">
          <div class="strategy-title"><div><span class="mode-chip">{{ strategy.mode }}</span><h3>{{ strategy.name }}</h3></div><span class="text-status" :class="strategy.status === 'ACTIVE' ? 'healthy' : 'warning'">{{ strategy.status }}</span></div>
          <dl><div><dt>Last Signal</dt><dd>{{ strategy.signal }}</dd></div><div><dt>Confidence</dt><dd>{{ strategy.confidence }}</dd></div><div><dt>Current Exposure</dt><dd>{{ strategy.exposure }}</dd></div><div><dt>Risk Budget</dt><dd>{{ strategy.budget }}</dd></div></dl>
          <div class="strategy-footer"><span><a-icon type="safety" /> Kill Switch: <strong>{{ strategy.kill }}</strong></span><a-button size="small" icon="eye" @click="view(strategy.name)">View</a-button></div>
        </article>
      </div>
    </section>

    <section class="dashboard-grid signals-risk-grid">
      <article class="section-shell signal-panel" aria-labelledby="signals-heading">
        <div class="section-heading"><div><span class="section-kicker">ADMISSION</span><h2 id="signals-heading">Recent Signals</h2></div><a-button icon="filter" @click="filterSignals">Filter</a-button></div>
        <div class="table-wrap compact" tabindex="0">
          <table class="terminal-table"><thead><tr><th>Time</th><th>Symbol</th><th>Action</th><th>Source</th><th>Economic Fingerprint</th><th>Risk Effect</th><th>Admission</th><th>Decision</th><th>Reason</th></tr></thead>
            <tbody><tr v-for="signal in visibleSignals" :key="`${signal.time}-${signal.fingerprint}`"><td>{{ signal.time }}</td><td>{{ signal.symbol }}</td><td><strong>{{ signal.action }}</strong></td><td>{{ signal.source }}</td><td><code>{{ signal.fingerprint }}</code></td><td>{{ signal.effect }}</td><td><span class="text-status" :class="admissionTone(signal.admission)">{{ signal.admission }}</span></td><td>{{ signal.decision }}</td><td>{{ signal.reason }}</td></tr></tbody>
          </table>
        </div>
      </article>

      <article class="section-shell risk-panel" aria-labelledby="risk-heading">
        <div class="section-heading"><div><span class="section-kicker">HARD RISK</span><h2 id="risk-heading">Risk Panel</h2></div><a-button icon="search" @click="inspect('risk-controls')">Inspect</a-button></div>
        <dl class="risk-list"><div v-for="item in dashboard.risk" :key="item.label"><dt>{{ item.label }}</dt><dd><strong :class="item.tone">{{ item.value }}</strong><small>{{ item.detail }}</small></dd></div></dl>
      </article>
    </section>

    <section class="section-shell" aria-labelledby="pipeline-heading">
      <div class="section-heading"><div><span class="section-kicker">G4-A LOCKED CHAIN</span><h2 id="pipeline-heading">Admission Pipeline</h2></div><a-button icon="play-circle" @click="simulateFlow">Simulate</a-button></div>
      <div class="pipeline" aria-label="Mock admission pipeline">
        <template v-for="(step, index) in dashboard.pipeline">
          <article :key="step.id" class="pipeline-step" :class="step.tone"><span class="pipeline-index">0{{ index + 1 }}</span><h3>{{ step.label }}</h3><p>{{ step.sublabel }}</p><strong>{{ step.status }}</strong></article>
          <span v-if="index < dashboard.pipeline.length - 1" :key="`${step.id}-arrow`" class="pipeline-arrow" aria-hidden="true">→</span>
        </template>
      </div>
      <div class="pipeline-cases"><span>Mock request outcomes:</span><strong class="cyan">CREATED</strong><strong class="purple">REPLAYED</strong><strong class="risk">RISK_REJECTED</strong><strong class="neutral">CANCEL</strong><strong class="healthy">PROTECTION</strong></div>
    </section>

    <section class="dashboard-grid health-grid">
      <article class="section-shell" aria-labelledby="shadow-heading">
        <div class="section-heading"><div><span class="section-kicker">SHADOW</span><h2 id="shadow-heading">Shadow Diff</h2></div><a-button icon="eye" @click="view('shadow-diff')">View</a-button></div>
        <dl class="detail-list"><div><dt>Candidate State</dt><dd>{{ dashboard.shadow.candidate }}</dd></div><div><dt>Legacy State</dt><dd>{{ dashboard.shadow.legacy }}</dd></div><div><dt>Difference Count</dt><dd>{{ dashboard.shadow.differences }}</dd></div><div><dt>Match Status</dt><dd class="healthy">{{ dashboard.shadow.match }}</dd></div><div><dt>Tolerance Version</dt><dd>{{ dashboard.shadow.tolerance }}</dd></div><div><dt>Last Comparison</dt><dd>{{ dashboard.shadow.comparison }}</dd></div></dl>
      </article>
      <article class="section-shell" aria-labelledby="reconciliation-heading">
        <div class="section-heading"><div><span class="section-kicker">HEALTH</span><h2 id="reconciliation-heading">Reconciliation &amp; Health</h2></div><a-button icon="reload" @click="refreshMock">Refresh Mock Data</a-button></div>
        <dl class="detail-list"><div><dt>Last Run</dt><dd>{{ dashboard.reconciliation.lastRun }}</dd></div><div><dt>Checkpoint Status</dt><dd class="healthy">{{ dashboard.reconciliation.checkpoint }}</dd></div><div><dt>Discrepancy Count</dt><dd>{{ dashboard.reconciliation.discrepancies }}</dd></div><div><dt>Projection Watermark</dt><dd>{{ dashboard.reconciliation.watermark }}</dd></div><div><dt>Derived Health</dt><dd class="healthy">{{ dashboard.reconciliation.derivedHealth }}</dd></div><div><dt>Next Scheduled Check</dt><dd>{{ dashboard.reconciliation.nextCheck }}</dd></div></dl>
      </article>
    </section>

    <section class="section-shell timeline-shell" aria-labelledby="timeline-heading">
      <div class="section-heading"><div><span class="section-kicker">EVENTS</span><h2 id="timeline-heading">Event Timeline</h2></div><a-button icon="down" @click="toggleExpanded">Expand</a-button></div>
      <ol class="timeline"><li v-for="event in timelineEvents" :key="`${event.time}-${event.type}`"><span class="timeline-dot" :class="event.tone"></span><time>{{ event.time }}</time><strong>{{ event.type }}</strong><p>{{ event.text }}</p></li></ol>
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
      interactionNote: 'Static MOCK data • no live connection'
    }
  },
  computed: {
    statusItems () {
      const status = this.dashboard.status
      return [
        { label: 'Environment', value: status.environment, icon: 'experiment', tone: 'shadow' },
        { label: 'Live Trading', value: status.liveTrading, icon: 'poweroff', tone: 'risk' },
        { label: 'Reconciliation', value: status.reconciliationHealth, icon: 'safety-certificate', tone: 'healthy' },
        { label: 'Market Data', value: status.marketDataHealth, icon: 'database', tone: 'healthy' },
        { label: 'Account Facts', value: status.accountFactsVerified, icon: 'check-circle', tone: 'healthy' }
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
      this.interactionNote = 'Mock dataset refreshed • static PAPER/SHADOW preview'
    },
    toggleExpanded () {
      this.expanded = !this.expanded
      this.interactionNote = this.expanded ? 'Expanded mock event context' : 'Collapsed mock event context'
    },
    filterPositions () {
      this.interactionNote = 'Position filter inspected • no data source queried'
    },
    filterSignals () {
      this.signalFilterOn = !this.signalFilterOn
      this.interactionNote = this.signalFilterOn ? 'Filtered replay-only mock rows' : 'Restored all mock signal rows'
    },
    inspect (target) {
      this.interactionNote = `Inspecting mock ${target}`
    },
    view (target) {
      this.interactionNote = `Viewing mock ${target}`
    },
    simulateFlow () {
      this.interactionNote = 'Simulated typed admission flow • no persistence or execution invoked'
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
