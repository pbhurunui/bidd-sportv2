# Data Sync Issue & Fix - February 17, 2026

## Problem Identified
Users logging in on a **new device** would see "No tournaments" even though tournaments existed in the cloud and other users could see them.

### Root Cause
The application stores tournament data in **two locations** in Firebase Realtime Database:
1. **Personal location**: `/users/{uid}/` - User's own copy
2. **Shared location**: `/shared/{sport}/` - Accessible to all authorized users

However, when a user signed in on a new device:
1. The app tried to load from `/users/{uid}/` (empty on new device)
2. It fell back to localStorage (empty on new device)
3. **It never checked the shared location** `/shared/{sport}/`
4. Result: No tournaments visible

## Solution Implemented

### 1. **Sign-In Flow** (Lines 1608-1625)
When a user signs in, the app now:
- Attempts to load personal data from `/users/{uid}/`
- **If not found**, automatically loads from `/shared/{sport}/`
- If still no data, loads from localStorage
- Updates localStorage so it's available offline

```javascript
// If no personal cloud data, try to load from SHARED location
if (!cloudDataExists) {
    console.log('ℹ️ No personal cloud data found, attempting to load from shared tournaments...');
    const sharedDataLoaded = await loadSharedDataForCurrentSport();
    
    if (!sharedDataLoaded) {
        console.log('ℹ️ No shared data found either, loading from localStorage');
        loadData();
    }
}
```

### 2. **Sport Switching** (Lines 1125-1195)
When a user switches sports using the tabs:
- App loads local data first with `loadData()`
- **If user is signed in**, automatically checks `/shared/{sport}/` for updates from other devices
- If shared data is newer, it's loaded and UI is refreshed

```javascript
// Load shared data if user is signed in (for multi-device sync)
if (currentUser && idToken && typeof loadSharedDataForCurrentSport === 'function') {
    console.log(`📱 Checking for shared ${sport} data from other devices...`);
    loadSharedDataForCurrentSport().then(updated => {
        if (updated) {
            console.log(`✅ Shared ${sport} data updated from cloud`);
            if (typeof renderTournaments === 'function') {
                renderTournaments();
            }
        }
    });
}
```

### 3. **Manual Sync Button** (Lines 5757-5850)
The "↓ Sync" button now falls back to shared locations if personal data isn't found:
- Checks user's personal `/users/{uid}/` path first
- **If empty (404)**, automatically tries all `/shared/{sport}/` locations
- Loads all available data from either location

## How Multi-Device Data Sync Works

### Data Flow
1. **Device A** creates a tournament
2. User clicks **↑ Save** button
3. Data is uploaded to:
   - Personal location: `/users/{deviceA.uid}/`
   - Shared location: `/shared/{sport}/` (for all authorized users)

### Sync to Device B
1. **Device B** user logs in
2. App checks personal location (empty 404)
3. App **automatically loads** from shared location → **Shows tournaments!**
4. Every 10 seconds (polling) or when switching sports, app checks for updates

## Testing the Fix

### Scenario 1: New Device Sign-In (Previously Broken)
1. Create tournament on Device A, click ↑ Save
2. On Device B, log in with same account
3. ✅ **Expected**: Tournaments appear immediately
4. ✅ **Why**: New sign-in flow now loads from /shared/{sport}

### Scenario 2: Cross-Device Updates
1. Device A creates event, clicks ↑ Save
2. On Device B, switch to that sport tab or click ↓ Sync
3. ✅ **Expected**: Event appears within 10 seconds or immediately on sport switch
4. ✅ **Why**: switchSport now loads shared data

### Scenario 3: First User (Single Device)
1. First user creates tournaments (no shared data yet)
2. Logs in on second device
3. ✅ **Expected**: First device creates events, clicks ↑ Save
4. ✅ **Expected**: Event appears on second device via shared location

## Console Logs to Watch For

When everything works correctly, you should see:

**On Sign-In:**
```
📥 Attempting to load data from cloud first...
ℹ️ No personal cloud data found, attempting to load from shared tournaments...
📥 Checking shared location for swimming updates
🔄 Shared data found - merging updates
✅ Merged shared data - 2 tournaments, 5 events, 20 competitors
```

**When Switching Sports:**
```
📱 Checking for shared badminton data from other devices...
🔄 Shared data found - merging updates
✅ Merged shared data - refreshing tournaments
```

## Firestore Permissions
The Realtime Database rules (database.rules.json) already support this:
```json
"shared": {
  ".read": "auth != null",      // Any authenticated user can read
  ".write": "auth != null"       // Any authenticated user can write
}
```

## Files Modified
- **index.html**
  - Sign-in flow (lines 1608-1625)
  - switchSport function (lines 1141-1195)
  - forceSyncFromFirestore function (lines 5757-5850)

## No Breaking Changes
- ✅ Offline mode still works (loads from localStorage)
- ✅ Personal data synchronization unchanged
- ✅ Backward compatible with existing data
- ✅ No schema changes required
- ✅ No new dependencies

## Recovery if Issues Occur

If users still see "No tournaments":

1. **Check Browser Console** (Press F12):
   - Look for red errors or orange warnings
   - Share any auth/sync related messages

2. **Try Manual Sync**:
   - Click "↓ Sync" button in header
   - Should fall back to shared locations and pull all tournaments

3. **Verify on First Device**:
   - Ensure tournaments were created and ↑ Save button clicked
   - Check browser console for "Data synced to shared location"

4. **Ask User**:
   - "Did you click the purple ↑ Save button after creating tournaments?"
   - Most common cause of missing data is forgetting to save
