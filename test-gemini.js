require('dotenv').config({ path: '.env.local' });
const { GoogleGenAI } = require('@google/genai');

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('API Key present:', !!apiKey);

    if (!apiKey || apiKey === 'PLACEHOLDER') {
        console.error('Invalid API Key');
        return;
    }

    const client = new GoogleGenAI({ apiKey });

    // Test the user's requested model
    const modelName = 'gemini-2.5-flash';
    console.log(`Testing model: ${modelName}`);

    try {
        const result = await client.models.generateContent({
            model: modelName,
            contents: 'Hello, are you there?',
        });

        console.log('Success!');
        console.log('Result:', JSON.stringify(result, null, 2));
        if (result.response) {
            console.log('Response text:', result.response.text());
        } else {
            console.log('No response property found.');
        }
    } catch (error) {
        console.error('Error Details:');
        console.error(error.message);
        if (error.status) console.error('Status:', error.status);
        if (error.statusText) console.error('StatusText:', error.statusText);

        // Also try to list models if possible, or just fail
    }
}

testGemini();
