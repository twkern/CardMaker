// CardMaker Application
class CardMaker {
    constructor() {
        this.cards = this.loadCards();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderGallery();
        this.updatePreview();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('cardForm').addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Real-time preview updates
        document.getElementById('cardText').addEventListener('input', () => this.updatePreview());
        document.getElementById('cardAuthor').addEventListener('input', () => this.updatePreview());
        document.getElementById('bgColor').addEventListener('change', () => this.updatePreview());
        document.getElementById('textColor').addEventListener('change', () => this.updatePreview());
        document.getElementById('fontSize').addEventListener('input', (e) => {
            this.updatePreview();
            document.getElementById('fontSizeDisplay').textContent = e.target.value + 'px';
        });
        document.getElementById('cardType').addEventListener('change', () => this.updatePreview());

        // Gallery controls
        document.getElementById('exportAllBtn').addEventListener('click', () => this.exportAllCards());
        document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAllCards());
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const card = {
            id: Date.now(),
            type: document.getElementById('cardType').value,
            text: document.getElementById('cardText').value,
            author: document.getElementById('cardAuthor').value,
            bgColor: document.getElementById('bgColor').value,
            textColor: document.getElementById('textColor').value,
            fontSize: document.getElementById('fontSize').value,
            createdAt: new Date().toLocaleString()
        };

        this.cards.push(card);
        this.saveCards();
        this.renderGallery();

        // Reset form
        document.getElementById('cardForm').reset();
        document.getElementById('fontSize').value = 28;
        document.getElementById('fontSizeDisplay').textContent = '28px';
        this.updatePreview();

