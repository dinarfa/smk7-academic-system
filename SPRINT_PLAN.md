# 📋 QR Attendance System - Sprint Plan (Revised)

**Project Status**: MVP 40% Complete  
**Last Updated**: May 7, 2026  
**Target Go-Live**: 4-5 weeks

---

## 🔍 Current Status Assessment

### ✅ Already Implemented (MVP Foundation)

| Component | Status | Details |
|-----------|--------|---------|
| **Database Models** | ✅ Done | `AttendanceSession`, `AttendanceRecord` models created |
| **Migrations** | ✅ Done | Tables with schema for sessions & records |
| **QR Generation** | ✅ Done | `AttendanceSession.qrSvg()` generates SVG QR codes |
| **QR Scanning** | ✅ Done | Token extraction & session validation working |
| **Session Lifecycle** | ✅ Done | Open/close sessions with auto-expiry |
| **3-Phase Type** | ✅ Done | Enum: `Morning`, `Subject`, `Dismissal` |
| **Controllers** | ✅ Done | `AttendanceSessionController`, `StudentAttendanceController` |
| **Services** | ✅ Done | `AttendanceScanService`, `AttendanceSessionLifecycleService` |
| **Routes** | ✅ Done | POST/PATCH teacher routes; GET/POST student routes |
| **Student Attendance History UI** | ✅ Done | React page showing scan records |
| **Form Requests** | ✅ Done | Validation for session creation & QR scanning |

**Estimated Effort Saved**: 40% of MVP

---

### ❌ Missing / Incomplete Features

| Feature | Required For | Status | Effort | Sprint |
|---------|-------------|--------|--------|--------|
| **1. Manual Attendance Checklist** | MVP | ❌ Not Started | M | Sprint 1 |
| **2. Daily Attendance View (Teacher)** | MVP | ❌ Not Started | M | Sprint 1 |
| **3. Bolos Auto-Detection Service** | Phase 2 | ❌ Not Started | M | Sprint 2 |
| **4. Excel Report Export** | Phase 2 | ❌ Not Started | M | Sprint 2 |
| **5. Double-Scan Prevention** | Phase 2 | ❌ Not Started | S | Sprint 2 |
| **6. Device Session Management** | Phase 3 | ❌ Not Started | M | Sprint 3 |
| **7. Excuse Workflow (Model/Controller)** | Phase 3 | ❌ Not Started | M | Sprint 3 |
| **8. Authorization Policies** | MVP | ❌ Not Started | S | Sprint 1 |
| **9. Pest Tests** | MVP | ❌ Not Started | M | Sprint 1 |
| **10. QR Scanner UI (Camera)** | MVP | ⚠️ Partial | M | Sprint 1 |
| **11. Teacher Dashboard Integration** | MVP | ❌ Not Started | M | Sprint 1 |

---

### ⚠️ Required Schema Adjustments

The current database needs adjustments before Phase 2/3 features:

```php
// AttendanceRecord table - ADD columns
- phase: enum('morning', 'class', 'dismissal') // Track which phase
- source: enum('qr_scan', 'manual') // Track entry method
- excused: boolean // For excused absences

// AttendanceSession table - ADD columns  
- class_id: foreignId // Link to specific class

// ADD new tables
- Excuse table (Phase 3)
- DeviceSession table (Phase 3)

// Enum adjustments
- AttendanceStatus: ADD 'Excused', 'Bolos', 'NoData' values
```

---

## 📅 Revised Sprint Plan

### **Sprint 1: MVP Core Features (2 weeks)**
**Goal**: Complete student QR scanning + teacher manual fallback + daily view

#### Sprint 1 Tasks

**Week 1: Backend Foundation**

| Task | Owner | Est. | Status | Notes |
|------|-------|------|--------|-------|
| **1.1** Extend AttendanceRecord schema (add phase, source, excused) | Backend | 3h | TODO | Migration + model update |
| **1.2** Create Attendance Policy (authorization) | Backend | 2h | TODO | Control teacher access to their class attendance |
| **1.3** Add manual attendance checklist endpoint | Backend | 4h | TODO | POST /teacher/attendance/manual - bulk insert |
| **1.4** Create DailyAttendanceView service | Backend | 3h | TODO | Query attendance by date + phase |
| **1.5** Add tests for attendance services | QA | 4h | TODO | Pest tests for scan, manual, policy |

