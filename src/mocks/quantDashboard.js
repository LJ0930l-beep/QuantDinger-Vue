export const quantDashboardMock = Object.freeze({
  label: '模拟数据 · 模拟盘 · 影子模式',
  status: Object.freeze({
    environment: 'PAPER',
    liveTrading: 'OFF',
    reconciliationHealth: 'HEALTHY',
    marketDataHealth: 'CURRENT',
    accountFactsVerified: 'VERIFIED',
    lastUpdated: '2026-07-29 16:30:00 UTC+08',
    source: '仅静态原型数据'
  }),
  environmentGate: Object.freeze({
    current: 'PAPER',
    liveTrading: 'OFF',
    testnet: Object.freeze({
      status: 'READY_READ_ONLY',
      label: 'Gate TestNet',
      writes: 'EXPLICIT_OPT_IN',
      note: '需要服务端闸门与 TestNet 凭证；页面不会自动下单'
    }),
    canary: Object.freeze({
      status: 'LOCKED',
      label: 'Canary',
      writes: 'DISABLED',
      note: '需要独立审批、回滚闸门和健康对账'
    }),
    live: Object.freeze({
      status: 'OFF',
      label: 'Live',
      writes: 'DISABLED',
      note: '当前项目安全策略保持关闭，不接受前端绕过'
    })
  }),
  account: Object.freeze([
    Object.freeze({ label: '账户总权益', value: '125,840.26 USDT', detail: '模拟账本', tone: 'neutral' }),
    Object.freeze({ label: '可用保证金', value: '94,112.44 USDT', detail: '74.78% 可用', tone: 'healthy' }),
    Object.freeze({ label: '总敞口', value: '31,727.82 USDT', detail: '3 个标的', tone: 'neutral' }),
    Object.freeze({ label: '净敞口', value: '12,488.18 USDT', detail: '偏多', tone: 'shadow' }),
    Object.freeze({ label: '当日盈亏', value: '+1,284.36 USDT', detail: '+1.03%', tone: 'healthy' }),
    Object.freeze({ label: '回撤', value: '2.18%', detail: '上限 8.00%', tone: 'warning' }),
    Object.freeze({ label: '活动预留', value: '2', detail: '已预留 4,200.00 USDT', tone: 'risk' })
  ]),
  equityChart: Object.freeze({
    labels: Object.freeze(['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']),
    equity: Object.freeze(['124,210.00', '124,480.00', '124,335.00', '124,690.00', '124,880.00', '125,150.00', '125,520.00', '125,840.26']),
    dailyPnl: Object.freeze(['120.00', '390.00', '245.00', '600.00', '790.00', '1,060.00', '1,180.00', '1,284.36'])
  }),
  positions: Object.freeze([
    Object.freeze({ symbol: 'BTC/USDT', side: 'LONG', quantity: '0.18400000 BTC', entry: '67,420.50', mark: '68,112.40', pnl: '+127.31 USDT', leverage: '2.0x', risk: '预算范围内', protection: '止损已启用' }),
    Object.freeze({ symbol: 'ETH/USDT', side: 'LONG', quantity: '3.25000000 ETH', entry: '3,482.10', mark: '3,510.60', pnl: '+92.63 USDT', leverage: '1.5x', risk: '预算范围内', protection: '止盈 + 止损' }),
    Object.freeze({ symbol: 'SOL/USDT', side: 'SHORT', quantity: '24.00000000 SOL', entry: '152.80', mark: '151.42', pnl: '+33.12 USDT', leverage: '1.0x', risk: '仅可减仓', protection: '止损已启用' })
  ]),
  strategies: Object.freeze([
    Object.freeze({ name: 'SMC 结构策略', mode: 'SHADOW', status: '观察中', signal: '看涨结构突破', confidence: '78%', exposure: '8,200.00 USDT', budget: '12,000.00 USDT', kill: '正常', accent: 'purple' }),
    Object.freeze({ name: 'ICT 流动性扫描', mode: 'PAPER', status: '运行中', signal: '卖方流动性扫单', confidence: '71%', exposure: '5,480.00 USDT', budget: '9,000.00 USDT', kill: '正常', accent: 'cyan' }),
    Object.freeze({ name: 'EMA + ADX 趋势', mode: 'SHADOW', status: '内置研究目录', signal: '等待研究信号', confidence: '-', exposure: '0.00 USDT', budget: '未分配', kill: '安全闸门', accent: 'cyan' }),
    Object.freeze({ name: 'Donchian + ATR', mode: 'SHADOW', status: '内置研究目录', signal: '等待研究信号', confidence: '-', exposure: '0.00 USDT', budget: '未分配', kill: '安全闸门', accent: 'green' }),
    Object.freeze({ name: '布林带 + RSI', mode: 'SHADOW', status: '内置研究目录', signal: '等待研究信号', confidence: '-', exposure: '0.00 USDT', budget: '未分配', kill: '安全闸门', accent: 'purple' }),
    Object.freeze({ name: 'Dual Thrust Breakout', mode: 'SHADOW', status: '内置研究目录', signal: '等待研究信号', confidence: '-', exposure: '0.00 USDT', budget: '未分配', kill: '安全闸门', accent: 'green' }),
    Object.freeze({ name: 'Buy & Hold', mode: 'SHADOW', status: '内置研究目录', signal: '等待研究信号', confidence: '-', exposure: '0.00 USDT', budget: '未分配', kill: '安全闸门', accent: 'cyan' })
  ]),
  signals: Object.freeze([
    Object.freeze({ time: '16:29:48', symbol: 'BTC/USDT', action: 'OPEN', source: 'STRATEGY', fingerprint: '7c82...96d1', effect: 'INCREASE_RISK', admission: 'CREATED', decision: 'ALLOW', reason: '结构突破已确认' }),
    Object.freeze({ time: '16:26:11', symbol: 'ETH/USDT', action: 'PROTECTION', source: 'PROTECTION', fingerprint: '21fa...63bc', effect: 'REDUCE_RISK', admission: 'REPLAYED', decision: 'ALLOW', reason: '标记价格变化后收紧止损' }),
    Object.freeze({ time: '16:22:04', symbol: 'SOL/USDT', action: 'CLOSE', source: 'HUMAN', fingerprint: 'c1a9...5e80', effect: 'REDUCE_RISK', admission: 'CREATED', decision: 'ALLOW', reason: '降低集中度' }),
    Object.freeze({ time: '16:18:32', symbol: 'BTC/USDT', action: 'OPEN', source: 'AGENT', fingerprint: '9ed0...11ac', effect: 'INCREASE_RISK', admission: 'RISK_REJECTED', decision: 'DENY', reason: '当日亏损缓冲保护' }),
    Object.freeze({ time: '16:12:09', symbol: 'ETH/USDT', action: 'CANCEL', source: 'HUMAN', fingerprint: 'a480...f702', effect: 'NEUTRAL', admission: 'CREATED', decision: '-', reason: '模拟客户端订单已替换' })
  ]),
  pipeline: Object.freeze([
    Object.freeze({ id: 'canonical', label: '规范化准入 V2', sublabel: '类型化请求', status: '已创建', tone: 'cyan' }),
    Object.freeze({ id: 'entry', label: '持久化准入', sublabel: '不可变图谱', status: '已持久化', tone: 'cyan' }),
    Object.freeze({ id: 'risk', label: '持久化硬风控 V2', sublabel: '已允许', status: '已通过', tone: 'green' }),
    Object.freeze({ id: 'reservation', label: '风险预留', sublabel: '仅开仓动作', status: '已创建', tone: 'orange' }),
    Object.freeze({ id: 'outbox', label: '事务性 Outbox', sublabel: '原子事件', status: '已持久化', tone: 'purple' }),
    Object.freeze({ id: 'event', label: '类型化准入事件', sublabel: '可解析', status: '已验证', tone: 'green' })
  ]),
  risk: Object.freeze([
    Object.freeze({ label: '全局熔断开关', value: '正常', detail: '无全局阻断', tone: 'healthy' }),
    Object.freeze({ label: '账户熔断开关', value: '正常', detail: '账户范围健康', tone: 'healthy' }),
    Object.freeze({ label: '策略熔断开关', value: '1 个已锁定', detail: '均值回归已禁用', tone: 'warning' }),
    Object.freeze({ label: '保证金使用率', value: '25.22%', detail: '上限 55.00%', tone: 'neutral' }),
    Object.freeze({ label: '当日亏损上限', value: '已使用 1.03%', detail: '上限 3.00%', tone: 'neutral' }),
    Object.freeze({ label: '回撤上限', value: '已使用 2.18%', detail: '上限 8.00%', tone: 'neutral' }),
    Object.freeze({ label: '标的敞口', value: 'BTC 10.02%', detail: '上限 18.00%', tone: 'neutral' }),
    Object.freeze({ label: '对账状态', value: '健康', detail: '允许新增风险', tone: 'healthy' })
  ]),
  shadow: Object.freeze({ candidate: '候选投影 v3 / 第 18 代', legacy: '旧账本 / 检查点 4,218', differences: '2 项非阻断差异', match: '误差范围内', tolerance: 'shadow-tolerance-v1', comparison: '2026-07-29 16:29:40 UTC+08' }),
  reconciliation: Object.freeze({ lastRun: '2026-07-29 16:28:00 UTC+08', checkpoint: '健康', discrepancies: '0 项阻断 / 2 项提示', watermark: 'outbox: 4,218', derivedHealth: '健康', nextCheck: '2026-07-29 16:33:00 UTC+08' }),
  timeline: Object.freeze([
    Object.freeze({ time: '16:29:49', type: 'ENTRY_ADMITTED', text: 'BTC/USDT 开仓请求已在模拟盘模式准入', tone: 'cyan' }),
    Object.freeze({ time: '16:29:49', type: 'RESERVATION_CREATED', text: '已预留 4,200.00 USDT 风险容量', tone: 'orange' }),
    Object.freeze({ time: '16:29:49', type: 'OUTBOX_CREATED', text: 'DURABLE_ENTRY_ADMITTED 载荷已验证', tone: 'purple' }),
    Object.freeze({ time: '16:26:11', type: 'RECOVERY_COMPLETED', text: 'ETH 保护单重放已规范化', tone: 'green' }),
    Object.freeze({ time: '16:22:04', type: 'CANCEL_ADMITTED', text: '模拟客户端撤单已记录', tone: 'cyan' }),
    Object.freeze({ time: '16:18:32', type: 'RISK_DENIED', text: '当日亏损缓冲阻止新增风险', tone: 'risk' }),
    Object.freeze({ time: '16:15:00', type: 'RECONCILIATION_HEALTHY', text: '检查点与派生健康状态一致', tone: 'green' })
  ])
})
