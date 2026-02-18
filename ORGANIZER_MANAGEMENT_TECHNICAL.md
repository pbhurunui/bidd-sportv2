# 🔧 ORGANIZER MANAGEMENT SYSTEM - TECHNICAL GUIDE

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   index.html (UI Layer)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Settings Panel → Organizer Management Section      │   │
│  │  - New Modals (Add, Import, Edit)                   │   │
│  │  - Organizers List & Search                         │   │
│  │  - Statistics Dashboard                             │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│            organizer-manager.js (Logic Layer)               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  • ROLE_TEMPLATES (5 presets)                        │   │
│  │  • PERMISSIONS (13 total)                            │   │
│  │  • Organizer CRUD operations                         │   │
│  │  • Bulk import/export                                │   │
│  │  • Audit logging                                     │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              Storage Layer (localStorage)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  organizersManagerData = {                           │   │
│  │    organizers: [...],      // Main data              │   │
│  │    auditLog: [...]         // Change history         │   │
│  │  }                                                    │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              Firestore (Cloud Sync)                          │
│  • Backup & cloud storage                                   │
│  • Multi-device sync                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Functions

### Initialization
```javascript
initializeOrganizerManager()
// Loads existing data, migrates old format, initializes system
```

### Adding Organizers
```javascript
// Single
addSingleOrganizer(email, roleTemplate)
// Returns: organizer object or false

// Bulk
addOrganizersBulk(emailsWithRoles)
// Returns: { success[], failed[], duplicates[] }

// From CSV
importOrganizerCSV(csvFile)
// Returns: Promise<{ success[], failed[], duplicates[] }>
```

### Permission Management
```javascript
updateOrganizerPermissions(email, newPermissions)
changeOrganizerRole(email, newRoleTemplate)
addPermissionToOrganizer(email, permission)
removePermissionFromOrganizer(email, permission)
hasPermission(email, permission)
canPerformAction(email, action)
```

### Queries
```javascript
getOrganizer(email)              // Single organizer
getAllOrganizers()               // All with full details
getOrganizersByPermission(perm)  // Filter by permission
```

### Removal
```javascript
removeOrganizer(email)  // Delete organizer
```

### Audit & Logging
```javascript
logAuditEvent(eventType, subject, details)
getAuditLog(limit = 100)
getOrganizerStats()
```

### Export
```javascript
exportOrganizersToCSV()     // Generate CSV string
downloadOrganizersCSV()     // Trigger browser download
```

---

## Data Structures

### Organizer Object
```javascript
{
  id: "1708291234567",                    // Unique ID (timestamp)
  email: "john@example.com",              // Email address
  roleTemplate: "tournament_director",    // Role name
  permissions: [
    "manage_tournaments",
    "view_tournaments",
    "manage_events",
    "edit_event_details",
    "record_results",
    "edit_results",
    "export_data",
    "view_logs"
  ],
  addedAt: "2026-02-16T10:30:00.000Z",   // ISO timestamp
  addedBy: "admin@example.com",           // Who added them
  status: "active"                         // active/inactive/removed
}
```

### Permission Object
```javascript
{
  'manage_tournaments': {
    label: 'Create & Delete Tournaments',
    category: 'Tournament'
  },
  // ... 12 more permissions
}
```

### Role Template Object
```javascript
{
  label: "Tournament Director",
  description: "Manage tournaments, events, and results",
  color: "blue",
  permissions: [
    "manage_tournaments",
    "view_tournaments",
    "manage_events",
    "edit_event_details",
    "record_results",
    "edit_results",
    "export_data",
    "view_logs"
  ]
}
```

### Audit Log Entry
```javascript
{
  id: "1708291234567",
  timestamp: "2026-02-16T10:30:00.000Z",
  eventType: "organizer_added",          // Event type
  subject: "john@example.com",           // What was changed
  actor: "admin@example.com",            // Who made the change
  details: {
    roleTemplate: "tournament_director",
    permissions: 8
  }
}
```

---

## Audit Event Types

```javascript
'organizer_added'      // New organizer added
'role_changed'         // Role template changed
'permissions_updated'  // Permissions modified
'permission_added'     // Single permission added
'permission_removed'   // Single permission removed
'organizer_removed'    // Organizer deleted
'bulk_import'          // CSV import completed
```

---

## UI Functions (in index.html)

### Modal Management
```javascript
showAddOrganizerModal()
showEditOrganizerModal(email)
showBulkImportModal()
closeModal(modalId)
```

### List Rendering
```javascript
renderOrganizersList()           // Render table
renderRoleTemplatesInfo()        // Show role descriptions
renderEditPermissionsCheckboxes(permissions)
updateOrganizerStats()
```

### Form Submission
```javascript
submitAddOrganizer()
submitEditOrganizer()
submitBulkImport()
previewBulkImport()
```

### Actions
```javascript
removeOrganizerConfirm(email)
downloadOrganizersList()
```

---

## Integration Points

### With Authorization System
```javascript
// After sign-in, call:
updateSettingsUIWithOrganizerManagement()

// In renderAuthorizedUsers():
showOrganizerManagementUI()  // Auto-show on login
```

