export const quantDashboardMock = Object.freeze({
  label: 'MOCK • PAPER • SHADOW',
  status: Object.freeze({
    environment: 'PAPER',
    liveTrading: 'OFF',
    reconciliationHealth: 'HEALTHY',
    marketDataHealth: 'CURRENT',
    accountFactsVerified: 'VERIFIED',
    lastUpdated: '2026-07-29 16:30:00 UTC+08',
    source: 'Static prototype data only'
  }),
  account: Object.freeze([
    Object.freeze({ label: 'Total Equity', value: '125,840.26 USDT', detail: 'PAPER ledger', tone: 'neutral' }),
    Object.freeze({ label: 'Available Margin', value: '94,112.44 USDT', detail: '74.78% available', tone: 'healthy' }),
    Object.freeze({ label: 'Gross Exposure', value: '31,727.82 USDT', detail: '3 instruments', tone: 'neutral' }),
    Object.freeze({ label: 'Net Exposure', value: '12,488.18 USDT', detail: 'Long biased', tone: 'shadow' }),
    Object.freeze({ label: 'Daily PnL', value: '+1,284.36 USDT', detail: '+1.03%', tone: 'healthy' }),
    Object.freeze({ label: 'Drawdown', value: '2.18%', detail: 'Limit 8.00%', tone: 'warning' }),
    Object.freeze({ label: 'Active Reservations', value: '2', detail: '4,200.00 USDT reserved', tone: 'risk' })
  ]),
  positions: Object.freeze([
    Object.freeze({ symbol: 'BTC/USDT', side: 'LONG', quantity: '0.18400000 BTC', entry: '67,420.50', mark: '68,112.40', pnl: '+127.31 USDT', leverage: '2.0×', risk: 'WITHIN BUDGET', protection: 'STOP ARMED' }),
    Object.freeze({ symbol: 'ETH/USDT', side: 'LONG', quantity: '3.25000000 ETH', entry: '3,482.10', mark: '3,510.60', pnl: '+92.63 USDT', leverage: '1.5×', risk: 'WITHIN BUDGET', protection: 'TP + STOP' }),
    Object.freeze({ symbol: 'SOL/USDT', side: 'SHORT', quantity: '24.00000000 SOL', entry: '152.80', mark: '151.42', pnl: '+33.12 USDT', leverage: '1.0×', risk: 'REDUCE ONLY', protection: 'STOP ARMED' })
  ]),
  strategies: Object.freeze([
    Object.freeze({ name: 'SMC Structure', mode: 'SHADOW', status: 'OBSERVING', signal: 'Bullish BOS', confidence: '78%', exposure: '8,200.00 USDT', budget: '12,000.00 USDT', kill: 'CLEAR', accent: 'purple' }),
    Object.freeze({ name: 'ICT Liquidity Sweep', mode: 'PAPER', status: 'ACTIVE', signal: 'Sell-side sweep', confidence: '71%', exposure: '5,480.00 USDT', budget: '9,000.00 USDT', kill: 'CLEAR', accent: 'cyan' }),
    Object.freeze({ name: 'Trend Following', mode: 'PAPER', status: 'ACTIVE', signal: 'Trend intact', confidence: '64%', exposure: '10,920.00 USDT', budget: '15,000.00 USDT', kill: 'CLEAR', accent: 'green' }),
    Object.freeze({ name: 'Mean Reversion', mode: 'DISABLED', status: 'PAUSED', signal: 'No admission', confidence: '—', exposure: '0.00 USDT', budget: '6,000.00 USDT', kill: 'LOCKED', accent: 'orange' })
  ]),
  signals: Object.freeze([
    Object.freeze({ time: '16:29:48', symbol: 'BTC/USDT', action: 'OPEN', source: 'STRATEGY', fingerprint: '7c82…96d1', effect: 'INCREASE_RISK', admission: 'CREATED', decision: 'ALLOW', reason: 'Structure break confirmed' }),
    Object.freeze({ time: '16:26:11', symbol: 'ETH/USDT', action: 'PROTECTION', source: 'PROTECTION', fingerprint: '21fa…63bc', effect: 'REDUCE_RISK', admission: 'REPLAYED', decision: 'ALLOW', reason: 'Stop tightened after mark move' }),
    Object.freeze({ time: '16:22:04', symbol: 'SOL/USDT', action: 'CLOSE', source: 'HUMAN', fingerprint: 'c1a9…5e80', effect: 'REDUCE_RISK', admission: 'CREATED', decision: 'ALLOW', reason: 'Reduce concentration' }),
    Object.freeze({ time: '16:18:32', symbol: 'BTC/USDT', action: 'OPEN', source: 'AGENT', fingerprint: '9ed0…11ac', effect: 'INCREASE_RISK', admission: 'RISK_REJECTED', decision: 'DENY', reason: 'Daily loss buffer protected' }),
    Object.freeze({ time: '16:12:09', symbol: 'ETH/USDT', action: 'CANCEL', source: 'HUMAN', fingerprint: 'a480…f702', effect: 'NEUTRAL', admission: 'CREATED', decision: '—', reason: 'Mock client order superseded' })
  ]),
  pipeline: Object.freeze([
    Object.freeze({ id: 'canonical', label: 'Canonical Entry V2', sublabel: 'Typed request', status: 'CREATED', tone: 'cyan' }),
    Object.freeze({ id: 'entry', label: 'Durable Entry', sublabel: 'Immutable graph', status: 'PERSISTED', tone: 'cyan' }),
    Object.freeze({ id: 'risk', label: 'Durable Hard Risk V2', sublabel: 'ALLOW', status: 'ALLOWED', tone: 'green' }),
    Object.freeze({ id: 'reservation', label: 'Reservation', sublabel: 'OPEN only', status: 'CREATED', tone: 'orange' }),
    Object.freeze({ id: 'outbox', label: 'Transactional Outbox', sublabel: 'Atomic event', status: 'PERSISTED', tone: 'purple' }),
    Object.freeze({ id: 'event', label: 'Typed Admission Event', sublabel: 'Parse ready', status: 'VERIFIED', tone: 'green' })
  ]),
  risk: Object.freeze([
    Object.freeze({ label: 'Global Kill Switch', value: 'CLEAR', detail: 'No global block', tone: 'healthy' }),
    Object.freeze({ label: 'Account Kill Switch', value: 'CLEAR', detail: 'Account scope healthy', tone: 'healthy' }),
    Object.freeze({ label: 'Strategy Kill Switch', value: '1 LOCKED', detail: 'Mean Reversion disabled', tone: 'warning' }),
    Object.freeze({ label: 'Margin Usage', value: '25.22%', detail: 'Limit 55.00%', tone: 'neutral' }),
    Object.freeze({ label: 'Daily Loss Limit', value: '1.03% used', detail: 'Limit 3.00%', tone: 'neutral' }),
    Object.freeze({ label: 'Drawdown Limit', value: '2.18% used', detail: 'Limit 8.00%', tone: 'neutral' }),
    Object.freeze({ label: 'Instrument Exposure', value: 'BTC 10.02%', detail: 'Limit 18.00%', tone: 'neutral' }),
    Object.freeze({ label: 'Reconciliation', value: 'HEALTHY', detail: 'New risk permitted', tone: 'healthy' })
  ]),
  shadow: Object.freeze({
    candidate: 'projection-v3 / generation 18',
    legacy: 'legacy-ledger / checkpoint 4,218',
    differences: '2 non-blocking',
    match: 'WITHIN TOLERANCE',
    tolerance: 'shadow-tolerance-v1',
    comparison: '2026-07-29 16:29:40 UTC+08'
  }),
  reconciliation: Object.freeze({
    lastRun: '2026-07-29 16:28:00 UTC+08',
    checkpoint: 'HEALTHY',
    discrepancies: '0 blocking / 2 informational',
    watermark: 'outbox: 4,218',
    derivedHealth: 'HEALTHY',
    nextCheck: '2026-07-29 16:33:00 UTC+08'
  }),
  timeline: Object.freeze([
    Object.freeze({ time: '16:29:49', type: 'ENTRY_ADMITTED', text: 'BTC/USDT OPEN admitted in PAPER', tone: 'cyan' }),
    Object.freeze({ time: '16:29:49', type: 'RESERVATION_CREATED', text: '4,200.00 USDT capacity reserved', tone: 'orange' }),
    Object.freeze({ time: '16:29:49', type: 'OUTBOX_CREATED', text: 'DURABLE_ENTRY_ADMITTED payload verified', tone: 'purple' }),
    Object.freeze({ time: '16:26:11', type: 'RECOVERY_COMPLETED', text: 'ETH protection replay normalized', tone: 'green' }),
    Object.freeze({ time: '16:22:04', type: 'CANCEL_ADMITTED', text: 'Mock client order cancel recorded', tone: 'cyan' }),
    Object.freeze({ time: '16:18:32', type: 'RISK_DENIED', text: 'Increase risk blocked by daily loss buffer', tone: 'risk' }),
    Object.freeze({ time: '16:15:00', type: 'RECONCILIATION_HEALTHY', text: 'Checkpoint and derived health aligned', tone: 'green' })
  ])
})
