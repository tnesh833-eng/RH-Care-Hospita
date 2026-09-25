import React, { useState } from 'react';
import { Hospital, Doctor } from '../types.ts';
import {
  MapPin,
  Navigation,
  Phone,
  Star,
  Shield,
  Building2,
  Bed,
  HeartPulse,
  ChevronRight,
  ExternalLink,
  LocateFixed,
  Search,
  CheckCircle2,
  Stethoscope,
  Clock,
  ArrowUpRight,
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface HospitalNetworkMapProps {
  hospitals: Hospital[];
  userLocation: { lat: number; lng: number } | null;
  onDetectLocation: () => void;
  isDetectingLocation: boolean;
  onSelectHospitalForBooking: (hospital: Hospital) => void;
  onOpenHospitalDetails: (hospital: Hospital) => void;
}

const LOCALITY_PRESETS = [
  { label: 'All Campuses', query: '' },
  { label: 'Indiranagar (Central)', query: 'indiranagar' },
  { label: 'Whitefield (East)', query: 'whitefield' },
  { label: 'Hebbal (North)', query: 'hebbal' },
  { label: 'Jayanagar (South)', query: 'jayanagar' },
  { label: 'Rajajinagar (West)', query: 'rajajinagar' },
  { label: 'Electronic City (Tech Corridor)', query: 'electronic city' }
];

export const HospitalNetworkMap: React.FC<HospitalNetworkMapProps> = ({
  hospitals,
  userLocation,
  onDetectLocation,
  isDetectingLocation,
  onSelectHospitalForBooking,
  onOpenHospitalDetails
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLocalityPreset, setActiveLocalityPreset] = useState('');
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | null>(null);

  const filteredHospitals = hospitals.filter((h) => {
    const activeQuery = (activeLocalityPreset || searchQuery).toLowerCase().trim();
    if (!activeQuery) return true;
    return (
      h.name.toLowerCase().includes(activeQuery) ||
      h.address.toLowerCase().includes(activeQuery) ||
      h.city.toLowerCase().includes(activeQuery) ||
      h.tagline.toLowerCase().includes(activeQuery) ||
      h.departments.some((d) => d.toLowerCase().includes(activeQuery))
    );
  });

  return (
    <section id="hospitals-section" className="bg-slate-50 py-12 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider mb-2">
              <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
              <span>RH Care Hospital Network & Locality Radar</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              RH Care Hospital Campuses & Verified Medical Centers
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-slate-600 max-w-2xl">
              Locate quaternary RH Care hospitals across Bangalore. Detect your locality to automatically scan proximity, review real patient feedback, inspect doctor specifications, and open verified Google Maps locations.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onDetectLocation}
              disabled={isDetectingLocation}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-sky-600/20"
            >
              <LocateFixed className={`w-4 h-4 ${isDetectingLocation ? 'animate-spin' : ''}`} />
              <span>{isDetectingLocation ? 'Scanning Locality...' : 'Scan My GPS Locality'}</span>
            </button>
          </div>
        </div>

        {/* Locality Quick-Filter Chips */}
        <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            Quick Locality:
          </span>
          {LOCALITY_PRESETS.map((preset) => {
            const isActive = activeLocalityPreset === preset.query;
            return (
              <button
                key={preset.label}
                onClick={() => {
                  setActiveLocalityPreset(preset.query);
                  if (preset.query) setSearchQuery('');
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="mb-8 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveLocalityPreset('');
              }}
              placeholder="Search by campus name, locality (e.g. Indiranagar, Whitefield, Hebbal, Electronic City), or specialty..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm font-medium focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all text-slate-900 bg-white shadow-xs"
            />
          </div>
          {userLocation && (
            <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Proximity Sorted (GPS Active)</span>
            </div>
          )}
        </div>

        {/* Hospital Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHospitals.map((hospital) => {
            const googleSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${hospital.name}, ${hospital.address}`
            )}`;
            const googleDirectionUrl = `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`;
            const isSelected = selectedHospitalId === hospital.id;

            return (
              <div
                key={hospital.id}
                onClick={() => setSelectedHospitalId(hospital.id)}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer ${
                  isSelected
                    ? 'border-sky-500 ring-2 ring-sky-200'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Hospital Photo & Campus Status */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={hospital.image_url}
                    alt={hospital.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>

                  {/* Trauma & Distance Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-rose-600/90 backdrop-blur-xs text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
                      {hospital.trauma_level.split(' ')[0]} {hospital.trauma_level.split(' ')[1]}
                    </span>

                    {hospital.distance_km !== undefined ? (
                      <span className="px-2.5 py-1 rounded-md bg-emerald-600/90 backdrop-blur-xs text-white text-[11px] font-bold flex items-center gap-1 shadow-sm">
                        <MapPin className="w-3 h-3" />
                        <span>{hospital.distance_km} km away</span>
                        {hospital.travel_time_mins ? `(~${hospital.travel_time_mins}m)` : ''}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-slate-200 text-[10px] font-semibold">
                        24/7 Red-Alert
                      </span>
                    )}
                  </div>

                  {/* Rating Pill on Bottom Right */}
                  <div className="absolute bottom-3 right-3">
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900/90 backdrop-blur-xs border border-amber-400/30 text-amber-300 text-xs font-bold shadow-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{hospital.rating}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({hospital.review_count || 1200}+)
                      </span>
                    </div>
                  </div>

                  {/* Operating Hours on Bottom Left */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] font-medium text-slate-200">
                    <Clock className="w-3 h-3 text-sky-400" />
                    <span>24/7 Emergency & OPD</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 leading-snug hover:text-sky-600 transition-colors">
                      {hospital.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {hospital.tagline}
                    </p>

                    {/* Address with Google Location Link */}
                    <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-2">
                      <div className="flex items-start gap-1.5 text-xs text-slate-600 flex-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{hospital.address}</span>
                      </div>

                      {/* Attached Google Location External Link */}
                      <a
                        href={googleSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title="Open in Google Maps"
                        className="px-2 py-1 bg-white hover:bg-sky-50 text-sky-700 border border-slate-200 rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors shadow-2xs"
                      >
                        <Navigation className="w-3 h-3 text-sky-600" />
                        <span>Google Map</span>
                        <ArrowUpRight className="w-2.5 h-2.5 text-slate-400" />
                      </a>
                    </div>

                    {/* Accreditations & Key Specs */}
                    <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-sky-50/60 border border-sky-100 flex items-center gap-2">
                        <Bed className="w-4 h-4 text-sky-600 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-900">{hospital.beds_count} Beds</div>
                          <div className="text-[10px] text-slate-500">{hospital.icu_beds} ICU Beds</div>
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-teal-50/60 border border-teal-100 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-teal-600 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-900">JCI & NABH</div>
                          <div className="text-[10px] text-slate-500">Gold Certified</div>
                        </div>
                      </div>
                    </div>

                    {/* Emergency Telephone */}
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-600 pt-3 border-t border-slate-100">
                      <span className="text-[11px] text-slate-500 font-medium">Emergency:</span>
                      <a
                        href={`tel:${hospital.emergency_hotline.replace(/\s+/g, '')}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{hospital.emergency_hotline}</span>
                      </a>
                    </div>

                    {/* Department Badges */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {hospital.departments.slice(0, 3).map((dept) => (
                        <span
                          key={dept}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                        >
                          {dept}
                        </span>
                      ))}
                      {hospital.departments.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-semibold">
                          +{hospital.departments.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                    {/* Inspect Details & Feedback Modal */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenHospitalDetails(hospital);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
                      <span>Doctor Specs & Patient Feedback</span>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </button>

                    {/* Direct Booking on this Hospital */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectHospitalForBooking(hospital);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-[0.98] text-white text-xs font-black tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-sky-600/20"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      <span>Direct Book at This Campus</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredHospitals.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No hospital campuses match your search</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try searching for a locality like "Indiranagar", "Whitefield", "Hebbal", or click "All Campuses".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveLocalityPreset('');
              }}
              className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-800"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
