// api/gemini.js

// Ce code est la version finale et corrigée pour les serveurs Node.js de Vercel.
// La principale différence est l'utilisation de (req, res) en paramètres,
// ce qui est standard pour les environnements comme Node.js/Express.

export default async function handler(req, res) {
  // 1. S'assurer que la requête est de type POST
  if (req.method !== 'POST') {
    // On utilise l'objet `res` pour envoyer la réponse d'erreur
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 2. Récupérer la question.
    // MODIFICATION IMPORTANTE : Au lieu de `await request.json()`, on utilise `req.body`.
    // Vercel analyse automatiquement le corps de la requête pour nous sur ce type de fonction.
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // 3. Récupérer la clé API secrète depuis les variables d'environnement de Vercel.
    // Cette partie est sécurisée et ne change pas.
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("La variable d'environnement GEMINI_API_KEY n'est pas définie sur Vercel !");
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // 4. Préparer et appeler l'API de Google Gemini. Cette partie ne change pas.
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

    // 5. Extraire le texte de la réponse et le renvoyer au visiteur.
    const text = result.candidates[0]?.content?.parts[0]?.text || "Désolé, je n'ai pas pu générer de réponse.";
    
    // On utilise `res` pour envoyer la réponse de succès.
    return res.status(200).json({ text: text });

  } catch (error) {
    console.error("Erreur du serveur:", error);
    return res.status(500).json({ error: 'An internal server error occurred.' });
  }
}
