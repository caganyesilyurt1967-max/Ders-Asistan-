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
                contents: [{ parts: [{ text: `${prompt}\n\nMETİN:\n${content}` }] }],
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ]
            })
        });

        const data = await response.json();

        // Yanıtın içindeki metni bulmak için en derin tarama:
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            return res.status(200).json(data);
        } else {
            // Eğer yanıt boşsa hatanın nedenini döndür
            const errorMsg = data.promptFeedback?.blockReason || "Yanıt içeriği boş (Filtreye takılmış olabilir)";
            return res.status(500).json({ error: errorMsg, raw: data });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Sunucu Hatası: ' + error.message });
    }
}
