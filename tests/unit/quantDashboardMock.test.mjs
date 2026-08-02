import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { quantDashboardMock } from '../../src/mocks/quantDashboard.js'

test('quant dashboard mock is visibly non-live and complete enough for the read-only prototype', () => {
  assert.equal(quantDashboardMock.status.liveTrading, 'OFF')
  assert.equal(quantDashboardMock.environmentGate.live.status, 'OFF')
  assert.equal(quantDashboardMock.environmentGate.live.writes, 'DISABLED')
  assert.equal(quantDashboardMock.environmentGate.testnet.status, 'READY_READ_ONLY')
  assert.ok(['PAPER', 'SHADOW'].includes(quantDashboardMock.status.environment))
  assert.equal(quantDashboardMock.label.includes('模拟数据'), true)
  assert.equal(quantDashboardMock.positions.length > 0, true)
  assert.equal(quantDashboardMock.strategies.length, 4)
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
  assert.match(view, /getGateTestnetEnvironmentAccount/)
  assert.match(view, /gateAccountForm\.account_scope/)
  assert.match(view, /凭证仅在后端环境中读取/)
  assert.doesNotMatch(view, /GATE_TESTNET_API_SECRET\s*=/)
  assert.doesNotMatch(view, /GATE_TESTNET_API_KEY\s*=/)
})
