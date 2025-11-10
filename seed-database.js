/**
 * Seed Script for LCGAP Application
 * Creates test data for institutions, companies, jobs, and applications
 * 
 * IMPORTANT: Before running this script:
 * 1. Login to Firebase Console
 * 2. Go to Firestore Database > Rules
 * 3. Temporarily change rules to: allow read, write: if true;
 * 4. Run this script
 * 5. Change rules back to secure rules
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

// Firebase configuration - replace with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyBgwW3gxuTF5OzPhUz6wCLlzC3D3HLfH-4",
  authDomain: "lcga-3c71f.firebaseapp.com",
  projectId: "lcga-3c71f",
  storageBucket: "lcga-3c71f.firebasestorage.app",
  messagingSenderId: "479536993944",
  appId: "1:479536993944:web:e8d86c1e3ca7e6d94e75d2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Test data
const testInstitutions = [];

const testCompanies = [];

const testStudents = [];

const testCourses = [];

const testJobs = [];

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // 1. Create Institutions (check for duplicates)
    console.log('📚 Creating institutions...');
    const institutionIds = [];
    for (const institution of testInstitutions) {
      // Check if institution already exists
      const q = query(collection(db, 'institutions'), where('name', '==', institution.name));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        const docRef = await addDoc(collection(db, 'institutions'), {
          ...institution,
          createdAt: Timestamp.now(),
          isActive: true
        });
        institutionIds.push(docRef.id);
        console.log(`   ✓ Created: ${institution.name} (${docRef.id})`);
      } else {
        institutionIds.push(snapshot.docs[0].id);
        console.log(`   ⊙ Already exists: ${institution.name} (${snapshot.docs[0].id})`);
      }
    }

    // 2. Create Courses for each institution (check for duplicates)
    console.log('\n📖 Creating courses...');
    const courseIds = [];
    for (let i = 0; i < institutionIds.length; i++) {
      const institutionId = institutionIds[i];
      const course = testCourses[i];
      
      // Check if course already exists for this institution
      const q = query(
        collection(db, 'courses'), 
        where('name', '==', course.name),
        where('institutionId', '==', institutionId)
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        const docRef = await addDoc(collection(db, 'courses'), {
          ...course,
          institutionId: institutionId,
          institutionName: testInstitutions[i].name,
          createdAt: Timestamp.now(),
          isActive: true,
          availableSlots: 50
        });
        courseIds.push({ id: docRef.id, institutionId });
        console.log(`   ✓ Created: ${course.name} at ${testInstitutions[i].shortName}`);
      } else {
        courseIds.push({ id: snapshot.docs[0].id, institutionId });
        console.log(`   ⊙ Already exists: ${course.name} at ${testInstitutions[i].shortName}`);
      }
    }

    // 3. Create Companies (check for duplicates)
    console.log('\n🏢 Creating companies...');
    const companyIds = [];
    for (const company of testCompanies) {
      // Check if company already exists
      const q = query(collection(db, 'companies'), where('name', '==', company.name));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        const docRef = await addDoc(collection(db, 'companies'), {
          ...company,
          createdAt: Timestamp.now(),
          isActive: true
        });
        companyIds.push(docRef.id);
        console.log(`   ✓ Created: ${company.name} (${docRef.id})`);
      } else {
        companyIds.push(snapshot.docs[0].id);
        console.log(`   ⊙ Already exists: ${company.name} (${snapshot.docs[0].id})`);
      }
    }

    // 4. Create Students and their user profiles
    console.log('\n👨‍🎓 Creating student accounts...');
    const studentIds = [];
    for (const student of testStudents) {
      try {
        // Create auth account
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          student.email,
          student.password
        );
        const uid = userCredential.user.uid;
        
        // Create user profile in Firestore
        await setDoc(doc(db, 'users', uid), {
          email: student.email,
          displayName: student.displayName,
          role: student.role,
          phone: student.phone,
          academicPerformance: student.academicPerformance,
          field: student.field,
          workExperience: student.workExperience,
          createdAt: Timestamp.now()
        });
        
        studentIds.push({ uid, ...student });
        console.log(`   ✓ Created: ${student.displayName} (${student.email})`);
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`   ⚠ Skipped: ${student.email} (already exists)`);
        } else {
          console.error(`   ✗ Error creating ${student.email}:`, error.message);
        }
      }
    }

    // 5. Create Jobs for each company (check for duplicates)
    console.log('\n💼 Creating job postings...');
    const jobIds = [];
    for (let i = 0; i < companyIds.length && i < testJobs.length; i++) {
      const companyId = companyIds[i];
      const job = testJobs[i];
      
      // Check if job already exists for this company
      const q = query(
        collection(db, 'jobs'),
        where('title', '==', job.title),
        where('companyId', '==', companyId)
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        const docRef = await addDoc(collection(db, 'jobs'), {
          ...job,
          companyId: companyId,
          companyName: testCompanies[i].name,
          createdAt: Timestamp.now(),
          isActive: true,
          applicantCount: 0
        });
        jobIds.push({ id: docRef.id, companyId });
        console.log(`   ✓ Created: ${job.title} at ${testCompanies[i].name}`);
      } else {
        jobIds.push({ id: snapshot.docs[0].id, companyId });
        console.log(`   ⊙ Already exists: ${job.title} at ${testCompanies[i].name}`);
      }
    }

    // 6. Create Course Applications
    console.log('\n📝 Creating course applications...');
    let appCount = 0;
    
    for (const student of studentIds) {
      // Group courses by institution
      const coursesByInstitution = {};
      courseIds.forEach(course => {
        if (!coursesByInstitution[course.institutionId]) {
          coursesByInstitution[course.institutionId] = [];
        }
        coursesByInstitution[course.institutionId].push(course);
      });
      
      // Each student applies to 2-4 institutions
      const numInstitutions = Math.floor(Math.random() * 3) + 2; // 2-4 institutions
      const selectedInstitutionIds = Object.keys(coursesByInstitution)
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(numInstitutions, Object.keys(coursesByInstitution).length));
      
      // For each selected institution, apply to 1-2 courses (max 2 per institution)
      for (const institutionId of selectedInstitutionIds) {
        const institutionCourses = coursesByInstitution[institutionId];
        const numCoursesAtInstitution = Math.floor(Math.random() * 2) + 1; // 1-2 courses
        const selectedCourses = institutionCourses
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.min(numCoursesAtInstitution, institutionCourses.length));
        
        for (const course of selectedCourses) {
          // Check if application already exists
          const appId = `${course.institutionId}_${student.uid}_${course.id}`;
          const q = query(
            collection(db, 'applications'),
            where('studentId', '==', student.uid),
            where('courseId', '==', course.id),
            where('institutionId', '==', course.institutionId)
          );
          const snapshot = await getDocs(q);
          
          if (snapshot.empty) {
            // Varied statuses including waiting list
            const statuses = ['pending', 'pending', 'accepted', 'rejected', 'waiting'];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            const institution = testInstitutions.find((_, idx) => institutionIds[idx] === course.institutionId);
            const courseData = testCourses[courseIds.findIndex(c => c.id === course.id)];
            
            await setDoc(doc(db, 'applications', appId), {
              studentId: student.uid,
              studentName: student.displayName,
              studentEmail: student.email,
              courseId: course.id,
              institutionId: course.institutionId,
              institutionName: institution?.name || 'Unknown Institution',
              courseName: courseData?.name || 'Unknown Course',
              status: status,
              motivation: `I am very interested in pursuing this course because it aligns with my career goals in ${student.field}. My academic performance (GPA: ${student.academicPerformance.gpa}) and ${student.workExperience.length} work experience(s) make me a strong candidate. I believe this program will help me achieve my professional objectives.`,
              documents: [],
              previousEducation: `${student.academicPerformance.level} in ${student.field}`,
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now()
            });
            appCount++;
          }
        }
      }
    }
    console.log(`   ✓ Created ${appCount} course applications (max 2 per institution, multiple institutions per student)`);

    // 7. Create Job Applications (check for duplicates)
    console.log('\n💼 Creating job applications...');
    let jobAppCount = 0;
    for (const student of studentIds) {
      // Each student applies to 1-3 jobs
      const numJobApps = Math.floor(Math.random() * 3) + 1;
      const selectedJobs = jobIds.sort(() => 0.5 - Math.random()).slice(0, numJobApps);
      
      for (const job of selectedJobs) {
        // Check if job application already exists
        const appId = `${job.id}_${student.uid}`;
        const q = query(
          collection(db, 'jobApplications'),
          where('studentId', '==', student.uid),
          where('jobId', '==', job.id)
        );
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          await setDoc(doc(db, 'jobApplications', appId), {
            studentId: student.uid,
            studentName: student.displayName,
            studentEmail: student.email,
            jobId: job.id,
            companyId: job.companyId,
            coverLetter: `Dear Hiring Manager,\n\nI am writing to express my interest in this position. With my background in ${student.field} and ${student.workExperience.length} previous work experiences, I believe I would be a valuable addition to your team.\n\nBest regards,\n${student.displayName}`,
            resume: 'resume.pdf',
            academicPerformance: student.academicPerformance,
            workExperience: student.workExperience,
            status: 'pending',
            createdAt: Timestamp.now()
          });
          jobAppCount++;
        }
      }
    }
    console.log(`   ✓ Created ${jobAppCount} job applications`);

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Institutions: ${institutionIds.length}`);
    console.log(`   - Courses: ${courseIds.length}`);
    console.log(`   - Companies: ${companyIds.length}`);
    console.log(`   - Jobs: ${jobIds.length}`);
    console.log(`   - Students: ${studentIds.length}`);
    console.log(`   - Course Applications: ${appCount} (each student applies to 2-4 institutions, max 2 courses per institution)`);
    console.log(`   - Job Applications: ${jobAppCount}`);
    console.log('\n📋 Application Statuses:');
    console.log('   - Pending: Under review by institution');
    console.log('   - Accepted: Admission granted');
    console.log('   - Rejected: Application denied');
    console.log('   - Waiting: On waiting list (can be promoted to accepted)');
    console.log('\n🔑 Test Student Credentials:');
    testStudents.forEach(s => {
      console.log(`   ${s.displayName}: ${s.email} / ${s.password}`);
    });

  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
  }
}

// Run the seed function
seedDatabase();
