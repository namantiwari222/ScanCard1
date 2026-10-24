import React, { useState } from 'react';
import jsPDF from 'jspdf';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Download,
  Edit2,
  FileSpreadsheet,
  FileText,
  Filter,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  Users,
} from 'lucide-react';
import {
  addManualAttendanceRecord,
  deleteAttendanceRecord,
  getAllClasses,
  getAllRecords,
  getAllSubjects,
  getAllUsers,
  getAttendancePolicy,
  updateAttendanceRecord,
} from '../storage';
import { AttendanceRecord, AttendanceStatus, User } from '../types';

interface AttendanceReportsViewProps {
  currentUser: User;
}

export const AttendanceReportsView: React.FC<AttendanceReportsViewProps> = ({ currentUser }) => {
  const isFacultyOrAdmin = currentUser.role === 'teacher' || currentUser.role === 'admin';
  const classes = getAllClasses();
  const subjects = getAllSubjects();
  const allUsers = getAllUsers();
  const students = allUsers.filter((u) => u.role === 'student');
  const policy = getAttendancePolicy();

  const [records, setRecords] = useState<AttendanceRecord[]>(getAllRecords());
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Add Record Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [addStudentId, setAddStudentId] = useState<string>(students[0]?.id || '');
  const [addSubjectId, setAddSubjectId] = useState<string>(subjects[0]?.id || '');
  const [addStatus, setAddStatus] = useState<AttendanceStatus>('present');
  const [addDate, setAddDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [addNotes, setAddNotes] = useState<string>('Manually recorded by administration');

  // Manual correction modal state
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [newStatus, setNewStatus] = useState<AttendanceStatus>('present');
  const [correctionReason, setCorrectionReason] = useState<string>('');

  // Delete modal state
  const [deletingRecord, setDeletingRecord] = useState<AttendanceRecord | null>(null);

  const refreshRecords = () => {
    setRecords(getAllRecords());
  };

  // Filter records based on role and criteria
  const filteredRecords = records.filter((r) => {
    // If student, can only view their own records
    if (currentUser.role === 'student' && r.studentId !== currentUser.id) {
      return false;
    }

    if (selectedSubject !== 'all' && r.subjectId !== selectedSubject) {
      return false;
    }

    if (selectedStatus !== 'all' && r.status !== selectedStatus) {
      return false;
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = r.studentName.toLowerCase().includes(term);
      const matchRoll = r.studentRoll.toLowerCase().includes(term);
      return matchName || matchRoll;
    }

    return true;
  });

  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      alert('No records available to export.');
      return;
    }

    const headers = [
      'Record ID',
      'Student Roll',
      'Student Name',
      'Subject Code',
      'Date',
      'Time',
      'Status',
      'Verification Method',
      'Distance (Meters)',
      'Verified In Geofence',
    ];

    const rows = filteredRecords.map((r) => {
      const sub = subjects.find((s) => s.id === r.subjectId);
      const date = new Date(r.timestamp).toISOString().split('T')[0];
      const time = new Date(r.timestamp).toLocaleTimeString();
      return [
        r.id,
        `"${r.studentRoll}"`,
        `"${r.studentName}"`,
        `"${sub?.code || r.subjectId}"`,
        date,
        time,
        r.status,
        r.verificationMethod,
        r.locationEvidence?.distanceMeters ?? 'N/A',
        r.locationEvidence?.verified ? 'YES' : 'NO',
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `scancard_attendance_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (filteredRecords.length === 0) {
      alert('No records available to export.');
      return;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');

    // Header
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Apex Institute of Technology & Engineering', 105, 16, { align: 'center' });

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Department of Computer Science & Engineering', 105, 23, { align: 'center' });
    pdf.text('Official Smart Attendance Verification Report', 105, 29, { align: 'center' });

    pdf.setLineWidth(0.5);
    pdf.line(14, 34, 196, 34);

    // Meta details
    pdf.setFontSize(9);
    pdf.text(`Generated On: ${new Date().toLocaleString()}`, 14, 40);
    pdf.text(`Generated By: ${currentUser.name} (${currentUser.role.toUpperCase()})`, 14, 45);
    pdf.text(`Total Records: ${filteredRecords.length}`, 140, 40);
    pdf.text(`Policy Threshold: ${policy.minRequiredPercentage}%`, 140, 45);

    // Table Header
    let y = 54;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Roll', 14, y);
    pdf.text('Student Name', 40, y);
    pdf.text('Subject', 90, y);
    pdf.text('Date & Time', 125, y);
    pdf.text('Status', 170, y);
    pdf.line(14, y + 2, 196, y + 2);
    y += 7;

    pdf.setFont('helvetica', 'normal');
    filteredRecords.slice(0, 32).forEach((r) => {
      const sub = subjects.find((s) => s.id === r.subjectId);
      const dateStr = `${new Date(r.timestamp).toLocaleDateString()} ${new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

      pdf.text(r.studentRoll.substring(0, 10), 14, y);
      pdf.text(r.studentName.substring(0, 22), 40, y);
      pdf.text(sub?.code || 'CS', 90, y);
      pdf.text(dateStr, 125, y);
      pdf.text(r.status.toUpperCase(), 170, y);
      y += 6;
    });

    if (filteredRecords.length > 32) {
      pdf.setFontSize(8);
      pdf.text(`... and ${filteredRecords.length - 32} more records. Export CSV for full dataset.`, 14, y + 4);
    }

    pdf.save(`attendance_report_${Date.now()}.pdf`);
  };

  const handleSaveCorrection = () => {
    if (!editingRecord) return;
    if (!correctionReason.trim()) {
      alert('Please state an audit reason for modifying this attendance record.');
      return;
    }

    const res = updateAttendanceRecord({
      recordId: editingRecord.id,
      newStatus,
      reason: correctionReason.trim(),
      actor: currentUser,
    });

    if (res.success) {
      alert('Record updated with audit trail.');
      setEditingRecord(null);
      setCorrectionReason('');
      refreshRecords();
    } else {
      alert(res.error || 'Failed to update record');
    }
  };

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === addStudentId) || students[0];
    const sub = subjects.find((s) => s.id === addSubjectId) || subjects[0];
    if (!student || !sub) {
      alert('Please select valid student and subject.');
      return;
    }

    const newRecord: AttendanceRecord = {
      id: `rec_manual_${Date.now()}_${student.id}`,
      sessionId: `sess_manual_${Date.now()}`,
      classGroupId: classes[0]?.id || 'class_cse_6a',
      subjectId: sub.id,
      studentId: student.id,
      studentRoll: student.rollNumber || student.username,
      studentName: student.name,
      timestamp: new Date(`${addDate}T10:00:00`).toISOString(),
      status: addStatus,
      verificationMethod: 'manual',
      notes: addNotes.trim() || 'Manual entry by administration',
      auditTrail: [
        {
          updatedBy: currentUser.name,
          role: currentUser.role,
          previousStatus: 'absent',
          newStatus: addStatus,
          reason: addNotes.trim() || 'Initial manual entry',
          timestamp: new Date().toISOString(),
        },
      ],
    };

    addManualAttendanceRecord(newRecord, currentUser);
    alert(`Attendance record created for ${student.name}.`);
    setShowAddModal(false);
    refreshRecords();
  };

  const handleDeleteRecord = (rec: AttendanceRecord) => {
    const res = deleteAttendanceRecord(rec.id, currentUser);
    if (res.success) {
      alert(`Attendance record removed successfully.`);
      setDeletingRecord(null);
      refreshRecords();
    } else {
      alert(res.error || 'Failed to delete record');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Export Actions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            {currentUser.role === 'student' ? 'My Attendance Verification Logs' : 'Attendance Reports & Audit Logs'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Filter, inspect GPS geofence evidence, and export certified records (Add, Edit, Delete supported)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isFacultyOrAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Record
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </button>

          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Search Student
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Roll No or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Subject Filter
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Verification Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="present">Present (Verified)</option>
            <option value="absent">Absent</option>
            <option value="verification_failed">Location Flagged</option>
            <option value="manual_corrected">Manually Corrected</option>
          </select>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <div className="text-xs font-bold text-gray-700">
            Attendance Verification Records ({filteredRecords.length})
          </div>
          <span className="text-[11px] text-gray-400">Sorted by most recent</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Verification Evidence</th>
                {currentUser.role !== 'student' && (
                  <th className="py-3 px-4 text-right">Teacher Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No matching attendance records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.slice(0, 50).map((r) => {
                  const sub = subjects.find((s) => s.id === r.subjectId);
                  const isFlagged = r.status === 'verification_failed';

                  return (
                    <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900">{r.studentName}</div>
                        <div className="text-[10px] text-gray-500">Roll: {r.studentRoll}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-800">{sub?.code || 'CS'}</span>
                        <div className="text-[10px] text-gray-400 truncate max-w-[150px]">
                          {sub?.name || 'Subject'}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-gray-600">
                        <div>{new Date(r.timestamp).toLocaleDateString()}</div>
                        <div className="text-[10px] text-gray-400">
                          {new Date(r.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {r.status === 'present' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> Present
                          </span>
                        ) : isFlagged ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                            <AlertCircle className="w-3 h-3" /> Flagged Out-of-Area
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700">
                            {r.status}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-[11px] text-gray-600">
                        <div>Method: {r.verificationMethod}</div>
                        {r.locationEvidence && (
                          <div className="text-[10px] text-gray-500">
                            Distance: {r.locationEvidence.distanceMeters}m (GPS Verified)
                          </div>
                        )}
                        {r.auditTrail && r.auditTrail.length > 0 && (
                          <div className="text-[10px] text-blue-600 font-semibold mt-0.5">
                            Modified by {r.auditTrail[0].updatedBy} ({r.auditTrail[0].reason})
                          </div>
                        )}
                      </td>

                      {currentUser.role !== 'student' && (
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditingRecord(r);
                                setNewStatus(r.status);
                                setCorrectionReason('');
                              }}
                              className="p-1.5 hover:bg-gray-100 text-gray-600 hover:text-blue-600 rounded-lg transition-colors inline-flex items-center gap-1 text-[11px] cursor-pointer"
                              title="Manual attendance correction with audit trail"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => setDeletingRecord(r)}
                              className="p-1.5 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-lg transition-colors inline-flex items-center gap-1 text-[11px] cursor-pointer"
                              title="Remove attendance record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Correction (Edit) Modal */}
      {editingRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                Manual Attendance Correction
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Student: <span className="font-bold">{editingRecord.studentName}</span> (Roll:{' '}
                {editingRecord.studentRoll})
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Change Status To:
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as AttendanceStatus)}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-blue-500"
              >
                <option value="present">Present (Excused / Manually Verified)</option>
                <option value="absent">Absent</option>
                <option value="excused">Excused Medical Absence</option>
                <option value="verification_failed">Verification Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Required Audit Reason *
              </label>
              <textarea
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                rows={3}
                placeholder="State valid reason (e.g. Student presented medical certificate / Indoor GPS glitch verified in person)"
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setEditingRecord(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCorrection}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Confirm Correction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Manual Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Add Manual Attendance Record
            </h3>
            <form onSubmit={handleAddRecord} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Select Student *</label>
                <select
                  value={addStudentId}
                  onChange={(e) => setAddStudentId(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                >
                  {students.map((stu) => (
                    <option key={stu.id} value={stu.id}>
                      {stu.name} ({stu.rollNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Select Subject *</label>
                <select
                  value={addSubjectId}
                  onChange={(e) => setAddSubjectId(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.code} - {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={addStatus}
                    onChange={(e) => setAddStatus(e.target.value as AttendanceStatus)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="excused">Excused Absence</option>
                    <option value="verification_failed">Flagged</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={addDate}
                    onChange={(e) => setAddDate(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Notes / Verification Reason</label>
                <input
                  type="text"
                  value={addNotes}
                  onChange={(e) => setAddNotes(e.target.value)}
                  placeholder="e.g. Approved medical leave or in-person check"
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  Add Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Record Confirmation Modal */}
      {deletingRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Record</h3>
                <p className="text-gray-500 text-[11px]">Remove this attendance entry.</p>
              </div>
            </div>

            <p className="text-gray-700">
              Are you sure you want to remove attendance for{' '}
              <span className="font-bold text-gray-900">{deletingRecord.studentName}</span> (
              {deletingRecord.studentRoll}) on{' '}
              <span className="font-semibold text-gray-900">
                {new Date(deletingRecord.timestamp).toLocaleDateString()}
              </span>
              ?
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDeletingRecord(null)}
                className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteRecord(deletingRecord)}
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
