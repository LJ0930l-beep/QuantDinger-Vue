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
        <span class="research-status" aria-live="polite">Strategy Catalog: {{ strategyCatalog && strategyCatalog.status ? strategyCatalog.status : 'UNAVAILABLE' }}</span>
        <span class="research-status" aria-live="polite">Release Gate: {{ releaseReadiness && releaseReadiness.status ? releaseReadiness.status : 'UNAVAILABLE' }}</span>
        <span class="research-status" aria-live="polite">TestNet Rehearsal: {{ testnetRehearsal && testnetRehearsal.status ? testnetRehearsal.status : 'UNAVAILABLE' }}</span>
        <span class="research-status" aria-live="polite">Operations: {{ quantOperations && quantOperations.status ? quantOperations.status : 'UNAVAILABLE' }}</span>
        <span class="research-status" aria-live="polite">Projection: {{ projectionGeneration && projectionGeneration.state ? projectionGeneration.state : 'UNAVAILABLE' }}</span>
        <span class="research-status" aria-live="polite">Run Manifest: {{ nonLiveRunManifest && nonLiveRunManifest.status ? nonLiveRunManifest.status : 'UNAVAILABLE' }}</span>
        <span class="research-status" aria-live="polite">Deployment: {{ deploymentReadiness && deploymentReadiness.status ? deploymentReadiness.status : 'UNAVAILABLE' }}</span>
        <span class="research-status" aria-live="polite">Backtest: {{ researchStatus.backtest }} · Paper/Shadow: {{ researchStatus.paperShadow }}</span>
        <span class="research-status" aria-live="polite">Paper Account: {{ readonlyPaperAccount && readonlyPaperAccount.status ? readonlyPaperAccount.status : 'UNAVAILABLE' }}</span>
        <span class="research-status" aria-live="polite">Durable Paper: {{ durablePaperAccount && durablePaperAccount.status ? durablePaperAccount.status : 'UNAVAILABLE' }}</span>
        <span class="research-status" aria-live="polite">Paper Recovery: {{ paperRecovery && paperRecovery.status ? paperRecovery.status : 'UNAVAILABLE' }}</span>
        <span class="research-status" aria-live="polite">Product Rehearsal: {{ productRehearsal && productRehearsal.live_enabled === false ? 'READY · OFFLINE' : 'UNAVAILABLE' }}</span>
        <span class="research-status" aria-live="polite">TestNet Execution: {{ gateTestnetExecution && gateTestnetExecution.live_enabled === false ? gateTestnetExecution.order.status : 'UNAVAILABLE' }}</span>
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

    <section class="section-shell gate-account-shell" aria-labelledby="gate-account-heading">
      <div class="section-heading compact-heading">
        <div><span class="section-kicker">Gate TestNet</span><h2 id="gate-account-heading">账户只读连接</h2></div>
        <span class="read-only-badge"><a-icon type="lock" /> 后端凭证 · Live OFF</span>
      </div>
      <div class="gate-account-controls">
        <label>已保存的 Gate 账户<select v-model="gateAccountForm.credential_id"><option value="">请选择 TestNet 凭证</option><option v-for="credential in gateTestnetCredentials" :key="credential.id" :value="String(credential.id)">{{ credential.name || credential.api_key_hint || `Gate TestNet #${credential.id}` }}</option></select></label>
        <label>Account Scope<input v-model.trim="gateAccountForm.account_scope" placeholder="例如 gate-testnet" autocomplete="off" /></label>
        <label>Market Type<select v-model="gateAccountForm.market_type"><option value="spot">Spot</option><option value="perpetual">Perpetual</option></select></label>
        <label>Instrument<input v-model.trim="gateAccountForm.instrument_id" placeholder="例如 BTC_USDT" autocomplete="off" /></label>
        <button type="button" class="ghost-action" :disabled="gateAccountLoading || !gateAccountForm.credential_id || !gateAccountForm.account_scope" @click="connectGateTestnetAccount">
          {{ gateAccountLoading ? '读取中…' : '连接 TestNet 只读账户' }}
        </button>
        <button type="button" class="ghost-action secondary" :disabled="gateAccountLoading || !gateAccountForm.credential_id || !gateAccountForm.account_scope" @click="connectGateUnifiedTestnetAccount">
          {{ gateAccountLoading ? 'READING…' : '读取 Spot + Perpetual' }}
        </button>
      </div>
      <div class="gate-account-evidence" :class="gateAccountEvidenceTone" data-testid="gate-account-evidence">
        <strong>{{ gateAccountEvidenceTitle }}</strong>
        <span>{{ gateAccountEvidenceDetail }}</span>
        <span v-if="gateReadHealth" class="gate-read-health" data-testid="gate-read-health">
          Read health: {{ gateReadHealth.status }} · Scope: {{ gateReadHealth.scope_verified ? 'VERIFIED' : 'UNAVAILABLE' }} · Reconciliation: {{ gateReadHealth.reconciliation_health }}
        </span>
        <span v-if="gateTestnetEnvironmentAccount && gateTestnetEnvironmentAccount.status === 'READY'">余额、持仓与 PnL 已从后端快照刷新</span>
        <a class="gate-account-manage" href="#/broker-accounts">管理交易所连接</a>
      </div>
    </section>

    <section class="section-shell gate-market-shell" aria-labelledby="gate-market-heading">
      <div class="section-heading compact-heading">
        <div><span class="section-kicker">Gate TestNet</span><h2 id="gate-market-heading">Spot + Perpetual 行情只读</h2></div>
        <span class="read-only-badge"><a-icon type="lock" /> GET only · Live OFF</span>
      </div>
      <div class="gate-market-summary" data-testid="gate-unified-market-summary">
        <template v-if="readonlyGateUnifiedMarket && readonlyGateUnifiedMarket.status === 'READY'">
          <strong>READY</strong>
          <span>{{ readonlyGateUnifiedMarket.instrument_id }} · {{ readonlyGateUnifiedMarket.interval }}</span>
          <span>市场：{{ (readonlyGateUnifiedMarket.market_types || []).join(' + ') }}</span>
          <code>{{ readonlyGateUnifiedMarket.snapshot_fingerprint }}</code>
        </template>
        <template v-else>
          <strong>UNAVAILABLE</strong>
          <span>启用 Gate TestNet 公共行情读取后显示，部分市场失败时不会展示不完整快照。</span>
        </template>
      </div>
    </section>

    <section class="section-shell environment-shell" aria-labelledby="environment-heading">
      <div class="section-heading compact-heading">
        <div><span class="section-kicker">运行环境</span><h2 id="environment-heading">环境与实盘闸门</h2></div>
        <span class="read-only-badge"><a-icon type="lock" /> 前端不可绕过服务端安全闸门</span>
      </div>
      <div class="environment-grid">
        <article class="environment-card current">
          <div class="environment-card-head"><span>当前环境</span><strong class="cyan">{{ dashboard.environmentGate.current }}</strong></div>
          <p>只读研究与纸面交易；所有展示数据均标注为 Mock / Paper / Shadow。</p>
          <span class="text-status shadow">Live Trading · {{ dashboard.environmentGate.liveTrading }}</span>
        </article>
        <article v-for="environment in environmentGateCards" :key="environment.key" class="environment-card" :class="environment.tone">
          <div class="environment-card-head"><span>{{ environment.label }}</span><strong :class="environment.statusTone">{{ environment.status }}</strong></div>
          <p>{{ environment.note }}</p>
          <button type="button" class="ghost-action" @click="inspect(environment.label)">查看闸门</button>
        </article>
      </div>
    </section>

    <section v-if="testnetExecutionConsole.visible" class="section-shell testnet-console-shell" aria-labelledby="testnet-console-heading">
      <div class="section-heading compact-heading">
        <div><span class="section-kicker">Gate TestNet</span><h2 id="testnet-console-heading">受控执行面板</h2></div>
        <span class="read-only-badge"><a-icon type="lock" /> Live OFF · 仅 TestNet</span>
      </div>
      <div class="testnet-warning">
        <a-icon type="warning" />
        <span>这是可产生 TestNet 模拟成交的写入入口。必须由服务端显式开启闸门；前端不保存、不接收 API Key/Secret，也不能选择 Live。</span>
      </div>
      <div class="testnet-form-grid">
        <label>Gate TestNet 凭证<select v-model="testnetForm.credential_id">
          <option value="">请选择已保存凭证</option>
          <option v-for="credential in gateTestnetCredentials" :key="credential.id" :value="String(credential.id)">
            {{ credential.name || credential.api_key_hint || `Gate TestNet #${credential.id}` }}
          </option>
        </select></label>
        <label>Account Scope<input v-model.trim="testnetForm.account_scope" placeholder="例如 gate-testnet" /></label>
        <label>Instrument<input v-model.trim="testnetForm.instrument_id" placeholder="BTC_USDT" /></label>
        <label>Market Type<select v-model="testnetForm.market_type"><option value="spot">Spot 现货</option><option value="perpetual">Perpetual 合约</option></select></label>
        <label>Side<select v-model="testnetForm.side"><option value="BUY">BUY / 买入</option><option value="SELL">SELL / 卖出</option></select></label>
        <label>Action<select v-model="testnetForm.action"><option value="OPEN">OPEN 开仓</option><option value="INCREASE">INCREASE 加仓</option><option value="REDUCE">REDUCE 减仓</option><option value="CLOSE">CLOSE 平仓</option></select></label>
        <label>Execution<select v-model="testnetForm.execution_kind"><option value="MARKET">MARKET 市价</option><option value="LIMIT">LIMIT 限价</option></select></label>
        <label>Quantity<input v-model.trim="testnetForm.quantity" inputmode="decimal" placeholder="Decimal 数量" /></label>
        <label v-if="testnetForm.execution_kind === 'LIMIT'">Limit Price<input v-model.trim="testnetForm.limit_price" inputmode="decimal" placeholder="Decimal 价格" /></label>
        <label>Reference Price<input v-model.trim="testnetForm.reference_price" inputmode="decimal" placeholder="用于市价与审计指纹" /></label>
        <label v-if="['REDUCE', 'CLOSE'].includes(testnetForm.action)">Target Position ID<input v-model.trim="testnetForm.target_position_id" placeholder="必填：已持仓的规范 ID" /></label>
        <label>Client Order ID（可选）<input v-model.trim="testnetForm.client_order_id" placeholder="不填则由后端确定性生成" /></label>
      </div>
      <div class="testnet-ack-row">
        <label class="testnet-checkbox"><input v-model="testnetWriteAcknowledged" type="checkbox" /> 我确认这是 Gate TestNet，不是真实资金环境</label>
        <input v-model.trim="testnetConfirmation" class="testnet-confirmation" placeholder="输入 TESTNET 以解锁" aria-label="TestNet 确认短语" />
        <button type="button" class="ghost-action testnet-submit" :disabled="!testnetWriteUnlocked || testnetSubmitting || !testnetForm.credential_id" @click="submitTestnetOrder">{{ testnetSubmitting ? '提交中…' : '提交 TestNet 订单' }}</button>
      </div>
      <div class="testnet-cancel-row">
        <label>撤销已知 Venue Order ID<input v-model.trim="testnetCancelForm.exchange_order_id" placeholder="只接受稳定交易所订单 ID" /></label>
        <button type="button" class="ghost-action testnet-submit" :disabled="!testnetWriteUnlocked || testnetSubmitting || !testnetForm.credential_id || !testnetCancelForm.exchange_order_id" @click="cancelTestnetOrder">{{ testnetSubmitting ? '处理中…' : '确认 TestNet 撤单' }}</button>
        <label>查询 Order ID<input v-model.trim="testnetQueryForm.exchange_order_id" placeholder="只读查询，不写入" /></label>
        <button type="button" class="ghost-action testnet-submit" :disabled="testnetQuerying || !testnetForm.credential_id || !testnetQueryForm.exchange_order_id" @click="queryTestnetOrder">{{ testnetQuerying ? '查询中…' : '只读查询状态' }}</button>
      </div>
      <div v-if="testnetReceipt" class="admission-evidence execution-evidence" data-testid="testnet-order-receipt">
        <span class="admission-label">TestNet 回执</span>
        <strong :class="testnetReceipt.status === 'REJECTED' ? 'risk' : 'healthy'">{{ testnetReceipt.status }}</strong>
        <span>{{ testnetReceipt.order && testnetReceipt.order.market_type }}</span>
        <span>{{ testnetReceipt.order && testnetReceipt.order.instrument_id }}</span>
        <span>订单 {{ testnetReceipt.order && (testnetReceipt.order.exchange_order_id || testnetReceipt.order.client_order_id) }}</span>
        <span v-if="testnetReceipt.admission && testnetReceipt.admission.economic_order_id">经济订单 {{ testnetReceipt.admission.economic_order_id }}</span>
        <span v-if="testnetReceipt.admission && testnetReceipt.admission.risk_decision_id">Risk {{ testnetReceipt.admission.risk_decision_id }}</span>
        <span v-if="testnetReceipt.admission && testnetReceipt.admission.reservation_id">Reservation {{ testnetReceipt.admission.reservation_id }}</span>
        <span v-if="testnetReceipt.admission && testnetReceipt.admission.outbox_event_id">Outbox {{ testnetReceipt.admission.outbox_event_id }}</span>
        <span class="purple">Live OFF · 不含敏感凭证</span>
      </div>
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
            <tr v-for="position in positionsDisplay" :key="position.symbol">
              <td><strong>{{ position.symbol }}</strong></td><td><span class="pill" :class="position.side.toLowerCase()">{{ position.side === 'LONG' ? '多' : '空' }}</span></td><td>{{ position.quantity }}</td><td>{{ position.entry }}</td><td>{{ position.mark }}</td><td class="positive">{{ position.pnl }}</td><td>{{ position.leverage }}</td><td><span class="text-status healthy">{{ position.risk }}</span></td><td><span class="text-status shadow">{{ position.protection }}</span></td>
              <td><a-button class="table-action" type="link" size="small" icon="search" @click="inspect(position.symbol)">查看</a-button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="accountOrders.length || accountFills.length" class="dashboard-grid signals-risk-grid" aria-label="Gate account order and fill facts">
      <article class="section-shell signal-panel" aria-labelledby="account-orders-heading">
        <div class="section-heading"><div><span class="section-kicker">Gate TestNet</span><h2 id="account-orders-heading">账户订单事实</h2></div><span class="read-only-badge"><a-icon type="lock" /> 只读快照</span></div>
        <div class="table-wrap compact" tabindex="0">
          <table class="terminal-table"><thead><tr><th>标的</th><th>方向</th><th>状态</th><th>订单 ID</th><th>数量</th><th>已成交</th><th>均价</th></tr></thead>
            <tbody><tr v-for="order in accountOrders" :key="order.exchange_order_id || order.client_order_id"><td>{{ order.instrument_id }}</td><td>{{ order.side }}</td><td><span class="text-status" :class="orderStatusTone(order.status)">{{ order.status }}</span></td><td><code>{{ order.exchange_order_id || order.client_order_id || '—' }}</code></td><td>{{ order.quantity }}</td><td>{{ order.filled_quantity }}</td><td>{{ order.average_fill_price || '—' }}</td></tr></tbody>
          </table>
        </div>
      </article>
      <article class="section-shell risk-panel" aria-labelledby="account-fills-heading">
        <div class="section-heading"><div><span class="section-kicker">Gate TestNet</span><h2 id="account-fills-heading">最近成交事实</h2></div><span class="read-only-badge"><a-icon type="lock" /> 只读快照</span></div>
        <div class="table-wrap compact" tabindex="0">
          <table class="terminal-table"><thead><tr><th>标的</th><th>成交 ID</th><th>数量</th><th>价格</th><th>手续费</th></tr></thead>
            <tbody><tr v-for="fill in accountFills" :key="fill.venue_fill_id"><td>{{ fill.instrument_id }}</td><td><code>{{ fill.venue_fill_id }}</code></td><td>{{ fill.quantity }}</td><td>{{ fill.price }}</td><td>{{ fill.fee_amount || '0' }} {{ fill.fee_asset || '' }}</td></tr></tbody>
          </table>
        </div>
      </article>
    </section>

    <section v-if="accountBook.length" class="section-shell" aria-labelledby="account-book-heading">
      <div class="section-heading"><div><span class="section-kicker">Gate TestNet</span><h2 id="account-book-heading">账户资金流水</h2></div><span class="read-only-badge"><a-icon type="lock" /> 只读证据</span></div>
      <div class="table-wrap compact" tabindex="0">
        <table class="terminal-table"><thead><tr><th>时间</th><th>类型</th><th>变动</th><th>变动后余额</th><th>标的</th><th>成交 ID</th></tr></thead>
          <tbody><tr v-for="entry in accountBook" :key="entry.event_id"><td>{{ entry.occurred_at }}</td><td><span class="text-status" :class="accountBookTone(entry.type)">{{ accountBookLabel(entry.type) }}</span></td><td :class="accountBookChangeClass(entry.change)">{{ entry.change }}</td><td>{{ entry.balance }}</td><td>{{ entry.instrument_id || '—' }}</td><td><code>{{ entry.trade_id || '—' }}</code></td></tr></tbody>
        </table>
      </div>
    </section>

    <section class="section-shell" aria-labelledby="strategy-heading">
      <div class="section-heading"><div><span class="section-kicker">策略工厂</span><h2 id="strategy-heading">策略卡片</h2></div><span class="mock-copy">仅用于视觉占位</span></div>
      <div class="strategy-grid">
        <article v-for="strategy in strategyCards" :key="strategy.key || strategy.name" class="strategy-card" :class="strategy.accent">
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
      <div v-if="productRehearsal && productRehearsal.admission" class="admission-evidence" data-testid="admission-rehearsal">
        <span class="admission-label">离线 Admission 证据</span>
        <strong class="healthy">{{ productRehearsal.admission.disposition }}</strong>
        <span>Risk {{ productRehearsal.admission.risk_decision_status }}</span>
        <span>Reservation {{ productRehearsal.admission.reservation_id ? '已生成' : '无' }}</span>
        <span>Outbox {{ productRehearsal.admission.outbox_event_id ? '已生成' : '无' }}</span>
        <span class="purple">Typed Parser {{ productRehearsal.admission.typed_event_parser }}</span>
      </div>
      <div v-if="productRehearsal && productRehearsal.testnet_execution" class="admission-evidence execution-evidence" data-testid="product-testnet-execution">
        <span class="admission-label">端到端 TestNet 执行证据</span>
        <strong class="healthy">{{ productRehearsal.testnet_execution.order.status }}</strong>
        <span>成交 {{ productRehearsal.testnet_execution.order.filled_quantity }} / {{ productRehearsal.testnet_execution.order.quantity }}</span>
        <span>手续费 {{ productRehearsal.testnet_execution.fee_amount }} {{ productRehearsal.testnet_execution.fee_asset }}</span>
        <span class="purple">Fixture · 无网络写入</span>
      </div>
      <div v-if="gateTestnetExecution" class="admission-evidence execution-evidence" data-testid="testnet-execution-rehearsal">
        <span class="admission-label">Gate TestNet 生命周期仿真</span>
        <strong class="healthy">{{ gateTestnetExecution.order.status }}</strong>
        <span>成交 {{ gateTestnetExecution.order.filled_quantity }} / {{ gateTestnetExecution.order.quantity }}</span>
        <span>手续费 {{ gateTestnetExecution.fee_amount }} {{ gateTestnetExecution.fee_asset }}</span>
        <span class="purple">仅 Fixture · 未联网 · 未写入</span>
      </div>
      <div v-if="productRehearsal && productRehearsal.ledger_rehearsal" class="admission-evidence ledger-evidence" data-testid="product-ledger-rehearsal">
        <span class="admission-label">Fill / Ledger 边界证据</span>
        <strong class="healthy">{{ productRehearsal.ledger_rehearsal.status }}</strong>
        <span>稳定成交 {{ productRehearsal.ledger_rehearsal.fill_count }} 笔</span>
        <span>持久化 {{ productRehearsal.ledger_rehearsal.persistence }}</span>
        <span class="purple">只读构造 · 无账本写入</span>
      </div>
      <div v-if="productRehearsal && productRehearsal.execution_worker" class="admission-evidence execution-evidence" data-testid="product-execution-worker">
        <span class="admission-label">Admission → TestNet → Ledger</span>
        <strong class="healthy">{{ productRehearsal.execution_worker.status }}</strong>
        <span>订单 {{ productRehearsal.execution_worker.order_id }}</span>
        <span>成交 {{ productRehearsal.execution_worker.fill_count }} 笔</span>
        <span>账本 {{ productRehearsal.execution_worker.ledger_disposition || 'NO_FILL' }}</span>
        <span class="purple">Fixture · 无网络写入 · Live OFF</span>
      </div>
      <div v-if="productRehearsal && productRehearsal.canary_gate" class="admission-evidence canary-evidence" data-testid="product-canary-gate">
        <span class="admission-label">Canary / 回滚闸门</span>
        <strong :class="productRehearsal.canary_gate.decision === 'PROMOTION_CANDIDATE' ? 'healthy' : 'warning'">{{ productRehearsal.canary_gate.decision }}</strong>
        <span>{{ productRehearsal.canary_gate.reasons.length ? productRehearsal.canary_gate.reasons.join(' · ') : '证据完整' }}</span>
        <span class="purple">Live OFF · 需额外样本后才能晋级</span>
      </div>
    </section>

    <section class="dashboard-grid health-grid">
      <article class="section-shell" aria-labelledby="shadow-heading">
        <div class="section-heading"><div><span class="section-kicker">影子验证</span><h2 id="shadow-heading">Shadow 差异</h2></div><a-button class="table-action" type="link" icon="eye" @click="view('shadow-diff')">查看</a-button></div>
        <dl class="detail-list"><div><dt>候选状态</dt><dd>{{ shadowDisplay.candidate }}</dd></div><div><dt>旧系统状态</dt><dd>{{ shadowDisplay.legacy }}</dd></div><div><dt>差异数量</dt><dd>{{ shadowDisplay.differences }}</dd></div><div><dt>匹配状态</dt><dd class="healthy">{{ shadowDisplay.match }}</dd></div><div><dt>容差版本</dt><dd>{{ shadowDisplay.tolerance }}</dd></div><div><dt>最后比较</dt><dd>{{ shadowDisplay.comparison }}</dd></div></dl>
      </article>
      <article class="section-shell" aria-labelledby="reconciliation-heading">
        <div class="section-heading"><div><span class="section-kicker">健康度</span><h2 id="reconciliation-heading">对账与健康度</h2></div><a-button icon="reload" @click="refreshMock">刷新模拟数据</a-button></div>
        <dl class="detail-list"><div><dt>上次运行</dt><dd>{{ reconciliationDisplay.lastRun }}</dd></div><div><dt>检查点状态</dt><dd class="healthy">{{ reconciliationDisplay.checkpoint }}</dd></div><div><dt>差异数量</dt><dd>{{ reconciliationDisplay.discrepancies }}</dd></div><div><dt>投影水位</dt><dd>{{ reconciliationDisplay.watermark }}</dd></div><div><dt>派生健康度</dt><dd class="healthy">{{ reconciliationDisplay.derivedHealth }}</dd></div><div><dt>下次检查</dt><dd>{{ reconciliationDisplay.nextCheck }}</dd></div></dl>
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
import { listExchangeCredentials } from '@/api/credentials'
 import { getReadonlyQuantState, getReadonlyBacktestResult, getReadonlyPersistedBacktestReport, getReadonlyPaperShadowResult, getReadonlyPaperAccount, getReadonlyDurablePaperAccount, getReadonlyPaperRecovery, getResearchReadiness, getReadonlyStrategyCatalog, getReadonlyResearchRun, getReadonlyReleaseReadiness, getReadonlyTestnetRehearsal, getReadonlyQuantOperations, getReadonlyProjectionGeneration, getReadonlyReconciliationCheckpoint, getReadonlyShadowSummary, getReadonlyNonLiveRunManifest, getReadonlyDeploymentReadiness, getReadonlyGateAccount, getReadonlyGateUnifiedAccount, getGateTestnetEnvironmentAccount, submitGateTestnetOrder, cancelGateTestnetOrder, getGateTestnetOrder, getReadonlyGateMarket, getReadonlyGateUnifiedMarket, getReadonlyProductRehearsal, getReadonlyGateTestnetExecutionRehearsal } from '@/api/quant-readonly'
