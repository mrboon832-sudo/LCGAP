# LCGAP - Lesotho College Gateway Application Portal

A complete React + Firebase serverless application for managing college applications and job postings in Lesotho.

## 🚀 Features

- **Multi-role Authentication**: Student, Institution, Company, and Admin roles
- **Email Verification**: Secure signup with email verification flow
- **Course Applications**: Students can apply to up to 2 courses per institution
- **Job Postings**: Companies post jobs, students apply
- **Real-time Database**: Firestore for instant updates
- **File Uploads**: Firebase Storage for transcripts and documents
- **Security Rules**: Comprehensive Firestore and Storage security rules
- **CI/CD**: Automated deployment with GitHub Actions
- **Production-Ready**: Optimized for Firebase Hosting

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project (create at [Firebase Console](https://console.firebase.google.com))
- Git and GitHub account (for CI/CD)

## 🔧 Setup Instructions

### 1. Firebase Project Setup

1. **Create Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Click "Add project"
   - Follow the wizard to create your project

2. **Enable Services**:
   - **Authentication**: Go to Authentication → Sign-in method → Enable Email/Password
   - **Firestore**: Go to Firestore Database → Create database → Start in production mode
   - **Storage**: Go to Storage → Get started
   - **Hosting**: Go to Hosting → Get started

3. **Register Web App**:
   - Go to Project settings (⚙️ icon)
   - Under "Your apps", click the web icon (`</>`)
   - Register your app (e.g., "LCGAP Web")
   - Copy the Firebase config object (you'll need this next)

### 2. Local Project Setup

1. **Clone and Install**:
   ```bash
   cd "C:\Users\windows 10\Documents\New folder\LCGAP"
   npm install
   ```

2. **Configure Environment Variables**:
   ```bash
   # Copy the example file
   cp .env.local.example .env.local
   
   # Edit .env.local with your Firebase config values from step 1.3
   ```

   Your `.env.local` should look like:
   ```env
   REACT_APP_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXX
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
   REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
   ```

3. **Login to Firebase CLI**:
   ```bash
   firebase login
   ```

4. **Initialize Firebase in Project**:
   ```bash
   firebase init
   ```
   
   Select:
   - ✅ Firestore
   - ✅ Storage
   - ✅ Hosting
   
   Use the existing files:
   - Firestore rules: `firestore.rules` (already exists)
   - Firestore indexes: `firestore.indexes.json` (already exists)
   - Storage rules: `storage.rules` (already exists)
   - Hosting public directory: `build`
   - Single-page app: Yes
   - GitHub deploys: Yes (if you want CI/CD)

5. **Deploy Security Rules**:
   ```bash
   firebase deploy --only firestore:rules,storage:rules
   ```

### 3. Create First Admin User

You need at least one admin user to manage the system. Two options:

**Option A: Using Admin Utils Script** (Recommended)

1. Download your Firebase service account key:
   - Go to Project settings → Service accounts
   - Click "Generate new private key"
   - Save as `serviceAccountKey.json` in project root

2. Set environment variable (PowerShell):
   ```powershell
   $env:GOOGLE_APPLICATION_CREDENTIALS="$PWD\serviceAccountKey.json"
   ```

3. Install admin dependencies:
   ```bash
   npm install firebase-admin
   ```

4. Create admin user:
   ```bash
   node admin-utils.js createAdmin admin@lcgap.ls YourSecurePassword "Admin User"
   ```

**Option B: Manual Creation via Console**
1. Create a regular user account via the app's signup page
2. Get the user's UID from Firebase Console → Authentication
3. Use Firebase CLI or Console to add custom claim:
   ```bash
   # Using Firebase Functions or Admin SDK
   ```

### 4. Run Development Server

```bash
npm start
```

Visit `http://localhost:3000`

### 5. Build and Deploy

**Build for production**:
```bash
npm run build
```

**Deploy to Firebase Hosting**:
```bash
firebase deploy --only hosting
```

**Deploy everything**:
```bash
firebase deploy
```

## 🔄 CI/CD Setup (GitHub Actions)

### 1. GitHub Repository Setup

1. Create a new repository on GitHub
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/lcgap.git
   git push -u origin main
   ```

### 2. GitHub Secrets Configuration

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

1. **Firebase Service Account**:
   ```bash
   # Generate the service account JSON
   firebase init hosting:github
   
   # Or manually get from Firebase Console → Project settings → Service accounts
   ```
   
   Add as secret: `FIREBASE_SERVICE_ACCOUNT`

2. **Firebase Project ID**:
   - Secret name: `FIREBASE_PROJECT_ID`
   - Value: Your Firebase project ID

3. **React App Environment Variables**:
   - `REACT_APP_FIREBASE_API_KEY`
   - `REACT_APP_FIREBASE_AUTH_DOMAIN`
   - `REACT_APP_FIREBASE_PROJECT_ID`
   - `REACT_APP_FIREBASE_STORAGE_BUCKET`
   - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
   - `REACT_APP_FIREBASE_APP_ID`

### 3. Automatic Deployments

- **Push to `main`**: Automatically deploys to production
- **Pull Requests**: Creates preview channels for testing

## 📂 Project Structure

```
LCGAP/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── VerifyEmailNotice.jsx
│   │   ├── Dashboard/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── InstituteDashboard.jsx
│   │   │   └── CompanyDashboard.jsx
│   │   ├── Institutions/
│   │   │   ├── InstitutionList.jsx
│   │   │   └── InstitutionProfile.jsx
│   │   ├── Applications/
│   │   │   └── ApplyForm.jsx
│   │   └── Layout/
│   │       └── Header.jsx
│   ├── services/
│   │   ├── firebase.js
│   │   └── api.js
│   ├── styles/
│   │   ├── base.css
│   │   ├── header.css
│   │   └── forms.css
│   ├── App.jsx
│   └── index.jsx
├── .github/
│   └── workflows/
│       └── firebase-hosting.yml
├── admin-utils.js
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
├── package.json
├── .env.local.example
└── README.md
```

## 🔐 Security Features

### Firestore Rules
- ✅ Email verification required for critical operations
- ✅ Deterministic application IDs prevent duplicates
- ✅ Max 2 applications per institution enforced
- ✅ Role-based access control (RBAC)
- ✅ Admin custom claims for secure admin access

### Storage Rules
- ✅ 10MB file size limit
- ✅ Document type validation (PDF, images, Word docs)
- ✅ User-specific upload paths
- ✅ Read/write permissions based on ownership

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Security Rules (Emulator)
```bash
firebase emulators:start
```

Then run your tests against `localhost:8080` (Firestore) and `localhost:9199` (Storage).

## 📱 User Roles & Permissions

### Student
- ✅ Browse institutions and courses
- ✅ Apply to courses (max 2 per institution)
- ✅ View application status
- ✅ Apply to jobs
- ✅ Upload transcripts

### Institution Representative
- ✅ Manage faculties and courses
- ✅ View applications
- ✅ Admit/reject/waitlist students
- ✅ Publish admissions

### Company Representative
- ✅ Post job openings
- ✅ View job applicants
- ✅ Manage applications

### Admin
- ✅ Full system access
- ✅ Manage institutions
- ✅ Manage companies
- ✅ View all users and applications
- ✅ System statistics

## 🚨 Important Constraints

1. **Max 2 Applications per Institution**: Enforced via Firestore rules and client-side validation
2. **Email Verification Required**: All write operations require verified email
3. **Deterministic Application IDs**: Format: `{institutionId}_{studentId}_{courseId}`
4. **Custom Claims for Admins**: Must be set via Admin SDK (cannot be set from client)

## 📊 Data Model

### Collections

- `users/{uid}` - User profiles
  - `applicationsByInstitution/{instId}` - Application tracking (max 2 courses)
- `institutions/{instId}` - Institutions
  - `faculties/{facultyId}` - Faculties
    - `courses/{courseId}` - Courses
- `companies/{companyId}` - Companies
- `jobs/{jobId}` - Job postings
- `applications/{appId}` - Course applications
- `jobApplications/{appId}` - Job applications
- `transcripts/{studentId}/{fileId}` - Document metadata

## 🐛 Troubleshooting

### "Email not verified" error
- Check your email inbox (and spam folder)
- Click the verification link
- Reload the page and try logging in again

### "Too many requests" during signup
- Firebase has rate limits on email verification
- Wait a few minutes before requesting another verification email

### Firestore rules errors
- Ensure you've deployed the latest rules: `firebase deploy --only firestore:rules`
- Check the Firebase Console → Firestore → Rules tab for syntax errors

### Build fails
- Clear cache: `rm -rf node_modules package-lock.json && npm install`
- Check Node.js version: `node --version` (should be 18+)

## 🎯 Production Checklist

- [ ] Environment variables configured in `.env.local`
- [ ] Firebase services enabled (Auth, Firestore, Storage, Hosting)
- [ ] Security rules deployed and tested
- [ ] Admin user created
- [ ] GitHub secrets configured for CI/CD
- [ ] Custom domain configured (optional)
- [ ] Performance monitoring enabled
- [ ] Firestore indexes created (auto-prompted during development)

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [React Documentation](https://react.dev)

## 📄 License

This project is for educational purposes as part of the LCGAP assignment.

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Built with ❤️ for Lesotho students**
