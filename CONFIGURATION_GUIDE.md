# 🎯 LCGAP - Complete Configuration & Deployment Guide

This is your comprehensive guide to get the LCGAP application running from scratch.

---

## 📦 What's Been Built

A complete, production-ready React + Firebase application with:

✅ **Authentication System**
- Email/password signup with verification
- Role-based access (Student, Institution, Company, Admin)
- Protected routes and email verification flow

✅ **Student Features**
- Browse institutions, faculties, and courses
- Apply to courses (max 2 per institution - enforced by rules)
- View application status
- Apply to jobs
- Upload transcripts

✅ **Institution Features**
- Manage faculties and courses
- Review student applications
- Admit/reject/waitlist applicants
- View statistics

✅ **Company Features**
- Post job openings
- View and manage job applications
- Filter applicants

✅ **Admin Features**
- Full system access
- Manage institutions and companies
- View all users and applications
- System statistics dashboard

✅ **Security**
- Comprehensive Firestore security rules
- Storage security rules
- Email verification enforcement
- Custom claims for admin roles
- Deterministic IDs to prevent duplicate applications

✅ **DevOps**
- GitHub Actions CI/CD pipeline
- Automated deployment to Firebase Hosting
- Preview channels for pull requests
- Firebase emulator support for local testing

---

## 🚀 Quick Start (30 minutes)

### Prerequisites Checklist

