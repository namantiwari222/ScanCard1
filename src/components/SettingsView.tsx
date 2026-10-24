import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Save,
  Search,
  Shield,
  Sliders,
} from 'lucide-react';
import { getAuditLogs, getAttendancePolicy, updateAttendancePolicy } from '../storage';
import { AttendancePolicy, AuditLog, User } from '../types';

interface SettingsViewProps {
  currentUser: User;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ currentUser }) => {
  const [policy, setPolicy] = useState<AttendancePolicy>(getAttendancePolicy());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(getAuditLogs());
  const [searchTerm, setSearchTerm] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    updateAttendancePolicy(policy, currentUser);
    setAuditLogs(getAuditLogs());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const filteredLogs = auditLogs.filter((log) => {
    const term = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(term) ||
      log.actorName.toLowerCase().includes(term) ||
      log.details.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-blue-600" />
          Institutional Attendance Policies & Security Audit Logs
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Configure semester compliance thresholds, warning triggers, and inspect the tamper-evident audit trail
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Policy Configuration Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" /> Compliance Thresholds
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Governs exam eligibility and automated alert triggers
            </p>
          </div>

          <form onSubmit={handleSavePolicy} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Minimum Required Attendance (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={50}
                  max={100}
                  value={policy.minRequiredPercentage}
                  onChange={(e) =>
                    setPolicy({ ...policy, minRequiredPercentage: Number(e.target.value) })
                  }
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900"
                />
                <span className="font-bold text-gray-500">%</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Default institutional mandate: 75% for exam hall admittance
              </p>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Warning Notification Threshold (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={40}
                  max={policy.minRequiredPercentage}
                  value={policy.warningThreshold}
                  onChange={(e) =>
                    setPolicy({ ...policy, warningThreshold: Number(e.target.value) })
                  }
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900"
                />
                <span className="font-bold text-gray-500">%</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Automatically triggers advisory alert to student and faculty
              </p>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Urgent Escalation Threshold (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={30}
                  max={policy.warningThreshold}
                  value={policy.urgentThreshold}
                  onChange={(e) =>
                    setPolicy({ ...policy, urgentThreshold: Number(e.target.value) })
                  }
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900"
                />
                <span className="font-bold text-gray-500">%</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Flags critical disciplinary warning to HOD and guardians
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <Save className="w-4 h-4" /> Save Updated Thresholds
              </button>
            </div>

            {savedSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Policies updated and logged to audit trail.
              </div>
            )}
          </form>
        </div>

        {/* Audit Log Table Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600" /> Security Audit Log ({auditLogs.length})
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Immutable event stream of sessions, logins, and manual corrections
              </p>
            </div>

            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search audit trail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 text-xs">
            {filteredLogs.length === 0 ? (
              <div className="py-8 text-center text-gray-400">No matching audit logs found.</div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="py-3 hover:bg-gray-50/70 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">{log.action}</span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-[11px] mt-0.5 leading-relaxed">{log.details}</p>
                  <div className="text-[10px] text-purple-700 font-medium mt-1">
                    Actor: {log.actorName} ({log.actorRole.toUpperCase()})
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
