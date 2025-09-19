/**
 * EINHEITLICHE USER-DATENSTRUKTUR
 * Definiert die Standard-Benutzerstruktur für alle neuen Registrierungen
 */

class UserDataStructure {
    /**
     * Standard-Benutzerstruktur für neue Registrierungen
     * @param {Object} authUser - Firebase Auth User Object
     * @param {string} username - Gewählter Benutzername
     * @param {Object} additionalData - Zusätzliche Daten
     * @returns {Object} - Vollständige User-Datenstruktur
     */
    static createStandardUser(authUser, username, additionalData = {}) {
        const now = new Date();
        
        return {
            // === BASIC USER INFO ===
            uid: authUser.uid,
            email: authUser.email.toLowerCase(),
            username: username || authUser.displayName || authUser.email.split('@')[0],
            displayName: username || authUser.displayName || authUser.email.split('@')[0],
            
            // === ACCOUNT STATUS ===
            isActive: true,
            isVerified: authUser.emailVerified || false,
            accountStatus: 'active', // 'active', 'suspended', 'pending', 'deleted'
            
            // === PERMISSIONS & ROLES ===
            // System-Level Permissions
            isSuperAdmin: false, // Nur für System-Administratoren
            isSystemAdmin: false, // Für technische Administratoren
            
            // Alliance-Level Permissions
            isAllianceAdmin: false, // Admin der eigenen Allianz
            isAllianceModerator: false, // Moderator der eigenen Allianz
            isAllianceMember: false, // Mitglied einer Allianz
            
            // Tool-Permissions
            canUseSpyDatabase: false, // Zugriff auf Spionage-Datenbank
            canUseRaidCounter: true, // Zugriff auf Raid-Counter
            canUseSaboCounter: true, // Zugriff auf Sabotage-Counter
            canUseBattleCounter: true, // Zugriff auf Battle-Counter
            canCreateAlliance: true, // Kann Allianzen erstellen
            canJoinAlliance: true, // Kann Allianzen beitreten
            
            // Dashboard-Permissions
            canAccessUserDashboard: true,
            canAccessAllianceDashboard: false, // Nur wenn in Allianz
            canAccessAdminDashboard: false, // Nur für Admins
            
            // === ALLIANCE DATA ===
            alliance: {
                name: null, // Name der Allianz
                id: null, // Allianz-ID
                role: null, // 'member', 'moderator', 'admin'
                joinedAt: null, // Beitrittsdatum
                invitedBy: null, // Wer hat eingeladen
                status: 'none' // 'none', 'pending', 'member', 'left', 'kicked'
            },
            
            // === SYSTEM ROLES ===
            systemRole: 'user', // 'user', 'moderator', 'admin', 'superadmin'
            userRole: 'member', // 'member', 'premium', 'vip'
            
            // === DETAILED PERMISSIONS ===
            permissions: {
                // System Permissions
                system_settings: false,
                user_management: false,
                alliance_management: false,
                
                // Dashboard Permissions
                dashboard_access: true,
                profile_edit: true,
                
                // Tool Permissions
                spy_database_read: false,
                spy_database_write: false,
                spy_database_delete: false,
                spy_database_admin: false,
                
                // Alliance Permissions
                alliance_create: true,
                alliance_join: true,
                alliance_leave: true,
                alliance_invite: false,
                alliance_kick: false,
                alliance_settings: false,
                
                // Admin Permissions
                admin_dashboard: false,
                admin_users: false,
                admin_alliances: false,
                admin_system: false
            },
            
            // === ACTIVITY & STATS ===
            stats: {
                loginCount: 1,
                lastLogin: now,
                firstLogin: now,
                totalSpyReports: 0,
                totalRaids: 0,
                totalBattles: 0,
                totalSabotages: 0
            },
            
            // === PREFERENCES ===
            preferences: {
                theme: 'dark',
                language: 'de',
                notifications: true,
                emailNotifications: false,
                showTutorials: true,
                defaultDashboard: 'user' // 'user', 'alliance', 'admin'
            },
            
            // === METADATA ===
            metadata: {
                createdAt: now,
                updatedAt: now,
                lastUpdatedBy: authUser.uid,
                version: '2.0',
                source: 'registration',
                ipAddress: null, // Wird später gesetzt
                userAgent: navigator.userAgent || null
            },
            
            // === ADDITIONAL DATA ===
            ...additionalData
        };
    }
    
