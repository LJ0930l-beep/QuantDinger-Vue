import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeStrategySourceSelection } from '../../src/utils/strategySourceSelection.js'

test('uses the v-model source id when a selector emits an event object', () => {
  assert.equal(normalizeStrategySourceSelection({ type: 'change' }, 'template:strategy_v2_rsi_scalper_5m'), 'template:strategy_v2_rsi_scalper_5m')
})

test('rejects serialized event placeholders and keeps canonical ids', () => {
  assert.equal(normalizeStrategySourceSelection('template:[object PointerEvent]', 'template:valid'), '')
  assert.equal(normalizeStrategySourceSelection('[object Object]', 'template:valid'), '')
  assert.equal(normalizeStrategySourceSelection('template:strategy_v2_breakout_15m', 'template:ignored'), 'template:strategy_v2_breakout_15m')
})

