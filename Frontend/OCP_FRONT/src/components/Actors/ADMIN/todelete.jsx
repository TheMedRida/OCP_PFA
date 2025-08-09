{/*
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Users, Clock, CheckCircle, Search, Filter, UserCheck, Eye } from 'lucide-react';
import { useAuth } from '../../../Contexts/AuthContext';

export default function InterventionManagement() {
  const [interventions, setInterventions] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState(null);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    fetchInterventions();
    fetchTechnicians();
  }, []);

  const fetchInterventions = async () => {
    try {
      const response = await fetch('http://localhost:5455/api/admin/interventions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInterventions(data);
      } else {
        setError('Failed to load interventions');
      }
    } catch (error) {
      console.error('Error fetching interventions:', error);
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const response = await fetch('http://localhost:5455/api/admin/technicians', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTechnicians(data);
      }
    } catch (error) {
      console.error('Error fetching technicians:', error);
    }
  };

  const handleAssignTechnician = async () => {
    if (!selectedTechnicianId || !selectedIntervention) return;

    setIsAssigning(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:5455/api/interventions/${selectedIntervention.id}/assign?technicianId=${selectedTechnicianId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const updatedIntervention = await response.json();
        setInterventions(prev => 
          prev.map(intervention => 
            intervention.id === updatedIntervention.id ? updatedIntervention : intervention
          )
        );
        setShowAssignModal(false);
        setSelectedIntervention(null);
        setSelectedTechnicianId('');
      } else {
        setError('Failed to assign technician');
      }
    } catch (error) {
      console.error('Error assigning technician:', error);
      setError('Connection error');
    } finally {
      setIsAssigning(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'IN_PROGRESS': return <AlertTriangle className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredInterventions = interventions.filter(intervention => {
    const matchesSearch = intervention.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         intervention.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || intervention.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Intervention Management</h1>
              <p className="text-gray-600 dark:text-gray-300">Assign and manage interventions</p>
            </div>
          </div>
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{interventions.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {interventions.filter(i => i.status === 'PENDING').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">
                {interventions.filter(i => i.status === 'IN_PROGRESS').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {interventions.filter(i => i.status === 'COMPLETED').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

     
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search interventions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
      </div>

      
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

   
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-800 dark:text-white">Intervention</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-800 dark:text-white">Created By</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-800 dark:text-white">Assigned To</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-800 dark:text-white">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-800 dark:text-white">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-800 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredInterventions.map((intervention) => (
                <tr key={intervention.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{intervention.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{intervention.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {intervention.createdBy?.fullName?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white">
                          {intervention.createdBy?.fullName}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {intervention.createdBy?.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {intervention.assignedTechnician ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {intervention.assignedTechnician.fullName?.charAt(0) || 'T'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-white">
                            {intervention.assignedTechnician.fullName}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {intervention.assignedTechnician.email}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(intervention.status)}`}>
                      {getStatusIcon(intervention.status)}
                      <span className="ml-1">{intervention.status.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p>{new Date(intervention.createdAt).toLocaleDateString()}</p>
                      <p>{new Date(intervention.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      {intervention.status === 'PENDING' && (
                        <button
                          onClick={() => {
                            setSelectedIntervention(intervention);
                            setShowAssignModal(true);
                          }}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        >
                          <UserCheck className="w-4 h-4" />
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

    
      {showAssignModal && selectedIntervention && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-6">Assign Technician</h3>
            
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-800 dark:text-white">{selectedIntervention.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedIntervention.description}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Select Technician</label>
              <select
                value={selectedTechnicianId}
                onChange={(e) => setSelectedTechnicianId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Choose a technician...</option>
                {technicians.map((technician) => (
                  <option key={technician.id} value={technician.id}>
                    {technician.fullName} ({technician.email})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedIntervention(null);
                  setSelectedTechnicianId('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignTechnician}
                disabled={isAssigning || !selectedTechnicianId}
                className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
              >
                {isAssigning ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Users, Plus, Mail, Phone, Shield, Edit, Trash2, Search, Filter } from 'lucide-react';
import { useAuth } from '../../../Contexts/AuthContext';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [isCreating, setIsCreating] = useState(false);

  const { token } = useAuth();

  // Form state for creating new user
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    tel: '',
    role: 'USER'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5455/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        // Filter to show only USER and TECHNICIAN roles
        const filteredUsers = userData.filter(user => 
          user.role === 'USER' || user.role === 'TECHNICIAN'
        );
        setUsers(filteredUsers);
      } else {
        setError('Failed to load users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5455/api/admin/create_user', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        const createdUser = await response.json();
        setUsers(prev => [...prev, createdUser]);
        setShowCreateModal(false);
        setNewUser({ fullName: '', email: '', tel: '', role: 'USER' });
        // Show success message
        setError('User created successfully! Default password: 12345');
        setTimeout(() => setError(''), 5000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Connection error');
    } finally {
      setIsCreating(false);
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'TECHNICIAN': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'USER': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
     
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">User Management</h1>
              <p className="text-gray-600 dark:text-gray-300">Manage users and technicians</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Create User</span>
          </button>
        </div>
      </div>

     
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="pl-10 pr-8 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">All Roles</option>
              <option value="TECHNICIAN">Technician</option>
              <option value="USER">User</option>
            </select>
          </div>
        </div>
      </div>

     
      {error && (
        <div className={`p-4 rounded-lg ${error.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {error}
        </div>
      )}

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-4">
        <div className="flex items-center justify-between">
          <div className="text-gray-800 dark:text-white">
            <span className="font-medium">Total Users: </span>
            <span className="text-lg font-bold">{filteredUsers.length}</span>
          </div>
          <div className="flex space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Users: {filteredUsers.filter(u => u.role === 'USER').length}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Technicians: {filteredUsers.filter(u => u.role === 'TECHNICIAN').length}
              </span>
            </div>
          </div>
        </div>
      </div>

  
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-800 dark:text-white">User</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-800 dark:text-white">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-800 dark:text-white">Role</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-800 dark:text-white">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-800 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        user.role === 'TECHNICIAN' 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                          : 'bg-gradient-to-r from-green-500 to-green-600'
                      }`}>
                        <span className="text-white font-medium text-sm">
                          {user.fullName?.charAt(0) || user.email?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">{user.fullName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="w-4 h-4" />
                        <span>{user.email}</span>
                      </div>
                      {user.tel && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="w-4 h-4" />
                          <span>{user.tel}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      <Shield className="w-3 h-3 mr-1" />
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.active ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {user.active ? 'Active' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No users found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || filterRole !== 'ALL' ? 'Try adjusting your search or filter criteria.' : 'Get started by creating a new user.'}
              </p>
            </div>
          )}
        </div>
      </div>

 
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-999 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Create New User</h3>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Full Name</label>
                <input
                  type="text"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Phone</label>
                <input
                  type="tel"
                  value={newUser.tel}
                  onChange={(e) => setNewUser(prev => ({ ...prev, tel: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                >
                  <option value="USER">User</option>
                  <option value="TECHNICIAN">Technician</option>
                </select>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  📧 User will receive an email with default password: <strong>12345</strong>
                </p>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewUser({ fullName: '', email: '', tel: '', role: 'USER' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
*/}

