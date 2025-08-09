import React, { useState, useEffect } from 'react';
import { Plus, AlertTriangle, Clock, CheckCircle, Eye, FileText } from 'lucide-react';
import { useAuth } from '../../../Contexts/AuthContext';

export default function CreateIntervention() {
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

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
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Interventions</h1>
              <p className="text-gray-600 dark:text-gray-300">Create and track your intervention requests</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>New Intervention</span>
          </button>
        </div>
      </div>

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

      {/* Interventions List */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Your Interventions</h2>
        
        {interventions.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No interventions yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first intervention request to get started.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
            >
              Create Intervention
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {interventions.map((intervention) => (
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
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{intervention.description}</p>
                    
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
                    <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Intervention Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-999 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-6">Create New Intervention</h3>
            
            <form onSubmit={handleCreateIntervention} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={newIntervention.title}
                  onChange={(e) => setNewIntervention(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief description of the issue"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newIntervention.description}
                  onChange={(e) => setNewIntervention(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of the problem and any relevant information"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  required
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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