# 👥 ORGANIZER MANAGEMENT SYSTEM - COMPLETE GUIDE

## Overview

The new **Organizer Management System** provides an easier, more reliable way to add organizers and manage their permissions. Instead of a simple binary organizer/competitor system, you now have:

- ✅ **Preset Role Templates** with predefined permissions
- ✅ **Granular Permission Control** for advanced customization
- ✅ **Bulk Import** from CSV files
- ✅ **Clear Visual Representation** of roles and permissions
- ✅ **Audit Logging** to track all changes
- ✅ **Easy Permission Editing** via user-friendly interface

---

## 🎯 Quick Start

### Adding a Single Organizer

1. Go to **Settings** → **Organizer Management**
2. Click **➕ Add Organizer**
3. Enter the email address
4. Select a role template from the dropdown:
   - **Administrator** - Full system access
   - **Tournament Director** - Manage tournaments, events, results
   - **Event Manager** - Edit events and record results
   - **Score Keeper** - Record and edit match results
   - **Viewer** - View-only access
5. Click **Add**

### Bulk Import Multiple Organizers

1. Go to **Settings** → **Organizer Management**
2. Click **📥 Bulk Import**
3. Prepare a CSV file (see format below)
4. Click **Preview** to verify the data
5. Click **Import** to add all at once

#### CSV Format:
```
email,role
john@example.com,tournament_director
jane@example.com,event_manager
bob@example.com,scorekeeper
```

**Valid role values:**
- `admin`
- `tournament_director`
- `event_manager`
- `scorekeeper`
- `viewer`

### Managing Permissions

1. Go to **Settings** → **Organizer Management**
2. Find the organizer in the list
3. Click **⚙️ Edit**
4. Either:
   - **Change the role template** (which updates all permissions automatically)
   - **Individually toggle permissions** for custom setups
5. Click **Save**

---

## 🛠️ Role Templates Explained

### Administrator
- **Best for:** System owners, super admins
- **Permissions:** All (13)
- **Capabilities:**
  - Create & delete tournaments
  - Create & delete events
  - Record & edit all results
  - Manage all users
  - Import/export data
  - View system logs
  - Manage settings

### Tournament Director
- **Best for:** Tournament organizers, event leaders
- **Permissions:** 8
- **Capabilities:**
  - Create & delete tournaments
  - Edit event details & settings
  - Record & edit results
  - Export data & reports

### Event Manager
- **Best for:** Specific event coordinators
- **Permissions:** 4
- **Capabilities:**
  - Edit event details
  - Record match results
  - Export data

### Score Keeper
- **Best for:** Data entry staff, scoreboard operators
- **Permissions:** 3
- **Capabilities:**
  - View tournaments
  - Record match results
  - Edit results if needed

### Viewer
- **Best for:** Read-only access, reports management
- **Permissions:** 2
- **Capabilities:**
  - View all tournaments
  - Export reports & data

---

## 📋 All Permissions Available

### Tournament Management
- `manage_tournaments` - Create & Delete Tournaments
- `view_tournaments` - View All Tournaments

### Event Management
- `manage_events` - Create & Delete Events
- `edit_event_details` - Edit Event Details & Settings

### Results & Scoring
- `record_results` - Record Match Results
- `edit_results` - Edit/Delete Results

### User Management
- `manage_users` - Add & Remove Organizers
- `assign_roles` - Change User Roles & Permissions

### Data Management
- `import_data` - Import Data (CSV/Excel)
- `export_data` - Export Data & Reports
- `backup_restore` - Backup & Restore Data

### System
- `view_logs` - View Audit Logs
- `manage_settings` - Manage System Settings

---

## 📊 Dashboard Statistics

The organizer management dashboard shows:

- **Total Organizers** - How many team members are registered
- **Recent Changes** - Number of changes in the last 7 days
- **Active Roles** - All available role templates (always 5)

---

## 🔍 Finding & Filtering Organizers

1. Use the search box to filter by email
2. Results update in real-time as you type
3. View each organizer's:
   - Email address
   - Role name and color
   - Number of permissions
   - When they were added

---

## 🔐 Removing Organizers

1. Find the organizer in the list
2. Click **🗑️ Remove**
3. Confirm the removal
4. Organizer is immediately removed from all systems

**Important:** Removing an organizer cannot be undone. Their Firebase account will also be removed.

---

## 📥 Exporting Organization Data

1. Click **📊 Export List** in the Organizer Management section
2. A CSV file downloads with all organizers and their details
3. File includes: Email, Role, Permission Count, Added Date, Added By

---

## 🔄 Audit Log

The system automatically tracks:
- When organizers are added
- When roles are changed
- When permissions are modified
- When organizers are removed
- Who made each change

Access the audit log by signing in as an admin and checking localStorage.

---

## ✨ Advanced Usage

### Custom Permission Sets

You can create custom permission combinations:

1. Add an organizer with any template
2. Click **⚙️ Edit**
3. Leave the role template dropdown empty (no selection)
4. Manually check only the permissions you need
5. Click **Save**

This preserves custom configurations even if the role template changes.

### Bulk Updates

To add multiple organizers at once:

1. Prepare CSV file with all desired organizers
2. Use **📥 Bulk Import**
3. Preview shows what will be added
4. See summary of successes, failures, and duplicates

---

## 🐛 Troubleshooting

### "Organizer already exists"
- The email is already in the system
- Remove the existing organizer first if you want to re-add them
- Or use **⚙️ Edit** to change their existing role

### CSV import shows failures
- Check your CSV format matches the template
- Ensure email addresses are valid
- Verify role names are spelled correctly
- Look for blank lines in the file

### Changes not showing up
- Refresh the page (Ctrl+F5)
- Check that you're signed in as an administrator
- Ensure your internet connection is stable

---

## 💾 Data Storage

All organizer data is stored in:
- **localStorage** - For quick local access
- **Firestore** (Firebase) - For cloud sync and backup
- **Audit Log** - In localStorage (last 1000 events)

The system automatically syncs between local and cloud storage.

---

## 🔗 Integration with Existing System

The new manager maintains backward compatibility:
- Existing authorizedUsers still work
- Old system data migrates automatically
- Both systems stay in sync

**Recommendation:** Use the new organizer management system going forward for better features and reliability.

---

## 📱 Platform Support

Works on:
- ✅ Desktop browsers
- ✅ Mobile browsers
- ✅ Tablets
- ✅ All modern devices

Responsive design automatically adjusts for smaller screens.

---

## 🔐 Security Notes

- Only system administrators can manage organizers
- Each organizer must have a unique email
- Permissions are enforced server-side
- Audit log shows who made changes and when
- Removed organizers are immediately locked out

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the audit log for recent changes
3. Verify your CSV format if using bulk import
4. Ensure you're signed in as an administrator

