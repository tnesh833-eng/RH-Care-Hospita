export interface Department {
  id: number;
  department_name: string;
  icon?: string;
  description?: string;
}

export interface HospitalFeedback {
  id: number;
  hospital_id: number;
  patient_name: string;
  treatment: string;
  doctor_name: string;
  rating: number;
  review_date: string;
  verified: boolean;
  comment: string;
}

export interface Hospital {
  id: number;
  name: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  phone: string;
  emergency_hotline: string;
  rating: number;
  review_count: number;
  beds_count: number;
  icu_beds: number;
  trauma_level: string;
  accreditations: string[];
  facilities: string[];
  operating_hours: string;
  departments: string[];
  image_url: string;
  distance_km?: number;
  travel_time_mins?: number;
  feedbacks?: HospitalFeedback[];
}

export interface Doctor {
  id: number;
  doctor_name: string;
  degrees: string;
  department_id: number;
  department_name?: string;
  hospital_id: number;
  hospital_name?: string;
  specialization: string;
  sub_specialties?: string[];
  experience_years: number;
  opd_timings: string;
  room_number: string;
  consultation_fee: number;
  languages: string[];
  rating: number;
  total_patients: number;
  bio: string;
  image?: string;
}

export interface Patient {
  id: number;
  name: string;
  phone?: string;
  age?: number;
  gender?: string;
  date: string;
  address: string;
  created_at: string;
}

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  hospital_id: number;
  appointment_date: string;
  appointment_time?: string;
  token_number?: string;
  status: 'Pending' | 'Approved' | 'Cancelled' | 'Completed';
  created_at: string;
  patient_name?: string;
  patient_phone?: string;
  patient_address?: string;
  patient_age?: number;
  patient_gender?: string;
  doctor_name?: string;
  specialization?: string;
  department_name?: string;
  hospital_name?: string;
  hospital_address?: string;
  distance_km?: number;
  symptoms?: string;
}

export interface AdminStats {
  totalPatients: number;
  totalDoctors: number;
  totalHospitals: number;
  totalAppointments: number;
  pendingAppointments: number;
}

export interface SerpApiPlace {
  position?: number;
  title: string;
  address: string;
  rating?: number;
  reviews?: number;
  phone?: string;
  latitude?: number;
  longitude?: number;
  open_state?: string;
  hours?: string;
  thumbnail?: string;
  photos?: string[];
  type?: string;
  place_id?: string;
  website?: string;
  distance_km?: number;
  hospital_id?: number;
}

export interface MapsConfigResponse {
  googleMapsApiKeyConfigured: boolean;
  serpApiKeyConfigured: boolean;
  serpApiEngine: string;
  serpApiUrl: string;
  activeGoogleMapsKeyMasked: string;
  activeSerpApiKeyMasked: string;
}
