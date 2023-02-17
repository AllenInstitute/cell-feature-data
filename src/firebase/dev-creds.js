const getStagingConfig = () => {
  const token = process.env.STAGING_FIREBASE_TOKEN;
  const projectId = "allen-cell-resource-staging";
  const url = `https://${projectId}.firebaseapp.com`;
  const email = process.env.STAGING_FIREBASE_EMAIL;

  return {
    token,
    projectId,
    url,
    email,
  }
}

const STAGING_CONFIG = getStagingConfig();

const staging = process.env.NODE_ENV === "staging";
let FIREBASE_TOKEN;
let FIREBASE_ID;
let FIREBASE_DB_URL;
let FIREBASE_EMAIL;

if (staging) {
  if (!STAGING_CONFIG.token || !STAGING_CONFIG.email) {
    console.error("You need a secret token to use the staging database");
    process.exit(1);
  }
  FIREBASE_TOKEN = STAGING_CONFIG.token;
  FIREBASE_ID = STAGING_CONFIG.projectId;
  FIREBASE_DB_URL = STAGING_CONFIG.url;
  FIREBASE_EMAIL = STAGING_CONFIG.email;
} else {
  if (
    !process.env.DEV_FIREBASE_TOKEN ||
    !process.env.DEV_FIREBASE_ID ||
    !process.env.DEV_FIREBASE_EMAIL
  ) {
    console.error(
      "You need to put env variables in a .env file pointing to your own firebase db. See README for instructions"
    );
    process.exit(1);
  }

  FIREBASE_TOKEN = process.env.DEV_FIREBASE_TOKEN;
  FIREBASE_ID = process.env.DEV_FIREBASE_ID;
  FIREBASE_DB_URL = `https://${FIREBASE_ID}.firebaseapp.com`;
  FIREBASE_EMAIL = process.env.DEV_FIREBASE_EMAIL;
}

module.exports = {
  FIREBASE_TOKEN,
  FIREBASE_ID,
  FIREBASE_DB_URL,
  FIREBASE_EMAIL,
};
