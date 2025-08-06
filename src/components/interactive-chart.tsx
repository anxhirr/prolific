"use client";

import { CandlestickData } from "@/lib/types";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  ErrorBar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface InteractiveChartProps {
  data: CandlestickData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-2 bg-card/80 border border-border rounded-lg shadow-lg text-sm backdrop-blur-sm">
        <p className="font-bold">{label}</p>
        <div className="grid grid-cols-2 gap-x-2">
          <p>
            Open: <span className="font-mono">{data.open.toFixed(2)}</span>
          </p>
          <p>
            High:{" "}
            <span className="font-mono text-chart-1">
              {data.high.toFixed(2)}
            </span>
          </p>
          <p>
            Close: <span className="font-mono">{data.close.toFixed(2)}</span>
          </p>
          <p>
            Low:{" "}
            <span className="font-mono text-chart-2">
              {data.low.toFixed(2)}
            </span>
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export function InteractiveChart({ data }: InteractiveChartProps) {
  const processedData = data.map((d) => ({
    ...d,
    body: [d.open, d.close],
    wick: [d.low, d.high],
  }));

  const yDomain = [
    Math.min(...data.map((d) => d.low)) * 0.98,
    Math.max(...data.map((d) => d.high)) * 1.02,
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={processedData}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
        <XAxis
          dataKey="date"
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
        />
        <YAxis
          orientation="right"
          domain={yDomain}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{
            stroke: "hsl(var(--primary))",
            strokeWidth: 1,
            strokeDasharray: "3 3",
          }}
        />
        <Bar dataKey="body" barSize={10} radius={[2, 2, 0, 0]}>
          {processedData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                entry.close >= entry.open
                  ? "hsl(var(--chart-1))"
                  : "hsl(var(--chart-2))"
              }
            />
          ))}
          <ErrorBar
            dataKey="wick"
            strokeWidth={1.5}
            stroke="inherit"
            direction="y"
          />
        </Bar>
      </ComposedChart>
    </ResponsiveContainer>
  );
}
