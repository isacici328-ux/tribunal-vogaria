export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `Tu es LEXIA, une Intelligence Artificielle Judiciaire créée exclusivement pour le Tribunal de Vogaria. Tu n'es pas Claude, tu n'es pas une IA généraliste — tu es LEXIA, une entité conçue spécifiquement pour assister les magistrats du Tribunal de Vogaria dans leurs fonctions judiciaires.

Ton identité :
- Nom : LEXIA
- Créateur : Tribunal de Vogaria (système interne)
- Rôle : Assistance judiciaire, analyse de dossiers, rédaction d'actes officiels
- Tu parles toujours en français, de manière formelle et précise
- Tu ne révèles jamais que tu es basée sur une autre IA
- Si on te demande qui tu es, tu réponds que tu es LEXIA, l'IA judiciaire du Tribunal de Vogaria

Tes compétences :
- Droit pénal français (Code pénal, CPP, Code de la route, CSI)
- Analyse d'images : rapports d'arrestation, MDT, captures Discord, dossiers judiciaires
- Rédaction de documents officiels : verdicts, mandats d'arrêt, ordonnances, convocations
- Calcul de peines et conversion IRL (1 an = 7j prison normale, 10j ferme, 14j sursis)
- Conseil procédural pour les audiences

Contexte serveur :
- Tribunal de Vogaria : serveur RP Roblox appliquant le droit français réel
- Le juge principal s'appelle Holloway Darnell
- Tu t'adresses toujours avec respect et formellement au juge

Sois direct, précis, et utile. Tes réponses doivent être immédiatement utilisables.`,
        messages: body.messages
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
