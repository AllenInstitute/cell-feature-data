const STAGING_CONFIG = {
  url: "https://allen-cell-resource-staging.firebaseapp.com",
  projectId: "allen-cell-resource-staging",
  email: process.env.STAGING_FIREBASE_EMAIL,
  token: process.env.STAGING_FIREBASE_TOKEN
};

const staging = process.env.NODE_ENV === "staging";
let FIREBASE_TOKEN;
let FIREBASE_DB_URL;
let FIREBASE_ID;
let FIREBASE_EMAIL;

if (staging) {
  if (!STAGING_CONFIG.token || !STAGING_CONFIG.email) {
    console.error("You need a secret token to use the staging database");
    process.exit(1);
  }
  FIREBASE_TOKEN = STAGING_CONFIG.token;
  FIREBASE_DB_URL = STAGING_CONFIG.url;
  FIREBASE_ID = STAGING_CONFIG.projectId;
  FIREBASE_EMAIL = STAGING_CONFIG.email;
} else {
  if (
    !process.env.DEV_FIREBASE_TOKEN ||
    !process.env.DEV_FIREBASE_DB_URL ||
    !process.env.DEV_FIREBASE_ID ||
    !process.env.DEV_FIREBASE_EMAIL
  ) {
    console.error(
      "You need to put env variables in a .env file pointing to your own firebase db. See README for instructions"
    );
    process.exit(1);
  }

  FIREBASE_TOKEN = process.env.DEV_FIREBASE_TOKEN;
  FIREBASE_DB_URL = process.env.DEV_FIREBASE_DB_URL;
  FIREBASE_ID = process.env.DEV_FIREBASE_ID;
  FIREBASE_EMAIL = process.env.DEV_FIREBASE_EMAIL;
}

module.exports = {
  FIREBASE_DB_URL,
  FIREBASE_ID,
  FIREBASE_EMAIL,
  FIREBASE_TOKEN,
};
