pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

let extractedText = "";

document.getElementById('fileInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    document.getElementById('fileName').innerText = file.name;
    document.getElementById('loading').classList.remove('hidden');

    try {
        if (file.type === "application/pdf") {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            let text = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                text += content.items.map(s => s.str).join(" ");
            }
            extractedText = text;
        } else if (file.name.endsWith('.docx')) {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            extractedText = result.value;
        } else {
            extractedText = await file.text();
        }
        document.getElementById('actionButtons').classList.remove('hidden');
    } catch (err) {
        alert("Dosya okunamadı: " + err.message);
    }
    document.getElementById('loading').classList.add('hidden');
});

async function handleAI(mod) {
    const resultDiv = document.getElementById('resultDisplay');
    const aiContent = document.getElementById('aiContent');
    const loading = document.getElementById('loading');

    resultDiv.classList.add('hidden');
    loading.classList.remove('hidden');

    let prompt = "";
    if (mod === 'ozet') prompt = "Bu ders notunu maddeler halinde çok detaylı özetle:";
    if (mod === 'dy') prompt = "Bu notla ilgili 5 tane Doğru/Yanlış sorusu yaz ve en alta cevapları ekle:";
    if (mod === 'test') prompt = "Bu notla ilgili 3 tane 4 şıklı çoktan seçmeli test sorusu hazırla:";

    try {
        const res = await fetch('/api/generate', {
            method: 'POST',
            body: JSON.stringify({ prompt, content: extractedText.substring(0, 8000) })
        });
        const data = await res.json();
        
        if (data.candidates) {
            aiContent.innerText = data.candidates[0].content.parts[0].text;
        } else {
            aiContent.innerText = "Yapay zeka şu an meşgul, lütfen tekrar dene.";
        }
        resultDiv.classList.remove('hidden');
    } catch (err) {
        aiContent.innerText = "Hata: Sunucuya bağlanılamadı. API Key veya Vercel ayarlarını kontrol et.";
        resultDiv.classList.remove('hidden');
    }
    loading.classList.add('hidden');
}
