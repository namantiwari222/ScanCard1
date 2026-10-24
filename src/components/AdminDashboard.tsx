import React from 'react';
import {
  AlertTriangle,
  BookOpen,
  GraduationCap,
  School,
  Shield,
  Sliders,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  getAllClasses,
  getAllRecords,
  getAllSubjects,
  getAllUsers,
  getAttendancePolicy,
  getStudentSubjectStats,
} from '../storage';
import { User } from '../types';

interface AdminDashboardProps {
  admin: User;
  onNavigate: (tab: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ admin, onNavigate }) => {
  const users = getAllUsers();
  const classes = getAllClasses();
  const subjects = getAllSubjects();
  const records = getAllRecords();
  const policy = getAttendancePolicy();

  const students = users.filter((u) => u.role === 'student');
  const teachers = users.filter((u) => u.role === 'teacher');

  const presentRecords = records.filter((r) => r.status === 'present').length;
  const overallPercentage =
    records.length === 0 || presentRecords === 0
      ? 0
      : Math.round((presentRecords / records.length) * 1000) / 10;

  let studentsBelowThresholdCount = 0;
  students.forEach((stu) => {
    const stats = getStudentSubjectStats(stu.id);
    const hasLow = stats.some(
      (s) => s.percentage < policy.minRequiredPercentage && s.totalHeld >= 3
    );
    if (hasLow) studentsBelowThresholdCount++;
  });

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-purple-200">Administrator Portal</div>
          <h1 className="text-2xl font-black mt-0.5">Welcome, {admin.name}! 🏛️</h1>
          <p className="text-xs text-purple-100 mt-1">
            Apex Institute • College-wide Academic Operations
          </p>
        </div>

        <button
          onClick={() => onNavigate('settings')}
          className="px-4 py-2.5 bg-white text-purple-900 font-extrabold text-xs rounded-xl shadow-xs hover:bg-purple-50 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Sliders className="w-4 h-4 text-purple-700" />
          <span>Edit Policy ({policy.minRequiredPercentage}%)</span>
        </button>
      </div>

      {/* 4 Simple Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Total Students
          </div>
          <div className="text-3xl font-black text-gray-900 mt-1">{students.length}</div>
          <div className="text-xs text-gray-500 mt-1">Enrolled across all sections</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Faculty Members
          </div>
          <div className="text-3xl font-black text-indigo-700 mt-1">{teachers.length}</div>
          <div className="text-xs text-gray-500 mt-1">Teaching {subjects.length} courses</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            College Attendance
          </div>
          <div className="text-3xl font-black text-emerald-600 mt-1">{overallPercentage}%</div>
          <div className="text-xs text-gray-500 mt-1">Average across all classes</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Below 75% Rule
          </div>
          <div className="text-3xl font-black text-red-600 mt-1">
            {studentsBelowThresholdCount}
          </div>
          <div className="text-xs text-gray-500 mt-1">Students needing warning alerts</div>
        </div>
      </div>

      {/* Quick Management Actions for Admin */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Administrator Data Management</h2>
          <p className="text-xs text-gray-500">Quickly add, edit, or remove data across institutional systems</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => onNavigate('students')}
            className="p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-all text-left space-y-1 cursor-pointer"
          >
            <div className="text-xs font-bold text-gray-900">Students & Faculty</div>
            <div className="text-[10px] text-gray-500">Add, Edit, Remove</div>
          </button>

          <button
            onClick={() => onNavigate('classes')}
            className="p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-all text-left space-y-1 cursor-pointer"
          >
            <div className="text-xs font-bold text-gray-900">Classes & Courses</div>
            <div className="text-[10px] text-gray-500">Add, Edit, Remove</div>
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className="p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-all text-left space-y-1 cursor-pointer"
          >
            <div className="text-xs font-bold text-gray-900">Attendance Records</div>
            <div className="text-[10px] text-gray-500">Manual Entry & Delete</div>
          </button>

          <button
            onClick={() => onNavigate('exams')}
            className="p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-all text-left space-y-1 cursor-pointer"
          >
            <div className="text-xs font-bold text-gray-900">Exams Schedule</div>
            <div className="text-[10px] text-gray-500">Add, Edit, Remove</div>
          </button>

          <button
            onClick={() => onNavigate('events')}
            className="p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-all text-left space-y-1 cursor-pointer"
          >
            <div className="text-xs font-bold text-gray-900">Campus Events</div>
            <div className="text-[10px] text-gray-500">Add, Edit, Remove</div>
          </button>

          <button
            onClick={() => onNavigate('travel')}
            className="p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-all text-left space-y-1 cursor-pointer"
          >
            <div className="text-xs font-bold text-gray-900">Tours & Trips</div>
            <div className="text-[10px] text-gray-500">Add, Edit, Remove</div>
          </button>
        </div>
      </div>

      {/* Classes & Faculty Quick View */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Academic Classes & Courses</h2>
            <p className="text-xs text-gray-500">Currently active classes and assigned teachers</p>
          </div>
          <button
            onClick={() => onNavigate('classes')}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            Manage Curriculum →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map((c) => (
            <div key={c.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
              <div className="font-bold text-gray-900 text-sm">{c.name}</div>
              <div className="text-xs text-gray-500">{c.department} • {c.room}</div>
              <div className="text-[11px] text-blue-700 font-semibold pt-1">
                Geofence Radius: {c.geofenceRadius} meters
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
