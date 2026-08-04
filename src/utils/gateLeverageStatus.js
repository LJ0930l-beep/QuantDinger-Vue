export const GATE_CRYPTO_SWAP_LEVERAGE_MIN = 50
export const GATE_CRYPTO_SWAP_LEVERAGE_MAX = 100

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
