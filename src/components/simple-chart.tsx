"use client";

import { CandlestickData } from "@/lib/types";
import { detectFractals, type FractalPoint } from "@/lib/trend-detection";
import { useRef, useEffect, useState, useCallback } from "react";

// TradingView-style date formatting based on timeframe
const formatDate = (dateString: string, timeframe: string = "1D") => {
  const date = new Date(dateString);
  
  // Determine format based on timeframe
  switch (timeframe) {
    case "5M":
    case "15M":
    case "30M":
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
    case "1H":
    case "4H":
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        hour12: false
      });
    case "1D":
    default:
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "2-digit"
      });
  }
};

interface SimpleChartProps {
  data: CandlestickData[];
  showFractals?: boolean;
  timeframe?: string;
}

export function SimpleChart({ data, showFractals = true, timeframe = "1D" }: SimpleChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  
  // Detect fractals
  const fractals = showFractals ? detectFractals(data) : [];

  // Update canvas size when container changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(() => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        setDimensions({ width: rect.width, height: rect.height });
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Get visible candles
  const visibleData = data.slice(visibleRange.start, visibleRange.end + 1);
  
  // Get visible fractals
  const visibleFractals = fractals.filter((fractal: FractalPoint) => 
    fractal.index >= visibleRange.start && fractal.index <= visibleRange.end
  );
  
  // Calculate price range
  const allPrices = visibleData.flatMap(d => [d.open, d.high, d.low, d.close]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice;
  const padding = priceRange * 0.05;
  const yMin = minPrice - padding;
  const yMax = maxPrice + padding;

  // Convert price to pixel
  const priceToY = (price: number) => {
    return dimensions.height - 60 - ((price - yMin) / (yMax - yMin)) * (dimensions.height - 100);
  };

  // Draw the chart
  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || visibleData.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Draw background
    ctx.fillStyle = "hsl(var(--background))";
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    // Calculate candle width
    const candleWidth = Math.max(4, (dimensions.width - 120) / visibleData.length - 2);
    const startX = 80;

    // Draw grid lines
    ctx.strokeStyle = "hsl(var(--border))";
    ctx.lineWidth = 0.5;
    
    // Horizontal lines
    for (let i = 0; i <= 10; i++) {
      const y = 50 + (i * (dimensions.height - 100)) / 10;
      ctx.beginPath();
      ctx.moveTo(80, y);
      ctx.lineTo(dimensions.width - 40, y);
      ctx.stroke();
    }

    // Draw each candle
    visibleData.forEach((candle, index) => {
      const x = startX + index * (candleWidth + 2);
      const isGreen = candle.close >= candle.open;
      
      // Colors
      const candleColor = isGreen ? "#22c55e" : "#ef4444";
      const bodyColor = isGreen ? "#22c55e" : "transparent";
      const borderColor = isGreen ? "#16a34a" : "#ef4444";

      // Calculate positions
      const openY = priceToY(candle.open);
      const closeY = priceToY(candle.close);
      const highY = priceToY(candle.high);
      const lowY = priceToY(candle.low);
      
      const bodyTop = Math.min(openY, closeY);
      const bodyBottom = Math.max(openY, closeY);
      const bodyHeight = bodyBottom - bodyTop;

      // Draw wick (high-low line)
      ctx.strokeStyle = candleColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, highY);
      ctx.lineTo(x + candleWidth / 2, lowY);
      ctx.stroke();

      // Draw body
      if (bodyHeight > 0) {
        // Fill body
        ctx.fillStyle = bodyColor;
        ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);
        
        // Draw body border
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, bodyTop, candleWidth, bodyHeight);
      } else {
        // Doji - horizontal line
        ctx.strokeStyle = candleColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, bodyTop);
        ctx.lineTo(x + candleWidth, bodyTop);
        ctx.stroke();
      }
    });

    // Draw fractal points
    if (showFractals && visibleFractals.length > 0) {
      visibleFractals.forEach((fractal: FractalPoint) => {
        const fractalIndex = fractal.index - visibleRange.start;
        const x = startX + fractalIndex * (candleWidth + 2) + candleWidth / 2;
        const y = priceToY(fractal.price);
        
        // Draw fractal point
        ctx.fillStyle = fractal.type === 'high' ? '#ef4444' : '#22c55e';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw fractal label
        ctx.fillStyle = fractal.type === 'high' ? '#ef4444' : '#22c55e';
        ctx.font = "10px system-ui";
        ctx.textAlign = "center";
        const labelY = fractal.type === 'high' ? y - 15 : y + 20;
        ctx.fillText(fractal.type === 'high' ? 'H' : 'L', x, labelY);
        
        // Draw price label
        ctx.fillStyle = "hsl(var(--muted-foreground))";
        ctx.font = "9px system-ui";
        const priceLabelY = fractal.type === 'high' ? y - 25 : y + 30;
        ctx.fillText(fractal.price.toFixed(5), x, priceLabelY);
      });
    }

    // Draw price labels
    ctx.fillStyle = "hsl(var(--muted-foreground))";
    ctx.font = "11px system-ui";
    ctx.textAlign = "right";
    
    for (let i = 0; i <= 10; i++) {
      const price = yMax - (i * (yMax - yMin)) / 10;
      const y = 50 + (i * (dimensions.height - 100)) / 10;
      ctx.fillText(price.toFixed(4), 75, y + 4);
    }

    // Draw date labels
    ctx.textAlign = "center";
    ctx.fillStyle = "hsl(var(--muted-foreground))";
    ctx.font = "11px system-ui";
    
    // Calculate optimal step based on visible data and timeframe
    let step = Math.max(1, Math.floor(visibleData.length / 8));
    
    // Adjust step for different timeframes to avoid overcrowding
    if (timeframe === "5M" || timeframe === "15M") {
      step = Math.max(step, Math.floor(visibleData.length / 12));
    } else if (timeframe === "1H" || timeframe === "4H") {
      step = Math.max(step, Math.floor(visibleData.length / 10));
    }
    
    for (let i = 0; i < visibleData.length; i += step) {
      const candle = visibleData[i];
      const x = startX + i * (candleWidth + 2) + candleWidth / 2;
      const dateStr = formatDate(candle.date, timeframe);
      
      // Ensure text doesn't overflow chart bounds
      const textWidth = ctx.measureText(dateStr).width;
      const maxX = dimensions.width - 40;
      const minX = startX;
      
      if (x - textWidth/2 >= minX && x + textWidth/2 <= maxX) {
        ctx.fillText(dateStr, x, dimensions.height - 20);
      }
    }
  }, [dimensions, visibleData, visibleFractals, yMin, yMax, priceToY, showFractals, timeframe]);

  // Handle mouse wheel for zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1 : -1;
    const zoomFactor = 0.1;
    const currentRange = visibleRange.end - visibleRange.start;
    const newRange = Math.max(10, currentRange * (1 + delta * zoomFactor));
    const center = (visibleRange.start + visibleRange.end) / 2;
    const newStart = Math.max(0, Math.floor(center - newRange / 2));
    const newEnd = Math.min(data.length - 1, Math.floor(center + newRange / 2));
    
    setVisibleRange({ start: newStart, end: newEnd });
  };

  // Handle mouse down for drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDragging(true);
    setDragStart({ x, y });
    setLastMousePos({ x, y });
    setIsPanning(true);
    
    // Change cursor to grabbing
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'grabbing';
    }
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isPanning) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const deltaX = x - lastMousePos.x;
    const deltaY = y - lastMousePos.y;
    
    // Calculate how many candles to move based on mouse movement
    const candleWidth = Math.max(4, (dimensions.width - 120) / (visibleRange.end - visibleRange.start + 1) - 2);
    const candlesToMove = Math.round(deltaX / (candleWidth + 2));
    
    if (candlesToMove !== 0) {
      const newStart = Math.max(0, visibleRange.start - candlesToMove);
      const newEnd = Math.min(data.length - 1, visibleRange.end - candlesToMove);
      
      // Ensure we don't go beyond data bounds
      if (newStart >= 0 && newEnd < data.length && newEnd - newStart >= 10) {
        setVisibleRange({ start: newStart, end: newEnd });
      }
    }
    
    setLastMousePos({ x, y });
  };

  // Handle mouse up for drag end
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsPanning(false);
    
    // Reset cursor
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'grab';
    }
  };

  // Handle mouse leave to stop dragging
  const handleMouseLeave = () => {
    setIsDragging(false);
    setIsPanning(false);
    
    // Reset cursor
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'grab';
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target !== document.body) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          // Pan left
          const leftStart = Math.max(0, visibleRange.start - 5);
          const leftEnd = Math.min(data.length - 1, visibleRange.end - 5);
          if (leftEnd - leftStart >= 10) {
            setVisibleRange({ start: leftStart, end: leftEnd });
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          // Pan right
          const rightStart = Math.max(0, visibleRange.start + 5);
          const rightEnd = Math.min(data.length - 1, visibleRange.end + 5);
          if (rightEnd - rightStart >= 10) {
            setVisibleRange({ start: rightStart, end: rightEnd });
          }
          break;
        case '+':
        case '=':
          e.preventDefault();
          // Zoom in
          const zoomInRange = Math.max(10, (visibleRange.end - visibleRange.start) * 0.8);
          const zoomInCenter = (visibleRange.start + visibleRange.end) / 2;
          const zoomInStart = Math.max(0, Math.floor(zoomInCenter - zoomInRange / 2));
          const zoomInEnd = Math.min(data.length - 1, Math.floor(zoomInCenter + zoomInRange / 2));
          setVisibleRange({ start: zoomInStart, end: zoomInEnd });
          break;
        case '-':
          e.preventDefault();
          // Zoom out
          const zoomOutRange = Math.min(data.length - 1, (visibleRange.end - visibleRange.start) * 1.25);
          const zoomOutCenter = (visibleRange.start + visibleRange.end) / 2;
          const zoomOutStart = Math.max(0, Math.floor(zoomOutCenter - zoomOutRange / 2));
          const zoomOutEnd = Math.min(data.length - 1, Math.floor(zoomOutCenter + zoomOutRange / 2));
          setVisibleRange({ start: zoomOutStart, end: zoomOutEnd });
          break;
        case 'Home':
          e.preventDefault();
          // Go to beginning
          setVisibleRange({ start: 0, end: Math.min(50, data.length - 1) });
          break;
        case 'End':
          e.preventDefault();
          // Go to end
          const endRange = Math.min(50, data.length - 1);
          setVisibleRange({ start: Math.max(0, data.length - 1 - endRange), end: data.length - 1 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visibleRange, data.length]);

  // Redraw when data changes
  useEffect(() => {
    drawChart();
  }, [drawChart]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[500px] relative">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className="w-full h-full border border-border rounded-lg cursor-grab select-none"
        style={{ userSelect: 'none' }}
      />
      
      {/* Simple controls */}
      <div className="absolute top-2 right-2 flex gap-2">
        <button
          onClick={() => {
            const newStart = Math.max(0, visibleRange.start + 10);
            const newEnd = Math.min(data.length - 1, visibleRange.end + 10);
            setVisibleRange({ start: newStart, end: newEnd });
          }}
          className="px-2 py-1 text-xs bg-background border border-border rounded hover:bg-muted"
        >
          ←
        </button>
        <button
          onClick={() => {
            const newStart = Math.max(0, visibleRange.start - 10);
            const newEnd = Math.min(data.length - 1, visibleRange.end - 10);
            setVisibleRange({ start: newStart, end: newEnd });
          }}
          className="px-2 py-1 text-xs bg-background border border-border rounded hover:bg-muted"
        >
          →
        </button>
        <button
          onClick={() => setVisibleRange({ start: 0, end: Math.min(50, data.length - 1) })}
          className="px-2 py-1 text-xs bg-background border border-border rounded hover:bg-muted"
        >
          Reset
        </button>
      </div>
      
      <div className="absolute bottom-2 left-2 text-xs text-muted-foreground">
        {visibleData.length} of {data.length} candles
        {showFractals && fractals.length > 0 && (
          <span className="ml-2">
            • {fractals.length} fractals ({fractals.filter((f: FractalPoint) => f.type === 'high').length}H, {fractals.filter((f: FractalPoint) => f.type === 'low').length}L)
          </span>
        )}
      </div>
      
      {/* Keyboard shortcuts info */}
      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded border">
        <div className="font-semibold mb-1">Controls:</div>
        <div>Drag: Pan • Wheel: Zoom • ←→: Pan • +/-: Zoom • Home/End: Navigate</div>
      </div>
    </div>
  );
}
