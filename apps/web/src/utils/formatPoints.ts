export function formatPoints(points: number, maxDecimals = 2): string {
  if (!Number.isFinite(points)) return '0'
  const factor = 10 ** maxDecimals
  const rounded = Math.round(points * factor) / factor
  const fixed = rounded.toFixed(maxDecimals)
  return fixed.replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1')
}
