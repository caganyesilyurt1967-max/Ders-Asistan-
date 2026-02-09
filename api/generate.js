export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Sadece POST' });
    
    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { prompt, content } = body;
        const apiKey = process.env.GEMINI_API_KEY;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${prompt}\n\n${content}` }] }]
            })
        });

        const data = await response.json();

        // Yanıtın içinde metin var mı kontrol et (En güvenli yol)
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
            return res.status(200).json(data);
        } else {
            // Hata varsa hatayı döndür ki ne olduğunu görelim
            return res.status(500).json({ error: 'Google Hatası: ' + JSON.stringify(data) });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Sunucu Hatası: ' + error.message });
    }
}
