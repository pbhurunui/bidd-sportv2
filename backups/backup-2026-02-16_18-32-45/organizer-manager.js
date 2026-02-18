/**
 * ORGANIZER MANAGER
 * Centralized system for managing organizers, roles, and permissions
 * 
 * Features:
 * - Preset role templates with granular permissions
 * - Easy bulk import from CSV
 * - Permission-based access control
 * - Audit logging
 * - Simple role assignment UI
 */

// ================================
// PERMISSION DEFINITIONS
// ================================
const PERMISSIONS = {
    // Tournament Management
    'manage_tournaments': { label: 'Create & Delete Tournaments', category: 'Tournament' },
    'view_tournaments': { label: 'View All Tournaments', category: 'Tournament' },
    
    // Event Management
    'manage_events': { label: 'Create & Delete Events', category: 'Events' },
    'edit_event_details': { label: 'Edit Event Details & Settings', category: 'Events' },
    
    // Results & Scoring
    'record_results': { label: 'Record Match Results', category: 'Results' },
    'edit_results': { label: 'Edit/Delete Results', category: 'Results' },
    
    // User Management
    'manage_users': { label: 'Add & Remove Organizers', category: 'Users' },
    'assign_roles': { label: 'Change User Roles & Permissions', category: 'Users' },
    
    // Data Management
    'import_data': { label: 'Import Data (CSV/Excel)', category: 'Data' },
    'export_data': { label: 'Export Data & Reports', category: 'Data' },
    'backup_restore': { label: 'Backup & Restore Data', category: 'Data' },
    
    // System
    'view_logs': { label: 'View Audit Logs', category: 'System' },
    'manage_settings': { label: 'Manage System Settings', category: 'System' }
};

// ================================
// PRESET ROLE TEMPLATES
// ================================
const ROLE_TEMPLATES = {
    'admin': {
        label: 'Administrator',
        description: 'Full system access and control',
        color: 'red',
        permissions: Object.keys(PERMISSIONS)
    },
    'tournament_director': {
        label: 'Tournament Director',
        description: 'Manage tournaments, events, and results',
        color: 'blue',
        permissions: [
            'manage_tournaments', 'view_tournaments',
            'manage_events', 'edit_event_details',
            'record_results', 'edit_results',
            'export_data', 'view_logs'
        ]
    },
    'event_manager': {
        label: 'Event Manager',
        description: 'Manage specific events and record results',
        color: 'cyan',
        permissions: [
            'view_tournaments',
            'edit_event_details',
            'record_results',
            'export_data'
        ]
    },
    'scorekeeper': {
        label: 'Score Keeper',
        description: 'Record and edit match results only',
        color: 'green',
        permissions: [
            'view_tournaments',
            'record_results',
            'edit_results'
        ]
    },
    'viewer': {
        label: 'Viewer',
        description: 'View-only access to tournaments and results',
        color: 'gray',
        permissions: [
            'view_tournaments',
            'export_data'
        ]
    }
};

// ================================
// GLOBAL STATE
// ================================
let organizersManager = {
    organizers: [], // Array of organizer objects with roles and permissions
    auditLog: [],   // History of changes
    initialized: false
};

// ================================
// INITIALIZATION
// ================================
function initializeOrganizerManager() {
    console.log('🔧 Initializing Organizer Manager System');
    
    // Load existing data
    loadOrganizerData();
    
    // Ensure authorized users format is compatible
    migrateAuthorizedUsersFormat();
    
    organizersManager.initialized = true;
    console.log('✅ Organizer Manager initialized');
}

function loadOrganizerData() {
    const stored = localStorage.getItem('organizersManagerData');
    if (stored) {
        try {
            organizersManager = JSON.parse(stored);
        } catch (e) {
            console.warn('Could not load organizer data:', e);
            organizersManager = { organizers: [], auditLog: [] };
        }
    }
}

function saveOrganizerData() {
    localStorage.setItem('organizersManagerData', JSON.stringify(organizersManager));
    
    // Also sync to authorizedUsers for backward compatibility
    syncToAuthorizedUsers();
}

