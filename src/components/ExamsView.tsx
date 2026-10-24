import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  BookOpen,
  Award,
  AlertCircle,
  AlertTriangle,
  BellRing,
  Edit2,
  Trash2,
} from 'lucide-react';
import {
  createExam,
  deleteExam,
  getAllClasses,
  getAllExams,
  getAllSubjects,
  updateExam,
} from '../storage';
import { ExamSchedule, User } from '../types';

interface ExamsViewProps {
  currentUser: User;
}

export const ExamsView: React.FC<ExamsViewProps> = ({ currentUser }) => {
  const isFacultyOrAdmin = currentUser.role === 'teacher' || currentUser.role === 'admin';
  const subjects = getAllSubjects();
  const classes = getAllClasses();

  const [exams, setExams] = useState<ExamSchedule[]>(getAllExams());
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // Form
  const [title, setTitle] = useState('Mid-Term Theory Exam');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [examDate, setExamDate] = useState('2026-11-08');
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('01:00 PM');
  const [venue, setVenue] = useState('Exam Hall 2 - Academic Block');
  const [totalMarks, setTotalMarks] = useState(50);
  const [instructions, setInstructions] = useState(
    'Strict physical verification at door. Scientific calculators permitted.'
  );

  // Edit Form
  const [editingExam, setEditingExam] = useState<ExamSchedule | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubjectId, setEditSubjectId] = useState('');
  const [editExamDate, setEditExamDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editVenue, setEditVenue] = useState('');
  const [editTotalMarks, setEditTotalMarks] = useState(70);
  const [editInstructions, setEditInstructions] = useState('');

  // Delete State
  const [deletingExam, setDeletingExam] = useState<ExamSchedule | null>(null);

  const refreshExams = () => {
    setExams(getAllExams());
  };

  const openEditModal = (exam: ExamSchedule) => {
    setEditingExam(exam);
    setEditTitle(exam.title);
    setEditSubjectId(exam.subjectId);
    setEditExamDate(exam.examDate);
    setEditStartTime(exam.startTime);
    setEditEndTime(exam.endTime);
    setEditVenue(exam.venue);
    setEditTotalMarks(exam.totalMarks);
    setEditInstructions(exam.instructions || '');
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExam) return;
    const sub = subjects.find((s) => s.id === editSubjectId) || subjects[0];
    const updated: ExamSchedule = {
      ...editingExam,
      title: editTitle.trim(),
      subjectId: sub.id,
      subjectName: `${sub.name} (${sub.code})`,
      examDate: editExamDate,
      startTime: editStartTime.trim(),
      endTime: editEndTime.trim(),
      venue: editVenue.trim(),
      totalMarks: Number(editTotalMarks),
      instructions: editInstructions.trim(),
    };
    updateExam(updated, currentUser);
    alert('Examination schedule updated.');
    setEditingExam(null);
    refreshExams();
  };

  const handleDelete = (exam: ExamSchedule) => {
    deleteExam(exam.id, currentUser);
    alert(`Exam "${exam.title}" deleted.`);
    setDeletingExam(null);
    refreshExams();
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const sub = subjects.find((s) => s.id === subjectId) || subjects[0];
    const targetClass = classes[0];

    const newExam: ExamSchedule = {
      id: `exam_${Date.now()}`,
      title,
      subjectId: sub.id,
      subjectName: `${sub.name} (${sub.code})`,
      classGroupId: targetClass.id,
      className: targetClass.name,
      examDate,
      startTime,
      endTime,
      venue,
      totalMarks,
      instructions,
      remindersEnabled: true,
      reminderDaysBefore: [3, 1, 0],
    };

    createExam(newExam, currentUser);
    alert('Examination schedule created and broadcast to enrolled students.');
    setShowCreateModal(false);
    refreshExams();
  };

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'session_test_2' | 'pre_university' | 'university'>('all');

  const filteredExams = exams.filter((exam) => {
    if (selectedFilter === 'session_test_2') {
      return exam.title.includes('Session Test 2') || (exam.examDate >= '2026-11-02' && exam.examDate <= '2026-11-05');
    }
    if (selectedFilter === 'pre_university') {
      return exam.title.includes('Pre-University') || (exam.examDate >= '2026-11-16' && exam.examDate <= '2026-11-21');
    }
    if (selectedFilter === 'university') {
      return exam.title.includes('University Examination') || exam.examDate >= '2026-11-24';
    }
    return true;
  });

  const getExamBadge = (exam: ExamSchedule) => {
    if (exam.title.includes('Session Test 2') || (exam.examDate >= '2026-11-02' && exam.examDate <= '2026-11-05')) {
      const isShift1 = exam.startTime.includes('10:00');
      return {
        label: `Session Test 2 • 40 Marks (${isShift1 ? 'Shift 1: 10:00 AM - 12:30 PM' : 'Shift 2: 02:00 PM - 04:30 PM'})`,
        subLabel: '2 Exams / Day • 2.5 Hours',
        className: 'bg-amber-100 text-amber-900 border-amber-300',
      };
    }
    if (exam.title.includes('Pre-University') || (exam.examDate >= '2026-11-16' && exam.examDate <= '2026-11-21')) {
      return {
        label: 'Pre-University Test (PUT) • 70 Marks',
        subLabel: '1 Exam / Day • 3 Hours (10:00 AM - 01:00 PM)',
        className: 'bg-blue-100 text-blue-900 border-blue-300',
      };
    }
    if (exam.title.includes('University Examination') || exam.examDate >= '2026-11-24') {
      return {
        label: 'University Exam (UT) • 70 Marks',
        subLabel: '1 Exam / Day • 3 Hours (10:00 AM - 01:00 PM)',
        className: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      };
    }
    return {
      label: 'Academic Exam',
      subLabel: `${exam.totalMarks} Marks`,
      className: 'bg-purple-100 text-purple-900 border-purple-300',
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Academic Examination Schedules & Timetable
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            <span className="font-semibold text-amber-800">Session Test 2:</span> Nov 2–5 (40 Marks, 2 exams/day, 10:00 AM - 12:30 PM & 02:00 PM - 04:30 PM) •{' '}
            <span className="font-semibold text-blue-800">Pre-University Test:</span> Nov 16–21 (70 Marks, 3 hours, 1 exam/day) •{' '}
            <span className="font-semibold text-emerald-800">University Exam:</span> Starts Nov 24 (70 Marks, 3 hours, 1 exam/day)
          </p>
        </div>

        {isFacultyOrAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors self-start cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Schedule New Exam
          </button>
        )}
      </div>

      {/* Filter Tabs for the 3 Schedules */}
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-3.5 py-2 rounded-xl font-bold border transition-all cursor-pointer ${
            selectedFilter === 'all'
              ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          All Exams ({exams.length})
        </button>

        <button
          onClick={() => setSelectedFilter('session_test_2')}
          className={`px-3.5 py-2 rounded-xl font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedFilter === 'session_test_2'
              ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
              : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
          }`}
        >
          <span>📝 Session Test 2</span>
          <span className="text-[11px] font-semibold opacity-90">(2-5 Nov • 40 Marks • 2 Exams/Day)</span>
        </button>

        <button
          onClick={() => setSelectedFilter('pre_university')}
          className={`px-3.5 py-2 rounded-xl font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedFilter === 'pre_university'
              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
              : 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100'
          }`}
        >
          <span>📋 Pre-University Test</span>
          <span className="text-[11px] font-semibold opacity-90">(16-21 Nov • 70 Marks • 3h Single/Day)</span>
        </button>

        <button
          onClick={() => setSelectedFilter('university')}
          className={`px-3.5 py-2 rounded-xl font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedFilter === 'university'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
              : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          <span>🏛️ University Examination</span>
          <span className="text-[11px] font-semibold opacity-90">(Starts 24 Nov • 70 Marks • 3h Single/Day)</span>
        </button>
      </div>

      {/* Exam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredExams.map((exam) => {
          const badge = getExamBadge(exam);
          return (
            <div
              key={exam.id}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border inline-block ${badge.className}`}>
                      {badge.label}
                    </span>
                    <div className="text-[10px] font-bold text-gray-500">
                      {badge.subLabel}
                    </div>
                    <h3 className="text-base font-bold text-gray-900 pt-1">{exam.title}</h3>
                  </div>
                  <span className="text-xs font-black text-purple-900 bg-purple-100 px-2.5 py-1 rounded-lg shrink-0 border border-purple-200">
                    {exam.totalMarks} Marks
                  </span>
                </div>

                <div className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>{exam.subjectName}</span>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-bold text-gray-900">{exam.examDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>
                      {exam.startTime} - {exam.endTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>{exam.venue}</span>
                  </div>
                </div>

                <div className="text-[11px] text-gray-500 bg-purple-50/40 p-2.5 rounded-lg border border-purple-100 leading-relaxed">
                  <span className="font-bold text-purple-900">Instructions: </span>
                  {exam.instructions}
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1 text-[11px]">
                  <BellRing className="w-3.5 h-3.5 text-emerald-600" /> Reminders Active
                </span>
                {isFacultyOrAdmin ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(exam)}
                      className="px-2.5 py-1 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg flex items-center gap-1 font-semibold cursor-pointer text-[11px]"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => setDeletingExam(exam)}
                      className="px-2.5 py-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1 font-semibold cursor-pointer text-[11px]"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                ) : (
                  <span className="text-purple-600 font-semibold">Scheduled</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Exam Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Schedule Academic Examination</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Published to student timetable and triggers multi-channel notification alerts
              </p>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Quick Presets:</span>
              <div className="flex flex-wrap gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setTitle('Session Test 2 (Shift 1)');
                    setStartTime('10:00 AM');
                    setEndTime('12:30 PM');
                    setTotalMarks(40);
                    setExamDate('2026-11-02');
                    setInstructions('Session Test 2 (Nov 2 - Nov 5). Morning Shift 1 (10:00 AM - 12:30 PM). 40 Marks.');
                  }}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                >
                  📝 ST 2 Shift 1 (10:00 AM - 12:30 PM • 40M)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTitle('Session Test 2 (Shift 2)');
                    setStartTime('02:00 PM');
                    setEndTime('04:30 PM');
                    setTotalMarks(40);
                    setExamDate('2026-11-02');
                    setInstructions('Session Test 2 (Nov 2 - Nov 5). Afternoon Shift 2 (02:00 PM - 04:30 PM). 40 Marks.');
                  }}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                >
                  📝 ST 2 Shift 2 (02:00 PM - 04:30 PM • 40M)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTitle('Pre-University Test (PUT)');
                    setStartTime('10:00 AM');
                    setEndTime('01:00 PM');
                    setTotalMarks(70);
                    setExamDate('2026-11-16');
                    setInstructions('Pre-University Test (PUT) (Nov 16 - Nov 21). 3 hours duration. One exam per day. 70 Marks.');
                  }}
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                >
                  📋 PUT (3h • 70M)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTitle('University Examination');
                    setStartTime('10:00 AM');
                    setEndTime('01:00 PM');
                    setTotalMarks(70);
                    setExamDate('2026-11-24');
                    setInstructions('University Semester Examination. 3 hours duration. One exam per day. 70 Marks.');
                  }}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                >
                  🏛️ UT (3h • 70M)
                </button>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Exam Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Subject</label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    required
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">End Time</label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="01:00 PM"
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Venue / Hall</label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Examination Instructions
                </label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Publish & Broadcast Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Exam Modal */}
      {editingExam && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-purple-600" />
                Edit Examination Schedule
              </h3>
            </div>

            <form onSubmit={handleUpdate} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Exam Title *</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Subject</label>
                <select
                  value={editSubjectId}
                  onChange={(e) => setEditSubjectId(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-purple-500"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={editExamDate}
                    onChange={(e) => setEditExamDate(e.target.value)}
                    required
                    className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-purple-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-purple-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">End Time</label>
                  <input
                    type="text"
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                    placeholder="01:00 PM"
                    className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-purple-500 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Venue / Hall</label>
                  <input
                    type="text"
                    value={editVenue}
                    onChange={(e) => setEditVenue(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={editTotalMarks}
                    onChange={(e) => setEditTotalMarks(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Instructions</label>
                <textarea
                  rows={2}
                  value={editInstructions}
                  onChange={(e) => setEditInstructions(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingExam(null)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Exam Confirmation Modal */}
      {deletingExam && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Exam</h3>
                <p className="text-gray-500 text-[11px]">This exam schedule will be removed.</p>
              </div>
            </div>

            <p className="text-gray-700">
              Are you sure you want to remove <span className="font-bold text-gray-900">{deletingExam.title}</span> scheduled on {deletingExam.examDate}?
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDeletingExam(null)}
                className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingExam)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
