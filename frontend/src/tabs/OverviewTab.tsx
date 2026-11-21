import React from 'react';
import type { DashboardSummary } from '../types';
import type { TabType } from '../components/Sidebar';

interface OverviewTabProps {
  summary: DashboardSummary | null;
  onNavigateTab: (tab: TabType) => void;
  onClockIn: () => Promise<void>;
  onClockOut: () => Promise<void>;
  clocking: boolean;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  summary,
  onNavigateTab,
  onClockIn,
  onClockOut,
  clocking,
}) => {
  if (!summary) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="w-8 h-8 border-3 border-[#ff5722] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm font-medium">Loading your dashboard...</span>
      </div>
    );
  }

  const { employee, stats, recent_tasks, today_attendance } = summary;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner in Dark Fission theme */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1e2332] via-[#242a3c] to-[#1e2332] border border-[#2c3245] text-white p-7 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-3.5 bg-[#ff5722] rounded-full inline-block"></span>
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
              DASHBOARD OVERVIEW
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-1 text-white">
            Welcome back, {employee.name}! 👋
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            {employee.role || 'Employee'} • {employee.department} Department
          </p>
        </div>

        {/* Clock In/Out Widget */}
        <div className="relative z-10 flex items-center gap-4 bg-[#181b24] border border-[#2c3245] rounded-xl p-4 shadow-inner">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Today's Attendance
            </span>
            <span className="text-sm font-bold text-white">
              {today_attendance?.check_in
                ? `Clocked in at ${today_attendance.check_in}`
                : 'Not clocked in yet'}
            </span>
          </div>
          <div>
            {!today_attendance?.check_in ? (
              <button
                onClick={onClockIn}
                disabled={clocking}
                className="px-4 py-2 bg-[#ff5722] hover:bg-[#f44914] text-white font-bold text-xs rounded-xl shadow-md shadow-[#ff5722]/20 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-75 cursor-pointer"
              >
                {clocking ? 'Recording...' : '▶ Clock In'}
              </button>
            ) : !today_attendance?.check_out || today_attendance.check_out === '--' ? (
              <button
                onClick={onClockOut}
                disabled={clocking}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-75 cursor-pointer"
              >
                {clocking ? 'Recording...' : '⏹ Clock Out'}
              </button>
            ) : (
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                ✓ Completed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          onClick={() => onNavigateTab('tasks')}
          className="relative bg-[#202433] border border-[#2c3245] rounded-2xl p-6 shadow-md hover:border-[#ff5722]/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#ff5722]"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Tasks
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#282d3d] text-white flex items-center justify-center text-lg transition-transform duration-300 group-hover:scale-110">
              📋
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight mb-2">
            {stats.pending_tasks + stats.in_progress_tasks} <span className="text-sm font-semibold text-slate-400">Tasks</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{stats.completed_tasks} completed</span>
            <span className="text-[#ff7844] font-bold group-hover:translate-x-1 transition-transform">
              Manage →
            </span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('attendance')}
          className="relative bg-[#202433] border border-[#2c3245] rounded-2xl p-6 shadow-md hover:border-emerald-500/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Attendance Rate
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#282d3d] text-emerald-400 flex items-center justify-center text-lg transition-transform duration-300 group-hover:scale-110">
              📈
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight mb-2">
            {stats.attendance_rate}<span className="text-xl font-bold text-slate-400">%</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{stats.total_present_days} days recorded</span>
            <span className="text-emerald-400 font-bold group-hover:translate-x-1 transition-transform">
              View logs →
            </span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('leaves')}
          className="relative bg-[#202433] border border-[#2c3245] rounded-2xl p-6 shadow-md hover:border-amber-500/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Available Leaves
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#282d3d] text-amber-400 flex items-center justify-center text-lg transition-transform duration-300 group-hover:scale-110">
              🌴
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight mb-2">
            {stats.total_leave_balance} <span className="text-sm font-semibold text-slate-400">Days</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{stats.leaves_used} used • {stats.leaves_pending} pending</span>
            <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform">
              Apply →
            </span>
          </div>
        </div>
      </div>

      {/* Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 bg-[#202433] border border-[#2c3245] rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="text-base">📌</span>
              <h3 className="text-base font-bold text-white">Tasks Assigned to You</h3>
            </div>
            <button
              onClick={() => onNavigateTab('tasks')}
              className="text-xs font-bold text-[#ff7844] hover:text-[#ff5722] transition-colors"
            >
              See All ({stats.total_tasks}) →
            </button>
          </div>

          {recent_tasks.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              No tasks added yet in database.
            </div>
          ) : (
            <div className="space-y-3">
              {recent_tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-xl border border-[#2c3245] bg-[#1a1d27]/70 hover:bg-[#252a3a] transition-all duration-200 flex items-center justify-between gap-4"
                >
                  <div className="truncate">
                    <div className="text-sm font-bold text-white truncate mb-1">
                      {task.title}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-[#282d3d] text-slate-300">
                        {task.priority}
                      </span>
                      <span>📅 Due: {task.due_date}</span>
                    </div>
                  </div>
                  <span className="shrink-0 px-2.5 py-1 text-xs font-bold rounded-full bg-[#ff5722]/15 text-[#ff7844] border border-[#ff5722]/30">
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-[#202433] border border-[#2c3245] rounded-2xl shadow-md p-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#ff5722] text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-[#ff5722]/20 mb-3">
            {employee.name.charAt(0).toUpperCase()}
          </div>
          <h4 className="text-lg font-bold text-white mb-0.5">{employee.name}</h4>
          <span className="text-xs font-semibold text-[#ff7844] mb-5">
            {employee.role || 'Employee'}
          </span>

          <div className="w-full space-y-3 pt-4 border-t border-[#2c3245] text-left text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Employee ID</span>
              <span className="font-bold text-slate-200">EMP-{String(employee.id).padStart(4, '0')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Email</span>
              <span className="font-bold text-slate-200 truncate max-w-[140px]">{employee.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Department</span>
              <span className="font-bold text-slate-200">{employee.department}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
