import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAppointments } from '../contexts/AppointmentContext';
import { Calendar, Clock, Stethoscope, Plus, CheckCircle, AlertCircle } from 'lucide-react';

export default function PatientDashboard() {
  const { user } = useAuth();
  const { appointments, doctors, loading } = useAppointments();

  const patientAppointments = appointments.filter(appointment => 
    appointment.patient._id === user?.id
  );

  const upcomingAppointments = patientAppointments.filter(appointment => {
    const today = new Date().toISOString().split('T')[0];
    return appointment.date.split('T')[0] >= today && appointment.status === 'scheduled';
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'status-scheduled';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      case 'no-show': return 'status-no-show';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = [
    { 
      title: 'Total Appointments', 
      value: patientAppointments.length, 
      icon: <Calendar className="h-6 w-6" />,
      color: 'bg-blue-500'
    },
    { 
      title: 'Upcoming', 
      value: upcomingAppointments.length, 
      icon: <Clock className="h-6 w-6" />,
      color: 'bg-orange-500'
    },
    { 
      title: 'Completed', 
      value: patientAppointments.filter(a => a.status === 'completed').length, 
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'bg-green-500'
    },
    { 
      title: 'Available Doctors', 
      value: doctors.length, 
      icon: <Stethoscope className="h-6 w-6" />,
      color: 'bg-purple-500'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Patient Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div className={`${stat.color} text-white p-3 rounded-full`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Appointments List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">My Appointments</h2>
            <Link
              to="/book-appointment"
              className="btn-primary px-4 py-2 rounded-lg text-white font-medium flex items-center space-x-2 hover:transform hover:scale-105 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Book New</span>
            </Link>
          </div>
          
          <div className="space-y-4">
            {patientAppointments.map((appointment) => (
              <div key={appointment._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Stethoscope className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{appointment.doctor.name}</h3>
                      <p className="text-sm text-gray-600">{appointment.doctor.department}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">{appointment.appointmentType}</p>
                    </div>
                  </div>
                  <span className={`status-indicator ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>
                {appointment.symptoms && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Symptoms:</strong> {appointment.symptoms}
                    </p>
                  </div>
                )}
                {appointment.notes && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Doctor's Notes:</strong> {appointment.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
            {patientAppointments.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No appointments scheduled yet.</p>
                <Link
                  to="/book-appointment"
                  className="btn-primary px-6 py-3 rounded-lg text-white font-medium hover:transform hover:scale-105 transition-all"
                >
                  Book Your First Appointment
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Available Doctors */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Available Doctors</h2>
          <div className="space-y-4">
            {doctors.slice(0, 4).map((doctor) => (
              <div key={doctor._id} className="doctor-card">
                <div className="flex items-center space-x-3">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{doctor.name}</h3>
                    <p className="text-sm text-gray-600">{doctor.specialty}</p>
                    <p className="text-xs text-blue-600">{doctor.department}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`status-indicator text-xs ${
                      doctor.available ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {doctor.available ? 'Available' : 'Busy'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Link
              to="/book-appointment"
              className="w-full btn-primary py-3 rounded-lg text-white font-medium text-center block hover:transform hover:scale-105 transition-all"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/book-appointment"
            className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 hover:bg-opacity-30 transition-all text-center"
          >
            <Calendar className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">Book Appointment</p>
          </Link>
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">View History</p>
            <p className="text-sm opacity-75">{patientAppointments.length} appointments</p>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-center">
            <Stethoscope className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">Find Doctors</p>
            <p className="text-sm opacity-75">{doctors.length} available</p>
          </div>
        </div>
      </div>
    </div>
  );
}