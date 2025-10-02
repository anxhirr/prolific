import type { FractalPoint } from './trend-detection';
import type { CandlestickData } from './types';
import { detectFractals } from './trend-detection';

/**
 * Enhanced fractal sequence analysis that considers ALL fractals, not just recent ones
 */
export interface FractalSequenceAnalysis {
  overallTrend: 'ascending' | 'descending' | 'sideways';
  trendStrength: number;
  consecutiveMoves: number;
  averageMove: number;
  consistency: number;
  moveCount: {
    ascending: number;
    descending: number;
    total: number;
  };
  patternDetails: {
    maxConsecutiveAscending: number;
    maxConsecutiveDescending: number;
    recentDirection: 'ascending' | 'descending' | 'sideways';
    sequenceLength: number;
  };
}

/**
 * Enhanced fractal pattern analysis that uses complete sequences
 */
export interface EnhancedFractalPatternAnalysis {
  recentFractals: {
    lastHigh: FractalPoint | null;
    lastLow: FractalPoint | null;
    previousHigh: FractalPoint | null;
    previousLow: FractalPoint | null;
  };
  highSequence: FractalPoint[];
  lowSequence: FractalPoint[];
  highAnalysis: FractalSequenceAnalysis;
  lowAnalysis: FractalSequenceAnalysis;
  overallPattern: {
    isHigherHigh: boolean;
    isLowerHigh: boolean;
    isHigherLow: boolean;
    isLowerLow: boolean;
    patternStrength: number;
    trendConsistency: number;
  };
}

/**
 * Enhanced fractal trend result with comprehensive analysis
 */
export interface EnhancedFractalTrendResult {
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
  detailedAnalysis: EnhancedFractalPatternAnalysis;
}

/**
 * Analyze a complete sequence of fractal points (highs or lows) using ALL data points
 * This is the key improvement - analyzing the entire sequence, not just recent pairs
 */
