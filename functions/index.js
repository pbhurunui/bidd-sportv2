// Firebase Cloud Function for BIDD Sport
// Deploy with: firebase deploy --only functions

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Scheduled Function: Auto-advance rounds at specified time
 * Optional: Runs daily at 6 AM to check if all matches in current round are complete
 */
exports.autoAdvanceRound = functions.pubsub
  .schedule('every day 06:00')
  .timeZone('Europe/London')
  .onRun(async (context) => {
    try {
      const db = admin.firestore();
      
      // Get all active tournaments
      const tournamentsRef = db.collection('roundRobinTournaments');
      const activeSnapshot = await tournamentsRef.where('status', '==', 'active').get();
      
      activeSnapshot.forEach(async (doc) => {
        const tournament = doc.data();
        
        // Check if all matches in current round are complete
        const matchesRef = db.collection('roundRobinMatches');
        const roundSnapshot = await matchesRef
          .where('tournamentId', '==', doc.id)
          .where('round', '==', tournament.currentRound)
          .get();
        
        const allComplete = roundSnapshot.docs.every(m => m.data().status === 'completed');
        
        if (allComplete && tournament.currentRound < tournament.rounds) {
          // Auto-advance to next round
          await tournamentsRef.doc(doc.id).update({
            currentRound: tournament.currentRound + 1
          });
          
          console.log(`Auto-advanced tournament ${doc.id} to round ${tournament.currentRound + 1}`);
        }
      });
      
      return null;
    } catch (error) {
      console.error('autoAdvanceRound error:', error);
      return null;
    }
  });

/**
 * PERMISSIONS: FIRESTORE-BASED (Free Tier Compatible)
 * 
 * ⚠️ NOTE: Custom Claims functions removed in favor of Firestore-based permissions
 * 
 * Why: The app now reads permissions directly from the organizerPermissions 
 * Firestore collection in security rules, eliminating the need for Cloud Functions
 * and Firebase Auth custom claims.
 * 
 * Benefits:
 * - ✅ Works on free Firebase Spark plan (no Blaze upgrade needed)
 * - ✅ Simpler architecture with single source of truth (Firestore)
 * - ✅ Same security result - server-side permission validation
 * - ✅ Slightly higher read cost, but well within free tier limits
 * 
 * How it works:
 * 1. Permissions stored in: /organizerPermissions/{email}
 * 2. Firestore rules read doc with: get(/databases/$(database)/documents/organizerPermissions/$(userEmail))
 * 3. Rules validate hasPermission() directly from Firestore data
 * 
 * Implementation:
 * - organizer-manager.js: syncOrganizerToFirestore(), removeOrganizerFromFirestore()
 * - firestore.rules: getUserPermissions(), hasPermission(permission)
 * - No backend functions needed!
 */

/**
 * Send Results Email to a Competitor
 * DISABLED: Email functionality removed to keep on free Firebase tier
 * 
 * Request body should contain:
 * {
 *   competitorId: string,
 *   competitorEmail: string,
 *   competitorName: string,
 *   tournamentId: string,
 *   tournamentName: string,
 *   results: [{eventType, time, placement, recordBroken}, ...]
 * }
 
exports.sendResultsEmail = functions.https.onCall(async (data, context) => {
  // For now, just log the request (email sending requires Gmail API setup)
  console.log('Results email request:', {
    competitor: data.competitorName,
    email: data.competitorEmail,
    tournament: data.tournamentName,
    resultCount: data.results ? data.results.length : 0
  });
  
  // TODO: Implement Gmail API integration using firebase functions:config
  // For now, return success - frontend can show confirmation
  return {
    success: true,
    message: `Email queued for ${data.competitorEmail}`,
    preview: {
      to: data.competitorEmail,
      subject: `Your Results from ${data.tournamentName}`,
      recipient: data.competitorName
    }
  };
});
 */
