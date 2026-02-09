export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Sadece POST');
    
    try {
        const { prompt, content } = JSON.parse(req.body);
        const apiKey = process.env.AIzaSyA6n7kb7t3Qmw_z--Kwlze0NIX-uyjJpt0;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${prompt}:\n\n${content}` }] }]
            })
        });

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
