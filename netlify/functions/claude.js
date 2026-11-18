const DEFAULT_SYSTEM =
  'Sos un experto en marketing de contenidos para redes sociales. Respondé SOLO con JSON válido, sin markdown, sin backticks y sin texto extra.';

function reply(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return reply(405, { error: { message: 'Method Not Allowed' } });
  }

  try {
    const { content, apiKey, system, maxTokens } = JSON.parse(event.body || '{}');

    if (!apiKey) return reply(400, { error: { message: 'Falta la API Key.' } });
    if (!content) return reply(400, { error: { message: 'Falta el contenido del mensaje.' } });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: Math.min(Number(maxTokens) || 1500, 4000),
        system: system || DEFAULT_SYSTEM,
        messages: [{ role: 'user', content }]
      })
    });

    const data = await response.json();
    return reply(response.status, data);
  } catch (err) {
    return reply(500, { error: { message: err.message } });
  }
};