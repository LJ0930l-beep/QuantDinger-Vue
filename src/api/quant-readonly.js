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

/** Read-only, credential- and instrument-scoped Shadow Diff summary. */
export function getReadonlyShadowSummary (scope = {}) {
  return request({
    url: '/api/quant/shadow/summary/readonly',
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

/** Read-only Gate account evidence; the backend provider is injected and may be unavailable. */
export function getReadonlyGateAccount (scope = {}) {
  return request({
    url: '/api/quant/gate/account/readonly',
    method: 'get',
    params: {
      credential_id: scope.credential_id,
      market_type: scope.market_type,
      account_scope: scope.account_scope,
      instrument_id: scope.instrument_id,
      as_of: scope.as_of
    },
    timeout: 8000
  })
}

/** Read-only Spot + Perpetual Gate evidence under one credential scope. */
export function getReadonlyGateUnifiedAccount (scope = {}) {
  return request({
    url: '/api/quant/gate/account/unified/readonly',
    method: 'get',
    params: {
      credential_id: scope.credential_id,
      account_scope: scope.account_scope,
      instrument_id: scope.instrument_id,
      as_of: scope.as_of
    },
    timeout: 16000
  })
}

/**
 * Explicit real Gate TestNet account read. The backend requires
 * QUANT_GATE_TESTNET_ENV_READ_ENABLED=1 and never exposes write capability.
 */
export function getGateTestnetEnvironmentAccount (scope = {}) {
  return request({
    url: '/api/quant/gate/testnet/account',
    method: 'get',
    params: {
      credential_id: scope.credential_id,
      market_type: scope.market_type || 'spot',
      account_scope: scope.account_scope,
      instrument_id: scope.instrument_id
    },
    timeout: 12000
  })
}

/**
 * Explicit Gate TestNet write. The server still requires the operator-side
 * write flag and authenticated credential; the browser never receives a key
 * or secret and cannot select LIVE.
 */
export function submitGateTestnetOrder (payload = {}) {
  return request({
    url: '/api/quant/gate/testnet/order',
    method: 'post',
    data: payload,
    timeout: 20000
  })
}

/** Cancel one Gate TestNet order by a stable venue order id. */
export function cancelGateTestnetOrder (payload = {}) {
  return request({
    url: '/api/quant/gate/testnet/order/cancel',
    method: 'post',
    data: payload,
    timeout: 20000
  })
}

/** Read one TestNet order without enabling any write capability. */
export function getGateTestnetOrder (scope = {}) {
  return request({
    url: '/api/quant/gate/testnet/order',
    method: 'get',
    params: {
      credential_id: scope.credential_id,
      account_scope: scope.account_scope,
      instrument_id: scope.instrument_id,
      market_type: scope.market_type || 'spot',
      exchange_order_id: scope.exchange_order_id
    },
    timeout: 12000
  })
}

/**
 * Explicitly read and settle Gate TestNet fills for an existing order.  The
 * payload contains only credential_id and caller-owned immutable scope facts;
 * API keys/secrets never cross the browser boundary.
 */
export function settleGateTestnetOrderFills (payload = {}) {
  return request({
    url: '/api/quant/gate/testnet/order/settle-fills',
    method: 'post',
    data: payload,
    timeout: 20000
  })
}

/** Explicit public Gate TestNet market evidence; unavailable unless enabled by the API operator. */
export function getReadonlyGateMarket (scope = {}) {
  return request({
    url: '/api/quant/gate/market/readonly',
    method: 'get',
    params: {
      instrument_id: scope.instrument_id,
      market_type: scope.market_type || 'spot',
      interval: scope.interval || '1m',
      candle_limit: scope.candle_limit || 100,
      depth_limit: scope.depth_limit || 20
    },
    timeout: 12000
  })
}

/** Complete fixture-only product rehearsal; never a write-capable path. */
export function getReadonlyProductRehearsal () {
  return request({
    url: '/api/quant/product/rehearsal/readonly',
    method: 'get',
    timeout: 12000
  })
}

/** Deterministic local Gate TestNet order/fill lifecycle; never sends a request to Gate. */
export function getReadonlyGateTestnetExecutionRehearsal (options = {}) {
  return request({
    url: '/api/quant/testnet/execution/rehearsal/readonly',
    method: 'get',
    params: {
      instrument_id: options.instrument_id || 'BTC_USDT',
      market_type: options.market_type || 'perpetual',
      fill_ratio: options.fill_ratio || '1'
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

/** Read one user-scoped, fingerprint-verified persisted report by run id. */
export function getReadonlyPersistedBacktestReport (runId) {
  return request({
    url: '/api/quant/backtest/report/readonly',
    method: 'get',
    params: { run_id: runId },
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

/** Read persisted PAPER order facts without exchange access or writes. */
export function getReadonlyPaperAccount (limit = 200) {
  return request({
    url: '/api/quant/paper/account/readonly',
    method: 'get',
    params: { limit },
    timeout: 8000
  })
}

/** Replay the restart-safe durable PAPER execution tables without writes. */
export function getReadonlyDurablePaperAccount (limit = 200) {
  return request({
    url: '/api/quant/paper/v2/account/readonly',
    method: 'get',
    params: { limit },
    timeout: 8000
  })
}

/** Persist one PAPER order through Canonical Entry + Hard Risk + Outbox. */
export function submitPaperOrder (payload = {}) {
  return request({
    url: '/api/quant/paper/order',
    method: 'post',
    data: { ...payload, mode: 'PAPER' },
    timeout: 20000
  })
}

/** Append an explicit PAPER fill; the backend keeps the fill identity and
 * fee facts durable and never contacts a venue. */
export function appendPaperFill (orderId, payload = {}) {
  return request({
    url: `/api/quant/paper/order/${encodeURIComponent(orderId)}/fill`,
    method: 'post',
    data: payload,
    timeout: 20000
  })
}

/** Record a deterministic PAPER cancellation; this is not a venue cancel. */
export function cancelPaperOrder (orderId, payload = {}) {
  return request({
    url: `/api/quant/paper/order/${encodeURIComponent(orderId)}/cancel`,
    method: 'post',
    data: payload,
    timeout: 20000
  })
}

/** Replay persisted Paper facts against an explicit snapshot checkpoint. */
export function getReadonlyPaperRecovery (options = {}) {
  return request({
    url: '/api/quant/paper/recovery/readonly',
    method: 'get',
    params: {
      limit: options.limit || 200,
      expected_snapshot_fingerprint: options.expected_snapshot_fingerprint
    },
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
