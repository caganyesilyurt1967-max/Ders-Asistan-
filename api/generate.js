export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Sadece POST' });
    
    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { prompt, content } = body;
        const apiKey = process.env.GEMINI_API_KEY;

        // ANAHTAR KONTROLÜ
        if (!apiKey) {
            return res.status(500).json({ error: 'Vercel anahtarı okuyamıyor. Lütfen Environment Variables kısmını kontrol et.' });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${prompt}:\n\n${content}` }] }]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            return res.status(500).json({ error: 'Google API Hatası: ' + data.error.message });
        }

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: 'Sunucu Hatası: ' + error.message });
    }
}
