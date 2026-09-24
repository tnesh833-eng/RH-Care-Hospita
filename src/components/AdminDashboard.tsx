import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Doctor, Patient, Appointment, AdminStats, Department, Hospital } from '../types.ts';
import { 
  Users, Stethoscope, Calendar, Clock, Plus, Trash2, 
  CheckCircle, XCircle, AlertCircle, RefreshCw, X, Save, Shield, Building2, MapPin, Star
} from 'lucide-react';

interface AdminDashboardProps {
  adminUser: { id: number; username: string };
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminUser, onLogout }) => {
  const [stats, setStats] = useState<AdminStats>({
    totalPatients: 0,
    totalDoctors: 0,
    totalHospitals: 5,
    totalAppointments: 0,
    pendingAppointments: 0
  });

  const [activeTab, setActiveTab] = useState<'appointments' | 'doctors' | 'hospitals' | 'patients'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Doctor Registration Modal state
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [docName, setDocName] = useState('');
  const [docDegrees, setDocDegrees] = useState('');
  const [docDeptId, setDocDeptId] = useState<number>(1);
  const [docHospId, setDocHospId] = useState<number>(1);
  const [docSpec, setDocSpec] = useState('');
  const [docFee, setDocFee] = useState<number>(850);
  const [docExp, setDocExp] = useState<number>(12);
  const [docTimings, setDocTimings] = useState('09:00 AM - 01:00 PM');
  const [docRoom, setDocRoom] = useState('Suite 201');
  const [isSavingDoctor, setIsSavingDoctor] = useState(false);

  // Load dashboard data
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsData, deptsData, apptsData, docsData, ptsData, hospsData] = await Promise.all([
        api.getAdminStats(),
        api.getDepartments(),
        api.getAppointments(),
        api.getDoctors(),
        api.getPatients(),
        api.getHospitals()
      ]);

      setStats(statsData);
      setDepartments(deptsData);
      setAppointments(apptsData);
      setDoctors(docsData);
      setPatients(ptsData);
      setHospitals(hospsData);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error loading dashboard data.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const triggerFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  // Appointment Status Actions
  const handleUpdateAppointmentStatus = async (id: number, status: 'Approved' | 'Cancelled' | 'Completed') => {
    try {
      await api.updateAppointmentStatus(id, status);
      triggerFeedback(`Appointment #${id} marked as ${status}.`);
      await loadDashboardData();
    } catch (err: any) {
      triggerFeedback(err.message || 'Failed to update appointment status.', 'error');
    }
  };

  // Doctor Creation
  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim() || !docSpec.trim()) return;

    setIsSavingDoctor(true);
    try {
      const dept = departments.find(d => d.id === Number(docDeptId));
      const hosp = hospitals.find(h => h.id === Number(docHospId));

      await api.createDoctor({
        doctor_name: docName.trim(),
        degrees: docDegrees.trim() || 'MBBS, MD',
        department_id: Number(docDeptId),
        department_name: dept?.department_name || 'General Medicine',
        hospital_id: Number(docHospId),
        hospital_name: hosp?.name || 'RH Care Central Campus',
        specialization: docSpec.trim(),
        experience_years: Number(docExp),
        opd_timings: docTimings,
        room_number: docRoom,
        consultation_fee: Number(docFee),
        languages: ['English', 'Hindi'],
        rating: 4.9,
        total_patients: 1000,
        bio: 'Senior medical practitioner committed to clinical excellence.'
      });

      triggerFeedback(`Dr. ${docName.trim()} added to hospital roster.`);
      setIsDoctorModalOpen(false);
      setDocName('');
      setDocDegrees('');
      setDocSpec('');
      await loadDashboardData();
    } catch (err: any) {
      triggerFeedback(err.message || 'Failed to save doctor.', 'error');
    } finally {
      setIsSavingDoctor(false);
    }
  };

  return (
    <div className="py-10 bg-slate-50 min-h-[calc(100vh-80px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-md">
              <Shield className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  RH Care Administrative Operations
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Live Operations
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Logged in as <strong className="text-slate-800 font-bold">{adminUser.username}</strong> &bull; Quaternary Multi-Campus Control
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadDashboardData}
              disabled={isLoading}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-600' : ''}`} />
            </button>

            <button
              onClick={onLogout}
              className="px-4 py-2.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`mb-6 p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}>
            {feedback.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-bold uppercase text-slate-400">Total Patients</div>
            <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums">{stats.totalPatients}</div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">Registered Files</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-bold uppercase text-slate-400">Active Doctors</div>
            <div className="text-2xl font-black text-sky-600 mt-1 tabular-nums">{stats.totalDoctors}</div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">Senior Specialists</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-bold uppercase text-slate-400">Hospital Campuses</div>
            <div className="text-2xl font-black text-teal-600 mt-1 tabular-nums">{hospitals.length || 5}</div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">Quaternary Centers</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-bold uppercase text-slate-400">Total Bookings</div>
            <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums">{stats.totalAppointments}</div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">All Consultations</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
            <div className="text-xs font-bold uppercase text-amber-700">Pending Approvals</div>
            <div className="text-2xl font-black text-amber-600 mt-1 tabular-nums">{stats.pendingAppointments}</div>
            <div className="text-[11px] text-amber-700 mt-1 font-medium">Requires Review</div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'appointments' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Manage Appointments ({appointments.length})
          </button>

          <button
            onClick={() => setActiveTab('doctors')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'doctors' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Doctor Roster ({doctors.length})
          </button>

          <button
            onClick={() => setActiveTab('hospitals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'hospitals' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Hospital Campuses ({hospitals.length})
          </button>

          <button
            onClick={() => setActiveTab('patients')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'patients' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Patient Registry ({patients.length})
          </button>
        </div>

        {/* TAB 1: APPOINTMENTS */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-4">Token / ID</th>
                    <th className="px-5 py-4">Patient Details</th>
                    <th className="px-5 py-4">Hospital Branch</th>
                    <th className="px-5 py-4">Specialist Doctor</th>
                    <th className="px-5 py-4">Scheduled Date</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-sky-700 block">{apt.token_number || `#${apt.id}`}</span>
                        <span className="text-[10px] text-slate-400">ID #{apt.id}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900">{apt.patient_name}</div>
                        <div className="text-[11px] text-slate-500">{apt.patient_phone || apt.patient_address}</div>
                      </td>
                      <td className="px-5 py-3.5 max-w-xs">
                        <div className="font-bold text-slate-900 truncate">{apt.hospital_name}</div>
                        <div className="text-[11px] text-slate-400 truncate">{apt.hospital_address}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900">{apt.doctor_name}</div>
                        <div className="text-[11px] text-slate-500">{apt.department_name}</div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap tabular-nums">
                        {apt.appointment_date}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          apt.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                          apt.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                          apt.status === 'Completed' ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {apt.status !== 'Approved' && (
                            <button
                              onClick={() => handleUpdateAppointmentStatus(apt.id, 'Approved')}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                              title="Approve Appointment"
                            >
                              Approve
                            </button>
                          )}
                          {apt.status !== 'Completed' && (
                            <button
                              onClick={() => handleUpdateAppointmentStatus(apt.id, 'Completed')}
                              className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold rounded-lg border border-sky-200 transition-colors cursor-pointer"
                              title="Mark Completed"
                            >
                              Complete
                            </button>
                          )}
                          {apt.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleUpdateAppointmentStatus(apt.id, 'Cancelled')}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 transition-colors cursor-pointer"
                              title="Cancel Appointment"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: DOCTORS */}
        {activeTab === 'doctors' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Hospital Medical Faculty</h3>
                <p className="text-xs text-slate-500">Board-certified doctors across all 5 RH Care campuses.</p>
              </div>
              <button
                onClick={() => setIsDoctorModalOpen(true)}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Register New Specialist Doctor</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((doc) => (
                <div key={doc.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={doc.image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80'}
                      alt={doc.doctor_name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-extrabold text-slate-900 truncate">{doc.doctor_name}</h4>
                      <p className="text-[11px] text-slate-500 truncate">{doc.degrees}</p>
                      <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">{doc.department_name}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1">
                    <div className="font-bold text-slate-800 text-[11px]">{doc.specialization}</div>
                    <div className="text-[11px] text-slate-500 truncate">🏥 {doc.hospital_name}</div>
                    <div className="text-[11px] text-slate-500 flex justify-between">
                      <span>🕒 {doc.opd_timings}</span>
                      <span className="font-bold text-slate-800">₹{doc.consultation_fee}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: HOSPITALS */}
        {activeTab === 'hospitals' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hospitals.map((h) => (
              <div key={h.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                      {h.trauma_level}
                    </span>
                    <h4 className="text-base font-black text-slate-900 mt-1">{h.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{h.address}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 text-amber-900 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{h.rating}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Beds & ICU</span>
                    <span className="font-bold text-slate-800">{h.beds_count} Beds ({h.icu_beds} ICU)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Emergency Phone</span>
                    <span className="font-bold text-rose-600">{h.emergency_hotline}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: PATIENTS */}
        {activeTab === 'patients' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4">ID</th>
                  <th className="px-5 py-4">Patient Name</th>
                  <th className="px-5 py-4">Contact Phone</th>
                  <th className="px-5 py-4">Demographics</th>
                  <th className="px-5 py-4">Address / Locality</th>
                  <th className="px-5 py-4">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 font-mono font-bold text-sky-700">#{p.id}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">{p.name}</td>
                    <td className="px-5 py-3.5 text-slate-600">{p.phone || 'N/A'}</td>
                    <td className="px-5 py-3.5 text-slate-600">{p.age ? `${p.age} yrs` : '—'} • {p.gender || '—'}</td>
                    <td className="px-5 py-3.5 text-slate-500 max-w-xs truncate">{p.address}</td>
                    <td className="px-5 py-3.5 text-slate-500 tabular-nums">{p.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Register Doctor Modal */}
        {isDoctorModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-slate-900">Register Senior Doctor Profile</h3>
                <button onClick={() => setIsDoctorModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveDoctor} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Doctor Name *</label>
                  <input
                    type="text"
                    required
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    placeholder="e.g. Dr. Ramesh Gupta"
                    className="w-full px-3.5 py-2 border rounded-xl text-xs bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Medical Degrees & Accreditations</label>
                  <input
                    type="text"
                    value={docDegrees}
                    onChange={(e) => setDocDegrees(e.target.value)}
                    placeholder="e.g. MBBS, MD, DM (Cardiology), FACC"
                    className="w-full px-3.5 py-2 border rounded-xl text-xs bg-slate-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Department</label>
                    <select
                      value={docDeptId}
                      onChange={(e) => setDocDeptId(Number(e.target.value))}
                      className="w-full px-3.5 py-2 border rounded-xl text-xs bg-white"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.department_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Hospital Campus</label>
                    <select
                      value={docHospId}
                      onChange={(e) => setDocHospId(Number(e.target.value))}
                      className="w-full px-3.5 py-2 border rounded-xl text-xs bg-white"
                    >
                      {hospitals.map((h) => (
                        <option key={h.id} value={h.id}>{h.name.split('-')[0]}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Specialization & Role *</label>
                  <input
                    type="text"
                    required
                    value={docSpec}
                    onChange={(e) => setDocSpec(e.target.value)}
                    placeholder="e.g. Senior Interventional Cardiologist & Catheterization Director"
                    className="w-full px-3.5 py-2 border rounded-xl text-xs bg-slate-50"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Experience (Yrs)</label>
                    <input
                      type="number"
                      value={docExp}
                      onChange={(e) => setDocExp(Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Consulting Fee (₹)</label>
                    <input
                      type="number"
                      value={docFee}
                      onChange={(e) => setDocFee(Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Room / Suite</label>
                    <input
                      type="text"
                      value={docRoom}
                      onChange={(e) => setDocRoom(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDoctorModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingDoctor}
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
                  >
                    {isSavingDoctor ? 'Registering...' : 'Save Doctor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
