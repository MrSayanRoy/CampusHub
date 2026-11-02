import React, { useState } from 'react';
import {
  Compass,
  Layers,
  MapPin,
  Sparkles,
  Navigation,
  Info,
  Maximize2,
  Users,
  CheckCircle2,
  ArrowRight,
  Monitor,
  GraduationCap,
  Briefcase,
  DoorOpen,
} from 'lucide-react';
import { ROOM_CATEGORIES } from '../../data/campusMapData';

/**
 * Interactive SVG Indoor Architectural Floor Plan
 * Visualizes classrooms, labs, faculty offices, seminar rooms, restrooms, stairs, elevators,
 * circulation corridors, and turn-by-turn route paths with hover cards & click-to-inspect.
 */
export default function IndoorFloorPlan({
  building,
  floorData,
  selectedRoom,
  onSelectRoom,
  activeRoute,
}) {
  const [hoveredRoom, setHoveredRoom] = useState(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');

  if (!floorData) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-[#E5E5E5] text-xs text-[#737373]">
        Select a building and floor to view the indoor architectural plan.
      </div>
    );
  }

  const { dimensions, rooms, corridorPath, floorName, floorNumber } = floorData;

  const filteredRooms = rooms.filter((r) => {
    if (activeCategoryFilter === 'All') return true;
    return r.type === activeCategoryFilter;
  });

  return (
    <div className="space-y-3">
      {/* Floor Plan Header & Category Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAFAFA] border border-[#E5E5E5] p-3 sm:px-4 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-50 text-[#DC2626] border border-red-100">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-[#171717]">
              {building.name} • {floorName}
            </h4>
            <p className="text-[11px] text-[#737373]">
              {rooms.length} facilities, labs & instructional rooms on this level
            </p>
          </div>
        </div>

        {/* Category Legend & Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveCategoryFilter('All')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer shrink-0 ${
              activeCategoryFilter === 'All'
                ? 'bg-[#171717] text-white shadow-2xs'
                : 'bg-white border border-[#E5E5E5] text-[#525252] hover:bg-neutral-100'
            }`}
          >
            All Rooms
          </button>
          {Object.entries(ROOM_CATEGORIES).map(([catKey, catMeta]) => (
            <button
              key={catKey}
              type="button"
              onClick={() =>
                setActiveCategoryFilter(activeCategoryFilter === catKey ? 'All' : catKey)
              }
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer shrink-0 border ${
                activeCategoryFilter === catKey
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                  : 'bg-white border-[#E5E5E5] text-[#525252] hover:border-neutral-400'
              }`}
            >
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: catMeta.stroke }}
              />
              <span>{catKey}</span>
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative bg-[#FAFAFA] rounded-xl border border-[#E5E5E5] p-2 sm:p-4 shadow-xs overflow-hidden select-none">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#a3a3a3_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Hover Floating Tooltip */}
        {hoveredRoom && (
          <div
            className="absolute top-4 right-4 z-20 pointer-events-none bg-[#171717] text-white text-xs rounded-lg p-2.5 shadow-xl border border-neutral-700 animate-in fade-in duration-150 max-w-xs"
          >
            <div className="flex items-center justify-between gap-3 mb-1">
              <span className="font-extrabold text-[#DC2626]">{hoveredRoom.code}</span>
              <span className="text-[10px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded">
                {hoveredRoom.type}
              </span>
            </div>
            <p className="font-bold text-white text-[11px] leading-snug">{hoveredRoom.name}</p>
            <p className="text-[10px] text-neutral-400 mt-1">{hoveredRoom.department}</p>
            <p className="text-[10px] text-neutral-300 mt-0.5 font-medium">{hoveredRoom.capacity}</p>
          </div>
        )}

        {/* SVG Drawing */}
        <div className="w-full flex items-center justify-center">
          <svg
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            className="w-full h-auto max-h-[500px]"
          >
            <defs>
              {/* Hatch pattern for vertical circulation (Elevators & Stairs) */}
              <pattern
                id="circulation-hatch"
                width="8"
                height="8"
                patternTransform="rotate(45)"
                patternUnits="userSpaceOnUse"
              >
                <line x1="0" y1="0" x2="0" y2="8" stroke="#94A3B8" strokeWidth="2" />
              </pattern>

              {/* Glowing animated pulse for selected room */}
              <filter id="room-selection-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#DC2626" floodOpacity="0.5" />
              </filter>
            </defs>

            {/* 1. Exterior Building Perimeter Wall (Solid Charcoal Border) */}
            <rect
              x="30"
              y="30"
              width={dimensions.width - 60}
              height={dimensions.height - 60}
              rx="12"
              fill="#FFFFFF"
              stroke="#171717"
              strokeWidth="5"
            />

            {/* 2. Circulation Corridors / Hallways */}
            {corridorPath && (
              <g>
                <path
                  d={corridorPath}
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="38"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={corridorPath}
                  fill="none"
                  stroke="#CBD5E1"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                />
                <text
                  x="400"
                  y="234"
                  fill="#94A3B8"
                  fontSize="10"
                  fontFamily="Inter, sans-serif"
                  fontWeight="700"
                  letterSpacing="2"
                  textAnchor="middle"
                  opacity="0.8"
                >
                  MAIN CENTRAL CORRIDOR
                </text>
              </g>
            )}

            {/* 3. Interactive Room Blocks */}
            {rooms.map((room) => {
              const catMeta = ROOM_CATEGORIES[room.type] || ROOM_CATEGORIES.Classroom;
              const isSelected = selectedRoom?.id === room.id;
              const isHovered = hoveredRoom?.id === room.id;
              const isFilteredOut =
                activeCategoryFilter !== 'All' && room.type !== activeCategoryFilter;

              const isCirculation = room.type === 'Circulation';

              return (
                <g
                  key={room.id}
                  onClick={() => onSelectRoom(room)}
                  onMouseEnter={() => setHoveredRoom(room)}
                  onMouseLeave={() => setHoveredRoom(null)}
                  className="cursor-pointer transition-all duration-150"
                  opacity={isFilteredOut ? 0.25 : 1}
                >
                  {/* Selection Glow Stroke */}
                  {isSelected && (
                    <rect
                      x={room.svg.x - 3}
                      y={room.svg.y - 3}
                      width={room.svg.width + 6}
                      height={room.svg.height + 6}
                      rx="6"
                      fill="none"
                      stroke="#DC2626"
                      strokeWidth="3.5"
                      filter="url(#room-selection-glow)"
                    />
                  )}

                  {/* Room Body Box */}
                  <rect
                    x={room.svg.x}
                    y={room.svg.y}
                    width={room.svg.width}
                    height={room.svg.height}
                    rx="4"
                    fill={
                      isSelected
                        ? catMeta.selectedFill
                        : isHovered
                        ? catMeta.hoverFill
                        : catMeta.fill
                    }
                    stroke={
                      isSelected
                        ? '#DC2626'
                        : isHovered
                        ? catMeta.stroke
                        : catMeta.stroke
                    }
                    strokeWidth={isSelected ? '2.5' : '1.5'}
                  />

                  {/* Circulation Hatch Pattern overlay for elevators/stairs */}
                  {isCirculation && (
                    <rect
                      x={room.svg.x + 2}
                      y={room.svg.y + 2}
                      width={room.svg.width - 4}
                      height={room.svg.height - 4}
                      fill="url(#circulation-hatch)"
                      opacity="0.3"
                    />
                  )}

                  {/* Doorway Notch Indicator */}
                  {room.door && (
                    <g>
                      <circle
                        cx={room.door.x}
                        cy={room.door.y}
                        r="3.5"
                        fill={isSelected ? '#DC2626' : '#171717'}
                      />
                      <line
                        x1={room.door.x - 4}
                        y1={room.door.y}
                        x2={room.door.x + 4}
                        y2={room.door.y}
                        stroke="#171717"
                        strokeWidth="1.5"
                      />
                    </g>
                  )}

                  {/* Room Number & Label */}
                  <g
                    transform={`translate(${room.svg.x + room.svg.width / 2}, ${
                      room.svg.y + room.svg.height / 2
                    })`}
                  >
                    {/* Room Code Badge (e.g. ENG-204) */}
                    <text
                      x="0"
                      y="-8"
                      fill={isSelected ? '#991B1B' : '#0F172A'}
                      fontSize={room.svg.width < 100 ? '10' : '13'}
                      fontFamily="Inter, sans-serif"
                      fontWeight="800"
                      textAnchor="middle"
                      letterSpacing="0.2"
                    >
                      {room.code}
                    </text>

                    {/* Room Short Title or Capacity */}
                    <text
                      x="0"
                      y="10"
                      fill={isSelected ? '#7F1D1D' : '#475569'}
                      fontSize={room.svg.width < 100 ? '8' : '9.5'}
                      fontFamily="Inter, sans-serif"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {room.name.length > 24
                        ? room.name.slice(0, 22) + '...'
                        : room.name}
                    </text>

                    {/* Capacity pill */}
                    {room.capacity && room.svg.height > 90 && (
                      <text
                        x="0"
                        y="24"
                        fill={isSelected ? '#991B1B' : '#64748B'}
                        fontSize="8"
                        fontFamily="Inter, sans-serif"
                        fontWeight="500"
                        textAnchor="middle"
                      >
                        {room.capacity}
                      </text>
                    )}
                  </g>
                </g>
              );
            })}

            {/* 4. Active Wayfinding Route Line (Animated dashed path from entrance to room door!) */}
            {activeRoute && selectedRoom?.door && (
              <g className="pointer-events-none">
                {/* Route Glow Path */}
                <path
                  d={`M 400 370 L 400 230 L ${selectedRoom.door.x} 230 L ${selectedRoom.door.x} ${selectedRoom.door.y}`}
                  fill="none"
                  stroke="#DC2626"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.3"
                />
                {/* Animated Pulsing Route Line */}
                <path
                  d={`M 400 370 L 400 230 L ${selectedRoom.door.x} 230 L ${selectedRoom.door.x} ${selectedRoom.door.y}`}
                  fill="none"
                  stroke="#DC2626"
                  strokeWidth="3"
                  strokeDasharray="8 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-[dash_1.5s_linear_infinite]"
                />
                {/* Destination Beacon Target */}
                <circle
                  cx={selectedRoom.door.x}
                  cy={selectedRoom.door.y}
                  r="6"
                  fill="#DC2626"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="animate-pulse"
                />
                {/* Origin Marker */}
                <circle
                  cx="400"
                  cy="370"
                  r="6"
                  fill="#16A34A"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <text
                  x="400"
                  y="395"
                  fill="#16A34A"
                  fontSize="9.5"
                  fontFamily="Inter, sans-serif"
                  fontWeight="800"
                  textAnchor="middle"
                >
                  START: ENTRANCE
                </text>
              </g>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
