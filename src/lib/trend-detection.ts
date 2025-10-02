import type { CandlestickData } from './types';

export interface FractalPoint {
  type: 'high' | 'low';
  index: number;
  price: number;
  date: string;
  strength: number;
}

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

export interface FractalAnalysisResult {
  fractals: FractalPoint[];
  totalFractals: number;
  highFractals: number;
  lowFractals: number;
  analysis: string;
  recommendations: string[];
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
 * Detect fractal points using Bill Williams' fractal method
 * A fractal is a 5-candle pattern where the middle candle has the highest high or lowest low
 */
export function detectFractals(candles: CandlestickData[]): FractalPoint[] {
  const fractals: FractalPoint[] = [];
  
  // Need at least 5 candles to detect fractals
  if (candles.length < 5) {
    return fractals;
  }
  
  // Start from index 2 (3rd candle) and go to length-2 (3rd from last)
  for (let i = 2; i < candles.length - 2; i++) {
    const current = candles[i];
    const prev2 = candles[i - 2];
    const prev1 = candles[i - 1];
    const next1 = candles[i + 1];
    const next2 = candles[i + 2];
    
    // Check for bullish fractal (swing low)
    const isBullishFractal = 
      current.low < prev2.low && 
      current.low < prev1.low && 
      current.low < next1.low && 
      current.low < next2.low;
    
    // Check for bearish fractal (swing high)
    const isBearishFractal = 
      current.high > prev2.high && 
      current.high > prev1.high && 
      current.high > next1.high && 
      current.high > next2.high;
    
    if (isBullishFractal) {
      // Calculate fractal strength based on how much lower it is than surrounding candles
      const avgSurroundingLow = (prev2.low + prev1.low + next1.low + next2.low) / 4;
      const strength = Math.abs(current.low - avgSurroundingLow) / avgSurroundingLow;
      
      fractals.push({
        type: 'low',
        index: i,
        price: current.low,
        date: current.date,
        strength: Math.min(strength * 100, 10) // Cap at 10 for display purposes
      });
    }
    
    if (isBearishFractal) {
      // Calculate fractal strength based on how much higher it is than surrounding candles
      const avgSurroundingHigh = (prev2.high + prev1.high + next1.high + next2.high) / 4;
      const strength = Math.abs(current.high - avgSurroundingHigh) / avgSurroundingHigh;
      
      fractals.push({
        type: 'high',
        index: i,
        price: current.high,
        date: current.date,
        strength: Math.min(strength * 100, 10) // Cap at 10 for display purposes
      });
    }
  }
  
  return fractals;
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
 * Perform fractal analysis separately from trend analysis
 */
export function analyzeFractals(candles: CandlestickData[]): FractalAnalysisResult {
  // Validate input
  if (candles.length < 5) {
    throw new Error(`Insufficient data: need at least 5 candles for fractal analysis, got ${candles.length}`);
  }

  // Detect fractals
  const fractals = detectFractals(candles);
  const highFractals = fractals.filter(f => f.type === 'high');
  const lowFractals = fractals.filter(f => f.type === 'low');

  // Generate analysis
  const analysis = `Fractal Analysis Results:
- Total fractals detected: ${fractals.length}
- Swing highs: ${highFractals.length}
- Swing lows: ${lowFractals.length}
- Analysis period: ${candles.length} candles
- Latest fractal: ${fractals.length > 0 ? fractals[fractals.length - 1].type.toUpperCase() : 'None'} at ${fractals.length > 0 ? fractals[fractals.length - 1].price.toFixed(5) : 'N/A'}`;

  // Generate recommendations
  const recommendations: string[] = [];
  
  if (fractals.length === 0) {
    recommendations.push('No fractal points detected - market may be in strong trend');
    recommendations.push('Wait for more price action to identify swing points');
  } else {
    if (highFractals.length > 0) {
      const latestHigh = highFractals[highFractals.length - 1];
      recommendations.push(`Latest resistance level: ${latestHigh.price.toFixed(5)} (${latestHigh.date})`);
    }
    
    if (lowFractals.length > 0) {
      const latestLow = lowFractals[lowFractals.length - 1];
      recommendations.push(`Latest support level: ${latestLow.price.toFixed(5)} (${latestLow.date})`);
    }
    
    if (highFractals.length >= 2) {
      recommendations.push('Multiple resistance levels identified - look for breakouts');
    }
    
    if (lowFractals.length >= 2) {
      recommendations.push('Multiple support levels identified - monitor for bounces');
    }
    
    recommendations.push('Use fractal levels for stop-loss and take-profit placement');
    recommendations.push('Fractal breaks often lead to significant price moves');
  }

  return {
    fractals,
    totalFractals: fractals.length,
    highFractals: highFractals.length,
    lowFractals: lowFractals.length,
    analysis,
    recommendations,
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
