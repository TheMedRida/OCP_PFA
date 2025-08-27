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
      {/* Compact Header with Controls */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">Intervention Management</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search interventions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Filter */}
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
      </div>

      {/* Error/Success Message */}
      {error && (
        <div className={`p-4 rounded-lg ${error.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {error}
        </div>
      )}

      {/* Interventions Table */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('title')}
                    className="flex items-center space-x-1 text-sm font-medium text-gray-800 dark:text-white hover:text-purple-600"
                  >
                    <span>Intervention</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('createdBy')}
                    className="flex items-center space-x-1 text-sm font-medium text-gray-800 dark:text-white hover:text-purple-600"
                  >
                    <span>Created By</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('assignedTechnician')}
                    className="flex items-center space-x-1 text-sm font-medium text-gray-800 dark:text-white hover:text-purple-600"
                  >
                    <span>Assigned To</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center space-x-1 text-sm font-medium text-gray-800 dark:text-white hover:text-purple-600"
                  >
                    <span>Status</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('createdAt')}
                    className="flex items-center space-x-1 text-sm font-medium text-gray-800 dark:text-white hover:text-purple-600"
                  >
                    <span>Date</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-800 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {paginatedInterventions.map((intervention) => (
                <tr key={intervention.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{intervention.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{intervention.description}</p>
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
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600`}>
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
                      <span>{intervention.status.replace('_', ' ')}</span>
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
                      <button
                        onClick={() => {
                          setSelectedIntervention(intervention);
                          setShowViewModal(true);
                        }}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {intervention.status === 'PENDING' && (
                        <button
                          onClick={() => {
                            setSelectedIntervention(intervention);
                            setShowAssignModal(true);
                          }}
                          className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors"
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
                          className="p-2 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
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
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No interventions found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || filterStatus !== 'ALL' ? 'Try adjusting your search or filter criteria.' : 'No interventions available.'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-t border-white/10">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <span>Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredInterventions.length)} of {filteredInterventions.length} results</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Intervention Modal */}
      {showViewModal && selectedIntervention && (
        <div className="fixed inset-0 z-999 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">Intervention Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                {selectedIntervention.title}
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedIntervention.description}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Created By */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <h5 className="text-sm font-medium text-gray-800 dark:text-white mb-3 flex items-center">
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
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                      {selectedIntervention.createdBy?.fullName}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {selectedIntervention.createdBy?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Assigned Technician */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <h5 className="text-sm font-medium text-gray-800 dark:text-white mb-3 flex items-center">
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
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">
                        {selectedIntervention.assignedTechnician.fullName}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {selectedIntervention.assignedTechnician.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Not assigned</p>
                )}
              </div>

              {/* Creation Date (Full Width) */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm md:col-span-1">
                <h5 className="text-sm font-medium text-gray-800 dark:text-white mb-3 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Created
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(selectedIntervention.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Completion Date */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm md:col-span-1">
                <h5 className="text-sm font-medium text-gray-800 dark:text-white mb-3 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Completed
                </h5>
                {selectedIntervention.completedAt ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(selectedIntervention.completedAt).toLocaleString()}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Not completed</p>
                )}
              </div>


            </div>

          </div>
        </div>
      )}


      {/* Assign Technician Modal */}
      {showAssignModal && selectedIntervention && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-999 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Assign Technician</h3>

            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-800 dark:text-white">{selectedIntervention.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedIntervention.description}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Select Technician</label>
              <select
                value={selectedTechnicianId}
                onChange={(e) => setSelectedTechnicianId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
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
                className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignTechnician}
                disabled={isAssigning || !selectedTechnicianId}
                className="flex-1 px-4 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
              >
                {isAssigning ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Assignment Modal */}
      {showUpdateAssignModal && selectedIntervention && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-999 p-4 backdrop-blur-sm transition-all duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full animate-fade-in-up animate-duration-200 shadow-xl">
            {/* ... (keep existing header and intervention info) ... */}

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Technician Assignment
              </label>
              <select
                value={selectedTechnicianId || ''}
                onChange={(e) => setSelectedTechnicianId(e.target.value || null)}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white transition-all"
              >
                <option value="">Unassign (no technician)</option>
                {technicians.map((technician) => (
                  <option key={technician.id} value={technician.id}>
                    {technician.fullName} • {technician.email}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
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
                className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateAssignment}
                disabled={isAssigning}
                className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-all ${isAssigning
                  ? 'bg-orange-400 dark:bg-orange-500/50 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-orange-200 dark:hover:shadow-orange-900/50'
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
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                {error}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedIntervention && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-999 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Delete Intervention</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">This action cannot be undone</p>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mb-4">
              <p className="text-sm text-red-700 dark:text-red-400">
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
                className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteIntervention}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
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


import React, { useState, useEffect } from 'react';
import { Users, Plus, Mail, Phone, Shield, Edit, Trash2, Search, Filter, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { useAuth } from '../../../Contexts/AuthContext';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null);
  const [sortField, setSortField] = useState('fullName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  const { token } = useAuth();

  // Form state for creating new user
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    tel: '',
    role: 'USER'
  });

  // Form state for editing user
  const [editUser, setEditUser] = useState({
    fullName: '',
    email: '',
    tel: '',
    role: 'USER',
    password: ''
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

  const handleEditUser = (user) => {
    setUserToEdit(user);
    setEditUser({
      fullName: user.fullName || '',
      email: user.email || '',
      tel: user.tel || '',
      role: user.role || 'USER',
      password: ''
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setError('');

    try {
      // Prepare the update payload - only include password if it's not empty
      const updatePayload = {
        fullName: editUser.fullName,
        email: editUser.email,
        tel: editUser.tel,
        role: editUser.role
      };

      // Only include password if user entered one
      if (editUser.password && editUser.password.trim() !== '') {
        updatePayload.password = editUser.password;
      }

      const response = await fetch(`http://localhost:5455/api/admin/users/${userToEdit.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatePayload)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(prev => prev.map(user =>
          user.id === updatedUser.id ? updatedUser : user
        ));
        setShowEditModal(false);
        setUserToEdit(null);
        setEditUser({ fullName: '', email: '', tel: '', role: 'USER', password: '' });
        setError('User updated successfully!');
        setTimeout(() => setError(''), 5000);
      } else {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          setError(errorData.message || 'Failed to update user');
        } catch {
          setError(errorText || 'Failed to update user');
        }
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Connection error - please check your network');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:5455/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let errorMessage = 'Failed to delete user';

      // Only try to parse JSON if there's content
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        errorMessage = data.message || errorMessage;
      }

      if (response.ok) {
        setUsers(prev => prev.filter(user => user.id !== userToDelete.id));
        setShowDeleteModal(false);
        setUserToDelete(null);
        setError('User deleted successfully!');
        setTimeout(() => setError(''), 5000);
      } else {
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
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

  const getRoleColor = (role) => {
    switch (role) {
      case 'TECHNICIAN': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'USER': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  // Filter and sort users
  let filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Sort users
  filteredUsers.sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

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
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Compact Header with Controls */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">User Management</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredUsers.length} total : {" "}
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mx-2"></span>
                {filteredUsers.filter(u => u.role === 'USER').length} users{" "}
                <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mx-2"></span>
                {filteredUsers.filter(u => u.role === 'TECHNICIAN').length} technicians
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="pl-10 pr-8 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">All Roles</option>
                <option value="TECHNICIAN">Technicians</option>
                <option value="USER">Users</option>
              </select>
            </div>

            {/* Add User Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Add User</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error/Success Message */}
      {error && (
        <div className={`p-4 rounded-lg ${error.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('fullName')}
                    className="flex items-center space-x-1 text-sm font-medium text-gray-800 dark:text-white hover:text-purple-600"
                  >
                    <span>User</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-800 dark:text-white">Contact</th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('role')}
                    className="flex items-center space-x-1 text-sm font-medium text-gray-800 dark:text-white hover:text-purple-600"
                  >
                    <span>Role</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-800 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === 'TECHNICIAN'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                        : 'bg-gradient-to-r from-green-500 to-green-600'
                        }`}>
                        <span className="text-white font-medium">
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
                        <span className="truncate max-w-48">{user.email}</span>
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
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setUserToDelete(user);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {paginatedUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No users found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || filterRole !== 'ALL' ? 'Try adjusting your search or filter criteria.' : 'Get started by creating a new user.'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-t border-white/10">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <span>Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} results</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-999 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Create New User</h3>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Full Name</label>
                <input
                  type="text"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Phone</label>
                <input
                  type="tel"
                  value={newUser.tel}
                  onChange={(e) => setNewUser(prev => ({ ...prev, tel: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                >
                  <option value="USER">User</option>
                  <option value="TECHNICIAN">Technician</option>
                </select>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  📧 Default password: <strong>12345</strong>
                </p>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewUser({ fullName: '', email: '', tel: '', role: 'USER' });
                  }}
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && userToEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-999 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Edit User</h3>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Full Name</label>
                <input
                  type="text"
                  value={editUser.fullName}
                  onChange={(e) => setEditUser(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Phone</label>
                <input
                  type="tel"
                  value={editUser.tel}
                  onChange={(e) => setEditUser(prev => ({ ...prev, tel: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Role</label>
                <select
                  value={editUser.role}
                  onChange={(e) => setEditUser(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                >
                  <option value="USER">User</option>
                  <option value="TECHNICIAN">Technician</option>
                </select>
              </div>

              {/* FIXED PASSWORD FIELD - properly handle empty values */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  New Password (Optional)
                </label>
                <input
                  type="password"
                  value={editUser.password || ''} // FIXED: Always provide a string value
                  onChange={(e) => setEditUser(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Leave empty to keep current password"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  💡 If you don't modify this field, the current password will remain unchanged
                </p>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setUserToEdit(null);
                    // Reset password field when closing
                    setEditUser(prev => ({ ...prev, password: '' }));
                  }}
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-999 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Delete User</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">This action cannot be undone</p>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mb-4">
              <p className="text-sm text-red-700 dark:text-red-400">
                Are you sure you want to delete <strong>{userToDelete.fullName}</strong>?
                This will permanently remove their account and all associated data.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, CheckCircle, Clock, TrendingUp, Activity, UserCheck, Wrench } from 'lucide-react';
import { useAuth } from '../../../Contexts/AuthContext';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTechnicians: 0,
    totalInterventions: 0,
    pendingInterventions: 0,
    inprogressInterventions: 0,
    completedInterventions: 0
  });
  
  const [recentInterventions, setRecentInterventions] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { token, user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard stats
      const statsResponse = await fetch('http://localhost:5455/api/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch recent interventions
      const interventionsResponse = await fetch('http://localhost:5455/api/admin/interventions/recent', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (interventionsResponse.ok) {
        const interventionsData = await interventionsResponse.json();
        setRecentInterventions(interventionsData);
      }

      // Fetch recent users
      const usersResponse = await fetch('http://localhost:5455/api/admin/users/recent', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setRecentUsers(usersData);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
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

  const getRoleColor = (role) => {
    switch(role) {
      case 'ADMIN': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'TECHNICIAN': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'USER': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {/*<div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Welcome back, {user?.fullName}!</p>
            </div>
          </div>
        </div>
      </div>*/}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalUsers}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                <UserCheck className="w-3 h-3 inline mr-1" />
                Active users
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        {/* Total Technicians */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Technicians</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalTechnicians}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                <UserCheck className="w-3 h-3 inline mr-1" />
                Active technicians
              </p>
            </div>
            <Wrench className="w-8 h-8 text-green-500" />
          </div>
        </div>

        {/* Total Interventions */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Interventions</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalInterventions}</p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                <Activity className="w-3 h-3 inline mr-1" />
                All time requests
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        {/* Pending Interventions */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingInterventions}</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                <Clock className="w-3 h-3 inline mr-1" />
                Needs assignment
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Intervention Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Pending</h3>
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-yellow-600 mb-2">{stats.pendingInterventions}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Awaiting assignment</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">In Progress</h3>
            <AlertTriangle className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-600 mb-2">{stats.inprogressInterventions}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Being worked on</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Completed</h3>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-600 mb-2">{stats.completedInterventions}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Successfully resolved</p>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Interventions */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Recent Interventions</h2>
          
          {recentInterventions.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400 py-8">No recent interventions</p>
          ) : (
            <div className="space-y-4">
              {recentInterventions.slice(0, 5).map((intervention) => (
                <div key={intervention.id} className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                      {intervention.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      By {intervention.createdBy?.fullName} • {new Date(intervention.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(intervention.status)}`}>
                    {intervention.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Recent Users</h2>
          
          {recentUsers.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400 py-8">No recent users</p>
          ) : (
            <div className="space-y-4">
              {recentUsers.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === 'TECHNICIAN'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                        : 'bg-gradient-to-r from-green-500 to-green-600'
                        }`}>
                    <span className="text-white font-medium text-sm">
                      {user.fullName?.charAt(0) || user.email?.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {/*<div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-gray-800 dark:text-white">Manage Users</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Create and edit users</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-gray-800 dark:text-white">Assign Tasks</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage interventions</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-gray-800 dark:text-white">Technicians</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage technicians</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-gray-800 dark:text-white">Reports</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">View analytics</p>
            </div>
          </button>
        </div>
      </div>*/}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}