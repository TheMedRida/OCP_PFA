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
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'IN_PROGRESS': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'COMPLETED': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'ADMIN': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'TECHNICIAN': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'USER': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
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
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-slate-800/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 dark:border-slate-700/50 p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 dark:text-slate-400">Total Users</p>
              <p className="text-2xl font-bold text-white dark:text-white">{stats.totalUsers}</p>
              <p className="text-xs text-green-400 dark:text-green-400 mt-1">
                <UserCheck className="w-3 h-3 inline mr-1" />
                Active users
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        {/* Total Technicians */}
        <div className="bg-slate-800/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 dark:border-slate-700/50 p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 dark:text-slate-400">Technicians</p>
              <p className="text-2xl font-bold text-white dark:text-white">{stats.totalTechnicians}</p>
              <p className="text-xs text-blue-400 dark:text-blue-400 mt-1">
                <UserCheck className="w-3 h-3 inline mr-1" />
                Active technicians
              </p>
            </div>
            <Wrench className="w-8 h-8 text-green-500" />
          </div>
        </div>

        {/* Total Interventions */}
        <div className="bg-slate-800/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 dark:border-slate-700/50 p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 dark:text-slate-400">Total Interventions</p>
              <p className="text-2xl font-bold text-white dark:text-white">{stats.totalInterventions}</p>
              <p className="text-xs text-purple-400 dark:text-purple-400 mt-1">
                <Activity className="w-3 h-3 inline mr-1" />
                All time requests
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        {/* Pending Interventions */}
        <div className="bg-slate-800/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 dark:border-slate-700/50 p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 dark:text-slate-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.pendingInterventions}</p>
              <p className="text-xs text-yellow-400 dark:text-yellow-400 mt-1">
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
        <div className="bg-slate-800/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 dark:border-slate-700/50 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white dark:text-white">Pending</h3>
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-yellow-400 mb-2">{stats.pendingInterventions}</p>
          <p className="text-sm text-slate-300 dark:text-slate-300">Awaiting assignment</p>
        </div>

        <div className="bg-slate-800/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 dark:border-slate-700/50 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white dark:text-white">In Progress</h3>
            <AlertTriangle className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-400 mb-2">{stats.inprogressInterventions}</p>
          <p className="text-sm text-slate-300 dark:text-slate-300">Being worked on</p>
        </div>

        <div className="bg-slate-800/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700/50 dark:border-slate-700/50 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white dark:text-white">Completed</h3>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-400 mb-2">{stats.completedInterventions}</p>
          <p className="text-sm text-slate-300 dark:text-slate-300">Successfully resolved</p>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Interventions */}
        <div className="bg-slate-800/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 dark:border-slate-700/50 p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white dark:text-white mb-6">Recent Interventions</h2>
          
          {recentInterventions.length === 0 ? (
            <p className="text-center text-slate-300 dark:text-slate-300 py-8">No recent interventions</p>
          ) : (
            <div className="space-y-4">
              {recentInterventions.slice(0, 5).map((intervention) => (
                <div key={intervention.id} className="flex items-center space-x-4 p-3 bg-slate-700/50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-700/70 transition-colors border border-slate-600/50 dark:border-slate-600/50">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white dark:text-white truncate">
                      {intervention.title}
                    </p>
                    <p className="text-xs text-slate-300 dark:text-slate-300">
                      By {intervention.createdBy?.fullName} • {new Date(intervention.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(intervention.status)}`}>
                    {intervention.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="bg-slate-800/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 dark:border-slate-700/50 p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white dark:text-white mb-6">Recent Users</h2>
          
          {recentUsers.length === 0 ? (
            <p className="text-center text-slate-300 dark:text-slate-300 py-8">No recent users</p>
          ) : (
            <div className="space-y-4">
              {recentUsers.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center space-x-4 p-3 bg-slate-700/50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-700/70 transition-colors border border-slate-600/50 dark:border-slate-600/50">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === 'TECHNICIAN'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                        : 'bg-gradient-to-r from-green-500 to-green-600'
                        }`}>
                    <span className="text-white font-medium text-sm">
                      {user.fullName?.charAt(0) || user.email?.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white dark:text-white truncate">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-slate-300 dark:text-slate-300 truncate">
                      {user.email}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30">
          {error}
        </div>
      )}
    </div>
  );
}