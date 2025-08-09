import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile from the API
  const fetchUserProfile = async (jwt) => {
    try {
      const response = await fetch('http://localhost:5455/api/users/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const userData = await response.json();
        return userData;
      } else {
        console.error('Failed to fetch user profile');
        return null;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Updated login function WITHOUT navigation - let components handle navigation
  const login = async (userData, jwt) => {
    try {
      // Store basic auth data first
      setToken(jwt);
      
      // Fetch complete user profile
      const fullUserProfile = await fetchUserProfile(jwt);
      
      let completeUser;
      if (fullUserProfile) {
        // Merge login data with profile data
        completeUser = {
          ...userData,
          ...fullUserProfile,
          // Ensure we keep the original email and role from login
          email: userData.email || fullUserProfile.email,
          role: userData.role || fullUserProfile.role 
        };
      } else {
        // Fallback to basic user data if profile fetch fails
        completeUser = userData;
      }
      
      setUser(completeUser);
      setIsAuthenticated(true);
      
      // Store in localStorage for persistence
      localStorage.setItem('authToken', jwt);
      localStorage.setItem('userData', JSON.stringify(completeUser));
      
      return completeUser; // Return user data for component to handle navigation
      
    } catch (error) {
      console.error('Login error:', error);
      // Still set basic user data even if profile fetch fails
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('authToken', jwt);
      localStorage.setItem('userData', JSON.stringify(userData));
      
      return userData; // Return user data even on error
    }
  };

  // Check for existing auth on app load
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('userData');
      
      if (storedToken && storedUser) {
        try {
          const storedUserData = JSON.parse(storedUser);
          
          // Verify token is still valid by fetching user profile
          const fullUserProfile = await fetchUserProfile(storedToken);
          
          if (fullUserProfile) {
            const completeUser = {
              ...storedUserData,
              ...fullUserProfile,
              email: storedUserData.email || fullUserProfile.email,
              role: storedUserData.role || fullUserProfile.role || 'USER'
            };
            
            setUser(completeUser);
            setToken(storedToken);
            setIsAuthenticated(true);
          } else {
            // Token invalid, clear auth
            clearAuth();
          }
        } catch (error) {
          console.error('Auth check error:', error);
          clearAuth();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Separate function for clearing auth without navigation
  const clearAuth = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  };

  // Logout function with navigation (can be called from components)
  const logout = () => {
    clearAuth();
    // Let components handle navigation or use window.location for forced redirect
    
    //window.location.href = '/login';
  };

  // Function to refresh user profile (useful after profile updates)
  const refreshUserProfile = async () => {
    if (token) {
      const updatedProfile = await fetchUserProfile(token);
      if (updatedProfile) {
        setUser(prevUser => ({
          ...prevUser,
          ...updatedProfile
        }));
        
        // Update localStorage with refreshed data
        localStorage.setItem('userData', JSON.stringify({
          ...user,
          ...updatedProfile
        }));
      }
    }
  };

  const value = {
    isAuthenticated,
    user,
    token,
    login,
    logout,
    isLoading,
    refreshUserProfile,
    clearAuth 
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};