const result = require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
console.log('dotenv config result:', result);
const admin = require('firebase-admin');



const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_ID,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
};

if (!admin.apps.length) {
  console.log('Loaded Firebase ENV:', {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY ? '[HIDDEN]' : undefined,
  
});
console.log('Raw .env FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('__dirname:', __dirname);
console.log('Resolved path:', require('path').resolve(__dirname, '../.env'));


  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DB_URL
    
  });
}

const db = admin.database();
module.exports = db;