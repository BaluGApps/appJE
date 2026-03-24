/**
 * Firestore Initialization Script
 * This script provides a template for initializing your Firestore collections
 * and indexes. Since direct console access is not available, you can use 
 * this as a reference or run it if you have the firebase-admin SDK setup.
 */

const initFirestoreSchema = async (db) => {
  console.log('--- Initializing Firestore Schema ---');

  // 1. Initialize 'users' collection with a dummy user
  // (In practice, users are created upon first login)
  try {
    await db.collection('users').doc('system_init').set({
      name: 'System Initializer',
      email: 'system@railaspirant.com',
      totalCredits: 0,
      lastTestAt: new Date(),
    });
    console.log('✔ Users collection initialized.');
  } catch (e) {
    console.error('✘ Error initializing users:', e);
  }

  // 2. Initialize 'leaderboards' collection
  try {
    await db.collection('leaderboards').doc('system_init').set({
      userId: 'system',
      userName: 'RailAspirant Bot',
      userEmail: 'bot@railaspirant.com',
      testId: 'init',
      testTitle: 'System Initialization',
      score: 0,
      totalMarks: 100,
      points: 0,
      language: 'en',
      remainingTime: 0,
      timestamp: new Date(),
    });
    console.log('✔ Leaderboards collection initialized.');
  } catch (e) {
    console.error('✘ Error initializing leaderboards:', e);
  }

  console.log('--- Initialization Complete ---');
  console.log('NOTE: To deploy rules and indexes, run:');
  console.log('firebase deploy --only firestore');
};

module.exports = initFirestoreSchema;
