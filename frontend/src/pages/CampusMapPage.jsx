import React, { useState, useMemo, useRef } from 'react';
import {
  MapPin,
  Compass,
  Building2,
  Clock,
  Layers,
  Search,
  Navigation,
  Sparkles,
  Info,
  Check,
  X,
  ChevronRight,
  DoorOpen,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';
import {
  CAMPUS_BUILDING_NODES,
  INDOOR_FLOOR_PLANS,
  searchCampusCatalog,
  ROOM_CATEGORIES,
} from '../data/campusMapData';
import CampusOverviewMap from '../components/map/CampusOverviewMap';
import IndoorFloorPlan from '../components/map/IndoorFloorPlan';
import RoomInfoPanel from '../components/map/RoomInfoPanel';
import DirectionsView from '../components/map/DirectionsView';

/**
 * CampusHub Interactive Campus Map & Indoor Navigation Portal
 * Top-down vector campus schematic with multi-floor architectural floor plans,
 * universal room/department search, interactive room inspection, and landmarked turn-by-turn wayfinding.
 */
export default function CampusMapPage() {
  const { buildings: contextBuildings } = useApp();
  const { addToast } = useToast();
  const indoorPlanRef = useRef(null);

  // Merge context buildings with spatial nodes
  const buildings = useMemo(() => {
    return CAMPUS_BUILDING_NODES.map((bld) => {
      const match = contextBuildings?.find((cb) => cb.code === bld.code || cb.id === bld.id);
      return {
        ...bld,
        ...(match || {}),
        map: bld.map,
        floorsCount: bld.floorsCount,
        floorsAvailable: bld.floorsAvailable,
        defaultFloor: bld.defaultFloor,
      };
    });
  }, [contextBuildings]);

  // Selected Building (Defaults to ENG: Engineering & Computing Hall)
  const [selectedBuilding, setSelectedBuilding] = useState(buildings[0]);

  // Selected Floor Number (Defaults to building's default floor, e.g. 2 for ENG)
  const [selectedFloorNum, setSelectedFloorNum] = useState(buildings[0]?.defaultFloor ?? 2);

  // Selected Room within active floor
  const [selectedRoom, setSelectedRoom] = useState(() => {
    const defaultFloorData = INDOOR_FLOOR_PLANS['bld-1']?.[2];
    return defaultFloorData?.rooms?.find((r) => r.code === 'ENG-204') || null;
  });

  // Universal Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Directions state
  const [isDirectionsOpen, setIsDirectionsOpen] = useState(false);
  const [directionsStartPoint, setDirectionsStartPoint] = useState('building_entrance');

  // Active Floor Data for current building and floor
  const currentBuildingFloors = INDOOR_FLOOR_PLANS[selectedBuilding?.id] || {};
  const currentFloorData =
    currentBuildingFloors[selectedFloorNum] ||
    currentBuildingFloors[0] ||
    Object.values(currentBuildingFloors)[0];

  // Real-time universal search suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return searchCampusCatalog(searchTerm);
  }, [searchTerm]);

  // Filtered building list for the right directory panel
  const filteredBuildings = useMemo(() => {
    if (!searchTerm.trim()) return buildings;
    const q = searchTerm.toLowerCase();
    return buildings.filter((b) => {
      return (
        b.name.toLowerCase().includes(q) ||
        b.code.toLowerCase().includes(q) ||
        b.departments.some((d) => d.toLowerCase().includes(q)) ||
        (b.features && b.features.some((f) => f.toLowerCase().includes(q)))
      );
    });
  }, [buildings, searchTerm]);

  // Handler: Select Building
  const handleSelectBuilding = (bld) => {
    setSelectedBuilding(bld);
    const defaultFloor = bld.defaultFloor ?? bld.floorsAvailable?.[0] ?? 0;
    setSelectedFloorNum(defaultFloor);
    setSelectedRoom(null);
    setIsDirectionsOpen(false);

    addToast({
      title: `${bld.code}: ${bld.name}`,
      message: `Inspecting ${bld.sector}. Selected ${defaultFloor === 0 ? 'Ground' : defaultFloor + 'th'} Floor.`,
      type: 'info',
    });
  };

  // Handler: Select Floor
  const handleSelectFloor = (floorNum) => {
    setSelectedFloorNum(floorNum);
    setSelectedRoom(null);
    setIsDirectionsOpen(false);
  };

  // Handler: Select Room
  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
  };

  // Handler: Click Search Result
  const handleSelectSearchResult = (result) => {
    // 1. Identify relevant building
    const targetBuilding = buildings.find(
      (b) => b.id === result.buildingId || b.code === result.buildingCode
    );

    if (targetBuilding) {
      setSelectedBuilding(targetBuilding);

      // 2. Select corresponding floor
      const targetFloor = result.floorNumber ?? targetBuilding.defaultFloor ?? 0;
      setSelectedFloorNum(targetFloor);

      // 3. Select room if it's a room-level result
      if (result.room) {
        setSelectedRoom(result.room);
        addToast({
          title: `Located ${result.room.code}`,
          message: `${result.room.name} in ${targetBuilding.name} on ${result.floorName}.`,
          type: 'success',
        });
      } else {
        setSelectedRoom(null);
        addToast({
          title: `Located ${targetBuilding.name}`,
          message: `Opened ${targetFloor === 0 ? 'Ground' : targetFloor + 'th'} floor layout.`,
          type: 'info',
        });
      }

      // 4. Clear search query and dismiss dropdown
      setSearchTerm('');
      setIsSearchFocused(false);

      // 5. Smooth scroll down to the floor plan for instant feedback
      setTimeout(() => {
        indoorPlanRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  // Toggle Directions
  const handleToggleDirections = (roomToNavigate) => {
    if (!roomToNavigate && !selectedRoom) {
      // Default to first room in floor if none selected
      const firstRoom = currentFloorData?.rooms?.[0];
      if (firstRoom) setSelectedRoom(firstRoom);
    } else if (roomToNavigate) {
      setSelectedRoom(roomToNavigate);
    }
    setIsDirectionsOpen(!isDirectionsOpen);
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#171717] tracking-tight flex items-center gap-2.5">
            <Compass className="h-6 w-6 text-[#DC2626]" />
            Campus Navigation & Directory
          </h1>
          <p className="text-xs sm:text-sm text-[#737373] mt-1">
            Top-down campus schematic, multi-level indoor architectural floor plans, and room-by-room directions.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="primary" size="lg">
            {buildings.length} University Facilities
          </Badge>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Interactive Wayfinding
          </span>
        </div>
      </div>

      {/* 2. Top-Down Campus Schematic & Facility Directory Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Central Campus Spatial Schematic */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-[#FAFAFA] border-b border-[#E5E5E5] py-3.5 px-4 sm:px-6">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#DC2626]" />
                  Campus Spatial Schematic
                </CardTitle>
                <CardDescription className="text-xs">
                  Click any building footprint to inspect floors, academic departments, and indoor room plans
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-white border border-[#E5E5E5] text-[#171717] shadow-2xs">
                  Active: <strong className="text-[#DC2626]">{selectedBuilding?.code}</strong>
                </span>
              </div>
            </CardHeader>

            {/* SVG Top-Down University Campus Map */}
            <CampusOverviewMap
              selectedBuilding={selectedBuilding}
              onSelectBuilding={handleSelectBuilding}
              highlightedRoom={selectedRoom}
            />
          </Card>
        </div>

        {/* Right 1 Col: Upgraded Universal Facility Directory & Search */}
        <div className="space-y-4">
          <Card className="overflow-visible">
            <CardHeader className="pb-3 border-b border-[#E5E5E5]">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Search className="h-4 w-4 text-[#DC2626]" />
                  Universal Campus Search
                </CardTitle>
                <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                  All 5 Buildings
                </span>
              </div>
              <CardDescription className="text-xs">
                Search room number, department, building or facility...
              </CardDescription>

              {/* Universal Search Input */}
              <div className="relative mt-3">
                <Input
                  icon={Search}
                  placeholder="Search room number, department, building or facility..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="pr-8 text-xs"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#737373] hover:text-[#171717] rounded-full transition-colors cursor-pointer"
                    title="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}

                {/* Real-Time Search Suggestions Dropdown */}
                {searchTerm.trim().length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-white rounded-xl border border-[#E5E5E5] shadow-xl overflow-hidden divide-y divide-[#F5F5F5] max-h-72 overflow-y-auto">
                    {searchSuggestions.length === 0 ? (
                      <div className="p-4 text-center text-xs text-[#737373]">
                        No matching rooms or facilities found for "{searchTerm}".
                      </div>
                    ) : (
                      searchSuggestions.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleSelectSearchResult(item)}
                          className="p-3 hover:bg-[#FEF2F2]/60 cursor-pointer transition-colors text-left group"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-[#171717] group-hover:text-[#DC2626] transition-colors truncate">
                              {item.title}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-100 text-[#525252] border border-neutral-200 shrink-0">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#737373] mt-0.5 truncate">
                            {item.subtitle}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Quick Jump Search Pills */}
              <div className="mt-2.5 pt-2 border-t border-[#F5F5F5]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373] block mb-1">
                  Quick Navigation Examples:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['ENG-204', 'LIB-101', 'SCI-001', 'STU-001', 'REC-002'].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => {
                        setSearchTerm(q);
                        const results = searchCampusCatalog(q);
                        if (results.length > 0) {
                          handleSelectSearchResult(results[0]);
                        }
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-[#525252] hover:bg-[#FEF2F2] hover:text-[#DC2626] hover:border-red-200 border border-transparent transition-colors cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>

            {/* Building Directory List */}
            <CardContent className="p-0 divide-y divide-[#E5E5E5] max-h-[380px] overflow-y-auto">
              {filteredBuildings.map((bld) => {
                const isSelected = selectedBuilding?.id === bld.id;
                return (
                  <div
                    key={bld.id}
                    onClick={() => handleSelectBuilding(bld)}
                    className={`p-3.5 hover:bg-neutral-50 transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-[#FEF2F2]/70 border-l-4 border-l-[#DC2626] pl-3'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#171717]">{bld.name}</span>
                      <span className="text-[10px] font-bold text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] px-1.5 py-0.5 rounded">
                        {bld.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#737373] mt-0.5">{bld.sector}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-[#737373] font-medium">
                        {bld.floorsCount} Floors • {bld.badge || 'Academic Hall'}
                      </span>
                      <span className="text-[#DC2626] font-bold text-[11px] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        Inspect Floors &rarr;
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 3. Selected Building Details Card with Dynamic Floor Selector & Indoor Architectural Floor Plan */}
      {selectedBuilding && (
        <div ref={indoorPlanRef} className="space-y-6">
          <Card className="border-[#DC2626]/30 shadow-sm overflow-hidden">
            {/* Building Header Bar */}
            <CardHeader className="bg-white border-b border-[#E5E5E5]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-[#DC2626] text-white">
                      {selectedBuilding.code}
                    </span>
                    <CardTitle className="text-lg sm:text-xl font-extrabold text-[#171717]">
                      {selectedBuilding.name}
                    </CardTitle>
                  </div>
                  <CardDescription className="flex items-center gap-2 mt-1.5 text-xs text-[#737373] flex-wrap">
                    <span className="flex items-center gap-1 font-semibold text-[#171717]">
                      <MapPin className="h-3.5 w-3.5 text-[#DC2626]" />
                      {selectedBuilding.sector}
                    </span>
                    <span>•</span>
                    <span>{selectedBuilding.floorsCount} Floors</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-medium">
                      Operating: {selectedBuilding.hours}
                    </span>
                  </CardDescription>
                </div>

                {/* Primary Directions Action Button */}
                <div className="flex items-center gap-2.5 self-start md:self-auto">
                  <Button
                    size="sm"
                    variant={isDirectionsOpen ? 'secondary' : 'primary'}
                    leftIcon={Navigation}
                    onClick={() => handleToggleDirections()}
                  >
                    {isDirectionsOpen ? 'Hide Directions' : 'Directions to Room'}
                  </Button>
                </div>
              </div>

              {/* Dynamic Floor Selector Tabs (Ground Floor | 1st Floor | 2nd Floor | 3rd Floor | 4th Floor) */}
              <div className="mt-4 pt-3 border-t border-[#F5F5F5] flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#171717]">
                  <Layers className="h-4 w-4 text-[#DC2626]" />
                  <span>Select Floor Level:</span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {selectedBuilding.floorsAvailable.map((fNum) => {
                    const fName = fNum === 0 ? 'Ground Floor' : `${fNum}th Floor`;
                    const isActive = selectedFloorNum === fNum;
                    const floorRoomCount =
                      INDOOR_FLOOR_PLANS[selectedBuilding.id]?.[fNum]?.rooms?.length || 0;

                    return (
                      <button
                        key={fNum}
                        type="button"
                        onClick={() => handleSelectFloor(fNum)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                          isActive
                            ? 'bg-[#DC2626] text-white shadow-xs scale-102'
                            : 'bg-[#FAFAFA] border border-[#E5E5E5] text-[#525252] hover:bg-neutral-100 hover:border-neutral-300'
                        }`}
                      >
                        <span>{fName}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-neutral-200 text-[#525252]'
                          }`}
                        >
                          {floorRoomCount} rooms
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardHeader>

            {/* Building Metadata Summary (Departments & Features) */}
            <CardContent className="bg-[#FAFAFA] border-b border-[#E5E5E5] py-3.5 px-4 sm:px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#737373] font-bold block mb-1">
                    Housed Academic Departments:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedBuilding.departments.map((dept, idx) => (
                      <span
                        key={idx}
                        className="bg-white border border-[#E5E5E5] px-2 py-0.5 rounded text-[11px] font-semibold text-[#171717]"
                      >
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[#737373] font-bold block mb-1">
                    Key Facilities on Record:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedBuilding.features.map((feat, idx) => (
                      <Badge key={idx} variant="secondary" size="sm">
                        <Check className="h-3 w-3 text-[#16A34A]" /> {feat}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>

            {/* Turn-by-Turn Directions Banner (when active) */}
            {isDirectionsOpen && (
              <div className="p-4 sm:p-6 bg-red-50/50 border-b border-red-200">
                <DirectionsView
                  building={selectedBuilding}
                  floor={currentFloorData}
                  room={selectedRoom || currentFloorData?.rooms?.[0]}
                  startPoint={directionsStartPoint}
                  onChangeStartPoint={(sp) => setDirectionsStartPoint(sp)}
                  onClose={() => setIsDirectionsOpen(false)}
                />
              </div>
            )}

            {/* Detailed Interactive Indoor Floor Plan & Room Info Panel */}
            <div className="p-4 sm:p-6 bg-white">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left (8 cols): Interactive Floor Plan Vector Canvas */}
                <div className="lg:col-span-8 space-y-3">
                  <IndoorFloorPlan
                    building={selectedBuilding}
                    floorData={currentFloorData}
                    selectedRoom={selectedRoom}
                    onSelectRoom={handleSelectRoom}
                    activeRoute={isDirectionsOpen}
                  />
                </div>

                {/* Right (4 cols): Dedicated Room Information Panel */}
                <div className="lg:col-span-4 space-y-4">
                  <RoomInfoPanel
                    room={selectedRoom}
                    building={selectedBuilding}
                    floorName={currentFloorData?.floorName}
                    onClose={() => setSelectedRoom(null)}
                    onOpenDirections={() => handleToggleDirections(selectedRoom)}
                    isDirectionsActive={isDirectionsOpen}
                  />

                  {/* Floor Quick Directory Table */}
                  <Card>
                    <CardHeader className="py-3 px-4 bg-[#FAFAFA] border-b border-[#E5E5E5]">
                      <CardTitle className="text-xs font-bold flex items-center justify-between">
                        <span>Rooms on {currentFloorData?.floorName}</span>
                        <span className="text-[10px] text-[#737373] font-normal">
                          {currentFloorData?.rooms?.length || 0} Rooms
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 divide-y divide-[#F5F5F5] max-h-56 overflow-y-auto">
                      {currentFloorData?.rooms?.map((rm) => {
                        const isRmActive = selectedRoom?.id === rm.id;
                        return (
                          <div
                            key={rm.id}
                            onClick={() => handleSelectRoom(rm)}
                            className={`p-2.5 px-3 text-xs flex items-center justify-between hover:bg-neutral-50 cursor-pointer transition-colors ${
                              isRmActive
                                ? 'bg-[#FEF2F2] border-l-3 border-[#DC2626] font-bold text-[#DC2626]'
                                : 'text-[#525252]'
                            }`}
                          >
                            <div className="truncate pr-2">
                              <span className="font-bold text-[#171717] mr-1.5">
                                {rm.code}:
                              </span>
                              <span className="truncate">{rm.name}</span>
                            </div>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 text-[#737373] shrink-0">
                              {rm.type}
                            </span>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
