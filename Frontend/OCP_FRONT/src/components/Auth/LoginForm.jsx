import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, LogIn, Mail, Phone, ChevronDown } from 'lucide-react';
import { useAuth } from '../../Contexts/AuthContext';

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { isAuthenticated, login, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();


  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.email-input-container')) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show loading while auth state is being determined
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (error) setError('');
    
    // Show suggestions for username field
    if (name === 'username') {
      setShowSuggestions(value.length > 0);
    }
  };


  const handleSubmit = async () => {
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
  
    setIsLoading(true);
    setError('');
  
    try {
      const response = await fetch('http://localhost:5455/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.username,
          password: formData.password
        })
      });
  
      const data = await response.json();
      
      if (response.ok) {
        // Check if two-factor auth is enabled
        if (data.twoFactorAuthEnabled) {
          navigate('/verify-2fa', { 
            state: { 
              sessionId: data.session, 
              email: formData.username,
              role: data.role 
            },
            replace: true
          });
          return;
        }
  
        // For successful login without 2FA
        if (data.status && data.jwt) {
          const userData = {
            email: formData.username,
            role: data.role
          };
  
          await login(userData, data.jwt);
          
          // Redirect to root path - RoleBasedRedirect will handle navigation
          navigate('/', { replace: true });
        } else {
          setError(data.message || 'Login failed');
        }
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleContactAdmin = () => {
    setShowContactInfo(!showContactInfo);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center p-4">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
        
        {/* Additional dark mode elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/50 via-transparent to-slate-900/50"></div>
      </div>

      {/* Login Form Container */}
      <div className="relative w-full max-w-md">
        <div className="backdrop-blur-xl bg-gray-900/40 border border-gray-700/50 rounded-2xl shadow-2xl p-8 shadow-black/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl mb-4 shadow-lg">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400">Sign in to your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-xl text-red-300 text-sm backdrop-blur-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <div className="space-y-6">
            {/* Username Input with Suggestions */}
            <div className="relative email-input-container">
              <style>
                {`
                  .dark-input {
                    background-color: #1f2937 !important;
                    color: #ffffff !important;
                  }
                  .dark-input:-webkit-autofill,
                  .dark-input:-webkit-autofill:hover,
                  .dark-input:-webkit-autofill:focus,
                  .dark-input:-webkit-autofill:active {
                    -webkit-box-shadow: 0 0 0 30px #1f2937 inset !important;
                    -webkit-text-fill-color: #ffffff !important;
                    background-color: #1f2937 !important;
                    color: #ffffff !important;
                  }
                `}
              </style>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                onFocus={() => setShowSuggestions(formData.username.length > 0)}
                className="dark-input w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                placeholder="Email"
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="w-full pl-12 pr-12 py-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 transition-all duration-200 backdrop-blur-sm"
                placeholder="Password"
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors duration-200"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  className="mr-2 rounded border-gray-600 bg-gray-800/50 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 focus:ring-offset-gray-900"
                  disabled={isLoading}
                />
                Remember me
              </label>
              <button
                onClick={() => navigate('/forgot-password')}
                className="text-purple-400 hover:text-purple-300 transition-colors duration-200"
                disabled={isLoading}
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-cyan-700 transform hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-gray-400 text-sm mb-3">
              Don't have an account?{' '}
              <button 
                onClick={handleContactAdmin}
                className="text-purple-400 hover:text-purple-300 transition-colors duration-200 font-medium inline-flex items-center"
                disabled={isLoading}
              >
                Contact Admin
                <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${showContactInfo ? 'rotate-180' : ''}`} />
              </button>
            </p>

            {/* Contact Information */}
            {showContactInfo && (
              <div className="mt-4 p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl backdrop-blur-sm transition-all duration-300 ease-in-out">
                <h3 className="text-white font-medium mb-3">Admin Contact Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-center text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer">
                    <Mail className="w-4 h-4 mr-3 text-purple-400" />
                    <span>onnnonnono@gmail.com</span>
                  </div>
                  <div className="flex items-center justify-center text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer">
                    <Phone className="w-4 h-4 mr-3 text-purple-400" />
                    <span>+ (212) 679885736</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}