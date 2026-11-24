import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import type { Employee } from '../types';

export const LoginPage: React.FC = () => {
  const { login, switchUser } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredEmployees, setRegisteredEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    apiService
      .getAllEmployees()
      .then((employees) => {
        setRegisteredEmployees(employees);
      })
      .catch((err) => {
        console.error('Failed to load registered accounts from PostgreSQL', err);
      });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setLoading(true);

    const success = await login(email.trim());
    setLoading(false);
    if (!success) {
      setError(`No employee found with email "${email}". Please verify or add this employee via Swagger.`);
    }
  };

  const handleQuickLogin = (emp: Employee) => {
    switchUser(emp);
  };

  return (
    <div className="min-h-screen bg-[#161922] flex items-center justify-center p-6 text-slate-100">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Side: Brand & Quick Demo Roles (Inspired by Image 1) */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff5722]/15 text-[#ff7844] border border-[#ff5722]/30 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#ff5722]"></span>
            <span>Enterprise Suite v2.0</span>
          </div>

          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-3">
              Employee Managemnent
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              Purpose-built workspace for team members — equipped with your personal
              employee dashboard, task tracking, and leave management.
            </p>
          </div>

          {registeredEmployees.length > 0 ? (
            <div className="space-y-3 pt-2">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                1-CLICK DEMO ACCESS
              </div>
              <div className="space-y-2">
                {registeredEmployees.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => handleQuickLogin(emp)}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[#2c3245] bg-[#1a1d27]/80 hover:bg-[#202433] hover:border-[#ff5722]/50 transition-all duration-200 text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#ff5722] text-white text-sm font-bold flex items-center justify-center shrink-0 shadow-sm shadow-[#ff5722]/30">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-[#ff7844] transition-colors">
                          {emp.name} ({emp.department})
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {emp.email}
                        </div>
                      </div>
                    </div>
                    <span className="text-slate-400 group-hover:text-[#ff5722] group-hover:translate-x-1 transition-all text-xs font-bold">
                      →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4.5 rounded-2xl border border-amber-500/30 bg-[#1e1c24] space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>PostgreSQL Database Verified (0 Employees)</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                No employee records currently exist in PostgreSQL. Please add an employee using{' '}
                <a
                  href="http://localhost:8000/docs#/Employees/create_employee_employees_post"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#ff5722] hover:underline font-bold"
                >
                  Swagger UI (POST /employees)
                </a>{' '}
                or pgAdmin to log in.
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Sign-In Card */}
        <div className="bg-[#202433] border border-[#2c3245] rounded-3xl p-8 sm:p-10 shadow-2xl animate-pop">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-white tracking-tight mb-1">
              Welcome back
            </h2>
            <p className="text-xs text-slate-400">
              Enter your work email to access your personal dashboard.
            </p>
          </div>

          {error && (
            <div className="p-3.5 mb-5 text-xs font-semibold text-rose-400 bg-rose-950/40 border border-rose-800/60 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                Work Email
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  ✉️
                </span>
                <input
                  id="email"
                  type="email"
                  className="w-full pl-10 pr-4 py-3 text-sm bg-[#181b24] text-white border border-[#2c3245] rounded-xl focus:outline-none focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/20 transition-all font-medium placeholder-slate-500"
                  placeholder="e.g. h@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#ff5722] hover:bg-[#f44914] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#ff5722]/25 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-75 cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In to Workspace →'}
            </button>
          </form>

          <div className="mt-8 pt-4 border-t border-[#2c3245] text-center text-[11px] text-slate-400">
            🔒 Private Workspace: View only your personal tasks and records.
          </div>
        </div>
      </div>
    </div>
  );
};
