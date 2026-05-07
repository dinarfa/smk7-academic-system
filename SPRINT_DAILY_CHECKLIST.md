# ✅ Daily Sprint Checklist - Attendance System MVP

**Print This & Put on Team Wall**

---

## 🔴 CRITICAL PATH (Must Complete Before Next Phase)

### Sprint 1 Critical Blocks
- [ ] **Schema Migration** - Add phase, source, excused columns
- [ ] **Camera Scanner UI** - Students can point phone at QR
- [ ] **Teacher Daily View** - Teachers can see attendance per phase
- [ ] **Manual Checklist** - Teachers have fallback if tech fails
- [ ] **Authorization Policy** - Teachers can't see other classes' data

**If any of these are NOT done by end of Week 2, Sprint 2 is blocked.**

---

## ✅ SPRINT 1 CHECKLIST (Weeks 1-2)

### Week 1: Backend Foundation

**Day 1-2: Schema & Enum**
- [ ] Migration: Add `phase` (enum) to `attendance_records`
- [ ] Migration: Add `source` (enum: qr_scan|manual) to `attendance_records`
- [ ] Migration: Add `excused` (boolean) to `attendance_records`
- [ ] Run migrations: `php artisan migrate`
- [ ] Verify schema: Check `attendance_records` table structure
- [ ] Update `AttendanceStatus` enum:
  - [ ] Add `Excused = 'excused'`
  - [ ] Add `Bolos = 'bolos'`
  - [ ] Add `NoData = 'no_data'`

**Day 3-4: Authorization & Service**
- [ ] Create `AttendancePolicy` class
- [ ] Add `close()` method to policy (teacher can only close own sessions)
- [ ] Add `viewDaily()` method to policy (teacher can only view own class)
- [ ] Create `DailyAttendanceViewService` class:
  - [ ] Method: `getByDate($date, $teacherId)` → returns attendance grouped by phase
  - [ ] Write query: `SELECT student_id, phase, status FROM attendance_records WHERE session_id IN (...) ORDER BY student_id`

**Day 5: Manual Endpoint & Tests**
- [ ] Create form request: `ManualAttendanceRequest`
  - [ ] Validate: students array (required)
  - [ ] Validate: phase (required, enum)
  - [ ] Validate: session_id (required, exists)
- [ ] Create controller method: `storeManual()` in `AttendanceSessionController`
  - [ ] Authorize with policy
  - [ ] Loop students & insert into `attendance_records` with `source='manual'`
  - [ ] Return success/count
- [ ] Write Pest test: `ManualAttendanceTest`
  - [ ] Test: Teacher can mark attendance
  - [ ] Test: Cross-class teacher cannot mark other class
  - [ ] Test: Records created with `source='manual'`

---

### Week 2: Frontend Components

**Day 6-8: Camera Scanner Component**
- [ ] Install jsQR: `npm install jsqr`
- [ ] Create `QRScanner.tsx` component:
  - [ ] Request camera permissions
  - [ ] Video stream from camera
  - [ ] QR detection overlay
  - [ ] Decode QR string
  - [ ] On successful scan: POST to `/student/attendance/scan`
  - [ ] Show success/error toast
- [ ] Add component to student dashboard
- [ ] Test on phone (iOS + Android if possible)

**Day 9-10: Teacher Daily View**
- [ ] Create page: `resources/js/pages/teacher/attendance/index.tsx`
  - [ ] Display 3 phase tabs: Morning | Class | Dismissal
  - [ ] Show active session QR code (large, centered)
  - [ ] Show countdown timer (10 minutes)
  - [ ] Show student list (status: present/absent/late)
  - [ ] "Generate New QR" button
  - [ ] "Close Session" button
- [ ] Create API endpoint: `GET /teacher/attendance/daily`
  - [ ] Query `DailyAttendanceViewService`
  - [ ] Return: active session + daily records by phase
- [ ] Add route to teacher dashboard navigation

**Day 11-12: Manual Checklist Component**
- [ ] Create `ManualChecklist.tsx` component:
  - [ ] Render student list with checkboxes
  - [ ] Search/filter by name
  - [ ] "Mark All Present" button
  - [ ] "Mark All Absent" button
  - [ ] Submit form
- [ ] Add as modal/tab in teacher daily view
- [ ] Test form submission → POST `/teacher/attendance/manual`

**Day 13: QR Display Component**
- [ ] Create `QRDisplay.tsx` component:
  - [ ] Render AttendanceSession.qrSvg() as SVG
  - [ ] Show countdown timer (update every second)
  - [ ] Show session info (phase, duration, teacher)
- [ ] Add to teacher daily view

**Day 14: Integration & Testing**
- [ ] Wayfinder route generation:
  ```bash
  php artisan wayfinder:generate
  ```
- [ ] Mobile testing (iOS camera + Android camera)
- [ ] Responsive design check (tablet, desktop)
- [ ] Browser console: no errors?
- [ ] Run all tests:
  ```bash
  php artisan test --compact --filter=Attendance
  ```

---

## 🟢 SPRINT 2 CHECKLIST (Weeks 3-4)

### Priority Order
1. [ ] **Bolos Auto-Detection** (highest priority)
2. [ ] **Excel Export**
3. [ ] **Double-Scan Testing**

### Week 3: Absence Detection
- [ ] Create `AbsenceDetectionService` class
  - [ ] Method: `detectBolosForDay($date)` → returns list of (student_id, reason)
  - [ ] Logic: If student missing ANY phase → mark Bolos
  - [ ] Exception: If student has approved excuse → don't mark Bolos
