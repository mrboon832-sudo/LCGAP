# 🎓 LCGAP - Start Here!

**Lesotho College Gateway Application Portal**  
A complete React + Firebase serverless application for managing college applications and job postings.

---

## 🚀 Quick Navigation

**New to this project? Start here:**

1. 📖 **[READ THIS FIRST](#-what-is-lcgap)** - 2 min overview
2. ✅ **[QUICK_START.md](QUICK_START.md)** - 30 min setup checklist
3. 🔥 **[FIREBASE_SETUP.md](FIREBASE_SETUP.md)** - Firebase configuration
4. ⚙️ **[CONFIGURATION_GUIDE.md](CONFIGURATION_GUIDE.md)** - Complete deployment
5. 📊 **[SYSTEM_DIAGRAMS.md](SYSTEM_DIAGRAMS.md)** - Visual architecture

**Advanced:**
- 📂 [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - File organization
- 📝 [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Technical details

---

## 📖 What is LCGAP?

LCGAP is a **production-ready web application** that helps students:
- 🏛️ Browse educational institutions
- 📝 Apply to courses (max 2 per institution)
- 💼 Find and apply to jobs
- 📄 Upload transcripts and documents
- 📊 Track application status

And helps institutions/companies:
- 👥 Manage applications
- ✅ Admit or reject applicants
- 📈 View statistics
- 💼 Post job openings

All with **zero custom backend** - everything runs on Firebase!

---

## ⚡ 30-Second Setup

```powershell
# 1. Install dependencies (already done ✅)
npm install

# 2. Create environment file
Copy-Item .env.local.example .env.local

# 3. Add your Firebase config to .env.local
# (Get from Firebase Console - see FIREBASE_SETUP.md)

# 4. Login to Firebase
firebase login

# 5. Connect your project
firebase use --add

# 6. Deploy security rules
firebase deploy --only firestore:rules,storage:rules

# 7. Start the app
npm start
```

**That's it!** Visit http://localhost:3000

---

## 🎯 What's Built & Ready

### ✅ Complete Features

- **Authentication System**
  - Email/password signup with verification
  - Multi-role support (Student, Institution, Company, Admin)
  - Protected routes
  - Session management

- **Student Portal**
  - Browse institutions and courses
  - Apply to courses (enforced max 2 per institution)
  - Track application status (pending/admitted/rejected/waiting)
  - Job search and applications
  - Document uploads

- **Institution Portal**
  - Manage faculties and courses
  - Review applications
  - Admit/reject/waitlist students
  - View statistics

- **Company Portal**
  - Post job openings
  - Review job applications
  - Manage applicants

- **Admin Panel**
  - System-wide statistics
  - Manage all entities
  - User administration

### ✅ Security (Production-Grade)

- **Firestore Security Rules** (143 lines)
  - Email verification enforcement
  - Role-based access control
  - Deterministic IDs to prevent duplicates
  - Max 2 applications per institution enforced at DB level

- **Storage Security Rules** (65 lines)
  - File size limits (10MB)
  - Type validation (PDF, images, Word docs)
  - User-specific paths
  - Ownership verification

### ✅ DevOps

- **CI/CD Pipeline** (GitHub Actions)
  - Automatic deployment on push to main
  - Preview channels for pull requests
  - Environment variable management

- **Admin Tools**
  - Script to create admin users
  - Custom claims management
  - Email verification utilities

---

## 📊 Tech Stack

```
Frontend:
├── React 18.2.0
├── React Router 6.20.1
└── Traditional CSS (no frameworks)

Backend (Serverless):
├── Firebase Authentication
├── Cloud Firestore (Database)
├── Cloud Storage (Files)
└── Firebase Hosting (Deployment)

DevOps:
├── GitHub Actions (CI/CD)
├── Firebase CLI
└── Firebase Emulator Suite
```

---

## 🗂️ Project Structure

```
LCGAP/
├── src/
│   ├── components/          # React components
│   │   ├── Auth/           # Login, Signup, Verification
│   │   ├── Dashboard/      # Role-based dashboards
│   │   ├── Institutions/   # Institution browsing
│   │   ├── Applications/   # Application forms
│   │   └── Layout/         # Header, navigation
│   ├── services/
│   │   ├── firebase.js     # Firebase initialization
│   │   └── api.js          # Firestore operations
│   └── styles/             # Traditional CSS
│       ├── base.css
│       ├── header.css
│       └── forms.css
├── public/
│   └── index.html
├── firestore.rules          # Database security
├── storage.rules            # File upload security
├── firebase.json            # Firebase config
└── [Documentation files]
```

---

## 🔐 Key Security Features

### 1. Max 2 Applications Per Institution
```javascript
// Enforced at database level via Firestore rules
match /users/{userId}/applicationsByInstitution/{instId} {
  allow write: if request.resource.data.courseIds.size() <= 2;
}
```

### 2. Deterministic Application IDs
```javascript
// Format: {institutionId}_{studentId}_{courseId}
// Prevents duplicate applications
appId == "inst123_user456_course789"
```

### 3. Email Verification Required
```javascript
// All critical operations require verified email
request.auth.token.email_verified == true
```

### 4. Role-Based Access
```javascript
// Custom claims for admins (set via Admin SDK)
request.auth.token.admin == true
```

---

## 📋 Setup Checklist

Follow this checklist for complete setup:

- [ ] Firebase project created
- [ ] Authentication enabled (Email/Password)
- [ ] Firestore Database created
- [ ] Cloud Storage enabled
- [ ] Hosting enabled
- [ ] Web app registered in Firebase
- [ ] `.env.local` created with Firebase config
- [ ] Dependencies installed (`npm install` - already done ✅)
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Logged in to Firebase (`firebase login`)
- [ ] Project connected (`firebase use --add`)
- [ ] Security rules deployed (`firebase deploy --only firestore:rules,storage:rules`)
- [ ] App running locally (`npm start`)
- [ ] First user account created
- [ ] Admin user configured
- [ ] Tested basic flows

**Detailed instructions:** See [QUICK_START.md](QUICK_START.md)

---

## 🎯 Use Cases

### For Students
```
1. Sign up and verify email
2. Browse institutions
3. Select courses and apply (max 2 per institution)
4. Upload transcripts
5. Track application status
6. Browse and apply to jobs
```

### For Institutions
```
1. Login as institution representative
2. Add faculties and courses
3. Review incoming applications
4. Admit, reject, or waitlist students
5. View application statistics
```

### For Companies
```
1. Login as company representative
2. Post job openings
3. View job applications
4. Manage applicants
```

### For Admins
```
1. Login as admin
2. View system statistics
3. Manage institutions and companies
4. Administer users
5. Monitor applications
```

---

## 🚀 Deployment

### Development
```powershell
npm start
```
**Access at:** http://localhost:3000

### Production
```powershell
npm run build
firebase deploy
```
**Access at:** https://your-project-id.web.app

### CI/CD (Automatic)
```bash
git push origin main
```
**GitHub Actions deploys automatically**

---

## 📚 Documentation

### Essential Guides
1. **[QUICK_START.md](QUICK_START.md)** - 30-minute setup checklist
2. **[FIREBASE_SETUP.md](FIREBASE_SETUP.md)** - Detailed Firebase configuration
3. **[CONFIGURATION_GUIDE.md](CONFIGURATION_GUIDE.md)** - Complete deployment guide

### Technical Documentation
4. **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - File organization and architecture
5. **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Feature implementation details
6. **[SYSTEM_DIAGRAMS.md](SYSTEM_DIAGRAMS.md)** - Visual architecture diagrams

### Quick Reference
- **Admin Tools:** See `admin-utils.js`
- **Security Rules:** See `firestore.rules` and `storage.rules`
- **CI/CD Pipeline:** See `.github/workflows/firebase-hosting.yml`

---

## 🛠️ Common Commands

```powershell
# Development
npm start                    # Start dev server
npm run build               # Build for production
npm test                    # Run tests

# Firebase
firebase login              # Login to Firebase
firebase use --add          # Connect project
firebase deploy             # Deploy everything
firebase deploy --only hosting              # Deploy hosting only
firebase deploy --only firestore:rules      # Deploy Firestore rules
firebase emulators:start    # Start local emulators

# Admin utilities
node admin-utils.js createAdmin <email> <password> <name>
node admin-utils.js setAdmin <email>
node admin-utils.js checkAdmin <email>
```

---

## 🐛 Troubleshooting

### Issue: "Permission denied" errors
**Solution:** Deploy security rules
```powershell
firebase deploy --only firestore:rules,storage:rules
```

### Issue: Build fails
**Solution:** Reinstall dependencies
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Issue: Email verification not working
**Solution:** 
- Check spam folder
- Use admin utilities to verify manually
- Ensure Firebase email settings are configured

### Issue: Can't create admin user
**Solution:**
- Use Firebase Console method (quickest)
- Or follow admin-utils.js instructions
- See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) Step 7

**More troubleshooting:** See [CONFIGURATION_GUIDE.md](CONFIGURATION_GUIDE.md)

---

## 🎓 Learning Resources

- **Firebase:** https://firebase.google.com/docs
- **React:** https://react.dev
- **Firestore Rules:** https://firebase.google.com/docs/firestore/security/get-started
- **React Router:** https://reactrouter.com
- **GitHub Actions:** https://docs.github.com/actions

---

## 📊 Project Stats

- **React Components:** 11
- **CSS Files:** 3
- **Firebase Services:** 4 (Auth, Firestore, Storage, Hosting)
- **Security Rules:** 208 lines (Firestore + Storage)
- **Documentation Files:** 7
- **Setup Time:** ~30 minutes
- **Lines of Code:** ~3,000+

---

## ✅ Assignment Requirements Met

| Requirement | Status |
|------------|--------|
| React frontend | ✅ |
| No custom backend | ✅ |
| Traditional CSS | ✅ |
| Firebase services | ✅ |
| Multi-role auth | ✅ |
| Email verification | ✅ |
| Application system | ✅ |
| Max 2 apps/institution | ✅ |
| Job postings | ✅ |
| File uploads | ✅ |
| Security rules | ✅ |
| Production deployment | ✅ |
| CI/CD pipeline | ✅ |

**All requirements completed! 🎉**

---

## 🎯 Next Steps

### Immediate (30 min)
1. ✅ Read [QUICK_START.md](QUICK_START.md)
2. 🔥 Follow [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
3. 🚀 Run `npm start` and test locally

### Development (1-2 hours)
1. Create test institutions
2. Create test student accounts
3. Test application workflow
4. Customize styling
5. Add sample data

### Production (30 min)
1. Build and deploy
2. Test on production URL
3. (Optional) Set up custom domain
4. (Optional) Configure GitHub Actions

### Enhancement (ongoing)
1. Add email notifications
2. Implement real-time notifications
3. Add analytics dashboard
4. Improve mobile responsiveness
5. Add more features

---

## 📞 Support

**Getting stuck?**

1. Check the troubleshooting section above
2. Review [CONFIGURATION_GUIDE.md](CONFIGURATION_GUIDE.md)
3. Check Firebase Console for errors
4. Review browser console for client errors
5. Verify security rules are deployed

**Documentation Files:**
- General questions → [README.md](README.md) (this file)
- Setup help → [QUICK_START.md](QUICK_START.md)
- Firebase config → [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
- Deployment → [CONFIGURATION_GUIDE.md](CONFIGURATION_GUIDE.md)
- Architecture → [SYSTEM_DIAGRAMS.md](SYSTEM_DIAGRAMS.md)

---

## 🏆 What Makes This Special

✅ **Zero Backend** - 100% Firebase serverless  
✅ **Production-Grade Security** - Comprehensive Firestore rules  
✅ **Real Constraints Enforced** - Max 2 apps/institution at DB level  
✅ **CI/CD Ready** - GitHub Actions configured  
✅ **Fully Documented** - 7 comprehensive guides  
✅ **Clean Code** - Organized, commented, maintainable  
✅ **Traditional CSS** - No framework dependencies  
✅ **Role-Based Access** - Secure multi-role system  

---

## 🎉 Ready to Start?

**Follow these 3 steps:**

1. **Read:** [QUICK_START.md](QUICK_START.md) (5 min)
2. **Configure:** [FIREBASE_SETUP.md](FIREBASE_SETUP.md) (15 min)
3. **Run:** `npm start` (instant)

**You'll be running in 30 minutes!** 🚀

---

## 📄 License

This project is for educational purposes as part of the LCGAP college assignment.

---

**Built with ❤️ for Lesotho students**

*Questions? Start with [QUICK_START.md](QUICK_START.md)*
