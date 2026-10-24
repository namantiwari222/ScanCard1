import React, { useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Play,
  QrCode,
  School,
  Send,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import {
  getActiveSession,
  getAllSubjects,
  getAllUsers,
  getAttendancePolicy,
  getStudentSubjectStats,
  markDirectAttendanceByTeacher,
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

  // Direct Mark Attendance Modal state
  const [showDirectMarkModal, setShowDirectMarkModal] = useState<boolean>(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [directMarkSuccess, setDirectMarkSuccess] = useState<string>('');
  const [directMarkReason, setDirectMarkReason] = useState<string>('Face/Biometric camera unavailable on student phone');

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

  const handleExecuteDirectMark = (e: React.FormEvent) => {
    e.preventDefault();
    const targetStudent = students.find((s) => s.id === selectedStudentId);
    const targetSubject = subjects.find((s) => s.id === selectedSubjectId);
    if (!targetStudent || !targetSubject) return;

    markDirectAttendanceByTeacher({
      student: targetStudent,
      subjectId: targetSubject.id,
      status: 'present',
      teacher,
      note: directMarkReason,
    });

    setDirectMarkSuccess(
      `✓ Attendance marked PRESENT for ${targetStudent.name} (${targetStudent.rollNumber}) in ${targetSubject.code}!`
    );
    setTimeout(() => {
      setDirectMarkSuccess('');
      setShowDirectMarkModal(false);
    }, 1800);
  };

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

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowDirectMarkModal(true)}
            className="px-4 py-3 bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold text-xs rounded-xl border border-white/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-emerald-300" />
            <span>Direct Mark Attendance</span>
          </button>

          <button
            onClick={onStartSessionModal}
            className="px-5 py-3 bg-amber-400 hover:bg-amber-300 active:scale-95 text-gray-900 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-gray-900" />
            <span>Take Attendance (Show QR)</span>
          </button>
        </div>
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

      {/* Direct Mark Attendance Modal for Teacher */}
      {showDirectMarkModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-base">Direct Mark Attendance</h3>
                  <p className="text-[11px] text-gray-500">Teacher override for students without camera/QR</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowDirectMarkModal(false);
                  setDirectMarkSuccess('');
                }}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {directMarkSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs font-bold text-center space-y-1">
                <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto" />
                <div>{directMarkSuccess}</div>
              </div>
            ) : (
              <form onSubmit={handleExecuteDirectMark} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Select Subject</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:bg-white"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.code} - {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Select Student</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:bg-white"
                  >
                    {students.map((stu) => (
                      <option key={stu.id} value={stu.id}>
                        {stu.name} ({stu.rollNumber || 'CS-2024'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Reason / Note</label>
                  <input
                    type="text"
                    value={directMarkReason}
                    onChange={(e) => setDirectMarkReason(e.target.value)}
                    placeholder="e.g. Student camera broken, verified in classroom"
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium text-gray-900 focus:bg-white"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDirectMarkModal(false)}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Direct Mark Present</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