export function analyzeFractalSequence(sequence: FractalPoint[]): FractalSequenceAnalysis {
  if (sequence.length < 2) {
    return {
      overallTrend: 'sideways',
      trendStrength: 0,
      consecutiveMoves: 0,
      averageMove: 0,
      consistency: 0,
      moveCount: { ascending: 0, descending: 0, total: 0 },
      patternDetails: {
        maxConsecutiveAscending: 0,
        maxConsecutiveDescending: 0,
        recentDirection: 'sideways',
        sequenceLength: sequence.length
      }
    };
  }
  
  let ascendingMoves = 0;
  let descendingMoves = 0;
  let totalMove = 0;
  let consecutiveAscending = 0;
  let consecutiveDescending = 0;
  let maxConsecutiveAscending = 0;
  let maxConsecutiveDescending = 0;
  let recentDirection: 'ascending' | 'descending' | 'sideways' = 'sideways';
  
  // Analyze each consecutive pair in the ENTIRE sequence
  for (let i = 1; i < sequence.length; i++) {
    const current = sequence[i];
    const previous = sequence[i - 1];
    const priceDiff = (current.price - previous.price) / previous.price;
    
    totalMove += Math.abs(priceDiff);
    
    // Determine the direction of this move
    if (priceDiff > 0.001) { // Higher than previous (ascending)
      ascendingMoves++;
      consecutiveAscending++;
      consecutiveDescending = 0;
      maxConsecutiveAscending = Math.max(maxConsecutiveAscending, consecutiveAscending);
      
      // Track recent direction (last 3 moves)
      if (i >= sequence.length - 3) {
        recentDirection = 'ascending';
      }
    } else if (priceDiff < -0.001) { // Lower than previous (descending)
      descendingMoves++;
      consecutiveDescending++;
      consecutiveAscending = 0;
      maxConsecutiveDescending = Math.max(maxConsecutiveDescending, consecutiveDescending);
      
      // Track recent direction (last 3 moves)
      if (i >= sequence.length - 3) {
        recentDirection = 'descending';
      }
    } else {
      // Equal or within noise threshold
      consecutiveAscending = 0;
      consecutiveDescending = 0;
      
      // Track recent direction (last 3 moves)
      if (i >= sequence.length - 3) {
        recentDirection = 'sideways';
      }
    }
  }
  
  const totalMoves = ascendingMoves + descendingMoves;
  const averageMove = totalMoves > 0 ? totalMove / totalMoves : 0;
  
  // Determine overall trend based on majority of moves across ALL fractals
  let overallTrend: 'ascending' | 'descending' | 'sideways';
  const ascendingRatio = totalMoves > 0 ? ascendingMoves / totalMoves : 0;
  const descendingRatio = totalMoves > 0 ? descendingMoves / totalMoves : 0;
  
  if (ascendingRatio > 0.6) { // 60% or more ascending moves
    overallTrend = 'ascending';
  } else if (descendingRatio > 0.6) { // 60% or more descending moves
    overallTrend = 'descending';
  } else {
    overallTrend = 'sideways';
  }
  
  // Calculate trend strength (0-100) based on multiple factors
  const trendRatio = Math.max(ascendingRatio, descendingRatio);
  const consecutiveBonus = Math.max(maxConsecutiveAscending, maxConsecutiveDescending) * 8;
  const moveMagnitudeBonus = averageMove * 200; // Scale average move impact
  const consistencyBonus = Math.abs(ascendingRatio - descendingRatio) * 30;
  
  const trendStrength = Math.min(
    (trendRatio * 50) + consecutiveBonus + moveMagnitudeBonus + consistencyBonus, 
    100
  );
  
  // Calculate consistency (how consistent the moves are in one direction)
  const consistency = Math.abs(ascendingRatio - descendingRatio) * 100;
  
  return {
    overallTrend,
    trendStrength,
    consecutiveMoves: Math.max(maxConsecutiveAscending, maxConsecutiveDescending),
    averageMove: averageMove * 100, // Convert to percentage
    consistency,
    moveCount: {
      ascending: ascendingMoves,
      descending: descendingMoves,
      total: totalMoves
    },
    patternDetails: {
      maxConsecutiveAscending,
      maxConsecutiveDescending,
      recentDirection,
      sequenceLength: sequence.length
    }
  };
}

/**
 * Enhanced fractal pattern analysis using ALL fractals, not just recent ones
 */
