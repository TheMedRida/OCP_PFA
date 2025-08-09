
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

