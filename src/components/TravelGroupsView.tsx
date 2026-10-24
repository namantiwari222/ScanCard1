import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  MapPin,
  Phone,
  Plus,
  QrCode,
  ShieldAlert,
  Users,
  Edit2,
  Trash2,
} from 'lucide-react';
import {
  activateTravelCheckpoint,
  createTravelGroup,
  deleteTravelGroup,
  generateQrDataUrl,
  getAllTravelGroups,
  getAllUsers,
  updateTravelGroup,
  verifyStudentCheckpoint,
} from '../storage';
import { TravelCheckpoint, TravelGroup, User } from '../types';

interface TravelGroupsViewProps {
  currentUser: User;
}

export const TravelGroupsView: React.FC<TravelGroupsViewProps> = ({ currentUser }) => {
  const isFacultyOrAdmin = currentUser.role === 'teacher' || currentUser.role === 'admin';
  const allUsers = getAllUsers();
  const students = allUsers.filter((u) => u.role === 'student');

  const [travelGroups, setTravelGroups] = useState<TravelGroup[]>(getAllTravelGroups());
  const [selectedGroup, setSelectedGroup] = useState<TravelGroup>(travelGroups[0]);
  const [activeCheckpointQr, setActiveCheckpointQr] = useState<{
    checkpoint: TravelCheckpoint;
    qrUrl: string;
  } | null>(null);

  // Add Trip Modal
  const [showAddTripModal, setShowAddTripModal] = useState<boolean>(false);
  const [newTripName, setNewTripName] = useState('Industrial Visit: ISRO Space Center');
  const [newDestination, setNewDestination] = useState('Sriharikota, AP');
  const [newPurpose, setNewPurpose] = useState('Satellite launch telemetry and rocket propulsion observation');
  const [newStartDate, setNewStartDate] = useState('2026-11-29');
  const [newEmergency, setNewEmergency] = useState('+91 98112 34567 (Prof. Priya Mehta)');

  // Edit Trip Modal
  const [editingTrip, setEditingTrip] = useState<TravelGroup | null>(null);
  const [editTripName, setEditTripName] = useState('');
  const [editDestination, setEditDestination] = useState('');
  const [editPurpose, setEditPurpose] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEmergency, setEditEmergency] = useState('');

  // Delete Trip Modal
  const [deletingTrip, setDeletingTrip] = useState<TravelGroup | null>(null);

  // Add Checkpoint Modal
  const [showAddCheckpointModal, setShowAddCheckpointModal] = useState<boolean>(false);
  const [chkName, setChkName] = useState('Checkpoint: Arrival at Site');
  const [chkTime, setChkTime] = useState('11:00 AM');
  const [chkLocationNote, setChkLocationNote] = useState('Security Reception Gate');

  const refreshGroups = () => {
    const list = getAllTravelGroups();
    setTravelGroups(list);
    const updated = list.find((g) => g.id === selectedGroup?.id) || list[0];
    setSelectedGroup(updated);
  };

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTripName.trim()) {
      alert('Trip name is required.');
      return;
    }

    const newTrip: TravelGroup = {
      id: `trip_${Date.now()}`,
      tripName: newTripName.trim(),
      destination: newDestination.trim(),
      purpose: newPurpose.trim(),
      startDate: newStartDate,
      endDate: newStartDate,
      coordinatorTeacherId: currentUser.id,
      emergencyContact: newEmergency.trim(),
      participantStudentIds: students.slice(0, 4).map((s) => s.id),
      checkpoints: [
        {
          id: `chk_${Date.now()}_1`,
          name: 'Checkpoint 1: Departure Gate',
          order: 1,
          scheduledTime: '07:00 AM',
          status: 'pending',
          verifiedStudentIds: [],
          missingStudentIds: [],
          locationNote: 'Campus Bus Bay',
        },
      ],
    };

    createTravelGroup(newTrip, currentUser);
    alert('New travel group tour created.');
    setShowAddTripModal(false);
    refreshGroups();
    setSelectedGroup(newTrip);
  };

  const openEditTrip = (trip: TravelGroup) => {
    setEditingTrip(trip);
    setEditTripName(trip.tripName);
    setEditDestination(trip.destination);
    setEditPurpose(trip.purpose);
    setEditStartDate(trip.startDate);
    setEditEmergency(trip.emergencyContact);
  };

  const handleUpdateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrip) return;
    const updated: TravelGroup = {
      ...editingTrip,
      tripName: editTripName.trim(),
      destination: editDestination.trim(),
      purpose: editPurpose.trim(),
      startDate: editStartDate,
      endDate: editStartDate,
      emergencyContact: editEmergency.trim(),
    };
    updateTravelGroup(updated, currentUser);
    alert('Tour details updated.');
    setEditingTrip(null);
    refreshGroups();
  };

  const handleDeleteTrip = (trip: TravelGroup) => {
    deleteTravelGroup(trip.id, currentUser);
    alert(`Tour "${trip.tripName}" removed.`);
    setDeletingTrip(null);
    const remaining = travelGroups.filter((g) => g.id !== trip.id);
    setTravelGroups(remaining);
    setSelectedGroup(remaining[0]);
  };

  const handleAddCheckpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;
    const newCheckpoint: TravelCheckpoint = {
      id: `chk_${Date.now()}`,
      name: chkName.trim(),
      order: selectedGroup.checkpoints.length + 1,
      scheduledTime: chkTime.trim(),
      status: 'pending',
      verifiedStudentIds: [],
      missingStudentIds: [],
      locationNote: chkLocationNote.trim(),
    };
    const updated: TravelGroup = {
      ...selectedGroup,
      checkpoints: [...selectedGroup.checkpoints, newCheckpoint],
    };
    updateTravelGroup(updated, currentUser);
    alert('New checkpoint added to tour.');
    setShowAddCheckpointModal(false);
    refreshGroups();
  };

  const handleDeleteCheckpoint = (chkId: string) => {
    if (!selectedGroup) return;
    const updated: TravelGroup = {
      ...selectedGroup,
      checkpoints: selectedGroup.checkpoints.filter((c) => c.id !== chkId),
    };
    updateTravelGroup(updated, currentUser);
    alert('Checkpoint removed.');
    refreshGroups();
  };

  const handleActivateCheckpoint = async (checkpoint: TravelCheckpoint) => {
    if (!selectedGroup) return;
    const activated = activateTravelCheckpoint(selectedGroup.id, checkpoint.id, currentUser);
    if (activated && activated.qrToken) {
      const qrUrl = await generateQrDataUrl(
        JSON.stringify({
          type: 'TRAVEL_CHECKPOINT',
          tripId: selectedGroup.id,
          checkpointId: activated.id,
          token: activated.qrToken,
        })
      );
      setActiveCheckpointQr({ checkpoint: activated, qrUrl });
      refreshGroups();
    }
  };

  const handleStudentSelfCheckIn = (checkpoint: TravelCheckpoint) => {
    if (!selectedGroup) return;
    const res = verifyStudentCheckpoint(selectedGroup.id, checkpoint.id, currentUser.id);
    if (res.success) {
      alert(`Attendance recorded for ${checkpoint.name}! Status: VERIFIED`);
      refreshGroups();
    } else {
      alert(res.error || 'Failed to verify checkpoint');
    }
  };

  const participantStudents = students.filter((s) =>
    selectedGroup?.participantStudentIds.includes(s.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-600" />
            Group Travel & Industrial Tour Attendance
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Multi-checkpoint attendance tracking for college trips, industrial visits, and tours (Add, Edit, Delete)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {travelGroups.map((g) => (
            <button
              key={g.id}
              onClick={() => {
                setSelectedGroup(g);
                setActiveCheckpointQr(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                selectedGroup?.id === g.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {g.tripName.split(':')[0]}
            </button>
          ))}

          {isFacultyOrAdmin && (
            <button
              onClick={() => setShowAddTripModal(true)}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Tour
            </button>
          )}
        </div>
      </div>

      {selectedGroup && (
        <div className="space-y-6">
          {/* Trip Summary Card */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-white/10 px-2.5 py-0.5 rounded-full">
                  Official College Delegation
                </span>
                <h3 className="text-xl font-black mt-1.5">{selectedGroup.tripName}</h3>
                <p className="text-xs text-indigo-200 mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {selectedGroup.destination}
                </p>
                <p className="text-[11px] text-gray-300 mt-2 max-w-xl">
                  {selectedGroup.purpose}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10 text-xs space-y-1 self-start md:self-auto">
                  <div className="font-semibold text-indigo-200">Trip Emergency Desk</div>
                  <div className="font-bold flex items-center gap-1.5 text-white">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />{' '}
                    {selectedGroup.emergencyContact}
                  </div>
                  <div className="text-[10px] text-gray-400">Date: {selectedGroup.startDate}</div>
                </div>

                {isFacultyOrAdmin && (
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => openEditTrip(selectedGroup)}
                      className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit Tour
                    </button>
                    <button
                      onClick={() => setDeletingTrip(selectedGroup)}
                      className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active Checkpoint QR Modal */}
          {activeCheckpointQr && (
            <div className="bg-white border-2 border-indigo-500 rounded-2xl p-6 shadow-xl max-w-md mx-auto text-center space-y-4 animate-in fade-in">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center justify-center gap-1.5">
                <QrCode className="w-4 h-4" /> Live Checkpoint Attendance QR
              </div>
              <h4 className="font-bold text-gray-900 text-sm">
                {activeCheckpointQr.checkpoint.name}
              </h4>

              <div className="p-3 bg-gray-50 rounded-xl inline-block border border-gray-200">
                <img
                  src={activeCheckpointQr.qrUrl}
                  alt="Checkpoint QR"
                  className="w-56 h-56 object-contain"
                />
              </div>

              <p className="text-xs text-gray-500">
                Students can scan this code with their camera scanner to register presence at this checkpoint.
              </p>

              <button
                onClick={() => setActiveCheckpointQr(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl cursor-pointer"
              >
                Close QR Display
              </button>
            </div>
          )}

          {/* Grid: Checkpoints & Participants */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Checkpoints Timeline Column */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" /> Tour Checkpoints Timeline
                  </h3>
                  <p className="text-xs text-gray-500">
                    Chronological verification waypoints along the journey
                  </p>
                </div>

                {isFacultyOrAdmin && (
                  <button
                    onClick={() => setShowAddCheckpointModal(true)}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Checkpoint
                  </button>
                )}
              </div>

              <div className="space-y-4 pt-2">
                {selectedGroup.checkpoints.map((chk) => {
                  const verifiedCount = chk.verifiedStudentIds.length;
                  const total = selectedGroup.participantStudentIds.length;
                  const isCompleted = chk.status === 'completed';
                  const isActive = chk.status === 'active';
                  const isCurrentStudentVerified = chk.verifiedStudentIds.includes(currentUser.id);

                  return (
                    <div key={chk.id} className="flex gap-4">
                      {/* Step Circle */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-500 text-white'
                            : isActive
                            ? 'bg-indigo-600 text-white animate-pulse'
                            : 'bg-gray-300 text-gray-600'
                        }`}
                      >
                        {chk.order}
                      </div>

                      <div className="flex-1 bg-gray-50/70 hover:bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                isCompleted
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isActive
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {chk.status}
                            </span>
                            <h4 className="font-bold text-gray-900 text-sm mt-1">{chk.name}</h4>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-500 text-xs">{chk.scheduledTime}</span>
                            {isFacultyOrAdmin && selectedGroup.checkpoints.length > 1 && (
                              <button
                                onClick={() => handleDeleteCheckpoint(chk.id)}
                                className="p-1 text-gray-400 hover:text-red-600 rounded-lg cursor-pointer"
                                title="Remove Checkpoint"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {chk.locationNote && (
                          <div className="text-[11px] text-gray-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400" /> {chk.locationNote}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                          <span className="text-[11px] font-bold text-gray-700">
                            Verified: {verifiedCount} / {total} participants
                          </span>

                          {isFacultyOrAdmin ? (
                            <button
                              onClick={() => handleActivateCheckpoint(chk)}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <QrCode className="w-3.5 h-3.5" /> Start Checkpoint QR
                            </button>
                          ) : isCurrentStudentVerified ? (
                            <span className="font-bold text-emerald-700 flex items-center gap-1 text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" /> You are Verified
                            </span>
                          ) : (
                            <button
                              onClick={() => handleStudentSelfCheckIn(chk)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer"
                            >
                              Mark My Checkpoint
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Participants & Missing Tracker Column */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" /> Registered Tour Participants (
                {participantStudents.length})
              </h3>

              <div className="divide-y divide-gray-100 text-xs">
                {participantStudents.map((stu) => {
                  const completedCheckpoints = selectedGroup.checkpoints.filter((c) =>
                    c.verifiedStudentIds.includes(stu.id)
                  ).length;

                  return (
                    <div key={stu.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-gray-900">{stu.name}</div>
                        <div className="text-[11px] text-gray-500">
                          Roll: {stu.rollNumber || 'N/A'} • {stu.phone}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-indigo-700">
                          {completedCheckpoints} / {selectedGroup.checkpoints.length}
                        </span>
                        <div className="text-[10px] text-gray-400">Checkpoints</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Tour Modal */}
      {showAddTripModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-gray-900">Add New Tour / Industrial Visit</h3>
            <form onSubmit={handleCreateTrip} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Tour Title *</label>
                <input
                  type="text"
                  value={newTripName}
                  onChange={(e) => setNewTripName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Destination *</label>
                <input
                  type="text"
                  value={newDestination}
                  onChange={(e) => setNewDestination(e.target.value)}
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Purpose / Objectives</label>
                <textarea
                  rows={2}
                  value={newPurpose}
                  onChange={(e) => setNewPurpose(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    value={newEmergency}
                    onChange={(e) => setNewEmergency(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddTripModal(false)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  Create Tour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tour Modal */}
      {editingTrip && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-indigo-600" /> Edit Tour Information
            </h3>
            <form onSubmit={handleUpdateTrip} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Tour Title *</label>
                <input
                  type="text"
                  value={editTripName}
                  onChange={(e) => setEditTripName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Destination *</label>
                <input
                  type="text"
                  value={editDestination}
                  onChange={(e) => setEditDestination(e.target.value)}
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Purpose</label>
                <textarea
                  rows={2}
                  value={editPurpose}
                  onChange={(e) => setEditPurpose(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Emergency Desk</label>
                  <input
                    type="text"
                    value={editEmergency}
                    onChange={(e) => setEditEmergency(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingTrip(null)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Tour Modal */}
      {deletingTrip && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Tour</h3>
                <p className="text-gray-500 text-[11px]">This tour group will be removed.</p>
              </div>
            </div>

            <p className="text-gray-700">
              Are you sure you want to remove <span className="font-bold text-gray-900">{deletingTrip.tripName}</span>?
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDeletingTrip(null)}
                className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteTrip(deletingTrip)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Checkpoint Modal */}
      {showAddCheckpointModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-gray-900">Add Checkpoint to Tour</h3>
            <form onSubmit={handleAddCheckpoint} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Checkpoint Name *</label>
                <input
                  type="text"
                  value={chkName}
                  onChange={(e) => setChkName(e.target.value)}
                  required
                  placeholder="e.g. Checkpoint 3: Arrival at Factory"
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Scheduled Time</label>
                <input
                  type="text"
                  value={chkTime}
                  onChange={(e) => setChkTime(e.target.value)}
                  placeholder="e.g. 11:30 AM"
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Location Note</label>
                <input
                  type="text"
                  value={chkLocationNote}
                  onChange={(e) => setChkLocationNote(e.target.value)}
                  placeholder="e.g. Main Gate Entry Bay"
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddCheckpointModal(false)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  Add Checkpoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
