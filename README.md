# ScanCard: Smart Academic Attendance & Campus Management System

**ScanCard** is an enterprise-grade Smart Attendance and Academic Operations Platform designed for colleges and universities. It replaces unreliable paper registers and biometric queues with dynamic, time-rotating QR codes, GPS geofence validation, Bluetooth Low Energy proximity verification, automated attendance alerts, multi-channel messaging (In-app, WhatsApp, SMS, Email), examination scheduling, campus events management, and group travel attendance tracking.

---

## 🏛️ Architecture & Core Modules

### 1. Role-Based Access Control (RBAC)
- **Administrator (Dr. S. K. Sharma - Dean of Academics)**: Institutional dashboard, attendance policies (75% minimum, 65% warning), cross-department analytics, class and faculty assignments, immutable audit trail.
- **Faculty / Teacher (Prof. Priya Mehta - Computer Science)**: Curriculum courses, live dynamic QR attendance projector, real-time verification roster, low-attendance student radar, multi-channel broadcast center, manual attendance correction with mandatory audit reason.
- **Student (Aarav Patel & peers - 6th Sem B.Tech CSE)**: Personalized attendance dashboard with Red/Yellow/Green compliance progress bars, "Classes needed to reach 75%" calculator, active camera scanner with GPS check, examination calendar, campus event registrations, travel tour checkpoint verification.
- **Instant Demo Role Switcher**: Located in the top header, allowing buildathon evaluators and judges to seamlessly switch between Admin, Faculty, and Student personas with 1 click.

---

### 2. Smart Classroom Attendance & Dynamic QR Security
- **Anti-Replay Token Generation**: Each attendance session generates a cryptographically randomized token that automatically refreshes every **30 to 45 seconds** (`tokenIntervalSeconds`). Expired or shared screenshot QR codes are automatically rejected on the server/storage layer.
- **Physical Classroom Presence Verification**:
  - **Active Session Validation**: Rejects submissions for closed, non-existent, or future classes.
  - **Enrollment Verification**: Verifies student enrollment in the specific course and section.
  - **GPS Geofence Radius**: Calculates Haversine distance in meters between student device GPS and instructor podium coordinates. Scans outside the authorized radius (e.g. >80m) are automatically flagged as `verification_failed` for teacher review.
  - **Bluetooth Low Energy (BLE)**: Detects Web Bluetooth API support and scans for classroom beacon presence, falling back gracefully to GPS.
  - **Duplicate Prevention**: Strictly prevents a student from recording attendance more than once in the same session.
- **Manual Attendance Correction**: Teachers can correct attendance records with an audit trail logging previous status, new status, authorized user, timestamp, and mandatory justification.

---

### 3. Automated Attendance Percentage & Alert Engine
- **Formula**: `(Attended Classes / Held Counted Classes) × 100`
- **Classes Needed Calculator**: For students below 75%, mathematically calculates the minimum number of consecutive upcoming classes required to recover exam eligibility.
- **Visual Thresholds**:
  - 🟢 **Green**: Meets or exceeds required threshold (≥ 75%)
  - 🟡 **Yellow**: Advisory warning near threshold (65% – 74.9%)
  - 🔴 **Red**: Urgent critical escalation (&lt; 65%)
- **Automatic Event-Driven Notifications**:
  - Triggers advisory warning when crossing below 75%
  - Triggers congratulatory milestone notification when achieving 75%+
  - Built-in deduplication prevents alert spamming.

---

### 4. Multi-Channel Notification & Messaging Center
- **Teacher Broadcast Composer**:
  - Recipient filtering: Entire Class, Students Below 75%, Individual Student, Travel Group.
  - Channel selection: In-app Alert, WhatsApp Business, SMS Gateway, College Email.
  - **WhatsApp Mobile Preview**: Interactive simulated phone mockup displaying official WhatsApp Business branded message templates.
  - Delivery log tracking delivery status (`sent`, `delivered`, `simulated`).

---

### 5. Examination Schedule & Calendar
- Manage semester theory, practical labs, and seminar viva schedules.
- Venue, total marks, invigilation guidelines, and countdown reminders (3 days before, 1 day before, day of exam).
- Student examination timetable with marks distribution.

---

### 6. Campus Events & Technical Fests
- Publish technical conferences, hackathons (HackSpark 2026), workshops (DevOps & Kubernetes), guest lectures, and cultural fests.
- 1-click registration for students with digital entry badge.

---

### 7. Group Travel & Industrial Tour Attendance
- Multi-checkpoint journey attendance for college trips and industrial visits (e.g. Infosys Campus Industrial Visit).
- Checkpoint milestones: Departure Gate, Highway Rest Stop, Campus Entrance Security, Return Boarding.
- Time-limited checkpoint QR code generation for coordinators.
- Real-time missing participant tracker and emergency contact desk.

---

### 8. Certified Reports & Export
- Filter by Subject, Class, Date Range, Verification Status.
- **CSV Export**: Spreadsheet format with GPS distance and evidence.
- **PDF Report Download**: Printable formal report with college letterhead, student details, and verification audit trail generated via `jsPDF`.

---

## 🚀 Installation & Local Development

### Prerequisites
- Node.js 22+
- npm 10+

### Setup Commands
```bash
# 1. Clone repository
git clone https://github.com/namantiwari222/ScanCard.git
cd ScanCard

# 2. Install dependencies
npm install

# 3. Start development server (Port 3000)
npm run dev

# 4. Build for production
npm run build
```

---

## 📋 Buildathon 6-Hour Demonstration Flow

1. **Dean / Administrator Overview**:
   - Log in as **Dr. S. K. Sharma (Admin)**.
   - Inspect college-wide metrics (Total students, faculty, average attendance, at-risk students count).
   - Navigate to **Policies & Audits** to see configurable compliance thresholds and the tamper-evident audit log.
2. **Faculty Live Dynamic QR Launch**:
   - Use the Top Header dropdown to switch to **Prof. Priya Mehta (Faculty)**.
   - Click **"Start Live QR Attendance"**.
   - Select *Database Management Systems (CS-301)* in *Room 402 - CS Block*.
   - Launch session to observe the auto-rotating dynamic QR code with a 30-second countdown timer.
3. **Student Check-In & Geofence Verification**:
   - Switch persona to **Aarav Patel (Student)**.
   - Click **"Open Attendance Scanner"**.
   - Notice GPS and BLE detection status.
   - Click **"Simulate Classroom Scan"** to record verified attendance.
   - Test **"Test Out-of-Area Scan"** to observe geofence protection flagging out-of-bounds submissions.
4. **Attendance Recalculation & Alert Trigger**:
   - Return to Student Dashboard to view real-time percentage updates, progress bars, and classes needed.
   - Check the **Notification Bell** to see automated milestone or warning alerts.
5. **Broadcast Announcement & WhatsApp Mockup**:
   - Switch back to Faculty, go to **Notification Center -> Compose Broadcast**.
   - Select *Students Below Threshold (<75%)*, enable *WhatsApp*, and click **"Show WhatsApp Phone Preview"**.
6. **Certified PDF Export**:
   - Navigate to **Attendance Reports**, filter records, and click **Download PDF** to generate an official institutional attendance report.
