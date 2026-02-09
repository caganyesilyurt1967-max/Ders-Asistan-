export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Yöntem İzin Verilmedi' });
    
    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${body.prompt}\n\n${body.content}` }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(200).json({ error: `Google API Hatası: ${data.error.message}` });
        }

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            return res.status(200).json({ text: data.candidates[0].content.parts[0].text });
        }

        return res.status(200).json({ error: "Yapay zeka yanıt oluşturamadı. Lütfen tekrar deneyin." });
    } catch (error) {
        return res.status(200).json({ error: 'Sunucu Hatası: ' + error.message });
    }
}
