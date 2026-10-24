import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Maximize2,
  Minimize2,
  Play,
  RefreshCw,
  StopCircle,
  Users,
  Zap,
} from 'lucide-react';
import {
  closeAttendanceSession,
  generateQrDataUrl,
  getActiveSession,
  getAllClasses,
  getAllEnrollments,
  getAllSubjects,
  getAllUsers,
  getSessionRecords,
  refreshSessionQrToken,
  startAttendanceSession,
  submitStudentAttendance,
} from '../storage';
import { AttendanceRecord, AttendanceSession, User } from '../types';

interface DynamicAttendanceSessionModalProps {
  teacher: User;
  onClose?: () => void;
}

export const DynamicAttendanceSessionModal: React.FC<DynamicAttendanceSessionModalProps> = ({
  teacher,
  onClose,
}) => {
  const classes = getAllClasses();
  const subjects = getAllSubjects().filter(
    (s) => teacher.role === 'admin' || s.teacherId === teacher.id
  );

  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [roundNumber, setRoundNumber] = useState<number>(1); // Max 2 rounds of 30s
  const [isCompletedRounds, setIsCompletedRounds] = useState<boolean>(false);
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const [sessionRecords, setSessionRecords] = useState<AttendanceRecord[]>([]);

  // Form state
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [roomName, setRoomName] = useState<string>('Room 402 - CS Block');

  const allUsers = getAllUsers();
  const enrollments = getAllEnrollments();

  useEffect(() => {
    const current = getActiveSession(teacher.role === 'admin' ? undefined : teacher.id);
    if (current) {
      setActiveSession(current);
      setRoundNumber(1);
      setIsCompletedRounds(false);
      loadQr(current.currentQrToken);
    }
  }, [teacher]);

  // Periodic polling for records & 2x 30s timer
  useEffect(() => {
    if (!activeSession || isCompletedRounds) return;

    // Refresh records every 2 seconds
    const recordInterval = setInterval(() => {
      setSessionRecords(getSessionRecords(activeSession.id));
    }, 2000);

    setSessionRecords(getSessionRecords(activeSession.id));

    // Countdown timer for 30s
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // 30 seconds finished! Check round number
          if (roundNumber === 1) {
            // Move to Round 2 with NEW QR code
            setRoundNumber(2);
            handleNewQrCode();
            return 30;
          } else {
            // Round 2 finished! Exactly 2 times QR repeated for 30s.
            setIsCompletedRounds(true);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(recordInterval);
      clearInterval(timer);
    };
  }, [activeSession, roundNumber, isCompletedRounds]);

  const loadQr = async (token: string) => {
    const payload = JSON.stringify({
      sessionId: activeSession?.id,
      token,
      timestamp: Date.now(),
      type: 'SMART_CLASSROOM_ATTENDANCE',
    });
    const url = await generateQrDataUrl(payload);
    setQrDataUrl(url);
  };

  const handleNewQrCode = () => {
    if (!activeSession) return;
    const updated = refreshSessionQrToken(activeSession.id);
    if (updated) {
      setActiveSession(updated);
      loadQr(updated.currentQrToken);
    }
  };

  const handleStartSession = () => {
    const targetClass = classes.find((c) => c.id === selectedClassId) || classes[0];

    const newSession = startAttendanceSession({
      classGroupId: selectedClassId,
      subjectId: selectedSubjectId,
      teacherId: teacher.id,
      roomName,
      latitude: targetClass.defaultLat,
      longitude: targetClass.defaultLng,
      radiusMeters: 80,
      allowLocationCheck: true,
      allowBleCheck: false,
      tokenIntervalSeconds: 30,
    });

    setActiveSession(newSession);
    setRoundNumber(1);
    setIsCompletedRounds(false);
    setTimeLeft(30);
    loadQr(newSession.currentQrToken);
    setSessionRecords([]);
  };

  const handleRestartNewBatch = () => {
    // Generate new QR code session with 2 rounds again
    handleStartSession();
  };

  const handleCloseSession = () => {
    if (!activeSession) return;
    closeAttendanceSession(activeSession.id, teacher.id);
    setActiveSession(null);
    setQrDataUrl('');
    setIsCompletedRounds(false);
    if (onClose) onClose();
  };

  const handleSimulateScan = (studentUser: User) => {
    if (!activeSession) return;

    const res = submitStudentAttendance({
      student: studentUser,
      tokenPayload: activeSession.currentQrToken,
      studentLat: activeSession.latitude + 0.00004,
      studentLng: activeSession.longitude + 0.00004,
      bleDetected: true,
    });

    if (res.success) {
      setSessionRecords(getSessionRecords(activeSession.id));
      alert(`✅ Marked Present: ${studentUser.name}`);
    } else {
      alert(res.error || 'Scan error');
    }
  };

  const activeSubject = subjects.find((s) => s.id === activeSession?.subjectId);

  const enrolledStudentIds =
    enrollments.find((e) => e.classGroupId === (activeSession?.classGroupId || selectedClassId))
      ?.subjectIds.length
      ? enrollments
          .filter((e) => e.classGroupId === (activeSession?.classGroupId || selectedClassId))
          .map((e) => e.studentId)
      : [];

  const enrolledStudents = allUsers.filter(
    (u) => u.role === 'student' && enrolledStudentIds.includes(u.id)
  );

  const presentCount = sessionRecords.filter((r) => r.status === 'present').length;

  return (
    <div
      className={`bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden ${
        fullscreen ? 'fixed inset-0 z-50 rounded-none overflow-y-auto p-8 bg-slate-900 text-white' : 'p-6'
      }`}
    >
      {!activeSession ? (
        /* Launch Setup */
        <div className="max-w-md mx-auto space-y-5 text-xs">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl mx-auto shadow-xs">
              📸
            </div>
            <h2 className="text-xl font-black text-gray-900">Take Class Attendance</h2>
            <p className="text-xs text-gray-500">
              Only 2 rounds of 30 seconds each, then creates new QR code.
            </p>
          </div>

          <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Select Subject</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-900"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Class</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-900"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Classroom</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-900"
              />
            </div>
          </div>

          <button
            onClick={handleStartSession}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Attendance (2x 30s Rounds)</span>
          </button>
        </div>
      ) : isCompletedRounds ? (
        /* Completed 2 Rounds (30s each) View */
        <div className="max-w-md mx-auto text-center space-y-5 p-6 bg-gray-50 rounded-3xl border border-gray-200 animate-in fade-in">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-2xl mx-auto">
            ⏱️
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-gray-900">
              Attendance Rounds Finished
            </h3>
            <p className="text-xs text-gray-600">
              Only 2 rounds (30 seconds each) completed. Total: {presentCount} of {enrolledStudents.length} students marked present.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-gray-200 text-left text-xs space-y-1.5">
            <div className="font-bold text-gray-900">Scanned Students:</div>
            {sessionRecords.map((r) => (
              <div key={r.id} className="flex justify-between text-emerald-700 font-semibold">
                <span>✓ {r.studentName}</span>
                <span>{new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
            {sessionRecords.length === 0 && (
              <div className="text-gray-400">No students scanned during these 2 rounds.</div>
            )}
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={handleRestartNewBatch}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Generate New QR Code (Next 2 Rounds)</span>
            </button>

            <button
              onClick={handleCloseSession}
              className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded-xl"
            >
              Close Attendance Session
            </button>
          </div>
        </div>
      ) : (
        /* Active QR Display with 2-Cycle Tracker */
        <div className="space-y-6">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-black uppercase text-emerald-700 tracking-wide">
                  Round {roundNumber} of 2 (30 seconds)
                </span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                  {roundNumber === 1 ? '1st QR Code' : '2nd New QR Code'}
                </span>
              </div>
              <h2 className="text-xl font-black text-gray-900 mt-0.5">
                {activeSubject?.code} - {activeSubject?.name}
              </h2>
              <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400" /> {activeSession.roomName}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFullscreen(!fullscreen)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                <span>{fullscreen ? 'Normal View' : 'Projector'}</span>
              </button>

              <button
                onClick={handleCloseSession}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <StopCircle className="w-4 h-4" />
                <span>Stop</span>
              </button>
            </div>
          </div>

          {/* QR Display + Live Roster */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left: Big QR Code */}
            <div className="md:col-span-6 bg-gray-50 border border-gray-200 rounded-3xl p-6 text-center flex flex-col items-center">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-200">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Live QR" className="w-64 h-64 object-contain" />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center text-gray-400">
                    Loading QR...
                  </div>
                )}
              </div>

              {/* 30s Countdown Display */}
              <div className="mt-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-xs text-gray-700 font-bold">
                  Round {roundNumber}/2 timer:
                </span>
                <span className="px-2.5 py-1 bg-amber-100 text-amber-950 font-black text-sm rounded-lg">
                  {timeLeft}s
                </span>
              </div>

              <div className="text-[11px] text-gray-500 mt-1">
                {roundNumber === 1
                  ? 'Rotates to 2nd QR code after 30s.'
                  : 'Final round of 30s. Stops automatically after this.'}
              </div>

              {/* Instant Test Buttons */}
              <div className="w-full mt-4 pt-4 border-t border-gray-200">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  ⚡ 1-Click Test (Simulate Student Scan)
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {enrolledStudents.slice(0, 3).map((stu) => {
                    const isMarked = sessionRecords.some((r) => r.studentId === stu.id);
                    return (
                      <button
                        key={stu.id}
                        disabled={isMarked}
                        onClick={() => handleSimulateScan(stu)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition-all ${
                          isMarked
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-white hover:bg-emerald-50 text-gray-800 border-gray-300 cursor-pointer'
                        }`}
                      >
                        {isMarked ? `✓ ${stu.name} (Present)` : `Scan as ${stu.name.split(' ')[0]}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Scanned Live List */}
            <div className="md:col-span-6 space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                    Present Students
                  </div>
                  <div className="text-2xl font-black text-blue-950 mt-0.5">
                    {presentCount} / {enrolledStudents.length}
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                  Round {roundNumber} of 2
                </span>
              </div>

              <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
                <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gray-500" />
                  Live Attendance Feed
                </div>

                <div className="divide-y divide-gray-100 text-xs max-h-72 overflow-y-auto">
                  {enrolledStudents.map((stu) => {
                    const rec = sessionRecords.find((r) => r.studentId === stu.id);
                    return (
                      <div
                        key={stu.id}
                        className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-50"
                      >
                        <div>
                          <div className="font-bold text-gray-900">{stu.name}</div>
                          <div className="text-[11px] text-gray-400">
                            Roll: {stu.rollNumber}
                          </div>
                        </div>

                        <div>
                          {rec ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Present
                            </span>
                          ) : (
                            <span className="text-[11px] text-gray-400 font-medium">
                              Waiting...
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
