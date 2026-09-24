import React, { useState, useMemo } from 'react';
import { Appointment } from '../types.ts';
import { Search, Filter, Calendar, Stethoscope, Building2, User, RefreshCw, PlusCircle, CheckCircle, Clock, XCircle, Navigation, MapPin } from 'lucide-react';

interface AppointmentDirectoryProps {
  appointments: Appointment[];
  isLoading: boolean;
  onRefresh: () => void;
  onNewBookingClick: () => void;
}

export const AppointmentDirectory: React.FC<AppointmentDirectoryProps> = ({
  appointments,
  isLoading,
  onRefresh,
  onNewBookingClick
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        apt.id.toString().includes(q) ||
        (apt.token_number || '').toLowerCase().includes(q) ||
        (apt.patient_name || '').toLowerCase().includes(q) ||
        (apt.doctor_name || '').toLowerCase().includes(q) ||
        (apt.hospital_name || '').toLowerCase().includes(q) ||
        (apt.department_name || '').toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'ALL' ||
        apt.status.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchTerm, statusFilter]);

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Approved
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Cancelled
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Completed
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="py-12 bg-slate-50 min-h-[calc(100vh-80px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 mb-1 block">
              Patient Tracking & Directory
            </span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              RH Care Hospital Appointments
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Review scheduled patient appointments, attending doctor specifications, and assigned hospital campuses.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-300 shadow-xs transition-colors cursor-pointer"
              title="Refresh Appointments"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-600' : ''}`} />
            </button>

            <button
              onClick={onNewBookingClick}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm shadow-sky-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Book New Appointment</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by patient name, token #, doctor, hospital campus, or specialty..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 cursor-pointer"
            >
              <option value="ALL">All Statuses ({appointments.length})</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Table of Appointments */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-4">Token & ID</th>
                  <th scope="col" className="px-6 py-4">Patient</th>
                  <th scope="col" className="px-6 py-4">Hospital Campus</th>
                  <th scope="col" className="px-6 py-4">Attending Doctor</th>
                  <th scope="col" className="px-6 py-4">Date & Slot</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-sky-600 mb-2" />
                      Loading appointments from RH Care database...
                    </td>
                  </tr>
                ) : filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <div className="max-w-sm mx-auto">
                        <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <h4 className="font-semibold text-slate-800">No appointments found</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          No scheduled appointments match your filter criteria.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-sky-700 text-xs block">
                          {apt.token_number || `#${apt.id}`}
                        </span>
                        <span className="text-[10px] text-slate-400">ID #{apt.id}</span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{apt.patient_name || 'Patient'}</div>
                        <div className="text-xs text-slate-500">
                          {apt.patient_phone || apt.patient_address || 'Registered Patient'}
                        </div>
                      </td>

                      <td className="px-6 py-4 max-w-xs">
                        <div className="font-bold text-slate-900 truncate">
                          {apt.hospital_name || 'RH Care Central Campus'}
                        </div>
                        <div className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                          <span className="truncate">{apt.hospital_address || 'Main Campus'}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{apt.doctor_name || 'Assigned Specialist'}</div>
                        <div className="text-xs text-sky-700 font-medium">{apt.department_name} ({apt.specialization})</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 tabular-nums">📅 {apt.appointment_date}</div>
                        <div className="text-xs text-slate-500">{apt.appointment_time || 'Morning Slot'}</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(apt.status)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Showing <strong className="text-slate-800 tabular-nums">{filteredAppointments.length}</strong> registered appointments</span>
            <span>RH Care Enterprise Clinical Scheduling</span>
          </div>
        </div>

      </div>
    </div>
  );
};
