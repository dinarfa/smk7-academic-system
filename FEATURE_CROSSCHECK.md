# 🔍 Feature Cross-Check: What's Done vs. What's Needed

**Generated**: May 7, 2026  
**Status**: MVP 40% Complete → Target 100% in 5 weeks

---

## 📋 Feature Matrix (Product Plan vs. Current Code)

### **Feature 1: QR Session Generation (Pembuat Sesi)**

| Aspect | Product Plan | Current Status | Gap | Priority | Sprint |
|--------|--------------|-----------------|-----|----------|--------|
| **Backend** | Teacher creates time-bound QR (5-10 min) | ✅ Implemented in `AttendanceSessionLifecycleService` | None | — | — |
| **QR Duration** | 5-10 minute validity | ✅ Configurable via `duration_minutes` (default 30 min) | ⚠️ Default 30min should be 10min | High | Sprint 1 |
| **QR Encoding** | Session ID + phase + timestamp | ✅ `qrPayload()` encodes session token | ⚠️ No phase/timestamp in QR, only token | Medium | Sprint 1 |
| **QR SVG Rendering** | Display on teacher screen | ✅ `qrSvg()` method generates SVG | ⚠️ SVG not integrated into UI | High | Sprint 1 |
| **UI Component** | Teacher sees countdown timer | ❌ Not in codebase | High | High | Sprint 1 |
| **Auto-Regenerate** | Teacher can regenerate (old expires) | ✅ `closeActiveSessions()` handles this | ✅ Ready | — | — |
| **Validation** | Only valid for duration + auto-expire | ✅ `findActiveSessionByToken()` checks expiry | ✅ Ready | — | — |

**Status**: 70% Done | **Adjustment Needed**: Add default to 10min, build teacher UI with timer

---

### **Feature 2: QR Code Scanning (Pemindai Mandiri)**

| Aspect | Product Plan | Current Status | Gap | Priority | Sprint |
|--------|--------------|-----------------|-----|----------|--------|
| **Backend** | Student scans QR → attendance recorded | ✅ `AttendanceScanService.record()` | ✅ Ready | — | — |
| **Token Extraction** | Parse QR payload | ✅ `extractToken()` handles multiple formats | ✅ Ready | — | — |
| **Session Validation** | Verify QR is active + not expired | ✅ `findActiveSessionByToken()` | ✅ Ready | — | — |
| **Duplicate Check** | Prevent same student scanning twice | ✅ `firstOrCreate()` with unique constraint | ✅ Ready | — | — |
| **Success Response** | Show "✓ Attendance recorded" | ✅ Flash message in controller | ✅ Ready | — | — |
| **Error Handling** | Show "QR expired" / "Already scanned" | ✅ Error messages in controller | ✅ Ready | — | — |
| **Camera UI** | React component with camera access | ❌ Not in codebase | High | High | Sprint 1 |
| **QR Decoding** | JavaScript QR reader (browser) | ❌ Not in codebase | High | High | Sprint 1 |
| **Mobile Optimization** | Works on iOS + Android | ⚠️ Depends on camera UI implementation | Medium | Medium | Sprint 1 |

**Status**: 60% Done | **Adjustment Needed**: Build camera UI + QR decoder component

---

### **Feature 3: 3-Phase Recording (Pencatatan 3 Fase)**

| Aspect | Product Plan | Current Status | Gap | Priority | Sprint |
|--------|--------------|-----------------|-----|----------|--------|
| **Phase Types** | Morning / Class / Dismissal | ✅ `AttendanceQrType::Morning`, `::Subject`, `::Dismissal` | ✅ Ready | — | — |
| **Phase Selection** | Teacher chooses phase when creating QR | ✅ Form request validates type | ✅ Ready | — | — |
| **Store Phase in Record** | AttendanceRecord has phase column | ❌ Schema missing `phase` column | High | High | Sprint 1 |
| **Query by Phase** | Get attendance for specific phase | ⚠️ Can query by session type but not explicit phase | Medium | High | Sprint 1 |
| **Display Phase Breakdown** | Show Morning / Class / Dismissal separately | ❌ Not in UI | High | High | Sprint 1 |
| **3x Daily Sessions** | Support 3+ phases per student per day | ⚠️ No session constraints; could work | Medium | Low | Sprint 2 |

