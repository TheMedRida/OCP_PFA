import { Bell, Filter, Menu, Plus, Search, Settings, Sun, ChevronDown, LogOut, User } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Header({ sidebarCollapsed, onToggleSidebar, user, onLogout }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
    setShowUserMenu(false);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setShowUserMenu(false);
  };

  const getRoleColor = (role) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'TECHNICIAN':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'USER':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getAvatarColor = (role) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return 'bg-gradient-to-br from-red-500 to-red-600 text-white ring-red-500/30';
      case 'TECHNICIAN':
        return 'bg-gradient-to-br from-blue-500 to-blue-600 text-white ring-blue-500/30';
      case 'USER':
        return 'bg-gradient-to-br from-green-500 to-green-600 text-white ring-green-500/30';
      default:
        return 'bg-gradient-to-br from-gray-500 to-gray-600 text-white ring-gray-500/30';
    }
  };

  const getUserInitial = () => {
    if (user?.fullName) {
      return user.fullName.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 px-6 py-4 relative z-[100]">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button 
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" 
            onClick={onToggleSidebar}
          > 
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden md:block">
            <h1 className="text-2xl font-black text-slate-800 dark:text-white">
              Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Welcome back, {user?.fullName || user?.email?.split('@')[0] || 'User'}! Here's what's happening today.
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">

          {/* Notifications */}
          <button className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {/* Theme Toggle */}
          <button className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Sun className="w-5 h-5" />
          </button>

          {/* User Profile Dropdown */}
          <div className="relative z-[9999]" style={{ zIndex: 9999 }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 pl-3 border-l border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-2 transition-colors"
            >
              {/* Avatar with Initial */}
              <div className={`w-8 h-8 rounded-full ring-2 flex items-center justify-center font-semibold text-sm ${getAvatarColor(user?.role)}`}>
                {getUserInitial()}
              </div>
              
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-800 dark:text-white">
                  {user?.fullName || user?.email?.split('@')[0] || 'User'}
                </p>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleColor(user?.role)}`}>
                    {user?.role || 'User'}
                  </span>
                  {user?.twoFactorEnabled && (
                    <span className="text-xs text-green-600 dark:text-green-400" title="2FA Enabled">
                      🔐
                    </span>
                  )}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-[9999]" style={{ zIndex: 9999 }}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-3 mb-2">
                    
                    <div>
                      <p className="font-medium text-slate-800 dark:text-white">
                        {user?.fullName || user?.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${getRoleColor(user?.role)}`}>
                    {user?.role || 'User'} Account
                  </span>
                </div>
                
                <div className="p-2">
                  <button 
                    onClick={handleProfileClick}
                    className="w-full flex items-center space-x-3 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile Settings</span>
                  </button>
                  
                  <hr className="my-2 border-slate-200 dark:border-slate-700" />
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-[9998]" 
          onClick={() => setShowUserMenu(false)}
          style={{ zIndex: 9998 }}
        />
      )}
    </div>
  );
}

export default Header;