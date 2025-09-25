// Beispiel: Cloud Function (Node.js) für Admin KPIs mit Firebase Admin SDK
// Diese Datei ist ein Beispiel – für die echte Bereitstellung brauchst du ein Functions-Projekt (firebase init functions)

const functions = require('firebase-functions');
const admin = require('firebase-admin');

try { admin.initializeApp(); } catch (e) {}
const db = admin.firestore();

exports.adminOverview = functions.https.onRequest(async (req, res) => {
  try {
    const idToken = (req.headers.authorization || '').replace(/^Bearer\s+/,'');
    if (!idToken) return res.status(401).json({ error: 'unauthorized' });
    const decoded = await admin.auth().verifyIdToken(idToken);
    const me = await db.doc(`users/${decoded.uid}`).get();
    if (!me.exists || me.get('globalRole') !== 'global_admin') {
      return res.status(403).json({ error: 'forbidden' });
    }

    const [usersAgg, alliancesAgg, spiesAgg] = await Promise.all([
      db.collection('users').count().get(),
      db.collection('alliances').count().get(),
      db.collection('spyReports').count().get()
    ]);

    return res.json({
      users: usersAgg.data().count,
      alliances: alliancesAgg.data().count,
      spyReports: spiesAgg.data().count
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal' });
  }
});

