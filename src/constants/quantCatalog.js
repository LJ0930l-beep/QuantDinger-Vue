// Shared product catalog metadata. Executable code and schemas remain server-owned.
export const BUILTIN_STRATEGY_CATALOG = Object.freeze([
  { key: 'strategy_v2_single_ma', name: '\u5355\u5747\u7ebf\u8d8b\u52bf', category: '\u8d8b\u52bf\u8ddf\u968f', market: '\u7f8e\u80a1', description: '\u5355\u5747\u7ebf\u8bc6\u522b\u4e2d\u671f\u8d8b\u52bf', timeframes: ['1d'], instruments: ['SPY'] },
  { key: 'strategy_v2_double_ma', name: '\u53cc\u5747\u7ebf\u4ea4\u53c9', category: '\u8d8b\u52bf\u8ddf\u968f', market: '\u52a0\u5bc6\u8d27\u5e01', description: '\u5feb\u6162\u5747\u7ebf\u4ea4\u53c9\u786e\u8ba4\u65b9\u5411', timeframes: ['4h'], instruments: ['BTC/USDT', 'ETH/USDT'], marketType: 'swap' },
  { key: 'strategy_v2_bullish_three_lines', name: '\u4e09\u5747\u7ebf\u591a\u5934\u6392\u5217', category: '\u8d8b\u52bf\u8ddf\u968f', market: '\u7f8e\u80a1', description: '\u591a\u5934\u6392\u5217\u8fc7\u6ee4\u8d8b\u52bf', timeframes: ['1d'], instruments: ['600519.SH'] },
  { key: 'strategy_v2_bullish_three_lines_trend', name: '\u4e09\u5747\u7ebf\u8d8b\u52bf\u8fc7\u6ee4', category: '\u8d8b\u52bf\u8ddf\u968f', market: '\u7f8e\u80a1', description: '\u5747\u7ebf\u4fe1\u53f7\u53e0\u52a0\u65b9\u5411\u8fc7\u6ee4', timeframes: ['1d'], instruments: ['600519.SH'] },
  { key: 'strategy_v2_turtle', name: '\u6d77\u9f9f\u7a81\u7834', category: '\u7a81\u7834\u4ea4\u6613', market: '\u7f8e\u80a1', description: '\u901a\u9053\u7a81\u7834\u4e0e\u6ce2\u52a8\u7387\u7ba1\u7406', timeframes: ['1d'], instruments: ['SPY', 'QQQ'] },
  { key: 'strategy_v2_indicator_resonance', name: '\u6307\u6807\u5171\u632f', category: '\u591a\u6307\u6807', market: '\u7f8e\u80a1', description: '\u591a\u4e2a\u6280\u672f\u6307\u6807\u5171\u540c\u786e\u8ba4', timeframes: ['1d'], instruments: ['QQQ'] },
  { key: 'strategy_v2_macd_kdj', name: 'MACD + KDJ \u52a8\u91cf\u7b56\u7565', category: '\u52a8\u91cf\u53cd\u8f6c', market: '\u52a0\u5bc6\u8d27\u5e01', description: 'MACD \u52a8\u91cf\u4e0e KDJ \u4ea4\u53c9', timeframes: ['4h'], instruments: ['BTC/USDT', 'ETH/USDT'], marketType: 'swap' },
  { key: 'strategy_v2_supertrend', name: '\u8d85\u7ea7\u8d8b\u52bf', category: '\u8d8b\u52bf\u8ddf\u968f', market: '\u7f8e\u80a1', description: 'ATR \u6ce2\u52a8\u5e26\u8ddf\u968f\u8d8b\u52bf', timeframes: ['1d'], instruments: ['SPY'] },
  { key: 'strategy_v2_rsi_scalper_5m', name: 'RSI 5\u5206\u949f\u77ed\u7ebf', category: '\u77ed\u7ebf\u52a8\u91cf', market: '\u52a0\u5bc6\u8d27\u5e01', description: '\u7528 RSI \u8d85\u4e70\u8d85\u5356\u8fc7\u6ee4\u77ed\u5468\u671f\u52a8\u91cf', timeframes: ['5m'], instruments: ['BTC/USDT'], marketType: 'swap', leverageCap: 5 },
  { key: 'strategy_v2_breakout_15m', name: 'Donchian 15\u5206\u949f\u7a81\u7834', category: '\u77ed\u7ebf\u7a81\u7834', market: '\u52a0\u5bc6\u8d27\u5e01', description: '\u901a\u9053\u7a81\u7834\u4e0e ATR \u6ce2\u52a8\u7ba1\u7406\u77ed\u7ebf\u8fdb\u51fa', timeframes: ['15m'], instruments: ['ETH/USDT'], marketType: 'swap', leverageCap: 5 },
  { key: 'strategy_v2_market_cap_barbell', name: '\u5e02\u503c\u6760\u94c3', category: '\u7ec4\u5408\u7b56\u7565', market: '\u7f8e\u80a1', description: '\u5927\u76d8\u4e0e\u6210\u957f\u98ce\u683c\u914d\u7f6e', timeframes: ['1d'], instruments: ['SPY', 'QQQ'] },
  { key: 'strategy_v2_momentum_top_n', name: '\u52a8\u91cf Top N', category: '\u6a2a\u622a\u9762\u52a8\u91cf', market: '\u7f8e\u80a1', description: '\u6309\u6eda\u52a8\u52a8\u91cf\u6392\u540d\u9009\u62e9', timeframes: ['1d'], instruments: ['SPY', 'QQQ'] },
  { key: 'strategy_v2_low_volatility', name: '\u4f4e\u6ce2\u52a8\u7ec4\u5408', category: '\u7ec4\u5408\u7b56\u7565', market: '\u7f8e\u80a1', description: '\u4f18\u5148\u9009\u62e9\u6ce2\u52a8\u8f83\u4f4e\u7684\u6807\u7684', timeframes: ['1d'], instruments: ['SPY', 'QQQ'] },
  { key: 'strategy_v2_quality_growth', name: '\u8d28\u91cf\u6210\u957f', category: '\u57fa\u672c\u9762\u7ec4\u5408', market: '\u7f8e\u80a1', description: '\u8d28\u91cf\u4e0e\u6210\u957f\u56e0\u5b50\u7814\u7a76\u7ec4\u5408', timeframes: ['1d'], instruments: ['SPY', 'QQQ'] }
])

