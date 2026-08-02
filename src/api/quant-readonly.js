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