**Week 2: Frontend + Integration**

| Task | Owner | Est. | Status | Notes |
|------|-------|------|--------|-------|
| **2.1** Create Teacher Dashboard Attendance Tab | Frontend | 4h | TODO | Show active session + QR display |
| **2.2** Build Manual Checklist Component | Frontend | 4h | TODO | React form with student list + toggle |
| **2.3** QR Scanner Component (Camera) | Frontend | 5h | TODO | Use jsQR or Quagga for camera scanning |
| **2.4** Daily Attendance View Component | Frontend | 3h | TODO | Show Morning/Class/Dismissal grid |
| **2.5** Wayfinder route generation | DevOps | 1h | TODO | Generate typed functions for new endpoints |

**Sprint 1 Output:**
- ✅ Teachers can generate QR → students scan → attendance recorded  
- ✅ Teachers have manual fallback checklist  
- ✅ Daily attendance visible to teachers  
- ✅ Fully tested MVP core

**Success Metrics:**
- Zero test failures
- 98%+ scan success rate
- <3 sec scan-to-record latency
- UI responsive on mobile + desktop

---

### **Sprint 2: Automation & Reporting (2 weeks)**
**Goal**: Auto-detect absences, prevent fraud, enable exports

#### Sprint 2 Tasks

**Week 3: Absence Detection & Double-Scan Prevention**

| Task | Owner | Est. | Status | Notes |
|------|-------|------|--------|-------|
| **3.1** Migrate AttendanceStatus enum (add Excused, Bolos, NoData) | Backend | 2h | TODO | Update enum + migrate existing records |
| **3.2** Create AbsenceDetectionService | Backend | 4h | TODO | Logic: if missing any phase → Bolos (unless excused) |
| **3.3** Add DetectAbsencesJob (scheduled) | Backend | 3h | TODO | Runs nightly; updates Bolos status |
| **3.4** Double-scan prevention logic | Backend | 2h | TODO | Check (student_id, session_id) uniqueness |
| **3.5** Bolos dashboard endpoint | Backend | 2h | TODO | GET /teacher/attendance/bolos-summary |

**Week 4: Excel Export + Final Phase 2 Integration**

| Task | Owner | Est. | Status | Notes |
|------|-------|------|--------|-------|
| **4.1** Create ExportService (Excel generation) | Backend | 4h | TODO | Use maatwebsite/excel |
| **4.2** Export API endpoint | Backend | 2h | TODO | POST /teacher/attendance/export |
| **4.3** Export UI Component | Frontend | 3h | TODO | Date range picker + download button |
| **4.4** Test Bolos detection accuracy | QA | 3h | TODO | Validate logic vs manual baseline |
| **4.5** Stress test: 300+ students, concurrent scans | DevOps | 2h | TODO | Load testing |

**Sprint 2 Output:**
- ✅ Bolos auto-detected for incomplete attendance  
- ✅ Double-scan prevention active  
- ✅ Excel exports working  
- ✅ Admin can view absence trends

**Success Metrics:**
- Bolos detection ≥98% accuracy
- Export <10 sec for 1-week data
- <1% double-scans recorded
- Zero data loss during concurrent scans

---

### **Sprint 3: Security & Excuse Workflow (2 weeks)**
**Goal**: Multi-device protection + excuse handling

#### Sprint 3 Tasks

**Week 5: Device Session & Schema**

| Task | Owner | Est. | Status | Notes |
|------|-------|------|--------|-------|
| **5.1** Create DeviceSession migration & model | Backend | 3h | TODO | Track device_token + last_active_at per user |
| **5.2** Create Excuse migration & model | Backend | 2h | TODO | Store excuse requests + approval status |
| **5.3** Implement device session middleware | Backend | 3h | TODO | Invalidate old sessions on login |
| **5.4** Update User model with relations | Backend | 2h | TODO | Add deviceSessions() + excuses() |

**Week 6: Excuse Workflow + Dashboard**

