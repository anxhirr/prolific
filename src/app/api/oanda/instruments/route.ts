import { OandaService } from "@/lib/oanda-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get the API key from the request query or use environment variable or fallback to provided key
    const { searchParams } = new URL(request.url);
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

    // Fetch forex instruments with pricing
    const instruments = await oandaService.getInstrumentsWithPricing();

    return NextResponse.json({
      instruments: instruments.slice(0, 20), // Limit to first 20
      total: instruments.length,
      filtered: instruments.length,
    });
  } catch (error) {

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Failed to fetch instruments from OANDA",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

// Alternative endpoint to get all instruments (no filtering)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, accountId } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OANDA API key is required" },
        { status: 400 }
      );
    }

    const oandaService = new OandaService(apiKey, accountId, "practice");

    // Get all instruments without filtering
    const instruments = await oandaService.getInstruments();

    return NextResponse.json({
      instruments,
      total: instruments.length,
    });
  } catch (error) {

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Failed to fetch instruments from OANDA",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
