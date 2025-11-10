# 🎯 LCGAP System Flow & Architecture Diagrams

Visual representations of how the LCGAP system works.

---

## 🔄 User Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        SIGNUP PROCESS                            │
└─────────────────────────────────────────────────────────────────┘

    User visits /signup
           ↓
    Fills signup form
    (name, email, password, role)
           ↓
    Submits form
           ↓
    ┌────────────────────┐
    │ Firebase Auth      │
    │ createUser()       │
    └────────────────────┘
           ↓
    ┌────────────────────┐
    │ Firestore          │
    │ Create user profile│
    │ in users/{uid}     │
    └────────────────────┘
           ↓
    ┌────────────────────┐
    │ Send verification  │
    │ email              │
    └────────────────────┘
           ↓
    Redirect to /verify-email
           ↓
    User clicks link in email
           ↓
    Email verified = true
           ↓
    User can login
           ↓
    ┌────────────────────┐
    │ Check role:        │
    │ - student          │
    │ - institute        │
    │ - company          │
    │ - admin            │
    └────────────────────┘
           ↓
    Redirect to role dashboard
```

---

## 📝 Application Submission Flow (Max 2 per Institution)

```
┌─────────────────────────────────────────────────────────────────┐
│                   STUDENT APPLIES TO COURSE                      │
└─────────────────────────────────────────────────────────────────┘

    Student browses institutions
           ↓
    Selects institution → faculty → course
           ↓
    Clicks "Apply"
           ↓
    ┌────────────────────────────────────────┐
    │ CLIENT-SIDE CHECK                      │
    │ Query: applicationsByInstitution/{id}  │
    │ Current count: 0, 1, or 2              │
    └────────────────────────────────────────┘
           ↓
    IF count >= 2
    │   ↓
    │   Show error: "Max 2 applications"
    │   ↓
    │   STOP ❌
    │
    ELSE (count < 2)
           ↓
    Show application form
    (motivation, previous education, etc.)
           ↓
    Student submits form
           ↓
    ┌────────────────────────────────────────┐
    │ BATCHED WRITE (Atomic)                 │
    │                                        │
    │ 1. Create application document         │
    │    ID: {instId}_{studentId}_{courseId} │
    │    Path: applications/{id}             │
    │                                        │
    │ 2. Update tracking document            │
    │    Path: users/{uid}/                  │
    │          applicationsByInstitution/    │
    │          {instId}                      │
    │    Push courseId to array              │
    └────────────────────────────────────────┘
           ↓
    ┌────────────────────────────────────────┐
    │ FIRESTORE RULES VALIDATION             │
    │                                        │
    │ ✓ Email verified?                      │
    │ ✓ User owns application?               │
    │ ✓ ID matches pattern?                  │
    │ ✓ courseIds array size <= 2?           │
    └────────────────────────────────────────┘
           ↓
    IF all checks pass ✅
    │   ↓
    │   Write succeeds
    │   ↓
    │   Redirect to success page
    │
    ELSE ❌
    │   ↓
    │   Write fails with permission denied
    │   ↓
    │   Show error to user
```

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER DEVICES                             │
│  (Browser: Chrome, Firefox, Safari, Edge)                        │
└─────────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────────┐
│                      FIREBASE HOSTING                            │
│  Static React App (HTML, CSS, JS)                               │
│  CDN distributed globally                                        │
└─────────────────────────────────────────────────────────────────┘
                           ↕
        ┌──────────────────┴──────────────────┐
        │                                     │
        ↓                                     ↓
┌────────────────────┐            ┌────────────────────┐
│ FIREBASE AUTH      │            │ CLOUD FIRESTORE    │
│                    │            │                    │
│ • Email/Password   │            │ Collections:       │
│ • Email verify     │            │ • users            │
│ • Custom claims    │            │ • institutions     │
│ • Session mgmt     │            │ • applications     │
└────────────────────┘            │ • companies        │
                                  │ • jobs             │
                                  │ • jobApplications  │
                                  │                    │
                                  │ Security Rules ✓   │
                                  └────────────────────┘
                                           ↕
                                  ┌────────────────────┐
                                  │ CLOUD STORAGE      │
                                  │                    │
                                  │ • Student docs     │
                                  │ • Transcripts      │
                                  │ • Certificates     │
                                  │ • Profile pics     │
                                  │                    │
                                  │ Storage Rules ✓    │
                                  └────────────────────┘
```