export const BUILTIN_INDICATOR_CATALOG = Object.freeze([
  { id: 'sma', name: '\u7b80\u5355\u79fb\u52a8\u5e73\u5747\u7ebf', shortName: 'SMA', type: 'line', description: '\u6536\u76d8\u4ef7\u7b97\u672f\u5e73\u5747' },
  { id: 'ema', name: '\u6307\u6570\u79fb\u52a8\u5e73\u5747\u7ebf', shortName: 'EMA', type: 'line', description: '\u8fd1\u671f\u4ef7\u683c\u6743\u91cd\u66f4\u9ad8\u7684\u8d8b\u52bf\u5747\u7ebf' },
  { id: 'rsi', name: '\u76f8\u5bf9\u5f3a\u5f31\u6307\u6807', shortName: 'RSI', type: 'line', description: '\u8861\u91cf\u4e0a\u6da8\u4e0e\u4e0b\u8dcc\u52a8\u80fd' },
  { id: 'macd', name: '\u6307\u6570\u5e73\u6ed1\u5f02\u540c\u79fb\u52a8\u5e73\u5747\u7ebf', shortName: 'MACD', type: 'macd', description: '\u89c2\u5bdf\u52a8\u91cf\u53d8\u5316' },
  { id: 'bb', name: '\u5e03\u6797\u5e26', shortName: 'BB', type: 'band', description: '\u5747\u7ebf\u4e0e\u6807\u51c6\u5dee\u4ef7\u683c\u901a\u9053' },
  { id: 'atr', name: '\u771f\u5b9e\u6ce2\u52a8\u5e45\u5ea6\u5747\u503c', shortName: 'ATR', type: 'line', description: '\u8861\u91cf\u5e02\u573a\u6ce2\u52a8\u8303\u56f4' },
  { id: 'cci', name: '\u5546\u54c1\u901a\u9053\u6307\u6570', shortName: 'CCI', type: 'line', description: '\u89c2\u5bdf\u4ef7\u683c\u504f\u79bb\u5747\u503c\u7684\u7a0b\u5ea6' },
  { id: 'williams', name: '\u5a01\u5ec9\u59c6\u65af %R', shortName: 'W%R', type: 'line', description: '\u5b9a\u4f4d\u6536\u76d8\u4ef7\u5728\u8fd1\u671f\u9ad8\u4f4e\u533a\u95f4\u7684\u4f4d\u7f6e' },
  { id: 'mfi', name: '\u8d44\u91d1\u6d41\u91cf\u6307\u6807', shortName: 'MFI', type: 'line', description: '\u7ed3\u5408\u4ef7\u683c\u4e0e\u6210\u4ea4\u91cf\u8bc4\u4f30\u8d44\u91d1\u6d41\u5411' },
  { id: 'adx', name: '\u5e73\u5747\u8d8b\u5411\u6307\u6570', shortName: 'ADX', type: 'adx', description: '\u8861\u91cf\u8d8b\u52bf\u5f3a\u5ea6' },
  { id: 'obv', name: '\u80fd\u91cf\u6f6e', shortName: 'OBV', type: 'line', description: '\u7528\u6210\u4ea4\u91cf\u7d2f\u79ef\u89c2\u5bdf\u91cf\u4ef7\u540c\u6b65' },
  { id: 'adosc', name: '\u7d2f\u79ef\u6d3e\u53d1\u9707\u8361\u6307\u6807', shortName: 'ADOSC', type: 'line', description: '\u6bd4\u8f83\u8d44\u91d1\u6d41\u91cf\u5feb\u6162\u7ebf' },
  { id: 'ad', name: '\u7d2f\u79ef\u6d3e\u53d1\u7ebf', shortName: 'A/D', type: 'line', description: '\u6309\u6536\u76d8\u4f4d\u7f6e\u548c\u6210\u4ea4\u91cf\u7d2f\u79ef\u8d44\u91d1\u6d41\u5411' },
  { id: 'kdj', name: 'KDJ \u968f\u673a\u6307\u6807', shortName: 'KDJ', type: 'line', description: '\u4ee5 K/D/J \u7ebf\u89c2\u5bdf\u77ed\u5468\u671f\u62d0\u70b9' }
])

