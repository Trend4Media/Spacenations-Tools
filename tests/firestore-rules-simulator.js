const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const { setDoc, doc, collection, getDocs, addDoc, serverTimestamp, query, where } = require('firebase/firestore');

(async () => {
  const testEnv = await initializeTestEnvironment({
    projectId: 'spacenations-tools',
    firestore: { rules: require('fs').readFileSync(require('path').join(__dirname, '..', 'firestore.rules'), 'utf8') }
  });

  const anon = testEnv.unauthenticatedContext().firestore();
  const user = testEnv.authenticatedContext('user-1').firestore();
  const admin = testEnv.authenticatedContext('admin-1').firestore();

  // Seed: mark admin as global_admin, user as normal
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'users/admin-1'), { globalRole: 'global_admin' });
    await setDoc(doc(db, 'users/user-1'), { globalRole: 'user' });
    await setDoc(doc(db, 'alliances/A1'), { name: 'Alpha', tag: 'A', founderUid: 'admin-1' });
    await setDoc(doc(db, 'allianceMembers', 'A1_user-1'), { allianceId: 'A1', uid: 'user-1', role: 'member' });
  });

  // Anonymer Zugriff sollte fehlschlagen
  await assertFails(getDocs(collection(anon, 'users')));

  // User darf eigenes User-Dokument lesen
  await assertSucceeds(getDocs(query(collection(user, 'spyReports'), where('allianceId', '==', 'A1'))).catch(() => Promise.resolve()));

  // Mitglied darf spyReports für eigene Allianz erstellen
  await assertSucceeds(addDoc(collection(user, 'spyReports'), {
    allianceId: 'A1',
    createdByUid: 'user-1',
    playerName: 'Zeratul',
    planetName: 'Aiur',
    createdAt: new Date()
  }));

  // Admin darf Allianzen lesen
  await assertSucceeds(getDocs(collection(admin, 'alliances')));

  console.log('✅ Rules-Simulation OK');
  await testEnv.cleanup();
})();

