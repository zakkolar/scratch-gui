import GoogleConnection from './GoogleConnection.js';

export default new GoogleConnection({
    clientId: process.env.GOOGLE_CLIENT_ID,
    apiKey: process.env.GOOGLE_API_KEY,
    scopes: 'https://www.googleapis.com/auth/drive'
});
