import React from 'react';
import {
  MapPin,
  Building2,
  Layers,
  Users,
  Compass,
  Navigation,
  Check,
  Sparkles,
  Info,
  Clock,
  X,
  Share2,
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { ROOM_CATEGORIES } from '../../data/campusMapData';

/**
 * Room Information Panel
 * Displays detailed metadata for selected classroom, lab, or office:
 * Room number, Building, Floor, Department, Type, Capacity, Nearby Landmark, Facilities, and Directions.
 */
export default function RoomInfoPanel({
  room,
  building,
  floorName,
  onClose,
  onOpenDirections,
  isDirectionsActive,
}) {
  if (!room) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-5 text-center text-xs text-[#737373] space-y-2">
        <div className="p-3 bg-neutral-100 rounded-full w-10 h-10 mx-auto flex items-center justify-center text-[#737373]">
          <MapPin className="h-5 w-5" />
        </div>
        <p className="font-bold text-[#171717]">No Room Selected</p>
        <p className="text-[11px]">
          Click on any room in the floor plan or search for a room number like{' '}
          <strong className="text-[#DC2626]">ENG-204</strong> above.
        </p>
      </div>
    );
  }

  const catMeta = ROOM_CATEGORIES[room.type] || ROOM_CATEGORIES.Classroom;

  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-xs overflow-hidden">
      {/* Header with Room Code & Dismiss */}
      <div className="bg-[#FAFAFA] border-b border-[#E5E5E5] p-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold px-2.5 py-0.5 rounded bg-[#DC2626] text-white tracking-wide">
              {room.code}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${catMeta.badgeColor}`}
            >
              {room.type}
            </span>
          </div>
          <h3 className="text-base font-extrabold text-[#171717] mt-1.5 leading-snug">
            {room.name}
          </h3>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#737373] hover:text-[#171717] hover:bg-neutral-100 transition-colors cursor-pointer"
            title="Deselect Room"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Body Details Grid */}
      <div className="p-4 space-y-4 text-xs">
        {/* Core Attributes */}
        <div className="space-y-2.5 divide-y divide-[#F5F5F5]">
          <div className="flex items-center justify-between pt-1">
            <span className="text-[#737373] font-medium flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-[#DC2626]" /> Building
            </span>
            <span className="font-bold text-[#171717] text-right truncate max-w-[190px]">
              {building?.name || 'Academic Hall'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[#737373] font-medium flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-[#DC2626]" /> Floor Level
            </span>
            <span className="font-bold text-[#171717]">{floorName}</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[#737373] font-medium flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-[#DC2626]" /> Department
            </span>
            <span className="font-bold text-[#171717] text-right truncate max-w-[190px]">
              {room.department}
            </span>
          </div>

          {room.capacity && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-[#737373] font-medium flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-blue-600" /> Room Capacity
              </span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {room.capacity}
              </span>
            </div>
          )}

          {room.nearbyLandmark && (
            <div className="pt-2">
              <span className="text-[#737373] font-medium block mb-0.5">
                Nearby Landmark
              </span>
              <p className="font-semibold text-[#171717] bg-[#FAFAFA] border border-[#E5E5E5] p-2 rounded-lg text-[11px] leading-relaxed">
                📍 {room.nearbyLandmark}
              </p>
            </div>
          )}
        </div>

        {/* Room Facilities List */}
        {room.facilities && room.facilities.length > 0 && (
          <div>
            <span className="text-xs font-bold text-[#171717] block mb-1.5">
              Installed Technology & Amenities
            </span>
            <div className="space-y-1">
              {room.facilities.map((fac, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-[11px] text-[#525252] bg-neutral-50 px-2.5 py-1 rounded border border-neutral-100"
                >
                  <Check className="h-3 w-3 text-[#16A34A] shrink-0" />
                  <span className="truncate">{fac}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-1">
          <Button
            variant={isDirectionsActive ? 'secondary' : 'primary'}
            size="sm"
            className="w-full justify-center"
            leftIcon={Navigation}
            onClick={() => onOpenDirections?.(room)}
          >
            {isDirectionsActive ? 'Hide Wayfinding Route' : 'Get Directions to Room'}
          </Button>
        </div>
      </div>
    </div>
  );
}
