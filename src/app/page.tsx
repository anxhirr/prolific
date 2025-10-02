"use client";

import { ChartHeader } from "@/components/chart-header";
import { DrawingToolbar } from "@/components/drawing-toolbar";
import { SimpleChart } from "@/components/simple-chart";
import { LeftPanel } from "@/components/left-panel";
import { RightPanel } from "@/components/right-panel";
import { useOandaCandles } from "@/hooks/use-oanda-candles";
import type { CandlestickData } from "@/lib/types";
import { useState } from "react";

// Use your OANDA API key - in production, this should come from environment variables
const OANDA_API_KEY =
  "d14032539d0ad19e78259a10d9d5f733-0c1c6513bf19879c697b352447409af9";

export default function ChartWhisperPage() {
  const [timeframe, setTimeframe] = useState("1D");
  const [instrument, setInstrument] = useState("EUR_USD");

  // Fetch real OANDA data
  const {
    candles: oandaCandles,
    loading,
    error,
    refetch,
  } = useOandaCandles(instrument, timeframe, OANDA_API_KEY);

  // Fallback to mock data if OANDA data is not available
  const chartData: CandlestickData[] = oandaCandles;

  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
    // The hook will automatically refetch data when timeframe changes
  };

  const handleInstrumentSelect = (selectedInstrument: string) => {
    setInstrument(selectedInstrument);
    // The hook will automatically refetch data when instrument changes
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-body">
      <ChartHeader
        timeframe={timeframe}
        onTimeframeChange={handleTimeframeChange}
        selectedInstrument={instrument}
      />
      <div className="flex flex-1 overflow-hidden">
        <LeftPanel chartData={chartData} />
        <DrawingToolbar />
        <main className="flex-1 flex flex-col">
          <div className="flex-grow relative p-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span>Loading {instrument} data...</span>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-muted-foreground mb-2">
                    Failed to load real data
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Showing demo data instead
                  </p>
                  <button
                    onClick={refetch}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <SimpleChart
                data={chartData}
                key={`${instrument}-${timeframe}`}
              />
            )}
          </div>
        </main>
        <RightPanel
          chartData={chartData}
          selectedInstrument={instrument}
          onInstrumentSelect={handleInstrumentSelect}
        />
      </div>
    </div>
  );
}