**Status**: 50% Done | **Adjustment Needed**: Add `phase` column to schema, update queries, build teacher daily view

---

### **Feature 4: Bolos Auto-Detection (Deteksi Bolos Otomatis)**

| Aspect | Product Plan | Current Status | Gap | Priority | Sprint |
|--------|--------------|-----------------|-----|----------|--------|
| **Logic** | If student absent any phase (no excuse) → mark Bolos | ❌ Not implemented | High | High | Sprint 2 |
| **Enum Support** | AttendanceStatus has `Bolos` value | ❌ Enum only has Present/Late/Absent | High | High | Sprint 2 |
| **Scheduled Job** | Runs nightly; processes all students | ❌ No scheduled job | High | High | Sprint 2 |
| **Accuracy** | ≥98% vs manual baseline | ⚠️ Logic TBD; needs testing | Medium | High | Sprint 2 |
| **Excuse Integration** | Don't mark Bolos if excuse approved | ❌ Excuse table not created | High | Medium | Sprint 3 |
| **Dashboard Display** | Show Bolos records highlighted | ❌ Not in UI | High | High | Sprint 2 |
| **Admin Query** | Get students marked Bolos for a day | ⚠️ Query possible once status updated | Medium | Medium | Sprint 2 |

**Status**: 10% Done | **Adjustment Needed**: Create `AbsenceDetectionService`, update enum, build scheduled job, create UI

---

### **Feature 5: Manual Fallback Checklist (Presensi Manual)**

| Aspect | Product Plan | Current Status | Gap | Priority | Sprint |
|--------|--------------|-----------------|-----|----------|--------|
| **Backend Endpoint** | POST /teacher/attendance/manual | ❌ Not created | High | High | Sprint 1 |
| **Bulk Insert** | Accept array of (student_id, status) | ❌ Not implemented | High | High | Sprint 1 |
| **Source Tracking** | Mark as `source='manual'` in DB | ❌ Schema missing `source` column | High | High | Sprint 1 |
| **Authorization** | Only teacher's own class | ❌ No policy | High | High | Sprint 1 |
| **UI Component** | Checklist with student names + toggle | ❌ Not in codebase | High | High | Sprint 1 |
| **Bulk Actions** | "Mark all present" / "Mark all absent" | ❌ Not in UI | Medium | Medium | Sprint 1 |
| **Filter by Name** | Search students | ❌ Not in UI | Low | Low | Sprint 1 |
| **Indistinguishable in Reports** | Manual records look same as QR | ⚠️ Possible once `source` column added | Medium | Low | Sprint 2 |

**Status**: 5% Done | **Adjustment Needed**: Create endpoint, UI, schema update, authorization

---

### **Feature 6: Excel Export (Unduh Laporan)**

| Aspect | Product Plan | Current Status | Gap | Priority | Sprint |
|--------|--------------|-----------------|-----|----------|--------|
| **Backend Service** | `ExportService` generates Excel | ❌ Not created | High | High | Sprint 2 |
| **Laravel Package** | `maatwebsite/excel` | ⚠️ Probably in composer but not used | Low | Low | Sprint 2 |
| **Date Range** | Support 1 week → 1 month → term | ❌ Not implemented | High | High | Sprint 2 |
| **Columns** | Student Name | Student ID | Daily status | Weekly summary | ❌ Not implemented | High | High | Sprint 2 |
| **Cell Formatting** | ✓ Present, ✗ Bolos, ※ Excused, — No Data | ❌ Not implemented | Medium | High | Sprint 2 |
| **Performance** | <10 sec for 1 week; background job for larger exports | ❌ Not implemented | High | High | Sprint 2 |
| **API Endpoint** | POST /teacher/attendance/export | ❌ Not created | High | High | Sprint 2 |
| **UI Button** | Date picker + download trigger | ❌ Not in codebase | High | High | Sprint 2 |

**Status**: 5% Done | **Adjustment Needed**: Create ExportService, endpoint, UI component

---

### **Feature 7: Double-Scan Prevention (Keamanan Akses pt.1)**

