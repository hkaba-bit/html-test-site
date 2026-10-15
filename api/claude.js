// Server-side proxy to the Anthropic Messages API for ふたりのマタニティ旅.
const MODELS = { quick: 'claude-haiku-5-5', default: 'claude-sonnet-5-5', complex: 'claude-opus-5-5' };
const hits = new Map(); // best-effort per-instance rate limit
const LIMIT = 30, WINDOW = 10 * 60 * 1000, MAX_BYTES = 200 * 1024;

export const config = { maxDuration: 120 };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ code: 'invalid_request', error: 'POST only' });
  const host = req.headers.host || '';
  const origin = req.headers.origin || '';
  if (origin && !origin.endsWith('//' + host)) return res.status(403).json({ code: 'not_granted', error: 'origin' });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(503).json({ code: 'sampling_disabled', error: 'ANTHROPIC_API_KEY is not set' });

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const now = Date.now();
  const list = (hits.get(ip) || []).filter(t => now - t < WINDOW);
  if (list.length >= LIMIT) return res.status(429).json({ code: 'rate_limited', error: 'too many requests' });
  list.push(now); hits.set(ip, list);

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const raw = Array.isArray(body.messages) ? body.messages : [];
  if (!raw.length || JSON.stringify(raw).length > MAX_BYTES) return res.status(400).json({ code: 'prompt_too_large', error: 'bad input' });

  // merge consecutive turns with the same role; must start and end with user
  const messages = [];
  for (const m of raw) {
    const role = m && m.role === 'assistant' ? 'assistant' : 'user';
    const content = String((m && m.content) || '').trim();
    if (!content) continue;
    if (messages.length && messages[messages.length - 1].role === role) messages[messages.length - 1].content += '\n\n' + content;
    else messages.push({ role, content });
  }
  if (!messages.length || messages[0].role !== 'user' || messages[messages.length - 1].role !== 'user')
    return res.status(400).json({ code: 'invalid_request', error: 'turns must start and end with user' });

  const system = 'あなたは妊婦とそのパートナーのためのマタニティ旅行プランナーです。医療的な断定はせず、体調と主治医の指示を優先するよう伝えます。'
    + (body.json ? ' 返答は機械で読み取るので、説明文やコードブロックを付けず、有効なJSONだけを出力してください。' : '');

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODELS[body.tier] || MODELS.default, max_tokens: body.json ? 12000 : 2000, system, messages })
    });
    const d = await r.json();
    if (!r.ok) {
      const code = r.status === 429 ? 'rate_limited' : r.status === 400 ? 'invalid_request' : 'upstream_error';
      return res.status(r.status === 429 ? 429 : 502).json({ code, error: (d && d.error && d.error.message) || 'upstream error' });
    }
    const text = (d.content || []).filter(c => c.type === 'text').map(c => c.text).join('');
    if (!text.trim()) return res.status(502).json({ code: 'empty_completion', error: 'empty' });
    return res.status(200).json({ text, truncated: d.stop_reason === 'max_tokens' });
  } catch (e) {
    return res.status(502).json({ code: 'upstream_error', error: String(e && e.message || e) });
  }
}
