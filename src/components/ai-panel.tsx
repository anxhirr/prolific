"use client";

import {
  recognizeCandlestickPatterns,
  type RecognizeCandlestickPatternsOutput,
} from "@/ai/flows/recognize-candlestick-patterns";
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
import { useToast } from "@/hooks/use-toast";
import type { CandlestickData } from "@/lib/types";
import {
  Loader2,
  Minus,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

interface AiPanelProps {
  chartData: CandlestickData[];
}

const SignalIcon = ({ signal }: { signal: string }) => {
  if (signal.toLowerCase().includes("bullish")) {
    return <TrendingUp className="h-5 w-5 text-chart-1" />;
  }
  if (signal.toLowerCase().includes("bearish")) {
    return <TrendingDown className="h-5 w-5 text-chart-2" />;
  }
  return <Minus className="h-5 w-5 text-muted-foreground" />;
};

export function AiPanel({ chartData }: AiPanelProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] =
    useState<RecognizeCandlestickPatternsOutput | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    setLoading(true);
    setResult(null);
    try {
      const chartDataString = chartData
        .map((d) => [d.open, d.high, d.low, d.close].join(","))
        .join("\n");

      const analysisResult = await recognizeCandlestickPatterns({
        chartData: chartDataString,
      });

      if (analysisResult.patternRecognized) {
        setResult(analysisResult);
      } else {
        toast({
          title: "No Pattern Detected",
          description:
            "The AI could not identify a significant candlestick pattern in the current data.",
        });
      }
    } catch (error) {
      console.error("AI analysis failed:", error);
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: "An error occurred while analyzing the chart.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4 h-full flex flex-col">
      <div className="space-y-1">
        <h2 className="text-lg font-headline font-semibold">Candlestick AI</h2>
        <p className="text-sm text-muted-foreground">
          Let our AI analyze the chart for candlestick patterns and provide
          insights.
        </p>
      </div>
      <Button onClick={handleAnalyze} disabled={loading} className="w-full">
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        Analyze Chart
      </Button>

      {loading && (
        <div className="flex flex-col items-center justify-center flex-grow text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="mt-2 text-sm">Analyzing patterns...</p>
        </div>
      )}

      {result && result.patternRecognized && (
        <Card className="bg-background/50 flex-grow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{result.patternName}</span>
              <SignalIcon signal={result.tradingSignal} />
            </CardTitle>
            <CardDescription>
              <Badge
                variant={
                  result.tradingSignal.toLowerCase().includes("bullish")
                    ? "default"
                    : result.tradingSignal.toLowerCase().includes("bearish")
                    ? "destructive"
                    : "secondary"
                }
                className="capitalize"
              >
                {result.tradingSignal}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Confidence
              </p>
              <div className="flex items-center gap-2">
                <Progress value={result.confidence * 100} className="w-full" />
                <span className="text-sm font-semibold">
                  {Math.round(result.confidence * 100)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Explanation
              </p>
              <p className="text-sm">{result.explanation}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !result && (
        <div className="flex flex-col items-center justify-center flex-grow text-muted-foreground text-center p-4">
          <Sparkles className="h-10 w-10 mb-2" />
          <p className="text-sm">
            Click "Analyze Chart" to get AI-powered insights.
          </p>
        </div>
      )}
    </div>
  );
}
