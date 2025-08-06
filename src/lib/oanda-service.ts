import type {
  Instrument,
  OandaAccount,
  OandaCandlesResponse,
  OandaErrorResponse,
  OandaInstrumentsResponse,
  OandaPricingResponse,
} from "./oanda-types";

export class OandaService {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private accountId: string;

  constructor(
    apiKey: string,
    accountId?: string,
    environment: "live" | "practice" = "practice"
  ) {
    this.apiKey = apiKey;
    this.accountId = accountId || "";
    this.baseUrl =
      environment === "live"
        ? "https://api-fxtrade.oanda.com/v3"
        : "https://api-fxpractice.oanda.com/v3";

    console.log(`OANDA Service initialized with base URL: ${this.baseUrl}`);
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      console.log(`Making request to: ${url}`);
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "Accept-Datetime-Format": "UNIX",
          "User-Agent": "ChartWhisper/1.0",
        },
      });

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData: OandaErrorResponse = await response.json();
          errorMessage = errorData.errorMessage || errorMessage;
        } catch {
          // If we can't parse the error response, use the default message
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to fetch from OANDA API: ${String(error)}`);
    }
  }

  /**
   * Get all available instruments
   */
  async getInstruments(): Promise<Instrument[]> {
    try {
      // First, get accounts if we don't have an account ID
      if (!this.accountId) {
        const accounts = await this.getAccounts();
        if (accounts.length === 0) {
          throw new Error("No accounts found for this API key");
        }
        // Use the first account
        this.accountId = accounts[0].id;
      }

      // Get instruments for the account
      const endpoint = `/accounts/${this.accountId}/instruments`;
      const response = await this.makeRequest<OandaInstrumentsResponse>(
        endpoint
      );

      // Transform OANDA instruments to our simplified format
      return response.instruments.map((instrument) => ({
        symbol: instrument.name,
        name: instrument.displayName,
        type: instrument.type,
        pipLocation: instrument.pipLocation,
        displayPrecision: instrument.displayPrecision,
      }));
    } catch (error) {
      console.error("Error fetching instruments from OANDA:", error);
      throw error;
    }
  }

  /**
   * Get account details (requires account ID)
   */
  async getAccount(): Promise<OandaAccount> {
    if (!this.accountId) {
      throw new Error("Account ID is required to fetch account details");
    }

    const response = await this.makeRequest<{ account: OandaAccount }>(
      `/accounts/${this.accountId}`
    );
    return response.account;
  }

  /**
   * Get all accounts associated with the API key
   */
  async getAccounts(): Promise<OandaAccount[]> {
    const response = await this.makeRequest<{ accounts: OandaAccount[] }>(
      "/accounts"
    );
    return response.accounts;
  }

  /**
   * Get pricing information for instruments
   */
  async getPricing(instruments: string[]): Promise<OandaPricingResponse> {
    if (!this.accountId) {
      throw new Error("Account ID is required to fetch pricing");
    }

    const instrumentString = instruments.join(",");
    const endpoint = `/accounts/${
      this.accountId
    }/pricing?instruments=${encodeURIComponent(instrumentString)}`;

    return await this.makeRequest<OandaPricingResponse>(endpoint);
  }

  /**
   * Get instruments with pricing information
   */
  async getInstrumentsWithPricing(): Promise<Instrument[]> {
    try {
      // First, get accounts if we don't have an account ID
      if (!this.accountId) {
        const accounts = await this.getAccounts();
        if (accounts.length === 0) {
          throw new Error("No accounts found for this API key");
        }
        // Use the first account
        this.accountId = accounts[0].id;
      }

      // Get instruments for the account
      const endpoint = `/accounts/${this.accountId}/instruments`;
      const response = await this.makeRequest<OandaInstrumentsResponse>(
        endpoint
      );

      // Filter for forex instruments only
      const forexInstruments = response.instruments.filter(
        (instrument) => instrument.type === "CURRENCY"
      );

      // Get pricing for forex instruments
      const instrumentNames = forexInstruments.map(
        (instrument) => instrument.name
      );
      const pricingResponse = await this.getPricing(instrumentNames);

      // Create a map of instrument prices
      const priceMap = new Map<string, number>();
      pricingResponse.prices.forEach((price) => {
        if (price.bids.length > 0 && price.asks.length > 0) {
          const bidPrice = parseFloat(price.bids[0].price);
          const askPrice = parseFloat(price.asks[0].price);
          const midPrice = (bidPrice + askPrice) / 2;
          priceMap.set(price.instrument, midPrice);
        }
      });

      // Transform OANDA instruments to our simplified format with pricing
      const instrumentsWithPricing = forexInstruments.map((instrument) => ({
        symbol: instrument.name,
        name: instrument.displayName,
        type: instrument.type,
        price: priceMap.get(instrument.name),
        pipLocation: instrument.pipLocation,
        displayPrecision: instrument.displayPrecision,
      }));

      // Sort instruments by popularity
      return this.sortInstrumentsByPopularity(instrumentsWithPricing);
    } catch (error) {
      console.error(
        "Error fetching instruments with pricing from OANDA:",
        error
      );
      throw error;
    }
  }

  /**
   * Sort instruments by popularity (major pairs first, then minor, then exotic)
   */
  private sortInstrumentsByPopularity(instruments: Instrument[]): Instrument[] {
    // Define popularity order - major pairs first
    const popularityOrder = [
      "EUR_USD", // Euro / US Dollar
      "GBP_USD", // British Pound / US Dollar
      "USD_JPY", // US Dollar / Japanese Yen
      "USD_CHF", // US Dollar / Swiss Franc
      "AUD_USD", // Australian Dollar / US Dollar
      "USD_CAD", // US Dollar / Canadian Dollar
      "NZD_USD", // New Zealand Dollar / US Dollar
      // Minor pairs
      "EUR_GBP", // Euro / British Pound
      "EUR_JPY", // Euro / Japanese Yen
      "GBP_JPY", // British Pound / Japanese Yen
      "EUR_CHF", // Euro / Swiss Franc
      "AUD_JPY", // Australian Dollar / Japanese Yen
      "CAD_JPY", // Canadian Dollar / Japanese Yen
      "NZD_JPY", // New Zealand Dollar / Japanese Yen
      "GBP_CHF", // British Pound / Swiss Franc
      "AUD_CAD", // Australian Dollar / Canadian Dollar
      "AUD_CHF", // Australian Dollar / Swiss Franc
      "EUR_AUD", // Euro / Australian Dollar
      "GBP_AUD", // British Pound / Australian Dollar
      "EUR_CAD", // Euro / Canadian Dollar
      "GBP_CAD", // British Pound / Canadian Dollar
      "NZD_CAD", // New Zealand Dollar / Canadian Dollar
      "NZD_CHF", // New Zealand Dollar / Swiss Franc
      "EUR_NZD", // Euro / New Zealand Dollar
      "GBP_NZD", // British Pound / New Zealand Dollar
    ];

    return instruments.sort((a, b) => {
      const aIndex = popularityOrder.indexOf(a.symbol);
      const bIndex = popularityOrder.indexOf(b.symbol);
      
      // If both are in the popularity order, sort by their position
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      
      // If only one is in the popularity order, prioritize it
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      // If neither is in the popularity order, sort alphabetically
      return a.symbol.localeCompare(b.symbol);
    });
  }

  /**
   * Get candle data for an instrument
   */
  async getCandles(
    instrument: string,
    granularity: string = "D",
    count: number = 100
  ): Promise<OandaCandlesResponse> {
    const endpoint = `/instruments/${instrument}/candles?granularity=${granularity}&count=${count}&price=M`;
    return await this.makeRequest<OandaCandlesResponse>(endpoint);
  }

  /**
   * Test the connection to OANDA API
   */
  async testConnection(): Promise<boolean> {
    try {
      // Try to get accounts as a simple test
      await this.getAccounts();
      return true;
    } catch (error) {
      console.error("OANDA connection test failed:", error);
      return false;
    }
  }
}

// Environment variables helper
export function createOandaService(): OandaService {
  const apiKey = process.env.OANDA_API_KEY;
  const accountId = process.env.OANDA_ACCOUNT_ID;
  const environment =
    (process.env.OANDA_ENVIRONMENT as "live" | "practice") || "practice";

  if (!apiKey) {
    throw new Error("OANDA_API_KEY environment variable is required");
  }

  return new OandaService(apiKey, accountId, environment);
}