| Task | Owner | Est. | Status | Notes |
|------|-------|------|--------|-------|
| **6.1** Create ExcuseController (store/approve) | Backend | 3h | TODO | Students request; teachers approve |
| **6.2** Update AbsenceDetectionService (respect excuses) | Backend | 2h | TODO | Don't mark Bolos if excuse approved |
| **6.3** Admin Absence Trends Dashboard | Frontend | 4h | TODO | Charts + alerts for chronic absentees |
| **6.4** Excuse request/approval UI | Frontend | 3h | TODO | Student submit + teacher review pages |
| **6.5** Security tests (device, account sharing) | QA | 2h | TODO | Pest tests for multi-device scenarios |

**Sprint 3 Output:**
- ✅ One student = one active device at a time  
- ✅ Excuse workflow functional end-to-end  
- ✅ Admin dashboards with trends  
- ✅ Data trust hardened against fraud

**Success Metrics:**
- Zero successful multi-device logins
- <24 hr excuse approval/rejection time
- 95%+ adoption among teachers
- Zero support tickets on device sharing

---

## 🗂️ File Structure (To Be Created)

```
app/
├── Services/Attendance/
│   ├── AttendanceScanService.php ✅ EXISTS
│   ├── AttendanceSessionLifecycleService.php ✅ EXISTS
│   ├── AttendanceReportService.php ⚠️ EXISTS (check status)
│   ├── AbsenceDetectionService.php 🆕 SPRINT 2
│   ├── ExportService.php 🆕 SPRINT 2
│   └── DailyAttendanceViewService.php 🆕 SPRINT 1
│
├── Http/Controllers/
│   ├── Teacher/
│   │   ├── AttendanceSessionController.php ✅ EXISTS
│   │   ├── AttendanceViewController.php 🆕 SPRINT 1
│   │   └── AttendanceExportController.php 🆕 SPRINT 2
│   ├── Student/
│   │   └── AttendanceController.php ✅ EXISTS
│   └── Admin/
│       └── AttendanceDashboardController.php 🆕 SPRINT 3
│
├── Jobs/
│   └── DetectAbsencesJob.php 🆕 SPRINT 2
│
├── Models/
│   ├── AttendanceSession.php ✅ EXISTS
│   ├── AttendanceRecord.php ✅ EXISTS (needs schema updates)
│   ├── Excuse.php 🆕 SPRINT 3
│   └── DeviceSession.php 🆕 SPRINT 3
│
├── Policies/
│   └── AttendancePolicy.php 🆕 SPRINT 1
│
└── Http/Requests/
    ├── Teacher/
    │   ├── OpenAttendanceSessionRequest.php ✅ EXISTS
    │   └── ManualAttendanceRequest.php 🆕 SPRINT 1
    └── Student/
        └── ScanAttendanceRequest.php ✅ EXISTS

resources/js/pages/
├── student/
│   └── attendance.tsx ✅ EXISTS (student history view)
│
└── teacher/
    ├── attendance/
    │   ├── index.tsx 🆕 SPRINT 1 (daily view)
    │   ├── manual-checklist.tsx 🆕 SPRINT 1
    │   ├── export.tsx 🆕 SPRINT 2
    │   ├── scanner.tsx 🆕 SPRINT 1 (QR camera)
    │   └── bolos-summary.tsx 🆕 SPRINT 2
    │
    └── admin/
        ├── attendance-dashboard.tsx 🆕 SPRINT 3
        └── excuse-approvals.tsx 🆕 SPRINT 3

database/migrations/
├── 2026_04_25_113733_create_attendance_sessions_table.php ✅ EXISTS
├── 2026_04_25_113734_create_attendance_records_table.php ✅ EXISTS (needs UPDATE)
├── 2026_05_XX_XXXXXX_add_phase_source_to_attendance_records.php 🆕 SPRINT 1
├── 2026_05_XX_XXXXXX_create_excuses_table.php 🆕 SPRINT 3
└── 2026_05_XX_XXXXXX_create_device_sessions_table.php 🆕 SPRINT 3

tests/
└── Feature/
    ├── Attendance/AttendanceScanTest.php ✅ EXISTS
    ├── Attendance/ManualAttendanceTest.php 🆕 SPRINT 1
    ├── Attendance/AbsenceDetectionTest.php 🆕 SPRINT 2
    ├── Attendance/ExcuseWorkflowTest.php 🆕 SPRINT 3
    └── Attendance/DeviceSessionTest.php 🆕 SPRINT 3
```

---

## 🔧 Technical Checklist

