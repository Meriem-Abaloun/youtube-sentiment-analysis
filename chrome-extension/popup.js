document.addEventListener('DOMContentLoaded', function() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const darkModeBtn = document.getElementById('darkModeBtn');
    const copyBtn = document.getElementById('copyBtn');
    const exportBtn = document.getElementById('exportBtn');
    const filters = document.querySelectorAll('.filters button');
    
    let currentResults = null;
    let currentFilter = 'all';

    analyzeBtn.addEventListener('click', analyzeComments);
    darkModeBtn.addEventListener('click', toggleDarkMode);
    copyBtn.addEventListener('click', copyResults);
    exportBtn.addEventListener('click', exportCSV);
    
    filters.forEach(btn => {
        btn.addEventListener('click', () => {
            filters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            filterComments(currentFilter);
        });
    });

    async function analyzeComments() {
        showLoading();
        hideError();
        hideResults();
        
        try {
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
            const response = await chrome.tabs.sendMessage(tab.id, {action: "getComments"});
            
            if (!response.comments || response.comments.length === 0) {
                showError("Aucun commentaire trouvé sur cette page");
                return;
            }

            const apiResponse = await fetch('http://localhost:8000/predict_batch', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({comments: response.comments})
            });
            
            if (!apiResponse.ok) {
                throw new Error(`API error: ${apiResponse.status}`);
            }
            
            const data = await apiResponse.json();
            currentResults = data;
            displayResults(data);
            
        } catch (error) {
            showError(`Erreur: ${error.message}`);
        }
    }

    function displayResults(data) {
        hideLoading();
        
        // Met à jour les statistiques
        updateStats(data.statistics);
        
        // Affiche les commentaires
        displayComments(data.predictions);
        
        // Affiche les sections
        document.getElementById('stats').classList.remove('hidden');
        document.getElementById('filters').classList.remove('hidden');
        document.getElementById('commentsList').classList.remove('hidden');
        document.getElementById('actions').classList.remove('hidden');
    }

    function updateStats(stats) {
        const total = stats.total;
        
        document.getElementById('positiveCount').textContent = stats.positive;
        document.getElementById('neutralCount').textContent = stats.neutral;
        document.getElementById('negativeCount').textContent = stats.negative;
        
        document.getElementById('positivePercent').textContent = Math.round((stats.positive / total) * 100) + '%';
        document.getElementById('neutralPercent').textContent = Math.round((stats.neutral / total) * 100) + '%';
        document.getElementById('negativePercent').textContent = Math.round((stats.negative / total) * 100) + '%';
        
        // Graphique
        document.getElementById('positiveBar').style.width = (stats.positive / total * 100) + '%';
        document.getElementById('neutralBar').style.width = (stats.neutral / total * 100) + '%';
        document.getElementById('negativeBar').style.width = (stats.negative / total * 100) + '%';
    }

    function displayComments(comments) {
        const container = document.getElementById('commentsList');
        container.innerHTML = '';
        
        comments.forEach(comment => {
            const div = document.createElement('div');
            div.className = `comment-item comment-${getSentimentClass(comment.sentiment)}`;
            
            div.innerHTML = `
                <div class="comment-text">${comment.text}</div>
                <div class="comment-confidence">
                    ${getSentimentEmoji(comment.sentiment)} 
                    Confiance: ${Math.round(comment.confidence * 100)}%
                </div>
            `;
            
            container.appendChild(div);
        });
    }

    function filterComments(filter) {
        if (!currentResults) return;
        
        const filtered = filter === 'all' 
            ? currentResults.predictions 
            : currentResults.predictions.filter(c => c.sentiment == filter);
        
        displayComments(filtered);
    }

    function getSentimentClass(sentiment) {
        return sentiment === 1 ? 'positive' : sentiment === 0 ? 'neutral' : 'negative';
    }

    function getSentimentEmoji(sentiment) {
        return sentiment === 1 ? '👍' : sentiment === 0 ? '😐' : '👎';
    }

    function copyResults() {
        if (!currentResults) return;
        
        const text = `YouTube Sentiment Analysis\n
Positifs: ${currentResults.statistics.positive} (${Math.round(currentResults.statistics.positive / currentResults.statistics.total * 100)}%)
Neutres: ${currentResults.statistics.neutral} (${Math.round(currentResults.statistics.neutral / currentResults.statistics.total * 100)}%)
Négatifs: ${currentResults.statistics.negative} (${Math.round(currentResults.statistics.negative / currentResults.statistics.total * 100)}%)`;
        
        navigator.clipboard.writeText(text);
        alert("Résultats copiés !");
    }

    function exportCSV() {
        if (!currentResults) return;
        
        let csv = "Texte,Sentiment,Confiance\n";
        currentResults.predictions.forEach(comment => {
            const sentiment = comment.sentiment === 1 ? "Positif" : comment.sentiment === 0 ? "Neutre" : "Négatif";
            csv += `"${comment.text.replace(/"/g, '""')}",${sentiment},${comment.confidence}\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'youtube_sentiment.csv';
        a.click();
    }

    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
    }

    function showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    }

    function hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }

    function hideResults() {
        document.getElementById('stats').classList.add('hidden');
        document.getElementById('filters').classList.add('hidden');
        document.getElementById('commentsList').classList.add('hidden');
        document.getElementById('actions').classList.add('hidden');
    }

    function showError(message) {
        document.getElementById('error').textContent = message;
        document.getElementById('error').classList.remove('hidden');
        hideLoading();
    }

    function hideError() {
        document.getElementById('error').classList.add('hidden');
    }
});