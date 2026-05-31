// À placer dans : api/generate.js (à la racine du projet)
// Fonction serverless Vercel — appelle l'API Google Gemini (GRATUITE)
// Clé API gratuite sur : https://aistudio.google.com/apikey

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Clé à définir dans Vercel : Settings > Environment Variables > GEMINI_API_KEY

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Paramètre 'messages' manquant" });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      // Gratuit jusqu'à 1500 requêtes/jour
      // Pour plus de qualité (payant) : "gemini-1.5-pro"
      generationConfig: {
        maxOutputTokens: 5000,
        temperature: 0.7,
      },
    });

    const userPrompt = messages.filter(m => m.role === "user").pop()?.content || "";
    const result = await model.generateContent(userPrompt);
    const text = result.response.text();

    return res.status(200).json({ text });

  } catch (err) {
    console.error("Erreur API Gemini :", err);
    return res.status(500).json({ error: err.message || "Erreur serveur" });
  }
}
