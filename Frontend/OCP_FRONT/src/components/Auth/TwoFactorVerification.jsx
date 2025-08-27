import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '../../Contexts/AuthContext';

export default function TwoFactorVerification() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isResending, setIsResending] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const { sessionId, email } = location.state || {};

  // Redirect if no session data
  useEffect(() => {
    if (!sessionId || !email) {
      navigate('/login');
    }
  }, [sessionId, email, navigate]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    if (error) setError('');
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }
  
    setIsLoading(true);
    setError('');
  
    try {
      const response = await fetch(`http://localhost:5455/auth/two-factor/otp/${otpValue}?sessionId=${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
  
      if (response.ok) {
        const data = await response.json();
        
        if (data.jwt) {
          // Create user object
          const userData = {
            email: email,
            role: data.role,
            twoFactorEnabled: true
          };
          
          // Use login from AuthContext - AWAIT the result
          await login(userData, data.jwt);
          
          // Redirect to root path - RoleBasedRedirect will handle the navigation
          navigate('/', { replace: true });
          
        } else {
          setError('Verification failed. Please try again.');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Invalid OTP code');
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`http://localhost:5455/auth/two-factor/resend-otp?sessionId=${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess('New verification code sent to your email!');

        // Clear the current OTP inputs
        setOtp(['', '', '', '', '', '']);

        // Focus on first input
        const firstInput = document.getElementById('otp-0');
        if (firstInput) firstInput.focus();

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError('Connection error. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/50 via-transparent to-slate-900/50"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="backdrop-blur-xl bg-gray-900/40 border border-gray-700/50 rounded-2xl shadow-2xl p-8 shadow-black/20">
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

          {/* Back button */}
          <button
            onClick={() => navigate('/login')}
            className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Two-Factor Authentication</h1>
            <p className="text-gray-400">Enter the 6-digit code sent to your email</p>
            <p className="text-sm text-purple-400 mt-2">{email}</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-900/30 border border-green-700/50 rounded-xl text-green-300 text-sm backdrop-blur-sm">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-xl text-red-300 text-sm backdrop-blur-sm">
              {error}
            </div>
          )}

          {/* OTP Input */}
          <div className="flex justify-center space-x-3 mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="dark-input w-12 h-12 text-center text-2xl font-bold bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerifyOtp}
            disabled={isLoading}
            className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-green-700 hover:to-blue-700 transform hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mb-4"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Verifying...
              </div>
            ) : (
              'Verify Code'
            )}
          </button>

          {/* Resend Code */}
          <div className="text-center">
            <button
              onClick={handleResendOtp}
              disabled={isResending}
              className="text-purple-400 hover:text-purple-300 transition-colors duration-200 text-sm flex items-center justify-center mx-auto disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isResending ? 'animate-spin' : ''}`} />
              {isResending ? 'Resending...' : 'Resend Code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}