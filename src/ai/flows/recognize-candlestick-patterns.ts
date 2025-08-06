//Recognize candlestick patterns on the chart and provide insights about potential trading opportunities.

'use server';

/**
 * @fileOverview Candlestick pattern recognition AI agent.
 *
 * - recognizeCandlestickPatterns - A function that handles the candlestick pattern recognition process.
 * - RecognizeCandlestickPatternsInput - The input type for the recognizeCandlestickPatterns function.
 * - RecognizeCandlestickPatternsOutput - The return type for the recognizeCandlestickPatterns function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecognizeCandlestickPatternsInputSchema = z.object({
  chartData: z
    .string()
    .describe(
      'Candlestick chart data as a string. Each line represents a candlestick with open, high, low, close values separated by commas.'
    ),
});
export type RecognizeCandlestickPatternsInput = z.infer<typeof RecognizeCandlestickPatternsInputSchema>;

const RecognizeCandlestickPatternsOutputSchema = z.object({
  patternRecognized: z.boolean().describe('Whether a meaningful candlestick pattern was recognized.'),
  patternName: z.string().describe('The name of the recognized candlestick pattern.'),
  tradingSignal: z.string().describe('The trading signal associated with the pattern (e.g., bullish, bearish, neutral).'),
  confidence: z.number().describe('The confidence level (0-1) of the pattern recognition.'),
  explanation: z.string().describe('Explanation of the identified pattern and its implications.'),
});
export type RecognizeCandlestickPatternsOutput = z.infer<typeof RecognizeCandlestickPatternsOutputSchema>;

export async function recognizeCandlestickPatterns(input: RecognizeCandlestickPatternsInput): Promise<RecognizeCandlestickPatternsOutput> {
  return recognizeCandlestickPatternsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recognizeCandlestickPatternsPrompt',
  input: {schema: RecognizeCandlestickPatternsInputSchema},
  output: {schema: RecognizeCandlestickPatternsOutputSchema},
  prompt: `You are an expert financial analyst specializing in candlestick pattern recognition.

  Analyze the provided candlestick chart data and identify any meaningful patterns.
  If a pattern is recognized, provide the pattern name, trading signal (bullish, bearish, or neutral),
  confidence level (0-1), and a brief explanation of the pattern and its implications.

  If no meaningful pattern is found, set patternRecognized to false and provide a message that no actionable pattern was detected.
  Avoid extraneous content; the output should be concise and focused on the identified pattern or lack thereof.

  Chart Data:
  {{chartData}}
  `,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
    ],
  },
});

const recognizeCandlestickPatternsFlow = ai.defineFlow(
  {
    name: 'recognizeCandlestickPatternsFlow',
    inputSchema: RecognizeCandlestickPatternsInputSchema,
    outputSchema: RecognizeCandlestickPatternsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
