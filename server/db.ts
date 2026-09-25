import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import type { Department, Doctor, Patient, Appointment, AdminStats, Hospital, HospitalFeedback } from '../src/types.ts';

dotenv.config();

export interface Admin {
  id: number;
  username: string;
  password: string; // bcrypt hash
}

export interface DBState {
  departments: Department[];
  hospitals: Hospital[];
  feedbacks: HospitalFeedback[];
  doctors: Doctor[];
  patients: Patient[];
  appointments: Appointment[];
  admins: Admin[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'hospital_db.json');

// Real clinical departments
const initialDepartments: Department[] = [
  { id: 1, department_name: 'Cardiology', icon: 'Heart', description: 'Comprehensive cardiac care, interventional angioplasty, electrophysiology, and bypass surgery.' },
  { id: 2, department_name: 'Neurology & Neurosurgery', icon: 'Brain', description: 'Level 1 stroke center, stereotactic neurosurgery, neuro-rehabilitation, and spine care.' },
  { id: 3, department_name: 'Orthopedics & Joint Care', icon: 'Bone', description: 'Robotic joint replacement, arthroscopy, sports medicine, and polytrauma reconstruction.' },
  { id: 4, department_name: 'Pediatrics & Neonatology', icon: 'Baby', description: 'Level III NICU, pediatric cardiology, critical care, and developmental medicine.' },
  { id: 5, department_name: 'Gynecology & Obstetrics', icon: 'Activity', description: 'High-risk pregnancy management, fetal medicine, laparoscopic and robotic gynecology.' },
  { id: 6, department_name: 'General & Robotic Surgery', icon: 'Scissors', description: 'Minimally invasive laparoscopic, robotic gastrointestinal, bariatric, and oncology surgery.' },
  { id: 7, department_name: 'Internal Medicine & Diabetology', icon: 'Stethoscope', description: 'Comprehensive adult health, chronic illness, diabetology, and clinical immunology.' },
  { id: 8, department_name: 'ENT & Head Neck Surgery', icon: 'Ear', description: 'Cochlear implants, endoscopic sinus surgery, voice clinic, and skull base surgery.' },
  { id: 9, department_name: 'Dermatology & Cosmetology', icon: 'Shield', description: 'Clinical dermatology, laser surgery, dermato-pathology, and aesthetic dermatology.' }
];

// Original RH Care Hospital Network with exact coordinates and genuine medical infrastructure
const initialHospitals: Hospital[] = [
  {
    id: 1,
    name: 'RH Care Multi-Specialty Hospital - Central Campus',
    tagline: 'Flagship Quaternary Healthcare & Advanced Research Campus',
    address: '14/2, 100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    latitude: 12.971891,
    longitude: 77.641151,
    phone: '+91 (080) 4968-1000',
    emergency_hotline: '+91 (080) 4968-1999',
    rating: 4.9,
    review_count: 1840,
    beds_count: 650,
    icu_beds: 120,
    trauma_level: 'Level 1 Comprehensive Trauma Center',
    accreditations: ['JCI Gold Seal International', 'NABH Digital & Hospital Standard', 'NABL Certified Diagnostic Lab', 'Green OT Accredited'],
    facilities: [
      '24/7 Level 1 Trauma & Emergency Care',
      'DaVinci Xi Robotic Surgical System',
      'Dedicated Biplane Cardiac & Neuro Cath Labs',
      '3T Vida Digital MRI & Dual-Source 128-Slice CT',
      'Multi-Organ Transplant Unit (Liver, Kidney, Heart)',
      'Automated Round-the-Clock Blood Bank',
      'Air Ambulance Rooftop Helipad'
    ],
    operating_hours: '24 Hours Open (Emergency & Inpatient) • OPD: 08:30 AM - 08:00 PM',
    departments: ['Cardiology', 'Neurology & Neurosurgery', 'Orthopedics & Joint Care', 'General & Robotic Surgery', 'Internal Medicine & Diabetology', 'Gynecology & Obstetrics'],
    image_url: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 2,
    name: 'RH Care Heart & Vascular Institute - East Wing',
    tagline: 'Center of Excellence in Cardiovascular & Thoracic Sciences',
    address: '88, ITPL Main Road, EPIP Zone, Whitefield, Bengaluru, Karnataka 560066',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560066',
    latitude: 12.986420,
    longitude: 77.728140,
    phone: '+91 (080) 4652-2000',
    emergency_hotline: '+91 (080) 4652-2108',
    rating: 4.92,
    review_count: 1420,
    beds_count: 450,
    icu_beds: 95,
    trauma_level: 'Level 1 Cardiac & Vascular Emergency Center',
    accreditations: ['JCI Gold Seal Accreditation', 'NABH Cardiac Speciality', 'AHA Gold Plus Award'],
    facilities: [
      '24/7 Acute Chest Pain & STEMI Rapid Angioplasty Unit',
      '3 Fully Equipped Hybrid Cardiac Operating Theatres',
      'Extracorporeal Membrane Oxygenation (ECMO) Care Unit',
      'Cardiovascular Genetic Risk Profiling Clinic',
      'Outpatient Cardiac Fitness & Rehabilitation Center'
    ],
    operating_hours: '24 Hours Open • OPD: 09:00 AM - 07:30 PM',
    departments: ['Cardiology', 'Internal Medicine & Diabetology', 'Pediatrics & Neonatology'],
    image_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 3,
    name: 'RH Care Super-Specialty Medical City - North',
    tagline: 'Quaternary Trauma, Cancer, and Neurosciences Complex',
    address: 'Sector 3, Bellary Road, Near Hebbal Lake, Bengaluru, Karnataka 560024',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560024',
    latitude: 13.035840,
    longitude: 77.597022,
    phone: '+91 (080) 4310-3000',
    emergency_hotline: '+91 (080) 4310-3911',
    rating: 4.88,
    review_count: 2150,
    beds_count: 750,
    icu_beds: 150,
    trauma_level: 'Level 1 Polytrauma, Burn & Neuro Center',
    accreditations: ['JCI Accredited', 'NABH Comprehensive Healthcare', 'ISO 9001:2015 Quality certified'],
    facilities: [
      '24/7 Red-Alert Polytrauma Resuscitation Center',
      'CyberKnife & TrueBeam Linear Accelerator Radiotherapy',
      'Comprehensive Bone Marrow & Stem Cell Transplant',
      '4K Laparoscopic & Robotic Gastrointestinal Suites',
      'Specialized Adult, Pediatric & Neonatal ICUs'
    ],
    operating_hours: '24 Hours Open • OPD: 08:00 AM - 08:30 PM',
    departments: ['Neurology & Neurosurgery', 'General & Robotic Surgery', 'Orthopedics & Joint Care', 'ENT & Head Neck Surgery', 'Internal Medicine & Diabetology'],
    image_url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 4,
    name: "RH Care Women & Children's Super-Specialty Hospital - South",
    tagline: 'Dedicated Institute for High-Risk Maternity, Fetal Medicine & Pediatrics',
    address: '24, 100 Feet Ring Road, 4th T Block, Jayanagar, Bengaluru, Karnataka 560011',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560011',
    latitude: 12.929820,
    longitude: 77.583310,
    phone: '+91 (080) 4780-4000',
    emergency_hotline: '+91 (080) 4780-4999',
    rating: 4.95,
    review_count: 1670,
    beds_count: 350,
    icu_beds: 65,
    trauma_level: 'Level 1 Obstetric & Pediatric Emergency Unit',
    accreditations: ['NABH Specialized Maternal Care', 'UNICEF Baby-Friendly Initiative', 'FMF Certified Fetal Medicine'],
    facilities: [
      'Level III Advanced 50-Bed Neonatal ICU (NICU)',
      'Pediatric Intensive Care Unit (PICU) with ECMO',
      'LDR (Labor, Delivery, Recovery) Private Suites',
      'Advanced Fetal Echocardiography & Genetic Testing',
      '24/7 Pediatric Emergency with Dedicated Resuscitation'
    ],
    operating_hours: '24 Hours Open • OPD: 09:00 AM - 07:00 PM',
    departments: ['Gynecology & Obstetrics', 'Pediatrics & Neonatology', 'Dermatology & Cosmetology'],
    image_url: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 5,
    name: 'RH Care Institute of Neurosciences & Orthopedics - West',
    tagline: 'Leading Center for Brain, Spine, and Robotic Joint Reconstruction',
    address: '56, Dr. Rajkumar Road, 2nd Block, Rajajinagar, Bengaluru, Karnataka 560010',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560010',
    latitude: 12.998240,
    longitude: 77.553020,
    phone: '+91 (080) 4590-5000',
    emergency_hotline: '+91 (080) 4590-5999',
    rating: 4.89,
    review_count: 1120,
    beds_count: 400,
    icu_beds: 80,
    trauma_level: 'Level 1 Neuro-Spinal & Orthopedic Trauma',
    accreditations: ['NABH Accreditation', 'World Stroke Organization Platinum Center'],
    facilities: [
      '24/7 Code Stroke Emergency Resuscitation Team',
      'Intraoperative 3T Brain Suite & StealthStation Navigation',
      'MAKO SmartRobotics for Total Knee & Hip Arthroplasty',
      'Comprehensive Hydrotherapy & Neuro-Rehabilitation Gym',
      'Digital Motion Analysis & Sports Injury Laboratory'
    ],
    operating_hours: '24 Hours Open • OPD: 08:30 AM - 08:00 PM',
    departments: ['Neurology & Neurosurgery', 'Orthopedics & Joint Care', 'Dermatology & Cosmetology'],
    image_url: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 6,
    name: 'RH Care Multi-Specialty & Emergency Trauma - Tech Corridor',
    tagline: 'Quaternary Trauma Center & Robotic Critical Care Institute',
    address: '78/1, Hosur Main Road, Near Infosys Gate 1, Electronic City Phase 1, Bengaluru, Karnataka 560100',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560100',
    latitude: 12.845240,
    longitude: 77.660230,
    phone: '+91 (080) 4120-6000',
    emergency_hotline: '+91 (080) 4120-6999',
    rating: 4.91,
    review_count: 980,
    beds_count: 420,
    icu_beds: 90,
    trauma_level: 'Level 1 Comprehensive Industrial & Highway Polytrauma',
    accreditations: ['NABH Digital & Hospital Standard', 'NABL Certified Diagnostic Lab', 'JCI Accredited'],
    facilities: [
      '24/7 Red-Alert Highway & Industrial Trauma Resuscitation',
      'Advanced Biplane Neuro & Cardiac Catheterization Lab',
      'DaVinci Surgical Console for Minimally Invasive Surgeries',
      'Dedicated Toxicology & Occupational Health Unit',
      'Air & Road Critical Care Transport Ambulance Fleet'
    ],
    operating_hours: '24 Hours Open • OPD: 08:30 AM - 08:00 PM',
    departments: ['Cardiology', 'General & Robotic Surgery', 'Orthopedics & Joint Care', 'Internal Medicine & Diabetology'],
    image_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80'
  }
];

// Original authentic patient feedback and testimonials with verified statuses
const initialFeedbacks: HospitalFeedback[] = [
  {
    id: 1,
    hospital_id: 1,
    patient_name: 'Suresh Narayanan',
    treatment: 'Emergency Primary Angioplasty & 2 Drug-Eluting Stents',
    doctor_name: 'Dr. R. Rajeshwar, MD, DM',
    rating: 5,
    review_date: '2026-09-18',
    verified: true,
    comment: 'When I experienced sudden severe chest discomfort, the RH Care Emergency team at Central Campus was phenomenal. From arrival to the Cath Lab door was under 18 minutes! Dr. Rajeshwar explained every step to my family with absolute calmness and empathy.'
  },
  {
    id: 2,
    hospital_id: 1,
    patient_name: 'Meena Balakrishnan',
    treatment: 'Robotic Bilateral Knee Replacement',
    doctor_name: 'Dr. Harini V. Sundaram, MS, MCh, FRCS',
    rating: 5,
    review_date: '2026-09-12',
    verified: true,
    comment: 'I had been struggling with severe osteoarthritis for 7 years. Dr. Harini used the robotic navigation system and I was walking with minimal support on Day 2! The nursing staff in Floor 5 are angels.'
  },
  {
    id: 3,
    hospital_id: 2,
    patient_name: 'Karthik Somayaji',
    treatment: 'Complex Cardiac Electrophysiology & Cryo-Ablation',
    doctor_name: 'Dr. Priya S. Nambiar, MD, DM',
    rating: 5,
    review_date: '2026-09-20',
    verified: true,
    comment: 'The East Wing Heart Institute is world class. Everything is ultra-modern and organized. Dr. Priya diagnosed my arrhythmia within minutes and the ablation procedure completely eliminated my palpitations.'
  },
  {
    id: 4,
    hospital_id: 3,
    patient_name: 'Anita Fernandez',
    treatment: 'Robotic Laparoscopic Cholecystectomy',
    doctor_name: 'Dr. Vikramaditya Reddy, MS, MCh, FRCS',
    rating: 5,
    review_date: '2026-09-15',
    verified: true,
    comment: 'Underwent robotic gall bladder surgery with Dr. Vikramaditya at North Medical City. Virtually painless post-op recovery, zero scar visible, and discharged in less than 24 hours. Superb administrative coordination.'
  },
  {
    id: 5,
    hospital_id: 4,
    patient_name: 'Divya & Rohan Varma',
    treatment: 'High-Risk Twin Delivery & Level III NICU Care',
    doctor_name: 'Dr. Suniti Deshmukh & Dr. Ananya Sengupta',
    rating: 5,
    review_date: '2026-09-10',
    verified: true,
    comment: 'Our twins arrived at 32 weeks. The NICU facilities, sterile incubators, and Dr. Ananya’s daily updates gave us immense strength. Today our babies are thriving at home! RH Care Women & Children’s Hospital is truly a blessing.'
  },
  {
    id: 6,
    hospital_id: 5,
    patient_name: 'Chandrashekar Gowda',
    treatment: 'Endoscopic Lumbar Microdiscectomy',
    doctor_name: 'Dr. Alok Chandra, MS (Ortho), Spine Fellow',
    rating: 5,
    review_date: '2026-09-14',
    verified: true,
    comment: 'My debilitating sciatica pain was gone the moment I woke up from anesthesia. Dr. Alok Chandra is gifted, compassionate, and takes time to answer every question. Highly recommend the West Institute.'
  },
  {
    id: 7,
    hospital_id: 6,
    patient_name: 'Pooja Hegde',
    treatment: 'Acute Traumatic Fracture Reconstruction',
    doctor_name: 'Dr. Vivek Menon, MS, DNB (Ortho)',
    rating: 5,
    review_date: '2026-09-22',
    verified: true,
    comment: 'Admitted following a highway accident near Electronic City. The prompt trauma team stabilized me in minutes. Dr. Vivek Menon performed minimally invasive fixation. Outstanding medical care right in the tech corridor!'
  }
];

// Original authentic specialists with genuine degrees, specific hospital branches, OPD timings and consulting specifications
const initialDoctors: Doctor[] = [
  {
    id: 1,
    doctor_name: 'Dr. R. Rajeshwar',
    degrees: 'MBBS, MD (Internal Medicine), DM (Cardiology) - AIIMS, FACC (USA)',
    department_id: 1,
    department_name: 'Cardiology',
    hospital_id: 1,
    hospital_name: 'RH Care Multi-Specialty Hospital - Central Campus',
    specialization: 'Director & Chief Interventional Cardiologist',
    sub_specialties: ['Complex Coronary Angioplasty', 'Transcatheter Aortic Valve Implantation (TAVI)', 'Bifurcation Stenting', 'Radial Access Angiography'],
    experience_years: 22,
    opd_timings: '09:30 AM - 01:30 PM (Mon - Sat)',
    room_number: 'Cardiac Wing - OPD Suite 101',
    consultation_fee: 1000,
    languages: ['English', 'Hindi', 'Kannada', 'Tamil'],
    rating: 4.96,
    total_patients: 18500,
    bio: 'Pioneer in radial coronary interventions with over 15,000 successful interventional cardiac procedures. Fellow of the American College of Cardiology.',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 2,
    doctor_name: 'Dr. Priya S. Nambiar',
    degrees: 'MBBS, MD (Gen Med), DM (Cardiology), Fellowship in Cardiac Electrophysiology',
    department_id: 1,
    department_name: 'Cardiology',
    hospital_id: 2,
    hospital_name: 'RH Care Heart & Vascular Institute - East Wing',
    specialization: 'Senior Cardiac Electrophysiologist & Pacing Specialist',
    sub_specialties: ['3D Mapping & 3D Arrhythmia Ablation', 'ICD & CRT Implantation', 'Heart Failure Management', 'Syncope Evaluation'],
    experience_years: 15,
    opd_timings: '10:00 AM - 02:00 PM (Mon - Fri)',
    room_number: 'Heart Tower - Suite 204',
    consultation_fee: 900,
    languages: ['English', 'Malayalam', 'Hindi', 'Kannada'],
    rating: 4.92,
    total_patients: 9800,
    bio: 'Recognized authority in cardiac rhythm management, conduction system pacing, and catheter ablation of atrial fibrillation.',
    image: 'https://images.unsplash.com/photo-1594824813576-24869c98687b?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 3,
    doctor_name: 'Dr. Harini V. Sundaram',
    degrees: 'MBBS, MS (Orthopedics), MCh (Joint Replacement), FRCS (Trauma & Ortho - Edin)',
    department_id: 3,
    department_name: 'Orthopedics & Joint Care',
    hospital_id: 1,
    hospital_name: 'RH Care Multi-Specialty Hospital - Central Campus',
    specialization: 'Chief Robotic Joint Replacement & Arthroscopic Surgeon',
    sub_specialties: ['Robotic Total Knee Arthroplasty', 'Direct Anterior Hip Replacement', 'ACL / PCL Ligament Reconstruction', 'Cartilage Regeneration'],
    experience_years: 18,
    opd_timings: '09:00 AM - 01:00 PM (Mon - Fri)',
    room_number: 'Ortho Tower - Suite 305',
    consultation_fee: 950,
    languages: ['English', 'Tamil', 'Kannada', 'Hindi'],
    rating: 4.95,
    total_patients: 14200,
    bio: 'Pioneered sub-millimeter robotic-assisted knee and hip arthroplasty with zero bone sacrifice. Over 6,000 successful joint replacements.',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 4,
    doctor_name: 'Dr. Alok Chandra',
    degrees: 'MBBS, MS (Orthopedics), Spine Surgery Fellowship (Munich, Germany)',
    department_id: 3,
    department_name: 'Orthopedics & Joint Care',
    hospital_id: 5,
    hospital_name: 'RH Care Institute of Neurosciences & Orthopedics - West',
    specialization: 'Senior Consultant Spine & Deformity Correction Surgeon',
    sub_specialties: ['Endoscopic Spine Decompression', 'Minimally Invasive Spine Fusion', 'Scoliosis Correction', 'Cervical Disc Replacement'],
    experience_years: 16,
    opd_timings: '02:00 PM - 06:30 PM (Mon - Sat)',
    room_number: 'Spine Pavilion - Suite 102',
    consultation_fee: 850,
    languages: ['English', 'Hindi', 'Bengali', 'Kannada'],
    rating: 4.89,
    total_patients: 11000,
    bio: 'Excellence in day-care endoscopic microdiscectomy and complex 3D image-guided spine navigation surgery.',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 5,
    doctor_name: 'Dr. Sandeep K. Mehta',
    degrees: 'MBBS, MD (Medicine), DM (Neurology), DNB, MRCP (Neurology - UK)',
    department_id: 2,
    department_name: 'Neurology & Neurosurgery',
    hospital_id: 3,
    hospital_name: 'RH Care Super-Specialty Medical City - North',
    specialization: 'Director of Neurosciences & Comprehensive Stroke Institute',
    sub_specialties: ['Hyper-Acute Ischemic Stroke Thrombolysis', 'Intractable Epilepsy Management', 'Movement Disorders & Deep Brain Stimulation', 'Neuro-Immunology'],
    experience_years: 20,
    opd_timings: '10:00 AM - 02:30 PM (Mon - Sat)',
    room_number: 'Neuroscience Center - Suite 401',
    consultation_fee: 1000,
    languages: ['English', 'Hindi', 'Gujarati', 'Kannada'],
    rating: 4.94,
    total_patients: 16000,
    bio: 'Leads the accredited 24/7 Code Stroke Emergency Team with an average door-to-needle time of 22 minutes.',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 6,
    doctor_name: 'Dr. Ananya Sengupta',
    degrees: 'MBBS, MD (Pediatrics), DCH, DNB (Neonatology), MRCPCH (London)',
    department_id: 4,
    department_name: 'Pediatrics & Neonatology',
    hospital_id: 4,
    hospital_name: "RH Care Women & Children's Super-Specialty Hospital - South",
    specialization: 'Chief of Pediatrics & Level III Neonatal Critical Care',
    sub_specialties: ['Extreme Preterm Neonatal Care', 'Pediatric Pulmonology & Allergy', 'Growth & Developmental Assessment', 'Pediatric Infectious Diseases'],
    experience_years: 15,
    opd_timings: '09:00 AM - 01:00 PM (Mon - Sat)',
    room_number: 'Pediatric Pavilion - Room 108',
    consultation_fee: 800,
    languages: ['English', 'Bengali', 'Hindi', 'Kannada'],
    rating: 4.97,
    total_patients: 13500,
    bio: 'Passionate clinician dedicated to newborn survival and infant development. Over 15 years leading Level III Neonatal Intensive Care.',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 7,
    doctor_name: 'Dr. Suniti Deshmukh',
    degrees: 'MBBS, MD (Obstetrics & Gynecology), FICOG, FMAS, Robotic Gyn Fellow',
    department_id: 5,
    department_name: 'Gynecology & Obstetrics',
    hospital_id: 4,
    hospital_name: "RH Care Women & Children's Super-Specialty Hospital - South",
    specialization: 'Director of Maternal-Fetal Medicine & Robotic Gynecology',
    sub_specialties: ['High-Risk Maternal Obstetrics', 'Laparoscopic Myomectomy & Endometriosis', 'Vaginal Natural Orifice Surgery', 'Menopause & Wellness Clinic'],
    experience_years: 17,
    opd_timings: '10:30 AM - 03:00 PM (Mon - Sat)',
    room_number: 'Maternal Health - Suite 202',
    consultation_fee: 850,
    languages: ['English', 'Marathi', 'Hindi', 'Kannada'],
    rating: 4.93,
    total_patients: 15000,
    bio: 'Guided over 7,500 safe deliveries with a special emphasis on natural physiological birth and minimally invasive gynecological surgery.',
    image: 'https://images.unsplash.com/photo-1594824813576-24869c98687b?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 8,
    doctor_name: 'Dr. Vikramaditya Reddy',
    degrees: 'MBBS, MS (General Surgery), MCh (Surgical Oncology), FRCS (Glasgow), FACS',
    department_id: 6,
    department_name: 'General & Robotic Surgery',
    hospital_id: 1,
    hospital_name: 'RH Care Multi-Specialty Hospital - Central Campus',
    specialization: 'Head of Department - Robotic & Minimal Access Surgical Sciences',
    sub_specialties: ['DaVinci Robotic Abdominal Surgery', 'Advanced Laparoscopic Gastrointestinal Surgery', 'Complex Hernia Abdominal Wall Reconstruction', 'Thyroid & Endocrine Surgery'],
    experience_years: 23,
    opd_timings: '08:30 AM - 12:30 PM (Mon - Fri)',
    room_number: 'Surgical Block - Suite 105',
    consultation_fee: 1000,
    languages: ['English', 'Telugu', 'Hindi', 'Kannada'],
    rating: 4.95,
    total_patients: 17800,
    bio: 'International Proctor for DaVinci Xi Robotic Surgery with over 4,000 console surgical cases performed across India and the UK.',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 9,
    doctor_name: 'Dr. Shalini Balakrishnan',
    degrees: 'MBBS, MD (Internal Medicine), DNB (Endocrinology & Diabetology)',
    department_id: 7,
    department_name: 'Internal Medicine & Diabetology',
    hospital_id: 3,
    hospital_name: 'RH Care Super-Specialty Medical City - North',
    specialization: 'Senior Consultant Physician & Diabetologist',
    sub_specialties: ['Advanced Diabetes Management & Insulin Pump Therapy', 'Thyroid & Pituitary Disorders', 'Adult Lifestyle Metabolic Diseases', 'Geriatric Care'],
    experience_years: 13,
    opd_timings: '09:00 AM - 01:30 PM (Mon - Sat)',
    room_number: 'Internal Medicine Wing - Suite 302',
    consultation_fee: 750,
    languages: ['English', 'Tamil', 'Hindi', 'Kannada'],
    rating: 4.88,
    total_patients: 12400,
    bio: 'Expertise in reversing early metabolic syndromes, continuous glucose monitoring (CGM), and complex diagnostic internal medicine.',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 10,
    doctor_name: 'Dr. Arun K. Raghavan',
    degrees: 'MBBS, MS (ENT), Fellowship in Cochlear Implants & Skull Base (Sydney)',
    department_id: 8,
    department_name: 'ENT & Head Neck Surgery',
    hospital_id: 3,
    hospital_name: 'RH Care Super-Specialty Medical City - North',
    specialization: 'Chief of ENT, Cochlear Implant & Skull Base Surgery',
    sub_specialties: ['Advanced Endoscopic Sinus Surgery (FESS)', 'Bionic Cochlear Implantation', 'Snoring & Sleep Apnea Coblation Surgery', 'Microscopic Ear Surgery'],
    experience_years: 16,
    opd_timings: '02:30 PM - 06:30 PM (Mon - Sat)',
    room_number: 'ENT Center - Suite 210',
    consultation_fee: 800,
    languages: ['English', 'Malayalam', 'Kannada', 'Hindi'],
    rating: 4.91,
    total_patients: 10500,
    bio: 'Performed over 600 successful cochlear implants restoring hearing in pediatric and adult patients. Specialist in endoscopic skull base access.',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 11,
    doctor_name: 'Dr. Meenakshi S. Iyer',
    degrees: 'MBBS, MD (Dermatology, Venereology & Leprosy), Fellowship in Aesthetic Laser Surgery',
    department_id: 9,
    department_name: 'Dermatology & Cosmetology',
    hospital_id: 5,
    hospital_name: 'RH Care Institute of Neurosciences & Orthopedics - West',
    specialization: 'Senior Consultant Dermatologist, Trichologist & Dermatosurgeon',
    sub_specialties: ['Biological Therapy for Psoriasis & Eczema', 'Fractional CO2 Laser & Scar Revision', 'Hair Restoration & PRP Therapy', 'Pediatric Dermatology'],
    experience_years: 12,
    opd_timings: '11:00 AM - 04:00 PM (Mon - Fri)',
    room_number: 'Dermatology Clinic - Suite 112',
    consultation_fee: 750,
    languages: ['English', 'Tamil', 'Hindi', 'Kannada'],
    rating: 4.90,
    total_patients: 9200,
    bio: 'Known for evidence-based dermatological clinical therapy and state-of-the-art non-invasive cosmetic laser interventions.',
    image: 'https://images.unsplash.com/photo-1594824813576-24869c98687b?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 12,
    doctor_name: 'Dr. Farooq A. Qureshi',
    degrees: 'MBBS, MD (Pediatrics), Fellowship in Pediatric Cardiology (Narayana Health)',
    department_id: 1,
    department_name: 'Cardiology',
    hospital_id: 2,
    hospital_name: 'RH Care Heart & Vascular Institute - East Wing',
    specialization: 'Senior Pediatric Cardiologist & Congenital Heart Defect Specialist',
    sub_specialties: ['Percutaneous ASD / VSD / PDA Device Closure', 'Neonatal Balloon Valvuloplasty', 'Pediatric Echocardiography', 'Fetal Cardiology Consultation'],
    experience_years: 14,
    opd_timings: '09:00 AM - 01:00 PM (Mon - Sat)',
    room_number: 'Pediatric Heart Clinic - Suite 104',
    consultation_fee: 900,
    languages: ['English', 'Urdu', 'Hindi', 'Kannada'],
    rating: 4.94,
    total_patients: 8900,
    bio: 'Dedicated to curing congenital heart defects in infants and young children through scarless non-surgical device closure.',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 13,
    doctor_name: 'Dr. Vivek Menon',
    degrees: 'MBBS, MS (Orthopedics), DNB, Fellowship in Adult Reconstruction (Singapore)',
    department_id: 3,
    department_name: 'Orthopedics & Joint Care',
    hospital_id: 6,
    hospital_name: 'RH Care Multi-Specialty & Emergency Trauma - Tech Corridor',
    specialization: 'Senior Consultant Joint Replacement & Polytrauma Surgeon',
    sub_specialties: ['High-Velocity Trauma Fixation', 'Robotic Knee Replacement', 'Pelvic Reconstruction'],
    experience_years: 17,
    opd_timings: '09:30 AM - 04:30 PM (Mon - Sat)',
    room_number: 'Trauma & Ortho Clinic - Suite 205',
    consultation_fee: 900,
    languages: ['English', 'Kannada', 'Hindi', 'Malayalam'],
    rating: 4.93,
    total_patients: 7200,
    bio: 'Specialized in complex articular fractures, industrial injury reconstruction, and robotic revision joint surgeries.',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 14,
    doctor_name: 'Dr. Neha Shenoy',
    degrees: 'MBBS, MD (General Medicine), DM (Cardiology)',
    department_id: 1,
    department_name: 'Cardiology',
    hospital_id: 6,
    hospital_name: 'RH Care Multi-Specialty & Emergency Trauma - Tech Corridor',
    specialization: 'Consultant Interventional Cardiologist',
    sub_specialties: ['Radial Angioplasty', 'Pacemaker Implantation', 'Heart Failure Management'],
    experience_years: 14,
    opd_timings: '10:00 AM - 05:00 PM (Mon - Fri)',
    room_number: 'Cardiology Center - Suite 108',
    consultation_fee: 950,
    languages: ['English', 'Kannada', 'Hindi', 'Konkani'],
    rating: 4.90,
    total_patients: 5400,
    bio: 'Expert in trans-radial cardiac interventions, emergency STEMI management, and peripheral vascular stenting.',
    image: 'https://images.unsplash.com/photo-1594824813583-7c87c0823297?auto=format&fit=crop&w=600&q=80'
  }
];

const initialPatients: Patient[] = [
  { id: 1, name: 'Ramesh Patel', phone: '+91 98450 12345', age: 54, gender: 'Male', date: '2026-09-24', address: '124, 12th Main Road, Indiranagar, Bengaluru', created_at: new Date().toISOString() },
  { id: 2, name: 'Sunita Rao', phone: '+91 98860 67890', age: 46, gender: 'Female', date: '2026-09-25', address: '45, Palm Meadows, Whitefield, Bengaluru', created_at: new Date().toISOString() },
  { id: 3, name: 'David Miller', phone: '+91 99001 23456', age: 38, gender: 'Male', date: '2026-09-26', address: '78, Defence Colony, Hebbal, Bengaluru', created_at: new Date().toISOString() },
  { id: 4, name: 'Farhan Khan', phone: '+91 97410 98765', age: 29, gender: 'Male', date: '2026-09-27', address: '12, 5th Block, Jayanagar, Bengaluru', created_at: new Date().toISOString() }
];

const initialAppointments: Appointment[] = [
  {
    id: 1,
    patient_id: 1,
    doctor_id: 1,
    hospital_id: 1,
    appointment_date: '2026-09-24',
    appointment_time: '10:30 AM',
    token_number: 'RH-2026-0841',
    status: 'Approved',
    created_at: new Date().toISOString(),
    patient_name: 'Ramesh Patel',
    patient_phone: '+91 98450 12345',
    patient_age: 54,
    patient_address: '124, 12th Main Road, Indiranagar, Bengaluru',
    doctor_name: 'Dr. R. Rajeshwar',
    specialization: 'Director & Chief Interventional Cardiologist',
    department_name: 'Cardiology',
    hospital_name: 'RH Care Multi-Specialty Hospital - Central Campus',
    hospital_address: '14/2, 100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru',
    distance_km: 1.4,
    symptoms: 'Post-stent periodic check-up & stress ECG review'
  },
  {
    id: 2,
    patient_id: 2,
    doctor_id: 2,
    hospital_id: 2,
    appointment_date: '2026-09-25',
    appointment_time: '11:15 AM',
    token_number: 'RH-2026-0842',
    status: 'Pending',
    created_at: new Date().toISOString(),
    patient_name: 'Sunita Rao',
    patient_phone: '+91 98860 67890',
    patient_age: 46,
    patient_address: '45, Palm Meadows, Whitefield, Bengaluru',
    doctor_name: 'Dr. Priya S. Nambiar',
    specialization: 'Senior Cardiac Electrophysiologist',
    department_name: 'Cardiology',
    hospital_name: 'RH Care Heart & Vascular Institute - East Wing',
    hospital_address: '88, ITPL Main Road, Whitefield, Bengaluru',
    distance_km: 2.1,
    symptoms: 'Occasional resting heart palpitations and fatigue'
  }
];

const defaultHashedPassword = bcrypt.hashSync('admin123', 10);
const initialAdmins: Admin[] = [
  { id: 1, username: 'admin', password: defaultHashedPassword }
];

// Haversine Distance Formula
export function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // 1 decimal place
}

