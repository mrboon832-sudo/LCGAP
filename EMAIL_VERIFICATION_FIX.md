## Email Verification Troubleshooting Guide

### Issue: Verification emails not being sent

### Quick Fixes:

#### 1. CHECK FIREBASE AUTHENTICATION SETTINGS
Go to Firebase Console: https://console.firebase.google.com
1. Select your project: **lcga-3c71f**
2. Go to **Build → Authentication**
3. Click **Sign-in method** tab
4. Make sure **Email/Password** is ENABLED (toggle should be ON)
5. Click on Email/Password provider
6. Check **Email link (passwordless sign-in)** settings

#### 2. VERIFY EMAIL TEMPLATE IS ENABLED
1. In Firebase Console → Authentication → Templates tab
2. Find "Email address verification"
3. Make sure it's enabled
4. Customize the template if needed (optional)

#### 3. CHECK AUTHORIZED DOMAINS
1. Firebase Console → Authentication → Settings tab
2. Scroll to **Authorized domains**
3. Make sure these are listed:
   - localhost
   - lcga-3c71f.firebaseapp.com
   - lcga-3c71f.web.app

#### 4. CHECK SPAM FOLDER
- Verification emails often end up in spam
- Check your spam/junk folder
- Add noreply@lcga-3c71f.firebaseapp.com to your contacts

#### 5. WAIT A FEW MINUTES
- Sometimes Firebase emails are delayed
- Can take 2-5 minutes to arrive
- Check inbox and spam periodically

### Alternative: Manual Email Verification (FOR TESTING ONLY)

If you need to test immediately, you can verify emails manually using the admin script:

```powershell
# 1. Download service account key from Firebase Console
# Project Settings → Service accounts → Generate new private key

# 2. Save as serviceAccountKey.json in project root

# 3. Set environment variable
$env:GOOGLE_APPLICATION_CREDENTIALS="$PWD\serviceAccountKey.json"

# 4. Install firebase-admin
npm install firebase-admin

# 5. Verify user email manually
node admin-utils.js verifyEmail your-email@example.com
```

### Test Email Sending:

Try signing up with a different email address or use:
- Gmail (usually most reliable)
- Outlook/Hotmail
- Your school email

### Check Firebase Quotas:

Firebase has free tier limits:
- Email verifications: 10,000/day (should be plenty)
- Check Firebase Console → Usage tab

### Enable Debug Mode:

Let me update the Signup component to show better error messages...
