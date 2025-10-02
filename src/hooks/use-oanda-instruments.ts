import type { Instrument } from "@/lib/oanda-types";
import { useEffect, useState } from "react";

interface UseOandaInstrumentsReturn {
  instruments: Instrument[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useOandaInstruments(
  apiKey?: string
): UseOandaInstrumentsReturn {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInstruments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Construct the URL with API key as query parameter if provided
      const url = apiKey
        ? `/api/oanda/instruments?apiKey=${encodeURIComponent(apiKey)}`
        : "/api/oanda/instruments";

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details || errorData.error || `HTTP ${response.status}`
        );
      }

      const data = await response.json();
      setInstruments(data.instruments || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch instruments";
      setError(errorMessage);

      // Fall back to empty array on error
      setInstruments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstruments();
  }, [apiKey]);

  return {
    instruments,
    loading,
    error,
    refetch: fetchInstruments,
  };
}
