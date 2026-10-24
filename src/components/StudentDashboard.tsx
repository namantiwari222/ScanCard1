import React from 'react';
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  ScanLine,
} from 'lucide-react';
import {
  getActiveSession,
  getAllExams,
  getAllSubjects,
  getAllTravelGroups,
  getAttendancePolicy,
  getStudentRecords,
  getStudentSubjectStats,
} from '../storage';
import { User } from '../types';

interface StudentDashboardProps {
  student: User;
  onNavigate: (tab: any) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ student, onNavigate }) => {
  const policy = getAttendancePolicy();
  const subjectStats = getStudentSubjectStats(student.id);
  const records = getStudentRecords(student.id);
  const allExams = getAllExams();
  // Get upcoming highlights from each exam series
  const sessionTest2Exam = allExams.find((e) => e.title.includes('Session Test 2')) || allExams[0];
  const putExam = allExams.find((e) => e.title.includes('Pre-University'));
  const uniExam = allExams.find((e) => e.title.includes('University Examination'));
  const exams = [sessionTest2Exam, putExam, uniExam].filter(Boolean) as typeof allExams;
  const travelGroups = getAllTravelGroups().filter((t) =>
    t.participantStudentIds.includes(student.id)
  );

  const totalHeld = subjectStats.reduce((acc, s) => acc + s.totalHeld, 0);
  const totalAttended = subjectStats.reduce((acc, s) => acc + s.attended, 0);
  const overallPercentage =
    totalHeld === 0 || totalAttended === 0 ? 0 : Math.round((totalAttended / totalHeld) * 1000) / 10;

  const lowAttendanceSubjects = subjectStats.filter(
    (s) => s.percentage < policy.minRequiredPercentage
  );

  const activeSession = getActiveSession();
  const allSubjects = getAllSubjects();
  const liveSubject = allSubjects.find((s) => s.id === activeSession?.subjectId);

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Live Active Attendance Session Alert */}
      {activeSession && (
        <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <div>
              <div className="font-black text-emerald-950 text-sm">
                Class Attendance Session is LIVE Now!
              </div>
              <div className="text-xs text-emerald-700">
                {liveSubject?.name || 'Class Session'} • Venue: {activeSession.roomName}
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('scanner')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <ScanLine className="w-4 h-4" />
            <span>Open Camera Scanner</span>
          </button>
        </div>
      )}

      {/* Friendly Hero Banner with 1-Click Scanner Button */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-blue-200">Student Portal</div>
          <h1 className="text-2xl font-black mt-0.5">Hello, {student.name}! 👋</h1>
          <p className="text-xs text-blue-100 mt-1">
            Roll: <span className="font-bold">{student.rollNumber || 'CS-2024-001'}</span> •{' '}
            B.Tech Computer Science (Sem 6)
          </p>
        </div>

        {/* Big Friendly Action Button */}
        <button
          onClick={() => onNavigate('scanner')}
          className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-gray-900 font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <ScanLine className="w-5 h-5 text-gray-900" />
          <span>Scan Attendance Now</span>
        </button>
      </div>

      {/* Clear Warning Alert if Below 75% */}
      {lowAttendanceSubjects.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs text-red-900">
            <span className="font-extrabold text-sm">Low Attendance Alert! </span>
            <span>
              You are below the 75% requirement in{' '}
              <strong className="underline">
                {lowAttendanceSubjects.map((s) => s.subjectName).join(', ')}
              </strong>
              . Attend your upcoming classes to stay eligible for exams.
            </span>
          </div>
        </div>
      )}

      {/* Simple 3-Box Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Overall Attendance
          </div>
          <div
            className={`text-3xl font-black mt-1 ${
              overallPercentage >= policy.minRequiredPercentage
                ? 'text-emerald-600'
                : 'text-red-600'
            }`}
          >
            {overallPercentage}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {overallPercentage >= 75 ? '🟢 Good (Above 75%)' : '🔴 Low (Below 75%)'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Classes Attended
          </div>
          <div className="text-3xl font-black text-gray-900 mt-1">
            {totalAttended} <span className="text-base font-normal text-gray-400">/ {totalHeld}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">Total conducted lectures</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Exam Eligibility
          </div>
          <div className="text-3xl font-black text-blue-600 mt-1">
            {subjectStats.length - lowAttendanceSubjects.length} / {subjectStats.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">Subjects meeting 75% rule</div>
        </div>
      </div>

      {/* Subject-Wise Cards */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">My Subjects Attendance</h2>
            <p className="text-xs text-gray-500">Must maintain at least 75% in each subject</p>
          </div>
          <button
            onClick={() => onNavigate('reports')}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            View Full Log →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjectStats.map((sub) => {
            const isGood = sub.percentage >= policy.minRequiredPercentage;
            return (
              <div
                key={sub.subjectId}
                className={`p-4 rounded-xl border ${
                  isGood ? 'bg-emerald-50/40 border-emerald-200' : 'bg-red-50/40 border-red-200'
                } space-y-3`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                      {sub.subjectCode}
                    </span>
                    <h3 className="font-bold text-gray-900 text-sm mt-1">{sub.subjectName}</h3>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-black ${
                      isGood ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                    }`}
                  >
                    {sub.percentage}%
                  </span>
                </div>

                {/* Simple Bar */}
                <div className="space-y-1">
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isGood ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, sub.percentage)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-500">
                    <span>
                      {sub.attended} of {sub.totalHeld} attended
                    </span>
                    <span>Target: 75%</span>
                  </div>
                </div>

                {/* Plain English explanation */}
                <div className="text-xs pt-1 font-semibold">
                  {sub.classesNeeded > 0 ? (
                    <span className="text-red-700">
                      ⚠️ Attend {sub.classesNeeded} more class(es) to reach 75%
                    </span>
                  ) : (
                    <span className="text-emerald-700">✓ On track for exams (Eligible)</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Simple Columns: Exams & Trips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Exams */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" /> Upcoming Exams
            </h3>
            <button
              onClick={() => onNavigate('exams')}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              See All
            </button>
          </div>

          <div className="space-y-2">
            {exams.map((ex) => {
              const isST2 = ex.title.includes('Session Test 2');
              const isPUT = ex.title.includes('Pre-University');
              const isUni = ex.title.includes('University Examination');
              return (
                <div key={ex.id} className="p-3 bg-gray-50 rounded-xl text-xs space-y-1.5 border border-gray-100">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                        isST2
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : isPUT
                          ? 'bg-blue-100 text-blue-900 border-blue-300'
                          : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      }`}
                    >
                      {isST2 ? 'Session Test 2 (40 Marks)' : isPUT ? 'Pre-University (70 Marks)' : 'University Exam (70 Marks)'}
                    </span>
                    <span className="font-bold text-[10px] text-gray-700 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                      {ex.examDate}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-bold text-gray-900">{ex.title}</div>
                    <span className="text-[10px] font-black text-purple-900 bg-purple-100 px-1.5 py-0.5 rounded shrink-0">
                      {ex.totalMarks}M
                    </span>
                  </div>
                  <div className="text-gray-600 text-[11px]">{ex.subjectName}</div>
                  <div className="text-[11px] text-gray-500 flex items-center justify-between pt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" /> {ex.startTime} - {ex.endTime}
                      {isST2 ? ' (2.5h)' : ' (3h)'}
                    </span>
                    <span className="truncate max-w-[140px]">{ex.venue}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trips / Tours */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-600" /> Educational Trips
            </h3>
            <button
              onClick={() => onNavigate('travel')}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              View Checkpoints
            </button>
          </div>

          {travelGroups.length > 0 ? (
            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs space-y-2">
              <div className="font-bold text-indigo-950">{travelGroups[0].tripName}</div>
              <div className="text-gray-600 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" /> {travelGroups[0].destination}
              </div>
              <div className="flex items-center justify-between pt-1 text-[11px] font-semibold text-indigo-800">
                <span>Checkpoints: {travelGroups[0].checkpoints.length} stops</span>
                <button
                  onClick={() => onNavigate('travel')}
                  className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs"
                >
                  Mark Checkpoint →
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-gray-400">No active trips assigned.</div>
          )}
        </div>
      </div>
    </div>
  );
};