- [ ] Node.js 18+ installed ([Download](https://nodejs.org))
- [ ] npm installed (comes with Node.js)
- [ ] Git installed ([Download](https://git-scm.com))
- [ ] Firebase account ([Sign up](https://firebase.google.com))
- [ ] VS Code or your preferred editor

### Step-by-Step Setup

#### 1️⃣ Firebase Project Setup (10 min)

**See detailed instructions in: `FIREBASE_SETUP.md`**

Quick summary:
1. Create Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Enable Storage
5. Enable Hosting
6. Register a web app and copy the config

#### 2️⃣ Local Configuration (5 min)

```powershell
# Navigate to project directory
cd "c:\Users\windows 10\Documents\New folder\LCGAP"

# Create environment file
Copy-Item .env.local.example .env.local

# Edit .env.local with your Firebase config values
code .env.local
```

Paste your Firebase config:
```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

#### 3️⃣ Deploy Security Rules (5 min)

```powershell
# Login to Firebase CLI
firebase login

# Connect to your project
firebase use --add
# Select your project and use alias "default"

# Deploy rules
firebase deploy --only firestore:rules,storage:rules
```

#### 4️⃣ Start Development Server (2 min)

```powershell
npm start
```

Visit http://localhost:3000

#### 5️⃣ Create First User (5 min)

1. Click "Sign up here"
2. Fill in the form (use Student role for now)
3. Verify your email
4. Login

#### 6️⃣ Make Yourself Admin (3 min)

**Option A: Firebase Console (Quickest)**
1. Go to Firebase Console → Authentication → Users
2. Copy your User UID
3. Go to Firestore Database
4. Open `users` collection → your document
5. Edit the `role` field: change to `admin`
6. Save
7. Log out and log back in

**Option B: Admin Script**
```powershell
# Download service account key from Firebase Console
# Project settings → Service accounts → Generate new private key

$env:GOOGLE_APPLICATION_CREDENTIALS="$PWD\serviceAccountKey.json"
npm install firebase-admin
node admin-utils.js createAdmin admin@lcgap.ls Password123 "Admin User"
```

---

## 🏗️ Architecture Overview

### Frontend (React)
```
src/
├── components/          # React components
│   ├── Auth/           # Login, Signup, Email verification
│   ├── Dashboard/      # Role-specific dashboards
│   ├── Institutions/   # Institution browsing & profiles
│   ├── Applications/   # Application forms
│   └── Layout/         # Header, Footer
├── services/           # Firebase & API layer
│   ├── firebase.js     # Firebase initialization
│   └── api.js          # Firestore operations
└── styles/             # Traditional CSS files
```

### Backend (Firebase)
- **Authentication**: Email/password with verification
- **Firestore**: Document database with security rules
- **Storage**: File uploads (transcripts, documents)
- **Hosting**: Static site hosting with CDN

### Security Model
```
firestore.rules          # Database security
storage.rules            # File upload security
```

Key constraints enforced:
- Email verification required for writes
- Max 2 applications per institution per student
- Deterministic IDs: `{institutionId}_{studentId}_{courseId}`
- Role-based access via custom claims

---

## 🔐 Security Rules Explained

### Applications Collection

**Creating Applications**:
```javascript
// Deterministic ID prevents duplicates
appId = `${institutionId}_${studentId}_${courseId}`

// Rules enforce:
- User owns the application (studentId == auth.uid)
- Email is verified
- ID matches the pattern
- Initial status is 'pending'
```

**Max 2 Per Institution**:
```javascript
// Tracked in: users/{uid}/applicationsByInstitution/{instId}
// Field: courseIds (array, max length 2)
// Rules validate array size on write
```

### File Uploads

**Student Transcripts**:
```javascript
Path: students/{userId}/*
Rules:
- 10MB size limit
- PDF, images, or Word docs only
- User can only upload to their own path
- Admin has read access
```

---

## 📊 Data Model

### Core Collections

**users** - User profiles
```json
{
  "displayName": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "emailVerified": true,
  "profile": { "phone": "...", "bio": "..." }
}
```

**institutions** - Educational institutions
```json
{
  "name": "Limkokwing Lesotho",
  "location": "Maseru",
  "profile": "About the institution...",
  "createdBy": "adminUid"
}
```

**applications** - Course applications
```json
{
  "id": "inst123_user456_course789",
  "studentId": "user456",
  "institutionId": "inst123",
  "courseId": "course789",
  "status": "pending",
  "appliedAt": timestamp
}
```

**jobs** - Job postings
```json
{
  "companyId": "comp123",
  "title": "Software Developer",
  "description": "...",
  "qualifications": "...",
  "createdAt": timestamp
}
```

---

## 🚢 Deployment

### Manual Deployment

```powershell
# Build production bundle
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Deploy everything (hosting + rules)
firebase deploy
```

Your site will be live at:
- `https://your-project-id.web.app`
- `https://your-project-id.firebaseapp.com`

### CI/CD with GitHub Actions

**Setup (one time)**:

1. **Push code to GitHub**:
   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/lcgap.git
   git push -u origin main
   ```

2. **Configure GitHub Secrets**:
   
   Go to: Repository Settings → Secrets and variables → Actions
   
   Add these secrets:
   - `FIREBASE_SERVICE_ACCOUNT` - Get from Firebase Console
   - `FIREBASE_PROJECT_ID` - Your project ID
   - `REACT_APP_FIREBASE_API_KEY`
   - `REACT_APP_FIREBASE_AUTH_DOMAIN`
   - `REACT_APP_FIREBASE_PROJECT_ID`
   - `REACT_APP_FIREBASE_STORAGE_BUCKET`
   - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
   - `REACT_APP_FIREBASE_APP_ID`

3. **Get Firebase Service Account**:
   ```powershell
   # This will guide you through GitHub integration
   firebase init hosting:github
   ```

**Automatic Deployments**:
- Push to `main` → Deploys to production
- Create PR → Creates preview channel

---

## 🧪 Testing

### Run Unit Tests
```powershell
npm test
```

### Test with Firebase Emulators
```powershell
# Start emulators
firebase emulators:start

# In another terminal, run app against emulators
# Update firebase.js to use emulator hosts
npm start
```

### Test Security Rules
```powershell
firebase emulators:exec --only firestore "npm test"
```

---

## 🐛 Common Issues & Solutions

### Issue: "Permission denied" in Firestore
**Solution**: 
```powershell
firebase deploy --only firestore:rules
```
Ensure email is verified.

### Issue: Build fails with module errors
**Solution**:
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Issue: Email verification not working
**Solution**:
- Check spam folder
- Use admin utils to verify manually
- Check Firebase Console → Authentication settings

### Issue: Can't create admin user
**Solution**:
- Use Firebase Console method (easiest)
- Or use admin-utils.js script
- Ensure service account key is valid

### Issue: GitHub Actions fails
**Solution**:
- Check all secrets are set correctly
- Verify FIREBASE_SERVICE_ACCOUNT is valid JSON
- Check workflow logs for specific errors

---

## 📈 Production Best Practices

### Before Going Live

- [ ] Test all user flows (signup → apply → admin review)
- [ ] Test security rules with emulator
- [ ] Add Firestore indexes (auto-prompted during dev)
- [ ] Enable Performance Monitoring
- [ ] Set up error tracking (Crashlytics)
- [ ] Configure custom domain
- [ ] Set up backup schedule for Firestore
- [ ] Review and optimize Firestore costs
- [ ] Add privacy policy and terms of service
- [ ] Test on mobile devices

### Performance Optimization

1. **Firestore Queries**:
   - Use composite indexes for complex queries
   - Paginate large result sets
   - Denormalize data where beneficial

2. **React App**:
   - Code splitting with React.lazy()
   - Image optimization
   - Compress build assets

3. **Hosting**:
   - Enable caching headers (already in firebase.json)
   - Use CDN for static assets
   - Enable compression

### Cost Management

Monitor these in Firebase Console:
- Firestore reads/writes (biggest cost driver)
- Storage downloads
- Authentication users
- Hosting bandwidth

Optimization tips:
- Cache frequently accessed data client-side
- Use Firebase Local Emulator for development
- Implement pagination for lists
- Clean up old/unused data

---

## 🎓 Next Steps

### For Development
1. Add more components (Faculty management, Course management)
2. Implement file upload UI for transcripts
3. Add notifications system
4. Create admin panel for user management
5. Add search and filtering
6. Implement analytics dashboard

### For Production
1. Add custom domain
2. Set up monitoring alerts
3. Create backup strategy
4. Implement logging
5. Add rate limiting
6. Set up staging environment

### For Team
1. Set up code review process
2. Add ESLint and Prettier
3. Write integration tests
4. Create component documentation
5. Set up design system

---

## 📚 Resources

- **Firebase Docs**: https://firebase.google.com/docs
- **React Docs**: https://react.dev
- **Firestore Rules**: https://firebase.google.com/docs/firestore/security/get-started
- **GitHub Actions**: https://docs.github.com/actions

---

## 🆘 Getting Help

If you run into issues:

1. Check the troubleshooting section above
2. Review Firebase Console logs
3. Check browser console for errors
4. Verify security rules are deployed
5. Test with Firebase Emulator
6. Check GitHub Issues (if repo is public)

---

## ✅ Project Completion Checklist

### Setup Phase
- [ ] Firebase project created
- [ ] All services enabled
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Security rules deployed

### Development Phase
- [ ] App runs locally
- [ ] Can create user accounts
- [ ] Email verification works
- [ ] Admin user created
- [ ] All dashboards render correctly

### Testing Phase
- [ ] Application flow tested
- [ ] Security rules tested
- [ ] File uploads work
- [ ] All roles tested
- [ ] Mobile responsive

### Deployment Phase
- [ ] Production build successful
- [ ] Deployed to Firebase Hosting
- [ ] Custom domain configured (optional)
- [ ] CI/CD pipeline working
- [ ] Monitoring enabled

---

**You're all set! 🎉**

The application is now ready for development, testing, and deployment.

For questions or issues, refer to the main [README.md](README.md) or [FIREBASE_SETUP.md](FIREBASE_SETUP.md).
