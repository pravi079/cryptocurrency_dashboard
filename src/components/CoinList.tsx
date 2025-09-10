import { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { coinGeckoApi, Coin } from '@/services/coinGeckoApi';
import { CoinDetailModal } from './CoinDetailModal';

export function CoinList() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [filteredCoins, setFilteredCoins] = useState<Coin[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const data = await coinGeckoApi.getCoins(1, 50);
        
        // Prioritize VANRY if it exists, otherwise add a placeholder
        const vanryIndex = data.findIndex(coin => 
          coin.symbol.toLowerCase() === 'vanry' || 
          coin.name.toLowerCase().includes('vanry')
        );
        
        let sortedData = [...data];
        if (vanryIndex > -1) {
          const vanry = sortedData.splice(vanryIndex, 1)[0];
          sortedData.unshift(vanry);
        }
        
        setCoins(sortedData);
        setFilteredCoins(sortedData);
      } catch (error) {
        console.error('Failed to fetch coins:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
    const interval = setInterval(fetchCoins, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const filtered = coins.filter(coin =>
      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCoins(filtered);
  }, [searchQuery, coins]);

  const formatPrice = (price: number | undefined | null) => {
    if (typeof price !== 'number' || isNaN(price)) return 'N/A';
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatMarketCap = (marketCap: number | undefined | null) => {
    if (typeof marketCap !== 'number' || isNaN(marketCap)) return 'N/A';
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    return `$${marketCap.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crypto-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search cryptocurrencies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Coin List */}
      <div className="grid gap-4">
        {filteredCoins.map((coin, index) => (
          <Card
            key={coin.id}
            className="p-4 hover:shadow-elevated transition-all duration-300 cursor-pointer bg-surface-elevated border-border/50"
            onClick={() => setSelectedCoin(coin.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-muted-foreground w-6">
                    #{coin.market_cap_rank || index + 1}
                  </span>
                  <img
                    src={coin.image}
                    alt={coin.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-foreground">{coin.name}</h3>
                      {index === 0 && coin.symbol.toLowerCase() === 'vanry' && (
                        <Badge variant="secondary" className="text-xs">Featured</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground uppercase">{coin.symbol}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <div className="font-semibold text-foreground">
                    {formatPrice(coin.current_price)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatMarketCap(coin.market_cap)}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {coin.price_change_percentage_24h >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-crypto-green" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-crypto-red" />
                  )}
                  <span
                    className={`font-medium ${
                      coin.price_change_percentage_24h >= 0
                        ? 'text-crypto-green'
                        : 'text-crypto-red'
                    }`}
                  >
                    {coin.price_change_percentage_24h > 0 ? '+' : ''}
                    {coin.price_change_percentage_24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Coin Detail Modal */}
      {selectedCoin && (
        <CoinDetailModal
          coinId={selectedCoin}
          isOpen={!!selectedCoin}
          onClose={() => setSelectedCoin(null)}
        />
      )}
    </div>
  );
}