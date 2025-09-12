/**
 * Alliance Member Management System
 * - Add members by username or email
 * - Member approval system
 * - Permission management interface
 * - Real-time member updates
 */

class AllianceMemberManager {
    constructor() {
        this.currentAlliance = null;
        this.currentUser = null;
        this.isAdmin = false;
        this.members = [];
        this.pendingMembers = [];
        this.permissionManager = null;
    }

    async initialize(allianceId, username, permissionManager) {
        try {
            this.currentAlliance = allianceId;
            this.currentUser = username;
            this.permissionManager = permissionManager;
            
            if (typeof window.FirebaseConfig === 'undefined') {
                console.log('Firebase nicht verfügbar, verwende lokale Mitglieder-Verwaltung');
                this.loadLocalMembers();
                return;
            }

            await this.loadMembers();
            this.setupRealTimeUpdates();
            
        } catch (error) {
            console.error('Fehler beim Initialisieren der Mitglieder-Verwaltung:', error);
        }
    }

    async loadMembers() {
        try {
            const db = window.FirebaseConfig.getDB();
            
            // Lade Allianz-Daten
            const allianceDoc = await db.collection('alliances').doc(this.currentAlliance).get();
            const allianceData = allianceDoc.data();
            
            if (!allianceData) {
                throw new Error('Allianz nicht gefunden');
            }

            // Prüfe Admin-Status aus Alliance-Daten
            let adminFromAlliance = allianceData.admin === this.currentUser || allianceData.founder === this.currentUser;
            
            // Prüfe zusätzlich User-Datenbank für allianceRole
            let adminFromUserData = false;
            try {
                const userDoc = await db.collection('users').doc(this.currentUser).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    adminFromUserData = userData.allianceRole === 'admin' || userData.allianceRole === 'founder';
                }
            } catch (error) {
                console.warn('⚠️ Konnte User-Daten nicht laden:', error);
            }
            
            // User ist Admin wenn er in Alliance-Daten ODER User-Daten als Admin markiert ist
            this.isAdmin = adminFromAlliance || adminFromUserData;
            
            console.log('👑 MemberManager Admin-Status:', {
                currentUser: this.currentUser,
                adminFromAlliance: adminFromAlliance,
                adminFromUserData: adminFromUserData,
                finalStatus: this.isAdmin
            });
            
            // Setze Allianzadmin-Berechtigung für den Admin
            if (this.isAdmin && this.permissionManager) {
                await this.permissionManager.setMemberPermission(this.currentUser, 'alliance_admin', true);
            }
            this.members = allianceData.members || [];
            this.pendingMembers = allianceData.pendingMembers || [];
            
            console.log('Mitglieder geladen:', {
                members: this.members.length,
                pending: this.pendingMembers.length,
                isAdmin: this.isAdmin
            });

        } catch (error) {
            console.error('Fehler beim Laden der Mitglieder:', error);
        }
    }

    loadLocalMembers() {
        // Fallback für lokale Entwicklung
        this.isAdmin = true;
        this.members = ['Daikin', 'TestUser1', 'SpacePilot'];
        this.pendingMembers = ['NewMember1', 'NewMember2'];
    }

    async addMemberByUsername(username) {
        try {
            if (!this.isAdmin) {
                throw new Error('Nur Allianz-Admins können Mitglieder hinzufügen');
            }

            // Prüfe ob Benutzer existiert
            const userExists = await this.checkUserExists(username);
            if (!userExists) {
                throw new Error(`Benutzer "${username}" existiert nicht`);
            }

            // Prüfe ob bereits Mitglied
            if (this.members.includes(username)) {
                throw new Error(`"${username}" ist bereits Mitglied der Allianz`);
            }

            if (typeof window.FirebaseConfig === 'undefined') {
                // Lokale Simulation
                this.members.push(username);
                console.log(`Mitglied ${username} hinzugefügt (lokal)`);
                this.onMembersUpdated();
                return;
            }

            const db = window.FirebaseConfig.getDB();
            
            // Füge Mitglied zur Allianz hinzu
            await db.collection('alliances').doc(this.currentAlliance).update({
                members: firebase.firestore.FieldValue.arrayUnion(username),
                lastUpdated: window.FirebaseConfig.getServerTimestamp()
            });

            // Aktualisiere User-Dokument mit Allianz-Information
            await db.collection('users').doc(username).update({
                alliance: this.currentAlliance,
                allianceRole: 'member',
                lastUpdated: window.FirebaseConfig.getServerTimestamp()
            });

            // Log Aktivität
            await db.collection('allianceActivities').add({
                allianceId: this.currentAlliance,
                type: 'member_added',
                member: username,
                addedBy: this.currentUser,
                timestamp: window.FirebaseConfig.getServerTimestamp()
            });

            console.log(`Mitglied ${username} erfolgreich hinzugefügt`);

        } catch (error) {
            console.error('Fehler beim Hinzufügen des Mitglieds:', error);
            throw error;
        }
    }

    async addMemberByEmail(email) {
        try {
            if (!this.isAdmin) {
                throw new Error('Nur Allianz-Admins können Mitglieder hinzufügen');
            }

            // Suche Benutzer nach E-Mail
            const username = await this.findUserByEmail(email);
            if (!username) {
                throw new Error(`Kein Benutzer mit E-Mail "${email}" gefunden`);
            }

            // Füge als Mitglied hinzu
            await this.addMemberByUsername(username);

        } catch (error) {
            console.error('Fehler beim Hinzufügen des Mitglieds per E-Mail:', error);
            throw error;
        }
    }

    async checkUserExists(username) {
        try {
            if (typeof window.FirebaseConfig === 'undefined') {
                // Lokale Simulation - alle Benutzer existieren
                return true;
            }

            const db = window.FirebaseConfig.getDB();
            const userDoc = await db.collection('users').doc(username).get();
            return userDoc.exists;

        } catch (error) {
            console.error('Fehler beim Prüfen des Benutzers:', error);
            return false;
        }
    }

    async findUserByEmail(email) {
        try {
            if (typeof window.FirebaseConfig === 'undefined') {
                // Lokale Simulation
                const emailToUsername = {
                    'test1@example.com': 'TestUser1',
                    'admin@example.com': 'TestAdmin',
                    'superadmin@example.com': 'TestSuperAdmin',
                    'pilot@spacenations.com': 'SpacePilot',
                    'leader@alliance.com': 'AllianceLeader'
                };
                return emailToUsername[email] || null;
            }

            const db = window.FirebaseConfig.getDB();
            const usersQuery = await db.collection('users')
                .where('email', '==', email)
                .limit(1)
                .get();

            if (usersQuery.empty) {
                return null;
            }

            return usersQuery.docs[0].id;

        } catch (error) {
            console.error('Fehler beim Suchen des Benutzers per E-Mail:', error);
            return null;
        }
    }

    async removeMember(username) {
        try {
            if (!this.isAdmin) {
                throw new Error('Nur Allianz-Admins können Mitglieder entfernen');
            }

            if (!this.members.includes(username)) {
                throw new Error(`"${username}" ist kein Mitglied der Allianz`);
            }

            if (typeof window.FirebaseConfig === 'undefined') {
                // Lokale Simulation
                this.members = this.members.filter(member => member !== username);
                console.log(`Mitglied ${username} entfernt (lokal)`);
                this.onMembersUpdated();
                return;
            }

            const db = window.FirebaseConfig.getDB();
            
            // Entferne Mitglied aus der Allianz
            await db.collection('alliances').doc(this.currentAlliance).update({
                members: firebase.firestore.FieldValue.arrayRemove(username),
                lastUpdated: window.FirebaseConfig.getServerTimestamp()
            });

            // Entferne Allianz-Information vom User
            await db.collection('users').doc(username).update({
                alliance: null,
                allianceRole: null,
                lastUpdated: window.FirebaseConfig.getServerTimestamp()
            });

            // Entferne alle Berechtigungen des Mitglieds
            await db.collection('alliancePermissions')
                .doc(this.currentAlliance)
                .collection('memberPermissions')
                .doc(username)
                .delete();

            // Log Aktivität
            await db.collection('allianceActivities').add({
                allianceId: this.currentAlliance,
                type: 'member_removed',
                member: username,
                removedBy: this.currentUser,
                timestamp: window.FirebaseConfig.getServerTimestamp()
            });

            console.log(`Mitglied ${username} erfolgreich entfernt`);

        } catch (error) {
            console.error('Fehler beim Entfernen des Mitglieds:', error);
            throw error;
        }
    }

    async approvePendingMember(username) {
        try {
            if (!this.permissionManager.canApproveMembers()) {
                throw new Error('Keine Berechtigung zum Bestätigen von Mitgliedern');
            }

            if (!this.pendingMembers.includes(username)) {
                throw new Error(`"${username}" ist nicht in der Warteliste`);
            }

            if (typeof window.FirebaseConfig === 'undefined') {
                // Lokale Simulation
                this.pendingMembers = this.pendingMembers.filter(member => member !== username);
                this.members.push(username);
                console.log(`Mitglied ${username} bestätigt (lokal)`);
                this.onMembersUpdated();
                return;
            }

            const db = window.FirebaseConfig.getDB();
            
            // Füge Mitglied zur Allianz hinzu und entferne aus Warteliste
            await db.collection('alliances').doc(this.currentAlliance).update({
                members: firebase.firestore.FieldValue.arrayUnion(username),
                pendingMembers: firebase.firestore.FieldValue.arrayRemove(username),
                lastUpdated: window.FirebaseConfig.getServerTimestamp()
            });

            // Log Aktivität
            await db.collection('allianceActivities').add({
                allianceId: this.currentAlliance,
                type: 'member_approved',
                member: username,
                approvedBy: this.currentUser,
                timestamp: window.FirebaseConfig.getServerTimestamp()
            });

            console.log(`Mitglied ${username} erfolgreich bestätigt`);

        } catch (error) {
            console.error('Fehler beim Bestätigen des Mitglieds:', error);
            throw error;
        }
    }

    setupRealTimeUpdates() {
        if (typeof window.FirebaseConfig === 'undefined') return;

        try {
            const db = window.FirebaseConfig.getDB();
            
            // Real-time Updates für Allianz-Mitglieder
            db.collection('alliances').doc(this.currentAlliance)
                .onSnapshot(doc => {
                    if (doc.exists) {
                        const data = doc.data();
                        this.members = data.members || [];
                        this.pendingMembers = data.pendingMembers || [];
                        this.onMembersUpdated();
                    }
                });

        } catch (error) {
            console.error('Fehler beim Setup der Real-time Updates:', error);
        }
    }

    onMembersUpdated() {
        // Wird von der UI überschrieben
        console.log('Mitglieder aktualisiert:', {
            members: this.members.length,
            pending: this.pendingMembers.length
        });
    }

    getMembers() {
        return this.members;
    }

    getPendingMembers() {
        return this.pendingMembers;
    }

    isMember(username) {
        return this.members.includes(username);
    }

    isPendingMember(username) {
        return this.pendingMembers.includes(username);
    }

    canManageMembers() {
        return this.isAdmin || this.permissionManager?.canApproveMembers();
    }

    async setAllianceAdmin(username) {
        try {
            if (!this.isAdmin) {
                throw new Error('Nur der aktuelle Allianzadmin kann einen neuen Admin setzen');
            }

            if (typeof window.FirebaseConfig === 'undefined') {
                // Lokale Simulation
                console.log(`Allianzadmin auf ${username} gesetzt (lokal)`);
                return;
            }

            const db = window.FirebaseConfig.getDB();
            
            // Setze neuen Admin in der Allianz
            await db.collection('alliances').doc(this.currentAlliance).update({
                admin: username,
                lastUpdated: window.FirebaseConfig.getServerTimestamp()
            });

            // Setze Allianzadmin-Berechtigung für den neuen Admin
            if (this.permissionManager) {
                await this.permissionManager.setMemberPermission(username, 'alliance_admin', true);
            }

            // Aktualisiere User-Dokument mit Admin-Rolle
            await db.collection('users').doc(username).update({
                alliance: this.currentAlliance,
                allianceRole: 'admin',
                lastUpdated: window.FirebaseConfig.getServerTimestamp()
            });

            // Entferne Admin-Rolle vom vorherigen Admin (falls vorhanden)
            if (this.currentUser !== username) {
                await db.collection('users').doc(this.currentUser).update({
                    allianceRole: 'member',
                    lastUpdated: window.FirebaseConfig.getServerTimestamp()
                });
            }

            // Log Aktivität
            await db.collection('allianceActivities').add({
                allianceId: this.currentAlliance,
                type: 'admin_changed',
                newAdmin: username,
                changedBy: this.currentUser,
                timestamp: window.FirebaseConfig.getServerTimestamp()
            });

            console.log(`Allianzadmin erfolgreich auf ${username} gesetzt`);

        } catch (error) {
            console.error('Fehler beim Setzen des Allianzadmins:', error);
            throw error;
        }
    }
}

// Globale Instanz
window.AllianceMemberManager = AllianceMemberManager;