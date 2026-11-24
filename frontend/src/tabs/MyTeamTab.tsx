import React, { useState, useEffect } from 'react';
import type {
  Project,
  TeamMemberItem,
  IndividualMemberDetail,
} from '../types';
import { apiService } from '../services/api';
import { AssignTaskModal } from '../components/AssignTaskModal';

interface MyTeamTabProps {
  managerId: number;
}

export const MyTeamTab: React.FC<MyTeamTabProps> = ({ managerId }) => {
  // Sub-tabs: 'projects' vs 'team'
  const [subTab, setSubTab] = useState<'projects' | 'team'>('team');

  // Data states
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMemberItem[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Individual member view state
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [memberDetail, setMemberDetail] = useState<IndividualMemberDetail | null>(null);
  const [loadingMemberDetail, setLoadingMemberDetail] = useState(false);

  // Assign Task Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [preselectedEmpId, setPreselectedEmpId] = useState<number | undefined>(undefined);

  // Overall loading
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadMyTeamData();
  }, [managerId]);

  const loadMyTeamData = async () => {
    setLoading(true);
    try {
      const [projList, teamList] = await Promise.all([
        apiService.getManagerProjects(managerId),
        apiService.getManagerTeam(managerId),
      ]);
      setProjects(projList);
      setTeamMembers(teamList);
      if (projList.length > 0 && !selectedProjectId) {
        setSelectedProjectId(projList[0].id);
      }
    } catch (err) {
      console.error('Error fetching manager team data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMember = async (empId: number) => {
    setSelectedMemberId(empId);
    setLoadingMemberDetail(true);
    try {
      const detail = await apiService.getIndividualMemberDetail(managerId, empId);
      setMemberDetail(detail);
    } catch (err) {
      console.error('Error loading member detail:', err);
    } finally {
      setLoadingMemberDetail(false);
    }
  };

  const handleAssignTaskSubmit = async (data: {
    employee_id: number;
    project_name: string;
    title: string;
    description: string;
    assigned_date: string;
    due_date: string;
    priority: string;
  }) => {
    await apiService.assignTaskToMember(managerId, data);
    setSuccessMsg(`Task successfully assigned to employee!`);
    setTimeout(() => setSuccessMsg(''), 4000);
    // Reload team and member detail if open
    await loadMyTeamData();
    if (selectedMemberId) {
      handleSelectMember(selectedMemberId);
    }
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Approved':
        return 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60';
      case 'In Progress':
        return 'bg-blue-950/60 text-blue-400 border border-blue-800/60';
      case 'Rejected':
        return 'bg-rose-950/60 text-rose-400 border border-rose-800/60';
      case 'Pending':
      default:
        return 'bg-amber-950/60 text-amber-400 border border-amber-800/60';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Top Banner & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-6 bg-amber-500 rounded-full inline-block"></span>
            <span className="text-xl">👑</span>
            <h2 className="text-2xl font-extrabold tracking-tight text-white">
              My Team Management
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
              Manager Only
            </span>
          </div>
          <p className="text-xs font-medium text-slate-400 mt-1 pl-4">
            Manage and monitor your direct reporting team members, project assignments, and workload.
          </p>
        </div>

        <button
          onClick={() => {
            setPreselectedEmpId(selectedMemberId || undefined);
            setShowAssignModal(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#ff5722] hover:bg-[#f44914] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#ff5722]/25 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer shrink-0"
        >
          <span>+</span>
          <span>Assign Task</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl border border-emerald-800/60 bg-emerald-950/40 text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <span>✓ {successMsg}</span>
          <button
            onClick={() => setSuccessMsg('')}
            className="text-emerald-400 hover:text-white font-bold ml-2 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* If viewing an individual member, show the member detail view */}
      {selectedMemberId ? (
        loadingMemberDetail || !memberDetail ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-3 border-[#ff5722] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Loading member profile and workload...</span>
          </div>
        ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between bg-[#1a1d27] border border-[#2c3245] p-4 rounded-2xl">
            <button
              onClick={() => {
                setSelectedMemberId(null);
                setMemberDetail(null);
              }}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#ff7844] hover:text-[#ff5722] transition-colors cursor-pointer"
            >
              <span>←</span>
              <span>Back to Team Details</span>
            </button>

            <button
              onClick={() => {
                setPreselectedEmpId(memberDetail.employee.id);
                setShowAssignModal(true);
              }}
              className="px-3.5 py-1.5 text-xs font-bold bg-[#ff5722] hover:bg-[#f44914] text-white rounded-xl shadow-md transition-all cursor-pointer"
            >
              + Assign Task to {memberDetail.employee.name.split(' ')[0]}
            </button>
          </div>

          {/* 1. Employee Information Card */}
          <div className="bg-[#202433] border border-[#2c3245] rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#ff5722] text-white text-2xl font-black flex items-center justify-center shadow-lg shadow-[#ff5722]/20 shrink-0">
                {memberDetail.employee.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-xl font-black text-white">
                    {memberDetail.employee.name}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ff5722]/20 text-[#ff7844] border border-[#ff5722]/40">
                    {memberDetail.employee.role}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                  <span>✉️ {memberDetail.employee.email}</span>
                  <span>•</span>
                  <span>🏢 {memberDetail.employee.department}</span>
                  <span>•</span>
                  <span>💼 Project: <strong className="text-white">{memberDetail.assigned_project}</strong></span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Employee Code
              </span>
              <span className="px-3 py-1 bg-[#181b24] text-slate-200 border border-[#2c3245] rounded-xl text-xs font-bold">
                EMP-{String(memberDetail.employee.id).padStart(4, '0')}
              </span>
            </div>
          </div>

          {/* 2. Task Overview Cards */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              <span className="w-1.5 h-3.5 bg-[#ff5722] rounded-full inline-block"></span>
              <span>TASK OVERVIEW</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#202433] border border-[#2c3245] rounded-2xl p-5 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Total Tasks
                </span>
                <span className="text-2xl font-black text-white">
                  {memberDetail.stats.total_tasks}
                </span>
              </div>
              <div className="bg-[#202433] border border-[#2c3245] rounded-2xl p-5 shadow-sm border-l-4 border-l-emerald-500">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                  Completed
                </span>
                <span className="text-2xl font-black text-white">
                  {memberDetail.stats.completed_tasks}
                </span>
              </div>
              <div className="bg-[#202433] border border-[#2c3245] rounded-2xl p-5 shadow-sm border-l-4 border-l-blue-500">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-1">
                  In Progress
                </span>
                <span className="text-2xl font-black text-white">
                  {memberDetail.stats.in_progress_tasks}
                </span>
              </div>
              <div className="bg-[#202433] border border-[#2c3245] rounded-2xl p-5 shadow-sm border-l-4 border-l-amber-500">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Pending
                </span>
                <span className="text-2xl font-black text-white">
                  {memberDetail.stats.pending_tasks}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Task Details Table */}
          <div className="bg-[#202433] border border-[#2c3245] rounded-2xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2c3245] flex items-center justify-between bg-[#1a1d27]">
              <div className="flex items-center gap-2">
                <span className="text-base">📋</span>
                <h4 className="text-base font-bold text-white">Assigned Task Details</h4>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-slate-300 bg-[#282d3d]">
                {memberDetail.tasks.length} tasks
              </span>
            </div>

            <div className="p-6">
              {memberDetail.tasks.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">
                  No tasks assigned to this employee yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#2c3245] text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-[#1a1d27]/70">
                        <th className="py-3 px-4">Task Name</th>
                        <th className="py-3 px-4">Project</th>
                        <th className="py-3 px-4">Assigned Date</th>
                        <th className="py-3 px-4">Due Date</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#282e40] text-sm">
                      {memberDetail.tasks.map((task) => (
                        <tr key={task.id} className="hover:bg-[#252a3a] transition-colors">
                          <td className="py-3.5 px-4 font-bold text-white">
                            <div>{task.title}</div>
                            {task.description && (
                              <div className="text-[11px] text-slate-400 font-normal line-clamp-1 mt-0.5">
                                {task.description}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-xs font-bold text-[#ff7844]">
                            {task.project_name || 'General'}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-300 whitespace-nowrap">
                            📅 {task.assigned_date || '--'}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-300 whitespace-nowrap">
                            📅 {task.due_date}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${getStatusBadge(
                                task.status
                              )}`}
                            >
                              {task.status}
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

          {/* 4. Leave Details Table */}
          <div className="bg-[#202433] border border-[#2c3245] rounded-2xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2c3245] flex items-center justify-between bg-[#1a1d27]">
              <div className="flex items-center gap-2">
                <span className="text-base">🌴</span>
                <h4 className="text-base font-bold text-white">Leave History & Requests</h4>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-slate-300 bg-[#282d3d]">
                {memberDetail.leaves.length} applications
              </span>
            </div>

            <div className="p-6">
              {memberDetail.leaves.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">
                  No leave applications submitted by this employee.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#2c3245] text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-[#1a1d27]/70">
                        <th className="py-3 px-4">Leave Type</th>
                        <th className="py-3 px-4">Start Date</th>
                        <th className="py-3 px-4">End Date</th>
                        <th className="py-3 px-4">Reason</th>
                        <th className="py-3 px-4">Leave Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#282e40] text-sm">
                      {memberDetail.leaves.map((leave) => (
                        <tr key={leave.id} className="hover:bg-[#252a3a] transition-colors">
                          <td className="py-3.5 px-4 font-bold text-white">
                            {leave.leave_type} ({leave.days} {leave.days > 1 ? 'Days' : 'Day'})
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-300 whitespace-nowrap">
                            📅 {leave.start_date}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-300 whitespace-nowrap">
                            📅 {leave.end_date}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-400 max-w-xs truncate">
                            {leave.reason}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${getStatusBadge(
                                leave.status
                              )}`}
                            >
                              {leave.status}
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
        )
      ) : (
        /* Top Navigation Tabs: Tab 1: Project Details | Tab 2: Team Details */
        <div className="space-y-6">
          <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#1a1d27] border border-[#2c3245]">
            <button
              type="button"
              onClick={() => setSubTab('team')}
              className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer ${
                subTab === 'team'
                  ? 'bg-[#ff5722] text-white shadow-md shadow-[#ff5722]/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>👥 Tab 2: Team Details</span>
              <span
                className={`px-2 py-0.5 text-xs rounded-full font-black ${
                  subTab === 'team'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#282d3d] text-slate-300'
                }`}
              >
                {teamMembers.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab('projects')}
              className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer ${
                subTab === 'projects'
                  ? 'bg-[#ff5722] text-white shadow-md shadow-[#ff5722]/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>💼 Tab 1: Project Details</span>
              <span
                className={`px-2 py-0.5 text-xs rounded-full font-black ${
                  subTab === 'projects'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#282d3d] text-slate-300'
                }`}
              >
                {projects.length}
              </span>
            </button>
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="w-6 h-6 border-2 border-[#ff5722] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Loading team data...</span>
            </div>
          ) : subTab === 'team' ? (
            /* TAB 2: TEAM DETAILS */
            <div className="bg-[#202433] border border-[#2c3245] rounded-2xl shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-[#2c3245] flex items-center justify-between bg-[#1a1d27]">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">👥</span>
                  <h3 className="text-base font-bold text-white">Reporting Team Members</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-slate-300 bg-[#282d3d]">
                  {teamMembers.length} Direct Reports
                </span>
              </div>

              <div className="p-6">
                {teamMembers.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 text-xs">
                    <div className="text-3xl mb-2">👥</div>
                    <div className="font-bold text-white text-sm mb-1">No Team Members Found</div>
                    <div>No team members currently assigned under your direct management.</div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#2c3245] text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-[#1a1d27]/70">
                          <th className="py-3 px-4">Employee Name</th>
                          <th className="py-3 px-4">Email Address</th>
                          <th className="py-3 px-4">Role</th>
                          <th className="py-3 px-4">Project Name</th>
                          <th className="py-3 px-4">Task Summary</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#282e40] text-sm">
                        {teamMembers.map((member) => (
                          <tr
                            key={member.id}
                            className="hover:bg-[#252a3a] transition-colors group cursor-pointer"
                            onClick={() => handleSelectMember(member.id)}
                          >
                            <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#ff5722] text-white font-black text-xs flex items-center justify-center shrink-0">
                                  {member.name.charAt(0)}
                                </div>
                                <span className="group-hover:text-[#ff7844] transition-colors">
                                  {member.name}
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-xs text-slate-300">
                              {member.email}
                            </td>
                            <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded bg-[#282d3d] text-slate-300 font-bold">
                                {member.role}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-xs font-bold text-[#ff7844] whitespace-nowrap">
                              {member.project_name}
                            </td>
                            <td className="py-3.5 px-4 text-xs text-slate-300">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-[#181b24] border border-[#2c3245] font-semibold text-[11px]">
                                  {member.task_summary}
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectMember(member.id);
                                }}
                                className="px-3 py-1.5 text-xs font-bold text-white bg-[#282d3d] hover:bg-[#ff5722] rounded-xl transition-all cursor-pointer shadow-xs"
                              >
                                View Details →
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* TAB 1: PROJECT DETAILS */
            <div className="space-y-6">
              {projects.length === 0 ? (
                <div className="py-16 bg-[#202433] border border-[#2c3245] rounded-2xl text-center text-slate-400 text-xs">
                  <div className="text-3xl mb-2">📁</div>
                  <div className="font-bold text-white text-sm mb-1">No Team Projects Found</div>
                  <div>No projects currently assigned under your direct management.</div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {projects.map((proj) => {
                  const isSelected = selectedProjectId === proj.id;
                  return (
                    <div
                      key={proj.id}
                      onClick={() => setSelectedProjectId(proj.id)}
                      className={`bg-[#202433] border rounded-2xl p-5 shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#ff5722] bg-[#222738] shadow-md shadow-[#ff5722]/10 ring-1 ring-[#ff5722]'
                          : 'border-[#2c3245] hover:border-[#ff5722]/50 hover:-translate-y-0.5'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#282d3d] text-slate-300">
                            {proj.department}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${getStatusBadge(
                              proj.status
                            )}`}
                          >
                            {proj.status}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-white mb-1.5">
                          {proj.name}
                        </h4>

                        {proj.description && (
                          <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                            {proj.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-3.5 border-t border-[#2c3245] space-y-2 text-xs">
                        <div className="flex justify-between items-center text-slate-400">
                          <span>Team Members:</span>
                          <span className="font-bold text-white">
                            👥 {proj.team_members_count ?? 0} Members
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400">
                          <span>Timeline:</span>
                          <span className="font-medium text-slate-300">
                            {proj.start_date} → {proj.due_date}
                          </span>
                        </div>
                        <div className="w-full bg-[#181b24] h-1.5 rounded-full overflow-hidden mt-2">
                          <div
                            className="bg-[#ff5722] h-full rounded-full"
                            style={{ width: `${proj.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Project In-Depth View */}
              {selectedProject && (
                <div className="bg-[#202433] border border-[#2c3245] rounded-2xl p-6 shadow-md animate-fade-in space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2c3245] pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-1.5 h-4 bg-[#ff5722] rounded-full inline-block"></span>
                        <h3 className="text-lg font-black text-white">
                          {selectedProject.name}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${getStatusBadge(
                            selectedProject.status
                          )}`}
                        >
                          {selectedProject.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {selectedProject.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-300 font-bold bg-[#181b24] px-3 py-1.5 rounded-xl border border-[#2c3245]">
                        📅 {selectedProject.start_date} — {selectedProject.due_date}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Associated Team Members ({selectedProject.team_members?.length ?? 0})
                    </h4>
                    {(!selectedProject.team_members || selectedProject.team_members.length === 0) ? (
                      <div className="py-6 text-center text-slate-400 text-xs bg-[#181b24] rounded-xl border border-[#2c3245]">
                        No team members currently mapped to this specific project name.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {selectedProject.team_members.map((m) => (
                          <div
                            key={m.id}
                            onClick={() => handleSelectMember(m.id)}
                            className="p-3.5 rounded-xl bg-[#181b24] border border-[#2c3245] hover:border-[#ff5722]/50 hover:bg-[#202433] transition-all cursor-pointer flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <div className="w-8 h-8 rounded-lg bg-[#ff5722] text-white font-bold text-xs flex items-center justify-center shrink-0">
                                {m.name.charAt(0)}
                              </div>
                              <div className="truncate">
                                <div className="text-xs font-bold text-white group-hover:text-[#ff7844] truncate">
                                  {m.name}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate">
                                  {m.email}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs text-slate-400 group-hover:text-[#ff5722] pl-2 font-bold">
                              →
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Assign Task Modal */}
      <AssignTaskModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        teamMembers={teamMembers}
        projects={projects}
        preselectedEmployeeId={preselectedEmpId}
        onSubmit={handleAssignTaskSubmit}
      />
    </div>
  );
};
