import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Doctor, Appointment, Hospital } from '../types.ts';
import { User, Phone, Calendar, MapPin, Building2, Stethoscope, CheckCircle2, RotateCcw, ArrowRight, Printer, AlertCircle, Loader2, Navigation, LocateFixed, Star, ShieldCheck, HeartPulse, Clock } from 'lucide-react';

interface PatientFormProps {
  initialDepartment?: string;
  initialDoctorId?: number;
  initialHospitalId?: number;
  onAppointmentBooked?: (appointment: Appointment) => void;
  onViewAppointments?: () => void;
  onOpenHospitalDetails?: (hospital: Hospital) => void;
}

export const PatientForm: React.FC<PatientFormProps> = ({
  initialDepartment = '',
  initialDoctorId,
  initialHospitalId,
  onAppointmentBooked,
  onViewAppointments,
  onOpenHospitalDetails
}) => {
  // Form input state
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState('Male');
  const [appointmentDate, setAppointmentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [address, setAddress] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [department, setDepartment] = useState(initialDepartment);
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | ''>(initialHospitalId || '');
  const [doctorId, setDoctorId] = useState<string>(initialDoctorId ? String(initialDoctorId) : '');

  // Geolocation & Proximity Scanner State
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isScanningNearby, setIsScanningNearby] = useState(false);
  const [scannedHospitals, setScannedHospitals] = useState<Hospital[]>([]);
  const [nearestHospital, setNearestHospital] = useState<Hospital | null>(null);

  // Doctors & Departments
  const [allHospitals, setAllHospitals] = useState<Hospital[]>([]);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation & alerts
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bookingSuccess, setBookingSuccess] = useState<Appointment | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      api.getHospitals(),
      api.getDoctors(),
      api.getDepartments()
    ]).then(([hosps, docs, depts]) => {
      if (isMounted) {
        setAllHospitals(hosps);
        setScannedHospitals(hosps);
        setAllDoctors(docs);
        setDepartments(depts.map(d => d.department_name));
        if (hosps.length > 0 && !initialHospitalId) {
          setSelectedHospitalId(hosps[0].id);
        }
      }
    }).catch(err => console.error('Failed loading form catalogs:', err));

    return () => { isMounted = false; };
  }, []);

  // Sync initial props
  useEffect(() => {
    if (initialDepartment) setDepartment(initialDepartment);
  }, [initialDepartment]);

  useEffect(() => {
    if (initialDoctorId) setDoctorId(String(initialDoctorId));
  }, [initialDoctorId]);

  useEffect(() => {
    if (initialHospitalId) setSelectedHospitalId(initialHospitalId);
  }, [initialHospitalId]);

  // GPS Auto-Detector
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setServerError('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingLocation(true);
    setServerError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        setIsDetectingLocation(false);
        setAddress(prev => prev.trim() || 'Current GPS Location (Coordinates Attached)');
        
        // Scan nearby hospitals with real coordinates
        scanHospitals(undefined, coords.lat, coords.lng);
      },
      (err) => {
        console.warn('GPS location declined or failed:', err);
        setIsDetectingLocation(false);
        // Fallback default city center
        const fallback = { lat: 12.9719, lng: 77.6412 };
        setUserCoords(fallback);
        scanHospitals(undefined, fallback.lat, fallback.lng);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Scan Nearby Hospitals
  const scanHospitals = async (addr?: string, lat?: number, lng?: number) => {
    setIsScanningNearby(true);
    try {
      const res = await api.scanNearbyHospitals({
        address: addr || address,
        lat: lat ?? userCoords?.lat,
        lng: lng ?? userCoords?.lng
      });

      setScannedHospitals(res.allNearbyHospitals);
      setNearestHospital(res.nearestHospital);
      
      // Auto-select nearest hospital if user hasn't explicitly chosen one
      if (res.nearestHospital) {
        setSelectedHospitalId(res.nearestHospital.id);
      }
    } catch (err) {
      console.error('Failed to scan nearby hospitals:', err);
    } finally {
      setIsScanningNearby(false);
    }
  };

  // Trigger scanning when address changes with debounce
  useEffect(() => {
    if (!address.trim()) return;
    const timer = setTimeout(() => {
      scanHospitals(address);
    }, 600);
    return () => clearTimeout(timer);
  }, [address]);

  // Dynamically filter available doctors based on selected hospital and department
  useEffect(() => {
    let filtered = allDoctors;

    if (selectedHospitalId) {
      filtered = filtered.filter(d => d.hospital_id === Number(selectedHospitalId));
    }

    if (department) {
      filtered = filtered.filter(d => (d.department_name || '').toLowerCase() === department.toLowerCase());
    }

    setAvailableDoctors(filtered);

    // Auto-select doctor if only one matches
    if (filtered.length === 1) {
      setDoctorId(String(filtered[0].id));
    } else if (doctorId && !filtered.some(d => String(d.id) === String(doctorId))) {
      // Clear selection if current doctor is not in the filtered list
      setDoctorId('');
    }
  }, [selectedHospitalId, department, allDoctors]);

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!patientName.trim() || patientName.trim().length < 2) {
      newErrors.patientName = 'Patient full name is required (minimum 2 characters).';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Contact telephone number is required.';
    }

    if (!appointmentDate) {
      newErrors.appointmentDate = 'Appointment date is required.';
    }

    if (!address.trim()) {
      newErrors.address = 'Residential or locality address is required for hospital scanning.';
    }

    if (!selectedHospitalId) {
      newErrors.hospital = 'Please select an RH Care hospital campus.';
    }

    if (!doctorId) {
      newErrors.doctorId = 'Please choose an attending specialist doctor.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const selectedDoc = allDoctors.find(d => d.id === Number(doctorId));
      const chosenHosp = allHospitals.find(h => h.id === Number(selectedHospitalId));

      const payload = {
        name: patientName.trim(),
        phone: phone.trim(),
        age: age ? Number(age) : 35,
        gender,
        date: appointmentDate,
        address: address.trim(),
        department: selectedDoc?.department_name || department || 'Outpatient Services',
        doctor_id: Number(doctorId),
        hospital_id: Number(selectedHospitalId),
        symptoms: symptoms.trim() || 'General Consultation & Health Evaluation',
        userLat: userCoords?.lat,
        userLng: userCoords?.lng
      };

      const result = await api.createAppointment(payload);
      setBookingSuccess(result.data);

      if (onAppointmentBooked) {
        onAppointmentBooked(result.data);
      }

      // Reset fields
      handleReset(false);
    } catch (err: any) {
      console.error('Booking submission error:', err);
      setServerError(err.message || 'Failed to submit registration. Please verify connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = (clearSuccess = true) => {
    setPatientName('');
    setPhone('');
    setAge('');
    setAddress('');
    setSymptoms('');
    setDepartment('');
    setDoctorId('');
    setErrors({});
    if (clearSuccess) {
      setBookingSuccess(null);
      setServerError(null);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const activeHospital = allHospitals.find(h => h.id === Number(selectedHospitalId));

  return (
    <div className="py-12 bg-slate-50 min-h-[calc(100vh-80px)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider mb-2">
            <HeartPulse className="w-3.5 h-3.5 text-sky-600" />
            <span>RH Care Quaternary Network</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Patient Registration & Auto-Hospital Routing
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
            Provide your details. Our location engine automatically scans the nearest RH Care hospital campus, matches verified specialist doctors, and generates an official consultation token.
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{serverError}</div>
          </div>
        )}

        {/* Booking Confirmation Slip */}
        {bookingSuccess && (
          <div className="mb-10 bg-emerald-50/90 border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 shadow-lg animate-fadeIn text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                  <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                    Registration Confirmed
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                    Appointment Successfully Scheduled!
                  </h3>
                </div>
              </div>

              <div className="bg-white px-4 py-2 rounded-xl border border-emerald-200 text-left sm:text-right shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Official Token Number
                </span>
                <span className="text-lg font-black text-sky-600 tracking-wide font-mono">
                  {bookingSuccess.token_number}
                </span>
              </div>
            </div>

            {/* Confirmed Details Grid */}
            <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Hospital Campus
                </span>
                <span className="text-sm font-extrabold text-slate-900 block">
                  {bookingSuccess.hospital_name}
                </span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  {bookingSuccess.hospital_address}
                </span>
                {bookingSuccess.distance_km !== undefined && (
                  <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                    📍 {bookingSuccess.distance_km} km away from your location
                  </span>
                )}
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Attending Specialist
                </span>
                <span className="text-sm font-extrabold text-slate-900 block">
                  {bookingSuccess.doctor_name}
                </span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  {bookingSuccess.specialization} ({bookingSuccess.department_name})
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Patient Name & Phone
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {bookingSuccess.patient_name} ({bookingSuccess.patient_age} yrs, {bookingSuccess.patient_gender})
                </span>
                <span className="text-xs text-slate-500 block">
                  {bookingSuccess.patient_phone}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Scheduled Consultation Date & Slot
                </span>
                <span className="text-sm font-bold text-slate-900 tabular-nums">
                  📅 {bookingSuccess.appointment_date}
                </span>
                <span className="text-xs text-slate-500 block">
                  🕒 {bookingSuccess.appointment_time || '10:00 AM - 12:30 PM (Morning Slot)'}
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bookingSuccess.hospital_name || '')}+${encodeURIComponent(bookingSuccess.hospital_address || '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Navigation className="w-3.5 h-3.5 text-sky-400" />
                  <span>Get Driving Directions</span>
                </a>

                {activeHospital && onOpenHospitalDetails && (
                  <button
                    type="button"
                    onClick={() => onOpenHospitalDetails(activeHospital)}
                    className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Inspect Hospital & Reviews</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>

                {onViewAppointments && (
                  <button
                    type="button"
                    onClick={onViewAppointments}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>View All Appointments</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Patient Registration Form Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            
            {/* Step 1: Patient Details */}
            <div className="border-b border-slate-100 pb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <span>1. Patient Identification</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-6">
                  <label htmlFor="patientName" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Patient Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="patientName"
                      value={patientName}
                      onChange={(e) => {
                        setPatientName(e.target.value);
                        if (errors.patientName) setErrors(prev => ({ ...prev, patientName: '' }));
                      }}
                      placeholder="e.g. Ramesh Patel"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        errors.patientName 
                          ? 'border-red-400 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-300' 
                          : 'border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-900'
                      }`}
                    />
                  </div>
                  {errors.patientName && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.patientName}</p>}
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                      }}
                      placeholder="+91 98450 12345"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        errors.phone 
                          ? 'border-red-400 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-300' 
                          : 'border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-900'
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.phone}</p>}
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="age" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Age
                  </label>
                  <input
                    type="number"
                    id="age"
                    min={1}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 45"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="gender" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Gender
                  </label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="appointmentDate" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Date <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="appointmentDate"
                      min={todayStr}
                      value={appointmentDate}
                      onChange={(e) => {
                        setAppointmentDate(e.target.value);
                        if (errors.appointmentDate) setErrors(prev => ({ ...prev, appointmentDate: '' }));
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 tabular-nums focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Location & Auto-Nearby Hospital Scanner */}
            <div className="border-b border-slate-100 pb-6">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="address" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  2. Residential Address & Locality <span className="text-rose-500">*</span>
                </label>
                
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={isDetectingLocation}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  <LocateFixed className={`w-3.5 h-3.5 text-sky-600 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                  <span>{isDetectingLocation ? 'Scanning GPS...' : '📍 Auto-Detect GPS Location'}</span>
                </button>
              </div>

              <div className="relative">
                <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <textarea
                  id="address"
                  rows={2}
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (errors.address) setErrors(prev => ({ ...prev, address: '' }));
                  }}
                  placeholder="Enter your street, neighborhood, or locality (e.g. Indiranagar, Whitefield, Hebbal, Jayanagar)..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    errors.address 
                      ? 'border-red-400 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-300' 
                      : 'border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-900'
                  }`}
                />
              </div>
              {errors.address && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.address}</p>}

              {/* Automatic Proximity Hospital Card */}
              <div className="mt-4 bg-gradient-to-tr from-sky-50/80 to-teal-50/60 p-4 rounded-2xl border border-sky-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-950 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-sky-600" />
                    <span>Nearby RH Care Hospitals Scanned</span>
                  </span>
                  {isScanningNearby && (
                    <span className="text-xs text-sky-600 font-medium flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Recalculating distances...
                    </span>
                  )}
                </div>

                {/* Scanned Hospitals Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {scannedHospitals.slice(0, 4).map((h, idx) => {
                    const isSelected = Number(selectedHospitalId) === h.id;
                    const isNearest = idx === 0;

                    return (
                      <div
                        key={h.id}
                        onClick={() => setSelectedHospitalId(h.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer text-left relative ${
                          isSelected
                            ? 'border-sky-600 bg-white shadow-md ring-2 ring-sky-300'
                            : 'border-slate-200/80 bg-white/70 hover:bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {h.name}
                          </span>
                          {isNearest && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 shrink-0">
                              ★ Closest
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="truncate max-w-[170px]">{h.city} • {h.address.split(',')[0]}</span>
                          {h.distance_km !== undefined && (
                            <span className="font-extrabold text-sky-700 shrink-0">
                              {h.distance_km} km
                            </span>
                          )}
                        </div>

                        {isSelected && onOpenHospitalDetails && (
                          <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                            <span className="text-emerald-700 font-bold">● Selected for Registration</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenHospitalDetails(h);
                              }}
                              className="text-sky-700 font-bold hover:underline"
                            >
                              Hospital Details & Feedback →
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 3: Clinical Department & Doctor Selection */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <span>3. Specialty & Doctor Specification</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Department */}
                <div>
                  <label htmlFor="department" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Clinical Department / Specialty
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <select
                      id="department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium transition-all bg-white text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    >
                      <option value="">-- All Hospital Specialties --</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Doctor Selection */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="doctor" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Attending Doctor <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {availableDoctors.length} available
                    </span>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <select
                      id="doctor"
                      value={doctorId}
                      onChange={(e) => {
                        setDoctorId(e.target.value);
                        if (errors.doctorId) setErrors(prev => ({ ...prev, doctorId: '' }));
                      }}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all bg-white text-slate-900 ${
                        errors.doctorId 
                          ? 'border-red-400 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-300' 
                          : 'border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100'
                      }`}
                    >
                      <option value="">-- Select Specialist Doctor --</option>
                      {availableDoctors.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.doctor_name} — {doc.degrees} ({doc.specialization}) • ₹{doc.consultation_fee}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.doctorId && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.doctorId}</p>}
                </div>
              </div>

              {/* Doctor Details Preview Box */}
              {doctorId && (
                (() => {
                  const currentDoc = allDoctors.find(d => String(d.id) === String(doctorId));
                  if (!currentDoc) return null;
                  return (
                    <div className="mt-3 p-4 rounded-2xl bg-sky-50/70 border border-sky-200 flex items-start gap-3.5">
                      <img
                        src={currentDoc.image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80'}
                        alt={currentDoc.doctor_name}
                        className="w-12 h-12 rounded-xl object-cover border border-sky-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-900 text-sm">
                            {currentDoc.doctor_name}
                          </span>
                          <span className="flex items-center gap-0.5 text-amber-700 font-bold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {currentDoc.rating}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-0.5 font-medium">
                          {currentDoc.degrees} &nbsp;•&nbsp; {currentDoc.experience_years} Years Clinical Experience
                        </p>
                        <div className="text-slate-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                          <span>🕒 {currentDoc.opd_timings}</span>
                          <span>📍 {currentDoc.room_number}</span>
                          <span>Fee: <strong className="text-slate-800">₹{currentDoc.consultation_fee}</strong></span>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}

              {/* Symptoms / Notes */}
              <div className="mt-4">
                <label htmlFor="symptoms" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Symptoms or Reason for Consultation
                </label>
                <input
                  type="text"
                  id="symptoms"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. Chest tightness, chronic knee pain, pediatric fever review, general wellness checkup"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </div>

            {/* Submit & Reset Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3.5 px-6 bg-gradient-to-r from-sky-600 via-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 active:scale-[0.99] disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Routing to Nearest Hospital & Registering...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Patient Registration & Direct Book</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleReset(true)}
                className="py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset Form</span>
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};
