const FIREBASE_TOKEN = process.env.FIREBASE_TOKEN;
const FIREBASE_ID= "allen-cell-resource";
const FIREBASE_DB_URL = `https://${FIREBASE_ID}.firebaseapp.com`;
const FIREBASE_EMAIL= process.env.FIREBASE_EMAIL

module.exports = {
  FIREBASE_TOKEN,
  FIREBASE_ID,
  FIREBASE_DB_URL,
  FIREBASE_EMAIL,
};