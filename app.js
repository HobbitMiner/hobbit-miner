// Hobbit Miner - Main Application
class HobbitMinerApp {
    constructor() {
        this.currentLanguage = 'en';
        this.isMining = false;
        this.miningStats = {
            hashrate: 0,
            threads: 0,
            mined: 0,
            cpuUsage: 0,
            totalHashes: 0
        };
        
        this.translations = {
            en: {
                title: "Hobbit Miner",
                cryptoLabel: "Select Cryptocurrency:",
                threadLabel: "CPU Threads:",
                intensityLabel: "Mining Intensity:",
                poolLabel: "Mining Pool:",
                walletLabel: "Wallet Address:",
                startBtn: "Start Mining",
                stopBtn: "Stop Mining",
                hashrateTitle: "Hashrate",
                threadsTitle: "Active Threads",
                minedTitle: "Total Mined",
                cpuTitle: "CPU Usage",
                statusTitle: "Mining Status",
                statusIdle: "Ready to start mining",
                statusMining: "Mining in progress...",
                statusError: "Mining error occurred",
                footerText: "Hobbit Miner - Open Source Browser Mining Tool | No data collection",
                walletWarning: "Please enter your wallet address",
                poolWarning: "Please enter mining pool address"
            },
            sk: {
                title: "Hobbit Miner",
                cryptoLabel: "Vyberte kryptomenu:",
                threadLabel: "CPU Vlákna:",
                intensityLabel: "Intenzita ťažby:",
                poolLabel: "Ťažobný pool:",
                walletLabel: "Adresa peňaženky:",
                startBtn: "Začať ťažiť",
                stopBtn: "Zastaviť ťažbu",
                hashrateTitle: "Hashrate",
                threadsTitle: "Aktívne vlákna",
                minedTitle: "Celkovo vytŕžené",
                cpuTitle: "Využitie CPU",
                statusTitle: "Stav ťažby",
                statusIdle: "Pripravené na začatie ťažby",
                statusMining: "Prebieha ťažba...",
                statusError: "Nastala chyba pri ťažbe",
                footerText: "Hobbit Miner - Open Source Webový Ťažobný Nástroj | Žiadne zbieranie údajov",
                walletWarning: "Zadajte adresu svojej peňaženky",
                poolWarning: "Zadajte adresu ťažobného poolu"
            },
            ru: {
                title: "Hobbit Miner",
                cryptoLabel: "Выберите криптовалюту:",
                threadLabel: "Потоки CPU:",
                intensityLabel: "Интенсивность майнинга:",
                poolLabel: "Майнинг пул:",
                walletLabel: "Адрес кошелька:",
                startBtn: "Начать майнинг",
                stopBtn: "Остановить майнинг",
                hashrateTitle: "Хешрейт",
                threadsTitle: "Активные потоки",
                minedTitle: "Всего добыто",
                cpuTitle: "Использование CPU",
                statusTitle: "Статус майнинга",
                statusIdle: "Готов к началу майнинга",
                statusMining: "Майнинг в процессе...",
                statusError: "Произошла ошибка майнинга",
                footerText: "Hobbit Miner - Майнинг инструмент с открытым исходным кодом | Сбор данных отсутствует",
                walletWarning: "Введите адрес вашего кошелька",
                poolWarning: "Введите адрес майнинг пула"
            }
        };
    }

    init() {
        this.cacheDomElements();
        this.initLanguage();
        this.initEventListeners();
        this.initMinerConnection();
        this.updateDisplay();
        
        console.log("Hobbit Miner initialized successfully");
    }

    cacheDomElements() {
        this.elements = {
            // Text elements
            title: document.getElementById('title'),
            cryptoLabel: document.getElementById('crypto-label'),
            threadLabel: document.getElementById('thread-label'),
            intensityLabel: document.getElementById('intensity-label'),
            poolLabel: document.getElementById('pool-label'),
            walletLabel: document.getElementById('wallet-label'),
            startBtn: document.getElementById('start-btn'),
            stopBtn: document.getElementById('stop-btn'),
            hashrateTitle: document.getElementById('hashrate-title'),
            threadsTitle: document.getElementById('threads-title'),
            minedTitle: document.getElementById('mined-title'),
            cpuTitle: document.getElementById('cpu-title'),
            statusTitle: document.getElementById('status-title'),
            statusText: document.getElementById('status-text'),
            footerText: document.getElementById('footer-text'),
            
            // Value elements
            threadValue: document.getElementById('thread-value'),
            intensityValue: document.getElementById('intensity-value'),
            hashrateValue: document.getElementById('hashrate-value'),
            threadsValue: document.getElementById('threads-value'),
            minedValue: document.getElementById('mined-value'),
            cpuValue: document.getElementById('cpu-value'),
            
            // Input elements
            threadSlider: document.getElementById('thread-slider'),
            intensitySlider: document.getElementById('intensity-slider'),
            poolInput: document.getElementById('pool-input'),
            walletInput: document.getElementById('wallet-input'),
            cryptoSelect: document.getElementById('crypto-select'),
            
            // Progress and log
            progressFill: document.getElementById('progress-fill'),
            miningLog: document.getElementById('mining-log')
        };

        this.langButtons = {
            'lang-en': document.getElementById('lang-en'),
            'lang-sk': document.getElementById('lang-sk'),
            'lang-ru': document.getElementById('lang-ru')
        };
    }

