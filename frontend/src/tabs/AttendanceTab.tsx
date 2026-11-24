import React, { useState } from 'react';
import type { AttendanceRecord } from '../types';

interface AttendanceTabProps {
  attendanceRecords: AttendanceRecord[];
  onClockIn: () => Promise<void>;
  onClockOut: () => Promise<void>;
  clocking: boolean;
  loading: boolean;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({
  attendanceRecords,
  onClockIn,
  onClockOut,
  clocking,
  loading,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = attendanceRecords.find((r) => r.date === todayStr);

  const [actionError, setActionError] = useState('');

  const totalPresent = attendanceRecords.filter((r) =>
    ['Present', 'Late', 'WFH'].includes(r.status)
  ).length;
  const totalLate = attendanceRecords.filter((r) => r.status === 'Late').length;
  const totalWFH = attendanceRecords.filter((r) => r.status === 'WFH').length;

  const handleClockInClick = async () => {
    setActionError('');
    if (todayRecord && todayRecord.check_in && todayRecord.check_in !== '--') {
      setActionError(`You have already checked in today at ${todayRecord.check_in}. Duplicate check-ins are prevented.`);
      return;
    }
    try {
      await onClockIn();
    } catch (err: any) {
      setActionError(err?.response?.data?.detail || 'Clock-in failed.');
    }
  };

  const handleClockOutClick = async () => {
    setActionError('');
    if (!todayRecord || !todayRecord.check_in || todayRecord.check_in === '--') {
      setActionError('Invalid check-out: You must check in first before checking out.');
      return;
    }
    if (todayRecord.check_out && todayRecord.check_out !== '--') {
      setActionError(`You have already checked out today at ${todayRecord.check_out}.`);
      return;
    }
    try {
      await onClockOut();
    } catch (err: any) {
      setActionError(err?.response?.data?.detail || 'Clock-out failed.');
    }
  };

  const isCheckedIn = !!(todayRecord && todayRecord.check_in && todayRecord.check_in !== '--');
  const isCheckedOut = !!(todayRecord && todayRecord.check_out && todayRecord.check_out !== '--');

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-6 bg-[#ff5722] rounded-full inline-block"></span>
            <span className="text-xl">⏱️</span>
            <h2 className="text-2xl font-extrabold tracking-tight text-white">
              Attendance & Shift Tracking
            </h2>
          </div>
          <p className="text-xs font-medium text-slate-400 mt-1 pl-4">
            Daily check-in and check-out logs with automated work hours calculation.
          </p>
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-xl border border-rose-800/60 bg-rose-950/40 text-rose-300 text-xs font-semibold flex items-center justify-between">
          <span>⚠️ {actionError}</span>
          <button
            onClick={() => setActionError('')}
            className="text-rose-400 hover:text-white font-bold ml-3 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Clock Banner Card */}
      <div className="bg-[#202433] border border-[#2c3245] rounded-2xl p-6 sm:p-7 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ff5722] animate-ping"></span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#ff7844]">
              Today's Session ({todayStr})
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white mb-1">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            {isCheckedIn
              ? isCheckedOut
                ? `Completed shift: In at ${todayRecord?.check_in} • Out at ${todayRecord?.check_out}`
                : `Clocked in at ${todayRecord?.check_in} (Shift in progress)`
              : 'You have not checked in yet today.'}
          </p>
        </div>

        {/* Buttons for Check-In and Check-Out with Duplicate/Invalid Protection */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleClockInClick}
            disabled={clocking || isCheckedIn}
            className={`px-5 py-2.5 font-bold text-xs rounded-xl shadow-md transition-all duration-200 cursor-pointer ${
              isCheckedIn
                ? 'bg-[#282d3d] text-slate-400 border border-[#373e54] cursor-not-allowed opacity-60'
                : 'bg-[#ff5722] hover:bg-[#f44914] text-white shadow-[#ff5722]/20 hover:-translate-y-0.5 active:scale-95'
            }`}
            title={isCheckedIn ? 'Already checked in for today' : 'Record check-in time'}
          >
            {clocking ? 'Recording...' : isCheckedIn ? '✓ Checked In' : '🕒 Check In'}
          </button>

          <button
            onClick={handleClockOutClick}
            disabled={clocking || !isCheckedIn || isCheckedOut}
            className={`px-5 py-2.5 font-bold text-xs rounded-xl shadow-md transition-all duration-200 cursor-pointer ${
              !isCheckedIn || isCheckedOut
                ? 'bg-[#282d3d] text-slate-400 border border-[#373e54] cursor-not-allowed opacity-60'
                : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 hover:-translate-y-0.5 active:scale-95'
            }`}
            title={
              !isCheckedIn
                ? 'Check-in first before checking out'
                : isCheckedOut
                ? 'Already checked out for today'
                : 'Record check-out time'
            }
          >
            {clocking ? 'Recording...' : isCheckedOut ? '✓ Checked Out' : '🚪 Check Out'}
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="relative bg-[#202433] border border-[#2c3245] rounded-2xl p-6 shadow-md hover:border-emerald-500/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Days Present
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#282d3d] text-emerald-400 flex items-center justify-center text-lg transition-transform duration-300 group-hover:scale-110">
              🟢
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight mb-1">
            {totalPresent} <span className="text-sm font-semibold text-slate-400">Days</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">Logged in database records</span>
        </div>

        <div className="relative bg-[#202433] border border-[#2c3245] rounded-2xl p-6 shadow-md hover:border-amber-500/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Late Arrivals
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#282d3d] text-amber-400 flex items-center justify-center text-lg transition-transform duration-300 group-hover:scale-110">
              🟡
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight mb-1">
            {totalLate} <span className="text-sm font-semibold text-slate-400">Days</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">Recorded after standard hours</span>
        </div>

        <div className="relative bg-[#202433] border border-[#2c3245] rounded-2xl p-6 shadow-md hover:border-[#ff5722]/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#ff5722]"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Remote / WFH Days
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#282d3d] text-[#ff7844] flex items-center justify-center text-lg transition-transform duration-300 group-hover:scale-110">
              🏠
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight mb-1">
            {totalWFH} <span className="text-sm font-semibold text-slate-400">Days</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">Remote logged sessions</span>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-[#202433] border border-[#2c3245] rounded-2xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2c3245] flex items-center justify-between bg-[#1a1d27]">
          <div className="flex items-center gap-2.5">
            <span className="text-base">📜</span>
            <h3 className="text-base font-bold text-white">Daily Attendance Records</h3>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold text-slate-300 bg-[#252a3a] border border-[#363e54] rounded-full">
            {attendanceRecords.length} records
          </span>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="w-6 h-6 border-2 border-[#ff5722] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Loading attendance records...</span>
            </div>
          ) : attendanceRecords.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-[#282d3d] text-3xl flex items-center justify-center mb-3 shadow-md">
                ⏱️
              </div>
              <p className="text-xs text-slate-400 mb-4">No attendance records found yet.</p>
              <button
                onClick={handleClockInClick}
                disabled={clocking}
                className="px-4 py-2 bg-[#ff5722] hover:bg-[#f44914] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Clock In for Today
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#2c3245] text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-[#1a1d27]/70">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Check In</th>
                    <th className="py-3 px-4">Check Out</th>
                    <th className="py-3 px-4">Total Hours</th>
                    <th className="py-3 px-4">Attendance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#282e40] text-sm">
                  {attendanceRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-[#252a3a] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {record.date}
                        {record.date === todayStr && (
                          <span className="ml-2 px-2 py-0.5 text-[10px] rounded bg-[#ff5722]/20 text-[#ff7844] font-bold border border-[#ff5722]/40">
                            Today
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-300">
                        🕒 {record.check_in || '--'}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-300">
                        🚪 {record.check_out || '--'}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <span className="px-2 py-1 rounded bg-[#282d3d] text-slate-200 font-bold">
                          {record.work_hours || '--'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
