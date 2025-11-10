import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

// User operations
export const createUserProfile = async (uid, data) => {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    ...data,
    createdAt: serverTimestamp()
  });
};

export const getUserProfile = async (uid) => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } : null;
};

export const updateUserProfile = async (uid, data) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, data);
};

// Institution operations
export const createInstitution = async (data) => {
  const instRef = doc(collection(db, 'institutions'));
  await setDoc(instRef, {
    ...data,
    createdAt: serverTimestamp()
  });
  return instRef.id;
};

export const getInstitutions = async () => {
  const q = query(collection(db, 'institutions'), orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getInstitution = async (instId) => {
  const instRef = doc(db, 'institutions', instId);
  const instSnap = await getDoc(instRef);
  return instSnap.exists() ? { id: instSnap.id, ...instSnap.data() } : null;
};

export const updateInstitution = async (instId, data) => {
  const instRef = doc(db, 'institutions', instId);
  await updateDoc(instRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

export const deleteInstitution = async (instId) => {
  const instRef = doc(db, 'institutions', instId);
  await deleteDoc(instRef);
};

// Faculty operations
export const createFaculty = async (institutionId, data) => {
  const facultyRef = doc(collection(db, 'institutions', institutionId, 'faculties'));
  await setDoc(facultyRef, {
    ...data,
    createdAt: serverTimestamp()
  });
  return facultyRef.id;
};

export const getFaculties = async (institutionId) => {
  const q = query(
    collection(db, 'institutions', institutionId, 'faculties'),
    orderBy('name')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getFaculty = async (institutionId, facultyId) => {
  const facultyRef = doc(db, 'institutions', institutionId, 'faculties', facultyId);
  const facultySnap = await getDoc(facultyRef);
  return facultySnap.exists() ? { id: facultySnap.id, ...facultySnap.data() } : null;
};

export const updateFaculty = async (institutionId, facultyId, data) => {
  const facultyRef = doc(db, 'institutions', institutionId, 'faculties', facultyId);
  await updateDoc(facultyRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

export const deleteFaculty = async (institutionId, facultyId) => {
  const facultyRef = doc(db, 'institutions', institutionId, 'faculties', facultyId);
  await deleteDoc(facultyRef);
};

// Course operations
export const createCourse = async (institutionId, facultyId, data) => {
  const courseRef = doc(collection(db, 'institutions', institutionId, 'faculties', facultyId, 'courses'));
  await setDoc(courseRef, {
    ...data,
    institutionId,
    facultyId,
    createdAt: serverTimestamp()
  });
  return courseRef.id;
};

export const getCourses = async (institutionId, facultyId) => {
  const q = query(
    collection(db, 'institutions', institutionId, 'faculties', facultyId, 'courses'),
    orderBy('name')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getCourse = async (institutionId, facultyId, courseId) => {
  const courseRef = doc(db, 'institutions', institutionId, 'faculties', facultyId, 'courses', courseId);
  const courseSnap = await getDoc(courseRef);
  return courseSnap.exists() ? { id: courseSnap.id, ...courseSnap.data() } : null;
};

export const updateCourse = async (institutionId, facultyId, courseId, data) => {
  const courseRef = doc(db, 'institutions', institutionId, 'faculties', facultyId, 'courses', courseId);
  await updateDoc(courseRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

export const deleteCourse = async (institutionId, facultyId, courseId) => {
  const courseRef = doc(db, 'institutions', institutionId, 'faculties', facultyId, 'courses', courseId);
  await deleteDoc(courseRef);
};

// Application operations - enforces 2 per institution limit
export const applyToCourse = async (studentId, institutionId, courseId, applicationData) => {
  const batch = writeBatch(db);

  // Create deterministic application ID
  const appId = `${institutionId}_${studentId}_${courseId}`;
  const appRef = doc(db, 'applications', appId);

  // Check if application already exists
  const appSnap = await getDoc(appRef);
  if (appSnap.exists()) {
    throw new Error('You have already applied to this course');
  }

  // Get or create applicationsByInstitution doc
  const instAppRef = doc(db, 'users', studentId, 'applicationsByInstitution', institutionId);
  const instAppSnap = await getDoc(instAppRef);

  let courseIds = [];
  if (instAppSnap.exists()) {
    courseIds = instAppSnap.data().courseIds || [];
    if (courseIds.length >= 2) {
      throw new Error('You can only apply to 2 courses per institution');
    }
    if (courseIds.includes(courseId)) {
      throw new Error('You have already applied to this course');
    }
  }

  // Add course to array
  courseIds.push(courseId);

  // Batch write: application + update count
  batch.set(appRef, {
    studentId,
    institutionId,
    courseId,
    status: 'pending',
    appliedAt: serverTimestamp(),
    ...applicationData
  });

  batch.set(instAppRef, {
    courseIds,
    updatedAt: serverTimestamp()
  }, { merge: true });

  await batch.commit();
  return appId;
};

export const getStudentApplications = async (studentId) => {
  const q = query(
    collection(db, 'applications'),
    where('studentId', '==', studentId)
  );
  const snapshot = await getDocs(q);
  const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  // Sort by appliedAt or createdAt on client side
  return apps.sort((a, b) => {
    const aTime = a.appliedAt?.seconds || a.createdAt?.seconds || 0;
    const bTime = b.appliedAt?.seconds || b.createdAt?.seconds || 0;
    return bTime - aTime;
  });
};

export const getInstitutionApplications = async (institutionId) => {
  const q = query(
    collection(db, 'applications'),
    where('institutionId', '==', institutionId)
  );
  const snapshot = await getDocs(q);
  const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  // Sort by appliedAt or createdAt on client side
  return apps.sort((a, b) => {
    const aTime = a.appliedAt?.seconds || a.createdAt?.seconds || 0;
    const bTime = b.appliedAt?.seconds || b.createdAt?.seconds || 0;
    return bTime - aTime;
  });
};

export const updateApplicationStatus = async (appId, status, options = {}) => {
  const appRef = doc(db, 'applications', appId);
  const appSnap = await getDoc(appRef);
  
  if (!appSnap.exists()) {
    throw new Error('Application not found');
  }
  
  const appData = appSnap.data();
  
  // If changing to 'accepted', check for existing final admission
  if (status === 'accepted') {
    // Check if student already has an accepted admission
    const existingAcceptedQuery = query(
      collection(db, 'applications'),
      where('studentId', '==', appData.studentId),
      where('status', '==', 'accepted')
    );
    const existingAccepted = await getDocs(existingAcceptedQuery);
    
    if (!existingAccepted.empty) {
      throw new Error('Student already has an accepted admission. Only one final admission is allowed.');
    }
  }
  
  // Update the application status
  await updateDoc(appRef, {
    status,
    updatedAt: serverTimestamp(),
    ...(options.acceptedBy && { acceptedBy: options.acceptedBy }),
    ...(options.acceptedAt && { acceptedAt: options.acceptedAt })
  });
  
  // If student rejects an accepted offer, promote from waiting list
  if (status === 'rejected' && appData.status === 'accepted') {
    await promoteFromWaitingList(appData.institutionId, appData.courseId);
  }
};

// Helper function to promote next student from waiting list
const promoteFromWaitingList = async (institutionId, courseId) => {
  // Find oldest waiting list application for this course
  const waitingQuery = query(
    collection(db, 'applications'),
    where('institutionId', '==', institutionId),
    where('courseId', '==', courseId),
    where('status', '==', 'waiting'),
    orderBy('createdAt', 'asc'),
    limit(1)
  );
  
  const waitingSnap = await getDocs(waitingQuery);
  
  if (!waitingSnap.empty) {
    const waitingApp = waitingSnap.docs[0];
    // Promote to accepted
    await updateDoc(doc(db, 'applications', waitingApp.id), {
      status: 'accepted',
      promotedFromWaiting: true,
      updatedAt: serverTimestamp()
    });
    
    // Create notification for promoted student
    await createNotification({
      userId: waitingApp.data().studentId,
      type: 'admission_promoted',
      title: 'Promoted from Waiting List',
      message: `You have been promoted from the waiting list and admitted to ${waitingApp.data().courseName} at ${waitingApp.data().institutionName}!`,
      link: '/applications',
      read: false
    });
  }
};

// Company operations
export const createCompany = async (data) => {
  const companyRef = doc(collection(db, 'companies'));
  await setDoc(companyRef, {
    ...data,
    createdAt: serverTimestamp()
  });
  return companyRef.id;
};

export const getCompanies = async () => {
  const q = query(collection(db, 'companies'), orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Job operations
export const createJob = async (companyId, data) => {
  const jobRef = doc(collection(db, 'jobs'));
  await setDoc(jobRef, {
    ...data,
    companyId,
    createdAt: serverTimestamp()
  });
  return jobRef.id;
};

export const getJobs = async (filters = {}) => {
  let q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
  
  if (filters.companyId) {
    q = query(q, where('companyId', '==', filters.companyId));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getJob = async (jobId) => {
  const jobRef = doc(db, 'jobs', jobId);
  const jobSnap = await getDoc(jobRef);
  return jobSnap.exists() ? { id: jobSnap.id, ...jobSnap.data() } : null;
};

export const updateJob = async (jobId, data) => {
  const jobRef = doc(db, 'jobs', jobId);
  await updateDoc(jobRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

export const deleteJob = async (jobId) => {
  const jobRef = doc(db, 'jobs', jobId);
  await deleteDoc(jobRef);
};

// Job application operations
export const applyToJob = async (studentId, jobId, applicationData) => {
  const appId = `${jobId}_${studentId}`;
  const appRef = doc(db, 'jobApplications', appId);

  // Check if already applied
  const appSnap = await getDoc(appRef);
  if (appSnap.exists()) {
    throw new Error('You have already applied to this job');
  }

  await setDoc(appRef, {
    studentId,
    jobId,
    status: 'pending',
    appliedAt: serverTimestamp(),
    ...applicationData
  });
  return appId;
};

export const getJobApplications = async (jobId) => {
  const q = query(
    collection(db, 'jobApplications'),
    where('jobId', '==', jobId)
  );
  const snapshot = await getDocs(q);
  const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  // Sort by appliedAt or createdAt on client side
  return apps.sort((a, b) => {
    const aTime = a.appliedAt?.seconds || a.createdAt?.seconds || 0;
    const bTime = b.appliedAt?.seconds || b.createdAt?.seconds || 0;
    return bTime - aTime;
  });
};

export const getStudentJobApplications = async (studentId) => {
  const q = query(
    collection(db, 'jobApplications'),
    where('studentId', '==', studentId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateJobApplicationStatus = async (appId, status) => {
  const appRef = doc(db, 'jobApplications', appId);
  await updateDoc(appRef, {
    status,
    updatedAt: serverTimestamp()
  });
};

export const deleteJobApplication = async (appId) => {
  const appRef = doc(db, 'jobApplications', appId);
  await deleteDoc(appRef);
};

// Get all job applications for a company
export const getCompanyJobApplications = async (companyId) => {
  // First get all jobs for this company
  const jobsQuery = query(collection(db, 'jobs'), where('companyId', '==', companyId));
  const jobsSnapshot = await getDocs(jobsQuery);
  const jobIds = jobsSnapshot.docs.map(doc => doc.id);
  
  if (jobIds.length === 0) return [];
  
  // Get all applications for these jobs
  const applicationsPromises = jobIds.map(jobId => getJobApplications(jobId));
  const applicationsArrays = await Promise.all(applicationsPromises);
  
  // Flatten and return
  return applicationsArrays.flat();
};

// Notification operations
export const createNotification = async (data) => {
  const notifRef = doc(collection(db, 'notifications'));
  await setDoc(notifRef, {
    ...data,
    createdAt: serverTimestamp()
  });
  return notifRef.id;
};

export const getUserNotifications = async (userId) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const markNotificationAsRead = async (notificationId) => {
  const notifRef = doc(db, 'notifications', notificationId);
  await updateDoc(notifRef, {
    read: true,
    readAt: serverTimestamp()
  });
};

export const deleteNotification = async (notificationId) => {
  const notifRef = doc(db, 'notifications', notificationId);
  await deleteDoc(notifRef);
};
