import React, { useState, useEffect } from 'react';
import { AlertTriangle, Users, Clock, CheckCircle, Search, Filter, UserCheck, Eye, Trash2, ArrowUpDown, ChevronLeft, ChevronRight, X, MapPin, Calendar, User } from 'lucide-react';
import { useAuth } from '../../../Contexts/AuthContext';

export default function InterventionManagement() {
  const [interventions, setInterventions] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateAssignModal, setShowUpdateAssignModal] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState(null);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

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
      const response = await fetch(`http://localhost:5455/api/admin/interventions/${selectedIntervention.id}/assign?technicianId=${selectedTechnicianId}`, {
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
        setError('Technician assigned successfully!');
        setTimeout(() => setError(''), 5000);
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

  // Fixed function for updating assignment
  const handleUpdateAssignment = async () => {
    if (!selectedIntervention) return;

    setIsAssigning(true);
    setError('');

    try {
      const url = `http://localhost:5455/api/admin/interventions/${selectedIntervention.id}/reassign${selectedTechnicianId ? `?technicianId=${selectedTechnicianId}` : ''
        }`;

      const response = await fetch(url, {
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
        setShowUpdateAssignModal(false);
        setSelectedIntervention(null);
        setSelectedTechnicianId('');
        setError('Assignment updated successfully!');
        setTimeout(() => setError(''), 5000);
      } else {
        setError('Failed to update assignment');
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
      setError('Connection error');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDeleteIntervention = async () => {
    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:5455/api/admin/interventions/${selectedIntervention.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setInterventions(prev => prev.filter(i => i.id !== selectedIntervention.id));
        setShowDeleteModal(false);
        setSelectedIntervention(null);
        setError(data.message);
        setTimeout(() => setError(''), 5000);
      } else {
        // Enhanced error message showing assignment info
        const errorMsg = data.assignedTo
          ? `Cannot delete - assigned to ${data.assignedTo}`
          : data.message || 'Failed to delete intervention';
        setError(errorMsg);
      }
    } catch (error) {
      console.error('Error deleting intervention:', error);
      setError('Connection error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-3 h-3 mr-1" />;
      case 'IN_PROGRESS': return <AlertTriangle className="w-3 h-3 mr-1" />;
      case 'COMPLETED': return <CheckCircle className="w-3 h-3 mr-1" />;
      default: return <Clock className="w-3 h-3 mr-1" />;
    }
  };

  // Filter and sort interventions
  let filteredInterventions = interventions.filter(intervention => {
    const matchesSearch = intervention.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intervention.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intervention.createdBy?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || intervention.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Sort interventions
  filteredInterventions.sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === 'createdBy') {
      aValue = a.createdBy?.fullName || '';
      bValue = b.createdBy?.fullName || '';
    }
    if (sortField === 'assignedTechnician') {
      aValue = a.assignedTechnician?.fullName || '';
      bValue = b.assignedTechnician?.fullName || '';
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(filteredInterventions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInterventions = filteredInterventions.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Compact Header with Controls - UPDATED TO DARKER */}
      <div className="bg-slate-800/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 dark:border-slate-700/50 p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white dark:text-white">Intervention Management</h1>
              <p className="text-sm text-slate-300 dark:text-slate-300">
                {filteredInterventions.length} total : {" "}
                <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mx-2"></span>
                {filteredInterventions.filter(i => i.status === 'PENDING').length} pending{" "}
                <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mx-2"></span>
                {filteredInterventions.filter(i => i.status === 'IN_PROGRESS').length} in progress{" "}
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mx-2"></span>
                {filteredInterventions.filter(i => i.status === 'COMPLETED').length} completed
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search interventions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-700/50 dark:bg-slate-800/50 border border-slate-600/50 dark:border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-400"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-2 bg-slate-700/50 dark:bg-slate-800/50 border border-slate-600/50 dark:border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Error/Success Message */}
      {error && (
        <div className={`p-4 rounded-lg ${error.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {error}
        </div>
      )}

      {/* Interventions Table - UPDATED TO DARKER */}
      <div className="bg-slate-800/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 dark:border-slate-700/50 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50 dark:bg-slate-800/50 border-b border-slate-600/50 dark:border-slate-600/50">
              <tr>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('title')}
                    className="flex items-center space-x-1 text-sm font-medium text-white dark:text-white hover:text-purple-400"
                  >
                    <span>Intervention</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('createdBy')}
                    className="flex items-center space-x-1 text-sm font-medium text-white dark:text-white hover:text-purple-400"
                  >
                    <span>Created By</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('assignedTechnician')}
                    className="flex items-center space-x-1 text-sm font-medium text-white dark:text-white hover:text-purple-400"
                  >
                    <span>Assigned To</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center space-x-1 text-sm font-medium text-white dark:text-white hover:text-purple-400"
                  >
                    <span>Status</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('createdAt')}
                    className="flex items-center space-x-1 text-sm font-medium text-white dark:text-white hover:text-purple-400"
                  >
                    <span>Date</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-600/50 dark:divide-slate-600/50">
              {paginatedInterventions.map((intervention) => (
                <tr key={intervention.id} className="hover:bg-slate-700/30 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-white dark:text-white">{intervention.title}</p>
                      <p className="text-sm text-slate-300 dark:text-slate-300 line-clamp-2">{intervention.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-green-500 to-green-600`}>
                        <span className="text-white text-sm font-medium">
                          {intervention.createdBy?.fullName?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white dark:text-white">
                          {intervention.createdBy?.fullName}
                        </p>
                        <p className="text-xs text-slate-300 dark:text-slate-300">
                          {intervention.createdBy?.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {intervention.assignedTechnician ? (
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600`}>
                          <span className="text-white text-sm font-medium">
                            {intervention.assignedTechnician.fullName?.charAt(0) || 'T'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white dark:text-white">
                            {intervention.assignedTechnician.fullName}
                          </p>
                          <p className="text-xs text-slate-300 dark:text-slate-300">
                            {intervention.assignedTechnician.email}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400 dark:text-slate-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(intervention.status)}`}>
                      {getStatusIcon(intervention.status)}
                      <span>{intervention.status.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-300 dark:text-slate-300">
                      <p>{new Date(intervention.createdAt).toLocaleDateString()}</p>
                      <p>{new Date(intervention.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedIntervention(intervention);
                          setShowViewModal(true);
                        }}
                        className="p-2 text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {intervention.status === 'PENDING' && (
                        <button
                          onClick={() => {
                            setSelectedIntervention(intervention);
                            setShowAssignModal(true);
                          }}
                          className="p-2 text-green-400 hover:bg-green-900/20 rounded-lg transition-colors"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                      {intervention.assignedTechnician && intervention.status !== 'COMPLETED' && (
                        <button
                          onClick={() => {
                            setSelectedIntervention(intervention);
                            setSelectedTechnicianId(intervention.assignedTechnician.id);
                            setShowUpdateAssignModal(true);
                          }}
                          className="p-2 text-orange-400 hover:bg-orange-900/20 rounded-lg transition-colors"
                          title="Update Assignment"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedIntervention(intervention);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {paginatedInterventions.length === 0 && (
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-2 text-sm font-medium text-white dark:text-white">No interventions found</h3>
              <p className="mt-1 text-sm text-slate-300 dark:text-slate-300">
                {searchTerm || filterStatus !== 'ALL' ? 'Try adjusting your search or filter criteria.' : 'No interventions available.'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-700/50 dark:bg-slate-800/50 border-t border-slate-600/50 dark:border-slate-600/50">
            <div className="flex items-center text-sm text-slate-300 dark:text-slate-300">
              <span>Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredInterventions.length)} of {filteredInterventions.length} results</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 text-slate-300 dark:text-slate-300 hover:text-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-slate-300 dark:text-slate-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 text-slate-300 dark:text-slate-300 hover:text-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Intervention Modal - UPDATED TO DARKER */}
      {showViewModal && selectedIntervention && (
        <div className="fixed inset-0 z-999 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700/50">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 border-b pb-2 border-slate-600/50">
              <h3 className="text-2xl font-semibold text-white">Intervention Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status */}
            <div className="mb-6">
              <span
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium ${getStatusColor(selectedIntervention.status)}`}
              >
                {getStatusIcon(selectedIntervention.status)}
                {selectedIntervention.status.replace('_', ' ')}
              </span>
            </div>

            {/* Title & Description */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-1">
                {selectedIntervention.title}
              </h4>
              <p className="text-slate-300">
                {selectedIntervention.description}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Created By */}
              <div className="bg-slate-800/50 p-4 rounded-lg shadow-sm border border-slate-600/50">
                <h5 className="text-sm font-medium text-white mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Created By
                </h5>
      
                <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-r from-green-500 to-green-600`}>
                    <span className="text-white font-medium">
                      {selectedIntervention.createdBy?.fullName?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {selectedIntervention.createdBy?.fullName}
                    </p>
                    <p className="text-xs text-slate-300">
                      {selectedIntervention.createdBy?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Assigned Technician */}
              <div className="bg-slate-800/50 p-4 rounded-lg shadow-sm border border-slate-600/50">
                <h5 className="text-sm font-medium text-white mb-3 flex items-center">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Assigned To
                </h5>
                {selectedIntervention.assignedTechnician ? (
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600`}>
                      <span className="text-white font-medium">
                        {selectedIntervention.assignedTechnician.fullName?.charAt(0) || 'T'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {selectedIntervention.assignedTechnician.fullName}
                      </p>
                      <p className="text-xs text-slate-300">
                        {selectedIntervention.assignedTechnician.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Not assigned</p>
                )}
              </div>

              {/* Creation Date */}
              <div className="bg-slate-800/50 p-4 rounded-lg shadow-sm border border-slate-600/50">
                <h5 className="text-sm font-medium text-white mb-3 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Created
                </h5>
                <p className="text-sm text-slate-300">
                  {new Date(selectedIntervention.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Completion Date */}
              <div className="bg-slate-800/50 p-4 rounded-lg shadow-sm border border-slate-600/50">
                <h5 className="text-sm font-medium text-white mb-3 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Completed
                </h5>
                {selectedIntervention.completedAt ? (
                  <p className="text-sm text-slate-300">
                    {new Date(selectedIntervention.completedAt).toLocaleString()}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400">Not completed</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Technician Modal - UPDATED TO DARKER */}
      {showAssignModal && selectedIntervention && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-999 p-4 backdrop-blur-sm">
          <div className="bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-700/50">
            <h3 className="text-xl font-bold mb-4 text-white">Assign Technician</h3>

            <div className="mb-4 p-4 bg-slate-800/50 rounded-lg border border-slate-600/50">
              <h4 className="font-medium text-white">{selectedIntervention.title}</h4>
              <p className="text-sm text-slate-300 mt-1">{selectedIntervention.description}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-slate-300">Select Technician</label>
              <select
                value={selectedTechnicianId}
                onChange={(e) => setSelectedTechnicianId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-800 text-white"
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
                className="flex-1 px-4 py-2 text-sm border border-slate-600 text-slate-300 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignTechnician}
                disabled={isAssigning || !selectedTechnicianId}
                className="flex-1 px-4 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 shadow-lg"
              >
                {isAssigning ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Assignment Modal - UPDATED TO DARKER */}
      {showUpdateAssignModal && selectedIntervention && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-999 p-4 backdrop-blur-sm transition-all duration-200">
          <div className="bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full animate-fade-in-up animate-duration-200 shadow-2xl border border-slate-700/50">
            <h3 className="text-xl font-bold mb-4 text-white">Update Assignment</h3>

            <div className="mb-4 p-4 bg-slate-800/50 rounded-lg border border-slate-600/50">
              <h4 className="font-medium text-white">{selectedIntervention.title}</h4>
              <p className="text-sm text-slate-300 mt-1">{selectedIntervention.description}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-slate-300">
                Technician Assignment
              </label>
              <select
                value={selectedTechnicianId || ''}
                onChange={(e) => setSelectedTechnicianId(e.target.value || null)}
                className="w-full px-3 py-2.5 text-sm border border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-slate-800 text-white transition-all"
              >
                <option value="">Unassign (no technician)</option>
                {technicians.map((technician) => (
                  <option key={technician.id} value={technician.id}>
                    {technician.fullName} • {technician.email}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-400">
                Select "Unassign" to remove current technician
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowUpdateAssignModal(false);
                  setSelectedIntervention(null);
                  setSelectedTechnicianId('');
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium border border-slate-600 text-slate-300 bg-slate-800 rounded-lg hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateAssignment}
                disabled={isAssigning}
                className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-all ${isAssigning
                  ? 'bg-orange-400 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 shadow-lg'
                  }`}
              >
                {isAssigning ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : 'Update Assignment'}
              </button>
            </div>

            {error && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${error.includes('success')
                ? 'bg-green-900/30 text-green-300'
                : 'bg-red-900/30 text-red-300'
                }`}>
                {error}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - UPDATED TO DARKER */}
      {showDeleteModal && selectedIntervention && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-999 p-4 backdrop-blur-sm">
          <div className="bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-700/50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-900/20 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete Intervention</h3>
                <p className="text-sm text-slate-300">This action cannot be undone</p>
              </div>
            </div>

            <div className="bg-red-900/20 p-3 rounded-lg mb-4 border border-red-500/20">
              <p className="text-sm text-red-300">
                Are you sure you want to delete <strong>"{selectedIntervention.title}"</strong>?
                This will permanently remove the intervention and all associated data.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedIntervention(null);
                }}
                className="flex-1 px-4 py-2 text-sm border border-slate-600 text-slate-300 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteIntervention}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 shadow-lg"
              >
                {isDeleting ? 'Deleting...' : 'Delete Intervention'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}