| Aspect | Product Plan | Current Status | Gap | Priority | Sprint |
|--------|--------------|-----------------|-----|----------|--------|
| **Logic** | Prevent same student scanning same QR twice | ✅ `firstOrCreate()` with unique constraint | ✅ Already works | — | — |
| **Message** | Show "You've already checked in" | ✅ Warning flash message | ✅ Already works | — | — |
| **Unique Constraint** | DB enforces (attendance_session_id, student_id) | ✅ Exists in migration | ✅ Ready | — | — |
| **Testing** | Validate on 100+ concurrent scans | ⚠️ Not stress-tested | Medium | Medium | Sprint 2 |

**Status**: 85% Done | **Adjustment Needed**: Stress test + monitoring

---

### **Feature 8: Multi-Device Security (Keamanan Akses pt.2)**

| Aspect | Product Plan | Current Status | Gap | Priority | Sprint |
|--------|--------------|-----------------|-----|----------|--------|
| **Device Session Tracking** | Store device token per user | ❌ Not implemented | High | High | Sprint 3 |
| **Invalidate Old Sessions** | When student logs in on Phone 2, Phone 1 logs out | ❌ Not implemented | High | High | Sprint 3 |
| **Device Token** | Unique per login; tracked in DB | ❌ Not implemented | High | High | Sprint 3 |
| **Middleware** | Verify device is still active | ❌ Not implemented | High | High | Sprint 3 |
| **Notification** | "Your session was ended" on old device | ❌ Not implemented | Medium | Low | Sprint 3 |

**Status**: 0% Done | **Adjustment Needed**: Create DeviceSession model, middleware, UI notifications

---

### **Feature 9: Excuse Workflow (Phase 3)**

| Aspect | Product Plan | Current Status | Gap | Priority | Sprint |
|--------|--------------|-----------------|-----|----------|--------|
| **Excuse Model** | Student submits reason + teacher approves | ❌ Not created | High | High | Sprint 3 |
| **Table Structure** | (student_id, date, reason, status, approved_by) | ❌ Not migrated | High | High | Sprint 3 |
| **Student UI** | Form to submit excuse | ❌ Not in codebase | High | High | Sprint 3 |
| **Teacher UI** | Approval interface | ❌ Not in codebase | High | High | Sprint 3 |
| **Auto-Update Bolos** | When excuse approved, remove Bolos flag | ❌ Not implemented | High | High | Sprint 3 |
| **Time Limit** | Approve/reject within 24 hr | ⚠️ UI only; no enforcement | Low | Low | Sprint 3 |

**Status**: 0% Done | **Adjustment Needed**: Create Excuse model, controllers, UI, integration with Bolos logic

---

## 🗂️ Schema Adjustments Required

### Current Schema (Works ✅)
```php
// attendace_sessions table
- id, opened_by, type, subject, qr_token, starts_at, ends_at, is_active, timestamps

// attendance_records table  
- id, attendance_session_id, student_id, status, scanned_at, timestamps
- UNIQUE: (attendance_session_id, student_id)
```

### Missing Columns (Add in Sprint 1)
```php
// attendance_records table - ADD:
- phase: enum('morning', 'class', 'dismissal') // null until migrated
- source: enum('qr_scan', 'manual') // null until migrated
- excused: boolean // default false
- class_id: foreignId (optional, for reporting)

// attendance_sessions table - ADD:
- class_id: foreignId // link to which class
```

### New Tables (Add per Sprint)

**Sprint 2** (Optional for Phase 2):
```php
// No new tables; just schema updates
```

**Sprint 3** (Required for Phase 3):
```php
// excuses table
- id, student_id, date, reason (text), status (enum), approved_by, created_at, timestamps

// device_sessions table
- id, user_id, device_token (unique), last_active_at, created_at, invalidated_at
```

---

## 🔴 Critical Gaps (Must Fix Before Sprint 1)

