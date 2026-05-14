// api/generar-cuento.js
// Vercel Edge Function — OWN Cuentos Mágicos
// Llama a Pollinations desde el servidor para evitar bloqueos CORS/timeout en móvil

export const config = { runtime: 'edge' };

export default async function handler(req) {
  // CORS headers para que el front pueda llamar
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), { status: 405, headers });
  }

  try {
    const body = await req.json();
    const { prompt, charName, kidName, temas } = body;

    if (!prompt && !temas) {
      return new Response(JSON.stringify({ error: 'Falta el prompt' }), { status: 400, headers });
    }

    // Construir el prompt para el cuento
    const promptFinal = prompt ||
      `Cuento infantil en español para ${kidName || 'el niño'}, personaje ${charName || 'Dragón'}, tema: ${(temas || 'aventuras y magia').substring(0, 100)}. 3 párrafos cortos, final feliz.`;

    // Llamar a Pollinations desde el servidor (sin restricciones CORS)
    const pollinationsUrl = `https://text.pollinations.ai/${encodeURIComponent(promptFinal)}?seed=${Date.now()}`;

    const response = await fetch(pollinationsUrl, {
      signal: AbortSignal.timeout(12000), // 12 segundos máximo
    });

    if (!response.ok) {
      throw new Error(`Pollinations respondió ${response.status}`);
    }

    const text = await response.text();

    if (!text || text.length < 80 || text.toLowerCase().includes('error')) {
      throw new Error('Respuesta inválida de Pollinations');
    }

    return new Response(JSON.stringify({ texto: text.trim(), ok: true }), { status: 200, headers });

  } catch (e) {
    console.error('generar-cuento error:', e.message);
    // Devolver error para que el front use el fallback local
    return new Response(
      JSON.stringify({ ok: false, error: e.message }),
      { status: 200, headers } // 200 para que el front pueda leer el body
    );
  }
}