### With Firestore
```javascript
// Auto-saves to localStorage
saveOrganizerData()

// Syncs with authorizedUsers
syncToAuthorizedUsers()
```

### With Display Updates
```javascript
// Search box filtering
document.getElementById('organizerSearchBox')
  .onchange = renderOrganizersList
  .oninput = renderOrganizersList
```

---

## CSV Import Process

### Flow
```
Select File
    ↓
Read File (FileReader API)
    ↓
parseOrganizerCSV(text)
    ↓
Validate roles & format
    ↓
addOrganizersBulk(array)
    ↓
Check for duplicates
    ↓
Save to localStorage
    ↓
Sync to authorizedUsers
    ↓
Return results { success, failed, duplicates }
```

### CSV Parse Logic
```javascript
const [email, role] = line.split(',').map(v => v.trim().toLowerCase());

// Validation:
if (!email || !role) skip line
if (!ROLE_TEMPLATES[role]) add to failed
if (organizer exists) add to duplicates
```

---

## Storage Format

### localStorage Keys
```javascript
'organizersManagerData'    // Main JSON object
                          // Contains organizers[] + auditLog[]

'userRole'                 // Existing (not changed)
'firebaseAuthToken'        // Existing (not changed)
'firebaseUser'             // Existing (not changed)
```

### Firestore Storage
```
/authorizedUsers/config
  .users = JSON string of organizers
  (synced automatically via syncToAuthorizedUsers)
```

---

## Permission Checking in Application

### Check if user can perform action
```javascript
const email = currentUser?.email;
if (!canPerformAction(email, 'manage_tournaments')) {
  alert('You do not have permission to manage tournaments');
  return;
}
```

### Check for specific permission
```javascript
if (!hasPermission(email, 'record_results')) {
  // User cannot record results
}
```

### Get user's available actions
```javascript
const perms = getOrganizer(email).permissions;
const canEdit = perms.includes('edit_event_details');
const canDelete = perms.includes('manage_events');
```

---

## Backward Compatibility

### Migration from Old System
```javascript
// Old: authorizedUsers with just email and role
// New: organizersManager with roles and permissions

migrateAuthorizedUsersFormat()
// If authorizedUsers exist and organizersManager is empty:
// → Convert each user to new format
// → Assign role templates based on old role
// → Save to new storage
```

### Keep Both Systems in Sync
```javascript
syncToAuthorizedUsers()
// Called after every change:
// → Updates authorizedUsers array
// → Calls saveAuthorizedUsers()
// → Syncs to Firestore
```

---

## Security Considerations

### Role-Based Access Control
```javascript
// All functions check currentUser before allowing changes:
if (!currentUser) {
  alert('Only organizers can manage users');
  return;
}

// Each action is logged:
logAuditEvent('permissions_updated', email, {
  oldCount: 5,
  newCount: 8,
  added: ['manage_tournaments'],
  removed: []
});
```

### Permission Enforcement
- Stored in localStorage (client-side reference)
- Should be verified server-side in production
- Audit log tracks all access attempts

---

## Performance Notes

### Audit Log Management
```javascript
// Limited to 1000 most recent events
if (organizersManager.auditLog.length > 1000) {
  organizersManager.auditLog = 
    organizersManager.auditLog.slice(-1000);
}
```

### Search Optimization
```javascript
// Real-time search on 100+ organizers
renderOrganizersList()
// Filters on every keystroke
// Should add debouncing for large datasets
```

### CSV Import
```javascript
// Max practical size: ~1000 rows
// Larger files may cause UI lag
// Consider pagination for very large imports
```

---

## Testing Checklist

- [ ] Add single organizer
- [ ] Add multiple organizers
- [ ] Bulk import from CSV
- [ ] Edit organizer permissions
- [ ] Change role template
- [ ] Remove organizer
- [ ] Export organizers to CSV
- [ ] Search organizers
- [ ] View audit log
- [ ] Verify permissions are enforced
- [ ] Check localStorage sync
- [ ] Check Firestore sync
- [ ] Test backward compatibility
- [ ] Verify mobile responsive design

---

## Debugging

### Enable Verbose Logging
```javascript
// Already enabled in organizer-manager.js
console.log('🔧 Initializing...')
console.log('✅ Success...')
console.log('📝 Audit:...')
```

### Check Current State
```javascript
// In browser console:
console.log(organizersManager)
console.log(authorizedUsers)
console.log(ROLE_TEMPLATES)
console.log(PERMISSIONS)
```

### Verify Data Persistence
```javascript
localStorage.getItem('organizersManagerData')
// Should return valid JSON
```

---

## Future Enhancements

Potential improvements for v2:
- [ ] Role creation UI (custom role templates)
- [ ] Permission templates (user-defined groups)
- [ ] Bulk permission updates
- [ ] Permission inheritance
- [ ] Time-based permissions
- [ ] API integration for SSO
- [ ] Advanced audit log filters
- [ ] Permission usage analytics
- [ ] Automatic role suggestions
- [ ] Role version history

