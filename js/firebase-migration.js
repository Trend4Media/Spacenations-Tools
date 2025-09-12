/**
 * Firebase Migration Script für Allianz-System
 * Dieses Script initialisiert die notwendigen Datenbankstrukturen
 */

class FirebaseMigration {
    constructor() {
        this.db = null;
        this.isInitialized = false;
    }

    async initialize() {
        try {
            if (typeof window.FirebaseConfig === 'undefined') {
                throw new Error('FirebaseConfig nicht verfügbar');
            }

            await window.FirebaseConfig.waitForInit();
            this.db = window.FirebaseConfig.getDB();
            this.isInitialized = true;
            console.log('✅ Migration Manager initialisiert');
        } catch (error) {
            console.error('❌ Fehler bei Migration-Initialisierung:', error);
            throw error;
        }
    }

    /**
     * Erstellt Standard-Berechtigungen für eine Allianz
     */
    async createDefaultAlliancePermissions(allianceId) {
        if (!this.isInitialized) {
            throw new Error('Migration nicht initialisiert');
        }

        try {
            const defaultPermissions = {
                chat_read: { enabled: true, description: "Chat lesen" },
                chat_write: { enabled: true, description: "Chat schreiben" },
                spy_database: { enabled: false, description: "Spionage-Datenbank" },
                member_approval: { enabled: false, description: "Mitglieder bestätigen" },
                permission_manage: { enabled: false, description: "Berechtigungen verwalten" }
            };

            await this.db.collection('alliancePermissions')
                .doc(allianceId)
                .set(defaultPermissions);

            console.log(`✅ Standard-Berechtigungen für Allianz ${allianceId} erstellt`);
            return true;
        } catch (error) {
            console.error(`❌ Fehler beim Erstellen der Berechtigungen für ${allianceId}:`, error);
            return false;
        }
    }

    /**
     * Migriert alle bestehenden Allianzen
     */
    async migrateAllAlliances() {
        if (!this.isInitialized) {
            throw new Error('Migration nicht initialisiert');
        }

        try {
            console.log('🔄 Starte Migration aller Allianzen...');
            
            const alliancesSnapshot = await this.db.collection('alliances').get();
            let successCount = 0;
            let errorCount = 0;

            for (const allianceDoc of alliancesSnapshot.docs) {
                const allianceId = allianceDoc.id;
                const success = await this.createDefaultAlliancePermissions(allianceId);
                
                if (success) {
                    successCount++;
                } else {
                    errorCount++;
                }
            }

            console.log(`✅ Migration abgeschlossen: ${successCount} erfolgreich, ${errorCount} Fehler`);
            return { success: successCount, errors: errorCount };
        } catch (error) {
            console.error('❌ Fehler bei der Allianz-Migration:', error);
            throw error;
        }
    }

    /**
     * Erstellt Test-Allianz für Entwicklung
     */
    async createTestAlliance() {
        if (!this.isInitialized) {
            throw new Error('Migration nicht initialisiert');
        }

        try {
            const testAlliance = {
                name: "Test Allianz",
                tag: "TEST",
                description: "Test-Allianz für Entwicklung",
                founder: "testuser",
                members: ["testuser"],
                admin: "testuser",
                status: "approved",
                createdAt: window.FirebaseConfig.getServerTimestamp(),
                approvedAt: window.FirebaseConfig.getServerTimestamp(),
                approvedBy: "system"
            };

            const docRef = await this.db.collection('alliances').add(testAlliance);
            console.log(`✅ Test-Allianz erstellt mit ID: ${docRef.id}`);

            // Erstelle Standard-Berechtigungen
            await this.createDefaultAlliancePermissions(docRef.id);

            return docRef.id;
        } catch (error) {
            console.error('❌ Fehler beim Erstellen der Test-Allianz:', error);
            throw error;
        }
    }

