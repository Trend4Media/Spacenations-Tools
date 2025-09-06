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
            const userData = window.AuthAPI.getUserData();

            if (user && userData && userData.isSuperAdmin === true) {
                return true;
            }

            // Double-check from Firestore in case of stale data
            if (user && (!userData || userData.isSuperAdmin !== true)){
                const db = window.FirebaseConfig.getDB();
                const doc = await db.collection('users').doc(user.uid).get();
                const data = doc.exists ? doc.data() : null;
                if (data && data.isSuperAdmin === true){
                    return true;
                }
            }

            // Not allowed
            throw new Error('Zugriff verweigert: Nur Super-Admins');
        }
    }

    window.AdminAuth = new AdminAuth();
})();

