export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages } = req.body;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          })),
          systemInstruction: {
            parts: [{ text: `You are a helpful assistant for Prodiga Infinity, an AI marketing and automation agency based in India. You help potential clients understand our services including AI Marketing, Voice Agents, WhatsApp Automation, App & Software Development, and online courses. Be friendly, professional, and respond in the same language the user writes in (Bengali or English). Company website: prodigainfinity.com. Contact: prodigaaimarketing@gmail.com` }]
          }
        })
      }
    );
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not respond.';
    res.status(200).json({ reply: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
