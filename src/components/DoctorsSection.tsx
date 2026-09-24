import React, { useState } from 'react';
import { Doctor } from '../types.ts';
import { Stethoscope, Calendar, Star, Building2, Clock, Award, ChevronRight } from 'lucide-react';

interface DoctorsSectionProps {
  doctors: Doctor[];
  onSelectDoctor: (doctor: Doctor) => void;
}

export const DoctorsSection: React.FC<DoctorsSectionProps> = ({ doctors, onSelectDoctor }) => {
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('All');

  // Extract unique departments
  const uniqueDepts = ['All', ...Array.from(new Set(doctors.map(d => d.department_name || 'General Medicine')))];

  const filteredDoctors = doctors.filter(doc => {
    if (selectedDeptFilter === 'All') return true;
    return (doc.department_name || '').toLowerCase() === selectedDeptFilter.toLowerCase();
  });

  return (
    <section id="doctors-section" className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 mb-1.5 block">
              Specialist Faculty & Doctors
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Distinguished Medical Specialists
            </h2>
            <p className="mt-1.5 text-slate-600 text-sm max-w-xl">
              Board-certified senior consultants, surgeons, and department directors across the RH Care Quaternary network.
            </p>
          </div>

          {/* Department Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-xl">
            {uniqueDepts.slice(0, 6).map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDeptFilter(dept)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedDeptFilter === dept
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => {
            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-sky-300 transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Top image & badges */}
                  <div className="h-52 bg-slate-900 overflow-hidden relative">
                    <img
                      src={doc.image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80'}
                      alt={doc.doctor_name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none"></div>

                    {/* Department Badge */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase text-sky-700 shadow-xs">
                      {doc.department_name || 'Specialist'}
                    </div>

                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-amber-300 flex items-center gap-1 border border-white/20">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{doc.rating}</span>
                    </div>

                    {/* Hospital affiliation overlay */}
                    <div className="absolute bottom-2.5 left-3 right-3 text-white text-[11px] font-bold flex items-center gap-1.5 truncate">
                      <Building2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="truncate">{doc.hospital_name}</span>
                    </div>
                  </div>

                  {/* Body Information */}
                  <div className="p-5">
                    <h3 className="text-base font-black text-slate-900 group-hover:text-sky-700 transition-colors">
                      {doc.doctor_name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                      {doc.degrees}
                    </p>

                    <div className="mt-2 text-xs font-bold text-slate-800">
                      {doc.specialization}
                    </div>

                    {/* Sub-specialties chips */}
                    {doc.sub_specialties && doc.sub_specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {doc.sub_specialties.slice(0, 2).map((sub, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-medium">
                            {sub}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Consultation details */}
                    <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Experience</span>
                        <span className="font-bold text-slate-800">{doc.experience_years} Years</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Consultation Fee</span>
                        <span className="font-bold text-slate-800">₹{doc.consultation_fee}</span>
                      </div>
                      <div className="col-span-2 text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{doc.opd_timings}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="p-5 pt-0">
                  <button
                    onClick={() => onSelectDoctor(doc)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs shadow-sky-600/20"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Consultation with Specialist</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
