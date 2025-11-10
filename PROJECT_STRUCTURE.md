# LCGAP Project Structure

Complete file and folder organization for the Lesotho College Gateway Application Portal.

## 📁 Root Directory

```
LCGAP/
├── 📄 package.json              # Project dependencies and scripts
├── 📄 package-lock.json         # Locked dependency versions
├── 📄 .gitignore               # Git ignore rules
├── 📄 README.md                # Main documentation
├── 📄 FIREBASE_SETUP.md        # Firebase configuration guide
├── 📄 CONFIGURATION_GUIDE.md   # Complete setup guide
├── 📄 firebase.json            # Firebase project configuration
├── 📄 .firebaserc              # Firebase project aliases
├── 📄 firestore.rules          # Firestore security rules
├── 📄 firestore.indexes.json   # Firestore composite indexes
├── 📄 storage.rules            # Cloud Storage security rules
├── 📄 admin-utils.js           # Admin utilities script
├── 📄 .env.local.example       # Environment variables template
├── 📄 .env.local               # Your Firebase config (not in git)
└── 📂 public/                  # Static assets
    └── 📄 index.html           # HTML template
```

## 📂 Source Directory (`src/`)

```
src/
├── 📄 index.jsx                # App entry point
├── 📄 App.jsx                  # Main app component with routing
│
├── 📂 components/              # React components
│   ├── 📂 Auth/               # Authentication components
│   │   ├── Login.jsx          # Login form
│   │   ├── Signup.jsx         # User registration
│   │   └── VerifyEmailNotice.jsx  # Email verification UI
│   │
│   ├── 📂 Dashboard/          # Role-based dashboards
│   │   ├── AdminDashboard.jsx       # Admin overview
│   │   ├── StudentDashboard.jsx     # Student portal
│   │   ├── InstituteDashboard.jsx   # Institution management
│   │   └── CompanyDashboard.jsx     # Company portal
│   │
│   ├── 📂 Institutions/       # Institution features
│   │   ├── InstitutionList.jsx      # Browse institutions
│   │   └── InstitutionProfile.jsx   # Institution details
│   │
│   ├── 📂 Applications/       # Application management
│   │   └── ApplyForm.jsx      # Course application form
│   │
│   └── 📂 Layout/             # Layout components
│       └── Header.jsx         # Navigation header
│
├── 📂 services/               # Business logic & API
│   ├── firebase.js            # Firebase initialization
│   └── api.js                 # Firestore CRUD operations
│
└── 📂 styles/                 # CSS stylesheets
    ├── base.css               # Global styles & utilities
    ├── header.css             # Header/navigation styles
    └── forms.css              # Form component styles
```

## 📂 GitHub Workflows (`.github/workflows/`)

```
.github/
└── workflows/
    └── firebase-hosting.yml    # CI/CD deployment pipeline
```

## 🔥 Firebase Configuration Files

### `firebase.json`
Main Firebase configuration for hosting, Firestore, and Storage.

**Key sections**:
- `hosting`: Build directory, rewrites, caching headers
- `firestore`: Rules and indexes paths
- `storage`: Rules path
- `emulators`: Local development settings

### `firestore.rules`
Security rules for Firestore database.

**Key rules**:
- User authentication and email verification
- Role-based access control (RBAC)
- Application creation with deterministic IDs
- Max 2 applications per institution enforcement
- Institution/Company/Admin permissions

### `storage.rules`
Security rules for Cloud Storage.

**Key rules**:
- User-specific upload paths
- File size limits (10MB)
- File type validation
- Ownership-based access

### `firestore.indexes.json`
Composite indexes for complex queries. Auto-generated when needed.

## 📦 NPM Scripts

```json
{
  "start": "react-scripts start",      // Development server
  "build": "react-scripts build",      // Production build
  "test": "react-scripts test",        // Run tests
  "eject": "react-scripts eject"       // Eject from CRA (not recommended)
}
```

## 🎨 Styling Architecture

### CSS Variables (`:root` in `base.css`)
```css
--primary-color: #2563eb         // Brand color
--secondary-color: #64748b       // Secondary actions
--success-color: #10b981         // Success states
--danger-color: #ef4444          // Error states
--warning-color: #f59e0b         // Warning states
```

### Component Classes
- `.card` - Container for content sections
- `.btn` - Button base styles
- `.form-input` - Form field styles
- `.alert` - Notice/message boxes
- `.badge` - Status indicators

### Utility Classes
- Spacing: `.mt-*`, `.mb-*`, `.gap-*`
- Layout: `.flex`, `.grid`, `.grid-2`, `.grid-3`
- Text: `.text-center`, `.text-muted`

## 🔒 Security Model

### Authentication Flow
```
1. User signs up → Creates Auth account
2. Email verification sent → User clicks link
3. User profile created in Firestore
4. Email verified → Can perform actions
5. Login → Token includes email_verified claim
```

### Custom Claims (Admin)
```javascript
{
  admin: true,              // Set via Admin SDK
  institutionId: "inst123", // Optional: link to institution
  companyId: "comp456"      // Optional: link to company
}
```

