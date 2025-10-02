"use client";

import { detectMarketTrend, getTrendRecommendations, type TrendAnalysisResult } from "@/lib/trend-detection";
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
} from "lucide-react";
import { useState } from "react";

interface TrendAnalysisPanelProps {
  chartData: CandlestickData[];
}

const TrendIcon = ({ trend }: { trend: string }) => {
  switch (trend) {
    case 'UPTREND':
      return <TrendingUp className="h-5 w-5 text-green-500" />;
    case 'DOWNTREND':
      return <TrendingDown className="h-5 w-5 text-red-500" />;
    default:
      return <Minus className="h-5 w-5 text-yellow-500" />;
  }
};

export function TrendAnalysisPanel({ chartData }: TrendAnalysisPanelProps) {
  const [result, setResult] = useState<TrendAnalysisResult | null>(null);
  const [useClosePrice, setUseClosePrice] = useState(true);
  const [useWeightedAnalysis, setUseWeightedAnalysis] = useState(true);
  const [maPeriod, setMaPeriod] = useState(20);
  const [trendThreshold, setTrendThreshold] = useState(0.55);
  const { toast } = useToast();

  const handleAnalyze = () => {
    if (chartData.length < maPeriod) {
      toast({
        variant: "destructive",
        title: "Insufficient Data",
        description: `Need at least ${maPeriod} candles for analysis. Current: ${chartData.length}`,
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

      setResult(analysisResult);
      
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

  const recommendations = result ? getTrendRecommendations(result) : [];

  return (
    <div className="p-4 space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          <h3 className="font-semibold">Market Trend Analysis</h3>
        </div>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Analysis Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="close-price" className="text-sm">
              Use Close Price
            </Label>
            <Switch
              id="close-price"
              checked={useClosePrice}
              onCheckedChange={setUseClosePrice}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="weighted" className="text-sm">
              Weighted Analysis
            </Label>
            <Switch
              id="weighted"
              checked={useWeightedAnalysis}
              onCheckedChange={setUseWeightedAnalysis}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm">MA Period: {maPeriod}</Label>
            <input
              type="range"
              min="5"
              max="50"
              value={maPeriod}
              onChange={(e) => setMaPeriod(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Trend Threshold: {(trendThreshold * 100).toFixed(0)}%</Label>
            <input
              type="range"
              min="0.5"
              max="0.8"
              step="0.05"
              value={trendThreshold}
              onChange={(e) => setTrendThreshold(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={handleAnalyze} 
        disabled={chartData.length < maPeriod}
        className="w-full"
      >
        <BarChart3 className="mr-2 h-4 w-4" />
        Analyze Market Trend
      </Button>

      {chartData.length < maPeriod && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <span className="text-sm text-yellow-800">
            Need at least {maPeriod} candles for analysis. Current: {chartData.length}
          </span>
        </div>
      )}

      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Trend Analysis Results</CardTitle>
              <div className="flex items-center gap-2">
                <TrendIcon trend={result.trend} />
                <Badge 
                  variant="outline" 
                  className={getTrendColor(result.trend)}
                >
                  {result.trend}
                </Badge>
              </div>
            </div>
            <CardDescription>
              Confidence: {(result.confidence * 100).toFixed(1)}%
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {result.uptrendCount}
                </div>
                <div className="text-sm text-muted-foreground">Uptrend Signals</div>
                <div className="text-xs text-muted-foreground">
                  ({(result.uptrendPercentage * 100).toFixed(1)}%)
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {result.downtrendCount}
                </div>
                <div className="text-sm text-muted-foreground">Downtrend Signals</div>
                <div className="text-xs text-muted-foreground">
                  ({(result.downtrendPercentage * 100).toFixed(1)}%)
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Trend Strength</span>
                <span>{(result.trendStrength * 100).toFixed(1)}%</span>
              </div>
              <Progress value={result.trendStrength * 100} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Current Price:</span>
                <div className="font-semibold">{result.currentPrice.toFixed(5)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">MA ({maPeriod}):</span>
                <div className="font-semibold">{result.maValue.toFixed(5)}</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Analysis</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{result.analysis}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Recommendations</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