import { formatGateReadonlyError } from '@/utils/gateReadonlyDiagnostics'

echarts.use([LineChart, GridComponent, TooltipComponent, CanvasRenderer])

export default {
  name: 'QuantDashboard',
  data () {
    return {
      dashboard: quantDashboardMock,
      readonlyState: null,
      readonlyBacktest: null,
      readonlyPaperShadow: null,
      readonlyPaperAccount: null,
      durablePaperAccount: null,
      paperRecovery: null,
      researchReadiness: null,
      strategyCatalog: null,
      researchRun: null,
      releaseReadiness: null,
      testnetRehearsal: null,
      quantOperations: null,
      projectionGeneration: null,
      readonlyReconciliation: null,
      readonlyShadow: null,
      nonLiveRunManifest: null,
      deploymentReadiness: null,
       readonlyGateAccount: null,
       readonlyGateUnifiedAccount: null,
      gateTestnetEnvironmentAccount: null,
      gateTestnetCredentials: [],
      gateAccountForm: { credential_id: '', account_scope: 'gate-testnet', market_type: 'spot', instrument_id: 'BTC_USDT' },
      gateAccountLoading: false,
      gateAccountError: '',
      readonlyGateMarket: null,
      readonlyGateUnifiedMarket: null,
      productRehearsal: null,
      gateTestnetExecution: null,
      testnetForm: {
        credential_id: '',
        account_scope: 'gate-testnet',
        instrument_id: 'BTC_USDT',
        market_type: 'spot',
        side: 'BUY',
        action: 'OPEN',
        execution_kind: 'MARKET',
        quantity: '',
        limit_price: '',
        reference_price: '',
        client_order_id: ''
      },
      testnetWriteAcknowledged: false,
      testnetConfirmation: '',
      testnetSubmitting: false,
      testnetReceipt: null,
      testnetCancelForm: { exchange_order_id: '' },
      testnetQueryForm: { exchange_order_id: '' },
      testnetQuerying: false,
      expanded: false,
      signalFilterOn: false,
      interactionNote: '静态模拟数据 · 未连接实盘',
      chartInstance: null
    }
  },
  computed: {
    strategyCards () {
      const previewCards = Array.isArray(this.dashboard.strategies)
        ? this.dashboard.strategies.map(strategy => ({ ...strategy, key: `mock:${strategy.name}` }))
        : []
      const catalog = this.strategyCatalog
      if (!catalog || catalog.status !== 'READY' || !Array.isArray(catalog.strategies)) return previewCards

      const names = {
        'ema-adx-trend': 'EMA + ADX 趋势',
        'donchian-atr': 'Donchian + ATR',
        'bollinger-rsi': '布林带 + RSI',
        'dual-thrust': 'Dual Thrust 突破',
        'buy-and-hold': 'Buy & Hold',
        'smc-structure': 'SMC 结构策略',
        'ict-liquidity-displacement': 'ICT 流动性位移'
      }
      const accents = {
        EMA_ADX_TREND: 'cyan',
        DONCHIAN_ATR: 'green',
        BOLLINGER_RSI: 'purple',
        DUAL_THRUST: 'green',
        BUY_AND_HOLD: 'cyan',
        SMC: 'purple',
        ICT: 'purple'
      }
      const previewById = {
        'smc-structure': previewCards.find(card => String(card.name || '').includes('SMC')),
        'ict-liquidity-displacement': previewCards.find(card => String(card.name || '').includes('ICT'))
      }
      const builtIns = catalog.strategies
        .filter(item => item && item.strategy_id)
        .map(item => ({
          key: `builtin:${item.strategy_id}`,
          ...(previewById[item.strategy_id] || {
            name: names[item.strategy_id] || item.strategy_id,
            mode: 'SHADOW',
            status: '内置研究目录',
            signal: '等待研究信号',
            confidence: '—',
            exposure: '0.00 USDT',
            budget: '未分配',
            kill: '安全闸门',
            accent: accents[item.family] || 'cyan'
          }),
          catalogVersion: item.version,
          parameterNames: Array.isArray(item.parameter_names) ? item.parameter_names : []
        }))
      return builtIns
    },
    gateAccountEvidenceTitle () {
      if (this.gateTestnetEnvironmentAccount && this.gateTestnetEnvironmentAccount.status === 'READY') return 'TESTNET · READ ONLY · READY'
      if (this.gateAccountLoading) return 'TESTNET · READING'
      return 'TESTNET · NOT CONNECTED'
    },
    gateAccountEvidenceDetail () {
      if (this.gateAccountError) return this.gateAccountError
      if (this.gateTestnetEnvironmentAccount && this.gateTestnetEnvironmentAccount.status === 'READY') return `scope=${this.gateAccountForm.account_scope} · ${this.gateAccountForm.market_type}`
      if (!this.gateTestnetCredentials.length) return '请先在“管理交易所连接”中保存 Gate TestNet 凭证；Key/Secret 只提交到后端'
      return '凭证仅在后端环境中读取；前端不接收 Key/Secret'
    },
    gateAccountEvidenceTone () {
      if (this.gateTestnetEnvironmentAccount && this.gateTestnetEnvironmentAccount.status === 'READY') return 'healthy'
      if (this.gateAccountError) return 'warning'
      return 'neutral'
    },
    gateReadHealth () {
      const unified = this.readonlyGateUnifiedAccount
      return unified && unified.status === 'READY' && unified.read_health ? unified.read_health : null
    },
    researchStatus () {
      return {
        backtest: this.readonlyBacktest && this.readonlyBacktest.status ? this.readonlyBacktest.status : 'UNAVAILABLE',
        paperShadow: this.readonlyPaperShadow && this.readonlyPaperShadow.status ? this.readonlyPaperShadow.status : 'UNAVAILABLE',
        readiness: this.researchReadiness && this.researchReadiness.status ? this.researchReadiness.status : 'UNAVAILABLE'
      }
    },
    reconciliationDisplay () {
      const persisted = this.readonlyReconciliation
      if (!persisted || !persisted.checkpoint_status) return this.dashboard.reconciliation
      return {
        lastRun: persisted.updated_at || 'UNAVAILABLE',
        checkpoint: persisted.checkpoint_status,
        discrepancies: `${persisted.unresolved_count} 项未决`,
        watermark: `version: ${persisted.version}`,
        derivedHealth: persisted.derived_health,
        nextCheck: persisted.sla_deadline || '未设置'
      }
    },
    shadowDisplay () {
      const persisted = this.readonlyShadow
      if (!persisted || !persisted.run_id) return this.dashboard.shadow
      return {
        candidate: `${persisted.candidate_consumer_name} / generation ${persisted.candidate_generation_id.slice(0, 8)}`,
        legacy: `checkpoint ${persisted.candidate_checkpoint_watermark}`,
        differences: `${persisted.diff_count} total / ${persisted.blocking_diff_count} blocking`,
        match: persisted.match_status,
        tolerance: persisted.tolerance_policy_version,
        comparison: persisted.completed_at
      }
    },
    statusItems () {
      const status = this.dashboard.status
      const reconciliation = this.readonlyState && this.readonlyState.reconciliation
      const derivedHealth = (this.readonlyReconciliation && this.readonlyReconciliation.derived_health) || (reconciliation && reconciliation.derived_health)
      return [
        { label: '运行模式', value: status.environment, icon: 'experiment', tone: 'shadow' },
        { label: '实盘交易', value: status.liveTrading, icon: 'poweroff', tone: 'risk' },
        { label: '对账状态', value: derivedHealth === 'HEALTHY' ? '健康' : (derivedHealth || '健康'), icon: 'safety-certificate', tone: derivedHealth === 'HEALTHY' ? 'healthy' : 'warning' },
        { label: 'Gate 行情', value: this.readonlyGateMarket && this.readonlyGateMarket.candles && this.readonlyGateMarket.candles.length ? `收盘 ${this.readonlyGateMarket.candles[this.readonlyGateMarket.candles.length - 1].close}` : '未启用', icon: 'database', tone: this.readonlyGateMarket ? 'healthy' : 'warning' },
        { label: '账户数据', value: '已核验', icon: 'check-circle', tone: 'healthy' }
      ]
    },
    headlineMetrics () {
      const names = ['账户总权益', '当日盈亏', '可用保证金', '回撤']
      const fallback = names.map(name => this.dashboard.account.find(metric => metric.label === name)).filter(Boolean)
      const persisted = this.gateTestnetEnvironmentAccount || this.readonlyGateAccount
      if (!persisted || persisted.status !== 'READY' || !Array.isArray(persisted.balances)) return fallback
      const usdt = persisted.balances.find(item => String(item.asset || '').toUpperCase() === 'USDT') || persisted.balances[0]
      const pnl = persisted.pnl || {}
      return [
        { label: '账户总权益', value: usdt && usdt.total ? usdt.total : '0', detail: 'Gate TestNet 只读证据' },
        { label: '当日盈亏', value: pnl.realized || '0', detail: '已实现 PnL 只读证据' },
        { label: '可用保证金', value: usdt && usdt.available ? usdt.available : '0', detail: 'Gate TestNet 可用余额' },
        fallback[3]
      ].filter(Boolean)
    },
    accountRiskSummary () {
      const names = ['总敞口', '净敞口', '活动预留']
      return names.map(name => this.dashboard.account.find(metric => metric.label === name)).filter(Boolean)
    },
    positionsDisplay () {
      const persisted = this.gateTestnetEnvironmentAccount || this.readonlyGateAccount
      const paper = this.readonlyPaperAccount
      if ((!persisted || persisted.status !== 'READY' || !Array.isArray(persisted.positions)) && paper && paper.status === 'READY' && Array.isArray(paper.positions)) {
        return paper.positions.map(position => ({
          symbol: position.symbol,
          side: String(position.signed_quantity || '').trim().startsWith('-') ? 'SHORT' : 'LONG',
          quantity: position.signed_quantity,
          entry: position.average_entry_price || 'N/A',
          mark: 'N/A',
          pnl: position.realized_pnl || '0',
          leverage: 'N/A',
          risk: 'PAPER DERIVED',
          protection: 'READ ONLY'
        }))
      }
      if (!persisted || persisted.status !== 'READY' || !Array.isArray(persisted.positions)) return this.dashboard.positions
      return persisted.positions.map(position => ({
        symbol: position.instrument_id,
        side: String(position.side || '').toUpperCase(),
        quantity: position.quantity,
        entry: position.average_entry_price,
        mark: position.mark_price,
        pnl: position.unrealized_pnl || '0',
        leverage: `${position.leverage}x`,
        risk: '已核验',
        protection: '只读'
      }))
    },
    accountOrders () {
      const persisted = this.gateTestnetEnvironmentAccount || this.readonlyGateAccount
      return persisted && persisted.status === 'READY' && Array.isArray(persisted.orders)
        ? persisted.orders
        : []
    },
    accountFills () {
      const persisted = this.gateTestnetEnvironmentAccount || this.readonlyGateAccount
      return persisted && persisted.status === 'READY' && Array.isArray(persisted.fills)
        ? persisted.fills
        : []
    },
    accountBook () {
      const persisted = this.gateTestnetEnvironmentAccount || this.readonlyGateAccount
      return persisted && persisted.status === 'READY' && Array.isArray(persisted.account_book)
        ? persisted.account_book
        : []
    },
    visibleSignals () {
      return this.signalFilterOn
        ? this.dashboard.signals.filter(signal => signal.admission !== 'REPLAYED')
        : this.dashboard.signals
    },
    timelineEvents () {
      return this.expanded ? this.dashboard.timeline : this.dashboard.timeline.slice(0, 5)
    },
    environmentGateCards () {
      const gate = this.dashboard.environmentGate
      return [
        { key: 'testnet', label: gate.testnet.label, status: gate.testnet.status, statusTone: 'healthy', tone: 'testnet', note: gate.testnet.note },
        { key: 'canary', label: gate.canary.label, status: gate.canary.status, statusTone: 'warning', tone: 'canary', note: gate.canary.note },
        { key: 'live', label: gate.live.label, status: gate.live.status, statusTone: 'risk', tone: 'live', note: gate.live.note }
      ]
    },
    testnetExecutionConsole () {
      const query = (this.$route && this.$route.query) || {}
      return { visible: query.gate_testnet_write === '1' }
    },
    testnetWriteUnlocked () {
      return this.testnetWriteAcknowledged && this.testnetConfirmation === 'TESTNET' && !this.testnetSubmitting
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.initEquityChart()
      this._resizeChart = () => this.chartInstance && this.chartInstance.resize()
      window.addEventListener('resize', this._resizeChart)
    })
    this.loadReadonlyState()
    this.loadReadonlyResearchState()
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
    async refreshGateTestnetAccountSnapshot () {
      if (!this.testnetForm.credential_id || !this.testnetForm.account_scope) return
      try {
        const response = await getReadonlyGateAccount({
          credential_id: Number(this.testnetForm.credential_id),
          market_type: this.testnetForm.market_type,
          account_scope: this.testnetForm.account_scope,
          instrument_id: this.testnetForm.instrument_id
        })
        const body = response && response.data ? response.data : response
        if (body && body.status === 'READY' && body.live_enabled === false) {
          this.gateTestnetEnvironmentAccount = body
        }
      } catch (error) {
        // A failed read must not turn a successful TestNet receipt into a mock.
      }
    },
    async submitTestnetOrder () {
      if (!this.testnetWriteUnlocked) return
      this.testnetSubmitting = true
      this.testnetReceipt = null
      try {
        const reducing = ['REDUCE', 'CLOSE'].includes(this.testnetForm.action)
        const payload = { ...this.testnetForm, mode: 'PAPER', source: 'REST', position_side: 'NET', quantity_semantics: 'ABSOLUTE', reduce_only: reducing, close_all: false, actor_id: 'frontend-testnet', reference_price: this.testnetForm.reference_price, correlation_id: `frontend-testnet-${Date.now()}`, occurred_at: new Date().toISOString(), idempotency_key: `frontend-testnet-${Date.now()}` }
        if (reducing) {
          payload.close_quantity = payload.quantity
          delete payload.quantity
          delete payload.quantity_semantics
        }
        if (!payload.limit_price) delete payload.limit_price
        if (!payload.client_order_id) delete payload.client_order_id
        if (!payload.target_position_id) delete payload.target_position_id
        const response = await submitGateTestnetOrder(payload)
        this.testnetReceipt = response && response.data ? response.data : response
        if (this.testnetReceipt && this.testnetReceipt.status !== 'REJECTED') await this.refreshGateTestnetAccountSnapshot()
        this.interactionNote = 'TestNet 订单已返回类型化回执；Live 仍保持关闭'
      } catch (error) {
        const response = error && error.response && error.response.data
        this.testnetReceipt = response || { status: 'REJECTED', live_enabled: false }
        this.interactionNote = 'TestNet 订单被服务端闸门拒绝或暂不可用'
      } finally {
        this.testnetSubmitting = false
      }
    },
    async cancelTestnetOrder () {
      if (!this.testnetWriteUnlocked || !this.testnetCancelForm.exchange_order_id) return
      this.testnetSubmitting = true
      this.testnetReceipt = null
      try {
        const now = Date.now()
        const payload = {
          credential_id: this.testnetForm.credential_id,
          instrument_id: this.testnetForm.instrument_id,
          market_type: this.testnetForm.market_type,
          mode: 'PAPER',
          source: 'REST',
          action: 'CANCEL',
          position_side: 'NET',
          cancel_target_kind: 'VENUE_ORDER_ID',
          cancel_target_id: this.testnetCancelForm.exchange_order_id,
          correlation_id: `frontend-testnet-cancel-${now}`,
          occurred_at: new Date().toISOString(),
          idempotency_key: `frontend-testnet-cancel-${now}`
        }
        const response = await cancelGateTestnetOrder(payload)
        this.testnetReceipt = response && response.data ? response.data : response
        if (this.testnetReceipt && this.testnetReceipt.status !== 'REJECTED') await this.refreshGateTestnetAccountSnapshot()
        this.interactionNote = 'TestNet 撤单已返回类型化回执；未触碰 Live'
      } catch (error) {
        const response = error && error.response && error.response.data
        this.testnetReceipt = response || { status: 'REJECTED', live_enabled: false }
        this.interactionNote = 'TestNet 撤单被服务端闸门拒绝或暂不可用'
      } finally {
        this.testnetSubmitting = false
      }
    },
    async queryTestnetOrder () {
      if (this.testnetQuerying || !this.testnetQueryForm.exchange_order_id) return
      this.testnetQuerying = true
      try {
        const response = await getGateTestnetOrder({
          credential_id: this.testnetForm.credential_id,
          account_scope: this.testnetForm.account_scope,
          instrument_id: this.testnetForm.instrument_id,
          market_type: this.testnetForm.market_type,
          exchange_order_id: this.testnetQueryForm.exchange_order_id
        })
        this.testnetReceipt = response && response.data ? response.data : response
        this.interactionNote = '已完成 Gate TestNet 只读订单查询'
      } catch (error) {
        const response = error && error.response && error.response.data
        this.testnetReceipt = response || { status: 'UNAVAILABLE', live_enabled: false }
        this.interactionNote = 'TestNet 订单查询不可用或未找到'
      } finally {
        this.testnetQuerying = false
      }
    },
    async loadReadonlyResearchState () {
      const unwrap = response => response && response.data ? response.data : response
      try {
        const runId = this.$route && this.$route.query && this.$route.query.backtest_run_id
        const response = runId
          ? await getReadonlyPersistedBacktestReport(runId)
          : await getReadonlyBacktestResult()
        this.readonlyBacktest = unwrap(response)
      } catch (e) {
        this.readonlyBacktest = { status: 'UNAVAILABLE' }
      }
      try {
        const response = await getReadonlyPaperShadowResult()
        this.readonlyPaperShadow = unwrap(response)
      } catch (e) {
        this.readonlyPaperShadow = { status: 'UNAVAILABLE' }
      }
      try {
        const response = await getReadonlyPaperAccount()
        this.readonlyPaperAccount = unwrap(response)
      } catch (e) {
        this.readonlyPaperAccount = { status: 'UNAVAILABLE', live_enabled: false }
      }
      if (this.$route && this.$route.query && this.$route.query.paper_v2) {
        try {
          const response = await getReadonlyDurablePaperAccount(this.$route.query.paper_limit || 200)
          this.durablePaperAccount = unwrap(response)
        } catch (e) {
          this.durablePaperAccount = { status: 'UNAVAILABLE', live_enabled: false }
        }
      }
      try {
        const response = await getResearchReadiness()
        this.researchReadiness = unwrap(response)
      } catch (e) {
        this.researchReadiness = { status: 'UNAVAILABLE' }
      }
      try {
        const response = await getReadonlyStrategyCatalog()
        this.strategyCatalog = unwrap(response)
      } catch (e) {
        this.strategyCatalog = { status: 'UNAVAILABLE', strategies: [] }
      }
      try {
        const response = await getReadonlyProjectionGeneration()
        this.projectionGeneration = unwrap(response)
      } catch (e) {
        this.projectionGeneration = { status: 'UNAVAILABLE', live_enabled: false }
      }
      await this.loadReadonlyReconciliation()
      await this.loadReadonlyShadow()
      await this.loadGateTestnetCredentials()
      await this.loadReadonlyGateAccount()
      await this.loadGateTestnetEnvironmentAccount()
      await this.loadReadonlyGateMarket()
      await this.loadReadonlyPaperRecovery()
      await this.loadReadonlyProductRehearsal()
      await this.loadReadonlyGateTestnetExecution()
      try {
        const response = await getReadonlyResearchRun()
        this.researchRun = unwrap(response)
      } catch (e) {
        this.researchRun = { status: 'UNAVAILABLE' }
      }
      try {
        const response = await getReadonlyReleaseReadiness()
        this.releaseReadiness = unwrap(response)
      } catch (e) {
        this.releaseReadiness = { status: 'UNAVAILABLE' }
      }
      try {
        const response = await getReadonlyTestnetRehearsal()
        this.testnetRehearsal = unwrap(response)
      } catch (e) {
        this.testnetRehearsal = { status: 'UNAVAILABLE' }
      }
      try {
        const response = await getReadonlyQuantOperations()
        this.quantOperations = unwrap(response)
      } catch (e) {
        this.quantOperations = { status: 'UNAVAILABLE', live_enabled: false }
      }
      try {
        const response = await getReadonlyNonLiveRunManifest()
        this.nonLiveRunManifest = unwrap(response)
      } catch (e) {
        this.nonLiveRunManifest = { status: 'UNAVAILABLE', live_enabled: false }
      }
      try {
        const response = await getReadonlyDeploymentReadiness()
        this.deploymentReadiness = unwrap(response)
      } catch (e) {
        this.deploymentReadiness = { status: 'UNAVAILABLE', live_enabled: false }
      }
    },
    async loadReadonlyReconciliation () {
      const query = (this.$route && this.$route.query) || {}
      const scope = {
        credential_id: query.credential_id,
        exchange: query.exchange,
        market_type: query.market_type,
        account_scope: query.account_scope,
        instrument_id: query.instrument_id
      }
      if (!scope.credential_id || !scope.exchange || !scope.market_type || !scope.account_scope || !scope.instrument_id) return
      try {
        const response = await getReadonlyReconciliationCheckpoint(scope)
        const body = response && response.data ? response.data : response
        if (body && body.checkpoint_status && body.live_enabled === false) this.readonlyReconciliation = body
      } catch (e) {
        this.readonlyReconciliation = null
      }
    },
    async loadReadonlyShadow () {
      const query = (this.$route && this.$route.query) || {}
      const scope = {
        credential_id: query.credential_id,
        exchange: query.exchange,
        market_type: query.market_type,
        account_scope: query.account_scope,
        instrument_id: query.instrument_id
      }
      if (!scope.credential_id || !scope.exchange || !scope.market_type || !scope.account_scope || !scope.instrument_id) return
      try {
        const response = await getReadonlyShadowSummary(scope)
        const body = response && response.data ? response.data : response
        if (body && body.run_id && body.live_enabled === false) this.readonlyShadow = body
      } catch (e) {
        this.readonlyShadow = null
      }
    },
    async loadReadonlyGateAccount () {
      const query = (this.$route && this.$route.query) || {}
      const scope = {
        credential_id: query.credential_id,
        market_type: query.market_type,
        account_scope: query.account_scope,
        instrument_id: query.instrument_id
      }
      if (!query.gate_account || !scope.credential_id || !scope.market_type || !scope.account_scope) return
      try {
        const response = await getReadonlyGateAccount(scope)
        const body = response && response.data ? response.data : response
        if (body && body.status === 'READY' && body.live_enabled === false) this.readonlyGateAccount = body
      } catch (e) {
        this.readonlyGateAccount = null
      }
    },
    async loadGateTestnetCredentials () {
      try {
        const response = await listExchangeCredentials()
        const body = response && response.data ? response.data : response
        const items = body && Array.isArray(body.items) ? body.items : []
        this.gateTestnetCredentials = items.filter(item => {
          const exchange = String(item.exchange_id || '').trim().toLowerCase()
          const environment = String(item.environment || '').trim().toLowerCase()
          return exchange === 'gate' && environment === 'testnet'
        })
        if (!this.gateAccountForm.credential_id && this.gateTestnetCredentials.length === 1) {
          this.gateAccountForm.credential_id = String(this.gateTestnetCredentials[0].id)
        }
        if (!this.testnetForm.credential_id && this.gateTestnetCredentials.length === 1) {
          this.testnetForm.credential_id = String(this.gateTestnetCredentials[0].id)
        }
      } catch (e) {
        this.gateTestnetCredentials = []
      }
    },
    async loadGateTestnetEnvironmentAccount () {
      const query = (this.$route && this.$route.query) || {}
      if (!query.gate_testnet_account || !query.account_scope) return
      try {
        const response = await getGateTestnetEnvironmentAccount({
          credential_id: query.credential_id,
          market_type: query.market_type || 'spot',
          account_scope: query.account_scope,
          instrument_id: query.instrument_id
        })
        const body = response && response.data ? response.data : response
        if (body && body.status === 'READY' && body.environment === 'TESTNET' && body.live_enabled === false) {
          this.gateTestnetEnvironmentAccount = body
          this.interactionNote = '已连接 Gate TestNet 真实账户只读数据；未启用下单'
        }
      } catch (e) {
        this.gateTestnetEnvironmentAccount = null
        this.gateAccountError = formatGateReadonlyError(e)
      }
    },
    async connectGateUnifiedTestnetAccount () {
      this.gateAccountLoading = true
      this.gateAccountError = ''
      try {
        const response = await getReadonlyGateUnifiedAccount({
          credential_id: Number(this.gateAccountForm.credential_id),
          account_scope: this.gateAccountForm.account_scope,
          instrument_id: this.gateAccountForm.instrument_id
        })
        const body = response && response.data ? response.data : response
        if (body && body.status === 'READY' && body.live_enabled === false) {
          this.readonlyGateUnifiedAccount = body
          try {
            const marketResponse = await getReadonlyGateUnifiedMarket({
              instrument_id: this.gateAccountForm.instrument_id,
              interval: '1m'
            })
            const marketBody = marketResponse && marketResponse.data ? marketResponse.data : marketResponse
            if (marketBody && marketBody.status === 'READY' && marketBody.live_enabled === false) {
              this.readonlyGateUnifiedMarket = marketBody
            }
          } catch (marketError) {
            this.readonlyGateUnifiedMarket = null
          }
          this.gateTestnetEnvironmentAccount = body.markets && body.markets[this.gateAccountForm.market_type]
            ? body.markets[this.gateAccountForm.market_type]
            : null
          this.interactionNote = 'Gate Spot + Perpetual 只读快照已更新，Live OFF'
        }
      } catch (error) {
        this.gateAccountError = formatGateReadonlyError(error)
      } finally {
        this.gateAccountLoading = false
      }
    },
    async connectGateTestnetAccount () {
      this.gateAccountLoading = true
      this.gateAccountError = ''
      try {
        const response = await getReadonlyGateAccount({
          credential_id: Number(this.gateAccountForm.credential_id),
          market_type: this.gateAccountForm.market_type,
          account_scope: this.gateAccountForm.account_scope,
          instrument_id: this.gateAccountForm.instrument_id
        })
        const body = response && response.data ? response.data : response
        if (!body || body.status !== 'READY' || body.live_enabled !== false) {
          throw new Error('Gate 凭证只读账户不可用')
        }
        this.gateTestnetEnvironmentAccount = body
        // Refresh public TestNet market evidence for the selected scope.
        // The account snapshot remains credential-backed; market data is read-only.
        try {
          const marketResponse = await getReadonlyGateMarket({
            instrument_id: this.gateAccountForm.instrument_id,
            market_type: this.gateAccountForm.market_type,
            interval: '1m'
          })
          const marketBody = marketResponse && marketResponse.data ? marketResponse.data : marketResponse
          if (marketBody && marketBody.bundle_fingerprint && marketBody.live_enabled === false) {
            this.readonlyGateMarket = marketBody
          }
        } catch (marketError) {
          // Keep account evidence usable if the public market endpoint is unavailable.
          this.readonlyGateMarket = null
        }
        this.interactionNote = '已刷新 Gate TestNet 真实账户只读快照；未启用下单或 Live'
      } catch (e) {
        this.gateTestnetEnvironmentAccount = null
        this.gateAccountError = formatGateReadonlyError(e)
      } finally {
        this.gateAccountLoading = false
      }
    },
    async loadReadonlyGateMarket () {
      const query = (this.$route && this.$route.query) || {}
      if (!query.gate_market || !query.instrument_id) return
      try {
        const response = await getReadonlyGateMarket({
          instrument_id: query.instrument_id,
          market_type: query.market_type || 'spot',
          interval: query.interval || '1m'
        })
        const body = response && response.data ? response.data : response
        if (body && body.bundle_fingerprint && body.live_enabled === false) this.readonlyGateMarket = body
      } catch (e) {
        this.readonlyGateMarket = null
      }
    },
    async loadReadonlyPaperRecovery () {
      const query = (this.$route && this.$route.query) || {}
      if (!query.paper_recovery) return
      try {
        const response = await getReadonlyPaperRecovery({
          expected_snapshot_fingerprint: query.paper_snapshot_fingerprint,
          limit: query.paper_limit || 200
        })
        const body = response && response.data ? response.data : response
        if (body && body.live_enabled === false) this.paperRecovery = body
      } catch (e) {
        this.paperRecovery = null
      }
    },
    async loadReadonlyProductRehearsal () {
      const query = (this.$route && this.$route.query) || {}
      if (!query.product_rehearsal) return
      try {
        const response = await getReadonlyProductRehearsal()
        const body = response && response.data ? response.data : response
        if (body && body.live_enabled === false && body.execution_boundary === 'READ_ONLY_FIXTURE') this.productRehearsal = body
      } catch (e) {
        this.productRehearsal = null
      }
    },
    async loadReadonlyGateTestnetExecution () {
      const query = (this.$route && this.$route.query) || {}
      if (!query.testnet_execution) return
      try {
        const response = await getReadonlyGateTestnetExecutionRehearsal({
          instrument_id: query.instrument_id || 'BTC_USDT',
          market_type: query.market_type || 'perpetual',
          fill_ratio: query.fill_ratio || '1'
        })
        const body = response && response.data ? response.data : response
        if (body && body.live_enabled === false && body.network_access === false) this.gateTestnetExecution = body
      } catch (e) {
        this.gateTestnetExecution = null
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
    },
    accountBookLabel (type) {
      return ({ pnl: '已实现盈亏', fee: '交易手续费', fund: 'Funding', dnw: '资金变动', refr: '返佣', point_dnw: '积分资金变动', point_fee: '积分手续费', point_refr: '积分返佣', bonus_offset: '体验金扣减' })[type] || type
    },
    accountBookTone (type) {
      return type === 'fee' || type === 'fund' ? 'warning' : (type === 'pnl' ? 'healthy' : 'neutral')
    },
    accountBookChangeClass (value) {
      return String(value || '').trim().startsWith('-') ? 'risk' : 'healthy'
    },
    orderStatusTone (value) {
      const status = String(value || '').toUpperCase()
      if (['FILLED', 'OPEN', 'PARTIALLY_FILLED'].includes(status)) return 'healthy'
      if (['CANCELLED', 'REJECTED', 'FAILED'].includes(status)) return 'risk'
      return 'warning'
    }
  }
}
</script>