### Application Creation Flow
```
1. Student applies to course
2. Client creates deterministic ID: inst_student_course
3. Batch write:
   - Create applications/{id}
   - Update users/{uid}/applicationsByInstitution/{instId}
4. Rules validate:
   - Email verified
   - User owns application
   - ID matches pattern
   - courseIds array size ≤ 2
```

## 📊 Data Relationships

```
users
├── {uid}
│   ├── displayName, email, role
│   └── applicationsByInstitution/
│       └── {institutionId}
│           └── courseIds: [course1, course2]

institutions
├── {instId}
│   ├── name, location, profile
│   └── faculties/
│       └── {facultyId}
│           └── courses/
│               └── {courseId}

applications
└── {institutionId}_{studentId}_{courseId}
    └── status, appliedAt, motivation

jobs
└── {jobId}
    └── companyId, title, qualifications

jobApplications
└── {jobId}_{studentId}
    └── status, appliedAt, resume
```

## 🚀 Deployment Flow

### Development
```
1. Edit code
2. npm start → localhost:3000
3. Test with Firebase Emulators
4. Commit changes
```

### Staging (Preview Channel)
```
1. Create pull request
2. GitHub Actions runs
3. Preview channel created
4. Review at PR-specific URL
```

### Production
```
1. Merge to main branch
2. GitHub Actions runs
3. Builds production bundle
4. Deploys to Firebase Hosting
5. Live at your-project.web.app
```

## 🛠️ Development Tools

### Required
- Node.js 18+
- npm
- Firebase CLI
- Git

### Recommended
- VS Code
- Firebase Extensions (VS Code)
- ESLint extension
- Prettier extension

### Optional
- React Developer Tools (browser)
- Redux DevTools (if adding state management)
- Postman (API testing)

## 📝 File Naming Conventions

### Components
- PascalCase: `StudentDashboard.jsx`
- One component per file
- Match component name to filename

### Services
- camelCase: `firebase.js`, `api.js`
- Functional/utility files

### Styles
- kebab-case: `base.css`, `header.css`
- One file per major section

### Config Files
- lowercase: `firebase.json`, `package.json`
- Standard naming conventions

## 🔄 State Management

Currently using React's built-in state management:
- `useState` - Component state
- `useEffect` - Side effects
- `useContext` - (can be added for global state)

**Future considerations**:
- Add Redux for complex state
- Add React Query for server state
- Add Zustand for lightweight state

## 🧪 Testing Strategy

### Unit Tests
```
src/components/**/__tests__/
  ├── Login.test.jsx
  ├── Signup.test.jsx
  └── Dashboard.test.jsx
```

### Integration Tests
```
src/__tests__/integration/
  ├── authFlow.test.js
  ├── applicationFlow.test.js
  └── adminFlow.test.js
```

### E2E Tests (Future)
```
cypress/
  └── e2e/
      ├── authentication.cy.js
      ├── applications.cy.js
      └── admin.cy.js
```

## 📈 Scalability Considerations

### Current Limitations
- Client-side enforcement of 2-app limit (prefer server-side)
- No background job processing
- Limited real-time features

### Recommended Additions for Scale
1. **Cloud Functions**:
   - Email notifications
   - Application status updates
   - Waiting list management
   - Data validation

2. **Firestore Optimization**:
   - Denormalization for frequently accessed data
   - Paginated queries
   - Composite indexes

3. **Caching**:
   - Service workers for offline support
   - Redis for session management
   - CDN for static assets

## 🎯 Key Features by Role

### Student (`role: "student"`)
- Browse institutions/courses
- Apply to courses (max 2 per institution)
- Track application status
- Apply to jobs
- Upload documents

### Institution (`role: "institute"`)
- Manage faculties and courses
- Review applications
- Admit/reject/waitlist students
- View statistics

### Company (`role: "company"`)
- Post job openings
- View applicants
- Manage hiring pipeline

### Admin (`role: "admin"`)
- Full system access
- Manage all entities
- View system statistics
- Create institutions/companies

## 🔐 Environment Variables

### Required (`.env.local`)
```
REACT_APP_FIREBASE_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN
REACT_APP_FIREBASE_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID
```

### Optional (Future)
```
REACT_APP_ANALYTICS_ID
REACT_APP_SENTRY_DSN
REACT_APP_API_BASE_URL
```

## 📚 Documentation Files

1. **README.md** - Project overview and quick start
2. **FIREBASE_SETUP.md** - Step-by-step Firebase configuration
3. **CONFIGURATION_GUIDE.md** - Complete deployment guide
4. **PROJECT_STRUCTURE.md** - This file!

## 🎓 Learning Resources

- React: https://react.dev
- Firebase: https://firebase.google.com/docs
- Firestore Rules: https://firebase.google.com/docs/firestore/security
- React Router: https://reactrouter.com

---

This structure follows React and Firebase best practices while remaining simple enough for a college project. All files are organized logically and follow consistent naming conventions.
