import { OandaService } from "@/lib/oanda-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
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

    const oandaService = new OandaService(apiKey, undefined, "practice");

    // Test the connection
    const connectionResult = await oandaService.testConnection();

    if (!connectionResult) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to connect to OANDA API. Please check your API key.",
        },
        { status: 401 }
      );
    }

    // Get accounts to verify access
    const accounts = await oandaService.getAccounts();

    return NextResponse.json({
      success: true,
      message: "Successfully connected to OANDA API",
      accountCount: accounts.length,
      accounts: accounts.map((acc) => ({
        id: acc.id,
        alias: acc.alias,
        currency: acc.currency,
        balance: acc.balance,
      })),
    });
  } catch (error) {

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        success: false,
        error: "Failed to test OANDA connection",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