function syncToAuthorizedUsers() {
    // Convert organizer data to authorizedUsers format
    authorizedUsers = organizersManager.organizers.map(org => ({
        id: org.id,
        email: org.email,
        role: org.roleTemplate || 'organizer',
        permissions: org.permissions || ROLE_TEMPLATES[org.roleTemplate]?.permissions || [],
        addedAt: org.addedAt,
        addedBy: org.addedBy
    }));
    
    if (typeof saveAuthorizedUsers === 'function') {
        saveAuthorizedUsers();
    }
}

function migrateAuthorizedUsersFormat() {
    // If authorizedUsers exist but organizersManager is empty, migrate them
    if (authorizedUsers && authorizedUsers.length > 0 && organizersManager.organizers.length === 0) {
        console.log('📋 Migrating authorized users to new format');
        organizersManager.organizers = authorizedUsers.map(user => ({
            id: user.id || Date.now().toString(),
            email: user.email,
            roleTemplate: user.role === 'organizer' ? 'admin' : 'viewer',
            permissions: user.permissions || ROLE_TEMPLATES[user.role === 'organizer' ? 'admin' : 'viewer'].permissions,
            addedAt: user.addedAt || new Date().toISOString(),
            addedBy: user.addedBy || 'system',
            status: 'active'
        }));
        saveOrganizerData();
    }
}

// ================================
// ADD ORGANIZERS
// ================================
function addSingleOrganizer(email, roleTemplate) {
    /**
     * Add a single organizer with a preset role
     */
    if (!email || !roleTemplate) return false;
    
    email = email.trim().toLowerCase();
    
    // Check if already exists
    if (organizersManager.organizers.some(o => o.email === email)) {
        console.warn(`Organizer ${email} already exists`);
        return false;
    }
    
    if (!ROLE_TEMPLATES[roleTemplate]) {
        console.warn(`Invalid role template: ${roleTemplate}`);
        return false;
    }
    
    const permissions = ROLE_TEMPLATES[roleTemplate].permissions;
    
    const newOrganizer = {
        id: Date.now().toString(),
        email: email,
        roleTemplate: roleTemplate,
        permissions: Array.from(permissions),
        addedAt: new Date().toISOString(),
        addedBy: currentUser?.email || 'system',
        status: 'active'
    };
    
    organizersManager.organizers.push(newOrganizer);
    logAuditEvent('organizer_added', email, { roleTemplate, permissions: permissions.length });
    saveOrganizerData();
    
    // Sync to Firestore permissions collection (async, doesn't block UI)
    syncOrganizerToFirestore(email, roleTemplate, Array.from(permissions));
    
    return newOrganizer;
}

function addOrganizersBulk(emailsWithRoles) {
    /**
     * Add multiple organizers at once
     * @param emailsWithRoles Array of { email, roleTemplate }
     */
    const results = {
        success: [],
        failed: [],
        duplicates: []
    };
    
    emailsWithRoles.forEach(item => {
        const email = item.email?.trim().toLowerCase();
        const roleTemplate = item.roleTemplate;
        
        if (!email || !roleTemplate) {
            results.failed.push({ email, reason: 'Missing email or role' });
            return;
        }
        
        if (!ROLE_TEMPLATES[roleTemplate]) {
            results.failed.push({ email, reason: `Invalid role: ${roleTemplate}` });
            return;
        }
        
        if (organizersManager.organizers.some(o => o.email === email)) {
            results.duplicates.push(email);
            return;
        }
        
        const organizer = addSingleOrganizer(email, roleTemplate);
        if (organizer) {
            results.success.push(email);
        }
    });
    
    return results;
}

// ================================
// BULK IMPORT FROM CSV
// ================================
function parseOrganizerCSV(csvText) {
    /**
     * Parse CSV format:
     * email,role
     * john@example.com,tournament_director
     * jane@example.com,event_manager
     */
    const lines = csvText.trim().split('\n');
    const results = [];
    
    // Skip header if present
    let startIdx = 0;
    if (lines[0].toLowerCase().includes('email')) {
        startIdx = 1;
    }
    
    for (let i = startIdx; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const [email, role] = line.split(',').map(v => v.trim().toLowerCase());
        
        if (email && role) {
            results.push({
                email: email,
                roleTemplate: role
            });
        }
    }
    
    return results;
}

