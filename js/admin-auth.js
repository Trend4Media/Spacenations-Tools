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
            await window.AuthAPI.waitForInit();
            const user = window.AuthAPI.getCurrentUser();
            
            if (!user) {
                throw new Error('Nicht angemeldet');
            }

            console.log('🔍 Prüfe Super-Admin Status für:', user.email);
            
            // Always check directly from Firestore for most up-to-date data
            const db = window.FirebaseConfig.getDB();
            const doc = await db.collection('users').doc(user.uid).get();
            
            if (!doc.exists) {
                console.warn('⚠️ Benutzerdokument nicht gefunden in Firestore');
                throw new Error('Benutzerdokument nicht gefunden');
            }
            
            const userData = doc.data();
            console.log('📊 Benutzerdaten aus Firestore:', userData);
            
            if (userData && userData.isSuperAdmin === true) {
                console.log('✅ Super-Admin Status bestätigt');
                return true;
            }

            console.log('❌ Keine Super-Admin Berechtigung gefunden');
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

