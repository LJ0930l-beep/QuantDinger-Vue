import test from 'node:test'
import assert from 'node:assert/strict'

import {
  BUILTIN_INDICATOR_CATALOG,
  BUILTIN_STRATEGY_CATALOG,
  strategyDisplay,
  strategyTitle,
  toCommunityIndicator,
  toCommunityStrategy
} from '../../src/constants/quantCatalog.js'

test('built-in strategy catalog is shared by strategy and backtest entry points', () => {
  assert.equal(BUILTIN_STRATEGY_CATALOG.length, 14)
  assert.equal(new Set(BUILTIN_STRATEGY_CATALOG.map(item => item.key)).size, BUILTIN_STRATEGY_CATALOG.length)
  assert.ok(BUILTIN_STRATEGY_CATALOG.every(item => item.name && item.category && item.description))
  assert.ok(BUILTIN_STRATEGY_CATALOG.every(item => Array.isArray(item.timeframes) && item.timeframes.length && Array.isArray(item.instruments) && item.instruments.length))
  assert.equal(strategyDisplay('strategy_v2_double_ma'), '\u53cc\u5747\u7ebf\u4ea4\u53c9')
  assert.match(strategyTitle('strategy_v2_rsi_scalper_5m'), /5\u5206\u949f/)
  assert.match(strategyTitle('strategy_v2_rsi_scalper_5m'), /BTC\/USDT/)
})

test('built-in indicator catalog is non-empty, translated, and community compatible', () => {
  assert.equal(BUILTIN_INDICATOR_CATALOG.length, 14)
  assert.equal(new Set(BUILTIN_INDICATOR_CATALOG.map(item => item.id)).size, BUILTIN_INDICATOR_CATALOG.length)
  assert.ok(BUILTIN_INDICATOR_CATALOG.every(item => item.name && item.shortName && item.description))
  const item = toCommunityIndicator(BUILTIN_INDICATOR_CATALOG[0], 0)
  assert.equal(item.is_builtin, true)
  assert.equal(item.asset_type, 'indicator')
  assert.equal(item.pricing_type, 'free')
  assert.equal(item.id, -1)
  const strategy = toCommunityStrategy(BUILTIN_STRATEGY_CATALOG[0], 0)
  assert.equal(strategy.asset_type, 'script_template')
  assert.equal(strategy.template_key, BUILTIN_STRATEGY_CATALOG[0].key)
  assert.equal(strategy.pricing_type, 'free')
})
