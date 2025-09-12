/**
 * Alliance Permission System
 * - Chat permissions management
 * - Spy database access control
 * - Member approval system
 * - Real-time permission updates
 */

class AlliancePermissionManager {
    constructor() {
        this.currentAlliance = null;
        this.currentUser = null;
        this.isAdmin = false;
        this.permissions = new Map();
        this.memberPermissions = new Map();
    }

    async initialize(allianceId, username) {
        try {
            this.currentAlliance = allianceId;
            this.currentUser = username;
            
            if (typeof window.FirebaseConfig === 'undefined') {
                console.log('Firebase nicht verfügbar, verwende lokale Berechtigungen');
                this.loadLocalPermissions();
                return;
            }

            await this.loadAlliancePermissions();
            await this.loadMemberPermissions();
            this.setupRealTimeUpdates();
            
        } catch (error) {
            console.error('Fehler beim Initialisieren des Berechtigungssystems:', error);
        }
    }

    async loadAlliancePermissions() {
        try {
            const db = window.FirebaseConfig.getDB();
            
            // Lade Allianz-Daten
            const allianceDoc = await db.collection('alliances').doc(this.currentAlliance).get();
            const allianceData = allianceDoc.data();
            
            if (!allianceData) {
                throw new Error('Allianz nicht gefunden');
            }

            this.isAdmin = allianceData.admin === this.currentUser || allianceData.founder === this.currentUser;
            
            // Setze Admin-Berechtigungen automatisch
            if (this.isAdmin) {
                await this.setAdminPermissions();
            }
            
            // Lade Berechtigungen für die Allianz
            const permissionsDoc = await db.collection('alliancePermissions')
                .doc(this.currentAlliance)
                .get();
            
            if (permissionsDoc.exists) {
                const permissionsData = permissionsDoc.data();
                this.permissions = new Map(Object.entries(permissionsData));
            } else {
                // Erstelle Standard-Berechtigungen in der gewünschten Reihenfolge
                this.permissions = new Map([
                    ['alliance_admin', { enabled: false, description: 'Allianzadmin' }],
                    ['permission_manage', { enabled: false, description: 'Berechtigungen verwalten' }],
                    ['chat_read', { enabled: true, description: 'Chat lesen' }],
                    ['chat_write', { enabled: true, description: 'Chat schreiben' }],
                    ['member_approval', { enabled: false, description: 'Mitglieder bestätigen' }],
                    ['spy_database_admin', { enabled: false, description: 'Spionage-Datenbank Admin' }],
                    ['spy_database_user', { enabled: false, description: 'Spionage-Datenbank User' }]
                ]);
                
                await this.saveAlliancePermissions();
            }

        } catch (error) {
            console.error('Fehler beim Laden der Allianz-Berechtigungen:', error);
        }
    }

    async loadMemberPermissions() {
        try {
            const db = window.FirebaseConfig.getDB();
            
            // Lade individuelle Mitglieder-Berechtigungen
            const memberPermissionsQuery = await db.collection('alliancePermissions')
                .doc(this.currentAlliance)
                .collection('memberPermissions')
                .get();
            
            this.memberPermissions.clear();
            memberPermissionsQuery.forEach(doc => {
                const data = doc.data();
                this.memberPermissions.set(doc.id, data);
            });

        } catch (error) {
            console.error('Fehler beim Laden der Mitglieder-Berechtigungen:', error);
        }
    }

    loadLocalPermissions() {
        // Fallback für lokale Entwicklung
        this.isAdmin = true; // Für lokale Entwicklung
        this.permissions = new Map([
            ['alliance_admin', { enabled: true, description: 'Allianzadmin' }],
            ['permission_manage', { enabled: true, description: 'Berechtigungen verwalten' }],
            ['chat_read', { enabled: true, description: 'Chat lesen' }],
            ['chat_write', { enabled: true, description: 'Chat schreiben' }],
            ['member_approval', { enabled: true, description: 'Mitglieder bestätigen' }],
            ['spy_database_admin', { enabled: true, description: 'Spionage-Datenbank Admin' }],
            ['spy_database_user', { enabled: true, description: 'Spionage-Datenbank User' }]
        ]);
        
        // Setze lokale Admin-Berechtigungen
        this.setLocalAdminPermissions();
    }
    
    setLocalAdminPermissions() {
        // Setze lokale Admin-Berechtigungen in der gewünschten Reihenfolge
        const adminPerms = {
            'alliance_admin': true,
            'permission_manage': true,
            'chat_read': true,
            'chat_write': true,
            'member_approval': true,
            'spy_database_admin': true,
            'spy_database_user': true
        };
        
        this.memberPermissions.set(this.currentUser, adminPerms);
        console.log('✅ Lokale Admin-Berechtigungen gesetzt');
    }

