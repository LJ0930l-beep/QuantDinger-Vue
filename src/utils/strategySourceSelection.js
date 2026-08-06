/**
 * Normalize the value emitted by the strategy source selector.
 *
 * Ant Design Vue can emit the native change event on a popup selection. The
 * v-model value is authoritative in that case; serializing the event would
 * create an invalid source id such as `template:[object PointerEvent]`.
 */
export function normalizeStrategySourceSelection (value, modelValue) {
  const selected = value && typeof value === 'object' ? modelValue : value
  if (!selected) return ''
  const sourceId = String(selected)
  if (sourceId.includes('[object PointerEvent]') || sourceId === '[object Object]') return ''
  return sourceId
}
