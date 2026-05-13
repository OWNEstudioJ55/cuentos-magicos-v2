export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { tema, personaje, kidName, edad } = await req.json();

    const prompt = `Escribí un cuento corto en español para niños de ${edad||5} años. El personaje principal es ${personaje||'un dragón'}. Tema: ${tema||'aventuras'}. El protagonista se llama ${kidName||'el niño'}. Incluí el nombre en la historia. 3 párrafos cortos, lenguaje simple, final feliz. Solo el cuento.`;

    const url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?seed=${Date.now()}&model=openai`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'OWN-Cuentos/1.0' }
    });

    if (!response.ok) {
      throw new Error(`Pollinations error: ${response.status}`);
    }

    const text = await response.text();

    return new Response(JSON.stringify({ cuento: text, ok: true }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}
