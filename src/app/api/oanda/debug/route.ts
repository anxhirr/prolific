import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const apiKey =
      "d14032539d0ad19e78259a10d9d5f733-0c1c6513bf19879c697b352447409af9";


    // First, let's test if the API key is valid by trying to access the v20 endpoint
    const v20Response = await fetch(
      "https://api-fxpractice.oanda.com/v20/accounts",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (v20Response.ok) {
      const v20Data = await v20Response.json();
    }

    // Test the accounts endpoint first (try practice environment)
    let accountsResponse = await fetch(
      "https://api-fxpractice.oanda.com/v3/accounts",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Accept-Datetime-Format": "UNIX",
        },
      }
    );

    // If practice fails, try live environment
    if (!accountsResponse.ok) {
      accountsResponse = await fetch(
        "https://api-fxtrade.oanda.com/v3/accounts",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "Accept-Datetime-Format": "UNIX",
          },
        }
      );
    }

    if (!accountsResponse.ok) {
      const errorText = await accountsResponse.text();
      return NextResponse.json(
        {
          error: "Failed to fetch accounts",
          status: accountsResponse.status,
          statusText: accountsResponse.statusText,
          response: errorText,
        },
        { status: 400 }
      );
    }

    const accountsData = await accountsResponse.json();

    if (!accountsData.accounts || accountsData.accounts.length === 0) {
      return NextResponse.json(
        {
          error: "No accounts found",
          accountsData,
        },
        { status: 400 }
      );
    }

    const accountId = accountsData.accounts[0].id;
    const baseUrl = accountsResponse.url.includes("fxtrade")
      ? "https://api-fxtrade.oanda.com/v3"
      : "https://api-fxpractice.oanda.com/v3";


    // Now test the instruments endpoint
    const instrumentsResponse = await fetch(
      `${baseUrl}/accounts/${accountId}/instruments`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Accept-Datetime-Format": "UNIX",
        },
      }
    );

    if (!instrumentsResponse.ok) {
      const errorText = await instrumentsResponse.text();
      return NextResponse.json(
        {
          error: "Failed to fetch instruments",
          status: instrumentsResponse.status,
          statusText: instrumentsResponse.statusText,
          response: errorText,
          accountId,
        },
        { status: 400 }
      );
    }

    const instrumentsData = await instrumentsResponse.json();

    return NextResponse.json({
      success: true,
      accountId,
      accountCount: accountsData.accounts.length,
      instrumentCount: instrumentsData.instruments?.length || 0,
      sampleInstruments: instrumentsData.instruments?.slice(0, 5) || [],
      baseUrl,
      apiKeyPrefix: apiKey.substring(0, 10) + "...",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Debug failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
