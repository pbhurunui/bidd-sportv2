# Troubleshooting: "No Tournaments" on New Device

## Quick Answer
**If a user logs in on a new device and sees no tournaments, the fix is now automatic.** The app will now pull shared tournament data from the cloud.

## What Was Fixed

### Before (Broken)
```
Sign In on New Device
    ↓
"Are my tournaments in the cloud?" (Check personal folder)
    ↓ 
✗ Not found
    ↓
"Look in localStorage" (First device, always empty)
    ↓
✗ Not found
    ↓
"I see no tournaments" 😞
```

### After (Fixed)
```
Sign In on New Device
    ↓
"Are my tournaments in the cloud?" (Check personal folder)
    ↓ 
✗ Not found
    ↓
"Look in the shared folder" (Accessible to all)
    ↓
✓ FOUND! Load tournaments
    ↓
"See my tournaments!" 🎉
```

## For Users

### If You're Missing Tournaments on a New Device:

1. **Make sure tournaments were saved on the original device:**
   - Did you click the purple **↑ Save** button after creating tournaments?
   - Without saving, they're only on that one device

2. **Sign out and sign back in:**
   - This triggers the cloud sync check
   - Give it 5-10 seconds to load

3. **Try the Sync button:**
   - Look for the green **↓ Sync** button in the top right
   - This manually pulls the latest data from the cloud

4. **Try switching sports:**
   - Click Swimming, Athletics, etc. tabs
   - Each sport tab will check for latest shared data

### If It Still Doesn't Work:

1. Open browser console: **F12 → Console tab**
2. Look for messages like:
   - ✓ "Shared data updated"  (Good!)
   - ✗ "No shared data found" (Check if tournaments exist on original device)
   - ✗ Auth errors (Check internet connection and login status)

3. Share the console errors with support

## For Administrators

### Symptoms of the Original Issue
- Users report "No tournaments" on mobile/second device
- But tournaments exist on original computer
- Reloading sometimes helps temporarily

### How to Verify Fix is Working

1. Create a tournament + events on **Device A**
2. Click **↑ Save** (purple button)
3. Log in on **Device B** with same account
4. **Check console** (F12): Should see "✅ Merged shared data"
5. **Tournaments appear** on Device B

### What to Tell Users Who've Been Affected

"We fixed the issue preventing tournaments from showing on new devices. When you log in now, the app will automatically sync tournaments from the cloud. You don't need to do anything special - it should work automatically."

## Technical Details for Developers

### What Changed
- **Sign-in**: Now loads from `/shared/{sport}` if personal data empty
- **Sport switch**: Automatically checks `/shared/{sport}` for updates
- **Manual sync**: Falls back to `/shared/{sport}` as backup

### Database Structure
```
users/{uid}/          ← Personal data (fastest, user-only)
  swimming_tournaments
  swimming_events
  ...

shared/               ← Shared data (accessible to all organizers)
  swimming.json       ← tournaments, events, competitors, results, etc.
  athletics.json
  badminton.json
  squash.json
  tennis.json
```

### Realtime Database Rules (Already Correct)
```json
"users": {
  "$uid": {
    ".read": "auth != null && auth.uid === $uid",
    ".write": "auth != null && auth.uid === $uid"
  }
},
"shared": {
  ".read": "auth != null",   ← Any authenticated user
  ".write": "auth != null"   ← Any authenticated user
}
```

## Files Changed
- `index.html` - 3 key functions updated
  1. Sign-in flow
  2. Sport switching
  3. Manual sync

- No database changes required
- No new Firebase rules needed
- No deployment issues

## Rollback Plan
The changes are 100% backward compatible:
- If shared location doesn't exist (old version), falls back to localStorage
- Can safely test on subset of users first
- No data loss risk
