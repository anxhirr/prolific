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
  Target,
} from "lucide-react";
import { useState, useEffect } from "react";

interface FractalAnalysisTabProps {
  chartData: CandlestickData[];
}

export function FractalAnalysisTab({ chartData }: FractalAnalysisTabProps) {
  const [fractalResult, setFractalResult] = useState<FractalAnalysisResult | null>(null);
  const { toast } = useToast();

  const performAnalysis = () => {
    if (chartData.length < 5) {
      setFractalResult(null);
      return;
    }

    try {
      const analysisResult = analyzeFractals(chartData);
      setFractalResult(analysisResult);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: errorMessage,
      });
      setFractalResult(null);
    }
  };

  // Auto-analyze when component mounts or when chart data changes
  useEffect(() => {
    performAnalysis();
  }, [chartData]);

  const handleFractalAnalyze = () => {
    performAnalysis();
    if (fractalResult) {
      toast({
        title: "Fractal Analysis Complete",
        description: `Found ${fractalResult.totalFractals} fractal points (${fractalResult.highFractals} highs, ${fractalResult.lowFractals} lows).`,
      });
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Button 
        onClick={handleFractalAnalyze} 
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
            Need at least 5 candles for fractal analysis. Current: {chartData.length}
          </span>
        </div>
      )}

      {fractalResult && (
        <div className="space-y-3">
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
                Fractal points identified in the chart data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">High Fractals</span>
                </div>
                <span className="font-bold text-red-600">
                  {fractalResult.highFractals}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Low Fractals</span>
                </div>
                <span className="font-bold text-green-600">
                  {fractalResult.lowFractals}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Fractals</span>
                <span className="font-bold">
                  {fractalResult.totalFractals}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Fractal Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Fractal Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Fractal Period</span>
                  <span className="font-bold">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Analysis Method</span>
                  <span className="font-bold">Williams Fractals</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Data Points</span>
                  <span className="font-bold">{chartData.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Fractals */}
          {fractalResult.recentFractals.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Recent Fractal Points</CardTitle>
                <CardDescription className="text-xs">
                  Latest fractal points identified
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {fractalResult.recentFractals.slice(0, 5).map((fractal, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${fractal.type === 'high' ? 'bg-red-500' : 'bg-green-500'}`} />
                        <span className="text-xs font-medium">
                          {fractal.type === 'high' ? 'High' : 'Low'}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-xs">
                          {fractal.price.toFixed(5)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(fractal.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                {fractalResult.analysis}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
