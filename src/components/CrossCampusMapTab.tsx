import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Compass,
  Building,
  Home,
  GraduationCap,
  Coffee,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Phone,
  MessageSquare,
  Clock,
  Sparkles,
  Bus,
  Zap,
  Droplets,
  Search,
  Route,
  Navigation as NavigationIcon,
  Eye,
  AlertCircle
} from 'lucide-react';
import { CampusInfo, CampusHotspot } from '../types';
import { CAMPUS_MAP_DATA, ALL_CAMPUS_REGIONS } from '../data/campusesMapData';

interface CrossCampusMapTabProps {
  onSelectLodgeForRoommate?: (lodgeName: string, campus: string) => void;
}

export const CrossCampusMapTab: React.FC<CrossCampusMapTabProps> = ({
  onSelectLodgeForRoommate
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('All Regions');
  const [selectedCampusId, setSelectedCampusId] = useState<string>('ndu-amassoma');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedHotspot, setSelectedHotspot] = useState<CampusHotspot | null>(null);
  const [copiedCoords, setCopiedCoords] = useState<boolean>(false);

  // Walk Distance Calculator State
  const [calcFrom, setCalcFrom] = useState<string>('gate');
  const [calcTo, setCalcTo] = useState<string>('');

  const filteredCampuses = useMemo(() => {
    if (selectedRegion === 'All Regions') return CAMPUS_MAP_DATA;
    return CAMPUS_MAP_DATA.filter((c) => c.region === selectedRegion);
  }, [selectedRegion]);

  const activeCampus = useMemo(() => {
    return CAMPUS_MAP_DATA.find((c) => c.id === selectedCampusId) || CAMPUS_MAP_DATA[0];
  }, [selectedCampusId]);

  // Set default selected hotspot when campus changes
  React.useEffect(() => {
    if (activeCampus.hotspots.length > 0) {
      setSelectedHotspot(activeCampus.hotspots[0]);
      setCalcTo(activeCampus.hotspots[0].id);
    }
  }, [activeCampus]);

  const filteredHotspots = useMemo(() => {
    return activeCampus.hotspots
      .filter((spot) => spot.category !== 'scout')
      .filter((spot) => {
        const matchCat = activeCategory === 'all' || spot.category === activeCategory;
        const matchQuery =
          searchQuery === '' ||
          spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          spot.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          spot.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCat && matchQuery;
      });
  }, [activeCampus, activeCategory, searchQuery]);

  // Calculate distance between selected spots
  const calculatedRoute = useMemo(() => {
    const toSpot = activeCampus.hotspots.find((h) => h.id === calcTo);
    if (!toSpot) return null;

    if (calcFrom === 'gate') {
      return {
        fromName: activeCampus.mainGateName,
        toName: toSpot.name,
        walkingMinutes: toSpot.walkingMinutes,
        distanceText: toSpot.distanceFromGate,
        fareText: toSpot.walkingMinutes > 6 ? activeCampus.transitGuide.kekeFare : 'Free (Walkable in few minutes)',
        advice:
          toSpot.walkingMinutes <= 5
            ? 'Short safe walk directly along main lighted university boulevard.'
            : `Available via campus registered keke shuttle (${activeCampus.transitGuide.kekeFare}) or ~${toSpot.walkingMinutes} mins brisk walk.`
      };
    }

    const fromSpot = activeCampus.hotspots.find((h) => h.id === calcFrom);
    if (!fromSpot) return null;

    const diffMinutes = Math.max(2, Math.abs(toSpot.walkingMinutes - fromSpot.walkingMinutes) + 3);
    return {
      fromName: fromSpot.name,
      toName: toSpot.name,
      walkingMinutes: diffMinutes,
      distanceText: `~${diffMinutes * 70}m internal route`,
      fareText: diffMinutes > 7 ? activeCampus.transitGuide.kekeFare : 'Easy walking distance',
      advice: `Connects through ${activeCampus.shortName} central walkways. Keep student ID card visible at checkpoints.`
    };
  }, [activeCampus, calcFrom, calcTo]);

  const handleOpenGoogleMaps = () => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${activeCampus.name}, ${activeCampus.city}, Nigeria`
    )}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenSpotInMaps = (spot: CampusHotspot) => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${spot.name}, ${activeCampus.name}, ${activeCampus.city}, Nigeria`
    )}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyGPSCoords = (spot?: CampusHotspot) => {
    const lat = spot ? (activeCampus.latitude + (spot.coordinates?.y || 0) * 0.0001).toFixed(5) : activeCampus.latitude;
    const lng = spot ? (activeCampus.longitude + (spot.coordinates?.x || 0) * 0.0001).toFixed(5) : activeCampus.longitude;
    navigator.clipboard.writeText(`${lat}, ${lng}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2200);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lodge':
        return <Home className="w-4 h-4 text-orange-500" />;
      case 'faculty':
        return <GraduationCap className="w-4 h-4 text-blue-500" />;
      case 'library':
        return <Building className="w-4 h-4 text-emerald-500" />;
      case 'food':
        return <Coffee className="w-4 h-4 text-amber-500" />;
      case 'transit':
        return <Bus className="w-4 h-4 text-slate-700" />;
      default:
        return <MapPin className="w-4 h-4 text-slate-500" />;
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'lodge':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'faculty':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'library':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'food':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'transit':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#062343] via-[#093566] to-[#062343] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-bold border border-orange-500/30">
              <Compass className="w-3.5 h-3.5 text-orange-400 animate-spin" />
              <span>Cross-Campus GPS Location Navigator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Cross-Campus Location &amp; GPS Search
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Explore Nigerian campus grounds, hostels, lecture halls, and facilities with GPS coordinates, live distance calculations, and real-time Google Maps search.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleOpenGoogleMaps}
              id="btn-open-live-gps"
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-2 border border-white/20 backdrop-blur-xs cursor-pointer shadow-xs"
            >
              <NavigationIcon className="w-4 h-4 text-emerald-400" />
              <span>Live GPS &amp; Google Maps</span>
              <ExternalLink className="w-3 h-3 text-slate-300" />
            </button>

            <button
              onClick={() => handleCopyGPSCoords()}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-2 border border-white/20 backdrop-blur-xs cursor-pointer shadow-xs"
            >
              <MapPin className="w-4 h-4 text-orange-400" />
              <span>{copiedCoords ? 'GPS Copied!' : `GPS: ${activeCampus.latitude}, ${activeCampus.longitude}`}</span>
            </button>
          </div>
        </div>

        {/* Region Filter Pills */}
        <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Regions:
          </span>
          {ALL_CAMPUS_REGIONS.map((region) => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedRegion === region
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
              }`}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      {/* Campus Selector Carousel / Strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider">
            Select Campus ({filteredCampuses.length} Campuses Available)
          </h2>
          <span className="text-xs text-gray-600">
            Active: <strong className="text-slate-900">{activeCampus.name}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {filteredCampuses.map((campus) => {
            const isSelected = campus.id === selectedCampusId;
            return (
              <button
                key={campus.id}
                onClick={() => setSelectedCampusId(campus.id)}
                className={`p-3 rounded-2xl text-left transition cursor-pointer border ${
                  isSelected
                    ? 'bg-orange-50 border-orange-400 text-orange-950 ring-2 ring-orange-400/30 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-orange-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-orange-600">
                    {campus.region}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  )}
                </div>
                <div className="font-extrabold text-xs text-slate-900 truncate">
                  {campus.shortName}
                </div>
                <div className="text-[11px] text-gray-600 truncate">{campus.city}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Campus Overview Card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              {activeCampus.name}
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black">
              Verified Grounds
            </span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed max-w-2xl">
            {activeCampus.description}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-600">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
              <strong>{activeCampus.city}</strong> ({activeCampus.state} State)
            </span>
            <span className="text-gray-300">•</span>
            <span className="flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
              {activeCampus.studentPopulation}
            </span>
            <span className="text-gray-300">•</span>
            <span className="flex items-center gap-1">
              <Bus className="w-3.5 h-3.5 text-slate-500" />
              Gate: {activeCampus.mainGateName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleOpenGoogleMaps}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <NavigationIcon className="w-3.5 h-3.5 text-slate-600" />
            <span>Open in Google Maps</span>
          </button>
          <button
            onClick={() => handleCopyGPSCoords()}
            className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Copy GPS Pins</span>
          </button>
        </div>
      </div>

      {/* Main Map & Interactive Schematic Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Interactive Campus Blueprint & Hotspot Grid */}
        <div className="lg:col-span-7 space-y-4">
          {/* Controls: Search & Category Filter */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search location by name, address, landmarks, GPS coordinates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="text-xs text-gray-600 font-bold shrink-0">
                Showing {filteredHotspots.length} mapped locations
              </div>
            </div>

            {/* Category Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: 'all', label: 'All Locations' },
                { id: 'lodge', label: 'Student Lodges' },
                { id: 'faculty', label: 'Faculties & Halls' },
                { id: 'library', label: 'Libraries & Study' },
                { id: 'food', label: 'Food & Dining' },
                { id: 'transit', label: 'Transit & Gates' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Campus Blueprint Map Representation */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-lg relative overflow-hidden min-h-[380px] flex flex-col justify-between">
            {/* Campus Grid Matrix Background */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, #94a3b8 1px, transparent 0)',
                backgroundSize: '24px 24px'
              }}
            />

            {/* Schematic Header */}
            <div className="relative z-10 flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                  Interactive Campus Radar
                </span>
                <span className="text-xs text-slate-400">|</span>
                <span className="text-xs font-bold text-slate-300">
                  {activeCampus.shortName} Layout
                </span>
              </div>
              <div className="text-[11px] text-slate-400 hidden sm:block">
                Click any pin to inspect verified details
              </div>
            </div>

            {/* Visual Hotspots Map Canvas */}
            <div className="relative z-10 my-4 h-64 sm:h-72 w-full rounded-2xl bg-slate-950/60 border border-slate-800/80 p-4 relative overflow-hidden">
              {/* Campus Gate Anchor */}
              <div className="absolute bottom-3 left-4 p-2 rounded-xl bg-slate-800/90 border border-slate-700 text-[10px] font-bold text-slate-300 flex items-center gap-1.5 shadow-md">
                <Bus className="w-3.5 h-3.5 text-amber-400" />
                <span>{activeCampus.mainGateName}</span>
              </div>

              {/* Central Spine Path (SVG line) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                <line
                  x1="15%"
                  y1="85%"
                  x2="55%"
                  y2="30%"
                  stroke="#f97316"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <line
                  x1="55%"
                  y1="30%"
                  x2="85%"
                  y2="45%"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <circle cx="55%" cy="30%" r="4" fill="#f97316" />
                <circle cx="15%" cy="85%" r="5" fill="#10b981" />
              </svg>

              {/* Pins on the Blueprint */}
              {filteredHotspots.map((spot, index) => {
                const isSelected = selectedHotspot?.id === spot.id;
                const coordX = spot.coordinates?.x || 20 + (index % 4) * 20;
                const coordY = spot.coordinates?.y || 25 + Math.floor(index / 4) * 25;

                return (
                  <button
                    key={spot.id}
                    onClick={() => setSelectedHotspot(spot)}
                    style={{ left: `${coordX}%`, top: `${coordY}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all cursor-pointer z-20 ${
                      isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                    }`}
                    title={spot.name}
                  >
                    <div
                      className={`p-2 rounded-2xl flex items-center gap-1.5 transition shadow-lg ${
                        isSelected
                          ? 'bg-orange-500 text-white ring-4 ring-orange-500/30'
                          : spot.category === 'lodge'
                          ? 'bg-white text-orange-600 border border-orange-200'
                          : spot.category === 'scout'
                          ? 'bg-purple-600 text-white'
                          : spot.category === 'faculty'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {getCategoryIcon(spot.category)}
                      <span className="text-[10px] font-black max-w-[80px] sm:max-w-[110px] truncate hidden sm:inline">
                        {spot.name.split(' ')[0]}
                      </span>
                    </div>

                    {/* Popover on hover/selected */}
                    {isSelected && (
                      <div className="absolute left-1/2 -bottom-8 -translate-x-1/2 px-2 py-0.5 rounded-md bg-white text-slate-900 text-[9px] font-black whitespace-nowrap shadow-md pointer-events-none">
                        {spot.distanceFromGate}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Schematic Footer Legend */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  Lodges
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Academic
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  Scouts Hub
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Library
                </span>
              </div>

              <div className="text-slate-400">
                GPS Lat: <strong className="text-slate-200">{activeCampus.latitude}</strong> • Long:{' '}
                <strong className="text-slate-200">{activeCampus.longitude}</strong>
              </div>
            </div>
          </div>

          {/* Hotspots List Cards */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Campus Hotspot Directory ({filteredHotspots.length})
            </h3>

            <div className="space-y-2">
              {filteredHotspots.map((spot) => {
                const isSelected = selectedHotspot?.id === spot.id;
                return (
                  <div
                    key={spot.id}
                    onClick={() => setSelectedHotspot(spot)}
                    className={`p-4 rounded-2xl transition cursor-pointer border ${
                      isSelected
                        ? 'bg-orange-50/60 border-orange-400 ring-2 ring-orange-400/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-black border uppercase tracking-wider flex items-center gap-1 ${getCategoryBadgeClass(
                              spot.category
                            )}`}
                          >
                            {getCategoryIcon(spot.category)}
                            {spot.category}
                          </span>

                          <h4 className="text-xs font-black text-slate-900">
                            {spot.name}
                          </h4>

                          {spot.verified && (
                            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                              <ShieldCheck className="w-3 h-3 text-emerald-500" />
                              Scout Verified
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-600 line-clamp-2">
                          {spot.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-600 pt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {spot.walkingMinutes} mins walk ({spot.distanceFromGate})
                          </span>
                          {spot.priceRange && (
                            <span className="font-extrabold text-orange-700">
                              {spot.priceRange}
                            </span>
                          )}
                          {spot.waterLightScore && (
                            <span className="flex items-center gap-1 text-blue-700 font-medium">
                              <Zap className="w-3 h-3 text-amber-500" />
                              {spot.waterLightScore.split('•')[0]}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="px-2 py-1 rounded-xl bg-amber-50 text-amber-800 text-[11px] font-black border border-amber-200">
                          ★ {spot.rating}
                        </span>
                        <ChevronRight
                          className={`w-4 h-4 transition ${
                            isSelected ? 'text-orange-500 translate-x-1' : 'text-gray-300'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 5 cols: Hotspot Inspection Drawer & Distance Calculator */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Hotspot Inspector Card */}
          {selectedHotspot ? (
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4 sticky top-20">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span
                  className={`px-2.5 py-1 rounded-xl text-xs font-black border uppercase tracking-wider flex items-center gap-1.5 ${getCategoryBadgeClass(
                    selectedHotspot.category
                  )}`}
                >
                  {getCategoryIcon(selectedHotspot.category)}
                  {selectedHotspot.category.toUpperCase()} DETAILS
                </span>

                <div className="flex items-center gap-1 text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                  <span>★ {selectedHotspot.rating}</span>
                  <span className="text-[10px] text-gray-600 font-normal">(GPS Verified)</span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900 leading-snug">
                  {selectedHotspot.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span>{selectedHotspot.location}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Distance from Main Gate:</span>
                  <strong className="text-slate-900 font-bold">
                    {selectedHotspot.distanceFromGate}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Walking Time:</span>
                  <strong className="text-emerald-700 font-bold">
                    ~{selectedHotspot.walkingMinutes} Minutes on foot
                  </strong>
                </div>
                {selectedHotspot.priceRange && (
                  <div className="flex items-center justify-between border-t border-slate-200 pt-1.5">
                    <span className="text-gray-600">Lodge Rent Guide:</span>
                    <strong className="text-orange-700 font-black">
                      {selectedHotspot.priceRange}
                    </strong>
                  </div>
                )}
              </div>

              {selectedHotspot.waterLightScore && (
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 space-y-1.5 text-xs">
                  <div className="font-extrabold text-blue-900 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-blue-600" />
                    <span>Utilities &amp; Power Infrastructure:</span>
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                    {selectedHotspot.waterLightScore}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Location Guide &amp; Landmarks
                </span>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedHotspot.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handleOpenSpotInMaps(selectedHotspot)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <NavigationIcon className="w-4 h-4" />
                  <span>Navigate to this Location on Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleCopyGPSCoords(selectedHotspot)}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-slate-600" />
                    <span>{copiedCoords ? 'GPS Copied!' : 'Copy GPS Pin'}</span>
                  </button>

                  <a
                    href={`https://wa.me/2349034648644?text=${encodeURIComponent(
                      `Hello UniNest, I am looking for a roommate around "${selectedHotspot.name}" in ${activeCampus.shortName}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-blue-200"
                  >
                    <Home className="w-3.5 h-3.5 text-blue-600" />
                    <span>Find Roommates</span>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
              <Compass className="w-8 h-8 text-orange-400 mx-auto" />
              <div className="font-bold text-slate-900 text-xs">
                Select any location on the map to view verified details
              </div>
            </div>
          )}

          {/* Campus Distance & Walking Route Calculator */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Route className="w-4 h-4 text-orange-500" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Campus Distance &amp; Route Calculator
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Starting Point (From):
                </label>
                <select
                  value={calcFrom}
                  onChange={(e) => setCalcFrom(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="gate">📍 {activeCampus.mainGateName}</option>
                  {activeCampus.hotspots.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Destination (To):
                </label>
                <select
                  value={calcTo}
                  onChange={(e) => setCalcTo(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  {activeCampus.hotspots.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.distanceFromGate})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {calculatedRoute && (
              <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-orange-950 font-bold">Estimated Walk Time:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-600 text-white font-black text-xs">
                    ~{calculatedRoute.walkingMinutes} mins
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-orange-900">
                  <span>Distance:</span>
                  <strong className="font-extrabold">{calculatedRoute.distanceText}</strong>
                </div>

                <div className="flex items-center justify-between text-[11px] text-orange-900">
                  <span>Campus Keke Fare:</span>
                  <strong className="font-extrabold">{calculatedRoute.fareText}</strong>
                </div>

                <p className="text-[11px] text-orange-800 pt-1 border-t border-orange-200/80 italic">
                  💡 {calculatedRoute.advice}
                </p>
              </div>
            )}
          </div>

          {/* Campus Transit & Safety Guide */}
          <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs text-slate-700">
            <div className="flex items-center gap-2 font-black text-slate-900 uppercase tracking-wider text-[11px]">
              <Bus className="w-3.5 h-3.5 text-blue-600" />
              <span>{activeCampus.shortName} Transit &amp; Safety Intel</span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <p>
                <strong>City Transit:</strong> {activeCampus.transitGuide.fromMainCity}
              </p>
              <p>
                <strong>Internal Keke:</strong> {activeCampus.transitGuide.kekeFare}
              </p>
              <p>
                <strong>Safe Movement Hours:</strong> {activeCampus.transitGuide.safeHours}
              </p>
              <p className="text-gray-600 italic">
                <strong>Scout Tip:</strong> {activeCampus.transitGuide.tips}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
