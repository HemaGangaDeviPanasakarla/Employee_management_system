import React from 'react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();

  const isManager = currentUser?.role === 'Manager';

  return (
    <header className="h-16 w-full bg-[#171923] border-b border-[#262a38] px-6 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-40 font-sans">
      {/* Brand on the left */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#202433] border border-[#2d3345] flex items-center justify-center shadow-sm">
          <span className="text-[#ff5722] font-black text-xl">E</span>
        </div>
        <div>
          <div className="text-lg font-black tracking-tight text-white leading-tight">
            Employee Managemnent
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
            {isManager ? 'MANAGER PORTAL' : 'EMPLOYEE PORTAL'}
          </div>
        </div>
      </div>

      {currentUser && (
        <div className="flex items-center gap-3 sm:gap-4">
          {/* User Profile Pill */}
          <div className="flex items-center gap-3 bg-[#202433] border border-[#2d3345] px-3.5 py-1.5 rounded-xl shadow-xs">
            <div className="relative">
              <div
                className={`w-8 h-8 rounded-lg text-white font-black text-xs flex items-center justify-center shadow-xs ${isManager ? 'bg-amber-500' : 'bg-[#ff5722]'
                  }`}
              >
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 border-2 border-[#202433] rounded-full"></span>
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white leading-tight">
                  {currentUser.name}
                </span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded font-extrabold uppercase ${isManager
                      ? 'bg-amber-400/20 text-amber-300'
                      : 'bg-[#ff5722]/20 text-[#ff7844]'
                    }`}
                >
                  {currentUser.role}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-tight">
                {currentUser.department}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-300 bg-[#202433] hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-800/50 border border-[#2d3345] rounded-xl transition-all cursor-pointer"
            onClick={logout}
          >
            <span>🚪</span>
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      )}
    </header>
  );
};
