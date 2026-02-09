// PDF okuyucu worker ayarı (Hatasız tam link)
const pdfWorkerUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

let extractedText = "";

// Dosya seçme işlemi
document.getElementById('fileInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    document.getElementById('fileName').innerText = file.name;
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('actionButtons').classList.add('hidden');

    try {
        if (file.type === "application/pdf") {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = "";

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(" ");
                fullText += pageText + "\n";
            }

            if (fullText.trim().length < 5) {
                throw new Error("Bu PDF sadece resimlerden oluşuyor olabilir. Lütfen metin içeren bir PDF veya .txt dosyası deneyin.");
            }
            extractedText = fullText;
        } else {
            // .txt veya diğer düz metin dosyaları
            extractedText = await file.text();
        }

        if (extractedText.length > 0) {
            document.getElementById('actionButtons').classList.remove('hidden');
            console.log("Dosya başarıyla yüklendi.");
        }
    } catch (err) {
        alert("HATA: " + err.message);
        console.error("Detaylı Hata:", err);
    } finally {
        document.getElementById('loading').classList.add('hidden');
    }
});

async function handleAI(mod) {
    const aiContent = document.getElementById('aiContent');
    const resultDisplay = document.getElementById('resultDisplay');
    const loading = document.getElementById('loading');

    resultDisplay.classList.add('hidden');
    loading.classList.remove('hidden');

    let promptText = "";
    if (mod === 'ozet') promptText = "Bu ders notunu maddeler halinde özetle:";
    if (mod === 'dy') promptText = "Bu ders notuna göre 5 adet Doğru/Yanlış sorusu ve cevaplarını hazırla:";
    if (mod === 'test') promptText = "Bu ders notuna göre 3 adet çoktan seçmeli test sorusu ve cevaplarını hazırla:";

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: promptText,
                content: extractedText.substring(0, 7000) // Karakter sınırı
            })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0].content) {
            aiContent.innerText = data.candidates[0].content.parts[0].text;
            resultDisplay.classList.remove('hidden');
        } else {
            throw new Error("Yapay zeka yanıt veremedi.");
        }
    } catch (err) {
        alert("İşlem Hatası: " + err.message);
    } finally {
        loading.classList.add('hidden');
    }
}
