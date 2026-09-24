import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { dbService } from './server/db.ts';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -----------------------------------------------------
// Health Check Endpoint
// -----------------------------------------------------
app.get('/api/health', async (req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    databaseEngine: dbService.isUsingMySQL ? 'MySQL' : 'Persistent File Engine',
    timestamp: new Date().toISOString()
  });
});

// -----------------------------------------------------
// 1. Hospitals API
// -----------------------------------------------------
// GET /api/hospitals (supports ?lat=...&lng=... for automatic proximity sorting)
app.get('/api/hospitals', async (req: Request, res: Response) => {
  try {
    const lat = req.query.lat ? Number(req.query.lat) : undefined;
    const lng = req.query.lng ? Number(req.query.lng) : undefined;
    const hospitals = await dbService.getHospitals(lat, lng);
    res.status(200).json({ success: true, count: hospitals.length, data: hospitals });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching hospitals', error: error.message });
  }
});

// GET /api/hospitals/:id (returns hospital profile with feedback and doctors)
app.get('/api/hospitals/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const lat = req.query.lat ? Number(req.query.lat) : undefined;
    const lng = req.query.lng ? Number(req.query.lng) : undefined;

    const hospital = await dbService.getHospitalById(id, lat, lng);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }
    res.status(200).json({ success: true, data: hospital });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching hospital details', error: error.message });
  }
});

// POST /api/hospitals/:id/feedbacks (Submit patient review for hospital)
app.post('/api/hospitals/:id/feedbacks', async (req: Request, res: Response) => {
  try {
    const hospitalId = Number(req.params.id);
    const { patient_name, treatment, doctor_name, rating, comment } = req.body;

    if (!patient_name || !comment || !rating) {
      return res.status(400).json({ success: false, message: 'Patient name, comment, and rating are required.' });
    }

    const newFeedback = await dbService.addHospitalFeedback(hospitalId, {
      hospital_id: hospitalId,
      patient_name: String(patient_name).trim(),
      treatment: String(treatment || 'General Consultation').trim(),
      doctor_name: String(doctor_name || 'Medical Specialist').trim(),
      rating: Math.min(5, Math.max(1, Number(rating))),
      review_date: new Date().toISOString().split('T')[0],
      verified: true,
      comment: String(comment).trim()
    });

    res.status(201).json({ success: true, message: 'Thank you! Your feedback has been registered.', data: newFeedback });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error submitting hospital feedback', error: error.message });
  }
});

// POST /api/scan-nearby-hospitals (Auto-scans nearby hospitals given address or coordinates)
app.post('/api/scan-nearby-hospitals', async (req: Request, res: Response) => {
  try {
    const { address, lat, lng } = req.body;
    const result = await dbService.scanNearbyHospitals({
      address: address ? String(address) : undefined,
      lat: lat !== undefined ? Number(lat) : undefined,
      lng: lng !== undefined ? Number(lng) : undefined
    });
    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error scanning nearby hospitals', error: error.message });
  }
});

// -----------------------------------------------------
// 2. Departments API
// -----------------------------------------------------
app.get('/api/departments', async (req: Request, res: Response) => {
  try {
    const departments = await dbService.getDepartments();
    res.status(200).json({ success: true, count: departments.length, data: departments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching departments', error: error.message });
  }
});

// -----------------------------------------------------
// 3. Doctor APIs
// -----------------------------------------------------
app.get('/api/doctors', async (req: Request, res: Response) => {
  try {
    const department = req.query.department ? String(req.query.department) : undefined;
    const hospital_id = req.query.hospital_id ? Number(req.query.hospital_id) : undefined;
    const doctors = await dbService.getDoctors(department, hospital_id);
    res.status(200).json({ success: true, count: doctors.length, data: doctors });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching doctors', error: error.message });
  }
});

app.get('/api/doctors/department/:department', async (req: Request, res: Response) => {
  try {
    const { department } = req.params;
    const doctors = await dbService.getDoctors(department);
    res.status(200).json({ success: true, count: doctors.length, data: doctors });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching doctors by department', error: error.message });
  }
});

app.get('/api/doctors/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const doctor = await dbService.getDoctorById(id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.status(200).json({ success: true, data: doctor });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching doctor', error: error.message });
  }
});

