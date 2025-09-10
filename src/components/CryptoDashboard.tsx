import { TrendingUp, BarChart3, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from './ThemeToggle';
import { CoinList } from './CoinList';

export function CryptoDashboard() {
  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-crypto-green/10">
                  <TrendingUp className="h-6 w-6 text-crypto-green" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">CryptoTracker</h1>
                  <p className="text-sm text-muted-foreground">Professional Cryptocurrency Dashboard</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-crypto-green" />
                  <span className="text-muted-foreground">Real-time data</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-crypto-green" />
                  <span className="text-muted-foreground">CoinGecko API</span>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <Card className="bg-gradient-primary border-crypto-green/20 shadow-glow">
            <CardHeader>
              <CardTitle className="text-crypto-green-foreground">
                Welcome to Professional Crypto Trading
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-crypto-green-foreground/80">
                Track real-time cryptocurrency prices, analyze market trends, and make informed investment decisions. 
                Featuring VANRY/USDT and top market cap cryptocurrencies.
              </p>
            </CardContent>
          </Card>

          {/* Coin List */}
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-crypto-green" />
                <span>Cryptocurrency Markets</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CoinList />
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>Powered by CoinGecko API • Real-time cryptocurrency market data</p>
          </div>
        </div>
      </footer>
    </div>
  );
}