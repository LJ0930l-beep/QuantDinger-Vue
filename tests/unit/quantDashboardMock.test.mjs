import test from 'node:test'
import assert from 'node:assert/strict'
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
