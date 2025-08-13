const admin = require("firebase-admin");
const serviceAccount = require("../firebase-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://estoquetabcell-default-rtdb.firebaseio.com/"  // COLOQUE AQUI A URL do seu Realtime Database
});

const db = admin.database(); // Aqui muda para database()

module.exports = db;
