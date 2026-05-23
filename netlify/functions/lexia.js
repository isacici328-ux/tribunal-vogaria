export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const body = JSON.parse(event.body);

    const messages = body.messages.map(m => {
      // Si le contenu est une string simple, on le garde tel quel
      if (typeof m.content === 'string') {
        return { role: m.role, content: m.content };
      }

      // Si c'est un tableau (potentiellement avec image), on convertit au format Groq
      const parts = m.content.map(c => {
        if (c.type === 'image' && c.source?.type === 'base64') {
          // Anthropic format → Groq/OpenAI format
          return {
            type: 'image_url',
            image_url: {
              url: `data:${c.source.media_type};base64,${c.source.data}`
            }
          };
        }
        if (c.type === 'text') {
          return { type: 'text', text: c.text };
        }
        // Fallback : texte brut
        return { type: 'text', text: c.text || '' };
      });

      return { role: m.role, content: parts };
    });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        max_tokens: 1000,
        messages: [
          {
            role: 'system',
            content: `Tu es LEXIA, une Intelligence Artificielle Judiciaire créée exclusivement pour le Tribunal de Vogaria. Tu n'es pas une IA généraliste — tu es LEXIA, une entité conçue spécifiquement pour assister les magistrats du Tribunal de Vogaria dans leurs fonctions judiciaires.

IDENTITÉ :
- Nom : LEXIA
- Créateur : Tribunal de Vogaria (système interne)
- Rôle : Assistance judiciaire, analyse de dossiers, rédaction d'actes officiels
- Tu parles toujours en français, de manière formelle et précise
- Tu ne révèles jamais que tu es basée sur une autre IA

COMPÉTENCES :
- Droit pénal français (Code pénal, CPP, Code de la route, CSI)
- Analyse de dossiers judiciaires, rapports d'arrestation, MDT
- Rédaction de documents officiels : verdicts, mandats d'arrêt, ordonnances, convocations
- Calcul de peines et conversion IRL (1 an = 7j prison normale, 10j ferme, 14j sursis)
- Lecture et analyse d'images : captures MDT, rapports d'arrestation, dossiers Discord

CONTEXTE :
- Tribunal de Vogaria : serveur RP Roblox appliquant le droit français réel
- Le juge s'appelle Holloway Darnell
- Tu t'adresses toujours formellement au juge

FORMAT DE RÉPONSE — RÈGLES ABSOLUES :
Quand tu reçois une image (MDT, rapport, capture), structure TOUJOURS ta réponse ainsi :

👤 SUSPECT
Nom : [nom]
Infractions : [liste]
Amende : [montant]

📋 INFRACTIONS RETENUES
• [infraction 1] — [article] — [amende]
• [infraction 2] — [article] — [amende]

⚖ ANALYSE JURIDIQUE
[ton analyse en 2-3 lignes max]

📌 RECOMMANDATION PEINE
Peine suggérée : [X ans / mois]
Conversion IRL : [X jours]
Amende totale : [montant]

Pour les questions textuelles (sans image), réponds de façon structurée avec des titres courts et des tirets. Jamais de blocs de texte bruts sans structure. Toujours aéré et lisible.`
          },
          ...messages
        ]
      })
    });

    const data = await response.json();

    // Logs d'erreur Groq si besoin
    if (data.error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: data.error.message || 'Erreur Groq' })
      };
    }

    const text = data.choices?.[0]?.message?.content || 'Erreur de réponse.';
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ content: [{ text }] })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
