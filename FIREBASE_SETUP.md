# Firebase Setup Quick Start

Follow these steps to configure your Firebase project for LCGAP.

## Step 1: Create Firebase Project (5 minutes)

1. Go to https://console.firebase.google.com
2. Click "**Add project**"
3. Enter project name: `lcgap` (or your choice)
4. Disable Google Analytics (optional for this project)
5. Click "**Create project**"

## Step 2: Enable Firebase Services (10 minutes)

### Authentication
1. In Firebase Console, go to **Build → Authentication**
2. Click "**Get started**"
3. Select "**Email/Password**" under Sign-in providers
4. Enable "**Email/Password**" (toggle on)
5. Click "**Save**"

### Firestore Database
1. Go to **Build → Firestore Database**
2. Click "**Create database**"
3. Select "**Start in production mode**" (we'll deploy rules separately)
4. Choose a location closest to Lesotho (e.g., `europe-west1` or `us-central1`)
5. Click "**Enable**"

### Storage
1. Go to **Build → Storage**
2. Click "**Get started**"
3. Select "**Start in production mode**"
4. Use the same location as Firestore
5. Click "**Done**"

### Hosting
1. Go to **Build → Hosting**
2. Click "**Get started**"
3. You can skip the installation steps (we'll do this via CLI)

## Step 3: Register Web App (3 minutes)

1. In Firebase Console, click the **gear icon** (⚙️) → **Project settings**
2. Scroll down to "**Your apps**"
3. Click the web icon (`</>`) to add a web app
4. Enter app nickname: `LCGAP Web`
5. **Check** "Also set up Firebase Hosting"
6. Click "**Register app**"
7. **IMPORTANT**: Copy the `firebaseConfig` object shown:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",              // Copy this
  authDomain: "...",              // Copy this
  projectId: "...",               // Copy this
  storageBucket: "...",           // Copy this
  messagingSenderId: "...",       // Copy this
  appId: "..."                    // Copy this
};
```

8. Save these values - you'll need them next!

## Step 4: Configure Local Environment (2 minutes)

1. Open your project folder in VS Code
2. Copy `.env.local.example` to `.env.local`:
   ```powershell
   Copy-Item .env.local.example .env.local
   ```

3. Edit `.env.local` and paste your Firebase config values:
   ```env
   REACT_APP_FIREBASE_API_KEY=AIzaSy...
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
   REACT_APP_FIREBASE_APP_ID=1:123456:web:abc123
   ```

4. Save the file

## Step 5: Install Dependencies (3 minutes)

```powershell
npm install
```

## Step 6: Firebase CLI Setup (5 minutes)

1. Install Firebase CLI globally (if not already installed):
   ```powershell
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```powershell
   firebase login
   ```

3. Initialize Firebase in your project:
   ```powershell
   firebase use --add
   ```
   - Select your Firebase project from the list
   - Enter alias: `default`

4. Deploy security rules:
   ```powershell
   firebase deploy --only firestore:rules,storage:rules
   ```

## Step 7: Create Admin User (5 minutes)

### Option A: Quick Manual Method (Recommended for testing)

1. Start the development server:
   ```powershell
   npm start
   ```

2. Open http://localhost:3000

3. Click "**Sign up here**" and create an account:
   - Full Name: Admin User
   - Email: admin@lcgap.ls
   - Password: (choose a secure password)
   - Account Type: Student (we'll change this)

4. Verify your email (check inbox)

5. Get your User ID from Firebase Console:
   - Go to **Authentication → Users**
   - Find your email and copy the **User UID**

6. In Firebase Console, go to **Firestore Database**

7. Find the `users` collection → click your user document

8. Click "**Edit field**" on the `role` field

9. Change value from `student` to `admin`

10. Click "**Update**"

11. Log out and log back in

### Option B: Using Admin Utilities Script

1. Download service account key:
   - Firebase Console → Project settings → Service accounts
   - Click "**Generate new private key**"
   - Save as `serviceAccountKey.json` in project root

2. Set environment variable:
   ```powershell
   $env:GOOGLE_APPLICATION_CREDENTIALS="$PWD\serviceAccountKey.json"
   ```

3. Install dependencies:
   ```powershell
   npm install firebase-admin
   ```

4. Create admin user:
   ```powershell
   node admin-utils.js createAdmin admin@lcgap.ls YourPassword123 "Admin User"
   ```

## Step 8: Test the Application (5 minutes)

1. Start development server:
   ```powershell
   npm start
   ```

2. Open http://localhost:3000

3. Login with your admin account

4. You should see the Admin Dashboard with statistics

5. Create test data:
   - As admin, add an institution
   - Add faculties and courses
   - Create a student account and test applications

## Step 9: Deploy to Production (5 minutes)

1. Build the production app:
   ```powershell
   npm run build
   ```

2. Deploy to Firebase Hosting:
   ```powershell
   firebase deploy
   ```

3. Your app will be live at:
   ```
   https://your-project-id.web.app
   ```

## Troubleshooting

### "Firebase config not found"
- Make sure `.env.local` exists and has all variables
- Restart the development server after creating `.env.local`

### "Permission denied" errors in Firestore
- Make sure you deployed the security rules: `firebase deploy --only firestore:rules`
- Check that your email is verified

### "Email not verified"
- Check your email inbox (and spam folder)
- Resend verification email from the app
- Or use admin utils to verify manually

### Build errors
- Delete `node_modules` and reinstall:
  ```powershell
  Remove-Item -Recurse -Force node_modules
  Remove-Item package-lock.json
  npm install
  ```

## Next Steps

1. ✅ Configure GitHub Actions for CI/CD (see README.md)
2. ✅ Add custom domain to Firebase Hosting
3. ✅ Set up monitoring and analytics
4. ✅ Create more admin users
5. ✅ Add sample institutions and courses
6. ✅ Test the full application flow

---

**Total Setup Time: ~45 minutes**

For detailed information, see the main [README.md](README.md)
