import QRCode from 'qrcode';
import {
  AcademicEvent,
  AttendancePolicy,
  AttendanceRecord,
  AttendanceSession,
  AttendanceStatus,
  AuditLog,
  AuditRecord,
  ClassGroup,
  Enrollment,
  ExamSchedule,
  NotificationChannel,
  NotificationItem,
  Subject,
  SubjectAttendanceStat,
  TravelCheckpoint,
  TravelGroup,
  User,
  VerificationMethod,
} from './types';

// Storage keys
const DB_VERSION = 'v2_smart_attendance';
const USERS_KEY = `scancard_${DB_VERSION}_users`;
const CURRENT_USER_KEY = `scancard_${DB_VERSION}_current_user`;
const SUBJECTS_KEY = `scancard_${DB_VERSION}_subjects`;
const CLASSES_KEY = `scancard_${DB_VERSION}_classes`;
const ENROLLMENTS_KEY = `scancard_${DB_VERSION}_enrollments`;
const SESSIONS_KEY = `scancard_${DB_VERSION}_sessions`;
const RECORDS_KEY = `scancard_${DB_VERSION}_records`;
const POLICY_KEY = `scancard_${DB_VERSION}_policy`;
const NOTIFICATIONS_KEY = `scancard_${DB_VERSION}_notifications`;
const EXAMS_KEY = `scancard_${DB_VERSION}_exams`;
const EVENTS_KEY = `scancard_${DB_VERSION}_events`;
const TRAVEL_KEY = `scancard_${DB_VERSION}_travel`;
const AUDIT_KEY = `scancard_${DB_VERSION}_audit`;

// Default College Seed Data
export const INITIAL_POLICY: AttendancePolicy = {
  minRequiredPercentage: 75,
  warningThreshold: 65,
  urgentThreshold: 60,
  allowSelfCheckIn: true,
};

export const INITIAL_USERS: User[] = [
  {
    id: 'user_admin_1',
    username: 'admin',
    password: '1234',
    name: 'Dr. S. K. Sharma',
    role: 'admin',
    email: 'principal@apex.edu.in',
    phone: '+91 98765 43210',
    employeeId: 'EMP-ADM-01',
    department: 'Academics Administration',
  },
  {
    id: 'user_teacher_1',
    username: 'teacher',
    password: '1234',
    name: 'Prof. Priya Mehta',
    role: 'teacher',
    email: 'p.mehta@apex.edu.in',
    phone: '+91 98112 34567',
    employeeId: 'EMP-CSE-14',
    department: 'Computer Science & Engineering',
  },
  {
    id: 'user_teacher_2',
    username: 'prof_rajesh',
    password: '1234',
    name: 'Dr. Rajesh Nair',
    role: 'teacher',
    email: 'r.nair@apex.edu.in',
    phone: '+91 98223 45678',
    employeeId: 'EMP-ECE-08',
    department: 'Electronics & Communication',
  },
  {
    id: 'user_student_1',
    username: 'student',
    password: '1234',
    name: 'Aarav Patel',
    role: 'student',
    email: 'aarav.cs24@apex.edu.in',
    phone: '+91 98334 56789',
    rollNumber: 'CS-2024-001',
    department: 'Computer Science & Engineering',
    semester: 6,
    section: 'A',
  },
  {
    id: 'user_student_2',
    username: 'sneha',
    password: '1234',
    name: 'Sneha Roy',
    role: 'student',
    email: 'sneha.cs24@apex.edu.in',
    phone: '+91 98445 67890',
    rollNumber: 'CS-2024-002',
    department: 'Computer Science & Engineering',
    semester: 6,
    section: 'A',
  },
  {
    id: 'user_student_3',
    username: 'rohan',
    password: '1234',
    name: 'Rohan Gupta',
    role: 'student',
    email: 'rohan.cs24@apex.edu.in',
    phone: '+91 98556 78901',
    rollNumber: 'CS-2024-003',
    department: 'Computer Science & Engineering',
    semester: 6,
    section: 'A',
  },
  {
    id: 'user_student_4',
    username: 'ananya',
    password: '1234',
    name: 'Ananya Verma',
    role: 'student',
    email: 'ananya.cs24@apex.edu.in',
    phone: '+91 98667 89012',
    rollNumber: 'CS-2024-004',
    department: 'Computer Science & Engineering',
    semester: 6,
    section: 'A',
  },
  {
    id: 'user_student_5',
    username: 'vikram',
    password: '1234',
    name: 'Vikram Singh',
    role: 'student',
    email: 'vikram.cs24@apex.edu.in',
    phone: '+91 98778 90123',
    rollNumber: 'CS-2024-005',
    department: 'Computer Science & Engineering',
    semester: 6,
    section: 'A',
  },
];

export const INITIAL_CLASSES: ClassGroup[] = [
  {
    id: 'class_cse_6a',
    name: 'B.Tech CSE - 6th Sem (Sec A)',
    department: 'Computer Science & Engineering',
    semester: 6,
    section: 'A',
    academicYear: '2026-2027',
    room: 'Room 402 - CS Block',
    defaultLat: 12.9716, // Example college campus coordinate
    defaultLng: 77.5946,
    geofenceRadius: 80,
  },
  {
    id: 'class_ece_4b',
    name: 'B.Tech ECE - 4th Sem (Sec B)',
    department: 'Electronics & Communication',
    semester: 4,
    section: 'B',
    academicYear: '2026-2027',
    room: 'Room 205 - ECE Wing',
    defaultLat: 12.9718,
    defaultLng: 77.5948,
    geofenceRadius: 75,
  },
];

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub_dbms',
    code: 'CS-301',
    name: 'Database Management Systems',
    department: 'Computer Science & Engineering',
    semester: 6,
    credits: 4,
    teacherId: 'user_teacher_1',
  },
  {
    id: 'sub_cn',
    code: 'CS-302',
    name: 'Computer Networks',
    department: 'Computer Science & Engineering',
    semester: 6,
    credits: 4,
    teacherId: 'user_teacher_1',
  },
  {
    id: 'sub_ml',
    code: 'CS-303',
    name: 'Machine Learning & Neural Nets',
    department: 'Computer Science & Engineering',
    semester: 6,
    credits: 3,
    teacherId: 'user_teacher_2',
  },
  {
    id: 'sub_cloud',
    code: 'CS-304',
    name: 'Cloud Computing & DevOps',
    department: 'Computer Science & Engineering',
    semester: 6,
    credits: 3,
    teacherId: 'user_teacher_1',
  },
];

export const INITIAL_ENROLLMENTS: Enrollment[] = [
  {
    id: 'enr_1',
    studentId: 'user_student_1',
    classGroupId: 'class_cse_6a',
    subjectIds: ['sub_dbms', 'sub_cn', 'sub_ml', 'sub_cloud'],
  },
  {
    id: 'enr_2',
    studentId: 'user_student_2',
    classGroupId: 'class_cse_6a',
    subjectIds: ['sub_dbms', 'sub_cn', 'sub_ml', 'sub_cloud'],
  },
  {
    id: 'enr_3',
    studentId: 'user_student_3',
    classGroupId: 'class_cse_6a',
    subjectIds: ['sub_dbms', 'sub_cn', 'sub_ml', 'sub_cloud'],
  },
  {
    id: 'enr_4',
    studentId: 'user_student_4',
    classGroupId: 'class_cse_6a',
    subjectIds: ['sub_dbms', 'sub_cn', 'sub_ml', 'sub_cloud'],
  },
  {
    id: 'enr_5',
    studentId: 'user_student_5',
    classGroupId: 'class_cse_6a',
    subjectIds: ['sub_dbms', 'sub_cn', 'sub_ml', 'sub_cloud'],
  },
];