<style scoped>
.quant-dashboard { --bg: #0b1117; --surface: #111a23; --surface-2: #172330; --line: #263847; --muted: #8fa2b3; --text: #eef5f8; --cyan: #39c6df; --green: #52c98c; --orange: #f4a261; --red: #ec6f73; --purple: #a584ff; min-height: 100%; padding: 20px 24px 28px; color: var(--text); background: radial-gradient(circle at 90% 0%, rgba(57, 198, 223, .07), transparent 28%), var(--bg); }
.dashboard-header, .section-heading, .strategy-title, .strategy-footer, .header-actions, .pipeline, .pipeline-cases, .admission-evidence, .hero-tags, .chart-footer { display: flex; align-items: center; }
.dashboard-header { justify-content: space-between; gap: 24px; margin-bottom: 12px; }.hero-copy { min-width: 0; }.hero-tags { gap: 6px; margin-bottom: 7px; flex-wrap: wrap; }.hero-chip, .active-strategy { display: inline-flex; align-items: center; gap: 5px; padding: 3px 7px; border: 1px solid var(--line); border-radius: 999px; font-size: 10px; font-weight: 800; letter-spacing: .7px; }.hero-chip.demo { color: var(--cyan); }.hero-chip.paper { color: var(--green); }.hero-chip.shadow { color: var(--purple); }.active-strategy { color: #bed0da; letter-spacing: 0; }.active-strategy .anticon { color: var(--cyan); }
h1, h2, h3, p { margin: 0; } h1, h2, h3 { color: var(--text) !important; } h1 { margin: 0 0 5px; font-size: clamp(22px, 1.85vw, 30px); letter-spacing: -.45px; } h2 { margin-top: 2px; font-size: 18px; } h3 { font-size: 16px; } .dashboard-header p { max-width: 720px; color: var(--muted); font-size: 12px; }
.header-actions { justify-content: flex-end; gap: 8px; flex-wrap: wrap; }.mock-note { color: var(--muted); font-size: 11px; margin-right: 6px; }.research-status { color: var(--purple); font-size: 10px; white-space: nowrap; }.quant-dashboard .ant-btn { height: 30px; color: #c7d8e1; border-color: #355164; background: rgba(17, 26, 35, .55); box-shadow: none; }.quant-dashboard .ant-btn:hover, .quant-dashboard .ant-btn:focus { color: var(--cyan); border-color: var(--cyan); background: rgba(57, 198, 223, .08); }.quant-dashboard .ant-btn.table-action { height: 23px; padding: 0 4px; color: #94bcca; border-color: transparent; background: transparent; }.quant-dashboard .ant-btn.table-action:hover, .quant-dashboard .ant-btn.table-action:focus { color: var(--cyan); border-color: transparent; background: transparent; }
.read-only-badge, .mode-chip, .pill, .text-status { display: inline-flex; align-items: center; gap: 5px; padding: 3px 8px; border: 1px solid var(--line); border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: .25px; white-space: nowrap; }.read-only-badge { color: var(--muted); }.mock-copy, .chart-caption { color: var(--muted); font-size: 11px; }
.status-bar { display: grid; grid-template-columns: repeat(5, minmax(128px, 1fr)) minmax(260px, 1.4fr); gap: 1px; overflow-x: auto; margin-bottom: 14px; padding: 1px; border: 1px solid var(--line); background: var(--line); }.status-item { display: grid; grid-template-columns: auto 1fr; gap: 2px 8px; min-width: 0; padding: 9px 11px; background: var(--surface); }.status-item .anticon { grid-row: span 2; align-self: center; }.status-item span { color: var(--muted); font-size: 10px; }.status-item strong { font-size: 12px; }.status-item.timestamp { grid-template-columns: auto auto 1fr; align-items: center; }.status-item.timestamp .anticon { grid-row: auto; }.status-item.timestamp strong { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }.healthy { color: var(--green) !important; }.risk { color: var(--red) !important; }.warning { color: var(--orange) !important; }.shadow, .purple { color: var(--purple) !important; }.cyan { color: var(--cyan) !important; }.neutral { color: var(--text) !important; }
.section-shell { margin-bottom: 14px; padding: 16px; border: 1px solid var(--line); border-radius: 10px; background: linear-gradient(145deg, rgba(23, 35, 48, .96), rgba(13, 22, 30, .96)); box-shadow: 0 16px 45px rgba(0, 0, 0, .14); }.section-heading { justify-content: space-between; gap: 16px; margin-bottom: 14px; }.compact-heading { margin-bottom: 12px; }.section-kicker { color: var(--cyan); font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
.environment-grid { display: grid; grid-template-columns: 1.25fr repeat(3, minmax(210px, 1fr)); gap: 9px; }.environment-card { min-width: 0; padding: 13px; border: 1px solid var(--line); background: rgba(7, 14, 20, .48); }.environment-card.current { border-color: rgba(57, 198, 223, .55); background: linear-gradient(145deg, rgba(57, 198, 223, .1), rgba(7, 14, 20, .45)); }.environment-card.testnet { border-color: rgba(82, 201, 140, .38); }.environment-card.canary { border-color: rgba(244, 162, 97, .35); }.environment-card.live { border-color: rgba(236, 111, 115, .4); }.environment-card-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; color: var(--muted); font-size: 11px; }.environment-card-head strong { font-size: 12px; letter-spacing: .4px; }.environment-card p { min-height: 34px; margin: 10px 0; color: #b9c8d3; font-size: 11px; line-height: 1.5; }.ghost-action { padding: 0; border: 0; color: #94bcca; background: transparent; font-size: 11px; cursor: pointer; }.ghost-action:hover, .ghost-action:focus { color: var(--cyan); outline: none; }
.testnet-cancel-row { display: flex; align-items: end; gap: 10px; flex-wrap: wrap; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(38, 56, 71, .7); }.testnet-cancel-row label { display: grid; gap: 5px; min-width: 220px; color: var(--muted); font-size: 10px; }.testnet-cancel-row input { min-height: 31px; box-sizing: border-box; padding: 5px 8px; border: 1px solid var(--line); border-radius: 5px; outline: none; color: var(--text); background: rgba(7, 14, 20, .7); font: inherit; }.testnet-cancel-row input:focus { border-color: var(--cyan); }
.metric-grid { display: grid; grid-template-columns: minmax(240px, 1.28fr) repeat(3, minmax(170px, 1fr)); gap: 9px; }.metric-card { min-width: 0; padding: 13px; border: 1px solid var(--line); background: rgba(7, 14, 20, .45); }.metric-card:first-child { border-color: rgba(57, 198, 223, .55); background: linear-gradient(145deg, rgba(57, 198, 223, .11), rgba(7, 14, 20, .45)); }.metric-card.healthy strong { color: var(--green); }.metric-card.warning strong { color: var(--orange); }.metric-card span, .metric-card small { display: block; color: var(--muted); font-size: 11px; }.metric-card strong { display: block; margin: 7px 0 5px; font-size: 18px; white-space: nowrap; font-variant-numeric: tabular-nums; }.metric-card:first-child strong { color: var(--cyan); font-size: 22px; }
.gate-account-controls { display: grid; grid-template-columns: minmax(180px, 1fr) minmax(140px, .7fr) minmax(180px, 1fr) auto; gap: 10px; align-items: end; }.gate-account-controls label { display: grid; gap: 5px; color: var(--muted); font-size: 11px; }.gate-account-controls input, .gate-account-controls select { width: 100%; min-height: 32px; border: 1px solid var(--line); border-radius: 6px; background: var(--surface-2); color: var(--text); padding: 0 9px; }.gate-account-controls input:focus, .gate-account-controls select:focus { border-color: var(--cyan); outline: none; }.gate-account-evidence { display: flex; align-items: center; gap: 12px; margin-top: 10px; min-height: 30px; padding: 7px 10px; border-radius: 6px; background: var(--surface-2); color: var(--muted); font-size: 11px; }.gate-account-evidence strong { color: var(--text); letter-spacing: .04em; }.gate-account-evidence.healthy strong { color: var(--green); }.gate-account-evidence.warning strong { color: var(--orange); }.gate-account-evidence.neutral strong { color: var(--cyan); }.gate-read-health { color: var(--cyan); font-variant-numeric: tabular-nums; }.gate-account-manage { margin-left: auto; color: var(--cyan); font-size: 11px; }
.dashboard-grid { display: grid; gap: 14px; }.performance-risk-grid { grid-template-columns: minmax(0, 2fr) minmax(300px, 1fr); }.chart-shell { min-height: 300px; }.equity-chart { width: 100%; height: 230px; }.chart-footer { justify-content: flex-start; gap: 16px; padding-top: 3px; color: var(--muted); font-size: 11px; }.chart-footer strong { margin-left: auto; color: var(--purple); font-size: 11px; }.legend-dot { display: inline-block; width: 7px; height: 7px; margin-right: 5px; border-radius: 50%; }.legend-dot.equity { background: var(--cyan); }.legend-dot.pnl { background: var(--green); }
.risk-summary-shell { background: linear-gradient(145deg, rgba(23, 35, 48, .96), rgba(17, 22, 30, .98)); }.summary-list { display: grid; gap: 1px; margin: 0; border: 1px solid var(--line); background: var(--line); }.summary-list > div { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 11px; background: rgba(7, 14, 20, .48); }.summary-list dt { color: var(--muted); font-size: 11px; }.summary-list dd { margin: 0; text-align: right; }.summary-list strong, .summary-list small { display: block; }.summary-list strong { font-size: 13px; }.summary-list small { margin-top: 3px; color: var(--muted); font-size: 10px; }.risk-callout { display: flex; gap: 8px; margin-top: 12px; padding: 10px; border: 1px solid rgba(82, 201, 140, .28); background: rgba(82, 201, 140, .06); color: #b6dbc8; font-size: 11px; line-height: 1.5; }.risk-callout .anticon { margin-top: 2px; color: var(--green); }
.table-wrap { overflow-x: auto; border: 1px solid var(--line); }.terminal-table { width: 100%; min-width: 1110px; border-collapse: collapse; font-size: 12px; }.terminal-table th { padding: 10px 12px; color: #a9bbc9; text-align: left; background: rgba(5, 11, 16, .65); font-size: 10px; letter-spacing: .6px; text-transform: uppercase; }.terminal-table td { padding: 10px 12px; border-top: 1px solid rgba(38, 56, 71, .7); white-space: nowrap; }.terminal-table tr:hover td { background: rgba(57, 198, 223, .045); }.pill.long { color: var(--green); }.pill.short { color: var(--orange); } code { color: var(--cyan); font-size: 11px; }
.strategy-grid { display: grid; grid-template-columns: repeat(4, minmax(225px, 1fr)); gap: 10px; overflow-x: auto; }.strategy-card { min-width: 225px; padding: 15px; border: 1px solid var(--line); background: rgba(7, 14, 20, .4); }.strategy-card.purple { box-shadow: inset 2px 0 var(--purple); }.strategy-card.green { box-shadow: inset 2px 0 var(--green); }.strategy-card.orange { box-shadow: inset 2px 0 var(--orange); }.strategy-title { align-items: flex-start; justify-content: space-between; gap: 8px; }.mode-chip { margin-bottom: 7px; padding: 1px 6px; color: var(--muted); }.strategy-card dl, .detail-list, .risk-list { margin: 16px 0; }.strategy-card dl { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }.strategy-card dt, .detail-list dt, .risk-list dt { color: var(--muted); font-size: 10px; }.strategy-card dd, .detail-list dd, .risk-list dd { margin: 4px 0 0; font-size: 12px; }.strategy-footer { justify-content: space-between; gap: 10px; padding-top: 12px; border-top: 1px solid var(--line); color: var(--muted); font-size: 11px; }
.signals-risk-grid { grid-template-columns: minmax(0, 1.7fr) minmax(300px, .8fr); }.health-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }.risk-list, .detail-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1px; background: var(--line); border: 1px solid var(--line); }.risk-list > div, .detail-list > div { padding: 12px; background: rgba(7, 14, 20, .55); }.risk-list small { display: block; margin-top: 4px; color: var(--muted); font-size: 11px; }
.pipeline { align-items: stretch; gap: 8px; overflow-x: auto; padding-bottom: 4px; }.pipeline-step { flex: 1 0 156px; position: relative; padding: 14px; border: 1px solid var(--line); background: rgba(7, 14, 20, .42); }.pipeline-step.green { box-shadow: inset 0 2px var(--green); }.pipeline-step.orange { box-shadow: inset 0 2px var(--orange); }.pipeline-step.purple { box-shadow: inset 0 2px var(--purple); }.pipeline-step.cyan { box-shadow: inset 0 2px var(--cyan); }.pipeline-index { color: var(--muted); font-size: 11px; }.pipeline-step h3 { margin: 10px 0 6px; }.pipeline-step p { min-height: 28px; color: var(--muted); font-size: 11px; }.pipeline-step strong { color: var(--cyan); font-size: 11px; }.pipeline-arrow { align-self: center; color: var(--muted); font-size: 22px; }.pipeline-cases { gap: 12px; flex-wrap: wrap; margin-top: 16px; color: var(--muted); font-size: 12px; }.pipeline-cases strong { font-size: 11px; }.admission-evidence { gap: 10px; flex-wrap: wrap; margin-top: 12px; padding: 10px 12px; border: 1px solid rgba(57, 198, 223, .28); background: rgba(57, 198, 223, .04); color: var(--muted); font-size: 11px; }.admission-evidence .admission-label { color: var(--cyan); font-weight: 700; }.admission-evidence strong { font-size: 11px; }
.timeline { position: relative; margin: 0; padding: 0 0 0 8px; list-style: none; }.timeline::before { position: absolute; top: 10px; bottom: 10px; left: 12px; width: 1px; background: var(--line); content: ''; }.timeline li { position: relative; display: grid; grid-template-columns: 90px 185px 1fr; gap: 12px; align-items: baseline; padding: 9px 0 9px 27px; }.timeline-dot { position: absolute; top: 15px; left: 0; width: 9px; height: 9px; border-radius: 50%; background: var(--cyan); box-shadow: 0 0 0 4px var(--surface-2); }.timeline-dot.green { background: var(--green); }.timeline-dot.orange { background: var(--orange); }.timeline-dot.purple { background: var(--purple); }.timeline-dot.risk { background: var(--red); }.timeline time { color: var(--muted); font-size: 11px; }.timeline strong { font-size: 12px; }.timeline p { color: #b9c8d3; font-size: 12px; }
@media (max-width: 1220px) { .status-bar { grid-template-columns: repeat(3, minmax(150px, 1fr)); }.status-item.timestamp { grid-column: span 2; }.metric-grid { grid-template-columns: repeat(2, minmax(180px, 1fr)); }.environment-grid { grid-template-columns: repeat(2, minmax(210px, 1fr)); }.testnet-form-grid { grid-template-columns: repeat(3, minmax(180px, 1fr)); }.gate-account-controls { grid-template-columns: repeat(2, minmax(180px, 1fr)); }.performance-risk-grid, .signals-risk-grid, .health-grid { grid-template-columns: 1fr; }.strategy-grid { grid-template-columns: repeat(2, minmax(245px, 1fr)); } }
@media (max-width: 760px) { .quant-dashboard { padding: 14px; }.dashboard-header { align-items: flex-start; flex-direction: column; }.header-actions { justify-content: flex-start; }.status-bar { grid-template-columns: repeat(2, minmax(145px, 1fr)); }.status-item.timestamp { grid-column: span 2; }.metric-grid, .environment-grid, .testnet-form-grid, .gate-account-controls { grid-template-columns: 1fr; }.strategy-grid { grid-template-columns: 1fr; }.risk-list, .detail-list { grid-template-columns: 1fr; }.timeline li { grid-template-columns: 70px 1fr; }.timeline p { grid-column: 2; }.pipeline-arrow { display: none; }.chart-footer { flex-wrap: wrap; }.chart-footer strong { width: 100%; margin-left: 0; } }
</style>
