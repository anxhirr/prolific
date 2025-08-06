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
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
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
  { symbol: "AAPL", price: 172.48, change: "+1.25%" },
  { symbol: "GOOGL", price: 139.74, change: "-0.89%" },
  { symbol: "TSLA", price: 257.18, change: "+3.45%" },
  { symbol: "AMZN", price: 134.33, change: "-0.12%" },
  { symbol: "MSFT", price: 329.04, change: "+0.78%" },
  { symbol: "NVDA", price: 468.35, change: "-2.11%" },
  { symbol: "META", price: 305.61, change: "+1.99%" },
  { symbol: "JPM", price: 147.92, change: "+0.55%" },
  { symbol: "V", price: 242.01, change: "-0.23%" },
  { symbol: "XOM", price: 110.88, change: "+0.91%" },
];

export const mockForexInstruments = [
  // Major pairs first
  {
    symbol: "EUR_USD",
    name: "Euro / US Dollar",
    price: 1.0854,
    displayPrecision: 5,
  },
  {
    symbol: "GBP_USD",
    name: "British Pound / US Dollar",
    price: 1.2647,
    displayPrecision: 5,
  },
  {
    symbol: "USD_JPY",
    name: "US Dollar / Japanese Yen",
    price: 148.23,
    displayPrecision: 3,
  },
  {
    symbol: "USD_CHF",
    name: "US Dollar / Swiss Franc",
    price: 0.8645,
    displayPrecision: 5,
  },
  {
    symbol: "AUD_USD",
    name: "Australian Dollar / US Dollar",
    price: 0.6589,
    displayPrecision: 5,
  },
  {
    symbol: "USD_CAD",
    name: "US Dollar / Canadian Dollar",
    price: 1.3521,
    displayPrecision: 5,
  },
  {
    symbol: "NZD_USD",
    name: "New Zealand Dollar / US Dollar",
    price: 0.6123,
    displayPrecision: 5,
  },
  // Minor pairs
  {
    symbol: "EUR_GBP",
    name: "Euro / British Pound",
    price: 0.8587,
    displayPrecision: 5,
  },
  {
    symbol: "EUR_JPY",
    name: "Euro / Japanese Yen",
    price: 160.89,
    displayPrecision: 3,
  },
  {
    symbol: "GBP_JPY",
    name: "British Pound / Japanese Yen",
    price: 187.45,
    displayPrecision: 3,
  },
];
