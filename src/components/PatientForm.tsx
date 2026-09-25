import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Doctor, Appointment, Hospital } from '../types.ts';
import {
  User,
  Phone,
  Calendar,
  MapPin,
  Building2,
  Stethoscope,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  Printer,
  AlertCircle,
  Loader2,
  Navigation,
  Star,
  ShieldCheck,
  HeartPulse,
  Clock,
  Sparkles,
  Zap,
  ArrowUpRight,
  Check
} from 'lucide-react';

interface PatientFormProps {
  initialDepartment?: string;
  initialDoctorId?: number;
  initialHospitalId?: number;
  onAppointmentBooked?: (appointment: Appointment) => void;
  onViewAppointments?: () => void;
  onOpenHospitalDetails?: (hospital: Hospital) => void;
}

// Fixed 6 Temporary Details that solve patient registration and hospital booking
export const FIXED_6_TEMPORARY_DETAILS = [
  {
    id: 1,
    tag: 'Campus 1: Central Campus',
    locality: 'Indiranagar',
    name: 'Anand Verma',
    phone: '+91 98450 77123',
    age: 42,
    gender: 'Male',
    address: '142, 100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru 560038',
    hospitalId: 1,
    hospitalName: 'RH Care Multi-Specialty Hospital - Central Campus',
    department: 'Cardiology',
    doctorId: 1,
    doctorName: 'Dr. Rajesh Sharma, MD, DM',
    symptoms: 'Routine cardiovascular health checkup & periodic ECG evaluation'
  },
  {
    id: 2,
    tag: 'Campus 2: East Wing',
    locality: 'Whitefield',
    name: 'Sneha Patel',
    phone: '+91 98860 33451',
    age: 34,
    gender: 'Female',
    address: '88, ITPL Main Road, EPIP Zone, Whitefield, Bengaluru 560066',
    hospitalId: 2,
    hospitalName: 'RH Care Heart & Vascular Institute - East Wing',
    department: 'Cardiology',
    doctorId: 3,
    doctorName: 'Dr. Arvind Swaminathan, MD, DM',
    symptoms: 'Resting palpitations and post-exertional shortness of breath'
  },
  {
    id: 3,
    tag: 'Campus 3: North Medical City',
    locality: 'Hebbal',
    name: 'Vikramaditya Rao',
    phone: '+91 99002 88412',
    age: 58,
    gender: 'Male',
    address: 'Sector 3, Bellary Road, Near Hebbal Lake, Bengaluru 560024',
    hospitalId: 3,
    hospitalName: 'RH Care Super-Specialty Medical City - North',
    department: 'Neurology & Neurosurgery',
    doctorId: 5,
    doctorName: 'Dr. Meera Nambiar, MD, DM',
    symptoms: 'Chronic migraine assessment and comprehensive neurological screening'
  },
  {
    id: 4,
    tag: 'Campus 4: South Hospital',
    locality: 'Jayanagar',
    name: 'Priya Sundaram',
    phone: '+91 98451 22934',
    age: 31,
    gender: 'Female',
    address: '24, 100 Feet Ring Road, 4th T Block, Jayanagar, Bengaluru 560011',
    hospitalId: 4,
    hospitalName: "RH Care Women & Children's Super-Specialty Hospital - South",
    department: 'Pediatrics & Neonatology',
    doctorId: 7,
    doctorName: 'Dr. Shalini Prasad, MD, DCH',
    symptoms: 'Prenatal consultation and pediatric wellness checkup'
  },
  {
    id: 5,
    tag: 'Campus 5: West Institute',
    locality: 'Rajajinagar',
    name: 'Kavitha Deshmukh',
    phone: '+91 99801 65432',
    age: 49,
    gender: 'Female',
    address: '56, Dr. Rajkumar Road, 2nd Block, Rajajinagar, Bengaluru 560010',
    hospitalId: 5,
    hospitalName: 'RH Care Institute of Neurosciences & Orthopedics - West',
    department: 'Orthopedics & Joint Care',
    doctorId: 9,
    doctorName: 'Dr. Alok Chandra, MS, MCh',
    symptoms: 'Lumbar spinal stiffness and joint mobility assessment'
  },
  {
    id: 6,
    tag: 'Campus 6: Tech Corridor Trauma',
    locality: 'Electronic City',
    name: 'Rajesh Nair',
    phone: '+91 97410 44520',
    age: 45,
    gender: 'Male',
    address: '78/1, Hosur Main Road, Electronic City Phase 1, Bengaluru 560100',
    hospitalId: 6,
    hospitalName: 'RH Care Multi-Specialty & Emergency Trauma - Tech Corridor',
    department: 'Orthopedics & Joint Care',
    doctorId: 13,
    doctorName: 'Dr. Vivek Menon, MS, DNB',
    symptoms: 'Industrial ergonomics checkup and sports knee ligament evaluation'
  }
];