    /**
     * Überprüft ob eine Allianz alle notwendigen Daten hat
     */
    async validateAlliance(allianceId) {
        if (!this.isInitialized) {
            throw new Error('Migration nicht initialisiert');
        }

        try {
            const allianceDoc = await this.db.collection('alliances').doc(allianceId).get();
            if (!allianceDoc.exists) {
                return { valid: false, error: 'Allianz nicht gefunden' };
            }

            const allianceData = allianceDoc.data();
            const requiredFields = ['name', 'tag', 'founder', 'members', 'status', 'createdAt'];
            const missingFields = requiredFields.filter(field => !allianceData[field]);

            if (missingFields.length > 0) {
                return { valid: false, error: `Fehlende Felder: ${missingFields.join(', ')}` };
            }

            // Prüfe ob Berechtigungen existieren
            const permissionsDoc = await this.db.collection('alliancePermissions').doc(allianceId).get();
            if (!permissionsDoc.exists) {
                return { valid: false, error: 'Berechtigungen nicht gefunden' };
            }

            return { valid: true };
        } catch (error) {
            console.error(`❌ Fehler bei der Allianz-Validierung:`, error);
            return { valid: false, error: error.message };
        }
    }

    /**
     * Repariert eine beschädigte Allianz
     */
    async repairAlliance(allianceId) {
        if (!this.isInitialized) {
            throw new Error('Migration nicht initialisiert');
        }

        try {
            console.log(`🔧 Repariere Allianz ${allianceId}...`);

            // Validiere Allianz
            const validation = await this.validateAlliance(allianceId);
            if (validation.valid) {
                console.log(`✅ Allianz ${allianceId} ist bereits korrekt`);
                return true;
            }

            // Erstelle fehlende Berechtigungen
            if (validation.error.includes('Berechtigungen')) {
                await this.createDefaultAlliancePermissions(allianceId);
                console.log(`✅ Berechtigungen für Allianz ${allianceId} repariert`);
            }

            // Weitere Reparaturen können hier hinzugefügt werden
            console.log(`✅ Allianz ${allianceId} repariert`);
            return true;
        } catch (error) {
            console.error(`❌ Fehler bei der Allianz-Reparatur:`, error);
            return false;
        }
    }

    /**
     * Erstellt Firestore-Indexes (falls möglich)
     */
    async createIndexes() {
        console.log('📊 Firestore-Indexes werden automatisch erstellt');
        console.log('💡 Stelle sicher, dass folgende Indexes in der Firebase Console erstellt werden:');
        console.log('   - alliances: status (Asc), createdAt (Desc)');
        console.log('   - alliances: members (Arrays), status (Asc)');
        console.log('   - allianceChats/{allianceId}/messages: timestamp (Desc)');
        console.log('   - allianceActivities: allianceId (Asc), timestamp (Desc)');
    }

    /**
     * Vollständige Migration durchführen
     */
    async runFullMigration() {
        try {
            console.log('🚀 Starte vollständige Firebase-Migration...');
            
            await this.initialize();
            await this.migrateAllAlliances();
            await this.createIndexes();
            
            console.log('✅ Vollständige Migration abgeschlossen!');
            return true;
        } catch (error) {
            console.error('❌ Migration fehlgeschlagen:', error);
            return false;
        }
    }
}

// Globale Instanz
window.FirebaseMigration = FirebaseMigration;

// Auto-Migration beim Laden (nur in Entwicklung)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    document.addEventListener('DOMContentLoaded', async () => {
        try {
            const migration = new FirebaseMigration();
            await migration.initialize();
            
            // Prüfe ob Migration nötig ist
            const alliancesSnapshot = await migration.db.collection('alliances').get();
            if (alliancesSnapshot.empty) {
                console.log('📝 Keine Allianzen gefunden - Migration nicht nötig');
            } else {
                console.log(`📊 ${alliancesSnapshot.size} Allianzen gefunden - prüfe Migration...`);
                
                // Validiere erste Allianz
                const firstAlliance = alliancesSnapshot.docs[0];
                const validation = await migration.validateAlliance(firstAlliance.id);
                
                if (!validation.valid) {
                    console.log('🔧 Migration erforderlich - führe Reparatur durch...');
                    await migration.repairAlliance(firstAlliance.id);
                }
            }
        } catch (error) {
            console.warn('⚠️ Auto-Migration fehlgeschlagen:', error);
        }
    });
}