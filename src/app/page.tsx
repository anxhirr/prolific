"use client";

import React, { useState } from 'react';
import { ChartHeader } from '@/components/chart-header';
import { DrawingToolbar } from '@/components/drawing-toolbar';
import { InteractiveChart } from '@/components/interactive-chart';
import { RightPanel } from '@/components/right-panel';
import { generateCandleData } from '@/lib/mock-data';
import type { CandlestickData } from '@/lib/mock-data';

export default function ChartWhisperPage() {
    const [chartData, setChartData] = useState<CandlestickData[]>(generateCandleData(100));
    const [timeframe, setTimeframe] = useState('1D');
    
    const handleTimeframeChange = (newTimeframe: string) => {
        setTimeframe(newTimeframe);
        const numDataPoints = {
            '5M': 30,
            '1H': 60,
            '4H': 80,
            '1D': 100,
            '1W': 52,
        }[newTimeframe] || 100;
        setChartData(generateCandleData(numDataPoints));
    }

    return (
        <div className="flex flex-col h-screen bg-background text-foreground font-body">
            <ChartHeader timeframe={timeframe} onTimeframeChange={handleTimeframeChange} />
            <div className="flex flex-1 overflow-hidden">
                <DrawingToolbar />
                <main className="flex-1 flex flex-col">
                    <div className="flex-grow relative p-4">
                        <InteractiveChart data={chartData} key={timeframe} />
                    </div>
                </main>
                <RightPanel chartData={chartData} />
            </div>
        </div>
    );
}