// Seed realistic attendance history so statistics display authentic metrics immediately
function generateSeedRecords(): { sessions: AttendanceSession[]; records: AttendanceRecord[] } {
  const sessions: AttendanceSession[] = [];
  const records: AttendanceRecord[] = [];

  const subjectConfigs = [
    { subId: 'sub_dbms', held: 16, aaravAttended: 13 }, // 81.25% - Good
    { subId: 'sub_cn', held: 15, aaravAttended: 9 },    // 60.00% - Urgent Warning
    { subId: 'sub_ml', held: 14, aaravAttended: 10 },   // 71.42% - Warning
    { subId: 'sub_cloud', held: 12, aaravAttended: 11 },// 91.66% - Achievement
  ];

  const students = INITIAL_USERS.filter((u) => u.role === 'student');

  let sessionCount = 1;
  const now = new Date();

  subjectConfigs.forEach(({ subId, held, aaravAttended }) => {
    for (let i = 1; i <= held; i++) {
      const sessDate = new Date(now.getTime() - (held - i + 1) * 86400000 * 1.5);
      const sessionId = `sess_${subId}_${i}`;

      const session: AttendanceSession = {
        id: sessionId,
        classGroupId: 'class_cse_6a',
        subjectId: subId,
        teacherId: 'user_teacher_1',
        roomName: 'Room 402 - CS Block',
        latitude: 12.9716,
        longitude: 77.5946,
        radiusMeters: 80,
        allowLocationCheck: true,
        allowBleCheck: false,
        startTime: sessDate.toISOString(),
        endTime: new Date(sessDate.getTime() + 3600000).toISOString(),
        status: 'closed',
        currentQrToken: `TOKEN_${sessionId}`,
        qrExpiresAt: sessDate.toISOString(),
        tokenIntervalSeconds: 45,
      };
      sessions.push(session);

      students.forEach((student) => {
        let isPresent = true;
        if (student.id === 'user_student_1') {
          // Aarav attendance pattern
          isPresent = i <= aaravAttended;
        } else {
          // Other students realistic distribution
          isPresent = (i + student.id.charCodeAt(student.id.length - 1)) % 5 !== 0;
        }

        records.push({
          id: `rec_${sessionId}_${student.id}`,
          sessionId,
          classGroupId: 'class_cse_6a',
          subjectId: subId,
          studentId: student.id,
          studentRoll: student.rollNumber || 'CS-2024-001',
          studentName: student.name,
          timestamp: sessDate.toISOString(),
          status: isPresent ? 'present' : 'absent',
          verificationMethod: isPresent ? 'dynamic_qr' : 'manual',
          locationEvidence: {
            distanceMeters: Math.floor(Math.random() * 25) + 5,
            verified: isPresent,
          },
        });
      });
      sessionCount++;
    }
  });

  return { sessions, records };
}

export const INITIAL_EXAMS: ExamSchedule[] = [
  // 1. Session Test 2 (2 November to 5 November)
  // Requirement: ST exam is 40 marks, one day two exams (Shift 1: 10:00 AM to 12:30 PM, Shift 2: 02:00 PM to 04:30 PM)
  {
    id: 'exam_st2_1',
    title: 'Session Test 2: Database Management Systems (Shift 1)',
    subjectId: 'sub_dbms',
    subjectName: 'Database Management Systems (CS-301)',
    classGroupId: 'class_cse_6a',
    className: 'B.Tech CSE - 6th Sem',
    examDate: '2026-11-02',
    startTime: '10:00 AM',
    endTime: '12:30 PM',
    venue: 'Academic Block B - Hall 101',
    totalMarks: 40,
    instructions: 'Session Test 2 (Nov 2 - Nov 5). Morning Shift 1 (10:00 AM - 12:30 PM). 40 Marks. Day 1 first paper.',
    remindersEnabled: true,
    reminderDaysBefore: [3, 1, 0],
  },
  {
    id: 'exam_st2_2',
    title: 'Session Test 2: Computer Networks (Shift 2)',
    subjectId: 'sub_cn',
    subjectName: 'Computer Networks (CS-302)',
    classGroupId: 'class_cse_6a',
    className: 'B.Tech CSE - 6th Sem',
    examDate: '2026-11-02',
    startTime: '02:00 PM',
    endTime: '04:30 PM',
    venue: 'Academic Block B - Hall 102',
    totalMarks: 40,
    instructions: 'Session Test 2 (Nov 2 - Nov 5). Afternoon Shift 2 (02:00 PM - 04:30 PM). 40 Marks. Day 1 second paper.',
    remindersEnabled: true,
    reminderDaysBefore: [3, 1, 0],
  },
  {
    id: 'exam_st2_3',
    title: 'Session Test 2: Machine Learning & Neural Nets (Shift 1)',
    subjectId: 'sub_ml',
    subjectName: 'Machine Learning & Neural Nets (CS-303)',
    classGroupId: 'class_cse_6a',
    className: 'B.Tech CSE - 6th Sem',
    examDate: '2026-11-04',
    startTime: '10:00 AM',
    endTime: '12:30 PM',
    venue: 'Academic Block B - Hall 103',
    totalMarks: 40,
    instructions: 'Session Test 2 (Nov 2 - Nov 5). Morning Shift 1 (10:00 AM - 12:30 PM). 40 Marks. Day 2 first paper.',
    remindersEnabled: true,
    reminderDaysBefore: [3, 1],
  },
  {
    id: 'exam_st2_4',
    title: 'Session Test 2: Cloud Computing & DevOps (Shift 2)',
    subjectId: 'sub_cloud',
    subjectName: 'Cloud Computing & DevOps (CS-304)',
    classGroupId: 'class_cse_6a',
    className: 'B.Tech CSE - 6th Sem',
    examDate: '2026-11-04',
    startTime: '02:00 PM',
    endTime: '04:30 PM',
    venue: 'Academic Block B - Hall 104',
    totalMarks: 40,
    instructions: 'Session Test 2 (Nov 2 - Nov 5). Afternoon Shift 2 (02:00 PM - 04:30 PM). 40 Marks. Day 2 second paper.',
    remindersEnabled: true,
    reminderDaysBefore: [3, 1, 0],
  },

  // 2. Pre-University Test (PUT) (16 November to 21 November)
  // Requirement: PUT exam is 3 hours, one day only one exam, and each exam 70 marks
  {
    id: 'exam_put_1',
    title: 'Pre-University Test: Database Management Systems',
    subjectId: 'sub_dbms',
    subjectName: 'Database Management Systems (CS-301)',
    classGroupId: 'class_cse_6a',
    className: 'B.Tech CSE - 6th Sem',
    examDate: '2026-11-16',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    venue: 'Exam Center Hall 1',
    totalMarks: 70,
    instructions: 'Pre-University Test (PUT) (Nov 16 - Nov 21). 3 hours duration (10:00 AM - 01:00 PM). One exam per day. Total 70 Marks.',
    remindersEnabled: true,
    reminderDaysBefore: [3, 1, 0],
  },
  {
    id: 'exam_put_2',
    title: 'Pre-University Test: Computer Networks',
    subjectId: 'sub_cn',
    subjectName: 'Computer Networks (CS-302)',
    classGroupId: 'class_cse_6a',
    className: 'B.Tech CSE - 6th Sem',
    examDate: '2026-11-18',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    venue: 'Exam Center Hall 1',
    totalMarks: 70,
    instructions: 'Pre-University Test (PUT) (Nov 16 - Nov 21). 3 hours duration (10:00 AM - 01:00 PM). One exam per day. Total 70 Marks.',
    remindersEnabled: true,
    reminderDaysBefore: [3, 1],
  },
  {
    id: 'exam_put_3',
    title: 'Pre-University Test: Machine Learning & Neural Nets',
    subjectId: 'sub_ml',
    subjectName: 'Machine Learning & Neural Nets (CS-303)',
    classGroupId: 'class_cse_6a',
    className: 'B.Tech CSE - 6th Sem',
    examDate: '2026-11-19',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    venue: 'Exam Center Hall 2',
    totalMarks: 70,
    instructions: 'Pre-University Test (PUT) (Nov 16 - Nov 21). 3 hours duration (10:00 AM - 01:00 PM). One exam per day. Total 70 Marks.',
    remindersEnabled: true,
    reminderDaysBefore: [3, 1],
  },
  {
    id: 'exam_put_4',
    title: 'Pre-University Test: Cloud Computing & DevOps',
    subjectId: 'sub_cloud',
    subjectName: 'Cloud Computing & DevOps (CS-304)',
    classGroupId: 'class_cse_6a',
    className: 'B.Tech CSE - 6th Sem',
    examDate: '2026-11-21',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    venue: 'Exam Center Hall 2',
    totalMarks: 70,
    instructions: 'Pre-University Test (PUT) (Nov 16 - Nov 21). 3 hours duration (10:00 AM - 01:00 PM). One exam per day. Total 70 Marks.',
    remindersEnabled: true,
    reminderDaysBefore: [3, 1, 0],
  },

  // 3. University Examination (Starts 24 November)
  // Requirement: UT exam is 3 hours, one day only one exam, and each exam 70 marks
  {
    id: 'exam_uni_1',
    title: 'University Examination: Database Management Systems',
    subjectId: 'sub_dbms',
    subjectName: 'Database Management Systems (CS-301)',
    classGroupId: 'class_cse_6a',
    className: 'B.Tech CSE - 6th Sem',
    examDate: '2026-11-24',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    venue: 'University Central Examination Hall - Block A',
    totalMarks: 70,
    instructions: 'University Semester Examination commences Nov 24. 3 hours duration (10:00 AM - 01:00 PM). One exam per day. Total 70 Marks. Hall Ticket and College ID mandatory.',
    remindersEnabled: true,
    reminderDaysBefore: [3, 1, 0],
  },
  {
    id: 'exam_uni_2',
    title: 'University Examination: Computer Networks',
    subjectId: 'sub_cn',
    subjectName: 'Computer Networks (CS-302)',
    classGroupId: 'class_cse_6a',
    className: 'B.Tech CSE - 6th Sem',
    examDate: '2026-11-26',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    venue: 'University Central Examination Hall - Block A',
    totalMarks: 70,
    instructions: 'University Semester Examination. 3 hours duration (10:00 AM - 01:00 PM). One exam per day. Total 70 Marks. Hall Ticket mandatory. No smart watches allowed.',
    remindersEnabled: true,
    reminderDaysBefore: [3, 1, 0],
  },
  {
    id: 'exam_uni_3',
    title: 'University Examination: Machine Learning & Neural Nets',
    subjectId: 'sub_ml',
    subjectName: 'Machine Learning & Neural Nets (CS-303)',
    classGroupId: 'class_cse_6a',
    className: 'B.Tech CSE - 6th Sem',
    examDate: '2026-11-28',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    venue: 'University Central Examination Hall - Block B',
    totalMarks: 70,
    instructions: 'University Semester Examination. 3 hours duration (10:00 AM - 01:00 PM). One exam per day. Total 70 Marks. External university evaluation.',
    remindersEnabled: true,
    reminderDaysBefore: [3, 1, 0],
  },
  {
    id: 'exam_uni_4',
    title: 'University Examination: Cloud Computing & DevOps',
    subjectId: 'sub_cloud',
    subjectName: 'Cloud Computing & DevOps (CS-304)',
    classGroupId: 'class_cse_6a',
    className: 'B.Tech CSE - 6th Sem',
    examDate: '2026-11-30',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    venue: 'University Central Examination Hall - Block B',
    totalMarks: 70,
    instructions: 'University Semester Examination. 3 hours duration (10:00 AM - 01:00 PM). One exam per day. Total 70 Marks. Final theoretical paper for semester 6.',
    remindersEnabled: true,
    reminderDaysBefore: [3, 1, 0],
  },
];

