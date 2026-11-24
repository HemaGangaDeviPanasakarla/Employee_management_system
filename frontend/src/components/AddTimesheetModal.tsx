import React, { useState, useEffect } from 'react';
import type { Timesheet } from '../types';

interface AddTimesheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    date: string;
    project_name: string;
    work_description: string;
    hours_worked: string;
  }) => Promise<void>;
  editingEntry?: Timesheet | null;
}

export const AddTimesheetModal: React.FC<AddTimesheetModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingEntry,
}) => {
  const [date, setDate] = useState('');
  const [projectName, setProjectName] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [hoursWorked, setHoursWorked] = useState('8.0');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingEntry) {
      setDate(editingEntry.date);
      setProjectName(editingEntry.project_name);
      setWorkDescription(editingEntry.work_description);
      setHoursWorked(editingEntry.hours_worked);
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setProjectName('');
      setWorkDescription('');
      setHoursWorked('8.0');
    }
    setError('');
  }, [editingEntry, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !projectName.trim() || !workDescription.trim() || !hoursWorked.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    const hoursNum = parseFloat(hoursWorked);
    if (isNaN(hoursNum) || hoursNum <= 0 || hoursNum > 24) {
      setError('Please enter valid hours worked (between 0.5 and 24).');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await onSubmit({
        date,
        project_name: projectName.trim(),
        work_description: workDescription.trim(),
        hours_worked: hoursWorked.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to save timesheet entry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-[#202433] border border-[#2c3245] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-pop">
        <div className="px-6 py-4.5 border-b border-[#2c3245] flex items-center justify-between bg-[#1a1d27]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#ff5722] rounded-full inline-block"></span>
            <span className="text-xl">📅</span>
            <h3 className="text-base font-bold text-white">
              {editingEntry ? 'Edit Timesheet Entry' : 'Add Timesheet'}
            </h3>
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
              ⚠️ {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Date *
              </label>
              <input
                type="date"
                required
                className="w-full px-3.5 py-2.5 text-sm bg-[#161922] text-white border border-[#2c3245] rounded-xl focus:outline-none focus:border-[#ff5722] font-medium"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Hours Worked *
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                required
                placeholder="e.g. 8.0"
                className="w-full px-3.5 py-2.5 text-sm bg-[#161922] text-white border border-[#2c3245] rounded-xl focus:outline-none focus:border-[#ff5722] font-medium"
                value={hoursWorked}
                onChange={(e) => setHoursWorked(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Project Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Project Alpha or Customer Portal"
              className="w-full px-3.5 py-2.5 text-sm bg-[#161922] text-white border border-[#2c3245] rounded-xl focus:outline-none focus:border-[#ff5722] font-medium placeholder-slate-500"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Task / Work Description *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Describe the tasks or features accomplished today..."
              className="w-full px-3.5 py-2.5 text-sm bg-[#161922] text-white border border-[#2c3245] rounded-xl focus:outline-none focus:border-[#ff5722] placeholder-slate-500"
              value={workDescription}
              onChange={(e) => setWorkDescription(e.target.value)}
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
              {submitting ? 'Saving...' : editingEntry ? 'Save Changes' : 'Submit Timesheet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
