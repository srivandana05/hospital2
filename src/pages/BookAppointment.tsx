import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAppointments } from '../contexts/AppointmentContext';
import { Calendar, Clock, User, Stethoscope, CheckCircle, AlertCircle } from 'lucide-react';

export default function BookAppointment() {
  const { user } = useAuth();
  const { doctors, bookAppointment, loading } = useAppointments();
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [appointmentType, setAppointmentType] = useState('consultation');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const appointmentTypes = [
    { value: 'consultation', label: 'Consultation' },
    { value: 'follow-up', label: 'Follow-up' },
    { value: 'routine', label: 'Routine Check-up' },
    { value: 'emergency', label: 'Emergency' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const doctor = doctors.find(d => d._id === selectedDoctor);
    if (!doctor || !user) {
      setError('Please select a valid doctor');
      setIsSubmitting(false);
      return;
    }

    const appointmentData = {
      doctorId: doctor._id,
      date: appointmentDate,
      time: appointmentTime,
      symptoms,
      department: doctor.department,
      appointmentType
    };

    const success = await bookAppointment(appointmentData);
    if (success) {
      setSuccess(true);
      // Reset form
      setSelectedDoctor('');
      setAppointmentDate('');
      setAppointmentTime('');
      setSymptoms('');
      setAppointmentType('consultation');
    } else {
      setError('Failed to book appointment. Please try again.');
    }
    setIsSubmitting(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center animate-fade-in">
        <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Appointment Booked!</h2>
          <p className="text-gray-600 mb-6">
            Your appointment has been successfully booked. You will receive a confirmation email shortly.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="btn-primary px-6 py-3 rounded-lg text-white font-semibold"
          >
            Book Another Appointment
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
          <Calendar className="h-8 w-8 text-blue-600 mr-3" />
          Book an Appointment
        </h1>

        {error && (
          <div className="alert-error p-4 rounded-lg mb-6 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Doctor Selection */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-4">
              Select Doctor
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctors.map((doctor) => (
                <div
                  key={doctor._id}
                  className={`doctor-card cursor-pointer ${
                    selectedDoctor === doctor._id ? 'selected' : ''
                  }`}
                  onClick={() => setSelectedDoctor(doctor._id)}
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-800">{doctor.name}</h3>
                      <p className="text-sm text-gray-600">{doctor.specialty}</p>
                      <p className="text-sm text-blue-600">{doctor.department}</p>
                      <p className="text-xs text-gray-500">{doctor.experience} experience</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Appointment Type */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-4">
              Appointment Type
            </label>
            <select
              value={appointmentType}
              onChange={(e) => setAppointmentType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            >
              {appointmentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-4">
              Select Date
            </label>
            <input
              type="date"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            />
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-4">
              Select Time
            </label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setAppointmentTime(time)}
                  className={`time-slot ${
                    appointmentTime === time ? 'selected' : ''
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Symptoms */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-4">
              Symptoms / Reason for Visit
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              rows={4}
              placeholder="Please describe your symptoms or reason for the visit..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !selectedDoctor || !appointmentDate || !appointmentTime}
            className="w-full btn-primary py-4 rounded-lg text-white font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Booking Appointment...' : 'Book Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
}