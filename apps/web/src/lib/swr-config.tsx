import { SWRConfig } from 'swr'
import type { ReactNode } from 'react'

// SWR global configuration
const swrConfig = {
  revalidateOnFocus: false,      // Don't refetch on window focus
  revalidateOnReconnect: true,   // Refetch on reconnect
  dedupingInterval: 60000,       // Dedupe requests within 60s
  errorRetryCount: 2,            // Retry failed requests 2 times
}

export function SWRProvider({ children }: { children: ReactNode }) {
  return <SWRConfig value={swrConfig}>{children}</SWRConfig>
}
