import React from 'react';
import { Plus, Phone, Mail, MapPin, ShieldCheck, HeartPulse } from 'lucide-react';

interface FooterProps {
  onNavClick: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick }) => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand & Introduction */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center font-black shadow-md">
                RH
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white block">
                  RH Care Hospital
                </span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Quaternary Medical Network
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              Committed to world-class clinical excellence, advanced robotic surgery, and rapid emergency intervention. Automatically routing patients to the nearest hospital campus with certified specialist matching.
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                24/7 Red-Alert Trauma
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                JCI & NABH Accredited
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
              <li>
                <button onClick={() => onNavClick('home')} className="hover:text-white transition-colors cursor-pointer">
                  Hospital Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('hospitals')} className="hover:text-white text-rose-400 transition-colors cursor-pointer">
                  Hospitals & Google Maps
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('register')} className="hover:text-white transition-colors cursor-pointer">
                  Book Appointment
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('appointments')} className="hover:text-white transition-colors cursor-pointer">
                  Track Appointment
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('admin-login')} className="hover:text-white transition-colors cursor-pointer">
                  Administrator Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Clinical Specialties */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Quaternary Institutes
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>Cardiology & Cath Lab Sciences</li>
              <li>Robotic Joint Replacement & Spine</li>
              <li>Comprehensive Stroke & Neurosciences</li>
              <li>Fetal Medicine & Level III NICU</li>
              <li>Minimal Access Robotic Surgery</li>
            </ul>
          </div>

          {/* Hospital Contact Info */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Emergency & Support
            </h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-slate-200">+91 (080) 4968-1999</span>
                  <span className="text-[11px] text-rose-400 font-bold">24/7 Central Emergency Line</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">emergency@rhcarehospital.org</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Indiranagar • Whitefield • Hebbal • Jayanagar • Rajajinagar</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            &copy; 2026 RH Care Hospital Management System. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Quaternary Medical Network</span>
            <span>Google Maps Platform Grounded</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
