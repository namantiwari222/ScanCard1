import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Sparkles,
  Users,
  CheckCircle2,
  Tag,
  Building2,
  Edit2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  registerStudentForEvent,
  updateEvent,
} from '../storage';
import { AcademicEvent, EventCategory, User } from '../types';

interface EventsViewProps {
  currentUser: User;
}

export const EventsView: React.FC<EventsViewProps> = ({ currentUser }) => {
  const isFacultyOrAdmin = currentUser.role === 'teacher' || currentUser.role === 'admin';
  const [events, setEvents] = useState<AcademicEvent[]>(getAllEvents());
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // Form
  const [title, setTitle] = useState('Zenith 2026 - Annual Technology Conclave');
  const [description, setDescription] = useState(
    'Keynote sessions on quantum computing, generative AI product engineering, and developer ecosystem showcase.'
  );
  const [category, setCategory] = useState<EventCategory>('fest');
  const [date, setDate] = useState('2026-11-20');
  const [time, setTime] = useState('09:30 AM - 05:00 PM');
  const [venue, setVenue] = useState('Main Auditorium & Convention Plaza');
  const [organizer, setOrganizer] = useState('Apex Innovation Hub & ACM Student Chapter');
  const [targetAudience, setTargetAudience] = useState('All Departments & Faculty');
  const [registrationRequired, setRegistrationRequired] = useState(true);

  // Edit Event State
  const [editingEvent, setEditingEvent] = useState<AcademicEvent | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState<EventCategory>('fest');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editVenue, setEditVenue] = useState('');
  const [editOrganizer, setEditOrganizer] = useState('');
  const [editTargetAudience, setEditTargetAudience] = useState('');

  // Delete Event State
  const [deletingEvent, setDeletingEvent] = useState<AcademicEvent | null>(null);

  const refreshEvents = () => {
    setEvents(getAllEvents());
  };

  const handleRegister = (eventId: string) => {
    registerStudentForEvent(eventId, currentUser.id);
    alert('Successfully registered for this campus event! Confirmation added to your profile.');
    refreshEvents();
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvt: AcademicEvent = {
      id: `evt_${Date.now()}`,
      title,
      description,
      category,
      date,
      time,
      venue,
      organizer,
      targetAudience,
      registrationRequired,
      registeredStudentIds: [],
      bannerGradient: 'from-blue-600 to-indigo-700',
    };

    createEvent(newEvt, currentUser);
    alert('Event published and announcement broadcast to student portals.');
    setShowCreateModal(false);
    refreshEvents();
  };

  const openEditModal = (evt: AcademicEvent) => {
    setEditingEvent(evt);
    setEditTitle(evt.title);
    setEditDescription(evt.description);
    setEditCategory(evt.category);
    setEditDate(evt.date);
    setEditTime(evt.time);
    setEditVenue(evt.venue);
    setEditOrganizer(evt.organizer);
    setEditTargetAudience(evt.targetAudience);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    const updated: AcademicEvent = {
      ...editingEvent,
      title: editTitle.trim(),
      description: editDescription.trim(),
      category: editCategory,
      date: editDate,
      time: editTime.trim(),
      venue: editVenue.trim(),
      organizer: editOrganizer.trim(),
      targetAudience: editTargetAudience.trim(),
    };
    updateEvent(updated, currentUser);
    alert('Event updated successfully.');
    setEditingEvent(null);
    refreshEvents();
  };

  const handleDelete = (evt: AcademicEvent) => {
    deleteEvent(evt.id, currentUser);
    alert(`Event "${evt.title}" deleted.`);
    setDeletingEvent(null);
    refreshEvents();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Campus Events, Hackathons & Tech Fests
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Institutional seminars, technical conferences, industrial workshops, and student fests (Add, Edit, Delete)
          </p>
        </div>

        {isFacultyOrAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors self-start cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Publish New Event
          </button>
        )}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((evt) => {
          const isRegistered =
            currentUser.role === 'student' &&
            evt.registeredStudentIds?.includes(currentUser.id);

          return (
            <div
              key={evt.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {evt.category.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {evt.registeredStudentIds?.length || 0} Registered
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900 leading-snug">{evt.title}</h3>
                <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                  {evt.description}
                </p>

                <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-semibold text-gray-900">{evt.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{evt.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>{evt.venue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-[11px] text-gray-500">{evt.organizer}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                {currentUser.role === 'student' ? (
                  isRegistered ? (
                    <div className="w-full py-2 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-300 text-center flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Registered
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRegister(evt.id)}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Register Now (Free)
                    </button>
                  )
                ) : (
                  <div className="space-y-2 border-t border-gray-100 pt-2">
                    <div className="text-[11px] text-gray-400">
                      Audience: {evt.targetAudience}
                    </div>
                    {isFacultyOrAdmin && (
                      <div className="flex items-center justify-end gap-1 text-[11px]">
                        <button
                          onClick={() => openEditModal(evt)}
                          className="px-2.5 py-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => setDeletingEvent(evt)}
                          className="px-2.5 py-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Publish Campus Event</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Displays on all student dashboards and triggers notification alerts
              </p>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as EventCategory)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="hackathon">Hackathon</option>
                    <option value="workshop">Technical Workshop</option>
                    <option value="seminar">Seminar / Symposium</option>
                    <option value="guest_lecture">Guest Lecture</option>
                    <option value="fest">College Tech Fest</option>
                    <option value="industrial_visit">Industrial Visit</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Time</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Venue</label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Organizer</label>
                <input
                  type="text"
                  value={organizer}
                  onChange={(e) => setOrganizer(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" />
                Edit Campus Event
              </h3>
            </div>

            <form onSubmit={handleUpdate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as EventCategory)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="hackathon">Hackathon</option>
                    <option value="workshop">Technical Workshop</option>
                    <option value="seminar">Seminar / Symposium</option>
                    <option value="guest_lecture">Guest Lecture</option>
                    <option value="fest">College Tech Fest</option>
                    <option value="industrial_visit">Industrial Visit</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    required
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Time</label>
                  <input
                    type="text"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Venue</label>
                  <input
                    type="text"
                    value={editVenue}
                    onChange={(e) => setEditVenue(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Organizer</label>
                <input
                  type="text"
                  value={editOrganizer}
                  onChange={(e) => setEditOrganizer(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Target Audience</label>
                <input
                  type="text"
                  value={editTargetAudience}
                  onChange={(e) => setEditTargetAudience(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Event Confirmation Modal */}
      {deletingEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Event</h3>
                <p className="text-gray-500 text-[11px]">This event will be deleted permanently.</p>
              </div>
            </div>

            <p className="text-gray-700">
              Are you sure you want to remove <span className="font-bold text-gray-900">{deletingEvent.title}</span>?
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDeletingEvent(null)}
                className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingEvent)}
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
