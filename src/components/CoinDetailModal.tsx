import { useState, useEffect } from 'react';
import { X, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { coinGeckoApi, CoinDetail, PriceHistory } from '@/services/coinGeckoApi';

interface CoinDetailModalProps {
  coinId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CoinDetailModal({ coinId, isOpen, onClose }: CoinDetailModalProps) {
  const [coin, setCoin] = useState<CoinDetail | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('7');

  useEffect(() => {
    if (!isOpen || !coinId) return;

    const fetchCoinData = async () => {
      try {
        setLoading(true);
        const [coinData, historyData] = await Promise.all([
          coinGeckoApi.getCoin(coinId),
          coinGeckoApi.getCoinHistory(coinId, parseInt(timeframe))
        ]);
        
        setCoin(coinData);
        setPriceHistory(historyData);
      } catch (error) {
        console.error('Failed to fetch coin details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoinData();
  }, [coinId, isOpen, timeframe]);

  const formatPrice = (price: number | undefined | null) => {
    if (typeof price !== 'number' || isNaN(price)) return 'N/A';
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatChartData = (priceData: [number, number][]) => {
    return priceData.map(([timestamp, price]) => ({
      time: new Date(timestamp).toLocaleDateString(),
      price: price,
    }));
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center space-x-3">
            {coin && (
              <>
                <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                <span>{coin.name}</span>
                <Badge variant="outline" className="uppercase">{coin.symbol}</Badge>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crypto-green"></div>
          </div>
        ) : coin ? (
          <div className="space-y-6">
            {/* Price Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-surface-elevated rounded-lg p-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Current Price</h4>
                <div className="text-2xl font-bold text-foreground">
                  {formatPrice(coin.current_price)}
                </div>
              </div>
              
              <div className="bg-surface-elevated rounded-lg p-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">24h Change</h4>
                <div className={`text-2xl font-bold flex items-center space-x-2 ${
                  coin.price_change_percentage_24h >= 0 ? 'text-crypto-green' : 'text-crypto-red'
                }`}>
                  {coin.price_change_percentage_24h >= 0 ? (
                    <TrendingUp className="h-6 w-6" />
                  ) : (
                    <TrendingDown className="h-6 w-6" />
                  )}
                  <span>
                    {coin.price_change_percentage_24h > 0 ? '+' : ''}
                    {coin.price_change_percentage_24h?.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="bg-surface-elevated rounded-lg p-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Market Cap</h4>
                <div className="text-2xl font-bold text-foreground">
                  {coin.market_cap ? `$${coin.market_cap.toLocaleString()}` : 'N/A'}
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-surface-elevated rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Price Chart</h3>
                <div className="flex space-x-2">
                  {['1', '7', '30', '365'].map((days) => (
                    <Button
                      key={days}
                      variant={timeframe === days ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimeframe(days)}
                    >
                      {days === '1' ? '24H' : `${days}D`}
                    </Button>
                  ))}
                </div>
              </div>
              
              {priceHistory && (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formatChartData(priceHistory.prices)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="time" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickFormatter={(value) => formatPrice(value)}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--surface-elevated))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: any) => [formatPrice(value), 'Price']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="hsl(var(--crypto-green))" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Links */}
            {coin.links?.homepage?.[0] && (
              <div className="flex justify-center">
                <Button variant="outline" asChild>
                  <a 
                    href={coin.links.homepage[0]} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2"
                  >
                    <span>Visit Website</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Failed to load coin details</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}