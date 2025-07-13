// api/gemini.js

// Ce code utilise la syntaxe correcte pour les serveurs Node.js de Vercel.
// Les objets request (req) et response (res) sont similaires à ceux d'Express.js.
export default async function handler(req, res) {
  // 1. S'assurer que la requête est de type POST
  if (req.method !== 'POST') {
    // Utiliser l'objet `res` pour envoyer la réponse
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 2. Récupérer la question. Vercel parse automatiquement le corps JSON.
    // On accède directement à `req.body` au lieu de `await request.json()`
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // 3. Récupérer la clé API secrète depuis les variables d'environnement de Vercel
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("La variable d'environnement GEMINI_API_KEY n'est pas définie sur Vercel !");
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // 4. Préparer et appeler l'API de Google Gemini
    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    };

    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Erreur de l'API Gemini:", errorText);
      return res.status(geminiResponse.status).json({ error: 'Failed to fetch data from Gemini API' });
    }

    const result = await geminiResponse.json();

    // 5. Extraire le texte de la réponse et le renvoyer au visiteur
    const text = result.candidates[0]?.content?.parts[0]?.text || "Désolé, je n'ai pas pu générer de réponse.";
    
    // Utiliser res.status().json() pour envoyer la réponse
    return res.status(200).json({ text: text });

  } catch (error) {
    console.error("Erreur du serveur:", error);
    return res.status(500).json({ error: 'An internal server error occurred.' });
  }
}
