# Tournament Data Recovery Guide

## ⚠️ If Tournament Data Disappeared

If you've lost tournament data after the recent update, here are the recovery steps:

### 1. Check the Browser Console for Clues
- Open Developer Tools: **F12** or **Right Click → Inspect**
- Go to **Console** tab
- You should see logs like:
  ```
  🏆 renderTournaments called: {
    currentSport: "swimming",
    tournamentsCount: 0,
    storageKey: "swimming_tournaments",
    localStorageData: 0
  }
  ```

### 2. Diagnostic Questions
- **Are tournaments showing as 0?** → Data in localStorage is empty
- **Did you switch sports?** → Make sure you're on the same sport where tournaments were created
- **Were you signed in?** → Data might be in cloud storage

### 3. Recovery Steps

#### Option A: Check Another Sport
If you created tournaments in a different sport:
1. Click the sport tabs at the top (Swimming, Athletics, Badminton, Squash, Tennis)
2. Check if tournaments appear in another sport
3. If found, no recovery needed - just use that sport

#### Option B: Sign In to Recover from Cloud
If you were signed in when creating tournaments:
1. **Sign Out** (if already signed in)
2. **Sign In** again with your account
3. App will try to load your data from Firebase Cloud
4. Tournaments should reappear

#### Option C: Check Firebase Backup
The data is stored in Firebase Realtime Database at:
- **Personal path**: `/users/{userId}/{sport}_tournaments`
- **Shared path**: `/shared/{sport}/{sport}_tournaments`

To verify:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select the **bidd-sports-app** project
3. Go to **Realtime Database** → Check `/shared/swimming/` for tournament data

#### Option D: Manual Data Restoration
If you have a backup or export:
1. Find your tournament export file (JSON format)
2. Contact us with the file for manual restoration

### 4. To Prevent Data Loss Going Forward

**Always enable cloud sync:**
- Create data while **signed in**
- Use the same device/browser when possible
- Periodic backups recommended (export tournaments regularly)

### 5. Still Need Help?

Check the browser console (`F12` → Console tab) and look for:
- Red error messages
- Warnings about Firebase connection
- Data loading logs

Share the console output for faster troubleshooting.

---

## CSV Template for Competitor Import

See `COMPETITOR_IMPORT_TEMPLATE.csv` for the correct format.

**CSV Format Columns**:
1. **Surname** - Last name
2. **FirstName** - First name  
3. **Gender** - M or F
4. **AKO** - (Optional) Additional field
5. **House** - Red/Blue/Green/Yellow (must match houses in tournament)
6. **Age** - Number (10) or format (10y 10m 27d)
7. **Email** - (Optional) Email address

**Example**:
```csv
Surname,FirstName,Gender,AKO,House,Age,Email
Smith,John,M,,Red,10,john@example.com
Johnson,Sarah,F,,Blue,9,sarah@example.com
```

### Import Competitors Steps:
1. Go to **Competitors** tab
2. Click **📤 Import CSV** button
3. Select your CSV file
4. Preview the data
5. Click **Import** to add all competitors at once

**Important**: Set up all houses BEFORE importing competitors
