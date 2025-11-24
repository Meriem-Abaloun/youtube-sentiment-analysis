// Extrait les commentaires de la page YouTube
function extractComments() {
    console.log("Extraction des commentaires YouTube...");
    
    // Sélecteurs pour les commentaires YouTube
    const selectors = [
        'ytd-comment-thread-renderer #content-text',
        'ytd-comment-renderer #content-text',
        '#content-text',
        'yt-formatted-string#content-text'
    ];
    
    let comments = [];
    let foundElements = 0;
    
    selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        console.log(`Sélecteur ${selector}: ${elements.length} éléments trouvés`);
        
        elements.forEach(element => {
            const text = element.textContent.trim();
            if (text && text.length > 5) { // Au moins 5 caractères
                comments.push(text);
                foundElements++;
            }
        });
    });
    
    console.log(`${foundElements} commentaires extraits`);
    
    // Supprime les doublons et limite à 200 commentaires
    const uniqueComments = [...new Set(comments)];
    return uniqueComments.slice(0, 200);
}

// Essaie d'extraire les commentaires dynamiquement lors du défilement
function setupScrollListener() {
    let lastCommentCount = 0;
    
    const checkNewComments = () => {
        const currentComments = extractComments();
        if (currentComments.length > lastCommentCount) {
            console.log(`Nouveaux commentaires détectés: ${currentComments.length}`);
            lastCommentCount = currentComments.length;
        }
    };
    
    // Vérifie les nouveaux commentaires toutes les 2 secondes
    setInterval(checkNewComments, 2000);
}

// Initialisation
console.log("YouTube Sentiment Analyzer content script chargé");

// Écoute les messages du popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Message reçu:", request);
    
    if (request.action === "getComments") {
        try {
            const comments = extractComments();
            console.log(`Envoi de ${comments.length} commentaires au popup`);
            sendResponse({comments: comments, success: true});
        } catch (error) {
            console.error("Erreur lors de l'extraction:", error);
            sendResponse({comments: [], success: false, error: error.message});
        }
    }
    return true; // Garde le canal ouvert pour la réponse asynchrone
});

// Setup pour les pages YouTube qui se chargent dynamiquement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupScrollListener);
} else {
    setupScrollListener();
}