---

## 👥 User Role Hierarchy

```
                    ┌─────────────┐
                    │   ADMIN     │
                    │ (Full Access)│
                    └─────────────┘
                          ↓
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   ┌────────┐       ┌──────────┐     ┌──────────┐
   │INSTITUTE│       │ STUDENT  │     │ COMPANY  │
   └────────┘       └──────────┘     └──────────┘

ADMIN:
  ✓ Create/edit institutions
  ✓ Create/edit companies
  ✓ View all users
  ✓ View all applications
  ✓ System statistics

INSTITUTE:
  ✓ Manage faculties/courses
  ✓ View applications
  ✓ Admit/reject/waitlist
  ✓ Institution statistics

STUDENT:
  ✓ Browse institutions
  ✓ Apply to courses (max 2/inst)
  ✓ View application status
  ✓ Apply to jobs
  ✓ Upload documents

COMPANY:
  ✓ Post job openings
  ✓ View job applications
  ✓ Manage applicants
  ✓ Company statistics
```

---

## 📊 Data Relationships

```
                    users/{uid}
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ↓               ↓               ↓
  role: student   role: institute  role: company
        │               │               │
        │               │               │
        ↓               ↓               ↓
    applications   institutions      companies
        │               │               │
        │               ├─faculties     │
        │               │   └─courses   │
        │               │               │
        └───────────────┴───────────────┴──────→ jobs
                                                   │
                                                   ↓
                                            jobApplications


DETAILED RELATIONSHIPS:

users/{uid}/
└─ applicationsByInstitution/{instId}
   └─ courseIds: [course1, course2]  ← Tracks count

applications/{instId_studentId_courseId}
├─ studentId → users/{uid}
├─ institutionId → institutions/{instId}
└─ courseId → institutions/{instId}/faculties/{fId}/courses/{cId}

jobApplications/{jobId_studentId}
├─ studentId → users/{uid}
└─ jobId → jobs/{jobId}
    └─ companyId → companies/{companyId}
```

---

## 🔒 Security Rule Logic Flow

```
┌─────────────────────────────────────────────────────────────────┐
│               FIRESTORE WRITE REQUEST                            │
│  (e.g., Create application)                                      │
└─────────────────────────────────────────────────────────────────┘
                           ↓
    ┌──────────────────────────────────────┐
    │ 1. Is user authenticated?            │
    │    request.auth != null              │
    └──────────────────────────────────────┘
                           ↓
              NO ← [Reject] → YES
                           ↓
    ┌──────────────────────────────────────┐
    │ 2. Is email verified?                │
    │    request.auth.token.email_verified │
    └──────────────────────────────────────┘
                           ↓
              NO ← [Reject] → YES
                           ↓
    ┌──────────────────────────────────────┐
    │ 3. Does user own this document?      │
    │    request.auth.uid == studentId     │
    └──────────────────────────────────────┘
                           ↓
              NO ← [Reject] → YES
                           ↓
    ┌──────────────────────────────────────┐
    │ 4. Does ID match pattern?            │
    │    appId == instId_uid_courseId      │
    └──────────────────────────────────────┘
                           ↓
              NO ← [Reject] → YES
                           ↓
    ┌──────────────────────────────────────┐
    │ 5. Is application count valid?       │
    │    courseIds.size() <= 2             │
    └──────────────────────────────────────┘
                           ↓
              NO ← [Reject] → YES
                           ↓
                    [ALLOW WRITE] ✅
```

---

## 🚀 Deployment Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT WORKFLOW                          │
└─────────────────────────────────────────────────────────────────┘

    Developer writes code
           ↓
    npm start (local testing)
           ↓
    git commit & push
           ↓
    ┌────────────────────────────────────┐
    │ GitHub Repository                  │
    └────────────────────────────────────┘
           ↓
    Push to main branch
           ↓
    ┌────────────────────────────────────┐
    │ GitHub Actions Triggered           │
    │                                    │
    │ 1. Checkout code                   │
    │ 2. Setup Node.js                   │
    │ 3. npm ci (install deps)           │
    │ 4. Create .env.local from secrets  │
    │ 5. npm run build                   │
    │ 6. Deploy to Firebase Hosting      │
    └────────────────────────────────────┘
           ↓
    ┌────────────────────────────────────┐
    │ Firebase Hosting                   │
    │ Live at: your-project.web.app      │
    └────────────────────────────────────┘
           ↓
    Users access production site


