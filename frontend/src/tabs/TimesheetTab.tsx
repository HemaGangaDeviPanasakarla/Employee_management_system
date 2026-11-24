import React, { useState } from 'react';
import type { Timesheet } from '../types';

interface TimesheetTabProps {
  timesheets: Timesheet[];
  onOpenAddModal: () => void;
  onEditEntry: (entry: Timesheet) => void;
  onDeleteEntry: (timesheetId: number) => Promise<void>;
  loading: boolean;
}

export const TimesheetTab: React.FC<TimesheetTabProps> = ({
  timesheets,
  onOpenAddModal,
  onEditEntry,
  onDeleteEntry,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filteredTimesheets = timesheets.filter((t) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      t.project_name.toLowerCase().includes(term) ||
      t.work_description.toLowerCase().includes(term) ||
      t.date.includes(term)
    );
  });

  const totalHours = timesheets.reduce((sum, t) => {
    const val = parseFloat(t.hours_worked.replace(/[^0-9.]/g, ''));
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const uniqueProjects = new Set(timesheets.map((t) => t.project_name)).size;

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this timesheet entry?')) {
      setDeletingId(id);
      try {
        await onDeleteEntry(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-6 bg-[#ff5722] rounded-full inline-block"></span>
            <span className="text-xl">📅</span>
            <h2 className="text-2xl font-extrabold tracking-tight text-white">
              Daily Work Timesheets
            </h2>
          </div>
          <p className="text-xs font-medium text-slate-400 mt-1 pl-4">
            Record, track, and manage your daily project hours and task descriptions.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#ff5722] hover:bg-[#f44914] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#ff5722]/25 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer shrink-0"
        >
          <span>+</span>
          <span>Add Timesheet</span>
        </button>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="relative bg-[#202433] border border-[#2c3245] rounded-2xl p-6 shadow-md hover:border-[#ff5722]/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#ff5722]"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Hours Logged
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#282d3d] text-white flex items-center justify-center text-lg transition-transform duration-300 group-hover:scale-110">
              ⏱️
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight mb-1">
            {totalHours.toFixed(1)} <span className="text-sm font-semibold text-slate-400">Hours</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">Logged across all projects</span>
        </div>

        <div className="relative bg-[#202433] border border-[#2c3245] rounded-2xl p-6 shadow-md hover:border-emerald-500/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Submitted Entries
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#282d3d] text-emerald-400 flex items-center justify-center text-lg transition-transform duration-300 group-hover:scale-110">
              📝
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight mb-1">
            {timesheets.length} <span className="text-sm font-semibold text-slate-400">Days Logged</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">Verified in database</span>
        </div>

        <div className="relative bg-[#202433] border border-[#2c3245] rounded-2xl p-6 shadow-md hover:border-amber-500/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Projects Contributed
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#282d3d] text-amber-400 flex items-center justify-center text-lg transition-transform duration-300 group-hover:scale-110">
              💼
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight mb-1">
            {uniqueProjects} <span className="text-sm font-semibold text-slate-400">Projects</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">Distinct project codes</span>
        </div>
      </div>

      {/* Timesheet Entries Table */}
      <div className="bg-[#202433] border border-[#2c3245] rounded-2xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2c3245] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1a1d27]">
          <div className="flex items-center gap-2.5">
            <span className="text-base">📋</span>
            <h3 className="text-base font-bold text-white">Daily Timesheet Log</h3>
            <span className="ml-2 px-2.5 py-0.5 text-xs font-bold text-slate-300 bg-[#252a3a] border border-[#363e54] rounded-full">
              {filteredTimesheets.length} entries
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search project or work description..."
              className="w-full px-3 py-1.5 text-xs bg-[#12141c] text-white border border-[#2c3245] rounded-xl focus:outline-none focus:border-[#ff5722] placeholder-slate-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="w-6 h-6 border-2 border-[#ff5722] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Loading timesheet records...</span>
            </div>
          ) : filteredTimesheets.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-[#282d3d] text-3xl flex items-center justify-center mb-3 shadow-md">
                📅
              </div>
              <h4 className="text-base font-bold text-white mb-1">No timesheet records found</h4>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                Click the button below to add your first work hours and project details.
              </p>
              <button
                onClick={onOpenAddModal}
                className="px-4 py-2 bg-[#ff5722] hover:bg-[#f44914] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                + Add Timesheet Entry
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#2c3245] text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-[#1a1d27]/70">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Project Name</th>
                    <th className="py-3 px-4">Work Description</th>
                    <th className="py-3 px-4">Hours Worked</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#282e40] text-sm">
                  {filteredTimesheets.map((entry) => (
                    <tr key={entry.id} className="hover:bg-[#252a3a] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                        📅 {entry.date}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-bold text-[#ff7844] whitespace-nowrap">
                        {entry.project_name}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-300 max-w-md">
                        {entry.work_description}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-[#282d3d] text-white font-bold text-xs border border-[#373e54]">
                          {entry.hours_worked} hrs
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onEditEntry(entry)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-[#282d3d] hover:bg-[#343b4f] rounded-lg transition-all cursor-pointer"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            disabled={deletingId === entry.id}
                            className="px-2.5 py-1 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-800/40 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                          >
                            {deletingId === entry.id ? '...' : '🗑️ Delete'}
                          </button>
                        </div>
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
