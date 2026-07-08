"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

interface EcgLineAnimationProps {
  color?: string;
  lineWidth?: number;
  speed?: number;
}

export function EcgLineAnimation({
  color = "#0ea5e9", // Tailwind sky-500
  lineWidth = 2.5,
  speed = 3.5, // slightly faster base speed
}: EcgLineAnimationProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const isHoveredRef = useRef(false);

  // Handle responsive resizing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const { width, height } = dimensions;
    if (!canvas || width === 0 || height === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high-DPI/Retina screens for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    let animationFrameId: number;
    
    // Smooth transition variables for interactive hover
    let currentCycleLength = 130; // Shorter cycle = MORE SPIKES on screen
    let currentSpeed = speed;
    
    let time = 0;
    
    // Store history of points for a perfect, transparent tail fade
    const points: { x: number; y: number; isSpiking: boolean }[] = [];
    const maxTailLength = Math.floor((width / speed) * 0.9); // 90% of screen width

    // ECG Complex Generator Function (Simulates P-Q-R-S-T waves)
    const getEcgData = (t: number, cycleLength: number): { offset: number; isSpiking: boolean } => {
      const cycle = (t % cycleLength) / cycleLength; 
      let offset = 0; 
      let isSpiking = false;

      // 2. P-Wave (Small gentle bump early on)
      if (cycle > 0.1 && cycle < 0.15) {
        offset += Math.sin((cycle - 0.1) * Math.PI * 20) * 0.1;
      }

      // 3. Q-Wave (Brief sharp dip right before the spike)
      if (cycle > 0.23 && cycle < 0.26) {
        const progress = (cycle - 0.23) / 0.03;
        const spike = 1 - Math.abs(progress - 0.5) * 2;
        offset -= spike * 0.15;
      }

      // 4. R-Wave (The massive sharp upward spike)
      if (cycle >= 0.26 && cycle < 0.30) {
        const progress = (cycle - 0.26) / 0.04;
        const spike = 1 - Math.abs(progress - 0.5) * 2;
        // Increase amplitude slightly if hovering (Tachycardia / Adrenaline)
        const amplitude = isHoveredRef.current ? 1.3 : 1.0;
        offset += spike * amplitude;
        
        // Mark as spiking for dynamic flash effect
        if (spike > 0.4) isSpiking = true;
      }

      // 5. S-Wave (The sharp downward dip right after the spike)
      if (cycle >= 0.30 && cycle < 0.34) {
        const progress = (cycle - 0.30) / 0.04;
        const spike = 1 - Math.abs(progress - 0.5) * 2;
        offset -= spike * 0.35;
      }

      // 6. T-Wave (Medium wider bump trailing the spike)
      if (cycle > 0.40 && cycle < 0.55) {
        offset += Math.sin((cycle - 0.40) * Math.PI * 6.67) * 0.25;
      }

      return { 
        offset: offset * (height * 0.4),
        isSpiking 
      }; 
    };

    const render = () => {
      // Smoothly interpolate speed and cycle length for hover effects
      const targetCycleLength = isHoveredRef.current ? 80 : 130;
      const targetSpeed = isHoveredRef.current ? speed * 1.5 : speed;
      
      currentCycleLength += (targetCycleLength - currentCycleLength) * 0.05;
      currentSpeed += (targetSpeed - currentSpeed) * 0.05;

      // Clear the canvas entirely for perfect transparency
      ctx.clearRect(0, 0, width, height);

      const midY = height / 2;
      const x = (time * currentSpeed) % width;
      
      const ecgData = getEcgData(time * currentSpeed, currentCycleLength); 
      const currentY = midY - ecgData.offset;

      points.push({ x, y: currentY, isSpiking: ecgData.isSpiking });
      if (points.length > maxTailLength) {
        points.shift();
      }

      // Draw the ECG line segment by segment with varying opacity
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = lineWidth;

      let isGlowing = false;

      for (let i = 1; i < points.length; i++) {
        const p1 = points[i - 1];
        const p2 = points[i];

        // If the scanner wrapped around, don't draw a line connecting the edges
        if (Math.abs(p2.x - p1.x) > width / 2) continue;

        // Calculate opacity based on position in the trail (older points are more transparent)
        const opacity = i / points.length;
        
        ctx.beginPath();
        // Use rgba to apply opacity directly to the stroke, supporting light/dark backgrounds
        ctx.strokeStyle = `rgba(14, 165, 233, ${opacity})`; 
        
        // Dynamic Flash: Increase glow intensely when the R-wave hits
        if (p2.isSpiking && opacity > 0.8) {
          isGlowing = true;
        }

        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // Apply the glow to the entire canvas if the current head is spiking
      // (Since shadowBlur applies globally to all drawn strokes, we isolate it or just set it based on head)
      if (isGlowing) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
      } else {
        ctx.shadowBlur = 4;
        ctx.shadowColor = color;
      }

      time += 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [dimensions, color, lineWidth, speed]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full z-10 pointer-events-auto cursor-crosshair group"
      onMouseEnter={() => (isHoveredRef.current = true)}
      onMouseLeave={() => (isHoveredRef.current = false)}
    >
      {/* Medical Background Grid - Transparent, adapts to theme */}
      <div 
        className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none transition-opacity duration-700 group-hover:opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
        }}
      />
      
      <canvas 
        ref={canvasRef} 
        style={{ width: dimensions.width, height: dimensions.height }} 
        className="block relative z-10" 
      />
    </div>
  );
}
