"use client";

import { detectEnhancedFractalTrend, type EnhancedFractalTrendResult } from "@/lib/enhanced-fractal-trend";
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
  Target,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { useState, useEffect } from "react";

interface EnhancedFractalTrendAnalysisTabProps {
  chartData: CandlestickData[];
}

export function EnhancedFractalTrendAnalysisTab({ chartData }: EnhancedFractalTrendAnalysisTabProps) {
  const [fractalTrendResult, setFractalTrendResult] = useState<EnhancedFractalTrendResult | null>(null);
  const [minFractals, setMinFractals] = useState(3);
  const [useTimeDecay, setUseTimeDecay] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.6);
  const { toast } = useToast();

  const performAnalysis = () => {
    if (chartData.length < 5) {
      setFractalTrendResult(null);
      return;
    }

    try {
      const analysisResult = detectEnhancedFractalTrend(chartData, {
        minFractals,
        useTimeDecay,
        confidenceThreshold,
      });
      
      setFractalTrendResult(analysisResult);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: errorMessage,
      });
      setFractalTrendResult(null);
    }
  };

  // Auto-analyze when component mounts or when dependencies change
  useEffect(() => {
    performAnalysis();
  }, [chartData, minFractals, useTimeDecay, confidenceThreshold]);

  const handleEnhancedFractalTrendAnalyze = () => {
    performAnalysis();
    if (fractalTrendResult) {
      toast({
        title: "Enhanced Fractal Trend Analysis Complete",
        description: `Trend: ${fractalTrendResult.trend} with ${(fractalTrendResult.confidence * 100).toFixed(1)}% confidence (${fractalTrendResult.detailedAnalysis?.highSequence.length || 0} highs, ${fractalTrendResult.detailedAnalysis?.lowSequence.length || 0} lows)`,
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

  const getSequenceIcon = (trend: string) => {
    switch (trend) {
      case 'ascending':
        return <ArrowUp className="h-3 w-3 text-green-600" />;
      case 'descending':
        return <ArrowDown className="h-3 w-3 text-red-600" />;
      default:
        return <Minus className="h-3 w-3 text-gray-600" />;
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Enhanced Analysis Settings</CardTitle>
          <CardDescription className="text-xs">
            Analyzes ALL fractals in sequence, not just recent ones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-xs text-muted-foreground">
            <p>• Counts ascending vs descending moves across entire history</p>
            <p>• Calculates trend consistency and consecutive patterns</p>
            <p>• Provides comprehensive market structure analysis</p>
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={handleEnhancedFractalTrendAnalyze} 
        disabled={chartData.length < 5}
        className="w-full"
        size="sm"
        variant="outline"
      >
        <Target className="mr-2 h-4 w-4" />
        Refresh Analysis
      </Button>

      {chartData.length < 5 && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <span className="text-xs text-yellow-800">
            Need at least 5 candles for enhanced fractal trend analysis. Current: {chartData.length}
          </span>
        </div>
      )}

      {fractalTrendResult && (
        <div className="space-y-4">
          {/* Enhanced Trend Summary */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Enhanced Fractal Trend</CardTitle>
                <Badge variant="outline" className={`text-xs ${getTrendColor(fractalTrendResult.trend)}`}>
                  {fractalTrendResult.trend}
                </Badge>
              </div>
              <CardDescription className="text-xs">
                {fractalTrendResult.pattern}
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

          {/* Detailed Sequence Analysis */}
          {fractalTrendResult.detailedAnalysis && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Sequence Analysis (ALL Fractals)</CardTitle>
                <CardDescription className="text-xs">
                  Complete analysis of {fractalTrendResult.detailedAnalysis.highSequence.length} highs and {fractalTrendResult.detailedAnalysis.lowSequence.length} lows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* High Sequence */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-xs font-medium">High Sequence</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {getSequenceIcon(fractalTrendResult.detailedAnalysis.highAnalysis.overallTrend)}
                        <span className="text-xs font-bold">
                          {fractalTrendResult.detailedAnalysis.highAnalysis.overallTrend.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Ascending:</span>
                        <span className="ml-1 font-mono">{fractalTrendResult.detailedAnalysis.highAnalysis.moveCount.ascending}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Descending:</span>
                        <span className="ml-1 font-mono">{fractalTrendResult.detailedAnalysis.highAnalysis.moveCount.descending}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Strength:</span>
                        <span className="ml-1 font-mono">{fractalTrendResult.detailedAnalysis.highAnalysis.trendStrength.toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Max Consec:</span>
                        <span className="ml-1 font-mono">{fractalTrendResult.detailedAnalysis.highAnalysis.patternDetails.maxConsecutiveAscending}</span>
                      </div>
                    </div>
                  </div>

                  {/* Low Sequence */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-xs font-medium">Low Sequence</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {getSequenceIcon(fractalTrendResult.detailedAnalysis.lowAnalysis.overallTrend)}
                        <span className="text-xs font-bold">
                          {fractalTrendResult.detailedAnalysis.lowAnalysis.overallTrend.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Ascending:</span>
                        <span className="ml-1 font-mono">{fractalTrendResult.detailedAnalysis.lowAnalysis.moveCount.ascending}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Descending:</span>
                        <span className="ml-1 font-mono">{fractalTrendResult.detailedAnalysis.lowAnalysis.moveCount.descending}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Strength:</span>
                        <span className="ml-1 font-mono">{fractalTrendResult.detailedAnalysis.lowAnalysis.trendStrength.toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Max Consec:</span>
                        <span className="ml-1 font-mono">{fractalTrendResult.detailedAnalysis.lowAnalysis.patternDetails.maxConsecutiveDescending}</span>
                      </div>
                    </div>
                  </div>

                  {/* Overall Consistency */}
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Trend Consistency</span>
                      <span className="text-xs font-bold">
                        {fractalTrendResult.detailedAnalysis.overallPattern.trendConsistency.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Key Fractal Levels */}
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

          {/* Enhanced Recommendations */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Enhanced Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-xs text-muted-foreground space-y-1">
                {fractalTrendResult.recommendations.slice(0, 6).map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Enhanced Analysis Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Enhanced Analysis Details</CardTitle>
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
  );
}
