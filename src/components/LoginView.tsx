import React, { useState } from 'react';
import {
  GraduationCap,
  KeyRound,
  LogIn,
  School,
  Shield,
  UserCheck,
} from 'lucide-react';
import { authenticateUser } from '../storage';
import { User } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('student');
  const [password, setPassword] = useState('1234');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim()) {
      setErrorMsg('Please enter your Username or Roll Number.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setLoading(true);
    const res = authenticateUser(username, password);
    setLoading(false);

    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setErrorMsg(res.error || 'Login failed. Check your credentials.');
    }
  };

  // Quick helper to fill demo credentials with 1 tap
  const fillCredentials = (role: 'student' | 'teacher' | 'admin') => {
    setErrorMsg('');
    if (role === 'student') {
      setUsername('student');
      setPassword('1234');
    } else if (role === 'teacher') {
      setUsername('teacher');
      setPassword('1234');
    } else if (role === 'admin') {
      setUsername('admin');
      setPassword('1234');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage:
          'url("https://images.unsplash.com/photo-1519681393784-d120267933ba")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Old UI Style Card */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/50 space-y-5">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl mx-auto shadow-md">
            📱
          </div>
          <h1 className="text-2xl font-black text-gray-900">ScanCard Login</h1>
          <p className="text-xs text-gray-500">
            Sign in to access your authorized dashboard
          </p>
        </div>

        {/* Quick Role Fill Pills */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
            Tap to Fill Demo Account:
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('student')}
              className={`p-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition-all ${
                username === 'student'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-400 shadow-2xs'
                  : 'bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-emerald-700" />
              <span>Student</span>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('teacher')}
              className={`p-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition-all ${
                username === 'teacher'
                  ? 'bg-blue-100 text-blue-900 border-blue-400 shadow-2xs'
                  : 'bg-blue-50/50 hover:bg-blue-50 text-blue-800 border-blue-200'
              }`}
            >
              <School className="w-4 h-4 text-blue-700" />
              <span>Teacher</span>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('admin')}
              className={`p-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition-all ${
                username === 'admin'
                  ? 'bg-purple-100 text-purple-900 border-purple-400 shadow-2xs'
                  : 'bg-purple-50/50 hover:bg-purple-50 text-purple-800 border-purple-200'
              }`}
            >
              <Shield className="w-4 h-4 text-purple-700" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-3.5 pt-1">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Username / Roll No
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. student, teacher, admin, or CS-2024-001"
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (default: 1234)"
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Default demo password is: <strong>1234</strong></p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-800 text-xs font-bold rounded-xl text-center">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Checking...' : 'Sign In to Dashboard'}</span>
          </button>
        </form>

        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-[11px] text-gray-500 space-y-1">
          <div className="font-bold text-gray-700">Account Access Credentials:</div>
          <div>• <strong>Student</strong>: user <code>student</code> | pass <code>1234</code></div>
          <div>• <strong>Teacher</strong>: user <code>teacher</code> | pass <code>1234</code></div>
          <div>• <strong>Admin</strong>: user <code>admin</code> | pass <code>1234</code></div>
        </div>
      </div>
    </div>
  );
};
