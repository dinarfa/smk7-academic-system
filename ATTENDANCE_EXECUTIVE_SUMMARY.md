# 🎯 MVP Attendance System - Executive Summary

**Current State**: 40% Complete (Solid Foundation)  
**Target**: Production-Ready in 4-5 weeks  
**Team Size**: 2-3 developers (1 backend, 1 frontend, 1 QA)

---

## 📊 What's Already Done (No Work Needed)

✅ **Backend Core (100%)**
- Database models: `AttendanceSession`, `AttendanceRecord`
- QR generation via `AttendanceSession.qrSvg()`
- Session lifecycle (open/close/expiry)
- Token extraction & validation
- Double-scan prevention (unique constraint)
- Error handling + status tracking

✅ **Routes & Controllers (100%)**
- `POST /teacher/attendance-sessions` (create QR)
- `PATCH /teacher/attendance-sessions/{id}/close` (close QR)
- `POST /student/attendance/scan` (scan QR)
- `GET /student/attendance` (view history)

✅ **Services (100%)**
- `AttendanceScanService` - QR validation
- `AttendanceSessionLifecycleService` - Session management

✅ **Student Frontend (100%)**
- Student attendance history page with scan records

---

## 🔴 Critical Missing Pieces (Do First)

### **1. Teacher Attendance UI** ⚠️ BLOCKING

**What's Needed:**
- [ ] Daily attendance view showing Morning/Class/Dismissal phases
- [ ] QR display with countdown timer
- [ ] Manual checklist fallback
- [ ] Status: 0% done (needs 8-10 hours)

**Why it matters**: Teachers need a UI to see & manage attendance

---

### **2. Camera QR Scanner Component** ⚠️ BLOCKING

**What's Needed:**
- [ ] React camera component with QR reader (jsQR library)
- [ ] Decode QR on student's phone
- [ ] Send token to backend
- [ ] Status: 0% done (needs 5-6 hours)

**Why it matters**: Students need phone camera to scan; manual entry won't work

---

### **3. Schema Adjustments** ⚠️ BLOCKING

**What's Needed:**
- [ ] Add `phase` column to `attendance_records` (track Morning/Class/Dismissal)
- [ ] Add `source` column (track 'qr_scan' vs 'manual')
- [ ] Add `excused` boolean (for later excuse workflow)
- [ ] Update `AttendanceStatus` enum to include Bolos/Excused/NoData
- [ ] Status: 0% done (needs 2-3 hours)

**Why it matters**: Can't track attendance accurately without these columns

---

### **4. Manual Checklist Endpoint** ⚠️ BLOCKING

**What's Needed:**
- [ ] `POST /teacher/attendance/manual` endpoint
- [ ] Accept student array + mark present/absent/excused
- [ ] Bulk insert into `attendance_records` with `source='manual'`
- [ ] Status: 0% done (needs 4-5 hours)

**Why it matters**: Teachers need fallback when QR fails or tech unavailable

---

### **5. Authorization Policy** ⚠️ SECURITY

**What's Needed:**
- [ ] `AttendancePolicy` to verify teacher owns class
- [ ] Prevent cross-class attendance viewing
- [ ] Status: 0% done (needs 2 hours)

**Why it matters**: Security - teachers shouldn't see other classes' attendance

---

## 📅 Sprint 1 (First 2 Weeks) - What to Build

### **Week 1 Backend** (15 hours)
1. **Schema Migration** (2h)
   - Add `phase`, `source`, `excused` to `attendance_records`
   - Update enum to include Bolos/Excused/NoData

2. **Authorization** (2h)
   - Create `AttendancePolicy`
   - Verify teacher access

3. **Services** (4h)
   - Create `DailyAttendanceViewService` - query attendance by date + phase
   - Extend `AttendanceScanService` with phase tracking

4. **Manual Attendance Endpoint** (4h)
   - Create `POST /teacher/attendance/manual` endpoint
   - Bulk insert logic
   - Form request validation

