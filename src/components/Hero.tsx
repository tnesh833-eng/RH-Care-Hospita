import React from 'react';
import { Calendar, PhoneCall, ShieldCheck, MapPin, ChevronRight, Activity, Award } from 'lucide-react';

interface HeroProps {
  onBookClick: () => void;
  onExploreHospitals: () => void;
  onExploreSpecialties: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onBookClick, onExploreHospitals, onExploreSpecialties }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white py-16 md:py-20 border-b border-slate-800">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/25 text-sky-300 text-xs font-semibold tracking-wide backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              JCI & NABH Accredited Quaternary Medical Network
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
              RH Care Hospital — Advanced Care With <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400">Intelligent GPS Routing</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Experience modern healthcare across our multi-campus hospital network. When you register, our location engine automatically scans and connects you with the nearest RH Care Hospital branch, matching verified senior specialists, live bed capacities, and instant appointment booking.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onBookClick}
                className="px-6 py-3.5 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 active:scale-[0.98] text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-sky-500/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                <span>Book Appointment & Scan Nearby</span>
                <ChevronRight className="w-4 h-4 text-slate-950" />
              </button>

              <button
                onClick={onExploreHospitals}
                className="px-5 py-3.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-semibold text-sm rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer backdrop-blur-md"
              >
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>Explore Hospital Locations</span>
              </button>

              <button
                onClick={onExploreSpecialties}
                className="px-4 py-3.5 text-slate-400 hover:text-white font-medium text-xs sm:text-sm transition-colors cursor-pointer"
              >
                View Specialists
              </button>
            </div>

            {/* Proof Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80">
              <div>
                <div className="text-2xl font-black text-white tabular-nums flex items-baseline gap-1">
                  5 <span className="text-xs font-medium text-sky-400">Campuses</span>
                </div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">Quaternary Centers</div>
              </div>
              <div>
                <div className="text-2xl font-black text-white tabular-nums flex items-baseline gap-1">
                  650+ <span className="text-xs font-medium text-teal-400">Beds</span>
                </div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">Level 1 ICU & Trauma</div>
              </div>
              <div>
                <div className="text-2xl font-black text-white tabular-nums flex items-baseline gap-1">
                  4.9 <span className="text-xs font-medium text-amber-400">★</span>
                </div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">8,000+ Verified Patient Reviews</div>
              </div>
              <div>
                <div className="text-2xl font-black text-white tabular-nums flex items-baseline gap-1">
                  24/7 <span className="text-xs font-medium text-rose-400">Emergency</span>
                </div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">Rapid Cath & Stroke Care</div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl shadow-sky-950/50 bg-slate-800">
              <img
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80"
                alt="RH Care Hospital High-Tech Medical Center"
                className="w-full h-84 sm:h-96 object-cover object-center transform hover:scale-[1.02] transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none"></div>
              
              {/* Floating Emergency Badge */}
              <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-bold text-white tracking-wide">Emergency Trauma: Active</span>
              </div>

              {/* Overlay card */}
              <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 backdrop-blur-md p-4 rounded-xl border border-slate-700/80 shadow-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-500 text-white flex items-center justify-center shadow-sm">
                    <PhoneCall className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">RH Care Central Emergency Hotline</div>
                    <div className="text-sm font-bold text-white tracking-wide">+91 (080) 4968-1999</div>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                  Always Open
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