    initLanguage() {
        this.updateLanguage(this.currentLanguage);
        
        Object.keys(this.langButtons).forEach(langId => {
            this.langButtons[langId].addEventListener('click', () => {
                const lang = langId.split('-')[1];
                this.setLanguage(lang);
            });
        });
    }

    setLanguage(lang) {
        this.currentLanguage = lang;
        this.updateLanguage(lang);
        
        Object.keys(this.langButtons).forEach(langId => {
            const button = this.langButtons[langId];
            if (langId === `lang-${lang}`) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    updateLanguage(lang) {
        const t = this.translations[lang];
        
        this.elements.title.textContent = t.title;
        this.elements.cryptoLabel.textContent = t.cryptoLabel;
        this.elements.threadLabel.textContent = t.threadLabel;
        this.elements.intensityLabel.textContent = t.intensityLabel;
        this.elements.poolLabel.textContent = t.poolLabel;
        this.elements.walletLabel.textContent = t.walletLabel;
        this.elements.startBtn.textContent = t.startBtn;
        this.elements.stopBtn.textContent = t.stopBtn;
        this.elements.hashrateTitle.textContent = t.hashrateTitle;
        this.elements.threadsTitle.textContent = t.threadsTitle;
        this.elements.minedTitle.textContent = t.minedTitle;
        this.elements.cpuTitle.textContent = t.cpuTitle;
        this.elements.statusTitle.textContent = t.statusTitle;
        this.elements.footerText.textContent = t.footerText;
        
        if (!this.isMining) {
            this.elements.statusText.textContent = t.statusIdle;
            this.elements.statusText.className = 'status-text status-idle';
        }
    }

    initEventListeners() {
        // Thread slider
        this.elements.threadSlider.addEventListener('input', (e) => {
            this.elements.threadValue.textContent = e.target.value;
        });
        
        // Intensity slider
        this.elements.intensitySlider.addEventListener('input', (e) => {
            this.elements.intensityValue.textContent = e.target.value;
            if (window.hobbitMiner && this.isMining) {
                window.hobbitMiner.setIntensity(parseInt(e.target.value));
            }
        });
        
        // Start/Stop buttons
        this.elements.startBtn.addEventListener('click', () => this.startMining());
        this.elements.stopBtn.addEventListener('click', () => this.stopMining());
    }

    initMinerConnection() {
        // Make miner functions available globally
        window.updateMinerStats = (stats) => this.updateMinerStats(stats);
        window.addMiningLog = (message) => this.addMiningLog(message);
        window.updateMined = (amount) => this.updateMined(amount);
    }

    async startMining() {
        const wallet = this.elements.walletInput.value.trim();
        const pool = this.elements.poolInput.value.trim();
        const threads = parseInt(this.elements.threadSlider.value);
        const intensity = parseInt(this.elements.intensitySlider.value);
        const crypto = this.elements.cryptoSelect.value;

        if (!wallet) {
            alert(this.translations[this.currentLanguage].walletWarning);
            return;
        }

        if (!pool) {
            alert(this.translations[this.currentLanguage].poolWarning);
            return;
        }

        try {
            // Initialize miner
            await window.hobbitMiner.initialize(pool, wallet, threads, intensity);
            
            // Start mining
            window.hobbitMiner.start();
            this.isMining = true;
            
            // Update UI
            this.elements.startBtn.disabled = true;
            this.elements.stopBtn.disabled = false;
            this.elements.statusText.textContent = this.translations[this.currentLanguage].statusMining;
            this.elements.statusText.className = 'status-text status-mining';
            
            this.addMiningLog("Mining started successfully");
            
        } catch (error) {
            this.addMiningLog(`Error starting miner: ${error.message}`);
            this.elements.statusText.textContent = this.translations[this.currentLanguage].statusError;
            this.elements.statusText.className = 'status-text status-error';
        }
    }

    stopMining() {
        if (window.hobbitMiner) {
            window.hobbitMiner.stop();
        }
        
        this.isMining = false;
        this.elements.startBtn.disabled = false;
        this.elements.stopBtn.disabled = true;
        this.elements.statusText.textContent = this.translations[this.currentLanguage].statusIdle;
        this.elements.statusText.className = 'status-text status-idle';
        
        this.addMiningLog("Mining stopped");
    }

    updateMinerStats(stats) {
        this.miningStats = { ...this.miningStats, ...stats };
        this.updateDisplay();
    }

    updateMined(amount) {
        this.miningStats.mined += amount;
        this.updateDisplay();
    }

    updateDisplay() {
        // Update statistics
        this.elements.hashrateValue.textContent = `${this.miningStats.hashrate.toFixed(2)} H/s`;
        this.elements.threadsValue.textContent = this.miningStats.threads;
        this.elements.minedValue.textContent = this.miningStats.mined.toFixed(8);
        this.elements.cpuValue.textContent = `${this.miningStats.cpuUsage}%`;
        
        // Update progress bar based on CPU usage
        this.elements.progressFill.style.width = `${this.miningStats.cpuUsage}%`;
    }

    addMiningLog(message) {
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.textContent = message;
        
        this.elements.miningLog.appendChild(logEntry);
        this.elements.miningLog.scrollTop = this.elements.miningLog.scrollHeight;
    }

    getTranslation(key) {
        return this.translations[this.currentLanguage][key] || key;
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.hobbitMinerApp = new HobbitMinerApp();
    window.hobbitMinerApp.init();
});
