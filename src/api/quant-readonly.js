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