const STRATEGY_BY_KEY = new Map(BUILTIN_STRATEGY_CATALOG.map(item => [item.key, item]))

const TIMEFRAME_LABELS = {
  '1m': '1\u5206\u949f',
  '3m': '3\u5206\u949f',
  '5m': '5\u5206\u949f',
  '15m': '15\u5206\u949f',
  '30m': '30\u5206\u949f',
  '1h': '1\u5c0f\u65f6',
  '4h': '4\u5c0f\u65f6',
  '1d': '1\u65e5'
}

export function strategyDisplay (key, fallback = '') {
  const item = STRATEGY_BY_KEY.get(String(key || ''))
  return item ? item.name : (fallback || key)
}

export function strategyMeta (key) {
  return STRATEGY_BY_KEY.get(String(key || '')) || null
}

export function strategyTitle (keyOrItem, fallback = '') {
  const item = typeof keyOrItem === 'object' && keyOrItem
    ? keyOrItem
    : strategyMeta(keyOrItem)
  const name = item ? item.name : (fallback || keyOrItem)
  if (!item) return name
  const timeframes = Array.isArray(item.timeframes) ? item.timeframes : []
  const instruments = Array.isArray(item.instruments) ? item.instruments : []
  const timeframeLabel = timeframes.map(value => TIMEFRAME_LABELS[String(value).toLowerCase()] || value).join('/')
  const instrumentLabel = instruments.join('/')
  return [name, timeframeLabel && `\u5468\u671f ${timeframeLabel}`, instrumentLabel && `\u6807\u7684 ${instrumentLabel}`].filter(Boolean).join(' · ')
}

export function toCommunityIndicator (item, index = 0) {
  const source = item || {}
  return {
    ...source,
    id: Number.isFinite(Number(source.id)) ? Number(source.id) : -(index + 1),
    asset_type: 'indicator',
    pricing_type: 'free',
    price: 0,
    is_builtin: true,
    is_own: false,
    is_purchased: false,
    author: { nickname: '\u5185\u7f6e\u6307\u6807', username: 'builtin', avatar: '' },
    applicable_symbols: ['BTC/USDT', 'ETH/USDT'],
    applicable_timeframes: ['15m', '1h', '4h', '1d'],
    purchase_count: 0,
    view_count: 0,
    avg_rating: 0
  }
}

export function toCommunityStrategy (item, index = 0) {
  const source = item || {}
  return {
    id: -(index + 1),
    name: strategyTitle(source, source.key),
    title: strategyTitle(source, source.key),
    description: source.description || '',
    asset_type: 'script_template',
    template_key: source.key,
    pricing_type: 'free',
    price: 0,
    is_builtin: true,
    is_own: false,
    is_purchased: false,
    author: { nickname: '\u5185\u7f6e\u7b56\u7565', username: 'builtin', avatar: '' },
    applicable_symbols: Array.isArray(source.instruments) && source.instruments.length
      ? source.instruments
      : (source.market === '\u52a0\u5bc6\u8d27\u5e01' ? ['BTC/USDT', 'ETH/USDT'] : ['SPY', 'QQQ']),
    applicable_timeframes: Array.isArray(source.timeframes) && source.timeframes.length ? source.timeframes : ['15m', '1h', '4h', '1d'],
    purchase_count: 0,
    view_count: 0,
    avg_rating: 0
  }
}