export const INITIAL_EVENTS: AcademicEvent[] = [
  {
    id: 'evt_1',
    title: 'HackSpark 2026 - National 36h Hackathon',
    description: 'Build cutting-edge AI, Web3, and IoT solutions. Prize pool of INR 2,50,000 with industry mentorship from Google and top tech giants.',
    category: 'hackathon',
    date: '2026-11-18',
    time: '09:00 AM',
    venue: 'Central Auditorium & Innovation Hub',
    organizer: 'CSE Tech Society & IEEE Student Branch',
    targetAudience: 'All Engineering Students',
    registrationRequired: true,
    registrationDeadline: '2026-11-10',
    registeredStudentIds: ['user_student_1', 'user_student_2', 'user_student_3'],
    bannerGradient: 'from-indigo-600 to-purple-700',
  },
  {
    id: 'evt_2',
    title: 'Hands-on Cloud DevOps & Kubernetes Workshop',
    description: 'Learn container orchestration, CI/CD pipelines, Docker, and Kubernetes deployment on Google Cloud with industry practitioners.',
    category: 'workshop',
    date: '2026-11-22',
    time: '10:00 AM - 04:30 PM',
    venue: 'Computer Center Lab 4',
    organizer: 'Dept of Computer Science & Engineering',
    targetAudience: 'B.Tech 3rd & 4th Year',
    registrationRequired: true,
    registrationDeadline: '2026-11-16',
    registeredStudentIds: ['user_student_1', 'user_student_4'],
    bannerGradient: 'from-blue-600 to-cyan-700',
  },
  {
    id: 'evt_3',
    title: 'Guest Lecture: Frontier Generative AI in Production',
    description: 'Distinguished lecture on large language models, evaluation frameworks, and latency optimization by Dr. V. Swaminathan.',
    category: 'guest_lecture',
    date: '2026-11-25',
    time: '02:30 PM - 04:30 PM',
    venue: 'Convention Hall A',
    organizer: 'Academics Office',
    targetAudience: 'All Faculty & Students',
    registrationRequired: false,
    bannerGradient: 'from-emerald-600 to-teal-800',
  },
];

