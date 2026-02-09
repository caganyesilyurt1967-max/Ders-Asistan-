async function handleAI(mod) {
    const aiContent = document.getElementById('aiContent');
    const resultDisplay = document.getElementById('resultDisplay');
    const loading = document.getElementById('loading');

    resultDisplay.classList.add('hidden');
    loading.classList.remove('hidden');

    let promptText = mod === 'ozet' ? "Özetle:" : (mod === 'dy' ? "D/Y soruları yaz:" : "Test hazırla:");

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: promptText,
                content: extractedText.substring(0, 5000)
            })
        });

        const data = await response.json();

        if (data.text) {
            aiContent.innerText = data.text;
        } else {
            // ARTIK BURADA GERÇEK HATAYI GÖRECEKSİN
            aiContent.innerText = "HATA MESAJI: " + (data.error || "Bilinmeyen bir hata oluştu.");
        }
        resultDisplay.classList.remove('hidden');
    } catch (err) {
        aiContent.innerText = "BAĞLANTI HATASI: " + err.message;
        resultDisplay.classList.remove('hidden');
    } finally {
        loading.classList.add('hidden');
    }
}
