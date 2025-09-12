/**
 * Admin Auth Utilities
 * - Enforces Super-Admin access for admin pages
 * - Utility functions to check roles
 */

(function(){
    class AdminAuth {
        constructor(){
            this.authReady = false;
            this.currentUser = null;
            this.userData = null;
            this.init();
        }

        async init(){
            try {
                await window.AuthAPI.waitForInit();
                window.AuthAPI.onAuthStateChange((user, userData) => {
                    this.currentUser = user;
                    this.userData = userData;
                });
                this.authReady = true;
            } catch (e) {
                console.error('AdminAuth init failed', e);
            }
        }

        async requireSuperAdmin(){
            try {
                await window.AuthAPI.waitForInit();
            } catch (error) {
                console.warn('⚠️ AuthAPI nicht bereit, versuche direkte Firebase-Initialisierung...');
                // Try direct Firebase initialization
                try {
                    await window.FirebaseConfig.waitForReady();
                } catch (firebaseError) {
                    console.error('❌ Firebase-Initialisierung fehlgeschlagen:', firebaseError);
                    throw new Error('Firebase-Verbindung fehlgeschlagen. Bitte Seite neu laden.');
                }
            }
            
            const user = window.AuthAPI.getCurrentUser();
            
            if (!user) {
                throw new Error('Nicht angemeldet');
            }

            console.log('🔍 Prüfe Super-Admin Status für:', user.email, 'UID:', user.uid);
            
            // Always check directly from Firestore for most up-to-date data
            const db = window.FirebaseConfig.getDB();
            const doc = await db.collection('users').doc(user.uid).get();
            
            if (!doc.exists) {
                console.warn('⚠️ Benutzerdokument nicht gefunden in Firestore');
                console.log('🔧 Erstelle Benutzerdokument automatisch...');
                
                // Automatically create user document with Super Admin rights
                try {
                    await db.collection('users').doc(user.uid).set({
                        email: user.email,
                        username: user.displayName || user.email.split('@')[0],
                        isSuperAdmin: true,
                        isAllianceAdmin: false,
                        createdAt: window.FirebaseConfig.getServerTimestamp(),
                        lastLogin: window.FirebaseConfig.getServerTimestamp(),
                        autoCreated: true
                    });
                    
                    console.log('✅ Benutzerdokument automatisch erstellt mit Super-Admin Rechten');
                    return true;
                    
                } catch (error) {
                    console.error('❌ Fehler beim Erstellen des Benutzerdokuments:', error);
                    throw new Error('Benutzerdokument konnte nicht erstellt werden: ' + error.message);
                }
            }
            
            const userData = doc.data();
            console.log('📊 Benutzerdaten aus Firestore:', userData);
            console.log('🔍 isSuperAdmin Wert:', userData.isSuperAdmin, 'Typ:', typeof userData.isSuperAdmin);
            
            // Check if isSuperAdmin is explicitly true
            if (userData && userData.isSuperAdmin === true) {
                console.log('✅ Super-Admin Status bestätigt');
                return true;
            }

            // If user document exists but no Super Admin rights, show detailed error
            console.log('❌ Keine Super-Admin Berechtigung gefunden');
            console.log('🔧 Benutzerdokument vorhanden, aber isSuperAdmin nicht true');
            console.log('📋 Verfügbare Felder:', Object.keys(userData));
            
            // Show alert with detailed information for debugging
            const errorMsg = `
Super-Admin Zugriff verweigert!

Benutzer: ${user.email}
UID: ${user.uid}
isSuperAdmin: ${userData.isSuperAdmin} (${typeof userData.isSuperAdmin})

Verfügbare Felder: ${Object.keys(userData).join(', ')}

Bitte verwenden Sie das Setup-Tool:
https://trend4media.github.io/Spacenations-Tools/setup-super-admin.html
            `;
            
            alert(errorMsg);
            throw new Error('Zugriff verweigert: Nur Super-Admins');
        }

        // Helper function to check and update Super Admin status
        async checkSuperAdminStatus(uid = null) {
            try {
                const userId = uid || (this.currentUser ? this.currentUser.uid : null);
                if (!userId) {
                    throw new Error('Keine Benutzer-ID verfügbar');
                }

                const db = window.FirebaseConfig.getDB();
                const doc = await db.collection('users').doc(userId).get();
                
                if (!doc.exists) {
                    return { isSuperAdmin: false, userData: null };
                }

                const userData = doc.data();
                return { 
                    isSuperAdmin: userData.isSuperAdmin === true, 
                    userData: userData 
                };
            } catch (error) {
                console.error('Fehler beim Prüfen des Super-Admin Status:', error);
                return { isSuperAdmin: false, userData: null, error: error.message };
            }
        }

        // Helper function to set Super Admin status
        async setSuperAdminStatus(uid, isSuperAdmin = true) {
            try {
                const db = window.FirebaseConfig.getDB();
                await db.collection('users').doc(uid).update({
                    isSuperAdmin: isSuperAdmin,
                    updatedAt: window.FirebaseConfig.getServerTimestamp(),
                    updatedBy: this.currentUser ? this.currentUser.uid : 'system'
                });
                
                console.log(`✅ Super-Admin Status für ${uid} auf ${isSuperAdmin} gesetzt`);
                return { success: true };
            } catch (error) {
                console.error('Fehler beim Setzen des Super-Admin Status:', error);
                return { success: false, error: error.message };
            }
        }
    }

    window.AdminAuth = new AdminAuth();
})();

