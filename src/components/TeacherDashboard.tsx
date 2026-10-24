import React from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Play,
  QrCode,
  School,
  Send,
  Users,
} from 'lucide-react';
import {
  getActiveSession,
  getAllSubjects,
  getAllUsers,
  getAttendancePolicy,
  getStudentSubjectStats,
} from '../storage';
import { User } from '../types';

interface TeacherDashboardProps {
  teacher: User;
  onNavigate: (tab: any) => void;
  onStartSessionModal: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  teacher,
  onNavigate,
  onStartSessionModal,
}) => {
  const activeSession = getActiveSession(teacher.role === 'admin' ? undefined : teacher.id);
  const subjects = getAllSubjects().filter(
    (s) => teacher.role === 'admin' || s.teacherId === teacher.id
  );
  const students = getAllUsers().filter((u) => u.role === 'student');
  const policy = getAttendancePolicy();

  // Find students with low attendance in this teacher's subjects
  const atRiskStudents: Array<{
    student: User;
    subjectCode: string;
    subjectName: string;
    percentage: number;
    classesNeeded: number;
  }> = [];

  students.forEach((stu) => {
    const stats = getStudentSubjectStats(stu.id);
    stats.forEach((s) => {
      const isTeacherSub = subjects.some((sub) => sub.id === s.subjectId);
      if (isTeacherSub && s.percentage < policy.minRequiredPercentage && s.totalHeld >= 3) {
        atRiskStudents.push({
          student: stu,
          subjectCode: s.subjectCode,
          subjectName: s.subjectName,
          percentage: s.percentage,
          classesNeeded: s.classesNeeded,
        });
      }
    });
  });

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Friendly Hero Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-blue-200">Faculty Portal</div>
          <h1 className="text-2xl font-black mt-0.5">Welcome, {teacher.name}! 👩‍🏫</h1>
          <p className="text-xs text-blue-100 mt-1">
            Department of {teacher.department} • Apex Institute
          </p>
        </div>

        {/* Big Obvious Action Button */}
        <button
          onClick={onStartSessionModal}
          className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-gray-900 font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <QrCode className="w-5 h-5 text-gray-900" />
          <span>Take Attendance (Show QR)</span>
        </button>
      </div>

      {/* Active Session Alert if Running */}
      {activeSession && (
        <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping" />
            <div>
              <div className="font-extrabold text-emerald-950 text-sm">
                Active Attendance Session is LIVE!
              </div>
              <div className="text-xs text-emerald-700">
                Venue: {activeSession.roomName} • QR is currently refreshing for students
              </div>
            </div>
          </div>

          <button
            onClick={onStartSessionModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
          >
            Open Projector Screen →
          </button>
        </div>
      )}

      {/* 3 Simple Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            My Courses
          </div>
          <div className="text-3xl font-black text-gray-900 mt-1">{subjects.length}</div>
          <div className="text-xs text-gray-500 mt-1">Curriculum subjects taught</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Enrolled Students
          </div>
          <div className="text-3xl font-black text-blue-600 mt-1">{students.length}</div>
          <div className="text-xs text-gray-500 mt-1">In your class sections</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Students Below 75%
          </div>
          <div
            className={`text-3xl font-black mt-1 ${
              atRiskStudents.length > 0 ? 'text-amber-600' : 'text-emerald-600'
            }`}
          >
            {atRiskStudents.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {atRiskStudents.length > 0 ? 'Need attendance counseling' : 'All students meeting 75%'}
          </div>
        </div>
      </div>

      {/* Quick Launch Courses Table */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">My Subjects</h2>
            <p className="text-xs text-gray-500">
              Click &quot;Take Attendance&quot; to show the live QR code on the classroom projector
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {subjects.map((sub) => (
            <div
              key={sub.id}
              className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                    {sub.code}
                  </span>
                  <h3 className="font-bold text-gray-900 text-sm">{sub.name}</h3>
                </div>
                <div className="text-gray-500 mt-1">
                  B.Tech CSE 6th Sem • {sub.credits} Credits • Room 402 - CS Block
                </div>
              </div>

              <button
                onClick={onStartSessionModal}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-xs flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Take Attendance</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Low Attendance Alert Section */}
      {atRiskStudents.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Students Who Need Attention (&lt;75% Attendance)
            </h2>
            <button
              onClick={() => onNavigate('notifications')}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" /> Message All
            </button>
          </div>

          <div className="divide-y divide-gray-100 text-xs">
            {atRiskStudents.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-900">{item.student.name}</div>
                  <div className="text-[11px] text-gray-500">
                    Roll: {item.student.rollNumber} • {item.subjectCode} ({item.subjectName})
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-black text-red-600 text-sm">{item.percentage}%</span>
                    <div className="text-[10px] text-gray-400">
                      Needs {item.classesNeeded} classes to reach 75%
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('notifications')}
                    className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-lg text-xs"
                  >
                    Send Alert
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
