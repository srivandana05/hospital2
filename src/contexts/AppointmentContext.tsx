import React, { createContext, useContext, useState, useEffect } from 'react';
import { appointmentsAPI, usersAPI } from '../services/api';
import { useAuth } from './AuthContext';

interface Appointment {
  _id: string;
  patient: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  doctor: {
    _id: string;
    name: string;
    email: string;
    specialty: string;
    department: string;
  };
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  symptoms?: string;
  notes?: string;
  department: string;
  appointmentType: string;
  createdAt: string;
  updatedAt: string;
}

interface Doctor {
  _id: string;
  name: string;
  email: string;
  specialty: string;
  department: string;
  experience: string;
  image: string;
  available: boolean;
}

interface AppointmentContextType {
  appointments: Appointment[];
  doctors: Doctor[];
  loading: boolean;
  bookAppointment: (appointmentData: any) => Promise<boolean>;
  updateAppointmentStatus: (appointmentId: string, status: string, notes?: string) => Promise<boolean>;
  cancelAppointment: (appointmentId: string) => Promise<boolean>;
  fetchAppointments: () => Promise<void>;
  fetchDoctors: () => Promise<void>;
  getDoctorAppointments: (doctorId: string) => Appointment[];
  getPatientAppointments: (patientId: string) => Appointment[];
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export function useAppointments() {
  const context = useContext(AppointmentContext);
  if (context === undefined) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
}

export function AppointmentProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, token } = useAuth();

  const fetchAppointments = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await appointmentsAPI.getAppointments();
      if (response.data.success) {
        setAppointments(response.data.appointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    if (!token) return;
    
    try {
      const response = await usersAPI.getDoctors();
      if (response.data.success) {
        setDoctors(response.data.doctors);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAppointments();
      fetchDoctors();
    }
  }, [token]);

  const bookAppointment = async (appointmentData: any): Promise<boolean> => {
    try {
      const response = await appointmentsAPI.bookAppointment(appointmentData);
      if (response.data.success) {
        await fetchAppointments(); // Refresh appointments
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error booking appointment:', error.response?.data?.message || error.message);
      return false;
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: string, notes?: string): Promise<boolean> => {
    try {
      const response = await appointmentsAPI.updateAppointmentStatus(appointmentId, status, notes);
      if (response.data.success) {
        await fetchAppointments(); // Refresh appointments
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error updating appointment status:', error.response?.data?.message || error.message);
      return false;
    }
  };

  const cancelAppointment = async (appointmentId: string): Promise<boolean> => {
    try {
      const response = await appointmentsAPI.cancelAppointment(appointmentId);
      if (response.data.success) {
        await fetchAppointments(); // Refresh appointments
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error cancelling appointment:', error.response?.data?.message || error.message);
      return false;
    }
  };

  const getDoctorAppointments = (doctorId: string) => {
    return appointments.filter(appointment => appointment.doctor._id === doctorId);
  };

  const getPatientAppointments = (patientId: string) => {
    return appointments.filter(appointment => appointment.patient._id === patientId);
  };

  const value = {
    appointments,
    doctors,
    loading,
    bookAppointment,
    updateAppointmentStatus,
    cancelAppointment,
    fetchAppointments,
    fetchDoctors,
    getDoctorAppointments,
    getPatientAppointments
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
}