import React, { useState } from 'react';
import { useAuth } from '../../Contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = ({ children }) => {
  const [sideBarCollapsed, setSideBarCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const toggleSidebar = () => {
    setSideBarCollapsed(!sideBarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all duration-500">
      <div className="flex h-screen overflow-hidden">
        <Sidebar 
          collapsed={sideBarCollapsed}
          onToggle={toggleSidebar}
          userRole={user?.role}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            sidebarCollapsed={sideBarCollapsed}
            onToggleSidebar={toggleSidebar}
            user={user}
            onLogout={logout}
          />
          
          <main className="flex-1 overflow-y-auto bg-transparent">
            <div className="p-6 space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;