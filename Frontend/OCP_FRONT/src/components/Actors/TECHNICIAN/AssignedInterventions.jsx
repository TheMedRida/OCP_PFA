import React, { useState, useEffect } from 'react';
import { Wrench, Clock, CheckCircle, User, Calendar, AlertTriangle, Eye, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../../Contexts/AuthContext';

export default function AssignedInterventions() {
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [completingId, setCompletingId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState(null);

  // Pagination state for Active Work Orders
  const [activeCurrentPage, setActiveCurrentPage] = useState(1);
  const [activeItemsPerPage] = useState(2);

  // Pagination state for Completed Work Orders
  const [completedCurrentPage, setCompletedCurrentPage] = useState(1);
  const [completedItemsPerPage] = useState(2);

  const { token, user } = useAuth();

  useEffect(() => {
    fetchAssignedInterventions();
  }, []);

  const fetchAssignedInterventions = async () => {
    try {
      const response = await fetch('http://localhost:5455/api/interventions/assigned', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInterventions(data);
      } else {
        setError('Failed to load assigned interventions');
      }
    } catch (error) {
      console.error('Error fetching interventions:', error);
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteIntervention = async (interventionId) => {
    setCompletingId(interventionId);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`http://localhost:5455/api/interventions/${interventionId}/complete`, {
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
        setSuccess('Intervention marked as completed successfully!');
        setTimeout(() => setSuccess(''), 5000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to complete intervention');
      }
    } catch (error) {
      console.error('Error completing intervention:', error);
      setError('Connection error');
    } finally {
      setCompletingId(null);
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

  const getPriorityColor = (createdAt) => {
    const daysSinceCreated = Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
    if (daysSinceCreated >= 7) return 'text-red-600';
    if (daysSinceCreated >= 3) return 'text-orange-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const inProgressInterventions = interventions.filter(i => i.status === 'IN_PROGRESS');
  const completedInterventions = interventions.filter(i => i.status === 'COMPLETED');

  // Pagination logic for Active Work Orders
  const activeTotalPages = Math.ceil(inProgressInterventions.length / activeItemsPerPage);
  const activeStartIndex = (activeCurrentPage - 1) * activeItemsPerPage;
  const paginatedActiveInterventions = inProgressInterventions.slice(activeStartIndex, activeStartIndex + activeItemsPerPage);

  // Pagination logic for Completed Work Orders
  const completedTotalPages = Math.ceil(completedInterventions.length / completedItemsPerPage);
  const completedStartIndex = (completedCurrentPage - 1) * completedItemsPerPage;
  const paginatedCompletedInterventions = completedInterventions.slice(completedStartIndex, completedStartIndex + completedItemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      {/*<div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Assigned Interventions</h1>
              <p className="text-gray-600 dark:text-gray-300">Manage and complete your assigned work orders</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back,</p>
            <p className="font-medium text-gray-800 dark:text-white">{user?.fullName}</p>
          </div>
        </div>
      </div>*/}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Assigned</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{interventions.length}</p>
            </div>
            <Wrench className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{inProgressInterventions.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedInterventions.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
              <p className="text-2xl font-bold text-purple-600">
                {interventions.length > 0 ? Math.round((completedInterventions.length / interventions.length) * 100) : 0}%
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-100 text-green-700 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* In Progress Interventions with Pagination */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-blue-500" />
            <span>Active Work Orders</span>
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {inProgressInterventions.length}
            </span>
          </h2>
        </div>
        
        {inProgressInterventions.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">All caught up!</h3>
            <p className="text-gray-600 dark:text-gray-400">You have no active interventions to work on.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Results summary */}
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Showing {activeStartIndex + 1}-{Math.min(activeStartIndex + activeItemsPerPage, inProgressInterventions.length)} of {inProgressInterventions.length} active interventions
            </div>

            {paginatedActiveInterventions.map((intervention) => (
              <div key={intervention.id} className="bg-white/5 rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-800 dark:text-white">{intervention.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(intervention.status)}`}>
                        {getStatusIcon(intervention.status)}
                        <span className="ml-1">{intervention.status.replace('_', ' ')}</span>
                      </span>
                      <span className={`text-xs font-medium ${getPriorityColor(intervention.createdAt)}`}>
                        {Math.floor((new Date() - new Date(intervention.createdAt)) / (1000 * 60 * 60 * 24))} days old
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{intervention.description}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>Requested by: {intervention.createdBy?.fullName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Created: {new Date(intervention.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedIntervention(intervention);
                        setShowDetailsModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCompleteIntervention(intervention.id)}
                      disabled={completingId === intervention.id}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                      title="Mark as Completed"
                    >
                      {completingId === intervention.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      <span>{completingId === intervention.id ? 'Completing...' : 'Complete'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Active Interventions Pagination */}
            {activeTotalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Page {activeCurrentPage} of {activeTotalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={activeCurrentPage === 1}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
                    {activeStartIndex + 1}-{Math.min(activeStartIndex + activeItemsPerPage, inProgressInterventions.length)} of {inProgressInterventions.length}
                  </span>
                  <button
                    onClick={() => setActiveCurrentPage(prev => Math.min(prev + 1, activeTotalPages))}
                    disabled={activeCurrentPage === activeTotalPages}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Completed Interventions with Pagination */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>Completed Work Orders</span>
            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
              {completedInterventions.length}
            </span>
          </h2>
        </div>
        
        {completedInterventions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">No completed interventions yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Results summary */}
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Showing {completedStartIndex + 1}-{Math.min(completedStartIndex + completedItemsPerPage, completedInterventions.length)} of {completedInterventions.length} completed interventions
            </div>

            {paginatedCompletedInterventions.map((intervention) => (
              <div key={intervention.id} className="bg-white/5 rounded-xl border border-white/10 p-4 opacity-75">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-md font-medium text-gray-800 dark:text-white">{intervention.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(intervention.status)}`}>
                        {getStatusIcon(intervention.status)}
                        <span className="ml-1">Completed</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>{intervention.createdBy?.fullName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Completed: {new Date(intervention.completedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedIntervention(intervention);
                      setShowDetailsModal(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Completed Interventions Pagination */}
            {completedTotalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Page {completedCurrentPage} of {completedTotalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCompletedCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={completedCurrentPage === 1}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
                    {completedStartIndex + 1}-{Math.min(completedStartIndex + completedItemsPerPage, completedInterventions.length)} of {completedInterventions.length}
                  </span>
                  <button
                    onClick={() => setCompletedCurrentPage(prev => Math.min(prev + 1, completedTotalPages))}
                    disabled={completedCurrentPage === completedTotalPages}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedIntervention && (
  <div className="fixed inset-0 z-999 bg-black/50 flex items-center justify-center p-4">
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">Intervention Details</h3>
        <button
          onClick={() => setShowDetailsModal(false)}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          ×
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
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
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
            Requested By
          </h5>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
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

        {/* Age */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <h5 className="text-sm font-medium text-gray-800 dark:text-white mb-3 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Time Elapsed
          </h5>
          <p className={`text-sm font-medium ${getPriorityColor(selectedIntervention.createdAt)}`}>
            {Math.floor((new Date() - new Date(selectedIntervention.createdAt)) / (1000 * 60 * 60 * 24))} days old
          </p>
        </div>

        {/* Creation Date */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <h5 className="text-sm font-medium text-gray-800 dark:text-white mb-3 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Created
          </h5>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(selectedIntervention.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Completion Date */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
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

      {/* Actions */}
      <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowDetailsModal(false)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
        >
          Close
        </button>
        {selectedIntervention.status === 'IN_PROGRESS' && (
          <button
            onClick={() => {
              setShowDetailsModal(false);
              handleCompleteIntervention(selectedIntervention.id);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Mark as Completed
          </button>
        )}
      </div>
    </div>
  </div>
)}
    </div>
  );
}