import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import type { Employee } from '../types';

export const Navbar: React.FC = () => {
  const { currentUser, logout, switchUser } = useAuth();
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [showSwitchDropdown, setShowSwitchDropdown] = useState(false);

  useEffect(() => {
    apiService.getAllEmployees().then(setAllEmployees).catch(console.error);
  }, []);

  return (
    <header className="h-16 w-full bg-[#171923] border-b border-[#262a38] px-6 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-40">
      {/* Brand on the left */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#202433] border border-[#2d3345] flex items-center justify-center shadow-sm">
          <span className="text-[#ff5722] font-black text-xl">E</span>
        </div>
        <div>
          <div className="text-lg font-black tracking-tight text-white leading-tight">
            EmpPortal
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
            WORKSPACE
          </div>
        </div>
      </div>

      {currentUser && (
        <div className="flex items-center gap-4">
          {/* Switch Account (Demo) */}
          {allEmployees.length > 1 && (
            <div className="relative">
              <button
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-[#202433] hover:bg-[#282d3d] border border-[#2d3345] rounded-xl transition-all cursor-pointer"
                onClick={() => setShowSwitchDropdown(!showSwitchDropdown)}
              >
                <span>🔄</span>
                <span className="hidden sm:inline">Switch Account</span>
              </button>

              {showSwitchDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-[#202433] border border-[#2d3345] rounded-xl shadow-2xl p-2 z-50">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">
                    Available Accounts
                  </div>
                  <div className="space-y-1">
                    {allEmployees.map((emp) => (
                      <button
                        key={emp.id}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-all ${
                          emp.id === currentUser.id
                            ? 'bg-[#ff5722]/15 text-[#ff7844] border border-[#ff5722]/40'
                            : 'text-slate-300 hover:bg-[#282d3d]'
                        }`}
                        onClick={() => {
                          switchUser(emp);
                          setShowSwitchDropdown(false);
                        }}
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#ff5722] text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {emp.name.charAt(0)}
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold truncate text-white">
                            {emp.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {emp.department} • {emp.email}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile Pill */}
          <div className="flex items-center gap-3 bg-[#202433] border border-[#2d3345] px-3.5 py-1.5 rounded-xl shadow-xs">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-[#ff5722] text-white font-black text-xs flex items-center justify-center shadow-xs">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 border-2 border-[#202433] rounded-full"></span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-white leading-tight">
                {currentUser.name}
              </span>
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
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      )}
    </header>
  );
};
