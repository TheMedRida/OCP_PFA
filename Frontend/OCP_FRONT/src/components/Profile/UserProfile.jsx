import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Settings, Eye, EyeOff, Phone } from 'lucide-react';
import { useAuth } from '../../Contexts/AuthContext';

export default function Profile() {
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [showDisable2FA, setShowDisable2FA] = useState(false);
  const [showDisableOtpVerify, setShowDisableOtpVerify] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [verificationOtp, setVerificationOtp] = useState('');
  const [disableOtp, setDisableOtp] = useState('');
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  const [isDisabling2FA, setIsDisabling2FA] = useState(false);
  
  const { user } = useAuth();

  useEffect(() => {
    fetchUserProfile();
  }, []);

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
    if (userProfile?.fullName) {
      return userProfile.fullName.charAt(0).toUpperCase();
    }
    if (userProfile?.email) {
      return userProfile.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5455/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const profileData = await response.json();
        setUserProfile(profileData);
      } else {
        setError('Failed to load profile');
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      setError('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendVerificationOtp = async () => {
    setIsEnabling2FA(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5455/api/users/verification/EMAIL/send-otp', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setOtpSent(true);
        setError('');
      } else {
        setError('Failed to send verification code');
      }
    } catch (error) {
      setError('Connection error');
    } finally {
      setIsEnabling2FA(false);
    }
  };

  const handleEnable2FA = async () => {
    if (!verificationOtp) {
      setError('Please enter the verification code');
      return;
    }

    setIsEnabling2FA(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5455/api/users/enable-two-factor/verify-otp/${verificationOtp}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUserProfile(updatedUser);
        setShowTwoFactorSetup(false);
        setOtpSent(false);
        setVerificationOtp('');
        setError('Two-factor authentication enabled successfully!');
      } else {
        setError('Invalid verification code');
      }
    } catch (error) {
      setError('Connection error');
    } finally {
      setIsEnabling2FA(false);
    }
  };

  const handleSendDisableOtp = async () => {
    setIsDisabling2FA(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5455/api/users/verification/EMAIL/send-otp', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setShowDisable2FA(false);
        setShowDisableOtpVerify(true);
        setError('');
      } else {
        setError('Failed to send verification code');
      }
    } catch (error) {
      setError('Connection error');
    } finally {
      setIsDisabling2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!disableOtp) {
      setError('Please enter the verification code');
      return;
    }

    setIsDisabling2FA(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5455/api/users/disable-two-factor/verify-otp/${disableOtp}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUserProfile(updatedUser);
        setShowDisableOtpVerify(false);
        setDisableOtp('');
        setError('Two-factor authentication disabled successfully!');
      } else {
        setError('Invalid verification code');
      }
    } catch (error) {
      setError('Connection error');
    } finally {
      setIsDisabling2FA(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8">
          <div className="flex items-center space-x-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ring-4 ${getAvatarColor(userProfile?.role)}`}>
              <span className="text-2xl font-bold">{getUserInitial()}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                {userProfile?.fullName || 'User Profile'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 flex items-center mt-2">
                <Mail className="w-4 h-4 mr-2" />
                {userProfile?.email}
              </p>
              {userProfile?.role && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Role: {userProfile.role}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <Shield className="w-6 h-6 mr-3" />
            Security Settings
          </h2>

          {/* Two-Factor Authentication */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {userProfile?.twoFactorAuth?.enabled 
                    ? 'Your account is protected with 2FA' 
                    : 'Add an extra layer of security to your account'
                  }
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {userProfile?.twoFactorAuth?.enabled ? (
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                      Enabled
                    </span>
                    <button
                      onClick={() => setShowDisable2FA(true)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Disable
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowTwoFactorSetup(true)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    Enable
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <Settings className="w-6 h-6 mr-3" />
            Account Information
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Full Name
                </label>
                <p className="text-gray-800 dark:text-white font-medium">
                  {userProfile?.fullName || 'Not set'}
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Email Address
                </label>
                <p className="text-gray-800 dark:text-white font-medium">
                  {userProfile?.email}
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  Phone Number
                </label>
                <p className="text-gray-800 dark:text-white font-medium">
                  {userProfile?.tel || 'Not set'}
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Role
                </label>
                <p className="text-gray-800 dark:text-white font-medium">
                  {userProfile?.role || 'Not set'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2FA Setup Modal - MOVED OUTSIDE main container */}
      {showTwoFactorSetup && (
        <div className="fixed inset-0 z-999 bg-black/50  flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Enable Two-Factor Authentication</h3>
            
            {!otpSent ? (
              <div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  We'll send a verification code to your email address to enable 2FA.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowTwoFactorSetup(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendVerificationOtp}
                    disabled={isEnabling2FA}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors disabled:opacity-50"
                  >
                    {isEnabling2FA ? 'Sending...' : 'Send Code'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Enter the verification code sent to your email:
                </p>
                <input
                  type="text"
                  value={verificationOtp}
                  onChange={(e) => setVerificationOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {error && (
                  <p className="text-red-500 text-sm mb-4">{error}</p>
                )}
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowTwoFactorSetup(false);
                      setOtpSent(false);
                      setVerificationOtp('');
                      setError('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEnable2FA}
                    disabled={isEnabling2FA}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors disabled:opacity-50"
                  >
                    {isEnabling2FA ? 'Verifying...' : 'Verify & Enable'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Disable 2FA Confirmation Modal - MOVED OUTSIDE main container */}
      {showDisable2FA && (
        <div className="fixed inset-0 z-999 bg-black/50  flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400">Disable Two-Factor Authentication</h3>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to disable two-factor authentication? This will make your account less secure.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDisable2FA(false);
                  setError('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendDisableOtp}
                disabled={isDisabling2FA}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isDisabling2FA ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disable 2FA OTP Verification Modal - MOVED OUTSIDE main container */}
      {showDisableOtpVerify && (
        <div className="fixed inset-0 z-999 bg-black/50  flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400">Verify to Disable 2FA</h3>
            
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Enter the verification code sent to your email to disable 2FA:
            </p>
            <input
              type="text"
              value={disableOtp}
              onChange={(e) => setDisableOtp(e.target.value)}
              placeholder="Enter 6-digit code"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDisableOtpVerify(false);
                  setDisableOtp('');
                  setError('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDisable2FA}
                disabled={isDisabling2FA || !disableOtp}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isDisabling2FA ? 'Disabling...' : 'Disable 2FA'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}