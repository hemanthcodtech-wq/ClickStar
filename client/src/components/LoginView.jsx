import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import confetti from 'canvas-confetti';
import logoImg from '../assets/logo.png';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  CheckCircle2, 
  KeyRound, 
  ArrowRight,
  Eye, 
  EyeOff,
  Flame,
  ShieldCheck,
  Zap,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useUser } from '../context/UserContext';

const LoginView = () => {
  const { saveAuth } = useUser();
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'verify_signup' | 'forgot' | 'reset_password'

  // Form states
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Username validation states
  const [usernameStatus, setUsernameStatus] = useState(null); // null | 'checking' | 'available' | 'taken'
  const [usernameMsg, setUsernameMsg] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);

  const resetMessages = () => {
    setError(null);
    setInfoMessage(null);
  };

  const handleCheckUsername = async () => {
    if (!username || !username.trim()) {
      setUsernameStatus('taken');
      setUsernameMsg('Please enter a username first');
      return;
    }

    setUsernameStatus('checking');
    setUsernameMsg('');

    try {
      const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username.trim())}`);
      const data = await res.json();
      if (data.available) {
        setUsernameStatus('available');
        setUsernameMsg(data.message);
      } else {
        setUsernameStatus('taken');
        setUsernameMsg(data.message || 'Username is taken');
      }
    } catch (err) {
      setUsernameStatus('taken');
      setUsernameMsg('Could not verify username');
    }
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#fbbf24', '#a855f7'],
      });
    } catch (e) {
      // Ignore if canvas blocked
    }
  };

  // 1. Standard Login
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

      triggerCelebration();
      saveAuth(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Initiate Signup (Send OTP via Nodemailer)
  const handleInitiateSignup = async (e) => {
    e.preventDefault();
    resetMessages();

    // Enforce username verification check first
    if (usernameStatus !== 'available') {
      setError('Please click "Verify" on your username to confirm it is available before proceeding.');
      return;
    }

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

  // 3. Verify Signup OTP
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

      triggerCelebration();
      saveAuth(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Forgot Password
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

      if (data.email) setEmail(data.email);
      setInfoMessage(data.message);
      setMode('reset_password');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 5. Reset Password with OTP
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

  // 6. Continue with Google
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

      triggerCelebration();
      saveAuth(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background Animated Gradient Glow Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 -left-40 w-[480px] h-[480px] bg-rose-600/20 rounded-full blur-[140px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-40 -right-40 w-[480px] h-[480px] bg-amber-500/15 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[160px]"
        />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:28px_28px]" />
      </div>

      {/* Main Glassmorphic Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md bg-[#131315]/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-9 shadow-2xl shadow-black/80"
      >
        {/* Animated Brand Header */}
        <div className="text-center mb-7">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative inline-block mb-3.5 cursor-pointer"
          >
            <div className="absolute -inset-2 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 rounded-2xl blur-lg opacity-60 animate-pulse" />
            <img 
              src={logoImg} 
              alt="ClickStar" 
              className="relative w-16 h-16 rounded-2xl object-contain mx-auto shadow-xl ring-1 ring-white/20" 
            />
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-400 to-rose-500 p-1 rounded-full text-white shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          </motion.div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            ClickStar
          </h2>

          <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed max-w-xs mx-auto">
            {mode === 'login' && 'Log in to connect with creators and trending stars.'}
            {mode === 'signup' && 'Sign up to share moments & claim 100 bonus ClickStars.'}
            {mode === 'verify_signup' && 'Verify your email with the 6-digit code.'}
            {mode === 'forgot' && 'Reset your password via verified email.'}
            {mode === 'reset_password' && 'Enter your reset OTP and set a new password.'}
          </p>
        </div>

        {/* Notifications & Error Alerts */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium"
            >
              {error}
            </motion.div>
          )}

          {infoMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-start gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{infoMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FORM SWITCHER */}
        <AnimatePresence mode="wait">
          {/* 1. LOGIN FORM */}
          {mode === 'login' && (
            <motion.form 
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleLogin} 
              className="space-y-3.5"
            >
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Email or Username
                </label>
                <div className="relative group">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5 group-focus-within:text-rose-400 transition" />
                  <input
                    type="text"
                    required
                    placeholder="alex@gmail.com or alex_lens"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#18181b]/70 border border-white/10 rounded-2xl pl-10 pr-3.5 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/80 focus:ring-2 focus:ring-rose-500/20 transition"
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
                    className="text-[11px] text-zinc-400 hover:text-rose-400 transition"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5 group-focus-within:text-rose-400 transition" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#18181b]/70 border border-white/10 rounded-2xl pl-10 pr-10 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/80 focus:ring-2 focus:ring-rose-500/20 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-zinc-500 hover:text-zinc-300 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-semibold text-xs rounded-2xl shadow-xl shadow-rose-500/25 disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Log In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </motion.button>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                  <span className="bg-[#131315] px-3 text-zinc-500">Or continue with</span>
                </div>
              </div>

              {/* Continue with Google */}
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google Sign In failed')}
                  theme="filled_black"
                  shape="pill"
                  text="continue_with"
                />
              </div>
            </motion.form>
          )}

          {/* 2. SIGNUP FORM */}
          {mode === 'signup' && (
            <motion.form 
              key="signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleInitiateSignup} 
              className="space-y-3"
            >
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3 group-focus-within:text-rose-400 transition" />
                  <input
                    type="email"
                    required
                    placeholder="alex@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#18181b]/70 border border-white/10 rounded-2xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/80 focus:ring-2 focus:ring-rose-500/20 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Username
                </label>
                <div className="relative group">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3 group-focus-within:text-rose-400 transition" />
                  <input
                    type="text"
                    required
                    placeholder="alex_lens"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setUsernameStatus(null);
                      setUsernameMsg('');
                    }}
                    className={`w-full bg-[#18181b]/70 border rounded-2xl pl-10 pr-24 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 transition ${
                      usernameStatus === 'available'
                        ? 'border-emerald-500/80 focus:ring-emerald-500/20'
                        : usernameStatus === 'taken'
                        ? 'border-rose-500/80 focus:ring-rose-500/20'
                        : 'border-white/10 focus:border-rose-500/80 focus:ring-rose-500/20'
                    }`}
                  />

                  {/* Verify / Check Button */}
                  <div className="absolute right-1.5 top-1.5">
                    <button
                      type="button"
                      onClick={handleCheckUsername}
                      disabled={usernameStatus === 'checking' || !username.trim()}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer disabled:opacity-50 ${
                        usernameStatus === 'available'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : usernameStatus === 'taken'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                      }`}
                    >
                      {usernameStatus === 'checking' ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Checking...</span>
                        </>
                      ) : usernameStatus === 'available' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Available</span>
                        </>
                      ) : (
                        <span>Verify</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Validation message feedback */}
                {usernameMsg && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-[11px] mt-1.5 flex items-center gap-1 ${
                      usernameStatus === 'available' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {usernameStatus === 'available' ? (
                      <Check className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>{usernameMsg}</span>
                  </motion.p>
                )}
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
                  className="w-full bg-[#18181b]/70 border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/80 focus:ring-2 focus:ring-rose-500/20 transition"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3 group-focus-within:text-rose-400 transition" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Create secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#18181b]/70 border border-white/10 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/80 focus:ring-2 focus:ring-rose-500/20 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-zinc-500 hover:text-zinc-300 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                type="submit"
                disabled={loading || usernameStatus !== 'available'}
                className={`w-full mt-2 py-3 font-semibold text-xs rounded-2xl shadow-xl transition flex items-center justify-center gap-2 ${
                  usernameStatus === 'available'
                    ? 'bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-rose-500/25 cursor-pointer'
                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700/60 cursor-not-allowed opacity-60'
                }`}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : usernameStatus !== 'available' ? (
                  <span>Verify Username to Continue</span>
                ) : (
                  <>
                    <span>Continue with Email</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </motion.button>

              {/* Divider */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                  <span className="bg-[#131315] px-3 text-zinc-500">Or continue with</span>
                </div>
              </div>

              {/* Continue with Google */}
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google Sign In failed')}
                  theme="filled_black"
                  shape="pill"
                  text="continue_with"
                />
              </div>
            </motion.form>
          )}

          {/* 3. VERIFY SIGNUP OTP */}
          {mode === 'verify_signup' && (
            <motion.form 
              key="verify"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleVerifySignup} 
              className="space-y-4"
            >
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500/20 to-amber-500/20 border border-rose-500/30 flex items-center justify-center mx-auto mb-3 text-rose-400">
                  <KeyRound className="w-6 h-6 animate-pulse" />
                </div>
                <p className="text-xs text-zinc-400 mb-4">
                  We sent a 6-digit code to <br />
                  <span className="text-white font-bold">{email}</span>
                </p>

                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-52 mx-auto block tracking-[10px] text-center font-mono font-bold text-2xl bg-[#18181b] border-2 border-rose-500/50 rounded-2xl py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 transition"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-semibold text-xs rounded-2xl shadow-xl shadow-rose-500/25 disabled:opacity-40 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify & Claim Stars</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </>
                )}
              </motion.button>

              <div className="flex justify-between items-center text-xs text-zinc-500 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="hover:text-white transition"
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
            </motion.form>
          )}

          {/* 4. FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <motion.form 
              key="forgot"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleForgotPassword} 
              className="space-y-4"
            >
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Account Email
                </label>
                <div className="relative group">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5 group-focus-within:text-rose-400 transition" />
                  <input
                    type="email"
                    required
                    placeholder="alex@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#18181b]/70 border border-white/10 rounded-2xl pl-10 pr-3.5 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/80 focus:ring-2 focus:ring-rose-500/20 transition"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs rounded-2xl shadow-xl shadow-rose-500/25 disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Send Reset Code</span>
                )}
              </motion.button>
            </motion.form>
          )}

          {/* 5. RESET PASSWORD WITH OTP */}
          {mode === 'reset_password' && (
            <motion.form 
              key="reset_password"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleResetPassword} 
              className="space-y-3.5"
            >
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  6-Digit OTP Code
                </label>
                <div className="relative group">
                  <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5 group-focus-within:text-rose-400 transition" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-[#18181b]/70 border border-white/10 rounded-2xl pl-10 pr-3.5 py-3 text-xs text-white tracking-widest placeholder-zinc-500 focus:outline-none focus:border-rose-500/80 focus:ring-2 focus:ring-rose-500/20 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  New Password
                </label>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5 group-focus-within:text-rose-400 transition" />
                  <input
                    type="password"
                    required
                    placeholder="New secure password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#18181b]/70 border border-white/10 rounded-2xl pl-10 pr-3.5 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/80 focus:ring-2 focus:ring-rose-500/20 transition"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-semibold text-xs rounded-2xl shadow-xl shadow-rose-500/25 disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Update & Set Password</span>
                )}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Bottom Mode Switcher */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-zinc-400">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => { resetMessages(); setMode('signup'); }}
                className="font-semibold text-rose-400 hover:text-rose-300 transition hover:underline"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { resetMessages(); setMode('login'); }}
                className="font-semibold text-rose-400 hover:text-rose-300 transition hover:underline"
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LoginView;
