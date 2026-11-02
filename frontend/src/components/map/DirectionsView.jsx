import React, { useState } from 'react';
import {
  Navigation,
  Clock,
  MapPin,
  CheckCircle2,
  Footprints,
  Compass,
  ArrowRight,
  Sparkles,
  X,
  Building2,
  Layers,
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { generateDirections } from '../../data/campusMapData';

/**
 * Step-by-Step Wayfinding Directions Component
 * Allows user to pick start location (Campus Gate, Building Entrance, Staircase, Elevator)
 * and view actual landmarked turn-by-turn navigation instructions to the selected room.
 */
export default function DirectionsView({
  building,
  floor,
  room,
  onClose,
  startPoint = 'building_entrance',
  onChangeStartPoint,
}) {
  const [activeStartPoint, setActiveStartPoint] = useState(startPoint);

  const directions = generateDirections({
    startPoint: activeStartPoint,
    building,
    floor,
    room,
  });

  const handleSelectStart = (val) => {
    setActiveStartPoint(val);
    onChangeStartPoint?.(val);
  };

  if (!directions) return null;

  return (
    <div className="bg-white rounded-xl border-2 border-[#DC2626] shadow-md p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-[#E5E5E5] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-50 text-[#DC2626] border border-red-100">
            <Navigation className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-[#171717]">
                Turn-by-Turn Wayfinding Route
              </h3>
              <Badge variant="primary" size="sm">
                Live Route Active
              </Badge>
            </div>
            <p className="text-xs text-[#737373] mt-0.5">
              To <strong className="text-[#171717]">{directions.destination}</strong> in {directions.buildingName}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#737373] hover:text-[#171717] hover:bg-neutral-100 transition-colors cursor-pointer"
            title="Close Directions"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Start Location Chooser */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[#171717] flex items-center justify-between">
          <span>Choose Your Starting Location:</span>
          <span className="text-[11px] font-normal text-[#737373]">
            Est. Walk: <strong className="text-emerald-700">{directions.estimatedTime}</strong> ({directions.distance})
          </span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {[
            { id: 'building_entrance', label: 'Building Entrance' },
            { id: 'campus_gate', label: 'North Campus Gate' },
            { id: 'staircase', label: 'West Staircase' },
            { id: 'elevator', label: 'Central Elevator' },
          ].map((sp) => (
            <button
              key={sp.id}
              type="button"
              onClick={() => handleSelectStart(sp.id)}
              className={`p-2 rounded-lg border text-left font-semibold transition-all cursor-pointer ${
                activeStartPoint === sp.id
                  ? 'bg-[#FEF2F2] border-[#DC2626] text-[#DC2626] shadow-2xs'
                  : 'bg-white border-[#E5E5E5] text-[#525252] hover:bg-neutral-50'
              }`}
            >
              <span className="block text-[11px] truncate">{sp.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step-by-Step Directions Ordered List */}
      <div className="space-y-2 bg-[#FAFAFA] border border-[#E5E5E5] p-3.5 rounded-xl">
        <span className="text-xs font-bold text-[#171717] block mb-2 flex items-center gap-1.5">
          <Footprints className="h-4 w-4 text-[#DC2626]" />
          Step-by-Step Walking Route:
        </span>
        <ol className="space-y-2.5">
          {directions.steps.map((step, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-[#171717]">
              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-white border border-[#E5E5E5] text-[#DC2626] font-bold text-[10px] shrink-0 mt-0.5 shadow-2xs">
                {idx + 1}
              </span>
              <p className="leading-relaxed">
                {step}
              </p>
            </li>
          ))}
        </ol>
      </div>

      {/* Guidance Note */}
      <div className="flex items-center justify-between text-[11px] text-[#737373] bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          The animated red dashed path is currently visible on the indoor floor plan above.
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-[#DC2626] font-bold hover:underline cursor-pointer shrink-0 ml-2"
        >
          Done
        </button>
      </div>
    </div>
  );
}
