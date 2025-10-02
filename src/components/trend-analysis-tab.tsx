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
  BarChart3,
  AlertCircle,
  Activity,
} from "lucide-react";
import { useState, useEffect } from "react";

interface TrendAnalysisTabProps {
  chartData: CandlestickData[];
}

const TrendIcon = ({ trend }: { trend: string }) => {
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

export function TrendAnalysisTab({ chartData }: TrendAnalysisTabProps) {
  const [trendResult, setTrendResult] = useState<TrendAnalysisResult | null>(null);
  const [useClosePrice, setUseClosePrice] = useState(true);
  const [useWeightedAnalysis, setUseWeightedAnalysis] = useState(true);
  const [maPeriod, setMaPeriod] = useState(20);
  const [trendThreshold, setTrendThreshold] = useState(0.55);
  const { toast } = useToast();

  const performAnalysis = () => {
    if (chartData.length < maPeriod) {
      setTrendResult(null);
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: errorMessage,
      });
      setTrendResult(null);
    }
  };

  // Auto-analyze when component mounts or when dependencies change
  useEffect(() => {
    performAnalysis();
  }, [chartData, maPeriod, useClosePrice, useWeightedAnalysis, trendThreshold]);

  const handleTrendAnalyze = () => {
    performAnalysis();
    if (trendResult) {
      toast({
        title: "Trend Analysis Complete",
        description: `Market is in ${trendResult.trend.toLowerCase()} with ${(trendResult.confidence * 100).toFixed(1)}% confidence.`,
      });
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

  const trendRecommendations = trendResult ? getTrendRecommendations(trendResult) : [];

  return (
    <div className="p-4 space-y-4">
      {/* Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="close-price" className="text-xs">Use Close Price</Label>
            <Switch
              id="close-price"
              checked={useClosePrice}
              onCheckedChange={setUseClosePrice}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="weighted" className="text-xs">Weighted Analysis</Label>
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
        </CardContent>
      </Card>

      <Button 
        onClick={handleTrendAnalyze} 
        disabled={chartData.length < maPeriod}
        className="w-full"
        size="sm"
        variant="outline"
      >
        <BarChart3 className="mr-2 h-4 w-4" />
        Refresh Analysis
      </Button>

      {chartData.length < maPeriod && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <span className="text-xs text-yellow-800">
            Need at least {maPeriod} candles. Current: {chartData.length}
          </span>
        </div>
      )}

      {trendResult && (
        <div className="space-y-3">
          {/* Trend Summary */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Trend Analysis</CardTitle>
                <Badge variant="outline" className={`text-xs ${getTrendColor(trendResult.trend)}`}>
                  {trendResult.trend}
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Market trend based on moving average analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendIcon trend={trendResult.trend} />
                  <span className="text-sm font-medium">Trend Direction</span>
                </div>
                <span className={`font-bold ${getTrendColor(trendResult.trend)}`}>
                  {trendResult.trend}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Confidence</span>
                <span className={`font-bold ${getConfidenceColor(trendResult.confidence)}`}>
                  {(trendResult.confidence * 100).toFixed(1)}%
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Confidence Level</span>
                  <span>{(trendResult.confidence * 100).toFixed(1)}%</span>
                </div>
                <Progress value={trendResult.confidence * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Trend Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Trend Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">MA Period:</span>
                  <span className="ml-1 font-mono">{maPeriod}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Threshold:</span>
                  <span className="ml-1 font-mono">{(trendThreshold * 100).toFixed(0)}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Price Type:</span>
                  <span className="ml-1 font-mono">{useClosePrice ? 'Close' : 'OHLC'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Analysis:</span>
                  <span className="ml-1 font-mono">{useWeightedAnalysis ? 'Weighted' : 'Simple'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {trendRecommendations.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {trendRecommendations.slice(0, 5).map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

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
    </div>
  );
}
