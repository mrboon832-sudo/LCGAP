/**
 * Admin Utilities for LCGAP
 * 
 * This script uses Firebase Admin SDK to set custom claims for admin users.
 * Run this script locally or as a one-time Cloud Function to bootstrap admin users.
 * 
 * Usage:
 * 1. Install: npm install firebase-admin
 * 2. Download service account key from Firebase Console
 * 3. Set environment variable: export GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccountKey.json"
 * 4. Run: node admin-utils.js setAdmin user@example.com
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

/**
 * Set admin custom claim for a user
 * @param {string} email - User's email address
 */
async function setAdminClaim(email) {
  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);
    
    // Set custom claim
    await admin.auth().setCustomUserClaims(user.uid, {
      admin: true
    });
    
    console.log(`✅ Admin claim set successfully for ${email} (UID: ${user.uid})`);
    console.log('⚠️  User must log out and log back in for changes to take effect.');
    
    return user.uid;
  } catch (error) {
    console.error('❌ Error setting admin claim:', error);
    throw error;
  }
}

/**
 * Remove admin custom claim from a user
 * @param {string} email - User's email address
 */
async function removeAdminClaim(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    
    await admin.auth().setCustomUserClaims(user.uid, {
      admin: false
    });
    
    console.log(`✅ Admin claim removed for ${email} (UID: ${user.uid})`);
    return user.uid;
  } catch (error) {
    console.error('❌ Error removing admin claim:', error);
    throw error;
  }
}

/**
 * Check if user has admin claim
 * @param {string} email - User's email address
 */
async function checkAdminClaim(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    const claims = (await admin.auth().getUser(user.uid)).customClaims || {};
    
    console.log(`User: ${email} (UID: ${user.uid})`);
    console.log(`Admin: ${claims.admin === true ? 'YES ✅' : 'NO ❌'}`);
    console.log('All custom claims:', claims);
    
    return claims;
  } catch (error) {
    console.error('❌ Error checking admin claim:', error);
    throw error;
  }
}

/**
 * Verify user's email (bypass email verification)
 * @param {string} email - User's email address
 */
async function verifyUserEmail(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    
    await admin.auth().updateUser(user.uid, {
      emailVerified: true
    });
    
    console.log(`✅ Email verified for ${email} (UID: ${user.uid})`);
    return user.uid;
  } catch (error) {
    console.error('❌ Error verifying email:', error);
    throw error;
  }
}

/**
 * Create an admin user with verified email
 * @param {string} email - Email address
 * @param {string} password - Password
 * @param {string} displayName - Display name
 */
async function createAdminUser(email, password, displayName) {
  try {
    // Create user
    const user = await admin.auth().createUser({
      email,
      password,
      displayName,
      emailVerified: true
    });
    
    // Set admin claim
    await admin.auth().setCustomUserClaims(user.uid, {
      admin: true
    });
    
    // Create Firestore profile
    await admin.firestore().collection('users').doc(user.uid).set({
      displayName,
      email,
      role: 'admin',
      emailVerified: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`✅ Admin user created successfully!`);
    console.log(`   Email: ${email}`);
    console.log(`   UID: ${user.uid}`);
    console.log(`   Password: ${password}`);
    
    return user.uid;
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}

// Command-line interface
const args = process.argv.slice(2);
const command = args[0];
const param1 = args[1];
const param2 = args[2];
const param3 = args[3];

(async () => {
  try {
    switch (command) {
      case 'setAdmin':
        if (!param1) {
          console.error('Usage: node admin-utils.js setAdmin <email>');
          process.exit(1);
        }
        await setAdminClaim(param1);
        break;
      
      case 'removeAdmin':
        if (!param1) {
          console.error('Usage: node admin-utils.js removeAdmin <email>');
          process.exit(1);
        }
        await removeAdminClaim(param1);
        break;
      
      case 'checkAdmin':
        if (!param1) {
          console.error('Usage: node admin-utils.js checkAdmin <email>');
          process.exit(1);
        }
        await checkAdminClaim(param1);
        break;
      
      case 'verifyEmail':
        if (!param1) {
          console.error('Usage: node admin-utils.js verifyEmail <email>');
          process.exit(1);
        }
        await verifyUserEmail(param1);
        break;
      
      case 'createAdmin':
        if (!param1 || !param2 || !param3) {
          console.error('Usage: node admin-utils.js createAdmin <email> <password> <displayName>');
          process.exit(1);
        }
        await createAdminUser(param1, param2, param3);
        break;
      
      default:
        console.log(`
LCGAP Admin Utilities
=====================

Commands:
  setAdmin <email>                      - Set admin claim for user
  removeAdmin <email>                   - Remove admin claim from user
  checkAdmin <email>                    - Check if user has admin claim
  verifyEmail <email>                   - Verify user's email manually
  createAdmin <email> <password> <name> - Create new admin user

Examples:
  node admin-utils.js setAdmin admin@example.com
  node admin-utils.js createAdmin admin@lcgap.ls SecurePass123 "Admin User"
  node admin-utils.js checkAdmin admin@example.com
        `);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
})();
