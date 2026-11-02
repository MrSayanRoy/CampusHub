import React, { useState } from 'react';
import {
  Compass,
  Building2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Navigation,
  Car,
  TreePine,
  Sparkles,
  MapPin,
  Flame,
  Layers,
} from 'lucide-react';
import {
  CAMPUS_BOUNDS,
  CAMPUS_GATES,
  CAMPUS_PARKING,
  CAMPUS_GREENERY,
  CAMPUS_PATHS,
  CAMPUS_BUILDING_NODES,
} from '../../data/campusMapData';

/**
 * Top-Down University Campus Vector Schematic
 * Architectural SVG rendering with roads, walkways, quads, sports fields, parking, gates,
 * and high-contrast building footprints with selection highlights and zoom controls.
 */
export default function CampusOverviewMap({
  selectedBuilding,
  onSelectBuilding,
  highlightedRoom,
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [hoveredBuilding, setHoveredBuilding] = useState(null);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.0));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div className="relative bg-[#171717] rounded-xl overflow-hidden border border-neutral-800 shadow-lg select-none">
      {/* Map Control Bar (Top Left) */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-neutral-900/90 backdrop-blur-md p-1.5 rounded-lg border border-neutral-700 shadow-md">
        <button
          type="button"
          onClick={handleZoomIn}
          className="p-1.5 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded transition-colors cursor-pointer"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="p-1.5 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded transition-colors cursor-pointer"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleResetZoom}
          className="p-1.5 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded transition-colors cursor-pointer"
          title="Reset Campus View"
          aria-label="Reset View"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <span className="text-[11px] font-mono text-neutral-400 px-1.5 border-l border-neutral-700">
          {Math.round(zoomLevel * 100)}%
        </span>
      </div>

      {/* Compass Rose & Map Legend (Top Right) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900/90 backdrop-blur-md border border-neutral-700 text-[11px] text-neutral-300">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#DC2626] animate-pulse" />
            Selected Hall
          </span>
          <span className="text-neutral-600">•</span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded bg-emerald-500/60" />
            Quads & Lawns
          </span>
          <span className="text-neutral-600">•</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-3 border-t border-dashed border-red-400" />
            Walkway
          </span>
        </div>

        {/* Compass Rose */}
        <div className="p-2 rounded-xl bg-neutral-900/90 backdrop-blur-md border border-neutral-700 text-neutral-200 shadow-md flex flex-col items-center justify-center">
          <Compass className="h-5 w-5 text-[#DC2626]" />
          <span className="text-[9px] font-extrabold tracking-widest text-neutral-400 mt-0.5">N</span>
        </div>
      </div>

      {/* Interactive SVG Canvas */}
      <div className="w-full h-[400px] sm:h-[480px] lg:h-[500px] overflow-hidden flex items-center justify-center">
        <svg
          viewBox={CAMPUS_BOUNDS.viewBox}
          className="w-full h-full transition-transform duration-200 ease-out"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
          }}
        >
          <defs>
            {/* Subtle Dotted Background Grid */}
            <pattern id="campus-grid-dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#333333" opacity="0.6" />
            </pattern>

            {/* Diagonal Hatch for Parking Lots */}
            <pattern id="parking-stripes" width="10" height="10" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="10" stroke="#404040" strokeWidth="2" />
            </pattern>

            {/* Subtle Gradient for Grass Quads */}
            <linearGradient id="greenery-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#064E3B" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#065F46" stopOpacity="0.3" />
            </linearGradient>

            {/* Glowing red filter for selected building */}
            <filter id="red-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#DC2626" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* 1. Base Dark Ground Canvas */}
          <rect width="1000" height="700" fill="#141416" />
          <rect width="1000" height="700" fill="url(#campus-grid-dots)" />

          {/* 2. Campus Grounds Outer Boundary Border */}
          <rect
            x="20"
            y="20"
            width="960"
            height="660"
            rx="16"
            fill="none"
            stroke="#262626"
            strokeWidth="1.5"
            strokeDasharray="8 4"
          />

          {/* 3. Green Quads, Lawns & Sports Fields */}
          {CAMPUS_GREENERY.map((green) => (
            <g key={green.id}>
              <rect
                x={green.x}
                y={green.y}
                width={green.width}
                height={green.height}
                rx={green.rx}
                fill="url(#greenery-gradient)"
                stroke="#047857"
                strokeWidth="1.2"
                strokeDasharray="4 2"
                opacity="0.85"
              />
              <text
                x={green.x + green.width / 2}
                y={green.y + green.height / 2 + 3}
                fill="#34D399"
                fontSize="10"
                fontFamily="Inter, sans-serif"
                fontWeight="600"
                textAnchor="middle"
                opacity="0.75"
              >
                {green.name}
              </text>
            </g>
          ))}

          {/* 4. Parking Lots */}
          {CAMPUS_PARKING.map((lot) => (
            <g key={lot.id}>
              <rect
                x={lot.x}
                y={lot.y}
                width={lot.width}
                height={lot.height}
                rx="6"
                fill="#1C1C1E"
                stroke="#525252"
                strokeWidth="1"
              />
              <rect
                x={lot.x + 2}
                y={lot.y + 2}
                width={lot.width - 4}
                height={lot.height - 4}
                fill="url(#parking-stripes)"
                opacity="0.25"
              />
              <circle cx={lot.x + 18} cy={lot.y + 18} r="10" fill="#262626" stroke="#737373" strokeWidth="1" />
              <text
                x={lot.x + 18}
                y={lot.y + 22}
                fill="#E5E5E5"
                fontSize="11"
                fontWeight="800"
                textAnchor="middle"
              >
                P
              </text>
              <text
                x={lot.x + 34}
                y={lot.y + 22}
                fill="#A3A3A3"
                fontSize="9"
                fontWeight="700"
              >
                {lot.code}
              </text>
              <text
                x={lot.x + 10}
                y={lot.y + 45}
                fill="#737373"
                fontSize="8"
                fontWeight="500"
              >
                {lot.capacity}
              </text>
            </g>
          ))}

          {/* 5. Vehicular Access Roads (Wide dark gray stripes with center divider) */}
          <g stroke="#2B2B2F" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {CAMPUS_PATHS.roads.map((pathStr, idx) => (
              <path key={`road-bg-${idx}`} d={pathStr} />
            ))}
          </g>
          <g stroke="#E5E5E5" strokeWidth="1" strokeDasharray="6 6" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.35">
            {CAMPUS_PATHS.roads.map((pathStr, idx) => (
              <path key={`road-div-${idx}`} d={pathStr} />
            ))}
          </g>

          {/* 6. Pedestrian Walkways (Subtle brick-red dashed walking lines) */}
          <g stroke="#DC2626" strokeWidth="2.5" strokeDasharray="5 5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.45">
            {CAMPUS_PATHS.walkways.map((pathStr, idx) => (
              <path key={`walk-${idx}`} d={pathStr} />
            ))}
          </g>

          {/* 7. Central Plaza Wayfinding Marker */}
          <circle cx="530" cy="340" r="18" fill="#1C1C1E" stroke="#525252" strokeWidth="1.5" />
          <circle cx="530" cy="340" r="4" fill="#DC2626" />

          {/* 8. Campus Entrances & Gates Markers */}
          {CAMPUS_GATES.map((gate) => (
            <g key={gate.id} className="cursor-pointer">
              <circle cx={gate.x} cy={gate.y} r="10" fill="#262626" stroke="#E5E5E5" strokeWidth="1.5" />
              <circle cx={gate.x} cy={gate.y} r="4" fill="#16A34A" />
              <text
                x={gate.x}
                y={gate.y > 500 ? gate.y + 20 : gate.y - 14}
                fill="#E5E5E5"
                fontSize="10"
                fontFamily="Inter, sans-serif"
                fontWeight="700"
                textAnchor="middle"
              >
                {gate.name}
              </text>
            </g>
          ))}

          {/* 9. Interactive Campus Buildings */}
          {CAMPUS_BUILDING_NODES.map((bld) => {
            const isSelected = selectedBuilding?.id === bld.id;
            const isHovered = hoveredBuilding === bld.id;

            return (
              <g
                key={bld.id}
                onClick={() => onSelectBuilding(bld)}
                onMouseEnter={() => setHoveredBuilding(bld.id)}
                onMouseLeave={() => setHoveredBuilding(null)}
                className="cursor-pointer transition-all duration-150"
              >
                {/* Selection Halo / Glowing Drop Shadow */}
                {isSelected && (
                  <path
                    d={bld.map.path}
                    fill="none"
                    stroke="#DC2626"
                    strokeWidth="12"
                    strokeLinejoin="round"
                    filter="url(#red-glow)"
                    opacity="0.8"
                  />
                )}

                {/* Building Footprint Body */}
                <path
                  d={bld.map.path}
                  fill={isSelected ? '#DC2626' : isHovered ? '#2E2E33' : '#222226'}
                  stroke={isSelected ? '#FFFFFF' : isHovered ? '#DC2626' : '#45454A'}
                  strokeWidth={isSelected ? '2.5' : '1.5'}
                  strokeLinejoin="round"
                />

                {/* Roof Architectural Relief Lines */}
                <path
                  d={bld.map.path}
                  fill="none"
                  stroke={isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)'}
                  strokeWidth="6"
                  transform="scale(0.92) translate(14, 10)"
                  strokeLinejoin="round"
                />

                {/* Main Entrance Marker Arrow */}
                <circle
                  cx={bld.map.entrance.x}
                  cy={bld.map.entrance.y}
                  r="4"
                  fill={isSelected ? '#FFFFFF' : '#DC2626'}
                  stroke="#171717"
                  strokeWidth="1"
                />

                {/* Building Code & Badge Icon */}
                <g transform={`translate(${bld.map.labelX}, ${bld.map.labelY})`}>
                  {/* Pill Background */}
                  <rect
                    x="-38"
                    y="-22"
                    width="76"
                    height="38"
                    rx="6"
                    fill={isSelected ? '#991B1B' : '#141416'}
                    stroke={isSelected ? '#FFFFFF' : '#525252'}
                    strokeWidth="1"
                    opacity={isSelected ? '0.95' : '0.9'}
                  />

                  {/* Building Code (ENG, SCI, LIB, REC, STU) */}
                  <text
                    x="0"
                    y="-4"
                    fill="#FFFFFF"
                    fontSize="13"
                    fontFamily="Inter, sans-serif"
                    fontWeight="800"
                    textAnchor="middle"
                    letterSpacing="0.5"
                  >
                    {bld.code}
                  </text>

                  {/* Floor Count / Sector Subtext */}
                  <text
                    x="0"
                    y="10"
                    fill={isSelected ? '#FECACA' : '#A3A3A3'}
                    fontSize="8.5"
                    fontFamily="Inter, sans-serif"
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    {bld.floorsCount} Floors
                  </text>
                </g>

                {/* Pulsing beacon pin on selected building */}
                {isSelected && (
                  <g transform={`translate(${bld.map.labelX}, ${bld.map.labelY - 32})`}>
                    <circle cx="0" cy="0" r="10" fill="#DC2626" opacity="0.4" className="animate-ping" />
                    <circle cx="0" cy="0" r="5" fill="#DC2626" stroke="#FFFFFF" strokeWidth="1.5" />
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Map Footer Bar with Active Status & Quick Directions info */}
      <div className="bg-[#1C1C1E] px-4 py-2.5 border-t border-neutral-800 flex flex-wrap items-center justify-between text-xs text-neutral-300 gap-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-white">Campus Live Roster:</span>
          <span className="text-neutral-400">
            {selectedBuilding
              ? `Currently inspecting ${selectedBuilding.name} (${selectedBuilding.code}) • ${selectedBuilding.sector}`
              : 'Click any building on the map or select from directory'}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-neutral-400">
          <span>Walkways: 4–6 mins avg</span>
          <span>•</span>
          <span className="text-red-400 font-medium">RFID Touchless Access</span>
        </div>
      </div>
    </div>
  );
}