    async saveAlliancePermissions() {
        try {
            if (typeof window.FirebaseConfig === 'undefined') {
                // Lokale Speicherung
                localStorage.setItem(`alliancePermissions_${this.currentAlliance}`, 
                    JSON.stringify(Object.fromEntries(this.permissions)));
                return;
            }

            const db = window.FirebaseConfig.getDB();
            await db.collection('alliancePermissions')
                .doc(this.currentAlliance)
                .set(Object.fromEntries(this.permissions), { merge: true });

        } catch (error) {
            console.error('Fehler beim Speichern der Allianz-Berechtigungen:', error);
        }
    }

    async setMemberPermission(memberUsername, permission, enabled) {
        try {
            if (!this.isAdmin) {
                throw new Error('Nur Allianz-Admins können Berechtigungen setzen');
            }

            if (typeof window.FirebaseConfig === 'undefined') {
                // Lokale Speicherung
                const key = `memberPermissions_${this.currentAlliance}_${memberUsername}`;
                const memberPerms = JSON.parse(localStorage.getItem(key) || '{}');
                memberPerms[permission] = enabled;
                localStorage.setItem(key, JSON.stringify(memberPerms));
                return;
            }

            const db = window.FirebaseConfig.getDB();
            await db.collection('alliancePermissions')
                .doc(this.currentAlliance)
                .collection('memberPermissions')
                .doc(memberUsername)
                .set({
                    [permission]: enabled,
                    updatedAt: window.FirebaseConfig.getServerTimestamp(),
                    updatedBy: this.currentUser
                }, { merge: true });

            // Update lokale Map
            if (!this.memberPermissions.has(memberUsername)) {
                this.memberPermissions.set(memberUsername, {});
            }
            this.memberPermissions.get(memberUsername)[permission] = enabled;

        } catch (error) {
            console.error('Fehler beim Setzen der Mitglieder-Berechtigung:', error);
            throw error;
        }
    }

    hasPermission(permission, memberUsername = null) {
        const targetUser = memberUsername || this.currentUser;
        
        // Prüfe individuelle Mitglieder-Berechtigung
        if (this.memberPermissions.has(targetUser)) {
            const memberPerms = this.memberPermissions.get(targetUser);
            if (permission in memberPerms) {
                return memberPerms[permission];
            }
        }
        
        // Fallback auf Allianz-weite Berechtigung
        return this.permissions.get(permission)?.enabled || false;
    }

    canAccessSpyDatabase(memberUsername = null) {
        return this.hasPermission('spy_database_user', memberUsername) || this.hasPermission('spy_database_admin', memberUsername);
    }

    canAccessSpyDatabaseAdmin(memberUsername = null) {
        return this.hasPermission('spy_database_admin', memberUsername);
    }

    isAllianceAdmin(memberUsername = null) {
        return this.hasPermission('alliance_admin', memberUsername);
    }

    canReadChat(memberUsername = null) {
        return this.hasPermission('chat_read', memberUsername);
    }

    canWriteChat(memberUsername = null) {
        return this.hasPermission('chat_write', memberUsername);
    }

    canApproveMembers(memberUsername = null) {
        return this.hasPermission('member_approval', memberUsername);
    }

    canManagePermissions(memberUsername = null) {
        return this.hasPermission('permission_manage', memberUsername);
    }

    async approveMember(memberUsername) {
        try {
            if (!this.canApproveMembers()) {
                throw new Error('Keine Berechtigung zum Bestätigen von Mitgliedern');
            }

            if (typeof window.FirebaseConfig === 'undefined') {
                // Lokale Simulation
                console.log(`Mitglied ${memberUsername} bestätigt (lokal)`);
                return;
            }

            const db = window.FirebaseConfig.getDB();
            
            // Füge Mitglied zur Allianz hinzu
            await db.collection('alliances').doc(this.currentAlliance).update({
                members: window.FirebaseConfig.getFieldValue().arrayUnion(memberUsername),
                approvedMembers: window.FirebaseConfig.getFieldValue().arrayUnion(memberUsername)
            });

            // Log Aktivität
            await db.collection('allianceActivities').add({
                allianceId: this.currentAlliance,
                type: 'member_approved',
                member: memberUsername,
                approvedBy: this.currentUser,
                timestamp: window.FirebaseConfig.getServerTimestamp()
            });

            console.log(`Mitglied ${memberUsername} erfolgreich bestätigt`);

        } catch (error) {
            console.error('Fehler beim Bestätigen des Mitglieds:', error);
            throw error;
        }
    }

