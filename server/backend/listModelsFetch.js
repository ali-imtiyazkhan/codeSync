const dotenv = require('dotenv');
const path = require('path');
const https = require('https');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const API_KEY = process.env.GOOGLE_AI_API_KEY || '';

const url = `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log(data);
    });
}).on('error', (err) => {
    console.error(err);
});