export function analyzeEnhancedFractalPattern(fractals: FractalPoint[]): EnhancedFractalPatternAnalysis {
  const highs = fractals.filter(f => f.type === 'high').sort((a, b) => a.index - b.index);
  const lows = fractals.filter(f => f.type === 'low').sort((a, b) => a.index - b.index);
  
  const recentFractals = {
    lastHigh: highs.length > 0 ? highs[highs.length - 1] : null,
    lastLow: lows.length > 0 ? lows[lows.length - 1] : null,
    previousHigh: highs.length > 1 ? highs[highs.length - 2] : null,
    previousLow: lows.length > 1 ? lows[lows.length - 2] : null,
  };
  
  // Analyze COMPLETE sequences of highs and lows (KEY IMPROVEMENT)
  const highAnalysis = analyzeFractalSequence(highs);
  const lowAnalysis = analyzeFractalSequence(lows);
  
  // Overall trend assessment based on complete sequences
  const isHigherHigh = highAnalysis.overallTrend === 'ascending';
  const isLowerHigh = highAnalysis.overallTrend === 'descending';
  const isHigherLow = lowAnalysis.overallTrend === 'ascending';
  const isLowerLow = lowAnalysis.overallTrend === 'descending';
  
  // Calculate overall pattern strength based on ALL fractals
  const patternStrength = (highAnalysis.trendStrength + lowAnalysis.trendStrength) / 2;
  
  // Calculate trend consistency (how well highs and lows agree)
  const trendConsistency = Math.abs(
    (highAnalysis.consistency + lowAnalysis.consistency) / 2
  );
  
  return {
    recentFractals,
    highSequence: highs,
    lowSequence: lows,
    highAnalysis,
    lowAnalysis,
    overallPattern: {
      isHigherHigh,
      isLowerHigh,
      isHigherLow,
      isLowerLow,
      patternStrength,
      trendConsistency
    }
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
 * Enhanced trend detection using complete fractal analysis
 * This analyzes ALL fractals in the sequence, not just recent ones
 */
export function detectEnhancedFractalTrend(
  candles: CandlestickData[],
  options: { minFractals?: number; useTimeDecay?: boolean; confidenceThreshold?: number; strengthThreshold?: number } = {}
): EnhancedFractalTrendResult {
  const {
    minFractals = 3, // Require at least 3 fractals for better analysis
    useTimeDecay = true,
    confidenceThreshold = 0.6,
    strengthThreshold = 0
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
      recommendations: ['Wait for more price data to perform fractal trend analysis'],
      detailedAnalysis: {
        recentFractals: {
          lastHigh: null,
          lastLow: null,
          previousHigh: null,
          previousLow: null,
        },
        highSequence: [],
        lowSequence: [],
        highAnalysis: {
          overallTrend: 'sideways' as const,
          trendStrength: 0,
          consecutiveMoves: 0,
          averageMove: 0,
          consistency: 0,
          moveCount: { ascending: 0, descending: 0, total: 0 },
          patternDetails: {
            maxConsecutiveAscending: 0,
            maxConsecutiveDescending: 0,
            recentDirection: 'sideways' as const,
            sequenceLength: 0
          }
        },
        lowAnalysis: {
          overallTrend: 'sideways' as const,
          trendStrength: 0,
          consecutiveMoves: 0,
          averageMove: 0,
          consistency: 0,
          moveCount: { ascending: 0, descending: 0, total: 0 },
          patternDetails: {
            maxConsecutiveAscending: 0,
            maxConsecutiveDescending: 0,
            recentDirection: 'sideways' as const,
            sequenceLength: 0
          }
        },
        overallPattern: {
          isHigherHigh: false,
          isLowerHigh: false,
          isHigherLow: false,
          isLowerLow: false,
          patternStrength: 0,
          trendConsistency: 0
        }
      }
    };
  }

  // Detect fractals using existing function
  const fractals = detectFractals(candles, { strengthThreshold });
  const highs = fractals.filter(f => f.type === 'high');
  const lows = fractals.filter(f => f.type === 'low');
  
  if (highs.length < minFractals || lows.length < minFractals) {
    return {
      trend: 'INSUFFICIENT_DATA',
      confidence: 0,
      pattern: 'Insufficient fractals for enhanced analysis',
      recentFractals: {
        lastHigh: highs.length > 0 ? highs[highs.length - 1] : null,
        lastLow: lows.length > 0 ? lows[lows.length - 1] : null,
        previousHigh: highs.length > 1 ? highs[highs.length - 2] : null,
        previousLow: lows.length > 1 ? lows[lows.length - 2] : null,
      },
      trendStrength: 0,
      analysis: `Need at least ${minFractals} highs and ${minFractals} lows for comprehensive analysis. Found ${highs.length} highs, ${lows.length} lows`,
      recommendations: ['Wait for more swing points to form before enhanced trend analysis'],
      detailedAnalysis: {
        recentFractals: {
          lastHigh: null,
          lastLow: null,
          previousHigh: null,
          previousLow: null,
        },
        highSequence: [],
        lowSequence: [],
        highAnalysis: {
          overallTrend: 'sideways' as const,
          trendStrength: 0,
          consecutiveMoves: 0,
          averageMove: 0,
          consistency: 0,
          moveCount: { ascending: 0, descending: 0, total: 0 },
          patternDetails: {
            maxConsecutiveAscending: 0,
            maxConsecutiveDescending: 0,
            recentDirection: 'sideways' as const,
            sequenceLength: 0
          }
        },
        lowAnalysis: {
          overallTrend: 'sideways' as const,
          trendStrength: 0,
          consecutiveMoves: 0,
          averageMove: 0,
          consistency: 0,
          moveCount: { ascending: 0, descending: 0, total: 0 },
          patternDetails: {
            maxConsecutiveAscending: 0,
            maxConsecutiveDescending: 0,
            recentDirection: 'sideways' as const,
            sequenceLength: 0
          }
        },
        overallPattern: {
          isHigherHigh: false,
          isLowerHigh: false,
          isHigherLow: false,
          isLowerLow: false,
          patternStrength: 0,
          trendConsistency: 0
        }
      }
    };
  }

  // Analyze enhanced fractal patterns using ALL fractals
  const detailedAnalysis = analyzeEnhancedFractalPattern(fractals);
  const { isHigherHigh, isLowerHigh, isHigherLow, isLowerLow, patternStrength, trendConsistency } = detailedAnalysis.overallPattern;

  // Enhanced trend classification based on complete analysis
  let trend: 'UPTREND' | 'DOWNTREND' | 'SIDEWAYS';
  let pattern: string;
  let confidence: number;

  // Strong uptrend: Both sequences ascending with high consistency
  if (isHigherHigh && isHigherLow && trendConsistency > 70) {
    trend = 'UPTREND';
    pattern = `Strong Uptrend - All ${detailedAnalysis.highSequence.length} highs and ${detailedAnalysis.lowSequence.length} lows showing ascending pattern`;
    confidence = Math.min(0.85 + (patternStrength / 100) * 0.15, 1.0);
  }
  // Moderate uptrend: One clear ascending sequence
  else if ((isHigherHigh && !isLowerLow) || (isHigherLow && !isLowerHigh)) {
    trend = 'UPTREND';
    const dominantSequence = isHigherHigh ? 'highs' : 'lows';
    const highMoveRatio = detailedAnalysis.highAnalysis.moveCount.total > 0 ? 
      (detailedAnalysis.highAnalysis.moveCount.ascending / detailedAnalysis.highAnalysis.moveCount.total) * 100 : 0;
    const lowMoveRatio = detailedAnalysis.lowAnalysis.moveCount.total > 0 ? 
      (detailedAnalysis.lowAnalysis.moveCount.ascending / detailedAnalysis.lowAnalysis.moveCount.total) * 100 : 0;
    
    pattern = `Moderate Uptrend - ${dominantSequence} showing ${isHigherHigh ? highMoveRatio.toFixed(1) : lowMoveRatio.toFixed(1)}% ascending moves`;
    confidence = Math.min(0.60 + (patternStrength / 100) * 0.25, 0.85);
  }
  // Strong downtrend: Both sequences descending with high consistency
  else if (isLowerHigh && isLowerLow && trendConsistency > 70) {
    trend = 'DOWNTREND';
    pattern = `Strong Downtrend - All ${detailedAnalysis.highSequence.length} highs and ${detailedAnalysis.lowSequence.length} lows showing descending pattern`;
    confidence = Math.min(0.85 + (patternStrength / 100) * 0.15, 1.0);
  }
  // Moderate downtrend: One clear descending sequence
  else if ((isLowerHigh && !isHigherLow) || (isLowerLow && !isHigherHigh)) {
    trend = 'DOWNTREND';
    const dominantSequence = isLowerHigh ? 'highs' : 'lows';
    const highMoveRatio = detailedAnalysis.highAnalysis.moveCount.total > 0 ? 
      (detailedAnalysis.highAnalysis.moveCount.descending / detailedAnalysis.highAnalysis.moveCount.total) * 100 : 0;
    const lowMoveRatio = detailedAnalysis.lowAnalysis.moveCount.total > 0 ? 
      (detailedAnalysis.lowAnalysis.moveCount.descending / detailedAnalysis.lowAnalysis.moveCount.total) * 100 : 0;
    
    pattern = `Moderate Downtrend - ${dominantSequence} showing ${isLowerHigh ? highMoveRatio.toFixed(1) : lowMoveRatio.toFixed(1)}% descending moves`;
    confidence = Math.min(0.60 + (patternStrength / 100) * 0.25, 0.85);
  }
  // Sideways: Mixed or conflicting signals
  else {
    trend = 'SIDEWAYS';
    pattern = `Sideways - Mixed signals across ${detailedAnalysis.highSequence.length} highs and ${detailedAnalysis.lowSequence.length} lows`;
    confidence = Math.min(0.40 + (patternStrength / 100) * 0.20, 0.60);
  }

  // Apply time decay if enabled
  if (useTimeDecay && detailedAnalysis.recentFractals.lastHigh && detailedAnalysis.recentFractals.previousHigh) {
    const decayFactor = calculateTimeDecay(
      detailedAnalysis.recentFractals.lastHigh,
      detailedAnalysis.recentFractals.previousHigh
    );
    confidence *= decayFactor;
  }

  // Ensure confidence is within bounds
  confidence = Math.max(0, Math.min(1, confidence));

  // Enhanced analysis text showing ALL fractal data
  const analysis = `Enhanced Fractal Trend Analysis (ALL ${fractals.length} fractals):
- High Sequence: ${detailedAnalysis.highAnalysis.moveCount.ascending} ascending, ${detailedAnalysis.highAnalysis.moveCount.descending} descending moves (${detailedAnalysis.highSequence.length} total highs)
- Low Sequence: ${detailedAnalysis.lowAnalysis.moveCount.ascending} ascending, ${detailedAnalysis.lowAnalysis.moveCount.descending} descending moves (${detailedAnalysis.lowSequence.length} total lows)
- High Trend: ${detailedAnalysis.highAnalysis.overallTrend} (${detailedAnalysis.highAnalysis.trendStrength.toFixed(1)}% strength, ${detailedAnalysis.highAnalysis.consistency.toFixed(1)}% consistency)
- Low Trend: ${detailedAnalysis.lowAnalysis.overallTrend} (${detailedAnalysis.lowAnalysis.trendStrength.toFixed(1)}% strength, ${detailedAnalysis.lowAnalysis.consistency.toFixed(1)}% consistency)
- Trend Consistency: ${trendConsistency.toFixed(1)}%
- Max Consecutive: ${Math.max(detailedAnalysis.highAnalysis.patternDetails.maxConsecutiveAscending, detailedAnalysis.highAnalysis.patternDetails.maxConsecutiveDescending)} moves
- Average Move Size: ${((detailedAnalysis.highAnalysis.averageMove + detailedAnalysis.lowAnalysis.averageMove) / 2).toFixed(3)}%
- Overall Pattern: ${pattern}
- Confidence: ${(confidence * 100).toFixed(1)}%`;

  const recommendations = [
    `Analysis based on ${fractals.length} total fractals (${detailedAnalysis.highSequence.length} highs, ${detailedAnalysis.lowSequence.length} lows)`,
    `High sequence: ${detailedAnalysis.highAnalysis.moveCount.ascending} up moves vs ${detailedAnalysis.highAnalysis.moveCount.descending} down moves`,
    `Low sequence: ${detailedAnalysis.lowAnalysis.moveCount.ascending} up moves vs ${detailedAnalysis.lowAnalysis.moveCount.descending} down moves`,
    `Trend consistency: ${trendConsistency.toFixed(1)}% (higher = more reliable)`,
    `Max consecutive moves: ${Math.max(detailedAnalysis.highAnalysis.patternDetails.maxConsecutiveAscending, detailedAnalysis.highAnalysis.patternDetails.maxConsecutiveDescending)}`,
    'Enhanced analysis considers ALL fractal movements, not just recent ones',
    'This provides a more comprehensive view of market structure evolution'
  ];

  return {
    trend,
    confidence,
    pattern,
    recentFractals: detailedAnalysis.recentFractals,
    trendStrength: Math.min(patternStrength / 100, 1),
    analysis,
    recommendations,
    detailedAnalysis
  };
}