export const INITIAL_TRAVEL: TravelGroup[] = [
  {
    id: 'trip_1',
    tripName: 'Industrial Visit: Infosys Campus & Tech Hub',
    destination: 'Infosys Electronic City Campus, Bangalore',
    purpose: 'Examine enterprise cloud data centers, autonomous systems, and corporate software development life-cycle.',
    startDate: '2026-11-28',
    endDate: '2026-11-28',
    coordinatorTeacherId: 'user_teacher_1',
    emergencyContact: '+91 98112 34567 (Prof. Priya Mehta)',
    participantStudentIds: ['user_student_1', 'user_student_2', 'user_student_3', 'user_student_4'],
    checkpoints: [
      {
        id: 'chk_1',
        name: 'Checkpoint 1: College Main Gate Departure',
        order: 1,
        scheduledTime: '06:30 AM',
        status: 'completed',
        verifiedStudentIds: ['user_student_1', 'user_student_2', 'user_student_3', 'user_student_4'],
        missingStudentIds: [],
        locationNote: 'Campus Bus Bay 2',
      },
      {
        id: 'chk_2',
        name: 'Checkpoint 2: Highway Rest Stop - Mandya Plaza',
        order: 2,
        scheduledTime: '09:00 AM',
        status: 'completed',
        verifiedStudentIds: ['user_student_1', 'user_student_2', 'user_student_3'],
        missingStudentIds: ['user_student_4'],
        locationNote: 'Breakfast stop and headcount verification',
      },
      {
        id: 'chk_3',
        name: 'Checkpoint 3: Infosys Main Gate Security Clearance',
        order: 3,
        scheduledTime: '11:15 AM',
        status: 'active',
        qrToken: 'TRIP_CHK_3_SECURITY',
        qrExpiresAt: new Date(Date.now() + 3600000).toISOString(),
        verifiedStudentIds: ['user_student_1', 'user_student_2'],
        missingStudentIds: ['user_student_3', 'user_student_4'],
        locationNote: 'Gate 4 Visitor Entry Point',
      },
      {
        id: 'chk_4',
        name: 'Checkpoint 4: Return Bus Boarding',
        order: 4,
        scheduledTime: '05:30 PM',
        status: 'pending',
        verifiedStudentIds: [],
        missingStudentIds: ['user_student_1', 'user_student_2', 'user_student_3', 'user_student_4'],
        locationNote: 'Infosys Parking Bay B',
      },
    ],
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    recipientId: 'user_student_1',
    recipientRole: 'student',
    category: 'low_attendance',
    title: 'Low Attendance Alert: Computer Networks (CS-302)',
    body: 'Your attendance in Computer Networks is currently 60.0%. The institutional requirement is 75%. Please attend upcoming classes regularly.',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: false,
    channels: ['in_app', 'whatsapp', 'email'],
    deliveryStatus: {
      in_app: 'delivered',
      whatsapp: 'delivered',
      email: 'delivered',
    },
  },
  {
    id: 'notif_2',
    recipientId: 'user_student_1',
    recipientRole: 'student',
    category: 'achievement',
    title: 'Attendance Achievement: Cloud Computing (CS-304)',
    body: 'Congratulations! You have achieved 91.7% attendance in Cloud Computing & DevOps. Keep maintaining your commitment!',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    read: true,
    channels: ['in_app', 'whatsapp'],
    deliveryStatus: {
      in_app: 'delivered',
      whatsapp: 'delivered',
    },
  },
  {
    id: 'notif_3',
    recipientId: 'user_student_1',
    recipientRole: 'student',
    category: 'travel_alert',
    title: 'Travel Checkpoint Active: Infosys Campus Gate 4',
    body: 'Checkpoint 3 is now open. Please scan the coordinator QR code to record your arrival verification.',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    read: false,
    channels: ['in_app', 'sms'],
    deliveryStatus: {
      in_app: 'delivered',
      sms: 'delivered',
    },
  },
];

// Helper: Haversine distance in meters
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Low-level DB helpers
function getJson<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${key}`, err);
    return defaultVal;
  }
}

function setJson<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error(`Error writing ${key}`, err);
  }
}

// Database Initialization
export function initDatabase(forceReset = false): void {
  // Auto-remove previous exams and load new Session Test 2 (40 marks, 2/day), Pre-University Test (70 marks, 3h), and University Exam (70 marks, 3h)
  const currentExams = getJson<ExamSchedule[]>(EXAMS_KEY, []);
  const needsExamReset =
    currentExams.length === 0 ||
    currentExams.some((e) => e.id === 'exam_1' || e.title.includes('Mid-Semester')) ||
    currentExams.some((e) => e.title.includes('Session Test 2') && (e.totalMarks !== 40 || e.endTime === '11:30 AM')) ||
    currentExams.some((e) => e.title.includes('University Examination') && e.totalMarks !== 70);

  if (needsExamReset) {
    setJson(EXAMS_KEY, INITIAL_EXAMS);
  }

  if (forceReset || !localStorage.getItem(USERS_KEY)) {
    const { sessions, records } = generateSeedRecords();
    setJson(USERS_KEY, INITIAL_USERS);
    setJson(CURRENT_USER_KEY, INITIAL_USERS[1]); // Default to teacher for buildathon testing
    setJson(CLASSES_KEY, INITIAL_CLASSES);
    setJson(SUBJECTS_KEY, INITIAL_SUBJECTS);
    setJson(ENROLLMENTS_KEY, INITIAL_ENROLLMENTS);
    setJson(POLICY_KEY, INITIAL_POLICY);
    setJson(SESSIONS_KEY, sessions);
    setJson(RECORDS_KEY, records);
    setJson(EXAMS_KEY, INITIAL_EXAMS);
    setJson(EVENTS_KEY, INITIAL_EVENTS);
    setJson(TRAVEL_KEY, INITIAL_TRAVEL);
    setJson(NOTIFICATIONS_KEY, INITIAL_NOTIFICATIONS);
    setJson(AUDIT_KEY, [
      {
        id: 'aud_init',
        actorId: 'system',
        actorName: 'System Bootstrap',
        actorRole: 'admin',
        action: 'DATABASE_INITIALIZATION',
        details: 'Seeded academic database with demo subjects, classes, exams, events, and records.',
        timestamp: new Date().toISOString(),
      },
    ]);
  }
}

// User / Auth APIs
export function getAllUsers(): User[] {
  return getJson<User[]>(USERS_KEY, INITIAL_USERS);
}

export function getCurrentUser(): User {
  const users = getAllUsers();
  const current = getJson<User>(CURRENT_USER_KEY, users[1]);
  // Refresh with latest from database
  return users.find((u) => u.id === current.id) || users[1];
}

const IS_LOGGED_IN_KEY = `scancard_${DB_VERSION}_logged_in`;

export function isUserLoggedIn(): boolean {
  try {
    const raw = localStorage.getItem(IS_LOGGED_IN_KEY);
    return raw ? JSON.parse(raw) : true; // Default true so demo is accessible, can be toggled by logout
  } catch {
    return true;
  }
}

export function logoutUser(): void {
  localStorage.setItem(IS_LOGGED_IN_KEY, JSON.stringify(false));
}

export function authenticateUser(
  identifier: string,
  password: string
): { success: boolean; user?: User; error?: string } {
  const users = getAllUsers();
  const term = identifier.trim().toLowerCase();
  const user = users.find(
    (u) =>
      u.username.toLowerCase() === term ||
      (u.rollNumber && u.rollNumber.toLowerCase() === term) ||
      (u.employeeId && u.employeeId.toLowerCase() === term) ||
      u.email.toLowerCase() === term
  );

  if (!user) {
    return {
      success: false,
      error: 'Account not found. Please check your username or roll number.',
    };
  }

  const expectedPassword = user.password || '1234';
  if (password.trim() !== expectedPassword) {
    return {
      success: false,
      error: 'Incorrect password. (Default is 1234)',
    };
  }

  loginUser(user);
  return { success: true, user };
}

export function loginUser(user: User): void {
  setJson(CURRENT_USER_KEY, user);
  localStorage.setItem(IS_LOGGED_IN_KEY, JSON.stringify(true));
  logAudit(user.id, user.name, user.role, 'LOGIN', `Logged in as ${user.name} (${user.role})`);
}

export function setCurrentUser(user: User): void {
  setJson(CURRENT_USER_KEY, user);
  localStorage.setItem(IS_LOGGED_IN_KEY, JSON.stringify(true));
  logAudit(user.id, user.name, user.role, 'LOGIN_SWITCH', `Switched active session to ${user.name} (${user.role})`);
}

export function updateUser(updated: User): void {
  const users = getAllUsers().map((u) => (u.id === updated.id ? updated : u));
  setJson(USERS_KEY, users);
  const current = getCurrentUser();
  if (current.id === updated.id) {
    setJson(CURRENT_USER_KEY, updated);
  }
}

export function createUser(newUser: User): void {
  const users = getAllUsers();
  users.push(newUser);
  setJson(USERS_KEY, users);
  logAudit(newUser.id, newUser.name, newUser.role, 'USER_CREATED', `Created new user ${newUser.name}`);
}

export function deleteUser(userId: string): void {
  const users = getAllUsers().filter((u) => u.id !== userId);
  setJson(USERS_KEY, users);
  logAudit(userId, 'System', 'admin', 'USER_DELETED', `Deleted user ${userId}`);
}

// Audit Logging
export function logAudit(
  actorId: string,
  actorName: string,
  actorRole: User['role'],
  action: string,
  details: string
): void {
  const logs = getJson<AuditLog[]>(AUDIT_KEY, []);
  const entry: AuditLog = {
    id: `aud_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    actorId,
    actorName,
    actorRole,
    action,
    details,
    timestamp: new Date().toISOString(),
  };
  logs.unshift(entry);
  setJson(AUDIT_KEY, logs.slice(0, 200)); // Keep latest 200 logs
}

