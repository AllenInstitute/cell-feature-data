require("dotenv").config();
const admin = require("firebase-admin");

const notProduction = process.env.NODE_ENV !== "production";

let ref;
if (notProduction) {
  console.log("Not using production db:", process.env.NODE_ENV);
  ref = require("./dev-creds");
} else {
  console.log("Using production db!");

  ref = require("./production-creds");
}
const { FIREBASE_ID, FIREBASE_EMAIL, FIREBASE_DB_URL, FIREBASE_TOKEN } = ref;
const firebasekey = FIREBASE_TOKEN.replace(/\\n/g, "\n");

var app = admin.initializeApp({
  credential: admin.credential.cert({
    type: "service_account",
    projectId: FIREBASE_ID,
    clientEmail: FIREBASE_EMAIL,
    privateKey: firebasekey,
  }),
  databaseURL: FIREBASE_DB_URL,
});

const firestore = app.firestore();

firestore.settings({
  timestampsInSnapshots: true,
}),
  // Export together as single object
  (module.exports = {
    firestore: firestore,
    realtimedb: app.database(),
    admin,
  });
