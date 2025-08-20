import { BarChart3, Calendar, FileText, LayoutDashboard, MessageSquare, Package, Settings, ShoppingBag, Users, Zap, LogOut, Shield, User } from "lucide-react";
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Define menu items based on roles
const getMenuItemsByRole = (userRole) => {
  
  const adminItems = [
    {
      id: "/admin/dashboard",
      path: "/admin/dashboard", 
      icon: BarChart3,
      label: "Admin Dashboard",
      roles: ["ADMIN"]
    },
    {
      id: "/admin/users",
      path: "/admin/users",
      icon: Users,
      label: "User Management",
      roles: ["ADMIN"]
    },
    {
      id: "/admin/interventions", 
      path: "/admin/interventions",
      icon: Package,
      label: "Interventions",
      roles: ["ADMIN"]
    },
    {
      id: "/admin/dashboard-sensors",
      path: "/admin/dashboard-sensors", 
      icon: LayoutDashboard,
      label: "Dashboard",
      roles: ["ADMIN"]
    },
  ];

  const userItems = [
    {
      id: "/user/dashboard-sensors",
      path: "/user/dashboard-sensors", 
      icon: LayoutDashboard,
      label: "Dashboard",
      roles: ["USER"]
    },
    {
      id: "/user/create-intervention",
      path: "/user/create-intervention",
      icon: Package,
      label: "Create Intervention", 
      roles: ["USER"]
    }
  ];

  const technicianItems = [
    {
      id: "/technician/dashboard-sensors",
      path: "/technician/dashboard-sensors", 
      icon: LayoutDashboard,
      label: "Dashboard",
      roles: ["TECHNICIAN"]
    },
    {
      id: "/technician/intervention",
      path: "/technician/intervention", 
      icon: Package,
      label: "Intervention",
      roles: ["TECHNICIAN"]
    }
  ];

  // Filter items based on user role
  const allItems = [...adminItems, ...userItems, ...technicianItems];
  return allItems.filter(item => 
    item.roles.includes(userRole?.toUpperCase() || 'USER')
  );
};

function Sidebar({ collapsed, onToggle, userRole, user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = getMenuItemsByRole(userRole);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const isActive = (itemPath) => {
    return location.pathname === itemPath || 
           (itemPath === "/dashboard" && location.pathname === "/");
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
    <div className={`${collapsed ? "w-20" : "w-72"} transition-all duration-300 ease-in-out bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 flex flex-col relative z-10`}>
      {/* Logo */}
      <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">Nexus</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">OCP Orbital</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
              isActive(item.path)
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
            }`}
            onClick={() => handleNavigation(item.path)}
          >
            <div className="flex items-center space-x-3">
              <item.icon className="w-5 h-5" />
              {!collapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </div>
          </button>
        ))}
      </nav>

      {/* User Profile & Logout - Expanded */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50 space-y-3">
          {/* User Info */}
          <button
            onClick={handleProfileClick}
            className="w-full flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all duration-200"
          >
            <div className={`w-10 h-10 rounded-full ring-2 flex items-center justify-center font-semibold text-sm ${getAvatarColor(userRole)}`}>
              {getUserInitial()}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                {user?.fullName || user?.email?.split('@')[0] || 'User'}
              </p>
              <div className="flex items-center space-x-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleColor(userRole)}`}>
                  {userRole || 'User'}
                </span>
                {user?.twoFactorEnabled && (
                  <span className="text-xs text-green-600 dark:text-green-400" title="2FA Enabled">
                    🔐
                  </span>
                )}
              </div>
            </div>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 p-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      )}

      {/* User Profile & Logout - Collapsed */}
      {collapsed && (
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50 space-y-2">
          {/* User Avatar - Clickable */}
          <button
            onClick={handleProfileClick}
            className="flex justify-center w-full p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-200"
            title={`${user?.fullName || 'User'} - Click to view profile`}
          >
            <div className={`w-10 h-10 rounded-full ring-2 flex items-center justify-center font-semibold text-sm ${getAvatarColor(userRole)}`}>
              {getUserInitial()}
            </div>
          </button>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full p-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 flex justify-center"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default Sidebar;