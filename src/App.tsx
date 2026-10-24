import { useEffect, useState } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { AttendanceReportsView } from './components/AttendanceReportsView';
import { ClassesView } from './components/ClassesView';
import { DynamicAttendanceSessionModal } from './components/DynamicAttendanceSessionModal';
import { EventsView } from './components/EventsView';
import { ExamsView } from './components/ExamsView';
import { LoginView } from './components/LoginView';
import { NavigationSidebar, NavTab } from './components/NavigationSidebar';
import { NotificationsView } from './components/NotificationsView';
import { SettingsView } from './components/SettingsView';
import { StudentDashboard } from './components/StudentDashboard';
import { StudentScannerModal } from './components/StudentScannerModal';
import { StudentsView } from './components/StudentsView';
import { TeacherDashboard } from './components/TeacherDashboard';
import { TopHeader } from './components/TopHeader';
import { TravelGroupsView } from './components/TravelGroupsView';
import {
  getCurrentUser,
  getUserNotifications,
  initDatabase,
  isUserLoggedIn,
} from './storage';
import { User } from './types';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User>(getCurrentUser());
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [showLiveSessionModal, setShowLiveSessionModal] = useState<boolean>(false);

  // Initialize DB on boot
  useEffect(() => {
    initDatabase();
    setCurrentUser(getCurrentUser());
    setIsLoggedIn(isUserLoggedIn());
  }, []);

  const handleUserChanged = () => {
    const updated = getCurrentUser();
    setCurrentUser(updated);
    setIsLoggedIn(true);
    setActiveTab('dashboard');
    setShowLiveSessionModal(false);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const notifications = getUserNotifications(currentUser.id);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // If logged out, show the simple, understandable old-UI-style Login Panel
  if (!isLoggedIn) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900 font-sans">
      {/* Top Header */}
      <TopHeader
        onUserChanged={handleUserChanged}
        onOpenNotifications={() => setActiveTab('notifications')}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <NavigationSidebar
          currentRole={currentUser.role}
          activeTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === 'live_session' && currentUser.role !== 'student') {
              setShowLiveSessionModal(true);
            } else {
              setActiveTab(tab);
            }
          }}
          unreadCount={unreadCount}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && (
              <>
                {currentUser.role === 'admin' && (
                  <AdminDashboard admin={currentUser} onNavigate={setActiveTab} />
                )}
                {currentUser.role === 'teacher' && (
                  <TeacherDashboard
                    teacher={currentUser}
                    onNavigate={setActiveTab}
                    onStartSessionModal={() => setShowLiveSessionModal(true)}
                  />
                )}
                {currentUser.role === 'student' && (
                  <StudentDashboard student={currentUser} onNavigate={setActiveTab} />
                )}
              </>
            )}

            {activeTab === 'live_session' && (
              <DynamicAttendanceSessionModal teacher={currentUser} />
            )}

            {activeTab === 'scanner' && (
              <StudentScannerModal
                student={currentUser}
                onClose={() => setActiveTab('dashboard')}
              />
            )}

            {activeTab === 'classes' && <ClassesView currentUser={currentUser} />}

            {activeTab === 'students' && <StudentsView currentUser={currentUser} />}

            {activeTab === 'reports' && (
              <AttendanceReportsView currentUser={currentUser} />
            )}

            {activeTab === 'notifications' && (
              <NotificationsView currentUser={currentUser} />
            )}

            {activeTab === 'exams' && <ExamsView currentUser={currentUser} />}

            {activeTab === 'events' && <EventsView currentUser={currentUser} />}

            {activeTab === 'travel' && <TravelGroupsView currentUser={currentUser} />}

            {activeTab === 'settings' && <SettingsView currentUser={currentUser} />}
          </div>
        </main>
      </div>

      {/* Floating Modal for Teacher Active QR Projector */}
      {showLiveSessionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="max-w-4xl w-full">
            <DynamicAttendanceSessionModal
              teacher={currentUser}
              onClose={() => setShowLiveSessionModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
