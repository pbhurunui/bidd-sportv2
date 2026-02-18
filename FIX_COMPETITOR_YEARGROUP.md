# Competitor Year Group Assignment Fix

## Problem Identified
Competitors imported via CSV were getting `yearGroup: undefined, yearGroupName: undefined`, preventing them from being auto-assigned to events.

**Root Cause**: The CSV import had no fallback when age data was missing or not parsed correctly.

## Changes Made

### 1. **Triple-Redundancy for Default Year Groups**
   - On app startup (localStorage load)
   - On Firebase sync
   - On CSV import start
   
   This ensures 15 default age groups (Under 6 through Senior) are ALWAYS available in memory.

### 2. **Fallback Logic for Missing Age Data**
   - If age column is missing/empty in CSV, competitors now get assigned to default "Under 12" year group
   - Added logging to show CSV column structure for debugging

### 3. **Auto-Fix After Import**
   - After CSV import completes, any competitors without yearGroup are automatically fixed
   - Assigned to default "Under 12" year group if available

### 4. **Manual Cleanup Function**
   - Added `fixCompetitorsWithoutYearGroup()` function to fix existing competitors
   - Can be called from browser console

## How to Test

### Option A: Fix Existing Competitors (Quick)
1. Open Developer Tools (F12)
2. Go to Console tab
3. Run this command:
   ```javascript
   fixCompetitorsWithoutYearGroup()
   ```
4. This will:
   - Find all competitors in current tournament without yearGroup
   - Assign them to "Under 12" (default)
   - Auto-assign them to matching events
   - Save data
   - Show confirmation with count

### Option B: Fresh Import (Recommended)
1. Delete or clear existing imported competitors
2. Import the CSV again
3. The new code will:
   - Create default year groups
   - Automatically assign yearGroup during import
   - Assign competitors to events
   - Show confirmation

## CSV Format Expected
The import expects 6+ columns:
```
Surname, First Name, Gender, AKO, House, Age, Email (optional)
```

**Age Column** (6th) can be:
- Empty/missing → Will use default "Under 12"
- Number like "10" → Will calculate age group
- Format like "10y 10m 27d" → Will extract the number

## Verification Steps

1. **Check Console Logs** (F12 → Console):
   - Look for: `✅ Created 15 default age groups`
   - Look for: `✅ Fixed: [Name] → assigned to "[Group]"`
   - Look for: `📋 Row 0/1/2: [Col0="...", Col1="...", ...]` (shows CSV structure)

2. **Check Competitor Details**:
   - Open a competitor
   - Verify `yearGroup` has an ID value
   - Verify `yearGroupName` shows a group name like "Under 12"

3. **Check Event Assignments**:
   - Events should show competitor counts
   - If auto-assignment worked, you'll see competitors listed

## Console Commands for Debugging

```javascript
// Check if default year groups exist
console.log('Year Groups:', yearGroups.filter(yg => !yg.tournamentId));

// Count competitors without yearGroup
competitors.filter(c => (!c.yearGroup && !c.yearGroupName)).length;

// Show sample competitors
competitors.filter(c => c.tournamentId === currentTournamentId).slice(0, 5);

// Manually fix them
fixCompetitorsWithoutYearGroup();
```

## Next Steps

1. **Deploy**: Run `firebase deploy` to push the fix to production
2. **Test**: Either:
   - Call `fixCompetitorsWithoutYearGroup()` on existing 97 competitors
   - Or re-import CSV with fresh data
3. **Verify**: Check that competitors now have yearGroup/yearGroupName values
4. **Proceed**: Auto-assignment to events should now work