- [ ] Create `DetectAbsencesJob` scheduled command
  - [ ] Runs nightly at 2 AM (configurable)
  - [ ] Calls `AbsenceDetectionService->detectBolosForDay(yesterday)`
  - [ ] Updates all records: `status = Bolos`
- [ ] Create Pest test: `AbsenceDetectionTest`
  - [ ] Test: Present in all 3 phases → not Bolos
  - [ ] Test: Missing any 1 phase → marked Bolos
  - [ ] Test: Has excuse → not Bolos (when integrated)

### Week 4: Reporting & Polish
- [ ] Create `ExportService` class
  - [ ] Method: `generateWeeklyReport($startDate, $endDate, $teacherId)`
  - [ ] Uses `maatwebsite/excel`
  - [ ] Output: Student Name | Student ID | Mon-Fri status | Summary
- [ ] Create export endpoint: `POST /teacher/attendance/export`
  - [ ] Accept date range
  - [ ] Queue large exports (>1000 rows)
  - [ ] Stream/download Excel file
- [ ] Add export UI to teacher dashboard
- [ ] Stress test: Concurrent scans from 300+ students

---

## 🔵 SPRINT 3 CHECKLIST (Week 5)

- [ ] Create `DeviceSession` model + migration
- [ ] Create device session middleware
- [ ] Create `Excuse` model + migration
- [ ] Create excuse controller (store/approve)
- [ ] Update `AbsenceDetectionService` to respect excuses
- [ ] Build admin dashboards

---

## 📋 Daily Standup Template

**Each morning 10 AM:**

```
Developer 1 (Backend):
- Yesterday: [Done what?]
- Today: [Doing what?]
- Blocker: [Any issues?]

Developer 2 (Frontend):
- Yesterday: [Done what?]
- Today: [Doing what?]
- Blocker: [Any issues?]

QA Lead:
- Tested: [What?]
- Found issues: [List]
- Ready to test: [What's next?]
```

---

## 🚨 If You Get Stuck...

### "Camera permission denied"
→ Check browser permissions. On Android, grant camera. On iOS, check Settings > Safari > Camera.

### "QR doesn't decode"
→ Ensure QR is well-lit. Try different angles. Check jsQR library docs.

### "Double-insert errors"
→ Unique constraint working! This is expected. Check error handling in controller.

### "Phase column missing"
→ Run migration: `php artisan migrate`. Check schema with `php artisan tinker`.

### "Students can see other classes"
→ Implement policy authorization. Add Gate::authorize() in controller.

---

## 📊 Daily Metrics to Track

**Track these daily & report in Friday standup:**

- [ ] **Scan Success Rate**: (successful scans / total attempts) % → Target ≥98%
- [ ] **Latency (P95)**: Seconds from scan to response → Target <3 sec
- [ ] **Manual Fallback Usage**: % of sessions using manual vs QR → Target: 5% manual (emergency only)
- [ ] **Test Coverage**: % code covered by tests → Target: ≥80%
- [ ] **Bugs Found**: Count of bugs discovered daily → Target: <5 per day by Day 10
- [ ] **Performance**: Time to load daily view → Target <2 sec

---

## 🎯 End-of-Sprint Acceptance Criteria

### Sprint 1 Done When:
- [ ] Teachers can create QR codes
- [ ] Students can scan with phone camera
- [ ] Attendance recorded with phase (Morning/Class/Dismissal)
- [ ] Manual checklist works as fallback
- [ ] All Pest tests passing
- [ ] Zero authorization bypass vulnerabilities
- [ ] Responsive on mobile + desktop
- [ ] <3 sec latency for scans
- [ ] 98%+ scan success in testing
- [ ] Pilot school ready to test

---

## 🔄 Weekly Code Review Checklist

**Every Friday before merge to main:**

- [ ] Code follows Laravel best practices
- [ ] `vendor/bin/pint --dirty` passes
- [ ] Migrations are reversible
- [ ] Tests cover happy path + edge cases
- [ ] Database queries optimized (no N+1)
- [ ] No hardcoded values
- [ ] Comments explain non-obvious logic
- [ ] Error messages are user-friendly
- [ ] Logs added for debugging

---

## 📱 Testing Checklist

**Before marking feature as done:**

- [ ] Desktop browser (Chrome/Firefox/Safari)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)
- [ ] Tablet (iPad/Android tablet)
- [ ] Slow network (test with throttling)
- [ ] Offline then online (test reconnection)
- [ ] 100+ concurrent users (load test)
- [ ] Dark mode (if implemented)

---

## 🚀 Pre-Launch Checklist (Week 5)

- [ ] All tests passing locally
- [ ] Migrations tested (up & down)
- [ ] Database backups automated
- [ ] Monitoring alerts configured
- [ ] Error tracking (Sentry) enabled
- [ ] Performance dashboard live
- [ ] Support team trained
- [ ] Runbook for rollback prepared
- [ ] Teachers & students trained
- [ ] Pilot school confirmed
- [ ] Launch date scheduled

---

## 📞 Communication Channels

**Daily Issues**: Slack #attendance-sprint  
**Major Blockers**: @Product Manager  
**Urgent Bugs**: Page on-call engineer  
**Design Questions**: #design channel  
**Database Help**: Database admin  

---

**Print & Post on Team Wall**  
**Update Daily**  
**Sprint: May 7 - May 28, 2026**
