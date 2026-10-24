import React, { useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Building,
  Edit2,
  MapPin,
  Plus,
  School,
  Trash2,
  Users,
} from 'lucide-react';
import {
  createClass,
  createSubject,
  deleteClass,
  deleteSubject,
  getAllClasses,
  getAllSubjects,
  getAllUsers,
  updateClass,
  updateSubject,
} from '../storage';
import { ClassGroup, Subject, User } from '../types';

interface ClassesViewProps {
  currentUser: User;
}

export const ClassesView: React.FC<ClassesViewProps> = ({ currentUser }) => {
  const isFacultyOrAdmin = currentUser.role === 'teacher' || currentUser.role === 'admin';
  const [classes, setClasses] = useState<ClassGroup[]>(getAllClasses());
  const [subjects, setSubjects] = useState<Subject[]>(getAllSubjects());
  const teachers = getAllUsers().filter((u) => u.role === 'teacher');

  const [showClassModal, setShowClassModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  // New Class Form
  const [className, setClassName] = useState('B.Tech CSE - 8th Sem (Sec A)');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [room, setRoom] = useState('Room 501 - Tech Tower');
  const [geofenceRadius, setGeofenceRadius] = useState(80);
  const [academicYear, setAcademicYear] = useState('2026-2027');

  // Edit Class Form
  const [editingClass, setEditingClass] = useState<ClassGroup | null>(null);
  const [editClassName, setEditClassName] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editRoom, setEditRoom] = useState('');
  const [editRadius, setEditRadius] = useState(80);
  const [editYear, setEditYear] = useState('');

  // Delete Class Confirm
  const [deletingClass, setDeletingClass] = useState<ClassGroup | null>(null);

  // New Subject Form
  const [subCode, setSubCode] = useState('CS-401');
  const [subName, setSubName] = useState('Distributed Systems & Microservices');
  const [subCredits, setSubCredits] = useState(4);
  const [subSemester, setSubSemester] = useState(6);
  const [assignedTeacherId, setAssignedTeacherId] = useState(teachers[0]?.id || '');

  // Edit Subject Form
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editSubCode, setEditSubCode] = useState('');
  const [editSubName, setEditSubName] = useState('');
  const [editSubCredits, setEditSubCredits] = useState(3);
  const [editSubSemester, setEditSubSemester] = useState(6);
  const [editTeacherId, setEditTeacherId] = useState('');

  // Delete Subject Confirm
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);

  const refresh = () => {
    setClasses(getAllClasses());
    setSubjects(getAllSubjects());
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) {
      alert('Class name is required.');
      return;
    }
    const newCls: ClassGroup = {
      id: `class_${Date.now()}`,
      name: className.trim(),
      department: department.trim() || 'Computer Science & Engineering',
      semester: 6,
      section: 'A',
      academicYear: academicYear.trim() || '2026-2027',
      room: room.trim() || 'Tech Hall 1',
      defaultLat: 12.9716,
      defaultLng: 77.5946,
      geofenceRadius: Number(geofenceRadius) || 80,
    };
    createClass(newCls);
    alert('Academic Class Group created.');
    setShowClassModal(false);
    refresh();
  };

  const openEditClass = (cls: ClassGroup) => {
    setEditingClass(cls);
    setEditClassName(cls.name);
    setEditDept(cls.department);
    setEditRoom(cls.room);
    setEditRadius(cls.geofenceRadius);
    setEditYear(cls.academicYear);
  };

  const handleUpdateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;
    if (!editClassName.trim()) {
      alert('Class name is required.');
      return;
    }
    const updated: ClassGroup = {
      ...editingClass,
      name: editClassName.trim(),
      department: editDept.trim(),
      room: editRoom.trim(),
      geofenceRadius: Number(editRadius) || 80,
      academicYear: editYear.trim(),
    };
    updateClass(updated);
    alert('Class section updated successfully.');
    setEditingClass(null);
    refresh();
  };

  const handleDeleteClass = (cls: ClassGroup) => {
    deleteClass(cls.id);
    alert(`Class "${cls.name}" removed successfully.`);
    setDeletingClass(null);
    refresh();
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subCode.trim() || !subName.trim()) {
      alert('Subject code and name are required.');
      return;
    }
    const newSub: Subject = {
      id: `sub_${Date.now()}`,
      code: subCode.trim().toUpperCase(),
      name: subName.trim(),
      department: 'Computer Science & Engineering',
      semester: subSemester,
      credits: subCredits,
      teacherId: assignedTeacherId || teachers[0]?.id || '',
    };
    createSubject(newSub);
    alert('Subject added to curriculum.');
    setShowSubjectModal(false);
    refresh();
  };

  const openEditSubject = (sub: Subject) => {
    setEditingSubject(sub);
    setEditSubCode(sub.code);
    setEditSubName(sub.name);
    setEditSubCredits(sub.credits);
    setEditSubSemester(sub.semester);
    setEditTeacherId(sub.teacherId);
  };

  const handleUpdateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;
    if (!editSubCode.trim() || !editSubName.trim()) {
      alert('Subject code and name are required.');
      return;
    }
    const updated: Subject = {
      ...editingSubject,
      code: editSubCode.trim().toUpperCase(),
      name: editSubName.trim(),
      credits: Number(editSubCredits),
      semester: Number(editSubSemester),
      teacherId: editTeacherId,
    };
    updateSubject(updated);
    alert('Subject updated successfully.');
    setEditingSubject(null);
    refresh();
  };

  const handleDeleteSubject = (sub: Subject) => {
    deleteSubject(sub.id);
    alert(`Subject "${sub.name}" removed successfully.`);
    setDeletingSubject(null);
    refresh();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Curriculum, Classes & Subject Assignments
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Department sections, classroom venues, faculty course mapping, and GPS geofences (Add, Edit, Delete)
          </p>
        </div>

        {isFacultyOrAdmin && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowSubjectModal(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Subject
            </button>
            <button
              onClick={() => setShowClassModal(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Class
            </button>
          </div>
        )}
      </div>

      {/* Grid: Classes & Subjects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classes Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-700" /> Class Sections & Venues ({classes.length})
            </h3>
            {isFacultyOrAdmin && (
              <button
                onClick={() => setShowClassModal(true)}
                className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> New Class
              </button>
            )}
          </div>

          <div className="space-y-3">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 space-y-2 text-xs hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{cls.name}</h4>
                    <div className="text-gray-500 mt-0.5">{cls.department}</div>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded text-[11px]">
                    {cls.academicYear}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-gray-600 text-[11px] pt-1 border-t border-gray-200">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" /> {cls.room}
                  </span>
                  <span>•</span>
                  <span>Geofence Limit: {cls.geofenceRadius}m</span>
                </div>

                {isFacultyOrAdmin && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => openEditClass(cls)}
                      className="px-2.5 py-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => setDeletingClass(cls)}
                      className="px-2.5 py-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Subjects Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" /> Teaching Courses & Faculty ({subjects.length})
            </h3>
            {isFacultyOrAdmin && (
              <button
                onClick={() => setShowSubjectModal(true)}
                className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> New Subject
              </button>
            )}
          </div>

          <div className="space-y-3">
            {subjects.map((sub) => {
              const teacher = teachers.find((t) => t.id === sub.teacherId);
              return (
                <div
                  key={sub.id}
                  className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 space-y-2 text-xs hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                        {sub.code}
                      </span>
                      <h4 className="font-bold text-gray-900 text-sm mt-1">{sub.name}</h4>
                    </div>
                    <span className="font-semibold text-gray-500">{sub.credits} Credits</span>
                  </div>

                  <div className="text-[11px] text-gray-600 pt-1 border-t border-gray-200 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-gray-700 font-medium">
                      <School className="w-3.5 h-3.5 text-indigo-600" /> Faculty:{' '}
                      {teacher?.name || 'Assigned Instructor'}
                    </span>
                    <span className="text-gray-400">Semester {sub.semester}</span>
                  </div>

                  {isFacultyOrAdmin && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => openEditSubject(sub)}
                        className="px-2.5 py-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => setDeletingSubject(sub)}
                        className="px-2.5 py-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Create Class Modal */}
      {showClassModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-gray-900">Add Academic Class Group</h3>
            <form onSubmit={handleCreateClass} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Class Name *</label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  required
                  placeholder="e.g. B.Tech CSE - 6th Sem (Sec A)"
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Room / Venue</label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Geofence (m)</label>
                  <input
                    type="number"
                    value={geofenceRadius}
                    onChange={(e) => setGeofenceRadius(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowClassModal(false)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {editingClass && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-blue-600" />
              Edit Class Section
            </h3>
            <form onSubmit={handleUpdateClass} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Class Name *</label>
                <input
                  type="text"
                  value={editClassName}
                  onChange={(e) => setEditClassName(e.target.value)}
                  required
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
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Room / Venue</label>
                <input
                  type="text"
                  value={editRoom}
                  onChange={(e) => setEditRoom(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Geofence (m)</label>
                  <input
                    type="number"
                    value={editRadius}
                    onChange={(e) => setEditRadius(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={editYear}
                    onChange={(e) => setEditYear(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
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

      {/* Delete Class Confirmation */}
      {deletingClass && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Class</h3>
                <p className="text-gray-500 text-[11px]">This will delete the section definition.</p>
              </div>
            </div>
            <p className="text-gray-700">
              Are you sure you want to remove <span className="font-bold">{deletingClass.name}</span>?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDeletingClass(null)}
                className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteClass(deletingClass)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-gray-900">Add Curriculum Subject</h3>
            <form onSubmit={handleCreateSubject} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Subject Code *</label>
                <input
                  type="text"
                  value={subCode}
                  onChange={(e) => setSubCode(e.target.value)}
                  required
                  placeholder="e.g. CS-301"
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Subject Name *</label>
                <input
                  type="text"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  required
                  placeholder="e.g. Database Management Systems"
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Assign Faculty</label>
                <select
                  value={assignedTeacherId}
                  onChange={(e) => setAssignedTeacherId(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.department})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Credits</label>
                  <input
                    type="number"
                    value={subCredits}
                    onChange={(e) => setSubCredits(Number(e.target.value))}
                    min={1}
                    max={10}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Semester</label>
                  <input
                    type="number"
                    value={subSemester}
                    onChange={(e) => setSubSemester(Number(e.target.value))}
                    min={1}
                    max={8}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {editingSubject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-blue-600" />
              Edit Subject
            </h3>
            <form onSubmit={handleUpdateSubject} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Subject Code *</label>
                <input
                  type="text"
                  value={editSubCode}
                  onChange={(e) => setEditSubCode(e.target.value)}
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Subject Name *</label>
                <input
                  type="text"
                  value={editSubName}
                  onChange={(e) => setEditSubName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Assign Faculty</label>
                <select
                  value={editTeacherId}
                  onChange={(e) => setEditTeacherId(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.department})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Credits</label>
                  <input
                    type="number"
                    value={editSubCredits}
                    onChange={(e) => setEditSubCredits(Number(e.target.value))}
                    min={1}
                    max={10}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Semester</label>
                  <input
                    type="number"
                    value={editSubSemester}
                    onChange={(e) => setEditSubSemester(Number(e.target.value))}
                    min={1}
                    max={8}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
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

      {/* Delete Subject Confirmation */}
      {deletingSubject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Subject</h3>
                <p className="text-gray-500 text-[11px]">This will delete the subject from the curriculum.</p>
              </div>
            </div>
            <p className="text-gray-700">
              Are you sure you want to remove <span className="font-bold">{deletingSubject.name}</span> ({deletingSubject.code})?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDeletingSubject(null)}
                className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteSubject(deletingSubject)}
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
