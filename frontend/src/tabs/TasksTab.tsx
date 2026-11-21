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
  const [filter, setFilter] = useState<string>('All');

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'All') return true;
    return t.status === filter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-6 bg-[#ff5722] rounded-full inline-block"></span>
            <span className="text-xl">✅</span>
            <h2 className="text-2xl font-extrabold tracking-tight text-white">
              My Assigned Tasks
            </h2>
          </div>
          <p className="text-xs font-medium text-slate-400 mt-1 pl-4">
            Manage your daily tasks, update progress, and track deadlines.
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 pb-2 border-b border-[#2c3245] overflow-x-auto">
        {['All', 'Pending', 'In Progress', 'Completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 shrink-0 cursor-pointer ${
              filter === status
                ? 'bg-[#ff5722]/15 text-[#ff7844] border border-[#ff5722]/40 shadow-sm'
                : 'text-slate-400 hover:bg-[#202433] hover:text-white'
            }`}
          >
            <span>{status}</span>
            <span
              className={`px-1.5 py-0.5 text-[10px] rounded-full ${
                filter === status
                  ? 'bg-[#ff5722] text-white'
                  : 'bg-[#282d3d] text-slate-400'
              }`}
            >
              {status === 'All'
                ? tasks.length
                : tasks.filter((t) => t.status === status).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
          <div className="w-6 h-6 border-2 border-[#ff5722] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Loading your tasks...</span>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="py-16 text-center flex flex-col items-center justify-center bg-[#202433] rounded-2xl border border-[#2c3245]">
          <div className="w-16 h-16 rounded-2xl bg-[#282d3d] text-3xl flex items-center justify-center mb-3">
            📂
          </div>
          <h4 className="text-base font-bold text-white mb-1">No tasks found</h4>
          <p className="text-xs text-slate-400 mb-4 max-w-sm">
            Add tasks through Swagger UI or click the button above.
          </p>
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 bg-[#ff5722] hover:bg-[#f44914] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            Create First Task
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`bg-[#202433] border border-[#2c3245] rounded-2xl p-5 shadow-sm hover:border-[#ff5722]/50 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between ${
                task.priority === 'High'
                  ? 'border-l-4 border-l-rose-500'
                  : task.priority === 'Medium'
                  ? 'border-l-4 border-l-amber-500'
                  : 'border-l-4 border-l-slate-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      task.priority === 'High'
                        ? 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                        : task.priority === 'Medium'
                        ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                        : 'bg-[#282d3d] text-slate-300'
                    }`}
                  >
                    {task.priority} Priority
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ff5722]/15 text-[#ff7844] border border-[#ff5722]/30">
                    {task.status}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mb-2">{task.title}</h4>
                {task.description && (
                  <p className="text-xs text-slate-400 mb-4 line-clamp-3 leading-relaxed">
                    {task.description}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-[#2c3245] flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">📅 {task.due_date}</span>
                <div className="flex items-center gap-2">
                  {task.status !== 'Completed' ? (
                    <button
                      onClick={() => onUpdateStatus(task.id, 'Completed')}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-sm transition-all cursor-pointer"
                    >
                      ✓ Done
                    </button>
                  ) : (
                    <button
                      onClick={() => onUpdateStatus(task.id, 'Pending')}
                      className="px-2.5 py-1 text-slate-400 hover:bg-[#282d3d] text-[11px] rounded-lg transition-all cursor-pointer"
                    >
                      Reopen
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
