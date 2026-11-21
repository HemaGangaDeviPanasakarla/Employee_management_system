import React, { useState } from 'react';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    leave_type: string;
    start_date: string;
    end_date: string;
    days: number;
    reason: string;
  }) => Promise<void>;
}

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [days, setDays] = useState(1);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await onSubmit({
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        days: Number(days),
        reason,
      });
      onClose();
      setReason('');
      setStartDate('');
      setEndDate('');
      setDays(1);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to submit leave application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#202433] border border-[#2c3245] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-pop">
        <div className="px-6 py-4.5 border-b border-[#2c3245] flex items-center justify-between bg-[#1a1d27]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#ff5722] rounded-full inline-block"></span>
            <span className="text-xl">🌴</span>
            <h3 className="text-base font-bold text-white">Apply for Leave</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs font-semibold text-rose-400 bg-rose-950/40 border border-rose-800/60 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Leave Type *
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#161922] text-white border border-[#2c3245] rounded-xl focus:outline-none focus:border-[#ff5722] font-medium"
            >
              <option value="Casual Leave">Casual Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Annual Leave">Annual Leave</option>
              <option value="Maternity / Paternity">Maternity / Paternity</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Start Date *
              </label>
              <input
                type="date"
                required
                className="w-full px-3.5 py-2 text-sm bg-[#161922] text-white border border-[#2c3245] rounded-xl focus:outline-none focus:border-[#ff5722]"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                End Date *
              </label>
              <input
                type="date"
                required
                className="w-full px-3.5 py-2 text-sm bg-[#161922] text-white border border-[#2c3245] rounded-xl focus:outline-none focus:border-[#ff5722]"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Total Days *
            </label>
            <input
              type="number"
              min="1"
              max="30"
              required
              className="w-full px-3.5 py-2 text-sm bg-[#161922] text-white border border-[#2c3245] rounded-xl focus:outline-none focus:border-[#ff5722]"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Reason for Leave *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Brief details about your leave..."
              className="w-full px-3.5 py-2.5 text-sm bg-[#161922] text-white border border-[#2c3245] rounded-xl focus:outline-none focus:border-[#ff5722] placeholder-slate-500"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="pt-3 border-t border-[#2c3245] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-[#ff5722] hover:bg-[#f44914] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#ff5722]/20 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-75 cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