async function importOrganizerCSV(csvFile) {
    /**
     * Import organizers from CSV file
     */
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const csvText = event.target.result;
                const emailsWithRoles = parseOrganizerCSV(csvText);
                const results = addOrganizersBulk(emailsWithRoles);
                
                logAuditEvent('bulk_import', 'CSV', {
                    successCount: results.success.length,
                    failedCount: results.failed.length,
                    duplicateCount: results.duplicates.length
                });
                
                saveOrganizerData();
                resolve(results);
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = () => reject(reader.error);
        reader.readAsText(csvFile);
    });
}

// ================================
// PERMISSION MANAGEMENT
// ================================
function updateOrganizerPermissions(organizerEmail, newPermissions) {
    /**
     * Update specific permissions for an organizer
     */
    const organizer = organizersManager.organizers.find(o => o.email === organizerEmail);
    if (!organizer) return false;
    
    const oldPermissions = [...organizer.permissions];
    organizer.permissions = newPermissions.filter(p => PERMISSIONS[p]);
    
    logAuditEvent('permissions_updated', organizerEmail, {
        oldCount: oldPermissions.length,
        newCount: newPermissions.length,
        added: newPermissions.filter(p => !oldPermissions.includes(p)),
        removed: oldPermissions.filter(p => !newPermissions.includes(p))
    });
    
    saveOrganizerData();
    return true;
}

// ================================
// FIRESTORE PERMISSIONS SYNC (Free Tier - No Cloud Functions)
// ================================

/**
 * Sync organizer permissions to Firestore organizerPermissions collection
 * This enables server-side permission validation in Firestore rules
 * No Cloud Functions needed - works on free Firebase tier
 */
async function syncOrganizerToFirestore(organizerEmail, roleTemplate, permissions) {
    // Skip if Firebase SDK or auth not available
    if (!window.firebase || !idToken || !currentUser) {
        console.warn('⚠️ Firebase not initialized or user not logged in - skipping Firestore sync');
        return false;
    }

    try {
        const db = firebase.firestore();
        
        console.log(`📤 Syncing permissions to Firestore for ${organizerEmail}`);
        
        // Write to organizerPermissions collection
        await db.collection('organizerPermissions').doc(organizerEmail).set({
            email: organizerEmail,
            roleTemplate: roleTemplate,
            permissions: permissions,
            updatedAt: new Date(),
            updatedBy: currentUser?.email || 'system'
        });

        console.log(`✅ Permissions synced to Firestore for ${organizerEmail}`);
        return true;
    } catch (error) {
        // Log the error but don't block the operation
        console.error(`❌ Failed to sync permissions to Firestore for ${organizerEmail}:`, error);
        
        // Still return true to not block local changes
        // Permissions exist in localStorage, Firestore sync is bonus
        if (error.code === 'permission-denied') {
            console.warn(`⚠️ Permission denied writing to Firestore. Make sure first admin creates their permission document.`);
        }
        
        return true;
    }
}

/**
 * Remove organizer permissions from Firestore
 */
async function removeOrganizerFromFirestore(organizerEmail) {
    if (!window.firebase) {
        console.warn('⚠️ Firebase not initialized - skipping Firestore removal');
        return false;
    }
    try {
        const db = firebase.firestore();
        
        console.log(`🗑️ Removing permissions from Firestore for ${organizerEmail}`);
        
        await db.collection('organizerPermissions').doc(organizerEmail).delete();

        console.log(`✅ Permissions removed from Firestore for ${organizerEmail}`);
        return true;
    } catch (error) {
        // Log the error but don't block the operation
        console.error(`❌ Failed to remove from Firestore for ${organizerEmail}:`, error);
        
        // Still return true - local removal succeeded
        return true;
    }
}

