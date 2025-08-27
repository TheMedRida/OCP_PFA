import { useAuth } from "../Contexts/AuthContext";
import { Navigate } from 'react-router-dom';

const RoleBasedRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading while auth state is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Role-based redirection
  switch (user.role) {
    case 'ADMIN':
      return <Navigate to="/admin/dashboard" replace />;
    case 'USER':
      return <Navigate to="/user/dashboard-sensors" replace />;
    case 'TECHNICIAN':
      return <Navigate to="/technician/dashboard-sensors" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default RoleBasedRedirect;


/*import { useAuth } from "../Contexts/AuthContext";
import { Navigate } from 'react-router-dom';

const RoleBasedRedirect = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'USER') return <Navigate to="/user/dashboard" replace />;
  if (user.role === 'TECHNICIAN') return <Navigate to="/technician/dashboard" replace />;

  return <Navigate to="/login" replace />;
};

export default RoleBasedRedirect;
*/