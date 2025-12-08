import { useEffect, useRef, useState } from "react";

interface LineChartProps {
  data: number[];
  labels?: string[];
  color?: string;
  height?: number;
}

export function LineChart({
  data,
  color = "hsl(217, 91%, 60%)",
  height = 120,
}: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(300);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const padding = 10;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const maxValue = Math.max(...data, 1);
    const pointSpacing = chartWidth / Math.max(data.length - 1, 1);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (data.length < 2) return;

    // Create gradient for fill
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, color.replace(")", ", 0.3)").replace("hsl", "hsla"));
    gradient.addColorStop(1, color.replace(")", ", 0.02)").replace("hsl", "hsla"));

    // Draw filled area
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);

    data.forEach((value, i) => {
      const x = padding + i * pointSpacing;
      const y = height - padding - (value / maxValue) * chartHeight;
      if (i === 0) {
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.lineTo(padding + (data.length - 1) * pointSpacing, height - padding);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    data.forEach((value, i) => {
      const x = padding + i * pointSpacing;
      const y = height - padding - (value / maxValue) * chartHeight;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    // Glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, [data, width, height, color]);

  return (
    <div ref={containerRef} className="w-full">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ width: "100%", height }}
      />
    </div>
  );
}
