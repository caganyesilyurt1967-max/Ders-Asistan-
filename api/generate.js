export default async function handler(req, res) {
    // Sadece POST isteklerini kabul et
    if (req.method !== 'POST') return res.status(405).json({ error: 'Yöntem İzin Verilmedi' });
    
    try {
        const { prompt, content } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        // EĞER ANAHTAR YOKSA HATAYI BURADA YAKALA
        if (!apiKey) {
            return res.status(500).json({ error: 'Vercel Ayarlarında GEMINI_API_KEY bulunamadı!' });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${prompt}\n\n${content}` }] }]
            })
        });

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: 'Sunucu Hatası: ' + error.message });
    }
}
