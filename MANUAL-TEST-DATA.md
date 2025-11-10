# Manual Test Data for Applications

Since the automated student creation requires Firebase Auth setup, here's how to manually test the new application features:

## Quick Test Setup

### Option 1: Use Your Existing Account

1. Login with your account (mrboon832@gmail.com)
2. Update your profile to include:
   - Academic Performance (GPA/Grade)
   - Field of study
   - Work experience

3. Manually create some applications in Firebase Console:

**Course Application Example:**
```
Collection: applications
{
  "studentId": "your-uid",
  "studentName": "Your Name",
  "studentEmail": "your-email@gmail.com",
  "courseId": "99FxALk4d6878KjjBDyN",
  "institutionId": "99FxALk4d6878KjjBDyN",
  "institutionName": "National University of Lesotho",
  "courseName": "Bachelor of Science in Computer Science",
  "status": "pending" or "accepted" or "rejected" or "waiting",
  "motivation": "I am very interested in pursuing this course...",
  "previousEducation": "High School Diploma",
  "createdAt": <timestamp>,
  "updatedAt": <timestamp>
}
```

**Job Application Example:**
```
Collection: jobApplications
{
  "studentId": "your-uid",
  "studentName": "Your Name",
  "studentEmail": "your-email@gmail.com",
  "jobId": "job-doc-id",
  "companyId": "W8JrF294wz6aNyZkymOC",
  "jobTitle": "Software Developer",
  "companyName": "Econet Telecom Lesotho",
  "coverLetter": "Dear Hiring Manager...",
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
  "createdAt": <timestamp>
}
```

### Option 2: Test with Seeded Data

The seed script successfully created:
- ✅ 3 Institutions with courses
- ✅ 3 Companies with 3 job postings

**Created Jobs:**
1. Software Developer at Econet Telecom Lesotho
2. Accountant at Lesotho Electricity Company
3. Marketing Coordinator at Standard Lesotho Bank

**Created Institutions:**
1. National University of Lesotho - Computer Science
2. Lesotho College of Education - Business Administration
3. Limkokwing University - Education Diploma

### Testing the New Features

#### Test Multiple Institution Applications:
1. Apply to NUL for Computer Science
2. Apply to NUL for another course (should allow - max 2 per institution)
3. Apply to LCE for Business Admin
4. Apply to LCE for another course
5. Try to apply to 3rd course at same institution (should be prevented in future validation)

#### Test Waiting List Status:
Create applications with `status: "waiting"` to test:
- Institution can promote from waiting list to accepted
- Student can see "On Waiting List" badge
- Different UI treatment for waiting list applications

#### Test Application Statuses:
- **pending**: Yellow badge, "Under Review"
- **accepted**: Green badge, "Admitted"
- **rejected**: Red badge, "Rejected"
- **waiting**: Blue badge, "Waiting List"

## Key Updates in Seed Script

### Application Logic:
```javascript
// Each student applies to 2-4 different institutions
// Maximum of 2 courses per institution (enforced)
// Statuses: pending, accepted, rejected, waiting
```

### Application Structure:
```javascript
{
  studentId,
  studentName,
  studentEmail,
  courseId,
  institutionId,
  institutionName,
  courseName,
  status: "pending" | "accepted" | "rejected" | "waiting",
  motivation: "detailed motivation with GPA and experience",
  previousEducation: "Bachelor's/Diploma/etc",
  documents: [],
  createdAt,
  updatedAt
}
```

## Next Steps

1. **Test with existing accounts**: Use your current login to test the UI
2. **Manual data creation**: Add a few test applications via Firebase Console
3. **Test accept/reject**: Use institution dashboard to manage applications
4. **Test waiting list**: See how "waiting" status applications appear
5. **Test company applicants**: View qualified applicants with scoring system

The application system is now ready with:
✅ Multi-institution support
✅ Max 2 courses per institution rule
✅ Waiting list functionality
✅ Comprehensive application data structure
