"use client";

import { analyzeFractals, type FractalAnalysisResult } from "@/lib/trend-detection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { CandlestickData } from "@/lib/types";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  AlertCircle,
  Settings,
} from "lucide-react";
import { useState } from "react";

interface FractalAnalysisPanelProps {
  chartData: CandlestickData[];
}

export function FractalAnalysisPanel({ chartData }: FractalAnalysisPanelProps) {
  const [fractalResult, setFractalResult] = useState<FractalAnalysisResult | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();

  const handleFractalAnalyze = () => {
    if (chartData.length < 5) {
      toast({
        variant: "destructive",
        title: "Insufficient Data",
        description: `Need at least 5 candles for fractal analysis. Current: ${chartData.length}`,
      });
      return;
    }

    try {
      const analysisResult = analyzeFractals(chartData);
      setFractalResult(analysisResult);
      
      toast({
        title: "Fractal Analysis Complete",
        description: `Found ${analysisResult.totalFractals} fractal points (${analysisResult.highFractals} highs, ${analysisResult.lowFractals} lows).`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: errorMessage,
      });
    }
  };

  return (
    <aside className="w-[300px] border-l border-border bg-card flex flex-col">
      <div className="flex-shrink-0 p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <h3 className="font-semibold">Fractal Analysis</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <Button 
            onClick={handleFractalAnalyze} 
            disabled={chartData.length < 5}
            className="w-full"
            size="sm"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Analyze Fractals
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="flex-shrink-0 p-4 border-b bg-muted/30">
          <h4 className="text-sm font-medium mb-3">Fractal Settings</h4>
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">
              <p>• Fractals use Bill Williams' 5-candle pattern</p>
              <p>• Swing highs: middle candle has highest high</p>
              <p>• Swing lows: middle candle has lowest low</p>
              <p>• Strength calculated from surrounding candles</p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {chartData.length < 5 && (
          <div className="p-4">
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-xs text-yellow-800">
                Need at least 5 candles for fractal analysis. Current: {chartData.length}
              </span>
            </div>
          </div>
        )}

        {fractalResult && (
          <div className="p-4 space-y-4">
            {/* Fractal Summary */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Fractal Analysis</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {fractalResult.totalFractals} Points
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Swing highs: {fractalResult.highFractals} | Swing lows: {fractalResult.lowFractals}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">
                      {fractalResult.highFractals}
                    </div>
                    <div className="text-xs text-muted-foreground">Resistance</div>
                    <div className="text-xs text-muted-foreground">Levels</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {fractalResult.lowFractals}
                    </div>
                    <div className="text-xs text-muted-foreground">Support</div>
                    <div className="text-xs text-muted-foreground">Levels</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fractal Points */}
            {fractalResult.fractals.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Fractal Points</CardTitle>
                  <CardDescription className="text-xs">
                    Latest swing points detected
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {fractalResult.fractals.slice(-5).map((fractal, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            fractal.type === 'high' ? 'bg-red-500' : 'bg-green-500'
                          }`} />
                          <span className="font-mono">
                            {fractal.type === 'high' ? 'High' : 'Low'}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-mono">{fractal.price.toFixed(5)}</div>
                          <div className="text-muted-foreground text-xs">
                            {new Date(fractal.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {fractalResult.fractals.length > 5 && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Showing latest 5 of {fractalResult.fractals.length} fractals
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Fractal Recommendations */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Fractal Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {fractalResult.recommendations.slice(0, 4).map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Fractal Analysis Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Analysis Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground whitespace-pre-line">
                  {fractalResult.analysis}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </aside>
  );
}
