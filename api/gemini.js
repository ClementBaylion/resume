// Ce code s'exécute sur le serveur de Netlify, pas dans le navigateur.

export default async function handler(request) {
  // 1. S'assurer que la requête vient bien du formulaire du site (méthode POST)
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    // 2. Récupérer la question envoyée par le visiteur
    const { prompt } = await request.json();
    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400 });
    }

    // 3. Récupérer la clé API secrète depuis les variables d'environnement de Netlify
    // C'est l'étape de sécurité clé ! La clé n'est JAMAIS dans le code.
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("La variable d'environnement GEMINI_API_KEY n'est pas définie sur Netlify !");
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // 4. Préparer et appeler l'API de Google Gemini avec la clé secrète
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
      return new Response(JSON.stringify({ error: 'Failed to fetch data from Gemini API' }), { status: geminiResponse.status });
    }

    const result = await geminiResponse.json();

    // 5. Extraire le texte de la réponse et le renvoyer au visiteur
    const text = result.candidates[0]?.content?.parts[0]?.text || "Désolé, je n'ai pas pu générer de réponse.";
    
    return new Response(JSON.stringify({ text: text }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Erreur du serveur:", error);
    return new Response(JSON.stringify({ error: 'An internal server error occurred.' }), { status: 500 });
  }
}
