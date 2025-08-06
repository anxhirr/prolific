export interface CandlestickData {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
}

export function generateCandleData(count: number): CandlestickData[] {
  const data: CandlestickData[] = [];
  let lastClose = 150 + Math.random() * 50;
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - (count - 1 - i));
    
    const open = lastClose;
    const change = (Math.random() - 0.48) * 15;
    let close = open + change;
    if (close < 0) close = Math.abs(close) + 10;
    
    const high = Math.max(open, close) + Math.random() * 5;
    const low = Math.min(open, close) - Math.random() * 5;

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      open,
      high,
      low,
      close,
    });
    lastClose = close;
  }
  return data;
}

export const mockWatchlist = [
  { symbol: 'AAPL', price: 172.48, change: '+1.25%' },
  { symbol: 'GOOGL', price: 139.74, change: '-0.89%' },
  { symbol: 'TSLA', price: 257.18, change: '+3.45%' },
  { symbol: 'AMZN', price: 134.33, change: '-0.12%' },
  { symbol: 'MSFT', price: 329.04, change: '+0.78%' },
  { symbol: 'NVDA', price: 468.35, change: '-2.11%' },
  { symbol: 'META', price: 305.61, change: '+1.99%' },
  { symbol: 'JPM', price: 147.92, change: '+0.55%' },
  { symbol: 'V', price: 242.01, change: '-0.23%' },
  { symbol: 'XOM', price: 110.88, change: '+0.91%' },
];
