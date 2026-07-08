"use client";

import React, { useEffect, useRef, useState } from "react";

interface EcgLineAnimationProps {
  color?: string;
  lineWidth?: number;
  speed?: number;
}

export function EcgLineAnimation({
  color = "#0ea5e9", // Tailwind sky-500
  lineWidth = 2.5,
  speed = 2.5,
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
    let x = 0; // Current scanning horizontal position
    
    // Smooth transition variables for interactive hover
    let currentCycleLength = 200;
    let currentSpeed = speed;

    // Clear background once initially
    ctx.fillStyle = "transparent";
    ctx.fillRect(0, 0, width, height);

    // ECG Complex Generator Function (Simulates P-Q-R-S-T waves)
    const getEcgData = (time: number, cycleLength: number): { offset: number; isSpiking: boolean } => {
      const cycle = (time % cycleLength) / cycleLength; 
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
        const amplitude = isHoveredRef.current ? 1.2 : 1.0;
        offset += spike * amplitude;
        
        // Mark as spiking for dynamic flash effect
        if (spike > 0.5) isSpiking = true;
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

      // Return scaled to fit visual height boundaries safely
      return { 
        offset: offset * (height * 0.4),
        isSpiking 
      }; 
    };

    const render = () => {
      // Smoothly interpolate speed and cycle length for hover effects
      const targetCycleLength = isHoveredRef.current ? 110 : 200;
      const targetSpeed = isHoveredRef.current ? speed * 1.8 : speed;
      
      currentCycleLength += (targetCycleLength - currentCycleLength) * 0.05;
      currentSpeed += (targetSpeed - currentSpeed) * 0.05;

      // Create a fading trailing effect ahead of the scanner line
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)"; 
      ctx.fillRect(0, 0, width, height); // Fade entire canvas slowly instead of clearRect for a smoother trail
      // Erase a small vertical band directly ahead of the pulse to prevent overlaps
      ctx.clearRect(x, 0, 20, height);

      const midY = height / 2;
      
      // Map current horizontal pixel space to a temporal point in the ECG sequence
      const ecgData = getEcgData(x, currentCycleLength); 
      const currentY = midY - ecgData.offset;

      // Draw the crisp line segment
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      
      // Dynamic Flash: Increase glow intensely when the R-wave hits
      ctx.shadowBlur = ecgData.isSpiking ? 25 : 8;
      ctx.shadowColor = color;

      // Draw a line from the previous X point to the current X point
      const prevX = x - currentSpeed;
      if (prevX >= 0) {
        ctx.moveTo(prevX, midY - getEcgData(prevX, currentCycleLength).offset);
        ctx.lineTo(x, currentY);
        ctx.stroke();
      }

      // Advance scanner position, wrapping around smoothly when hitting the width boundary
      x = (x + currentSpeed) % width;

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
      {/* Medical Background Grid */}
      <div 
        className="absolute inset-0 opacity-20 dark:opacity-30 mix-blend-screen pointer-events-none transition-opacity duration-700 group-hover:opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${color}22 1px, transparent 1px),
            linear-gradient(to bottom, ${color}22 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
        }}
      />
      
      <canvas 
        ref={canvasRef} 
        style={{ width: dimensions.width, height: dimensions.height }} 
        className="block mix-blend-screen relative z-10" 
      />
    </div>
  );
}