5. **Tests** (3h)
   - Pest tests for manual endpoint
   - Pest tests for authorization

### **Week 2 Frontend** (15 hours)
1. **Camera Scanner Component** (6h)
   - React component with camera access
   - jsQR library integration
   - QR decode + send to backend

2. **Daily Attendance View** (5h)
   - Show 3 phases (Morning/Class/Dismissal)
   - Student list with status
   - Real-time updates

3. **Manual Checklist Component** (3h)
   - Checkbox list of students
   - Bulk actions (mark all present/absent)
   - Submit form

4. **QR Display Component** (2h)
   - Render QR SVG
   - Countdown timer (10 minutes)
   - "Generate New QR" button

### **Week 2 Integration** (5 hours)
1. Wayfinder routes generation
2. Browser testing (iOS/Android)
3. Responsive design fixes
4. Performance check

---

## ✅ Success Criteria for Sprint 1

- [ ] Teachers can create QR codes and see them on screen
- [ ] Students can scan QR with phone camera
- [ ] Teachers can manually mark attendance as fallback
- [ ] Attendance recorded with phase (Morning/Class/Dismissal)
- [ ] <3 sec latency from scan to record
- [ ] Zero console errors on mobile
- [ ] All Pest tests passing
- [ ] 98%+ scan success rate in testing

---

## 📊 Effort Breakdown

```
Sprint 1 (Weeks 1-2):
├─ Backend: 19h (schema + services + manual endpoint + tests)
├─ Frontend: 16h (camera + UI components + integration)
└─ Total: 35h = 1.75 weeks per 1 dev (or 9 days with 2 devs)

Sprint 2 (Weeks 3-4):
├─ Absence Detection Service: 4h
├─ Excel Export: 5h
├─ Bolos Dashboard: 3h
└─ Total: 12h = 3 days of work

Sprint 3 (Week 5):
├─ Device Sessions: 5h
├─ Excuse Workflow: 5h
└─ Total: 10h = 2-3 days of work

TOTAL MVP: ~60 hours = 3-4 weeks (1-2 developers)
```

---

## 🚀 First 24 Hours (To Get Started)

**Developer 1 (Backend):**
```bash
# 1. Create & run schema migration
php artisan make:migration add_phase_source_excused_to_attendance_records
# Add columns: phase, source (with default), excused

# 2. Update AttendanceStatus enum
# Add: Excused, Bolos, NoData

# 3. Create authorization policy
php artisan make:policy AttendancePolicy --model=AttendanceSession

# 4. Start manual endpoint skeleton
php artisan make:controller Teacher/AttendanceManualController
php artisan make:request Teacher/ManualAttendanceRequest
```

**Developer 2 (Frontend):**
```bash
# 1. Install camera library
npm install jsqr

# 2. Create scanner component skeleton
# resources/js/components/QRScanner.tsx

# 3. Create daily view skeleton
# resources/js/pages/teacher/attendance/index.tsx

# 4. Check AttendanceSession.qrSvg() integration
# See how to display SVG in React
```

---

## ⚠️ Key Assumptions & Risks

| Assumption | Risk | Mitigation |
|-----------|------|-----------|
| QR cameras work on student phones | Medium | Test with 5+ devices; manual fallback |
| Duration defaults to 10 min (not 30 min) | Low | Update config immediately |
| Teachers will adopt checklist UI | Medium | User feedback in week 1; iterate |
| Pest tests cover 80% of cases | Low | Start early; write tests first |
| No major DB connection issues at scale | Low | Load test with 300+ concurrent students |

---

## 📞 Communication Plan

### Team Standup (Daily)
- What did you finish yesterday?
- What will you finish today?
- Any blockers?

### Weekly Review (Friday 5 PM)
- Demo working features
- Measure against success criteria
- Adjust next sprint if needed

### Stakeholder Update (Weekly)
- Progress vs. plan
- Any red flags
- Timeline on track?

---

## 🎯 Decision Points (Before Sprint Start)

