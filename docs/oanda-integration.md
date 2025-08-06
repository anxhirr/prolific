# OANDA API Integration

This document outlines the OANDA REST API integration implemented in the application.

## Overview

The application now fetches real financial instruments from OANDA's REST API instead of using mock data. The integration focuses on simplicity and shows popular forex pairs, metals, and commodities.

## Implementation Details

### Files Created/Modified

1. **`src/lib/oanda-types.ts`** - TypeScript interfaces for OANDA API responses
2. **`src/lib/oanda-service.ts`** - Service class for OANDA REST API calls
3. **`src/hooks/use-oanda-instruments.ts`** - React hook for fetching instruments
4. **`src/app/api/oanda/instruments/route.ts`** - API endpoint for instruments
5. **`src/app/api/oanda/test/route.ts`** - Test endpoint for OANDA connection
6. **`src/components/right-panel.tsx`** - Updated to use real OANDA data

### API Endpoints

- `GET /api/oanda/instruments` - Fetch filtered list of popular instruments
- `POST /api/oanda/instruments` - Fetch all instruments (with body parameters)
- `GET /api/oanda/test` - Test OANDA API connection

### Key Features

1. **Real Data**: Fetches actual instruments from OANDA's practice environment
2. **Error Handling**: Graceful fallback to mock data if API fails
3. **Loading States**: Shows loading indicators and retry buttons
4. **Filtering**: Shows only popular forex pairs and major instruments
5. **Type Safety**: Full TypeScript support for all API responses

### Configuration

The API key is currently hardcoded for simplicity:

```
d14032539d0ad19e78259a10d9d5f733-0c1c6513bf19879c697b352447409af9
```

In production, this should be moved to environment variables:

- `OANDA_API_KEY` - Your OANDA API key
- `OANDA_ACCOUNT_ID` - Your account ID (optional)
- `OANDA_ENVIRONMENT` - 'practice' or 'live'

### Available Instruments

The integration filters for popular instruments including:

- Major forex pairs (EUR/USD, GBP/USD, USD/JPY, etc.)
- Major crosses (EUR/GBP, EUR/JPY, GBP/JPY)
- Precious metals (XAU/USD, XAG/USD)
- Oil (BCO/USD, WTICO/USD)

### Testing

To test the integration:

1. Visit `/api/oanda/test` to verify API connection
2. Check the "OANDA Instruments" tab in the right panel
3. Look for real instrument data instead of mock stock symbols

### Future Enhancements

- Add real-time pricing data
- Implement candle data fetching for charts
- Add account information display
- Implement trading functionality
- Add WebSocket support for live data
