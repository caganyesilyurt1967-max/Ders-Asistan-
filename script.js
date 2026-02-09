// PDF.js worker yolunu düzeltilmiş ve tam haliyle tanımlıyoruz
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

let extractedText = "";

// Dosya seçildiğinde çalışan ana fonksiyon
document.getElementById('fileInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Arayüzü güncelle
    document.getElementById('fileName').innerText = file.name;
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('actionButtons').classList.add('hidden');
    document.getElementById('resultDisplay').classList.add('hidden');

    try {
        if (file.type === "application/pdf") {
            // PDF okuma işlemi
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({data: arrayBuffer});
            const pdf = await loadingTask.promise;
            let text = "";
            
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                text += content.items.map(s => s.str).join(" ") + " ";
            }
            
            // Eğer PDF sadece resimden oluşuyorsa yazı çıkmaz, kontrol edelim
            if (text.trim().length < 10) {
                throw new Error("Bu PDF'den metin çıkarılamadı. Dosya taranmış bir resim olabilir.");
            }
            extractedText = text;
        } else if (file.name.endsWith('.docx')) {
            // Word dosyası okuma
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            extractedText = result.value;
        } else {
            // Normal metin dosyası okuma
            extractedText = await file.text();
        }
        
        // Okuma başarılıysa butonları göster
        document.getElementById('actionButtons').classList.remove('hidden');
        console.log("Dosya başarıyla okundu.");
    } catch (err) {
        alert("Dosya Okuma Hatası: " + err.message);
        console.error(err);
    } finally {
        document.getElementById('loading').classList.add('hidden');
    }
});

// Yapay Zeka (Gemini) API çağırma fonksiyonu
async function handleAI(mod) {
    const resultDiv = document.getElementById('resultDisplay');
    const aiContent = document.getElementById('aiContent');
    const loading = document.getElementById('loading');

    resultDiv.classList.add('hidden');
    loading.classList.remove('hidden');

    let prompt = "";
    if (mod === 'ozet') prompt = "Aşağıdaki ders notunu detaylıca özetle:";
    if (mod === 'dy') prompt = "Aşağıdaki notla ilgili 5 tane Doğru/Yanlış sorusu ve cevaplarını hazırla:";
    if (mod === 'test') prompt = "Aşağıdaki notla ilgili 3 tane çoktan seçmeli test sorusu ve cevaplarını hazırla:";

    try {
        const res = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, content: extractedText.substring(0, 8000) })
        });
        
        const data = await res.json();
        
        if (data.candidates && data.candidates[0].content) {
            aiContent.innerText = data.candidates[0].content.parts[0].text;
        } else if (data.error) {
            aiContent.innerText = "Yapay Zeka Hatası: " + data.error;
        } else {
            aiContent.innerText = "Yapay zekadan boş yanıt geldi.";
        }
        
        resultDiv.classList.remove('hidden');
    } catch (err) {
        aiContent.innerText = "Bağlantı Hatası: " + err.message;
        resultDiv.classList.remove('hidden');
    } finally {
        loading.classList.add('hidden');
    }
}