**Question 1**: Who's building the camera component?
- Option A: React dev builds custom (5-6h)
- Option B: Use npm package (3-4h, but less control)
- **Recommend**: Option B (faster)

**Question 2**: Target iOS or Android first?
- Option A: iOS first (1-2 days extra work)
- Option B: Android first (easier)
- Option C: Both simultaneously (risky)
- **Recommend**: Android first, iOS follows in Sprint 2

**Question 3**: Manual endpoint bulk or single-submit?
- Option A: Submit all students at once (simpler)
- Option B: Real-time sync per student (more UX-friendly)
- **Recommend**: Option A for Sprint 1, optimize in Sprint 2

---

## 📋 Deliverables Per Sprint

### Sprint 1 Deliverables (End of Week 2)
- [ ] Schema migrations applied
- [ ] Teacher daily attendance view (working UI)
- [ ] Manual checklist endpoint + UI
- [ ] Camera scanner component (basic working)
- [ ] Authorization policy implemented
- [ ] Pest tests (>80% coverage)
- [ ] Internal pilot ready (1 school test)

### Sprint 2 Deliverables (End of Week 4)
- [ ] Bolos auto-detection (nightly job)
- [ ] Excel export functionality
- [ ] Double-scan testing + monitoring
- [ ] Pilot feedback incorporated

### Sprint 3 Deliverables (End of Week 5)
- [ ] Device session management
- [ ] Excuse workflow (student request → teacher approval)
- [ ] Admin dashboards
- [ ] Production ready

---

## 💻 Tech Stack Checklist

**Backend (Laravel 13)** ✅
- [x] Models + migrations
- [x] Services
- [x] Controllers
- [ ] Policies (TODO Sprint 1)
- [ ] Jobs (TODO Sprint 2)
- [ ] Tests (TODO Sprint 1)

**Frontend (React + Inertia v3)** 
- [ ] Camera component (TODO Sprint 1)
- [ ] QR display (TODO Sprint 1)
- [ ] Daily view (TODO Sprint 1)
- [ ] Manual checklist (TODO Sprint 1)
- [ ] Export UI (TODO Sprint 2)

**Libraries to Add**
```bash
# If not already installed
composer require maatwebsite/excel  # For Phase 2 export
npm install jsqr                    # For camera QR reading
```

---

## 🎓 Key Learning Points

1. **Unique Constraint Prevents Double-Scan**: Database-level protection is working; no app-level changes needed
2. **3-Phase Model is Solid**: AttendanceQrType enum matches requirements
3. **Phase Column Missing**: Must add to schema before other features
4. **Authorization Needed**: Current code doesn't restrict by class
5. **QR Token Format**: Uses ULID (good for uniqueness & ordering)

---

## 📞 Questions for Product Manager

1. **Duration**: Should new sessions default to 10 min or 30 min?
2. **Phase Naming**: "Subject" vs. "Class"? (Currently `Subject` enum)
3. **Manual Fallback**: Who can use it? (Only teacher or admin too?)
4. **Excuse Workflow**: In Phase 3 or bring forward to Phase 2?
5. **Pilot School**: Which school? When do they start?

---

## ✨ Quick Wins (High Value, Low Effort)

These should be done in first 48 hours:

1. **Change default duration from 30 min → 10 min** (0.5h)
2. **Add `phase`, `source`, `excused` schema** (2h)
3. **Create AttendancePolicy** (2h)
4. **Update AttendanceStatus enum** (0.5h)
5. **Install jsQR npm package** (0.5h)

**Total**: 5.5 hours → Ready for Week 1 sprint

---

## 🔗 Related Documents

- `SPRINT_PLAN.md` - Detailed 3-sprint roadmap
- `FEATURE_CROSSCHECK.md` - Feature-by-feature status
- `QUESTION_BANK_IMPLEMENTATION.md` - Exam system (reference for patterns)

---

**Owner**: Product Manager  
**Created**: May 7, 2026  
**Status**: Ready for Sprint Kickoff  
**Next Action**: Team meeting to assign owners + start Week 1 tasks
