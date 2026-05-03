// Fonction utilitaire pour sécuriser le texte (empêche le code HTML malveillant)
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function sendMessage() {
    const input = document.getElementById("input");
    const messages = document.getElementById("messages");

    const text = input.value.trim();
    if (!text) return;

    // 🔒 sécurisation
    const safeText = escapeHtml(text);

    // Ajout du message utilisateur proprement
    messages.insertAdjacentHTML('beforeend', `
        <div class="user">
            <div class="bubble">${safeText}</div>
        </div>
    `);

    input.value = "";

    // loading IA
    const loadingId = "load_" + Date.now();
    messages.insertAdjacentHTML('beforeend', `
        <div id="${loadingId}" class="ai">
            <div class="bubble">🤖 IA réfléchit...</div>
        </div>
    `);

    messages.scrollTop = messages.scrollHeight;

    try {
        const res = await fetch("http://localhost:3000/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ prompt: text })
        });

        const data = await res.json();

        // Supprime le chargement
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) {
            loadingElement.remove();
        }

        const reply = data.result || "❌ Aucune réponse IA";

        // Ajout de la réponse de l'IA
        messages.insertAdjacentHTML('beforeend', `
            <div class="ai">
                <div class="bubble">
                   ${escapeHtml(reply)}
                </div>
            </div>
        `);

    } catch (error) {
        // Supprime le chargement en cas d'erreur
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) {
            loadingElement.remove();
        }

        messages.insertAdjacentHTML('beforeend', `
            <div class="ai">
                <div class="bubble">
                    ❌ Erreur connexion serveur IA
                </div>
            </div>
        `);
    }

    messages.scrollTop = messages.scrollHeight;
}