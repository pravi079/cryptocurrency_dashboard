import axios from 'axios';

const BASE_URL = 'https://api.coingecko.com/api/v3';

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
}

export interface CoinDetail extends Coin {
  description: {
    en: string;
  };
  links: {
    homepage: string[];
    blockchain_site: string[];
  };
  market_data: {
    current_price: { [key: string]: number };
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
  };
}

export interface PriceHistory {
  prices: [number, number][];
}

const api = axios.create({
  baseURL: BASE_URL,
});

export const coinGeckoApi = {
  getCoins: async (page: number = 1, perPage: number = 100): Promise<Coin[]> => {
    const response = await api.get(`/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: perPage,
        page: page,
        sparkline: false,
        price_change_percentage: '24h',
      },
    });
    return response.data;
  },

  getCoin: async (id: string): Promise<CoinDetail> => {
    const response = await api.get(`/coins/${id}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: false,
      },
    });
    return response.data;
  },

  getCoinHistory: async (id: string, days: number = 7): Promise<PriceHistory> => {
    const response = await api.get(`/coins/${id}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: days,
        interval: days <= 1 ? 'hourly' : 'daily',
      },
    });
    return response.data;
  },

  searchCoins: async (query: string): Promise<any[]> => {
    const response = await api.get(`/search`, {
      params: {
        query: query,
      },
    });
    return response.data.coins;
  },
};