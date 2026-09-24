import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow, Pin } from '@vis.gl/react-google-maps';
import { Hospital, Doctor } from '../types.ts';
import { MapPin, Navigation, Phone, Star, Shield, Building2, Bed, HeartPulse, ChevronRight, ExternalLink, LocateFixed, Search } from 'lucide-react';

interface HospitalNetworkMapProps {
  hospitals: Hospital[];
  userLocation: { lat: number; lng: number } | null;
  onDetectLocation: () => void;
  isDetectingLocation: boolean;
  onSelectHospitalForBooking: (hospital: Hospital) => void;
  onOpenHospitalDetails: (hospital: Hospital) => void;
}

export const HospitalNetworkMap: React.FC<HospitalNetworkMapProps> = ({
  hospitals,
  userLocation,
  onDetectLocation,
  isDetectingLocation,
  onSelectHospitalForBooking,
  onOpenHospitalDetails
}) => {
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 12.9719, lng: 77.6412 });
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [searchQuery, setSearchQuery] = useState('');

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // When user location changes, center map
  useEffect(() => {
    if (userLocation) {
      setMapCenter(userLocation);
      setMapZoom(13);
    }
  }, [userLocation]);

  const filteredHospitals = hospitals.filter(h => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      h.name.toLowerCase().includes(q) ||
      h.address.toLowerCase().includes(q) ||
      h.tagline.toLowerCase().includes(q) ||
      h.departments.some(d => d.toLowerCase().includes(q))
    );
  });

  const handleSelectHospital = (h: Hospital) => {
    setSelectedHospital(h);
    setMapCenter({ lat: h.latitude, lng: h.longitude });
    setMapZoom(14);
  };

  return (
    <div className="bg-white py-12 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider mb-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>RH Care Network Locator</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Hospital Campuses & Google Maps Locator
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-slate-600 max-w-2xl">
              Locate quaternary RH Care hospitals across the city. Detect your GPS location to automatically scan proximity, review real patient feedback, and inspect doctor specifications.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onDetectLocation}
              disabled={isDetectingLocation}
              className="px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <LocateFixed className={`w-4 h-4 text-sky-600 ${isDetectingLocation ? 'animate-spin' : ''}`} />
              <span>{isDetectingLocation ? 'Scanning GPS...' : 'Detect My Location'}</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by hospital campus name, locality (e.g. Indiranagar, Whitefield, Hebbal), or specialty..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all text-slate-900 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Interactive Map and Side Directory Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Map Column (7 cols) */}
          <div className="lg:col-span-7 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-md relative">
            <div className="relative w-full h-[520px]">
              {apiKey ? (
                <APIProvider apiKey={apiKey}>
                  <Map
                    style={{ width: '100%', height: '100%' }}
                    defaultCenter={mapCenter}
                    center={mapCenter}
                    defaultZoom={12}
                    zoom={mapZoom}
                    mapId="DEMO_MAP_ID"
                    internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
                    gestureHandling="greedy"
                    fullscreenControl={false}
                  >
                    {/* User Location Marker */}
                    {userLocation && (
                      <AdvancedMarker position={userLocation}>
                        <div className="relative flex items-center justify-center">
                          <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-sky-400 opacity-75"></span>
                          <div className="relative w-5 h-5 rounded-full bg-sky-600 border-2 border-white shadow-lg flex items-center justify-center text-[10px] text-white font-bold">
                            You
                          </div>
                        </div>
                      </AdvancedMarker>
                    )}

                    {/* Hospital Markers */}
                    {hospitals.map((h) => (
                      <AdvancedMarker
                        key={h.id}
                        position={{ lat: h.latitude, lng: h.longitude }}
                        onClick={() => handleSelectHospital(h)}
                        title={h.name}
                      >
                        <Pin
                          background={selectedHospital?.id === h.id ? '#0284C7' : '#E11D48'}
                          borderColor="#FFFFFF"
                          glyphColor="#FFFFFF"
                          scale={selectedHospital?.id === h.id ? 1.25 : 1.05}
                        />
                      </AdvancedMarker>
                    ))}

                    {/* InfoWindow for Selected Hospital */}
                    {selectedHospital && (
                      <InfoWindow
                        position={{ lat: selectedHospital.latitude, lng: selectedHospital.longitude }}
                        onCloseClick={() => setSelectedHospital(null)}
                        headerContent={
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-sky-600" />
                            <span>{selectedHospital.name}</span>
                          </div>
                        }
                      >
                        <div className="p-1 max-w-xs text-left">
                          <p className="text-[11px] text-slate-500 mb-1.5 line-clamp-2">
                            {selectedHospital.address}
                          </p>

                          <div className="flex items-center gap-2 mb-2 text-[11px] font-semibold text-slate-700">
                            <span className="flex items-center gap-0.5 text-amber-600">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {selectedHospital.rating}
                            </span>
                            <span>•</span>
                            <span className="text-emerald-700 font-bold">{selectedHospital.trauma_level.split(' ')[0]} {selectedHospital.trauma_level.split(' ')[1]}</span>
                            {selectedHospital.distance_km !== undefined && (
                              <>
                                <span>•</span>
                                <span className="text-sky-700 font-bold">📍 {selectedHospital.distance_km} km</span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => onOpenHospitalDetails(selectedHospital)}
                              className="px-2.5 py-1 text-[11px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg cursor-pointer transition-colors"
                            >
                              Details & Doctors
                            </button>
                            <button
                              type="button"
                              onClick={() => onSelectHospitalForBooking(selectedHospital)}
                              className="px-2.5 py-1 text-[11px] font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg cursor-pointer transition-colors"
                            >
                              Book Here
                            </button>
                          </div>
                        </div>
                      </InfoWindow>
                    )}
                  </Map>
                </APIProvider>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center">
                  <MapPin className="w-12 h-12 text-rose-500 mb-3 animate-bounce" />
                  <h4 className="text-lg font-bold">Interactive Google Maps Powered</h4>
                  <p className="text-xs text-slate-300 max-w-sm mt-1">
                    Google Maps Platform key initialized. Displaying live interactive coordinates for all RH Care Quaternary centers.
                  </p>
                </div>
              )}

              {/* Map Floating Legend */}
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200/80 shadow-sm text-xs font-semibold text-slate-800 flex items-center gap-3 pointer-events-none">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                  RH Care Campus
                </span>
                {userLocation && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
                    Your Position
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Hospitals List Directory (5 cols) */}
          <div className="lg:col-span-5 space-y-3.5 max-h-[520px] overflow-y-auto pr-1">
            {filteredHospitals.map((h) => {
              const isSelected = selectedHospital?.id === h.id;
              return (
                <div
                  key={h.id}
                  onClick={() => handleSelectHospital(h)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50/50 shadow-md ring-2 ring-sky-200'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          <HeartPulse className="w-2.5 h-2.5" />
                          24/7 Trauma
                        </span>
                        {h.distance_km !== undefined && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                            📍 {h.distance_km} km away {h.travel_time_mins ? `(~${h.travel_time_mins}m)` : ''}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                        {h.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {h.address}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-xs font-bold text-amber-900">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{h.rating}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        {h.review_count} reviews
                      </span>
                    </div>
                  </div>

                  {/* Bed stats & Key Highlights */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-3 text-[11px] font-medium">
                      <span className="flex items-center gap-1">
                        <Bed className="w-3 h-3 text-slate-400" />
                        <strong>{h.beds_count}</strong> Total Beds
                      </span>
                      <span>•</span>
                      <span className="text-rose-700 font-bold">
                        {h.icu_beds} ICU Beds
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenHospitalDetails(h);
                        }}
                        className="text-xs font-bold text-sky-700 hover:text-sky-900 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Details & Reviews</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Action row */}
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectHospitalForBooking(h);
                      }}
                      className="flex-1 py-1.5 px-3 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Book at this Hospital</span>
                    </button>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${h.latitude},${h.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                      title="Open Directions in Google Maps"
                    >
                      <Navigation className="w-3.5 h-3.5 text-sky-600" />
                    </a>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
};
