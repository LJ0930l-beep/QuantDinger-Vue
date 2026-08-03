import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { quantDashboardMock } from '../../src/mocks/quantDashboard.js'
import { formatGateReadonlyError } from '../../src/utils/gateReadonlyDiagnostics.js'

test('quant dashboard mock is visibly non-live and complete enough for the read-only prototype', () => {
  assert.equal(quantDashboardMock.status.liveTrading, 'OFF')
  assert.equal(quantDashboardMock.environmentGate.live.status, 'OFF')
  assert.equal(quantDashboardMock.environmentGate.live.writes, 'DISABLED')
  assert.equal(quantDashboardMock.environmentGate.testnet.status, 'READY_READ_ONLY')
  assert.ok(['PAPER', 'SHADOW'].includes(quantDashboardMock.status.environment))
  assert.equal(quantDashboardMock.label.includes('模拟数据'), true)
  assert.equal(quantDashboardMock.positions.length > 0, true)
  assert.equal(quantDashboardMock.strategies.length, 7)
  assert.deepEqual(
    quantDashboardMock.strategies.filter(strategy => strategy.name !== 'Dual Thrust Breakout').map(strategy => strategy.name),
    ['SMC 结构策略', 'ICT 流动性扫描', 'EMA + ADX 趋势', 'Donchian + ATR', '布林带 + RSI', 'Buy & Hold']
  )
  assert.equal(quantDashboardMock.strategies.some(strategy => strategy.name === 'Dual Thrust Breakout'), true)
  assert.equal(quantDashboardMock.pipeline.length, 6)
  assert.equal(quantDashboardMock.equityChart.labels.length, quantDashboardMock.equityChart.equity.length)
  assert.equal(quantDashboardMock.equityChart.equity.every(value => typeof value === 'string'), true)
  assert.equal(quantDashboardMock.timeline.some(event => event.type === 'ENTRY_ADMITTED'), true)
})

test('mock amounts and quantities are presentation strings rather than binary floating-point values', () => {
  for (const item of quantDashboardMock.account) assert.equal(typeof item.value, 'string')
  for (const position of quantDashboardMock.positions) assert.equal(typeof position.quantity, 'string')
})

test('frontend TestNet write surface is explicitly gated and never exposes LIVE', () => {
  const view = readFileSync(new URL('../../src/views/quant-dashboard/index.vue', import.meta.url), 'utf8')
  assert.match(view, /gate_testnet_write === '1'/)
  assert.match(view, /testnetConfirmation === 'TESTNET'/)
  assert.match(view, /submitGateTestnetOrder/)
  assert.doesNotMatch(view, /AGENT_LIVE_TRADING_ENABLED\s*=\s*['"]1['"]/)
  assert.match(view, /Live OFF/)
})

test('frontend renders readonly Gate balance and position pnl evidence when available', () => {
  const view = readFileSync(new URL('../../src/views/quant-dashboard/index.vue', import.meta.url), 'utf8')
  assert.match(view, /persisted\.balances/)
  assert.match(view, /persisted\.pnl/)
  assert.match(view, /position\.unrealized_pnl/)
  assert.match(view, /Gate TestNet 只读证据/)
})

test('frontend connects to the backend TestNet readonly account without credential inputs', () => {
  const view = readFileSync(new URL('../../src/views/quant-dashboard/index.vue', import.meta.url), 'utf8')
  assert.match(view, /connectGateTestnetAccount/)
  assert.match(view, /listExchangeCredentials/)
  assert.match(view, /getReadonlyGateAccount/)
  assert.match(view, /getReadonlyGateUnifiedAccount/)
  assert.match(view, /connectGateUnifiedTestnetAccount/)
  assert.match(view, /getReadonlyGateUnifiedMarket/)
  assert.match(view, /gate-unified-market-summary/)
  assert.match(view, /marketResponse = await getReadonlyGateMarket/)
  assert.match(view, /refreshGateTestnetAccountSnapshot/)
  assert.match(view, /getGateTestnetEnvironmentAccount/)
  assert.match(view, /gateAccountForm\.account_scope/)
  assert.match(view, /凭证仅在后端环境中读取/)
  assert.doesNotMatch(view, /GATE_TESTNET_API_SECRET\s*=/)
  assert.doesNotMatch(view, /GATE_TESTNET_API_KEY\s*=/)
})

test('Gate readonly diagnostics expose typed safe failures without raw provider text', () => {
  const permission = formatGateReadonlyError({
    response: {
      status: 400,
      data: {
        msg: 'GATE_TESTNET_PERMISSION_OR_IP_REJECTED',
        data: { failed_markets: [{ market_type: 'spot', code: 'GATE_TESTNET_PERMISSION_OR_IP_REJECTED' }] }
      }
    }
  })
  assert.match(permission, /权限或 IP 白名单被拒绝/)
  assert.match(permission, /spot/)
  assert.doesNotMatch(permission, /secret|api[_-]?key|raw-provider/i)

  const auth = formatGateReadonlyError({
    response: { status: 400, data: { msg: 'GATE_TESTNET_AUTH_REJECTED', data: null } }
  })
  assert.match(auth, /凭证鉴权失败/)
  assert.doesNotMatch(auth, /undefined|null$/)

  const fallback = formatGateReadonlyError({
    response: { status: 503, data: { msg: 'UNEXPECTED_PROVIDER_TEXT', data: { detail: 'secret-value' } } }
  })
  assert.match(fallback, /只读服务暂不可用/)
  assert.doesNotMatch(fallback, /secret-value|UNEXPECTED_PROVIDER_TEXT/)
})

test('frontend renders the built-in strategy catalog when the read-only catalog is ready', () => {
  const view = readFileSync(new URL('../../src/views/quant-dashboard/index.vue', import.meta.url), 'utf8')
  assert.match(view, /v-for="strategy in strategyCards"/)
  assert.match(view, /catalog\.status !== 'READY'/)
  assert.match(view, /'ema-adx-trend'/)
  assert.match(view, /'donchian-atr'/)
  assert.match(view, /'bollinger-rsi'/)
  assert.match(view, /'dual-thrust'/)
  assert.match(view, /'buy-and-hold'/)
  assert.match(view, /'smc-structure'/)
  assert.match(view, /'ict-liquidity-displacement'/)
})

test('TestNet execution reuses a saved Gate credential and never accepts raw secrets', () => {
  const view = readFileSync(new URL('../../src/views/quant-dashboard/index.vue', import.meta.url), 'utf8')
  assert.match(view, /Gate TestNet 凭证<select v-model="testnetForm\.credential_id"/)
  assert.match(view, /v-for="credential in gateTestnetCredentials"/)
  assert.match(view, /!testnetForm\.credential_id/)
  assert.doesNotMatch(view, /api[_-]?secret\s*[:=]/i)
  assert.doesNotMatch(view, /api[_-]?key\s*[:=]/i)
})
