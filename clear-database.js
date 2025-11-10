/**
 * Clear Script for LCGAP Application
 * Deletes all data from Firestore collections
 * 
 * IMPORTANT: Before running this script:
 * 1. Login to Firebase Console
 * 2. Go to Firestore Database > Rules
 * 3. Temporarily change rules to: allow read, write: if true;
 * 4. Run this script
 * 5. Change rules back to secure rules
 * 
 * WARNING: This will delete ALL data from your database!
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

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

const collections = [
  'institutions',
  'courses',
  'faculties',
  'companies',
  'jobs',
  'users',
  'applications',
  'jobApplications',
  'notifications'
];

async function clearDatabase() {
  console.log('🗑️  Starting database clearing...\n');
  console.log('⚠️  WARNING: This will delete ALL data from your database!\n');

  try {
    for (const collectionName of collections) {
      console.log(`🔍 Clearing collection: ${collectionName}...`);
      
      const querySnapshot = await getDocs(collection(db, collectionName));
      const deletePromises = [];
      
      querySnapshot.forEach((document) => {
        deletePromises.push(deleteDoc(doc(db, collectionName, document.id)));
      });
      
      await Promise.all(deletePromises);
      console.log(`   ✓ Deleted ${deletePromises.length} documents from ${collectionName}`);
    }

    console.log('\n✅ Database cleared successfully!\n');
    console.log('📊 Summary:');
    collections.forEach(col => {
      console.log(`   - ${col}: cleared`);
    });
    console.log('\n⚠️  Note: Firebase Auth users must be deleted manually from Firebase Console');
    console.log('   Go to: Firebase Console > Authentication > Users > Delete users');

  } catch (error) {
    console.error('\n❌ Error clearing database:', error);
  }
}

// Run the clear function
clearDatabase();
