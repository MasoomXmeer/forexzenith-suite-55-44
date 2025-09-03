import { useEffect, useRef } from 'react'
import { forexEngine } from '@/services/forexEngine'
import { errorLogger } from '@/utils/errorLogger'

/**
 * Hook to manage daily swap charges for overnight positions
 */
export const useSwapManager = () => {
  const swapIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastSwapDate = useRef<string>(new Date().toDateString())

  useEffect(() => {
    // Check for swap application every minute
    const checkForSwap = () => {
      const now = new Date()
      const currentDate = now.toDateString()
      const currentTime = now.toTimeString().substring(0, 5) // HH:MM format
      
      // Apply swaps at 21:00 GMT (forex rollover time)
      if (currentTime === '21:00' && currentDate !== lastSwapDate.current) {
        applyDailySwaps()
        lastSwapDate.current = currentDate
      }
    }

    const applyDailySwaps = async () => {
      try {
        await forexEngine.applyDailySwaps()
        errorLogger.info('Daily swaps applied successfully')
      } catch (error: any) {
        errorLogger.error('Failed to apply daily swaps', { error: error.message })
      }
    }

    // Start interval to check for swap time
    swapIntervalRef.current = setInterval(checkForSwap, 60000) // Check every minute

    return () => {
      if (swapIntervalRef.current) {
        clearInterval(swapIntervalRef.current)
      }
    }
  }, [])

  return {
    // Expose manual swap application for testing
    applySwapsManually: () => forexEngine.applyDailySwaps()
  }
}