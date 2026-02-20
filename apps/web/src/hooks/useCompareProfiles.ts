import useSWR from 'swr'
import { fetchPlayerProfile, type PlayerProfile } from './usePlayerProfile'

export interface CompareSlot {
  profile: PlayerProfile | null
  loading: boolean
}

export function useCompareProfiles(ids: string[]): CompareSlot[] {
  const slot0 = useSWR(
    ids[0] ? `player-${ids[0]}` : null,
    () => fetchPlayerProfile(ids[0]!),
    { revalidateOnFocus: false }
  )
  const slot1 = useSWR(
    ids[1] ? `player-${ids[1]}` : null,
    () => fetchPlayerProfile(ids[1]!),
    { revalidateOnFocus: false }
  )

  const slots = [slot0, slot1]

  return ids.map((_, i) => ({
    profile: slots[i]?.data ?? null,
    loading: slots[i]?.isLoading ?? false,
  }))
}
