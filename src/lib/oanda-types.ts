// OANDA REST API Types

export interface OandaInstrument {
  name: string;
  type: "CURRENCY" | "CFD" | "METAL";
  displayName: string;
  pipLocation: number;
  displayPrecision: number;
  tradeUnitsPrecision: number;
  minimumTradeSize: string;
  maximumTrailingStopDistance: string;
  minimumTrailingStopDistance: string;
  maximumPositionSize: string;
  maximumOrderUnits: string;
  marginRate: string;
  commission?: {
    commission: string;
    unitsTraded: string;
    minimumCommission: string;
  };
  guaranteedStopLossOrderMode?: "DISABLED" | "ALLOWED" | "REQUIRED";
  tags?: Array<{
    type: string;
    name: string;
  }>;
  financing?: {
    longRate: string;
    shortRate: string;
    financingDaysOfWeek: Array<{
      dayOfWeek: string;
      daysCharged: number;
    }>;
  };
}

export interface OandaInstrumentsResponse {
  instruments: OandaInstrument[];
  lastTransactionID: string;
}

export interface OandaErrorResponse {
  errorMessage: string;
  errorCode?: string;
}

// Pricing types
export interface OandaPrice {
  type: string;
  instrument: string;
  time: string;
  status: string;
  tradeable: boolean;
  bids: Array<{
    price: string;
    liquidity: number;
  }>;
  asks: Array<{
    price: string;
    liquidity: number;
  }>;
  closeoutBid: string;
  closeoutAsk: string;
  quoteHomeConversionFactors?: {
    positiveUnits: string;
    negativeUnits: string;
  };
  unitsAvailable?: {
    default: {
      long: string;
      short: string;
    };
    openOnly: {
      long: string;
      short: string;
    };
    reduceFirst: {
      long: string;
      short: string;
    };
    reduceOnly: {
      long: string;
      short: string;
    };
  };
}

export interface OandaPricingResponse {
  prices: OandaPrice[];
  time: string;
}

// For our application's simplified instrument interface
export interface Instrument {
  symbol: string;
  name: string;
  type: string;
  price?: number;
  change?: string;
  pipLocation?: number;
  displayPrecision?: number;
}

// OANDA Account types (for future use)
export interface OandaAccount {
  id: string;
  alias: string;
  currency: string;
  balance: string;
  createdByUserID: number;
  createdTime: string;
  guaranteedStopLossOrderMode: "DISABLED" | "ALLOWED" | "REQUIRED";
  pl: string;
  resettablePL: string;
  resettablePLTime?: string;
  financing: string;
  commission: string;
  dividend: string;
  guaranteedExecutionFees: string;
  marginRate: string;
  marginCallEnterTime?: string;
  marginCallExtensionCount?: number;
  lastMarginCallExtensionTime?: string;
  openTradeCount: number;
  openPositionCount: number;
  pendingOrderCount: number;
  hedgingEnabled: boolean;
  unrealizedPL: string;
  NAV: string;
  marginUsed: string;
  marginAvailable: string;
  positionValue: string;
  marginCloseoutUnrealizedPL: string;
  marginCloseoutNAV: string;
  marginCloseoutMarginUsed: string;
  marginCloseoutPercent: string;
  marginCloseoutPositionValue: string;
  withdrawalLimit: string;
  marginCallMarginUsed: string;
  marginCallPercent: string;
}

export interface OandaCandle {
  complete: boolean;
  volume: number;
  time: string;
  mid?: {
    o: string;
    h: string;
    l: string;
    c: string;
  };
  bid?: {
    o: string;
    h: string;
    l: string;
    c: string;
  };
  ask?: {
    o: string;
    h: string;
    l: string;
    c: string;
  };
}

export interface OandaCandlesResponse {
  instrument: string;
  granularity: string;
  candles: OandaCandle[];
}
