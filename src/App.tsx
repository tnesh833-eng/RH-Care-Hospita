import React, { useState, useEffect } from 'react';
import { api } from './services/api.ts';
import { Doctor, Appointment, Hospital } from './types.ts';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { HospitalNetworkMap } from './components/HospitalNetworkMap.tsx';
import { HospitalDetailsModal } from './components/HospitalDetailsModal.tsx';
import { DepartmentsSection } from './components/DepartmentsSection.tsx';
import { DoctorsSection } from './components/DoctorsSection.tsx';
import { PatientForm } from './components/PatientForm.tsx';
import { AppointmentDirectory } from './components/AppointmentDirectory.tsx';
import { AdminLogin } from './components/AdminLogin.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { Footer } from './components/Footer.tsx';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | undefined>(undefined);
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | undefined>(undefined);

  // Global state
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState<boolean>(false);

  // Modals & Detail inspectors
  const [selectedHospitalForModal, setSelectedHospitalForModal] = useState<Hospital | null>(null);

  // Geolocation state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Admin authentication state
  const [adminUser, setAdminUser] = useState<{ id: number; username: string } | null>(() => {
    try {
      const stored = localStorage.getItem('hms_admin_user');
      const token = localStorage.getItem('hms_admin_token');
      if (stored && token) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading admin session:', e);
    }
    return null;
  });

  // Fetch initial data
  const refreshAllData = async () => {
    try {
      const [hosps, docs] = await Promise.all([
        api.getHospitals(),
        api.getDoctors()
      ]);
      setHospitals(hosps);
      setDoctors(docs);
    } catch (err) {
      console.error('Error fetching initial catalogs:', err);
    }
  };

  const refreshAppointments = async () => {
    setIsLoadingAppointments(true);
    try {
      const appts = await api.getAppointments();
      setAppointments(appts);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  useEffect(() => {
    refreshAllData();
    refreshAppointments();
  }, []);

  // Detect GPS location
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setIsDetectingLocation(false);

        // Fetch hospitals sorted with distance
        try {
          const sorted = await api.getHospitals(coords.lat, coords.lng);
          setHospitals(sorted);
        } catch (e) {
          console.error('Failed to sort hospitals by distance:', e);
        }
      },
      (err) => {
        console.warn('Geolocation failed or denied:', err);
        setIsDetectingLocation(false);
        // Fallback to central city coordinates
        const fallback = { lat: 12.9719, lng: 77.6412 };
        setUserLocation(fallback);
        api.getHospitals(fallback.lat, fallback.lng).then(setHospitals);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Hospital selection for booking
  const handleSelectHospitalForBooking = (hospital: Hospital) => {
    setSelectedHospitalId(hospital.id);
    setSelectedDepartment('');
    setSelectedDoctorId(undefined);
    setCurrentTab('register');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Direct Doctor selection
  const handleSelectDoctor = (doc: Doctor) => {
    setSelectedDepartment(doc.department_name || '');
    setSelectedDoctorId(doc.id);
    setSelectedHospitalId(doc.hospital_id);
    setCurrentTab('register');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Department click on Home page
  const handleSelectDepartment = (deptName: string) => {
    setSelectedDepartment(deptName);
    setSelectedDoctorId(undefined);
    setCurrentTab('register');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Appointment booked callback
  const handleAppointmentBooked = (newApt: Appointment) => {
    setAppointments((prev) => [newApt, ...prev]);
  };

  // Admin Login & Logout
  const handleLoginSuccess = (admin: { id: number; username: string }) => {
    setAdminUser(admin);
    setCurrentTab('admin-dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('hms_admin_token');
    localStorage.removeItem('hms_admin_user');
    setAdminUser(null);
    setCurrentTab('home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
      
      {/* Navigation Bar (RH Care Hospital brand) */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isAdminLoggedIn={!!adminUser}
        onLogout={handleAdminLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <>
            <Hero
              onBookClick={() => {
                setCurrentTab('register');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onExploreHospitals={() => {
                setCurrentTab('hospitals');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onExploreSpecialties={() => {
                const el = document.getElementById('departments-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Google Maps Network Locator Preview on Home */}
            <HospitalNetworkMap
              hospitals={hospitals}
              userLocation={userLocation}
              onDetectLocation={handleDetectLocation}
              isDetectingLocation={isDetectingLocation}
              onSelectHospitalForBooking={handleSelectHospitalForBooking}
              onOpenHospitalDetails={(h) => setSelectedHospitalForModal(h)}
            />

            <DepartmentsSection onSelectDepartment={handleSelectDepartment} />

            <DoctorsSection
              doctors={doctors}
              onSelectDoctor={handleSelectDoctor}
            />
          </>
        )}

        {currentTab === 'hospitals' && (
          <div className="py-6">
            <HospitalNetworkMap
              hospitals={hospitals}
              userLocation={userLocation}
              onDetectLocation={handleDetectLocation}
              isDetectingLocation={isDetectingLocation}
              onSelectHospitalForBooking={handleSelectHospitalForBooking}
              onOpenHospitalDetails={(h) => setSelectedHospitalForModal(h)}
            />
          </div>
        )}

        {currentTab === 'register' && (
          <PatientForm
            initialDepartment={selectedDepartment}
            initialDoctorId={selectedDoctorId}
            initialHospitalId={selectedHospitalId}
            onAppointmentBooked={handleAppointmentBooked}
            onViewAppointments={() => {
              setCurrentTab('appointments');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenHospitalDetails={(h) => setSelectedHospitalForModal(h)}
          />
        )}

        {currentTab === 'appointments' && (
          <AppointmentDirectory
            appointments={appointments}
            isLoading={isLoadingAppointments}
            onRefresh={refreshAppointments}
            onNewBookingClick={() => {
              setSelectedDepartment('');
              setSelectedDoctorId(undefined);
              setSelectedHospitalId(undefined);
              setCurrentTab('register');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'admin-login' && (
          <AdminLogin
            onLoginSuccess={handleLoginSuccess}
            onCancel={() => setCurrentTab('home')}
          />
        )}

        {currentTab === 'admin-dashboard' && (
          <AdminDashboard
            adminUser={adminUser || { id: 1, username: 'admin' }}
            onLogout={handleAdminLogout}
          />
        )}
      </main>

      {/* Hospital Details & Feedback Inspector Modal */}
      {selectedHospitalForModal && (
        <HospitalDetailsModal
          hospital={selectedHospitalForModal}
          doctors={doctors}
          userLocation={userLocation}
          onClose={() => setSelectedHospitalForModal(null)}
          onBookWithDoctor={(hosp, doc) => {
            setSelectedHospitalForModal(null);
            handleSelectDoctor(doc);
          }}
          onBookAtHospital={(hosp) => {
            setSelectedHospitalForModal(null);
            handleSelectHospitalForBooking(hosp);
          }}
        />
      )}

      {/* Footer */}
      <Footer onNavClick={(tab) => {
        setCurrentTab(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} />

    </div>
  );
}
