import React from 'react';
import {
  Bell,
  BookOpen,
  Calendar,
  Compass,
  FileText,
  GraduationCap,
  LayoutDashboard,
  QrCode,
  ScanLine,
  Sliders,
  Users,
} from 'lucide-react';
import { UserRole } from '../types';

export type NavTab =
  | 'dashboard'
  | 'live_session'
  | 'scanner'
  | 'classes'
  | 'students'
  | 'reports'
  | 'notifications'
  | 'exams'
  | 'events'
  | 'travel'
  | 'settings';

interface NavigationSidebarProps {
  currentRole: UserRole;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  unreadCount?: number;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  currentRole,
  activeTab,
  onSelectTab,
  unreadCount = 0,
}) => {
  interface NavItem {
    id: NavTab;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    highlight?: boolean;
  }

  // Simple, customized menus for each role
  const getNavItems = (): NavItem[] => {
    if (currentRole === 'teacher') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        {
          id: 'live_session',
          label: 'Take Attendance (QR)',
          icon: QrCode,
          highlight: true,
        },
        { id: 'reports', label: 'Attendance Records', icon: FileText },
        { id: 'students', label: 'Students List', icon: Users },
        { id: 'classes', label: 'Subjects & Classes', icon: BookOpen },
        {
          id: 'notifications',
          label: 'Send Messages',
          icon: Bell,
          badge: unreadCount > 0 ? unreadCount : undefined,
        },
        { id: 'exams', label: 'Exams Schedule', icon: Calendar },
        { id: 'travel', label: 'Trip Groups', icon: Compass },
      ];
    }

    if (currentRole === 'student') {
      return [
        { id: 'dashboard', label: 'My Attendance', icon: LayoutDashboard },
        {
          id: 'scanner',
          label: 'Scan QR Code',
          icon: ScanLine,
          highlight: true,
        },
        { id: 'reports', label: 'Attendance History', icon: FileText },
        { id: 'exams', label: 'My Exams', icon: Calendar },
        { id: 'events', label: 'Campus Events', icon: GraduationCap },
        { id: 'travel', label: 'My Trips', icon: Compass },
        {
          id: 'notifications',
          label: 'Alerts & Messages',
          icon: Bell,
          badge: unreadCount > 0 ? unreadCount : undefined,
        },
      ];
    }

    // Admin
    return [
      { id: 'dashboard', label: 'College Overview', icon: LayoutDashboard },
      { id: 'reports', label: 'All Attendance Reports', icon: FileText },
      { id: 'students', label: 'Students Directory', icon: Users },
      { id: 'classes', label: 'Classes & Courses', icon: BookOpen },
      { id: 'exams', label: 'Exams & Timetables', icon: Calendar },
      { id: 'events', label: 'College Events', icon: GraduationCap },
      { id: 'travel', label: 'Travel & Tours', icon: Compass },
      { id: 'settings', label: 'Attendance Rules (75%)', icon: Sliders },
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-56 lg:w-60 bg-white border-r border-gray-200 shrink-0 flex flex-col justify-between h-[calc(100vh-4.5rem)] sticky top-18 shadow-xs">
      <div className="p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          {currentRole === 'teacher'
            ? 'Teacher Portal'
            : currentRole === 'student'
            ? 'Student Portal'
            : 'Admin Portal'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : item.highlight
                  ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 font-extrabold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? 'text-white'
                      : item.highlight
                      ? 'text-amber-600'
                      : 'text-gray-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500 text-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Simple Footer Tip */}
      <div className="p-3 border-t border-gray-100 text-[11px] text-gray-500 bg-gray-50/50">
        <div className="font-semibold text-gray-700">Need 75% Attendance</div>
        <div>Classes with &lt;75% are flagged.</div>
      </div>
    </aside>
  );
};
