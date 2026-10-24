import React, { useState } from 'react';
import {
  AlertTriangle,
  Award,
  Bell,
  Calendar,
  CheckCircle2,
  Compass,
  Mail,
  MessageSquare,
  Phone,
  Send,
  Smartphone,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  getAllClasses,
  getAllNotifications,
  getAllTravelGroups,
  getAllUsers,
  getAttendancePolicy,
  getStudentSubjectStats,
  getUserNotifications,
  markNotificationAsRead,
  sendNotification,
} from '../storage';
import {
  NotificationCategory,
  NotificationChannel,
  NotificationItem,
  User,
} from '../types';

interface NotificationsViewProps {
  currentUser: User;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ currentUser }) => {
  const isFacultyOrAdmin = currentUser.role === 'teacher' || currentUser.role === 'admin';
  const policy = getAttendancePolicy();
  const allUsers = getAllUsers();
  const students = allUsers.filter((u) => u.role === 'student');
  const classes = getAllClasses();
  const travelGroups = getAllTravelGroups();

  const [notifications, setNotifications] = useState<NotificationItem[]>(
    isFacultyOrAdmin ? getAllNotifications() : getUserNotifications(currentUser.id)
  );

  const [activeTab, setActiveTab] = useState<'inbox' | 'composer'>('inbox');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Composer Form
  const [category, setCategory] = useState<NotificationCategory>('low_attendance');
  const [title, setTitle] = useState<string>('Urgent: Minimum Attendance Notice');
  const [body, setBody] = useState<string>(
    'Institutional policy requires maintaining at least 75% attendance. Please attend all upcoming lectures and practical sessions regularly.'
  );
  const [recipientFilter, setRecipientFilter] = useState<'below_threshold' | 'all' | 'specific' | 'travel'>('below_threshold');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedChannels, setSelectedChannels] = useState<NotificationChannel[]>([
    'in_app',
    'whatsapp',
  ]);
  const [previewPhone, setPreviewPhone] = useState<boolean>(false);

  const refreshNotifs = () => {
    setNotifications(
      isFacultyOrAdmin ? getAllNotifications() : getUserNotifications(currentUser.id)
    );
  };

  const handleToggleChannel = (channel: NotificationChannel) => {
    setSelectedChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    );
  };

  const handleSend = () => {
    if (!title.trim() || !body.trim()) {
      alert('Title and Message Body are required.');
      return;
    }

    if (selectedChannels.length === 0) {
      alert('Select at least one delivery channel.');
      return;
    }

    let targetIds: string[] = [];

    if (recipientFilter === 'all') {
      targetIds = ['all'];
    } else if (recipientFilter === 'specific') {
      targetIds = [selectedStudentId];
    } else if (recipientFilter === 'below_threshold') {
      // Find students with low attendance
      students.forEach((stu) => {
        const stats = getStudentSubjectStats(stu.id);
        const isBelow = stats.some((s) => s.percentage < policy.minRequiredPercentage);
        if (isBelow) targetIds.push(stu.id);
      });
      if (targetIds.length === 0) targetIds = [students[0].id];
    } else if (recipientFilter === 'travel') {
      targetIds = travelGroups[0]?.participantStudentIds || [];
    }

    targetIds.forEach((recId) => {
      sendNotification({
        recipientId: recId,
        category,
        title,
        body,
        channels: selectedChannels,
        actor: currentUser,
      });
    });

    alert(
      `Broadcast successfully dispatched to ${targetIds.length} recipient(s) across: ${selectedChannels.join(', ')}`
    );
    refreshNotifs();
    setActiveTab('inbox');
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filterCategory === 'all') return true;
    return n.category === filterCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Controls */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            {isFacultyOrAdmin ? 'Institutional Notification & Dispatch Center' : 'My Notifications & Alerts'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Event-driven threshold alerts, examination reminders, WhatsApp, SMS, and in-app feeds
          </p>
        </div>

        {isFacultyOrAdmin && (
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('inbox')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'inbox' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Inbox & Logs
            </button>
            <button
              onClick={() => setActiveTab('composer')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'composer' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Send className="w-3.5 h-3.5" /> Compose Broadcast
            </button>
          </div>
        )}
      </div>

      {activeTab === 'composer' && isFacultyOrAdmin ? (
        /* Teacher Announcement & Multi-channel Composer */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Compose Message</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Broadcast official updates with multi-channel dispatch
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Message Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as NotificationCategory)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low_attendance">Low Attendance Alert</option>
                  <option value="achievement">Attendance Achievement Milestone</option>
                  <option value="class_reminder">Classroom Session Reminder</option>
                  <option value="class_cancellation">Class Reschedule / Cancellation</option>
                  <option value="exam_schedule">Examination Schedule</option>
                  <option value="event">Campus Event Announcement</option>
                  <option value="travel_alert">Educational Tour Alert</option>
                  <option value="custom">General Custom Announcement</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Target Recipient Filter
                </label>
                <select
                  value={recipientFilter}
                  onChange={(e) => setRecipientFilter(e.target.value as any)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="below_threshold">Students Below Threshold (&lt;75%)</option>
                  <option value="all">Entire Enrolled Class (All Students)</option>
                  <option value="specific">Individual Selected Student</option>
                  <option value="travel">Active Travel Group Members</option>
                </select>
              </div>
            </div>

            {recipientFilter === 'specific' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Select Student
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-blue-500"
                >
                  {students.map((stu) => (
                    <option key={stu.id} value={stu.id}>
                      {stu.name} (Roll: {stu.rollNumber || 'N/A'}) - {stu.phone}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Announcement Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Urgent Attendance Warning: DBMS (CS-301)"
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Message Body Content
              </label>
              <textarea
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Type your official announcement here..."
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Channels Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Select Dispatch Channels:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'in_app', label: 'In-App Alert', icon: Bell, color: 'text-purple-600' },
                  { id: 'whatsapp', label: 'WhatsApp', icon: Smartphone, color: 'text-emerald-600' },
                  { id: 'sms', label: 'SMS Gateway', icon: MessageSquare, color: 'text-blue-600' },
                  { id: 'email', label: 'College Email', icon: Mail, color: 'text-rose-600' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isChecked = selectedChannels.includes(item.id as NotificationChannel);
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => handleToggleChannel(item.id as NotificationChannel)}
                      className={`p-3 rounded-xl border text-left text-xs font-bold flex flex-col gap-1 transition-all ${
                        isChecked
                          ? 'border-blue-500 bg-blue-50/70 text-blue-900 shadow-xs'
                          : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${item.color}`} />
                      <span>{item.label}</span>
                      <span className="text-[10px] font-normal text-gray-500">
                        {isChecked ? '✓ Enabled' : 'Disabled'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPreviewPhone(!previewPhone)}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                {previewPhone ? 'Hide WhatsApp Preview' : 'Show WhatsApp Phone Preview →'}
              </button>

              <button
                type="button"
                onClick={handleSend}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-transform active:scale-95"
              >
                <Send className="w-4 h-4" /> Dispatch Broadcast
              </button>
            </div>
          </div>

          {/* WhatsApp & Mobile Preview Mockup */}
          <div className="lg:col-span-5 bg-slate-900 rounded-3xl p-5 text-white shadow-xl max-w-sm mx-auto border-4 border-slate-700">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                <Smartphone className="w-4 h-4" /> WhatsApp Business Preview
              </span>
              <span className="text-[10px] text-slate-400">Template Verified</span>
            </div>

            {/* Simulated Phone Chat Window */}
            <div
              className="mt-4 rounded-2xl p-4 min-h-[320px] flex flex-col justify-end text-xs space-y-2"
              style={{
                backgroundColor: '#0b141a',
                backgroundImage: 'radial-gradient(#1e2b34 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            >
              <div className="bg-[#005c4b] text-white p-3.5 rounded-2xl rounded-tr-xs shadow-md space-y-1.5 max-w-[90%] self-end">
                <div className="font-bold text-emerald-200 text-xs flex items-center gap-1">
                  <span>🏛️ Apex Institute Academic Office</span>
                </div>
                <div className="font-semibold text-white text-xs">{title}</div>
                <p className="text-[11px] text-gray-200 leading-relaxed">{body}</p>
                <div className="text-[9px] text-emerald-300 text-right pt-1 flex items-center justify-end gap-1">
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>✓✓</span>
                </div>
              </div>
            </div>

            <div className="mt-4 text-[11px] text-slate-400 text-center">
              Preview of automated WhatsApp notification with official institutional branding.
            </div>
          </div>
        </div>
      ) : (
        /* Notifications Feed */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          {/* Category Filter Pills */}
          <div className="px-6 py-3 border-b border-gray-100 flex flex-wrap gap-2 bg-gray-50/50">
            {[
              { id: 'all', label: 'All Alerts' },
              { id: 'low_attendance', label: 'Low Attendance' },
              { id: 'achievement', label: 'Milestones' },
              { id: 'exam_schedule', label: 'Exams' },
              { id: 'event', label: 'Events' },
              { id: 'travel_alert', label: 'Travel Alerts' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterCategory(f.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  filterCategory === f.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="divide-y divide-gray-100">
            {filteredNotifs.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-400">
                No notifications in this category.
              </div>
            ) : (
              filteredNotifs.map((n) => {
                let icon = <Bell className="w-5 h-5 text-blue-600" />;
                let tagColor = 'bg-blue-100 text-blue-800';

                if (n.category === 'low_attendance') {
                  icon = <AlertTriangle className="w-5 h-5 text-red-500" />;
                  tagColor = 'bg-red-100 text-red-800';
                } else if (n.category === 'achievement') {
                  icon = <Award className="w-5 h-5 text-emerald-600" />;
                  tagColor = 'bg-emerald-100 text-emerald-800';
                } else if (n.category === 'travel_alert') {
                  icon = <Compass className="w-5 h-5 text-indigo-600" />;
                  tagColor = 'bg-indigo-100 text-indigo-800';
                } else if (n.category === 'exam_schedule') {
                  icon = <Calendar className="w-5 h-5 text-purple-600" />;
                  tagColor = 'bg-purple-100 text-purple-800';
                }

                return (
                  <div
                    key={n.id}
                    onClick={() => {
                      markNotificationAsRead(n.id);
                      refreshNotifs();
                    }}
                    className={`p-5 flex items-start gap-4 transition-colors cursor-pointer hover:bg-gray-50/80 ${
                      !n.read ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                      {icon}
                    </div>

                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tagColor}`}>
                            {n.category.replace('_', ' ').toUpperCase()}
                          </span>
                          <h4 className="font-bold text-gray-900 text-sm">{n.title}</h4>
                        </div>
                        <span className="text-[11px] text-gray-400">
                          {new Date(n.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <p className="text-gray-600 mt-1 leading-relaxed">{n.body}</p>

                      <div className="mt-2 flex items-center gap-3 text-[10px] text-gray-400">
                        <span>
                          Channels: {n.channels.map((c) => c.toUpperCase()).join(' • ')}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-600 font-semibold">✓ Delivered</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
