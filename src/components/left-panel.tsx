"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendAnalysisTab } from "@/components/trend-analysis-tab";
import { EnhancedFractalTrendAnalysisTab } from "@/components/enhanced-fractal-trend-analysis-tab";
import { FractalAnalysisTab } from "@/components/fractal-analysis-tab";
import type { CandlestickData } from "@/lib/types";
import { BarChart3 } from "lucide-react";

interface LeftPanelProps {
  chartData: CandlestickData[];
}

export function LeftPanel({ chartData }: LeftPanelProps) {
  return (
    <aside className="w-[400px] border-r border-border bg-card flex flex-col">
      <div className="flex-shrink-0 p-4 border-b">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          <h3 className="font-semibold">Analysis Panels</h3>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <Tabs defaultValue="trend" className="w-full h-full flex flex-col">
          <TabsList className="flex-shrink-0 grid w-full grid-cols-3 rounded-none border-b">
            <TabsTrigger value="trend">Trend</TabsTrigger>
            <TabsTrigger value="enhanced-fractal">Enhanced Fractal</TabsTrigger>
            <TabsTrigger value="fractal">Fractal</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trend" className="flex-1 min-h-0 mt-0">
            <TrendAnalysisTab chartData={chartData} />
          </TabsContent>
          
          <TabsContent value="enhanced-fractal" className="flex-1 min-h-0 mt-0">
            <EnhancedFractalTrendAnalysisTab chartData={chartData} />
          </TabsContent>
          
          <TabsContent value="fractal" className="flex-1 min-h-0 mt-0">
            <FractalAnalysisTab chartData={chartData} />
          </TabsContent>
        </Tabs>
      </div>
    </aside>
  );
}
