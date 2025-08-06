"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PenTool, RectangleHorizontal, Circle, Type, Trash2, Move, TrendingUp } from 'lucide-react';
import { Separator } from "./ui/separator";

const tools = [
    { icon: Move, label: 'Pan' },
    { icon: TrendingUp, label: 'Trend Line' },
    { icon: PenTool, label: 'Brush' },
    { icon: RectangleHorizontal, label: 'Rectangle' },
    { icon: Circle, label: 'Circle' },
    { icon: Type, label: 'Text' },
    { icon: Trash2, label: 'Remove Drawings' },
];

export function DrawingToolbar() {
    return (
        <aside className="flex flex-col items-center gap-2 p-2 border-r border-border bg-card">
            <TooltipProvider delayDuration={0}>
                {tools.map((tool, index) => (
                    <React.Fragment key={index}>
                    {index === 1 && <Separator className="my-1" />}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                                <tool.icon className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p>{tool.label}</p>
                        </TooltipContent>
                    </Tooltip>
                    {index === 1 && <Separator className="my-1" />}
                    </React.Fragment>
                ))}
            </TooltipProvider>
        </aside>
    );
}
