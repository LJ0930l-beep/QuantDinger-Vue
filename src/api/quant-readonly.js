import request from '@/utils/request'

/**
 * Read-only projection/shadow/reconciliation view.  The backend may return
 * 503 until a validated provider is wired; callers must keep the local mock
 * view in that case and must never fall back to a write-capable endpoint.
 */
export function getReadonlyQuantState () {
  return request({
    url: '/api/quant/readonly',
    method: 'get',
    timeout: 8000
  })
}

/** Persisted projection generation facts; this is narrower than the G4-B view. */
export function getReadonlyProjectionGeneration (consumer = 'candidate') {
  return request({
    url: '/api/quant/projection/generation/readonly',
    method: 'get',
    params: { consumer },
    timeout: 8000
  })
}

/**
 * Read-only, credential- and instrument-scoped reconciliation checkpoint.
 * The dashboard only calls this when the route already provides a complete
 * scope; it never invents identifiers or falls back to a write-capable API.
 */
export function getReadonlyReconciliationCheckpoint (scope = {}) {
  return request({
    url: '/api/quant/reconciliation/checkpoint/readonly',
    method: 'get',
    params: {
      credential_id: scope.credential_id,
      exchange: scope.exchange,
      market_type: scope.market_type,
      account_scope: scope.account_scope,
      instrument_id: scope.instrument_id,
      as_of: scope.as_of
    },
    timeout: 8000
  })
}

/**
 * Read-only deterministic backtest result.  A missing provider is expected
 * to return 503; the dashboard must retain its explicit mock fallback and
 * never call a write-capable backtest endpoint from this helper.
 */
export function getReadonlyBacktestResult () {
  return request({
    url: '/api/quant/backtest/readonly',
    method: 'get',
    timeout: 8000
  })
}

/** Read-only Paper/Shadow run summary; never a write or execution call. */
export function getReadonlyPaperShadowResult () {
  return request({
    url: '/api/quant/paper-shadow/readonly',
    method: 'get',
    timeout: 8000
  })
}

/** Gate-first non-live research readiness; this endpoint is read-only. */
export function getResearchReadiness () {
  return request({
    url: '/api/quant/readiness',
    method: 'get',
    timeout: 8000
  })
}

/** Read-only Strategy Factory catalog; it cannot create or execute a strategy. */
export function getReadonlyStrategyCatalog () {
  return request({
    url: '/api/quant/strategies/readonly',
    method: 'get',
    timeout: 8000
  })
}

/** Read-only end-to-end Gate research result; no trade side effects. */
export function getReadonlyResearchRun () {
  return request({
    url: '/api/quant/research/readonly',
    method: 'get',
    timeout: 8000
  })
}

/** Read-only release gate evidence; never changes deployment state. */
export function getReadonlyReleaseReadiness () {
  return request({
    url: '/api/quant/release-readiness/readonly',
    method: 'get',
    timeout: 8000
  })
}

/** Read-only Gate TestNet rehearsal evidence; it cannot submit orders. */
export function getReadonlyTestnetRehearsal () {
  return request({
    url: '/api/quant/testnet/rehearsal/readonly',
    method: 'get',
    timeout: 8000
  })
}

/** Composed non-live research/release posture; read-only and fail-closed. */
export function getReadonlyQuantOperations () {
  return request({
    url: '/api/quant/operations/readonly',
    method: 'get',
    timeout: 8000
  })
}

/** Read-only deterministic manifest for the latest non-live rehearsal. */
export function getReadonlyNonLiveRunManifest () {
  return request({
    url: '/api/quant/research-run/manifest/readonly',
    method: 'get',
    timeout: 8000
  })
}

/** Read-only artifact and rollback readiness; no deployment side effects. */
export function getReadonlyDeploymentReadiness () {
  return request({
    url: '/api/quant/deployment/readiness/readonly',
    method: 'get',
    timeout: 8000
  })
}
