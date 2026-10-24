import React from 'react';
import {
  Bell,
  GraduationCap,
  LogOut,
  RefreshCw,
  School,
  Shield,
  UserCheck,
} from 'lucide-react';
import {
  getCurrentUser,
  getUserNotifications,
  initDatabase,
  logoutUser,
} from '../storage';
import { User } from '../types';

interface TopHeaderProps {
  onUserChanged: () => void;
  onOpenNotifications: () => void;
  onLogout?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onUserChanged,
  onOpenNotifications,
  onLogout,
}) => {
  const currentUser = getCurrentUser();
  const notifications = getUserNotifications(currentUser.id);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleResetData = () => {
    if (confirm('Reset to clean sample attendance data?')) {
      initDatabase(true);
      onUserChanged();
    }
  };

  const handleLogout = () => {
    logoutUser();
    if (onLogout) {
      onLogout();
    }
  };

  const getRoleBadge = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-900 border border-purple-300">
            <Shield className="w-3.5 h-3.5 text-purple-700" /> Admin Dashboard
          </span>
        );
      case 'teacher':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-900 border border-blue-300">
            <School className="w-3.5 h-3.5 text-blue-700" /> Faculty Dashboard
          </span>
        );
      case 'student':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-700" /> Student Dashboard
          </span>
        );
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-2.5 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
            📱
          </div>
          <div>
            <div className="font-extrabold text-gray-900 text-base leading-tight flex items-center gap-2">
              ScanCard
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Attendance
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {currentUser.department}
            </div>
          </div>
        </div>

        {/* Center: Current Authorized Role Badge */}
        <div className="hidden sm:flex items-center gap-2">
          {getRoleBadge(currentUser.role)}
        </div>

        {/* Right: User identity, notifications & Switch/Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={handleResetData}
            title="Reset to clean sample data"
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors hidden md:block"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <div className="h-6 w-px bg-gray-200 hidden sm:block" />

          {/* Current User Info */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-black text-xs flex items-center justify-center">
              {currentUser.name[0]}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-gray-900 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-gray-500 capitalize">
                {currentUser.role} {currentUser.rollNumber ? `(${currentUser.rollNumber})` : ''}
              </div>
            </div>
          </div>

          {/* Logout / Switch Role Button */}
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border border-gray-200"
            title="Sign out to log in as Teacher, Student, or Admin"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Switch / Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
