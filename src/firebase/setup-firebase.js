require('dotenv').config();
const admin = require('firebase-admin');

const testing = process.env.NODE_ENV !== 'production';
console.log("TESTING:", testing, process.env.NODE_ENV)
const key = testing ? process.env.TESTING_FIREBASE_TOKEN : process.env.FIREBASE_TOKEN
var firebasekey = key.replace(/\\n/g, '\n');

var app = admin.initializeApp(
    {
        credential: admin.credential.cert({
            type: "service_account",
            projectId: testing ? process.env.TESTING_FIREBASE_ID : process.env.FIREBASE_ID,
            clientEmail: testing ? process.env.TESTING_FIREBASE_EMAIL : process.env.FIREBASE_EMAIL,
            privateKey: firebasekey
        }),
        databaseURL: testing ? process.env.TESTING_FIREBASE_DB_URL : process.env.FIREBASE_DB_URL
    }
);

const firestore = app.firestore()
firestore.settings({
    timestampsInSnapshots: true
}),
// Export together as single object
module.exports = {
    firestore: firestore,
    realtimedb: app.database(),
    admin,
};
