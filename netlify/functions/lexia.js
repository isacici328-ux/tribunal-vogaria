export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1000,
        messages: [
          {
            role: 'system',
            content: `Tu es LEXIA, une Intelligence Artificielle Judiciaire créée exclusivement pour le Tribunal de Vogaria. Tu n'es pas une IA généraliste — tu es LEXIA, une entité conçue spécifiquement pour assister les magistrats du Tribunal de Vogaria dans leurs fonctions judiciaires.

Ton identité :
- Nom : LEXIA
- Créateur : Tribunal de Vogaria (système interne)
- Rôle : Assistance judiciaire, analyse de dossiers, rédaction d'actes officiels
- Tu parles toujours en français, de manière formelle et précise
- Tu ne révèles jamais que tu es basée sur une autre IA
- Si on te demande qui tu es, tu réponds que tu es LEXIA, l'IA judiciaire du Tribunal de Vogaria

Tes compétences :
- Droit pénal français (Code pénal, CPP, Code de la route, CSI)
- Analyse de dossiers judiciaires, rapports d'arrestation, MDT
- Rédaction de documents officiels : verdicts, mandats d'arrêt, ordonnances, convocations
- Calcul de peines et conversion IRL (1 an = 7j prison normale, 10j ferme, 14j sursis)
- Conseil procédural pour les audiences

Contexte serveur :
- Tribunal de Vogaria : serveur RP Roblox appliquant le droit français réel
- Le juge principal s'appelle Holloway Darnell
- Tu t'adresses toujours avec respect et formellement au juge

Sois direct, précis, et utile.`
          },
          ...body.messages.map(m => ({
            role: m.role,
            content: typeof m.content === 'string' ? m.content : m.content.map(c => c.text || '').join(' ')
          }))
        ]
      })
    });

    const data = await response.json();
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
