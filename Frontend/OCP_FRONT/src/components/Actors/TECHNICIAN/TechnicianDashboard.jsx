import React, { useState, useEffect } from 'react';
import { Wrench, AlertTriangle, Clock, CheckCircle, Eye, Check, User } from 'lucide-react';
import { useAuth } from '../../../Contexts/AuthContext';

export default function TechnicianDashboard() {
  const [assignedInterventions, setAssignedInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [completingId, setCompletingId] = useState(null);

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
        setAssignedInterventions(data);
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
        setAssignedInterventions(prev => 
          prev.map(intervention => 
            intervention.id === updatedIntervention.id ? updatedIntervention : intervention
          )
        );
        setSuccess('Intervention marked as completed successfully!');
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError('Failed to complete intervention');
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
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Technician Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Welcome back, {user?.fullName}!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Assigned</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{assignedInterventions.length}</p>
            </div>
            <Wrench className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">
                {assignedInterventions.filter(i => i.status === 'IN_PROGRESS').length}
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
                {assignedInterventions.filter(i => i.status === 'COMPLETED').length}
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

      {/* Assigned Interventions */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Assigned Interventions</h2>
        
        {assignedInterventions.length === 0 ? (
          <div className="text-center py-12">
            <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No interventions assigned</h3>
            <p className="text-gray-600 dark:text-gray-400">You don't have any interventions assigned to you yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignedInterventions.map((intervention) => (
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
                    
                    {/* Created By Info */}
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white">
                          Created by: {intervention.createdBy?.fullName}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {intervention.createdBy?.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                      <span>Created: {new Date(intervention.createdAt).toLocaleDateString()}</span>
                      {intervention.completedAt && (
                        <span>Completed: {new Date(intervention.completedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    {intervention.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleCompleteIntervention(intervention.id)}
                        disabled={completingId === intervention.id}
                        className="flex items-center space-x-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        <span>{completingId === intervention.id ? 'Completing...' : 'Complete'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white">Priority Tasks</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">View high priority interventions</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white">Completed Work</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Review completed interventions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Recent Activity</h2>
        
        <div className="space-y-4">
          {assignedInterventions
            .filter(intervention => intervention.status === 'COMPLETED')
            .slice(0, 3)
            .map((intervention) => (
              <div key={intervention.id} className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    Completed: {intervention.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {new Date(intervention.completedAt).toLocaleDateString()}
                  </p>
                </div>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
            ))}
          
          {assignedInterventions.filter(i => i.status === 'COMPLETED').length === 0 && (
            <p className="text-center text-gray-600 dark:text-gray-400 py-4">
              No completed interventions yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}