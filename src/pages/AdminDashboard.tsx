import React, { useState, useEffect } from 'react';
import { useAppointments } from '../contexts/AppointmentContext';
import { usersAPI } from '../services/api';
import { 
  Calendar, 
  Users, 
  UserPlus, 
  Clock, 
  CheckCircle, 
  XCircle,
  Stethoscope,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  AlertCircle,
  Edit,
  Search,
  Filter,
  Download,
  Mail
} from 'lucide-react';

export default function AdminDashboard() {
  const { appointments, updateAppointmentStatus, fetchAppointments, loading } = useAppointments();
  const [activeTab, setActiveTab] = useState('appointments');
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalPatients: 0,
    totalAdmins: 0
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchUserStats();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getUsers();
      if (response.data.success) {
        setUsers(response.data.users);
        setDoctors(response.data.users.filter(user => user.role === 'doctor'));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await usersAPI.getUserStats();
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleStatusUpdate = async (appointmentId: string, status: string) => {
    const success = await updateAppointmentStatus(appointmentId, status);
    if (success) {
      setSuccess('Appointment status updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError('Failed to update appointment status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUserAction = async (userId: string, action: 'activate' | 'deactivate') => {
    try {
      if (action === 'activate') {
        await usersAPI.activateUser(userId);
        setSuccess('User activated successfully');
      } else {
        await usersAPI.deactivateUser(userId);
        setSuccess('User deactivated successfully');
      }
      
      fetchUsers();
      fetchUserStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(`Failed to ${action} user`);
      setTimeout(() => setError(''), 3000);
    }
  };

  // Filter appointments based on search and filters
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = searchTerm === '' || 
      appointment.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    const matchesDate = dateFilter === 'all' || (() => {
      const appointmentDate = new Date(appointment.date);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      switch (dateFilter) {
        case 'today':
          return appointmentDate.toDateString() === today.toDateString();
        case 'tomorrow':
          return appointmentDate.toDateString() === tomorrow.toDateString();
        case 'week':
          return appointmentDate >= today && appointmentDate <= nextWeek;
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesStatus && matchesDate;
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const dashboardStats = [
    { 
      title: 'Total Appointments', 
      value: appointments.length, 
      icon: <Calendar className="h-6 w-6" />,
      color: 'bg-blue-500'
    },
    { 
      title: 'Active Doctors', 
      value: stats.totalDoctors, 
      icon: <Stethoscope className="h-6 w-6" />,
      color: 'bg-green-500'
    },
    { 
      title: 'Total Patients', 
      value: stats.totalPatients, 
      icon: <Users className="h-6 w-6" />,
      color: 'bg-purple-500'
    },
    { 
      title: 'Scheduled Today', 
      value: appointments.filter(a => {
        const today = new Date().toISOString().split('T')[0];
        return a.date.split('T')[0] === today && a.status === 'scheduled';
      }).length, 
      icon: <Clock className="h-6 w-6" />,
      color: 'bg-orange-500'
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage appointments, doctors, and monitor system activity</p>
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
        {dashboardStats.map((stat, index) => (
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

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'appointments', label: 'Appointments', icon: <Calendar className="h-4 w-4" /> },
              { id: 'users', label: 'Users', icon: <Users className="h-4 w-4" /> },
              { id: 'doctors', label: 'Doctors', icon: <Stethoscope className="h-4 w-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-xl font-semibold text-gray-800">Appointment Management</h2>
                
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search appointments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no-show">No Show</option>
                  </select>
                  
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today</option>
                    <option value="tomorrow">Tomorrow</option>
                    <option value="week">This Week</option>
                  </select>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  Showing {filteredAppointments.length} of {appointments.length} appointments
                </p>
              </div>
              
              <div className="table-container">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Patient</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Doctor</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Date & Time</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
  {filteredAppointments.map((appointment) => (
    <tr key={appointment._id} className="table-row">
      <td className="px-4 py-4">
        <div>
          <div className="font-medium text-gray-800">
            {appointment?.patient?.name || 'Unknown Patient'}
          </div>
          <div className="text-gray-600 text-sm">
            {appointment?.patient?.email || 'N/A'}
          </div>
          <div className="text-gray-500 text-xs">
            {appointment?.patient?.phone || 'N/A'}
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="font-medium text-gray-800">
          {appointment?.doctor?.name || 'Unknown Doctor'}
        </div>
        <div className="text-gray-600 text-sm">
          {appointment?.doctor?.department || 'N/A'}
        </div>
        <div className="text-gray-500 text-xs">
          {appointment?.doctor?.specialty || 'N/A'}
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="font-medium text-gray-800">
          {appointment?.date
            ? new Date(appointment.date).toLocaleDateString()
            : 'N/A'}
        </div>
        <div className="text-gray-600 text-sm">{appointment?.time || 'N/A'}</div>
      </td>
      <td className="px-4 py-4">
        <span className={`status-indicator ${getStatusBadgeColor('scheduled')}`}>
          {appointment?.appointmentType || 'General'}
        </span>
      </td>
      <td className="px-4 py-4">
        <span className={`status-indicator ${getStatusColor(appointment?.status)}`}>
          {appointment?.status || 'pending'}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedAppointment(appointment);
              setShowAppointmentModal(true);
            }}
            className="text-blue-600 hover:text-blue-800 transition-colors"
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleStatusUpdate(appointment._id, 'completed')}
            className="text-green-600 hover:text-green-800 transition-colors"
            title="Mark as completed"
            disabled={appointment.status === 'completed'}
          >
            <CheckCircle className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleStatusUpdate(appointment._id, 'cancelled')}
            className="text-red-600 hover:text-red-800 transition-colors"
            title="Cancel appointment"
            disabled={appointment.status === 'cancelled'}
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>

                 
                 
                </table>
                
                {filteredAppointments.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No appointments found matching your criteria.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">All Users</h2>
              <div className="table-container">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Role</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Joined</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id} className="table-row">
                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-800">{user.name}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-gray-600">{user.email}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`status-indicator ${
                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                            user.role === 'doctor' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`status-indicator ${
                            user.isActive ? 'status-completed' : 'status-cancelled'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {user.isActive ? (
                              <button
                                onClick={() => handleUserAction(user._id, 'deactivate')}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Deactivate user"
                              >
                                <UserX className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUserAction(user._id, 'activate')}
                                className="text-green-600 hover:text-green-800 transition-colors"
                                title="Activate user"
                              >
                                <UserCheck className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Doctors Tab */}
          {activeTab === 'doctors' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Doctors</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((doctor) => (
                  <div key={doctor._id} className="doctor-card">
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-800">{doctor.name}</h3>
                        <p className="text-sm text-gray-600">{doctor.specialty}</p>
                        <p className="text-sm text-blue-600">{doctor.department}</p>
                        <p className="text-xs text-gray-500">{doctor.experience}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`status-indicator ${
                        doctor.isActive ? 'status-completed' : 'status-cancelled'
                      }`}>
                        {doctor.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className={`status-indicator ${
                        doctor.available ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {doctor.available ? 'Available' : 'Busy'}
                      </span>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600">
                        {appointments.filter(a => a.doctor._id === doctor._id).length} appointments
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Appointment Details Modal */}
      {showAppointmentModal && selectedAppointment && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
          <div className="modal-content w-full max-w-2xl p-6 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Appointment Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Patient Information */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800 border-b pb-2">Patient Information</h4>
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-gray-800">{selectedAppointment.patient.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-800">{selectedAppointment.patient.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-gray-800">{selectedAppointment.patient.phone}</p>
                </div>
              </div>
              
              {/* Doctor Information */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800 border-b pb-2">Doctor Information</h4>
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-gray-800">{selectedAppointment.doctor.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Specialty</label>
                  <p className="text-gray-800">{selectedAppointment.doctor.specialty}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Department</label>
                  <p className="text-gray-800">{selectedAppointment.doctor.department}</p>
                </div>
              </div>
            </div>
            
            {/* Appointment Details */}
            <div className="mt-6 space-y-3">
              <h4 className="font-medium text-gray-800 border-b pb-2">Appointment Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Date</label>
                  <p className="text-gray-800">{new Date(selectedAppointment.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Time</label>
                  <p className="text-gray-800">{selectedAppointment.time}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <span className={`status-indicator ${getStatusColor(selectedAppointment.status)}`}>
                    {selectedAppointment.status}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Type</label>
                <p className="text-gray-800 capitalize">{selectedAppointment.appointmentType}</p>
              </div>
              {selectedAppointment.symptoms && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Symptoms</label>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{selectedAppointment.symptoms}</p>
                </div>
              )}
              {selectedAppointment.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Doctor's Notes</label>
                  <p className="text-gray-800 bg-blue-50 p-3 rounded-lg">{selectedAppointment.notes}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600">Booked On</label>
                <p className="text-gray-800">{new Date(selectedAppointment.createdAt).toLocaleString()}</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={() => handleStatusUpdate(selectedAppointment._id, 'completed')}
                className="btn-secondary px-4 py-2 rounded-lg text-white font-medium"
                disabled={selectedAppointment.status === 'completed'}
              >
                Mark Complete
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedAppointment._id, 'cancelled')}
                className="bg-red-500 px-4 py-2 rounded-lg text-white font-medium hover:bg-red-600 transition-colors"
                disabled={selectedAppointment.status === 'cancelled'}
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedAppointment._id, 'no-show')}
                className="bg-yellow-500 px-4 py-2 rounded-lg text-white font-medium hover:bg-yellow-600 transition-colors"
                disabled={selectedAppointment.status === 'no-show'}
              >
                No Show
              </button>
              <button
                onClick={() => setShowAppointmentModal(false)}
                className="bg-gray-300 px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
          <div className="modal-content w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">User Details</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <p className="text-gray-800">{selectedUser.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-800">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <p className="text-gray-800">{selectedUser.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Role</label>
                <p className="text-gray-800 capitalize">{selectedUser.role}</p>
              </div>
              {selectedUser.role === 'doctor' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Specialty</label>
                    <p className="text-gray-800">{selectedUser.specialty}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Department</label>
                    <p className="text-gray-800">{selectedUser.department}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Experience</label>
                    <p className="text-gray-800">{selectedUser.experience}</p>
                  </div>
                </>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <p className={`${selectedUser.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedUser.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Joined</label>
                <p className="text-gray-800">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowUserModal(false)}
                className="flex-1 bg-gray-300 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}