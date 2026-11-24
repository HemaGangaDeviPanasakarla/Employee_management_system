import React, { useState } from 'react';
import type { TeamMemberItem, Project } from '../types';

interface AssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamMembers: TeamMemberItem[];
  projects: Project[];
  preselectedEmployeeId?: number;
  onSubmit: (data: {
    employee_id: number;
    project_name: string;
    title: string;
    description: string;
    assigned_date: string;
    due_date: string;
    priority: string;
  }) => Promise<void>;
}

export const AssignTaskModal: React.FC<AssignTaskModalProps> = ({
  isOpen,
  onClose,
  teamMembers,
  projects,
  preselectedEmployeeId,
  onSubmit,
}) => {
  const [employeeId, setEmployeeId] = useState<number>(
    preselectedEmployeeId || (teamMembers[0]?.id ?? 0)
  );
  const [projectName, setProjectName] = useState<string>(
    projects[0]?.name || ''
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedDate, setAssignedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Sync preselected employee if changed
  React.useEffect(() => {
    if (preselectedEmployeeId) {
      setEmployeeId(preselectedEmployeeId);
      const member = teamMembers.find((m) => m.id === preselectedEmployeeId);
      if (member && member.project_name) {
        setProjectName(member.project_name);
      }
    } else if (teamMembers.length > 0 && !employeeId) {
      setEmployeeId(teamMembers[0].id);
    }
  }, [preselectedEmployeeId, teamMembers]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      setError('Please select an employee.');
      return;
    }
    if (!title.trim() || !dueDate) {
      setError('Please provide a task title and due date.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await onSubmit({
        employee_id: Number(employeeId),
        project_name: projectName.trim(),
        title: title.trim(),
        description: description.trim(),
        assigned_date: assignedDate,
        due_date: dueDate,
        priority,
      });
      onClose();
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('Medium');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to assign task.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-[#202433] border border-[#2c3245] rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-pop">
        <div className="px-6 py-4.5 border-b border-[#2c3245] flex items-center justify-between bg-[#1a1d27]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#ff5722] rounded-full inline-block"></span>
            <span className="text-xl">👑</span>
            <h3 className="text-base font-bold text-white">Assign Task to Team Member</h3>
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

          {/* Select Employee */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Select Employee *
            </label>
            <select
              value={employeeId}
              onChange={(e) => {
                const newId = Number(e.target.value);
                setEmployeeId(newId);
                const member = teamMembers.find((m) => m.id === newId);
                if (member?.project_name) {
                  setProjectName(member.project_name);
                }
              }}
              className="w-full px-3.5 py-2.5 text-sm bg-[#161922] text-white border border-[#2c3245] rounded-xl focus:outline-none focus:border-[#ff5722] font-medium"
            >
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.email}) — {m.project_name}
                </option>
              ))}
            </select>
          </div>

          {/* Project Name */}
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

          {/* Task Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Implement Responsive Dashboard Filters"
              className="w-full px-3.5 py-2.5 text-sm bg-[#161922] text-white border border-[#2c3245] rounded-xl focus:outline-none focus:border-[#ff5722] font-medium placeholder-slate-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Task Description
            </label>
            <textarea
              rows={3}
              placeholder="Deliverables, acceptance criteria, or technical guidance..."
              className="w-full px-3.5 py-2.5 text-sm bg-[#161922] text-white border border-[#2c3245] rounded-xl focus:outline-none focus:border-[#ff5722] placeholder-slate-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Assigned Date *
              </label>
              <input
                type="date"
                required
                className="w-full px-3.5 py-2 text-sm bg-[#161922] text-white border border-[#2c3245] rounded-xl focus:outline-none focus:border-[#ff5722]"
                value={assignedDate}
                onChange={(e) => setAssignedDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Due Date *
              </label>
              <input
                type="date"
                required
                className="w-full px-3.5 py-2 text-sm bg-[#161922] text-white border border-[#2c3245] rounded-xl focus:outline-none focus:border-[#ff5722]"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-[#161922] text-white border border-[#2c3245] rounded-xl focus:outline-none focus:border-[#ff5722] font-medium"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
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
              {submitting ? 'Assigning Task...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
