export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { messages } = req.body;
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://prodigainfinity.com',
        'X-Title': 'Prodiga Chatbot'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: [
          { role: 'system', content: 'You are a helpful assistant for Prodiga AI Infinity, an AI marketing agency in West Bengal, India.' },
          ...messages
        ]
      })
    });
    const data = await response.json();
    console.log('OpenRouter response:', JSON.stringify(data));
    const text = data?.choices?.[0]?.message?.content;
    if (!text) return res.status(200).json({ reply: `Debug: ${JSON.stringify(data)}` });
    res.status(200).json({ reply: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
