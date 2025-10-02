import type { CandlestickData } from "@/lib/types";
import { useEffect, useState } from "react";

interface UseOandaCandlesReturn {
  candles: CandlestickData[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Map OANDA granularity to our timeframe format
const granularityMap: Record<string, string> = {
  "5M": "M5",
  "1H": "H1",
  "4H": "H4",
  "1D": "D",
  "1W": "W",
};

// Map timeframe to number of candles
const candleCountMap: Record<string, number> = {
  "5M": 30,
  "1H": 60,
  "4H": 80,
  "1D": 100,
  "1W": 52,
};

export function useOandaCandles(
  instrument: string = "EUR_USD",
  timeframe: string = "1D",
  apiKey?: string
): UseOandaCandlesReturn {
  const [candles, setCandles] = useState<CandlestickData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCandles = async () => {
    try {
      setLoading(true);
      setError(null);

      const granularity = granularityMap[timeframe] || "D";
      const count = candleCountMap[timeframe] || 100;

      // Construct the URL with API key as query parameter if provided
      const url = apiKey
        ? `/api/oanda/candles?instrument=${encodeURIComponent(
            instrument
          )}&granularity=${granularity}&count=${count}&apiKey=${encodeURIComponent(
            apiKey
          )}`
        : `/api/oanda/candles?instrument=${encodeURIComponent(
            instrument
          )}&granularity=${granularity}&count=${count}`;

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details || errorData.error || `HTTP ${response.status}`
        );
      }

      const data = await response.json();

      // Transform OANDA candles to our format
      const transformedCandles: CandlestickData[] = data.candles.map(
        (candle: any) => {
          const priceData = candle.mid || candle.bid || candle.ask;
          const date = new Date( parseInt(candle.time) * 1000);

          return {
            date: date.toISOString(), // Preserve full timestamp
            open: parseFloat(priceData.o),
            high: parseFloat(priceData.h),
            low: parseFloat(priceData.l),
            close: parseFloat(priceData.c),
          };
        }
      );

      setCandles(transformedCandles);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch candles";
      setError(errorMessage);

      // Fall back to empty array on error
      setCandles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandles();
  }, [instrument, timeframe, apiKey]);

  return {
    candles,
    loading,
    error,
    refetch: fetchCandles,
  };
}
