"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CandlestickChart, LineChart, Presentation, Search, Star, TrendingUp } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


interface ChartHeaderProps {
    timeframe: string;
    onTimeframeChange: (timeframe: string) => void;
}

export function ChartHeader({ timeframe, onTimeframeChange }: ChartHeaderProps) {
    const timeframes = ['5M', '1H', '4H', '1D', '1W'];
    
    return (
        <header className="flex items-center h-16 px-4 border-b border-border shrink-0 gap-4 bg-card">
            <div className="flex items-center gap-2">
                <CandlestickChart className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-headline font-bold text-primary-foreground">ChartWhisper</h1>
            </div>

            <Separator orientation="vertical" className="h-8" />
            
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" className="w-[200px] justify-start text-left font-normal">
                        <Search className="mr-2 h-4 w-4"/>
                        TSLA
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[200px]" align="start">
                    <Command>
                        <CommandInput placeholder="Search symbol..." />
                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup>
                                <CommandItem>
                                    <Avatar className="h-5 w-5 mr-2">
                                        <AvatarFallback>TS</AvatarFallback>
                                    </Avatar>
                                    <span>TSLA</span>
                                </CommandItem>
                                <CommandItem>
                                    <Avatar className="h-5 w-5 mr-2">
                                        <AvatarFallback>AP</AvatarFallback>
                                    </Avatar>
                                    <span>AAPL</span>
                                </CommandItem>
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            <div className="flex items-center gap-1">
                {timeframes.map((tf) => (
                    <Button 
                        key={tf} 
                        variant={timeframe === tf ? 'secondary' : 'ghost'} 
                        size="sm"
                        onClick={() => onTimeframeChange(tf)}
                    >
                        {tf}
                    </Button>
                ))}
            </div>
            
            <Separator orientation="vertical" className="h-8" />
            
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <CandlestickChart className="h-4 w-4" />
                </Button>
                 <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <LineChart className="h-4 w-4" />
                </Button>
            </div>
            
            <Separator orientation="vertical" className="h-8" />

            <Select>
                <SelectTrigger className="w-[180px]">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Indicators" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ma">Moving Average</SelectItem>
                    <SelectItem value="rsi">RSI</SelectItem>
                    <SelectItem value="macd">MACD</SelectItem>
                </SelectContent>
            </Select>

            <div className="flex-grow" />

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <Star className="h-5 w-5"/>
                </Button>
                 <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <Presentation className="h-5 w-5"/>
                </Button>
                <Avatar>
                  <AvatarImage src="https://placehold.co/100x100.png" alt="User" data-ai-hint="person avatar" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
            </div>
        </header>
    );
}
