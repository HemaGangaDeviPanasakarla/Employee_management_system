import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, register } = useAuth();

  // Mode: 'signin' or 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Sign In fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<'Employee' | 'Manager'>('Employee');

  // Feedback states
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!loginEmail.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!validateEmail(loginEmail.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!loginPassword) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    const result = await login(loginEmail.trim(), loginPassword);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Failed to authenticate. Please check your credentials.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validation
    if (!regName.trim()) {
      setError('Full Name is required.');
      return;
    }
    if (!regEmail.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!validateEmail(regEmail.trim())) {
      setError('Please enter a valid email format (e.g. user@company.com).');
      return;
    }
    if (!regPassword) {
      setError('Password is required.');
      return;
    }
    if (regPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    setLoading(true);
    const result = await register({
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      confirm_password: regConfirmPassword,
      role: regRole,
      department: regRole === 'Manager' ? 'Management' : 'Engineering',
    });
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Registration failed. Please try again.');
    } else {
      // Clear registration form and switch to sign in
      setSuccessMessage('Account registered successfully! Please sign in with your credentials.');
      setLoginEmail(regEmail.trim());
      setLoginPassword('');
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');
      setRegRole('Employee');
      setAuthMode('signin');
    }
  };

  return (
    <div className="min-h-screen bg-[#161922] flex items-center justify-center p-6 text-slate-100 font-sans">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Side: Brand & Feature Highlights */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff5722]/15 text-[#ff7844] border border-[#ff5722]/30 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#ff5722]"></span>
            <span>Role-Based Workspace • PostgreSQL</span>
          </div>

          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-3">
              Employee Managemnent
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              Enterprise Employee and Manager Management System. Built with role-based access control, real-time database persistence, and granular team delegation.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-2xl bg-[#1c202d] border border-[#2c3245] space-y-1.5">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <span>👤</span>
                <span>Employee Experience</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Submit daily work timesheets, track personal and manager-assigned tasks, record check-in/check-out attendance, and manage leave requests.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#1c202d] border border-[#2c3245] space-y-1.5">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                <span>👑</span>
                <span>Manager Intelligence</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Includes all employee features plus the exclusive <strong>My Team</strong> portal for project monitoring, team task assignment, and member workload tracking.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#1c202d] border border-[#2c3245] space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <span>🔒</span>
                <span>Database-Backed Security</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                All employee accounts, projects, tasks, attendance records, and timesheets are securely stored and retrieved directly from the database.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Card (Sign In / Sign Up) */}
        <div className="bg-[#202433] border border-[#2c3245] rounded-3xl p-8 sm:p-10 shadow-2xl animate-pop">
          {/* Auth Mode Toggle Tabs */}
          <div className="grid grid-cols-2 p-1 mb-6 rounded-2xl bg-[#161922] border border-[#2c3245]">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setError('');
              }}
              className={`py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${authMode === 'signin'
                  ? 'bg-[#ff5722] text-white shadow-md shadow-[#ff5722]/20'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setError('');
              }}
              className={`py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${authMode === 'signup'
                  ? 'bg-[#ff5722] text-white shadow-md shadow-[#ff5722]/20'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              Create Account
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-black text-white tracking-tight mb-1">
              {authMode === 'signin' ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p className="text-xs text-slate-400">
              {authMode === 'signin'
                ? 'Sign in with your email and password to access your dashboard.'
                : 'Register as an Employee or Manager to get started.'}
            </p>
          </div>

          {error && (
            <div className="p-3.5 mb-5 text-xs font-semibold text-rose-400 bg-rose-950/40 border border-rose-800/60 rounded-xl">
              ⚠️ {error}
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 mb-5 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 rounded-xl">
              ✓ {successMessage}
            </div>
          )}

          {/* SIGN IN FORM */}
          {authMode === 'signin' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider"
                >
                  Work Email *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    ✉️
                  </span>
                  <input
                    id="email"
                    type="email"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#181b24] text-white border border-[#2c3245] rounded-xl focus:outline-none focus:border-[#ff5722] transition-all font-medium placeholder-slate-500"
                    placeholder="name@company.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider"
                >
                  Password *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    🔒
                  </span>
                  <input
                    id="password"
                    type="password"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#181b24] text-white border border-[#2c3245] rounded-xl focus:outline-none focus:border-[#ff5722] transition-all font-medium placeholder-slate-500"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 mt-2 bg-[#ff5722] hover:bg-[#f44914] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#ff5722]/25 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-75 cursor-pointer"
              >
                {loading ? 'Authenticating...' : 'Sign In to Dashboard →'}
              </button>

              <div className="pt-4 border-t border-[#2c3245] text-center text-xs text-slate-400">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setError('');
                  }}
                  className="text-[#ff7844] hover:text-[#ff5722] font-bold cursor-pointer underline"
                >
                  Sign Up Here
                </button>
              </div>
            </form>
          ) : (
            /* SIGN UP FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emily Watson"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#181b24] text-white border border-[#2c3245] rounded-xl focus:outline-none focus:border-[#ff5722] transition-all font-medium placeholder-slate-500"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Work Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. emily.watson@company.com"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#181b24] text-white border border-[#2c3245] rounded-xl focus:outline-none focus:border-[#ff5722] transition-all font-medium placeholder-slate-500"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>

              {/* Account Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Account Role *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRegRole('Employee')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${regRole === 'Employee'
                        ? 'border-[#ff5722] bg-[#ff5722]/15 text-white'
                        : 'border-[#2c3245] bg-[#181b24] text-slate-400 hover:text-white'
                      }`}
                  >
                    <div className="text-xs font-bold">👤 Employee</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Tasks & Timesheet</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('Manager')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${regRole === 'Manager'
                        ? 'border-amber-500 bg-amber-500/15 text-white'
                        : 'border-[#2c3245] bg-[#181b24] text-slate-400 hover:text-white'
                      }`}
                  >
                    <div className="text-xs font-bold">👑 Manager</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Manage Team & Projects</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min 4 characters"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#181b24] text-white border border-[#2c3245] rounded-xl focus:outline-none focus:border-[#ff5722] transition-all font-medium placeholder-slate-500"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#181b24] text-white border border-[#2c3245] rounded-xl focus:outline-none focus:border-[#ff5722] transition-all font-medium placeholder-slate-500"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 mt-2 bg-[#ff5722] hover:bg-[#f44914] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#ff5722]/25 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-75 cursor-pointer"
              >
                {loading ? 'Creating Account...' : 'Complete Sign Up →'}
              </button>

              <div className="pt-4 border-t border-[#2c3245] text-center text-xs text-slate-400">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setError('');
                  }}
                  className="text-[#ff7844] hover:text-[#ff5722] font-bold cursor-pointer underline"
                >
                  Sign In Here
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
