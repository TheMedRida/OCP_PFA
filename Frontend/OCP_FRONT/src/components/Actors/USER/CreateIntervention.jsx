import React, { useState, useEffect } from 'react';
import { Plus, AlertTriangle, Clock, CheckCircle, Eye, FileText, Search, Filter, ChevronLeft, ChevronRight, X, Calendar, User, UserCheck } from 'lucide-react';
import { useAuth } from '../../../Contexts/AuthContext';

export default function CreateIntervention() {
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Search and Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(2);

  const { token, user } = useAuth();

  // Form state for creating new intervention
  const [newIntervention, setNewIntervention] = useState({
    title: '',
    description: ''
  });

  useEffect(() => {
    fetchMyInterventions();
  }, []);

  const fetchMyInterventions = async () => {
    try {
      const response = await fetch('http://localhost:5455/api/interventions/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInterventions(data);
      } else {
        setError('Failed to load your interventions');
      }
    } catch (error) {
      console.error('Error fetching interventions:', error);
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIntervention = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5455/api/interventions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newIntervention)
      });

      if (response.ok) {
        const createdIntervention = await response.json();
        setInterventions(prev => [createdIntervention, ...prev]);
        setShowCreateModal(false);
        setNewIntervention({ title: '', description: '' });
        setSuccess('Intervention created successfully!');
        setTimeout(() => setSuccess(''), 5000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create intervention');
      }
    } catch (error) {
      console.error('Error creating intervention:', error);
      setError('Connection error');
    } finally {
      setIsCreating(false);
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

  // Filter and search interventions
  const filteredInterventions = interventions.filter(intervention => {
    const matchesSearch = intervention.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intervention.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || intervention.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredInterventions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInterventions = filteredInterventions.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Compact Header */}
      {/*<div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800 dark:text-white">My Interventions</h1>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New</span>
          </button>
        </div>
      </div>*/}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{interventions.length}</p>
            </div>
            <FileText className="w-8 h-8 text-gray-400" />
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

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-100 text-green-700 rounded-lg">
          {success}
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Interventions List with integrated Search and Filter */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        {/* Header with Search and Filter */}
        <div className="flex flex-col space-y-4 mb-6">
          {/* Title row with icon and add button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Your Interventions</h2>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Intervention</span>
            </button>
          </div>
          
          {/* Search and Filter Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search interventions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800 dark:text-white text-sm"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800 dark:text-white text-sm"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          {/* Results summary */}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {paginatedInterventions.length} of {filteredInterventions.length} interventions
          </div>
        </div>
        
        {filteredInterventions.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
              {searchTerm || filterStatus !== 'ALL' ? 'No matching interventions' : 'No interventions yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || filterStatus !== 'ALL' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Create your first intervention request to get started.'}
            </p>
            {!searchTerm && filterStatus === 'ALL' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
              >
                Create Intervention
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedInterventions.map((intervention) => (
              <div key={intervention.id} className="bg-white/5 rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-800 dark:text-white">{intervention.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(intervention.status)}`}>
                        {getStatusIcon(intervention.status)}
                        <span className="ml-1">{intervention.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{intervention.description}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                      <span>Created: {new Date(intervention.createdAt).toLocaleDateString()}</span>
                      {intervention.assignedTechnician && (
                        <span className="flex items-center space-x-1">
                          <span>Assigned to:</span>
                          <span className="font-medium text-blue-600 dark:text-blue-400">
                            {intervention.assignedTechnician.fullName}
                          </span>
                        </span>
                      )}
                      {intervention.completedAt && (
                        <span>Completed: {new Date(intervention.completedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button 
                      onClick={() => {
                        setSelectedIntervention(intervention);
                        setShowViewModal(true);
                      }}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
                    {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredInterventions.length)} of {filteredInterventions.length}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
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
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                {selectedIntervention.title}
              </h4>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {selectedIntervention.description}
                </p>
              </div>
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
                  <div className="w-9 h-9 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {selectedIntervention.createdBy?.fullName?.charAt(0) || user?.fullName?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                      {selectedIntervention.createdBy?.fullName || user?.fullName}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {selectedIntervention.createdBy?.email || user?.email}
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
                    <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
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
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-400 rounded-full flex items-center justify-center">
                      <UserCheck className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Not assigned yet</p>
                  </div>
                )}
              </div>

              {/* Creation Date */}
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

            {/* Progress Timeline */}
            <div className="mt-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h5 className="text-sm font-medium text-gray-800 dark:text-white mb-3">Progress Timeline</h5>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Created on {new Date(selectedIntervention.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {selectedIntervention.assignedTechnician && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Assigned to {selectedIntervention.assignedTechnician.fullName}
                    </span>
                  </div>
                )}
                {selectedIntervention.completedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Completed on {new Date(selectedIntervention.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Intervention Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-999 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Create New Intervention</h3>
            
            <form onSubmit={handleCreateIntervention} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Title</label>
                <input
                  type="text"
                  value={newIntervention.title}
                  onChange={(e) => setNewIntervention(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief description of the issue"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={newIntervention.description}
                  onChange={(e) => setNewIntervention(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of the problem and any relevant information"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  required
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  📝 Your intervention will be reviewed and assigned to a technician by an administrator.
                </p>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewIntervention({ title: '', description: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create Intervention'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}