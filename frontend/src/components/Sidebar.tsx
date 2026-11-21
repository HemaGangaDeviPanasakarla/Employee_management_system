import React from 'react';

export type TabType = 'overview' | 'tasks' | 'attendance' | 'leaves';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  pendingTasksCount?: number;
  pendingLeavesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  pendingTasksCount = 0,
  pendingLeavesCount = 0,
}) => {
  const navItems: {
    id: TabType;
    label: string;
    sublabel: string;
    icon: string;
    badge?: number;
  }[] = [
    {
      id: 'overview',
      label: 'Overview',
      sublabel: 'Dashboard & summary',
      icon: '📊',
    },
    {
      id: 'tasks',
      label: 'My Tasks',
      sublabel: 'Assigned deadlines',
      icon: '✅',
      badge: pendingTasksCount,
    },
    {
      id: 'attendance',
      label: 'Attendance',
      sublabel: 'Clock in & history',
      icon: '⏱️',
    },
    {
      id: 'leaves',
      label: 'My Leaves',
      sublabel: 'Quotas & applications',
      icon: '🌴',
      badge: pendingLeavesCount,
    },
  ];

  return (
    <aside className="w-72 min-w-[288px] max-w-[288px] shrink-0 bg-[#171923] border-r border-[#262a38] p-5 flex flex-col justify-between min-h-[calc(100vh-4rem)]">
      <div>
        {/* Primary CTA (styled after "+ New chat" in Image 2) */}
        <div className="mb-6">
          <button
            onClick={() => onTabChange('leaves')}
            className="w-full bg-[#ff5722] hover:bg-[#f44914] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-[#ff5722]/20 flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer text-sm"
          >
            <span className="text-base leading-none">+</span>
            <span>Apply Leave / Action</span>
          </button>
        </div>

        {/* Section Header with Orange Vertical Bar (from Image 2) */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-3">
          <span className="w-1 h-3.5 bg-[#ff5722] rounded-full inline-block"></span>
          <span>APPS & MODULES</span>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 text-left cursor-pointer group ${
                  isActive
                    ? 'bg-[#ff5722]/10 border border-[#ff5722]/40 shadow-sm'
                    : 'border border-transparent hover:bg-[#202433]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                      isActive
                        ? 'bg-[#ff5722] text-white shadow-sm shadow-[#ff5722]/30'
                        : 'bg-[#202433] text-slate-300'
                    }`}
                  >
                    {item.icon}
                  </div>
                  <div className="truncate">
                    <div
                      className={`text-sm font-bold leading-tight truncate ${
                        isActive ? 'text-[#ff7844]' : 'text-slate-200 group-hover:text-white'
                      }`}
                    >
                      {item.label}
                    </div>
                    <div className="text-[11px] text-slate-400 leading-tight mt-0.5 truncate">
                      {item.sublabel}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 pl-2">
                  {item.badge && item.badge > 0 ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {item.badge}
                    </span>
                  ) : isActive ? (
                    <span className="w-2 h-2 rounded-full bg-[#ff5722] shadow-xs shadow-[#ff5722]"></span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Bar (from Image 2 footer) */}
      <div className="pt-5 border-t border-[#262a38]">
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#202433] border border-[#2d3345]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#282d3d] flex items-center justify-center text-sm">
              🔒
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">Isolated Workspace</div>
              <div className="text-[10px] text-slate-400">Private Records Only</div>
            </div>
          </div>
          <span className="px-2 py-1 text-[10px] font-bold rounded bg-[#282d3d] text-slate-300 border border-[#353c52]">
            EN ▼
          </span>
        </div>
      </div>
    </aside>
  );
};
