 // opciones de accesibilidad.js - Funciones de accesibilidad para el proyecto
class AccessibilityManager {
    constructor() {
        this.textSizeLevel = 0; // 0: normal, 1: large, 2: xlarge
        this.highContrastMode = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSavedSettings();
    }

    setupEventListeners() {
        // Toggle panel de accesibilidad
        const toggleBtn = document.getElementById('toggle-accessibility');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleAccessibilityPanel());
        }

        // Botones de accesibilidad
        document.getElementById('increase-text')?.addEventListener('click', () => this.increaseTextSize());
        document.getElementById('decrease-text')?.addEventListener('click', () => this.decreaseTextSize());
        document.getElementById('read-buttons')?.addEventListener('click', () => this.readButtons());
        document.getElementById('toggle-contrast')?.addEventListener('click', () => this.toggleContrast());
        document.getElementById('reset-accessibility')?.addEventListener('click', () => this.resetSettings());

        // Navegación por teclado en tarjetas
        this.setupKeyboardNavigation();
    }

    toggleAccessibilityPanel() {
        const panel = document.getElementById('accessibility-panel');
        if (panel) {
            const isHidden = panel.style.display === 'none';
            panel.style.display = isHidden ? 'block' : 'none';
            this.speakText(isHidden ? "Panel de accesibilidad abierto" : "Panel de accesibilidad cerrado");
        }
    }

    increaseTextSize() {
        if (this.textSizeLevel < 2) {
            this.textSizeLevel++;
            this.updateTextSize();
            this.speakText("Tamaño de texto aumentado");
        } else {
            this.speakText("Tamaño de texto ya está en el máximo");
        }
        this.saveSettings();
    }

    decreaseTextSize() {
        if (this.textSizeLevel > 0) {
            this.textSizeLevel--;
            this.updateTextSize();
            this.speakText("Tamaño de texto reducido");
        } else {
            this.speakText("Tamaño de texto ya está en el mínimo");
        }
        this.saveSettings();
    }

    updateTextSize() {
        document.body.classList.remove('large-text', 'xlarge-text');
        
        if (this.textSizeLevel === 1) {
            document.body.classList.add('large-text');
        } else if (this.textSizeLevel === 2) {
            document.body.classList.add('xlarge-text');
        }
    }

    readButtons() {
        const buttons = document.querySelectorAll('.btn, .category-card');
        let buttonTexts = [];
        
        buttons.forEach(button => {
            const text = button.textContent.trim() || button.getAttribute('aria-label');
            if (text) buttonTexts.push(text);
        });
        
        this.speakText("Botones disponibles: " + buttonTexts.join(', '));
    }

    toggleContrast() {
        this.highContrastMode = !this.highContrastMode;
        document.body.classList.toggle('high-contrast', this.highContrastMode);
        
        this.speakText(this.highContrastMode ? 
            "Modo de alto contraste activado" : 
            "Modo de alto contraste desactivado"
        );
        this.saveSettings();
    }

    resetSettings() {
        this.textSizeLevel = 0;
        this.highContrastMode = false;
        document.body.classList.remove('large-text', 'xlarge-text', 'high-contrast');
        this.speakText("Configuración de accesibilidad restablecida");
        this.clearSavedSettings();
    }

    setupKeyboardNavigation() {
        const cards = document.querySelectorAll('.category-card');
        
        cards.forEach(card => {
            card.addEventListener('click', (e) => this.handleCardClick(e));
            card.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleCardClick(e);
                }
            });
        });
    }

    handleCardClick(event) {
        const card = event.currentTarget;
        const categoryName = card.querySelector('h3')?.textContent || 'Categoría';
        this.speakText(`Seleccionada la categoría: ${categoryName}`);
        
        // Aquí se puede agregar la lógica específica para cargar contenido
        console.log(`Cargando contenido de: ${categoryName}`);
    }

    speakText(text) {
        // Usar la Web Speech API si está disponible
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-ES';
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
        } else {
            // Fallback para lectores de pantalla
            this.createScreenReaderAnnouncement(text);
        }
        
        console.log("Lector: " + text);
    }

    createScreenReaderAnnouncement(text) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'screen-reader-text';
        announcement.textContent = text;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    saveSettings() {
        const settings = {
            textSize: this.textSizeLevel,
            highContrast: this.highContrastMode
        };
        localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
    }

    loadSavedSettings() {
        const saved = localStorage.getItem('accessibilitySettings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.textSizeLevel = settings.textSize || 0;
                this.highContrastMode = settings.highContrast || false;
                
                this.updateTextSize();
                if (this.highContrastMode) {
                    document.body.classList.add('high-contrast');
                }
            } catch (e) {
                console.error('Error loading accessibility settings:', e);
            }
        }
    }

    clearSavedSettings() {
        localStorage.removeItem('accessibilitySettings');
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new AccessibilityManager();
});

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityManager;
}
