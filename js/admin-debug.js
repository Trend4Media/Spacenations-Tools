/**
 * Admin Debug Module
 * Embedded version of debug-login diagnostics for Super-Admins inside Admin-Dashboard
 */

(function(){
    function createPanelHTML(){
        return `
        <div class="header" style="margin-top: 24px;">
            <h2 class="title" style="font-size:1.2rem">🧪 System Debug</h2>
        </div>
        <div class="panel" style="margin-top: 10px;">
            <div style="display:grid; gap: 16px;">
                <div>
                    <h3 style="margin:0 0 8px 0; color: var(--text-primary)">System Status</h3>
                    <div style="display:grid; gap:8px; background: var(--card-bg, rgba(0,0,0,0.4)); border: 1px solid var(--card-border, rgba(255,255,255,0.1)); padding: 12px; border-radius: 8px;">
                        <div style="display:flex; justify-content:space-between;">
                            <span>Firebase SDK geladen:</span>
                            <span id="dbg-firebase" style="color:#ef4444">❌ Nicht geladen</span>
                        </div>
                        <div style="display:flex; justify-content:space-between;">
                            <span>Firebase Config initialisiert:</span>
                            <span id="dbg-fbconfig" style="color:#ef4444">❌ Nicht initialisiert</span>
                        </div>
                        <div style="display:flex; justify-content:space-between;">
                            <span>AuthManager verfügbar:</span>
                            <span id="dbg-authmgr" style="color:#ef4444">❌ Nicht verfügbar</span>
                        </div>
                        <div style="display:flex; justify-content:space-between;">
                            <span>AuthAPI verfügbar:</span>
                            <span id="dbg-authapi" style="color:#ef4444">❌ Nicht verfügbar</span>
                        </div>
                        <div style="display:flex; justify-content:space-between;">
                            <span>SyncAPI verfügbar:</span>
                            <span id="dbg-syncapi" style="color:#f59e0b">⚠️ Nicht geprüft</span>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 style="margin:0 0 8px 0; color: var(--text-primary)">Login Test</h3>
                    <div style="display:grid; grid-template-columns:1fr 1fr auto; gap:8px; align-items:center;">
                        <input type="email" id="dbg-email" placeholder="test@example.com" class="input" style="min-width:220px"/>
                        <input type="password" id="dbg-password" placeholder="Passwort" class="input" style="min-width:180px"/>
                        <button class="btn" id="dbg-login-btn">🔐 Test Login</button>
                    </div>
                    <div class="hint" style="margin-top:6px">Verwendet die produktive AuthAPI. Keine Speicherung der Testdaten.</div>
                </div>
                <div>
                    <button class="btn primary" id="dbg-run">🔍 System Check</button>
                    <button class="btn" id="dbg-clear" style="margin-left:8px">🧹 Log leeren</button>
                </div>
                <div id="dbg-log" style="background:#000; border:1px solid #333; border-radius:8px; padding:12px; height:220px; overflow:auto; font-family: monospace; font-size:12px;"></div>
            </div>
        </div>`;
    }

    function log(message, type='info'){
        const out = document.getElementById('dbg-log');
        if (!out) return;
        const colors = { info:'#60a5fa', success:'#22c55e', error:'#ef4444', warn:'#f59e0b' };
        const div = document.createElement('div');
        div.style.color = colors[type] || '#e5e7eb';
        div.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        out.appendChild(div);
        out.scrollTop = out.scrollHeight;
    }

    function setStatus(id, ok, warn){
        const el = document.getElementById(id);
        if (!el) return;
        if (ok) { el.style.color = '#22c55e'; el.textContent = '✅ OK'; return; }
        if (warn) { el.style.color = '#f59e0b'; el.textContent = '⚠️ Warnung'; return; }
        el.style.color = '#ef4444'; el.textContent = '❌ Fehler';
    }

    async function runSystemCheck(){
        log('🔍 Starte System Check...','info');
        // Firebase SDK
        if (typeof firebase !== 'undefined'){
            setStatus('dbg-firebase', true);
            log('✅ Firebase SDK geladen','success');
        } else {
            setStatus('dbg-firebase', false);
            log('❌ Firebase SDK nicht gefunden','error');
            return; // Stop further checks
        }

        // Firebase Config
        try {
            if (window.FirebaseConfig){
                await window.FirebaseConfig.waitForReady();
                setStatus('dbg-fbconfig', true);
                log('✅ Firebase Config initialisiert','success');
            } else {
                setStatus('dbg-fbconfig', false);
                log('❌ Firebase Config nicht verfügbar','error');
            }
        } catch (e){
            setStatus('dbg-fbconfig', false);
            log(`❌ Firebase Config Fehler: ${e.message}`,'error');
        }

        // AuthManager
        if (window.authManager){
            setStatus('dbg-authmgr', true);
            log('✅ AuthManager gefunden','success');
        } else {
            setStatus('dbg-authmgr', false);
            log('❌ AuthManager nicht gefunden','error');
        }

        // AuthAPI
        if (window.AuthAPI){
            setStatus('dbg-authapi', true);
            log('✅ AuthAPI verfügbar','success');
            ['login','logout','isLoggedIn','getCurrentUser','onAuthStateChange'].forEach(fn => {
                if (typeof window.AuthAPI[fn] === 'function') log(`✅ AuthAPI.${fn}() verfügbar`,'success');
                else log(`❌ AuthAPI.${fn}() fehlt`,'error');
            });
        } else {
            setStatus('dbg-authapi', false);
            log('❌ AuthAPI nicht verfügbar','error');
        }

        // SyncAPI (optional)
        if (window.SyncAPI){
            setStatus('dbg-syncapi', true);
            log('✅ SyncAPI verfügbar','success');
        } else {
            setStatus('dbg-syncapi', false, true);
            log('⚠️ SyncAPI nicht verfügbar (optional)','warn');
        }

        log('🔍 System Check abgeschlossen','info');
    }

    async function testLogin(){
        const email = (document.getElementById('dbg-email')?.value || '').trim();
        const password = document.getElementById('dbg-password')?.value || '';
        if (!email || !password){ log('❌ Bitte E-Mail und Passwort angeben','error'); return; }
        try {
            if (!window.AuthAPI) throw new Error('AuthAPI nicht verfügbar');
            log(`🔐 Teste Login für ${email}`,'info');
            await window.AuthAPI.waitForInit();
            const res = await window.AuthAPI.login(email, password);
            if (res.success){
                log('✅ Login erfolgreich','success');
                log(`👤 User: ${res.user?.email || '-'} (UID: ${res.user?.uid || '-'})`,'success');
            } else {
                log(`❌ Login fehlgeschlagen: ${res.error || 'Unbekannt'}`,'error');
            }
        } catch (e){
            log(`❌ Fehler beim Login-Test: ${e.message}`,'error');
        }
    }

    function wireEvents(){
        const runBtn = document.getElementById('dbg-run');
        const loginBtn = document.getElementById('dbg-login-btn');
        const clearBtn = document.getElementById('dbg-clear');
        if (runBtn) runBtn.addEventListener('click', runSystemCheck);
        if (loginBtn) loginBtn.addEventListener('click', testLogin);
        if (clearBtn) clearBtn.addEventListener('click', () => {
            const out = document.getElementById('dbg-log'); if (out) out.innerHTML='';
        });
    }

    function renderInto(container){
        if (!container) return;
        container.innerHTML = createPanelHTML();
        wireEvents();
        setTimeout(runSystemCheck, 300);
    }

    function autoAttach(){
        const container = document.getElementById('admin-debug-section');
        if (container) renderInto(container);
    }

    window.AdminDebug = { renderInto, runSystemCheck, testLogin };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoAttach);
    else autoAttach();
})();

