# ⚡ ORGANIZER MANAGEMENT - QUICK REFERENCE

## 📋 One-Page Cheat Sheet

### Add Single Organizer
```
Settings → Organizer Management → ➕ Add Organizer
→ Email → Select Role → Add
```

### Add Multiple Organizers
```
Settings → Organizer Management → 📥 Bulk Import
→ CSV file → Preview → Import
```

### Edit Permissions
```
Find organizer → ⚙️ Edit → Change role or toggle permissions → Save
```

### Remove Organizer
```
Find organizer → 🗑️ Remove → Confirm
```

### Export List
```
Settings → Organizer Management → 📊 Export List
→ CSV file downloads
```

---

## 🎯 Role Quick Reference

| Role | ADD | DELETE | EDIT | RESULTS | USERS | DATA | LOGS |
|------|-----|--------|------|---------|-------|------|------|
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Tournament Director | ✅ | ❓ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Event Manager | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Score Keeper | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Viewer | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |

---

## 📊 Dashboard Stats

| Metric | Shows | Where |
|--------|-------|-------|
| Total Organizers | Count of all team members | Top left |
| Recent Changes | Changes in last 7 days | Top center |
| Active Roles | Always 5 (fixed) | Top right |

---

## 🔑 13 Total Permissions

**Tournament** (2)
- manage_tournaments
- view_tournaments

**Events** (2)
- manage_events
- edit_event_details

**Results** (2)
- record_results
- edit_results

**Users** (2)
- manage_users
- assign_roles

**Data** (3)
- import_data
- export_data
- backup_restore

**System** (2)
- view_logs
- manage_settings

---

## ✅ Pre-Built Role Permissions

### Administrator (13 perms)
All permissions ✅

### Tournament Director (8 perms)
- manage_tournaments
- view_tournaments
- manage_events
- edit_event_details
- record_results
- edit_results
- export_data
- view_logs

### Event Manager (4 perms)
- view_tournaments
- edit_event_details
- record_results
- export_data

### Score Keeper (3 perms)
- view_tournaments
- record_results
- edit_results

### Viewer (2 perms)
- view_tournaments
- export_data

---

## 📁 CSV Format (Copy & Paste)

```csv
email,role
john@example.com,tournament_director
jane@example.com,event_manager
bob@example.com,scorekeeper
alice@example.com,admin
viewer@example.com,viewer
```

---

## 🛠️ Files Modified/Created

| File | Purpose |
|------|---------|
| `organizer-manager.js` | Core system logic (new) |
| `index.html` | UI and integration (modified) |
| `ORGANIZER_MANAGEMENT_GUIDE.md` | Full documentation (new) |
| `ORGANIZER_MANAGEMENT_QUICK_REF.md` | This file (new) |

---

## 📝 What's Stored

- **localStorage:** All organizer data + audit log
- **Firestore:** Cloud backup of organizer data
- **authorizedUsers:** Backward compatible sync

---

## 🔄 Backward Compatibility

✅ Old system still works
✅ Old data migrates automatically
✅ Both systems stay synced
✅ Use new system going forward

---

## 💡 Tips & Tricks

1. **Bulk import is fastest** for adding many users
2. **Preview before importing** to catch errors
3. **Export list** to keep backups
4. **Edit roles** instead of remove+re-add
5. **Search box** filters in real-time
6. **Custom permissions** for special cases

---

## ⚠️ Important Notes

- Removing an organizer is **permanent**
- Bulk import **skips duplicates** automatically
- Roles are **enforced server-side**
- Audit log **tracks all changes**
- Maximum **1000 audit events** kept

---

