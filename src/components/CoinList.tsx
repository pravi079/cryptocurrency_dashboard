import { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { coinGeckoApi, Coin } from '@/services/coinGeckoApi';
import { CoinDetailModal } from './CoinDetailModal';

export function CoinList() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [filteredCoins, setFilteredCoins] = useState<Coin[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [coinsPerPage] = useState(20);
  const [totalCoins, setTotalCoins] = useState(0);
  const [priceChangeFilter, setPriceChangeFilter] = useState('all');
  const [marketCapFilter, setMarketCapFilter] = useState('all');

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        setLoading(true);
        const data = await coinGeckoApi.getCoins(currentPage, coinsPerPage);
        
        // For first page, prioritize VANRY if it exists
        if (currentPage === 1) {
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
        } else {
          setCoins(data);
        }
        
        // Estimate total coins (CoinGecko has ~10k coins)
        setTotalCoins(10000);
      } catch (error) {
        console.error('Failed to fetch coins:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
    const interval = setInterval(fetchCoins, 30000);
    return () => clearInterval(interval);
  }, [currentPage, coinsPerPage]);

  useEffect(() => {
    let filtered = coins.filter(coin =>
      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply price change filter
    if (priceChangeFilter !== 'all') {
      filtered = filtered.filter(coin => {
        const change = coin.price_change_percentage_24h;
        switch (priceChangeFilter) {
          case 'positive':
            return change > 0;
          case 'negative':
            return change < 0;
          case 'significant':
            return Math.abs(change) > 5;
          default:
            return true;
        }
      });
    }

    // Apply market cap filter
    if (marketCapFilter !== 'all') {
      filtered = filtered.filter(coin => {
        const marketCap = coin.market_cap;
        if (!marketCap) return false;
        switch (marketCapFilter) {
          case 'large':
            return marketCap > 10e9; // > $10B
          case 'mid':
            return marketCap > 1e9 && marketCap <= 10e9; // $1B - $10B
          case 'small':
            return marketCap <= 1e9; // < $1B
          default:
            return true;
        }
      });
    }

    setFilteredCoins(filtered);
  }, [searchQuery, coins, priceChangeFilter, marketCapFilter]);

  const totalPages = Math.ceil(totalCoins / coinsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
      {/* Search and Filters */}
      <div className="space-y-4">
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

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filters:</span>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Select value={priceChangeFilter} onValueChange={setPriceChangeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Price Change" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Changes</SelectItem>
                <SelectItem value="positive">Gainers</SelectItem>
                <SelectItem value="negative">Losers</SelectItem>
                <SelectItem value="significant">±5%+ Change</SelectItem>
              </SelectContent>
            </Select>

            <Select value={marketCapFilter} onValueChange={setMarketCapFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Market Cap" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sizes</SelectItem>
                <SelectItem value="large">Large Cap ($10B+)</SelectItem>
                <SelectItem value="mid">Mid Cap ($1B-$10B)</SelectItem>
                <SelectItem value="small">Small Cap (&lt;$1B)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Showing {filteredCoins.length} cryptocurrencies</span>
          <span>Page {currentPage} of {totalPages}</span>
        </div>
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
                    #{coin.market_cap_rank || ((currentPage - 1) * coinsPerPage) + index + 1}
                  </span>
                  <img
                    src={coin.image}
                    alt={coin.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-foreground">{coin.name}</h3>
                      {currentPage === 1 && index === 0 && coin.symbol.toLowerCase() === 'vanry' && (
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

      {/* Pagination */}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => handlePageChange(currentPage - 1)}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          
          {/* Page numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, currentPage - 2) + i;
            if (pageNum > totalPages) return null;
            
            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  onClick={() => handlePageChange(pageNum)}
                  isActive={pageNum === currentPage}
                  className="cursor-pointer"
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => handlePageChange(currentPage + 1)}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

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