import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Sparkles, Mail, Lock, User, ArrowRight, X, KeyRound, CheckCircle2 } from 'lucide-react';
import { useUser } from '../context/UserContext';

const AuthModal = ({ isOpen, onClose }) => {
  const { saveAuth } = useUser();
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'verify_signup' | 'forgot' | 'reset_password'

  // Form states
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otp, setOtp] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);

  if (!isOpen) return null;

  const resetMessages = () => {
    setError(null);
    setInfoMessage(null);
  };

  // Standard Login
  const handleLogin = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId: email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Login failed');

      saveAuth(data.user, data.token);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initiate Signup (Send OTP)
  const handleInitiateSignup = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password, full_name: fullName }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Signup failed');

      setInfoMessage(data.message);
      setMode('verify_signup');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Verify Signup OTP
  const handleVerifySignup = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Verification failed');

      saveAuth(data.user, data.token);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password (Send OTP)
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Request failed');

      setInfoMessage(data.message);
      setMode('reset_password');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset Password with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Reset failed');

      setInfoMessage('Password successfully updated! Please log in.');
      setMode('login');
      setPassword('');
      setOtp('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Google Login Success
  const handleGoogleSuccess = async (credentialResponse) => {
    resetMessages();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Google Auth failed');

      saveAuth(data.user, data.token);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#141414] border border-[#282828] rounded-3xl overflow-hidden shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Logo & Heading */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-2.5 rounded-2xl shadow-lg shadow-rose-500/20 mb-3">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">ClickStar</h2>
            <p className="text-xs text-zinc-400 mt-1">
              {mode === 'login' && 'Sign in to connect with creators'}
              {mode === 'signup' && 'Create your account & earn 100 ClickStars'}
              {mode === 'verify_signup' && 'Enter the 6-digit code sent to your email'}
              {mode === 'forgot' && 'Reset your account password via email'}
              {mode === 'reset_password' && 'Enter your verification code and new password'}
            </p>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs leading-relaxed">
              {error}
            </div>
          )}

          {infoMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Email or Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="name@example.com or @username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { resetMessages(); setMode('forgot'); }}
                    className="text-[11px] text-rose-400 hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-rose-500/20 disabled:opacity-50 transition"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#262626]" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-[#141414] px-2 text-zinc-500">Or continue with</span>
                </div>
              </div>

              {/* Google OAuth Button */}
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google Sign In failed')}
                  theme="filled_black"
                  shape="pill"
                  text="continue_with"
                />
              </div>

              <p className="text-center text-xs text-zinc-400 pt-3">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { resetMessages(); setMode('signup'); }}
                  className="font-semibold text-rose-400 hover:underline"
                >
                  Sign up
                </button>
              </p>
            </form>
          )}

          {/* 2. SIGNUP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleInitiateSignup} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="alex@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="alex_creator"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Alex Rivera"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-rose-500/20 disabled:opacity-50 transition"
              >
                {loading ? 'Sending verification code...' : 'Continue with Email'}
              </button>

              {/* Divider */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#262626]" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-[#141414] px-2 text-zinc-500">Or continue with</span>
                </div>
              </div>

              {/* Google Button */}
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google Sign In failed')}
                  theme="filled_black"
                  shape="pill"
                  text="continue_with"
                />
              </div>

              <p className="text-center text-xs text-zinc-400 pt-2">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { resetMessages(); setMode('login'); }}
                  className="font-semibold text-rose-400 hover:underline"
                >
                  Log in
                </button>
              </p>
            </form>
          )}

          {/* 3. VERIFY SIGNUP OTP */}
          {mode === 'verify_signup' && (
            <form onSubmit={handleVerifySignup} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2 text-center">
                  Enter 6-digit Code sent to <span className="text-white font-bold">{email}</span>
                </label>
                <div className="relative max-w-[200px] mx-auto">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full tracking-[10px] text-center font-mono font-bold text-xl bg-[#1e1e1e] border-2 border-rose-500/40 rounded-xl py-2.5 text-white placeholder-zinc-700 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-rose-500/20 disabled:opacity-40 transition"
              >
                {loading ? 'Verifying...' : 'Complete Sign Up'}
              </button>

              <div className="flex justify-between items-center text-xs text-zinc-400 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-zinc-500 hover:text-white"
                >
                  Change email
                </button>
                <button
                  type="button"
                  onClick={handleInitiateSignup}
                  className="text-rose-400 hover:underline"
                >
                  Resend code
                </button>
              </div>
            </form>
          )}

          {/* 4. FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="alex@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-rose-500/20 disabled:opacity-50 transition"
              >
                {loading ? 'Sending code...' : 'Send Reset Code'}
              </button>

              <p className="text-center text-xs text-zinc-400 pt-3">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => { resetMessages(); setMode('login'); }}
                  className="font-semibold text-rose-400 hover:underline"
                >
                  Back to login
                </button>
              </p>
            </form>
          )}

          {/* 5. RESET PASSWORD WITH OTP */}
          {mode === 'reset_password' && (
            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  6-Digit OTP Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl pl-10 pr-3 py-2.5 text-xs text-white tracking-widest placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full mt-2 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-rose-500/20 disabled:opacity-50 transition"
              >
                {loading ? 'Updating password...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

