import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Handle WebSocket upgrade for real-time data
  if (req.headers.get("upgrade") === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req)
    
    let symbols: string[] = []
    let intervalId: number | null = null

    socket.onopen = () => {
      console.log("MT5 WebSocket connected")
    }

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        
        if (message.type === 'subscribe') {
          symbols = message.symbols || []
          console.log('Subscribed to symbols:', symbols)
          
          // Start real-time data stream
          if (intervalId) clearInterval(intervalId)
          
          intervalId = setInterval(() => {
            symbols.forEach(symbol => {
              const marketData = generateRealTimeData(symbol)
              socket.send(JSON.stringify({
                type: 'marketData',
                data: marketData
              }))
            })
          }, 1000) // 1 second update interval
        }
        
        if (message.type === 'unsubscribe') {
          const symbolsToRemove = message.symbols || []
          symbols = symbols.filter(s => !symbolsToRemove.includes(s))
          console.log('Remaining symbols:', symbols)
          
          if (symbols.length === 0 && intervalId) {
            clearInterval(intervalId)
            intervalId = null
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error)
      }
    }

    socket.onclose = () => {
      console.log("MT5 WebSocket disconnected")
      if (intervalId) {
        clearInterval(intervalId)
      }
    }

    return response
  }

  // Handle regular HTTP requests
  return new Response(
    JSON.stringify({ error: 'WebSocket connection required' }),
    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})

function generateRealTimeData(symbol: string) {
  // Enhanced real-time data generation with realistic tick movements
  const baseRates: { [key: string]: { bid: number; ask: number; spread: number } } = {
    'EURUSD': { bid: 1.08485, ask: 1.08495, spread: 1.0 },
    'GBPUSD': { bid: 1.26492, ask: 1.26508, spread: 1.6 },
    'USDJPY': { bid: 149.485, ask: 149.495, spread: 1.0 },
    'AUDUSD': { bid: 0.65785, ask: 0.65795, spread: 1.0 },
    'USDCAD': { bid: 1.37185, ask: 1.37205, spread: 2.0 },
    'USDCHF': { bid: 0.91785, ask: 0.91795, spread: 1.0 },
    'NZDUSD': { bid: 0.59185, ask: 0.59205, spread: 2.0 },
    'EURGBP': { bid: 0.85785, ask: 0.85805, spread: 2.0 },
    'EURJPY': { bid: 162.285, ask: 162.305, spread: 2.0 },
    'GBPJPY': { bid: 189.185, ask: 189.215, spread: 3.0 },
    'XAUUSD': { bid: 2025.35, ask: 2025.85, spread: 50 },
    'XAGUSD': { bid: 24.845, ask: 24.865, spread: 2.0 },
    'USOIL': { bid: 78.485, ask: 78.515, spread: 3.0 },
    'UKOIL': { bid: 82.285, ask: 82.315, spread: 3.0 },
    'US30': { bid: 37848.5, ask: 37850.5, spread: 2.0 },
    'US500': { bid: 4784.8, ask: 4785.2, spread: 0.4 },
    'NAS100': { bid: 16948.5, ask: 16950.5, spread: 2.0 },
    'GER30': { bid: 16418.5, ask: 16420.5, spread: 2.0 },
    'UK100': { bid: 7678.5, ask: 7680.5, spread: 2.0 },
    'JPN225': { bid: 33148.0, ask: 33152.0, spread: 4.0 }
  }

  const base = baseRates[symbol] || { bid: 1.0000, ask: 1.0010, spread: 1.0 }
  
  // More sophisticated tick movements
  const tickSize = getTickSize(symbol)
  const volatility = getVolatility(symbol)
  const marketSession = getCurrentMarketSession()
  
  // Adjust volatility based on market session
  const sessionMultiplier = getSessionVolatilityMultiplier(marketSession, symbol)
  const adjustedVolatility = volatility * sessionMultiplier
  
  // Generate tick movements (1-5 ticks up or down)
  const tickDirection = Math.random() < 0.5 ? -1 : 1
  const tickCount = Math.floor(Math.random() * 5) + 1
  const tickMovement = tickDirection * tickCount * tickSize
  
  // Add micro volatility for realistic price action
  const microVolatility = (Math.random() - 0.5) * adjustedVolatility
  
  const currentBid = base.bid + tickMovement + microVolatility
  const spreadInPrice = base.spread * tickSize
  const currentAsk = currentBid + spreadInPrice

  return {
    symbol,
    bid: Number(currentBid.toFixed(getDecimalPlaces(symbol))),
    ask: Number(currentAsk.toFixed(getDecimalPlaces(symbol))),
    spread: Number((currentAsk - currentBid).toFixed(getDecimalPlaces(symbol))),
    timestamp: Date.now(),
    volume: generateRealisticVolume(symbol, marketSession)
  }
}

function getCurrentMarketSession(): string {
  const now = new Date()
  const utcHour = now.getUTCHours()
  
  // Market sessions (UTC)
  if (utcHour >= 22 || utcHour < 7) return 'Sydney'    // 22:00-07:00
  if (utcHour >= 7 && utcHour < 15) return 'London'    // 07:00-15:00
  if (utcHour >= 13 && utcHour < 22) return 'NewYork'  // 13:00-22:00
  return 'Asian'
}

function getSessionVolatilityMultiplier(session: string, symbol: string): number {
  // Higher volatility during overlapping sessions
  const multipliers: { [key: string]: { [key: string]: number } } = {
    'Sydney': { 'AUDUSD': 1.3, 'NZDUSD': 1.3, 'USDJPY': 1.1 },
    'London': { 'EURUSD': 1.4, 'GBPUSD': 1.4, 'EURGBP': 1.3 },
    'NewYork': { 'EURUSD': 1.5, 'GBPUSD': 1.5, 'USDCAD': 1.3 },
    'Asian': { 'USDJPY': 1.2, 'AUDUSD': 1.1 }
  }
  
  return multipliers[session]?.[symbol] || 1.0
}

function generateRealisticVolume(symbol: string, session: string): number {
  const baseVolumes: { [key: string]: number } = {
    'EURUSD': 500, 'GBPUSD': 400, 'USDJPY': 350,
    'XAUUSD': 200, 'XAGUSD': 150, 'USOIL': 300
  }
  
  const baseVolume = baseVolumes[symbol] || 100
  const sessionMultiplier = session === 'London' || session === 'NewYork' ? 1.5 : 1.0
  
  return Math.floor(baseVolume * sessionMultiplier * (0.5 + Math.random()))
}

function getTickSize(symbol: string): number {
  if (symbol.includes('JPY')) return 0.001
  if (symbol.startsWith('XAU')) return 0.01
  if (symbol.startsWith('XAG')) return 0.001
  if (symbol.includes('OIL')) return 0.001
  if (symbol.startsWith('US') || symbol.startsWith('NAS')) return 0.1
  return 0.00001
}

function getVolatility(symbol: string): number {
  const volatilities: { [key: string]: number } = {
    'EURUSD': 0.00005, 'GBPUSD': 0.0001, 'USDJPY': 0.005,
    'XAUUSD': 0.25, 'XAGUSD': 0.01, 'USOIL': 0.05,
    'US30': 5, 'NAS100': 2.5
  }
  return volatilities[symbol] || 0.00002
}

function getDecimalPlaces(symbol: string): number {
  if (symbol.includes('JPY')) return 3
  if (symbol.startsWith('XAU') || symbol.startsWith('XAG')) return 2
  if (symbol.includes('OIL')) return 3
  if (symbol.startsWith('US') || symbol.startsWith('NAS')) return 1
  return 5
}