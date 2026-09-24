import React from 'react';
import { Plus, MapPin, CalendarCheck, UserPlus, Home, Shield } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isAdminLoggedIn: boolean;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  isAdminLoggedIn,
  onLogout
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Brand Wordmark */}
          <button 
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-lg group cursor-pointer"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-500/25 group-hover:scale-105 transition-transform">
              <span className="font-black text-sm tracking-tighter">RH</span>
              <Plus className="w-3.5 h-3.5 stroke-[3.5] absolute -top-1 -right-1 text-emerald-300 drop-shadow-xs" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-sky-700 transition-colors">
                  RH Care Hospital
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 uppercase tracking-wider">
                  Network
                </span>
              </div>
              <span className="block text-[11px] font-semibold text-slate-500 tracking-wide uppercase">
                Excellence in Quaternary Healthcare
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => setCurrentTab('home')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'home'
                  ? 'bg-sky-50 text-sky-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setCurrentTab('hospitals')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'hospitals'
                  ? 'bg-sky-50 text-sky-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>Hospitals & Location</span>
            </button>

            <button
              onClick={() => setCurrentTab('register')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'register'
                  ? 'bg-sky-50 text-sky-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>

            <button
              onClick={() => setCurrentTab('appointments')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'appointments'
                  ? 'bg-sky-50 text-sky-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>My Appointments</span>
            </button>

            <button
              onClick={() => setCurrentTab(isAdminLoggedIn ? 'admin-dashboard' : 'admin-login')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentTab.startsWith('admin')
                  ? 'bg-sky-50 text-sky-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>Admin</span>
            </button>
          </nav>

          {/* Primary Action */}
          <div className="flex items-center gap-2.5">
            {isAdminLoggedIn ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block text-xs font-semibold text-slate-500">
                  Admin Signed In
                </span>
                <button
                  onClick={onLogout}
                  className="px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200 cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentTab('register')}
                className="px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 active:scale-[0.98] rounded-xl shadow-md shadow-sky-600/20 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Book Appointment</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
