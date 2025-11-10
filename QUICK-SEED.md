# Quick Seed Instructions

Since the automated seed script requires special permissions, here's a manual approach to create test data:

## Option 1: Temporary Open Rules (Recommended for Testing)

1. **Open Firebase Console**: https://console.firebase.google.com/project/lcga-3c71f/firestore/rules

2. **Temporarily change Firestore rules** to:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // TEMPORARY - FOR SEEDING ONLY
    }
  }
}
```

3. **Publish the rules**

4. **Run the seed script**:
```bash
node seed-database.js
```

5. **IMPORTANT: Restore your secure rules** after seeding is complete!

## Option 2: Manual Data Creation via Firebase Console

1. Go to Firebase Console > Firestore Database
2. Create collections manually with sample data

### Create a Company:
Collection: `companies`
Document ID: auto
```json
{
  "name": "Test Company Ltd",
  "industry": "Technology",
  "location": "Maseru, Lesotho",
  "email": "hr@testcompany.co.ls",
  "phone": "+266 5000 0000",
  "createdAt": <timestamp>,
  "isActive": true
}
```

### Create Jobs:
Collection: `jobs`
```json
{
  "title": "Software Developer",
  "type": "Full-time",
  "description": "We need a developer...",
  "salary": {
    "min": 8000,
    "max": 15000,
    "currency": "LSL"
  },
  "location": "Maseru",
  "deadline": "2025-12-31",
  "companyId": "<your-company-doc-id>",
  "companyName": "Test Company Ltd",
  "createdAt": <timestamp>
}
```

### Create Job Applications:
Collection: `jobApplications`
```json
{
  "studentId": "mrboon832@gmail.com-uid",
  "studentName": "Test Student",
  "studentEmail": "student@test.com",
  "jobId": "<job-doc-id>",
  "companyId": "<company-doc-id>",
  "academicPerformance": {
    "gpa": 3.8,
    "grade": "A"
  },
  "workExperience": [
    {
      "title": "Developer",
      "company": "ABC",
      "duration": "1 year"
    }
  ],
  "status": "pending",
  "coverLetter": "I am interested...",
  "createdAt": <timestamp>
}
```

## Option 3: Use Your Existing Account

You can test with your current account (mrboon832@gmail.com):

1. Create a company profile for your user
2. Post some jobs through the UI
3. Have test students apply

## Recommended Quick Test:

1. Use Option 1 (temporary open rules)
2. Run: `node seed-database.js`
3. This will create:
   - 3 institutions
   - 3 companies 
   - 4 jobs
   - 5 students with applications
4. Restore secure rules
5. Test accept/reject features!

The seed script creates students with varying qualifications so you can test the automatic scoring system.
