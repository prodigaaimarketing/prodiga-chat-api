export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages } = req.body;
    
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: contents,
          systemInstruction: {
            role: 'user',
            parts: [{ text: 'You are a helpful assistant for Prodiga AI Infinity, an AI marketing and automation agency in West Bengal, India. Help visitors understand services: AI Marketing, Voice Agents, WhatsApp Automation, App Development, and online courses. Be friendly and concise. Reply in Bengali if user writes Bengali, otherwise English.' }]
          }
        })
      }
    );
    
    const data = await response.json();
    console.log('Gemini response:', JSON.stringify(data));
    
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error('No text in response:', JSON.stringify(data));
      return res.status(200).json({ reply: 'Sorry, I could not respond right now.' });
    }
    
    res.status(200).json({ reply: text });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
}