export function getAuditLogs(): AuditLog[] {
  return getJson<AuditLog[]>(AUDIT_KEY, []);
}

// Attendance Policy APIs
export function getAttendancePolicy(): AttendancePolicy {
  return getJson<AttendancePolicy>(POLICY_KEY, INITIAL_POLICY);
}

export function updateAttendancePolicy(policy: AttendancePolicy, actor: User): void {
  setJson(POLICY_KEY, policy);
  logAudit(
    actor.id,
    actor.name,
    actor.role,
    'POLICY_UPDATE',
    `Updated policy: min ${policy.minRequiredPercentage}%, warn ${policy.warningThreshold}%`
  );
}

// Classes & Subjects
export function getAllClasses(): ClassGroup[] {
  return getJson<ClassGroup[]>(CLASSES_KEY, INITIAL_CLASSES);
}

export function createClass(cls: ClassGroup): void {
  const classes = getAllClasses();
  classes.push(cls);
  setJson(CLASSES_KEY, classes);
  logAudit(cls.id, 'System', 'admin', 'CLASS_CREATED', `Created class group: ${cls.name}`);
}

export function updateClass(cls: ClassGroup): void {
  const classes = getAllClasses().map((c) => (c.id === cls.id ? cls : c));
  setJson(CLASSES_KEY, classes);
  logAudit(cls.id, 'System', 'admin', 'CLASS_UPDATED', `Updated class group: ${cls.name}`);
}

export function deleteClass(classId: string): void {
  const classes = getAllClasses().filter((c) => c.id !== classId);
  setJson(CLASSES_KEY, classes);
  logAudit(classId, 'System', 'admin', 'CLASS_DELETED', `Deleted class group: ${classId}`);
}

export function getAllSubjects(): Subject[] {
  return getJson<Subject[]>(SUBJECTS_KEY, INITIAL_SUBJECTS);
}

export function createSubject(sub: Subject): void {
  const subjects = getAllSubjects();
  subjects.push(sub);
  setJson(SUBJECTS_KEY, subjects);
  logAudit(sub.id, 'System', 'admin', 'SUBJECT_CREATED', `Created subject: ${sub.name} (${sub.code})`);
}

export function updateSubject(sub: Subject): void {
  const subjects = getAllSubjects().map((s) => (s.id === sub.id ? sub : s));
  setJson(SUBJECTS_KEY, subjects);
  logAudit(sub.id, 'System', 'admin', 'SUBJECT_UPDATED', `Updated subject: ${sub.name} (${sub.code})`);
}

export function deleteSubject(subjectId: string): void {
  const subjects = getAllSubjects().filter((s) => s.id !== subjectId);
  setJson(SUBJECTS_KEY, subjects);
  logAudit(subjectId, 'System', 'admin', 'SUBJECT_DELETED', `Deleted subject: ${subjectId}`);
}

export function getAllEnrollments(): Enrollment[] {
  return getJson<Enrollment[]>(ENROLLMENTS_KEY, INITIAL_ENROLLMENTS);
}

// Attendance Sessions
export function getAllSessions(): AttendanceSession[] {
  return getJson<AttendanceSession[]>(SESSIONS_KEY, []);
}

export function getActiveSession(teacherId?: string): AttendanceSession | null {
  const sessions = getAllSessions();
  if (teacherId) {
    return sessions.find((s) => s.status === 'active' && s.teacherId === teacherId) || null;
  }
  return sessions.find((s) => s.status === 'active') || null;
}

export function startAttendanceSession(params: {
  classGroupId: string;
  subjectId: string;
  teacherId: string;
  roomName: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  allowLocationCheck: boolean;
  allowBleCheck: boolean;
  tokenIntervalSeconds: number;
}): AttendanceSession {
  const sessions = getAllSessions();
  // Close any existing active session for this teacher
  sessions.forEach((s) => {
    if (s.teacherId === params.teacherId && s.status === 'active') {
      s.status = 'closed';
      s.endTime = new Date().toISOString();
    }
  });

  const sessionId = `sess_${Date.now()}`;
  const now = new Date();
  const token = generateSessionToken(sessionId);
  const expiresAt = new Date(now.getTime() + params.tokenIntervalSeconds * 1000).toISOString();

  const newSession: AttendanceSession = {
    id: sessionId,
    classGroupId: params.classGroupId,
    subjectId: params.subjectId,
    teacherId: params.teacherId,
    roomName: params.roomName,
    latitude: params.latitude,
    longitude: params.longitude,
    radiusMeters: params.radiusMeters,
    allowLocationCheck: params.allowLocationCheck,
    allowBleCheck: params.allowBleCheck,
    startTime: now.toISOString(),
    status: 'active',
    currentQrToken: token,
    qrExpiresAt: expiresAt,
    tokenIntervalSeconds: params.tokenIntervalSeconds,
  };

  sessions.unshift(newSession);
  setJson(SESSIONS_KEY, sessions);

  logAudit(
    params.teacherId,
    'Teacher',
    'teacher',
    'SESSION_START',
    `Started attendance session for Subject: ${params.subjectId} in ${params.roomName}`
  );

  return newSession;
}

export function refreshSessionQrToken(sessionId: string): AttendanceSession | null {
  const sessions = getAllSessions();
  const session = sessions.find((s) => s.id === sessionId);
  if (!session || session.status !== 'active') return null;

  const now = new Date();
  session.currentQrToken = generateSessionToken(sessionId);
  session.qrExpiresAt = new Date(now.getTime() + session.tokenIntervalSeconds * 1000).toISOString();

  setJson(SESSIONS_KEY, sessions);
  return session;
}

export function closeAttendanceSession(sessionId: string, teacherId: string): void {
  const sessions = getAllSessions();
  const session = sessions.find((s) => s.id === sessionId);
  if (session) {
    session.status = 'closed';
    session.endTime = new Date().toISOString();
    setJson(SESSIONS_KEY, sessions);

    logAudit(
      teacherId,
      'Teacher',
      'teacher',
      'SESSION_CLOSED',
      `Closed attendance session ${sessionId}`
    );
  }
}

// Token generation and encoding
export function generateSessionToken(sessionId: string): string {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  const timestamp = Date.now();
  return `SMART_TOKEN_${sessionId}_${timestamp}_${rand}`;
}