// Quick locality suggestions for residential address
const LOCALITY_PRESETS = [
  { name: 'Indiranagar', address: '142, 100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru 560038' },
  { name: 'Whitefield', address: '88, ITPL Main Road, EPIP Zone, Whitefield, Bengaluru 560066' },
  { name: 'Hebbal', address: 'Sector 3, Bellary Road, Near Hebbal Lake, Bengaluru 560024' },
  { name: 'Jayanagar', address: '24, 100 Feet Ring Road, 4th T Block, Jayanagar, Bengaluru 560011' },
  { name: 'Rajajinagar', address: '56, Dr. Rajkumar Road, 2nd Block, Rajajinagar, Bengaluru 560010' },
  { name: 'Electronic City', address: '78/1, Hosur Main Road, Electronic City Phase 1, Bengaluru 560100' }
];

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
  const [selectedLocality, setSelectedLocality] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [department, setDepartment] = useState(initialDepartment);
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | ''>(initialHospitalId || '');
  const [doctorId, setDoctorId] = useState<string>(initialDoctorId ? String(initialDoctorId) : '');

  // Catalogs
  const [allHospitals, setAllHospitals] = useState<Hospital[]>([]);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active temporary detail preset tracker
  const [activePresetId, setActivePresetId] = useState<number | null>(null);

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
        setAllDoctors(docs);
        setDepartments(depts.map((d) => d.department_name));
        if (hosps.length > 0 && !initialHospitalId) {
          setSelectedHospitalId(hosps[0].id);
        }
      }
    }).catch((err) => console.error('Failed loading catalogs:', err));

    return () => {
      isMounted = false;
    };
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

  // Apply one of the 6 fixed temporary details
  const handleApplyTemporaryDetail = (item: typeof FIXED_6_TEMPORARY_DETAILS[0]) => {
    setActivePresetId(item.id);
    setPatientName(item.name);
    setPhone(item.phone);
    setAge(item.age);
    setGender(item.gender);
    setAddress(item.address);
    setSelectedLocality(item.locality);
    setSelectedHospitalId(item.hospitalId);
    setDepartment(item.department);
    setDoctorId(String(item.doctorId));
    setSymptoms(item.symptoms);
    setErrors({});
    setServerError(null);
  };

  // Instant 1-click solve & book directly
  const handleDirectSolveAndBook = async (item: typeof FIXED_6_TEMPORARY_DETAILS[0]) => {
    handleApplyTemporaryDetail(item);
    setIsSubmitting(true);
    setServerError(null);

    try {
      const payload = {
        name: item.name,
        phone: item.phone,
        age: item.age,
        gender: item.gender,
        date: appointmentDate || new Date().toISOString().split('T')[0],
        address: item.address,
        department: item.department,
        doctor_id: item.doctorId,
        hospital_id: item.hospitalId,
        symptoms: item.symptoms
      };

      const result = await api.createAppointment(payload);
      setBookingSuccess(result.data);

      if (onAppointmentBooked) {
        onAppointmentBooked(result.data);
      }

      window.scrollTo({ top: 120, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Direct solve booking failed:', err);
      setServerError(err.message || 'Failed to submit registration. Please verify connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle locality chip click
  const handleSelectLocality = (loc: { name: string; address: string }) => {
    setSelectedLocality(loc.name);
    setAddress(loc.address);
    if (errors.address) setErrors((prev) => ({ ...prev, address: '' }));
  };

  // Dynamically filter available doctors based on selected hospital and department
  useEffect(() => {
    let filtered = allDoctors;

    if (selectedHospitalId) {
      filtered = filtered.filter((d) => d.hospital_id === Number(selectedHospitalId));
    }

    if (department) {
      filtered = filtered.filter(
        (d) => (d.department_name || '').toLowerCase() === department.toLowerCase()
      );
    }

    setAvailableDoctors(filtered);

    // Auto-select doctor if only one matches
    if (filtered.length === 1) {
      setDoctorId(String(filtered[0].id));
    } else if (doctorId && !filtered.some((d) => String(d.id) === String(doctorId))) {
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
      newErrors.phone = 'Contact phone number is required.';
    }

    if (!appointmentDate) {
      newErrors.appointmentDate = 'Appointment date is required.';
    }

    if (!address.trim()) {
      newErrors.address = 'Residential address & locality is required.';
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
      const resolvedHospitalId = selectedHospitalId ? Number(selectedHospitalId) : 1;

      let resolvedDoctorId = doctorId ? Number(doctorId) : undefined;
      if (!resolvedDoctorId) {
        const hospitalDocs = allDoctors.filter((d) => d.hospital_id === resolvedHospitalId);
        if (hospitalDocs.length > 0) {
          const deptMatch = department
            ? hospitalDocs.find((d) => (d.department_name || '').toLowerCase() === department.toLowerCase())
            : null;
          resolvedDoctorId = deptMatch ? deptMatch.id : hospitalDocs[0].id;
        } else {
          resolvedDoctorId = allDoctors[0]?.id || 1;
        }
      }

      const selectedDoc = allDoctors.find((d) => d.id === resolvedDoctorId);

      const payload = {
        name: patientName.trim(),
        phone: phone.trim(),
        age: age ? Number(age) : 38,
        gender,
        date: appointmentDate,
        address: address.trim(),
        department: selectedDoc?.department_name || department || 'Outpatient Services',
        doctor_id: resolvedDoctorId,
        hospital_id: resolvedHospitalId,
        symptoms: symptoms.trim() || 'General Health Evaluation & Consultation'
      };

      const result = await api.createAppointment(payload);
      setBookingSuccess(result.data);

      if (onAppointmentBooked) {
        onAppointmentBooked(result.data);
      }

      handleReset(false);
      window.scrollTo({ top: 120, behavior: 'smooth' });
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
    setSelectedLocality('');
    setSymptoms('');
    setDepartment('');
    setDoctorId('');
    setActivePresetId(null);
    setErrors({});
    if (clearSuccess) {
      setBookingSuccess(null);
      setServerError(null);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const activeHospital = allHospitals.find((h) => h.id === Number(selectedHospitalId));

  return (
    <div className="py-10 bg-slate-50 min-h-[calc(100vh-80px)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider mb-2">
            <HeartPulse className="w-3.5 h-3.5 text-sky-600" />
            <span>RH Care Quaternary Network</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Patient Registration & Appointment Booking
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
            Book an appointment at your preferred RH Care hospital campus or pick from 6 fixed temporary profiles to solve registration with a single click.
          </p>
        </div>

        {/* 6 Fixed Temporary Details That Solve */}
        <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-400/30">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-sky-300 block">
                  Fixed 6 Temporary Details That Solve
                </span>
                <span className="text-xs text-slate-300">
                  Select any profile below to instantly populate and solve all patient, address, hospital & doctor details
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
              6 Solved Presets
            </span>
          </div>

          {/* 6 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {FIXED_6_TEMPORARY_DETAILS.map((item) => {
              const isSelected = activePresetId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleApplyTemporaryDetail(item)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between text-left group ${
                    isSelected
                      ? 'bg-sky-950/80 border-sky-400 ring-2 ring-sky-400/50 shadow-lg'
                      : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-sky-400 truncate">
                        {item.tag}
                      </span>
                      {isSelected ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500 text-white flex items-center gap-1">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">{item.locality}</span>
                      )}
                    </div>

                    <div className="text-sm font-extrabold text-white leading-tight mb-1">
                      {item.name}
                      <span className="text-xs text-slate-400 font-normal ml-1.5">
                        ({item.age}y, {item.gender})
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 font-medium line-clamp-1 mb-2">
                      🏥 {item.hospitalName}
                    </div>

                    <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-700/60 text-[11px] text-slate-300 space-y-1 mb-3">
                      <div className="truncate text-sky-200">
                        👨‍⚕️ <strong>{item.doctorName}</strong>
                      </div>
                      <div className="truncate text-slate-400 text-[10px]">
                        📋 {item.department} • {item.phone}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-700/60 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyTemporaryDetail(item);
                      }}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white text-[11px] font-bold transition-all text-center cursor-pointer"
                    >
                      Fill Form
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDirectSolveAndBook(item);
                      }}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-sky-600 hover:bg-sky-500 active:scale-95 text-white text-[11px] font-black transition-all text-center flex items-center justify-center gap-1 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <Zap className="w-3 h-3 fill-current" />
                      <span>Instant Book</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
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
                    Registration Confirmed & Hospital Booked
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
                  Assigned Hospital Campus
                </span>
                <span className="text-sm font-extrabold text-slate-900 block">
                  {bookingSuccess.hospital_name}
                </span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  {bookingSuccess.hospital_address}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Attending Specialist Doctor
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
                  Patient Name & Residential Address
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {bookingSuccess.patient_name} ({bookingSuccess.patient_age} yrs, {bookingSuccess.patient_gender})
                </span>
                <span className="text-xs text-slate-500 block truncate">
                  {bookingSuccess.patient_address}
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
              <div className="flex flex-wrap items-center gap-2">
                {/* Attached Google Maps Location Link */}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${bookingSuccess.hospital_name || ''}, ${bookingSuccess.hospital_address || ''}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Navigation className="w-3.5 h-3.5 text-sky-400" />
                  <span>View Google Location & Directions</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </a>

                {/* Inspect Hospital Details, Doctor Specs & Reviews Button */}
                {activeHospital && onOpenHospitalDetails && (
                  <button
                    type="button"
                    onClick={() => onOpenHospitalDetails(activeHospital)}
                    className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
                    <span>Hospital Details, Doctors & Feedback</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>

                {onViewAppointments && (
                  <button
                    type="button"
                    onClick={onViewAppointments}
                    className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Appointments List</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Patient Registration Form Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Step 1: Patient Details */}
            <div className="border-b border-slate-100 pb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <span>1. Patient Identification</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-6">
                  <label
                    htmlFor="patientName"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
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
                        if (errors.patientName) setErrors((prev) => ({ ...prev, patientName: '' }));
                      }}
                      placeholder="e.g. Anand Verma"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        errors.patientName
                          ? 'border-red-400 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-300'
                          : 'border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-900'
                      }`}
                    />
                  </div>
                  {errors.patientName && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">{errors.patientName}</p>
                  )}
                </div>

                <div className="sm:col-span-6">
                  <label
                    htmlFor="phone"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
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
                        if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                      }}
                      placeholder="+91 98450 77123"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        errors.phone
                          ? 'border-red-400 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-300'
                          : 'border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-900'
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">{errors.phone}</p>
                  )}
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
                    placeholder="e.g. 42"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label
                    htmlFor="gender"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
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
                  <label
                    htmlFor="appointmentDate"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
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
                        if (errors.appointmentDate) setErrors((prev) => ({ ...prev, appointmentDate: '' }));
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 tabular-nums focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Residential Address & Locality */}
            <div className="border-b border-slate-100 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                <label
                  htmlFor="address"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  2. Residential Address & Locality <span className="text-rose-500">*</span>
                </label>
              </div>

              {/* Locality Quick-Pick Chips */}
              <div className="mb-2 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-0.5">
                  Locality:
                </span>
                {LOCALITY_PRESETS.map((loc) => {
                  const isSelected = selectedLocality === loc.name;
                  return (
                    <button
                      key={loc.name}
                      type="button"
                      onClick={() => handleSelectLocality(loc)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/80'
                      }`}
                    >
                      {loc.name}
                    </button>
                  );
                })}
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
                    if (errors.address) setErrors((prev) => ({ ...prev, address: '' }));
                  }}
                  placeholder="Enter your street address, apartment name, locality (e.g. Indiranagar, Whitefield, Hebbal, Electronic City)..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    errors.address
                      ? 'border-red-400 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-300'
                      : 'border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-900'
                  }`}
                />
              </div>
              {errors.address && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.address}</p>}
            </div>

            {/* Step 3: Hospital Campus, Department & Doctor Selection */}
            <div className="border-b border-slate-100 pb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <span>3. Hospital Campus & Doctor Specification</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                {/* Hospital Selection */}
                <div className="sm:col-span-12">
                  <label htmlFor="hospitalSelect" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Hospital Campus <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <select
                      id="hospitalSelect"
                      value={selectedHospitalId}
                      onChange={(e) => setSelectedHospitalId(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    >
                      {allHospitals.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.name} — {h.address}
                        </option>
                      ))}
                    </select>
                  </div>

                  {activeHospital && (
                    <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-bold text-slate-800">{activeHospital.name}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500 truncate">{activeHospital.operating_hours}</span>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${activeHospital.name}, ${activeHospital.address}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-600 hover:text-sky-800 font-bold flex items-center gap-0.5 shrink-0 ml-2"
                      >
                        <span>Google Map</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Department */}
                <div className="sm:col-span-6">
                  <label htmlFor="department" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Clinical Department
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <select
                      id="department"
                      value={department}
                      onChange={(e) => {
                        setDepartment(e.target.value);
                        setDoctorId('');
                      }}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    >
                      <option value="">All Departments (Auto-Match)</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Doctor */}
                <div className="sm:col-span-6">
                  <label htmlFor="doctorId" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Attending Specialist Doctor
                  </label>
                  <select
                    id="doctorId"
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  >
                    <option value="">Auto-Assign Leading Specialist at Campus</option>
                    {availableDoctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.doctor_name} — {doc.specialization} ({doc.room_number})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Symptoms / Chief Complaint */}
                <div className="sm:col-span-12">
                  <label htmlFor="symptoms" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Chief Complaint / Symptoms
                  </label>
                  <input
                    type="text"
                    id="symptoms"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="e.g. Chest tightness, routine annual health checkup, joint pain..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </div>
              </div>
            </div>

            {/* Submit Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 text-left">
                {activeHospital && (
                  <span className="font-medium">
                    Booking at: <strong className="text-slate-800">{activeHospital.name}</strong>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleReset(true)}
                  className="px-4 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 inline mr-1" />
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-[0.98] text-white text-sm font-black tracking-wide shadow-md shadow-sky-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Confirming Booking...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit Registration & Direct Book</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
