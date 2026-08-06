import test from 'node:test'
import assert from 'node:assert/strict'
import {
  evaluateGateLeverage,
  isGateLeverageContractValid,
  normalizeLeverageValue,
  leverageBoundsForVenue
} from '../../src/utils/gateLeverageStatus.js'

test('Gate crypto perpetual accepts only 50x through 100x', () => {
  assert.equal(isGateLeverageContractValid({ exchange: 'gate', marketType: 'swap', leverage: 50 }), true)
  assert.equal(isGateLeverageContractValid({ exchange: 'gate', marketType: 'swap', leverage: '100' }), true)
  assert.equal(isGateLeverageContractValid({ exchange: 'gate', marketType: 'swap', leverage: 49 }), false)
  assert.equal(isGateLeverageContractValid({ exchange: 'gate', marketType: 'swap', leverage: 101 }), false)
})

test('unknown or malformed Gate leverage fails closed', () => {
  assert.equal(normalizeLeverageValue('not-a-number'), null)
  const status = evaluateGateLeverage({ exchange: 'gate', marketType: 'swap', leverage: 'not-a-number' })
  assert.deepEqual(status, { applicable: true, valid: false, leverage: null, min: 50, max: 100 })
})

test('spot and other venues do not inherit the Gate perpetual contract', () => {
  assert.equal(evaluateGateLeverage({ exchange: 'gate', marketType: 'spot', leverage: 1 }).applicable, false)
  assert.equal(evaluateGateLeverage({ exchange: 'binance', marketType: 'swap', leverage: 5 }).applicable, false)
  assert.equal(isGateLeverageContractValid({ exchange: 'gate', marketType: 'spot', leverage: 1 }), true)
})

test('UI bounds expose the verified Gate contract without changing other venues', () => {
  assert.deepEqual(leverageBoundsForVenue({ exchange: 'gate', marketType: 'swap' }), {
    min: 50,
    max: 100,
    marks: [50, 75, 100],
    contract: 'gate-crypto-swap-v1'
  })
  assert.deepEqual(leverageBoundsForVenue({ exchange: 'gate', marketType: 'spot' }), {
    min: 1,
    max: 125,
    marks: [1, 25, 50, 100, 125],
    contract: null
  })
})