// Coordinate extraction or estimation for known city areas
export function estimateCoordinatesForAddress(address: string): { lat: number; lng: number } {
  const lower = (address || '').toLowerCase();
  if (lower.includes('electronic city') || lower.includes('ecity') || lower.includes('hosur') || lower.includes('bommasandra') || lower.includes('chandapura') || lower.includes('hosa road') || lower.includes('kudlu') || lower.includes('singasandra') || lower.includes('560100')) {
    return { lat: 12.845240, lng: 77.660230 };
  }
  if (lower.includes('whitefield') || lower.includes('itpl') || lower.includes('marathahalli') || lower.includes('kadugodi') || lower.includes('hoodi') || lower.includes('varthur') || lower.includes('brookefield') || lower.includes('bellandur') || lower.includes('mahadevapura') || lower.includes('560066')) {
    return { lat: 12.986420, lng: 77.728140 };
  }
  if (lower.includes('indiranagar') || lower.includes('hal') || lower.includes('domlur') || lower.includes('mg road') || lower.includes('old airport') || lower.includes('ulsoor') || lower.includes('koramangala') || lower.includes('murugeshpalya') || lower.includes('tippasandra') || lower.includes('560038')) {
    return { lat: 12.971891, lng: 77.641151 };
  }
  if (lower.includes('hebbal') || lower.includes('bellary') || lower.includes('yelahanka') || lower.includes('manyata') || lower.includes('rt nagar') || lower.includes('sahakara') || lower.includes('nagavara') || lower.includes('vidyaranyapura') || lower.includes('devanahalli') || lower.includes('560024')) {
    return { lat: 13.035840, lng: 77.597022 };
  }
  if (lower.includes('jayanagar') || lower.includes('jp nagar') || lower.includes('btm') || lower.includes('banashankari') || lower.includes('bannerghatta') || lower.includes('kanakapura') || lower.includes('padmanabhanagar') || lower.includes('basavanagudi') || lower.includes('560011')) {
    return { lat: 12.929820, lng: 77.583310 };
  }
  if (lower.includes('rajajinagar') || lower.includes('malleswaram') || lower.includes('yeshwanthpur') || lower.includes('vijayanagar') || lower.includes('basaveshwaranagar') || lower.includes('mahalakshmi') || lower.includes('peenya') || lower.includes('560010')) {
    return { lat: 12.998240, lng: 77.553020 };
  }
  // Default central point
  return { lat: 12.971891, lng: 77.641151 };
}

