# Product Plan

## Product Summary

SMK 7 Academic System is a school operations platform focused on three core workflows:

1. QR-based student attendance
2. Attendance report export to PDF and Excel
3. Student CBT (computer-based test) exams

The product should optimize daily school operations for teachers and administrators while keeping the student experience simple and reliable.

## Product Goals

- Reduce manual attendance work and attendance fraud.
- Speed up attendance recap and reporting.
- Provide a structured, browser-based exam system for school assessments.
- Keep the system easy to operate for non-technical staff.

## Core Features

### 1. QR Attendance

- Create attendance sessions for a class, subject, or event.
- Generate and display QR codes for attendance access.
- Record student check-in time and attendance status.
- Support late, absent, present, and corrected attendance states.
- Allow manual correction by authorized staff.

### 2. Attendance Reporting

- Filter attendance by date, class, subject, teacher, and student.
- View attendance summaries and detail history.
- Export reports to PDF.
- Export reports to Excel for school administration.

### 3. CBT Exam System

- Create exams with schedule, duration, and access rules.
- Build a question bank for objective and structured questions.
- Let students take exams in the browser with timer control.
- Auto-submit when time ends.
- Auto-grade objective question types.
- Store exam results and attempt history.

### 4. Administration

- Manage users, roles, classes, teachers, students, and subjects.
- Configure attendance rules and exam settings.
- View logs and operational history.

## Priority Matrix

### Must Have

- Authentication and role-based access
- QR attendance capture
- Attendance history and manual correction
- Attendance export to PDF and Excel
- Basic CBT exam flow
- Objective-question auto-scoring

### Should Have

- Attendance filters by class, subject, teacher, and date
- Exam scheduling and timed submission control
- Result history for students and teachers
- Audit logs for key actions

### Could Have

- Parent or homeroom visibility
- Notifications
- Advanced analytics dashboards
- Stronger anti-cheat or proctoring tools

## Modules

### 1. Identity and Access

- Authentication
- Role-based authorization
- Account management

### 2. Academic Master Data

- Students
- Teachers
- Classes / homerooms
- Subjects
- Academic periods

### 3. Attendance Module

- Attendance session creation
- QR code generation
- Student attendance capture
- Correction and approval flow
- Attendance history

### 4. Reporting Module

- Attendance recap
- Student attendance detail
- PDF export
- Excel export

### 5. CBT Module

- Exam creation
- Question bank
- Exam scheduling
- Exam taking interface
- Timer and submission handling
- Auto-grading

### 6. Results Module

- Attendance summaries
- Exam results
- Student history
- Teacher and admin views

### 7. System Administration

- School settings
- Audit logs
- Data maintenance

## User Roles

### Super Admin

- Full access to system configuration and user management.
- Manages global academic and operational settings.

### School Admin / Operator

- Manages attendance data, exports, master data, and reporting.
- Handles corrections and operational follow-up.

### Teacher

- Runs attendance sessions.
- Reviews attendance records.
- Creates or supervises CBT exams.

### Proctor / Exam Supervisor

- Monitors CBT sessions.
- Supports exam integrity and session control.

### Student

- Checks in through QR attendance.
- Takes CBT exams.
- Views own exam or attendance-related information if allowed.

### Optional Future Role: Homeroom Teacher or Parent

- Receives attendance visibility and progress updates.
- This role should be treated as a later-phase enhancement.

## MVP Scope

### Include

- Login and role-based access
- Student, teacher, and class setup
- QR attendance session creation and check-in
- Attendance status tracking and manual correction
- Attendance summary and PDF / Excel export
- Basic CBT exam creation
- Student exam-taking flow with timer
- Objective-question auto-scoring
- Simple results view for teachers and admins

### Exclude for MVP

- Parent portal
- Push notifications or WhatsApp integration
- Offline attendance mode
- Advanced anti-cheat or proctoring features
- Mobile apps
- Complex analytics dashboard
- Advanced question types beyond the core set

## Development Roadmap

### Next Release: Reporting Completion

The next release should focus on completing the reporting workflow before starting CBT.

#### Include

- Keep QR attendance unchanged
- Attendance history and admin report views
- CSV export retention
- Add PDF export
- Add Excel export
- Add only the reporting UX needed to support filtering, date range selection, and summary review

#### Defer

- CBT
- Question bank
- Exam creation and delivery
- Auto-scoring beyond attendance reporting
- Broader analytics and dashboard expansion

#### Why this comes first

- It closes the loop on the system's current daily workflow.
- It delivers immediate value to admins with low implementation risk.
- It reduces scope compared with building a full CBT stack.

#### Exit criteria

- Attendance data can be exported as CSV, PDF, and Excel.
- Admins can filter and review reports without manual spreadsheet work.
- Export totals match the on-screen attendance summaries.
- The reporting flow is stable enough for normal school use.

### Release 1: Attendance Foundation

- Complete authentication and role access.
- Finalize student, class, teacher, and subject master data.
- Launch QR attendance capture and attendance record storage.

Exit criteria:

- Teachers can run an attendance session end to end.
- Admins can review and correct attendance records.

### Release 2: Reporting Layer

- Add attendance filters and summary views.
- Add PDF and Excel exports.

Exit criteria:

- Attendance data can be exported in a school-usable format.
- Reports are usable without manual spreadsheet cleanup.

### Release 3: CBT MVP

- Launch exam setup, exam taking, timer control, and auto-scoring.
- Store results and attempts.

Exit criteria:

- A teacher can publish an exam and a student can complete it fully in the browser.
- Objective questions are scored automatically.

### Phase 1: Foundation

- Set up authentication and roles.
- Build master data for students, teachers, classes, and subjects.
- Establish navigation and admin workflows.

### Phase 2: Attendance MVP

- Implement attendance session creation.
- Add QR generation and attendance capture.
- Store attendance records with timestamps and status.
- Add correction flow for exceptions.

### Phase 3: Reporting

- Build attendance recap pages.
- Add filters and history views.
- Implement PDF and Excel exports.

### Phase 4: CBT System

- Build exam setup and question bank.
- Implement student exam flow and timer logic.
- Add auto-grading and result storage.

### Phase 5: Hardening

- Add audit logs and validation rules.
- Improve performance for larger student populations.
- Refine UX for teachers and students.

### Phase 6: Expansion

- Add notifications.
- Add advanced analytics.
- Add optional parent or homeroom visibility.
- Add stronger proctoring features if needed.

## Success Criteria

- Attendance can be completed and recorded faster than the manual process.
- Attendance exports are usable by school administration without extra formatting.
- CBT exams can run end-to-end without manual intervention for objective scoring.
- Teachers and admins can operate the system without technical support.

## Assumptions

- The system is intended for internal school operations.
- QR attendance is the daily operational anchor of the product.
- PDF and Excel export are required from the start.
- CBT is browser-based and school-managed.