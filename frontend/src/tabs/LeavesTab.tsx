import React from 'react';
import type { LeaveRecord } from '../types';

interface LeavesTabProps {
  leaves: LeaveRecord[];
  onOpenApplyModal: () => void;
  loading: boolean;
}

export const LeavesTab: React.FC<LeavesTabProps> = ({
  leaves,
  onOpenApplyModal,
  loading,
}) => {
  const approvedDays = leaves
    .filter((l) => l.status === 'Approved')
    .reduce((sum, l) => sum + l.days, 0);

  const pendingDays = leaves
    .filter((l) => l.status === 'Pending')
    .reduce((sum, l) => sum + l.days, 0);

  const totalAnnualQuota = 24;
  const remainingDays = Math.max(0, totalAnnualQuota - approvedDays);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Perfect Alignment */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-6 bg-[#ff5722] rounded-full inline-block"></span>
            <span className="text-xl">🌴</span>
            <h2 className="text-2xl font-extrabold tracking-tight text-white">
              My Leave Requests & Balances
            </h2>
          </div>
          <p className="text-xs font-medium text-slate-400 mt-1 pl-4">
            Submit leave applications and check your remaining quotas and approval status.
          </p>
        </div>

        <button
          onClick={onOpenApplyModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#ff5722] hover:bg-[#f44914] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#ff5722]/25 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer shrink-0"
        >
          <span>+</span>
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Quota Balances Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Remaining Leaves Card */}
        <div className="relative bg-[#202433] border border-[#2c3245] rounded-2xl p-6 shadow-md hover:border-[#ff5722]/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#ff5722]"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Remaining Leave Balance
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#282d3d] text-white flex items-center justify-center text-lg transition-transform duration-300 group-hover:scale-110">
              🏖️
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-black text-white tracking-tight">
              {remainingDays}
            </span>
            <span className="text-sm font-semibold text-slate-400">Days</span>
          </div>
          <div className="w-full h-1.5 bg-[#181b24] rounded-full overflow-hidden mb-2.5">
            <div
              className="h-full bg-[#ff5722] rounded-full transition-all duration-800"
              style={{ width: `${(remainingDays / totalAnnualQuota) * 100}%` }}
            ></div>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Out of {totalAnnualQuota} annual days
          </span>
        </div>

        {/* Approved Leaves Card */}
        <div className="relative bg-[#202433] border border-[#2c3245] rounded-2xl p-6 shadow-md hover:border-emerald-500/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Approved Leaves Taken
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#282d3d] text-emerald-400 flex items-center justify-center text-lg transition-transform duration-300 group-hover:scale-110">
              ✅
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-black text-white tracking-tight">
              {approvedDays}
            </span>
            <span className="text-sm font-semibold text-slate-400">Days</span>
          </div>
          <div className="w-full h-1.5 bg-[#181b24] rounded-full overflow-hidden mb-2.5">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-800"
              style={{ width: `${(approvedDays / totalAnnualQuota) * 100}%` }}
            ></div>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Approved and utilized</span>
        </div>

        {/* Pending Approvals Card */}
        <div className="relative bg-[#202433] border border-[#2c3245] rounded-2xl p-6 shadow-md hover:border-amber-500/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pending Approvals
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#282d3d] text-amber-400 flex items-center justify-center text-lg transition-transform duration-300 group-hover:scale-110">
              ⏳
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-black text-white tracking-tight">
              {pendingDays}
            </span>
            <span className="text-sm font-semibold text-slate-400">Days</span>
          </div>
          <div className="w-full h-1.5 bg-[#181b24] rounded-full overflow-hidden mb-2.5">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-800"
              style={{ width: `${Math.min((pendingDays / 5) * 100, 100)}%` }}
            ></div>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Awaiting HR review</span>
        </div>
      </div>

      {/* Applications Table Card */}
      <div className="bg-[#202433] border border-[#2c3245] rounded-2xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2c3245] flex items-center justify-between bg-[#1a1d27]">
          <div className="flex items-center gap-2.5">
            <span className="text-base">📋</span>
            <h3 className="text-base font-bold text-white">Leave Applications</h3>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold text-slate-300 bg-[#252a3a] border border-[#363e54] rounded-full">
            {leaves.length} applications
          </span>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="w-6 h-6 border-2 border-[#ff5722] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Loading leave records...</span>
            </div>
          ) : leaves.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-[#282d3d] text-3xl flex items-center justify-center mb-3 shadow-md">
                🏖️
              </div>
              <h4 className="text-base font-bold text-white mb-1">No leave requests found</h4>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                You haven't submitted any leave applications yet.
              </p>
              <button
                onClick={onOpenApplyModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#ff5722] hover:bg-[#f44914] text-white font-bold text-xs rounded-xl shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              >
                Apply Now
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#2c3245] text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-[#1a1d27]/70">
                    <th className="py-3 px-4">Leave Type</th>
                    <th className="py-3 px-4">Date Range</th>
                    <th className="py-3 px-4">Days</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#282e40] text-sm">
                  {leaves.map((leave) => {
                    const statusColors = {
                      Approved: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60',
                      Pending: 'bg-amber-950/60 text-amber-400 border-amber-800/60',
                      Rejected: 'bg-rose-950/60 text-rose-400 border-rose-800/60',
                    }[leave.status] || 'bg-[#252a3a] text-slate-300 border-[#363e54]';

                    return (
                      <tr
                        key={leave.id}
                        className="hover:bg-[#252a3a] transition-colors duration-150"
                      >
                        <td className="py-3.5 px-4 font-bold text-white">
                          {leave.leave_type}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-medium text-slate-300">
                          {leave.start_date === leave.end_date
                            ? leave.start_date
                            : `${leave.start_date} → ${leave.end_date}`}
                        </td>
                        <td className="py-3.5 px-4 text-slate-200">
                          <strong>{leave.days}</strong> {leave.days > 1 ? 'Days' : 'Day'}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-400 max-w-xs truncate">
                          {leave.reason}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusColors}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {leave.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
