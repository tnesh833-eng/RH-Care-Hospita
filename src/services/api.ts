import { Department, Doctor, Patient, Appointment, AdminStats, Hospital, HospitalFeedback } from '../types.ts';

const API_BASE = '/api';

export const api = {
  // Hospitals
  async getHospitals(lat?: number, lng?: number): Promise<Hospital[]> {
    let url = `${API_BASE}/hospitals`;
    if (lat !== undefined && lng !== undefined) {
      url += `?lat=${lat}&lng=${lng}`;
    }
    const res = await fetch(url);
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async getHospitalById(id: number, lat?: number, lng?: number): Promise<(Hospital & { doctors: Doctor[] }) | null> {
    let url = `${API_BASE}/hospitals/${id}`;
    if (lat !== undefined && lng !== undefined) {
      url += `?lat=${lat}&lng=${lng}`;
    }
    const res = await fetch(url);
    const json = await res.json();
    return json.success ? json.data : null;
  },

  async addHospitalFeedback(hospitalId: number, data: {
    patient_name: string;
    treatment: string;
    doctor_name: string;
    rating: number;
    comment: string;
  }): Promise<HospitalFeedback> {
    const res = await fetch(`${API_BASE}/hospitals/${hospitalId}/feedbacks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to submit hospital feedback');
    }
    return json.data;
  },

  async scanNearbyHospitals(data: { address?: string; lat?: number; lng?: number }): Promise<{
    userCoordinates: { lat: number; lng: number };
    nearestHospital: Hospital;
    allNearbyHospitals: Hospital[];
  }> {
    const res = await fetch(`${API_BASE}/scan-nearby-hospitals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to scan nearby hospitals');
    }
    return {
      userCoordinates: json.userCoordinates,
      nearestHospital: json.nearestHospital,
      allNearbyHospitals: json.allNearbyHospitals
    };
  },

  // Departments
  async getDepartments(): Promise<Department[]> {
    const res = await fetch(`${API_BASE}/departments`);
    const json = await res.json();
    return json.success ? json.data : [];
  },

  // Doctors
  async getDoctors(department?: string, hospitalId?: number): Promise<Doctor[]> {
    const params = new URLSearchParams();
    if (department) params.append('department', department);
    if (hospitalId) params.append('hospital_id', String(hospitalId));

    const url = `${API_BASE}/doctors${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url);
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async getDoctorById(id: number): Promise<Doctor | null> {
    const res = await fetch(`${API_BASE}/doctors/${id}`);
    const json = await res.json();
    return json.success ? json.data : null;
  },

  async getDoctorsByDepartment(department: string): Promise<Doctor[]> {
    const res = await fetch(`${API_BASE}/doctors/department/${encodeURIComponent(department)}`);
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async createDoctor(data: Partial<Doctor>): Promise<Doctor> {
    const res = await fetch(`${API_BASE}/doctors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to add doctor');
    }
    return json.data;
  },

  // Patients
  async getPatients(): Promise<Patient[]> {
    const res = await fetch(`${API_BASE}/patients`);
    const json = await res.json();
    return json.success ? json.data : [];
  },

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    const res = await fetch(`${API_BASE}/appointments`);
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async getAppointmentById(id: number): Promise<Appointment | null> {
    const res = await fetch(`${API_BASE}/appointments/${id}`);
    const json = await res.json();
    return json.success ? json.data : null;
  },

  async createAppointment(data: {
    name: string;
    phone?: string;
    age?: number;
    gender?: string;
    date: string;
    address: string;
    department?: string;
    doctor_id: number;
    hospital_id?: number;
    symptoms?: string;
    userLat?: number;
    userLng?: number;
  }): Promise<{ appointment_id: number; data: Appointment }> {
    const res = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to schedule appointment');
    }
    return {
      appointment_id: json.appointment_id || json.data.id,
      data: json.data
    };
  },

  async updateAppointmentStatus(id: number, status: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/appointments/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to update appointment status');
    }
    return true;
  },

  // Admin
  async loginAdmin(username: string, password: string): Promise<{ token: string; user: { id: number; username: string } }> {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Invalid username or password');
    }
    return { token: json.token, user: json.user };
  },

  async getAdminStats(): Promise<AdminStats> {
    const res = await fetch(`${API_BASE}/admin/stats`);
    const json = await res.json();
    return json.success ? json.data : { totalPatients: 0, totalDoctors: 0, totalHospitals: 0, totalAppointments: 0, pendingAppointments: 0 };
  },

  async getHealth(): Promise<{ status: string; databaseEngine: string }> {
    const res = await fetch(`${API_BASE}/health`);
    return await res.json();
  }
};
