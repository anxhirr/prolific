"use client";

import { detectFractalTrend, type FractalTrendResult } from "@/lib/trend-detection";
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
  Activity,
  AlertCircle,
  Settings,
  Target,
  Zap,
} from "lucide-react";
import { useState } from "react";

interface FractalTrendPanelProps {
  chartData: CandlestickData[];
}

export function FractalTrendPanel({ chartData }: FractalTrendPanelProps) {
  const [fractalTrendResult, setFractalTrendResult] = useState<FractalTrendResult | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [minFractals, setMinFractals] = useState(2);
  const [useTimeDecay, setUseTimeDecay] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.6);
  const { toast } = useToast();

  const handleFractalTrendAnalyze = () => {
    if (chartData.length < 5) {
      toast({
        variant: "destructive",
        title: "Insufficient Data",
        description: `Need at least 5 candles for fractal trend analysis. Current: ${chartData.length}`,
      });
      return;
    }

    try {
      const analysisResult = detectFractalTrend(chartData, {
        minFractals,
        useTimeDecay,
        confidenceThreshold,
      });
      
      setFractalTrendResult(analysisResult);
      
      toast({
        title: "Fractal Trend Analysis Complete",
        description: `Trend: ${analysisResult.trend} with ${(analysisResult.confidence * 100).toFixed(1)}% confidence`,
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'UPTREND':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'DOWNTREND':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'SIDEWAYS':
        return <Activity className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'UPTREND':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'DOWNTREND':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'SIDEWAYS':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <aside className="w-[320px] border-r border-border bg-card flex flex-col">
      <div className="flex-shrink-0 p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            <h3 className="font-semibold">Fractal Trend Analysis</h3>
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
            onClick={handleFractalTrendAnalyze} 
            disabled={chartData.length < 5}
            className="w-full"
            size="sm"
          >
            <Target className="mr-2 h-4 w-4" />
            Analyze Fractal Trend
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="flex-shrink-0 p-4 border-b bg-muted/30">
          <h4 className="text-sm font-medium mb-3">Fractal Trend Settings</h4>
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">
              <p>• Analyzes swing points for trend structure</p>
              <p>• Higher Highs + Higher Lows = Uptrend</p>
              <p>• Lower Highs + Lower Lows = Downtrend</p>
              <p>• Uses time decay for recent fractals</p>
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
                Need at least 5 candles for fractal trend analysis. Current: {chartData.length}
              </span>
            </div>
          </div>
        )}

        {fractalTrendResult && (
          <div className="p-4 space-y-4">
            {/* Trend Summary */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Fractal Trend</CardTitle>
                  <Badge variant="outline" className={`text-xs ${getTrendColor(fractalTrendResult.trend)}`}>
                    {fractalTrendResult.trend}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Pattern: {fractalTrendResult.pattern}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTrendIcon(fractalTrendResult.trend)}
                    <span className="text-sm font-medium">Trend Direction</span>
                  </div>
                  <span className={`font-bold ${getTrendColor(fractalTrendResult.trend)}`}>
                    {fractalTrendResult.trend}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Confidence</span>
                  <span className={`font-bold ${getConfidenceColor(fractalTrendResult.confidence)}`}>
                    {(fractalTrendResult.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Strength</span>
                  <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    <span className="font-bold">
                      {(fractalTrendResult.trendStrength * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Fractals */}
            {fractalTrendResult.recentFractals.lastHigh && fractalTrendResult.recentFractals.lastLow && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Key Fractal Levels</CardTitle>
                  <CardDescription className="text-xs">
                    Latest swing points
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {fractalTrendResult.recentFractals.lastHigh && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <span className="text-xs font-medium">Resistance</span>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-xs">
                            {fractalTrendResult.recentFractals.lastHigh.price.toFixed(5)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(fractalTrendResult.recentFractals.lastHigh.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {fractalTrendResult.recentFractals.lastLow && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-xs font-medium">Support</span>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-xs">
                            {fractalTrendResult.recentFractals.lastLow.price.toFixed(5)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(fractalTrendResult.recentFractals.lastLow.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trend Recommendations */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Fractal Trend Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {fractalTrendResult.recommendations.slice(0, 5).map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Analysis Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Analysis Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground whitespace-pre-line">
                  {fractalTrendResult.analysis}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </aside>
  );
}
