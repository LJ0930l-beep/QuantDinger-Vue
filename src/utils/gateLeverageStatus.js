export const GATE_CRYPTO_SWAP_LEVERAGE_MIN = 50
export const GATE_CRYPTO_SWAP_LEVERAGE_MAX = 100
export const GENERIC_SWAP_LEVERAGE_MIN = 1
export const GENERIC_SWAP_LEVERAGE_MAX = 125

function normalizeExchange (value) {
  return String(value || '').trim().toLowerCase()
}

function normalizeMarketType (value) {
  return String(value || '').trim().toLowerCase()
}

export function normalizeLeverageValue (value) {
  if (value === null || value === undefined || value === '') return null
  const normalized = Number(value)
  return Number.isFinite(normalized) ? normalized : null
}

/**
 * Evaluate the immutable Gate crypto-perpetual leverage contract.
 * Unknown values are invalid; callers must not silently coerce them to a
 * venue default or display a stale saved value as usable.
 */
export function evaluateGateLeverage ({ exchange, marketType, leverageEnabled = true, leverage } = {}) {
  const applicable = normalizeExchange(exchange) === 'gate' && normalizeMarketType(marketType) === 'swap'
  if (!applicable || !leverageEnabled) {
    return Object.freeze({ applicable: false, valid: true, leverage: null, min: null, max: null })
  }
  const normalized = normalizeLeverageValue(leverage)
  const valid = normalized !== null && normalized >= GATE_CRYPTO_SWAP_LEVERAGE_MIN && normalized <= GATE_CRYPTO_SWAP_LEVERAGE_MAX
  return Object.freeze({
    applicable: true,
    valid,
    leverage: normalized,
    min: GATE_CRYPTO_SWAP_LEVERAGE_MIN,
    max: GATE_CRYPTO_SWAP_LEVERAGE_MAX
  })
}

export function isGateLeverageContractValid (input) {
  return evaluateGateLeverage(input).valid
}

/** Return UI bounds without guessing an unverified venue contract. */
export function leverageBoundsForVenue ({ exchange, marketType } = {}) {
  const status = evaluateGateLeverage({ exchange, marketType, leverage: GATE_CRYPTO_SWAP_LEVERAGE_MIN })
  if (status.applicable) {
    return Object.freeze({
      min: GATE_CRYPTO_SWAP_LEVERAGE_MIN,
      max: GATE_CRYPTO_SWAP_LEVERAGE_MAX,
      marks: Object.freeze([50, 75, 100]),
      contract: 'gate-crypto-swap-v1'
    })
  }
  return Object.freeze({
    min: GENERIC_SWAP_LEVERAGE_MIN,
    max: GENERIC_SWAP_LEVERAGE_MAX,
    marks: Object.freeze([1, 25, 50, 100, 125]),
    contract: null
  })
}