        // Show success message
        this.showNotification('Card created successfully!');
    }

    updatePreview() {
        const previewCard = document.getElementById('previewCard');
        const text = document.getElementById('cardText').value || 'Your card will appear here...';
        const author = document.getElementById('cardAuthor').value;
        const bgColor = document.getElementById('bgColor').value;
        const textColor = document.getElementById('textColor').value;
        const fontSize = document.getElementById('fontSize').value;

        previewCard.style.backgroundColor = bgColor;
        previewCard.style.color = textColor;

        let cardHTML = `<p class="card-text" style="font-size: ${fontSize}px;">${this.escapeHtml(text)}</p>`;
        if (author) {
            cardHTML += `<p class="card-author">— ${this.escapeHtml(author)}</p>`;
        }

        previewCard.innerHTML = cardHTML;
    }

    renderGallery() {
        const gallery = document.getElementById('cardsGallery');

        if (this.cards.length === 0) {
            gallery.innerHTML = '<p class="empty-state">No cards created yet. Create your first card above!</p>';
            return;
        }

        gallery.innerHTML = this.cards.map(card => `
            <div class="gallery-card">
                <div class="gallery-card-content" style="background-color: ${card.bgColor}; color: ${card.textColor};">
                    <p class="gallery-card-text" style="font-size: ${card.fontSize}px;">
                        ${this.escapeHtml(card.text)}
                    </p>
                    ${card.author ? `<p class="card-author">— ${this.escapeHtml(card.author)}</p>` : ''}
                </div>
                <div class="gallery-card-actions">
                    <button class="gallery-card-action" onclick="cardMaker.downloadCard(${card.id})">Download</button>
                    <button class="gallery-card-action" onclick="cardMaker.deleteCard(${card.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    async downloadCard(id) {
        const card = this.cards.find(c => c.id === id);
        if (!card) return;

        try {
            // Create a temporary card element for html2canvas
            const tempCard = document.createElement('div');
            tempCard.style.width = '800px';
            tempCard.style.height = '1000px';
            tempCard.style.position = 'fixed';
            tempCard.style.left = '-9999px';
            tempCard.style.backgroundColor = card.bgColor;
            tempCard.style.color = card.textColor;
            tempCard.style.display = 'flex';
            tempCard.style.flexDirection = 'column';
            tempCard.style.alignItems = 'center';
            tempCard.style.justifyContent = 'center';
            tempCard.style.padding = '60px';
            tempCard.style.textAlign = 'center';
            tempCard.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

            const textEl = document.createElement('p');
            textEl.textContent = card.text;
            textEl.style.fontSize = (card.fontSize * 2) + 'px';
            textEl.style.lineHeight = '1.6';
            textEl.style.fontWeight = '500';
            textEl.style.margin = '0';
            tempCard.appendChild(textEl);

            if (card.author) {
                const authorEl = document.createElement('p');
                authorEl.textContent = '— ' + card.author;
                authorEl.style.fontSize = '28px';
                authorEl.style.opacity = '0.8';
                authorEl.style.marginTop = '60px';
                authorEl.style.fontStyle = 'italic';
                authorEl.style.margin = '60px 0 0 0';
                tempCard.appendChild(authorEl);
            }

            document.body.appendChild(tempCard);

            const canvas = await html2canvas(tempCard, {
                scale: 2,
                logging: false,
                allowTaint: true,
                useCORS: true
            });

            document.body.removeChild(tempCard);

            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `card-${card.id}.png`;
            link.click();

            this.showNotification('Card downloaded successfully!');
        } catch (error) {
            console.error('Error downloading card:', error);
            this.showNotification('Error downloading card', 'error');
        }
    }

    async exportAllCards() {
        if (this.cards.length === 0) {
            this.showNotification('No cards to export', 'error');
            return;
        }

        try {
            const zip = new JSZip();
            const folder = zip.folder('CardMaker-Export');

            for (const card of this.cards) {
                const tempCard = document.createElement('div');
                tempCard.style.width = '800px';
                tempCard.style.height = '1000px';
                tempCard.style.position = 'fixed';
                tempCard.style.left = '-9999px';
                tempCard.style.backgroundColor = card.bgColor;
                tempCard.style.color = card.textColor;
                tempCard.style.display = 'flex';
                tempCard.style.flexDirection = 'column';
                tempCard.style.alignItems = 'center';
                tempCard.style.justifyContent = 'center';
                tempCard.style.padding = '60px';
                tempCard.style.textAlign = 'center';
                tempCard.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

                const textEl = document.createElement('p');
                textEl.textContent = card.text;
                textEl.style.fontSize = (card.fontSize * 2) + 'px';
                textEl.style.lineHeight = '1.6';
                textEl.style.fontWeight = '500';
                textEl.style.margin = '0';
                tempCard.appendChild(textEl);

                if (card.author) {
                    const authorEl = document.createElement('p');
                    authorEl.textContent = '— ' + card.author;
                    authorEl.style.fontSize = '28px';
                    authorEl.style.opacity = '0.8';
                    authorEl.style.marginTop = '60px';
                    authorEl.style.fontStyle = 'italic';
                    authorEl.style.margin = '60px 0 0 0';
                    tempCard.appendChild(authorEl);
                }

                document.body.appendChild(tempCard);

                const canvas = await html2canvas(tempCard, {
                    scale: 2,
                    logging: false,
                    allowTaint: true,
                    useCORS: true
                });

                document.body.removeChild(tempCard);

                const imageData = canvas.toDataURL('image/png').split(',')[1];
                folder.file(`card-${card.id}.png`, imageData, { base64: true });
            }

            const blob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `CardMaker-${new Date().getTime()}.zip`;
            link.click();
            URL.revokeObjectURL(url);

            this.showNotification('All cards exported successfully!');
        } catch (error) {
            console.error('Error exporting cards:', error);
            this.showNotification('Error exporting cards', 'error');
        }
    }

    deleteCard(id) {
        if (!confirm('Are you sure you want to delete this card?')) return;

        this.cards = this.cards.filter(c => c.id !== id);
        this.saveCards();
        this.renderGallery();
        this.showNotification('Card deleted');
    }

    clearAllCards() {
        if (!confirm('Are you sure you want to delete ALL cards? This cannot be undone.')) return;

        this.cards = [];
        this.saveCards();
        this.renderGallery();
        this.showNotification('All cards cleared');
    }

    saveCards() {
        localStorage.setItem('cardMakerCards', JSON.stringify(this.cards));
    }

    loadCards() {
        const stored = localStorage.getItem('cardMakerCards');
        return stored ? JSON.parse(stored) : [];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${type === 'error' ? '#f56565' : '#48bb78'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Add animation styles for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

// Initialize the app
const cardMaker = new CardMaker();