// api/gemini.js (Version de débogage)
// Le seul but de ce code est de vérifier si Vercel exécute bien la dernière version du fichier.

export default async function handler(req, res) {
  
  // On ignore la clé API, la question de l'utilisateur, etc.
  // On renvoie simplement un message de test fixe.
  
  // Si ce code est bien exécuté par Vercel,
  // la réponse sera TOUJOURS cet objet JSON.
  return res.status(200).json({ text: "Test de débogage réussi ! Le fichier a bien été mis à jour." });
}
