async function handleAI(mod) {
    const aiContent = document.getElementById('aiContent');
    const resultDisplay = document.getElementById('resultDisplay');
    const loading = document.getElementById('loading');

    resultDisplay.classList.add('hidden');
    loading.classList.remove('hidden');

    let promptText = "";
    if (mod === 'ozet') promptText = "Bu ders notunu maddeler halinde özetle:";
    if (mod === 'dy') promptText = "Bu ders notuna göre 5 adet Doğru/Yanlış sorusu hazırla:";
    if (mod === 'test') promptText = "Bu ders notuna göre 3 adet test sorusu hazırla:";

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: promptText,
                content: extractedText.substring(0, 7000)
            })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            aiContent.innerText = data.candidates[0].content.parts[0].text;
            resultDisplay.classList.remove('hidden');
        } else {
            // Hatanın ne olduğunu ekrana yazdırıyoruz
            const detail = data.error || "Google yanıtı engelledi veya boş gönderdi.";
            aiContent.innerText = "İşlem Başarısız: " + detail;
            resultDisplay.classList.remove('hidden');
        }
    } catch (err) {
        aiContent.innerText = "Bağlantı Hatası: " + err.message;
        resultDisplay.classList.remove('hidden');
    } finally {
        loading.classList.add('hidden');
    }
}