    /**
     * Erstellt einen Super-Admin User
     */
    static createSuperAdmin(authUser, username, additionalData = {}) {
        const standardUser = this.createStandardUser(authUser, username, additionalData);
        
        return {
            ...standardUser,
            
            // Super-Admin Permissions
            isSuperAdmin: true,
            isSystemAdmin: true,
            isAllianceAdmin: true,
            
            // All Tool Permissions
            canUseSpyDatabase: true,
            canAccessAdminDashboard: true,
            canAccessAllianceDashboard: true,
            
            systemRole: 'superadmin',
            userRole: 'vip',
            
            // All Permissions
            permissions: {
                ...standardUser.permissions,
                system_settings: true,
                user_management: true,
                alliance_management: true,
                spy_database_read: true,
                spy_database_write: true,
                spy_database_delete: true,
                spy_database_admin: true,
                alliance_invite: true,
                alliance_kick: true,
                alliance_settings: true,
                admin_dashboard: true,
                admin_users: true,
                admin_alliances: true,
                admin_system: true
            },
            
            metadata: {
                ...standardUser.metadata,
                source: 'superadmin_creation'
            }
        };
    }
    
    /**
     * Aktualisiert User-Permissions basierend auf Allianz-Status
     */
    static updateAlliancePermissions(userData, allianceRole) {
        const updatedUser = { ...userData };
        
        switch (allianceRole) {
            case 'admin':
                updatedUser.isAllianceAdmin = true;
                updatedUser.isAllianceModerator = true;
                updatedUser.isAllianceMember = true;
                updatedUser.canUseSpyDatabase = true;
                updatedUser.canAccessAllianceDashboard = true;
                
                updatedUser.permissions.spy_database_read = true;
                updatedUser.permissions.spy_database_write = true;
                updatedUser.permissions.spy_database_delete = true;
                updatedUser.permissions.alliance_invite = true;
                updatedUser.permissions.alliance_kick = true;
                updatedUser.permissions.alliance_settings = true;
                break;
                
            case 'moderator':
                updatedUser.isAllianceModerator = true;
                updatedUser.isAllianceMember = true;
                updatedUser.canUseSpyDatabase = true;
                updatedUser.canAccessAllianceDashboard = true;
                
                updatedUser.permissions.spy_database_read = true;
                updatedUser.permissions.spy_database_write = true;
                updatedUser.permissions.alliance_invite = true;
                break;
                
            case 'member':
                updatedUser.isAllianceMember = true;
                updatedUser.canUseSpyDatabase = true;
                updatedUser.canAccessAllianceDashboard = true;
                
                updatedUser.permissions.spy_database_read = true;
                updatedUser.permissions.spy_database_write = true;
                break;
                
            default:
                // Keine Allianz
                updatedUser.isAllianceAdmin = false;
                updatedUser.isAllianceModerator = false;
                updatedUser.isAllianceMember = false;
                updatedUser.canUseSpyDatabase = false;
                updatedUser.canAccessAllianceDashboard = false;
                
                updatedUser.permissions.spy_database_read = false;
                updatedUser.permissions.spy_database_write = false;
                updatedUser.permissions.spy_database_delete = false;
                updatedUser.permissions.alliance_invite = false;
                updatedUser.permissions.alliance_kick = false;
                updatedUser.permissions.alliance_settings = false;
        }
        
        updatedUser.metadata.updatedAt = new Date();
        return updatedUser;
    }
    
    /**
     * Validiert User-Daten
     */
    static validateUserData(userData) {
        const errors = [];
        
        if (!userData.uid) errors.push('UID fehlt');
        if (!userData.email) errors.push('E-Mail fehlt');
        if (!userData.username) errors.push('Benutzername fehlt');
        
        // E-Mail Format prüfen
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            errors.push('Ungültiges E-Mail-Format');
        }
        
        // Username Format prüfen
        if (userData.username.length < 3) {
            errors.push('Benutzername muss mindestens 3 Zeichen lang sein');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
    
    /**
     * Migriert alte User-Daten zur neuen Struktur
     */
    static migrateOldUserData(oldUserData, authUser) {
        console.log('🔄 Migriere alte User-Daten zur neuen Struktur');
        
        const newUserData = this.createStandardUser(authUser, oldUserData.username);
        
        // Übertrage bekannte Felder
        if (oldUserData.isSuperAdmin) {
            return this.createSuperAdmin(authUser, oldUserData.username, {
                stats: {
                    ...newUserData.stats,
                    loginCount: oldUserData.loginCount || 1
                }
            });
        }
        
        // Standard-Migration
        newUserData.stats.loginCount = oldUserData.loginCount || 1;
        newUserData.isActive = oldUserData.isActive !== false;
        
        // Übertrage Allianz-Daten falls vorhanden
        if (oldUserData.alliance || oldUserData.allianceName) {
            newUserData.alliance.name = oldUserData.alliance || oldUserData.allianceName;
            newUserData.alliance.status = 'member';
            newUserData = this.updateAlliancePermissions(newUserData, 'member');
        }
        
        return newUserData;
    }
}

// Globale Verfügbarkeit
window.UserDataStructure = UserDataStructure;

console.log('📋 UserDataStructure geladen');