app.post('/api/doctors', async (req: Request, res: Response) => {
  try {
    const { doctor_name, degrees, department_id, department_name, hospital_id, specialization, experience_years, opd_timings, room_number, consultation_fee, languages, bio } = req.body;
    if (!doctor_name || !department_id || !specialization) {
      return res.status(400).json({ success: false, message: 'Doctor name, department ID, and specialization are required.' });
    }

    const newDoctor = await dbService.addDoctor({
      doctor_name: String(doctor_name).trim(),
      degrees: degrees || 'MBBS, MD',
      department_id: Number(department_id),
      department_name: department_name || 'General Medicine',
      hospital_id: Number(hospital_id) || 1,
      specialization: String(specialization).trim(),
      sub_specialties: [],
      experience_years: Number(experience_years) || 10,
      opd_timings: opd_timings || '09:00 AM - 01:00 PM',
      room_number: room_number || 'Room 101',
      consultation_fee: Number(consultation_fee) || 800,
      languages: languages || ['English', 'Hindi'],
      rating: 4.9,
      total_patients: 1000,
      bio: bio || 'Experienced clinical specialist committed to evidence-based healthcare.'
    });

    res.status(201).json({ success: true, message: 'Doctor profile registered successfully', data: newDoctor });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error creating doctor', error: error.message });
  }
});

// -----------------------------------------------------
// 4. Appointments API (Includes Automatic Proximity Routing)
// -----------------------------------------------------
app.get('/api/appointments', async (req: Request, res: Response) => {
  try {
    const appointments = await dbService.getAppointments();
    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching appointments', error: error.message });
  }
});

app.get('/api/appointments/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const appointment = await dbService.getAppointmentById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    res.status(200).json({ success: true, data: appointment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching appointment', error: error.message });
  }
});

app.post('/api/appointments', async (req: Request, res: Response) => {
  try {
    const { name, phone, age, gender, date, address, department, doctor_id, hospital_id, symptoms, userLat, userLng } = req.body;

    if (!name || !date || !address || !doctor_id) {
      return res.status(400).json({
        success: false,
        message: 'Patient name, appointment date, address, and doctor selection are required.'
      });
    }

    const { appointment_id, appointment } = await dbService.createAppointment({
      name: String(name).trim(),
      phone: phone ? String(phone).trim() : undefined,
      age: age ? Number(age) : undefined,
      gender: gender ? String(gender) : undefined,
      date: String(date),
      address: String(address).trim(),
      department: department ? String(department) : undefined,
      doctor_id: Number(doctor_id),
      hospital_id: hospital_id ? Number(hospital_id) : undefined,
      symptoms: symptoms ? String(symptoms).trim() : undefined,
      userLat: userLat !== undefined ? Number(userLat) : undefined,
      userLng: userLng !== undefined ? Number(userLng) : undefined
    });

    res.status(201).json({
      success: true,
      message: 'Appointment successfully scheduled at RH Care Hospital',
      appointment_id,
      data: appointment
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error creating appointment', error: error.message });
  }
});

app.put('/api/appointments/:id/status', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    if (!['Pending', 'Approved', 'Cancelled', 'Completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const updated = await dbService.updateAppointmentStatus(id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.status(200).json({ success: true, message: `Appointment #${id} updated to ${status}` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error updating appointment', error: error.message });
  }
});

// -----------------------------------------------------
// 5. Admin Authentication & Stats
// -----------------------------------------------------
app.post('/api/admin/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const admin = await dbService.getAdminByUsername(username);
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid administrative credentials' });
    }

    const isMatch = bcrypt.compareSync(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid administrative credentials' });
    }

    res.status(200).json({
      success: true,
      message: 'Admin authentication successful',
      user: {
        id: admin.id,
        username: admin.username
      },
      token: 'jwt-rh-care-' + Date.now()
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error during admin login', error: error.message });
  }
});

app.get('/api/admin/stats', async (req: Request, res: Response) => {
  try {
    const stats = await dbService.getStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching stats', error: error.message });
  }
});

// -----------------------------------------------------
// Setup Vite in Dev or Static File Serving in Prod
// -----------------------------------------------------
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(` RH Care Hospital Management System running at:`);
    console.log(` http://localhost:${PORT}`);
    console.log(` Database: ${dbService.isUsingMySQL ? 'MySQL' : 'Persistent Local Engine'}`);
    console.log(`=======================================================`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