function changeOrganizerRole(organizerEmail, newRoleTemplate) {
    /**
     * Change an organizer's preset role template
     */
    const organizer = organizersManager.organizers.find(o => o.email === organizerEmail);
    if (!organizer || !ROLE_TEMPLATES[newRoleTemplate]) return false;
    
    const oldRole = organizer.roleTemplate;
    organizer.roleTemplate = newRoleTemplate;
    organizer.permissions = Array.from(ROLE_TEMPLATES[newRoleTemplate].permissions);
    
    logAuditEvent('role_changed', organizerEmail, { oldRole, newRole: newRoleTemplate });
    saveOrganizerData();
    
    // Sync to Firestore permissions collection
    syncOrganizerToFirestore(organizerEmail, newRoleTemplate, organizer.permissions);
    
    return true;
}

function addPermissionToOrganizer(organizerEmail, permission) {
    /**
     * Add a single permission to an organizer
     */
    const organizer = organizersManager.organizers.find(o => o.email === organizerEmail);
    if (!organizer || !PERMISSIONS[permission]) return false;
    if (organizer.permissions.includes(permission)) return true;
    
    organizer.permissions.push(permission);
    logAuditEvent('permission_added', organizerEmail, { permission });
    saveOrganizerData();
    return true;
}

function removePermissionFromOrganizer(organizerEmail, permission) {
    /**
     * Remove a single permission from an organizer
     */
    const organizer = organizersManager.organizers.find(o => o.email === organizerEmail);
    if (!organizer) return false;
    
    organizer.permissions = organizer.permissions.filter(p => p !== permission);
    logAuditEvent('permission_removed', organizerEmail, { permission });
    saveOrganizerData();
    return true;
}

function hasPermission(organizerEmail, permission) {
    /**
     * Check if organizer has specific permission
     */
    // DEVELOPER BYPASS: Full permissions for developer account
    if (organizerEmail === 'pb@hurunuicollege.school.nz') {
        return true;
    }
    
    const organizer = organizersManager.organizers.find(o => o.email === organizerEmail);
    if (!organizer) return false;
    return organizer.permissions.includes(permission);
}

function canPerformAction(organizerEmail, action) {
    /**
     * Check if organizer can perform a specific action
     * Maps actions to required permissions
     */
    const actionMap = {
        'manage_tournaments': 'manage_tournaments',
        'manage_events': 'manage_events',
        'record_results': 'record_results',
        'manage_users': 'manage_users',
        'import_data': 'import_data',
        'export_data': 'export_data'
    };
    
    const requiredPermission = actionMap[action];
    if (!requiredPermission) return true; // Unknown action, allow by default
    
    return hasPermission(organizerEmail, requiredPermission);
}

// ================================
function removeOrganizer(organizerEmail) {
    /**
     * Remove an organizer from the system
     */
    const index = organizersManager.organizers.findIndex(o => o.email === organizerEmail);
    if (index === -1) return false;
    
    const organizer = organizersManager.organizers[index];
    organizersManager.organizers.splice(index, 1);
    
    logAuditEvent('organizer_removed', organizerEmail, { roleTemplate: organizer.roleTemplate });
    saveOrganizerData();
    
    // Remove from Firestore permissions collection (async, doesn't block UI)
    removeOrganizerFromFirestore(organizerEmail);
    
    return true;
}

function getOrganizer(organizerEmail) {
    /**
     * Get organizer details
     */
    return organizersManager.organizers.find(o => o.email === organizerEmail);
}

function getAllOrganizers() {
    /**
     * Get all organizers with full details
     */
    return organizersManager.organizers.map(org => ({
        ...org,
        roleName: ROLE_TEMPLATES[org.roleTemplate]?.label || 'Unknown',
        roleDescription: ROLE_TEMPLATES[org.roleTemplate]?.description || '',
        roleColor: ROLE_TEMPLATES[org.roleTemplate]?.color || 'gray',
        permissionCount: org.permissions.length,
        permissionLabels: org.permissions.map(p => PERMISSIONS[p]?.label || p)
    }));
}