| Gap | Impact | Fix | Effort |
|-----|--------|-----|--------|
| **No React camera component** | Can't scan QR | Build or integrate jsQR | 5h |
| **No teacher attendance UI** | Can't view records | Build daily view component | 4h |
| **No manual checklist endpoint** | No fallback | Create POST endpoint + UI | 6h |
| **Schema missing phase column** | Can't identify which phase attended | Run migration + update model | 2h |
| **No authorization policies** | Security risk | Create AttendancePolicy | 2h |
| **Default 30min should be 10min** | Doesn't match product spec | Update `duration_minutes` default | 0.5h |

**Total Critical Fixes**: 19.5 hours ≈ **1-2 days of work**

---

## 🟡 Important Adjustments (Should Fix in Sprint 1)

| Adjustment | Reason | Fix | Effort |
|------------|--------|-----|--------|
| Update AttendanceStatus enum | Current: Present/Late/Absent; Missing: Excused/Bolos/NoData | Add 3 new values | 0.5h |
| Add `source` column to schema | Track QR vs manual entries | Migration + model | 1h |
| Add `excused` boolean to schema | Support excuse flag | Migration + model | 0.5h |
| Create AttendancePolicy | Authorize teacher access | New file | 2h |
| Add class_id to sessions | Link attendance to class | Optional; can defer | 1h |

**Total Adjustments**: 5 hours ≈ **½ day of work**

---

## ✅ What's Ready (No Changes Needed)

- ✅ AttendanceSession model + QR generation
- ✅ AttendanceRecord model + basic recording
- ✅ Session lifecycle (open/close/expiry)
- ✅ Double-scan prevention (unique constraint)
- ✅ Error handling + flash messages
- ✅ 3-phase enum (Morning/Subject/Dismissal)
- ✅ Student attendance history page

---

## 📊 Sprint 1 Priorities (First 2 Weeks)

### High Priority (Block Sprint 2)
1. Add `phase`, `source`, `excused` to schema
2. Build camera QR scanner component
3. Build teacher daily attendance view
4. Create manual checklist endpoint + UI
5. Create AttendancePolicy
6. Update AttendanceStatus enum

### Medium Priority (Nice to Have)
7. Add countdown timer to QR display
8. Build comprehensive Pest tests
9. Performance benchmark (concurrent scans)

### Low Priority (Defer to Sprint 2)
10. Add class_id foreign key
11. Advanced filtering/search in views

---

## 🎯 End-to-End Feature Readiness

| Feature | Now | After Sprint 1 | After Sprint 2 | After Sprint 3 | MVP Complete |
|---------|-----|----------------|----------------|----------------|--------------|
| QR Generation | 80% | 95% | 95% | 95% | ✅ |
| QR Scanning | 60% | 95% | 95% | 95% | ✅ |
| 3-Phase Tracking | 50% | 95% | 95% | 95% | ✅ |
| Manual Fallback | 5% | 95% | 95% | 95% | ✅ |
| Bolos Detection | 10% | 10% | 95% | 95% | ✅ |
| Excel Export | 5% | 5% | 95% | 95% | ✅ |
| Double-Scan Prevention | 85% | 95% | 98% | 98% | ✅ |
| Multi-Device Security | 0% | 0% | 0% | 95% | ⏸️ Phase 3 |
| Excuse Workflow | 0% | 0% | 0% | 95% | ⏸️ Phase 3 |
| **Overall MVP** | **40%** | **75%** | **95%** | **100%** | ✅ |

---

## 🚀 Next Action Items

### Before Sprint Kickoff
- [ ] Review & approve sprint plan
- [ ] Assign backend/frontend/QA owners
- [ ] Schedule design review (1 hr)
- [ ] Identify pilot school (1 school, 300+ students)
- [ ] Create Jira epics + stories

### Sprint 1 Week 1
- [ ] Run schema migrations (phase, source, excused columns)
- [ ] Create AttendancePolicy
- [ ] Update AttendanceStatus enum
- [ ] Start AbsenceDetectionService (early)

### Sprint 1 Week 2  
- [ ] Build camera scanner component
- [ ] Build manual checklist component
- [ ] Build daily attendance view
- [ ] Integrate with teacher dashboard
- [ ] Run Pest tests

---

**Document Owner**: Product Manager  
**Last Updated**: May 7, 2026  
**Next Review**: Kickoff meeting (before Sprint 1 start)
