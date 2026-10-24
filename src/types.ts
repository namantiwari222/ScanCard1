export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  username: string;
  password?: string; // Hashed or masked in storage
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  rollNumber?: string; // For students
  employeeId?: string; // For teachers/admins
  department: string;
  semester?: number;
  section?: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  department: string;
  semester: number;
  credits: number;
  teacherId: string;
}

export interface ClassGroup {
  id: string;
  name: string;
  department: string;
  semester: number;
  section: string;
  academicYear: string;
  room: string;
  defaultLat: number;
  defaultLng: number;
  geofenceRadius: number; // in meters, e.g. 75
}

export interface Enrollment {
  id: string;
  studentId: string;
  classGroupId: string;
  subjectIds: string[];
}

export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'excused'
  | 'verification_failed'
  | 'manual_corrected';

export type VerificationMethod =
  | 'dynamic_qr'
  | 'manual'
  | 'qr_gps_verified'
  | 'qr_ble_verified';

export interface AuditRecord {
  updatedBy: string;
  role: string;
  previousStatus: AttendanceStatus;
  newStatus: AttendanceStatus;
  reason: string;
  timestamp: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  classGroupId: string;
  subjectId: string;
  studentId: string;
  studentRoll: string;
  studentName: string;
  timestamp: string;
  status: AttendanceStatus;
  verificationMethod: VerificationMethod;
  locationEvidence?: {
    distanceMeters: number;
    verified: boolean;
    studentLat?: number;
    studentLng?: number;
  };
  bleVerified?: boolean;
  notes?: string;
  auditTrail?: AuditRecord[];
}

export interface AttendanceSession {
  id: string;
  classGroupId: string;
  subjectId: string;
  teacherId: string;
  roomName: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  bleBeaconUuid?: string;
  allowLocationCheck: boolean;
  allowBleCheck: boolean;
  startTime: string;
  endTime?: string;
  status: 'active' | 'closed';
  currentQrToken: string;
  qrExpiresAt: string; // ISO string
  tokenIntervalSeconds: number; // e.g. 30 or 60
}

export interface AttendancePolicy {
  minRequiredPercentage: number; // default 75
  warningThreshold: number; // default 65
  urgentThreshold: number; // default 60
  allowSelfCheckIn: boolean;
}

export type NotificationCategory =
  | 'low_attendance'
  | 'achievement'
  | 'class_reminder'
  | 'class_cancellation'
  | 'exam_schedule'
  | 'exam_reminder'
  | 'event'
  | 'travel_alert'
  | 'custom';

export type NotificationChannel = 'in_app' | 'whatsapp' | 'sms' | 'email';

export interface NotificationItem {
  id: string;
  recipientId: string; // User ID or 'all'
  recipientRole?: UserRole;
  category: NotificationCategory;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  channels: NotificationChannel[];
  deliveryStatus: Partial<Record<NotificationChannel, 'sent' | 'delivered' | 'failed' | 'simulated'>>;
  metadata?: Record<string, unknown>;
}

export interface ExamSchedule {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  classGroupId: string;
  className: string;
  examDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  venue: string;
  totalMarks: number;
  instructions: string;
  remindersEnabled: boolean;
  reminderDaysBefore: number[]; // e.g. [3, 1, 0]
}

export type EventCategory =
  | 'fest'
  | 'hackathon'
  | 'seminar'
  | 'workshop'
  | 'industrial_visit'
  | 'guest_lecture'
  | 'cultural'
  | 'sports';

export interface AcademicEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string;
  time: string;
  venue: string;
  organizer: string;
  targetAudience: string;
  registrationRequired: boolean;
  registrationDeadline?: string;
  registeredStudentIds?: string[];
  bannerGradient?: string;
}

export interface TravelCheckpoint {
  id: string;
  name: string;
  order: number;
  scheduledTime: string;
  status: 'pending' | 'active' | 'completed';
  qrToken?: string;
  qrExpiresAt?: string;
  verifiedStudentIds: string[];
  missingStudentIds: string[];
  locationNote?: string;
}

export interface TravelGroup {
  id: string;
  tripName: string;
  destination: string;
  purpose: string;
  startDate: string;
  endDate: string;
  coordinatorTeacherId: string;
  emergencyContact: string;
  participantStudentIds: string[];
  checkpoints: TravelCheckpoint[];
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
}

// Student attendance statistics helper
export interface SubjectAttendanceStat {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  totalHeld: number;
  attended: number;
  missed: number;
  percentage: number;
  requiredPercentage: number;
  classesNeeded: number; // to reach required threshold
  statusLevel: 'good' | 'warning' | 'critical'; // green, yellow, red
}
