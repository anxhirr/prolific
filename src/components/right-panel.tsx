"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AiPanel } from "@/components/ai-panel";
import { mockWatchlist } from "@/lib/mock-data";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CandlestickData } from "@/lib/mock-data";

const watchlist = mockWatchlist;

interface RightPanelProps {
  chartData: CandlestickData[];
}

const WatchlistPanel = () => {
    return (
        <ScrollArea className="h-full">
            <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Change</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {watchlist.map((stock) => (
                        <TableRow key={stock.symbol}>
                            <TableCell className="font-medium">{stock.symbol}</TableCell>
                            <TableCell>{stock.price.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                                <Badge variant={stock.change.startsWith('+') ? 'default' : 'destructive'} className={stock.change.startsWith('+') ? 'bg-chart-1/80' : ''}>
                                    {stock.change}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </ScrollArea>
    )
}

export function RightPanel({ chartData }: RightPanelProps) {
  return (
    <aside className="w-[350px] border-l border-border bg-card flex flex-col">
        <Tabs defaultValue="watchlist" className="w-full flex-grow flex flex-col">
            <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
                <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
                <TabsTrigger value="ai">AI Analysis</TabsTrigger>
            </TabsList>
            <TabsContent value="watchlist" className="flex-grow overflow-y-auto mt-0">
                <WatchlistPanel />
            </TabsContent>
            <TabsContent value="ai" className="flex-grow overflow-y-auto mt-0">
                <AiPanel chartData={chartData} />
            </TabsContent>
        </Tabs>
    </aside>
  );
}
