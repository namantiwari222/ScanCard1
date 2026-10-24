import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Download,
  GraduationCap,
  Mail,
  Phone,
  Plus,
  QrCode,
  Search,
  Users,
  Trash2,
  Edit2,
  UserPlus,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import {
  createUser,
  deleteUser,
  generateQrDataUrl,
  getAllUsers,
  getAttendancePolicy,
  getStudentRecords,
  getStudentSubjectStats,
  updateUser,
} from '../storage';
import { User } from '../types';

interface StudentsViewProps {
  currentUser: User;
}

export const StudentsView: React.FC<StudentsViewProps> = ({ currentUser }) => {
  const isFacultyOrAdmin = currentUser.role === 'teacher' || currentUser.role === 'admin';
  const isAdmin = currentUser.role === 'admin';
  const policy = getAttendancePolicy();

  const [users, setUsers] = useState<User[]>(getAllUsers());
  const [activeTab, setActiveTab] = useState<'students' | 'teachers'>('students');

  const students = users.filter((u) => u.role === 'student');
  const teachers = users.filter((u) => u.role === 'teacher');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [studentQrUrl, setStudentQrUrl] = useState<string>('');

  // Add Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [addName, setAddName] = useState('');
  const [addRollOrEmp, setAddRollOrEmp] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addDept, setAddDept] = useState('Computer Science & Engineering');
  const [addSemester, setAddSemester] = useState(6);
  const [addRole, setAddRole] = useState<'student' | 'teacher'>('student');

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editRollOrEmp, setEditRollOrEmp] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editSemester, setEditSemester] = useState(6);

  // Delete Confirm State
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const refresh = () => {
    setUsers(getAllUsers());
  };

  const handleSelectStudent = async (stu: User) => {
    setSelectedStudent(stu);
    const qr = await generateQrDataUrl(`STUDENT_BADGE:${stu.id}:${stu.rollNumber || stu.username}`);
    setStudentQrUrl(qr);
  };

  const openAddModal = (defaultRole: 'student' | 'teacher' = 'student') => {
    setAddRole(defaultRole);
    setAddName('');
    setAddRollOrEmp('');
    setAddEmail('');
    setAddPhone('');
    setAddDept('Computer Science & Engineering');
    setAddSemester(6);
    setShowAddModal(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !addRollOrEmp.trim()) {
      alert(addRole === 'student' ? 'Name and Roll Number are required.' : 'Name and Employee ID are required.');
      return;
    }

    const isStudent = addRole === 'student';
    const cleanId = addRollOrEmp.toLowerCase().replace(/[^a-z0-9]/g, '');

    const newUser: User = {
      id: `user_${addRole}_${Date.now()}`,
      username: cleanId || `user_${Date.now()}`,
      password: '1234',
      name: addName.trim(),
      role: addRole,
      email: addEmail.trim() || `${cleanId}@apex.edu.in`,
      phone: addPhone.trim() || '+91 98000 00000',
      rollNumber: isStudent ? addRollOrEmp.trim() : undefined,
      employeeId: !isStudent ? addRollOrEmp.trim() : undefined,
      department: addDept.trim() || 'Computer Science & Engineering',
      semester: isStudent ? addSemester : undefined,
      section: isStudent ? 'A' : undefined,
    };

    createUser(newUser);
    alert(`${isStudent ? 'Student' : 'Faculty Member'} added successfully.`);
    setShowAddModal(false);
    refresh();
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditRollOrEmp(user.rollNumber || user.employeeId || user.username);
    setEditEmail(user.email || '');
    setEditPhone(user.phone || '');
    setEditDept(user.department || 'Computer Science & Engineering');
    setEditSemester(user.semester || 6);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editName.trim()) {
      alert('Name cannot be empty.');
      return;
    }

    const isStudent = editingUser.role === 'student';
    const updated: User = {
      ...editingUser,
      name: editName.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
      department: editDept.trim(),
      rollNumber: isStudent ? editRollOrEmp.trim() : undefined,
      employeeId: !isStudent ? editRollOrEmp.trim() : undefined,
      semester: isStudent ? editSemester : undefined,
    };

    updateUser(updated);
    alert(`${isStudent ? 'Student' : 'Faculty Member'} updated successfully.`);
    setEditingUser(null);
    if (selectedStudent?.id === updated.id) {
      setSelectedStudent(updated);
    }
    refresh();
  };

  const handleDeleteUser = (user: User) => {
    if (user.id === currentUser.id) {
      alert('You cannot delete your own active administrator account.');
      return;
    }
    deleteUser(user.id);
    alert(`${user.name} has been removed from the directory.`);
    setDeletingUser(null);
    if (selectedStudent?.id === user.id) {
      setSelectedStudent(null);
    }
    refresh();
  };

  const currentList = activeTab === 'students' ? students : teachers;
  const filteredList = currentList.filter((u) => {
    const term = searchTerm.toLowerCase();
    const matchName = u.name.toLowerCase().includes(term);
    const matchRoll = (u.rollNumber || '').toLowerCase().includes(term);
    const matchEmp = (u.employeeId || '').toLowerCase().includes(term);
    return matchName || matchRoll || matchEmp;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Verified Academic Directory
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Institutional directory with full Add, Edit, and Delete management capabilities
          </p>
        </div>

        {isFacultyOrAdmin && (
          <div className="flex gap-2">
            <button
              onClick={() => openAddModal(activeTab === 'students' ? 'student' : 'teacher')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add {activeTab === 'students' ? 'Student' : 'Faculty'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Role Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'students'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Students ({students.length})
          </button>
          <button
            onClick={() => setActiveTab('teachers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'teachers'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Faculty & Teachers ({teachers.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={
              activeTab === 'students'
                ? 'Search student name or roll...'
                : 'Search faculty name or ID...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredList.map((user) => {
          if (activeTab === 'students') {
            const stats = getStudentSubjectStats(user.id);
            const totalHeld = stats.reduce((acc, s) => acc + s.totalHeld, 0);
            const totalAttended = stats.reduce((acc, s) => acc + s.attended, 0);
            // Requirement: if no attendance mark then show 0%
            const overallPct =
              totalHeld === 0 || totalAttended === 0
                ? 0
                : Math.round((totalAttended / totalHeld) * 1000) / 10;
            const isBelow = overallPct < policy.minRequiredPercentage;

            return (
              <div
                key={user.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div
                      onClick={() => handleSelectStudent(user)}
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                        {user.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm hover:text-blue-600">
                          {user.name}
                        </h3>
                        <div className="text-[11px] text-gray-500">
                          Roll: <span className="font-semibold text-gray-700">{user.rollNumber}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isBelow
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {overallPct}%
                    </span>
                  </div>

                  <div className="text-[11px] text-gray-600 space-y-1 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                    <div className="text-gray-500 text-[10px] pt-1">
                      {user.department} • Sem {user.semester || 6}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                  <span className="text-gray-500">
                    {totalAttended} of {totalHeld} attended
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSelectStudent(user)}
                      className="px-2 py-1 text-blue-600 font-bold hover:bg-blue-50 rounded-lg cursor-pointer"
                    >
                      Card
                    </button>
                    {isFacultyOrAdmin && (
                      <>
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                          title="Edit Student"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingUser(user)}
                          className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Remove Student"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          } else {
            // Teacher card
            return (
              <div
                key={user.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-700 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                        {user.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{user.name}</h3>
                        <div className="text-[11px] text-purple-700 font-semibold">
                          ID: {user.employeeId || user.username}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      Faculty
                    </span>
                  </div>

                  <div className="text-[11px] text-gray-600 space-y-1 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                    <div className="text-gray-500 text-[10px] pt-1">
                      Department: {user.department}
                    </div>
                  </div>
                </div>

                {isFacultyOrAdmin && (
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-1 text-[11px]">
                    <button
                      onClick={() => openEditModal(user)}
                      className="px-2 py-1 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg flex items-center gap-1 cursor-pointer font-semibold"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => setDeletingUser(user)}
                        className="px-2 py-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1 cursor-pointer font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          }
        })}
      </div>

      {/* Selected Student Profile Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                  Student Verification Card
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-1">{selectedStudent.name}</h3>
                <p className="text-xs text-gray-500">
                  Roll: {selectedStudent.rollNumber} • {selectedStudent.department} (Sem{' '}
                  {selectedStudent.semester || 6})
                </p>
              </div>

              {studentQrUrl && (
                <div className="p-1 bg-white border border-gray-200 rounded-xl shadow-xs">
                  <img src={studentQrUrl} alt="Badge QR" className="w-16 h-16 object-contain" />
                </div>
              )}
            </div>

            {/* Subject Stats */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Current Course Standing & Compliance
              </h4>
              <div className="space-y-2">
                {getStudentSubjectStats(selectedStudent.id).map((s) => (
                  <div
                    key={s.subjectId}
                    className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-gray-900">
                        {s.subjectCode} - {s.subjectName}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {s.attended} attended / {s.totalHeld} held
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-black text-sm ${
                          s.percentage >= policy.minRequiredPercentage
                            ? 'text-emerald-700'
                            : 'text-red-600'
                        }`}
                      >
                        {s.percentage}%
                      </span>
                      <div className="text-[10px] text-gray-400">
                        {s.classesNeeded > 0 ? `Need ${s.classesNeeded} classes` : '✓ Eligible'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                {studentQrUrl && (
                  <a
                    href={studentQrUrl}
                    download={`${selectedStudent.rollNumber}_badge.png`}
                    className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Download QR Badge
                  </a>
                )}
                {isFacultyOrAdmin && (
                  <button
                    onClick={() => {
                      openEditModal(selectedStudent);
                    }}
                    className="text-xs text-gray-700 font-bold hover:text-blue-600 flex items-center gap-1 ml-2 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-gray-900">
              Add New {addRole === 'student' ? 'Student' : 'Faculty Member'}
            </h3>
            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  {addRole === 'student' ? 'Roll Number *' : 'Employee ID *'}
                </label>
                <input
                  type="text"
                  placeholder={addRole === 'student' ? 'e.g. CS-2024-006' : 'e.g. EMP-CSE-19'}
                  value={addRollOrEmp}
                  onChange={(e) => setAddRollOrEmp(e.target.value)}
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">College Email</label>
                <input
                  type="email"
                  placeholder="name@apex.edu.in"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Mobile Phone (WhatsApp)</label>
                <input
                  type="tel"
                  placeholder="+91 98765 12345"
                  value={addPhone}
                  onChange={(e) => setAddPhone(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={addDept}
                  onChange={(e) => setAddDept(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {addRole === 'student' && (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Semester</label>
                  <input
                    type="number"
                    value={addSemester}
                    onChange={(e) => setAddSemester(Number(e.target.value))}
                    min={1}
                    max={8}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

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
                  Save & Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" />
                Edit {editingUser.role === 'student' ? 'Student' : 'Faculty'} Details
              </h3>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  {editingUser.role === 'student' ? 'Roll Number *' : 'Employee ID *'}
                </label>
                <input
                  type="text"
                  value={editRollOrEmp}
                  onChange={(e) => setEditRollOrEmp(e.target.value)}
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {editingUser.role === 'student' && (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Semester</label>
                  <input
                    type="number"
                    value={editSemester}
                    onChange={(e) => setEditSemester(Number(e.target.value))}
                    min={1}
                    max={8}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Confirm Deletion</h3>
                <p className="text-gray-500 text-[11px]">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-gray-700">
              Are you sure you want to remove <span className="font-bold text-gray-900">{deletingUser.name}</span> (
              {deletingUser.rollNumber || deletingUser.employeeId || deletingUser.username}) from the institutional records?
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteUser(deletingUser)}
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
