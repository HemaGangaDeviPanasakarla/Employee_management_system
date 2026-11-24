import React, { useState } from 'react';
import type { Task } from '../types';

interface TasksTabProps {
  tasks: Task[];
  onUpdateStatus: (taskId: number, status: 'Pending' | 'In Progress' | 'Completed') => Promise<void>;
  onDeleteTask: (taskId: number) => Promise<void>;
  onOpenCreateModal: () => void;
  loading: boolean;
}

export const TasksTab: React.FC<TasksTabProps> = ({
  tasks,
  onUpdateStatus,
  onDeleteTask,
  onOpenCreateModal,
  loading,
}) => {
  // Main view tab: 'my_tasks' vs 'assigned_tasks'
  const [taskViewTab, setTaskViewTab] = useState<'my_tasks' | 'assigned_tasks'>('my_tasks');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Filter tasks based on view tab
  const myTasks = tasks.filter((t) => t.assigned_by_role !== 'Manager');
  const assignedTasks = tasks.filter((t) => t.assigned_by_role === 'Manager');

  const activeCategoryTasks = taskViewTab === 'my_tasks' ? myTasks : assignedTasks;

  const filteredTasks = activeCategoryTasks.filter((t) => {
    if (statusFilter === 'All') return true;
    return t.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60';
      case 'In Progress':
        return 'bg-blue-950/60 text-blue-400 border border-blue-800/60';
      case 'Pending':
      default:
        return 'bg-amber-950/60 text-amber-400 border border-amber-800/60';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header and Add Task Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-6 bg-[#ff5722] rounded-full inline-block"></span>
            <span className="text-xl">✅</span>
            <h2 className="text-2xl font-extrabold tracking-tight text-white">
              Task Management
            </h2>
          </div>
          <p className="text-xs font-medium text-slate-400 mt-1 pl-4">
            Manage your personal work items and monitor tasks assigned by your manager.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#ff5722] hover:bg-[#f44914] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#ff5722]/25 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer shrink-0"
        >
          <span>+</span>
          <span>Add New Task</span>
        </button>
      </div>

      {/* Two Main Tabs: Tab 1: My Tasks | Tab 2: Assigned Tasks */}
      <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#1a1d27] border border-[#2c3245]">
        <button
          type="button"
          onClick={() => {
            setTaskViewTab('my_tasks');
            setStatusFilter('All');
          }}
          className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer ${taskViewTab === 'my_tasks'
              ? 'bg-[#ff5722] text-white shadow-md shadow-[#ff5722]/20'
              : 'text-slate-400 hover:text-white'
            }`}
        >
          <span>📋 My Tasks</span>
          <span
            className={`px-2 py-0.5 text-xs rounded-full font-black ${taskViewTab === 'my_tasks'
                ? 'bg-white/20 text-white'
                : 'bg-[#282d3d] text-slate-300'
              }`}
          >
            {myTasks.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTaskViewTab('assigned_tasks');
            setStatusFilter('All');
          }}
          className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer ${taskViewTab === 'assigned_tasks'
              ? 'bg-[#ff5722] text-white shadow-md shadow-[#ff5722]/20'
              : 'text-slate-400 hover:text-white'
            }`}
        >
          <span>👑 Assigned Tasks (Manager)</span>
          <span
            className={`px-2 py-0.5 text-xs rounded-full font-black ${taskViewTab === 'assigned_tasks'
                ? 'bg-white/20 text-white'
                : 'bg-[#282d3d] text-slate-300'
              }`}
          >
            {assignedTasks.length}
          </span>
        </button>
      </div>

      {/* Status Filter Bar */}
      <div className="flex items-center gap-2 pb-2 border-b border-[#2c3245] overflow-x-auto">
        {['All', 'Pending', 'In Progress', 'Completed'].map((status) => {
          const count =
            status === 'All'
              ? activeCategoryTasks.length
              : activeCategoryTasks.filter((t) => t.status === status).length;

          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 shrink-0 cursor-pointer ${statusFilter === status
                  ? 'bg-[#ff5722]/15 text-[#ff7844] border border-[#ff5722]/40 shadow-xs'
                  : 'text-slate-400 hover:bg-[#202433] hover:text-white'
                }`}
            >
              <span>{status}</span>
              <span
                className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${statusFilter === status
                    ? 'bg-[#ff5722] text-white'
                    : 'bg-[#282d3d] text-slate-400'
                  }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
          <div className="w-6 h-6 border-2 border-[#ff5722] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Loading tasks...</span>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="py-16 text-center flex flex-col items-center justify-center bg-[#202433] rounded-2xl border border-[#2c3245] p-8">
          <div className="w-16 h-16 rounded-2xl bg-[#282d3d] text-3xl flex items-center justify-center mb-3">
            {taskViewTab === 'assigned_tasks' ? '🛡️' : '📂'}
          </div>
          <h4 className="text-base font-bold text-white mb-1">
            {taskViewTab === 'assigned_tasks'
              ? 'No Manager-Assigned Tasks'
              : 'No Personal Tasks Found'}
          </h4>
          <p className="text-xs text-slate-400 mb-5 max-w-sm">
            {taskViewTab === 'assigned_tasks'
              ? 'There are currently no tasks assigned to you by your manager. You are completely caught up!'
              : 'You have not added any personal tasks for this category yet.'}
          </p>
          {taskViewTab === 'my_tasks' && (
            <button
              onClick={onOpenCreateModal}
              className="px-4 py-2 bg-[#ff5722] hover:bg-[#f44914] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              + Create First Task
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`bg-[#202433] border border-[#2c3245] rounded-2xl p-5 shadow-sm hover:border-[#ff5722]/50 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between ${task.priority === 'High'
                  ? 'border-l-4 border-l-rose-500'
                  : task.priority === 'Medium'
                    ? 'border-l-4 border-l-amber-500'
                    : 'border-l-4 border-l-slate-600'
                }`}
            >
              <div>
                {/* Meta Header */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#282d3d] text-slate-300">
                    {task.project_name || 'General Project'}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${getStatusBadge(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                </div>

                <h4 className="text-base font-bold text-white mb-1.5 leading-snug">
                  {task.title}
                </h4>

                {task.description && (
                  <p className="text-xs text-slate-400 mb-4 line-clamp-3 leading-relaxed">
                    {task.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 mb-3 text-[11px] text-slate-400">
                  <span
                    className={`px-2 py-0.5 rounded font-bold text-[10px] ${task.priority === 'High'
                        ? 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                        : task.priority === 'Medium'
                          ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                          : 'bg-[#282d3d] text-slate-300'
                      }`}
                  >
                    {task.priority} Priority
                  </span>
                  {task.assigned_date && (
                    <span>Assigned: {task.assigned_date}</span>
                  )}
                </div>
              </div>

              {/* Footer with Due Date & Status Controller */}
              <div className="pt-3.5 border-t border-[#2c3245] flex items-center justify-between text-xs gap-2">
                <span className="text-slate-400 font-medium whitespace-nowrap">
                  📅 Due: {task.due_date}
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Status Dropdown/Toggle */}
                  <select
                    value={task.status}
                    onChange={(e) =>
                      onUpdateStatus(
                        task.id,
                        e.target.value as 'Pending' | 'In Progress' | 'Completed'
                      )
                    }
                    className="px-2 py-1 text-[11px] font-bold bg-[#181b24] text-white border border-[#2c3245] rounded-lg focus:outline-none focus:border-[#ff5722] cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>

                  {task.assigned_by_role !== 'Manager' && (
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete Task"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
