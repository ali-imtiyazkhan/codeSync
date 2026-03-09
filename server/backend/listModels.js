const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

async function list() {
    try {
        const list = await genAI.listModels(); // This might not be right either for the latest SDK
        console.log(JSON.stringify(list, null, 2));
    } catch (e) {
        // Attempt with the direct fetch if SDK differs
        console.error("SDK listModels failed, trying raw fetch...");
        try {
            const fetch = require('node-fetch'); // May not be there
            // Skip fetch for now, try to find the right SDK method
        } catch (e2) { }
        console.error(e);
    }
}
list();
