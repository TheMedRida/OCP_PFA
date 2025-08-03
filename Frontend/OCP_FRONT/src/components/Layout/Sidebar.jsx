import { BarChart3, Calendar, ChevronDown, CreditCard, FileText, LayoutDashboard, MessageSquare, Package, Settings, ShoppingBag, Users, Zap, LogOut, Shield } from "lucide-react";
import React, { useState } from "react";

// Define menu items based on roles
const getMenuItemsByRole = (userRole) => {
  const baseItems = [
    {
      id: "dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      active: true,
      roles: ["ADMIN", "USER", "MANAGER", "VIEWER"]
    }
  ];

  const adminItems = [
    {
      id: "analytics",
      icon: BarChart3,
      label: "Analytics",
      roles: ["ADMIN", "MANAGER"],
      submenu: [
        { id: "overview", label: "Overview" },
        { id: "reports", label: "Reports" },
        { id: "insights", label: "Insights" }
      ]
    },
    {
      id: "users",
      icon: Users,
      label: "User Management",
      count: "2.4k",
      roles: ["ADMIN"],
      submenu: [
        { id: "all-users", label: "All Users" },
        { id: "roles", label: "Roles & Permissions" },
        { id: "activity", label: "User Activity" }
      ]
    },
    {
      id: "ecommerce",
      icon: ShoppingBag,
      label: "E-commerce",
      roles: ["ADMIN", "MANAGER"],
      submenu: [
        { id: "products", label: "Products" },
        { id: "orders", label: "Orders" },
        { id: "customers", label: "Customers" }
      ]
    },
    {
      id: "inventory",
      icon: Package,
      label: "Inventory",
      count: "847",
      roles: ["ADMIN", "MANAGER", "USER"]
    },
    {
      id: "transactions",
      icon: CreditCard,
      label: "Transactions",
      roles: ["ADMIN", "MANAGER"]
    },
    {
      id: "messages",
      icon: MessageSquare,
      label: "Messages",
      badge: "12",
      roles: ["ADMIN", "USER", "MANAGER"]
    },
    {
      id: "calendar",
      icon: Calendar,
      label: "Calendar",
      roles: ["ADMIN", "USER", "MANAGER", "VIEWER"]
    },
    {
      id: "reports",
      icon: FileText,
      label: "Reports",
      roles: ["ADMIN", "MANAGER"]
    },
    {
      id: "security",
      icon: Shield,
      label: "Security",
      roles: ["ADMIN"],
      submenu: [
        { id: "two-factor", label: "Two-Factor Auth" },
        { id: "audit-logs", label: "Audit Logs" },
        { id: "permissions", label: "Permissions" }
      ]
    },
    {
      id: "settings",
      icon: Settings,
      label: "Settings",
      roles: ["ADMIN", "MANAGER"]
    }
  ];

  // Filter items based on user role
  const allItems = [...baseItems, ...adminItems];
  return allItems.filter(item => 
    item.roles.includes(userRole?.toUpperCase() || 'USER')
  );
};

function Sidebar({ collapsed, onToggle, currentPage, onPageChange, userRole, user, onLogout }) {
  const [expandedItems, setExpandedItems] = useState(new Set(["analytics"]));

  const toggleExpanded = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const menuItems = getMenuItemsByRole(userRole);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
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
              <p className="text-xs text-slate-500 dark:text-slate-400">Admin Panel</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <div key={item.id}>
            <button
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                currentPage === item.id || item.active
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
              }`}
              onClick={() => {
                if (item.submenu) {
                  toggleExpanded(item.id);
                } else {
                  onPageChange(item.id);
                }
              }}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5" />
                {!collapsed && (
                  <>
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {item.count && (
                      <span className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
                        {item.count}
                      </span>
                    )}
                  </>
                )}
              </div>
              {!collapsed && item.submenu && (
                <ChevronDown 
                  className={`w-4 h-4 transition-transform ${
                    expandedItems.has(item.id) ? 'rotate-180' : ''
                  }`} 
                />
              )}
            </button>

            {/* Submenu */}
            {!collapsed && item.submenu && expandedItems.has(item.id) && (
              <div className="ml-8 mt-2 space-y-1">
                {item.submenu.map((subitem) => (
                  <button
                    key={subitem.id}
                    className="w-full text-left p-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-all"
                    onClick={() => onPageChange(subitem.id)}
                  >
                    {subitem.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User Profile & Logout */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50 space-y-3">
          {/* User Info */}
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <img
              src={user?.avatar || "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2"}
              alt="user"
              className="w-10 h-10 rounded-full ring-2 ring-blue-500"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                {user?.fullName || user?.email || 'User'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {userRole || 'User'}
              </p>
            </div>
          </div>

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

      {/* Collapsed Logout Button */}
      {collapsed && (
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50">
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