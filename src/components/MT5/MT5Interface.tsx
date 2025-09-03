
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Settings, 
  BarChart3,
  Clock,
  DollarSign,
  X
} from 'lucide-react'
import { useRealTrading } from '@/contexts/RealTradingContext'
import { useAuth } from '@/contexts/AuthContext.minimal'
import { useRealTimeMarketData } from '@/hooks/useMarketData'

const MT5Interface = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('EURUSD')
  const [tradeAmount, setTradeAmount] = useState('1000')
  const [leverage, setLeverage] = useState(500)
  const [showOrderDialog, setShowOrderDialog] = useState(false)
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy')

  const { profile } = useAuth()
  const { trades, openTrade, closeTrade, updateTradePrices } = useRealTrading()
  const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'US500', 'USOIL']
  const { data: marketData } = useRealTimeMarketData(symbols)

  // Update trade prices when market data changes
  useEffect(() => {
    if (marketData) {
      const priceUpdates = marketData.map(price => ({
        symbol: price.symbol,
        price: price.price,
      }))
      updateTradePrices(priceUpdates)
    }
  }, [marketData, updateTradePrices])

  const currentSymbolData = marketData?.find(data => data.symbol === selectedSymbol)

  const handleTrade = async (type: 'buy' | 'sell') => {
    if (!currentSymbolData) return

    await openTrade({
      symbol: selectedSymbol,
      type,
      amount: parseFloat(tradeAmount),
      open_price: type === 'buy' ? currentSymbolData.ask : currentSymbolData.bid,
      current_price: currentSymbolData.price,
      leverage
    })
    setShowOrderDialog(false)
  }

  return (
    <div className="h-full bg-[#1a1a1a] text-white">
      {/* Top Bar - XM Style */}
      <div className="bg-[#E31E24] p-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="AonePrimeFX" className="h-8" />
          <span className="text-white font-bold">AonePrimeFX MT5</span>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-green-600">LIVE ACCOUNT</Badge>
          <span className="text-white">{profile?.email}</span>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-60px)]">
        {/* Left Panel - Market Watch */}
        <div className="w-64 bg-[#2d2d2d] border-r border-gray-600">
          <div className="p-3 bg-[#3d3d3d] border-b border-gray-600">
            <h3 className="font-semibold text-white">Market Watch</h3>
          </div>
          <div className="overflow-auto">
            {marketData?.map((symbol) => (
              <div
                key={symbol.symbol}
                className={`p-3 cursor-pointer hover:bg-[#3d3d3d] border-b border-gray-700 ${
                  selectedSymbol === symbol.symbol ? 'bg-[#E31E24]' : ''
                }`}
                onClick={() => setSelectedSymbol(symbol.symbol)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-white">{symbol.symbol}</span>
                  <div className="text-right">
                    <div className="text-sm text-white">{symbol.price.toFixed(5)}</div>
                    <div className={`text-xs ${symbol.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {symbol.changePercent >= 0 ? '+' : ''}{symbol.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-red-400">{symbol.bid.toFixed(5)}</span>
                  <span className="text-green-400">{symbol.ask.toFixed(5)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Panel - Chart */}
        <div className="flex-1 bg-[#1a1a1a]">
          <div className="p-3 bg-[#2d2d2d] border-b border-gray-600 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-white">{currentSymbolData?.name}</h2>
              <Badge variant="outline" className="text-white border-white">
                {currentSymbolData?.symbol}
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {currentSymbolData?.price.toFixed(5)}
                </div>
                <div className={`text-sm ${currentSymbolData?.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {currentSymbolData?.changePercent >= 0 ? '+' : ''}{currentSymbolData?.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          {/* Chart Area */}
          <div className="h-96 bg-[#0d1421] m-4 rounded border border-gray-600 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <BarChart3 className="h-16 w-16 mx-auto mb-4" />
              <p className="text-lg">Advanced Trading Chart</p>
              <p className="text-sm">Real-time market data for {currentSymbolData?.symbol}</p>
            </div>
          </div>

          {/* Quick Trade Panel */}
          <div className="p-4 bg-[#2d2d2d] m-4 rounded border border-gray-600">
            <div className="flex gap-4 items-center">
              <div>
                <label className="text-sm text-gray-400">Volume</label>
                <Input
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  className="bg-[#1a1a1a] border-gray-600 text-white w-32"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Leverage 1:{leverage}</label>
                <input
                  type="range"
                  min="1"
                  max="500"
                  value={leverage}
                  onChange={(e) => setLeverage(parseInt(e.target.value))}
                  className="w-32"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleTrade('sell')}
                  className="bg-red-600 hover:bg-red-700 text-white px-8"
                >
                  SELL {currentSymbolData?.bid.toFixed(5)}
                </Button>
                <Button
                  onClick={() => handleTrade('buy')}
                  className="bg-green-600 hover:bg-green-700 text-white px-8"
                >
                  BUY {currentSymbolData?.ask.toFixed(5)}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Account Info & Trades */}
        <div className="w-80 bg-[#2d2d2d] border-l border-gray-600">
          {/* Account Summary */}
          <div className="p-3 bg-[#3d3d3d] border-b border-gray-600">
            <h3 className="font-semibold text-white mb-2">Account Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Balance:</span>
                <span className="text-white font-mono">${profile?.balance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Equity:</span>
                <span className="text-white font-mono">${profile?.equity.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Margin:</span>
                <span className="text-white font-mono">${profile?.margin.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Free Margin:</span>
                <span className="text-white font-mono">${profile?.free_margin.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Open Positions */}
          <div className="flex-1 overflow-auto">
            <div className="p-3 bg-[#3d3d3d] border-b border-gray-600">
              <h3 className="font-semibold text-white">Open Positions ({trades.length})</h3>
            </div>
            <div className="space-y-2 p-2">
              {trades.map((trade) => (
                <Card key={trade.id} className="bg-[#1a1a1a] border-gray-600 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded ${trade.type === 'buy' ? 'bg-green-600' : 'bg-red-600'}`}>
                        {trade.type === 'buy' ? (
                          <TrendingUp className="h-3 w-3 text-white" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span className="text-white font-medium">{trade.symbol}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => closeTrade(trade.id)}
                      className="h-6 w-6 text-gray-400 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Volume:</span>
                      <span className="text-white">${trade.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Open:</span>
                      <span className="text-white">{trade.open_price.toFixed(5)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current:</span>
                      <span className="text-white">{trade.current_price.toFixed(5)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">P&L:</span>
                      <span className={`font-mono ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
              {trades.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p>No open positions</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MT5Interface
