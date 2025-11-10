# Seed Database Script

This script populates your Firestore database with test data for testing the LCGAP application.

## What Gets Created

### 🏫 Institutions (3)
- National University of Lesotho (NUL)
- Lesotho College of Education (LCE)
- Limkokwing University (LUCT)

### 📚 Courses (3)
- Bachelor of Science in Computer Science
- Bachelor of Business Administration
- Diploma in Education

### 🏢 Companies (3)
- Econet Telecom Lesotho
- Lesotho Electricity Company
- Standard Lesotho Bank

### 💼 Jobs (4)
- Software Developer
- Accountant
- Marketing Coordinator
- Junior Engineer

### 👨‍🎓 Students (5)
With varying academic performance and work experience:
1. Thabo Mokoena (GPA: 3.8, 2 work experiences) - Computer Science
2. Mpho Mokone (GPA: 3.5, 1 work experience) - Business Administration
3. Lerato Thabane (GPA: 3.2, 0 work experiences) - Accounting
4. Tshepo Molefe (GPA: 3.9, 3 work experiences) - Engineering
5. Palesa Ramokoena (GPA: 2.8, 1 work experience) - Marketing

### 📝 Applications

**Course Applications:**
- Each student applies to 2-4 different institutions
- Maximum of 2 courses per institution (enforced)
- Statuses include: `pending`, `accepted`, `rejected`, `waiting` (waiting list)
- Total: ~10-20 course applications
- Realistic application patterns with proper motivation letters

**Job Applications:**
- Each student applies to 1-3 jobs
- All start as `pending` for qualification scoring
- Include cover letters, resume links, and availability
- Total: ~5-15 job applications

## How to Run

### Option 1: Using Node.js directly

1. Make sure you have Node.js installed
2. Install Firebase Admin SDK:
```bash
npm install firebase
```

3. Run the seed script:
```bash
node seed-database.js
```

### Option 2: Add to package.json scripts

Add this to your `package.json`:
```json
{
  "scripts": {
    "seed": "node seed-database.js"
  }
}
```

Then run:
```bash
npm run seed
```

## Test Credentials

After running the seed script, you can login with these accounts:

### Students
- **student1@test.com** / Test1234 (Thabo - High GPA, Good Experience)
- **student2@test.com** / Test1234 (Mpho - Good GPA, Some Experience)
- **student3@test.com** / Test1234 (Lerato - Average GPA, No Experience)
- **student4@test.com** / Test1234 (Tshepo - Excellent GPA, Extensive Experience)
- **student5@test.com** / Test1234 (Palesa - Low GPA, Minimal Experience)

## Testing Features

### For Institution Staff
1. Login to your institution account
2. Go to Applications page
3. You should see pending applications from students
4. Test **Accept** and **Reject** buttons

### For Company Staff
1. Login to your company account
2. Go to Applicants page (`/applicants`)
3. You should see job applications with:
   - Automatic qualification scores (0-100%)
   - Filtered applicants based on academic performance, work experience, and relevance
   - Qualified applicants (70%+ score) marked as "Ready for Interview"
4. Test filtering by qualification level
5. Test **Schedule Interview**, **Shortlist**, and **Reject** buttons

### For Students
1. Login with any student account
2. View your applications in the Applications page
3. See application statuses (Pending, Accepted, Rejected)

## Notes

- The script is idempotent for students - if a student email already exists, it will skip creation
- Applications are created with random statuses (mostly pending) to test the accept/reject functionality
- Job applications all start as "pending" so the qualification scoring system can be tested
- Each student applies to 1-2 courses and 1-3 jobs

## Troubleshooting

If you get authentication errors:
- Make sure Firebase Auth is enabled in your Firebase Console
- Check that email/password authentication is enabled
- Verify your Firebase config in the seed script matches your project

If Firestore errors occur:
- Check your Firestore security rules
- Make sure Firestore is enabled in your Firebase Console
- Verify you have proper permissions

## Clean Up

To remove test data, you can:
1. Use Firebase Console to manually delete collections
2. Or write a cleanup script to delete all seeded documents
