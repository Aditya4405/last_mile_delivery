import React, { useEffect, useState } from 'react';
import { FiMapPin, FiNavigation, FiInfo } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MapPlaceholder = ({
  pickupAddress = 'Pickup Location',
  dropAddress = 'Drop Location',
  status = 'assigned',
  agentName = 'Delivery Agent',
}) => {
  const [progress, setProgress] = useState(0.2);

  useEffect(() => {
    // Map progress factor depending on order status
    switch (status) {
      case 'pending':
        setProgress(0.0);
        break;
      case 'assigned':
        setProgress(0.15);
        break;
      case 'picked_up':
        setProgress(0.35);
        break;
      case 'in_transit':
        setProgress(0.6);
        break;
      case 'out_for_delivery':
        setProgress(0.85);
        break;
      case 'delivered':
        setProgress(1.0);
        break;
      case 'failed':
        setProgress(0.7);
        break;
      default:
        setProgress(0.5);
    }
  }, [status]);

  // Coordinates on our 500x300 grid
  const pickup = { x: 80, y: 220 };
  const drop = { x: 420, y: 80 };
  
  // Interpolated agent coordinate along a winding curve
  // Route curve control points: pickup (80,220) -> CP1 (200, 260) -> CP2 (300, 60) -> drop (420,80)
  const getRoutePoint = (t) => {
    const x = (1 - t) ** 3 * pickup.x + 3 * (1 - t) ** 2 * t * 220 + 3 * (1 - t) * t ** 2 * 280 + t ** 3 * drop.x;
    const y = (1 - t) ** 3 * pickup.y + 3 * (1 - t) ** 2 * t * 240 + 3 * (1 - t) * t ** 2 * 60 + t ** 3 * drop.y;
    return { x, y };
  };

  const agentPos = getRoutePoint(progress);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-750 bg-slate-100 dark:bg-slate-950/60 shadow-card">
      {/* Top Banner Status */}
      <div className="absolute top-3 left-3 right-3 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur px-3.5 py-2 rounded-lg shadow-subtle border border-slate-200/50 dark:border-slate-700/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-750 dark:text-slate-205">
          <FiNavigation className="text-brand-600 dark:text-brand-400 animate-pulse" />
          <span className="font-semibold truncate max-w-[180px]">
            Route: {pickupAddress.split(',')[0]} → {dropAddress.split(',')[0]}
          </span>
        </div>
        <div className="font-bold text-brand-650 dark:text-brand-400 uppercase tracking-wider">
          {Math.round(progress * 100)}% Transit
        </div>
      </div>

      {/* SVG Canvas Map */}
      <svg viewBox="0 0 500 300" className="w-full h-auto aspect-[5/3] block bg-slate-50 dark:bg-slate-900/60 transition-colors">
        {/* Map Grid Gridlines */}
        <defs>
          <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
            <path d="M 25 0 L 0 0 0 25" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-200 dark:text-slate-800" />
          </pattern>
        </defs>
        <rect width="500" height="300" fill="url(#grid)" />

        {/* Custom City Roads Layout Lines */}
        <g stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="text-slate-200 dark:text-slate-800/80 opacity-60">
          <line x1="50" y1="50" x2="450" y2="50" />
          <line x1="50" y1="150" x2="450" y2="150" />
          <line x1="50" y1="250" x2="450" y2="250" />
          <line x1="120" y1="20" x2="120" y2="280" />
          <line x1="260" y1="20" x2="260" y2="280" />
          <line x1="380" y1="20" x2="380" y2="280" />
        </g>

        {/* Actual Winding Route Path */}
        <path
          d={`M ${pickup.x} ${pickup.y} C 220 240, 280 60, ${drop.x} ${drop.y}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeDasharray="6,4"
          className="text-slate-350 dark:text-slate-650"
        />

        {/* Covered Route Path (Active highlight) */}
        {progress > 0 && (
          <path
            d={`M ${pickup.x} ${pickup.y} C 220 240, 280 60, ${drop.x} ${drop.y}`}
            fill="none"
            stroke="#6366f1"
            strokeWidth="3.5"
            strokeDasharray="6,4"
            strokeDashoffset="0"
            className="animate-[dash_10s_linear_infinite]"
            style={{
              clipPath: `polygon(0 0, ${agentPos.x + 10}px 0, ${agentPos.x + 10}px 100%, 0 100%)`
            }}
          />
        )}

        {/* Pickup Marker */}
        <g transform={`translate(${pickup.x}, ${pickup.y})`}>
          <circle r="14" fill="#0ea5e9" className="opacity-20 animate-ping" />
          <circle r="7" fill="#0ea5e9" stroke="#ffffff" strokeWidth="2" />
          <text y="-14" textAnchor="middle" className="fill-slate-600 dark:fill-slate-400 font-bold text-[9px]">PICKUP</text>
        </g>

        {/* Destination Drop Marker */}
        <g transform={`translate(${drop.x}, ${drop.y})`}>
          <circle r="14" fill="#10b981" className="opacity-20 animate-ping" />
          <circle r="7" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
          <text y="-14" textAnchor="middle" className="fill-slate-600 dark:fill-slate-400 font-bold text-[9px]">DROP</text>
        </g>

        {/* Live Delivery Agent Truck Icon Marker */}
        {progress < 1.0 && progress > 0.0 && (
          <g transform={`translate(${agentPos.x}, ${agentPos.y})`}>
            {/* Pulsing radar */}
            <circle r="18" fill="#6366f1" className="opacity-25 animate-ping" />
            <circle r="11" fill="#6366f1" stroke="#ffffff" strokeWidth="2" />
            <g transform="translate(-6, -6) scale(0.6)" fill="#ffffff">
              <path d="M19 10h-2V7c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v10h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm12 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm2-5.5h-3V8.5h3v4.5z" />
            </g>
            <text y="-16" textAnchor="middle" className="fill-brand-600 dark:fill-brand-400 font-extrabold text-[8px] tracking-wide uppercase">{agentName.split(' ')[0]}</text>
          </g>
        )}
      </svg>

      {/* Bottom Floating Info */}
      <div className="absolute bottom-3 left-3 right-3 bg-slate-900/80 backdrop-blur px-3 py-2 rounded-lg text-white text-xxs flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <FiInfo className="text-sky-400" />
          <span className="text-[10px] font-medium text-slate-300">
            {status === 'delivered' ? 'Shipment delivered successfully!' : `Agent is moving to drop zone.`}
          </span>
        </div>
        <span className="text-[9px] text-slate-400 font-mono">GPS ACTIVE</span>
      </div>
    </div>
  );
};

export default MapPlaceholder;
