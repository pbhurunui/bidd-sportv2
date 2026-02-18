# Gmail API Setup Guide for BIDD Sport

## Quick Setup (5 Steps)

### Step 1: Enable Gmail API
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Go to **APIs & Services** → **Library**
3. Search for "Gmail API"
4. Click **ENABLE**

### Step 2: Set Up Branding
1. Go to **APIs & Services** → **OAuth consent screen**
2. Click **EDIT APP** (or CREATE if first time)
3. Set:
   - App name: `BIDD Sport`
   - Support email: Your email
   - Developer email: Your email
4. Click **SAVE AND CONTINUE**
5. Click **ADD OR REMOVE SCOPES**
6. Search and select: `https://www.googleapis.com/auth/gmail.send`
7. Click **UPDATE** → **SAVE AND CONTINUE**
8. Add your email as a **Test User**
9. Click **SAVE AND CONTINUE** to finish

### Step 3: Create OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Select **Web application**
4. Add redirect URIs:
   - `https://developers.google.com/oauthplayground`
   - `http://localhost:5000`
5. Click **CREATE**
6. Copy your **Client ID** and **Client Secret**

### Step 4: Get Refresh Token
1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
2. Click settings ⚙️ (top right)
3. Check "Use your own OAuth credentials"
4. Paste your Client ID and Secret
5. Close settings
6. On the left, search for "Gmail API"
7. Select: `https://www.googleapis.com/auth/gmail.send`
8. Click **AUTHORIZE APIS** button (Step 1 in Playground)
9. Sign in with your Google account
10. Click **Allow** to grant permission
11. You'll see an authorization code appear
12. Click **EXCHANGE AUTHORIZATION CODE FOR TOKENS** button (Step 2 in Playground)
13. Click **Send the request** button
14. The **Response** section will show JSON with your tokens
15. Find the line: `"refresh_token": "1//0..."`
16. Copy the entire value between the quotes
17. **Skip Step 3** (Configure request to API) - you don't need it for email setup

### Step 5: Configure Firebase (New Method)

Create a `.env.local` file in your `functions/` folder with your credentials:

1. Open your `functions/` folder
2. Create a new file named `.env.local` (note the dot at the start)
3. Add these 4 lines:

```
GMAIL_CLIENT_ID=YOUR_CLIENT_ID
GMAIL_CLIENT_SECRET=YOUR_CLIENT_SECRET
GMAIL_REFRESH_TOKEN=YOUR_REFRESH_TOKEN
GMAIL_USER_EMAIL=your-email@gmail.com
```

Replace:
- `YOUR_CLIENT_ID` - from Step 3
- `YOUR_CLIENT_SECRET` - from Step 3
- `YOUR_REFRESH_TOKEN` - from Step 4
- `your-email@gmail.com` - your Gmail address

4. Save the file

**Deploy directly to Firebase:**
```bash
firebase deploy --only functions
```

**Optional - Test locally first:**
If you want to test locally, run:
```bash
firebase init emulators
firebase emulators:start --only functions
```

Done! Your email feature is ready to use.

---

## Troubleshooting

## CSV Format with Emails

When importing competitors, use this CSV format:

```
Surname,FirstName,Gender,House,YearGroup,Email,Age
Smith,John,M,Red,5,john.smith@example.com,10
Jones,Sarah,F,Blue,3,sarah.jones@example.com,9
```

**Columns:**
1. **Surname** - Last name (required)
2. **FirstName** - First name (required)
3. **Gender** - M or F (required)
4. **House** - House name as set up in tournament (required)
5. **YearGroup** - Year number or full name like "Year 5" (required)
6. **Email** - Email address (optional, but enables email summaries)
7. **Age** - Age in years (optional, auto-calculated from year group if omitted)

**Notes:**
- Email validation: Must be valid email format (validated during import)
- Age: If not provided, calculated from year group
- House: Must match a house name in the tournament
- YearGroup: Can be just the number (5) or full name (Year 5)
- Headers: First row can be headers - will be auto-detected and skipped

## Security Notes

⚠️ **Important:**
- Never commit Firebase config to version control
- The refresh token is sensitive - treat it like a password
- Use Firebase Environment Configuration for secrets
- Consider using Firebase Secrets Manager for production

## Next Steps

After setup is complete:

1. ✅ Import competitors with email addresses via CSV
2. ✅ Record results for events
3. ✅ Click "📧 Email Results" to send tournament summaries
4. ✅ Check Cloud Function logs to verify sends

## Support

For issues:
1. Check Cloud Function logs: `firebase functions:log`
2. Verify Gmail API is enabled in Google Cloud Console
3. Ensure refresh token is valid and not expired
4. Check that competitors have valid email addresses

---

**Last Updated:** January 14, 2026
**Function:** `sendCompetitorEmails`
**Status:** Ready for deployment
