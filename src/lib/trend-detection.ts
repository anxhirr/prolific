import type { CandlestickData } from './types';

export interface TrendAnalysisResult {
  trend: 'UPTREND' | 'DOWNTREND' | 'SIDEWAYS';
  confidence: number;
  uptrendCount: number;
  downtrendCount: number;
  trendStrength: number;
  maValue: number;
  currentPrice: number;
  uptrendPercentage: number;
  downtrendPercentage: number;
  analysis: string;
}

export interface TrendDetectionOptions {
  maPeriod?: number;
  useClosePrice?: boolean;
  useWeightedAnalysis?: boolean;
  trendThreshold?: number;
}

/**
 * Calculate Simple Moving Average for a given period
 */
function calculateSMA(candles: CandlestickData[], period: number, useClosePrice: boolean = true): number[] {
  const prices = candles.map(candle => useClosePrice ? candle.close : (candle.open + candle.close) / 2);
  const sma: number[] = [];
  
  for (let i = period - 1; i < prices.length; i++) {
    const sum = prices.slice(i - period + 1, i + 1).reduce((acc, price) => acc + price, 0);
    sma.push(sum / period);
  }
  
  return sma;
}

/**
 * Detect market trend using moving average analysis
 * 
 * @param candles - Array of candlestick data
 * @param options - Configuration options for trend detection
 * @returns Trend analysis result
 */
export function detectMarketTrend(
  candles: CandlestickData[], 
  options: TrendDetectionOptions = {}
): TrendAnalysisResult {
  const {
    maPeriod = 20,
    useClosePrice = true,
    useWeightedAnalysis = true,
    trendThreshold = 0.55
  } = options;

  // Validate input
  if (candles.length < maPeriod) {
    throw new Error(`Insufficient data: need at least ${maPeriod} candles, got ${candles.length}`);
  }

  if (candles.length === 0) {
    throw new Error('No candle data provided');
  }

  // Calculate moving average
  const sma = calculateSMA(candles, maPeriod, useClosePrice);
  const analysisCandles = candles.slice(maPeriod - 1); // Align with SMA data
  
  let uptrendCount = 0;
  let downtrendCount = 0;
  let uptrendStrength = 0;
  let downtrendStrength = 0;
  
  // Analyze each candle against its corresponding MA
  for (let i = 0; i < analysisCandles.length; i++) {
    const candle = analysisCandles[i];
    const maValue = sma[i];
    const price = useClosePrice ? candle.close : (candle.open + candle.close) / 2;
    
    if (price > maValue) {
      uptrendCount++;
      if (useWeightedAnalysis) {
        const deviation = (price - maValue) / maValue;
        uptrendStrength += deviation;
      }
    } else if (price < maValue) {
      downtrendCount++;
      if (useWeightedAnalysis) {
        const deviation = (maValue - price) / maValue;
        downtrendStrength += deviation;
      }
    }
    // If price === maValue, neither count increases (neutral)
  }
  
  const totalCandles = analysisCandles.length;
  const uptrendPercentage = uptrendCount / totalCandles;
  const downtrendPercentage = downtrendCount / totalCandles;
  
  // Determine overall trend
  let trend: 'UPTREND' | 'DOWNTREND' | 'SIDEWAYS';
  let confidence: number;
  let trendStrength: number;
  
  if (uptrendPercentage > trendThreshold) {
    trend = 'UPTREND';
    confidence = uptrendPercentage;
    trendStrength = useWeightedAnalysis && uptrendCount > 0 
      ? Math.min(uptrendStrength / uptrendCount, 1) 
      : uptrendPercentage;
  } else if (downtrendPercentage > trendThreshold) {
    trend = 'DOWNTREND';
    confidence = downtrendPercentage;
    trendStrength = useWeightedAnalysis && downtrendCount > 0 
      ? Math.min(downtrendStrength / downtrendCount, 1) 
      : downtrendPercentage;
  } else {
    trend = 'SIDEWAYS';
    confidence = Math.max(uptrendPercentage, downtrendPercentage);
    trendStrength = 1 - Math.abs(uptrendPercentage - downtrendPercentage);
  }
  
  // Generate analysis text
  const priceType = useClosePrice ? 'close price' : 'body center';
  const analysisType = useWeightedAnalysis ? 'magnitude-weighted' : 'simple counting';
  
  const analysis = `Market trend analysis using ${maPeriod}-period moving average:
- Analyzed ${totalCandles} candles using ${priceType}
- ${analysisType} method applied
- ${uptrendCount} uptrend signals (${(uptrendPercentage * 100).toFixed(1)}%)
- ${downtrendCount} downtrend signals (${(downtrendPercentage * 100).toFixed(1)}%)
- Overall trend: ${trend} with ${(confidence * 100).toFixed(1)}% confidence
- Trend strength: ${(trendStrength * 100).toFixed(1)}%`;

  return {
    trend,
    confidence,
    uptrendCount,
    downtrendCount,
    trendStrength: Math.min(trendStrength, 1),
    maValue: sma[sma.length - 1],
    currentPrice: candles[candles.length - 1].close,
    uptrendPercentage,
    downtrendPercentage,
    analysis,
  };
}

/**
 * Get trend recommendations based on analysis result
 */
export function getTrendRecommendations(result: TrendAnalysisResult): string[] {
  const recommendations: string[] = [];
  
  switch (result.trend) {
    case 'UPTREND':
      if (result.confidence > 0.7) {
        recommendations.push('Strong uptrend detected - consider long positions');
        recommendations.push('Look for pullbacks to moving average as entry opportunities');
      } else {
        recommendations.push('Moderate uptrend - consider long positions with caution');
        recommendations.push('Monitor for trend reversal signals');
      }
      break;
      
    case 'DOWNTREND':
      if (result.confidence > 0.7) {
        recommendations.push('Strong downtrend detected - consider short positions');
        recommendations.push('Look for bounces to moving average as entry opportunities');
      } else {
        recommendations.push('Moderate downtrend - consider short positions with caution');
        recommendations.push('Monitor for trend reversal signals');
      }
      break;
      
    case 'SIDEWAYS':
      recommendations.push('Market is consolidating - avoid trend-following strategies');
      recommendations.push('Look for breakout signals above or below key levels');
      recommendations.push('Consider range-bound trading strategies');
      break;
  }
  
  // Add risk management recommendations
  recommendations.push('Always use proper risk management and stop-loss orders');
  recommendations.push('Consider market volatility and news events');
  
  return recommendations;
}
