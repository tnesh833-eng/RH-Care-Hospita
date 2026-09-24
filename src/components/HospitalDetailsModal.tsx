import React, { useState } from 'react';
import { Hospital, Doctor, HospitalFeedback } from '../types.ts';
import { X, Star, Phone, MapPin, Building2, Bed, HeartPulse, ShieldCheck, Stethoscope, User, MessageSquare, Send, CheckCircle2, Navigation, Clock, Award, ChevronRight } from 'lucide-react';
import { api } from '../services/api.ts';

interface HospitalDetailsModalProps {
  hospital: Hospital;
  doctors: Doctor[];
  userLocation: { lat: number; lng: number } | null;
  onClose: () => void;
  onBookWithDoctor: (hospital: Hospital, doctor: Doctor) => void;
  onBookAtHospital: (hospital: Hospital) => void;
}

export const HospitalDetailsModal: React.FC<HospitalDetailsModalProps> = ({
  hospital,
  doctors,
  userLocation,
  onClose,
  onBookWithDoctor,
  onBookAtHospital
}) => {
  const [activeTab, setActiveTab] = useState<'doctors' | 'feedback' | 'facilities'>('doctors');
  
  // Feedback form state
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackAuthor, setFeedbackAuthor] = useState('');
  const [feedbackTreatment, setFeedbackTreatment] = useState('');
  const [feedbackDoctor, setFeedbackDoctor] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbacks, setFeedbacks] = useState<HospitalFeedback[]>(hospital.feedbacks || []);

  const hospitalDoctors = doctors.filter(d => d.hospital_id === hospital.id);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackAuthor.trim() || !feedbackComment.trim()) return;

    setIsSubmittingFeedback(true);
    try {
      const newFb = await api.addHospitalFeedback(hospital.id, {
        patient_name: feedbackAuthor.trim(),
        treatment: feedbackTreatment.trim() || 'Outpatient Consultation',
        doctor_name: feedbackDoctor.trim() || 'Attending Physician',
        rating: feedbackRating,
        comment: feedbackComment.trim()
      });

      setFeedbacks(prev => [newFb, ...prev]);
      setFeedbackSuccess(true);
      setFeedbackAuthor('');
      setFeedbackTreatment('');
      setFeedbackDoctor('');
      setFeedbackComment('');
      setTimeout(() => {
        setFeedbackSuccess(false);
        setShowFeedbackForm(false);
      }, 2000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200">
        
        {/* Header Hero Banner */}
        <div className="relative bg-slate-900 text-white p-6 sm:p-8 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pr-12">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-bold tracking-wide">
                  {hospital.trauma_level}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                  24/7 Red-Alert Emergency
                </span>
                {hospital.distance_km !== undefined && (
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[11px] font-bold">
                    📍 {hospital.distance_km} km away {hospital.travel_time_mins ? `(~${hospital.travel_time_mins} mins)` : ''}
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {hospital.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                {hospital.tagline}
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 border border-amber-400/40 rounded-xl text-amber-300 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{hospital.rating}</span>
                <span className="text-xs text-amber-200/80">({feedbacks.length} reviews)</span>
              </div>
            </div>
          </div>

          {/* Quick Contact & Address Bar */}
          <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{hospital.address}</span>
            </div>

            <div className="flex items-center gap-4">
              <a
                href={`tel:${hospital.emergency_hotline.replace(/\s+/g, '')}`}
                className="flex items-center gap-1 text-rose-300 font-bold hover:underline"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Emergency: {hospital.emergency_hotline}</span>
              </a>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sky-300 hover:text-white font-semibold underline"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Get Directions</span>
              </a>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('doctors')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'doctors'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Doctor Specifications ({hospitalDoctors.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('feedback')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'feedback'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Patient Feedback ({feedbacks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('facilities')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'facilities'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Infrastructure & Facilities</span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onBookAtHospital(hospital);
            }}
            className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
          >
            Direct Register Here
          </button>
        </div>

        {/* Scrollable Tab Content Area */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800 space-y-6">
          
          {/* TAB 1: DOCTOR SPECIFICATIONS */}
          {activeTab === 'doctors' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Senior Consultants & Attending Specialists
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verified clinical specialists practicing at {hospital.name}.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hospitalDoctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-sky-300 hover:shadow-sm transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start gap-3">
                        <img
                          src={doc.image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80'}
                          alt={doc.doctor_name}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
                              {doc.department_name}
                            </span>
                            <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-600">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {doc.rating}
                            </span>
                          </div>
                          <h4 className="text-sm font-black text-slate-900 leading-tight mt-0.5">
                            {doc.doctor_name}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                            {doc.degrees}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 bg-slate-50 p-2.5 rounded-xl text-xs space-y-1">
                        <div className="font-bold text-slate-800">
                          {doc.specialization}
                        </div>
                        {doc.sub_specialties && doc.sub_specialties.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {doc.sub_specialties.map((sub, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] bg-white border border-slate-200 text-slate-700 font-medium">
                                {sub}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between">
                          <span>🕒 {doc.opd_timings}</span>
                          <span className="font-bold text-slate-700">₹{doc.consultation_fee}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {doc.room_number}
                      </span>
                      <button
                        onClick={() => {
                          onClose();
                          onBookWithDoctor(hospital, doc);
                        }}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span>Book Specialist</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: PATIENT FEEDBACK */}
          {activeTab === 'feedback' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Verified Patient Experiences & Testimonials
                  </h3>
                  <p className="text-xs text-slate-500">
                    Real feedback from patients treated at {hospital.name}.
                  </p>
                </div>

                <button
                  onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  {showFeedbackForm ? 'Cancel Review' : '+ Share Your Feedback'}
                </button>
              </div>

              {/* Feedback Submission Form */}
              {showFeedbackForm && (
                <form onSubmit={handleFeedbackSubmit} className="bg-sky-50/70 p-5 rounded-2xl border border-sky-200 space-y-4">
                  <h4 className="text-sm font-bold text-sky-950">
                    Submit Feedback for {hospital.name}
                  </h4>

                  {feedbackSuccess && (
                    <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Thank you! Your feedback has been published.</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={feedbackAuthor}
                        onChange={(e) => setFeedbackAuthor(e.target.value)}
                        placeholder="e.g. Ramesh Patel"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                        Treatment Received
                      </label>
                      <input
                        type="text"
                        value={feedbackTreatment}
                        onChange={(e) => setFeedbackTreatment(e.target.value)}
                        placeholder="e.g. Cardiology Angioplasty / Knee Surgery"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                        Attending Doctor
                      </label>
                      <input
                        type="text"
                        value={feedbackDoctor}
                        onChange={(e) => setFeedbackDoctor(e.target.value)}
                        placeholder="e.g. Dr. R. Rajeshwar"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                        Star Rating (1 - 5)
                      </label>
                      <select
                        value={feedbackRating}
                        onChange={(e) => setFeedbackRating(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-bold text-amber-800"
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5 - Exceptional)</option>
                        <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                        <option value={3}>⭐⭐⭐ (3 - Average)</option>
                        <option value={2}>⭐⭐ (2 - Needs Improvement)</option>
                        <option value={1}>⭐ (1 - Dissatisfied)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                      Your Comments & Review *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="Describe your care experience, doctor attention, nursing response, and facility comfort..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingFeedback}
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingFeedback ? 'Submitting...' : 'Post Review'}</span>
                  </button>
                </form>
              )}

              {/* Feedbacks List */}
              <div className="space-y-3">
                {feedbacks.map((fb) => (
                  <div key={fb.id} className="p-4 rounded-2xl border border-slate-200 bg-white">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">{fb.patient_name}</span>
                          {fb.verified && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              Verified Patient
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Treatment: <span className="font-semibold text-slate-700">{fb.treatment}</span> &nbsp;•&nbsp; Doctor: <span className="font-semibold text-sky-700">{fb.doctor_name}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-amber-900 text-xs font-bold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{fb.rating}.0</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                      "{fb.comment}"
                    </p>

                    <div className="text-[11px] text-slate-400 mt-2 text-right">
                      Reviewed on {fb.review_date}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: FACILITIES */}
          {activeTab === 'facilities' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Campus Facilities & Diagnostic Infrastructure
                </h3>
                <p className="text-xs text-slate-500">
                  State-of-the-art medical technology available at {hospital.name}.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {hospital.facilities.map((fac, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs font-bold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{fac}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Recognized Accreditations & Quality Standards
                </h4>
                <div className="flex flex-wrap gap-2">
                  {hospital.accreditations.map((acc, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{acc}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