export async function generateQrDataUrl(qrPayload: string): Promise<string> {
  try {
    return await QRCode.toDataURL(qrPayload, {
      width: 320,
      margin: 2,
      color: {
        dark: '#1e293b',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Error generating QR', err);
    return '';
  }
}

// Attendance Records & Submissions
export function getAllRecords(): AttendanceRecord[] {
  return getJson<AttendanceRecord[]>(RECORDS_KEY, []);
}

export function getSessionRecords(sessionId: string): AttendanceRecord[] {
  return getAllRecords().filter((r) => r.sessionId === sessionId);
}

export function getStudentRecords(studentId: string): AttendanceRecord[] {
  return getAllRecords().filter((r) => r.studentId === studentId);
}

export interface SubmitAttendanceResult {
  success: boolean;
  error?: string;
  status?: AttendanceStatus;
  distanceMeters?: number;
  record?: AttendanceRecord;
  warningAlert?: string;
}

export function submitStudentAttendance(params: {
  student: User;
  tokenPayload: string;
  studentLat?: number;
  studentLng?: number;
  bleDetected?: boolean;
  verificationMethod?: VerificationMethod;
  faceVerified?: boolean;
  biometricVerified?: boolean;
}): SubmitAttendanceResult {
  const { student, tokenPayload, studentLat, studentLng, bleDetected, faceVerified, biometricVerified } = params;

  if (student.role !== 'student') {
    return { success: false, error: 'Only authenticated students can mark attendance' };
  }

  // Parse QR token payload
  // Expected formats: JSON string OR raw token string "SMART_TOKEN_sessionId_timestamp_rand"
  let sessionId = '';
  let token = tokenPayload.trim();

  if (token.startsWith('{') && token.endsWith('}')) {
    try {
      const parsed = JSON.parse(token);
      sessionId = parsed.sessionId || '';
      token = parsed.token || '';
    } catch {
      // fallback
    }
  } else if (token.includes('SMART_TOKEN_')) {
    const parts = token.split('_');
    // SMART_TOKEN_sess_123456_ts_rand
    sessionId = parts.slice(2, -2).join('_');
  }

  const sessions = getAllSessions();
  const session = sessions.find((s) => s.id === sessionId || s.currentQrToken === token);

  if (!session) {
    return { success: false, error: 'Invalid or unrecognized attendance QR code.' };
  }

  if (session.status !== 'active') {
    return { success: false, error: 'This attendance session has already been closed by the instructor.' };
  }

  // Verify Token Expiry
  const now = new Date();
  const expiresAt = new Date(session.qrExpiresAt);
  // Add 10-second grace period for clock skew and network delay
  if (now.getTime() > expiresAt.getTime() + 10000) {
    return { success: false, error: 'This QR code has expired! Please scan the freshly refreshed code.' };
  }

  // Verify Enrollment
  const enrollments = getAllEnrollments();
  const enrollment = enrollments.find(
    (e) => e.studentId === student.id && e.classGroupId === session.classGroupId
  );

  if (!enrollment || !enrollment.subjectIds.includes(session.subjectId)) {
    return {
      success: false,
      error: 'Access Denied: You are not enrolled in this class or subject.',
    };
  }

  // Check Duplicate
  const existingRecords = getAllRecords();
  const alreadyMarked = existingRecords.find(
    (r) => r.sessionId === session.id && r.studentId === student.id
  );

  if (alreadyMarked) {
    return {
      success: false,
      error: `Duplicate Submission: You have already marked attendance for this session (Status: ${alreadyMarked.status.toUpperCase()}).`,
    };
  }

  // Presence Verification Checks
  let verified = true;
  let verificationMethod: VerificationMethod = params.verificationMethod || 'dynamic_qr';
  let distanceMeters = 0;

  if (biometricVerified) {
    verificationMethod = 'biometric_verified';
  } else if (faceVerified) {
    verificationMethod = 'face_verified';
  }

  // Location Verification if enabled
  if (session.allowLocationCheck && studentLat !== undefined && studentLng !== undefined) {
    distanceMeters = calculateDistanceMeters(
      studentLat,
      studentLng,
      session.latitude,
      session.longitude
    );

    if (distanceMeters > session.radiusMeters) {
      verified = false;
      logAudit(
        student.id,
        student.name,
        'student',
        'GEOFENCE_FAILED',
        `Student was ${distanceMeters}m away (allowed: ${session.radiusMeters}m)`
      );
    } else if (!biometricVerified && !faceVerified) {
      verificationMethod = 'qr_gps_verified';
    }
  }

  // Bluetooth check if requested
  if (session.allowBleCheck && bleDetected && !biometricVerified && !faceVerified) {
    verificationMethod = 'qr_ble_verified';
  }

  const finalStatus: AttendanceStatus = verified ? 'present' : 'verification_failed';

  const newRecord: AttendanceRecord = {
    id: `rec_${Date.now()}_${student.id}`,
    sessionId: session.id,
    classGroupId: session.classGroupId,
    subjectId: session.subjectId,
    studentId: student.id,
    studentRoll: student.rollNumber || student.username,
    studentName: student.name,
    timestamp: new Date().toISOString(),
    status: finalStatus,
    verificationMethod,
    locationEvidence: {
      distanceMeters,
      verified,
      studentLat,
      studentLng,
    },
    bleVerified: bleDetected,
    notes: verified
      ? 'Verified physical classroom presence'
      : `Flagged for instructor review (Distance: ${distanceMeters}m > ${session.radiusMeters}m limit)`,
  };

  existingRecords.push(newRecord);
  setJson(RECORDS_KEY, existingRecords);

  // Recalculate attendance stats and trigger event notifications
  checkAndTriggerAttendanceAlerts(student, session.subjectId);

  return {
    success: true,
    status: finalStatus,
    distanceMeters,
    record: newRecord,
  };
}

// Manual correction by teacher/admin with audit trail
export function updateAttendanceRecord(params: {
  recordId: string;
  newStatus: AttendanceStatus;
  reason: string;
  actor: User;
}): { success: boolean; error?: string } {
  const records = getAllRecords();
  const record = records.find((r) => r.id === params.recordId);
  if (!record) {
    return { success: false, error: 'Attendance record not found' };
  }

  const previousStatus = record.status;
  record.status = params.newStatus;
  record.verificationMethod = 'manual';

  const auditEntry: AuditRecord = {
    updatedBy: params.actor.name,
    role: params.actor.role,
    previousStatus,
    newStatus: params.newStatus,
    reason: params.reason,
    timestamp: new Date().toISOString(),
  };

  record.auditTrail = record.auditTrail || [];
  record.auditTrail.unshift(auditEntry);

  setJson(RECORDS_KEY, records);

  logAudit(
    params.actor.id,
    params.actor.name,
    params.actor.role,
    'MANUAL_ATTENDANCE_CORRECTION',
    `Modified record for ${record.studentName} in session ${record.sessionId} from ${previousStatus} to ${params.newStatus}. Reason: ${params.reason}`
  );

  return { success: true };
}

export function addManualAttendanceRecord(record: AttendanceRecord, actor: User): void {
  const records = getAllRecords();
  records.unshift(record);
  setJson(RECORDS_KEY, records);
  logAudit(
    actor.id,
    actor.name,
    actor.role,
    'MANUAL_ATTENDANCE_CREATED',
    `Added manual attendance record for ${record.studentName} (${record.studentRoll}) in subject ${record.subjectId} as ${record.status.toUpperCase()}`
  );
}

export function markDirectAttendanceByTeacher(params: {
  student: User;
  sessionId?: string;
  subjectId: string;
  classGroupId?: string;
  status?: AttendanceStatus;
  teacher: User;
  note?: string;
}): { success: boolean; record: AttendanceRecord } {
  const { student, teacher, subjectId, status = 'present', note } = params;
  const records = getAllRecords();
  const sessions = getAllSessions();

  let targetSession = params.sessionId ? sessions.find((s) => s.id === params.sessionId) : null;
  if (!targetSession) {
    targetSession =
      sessions.find((s) => s.subjectId === subjectId && s.status === 'active') ||
      sessions.find((s) => s.subjectId === subjectId);
  }

  const sessionId = targetSession ? targetSession.id : `sess_direct_${Date.now()}`;
  const classGroupId = params.classGroupId || targetSession?.classGroupId || 'class_cse_6a';

  const existingIndex = records.findIndex((r) => r.sessionId === sessionId && r.studentId === student.id);

  const recordId = existingIndex !== -1 ? records[existingIndex].id : `rec_teacher_${Date.now()}_${student.id}`;
  const record: AttendanceRecord = {
    id: recordId,
    sessionId,
    classGroupId,
    subjectId,
    studentId: student.id,
    studentRoll: student.rollNumber || student.username,
    studentName: student.name,
    timestamp: new Date().toISOString(),
    status,
    verificationMethod: 'manual_teacher',
    notes: note || `Directly marked ${status.toUpperCase()} by instructor ${teacher.name}`,
    auditTrail: [
      {
        updatedBy: teacher.name,
        role: teacher.role,
        previousStatus: existingIndex !== -1 ? records[existingIndex].status : 'absent',
        newStatus: status,
        reason: 'Direct teacher attendance override/mark',
        timestamp: new Date().toISOString(),
      },
    ],
  };

  if (existingIndex !== -1) {
    records[existingIndex] = record;
  } else {
    records.push(record);
  }

  setJson(RECORDS_KEY, records);
  logAudit(
    teacher.id,
    teacher.name,
    teacher.role,
    'DIRECT_TEACHER_ATTENDANCE',
    `Directly marked ${student.name} (${student.rollNumber || student.id}) as ${status.toUpperCase()} for subject ${subjectId}`
  );

  checkAndTriggerAttendanceAlerts(student, subjectId);
  return { success: true, record };
}

export function deleteAttendanceRecord(recordId: string, actor: User): { success: boolean; error?: string } {
  const records = getAllRecords();
  const existing = records.find((r) => r.id === recordId);
  if (!existing) {
    return { success: false, error: 'Record not found' };
  }
  const filtered = records.filter((r) => r.id !== recordId);
  setJson(RECORDS_KEY, filtered);
  logAudit(
    actor.id,
    actor.name,
    actor.role,
    'ATTENDANCE_RECORD_DELETED',
    `Deleted record for ${existing.studentName} (${existing.studentRoll}) from session ${existing.sessionId}`
  );
  return { success: true };
}

// Attendance Statistics Calculation
export function getStudentSubjectStats(studentId: string): SubjectAttendanceStat[] {
  const records = getStudentRecords(studentId);
  const subjects = getAllSubjects();
  const enrollments = getAllEnrollments();
  const policy = getAttendancePolicy();

  // Find enrolled subjects
  const studentEnrollment = enrollments.find((e) => e.studentId === studentId);
  const enrolledSubIds = studentEnrollment ? studentEnrollment.subjectIds : subjects.map((s) => s.id);

  return enrolledSubIds.map((subId) => {
    const subject = subjects.find((s) => s.id === subId) || {
      id: subId,
      code: 'SUB',
      name: 'Subject',
      credits: 3,
      department: 'CSE',
      semester: 6,
      teacherId: '',
    };

    const subRecords = records.filter((r) => r.subjectId === subId);
    const totalHeld = subRecords.length;
    const attended = subRecords.filter((r) => r.status === 'present').length;
    const missed = totalHeld - attended;

    // Requirement: if no attendance mark then show 0%
    const percentage =
      totalHeld === 0 || attended === 0 ? 0 : Math.round((attended / totalHeld) * 1000) / 10;

    // Calculate classes needed to reach required threshold
    let classesNeeded = 0;
    const reqRatio = policy.minRequiredPercentage / 100;
    if (totalHeld > 0 && percentage < policy.minRequiredPercentage && reqRatio < 1) {
      const numerator = reqRatio * totalHeld - attended;
      const denominator = 1 - reqRatio;
      classesNeeded = Math.max(0, Math.ceil(numerator / denominator));
    }

    let statusLevel: 'good' | 'warning' | 'critical' = 'good';
    if (totalHeld > 0) {
      if (percentage < policy.urgentThreshold) {
        statusLevel = 'critical';
      } else if (percentage < policy.minRequiredPercentage) {
        statusLevel = 'warning';
      }
    }

    return {
      subjectId: subId,
      subjectCode: subject.code,
      subjectName: subject.name,
      totalHeld,
      attended,
      missed,
      percentage,
      requiredPercentage: policy.minRequiredPercentage,
      classesNeeded,
      statusLevel,
    };
  });
}

// Automatic Notifications & Alert Engine
export function getAllNotifications(): NotificationItem[] {
  return getJson<NotificationItem[]>(NOTIFICATIONS_KEY, []);
}

export function getUserNotifications(userId: string): NotificationItem[] {
  return getAllNotifications().filter(
    (n) => n.recipientId === userId || n.recipientId === 'all'
  );
}

export function markNotificationAsRead(notifId: string): void {
  const notifs = getAllNotifications().map((n) =>
    n.id === notifId ? { ...n, read: true } : n
  );
  setJson(NOTIFICATIONS_KEY, notifs);
}

export function sendNotification(params: {
  recipientId: string;
  category: NotificationItem['category'];
  title: string;
  body: string;
  channels: NotificationChannel[];
  actor?: User;
}): NotificationItem {
  const notifs = getAllNotifications();
  const deliveryStatus: NotificationItem['deliveryStatus'] = {};

  params.channels.forEach((ch) => {
    deliveryStatus[ch] = 'delivered'; // In simulated environment
  });

  const newNotif: NotificationItem = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    recipientId: params.recipientId,
    category: params.category,
    title: params.title,
    body: params.body,
    timestamp: new Date().toISOString(),
    read: false,
    channels: params.channels,
    deliveryStatus,
  };

  notifs.unshift(newNotif);
  setJson(NOTIFICATIONS_KEY, notifs);

  if (params.actor) {
    logAudit(
      params.actor.id,
      params.actor.name,
      params.actor.role,
      'NOTIFICATION_SENT',
      `Sent [${params.category}] "${params.title}" via ${params.channels.join(', ')}`
    );
  }

  return newNotif;
}

// Checks if student attendance crossed warning or achievement thresholds
export function checkAndTriggerAttendanceAlerts(student: User, subjectId: string): void {
  const stats = getStudentSubjectStats(student.id);
  const subStat = stats.find((s) => s.subjectId === subjectId);
  if (!subStat || subStat.totalHeld < 3) return; // Need at least 3 classes to trigger

  const existingNotifs = getUserNotifications(student.id);
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Low attendance warning
  if (subStat.percentage < subStat.requiredPercentage) {
    // Prevent duplicate alert today for this subject
    const alreadyAlertedToday = existingNotifs.some(
      (n) =>
        n.category === 'low_attendance' &&
        n.title.includes(subStat.subjectCode) &&
        n.timestamp.startsWith(todayStr)
    );

    if (!alreadyAlertedToday) {
      sendNotification({
        recipientId: student.id,
        category: 'low_attendance',
        title: `Low Attendance Alert: ${subStat.subjectCode}`,
        body: `Your attendance in ${subStat.subjectName} is currently ${subStat.percentage}%. The required attendance is ${subStat.requiredPercentage}%. You need to attend at least ${subStat.classesNeeded} upcoming class(es) to reach the required threshold.`,
        channels: ['in_app', 'whatsapp', 'email'],
      });
    }
  }

  // 2. Achievement notification
  if (subStat.percentage >= subStat.requiredPercentage) {
    const alreadyCelebrated = existingNotifs.some(
      (n) =>
        n.category === 'achievement' &&
        n.title.includes(subStat.subjectCode) &&
        n.timestamp.startsWith(todayStr)
    );

    if (!alreadyCelebrated) {
      sendNotification({
        recipientId: student.id,
        category: 'achievement',
        title: `Attendance Milestone: ${subStat.subjectCode}`,
        body: `Congratulations! You are maintaining an excellent ${subStat.percentage}% attendance in ${subStat.subjectName}, meeting the institution's ${subStat.requiredPercentage}% requirement.`,
        channels: ['in_app', 'whatsapp'],
      });
    }
  }
}

// Exam Management APIs
export function getAllExams(): ExamSchedule[] {
  const current = getJson<ExamSchedule[]>(EXAMS_KEY, INITIAL_EXAMS);
  const needsRefresh =
    current.length === 0 ||
    current.some((e) => e.id === 'exam_1' || e.title.includes('Mid-Semester')) ||
    current.some((e) => e.title.includes('Session Test 2') && (e.totalMarks !== 40 || e.endTime === '11:30 AM')) ||
    current.some((e) => e.title.includes('University Examination') && e.totalMarks !== 70);

  if (needsRefresh) {
    setJson(EXAMS_KEY, INITIAL_EXAMS);
    return INITIAL_EXAMS;
  }
  return current;
}

export function createExam(exam: ExamSchedule, actor: User): void {
  const exams = getAllExams();
  exams.push(exam);
  setJson(EXAMS_KEY, exams);

  logAudit(actor.id, actor.name, actor.role, 'EXAM_CREATED', `Created exam ${exam.title} for ${exam.subjectName}`);

  // Broadcast notification to students
  sendNotification({
    recipientId: 'all',
    category: 'exam_schedule',
    title: `New Exam Scheduled: ${exam.title}`,
    body: `${exam.subjectName} is scheduled on ${exam.examDate} from ${exam.startTime} to ${exam.endTime} at ${exam.venue}.`,
    channels: ['in_app', 'whatsapp', 'email'],
    actor,
  });
}

export function updateExam(updated: ExamSchedule, actor: User): void {
  const exams = getAllExams().map((e) => (e.id === updated.id ? updated : e));
  setJson(EXAMS_KEY, exams);
  logAudit(actor.id, actor.name, actor.role, 'EXAM_UPDATED', `Updated exam schedule: ${updated.title}`);
}

export function deleteExam(examId: string, actor: User): void {
  const exams = getAllExams().filter((e) => e.id !== examId);
  setJson(EXAMS_KEY, exams);
  logAudit(actor.id, actor.name, actor.role, 'EXAM_DELETED', `Deleted exam schedule: ${examId}`);
}

// Events Management APIs
export function getAllEvents(): AcademicEvent[] {
  return getJson<AcademicEvent[]>(EVENTS_KEY, INITIAL_EVENTS);
}

export function createEvent(event: AcademicEvent, actor: User): void {
  const events = getAllEvents();
  events.push(event);
  setJson(EVENTS_KEY, events);

  logAudit(actor.id, actor.name, actor.role, 'EVENT_PUBLISHED', `Published event ${event.title}`);

  sendNotification({
    recipientId: 'all',
    category: 'event',
    title: `New Campus Event: ${event.title}`,
    body: `${event.description.substring(0, 100)}... Scheduled on ${event.date} at ${event.venue}.`,
    channels: ['in_app', 'email'],
    actor,
  });
}

export function updateEvent(updated: AcademicEvent, actor: User): void {
  const events = getAllEvents().map((e) => (e.id === updated.id ? updated : e));
  setJson(EVENTS_KEY, events);
  logAudit(actor.id, actor.name, actor.role, 'EVENT_UPDATED', `Updated event: ${updated.title}`);
}

export function deleteEvent(eventId: string, actor: User): void {
  const events = getAllEvents().filter((e) => e.id !== eventId);
  setJson(EVENTS_KEY, events);
  logAudit(actor.id, actor.name, actor.role, 'EVENT_DELETED', `Deleted event: ${eventId}`);
}

export function registerStudentForEvent(eventId: string, studentId: string): void {
  const events = getAllEvents();
  const evt = events.find((e) => e.id === eventId);
  if (evt) {
    evt.registeredStudentIds = evt.registeredStudentIds || [];
    if (!evt.registeredStudentIds.includes(studentId)) {
      evt.registeredStudentIds.push(studentId);
      setJson(EVENTS_KEY, events);
    }
  }
}

// Travel Groups & Checkpoint Management
export function getAllTravelGroups(): TravelGroup[] {
  return getJson<TravelGroup[]>(TRAVEL_KEY, INITIAL_TRAVEL);
}

export function createTravelGroup(group: TravelGroup, actor: User): void {
  const groups = getAllTravelGroups();
  groups.push(group);
  setJson(TRAVEL_KEY, groups);

  logAudit(actor.id, actor.name, actor.role, 'TRAVEL_GROUP_CREATED', `Created travel group: ${group.tripName}`);
}

export function updateTravelGroup(updated: TravelGroup, actor: User): void {
  const groups = getAllTravelGroups().map((g) => (g.id === updated.id ? updated : g));
  setJson(TRAVEL_KEY, groups);
  logAudit(actor.id, actor.name, actor.role, 'TRAVEL_GROUP_UPDATED', `Updated travel group: ${updated.tripName}`);
}

export function deleteTravelGroup(groupId: string, actor: User): void {
  const groups = getAllTravelGroups().filter((g) => g.id !== groupId);
  setJson(TRAVEL_KEY, groups);
  logAudit(actor.id, actor.name, actor.role, 'TRAVEL_GROUP_DELETED', `Deleted travel group: ${groupId}`);
}

export function activateTravelCheckpoint(tripId: string, checkpointId: string, actor: User): TravelCheckpoint | null {
  const groups = getAllTravelGroups();
  const group = groups.find((g) => g.id === tripId);
  if (!group) return null;

  const checkpoint = group.checkpoints.find((c) => c.id === checkpointId);
  if (!checkpoint) return null;

  checkpoint.status = 'active';
  checkpoint.qrToken = `TRIP_CHK_${tripId}_${checkpointId}_${Date.now()}`;
  checkpoint.qrExpiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour active

  setJson(TRAVEL_KEY, groups);

  logAudit(actor.id, actor.name, actor.role, 'CHECKPOINT_ACTIVATED', `Activated checkpoint ${checkpoint.name} for ${group.tripName}`);

  // Send checkpoint notification to participant students
  group.participantStudentIds.forEach((studentId) => {
    sendNotification({
      recipientId: studentId,
      category: 'travel_alert',
      title: `Active Checkpoint: ${checkpoint.name}`,
      body: `Please report to coordinator ${group.emergencyContact} and scan the QR code to record your checkpoint verification.`,
      channels: ['in_app', 'sms'],
      actor,
    });
  });

  return checkpoint;
}

export function verifyStudentCheckpoint(
  tripId: string,
  checkpointId: string,
  studentId: string
): { success: boolean; error?: string } {
  const groups = getAllTravelGroups();
  const group = groups.find((g) => g.id === tripId);
  if (!group) return { success: false, error: 'Trip not found' };

  if (!group.participantStudentIds.includes(studentId)) {
    return { success: false, error: 'Student is not an authorized participant in this trip group' };
  }

  const checkpoint = group.checkpoints.find((c) => c.id === checkpointId);
  if (!checkpoint) return { success: false, error: 'Checkpoint not found' };

  if (!checkpoint.verifiedStudentIds.includes(studentId)) {
    checkpoint.verifiedStudentIds.push(studentId);
    checkpoint.missingStudentIds = checkpoint.missingStudentIds.filter((id) => id !== studentId);
  }

  setJson(TRAVEL_KEY, groups);
  return { success: true };
}
