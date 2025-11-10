# 🚀 LCGAP Quick Start Checklist

Use this checklist to get LCGAP up and running quickly.

---

## ✅ Pre-Setup (5 minutes)

- [ ] Node.js 18+ installed? Check: `node --version`
- [ ] npm installed? Check: `npm --version`
- [ ] Git installed? Check: `git --version`
- [ ] Firebase account created at https://console.firebase.google.com
- [ ] Project folder open in VS Code or terminal

---

## ✅ Firebase Project Setup (10 minutes)

**Follow FIREBASE_SETUP.md for detailed steps**

- [ ] Created Firebase project at console.firebase.google.com
- [ ] Enabled Authentication (Email/Password sign-in method)
- [ ] Created Firestore Database (production mode)
- [ ] Enabled Cloud Storage
- [ ] Enabled Firebase Hosting
- [ ] Registered web app and copied config values
- [ ] Saved config values somewhere safe

---

## ✅ Local Setup (10 minutes)

### Install Dependencies
```powershell
cd "c:\Users\windows 10\Documents\New folder\LCGAP"
# Dependencies already installed ✅
```

### Configure Environment
- [ ] Created `.env.local` file:
  ```powershell
  Copy-Item .env.local.example .env.local
  ```
- [ ] Pasted Firebase config into `.env.local`
- [ ] Saved the file

### Firebase CLI Setup
- [ ] Installed Firebase CLI:
  ```powershell
  npm install -g firebase-tools
  ```
- [ ] Logged in to Firebase:
  ```powershell
  firebase login
  ```
- [ ] Connected project:
  ```powershell
  firebase use --add
  # Selected your project
  # Used alias: default
  ```

### Deploy Security Rules
- [ ] Deployed Firestore and Storage rules:
  ```powershell
  firebase deploy --only firestore:rules,storage:rules
  ```

---

## ✅ First Run (5 minutes)

### Start the App
- [ ] Started development server:
  ```powershell
  npm start
  ```
- [ ] Browser opened to http://localhost:3000
- [ ] App loads without errors

### Create First Account
- [ ] Clicked "Sign up here"
- [ ] Filled out signup form
- [ ] Received verification email
- [ ] Clicked verification link in email
- [ ] Logged in successfully

---

## ✅ Admin Setup (5 minutes)

**Choose ONE method:**

### Method A: Firebase Console (Recommended)
- [ ] Opened Firebase Console → Authentication → Users
- [ ] Copied your User UID
- [ ] Opened Firestore Database
- [ ] Navigated to `users` collection → your user document
- [ ] Edited `role` field to `admin`
- [ ] Saved changes
- [ ] Logged out and logged back in
- [ ] Confirmed Admin Dashboard appears

### Method B: Admin Script
- [ ] Downloaded service account key from Firebase Console
- [ ] Saved as `serviceAccountKey.json` in project root
- [ ] Set environment variable:
  ```powershell
  $env:GOOGLE_APPLICATION_CREDENTIALS="$PWD\serviceAccountKey.json"
  ```
- [ ] Installed admin dependencies:
  ```powershell
  npm install firebase-admin
  ```
- [ ] Created admin user:
  ```powershell
  node admin-utils.js createAdmin admin@lcgap.ls Password123 "Admin User"
  ```
- [ ] Logged in with admin account

---

## ✅ Verify Everything Works (10 minutes)

### Test Student Flow
- [ ] Logged in as student
- [ ] Navigated to Institutions page
- [ ] Can see institutions list (even if empty)
- [ ] Dashboard loads correctly

### Test Admin Flow
- [ ] Logged in as admin
- [ ] Admin Dashboard shows statistics
- [ ] Can see all navigation links

### Check Console
- [ ] No errors in browser console (F12)
- [ ] No errors in terminal where `npm start` is running

---

## ✅ Production Deployment (Optional - 10 minutes)

### Build and Deploy
- [ ] Built production bundle:
  ```powershell
  npm run build
  ```
- [ ] Build completed without errors
- [ ] Deployed to Firebase Hosting:
  ```powershell
  firebase deploy --only hosting
  ```
- [ ] Visited live URL: `https://your-project-id.web.app`
- [ ] App works on production

---

## ✅ CI/CD Setup (Optional - 15 minutes)

### GitHub Repository
- [ ] Created GitHub repository
- [ ] Initialized git:
  ```powershell
  git init
  git add .
  git commit -m "Initial commit"
  git branch -M main
  ```
- [ ] Pushed to GitHub:
  ```powershell
  git remote add origin https://github.com/YOUR_USERNAME/lcgap.git
  git push -u origin main
  ```

### GitHub Secrets
- [ ] Added `FIREBASE_SERVICE_ACCOUNT` secret
- [ ] Added `FIREBASE_PROJECT_ID` secret
- [ ] Added all `REACT_APP_FIREBASE_*` secrets
- [ ] GitHub Actions workflow file exists at `.github/workflows/firebase-hosting.yml`

### Test Deployment
- [ ] Made a small change and pushed to main
- [ ] GitHub Actions ran successfully
- [ ] Changes appeared on live site

---

## 🎯 Next Steps

### Immediate
- [ ] Read through CONFIGURATION_GUIDE.md
- [ ] Explore the admin dashboard
- [ ] Create test institution data
- [ ] Create test student accounts
- [ ] Test the application flow

### Development
- [ ] Review PROJECT_STRUCTURE.md
- [ ] Understand the data model
- [ ] Review security rules in firestore.rules
- [ ] Start building additional features

### Production
- [ ] Add custom domain (optional)
- [ ] Enable monitoring and analytics
- [ ] Test on mobile devices
- [ ] Create user documentation
- [ ] Plan content (institutions, courses)

---

## 🆘 Troubleshooting

If something doesn't work, check:

1. **Environment Variables**
   - [ ] `.env.local` exists
   - [ ] All variables are set correctly
   - [ ] Restarted dev server after creating .env.local

2. **Firebase Rules**
   - [ ] Rules deployed: `firebase deploy --only firestore:rules`
   - [ ] No syntax errors in Firebase Console → Firestore → Rules

3. **Email Verification**
   - [ ] Checked email inbox and spam folder
   - [ ] Clicked verification link
   - [ ] Logged out and logged back in after verifying

4. **Dependencies**
   - [ ] All dependencies installed: `npm install`
   - [ ] No errors during installation
   - [ ] Node version is 18+

5. **Firebase CLI**
   - [ ] Logged in: `firebase login`
   - [ ] Project selected: `firebase use --add`
   - [ ] Can run: `firebase projects:list`

---

## 📊 Success Criteria

Your setup is complete when:

✅ App runs locally without errors
✅ Can create and verify user accounts  
✅ Admin dashboard accessible  
✅ No errors in browser console  
✅ Firestore rules deployed  
✅ Can navigate all pages  
✅ (Optional) Deployed to Firebase Hosting  
✅ (Optional) GitHub Actions working  

---

## 📚 Reference Documents

- 📘 **README.md** - Project overview
- 🔥 **FIREBASE_SETUP.md** - Firebase configuration details
- ⚙️ **CONFIGURATION_GUIDE.md** - Complete setup guide
- 📂 **PROJECT_STRUCTURE.md** - File organization
- ✅ **QUICK_START.md** - This file!

---

## 🎉 Congratulations!

If all checkboxes are ticked, you have successfully set up LCGAP!

**Time to start developing!** 🚀

---

**Need help?** Review the troubleshooting section or detailed guides above.
