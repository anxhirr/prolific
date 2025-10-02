"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendAnalysisTab } from "@/components/trend-analysis-tab";
import { EnhancedFractalTrendAnalysisTab } from "@/components/enhanced-fractal-trend-analysis-tab";
import { FractalAnalysisTab } from "@/components/fractal-analysis-tab";
import type { CandlestickData } from "@/lib/types";
import { BarChart3 } from "lucide-react";
import { useState } from "react";

interface LeftPanelProps {
  chartData: CandlestickData[];
}

export function LeftPanel({ chartData }: LeftPanelProps) {
  const [activeTab, setActiveTab] = useState("trend");

  return (
    <aside className="w-[400px] border-r border-border bg-card flex flex-col">
      <div className="flex-shrink-0 p-4 border-b">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          <h3 className="font-semibold">Analysis Panels</h3>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          <TabsList className="flex-shrink-0 grid w-full grid-cols-3 rounded-none border-b">
            <TabsTrigger value="trend">Trend</TabsTrigger>
            <TabsTrigger value="enhanced-fractal">Enhanced Fractal</TabsTrigger>
            <TabsTrigger value="fractal">Fractal</TabsTrigger>
          </TabsList>
          
          {/* All tabs are always mounted, but only the active one is visible */}
          <div className="flex-1 min-h-0 relative">
            {/* Trend Analysis Tab */}
            <div className={`absolute inset-0 ${activeTab === "trend" ? "block" : "hidden"}`}>
              <TrendAnalysisTab chartData={chartData} />
            </div>
            
            {/* Enhanced Fractal Analysis Tab */}
            <div className={`absolute inset-0 ${activeTab === "enhanced-fractal" ? "block" : "hidden"}`}>
              <EnhancedFractalTrendAnalysisTab chartData={chartData} />
            </div>
            
            {/* Fractal Analysis Tab */}
            <div className={`absolute inset-0 ${activeTab === "fractal" ? "block" : "hidden"}`}>
              <FractalAnalysisTab chartData={chartData} />
            </div>
          </div>
        </Tabs>
      </div>
    </aside>
  );
}