    async removeMember(memberUsername) {
        try {
            if (!this.isAdmin) {
                throw new Error('Nur Allianz-Admins können Mitglieder entfernen');
            }

            if (typeof window.FirebaseConfig === 'undefined') {
                // Lokale Simulation
                console.log(`Mitglied ${memberUsername} entfernt (lokal)`);
                return;
            }

            const db = window.FirebaseConfig.getDB();
            
            // Entferne Mitglied aus der Allianz
            await db.collection('alliances').doc(this.currentAlliance).update({
                members: window.FirebaseConfig.getFieldValue().arrayRemove(memberUsername),
                approvedMembers: window.FirebaseConfig.getFieldValue().arrayRemove(memberUsername)
            });

            // Entferne alle Berechtigungen des Mitglieds
            await db.collection('alliancePermissions')
                .doc(this.currentAlliance)
                .collection('memberPermissions')
                .doc(memberUsername)
                .delete();

            // Log Aktivität
            await db.collection('allianceActivities').add({
                allianceId: this.currentAlliance,
                type: 'member_removed',
                member: memberUsername,
                removedBy: this.currentUser,
                timestamp: window.FirebaseConfig.getServerTimestamp()
            });

            console.log(`Mitglied ${memberUsername} erfolgreich entfernt`);

        } catch (error) {
            console.error('Fehler beim Entfernen des Mitglieds:', error);
            throw error;
        }
    }

    setupRealTimeUpdates() {
        if (typeof window.FirebaseConfig === 'undefined') return;

        try {
            const db = window.FirebaseConfig.getDB();
            
            // Real-time Updates für Allianz-Berechtigungen
            db.collection('alliancePermissions')
                .doc(this.currentAlliance)
                .onSnapshot(doc => {
                    if (doc.exists) {
                        const data = doc.data();
                        this.permissions = new Map(Object.entries(data));
                        this.onPermissionsUpdated();
                    }
                });

            // Real-time Updates für Mitglieder-Berechtigungen
            db.collection('alliancePermissions')
                .doc(this.currentAlliance)
                .collection('memberPermissions')
                .onSnapshot(snapshot => {
                    this.memberPermissions.clear();
                    snapshot.forEach(doc => {
                        this.memberPermissions.set(doc.id, doc.data());
                    });
                    this.onMemberPermissionsUpdated();
                });

        } catch (error) {
            console.error('Fehler beim Setup der Real-time Updates:', error);
        }
    }

    onPermissionsUpdated() {
        // Wird von der UI überschrieben
        console.log('Berechtigungen aktualisiert');
    }

    onMemberPermissionsUpdated() {
        // Wird von der UI überschrieben
        console.log('Mitglieder-Berechtigungen aktualisiert');
    }

    getPermissionList() {
        return Array.from(this.permissions.entries()).map(([key, value]) => ({
            id: key,
            enabled: value.enabled,
            description: value.description
        }));
    }

    getMemberPermissionList(memberUsername) {
        const memberPerms = this.memberPermissions.get(memberUsername) || {};
        return Array.from(this.permissions.entries()).map(([key, value]) => ({
            id: key,
            enabled: memberPerms[key] !== undefined ? memberPerms[key] : value.enabled,
            description: value.description,
            isCustom: memberPerms[key] !== undefined
        }));
    }

    async setAdminPermissions() {
        try {
            console.log('👑 Setze Admin-Berechtigungen für:', this.currentUser);
            
            // Setze alle Berechtigungen für den Admin auf true in der gewünschten Reihenfolge
            const adminPermissions = {
                'alliance_admin': true,
                'permission_manage': true,
                'chat_read': true,
                'chat_write': true,
                'member_approval': true,
                'spy_database_admin': true,
                'spy_database_user': true
            };
            
            // Speichere Admin-Berechtigungen in der gewünschten Reihenfolge
            await this.setMemberPermission(this.currentUser, 'alliance_admin', true);
            await this.setMemberPermission(this.currentUser, 'permission_manage', true);
            await this.setMemberPermission(this.currentUser, 'chat_read', true);
            await this.setMemberPermission(this.currentUser, 'chat_write', true);
            await this.setMemberPermission(this.currentUser, 'member_approval', true);
            await this.setMemberPermission(this.currentUser, 'spy_database_admin', true);
            await this.setMemberPermission(this.currentUser, 'spy_database_user', true);
            
            console.log('✅ Admin-Berechtigungen gesetzt');
            
        } catch (error) {
            console.error('Fehler beim Setzen der Admin-Berechtigungen:', error);
        }
    }

    async updateAlliancePermission(permission, enabled) {
        try {
            if (!this.isAdmin) {
                throw new Error('Nur Allianz-Admins können Berechtigungen ändern');
            }

            this.permissions.set(permission, { 
                ...this.permissions.get(permission), 
                enabled: enabled 
            });
            
            await this.saveAlliancePermissions();
            console.log(`Berechtigung ${permission} auf ${enabled} gesetzt`);

        } catch (error) {
            console.error('Fehler beim Aktualisieren der Allianz-Berechtigung:', error);
            throw error;
        }
    }
}

// Globale Instanz
window.AlliancePermissionManager = AlliancePermissionManager;