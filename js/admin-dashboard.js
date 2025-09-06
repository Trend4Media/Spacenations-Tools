/**
 * Admin Dashboard Logic
 * - Lists users
 * - Allows role toggles (isAllianceAdmin, isSuperAdmin)
 */

(function(){
    const state = {
        users: [],
        filtered: [],
        unsub: null
    };

    function formatTimestamp(ts){
        try {
            if (!ts) return '-';
            const d = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
            return d.toLocaleString('de-DE');
        } catch { return '-'; }
    }

    function renderStats(){
        const usersCount = state.users.length;
        const admins = state.users.filter(u => u.isAllianceAdmin === true).length;
        const superAdmins = state.users.filter(u => u.isSuperAdmin === true).length;
        const active7d = state.users.filter(u => u.lastLogin && (new Date() - (u.lastLogin.toDate ? u.lastLogin.toDate() : new Date(u.lastLogin))) < 7*24*60*60*1000).length;
        document.getElementById('stat-users').textContent = usersCount;
        document.getElementById('stat-admins').textContent = admins;
        document.getElementById('stat-super').textContent = superAdmins;
        document.getElementById('stat-active').textContent = active7d;
    }

    function rolePills(user){
        const pills = [];
        if (user.isSuperAdmin) pills.push('<span class="pill super">Super</span>');
        if (user.isAllianceAdmin) pills.push('<span class="pill admin">Alliance</span>');
        if (!user.isAllianceAdmin && !user.isSuperAdmin) pills.push('<span class="pill user">User</span>');
        return `<div class="role">${pills.join('')}</div>`;
    }

    function row(user){
        const lastLogin = formatTimestamp(user.lastLogin);
        const alliance = user.alliance || '-';
        const username = user.username || '-';
        const email = user.email || '-';
        return `
            <tr data-uid="${user.id}">
                <td>${username}</td>
                <td>${email}</td>
                <td>${alliance}</td>
                <td>${lastLogin}</td>
                <td>${rolePills(user)}</td>
                <td>
                    <div class="actions">
                        <button class="btn" data-action="toggle-alliance">Toggle Alliance Admin</button>
                        <button class="btn" data-action="toggle-super">Toggle Super</button>
                    </div>
                </td>
            </tr>
        `;
    }

    function renderTable(){
        const body = document.getElementById('users-table-body');
        const list = state.filtered.length ? state.filtered : state.users;
        if (!list.length){
            body.innerHTML = '<tr><td colspan="6" style="text-align:center; color: var(--text-secondary)">Keine Benutzer gefunden</td></tr>';
            return;
        }
        body.innerHTML = list.map(row).join('');
    }

    function attachEvents(){
        document.getElementById('logout-btn').addEventListener('click', async () => {
            try { await window.AuthAPI.logout(); window.location.href = 'index.html'; } catch {}
        });
        document.getElementById('refresh-btn').addEventListener('click', () => subscribeUsers(true));
        document.getElementById('export-users-btn').addEventListener('click', exportUsersCSV);
        document.getElementById('search-btn').addEventListener('click', applySearch);
        document.getElementById('search-input').addEventListener('keyup', (e) => { if (e.key === 'Enter') applySearch(); });

        document.getElementById('users-table-body').addEventListener('click', async (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            const tr = btn.closest('tr');
            const uid = tr?.getAttribute('data-uid');
            if (!uid) return;
            const action = btn.getAttribute('data-action');
            if (action === 'toggle-alliance') return toggleAllianceAdmin(uid);
            if (action === 'toggle-super') return toggleSuperAdmin(uid);
        });
    }

    function applySearch(){
        const q = (document.getElementById('search-input').value || '').toLowerCase();
        if (!q){ state.filtered = []; renderTable(); return; }
        state.filtered = state.users.filter(u =>
            (u.username || '').toLowerCase().includes(q) ||
            (u.email || '').toLowerCase().includes(q) ||
            (u.alliance || '').toLowerCase().includes(q)
        );
        renderTable();
    }

    async function exportUsersCSV(){
        const list = state.users;
        const headers = ['uid','username','email','alliance','isAllianceAdmin','isSuperAdmin','createdAt','lastLogin'];
        const lines = [headers.join(';')];
        for (const u of list){
            const createdAt = u.createdAt ? (u.createdAt.toDate ? u.createdAt.toDate().toISOString() : new Date(u.createdAt).toISOString()) : '';
            const lastLogin = u.lastLogin ? (u.lastLogin.toDate ? u.lastLogin.toDate().toISOString() : new Date(u.lastLogin).toISOString()) : '';
            lines.push([
                u.id,
                JSON.stringify(u.username || ''),
                JSON.stringify(u.email || ''),
                JSON.stringify(u.alliance || ''),
                u.isAllianceAdmin ? 1 : 0,
                u.isSuperAdmin ? 1 : 0,
                createdAt,
                lastLogin
            ].join(';'));
        }
        const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'users.csv'; a.click();
        URL.revokeObjectURL(url);
    }

    async function toggleAllianceAdmin(uid){
        const db = window.FirebaseConfig.getDB();
        const ref = db.collection('users').doc(uid);
        const doc = await ref.get();
        if (!doc.exists) return alert('Benutzer nicht gefunden');
        const val = !!doc.data().isAllianceAdmin;
        await ref.update({ isAllianceAdmin: !val });
    }

    async function toggleSuperAdmin(uid){
        // Prevent self-demotion lockout
        const me = window.AuthAPI.getCurrentUser();
        if (me && me.uid === uid){
            if (!confirm('Sie sind dabei, Ihre eigene Super-Admin Rolle zu toggeln. Fortfahren?')) return;
        }
        const db = window.FirebaseConfig.getDB();
        const ref = db.collection('users').doc(uid);
        const doc = await ref.get();
        if (!doc.exists) return alert('Benutzer nicht gefunden');
        const val = !!doc.data().isSuperAdmin;
        await ref.update({ isSuperAdmin: !val });
    }

    function subscribeUsers(force=false){
        const db = window.FirebaseConfig.getDB();
        if (state.unsub && force){ state.unsub(); state.unsub = null; }
        if (state.unsub) return; // already subscribed
        state.unsub = db.collection('users').orderBy('createdAt','desc').onSnapshot(snap => {
            const list = [];
            snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
            state.users = list;
            renderStats();
            applySearch();
            renderTable();
        }, err => {
            console.error('Users subscribe error', err);
        });
    }

    async function gateAndInit(){
        try {
            await window.AdminAuth.requireSuperAdmin();
            document.getElementById('access-ok').style.display = 'block';
            const ud = window.AuthAPI.getUserData();
            const info = `${ud?.username || ud?.email || 'Admin'} · <span class="pill super">Super</span>`;
            document.getElementById('admin-user-info').innerHTML = info;
            attachEvents();
            subscribeUsers();
        } catch (e){
            console.warn('Access denied', e);
            document.getElementById('access-denied').style.display = 'block';
            setTimeout(() => { window.location.href = 'index.html'; }, 2000);
        }
    }

    document.addEventListener('DOMContentLoaded', gateAndInit);
})();

