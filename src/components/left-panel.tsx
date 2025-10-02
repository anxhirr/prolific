"use client";

import { detectMarketTrend, getTrendRecommendations, analyzeFractals, type TrendAnalysisResult, type FractalAnalysisResult } from "@/lib/trend-detection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { CandlestickData } from "@/lib/types";
import {
  TrendingDown,
  TrendingUp,
  Minus,
  BarChart3,
  AlertCircle,
  Settings,
} from "lucide-react";
import { useState } from "react";

interface LeftPanelProps {
  chartData: CandlestickData[];
}

const TrendIcon = ({ trend }: { trend: string }) => {
  switch (trend) {
    case 'UPTREND':
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case 'DOWNTREND':
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    default:
      return <Minus className="h-4 w-4 text-yellow-500" />;
  }
};

export function LeftPanel({ chartData }: LeftPanelProps) {
  const [trendResult, setTrendResult] = useState<TrendAnalysisResult | null>(null);
  const [fractalResult, setFractalResult] = useState<FractalAnalysisResult | null>(null);
  const [useClosePrice, setUseClosePrice] = useState(true);
  const [useWeightedAnalysis, setUseWeightedAnalysis] = useState(true);
  const [maPeriod, setMaPeriod] = useState(20);
  const [trendThreshold, setTrendThreshold] = useState(0.55);
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();

  const handleTrendAnalyze = () => {
    if (chartData.length < maPeriod) {
      toast({
        variant: "destructive",
        title: "Insufficient Data",
        description: `Need at least ${maPeriod} candles for trend analysis. Current: ${chartData.length}`,
      });
      return;
    }

    try {
      const analysisResult = detectMarketTrend(chartData, {
        maPeriod,
        useClosePrice,
        useWeightedAnalysis,
        trendThreshold,
      });

      setTrendResult(analysisResult);
      
      toast({
        title: "Trend Analysis Complete",
        description: `Market is in ${analysisResult.trend.toLowerCase()} with ${(analysisResult.confidence * 100).toFixed(1)}% confidence.`,
      });
    } catch (error) {
      console.error("Trend analysis failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: errorMessage,
      });
    }
  };

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
      console.error("Fractal analysis failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: errorMessage,
      });
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'UPTREND':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'DOWNTREND':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const trendRecommendations = trendResult ? getTrendRecommendations(trendResult) : [];

  return (
    <aside className="w-[300px] border-r border-border bg-card flex flex-col">
      <div className="flex-shrink-0 p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <h3 className="font-semibold">Trend Analysis</h3>
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
            onClick={handleTrendAnalyze} 
            disabled={chartData.length < maPeriod}
            className="w-full"
            size="sm"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Analyze Trend
          </Button>
          
          <Button 
            onClick={handleFractalAnalyze} 
            disabled={chartData.length < 5}
            className="w-full"
            size="sm"
            variant="outline"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Analyze Fractals
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="flex-shrink-0 p-4 border-b bg-muted/30">
          <h4 className="text-sm font-medium mb-3">Analysis Settings</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="close-price" className="text-xs">
                Use Close Price
              </Label>
              <Switch
                id="close-price"
                checked={useClosePrice}
                onCheckedChange={setUseClosePrice}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="weighted" className="text-xs">
                Weighted Analysis
              </Label>
              <Switch
                id="weighted"
                checked={useWeightedAnalysis}
                onCheckedChange={setUseWeightedAnalysis}
              />
            </div>

            
            <div className="space-y-1">
              <Label className="text-xs">MA Period: {maPeriod}</Label>
              <input
                type="range"
                min="5"
                max="50"
                value={maPeriod}
                onChange={(e) => setMaPeriod(Number(e.target.value))}
                className="w-full h-1"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Threshold: {(trendThreshold * 100).toFixed(0)}%</Label>
              <input
                type="range"
                min="0.5"
                max="0.8"
                step="0.05"
                value={trendThreshold}
                onChange={(e) => setTrendThreshold(Number(e.target.value))}
                className="w-full h-1"
              />
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
              Need at least 5 candles for analysis. Current: {chartData.length}
            </span>
          </div>
        </div>
      )}

      {trendResult && (
          <div className="p-4 space-y-4">
            {/* Trend Summary */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Market Trend</CardTitle>
                  <div className="flex items-center gap-2">
                    <TrendIcon trend={trendResult.trend} />
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getTrendColor(trendResult.trend)}`}
                    >
                      {trendResult.trend}
                    </Badge>
                  </div>
                </div>
                <CardDescription className="text-xs">
                  Confidence: {(trendResult.confidence * 100).toFixed(1)}%
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {trendResult.uptrendCount}
                    </div>
                    <div className="text-xs text-muted-foreground">Uptrend</div>
                    <div className="text-xs text-muted-foreground">
                      ({(trendResult.uptrendPercentage * 100).toFixed(1)}%)
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">
                      {trendResult.downtrendCount}
                    </div>
                    <div className="text-xs text-muted-foreground">Downtrend</div>
                    <div className="text-xs text-muted-foreground">
                      ({(trendResult.downtrendPercentage * 100).toFixed(1)}%)
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Trend Strength</span>
                    <span>{(trendResult.trendStrength * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={trendResult.trendStrength * 100} className="h-1" />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Current Price:</span>
                    <div className="font-semibold">{trendResult.currentPrice.toFixed(5)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">MA ({maPeriod}):</span>
                    <div className="font-semibold">{trendResult.maValue.toFixed(5)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {trendRecommendations.slice(0, 3).map((rec, index) => (
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
                  {trendResult.analysis}
                </p>
              </CardContent>
            </Card>
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
                            {fractal.date}
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
                <CardTitle className="text-sm">Fractal Analysis</CardTitle>
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
