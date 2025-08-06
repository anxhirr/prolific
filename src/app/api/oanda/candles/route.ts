import { OandaService } from "@/lib/oanda-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get parameters from query string
    const instrument = searchParams.get("instrument") || "EUR_USD";
    const granularity = searchParams.get("granularity") || "D";
    const count = parseInt(searchParams.get("count") || "100");

    // Get the API key from the request query or use environment variable or fallback to provided key
    const apiKey =
      searchParams.get("apiKey") ||
      process.env.OANDA_API_KEY ||
      "d14032539d0ad19e78259a10d9d5f733-0c1c6513bf19879c697b352447409af9";

    if (!apiKey) {
      return NextResponse.json(
        { error: "OANDA API key is required" },
        { status: 400 }
      );
    }

    // Create OANDA service instance
    const oandaService = new OandaService(apiKey, undefined, "practice");

    // Test connection first
    const connectionTest = await oandaService.testConnection();
    if (!connectionTest) {
      return NextResponse.json(
        { error: "Failed to connect to OANDA API. Please check your API key." },
        { status: 401 }
      );
    }

    // Fetch candle data
    const candlesResponse = await oandaService.getCandles(
      instrument,
      granularity,
      count
    );

    return NextResponse.json({
      instrument: candlesResponse.instrument,
      granularity: candlesResponse.granularity,
      candles: candlesResponse.candles,
      count: candlesResponse.candles.length,
    });
  } catch (error) {
    console.error("Error in candles API:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Failed to fetch candles from OANDA",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
