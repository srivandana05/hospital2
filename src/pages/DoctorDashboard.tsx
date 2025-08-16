import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAppointments } from '../contexts/AppointmentContext';
import { appointmentsAPI } from '../services/api';
import { Calendar, Clock, User, Phone, Mail, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { appointments, updateAppointmentStatus, loading } = useAppointments();
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentStats, setAppointmentStats] = useState({
    total: 0,
    today: 0,
    byStatus: {}
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const doctorAppointments = appointments.filter(appointment => 
    appointment.doctor._id === user?.id
  );

  const todayAppointments = doctorAppointments.filter(appointment => {
    const today = new Date().toISOString().split('T')[0];
    return appointment.date.split('T')[0] === today;
  });

  const upcomingAppointments = doctorAppointments.filter(appointment => {
    const today = new Date().toISOString().split('T')[0];
    return appointment.date.split('T')[0] > today && appointment.status === 'scheduled';
  });

  useEffect(() => {
    fetchAppointmentStats();
  }, []);

  const fetchAppointmentStats = async () => {
    try {
      const response = await appointmentsAPI.getAppointmentStats();
      if (response.data.success) {
        setAppointmentStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching appointment stats:', error);
    }
  };

  const handleStatusUpdate = async (appointmentId: string, status: string, notes?: string) => {
    const success = await updateAppointmentStatus(appointmentId, status, notes);
    if (success) {
      setSuccess('Appointment status updated successfully');
      setSelectedAppointment(null);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError('Failed to update appointment status');
      setTimeout(() => setError(''), 3000);
    }
  };

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
      value: doctorAppointments.length, 
      icon: <Calendar className="h-6 w-6" />,
      color: 'bg-blue-500'
    },
    { 
      title: 'Today', 
      value: todayAppointments.length, 
      icon: <Clock className="h-6 w-6" />,
      color: 'bg-orange-500'
    },
    { 
      title: 'Upcoming', 
      value: upcomingAppointments.length, 
      icon: <Calendar className="h-6 w-6" />,
      color: 'bg-green-500'
    },
    { 
      title: 'Completed', 
      value: doctorAppointments.filter(a => a.status === 'completed').length, 
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'bg-green-600'
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Doctor Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="alert-success p-4 rounded-lg mb-6 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          {success}
        </div>
      )}
      
      {error && (
        <div className="alert-error p-4 rounded-lg mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

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
          <h2 className="text-xl font-semibold text-gray-800 mb-6">My Appointments</h2>
          <div className="space-y-4">
            {doctorAppointments.map((appointment) => (
              <div
                key={appointment._id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedAppointment(appointment)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{appointment.patient.name}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{appointment.appointmentType}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`status-indicator ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(appointment._id, 'completed');
                        }}
                        className="text-green-600 hover:text-green-800 transition-colors"
                        title="Mark as completed"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(appointment._id, 'no-show');
                        }}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Mark as no-show"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                {appointment.symptoms && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Symptoms:</strong> {appointment.symptoms}
                    </p>
                  </div>
                )}
              </div>
            ))}
            {doctorAppointments.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No appointments scheduled yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Appointment Details */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Appointment Details</h2>
          {selectedAppointment ? (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{selectedAppointment.patient.name}</h3>
                <span className={`status-indicator ${getStatusColor(selectedAppointment.status)}`}>
                  {selectedAppointment.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">
                    {new Date(selectedAppointment.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{selectedAppointment.time}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{selectedAppointment.patient.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{selectedAppointment.patient.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700 capitalize">{selectedAppointment.appointmentType}</span>
                </div>
              </div>

              {selectedAppointment.symptoms && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Symptoms / Reason for Visit
                  </h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedAppointment.symptoms}</p>
                </div>
              )}

              {selectedAppointment.notes && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-800 mb-2">Doctor's Notes</h4>
                  <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">{selectedAppointment.notes}</p>
                </div>
              )}

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => handleStatusUpdate(selectedAppointment._id, 'completed')}
                  className="flex-1 btn-secondary py-2 rounded-lg text-white font-medium"
                  disabled={selectedAppointment.status === 'completed'}
                >
                  Mark Complete
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedAppointment._id, 'no-show')}
                  className="flex-1 bg-red-500 py-2 rounded-lg text-white font-medium hover:bg-red-600 transition-colors"
                  disabled={selectedAppointment.status === 'no-show'}
                >
                  No Show
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Select an appointment to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}