const SAFE_MESSAGES = Object.freeze({
  GATE_TESTNET_AUTH_REJECTED: 'Gate TestNet 凭证鉴权失败，请确认凭证是在 TestNet API Keys 中创建的',
  GATE_TESTNET_PERMISSION_OR_IP_REJECTED: 'Gate TestNet 权限或 IP 白名单被拒绝',
  GATE_TESTNET_NETWORK_UNAVAILABLE: 'Gate TestNet 网络不可达，请检查网络或代理设置',
  GATE_TESTNET_CREDENTIAL_REQUIRED: '请选择已保存的 Gate TestNet 凭证',
  CREDENTIAL_MARKET_SCOPE_MISMATCH: '凭证未覆盖当前选择的市场范围',
  CREDENTIAL_CONNECTION_FAILED: 'Gate TestNet 凭证连接失败',
  GATE_PRIVATE_READ_DISABLED: '后端 Gate TestNet 只读开关尚未启用'
})

function payloadFrom (error) {
  const payload = error && error.response && error.response.data
  return payload && typeof payload === 'object' ? payload : {}
}

function safeMarket (value) {
  const market = String(value || '').trim().toLowerCase()
  return market === 'spot' || market === 'perpetual' ? market : 'unknown'
}

function safeFailureSummary (payload) {
  const data = payload && payload.data && typeof payload.data === 'object' ? payload.data : payload
  if (!data || !Array.isArray(data.failed_markets) || data.failed_markets.length === 0) return ''
  const items = data.failed_markets.slice(0, 2).map((item) => {
    if (!item || typeof item !== 'object') return 'unknown'
    const market = safeMarket(item.market_type)
    const code = /^[A-Z0-9_]{1,64}$/.test(String(item.code || '')) ? String(item.code) : 'FAILED'
    return `${market}: ${code}`
  })
  const suffix = data.failed_markets.length > items.length ? ` 等 ${data.failed_markets.length} 项` : ''
  return `（失败范围：${items.join('、')}${suffix}）`
}

/**
 * Convert a backend Gate read failure into a safe, actionable message.
 * Only allow-listed error codes and market labels are exposed; raw provider
 * messages are deliberately ignored so credentials and payloads cannot leak.
 */
export function formatGateReadonlyError (error) {
  const payload = payloadFrom(error)
  const code = typeof payload.msg === 'string'
    ? payload.msg
    : typeof payload.code === 'string' ? payload.code : ''
  const status = error && error.response && Number(error.response.status)
  const fallback = status === 401 || status === 403
    ? '当前登录或账户权限不足，无法读取 Gate TestNet 账户'
    : status === 503
      ? 'Gate TestNet 只读服务暂不可用，请稍后重试'
      : '读取 Gate TestNet 账户失败，请检查后端只读开关、登录状态和账户范围'
  const message = SAFE_MESSAGES[code] || fallback
  return `${message}${safeFailureSummary(payload)}`
}

export const __test__ = Object.freeze({ payloadFrom, safeFailureSummary })