PULL REQUEST FLOW:

    Create PR
           ↓
    GitHub Actions runs
           ↓
    Creates preview channel
           ↓
    Preview URL in PR comment
           ↓
    Review changes
           ↓
    Merge PR
           ↓
    Deploy to production
```

---

## 📱 User Journey - Student

```
1. SIGNUP
   └→ /signup
      ├─ Fill form
      ├─ Verify email
      └─ Login

2. EXPLORE
   └→ /dashboard
      ├─ View stats
      └→ /institutions
         ├─ Browse institutions
         └→ /institutions/{id}
            ├─ View details
            └─ View faculties/courses

3. APPLY
   └→ /institutions/{id}/apply
      ├─ Select course
      ├─ Fill application
      └─ Submit
         └→ Max 2 per institution checked ✓

4. TRACK
   └→ /applications
      ├─ View all applications
      └─ Check status
         ├─ Pending
         ├─ Admitted
         ├─ Rejected
         └─ Waiting

5. JOBS
   └→ /jobs
      ├─ Browse openings
      └→ /jobs/{id}
         └─ Apply to job
```

---

## 🏢 User Journey - Institution

```
1. LOGIN
   └→ /login
      └─ Access with institute role

2. DASHBOARD
   └→ /dashboard
      ├─ View application stats
      │  ├─ Pending
      │  ├─ Admitted
      │  ├─ Rejected
      │  └─ Waiting list
      └─ Quick actions

3. MANAGE COURSES
   └→ /faculties
      ├─ Add faculty
      └─ Add courses

4. REVIEW APPLICATIONS
   └→ /applications
      ├─ Filter by status
      ├─ View applicant details
      └─ Make decision
         ├─ Admit
         ├─ Reject
         └─ Waitlist

5. STATISTICS
   └→ View dashboards
      └─ Application trends
```

---

## 🔄 Application Status Lifecycle

```
    [SUBMITTED]
         ↓
    status: "pending"
         ↓
    Institution reviews
         ↓
    ┌────┴────┬────────┐
    │         │        │
    ↓         ↓        ↓
[ADMITTED] [REJECTED] [WAITING]
    │                     │
    │                     ↓
    │              If slot opens
    │                     │
    └─────────────────────┘
```

---

## 🎯 Key Components Interaction

```
                     App.jsx
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ↓               ↓               ↓
      Login        Dashboard        Header
        │               │               │
        │               ↓               │
        │       ┌───────┴───────┐       │
        │       │       │       │       │
        ↓       ↓       ↓       ↓       ↓
      Auth   Student  Institute Company Admin
    Services Dashboard Dashboard Dashboard Dashboard
        ↓               │       │       │       │
    firebase.js         └───────┴───────┴───────┘
        ↓                       ↓
    ┌───────┐           InstitutionList
    │ Auth  │                   ↓
    │ DB    │           InstitutionProfile
    │ Storage│                  ↓
    └───────┘              ApplyForm
                               ↓
                           api.js
                               ↓
                           Firebase
```

---

## 📈 Scalability Considerations

```
Current Setup (Small scale, <10k users):
  React App → Firebase Hosting
              └→ Firebase Auth
              └→ Cloud Firestore
              └→ Cloud Storage

Future Enhancements (Medium scale, <100k users):
  React App → Firebase Hosting
              └→ Firebase Auth
              └→ Cloud Firestore (with indexes)
              └→ Cloud Functions (background jobs)
              └→ Cloud Storage
              └→ Firebase Analytics
              └→ Performance Monitoring

Enterprise Scale (>100k users):
  React App → Firebase Hosting / CDN
              └→ Firebase Auth
              └→ Cloud Firestore (sharded)
              └→ Cloud Functions (queue-based)
              └→ Cloud Storage (multi-region)
              └→ BigQuery (analytics)
              └→ Cloud Tasks (job queue)
              └→ Monitoring & Alerting
```

---

## 🎯 Summary

This visual guide shows:
- ✅ Complete user flows
- ✅ Security enforcement points
- ✅ Data relationships
- ✅ System architecture
- ✅ Deployment pipeline
- ✅ Component interactions

All flows are implemented and working in the application!

Refer to **IMPLEMENTATION_SUMMARY.md** for the complete feature list.