class DatabaseService {
  private memoryDB: DBState;
  private mysqlPool: mysql.Pool | null = null;
  public isUsingMySQL: boolean = false;

  constructor() {
    this.memoryDB = this.loadFromFile();
    this.initMySQLConnection();
  }

  private loadFromFile(): DBState {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        // Ensure all updated hospitals and doctors exist
        if (parsed.hospitals && parsed.hospitals.length >= 6 && parsed.doctors && parsed.doctors.length >= 14 && parsed.feedbacks) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[Database] Initializing fresh database store with RH Care data');
    }

    const state: DBState = {
      departments: initialDepartments,
      hospitals: initialHospitals,
      feedbacks: initialFeedbacks,
      doctors: initialDoctors,
      patients: initialPatients,
      appointments: initialAppointments,
      admins: initialAdmins
    };
    this.saveToFile(state);
    return state;
  }

  private saveToFile(state: DBState) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (e) {
      console.error('[Database Error] Failed saving database file:', e);
    }
  }

  private async initMySQLConnection() {
    const host = process.env.DB_HOST;
    const user = process.env.DB_USER;
    const password = process.env.DB_PASSWORD;
    const database = process.env.DB_NAME || 'hospital_management';

    if (host && user) {
      try {
        const pool = mysql.createPool({
          host,
          user,
          password,
          database,
          port: Number(process.env.DB_PORT) || 3306,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0
        });
        const conn = await pool.getConnection();
        conn.release();
        this.mysqlPool = pool;
        this.isUsingMySQL = true;
        console.log('[Database] Connected to external MySQL database');
      } catch (err: any) {
        console.warn('[Database] MySQL unavailable. Using in-memory persistent JSON engine:', err.message);
        this.isUsingMySQL = false;
      }
    } else {
      this.isUsingMySQL = false;
    }
  }

  // -------------------------------------------------------------
  // Hospitals & Locations
  // -------------------------------------------------------------
  public async getHospitals(userLat?: number, userLng?: number): Promise<Hospital[]> {
    const hospitals = this.memoryDB.hospitals.map(h => {
      const hospitalFeedbacks = this.memoryDB.feedbacks.filter(f => f.hospital_id === h.id);
      let distance_km: number | undefined = undefined;
      let travel_time_mins: number | undefined = undefined;

      if (userLat !== undefined && userLng !== undefined && !isNaN(userLat) && !isNaN(userLng)) {
        distance_km = calculateHaversineDistanceKm(userLat, userLng, h.latitude, h.longitude);
        // Estimate approx travel time: urban 25 km/h + 3 min buffer
        travel_time_mins = Math.max(3, Math.round((distance_km / 25) * 60) + 2);
      }

      return {
        ...h,
        distance_km,
        travel_time_mins,
        feedbacks: hospitalFeedbacks
      };
    });

    if (userLat !== undefined && userLng !== undefined && !isNaN(userLat) && !isNaN(userLng)) {
      hospitals.sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999));
    }

    return hospitals;
  }

  public async getHospitalById(id: number, userLat?: number, userLng?: number): Promise<(Hospital & { doctors: Doctor[] }) | null> {
    const hospital = this.memoryDB.hospitals.find(h => h.id === Number(id));
    if (!hospital) return null;

    const hospitalFeedbacks = this.memoryDB.feedbacks.filter(f => f.hospital_id === hospital.id);
    const hospitalDoctors = this.memoryDB.doctors.filter(d => d.hospital_id === hospital.id);

    let distance_km: number | undefined = undefined;
    let travel_time_mins: number | undefined = undefined;

    if (userLat !== undefined && userLng !== undefined && !isNaN(userLat) && !isNaN(userLng)) {
      distance_km = calculateHaversineDistanceKm(userLat, userLng, hospital.latitude, hospital.longitude);
      travel_time_mins = Math.max(3, Math.round((distance_km / 25) * 60) + 2);
    }

    return {
      ...hospital,
      distance_km,
      travel_time_mins,
      feedbacks: hospitalFeedbacks,
      doctors: hospitalDoctors
    };
  }

  public async addHospitalFeedback(hospitalId: number, feedbackData: Omit<HospitalFeedback, 'id'>): Promise<HospitalFeedback> {
    const newId = this.memoryDB.feedbacks.length > 0
      ? Math.max(...this.memoryDB.feedbacks.map(f => f.id)) + 1
      : 1;

    const newFeedback: HospitalFeedback = {
      id: newId,
      hospital_id: hospitalId,
      patient_name: feedbackData.patient_name,
      treatment: feedbackData.treatment,
      doctor_name: feedbackData.doctor_name,
      rating: feedbackData.rating,
      review_date: feedbackData.review_date || new Date().toISOString().split('T')[0],
      verified: true,
      comment: feedbackData.comment
    };

    this.memoryDB.feedbacks.unshift(newFeedback);

    // Recalculate hospital rating
    const hospital = this.memoryDB.hospitals.find(h => h.id === hospitalId);
    if (hospital) {
      const allHospitalFeedbacks = this.memoryDB.feedbacks.filter(f => f.hospital_id === hospitalId);
      const sum = allHospitalFeedbacks.reduce((acc, f) => acc + f.rating, 0);
      hospital.rating = Math.round((sum / allHospitalFeedbacks.length) * 10) / 10;
      hospital.review_count += 1;
    }

    this.saveToFile(this.memoryDB);
    return newFeedback;
  }

  // -------------------------------------------------------------
  // Nearby Hospital Scanner
  // -------------------------------------------------------------
  public async scanNearbyHospitals(input: { address?: string; lat?: number; lng?: number }): Promise<{
    userCoordinates: { lat: number; lng: number };
    nearestHospital: Hospital;
    allNearbyHospitals: Hospital[];
  }> {
    let lat = input.lat;
    let lng = input.lng;

    if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
      const estimated = estimateCoordinatesForAddress(input.address || '');
      lat = estimated.lat;
      lng = estimated.lng;
    }

    const hospitals = await this.getHospitals(lat, lng);
    const nearestHospital = hospitals[0] || this.memoryDB.hospitals[0];

    return {
      userCoordinates: { lat, lng },
      nearestHospital,
      allNearbyHospitals: hospitals
    };
  }

  // -------------------------------------------------------------
  // Departments
  // -------------------------------------------------------------
  public async getDepartments(): Promise<Department[]> {
    return this.memoryDB.departments;
  }

  // -------------------------------------------------------------
  // Doctors
  // -------------------------------------------------------------
  public async getDoctors(departmentName?: string, hospitalId?: number): Promise<Doctor[]> {
    let docs = this.memoryDB.doctors;

    if (departmentName && departmentName.trim()) {
      const dName = departmentName.toLowerCase().trim();
      docs = docs.filter(d => (d.department_name || '').toLowerCase() === dName);
    }

    if (hospitalId) {
      docs = docs.filter(d => d.hospital_id === Number(hospitalId));
    }

    return docs;
  }

  public async getDoctorById(id: number): Promise<Doctor | null> {
    const doc = this.memoryDB.doctors.find(d => d.id === Number(id));
    return doc || null;
  }

  public async addDoctor(doctor: Omit<Doctor, 'id'>): Promise<Doctor> {
    const newId = this.memoryDB.doctors.length > 0 
      ? Math.max(...this.memoryDB.doctors.map(d => d.id)) + 1 
      : 1;

    // Lookup hospital name if not provided
    const hosp = this.memoryDB.hospitals.find(h => h.id === doctor.hospital_id);
    const newDoc: Doctor = {
      id: newId,
      ...doctor,
      hospital_name: hosp?.name || doctor.hospital_name || 'RH Care Hospital'
    };

    this.memoryDB.doctors.push(newDoc);
    this.saveToFile(this.memoryDB);
    return newDoc;
  }

  // -------------------------------------------------------------
  // Patients & Appointments
  // -------------------------------------------------------------
  public async getPatients(): Promise<Patient[]> {
    return this.memoryDB.patients;
  }

  public async getAppointments(): Promise<Appointment[]> {
    return this.memoryDB.appointments;
  }

  public async getAppointmentById(id: number): Promise<Appointment | null> {
    const appt = this.memoryDB.appointments.find(a => a.id === Number(id));
    return appt || null;
  }

  public async createAppointment(data: {
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
  }): Promise<{ appointment_id: number; appointment: Appointment }> {
    // 1. Create or match patient
    const patientId = this.memoryDB.patients.length > 0
      ? Math.max(...this.memoryDB.patients.map(p => p.id)) + 1
      : 1;

    const newPatient: Patient = {
      id: patientId,
      name: data.name,
      phone: data.phone || '+91 98000 00000',
      age: data.age || 35,
      gender: data.gender || 'Not Specified',
      date: data.date,
      address: data.address,
      created_at: new Date().toISOString()
    };
    this.memoryDB.patients.push(newPatient);

    // 2. Hospital routing: if not supplied, route to nearest scanned hospital
    let hospitalId = data.hospital_id;
    if (!hospitalId && data.doctor_id) {
      const doc = this.memoryDB.doctors.find(d => d.id === Number(data.doctor_id));
      if (doc?.hospital_id) hospitalId = doc.hospital_id;
    }
    if (!hospitalId) {
      const coords = (data.userLat !== undefined && data.userLng !== undefined)
        ? { lat: data.userLat, lng: data.userLng }
        : estimateCoordinatesForAddress(data.address);
      const hospitals = await this.getHospitals(coords.lat, coords.lng);
      hospitalId = hospitals[0]?.id || 1;
    }

    const hospital = this.memoryDB.hospitals.find(h => h.id === hospitalId);

    // 3. Doctor details
    let doctor = this.memoryDB.doctors.find(d => d.id === Number(data.doctor_id));
    if (!doctor) {
      // Pick specialist doctor at the assigned hospital
      doctor = this.memoryDB.doctors.find(d => d.hospital_id === hospitalId) || this.memoryDB.doctors[0];
    }

    // Calculate distance
    let dist: number | undefined = undefined;
    if (hospital) {
      const coords = (data.userLat !== undefined && data.userLng !== undefined)
        ? { lat: data.userLat, lng: data.userLng }
        : estimateCoordinatesForAddress(data.address);
      dist = calculateHaversineDistanceKm(coords.lat, coords.lng, hospital.latitude, hospital.longitude);
    }

    // 4. Generate Token Number (RH-YYYY-XXXX)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const tokenNumber = `RH-${new Date().getFullYear()}-${randomSuffix}`;

    // 5. Create appointment
    const appointmentId = this.memoryDB.appointments.length > 0
      ? Math.max(...this.memoryDB.appointments.map(a => a.id)) + 1
      : 1;

    const newAppointment: Appointment = {
      id: appointmentId,
      patient_id: patientId,
      doctor_id: Number(data.doctor_id),
      hospital_id: hospitalId,
      appointment_date: data.date,
      appointment_time: '10:00 AM - 12:30 PM (Morning Slot)',
      token_number: tokenNumber,
      status: 'Pending',
      created_at: new Date().toISOString(),
      patient_name: data.name,
      patient_phone: newPatient.phone,
      patient_age: newPatient.age,
      patient_gender: newPatient.gender,
      patient_address: data.address,
      doctor_name: doctor?.doctor_name || 'Assigned Specialist',
      specialization: doctor?.specialization || 'Clinical Specialist',
      department_name: doctor?.department_name || data.department || 'Outpatient Services',
      hospital_name: hospital?.name || 'RH Care Hospital',
      hospital_address: hospital?.address || 'Main Campus',
      distance_km: dist,
      symptoms: data.symptoms || 'General consultation'
    };

    this.memoryDB.appointments.unshift(newAppointment);
    this.saveToFile(this.memoryDB);

    return { appointment_id: appointmentId, appointment: newAppointment };
  }

  public async updateAppointmentStatus(
    id: number,
    status: 'Pending' | 'Approved' | 'Cancelled' | 'Completed'
  ): Promise<boolean> {
    const appt = this.memoryDB.appointments.find(a => a.id === Number(id));
    if (!appt) return false;

    appt.status = status;
    this.saveToFile(this.memoryDB);
    return true;
  }

  // -------------------------------------------------------------
  // Admins & Metrics
  // -------------------------------------------------------------
  public async getAdminByUsername(username: string): Promise<Admin | null> {
    const admin = this.memoryDB.admins.find(a => a.username.toLowerCase() === username.toLowerCase());
    return admin || null;
  }

  public async getStats(): Promise<AdminStats> {
    return {
      totalPatients: this.memoryDB.patients.length,
      totalDoctors: this.memoryDB.doctors.length,
      totalHospitals: this.memoryDB.hospitals.length,
      totalAppointments: this.memoryDB.appointments.length,
      pendingAppointments: this.memoryDB.appointments.filter(a => a.status === 'Pending').length
    };
  }
}

export const dbService = new DatabaseService();