### Schema Migrations Needed

- [ ] **Sprint 1**: Add `phase`, `source`, `excused` to `attendance_records`
- [ ] **Sprint 2**: Update `AttendanceStatus` enum (add `Excused`, `Bolos`, `NoData`)
- [ ] **Sprint 3**: Create `excuses` table
- [ ] **Sprint 3**: Create `device_sessions` table
- [ ] **All Sprints**: Add indexes for query performance

### Configuration Changes

- [ ] Set up scheduled job for `DetectAbsencesJob` (runs nightly)
- [ ] Add `Excel` package to composer.json (if not present)
- [ ] Configure camera permissions in frontend (manifest, privacy policy)

### Dependencies to Add (if missing)

```bash
# Backend
composer require maatwebsite/excel

# Frontend
npm install jsqr      # or use @zxing/library for QR decoding
npm install html2canvas  # For PDF export (optional)
```

### Wayfinder Routes (To Generate)

```typescript
// New typed routes to generate via Wayfinder
- teacherAttendanceView()
- teacherAttendanceManual()
- teacherAttendanceExport()
- adminAttendanceDashboard()
- createExcuse()
- approveExcuse()
```

---

## 📊 Velocity & Timeline

| Sprint | Duration | Features | Estimated Effort | Risk Level |
|--------|----------|----------|------------------|-----------|
| **Sprint 1** | 2 weeks | Core MVP + manual fallback + tests | 35 story points | 🟡 Medium |
| **Sprint 2** | 2 weeks | Absence detection + export + security | 30 story points | 🟡 Medium |
| **Sprint 3** | 1 week | Device sessions + excuses | 25 story points | 🟢 Low |
| **Buffer/QA** | 1 week | Final testing + bug fixes | — | — |

**Total: 4-5 weeks to production-ready MVP**

---

## ⚠️ Known Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| QR camera fails on old Android phones | Medium | High | Provide manual fallback in Sprint 1; test on 5+ devices |
| Double-scan logic has false negatives | Low | Medium | Unit tests on Sprint 2; QA validation |
| Bolos detection marks excused as absent | Medium | High | Test against 10-day manual baseline before go-live |
| Scheduled job (DetectAbsencesJob) never runs | Low | Medium | Add monitoring alerts; test in staging |
| Teachers don't use manual checklist | Low | High | Marketing: emphasize time savings; pilot feedback weekly |

---

## ✅ Definition of Done (Per Sprint)

- [ ] All code peer-reviewed
- [ ] Unit tests ≥80% coverage
- [ ] Feature tests passing (E2E scenarios)
- [ ] Wayfinder routes generated & typed
- [ ] Laravel Pint formatting applied
- [ ] No console errors in browser
- [ ] Migrations reversible (down/up tested)
- [ ] Documentation updated in-code
- [ ] Stakeholder approval (Product Manager)

---

## 📍 Milestones

- **Milestone 1** (End Sprint 1): MVP ready for internal pilot (1 school)
- **Milestone 2** (End Sprint 2): Fraud prevention + reporting live
- **Milestone 3** (End Sprint 3): Production-ready; GA release planned

---

## 🎯 Go-Live Readiness Checklist

**1 Week Before Launch:**
- [ ] All sprints completed + tested
- [ ] Backup/rollback plan documented
- [ ] Teacher + student training videos recorded
- [ ] Support runbook prepared
- [ ] Telemetry dashboard live
- [ ] Performance benchmarked (P95 <3 sec scan latency)

**Day Of Launch:**
- [ ] Database backups taken
- [ ] Monitoring alerts active
- [ ] Support team on standby
- [ ] Admin dashboard monitored for errors
- [ ] Usage metrics tracked in real-time

---

## 📞 Next Steps

1. **Today**: Approve sprint plan + assign owners
2. **This Week**: Set up tickets in Jira + schedule kickoff
3. **Week 1**: Begin Sprint 1 backend tasks (schema, services)
4. **Week 2**: Begin Sprint 1 frontend tasks (UI components)
5. **Pilot Launch (Week 5)**: Deploy to internal test school

---

**Document Owner**: Product Manager  
**Engineering Lead**: [Assign]  
**Frontend Lead**: [Assign]  
**QA Lead**: [Assign]  
**Last Review**: [Date]
