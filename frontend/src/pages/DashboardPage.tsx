import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import type {
  DashboardSummary,
  Task,
  AttendanceRecord,
  LeaveRecord,
  Timesheet,
} from '../types';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import type { TabType } from '../components/Sidebar';
import { OverviewTab } from '../tabs/OverviewTab';
import { TimesheetTab } from '../tabs/TimesheetTab';
import { TasksTab } from '../tabs/TasksTab';
import { AttendanceTab } from '../tabs/AttendanceTab';
import { LeavesTab } from '../tabs/LeavesTab';
import { MyTeamTab } from '../tabs/MyTeamTab';
import { ApplyLeaveModal } from '../components/ApplyLeaveModal';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { AddTimesheetModal } from '../components/AddTimesheetModal';

export const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Application Data States
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);

  // Loading flags
  const [loadingData, setLoadingData] = useState(false);
  const [clocking, setClocking] = useState(false);

  // Modals
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTimesheetModal, setShowTimesheetModal] = useState(false);
  const [editingTimesheet, setEditingTimesheet] = useState<Timesheet | null>(null);

  const isManager = currentUser?.role === 'Manager';

  // Ensure non-managers cannot stay on 'myteam' tab
  useEffect(() => {
    if (!isManager && activeTab === 'myteam') {
      setActiveTab('overview');
    }
  }, [isManager, activeTab]);

  // Fetch summary and initial data whenever currentUser changes
  useEffect(() => {
    if (!currentUser) return;
    loadAllData(currentUser.id);
  }, [currentUser]);

  const loadAllData = async (employeeId: number) => {
    setLoadingData(true);
    try {
      const [sumData, tasksData, timesheetData, attData, leavesData] =
        await Promise.all([
          apiService.getDashboardSummary(employeeId),
          apiService.getTasks(employeeId),
          apiService.getTimesheets(employeeId),
          apiService.getAttendance(employeeId),
          apiService.getLeaves(employeeId),
        ]);
      setSummary(sumData);
      setTasks(tasksData);
      setTimesheets(timesheetData);
      setAttendance(attData);
      setLeaves(leavesData);
    } catch (err) {
      console.error('Error loading employee workspace data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  // Clock In Action
  const handleClockIn = async () => {
    if (!currentUser) return;
    setClocking(true);
    try {
      await apiService.clockIn(currentUser.id);
      await loadAllData(currentUser.id);
    } catch (err) {
      console.error('Clock-in failed:', err);
      throw err;
    } finally {
      setClocking(false);
    }
  };

  // Clock Out Action
  const handleClockOut = async () => {
    if (!currentUser) return;
    setClocking(true);
    try {
      await apiService.clockOut(currentUser.id);
      await loadAllData(currentUser.id);
    } catch (err) {
      console.error('Clock-out failed:', err);
      throw err;
    } finally {
      setClocking(false);
    }
  };

  // Timesheet Save (Add or Update)
  const handleSaveTimesheet = async (data: {
    date: string;
    project_name: string;
    work_description: string;
    hours_worked: string;
  }) => {
    if (!currentUser) return;
    if (editingTimesheet) {
      await apiService.updateTimesheet(editingTimesheet.id, data);
    } else {
      await apiService.addTimesheet(currentUser.id, data);
    }
    setEditingTimesheet(null);
    await loadAllData(currentUser.id);
  };

  // Timesheet Delete
  const handleDeleteTimesheet = async (timesheetId: number) => {
    if (!currentUser) return;
    try {
      await apiService.deleteTimesheet(timesheetId);
      await loadAllData(currentUser.id);
    } catch (err) {
      console.error('Failed to delete timesheet entry:', err);
    }
  };

  // Task Status Update
  const handleUpdateTaskStatus = async (
    taskId: number,
    status: 'Pending' | 'In Progress' | 'Completed'
  ) => {
    if (!currentUser) return;
    try {
      await apiService.updateTaskStatus(taskId, status);
      await loadAllData(currentUser.id);
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  // Task Delete
  const handleDeleteTask = async (taskId: number) => {
    if (!currentUser) return;
    try {
      await apiService.deleteTask(taskId);
      await loadAllData(currentUser.id);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // Create Task
  const handleCreateTask = async (data: {
    title: string;
    description: string;
    priority: string;
    due_date: string;
  }) => {
    if (!currentUser) return;
    await apiService.createTask(currentUser.id, {
      ...data,
      project_name: currentUser.project_name || 'General',
      assigned_date: new Date().toISOString().split('T')[0],
    });
    await loadAllData(currentUser.id);
  };

  // Apply Leave
  const handleApplyLeave = async (data: {
    leave_type: string;
    start_date: string;
    end_date: string;
    days: number;
    reason: string;
  }) => {
    if (!currentUser) return;
    await apiService.applyLeave(currentUser.id, data);
    await loadAllData(currentUser.id);
  };

  const pendingTasksCount = tasks.filter((t) => t.status === 'Pending').length;
  const pendingLeavesCount = leaves.filter((l) => l.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-[#12141c] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex flex-1 w-full">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          userRole={currentUser?.role || 'Employee'}
          pendingTasksCount={pendingTasksCount}
          pendingLeavesCount={pendingLeavesCount}
        />

        <main className="flex-1 min-w-0 p-6 sm:p-8 lg:p-10 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'overview' && (
              <OverviewTab
                summary={summary}
                onNavigateTab={setActiveTab}
                onClockIn={handleClockIn}
                onClockOut={handleClockOut}
                clocking={clocking}
              />
            )}

            {activeTab === 'timesheet' && (
              <TimesheetTab
                timesheets={timesheets}
                onOpenAddModal={() => {
                  setEditingTimesheet(null);
                  setShowTimesheetModal(true);
                }}
                onEditEntry={(entry) => {
                  setEditingTimesheet(entry);
                  setShowTimesheetModal(true);
                }}
                onDeleteEntry={handleDeleteTimesheet}
                loading={loadingData}
              />
            )}

            {activeTab === 'tasks' && (
              <TasksTab
                tasks={tasks}
                onUpdateStatus={handleUpdateTaskStatus}
                onDeleteTask={handleDeleteTask}
                onOpenCreateModal={() => setShowTaskModal(true)}
                loading={loadingData}
              />
            )}

            {activeTab === 'attendance' && (
              <AttendanceTab
                attendanceRecords={attendance}
                onClockIn={handleClockIn}
                onClockOut={handleClockOut}
                clocking={clocking}
                loading={loadingData}
              />
            )}

            {activeTab === 'leaves' && (
              <LeavesTab
                leaves={leaves}
                onOpenApplyModal={() => setShowLeaveModal(true)}
                loading={loadingData}
              />
            )}

            {activeTab === 'myteam' && isManager && currentUser && (
              <MyTeamTab managerId={currentUser.id} />
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <ApplyLeaveModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onSubmit={handleApplyLeave}
      />

      <CreateTaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSubmit={handleCreateTask}
      />

      <AddTimesheetModal
        isOpen={showTimesheetModal}
        onClose={() => {
          setShowTimesheetModal(false);
          setEditingTimesheet(null);
        }}
        onSubmit={handleSaveTimesheet}
        editingEntry={editingTimesheet}
      />
    </div>
  );
};
