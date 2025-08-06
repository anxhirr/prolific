"use client";

import { AiPanel } from "@/components/ai-panel";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOandaInstruments } from "@/hooks/use-oanda-instruments";
import type { CandlestickData } from "@/lib/mock-data";
import { mockForexInstruments } from "@/lib/mock-data";
import { AlertCircle, Loader2, RefreshCw, Search } from "lucide-react";
import { useMemo, useState } from "react";

// Use your OANDA API key - in production, this should come from environment variables
const OANDA_API_KEY =
  "d14032539d0ad19e78259a10d9d5f733-0c1c6513bf19879c697b352447409af9";

interface RightPanelProps {
  chartData: CandlestickData[];
}

const WatchlistPanel = () => {
  const { instruments, loading, error, refetch } =
    useOandaInstruments(OANDA_API_KEY);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter instruments based on search query
  const filteredInstruments = useMemo(() => {
    if (!searchQuery.trim()) return instruments;

    const query = searchQuery.toLowerCase();
    return instruments.filter(
      (instrument) =>
        instrument.symbol.toLowerCase().includes(query) ||
        instrument.name.toLowerCase().includes(query)
    );
  }, [instruments, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading instruments...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load instruments: {error}
          </AlertDescription>
        </Alert>
        <Button
          onClick={refetch}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>

        {/* Fallback to mock data */}
        <div>
          <p className="mb-2">Showing demo data:</p>
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search instruments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <ScrollArea className="h-48">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockForexInstruments
                    .filter(
                      (instrument) =>
                        !searchQuery ||
                        instrument.symbol
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        instrument.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                    )
                    .slice(0, 5)
                    .map((instrument) => (
                      <TableRow key={instrument.symbol}>
                        <TableCell className="font-medium font-mono">
                          {instrument.symbol}
                        </TableCell>
                        <TableCell className="text-sm">
                          {instrument.name}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-mono text-sm">
                            {instrument.price.toFixed(
                              instrument.displayPrecision
                            )}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>
      </div>
    );
  }

  if (instruments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">No instruments available</p>
          <Button
            onClick={refetch}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Forex Instruments</h3>
          <Button onClick={refetch} variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search instruments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full w-full">
          <div className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInstruments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-muted-foreground py-8"
                    >
                      No instruments found matching "{searchQuery}"
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInstruments.map((instrument) => (
                    <TableRow
                      key={instrument.symbol}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell className="font-medium font-mono">
                        {instrument.symbol}
                      </TableCell>
                      <TableCell className="text-sm">
                        {instrument.name}
                      </TableCell>
                      <TableCell className="text-right">
                        {instrument.price ? (
                          <span className="font-mono text-sm">
                            {instrument.price.toFixed(
                              instrument.displayPrecision || 5
                            )}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            -
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export function RightPanel({ chartData }: RightPanelProps) {
  return (
    <aside className="w-[350px] border-l border-border bg-card flex flex-col">
      <Tabs defaultValue="watchlist" className="w-full h-full flex flex-col">
        <TabsList className="flex-shrink-0 grid w-full grid-cols-2 rounded-none border-b">
          <TabsTrigger value="watchlist">Forex Instruments</TabsTrigger>
          <TabsTrigger value="ai">AI Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="watchlist" className="flex-1 min-h-0 mt-0">
          <WatchlistPanel />
        </TabsContent>
        <TabsContent value="ai" className="flex-1 min-h-0 mt-0">
          <AiPanel chartData={chartData} />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