function getOrganizersByPermission(permission) {
    /**
     * Get all organizers that have a specific permission
     */
    return organizersManager.organizers.filter(o => o.permissions.includes(permission));
}

// ================================
// AUDIT LOGGING
// ================================
function logAuditEvent(eventType, subject, details) {
    /**
     * Log changes for audit trail
     */
    const event = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        eventType: eventType,
        subject: subject,
        actor: currentUser?.email || 'system',
        details: details || {}
    };
    
    organizersManager.auditLog.push(event);
    
    // Keep only last 1000 events
    if (organizersManager.auditLog.length > 1000) {
        organizersManager.auditLog = organizersManager.auditLog.slice(-1000);
    }
    
    saveOrganizerData();
    console.log(`📝 Audit: ${eventType} - ${subject}`, details);
}

function getAuditLog(limit = 100) {
    /**
     * Get recent audit log entries
     */
    return organizersManager.auditLog
        .slice(-limit)
        .reverse()
        .map(event => ({
            ...event,
            timeAgo: getTimeAgo(event.timestamp)
        }));
}

function getTimeAgo(timestamp) {
    /**
     * Convert timestamp to relative time (e.g., "2 hours ago")
     */
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = (now - date) / 1000;
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
}

// ================================
// EXPORT/IMPORT
// ================================
function exportOrganizersToCSV() {
    /**
     * Export organizers list to CSV
     */
    let csv = 'Email,Role,Permissions Count,Added At,Added By\n';
    
    organizersManager.organizers.forEach(org => {
        const role = ROLE_TEMPLATES[org.roleTemplate]?.label || org.roleTemplate;
        csv += `"${org.email}","${role}",${org.permissions.length},"${org.addedAt}","${org.addedBy}"\n`;
    });
    
    return csv;
}

function downloadOrganizersCSV() {
    /**
     * Trigger download of organizers CSV
     */
    // LOGIN CHECK: Only logged-in users can export
    if (!window.currentUser) {
        alert('❌ You must be logged in to export the organizers list.\n\nPlease log in first.');
        return;
    }
    
    const csv = exportOrganizersToCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `organizers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// ================================
// REPORTING
// ================================
function getOrganizerStats() {
    /**
     * Get summary statistics
     */
    const stats = {
        totalOrganizers: organizersManager.organizers.length,
        byRole: {},
        topPermissions: {},
        recentChanges: 0
    };
    
    // Count by role
    organizersManager.organizers.forEach(org => {
        const role = org.roleTemplate;
        stats.byRole[role] = (stats.byRole[role] || 0) + 1;
    });
    
    // Most common permissions
    const permissionCounts = {};
    organizersManager.organizers.forEach(org => {
        org.permissions.forEach(perm => {
            permissionCounts[perm] = (permissionCounts[perm] || 0) + 1;
        });
    });
    stats.topPermissions = permissionCounts;
    
    // Recent changes (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    stats.recentChanges = organizersManager.auditLog.filter(
        e => new Date(e.timestamp) > sevenDaysAgo
    ).length;
    
    return stats;
}

// ================================
// INITIALIZATION ON LOAD
// ================================
window.addEventListener('load', () => {
    if (typeof currentUser !== 'undefined') {
        initializeOrganizerManager();
    }
});

// ================================
// EXPORTS FOR BACKWARD COMPATIBILITY
// ================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeOrganizerManager,
        addSingleOrganizer,
        addOrganizersBulk,
        parseOrganizerCSV,
        importOrganizerCSV,
        updateOrganizerPermissions,
        changeOrganizerRole,
        addPermissionToOrganizer,
        removePermissionFromOrganizer,
        hasPermission,
        canPerformAction,
        removeOrganizer,
        getOrganizer,
        getAllOrganizers,
        getOrganizersByPermission,
        getAuditLog,
        getOrganizerStats,
        downloadOrganizersCSV,
        syncOrganizerToFirestore,
        removeOrganizerFromFirestore,
        ROLE_TEMPLATES,
        PERMISSIONS
    };
}
