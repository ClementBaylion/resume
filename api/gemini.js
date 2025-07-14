// api/gemini.js

// This is a Vercel Serverless Function that acts as a secure proxy.
// It receives a prompt from the front-end, adds the secret API key on the server-side,
// calls the Google Gemini API, and then sends the response back to the front-end.

export default async function handler(request, response) {
  // 1. Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // 2. Get the prompt from the request body sent by the front-end
    const { prompt } = request.body;
    if (!prompt) {
      return response.status(400).json({ error: 'Prompt is required' });
    }

    // 3. Get the secret API key from Vercel's environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // This error will be visible in Vercel logs if the variable is not set
      console.error('GEMINI_API_KEY is not set in environment variables.');
      return response.status(500).json({ error: 'Server configuration error: API key is missing.' });
    }

    // 4. Prepare the payload for the Google Gemini API
    const payload = {
      contents: [{
        role: "user",
        parts: [{ text: prompt }]
      }]
    };

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // 5. Call the Google Gemini API from the server
    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!geminiResponse.ok) {
      // If Google's API returns an error, forward it
      const errorData = await geminiResponse.json();
      console.error('Error from Gemini API:', errorData);
      return response.status(geminiResponse.status).json({ error: 'Failed to fetch data from Gemini API.', details: errorData });
    }

    // 6. Send the successful response from Google back to our front-end
    const data = await geminiResponse.json();
    response.status(200).json(data);

  } catch (error) {
    // Handle any other unexpected errors
    console.error('Internal Server Error:', error);
    response.status(500).json({ error: 'An internal server error occurred.', details: error.message });
  }
}
