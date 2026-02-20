import { useSearchParams } from 'react-router-dom'
import { useCallback } from 'react'

const MAX_COMPARE = 3

export function useCompareState() {
  const [params, setParams] = useSearchParams()

  const compareMode = params.get('compare') === '1'
  const selectedIds = params.get('ids')?.split(',').filter(Boolean).slice(0, MAX_COMPARE) ?? []
  const isFullView = params.get('view') === 'full'

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      setParams((prev) => {
        const next = new URLSearchParams(prev)
        for (const [key, val] of Object.entries(updates)) {
          if (val === null) next.delete(key)
          else next.set(key, val)
        }
        return next
      }, { replace: true })
    },
    [setParams]
  )

  const toggleCompareMode = useCallback(() => {
    if (compareMode) {
      updateParams({ compare: null, ids: null, view: null })
    } else {
      updateParams({ compare: '1' })
    }
  }, [compareMode, updateParams])

  const selectPlayer = useCallback(
    (id: string) => {
      if (selectedIds.length >= MAX_COMPARE || selectedIds.includes(id)) return
      updateParams({ ids: [...selectedIds, id].join(',') })
    },
    [selectedIds, updateParams]
  )

  const deselectPlayer = useCallback(
    (id: string) => {
      const next = selectedIds.filter((x) => x !== id)
      updateParams({ ids: next.length ? next.join(',') : null })
    },
    [selectedIds, updateParams]
  )

  const isSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds]
  )

  const openFullView = useCallback(() => updateParams({ view: 'full' }), [updateParams])
  const closeFullView = useCallback(() => updateParams({ view: null }), [updateParams])
  const exitCompareMode = useCallback(
    () => updateParams({ compare: null, ids: null, view: null }),
    [updateParams]
  )

  return {
    compareMode,
    selectedIds,
    isFullView,
    isFull: selectedIds.length >= MAX_COMPARE,
    toggleCompareMode,
    selectPlayer,
    deselectPlayer,
    isSelected,
    openFullView,
    closeFullView,
    exitCompareMode,
  }
}
