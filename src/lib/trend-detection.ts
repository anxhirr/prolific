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

export interface FractalTrendOptions {
  minFractals?: number;
  useTimeDecay?: boolean;
  confidenceThreshold?: number;
}

export interface FractalTrendResult {
  trend: 'UPTREND' | 'DOWNTREND' | 'SIDEWAYS' | 'INSUFFICIENT_DATA';
  confidence: number;
  pattern: string;
  recentFractals: {
    lastHigh: FractalPoint | null;
    lastLow: FractalPoint | null;
    previousHigh: FractalPoint | null;
    previousLow: FractalPoint | null;
  };
  trendStrength: number;
  analysis: string;
  recommendations: string[];
}

export interface FractalPatternAnalysis {
  recentFractals: {
    lastHigh: FractalPoint | null;
    lastLow: FractalPoint | null;
    previousHigh: FractalPoint | null;
    previousLow: FractalPoint | null;
  };
  highSequence: FractalPoint[];
  lowSequence: FractalPoint[];
  isHigherHigh: boolean;
  isLowerHigh: boolean;
  isHigherLow: boolean;
  isLowerLow: boolean;
  patternStrength: number;
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

/**
 * Analyze fractal patterns to detect market structure
 */
function analyzeFractalPattern(fractals: FractalPoint[]): FractalPatternAnalysis {
  const highs = fractals.filter(f => f.type === 'high').sort((a, b) => a.index - b.index);
  const lows = fractals.filter(f => f.type === 'low').sort((a, b) => a.index - b.index);
  
  const recentFractals = {
    lastHigh: highs.length > 0 ? highs[highs.length - 1] : null,
    lastLow: lows.length > 0 ? lows[lows.length - 1] : null,
    previousHigh: highs.length > 1 ? highs[highs.length - 2] : null,
    previousLow: lows.length > 1 ? lows[lows.length - 2] : null,
  };
  
  // Analyze pattern relationships
  let isHigherHigh = false;
  let isLowerHigh = false;
  let isHigherLow = false;
  let isLowerLow = false;
  let patternStrength = 0;
  
  if (recentFractals.lastHigh && recentFractals.previousHigh) {
    const priceDiff = (recentFractals.lastHigh.price - recentFractals.previousHigh.price) / recentFractals.previousHigh.price;
    isHigherHigh = priceDiff > 0.001; // 0.1% threshold to avoid noise
    isLowerHigh = priceDiff < -0.001;
    patternStrength += Math.abs(priceDiff) * 50; // Scale for strength calculation
  }
  
  if (recentFractals.lastLow && recentFractals.previousLow) {
    const priceDiff = (recentFractals.lastLow.price - recentFractals.previousLow.price) / recentFractals.previousLow.price;
    isHigherLow = priceDiff > 0.001;
    isLowerLow = priceDiff < -0.001;
    patternStrength += Math.abs(priceDiff) * 50;
  }
  
  return {
    recentFractals,
    highSequence: highs,
    lowSequence: lows,
    isHigherHigh,
    isLowerHigh,
    isHigherLow,
    isLowerLow,
    patternStrength: Math.min(patternStrength, 100), // Cap at 100
  };
}

/**
 * Calculate time decay factor for fractal analysis
 */
function calculateTimeDecay(lastFractal: FractalPoint, previousFractal: FractalPoint): number {
  const timeDiff = new Date(lastFractal.date).getTime() - new Date(previousFractal.date).getTime();
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
  
  // Decay factor: more recent fractals have higher weight
  // After 30 days, decay factor becomes 0.5
  return Math.max(0.1, Math.exp(-daysDiff / 30));
}

/**
 * Detect market trend using fractal analysis (swing points)
 * This is completely separate from the moving average trend detection
 */
export function detectFractalTrend(
  candles: CandlestickData[],
  options: FractalTrendOptions = {}
): FractalTrendResult {
  const {
    minFractals = 2,
    useTimeDecay = true,
    confidenceThreshold = 0.6
  } = options;

  // Validate input
  if (candles.length < 5) {
    return {
      trend: 'INSUFFICIENT_DATA',
      confidence: 0,
      pattern: 'Insufficient data for fractal analysis',
      recentFractals: {
        lastHigh: null,
        lastLow: null,
        previousHigh: null,
        previousLow: null,
      },
      trendStrength: 0,
      analysis: 'Need at least 5 candles for fractal analysis',
      recommendations: ['Wait for more price data to perform fractal trend analysis']
    };
  }

  // Detect fractals using existing function
  const fractals = detectFractals(candles);
  const highs = fractals.filter(f => f.type === 'high');
  const lows = fractals.filter(f => f.type === 'low');

  // Check if we have enough fractals for analysis
  if (highs.length < minFractals || lows.length < minFractals) {
    return {
      trend: 'INSUFFICIENT_DATA',
      confidence: 0,
      pattern: 'Insufficient fractals for trend analysis',
      recentFractals: {
        lastHigh: highs.length > 0 ? highs[highs.length - 1] : null,
        lastLow: lows.length > 0 ? lows[lows.length - 1] : null,
        previousHigh: highs.length > 1 ? highs[highs.length - 2] : null,
        previousLow: lows.length > 1 ? lows[lows.length - 2] : null,
      },
      trendStrength: 0,
      analysis: `Need at least ${minFractals} highs and ${minFractals} lows. Found ${highs.length} highs, ${lows.length} lows`,
      recommendations: ['Wait for more swing points to form before trend analysis']
    };
  }

  // Analyze fractal patterns
  const patternAnalysis = analyzeFractalPattern(fractals);
  const { isHigherHigh, isLowerHigh, isHigherLow, isLowerLow, patternStrength } = patternAnalysis;

  // Determine trend direction and pattern
  let trend: 'UPTREND' | 'DOWNTREND' | 'SIDEWAYS';
  let pattern: string;
  let confidence: number;
  let trendStrength: number;

  // Strong uptrend: Higher Highs AND Higher Lows
  if (isHigherHigh && isHigherLow) {
    trend = 'UPTREND';
    pattern = 'Higher Highs + Higher Lows';
    confidence = 0.85 + (patternStrength / 100) * 0.15; // 85-100% confidence
    trendStrength = patternStrength;
  }
  // Moderate uptrend: Higher Highs OR Higher Lows (but not both clearly)
  else if (isHigherHigh || isHigherLow) {
    trend = 'UPTREND';
    pattern = isHigherHigh ? 'Higher Highs' : 'Higher Lows';
    confidence = 0.60 + (patternStrength / 100) * 0.25; // 60-85% confidence
    trendStrength = patternStrength * 0.7;
  }
  // Strong downtrend: Lower Highs AND Lower Lows
  else if (isLowerHigh && isLowerLow) {
    trend = 'DOWNTREND';
    pattern = 'Lower Highs + Lower Lows';
    confidence = 0.85 + (patternStrength / 100) * 0.15; // 85-100% confidence
    trendStrength = patternStrength;
  }
  // Moderate downtrend: Lower Highs OR Lower Lows
  else if (isLowerHigh || isLowerLow) {
    trend = 'DOWNTREND';
    pattern = isLowerHigh ? 'Lower Highs' : 'Lower Lows';
    confidence = 0.60 + (patternStrength / 100) * 0.25; // 60-85% confidence
    trendStrength = patternStrength * 0.7;
  }
  // Sideways: Mixed or equal levels
  else {
    trend = 'SIDEWAYS';
    pattern = 'Mixed/Equal Levels';
    confidence = 0.40 + (patternStrength / 100) * 0.20; // 40-60% confidence
    trendStrength = patternStrength * 0.3;
  }

  // Apply time decay if enabled
  if (useTimeDecay && patternAnalysis.recentFractals.lastHigh && patternAnalysis.recentFractals.previousHigh) {
    const decayFactor = calculateTimeDecay(
      patternAnalysis.recentFractals.lastHigh,
      patternAnalysis.recentFractals.previousHigh
    );
    confidence *= decayFactor;
  }

  // Ensure confidence is within bounds
  confidence = Math.max(0, Math.min(1, confidence));

  // Generate analysis text
  const analysis = `Fractal Trend Analysis:
- Pattern: ${pattern}
- Trend Direction: ${trend}
- Confidence: ${(confidence * 100).toFixed(1)}%
- Trend Strength: ${(trendStrength * 100).toFixed(1)}%
- Total Fractals: ${fractals.length} (${highs.length} highs, ${lows.length} lows)
- Analysis Period: ${candles.length} candles
- Latest High: ${patternAnalysis.recentFractals.lastHigh?.price.toFixed(5) || 'N/A'}
- Latest Low: ${patternAnalysis.recentFractals.lastLow?.price.toFixed(5) || 'N/A'}`;

  // Generate recommendations
  const recommendations = generateFractalTrendRecommendations(trend, confidence, patternAnalysis);

  return {
    trend,
    confidence,
    pattern,
    recentFractals: patternAnalysis.recentFractals,
    trendStrength: Math.min(trendStrength / 100, 1),
    analysis,
    recommendations,
  };
}

/**
 * Generate recommendations based on fractal trend analysis
 */
function generateFractalTrendRecommendations(
  trend: 'UPTREND' | 'DOWNTREND' | 'SIDEWAYS' | 'INSUFFICIENT_DATA',
  confidence: number,
  patternAnalysis: FractalPatternAnalysis
): string[] {
  const recommendations: string[] = [];

  switch (trend) {
    case 'UPTREND':
      if (confidence > 0.8) {
        recommendations.push('Strong uptrend confirmed by fractal structure');
        recommendations.push('Consider long positions on pullbacks to recent swing lows');
        recommendations.push('Place stop-loss below the most recent swing low');
      } else if (confidence > 0.6) {
        recommendations.push('Moderate uptrend with some fractal confirmation');
        recommendations.push('Proceed with caution - trend may be weakening');
        recommendations.push('Look for additional confirmation signals');
      } else {
        recommendations.push('Weak uptrend signals - wait for stronger confirmation');
        recommendations.push('Monitor for potential trend reversal');
      }
      break;

    case 'DOWNTREND':
      if (confidence > 0.8) {
        recommendations.push('Strong downtrend confirmed by fractal structure');
        recommendations.push('Consider short positions on bounces to recent swing highs');
        recommendations.push('Place stop-loss above the most recent swing high');
      } else if (confidence > 0.6) {
        recommendations.push('Moderate downtrend with some fractal confirmation');
        recommendations.push('Proceed with caution - trend may be weakening');
        recommendations.push('Look for additional confirmation signals');
      } else {
        recommendations.push('Weak downtrend signals - wait for stronger confirmation');
        recommendations.push('Monitor for potential trend reversal');
      }
      break;

    case 'SIDEWAYS':
      recommendations.push('Market is in consolidation phase');
      recommendations.push('Avoid trend-following strategies');
      recommendations.push('Look for breakout above recent highs or below recent lows');
      recommendations.push('Consider range-bound trading between support and resistance');
      break;

    case 'INSUFFICIENT_DATA':
      recommendations.push('Insufficient fractal data for trend analysis');
      recommendations.push('Wait for more swing points to form');
      recommendations.push('Use other analysis methods in the meantime');
      break;
  }

  // Add general recommendations
  if (patternAnalysis.recentFractals.lastHigh && patternAnalysis.recentFractals.lastLow) {
    const lastHigh = patternAnalysis.recentFractals.lastHigh;
    const lastLow = patternAnalysis.recentFractals.lastLow;
    
    recommendations.push(`Key resistance level: ${lastHigh.price.toFixed(5)}`);
    recommendations.push(`Key support level: ${lastLow.price.toFixed(5)}`);
    recommendations.push('Monitor price action around these fractal levels');
  }

  recommendations.push('Fractal trend analysis complements moving average analysis');
  recommendations.push('Always use proper risk management regardless of trend direction');

  return recommendations;
}
