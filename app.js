class CrionicMinerApp {
    constructor() {
        this.currentLanguage = 'en';
        this.isMining = false;
        this.miningStats = {
            hashrate: 0,
            threads: 4,
            totalHashes: 0,
            acceptedHashes: 0,
            cpuUsage: 75,
            poolStatus: 'disconnected',
            currentPool: 'Not connected'
        };
        
        this.translations = {
            en: {
                title: "Crionic Miner",
                poolLabel: "Mining Pool:",
                walletLabel: "Crionic Wallet:",
                threadLabel: "CPU Threads:",
                intensityLabel: "Mining Intensity:",
                startBtn: "START MINING",
                stopBtn: "STOP MINING",
                resetBtn: "RESET",
                hashrateTitle: "Hashrate",
                threadsTitle: "Active Threads",
                sharesTitle: "Accepted Shares",
                cpuTitle: "CPU Usage",
                statusTitle: "Mining Status",
                statusIdle: "Ready to mine Crionic",
                statusMining: "Mining Crionic...",
                poolTitle: "Pool Information",
                footerText: "Crionic Miner - yespowerLTNCG CPU Mining | Open Source"
            },
            sk: {
                title: "Crionic Miner",
                poolLabel: "Mining Pool:",
                walletLabel: "Crionic Peňaženka:",
                threadLabel: "CPU Vlákna:",
                intensityLabel: "Intenzita ťažby:",
                startBtn: "SPUSTIŤ ŤAŽBU",
                stopBtn: "ZASTAVIŤ ŤAŽBU",
                resetBtn: "RESET",
                hashrateTitle: "Hashrate",
                threadsTitle: "Aktívne vlákna",
                sharesTitle: "Akceptované share",
                cpuTitle: "Využitie CPU",
                statusTitle: "Stav ťažby",
                statusIdle: "Pripravené na ťažbu Crionic",
                statusMining: "Ťažba Crionic...",
                poolTitle: "Informácie o poole",
                footerText: "Crionic Miner - yespowerLTNCG CPU Ťažba | Open Source"
            },
            ru: {
                title: "Crionic Miner",
                poolLabel: "Майнинг пул:",
                walletLabel: "Crionic Кошелёк:",
                threadLabel: "Потоки CPU:",
                intensityLabel: "Интенсивность майнинга:",
                startBtn: "НАЧАТЬ МАЙНИНГ",
                stopBtn: "ОСТАНОВИТЬ МАЙНИНГ",
                resetBtn: "СБРОС",
                hashrateTitle: "Хешрейт",
                threadsTitle: "Активные потоки",
                sharesTitle: "Принятые шары",
                cpuTitle: "Использование CPU",
                statusTitle: "Статус майнинга",
                statusIdle: "Готов к майнингу Crionic",
                statusMining: "Майнинг Crionic...",
                poolTitle: "Информация о пуле",
                footerText: "Crionic Miner - yespowerLTNCG CPU Майнинг | Открытый код"
            }
        };
    }

    init() {
        console.log("🚀 Initializing Crionic Miner App...");
        this.cacheDomElements();
        this.initLanguage();
        this.initEventListeners();
        this.initMinerConnection();
        this.updateDisplay();
        
        this.addLog("✅ Crionic Miner App initialized successfully!");
        this.addLog("⚡ Algorithm: yespowerLTNCG - Ready for CPU mining");
    }

    cacheDomElements() {
        this.elements = {
            // Text elements
            title: document.getElementById('title'),
            poolLabel: document.getElementById('pool-label'),
            walletLabel: document.getElementById('wallet-label'),
            threadLabel: document.getElementById('thread-label'),
            intensityLabel: document.getElementById('intensity-label'),
            startBtn: document.getElementById('start-btn'),
            stopBtn: document.getElementById('stop-btn'),
            resetBtn: document.getElementById('reset-btn'),
            hashrateTitle: document.getElementById('hashrate-title'),
            threadsTitle: document.getElementById('threads-title'),
            sharesTitle: document.getElementById('shares-title'),
            cpuTitle: document.getElementById('cpu-title'),
            statusTitle: document.getElementById('status-title'),
            statusText: document.getElementById('status-text'),
            footerText: document.getElementById('footer-text'),
            
            // Value elements
            threadValue: document.getElementById('thread-value'),
            intensityValue: document.getElementById('intensity-value'),
            hashrateValue: document.getElementById('hashrate-value'),
            threadsValue: document.getElementById('threads-value'),
            sharesValue: document.getElementById('shares-value'),
            cpuValue: document.getElementById('cpu-value'),
            
            // Input elements
            threadSlider: document.getElementById('thread-slider'),
            intensitySlider: document.getElementById('intensity-slider'),
            poolSelect: document.getElementById('pool-select'),
            walletInput: document.getElementById('wallet-input'),
            
            // UI elements
            progressFill: document.getElementById('progress-fill'),
            miningLog: document.getElementById('mining-log'),
            currentPool: document.getElementById('current-pool'),
            poolStatus: document.getElementById('pool-status')
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
        this.elements.poolLabel.textContent = t.poolLabel;
        this.elements.walletLabel.textContent = t.walletLabel;
        this.elements.threadLabel.textContent = t.threadLabel;
        this.elements.intensityLabel.textContent = t.intensityLabel;
        this.elements.startBtn.textContent = t.startBtn;
        this.elements.stopBtn.textContent = t.stopBtn;
        this.elements.resetBtn.textContent = t.resetBtn;
        this.elements.hashrateTitle.textContent = t.hashrateTitle;
        this.elements.threadsTitle.textContent = t.threadsTitle;
        this.elements.sharesTitle.textContent = t.sharesTitle;
        this.elements.cpuTitle.textContent = t.cpuTitle;
        this.elements.statusTitle.textContent = t.statusTitle;
        this.elements.footerText.textContent = t.footerText;
        
        document.querySelector('.pool-info h3').textContent = t.poolTitle;
        
        if (!this.isMining) {
            this.elements.statusText.textContent = t.statusIdle;
            this.elements.statusText.className = 'status-text status-idle';
        }
    }

    initEventListeners() {
        // Thread slider
        this.elements.threadSlider.addEventListener('input', (e) => {
            const threads = parseInt(e.target.value);
            this.elements.threadValue.textContent = threads;
            this.miningStats.threads = threads;
            if (window.crionicMiner) {
                window.crionicMiner.setThreads(threads);
            }
        });
        
        // Intensity slider
        this.elements.intensitySlider.addEventListener('input', (e) => {
            const intensity = parseInt(e.target.value);
            this.elements.intensityValue.textContent = intensity;
            this.miningStats.cpuUsage = intensity;
            if (window.crionicMiner) {
                window.crionicMiner.setIntensity(intensity);
            }
        });
        
        // START MINING button - FIXED!
        this.elements.startBtn.addEventListener('click', () => {
            console.log("🎯 START MINING button clicked!");
            this.startMining();
        });
        
        // STOP MINING button
        this.elements.stopBtn.addEventListener('click', () => {
            console.log("🛑 STOP MINING button clicked!");
            this.stopMining();
        });
        
        // RESET button
        this.elements.resetBtn.addEventListener('click', () => {
            this.resetStats();
        });

        // Pool selection
        this.elements.poolSelect.addEventListener('change', (e) => {
            this.miningStats.currentPool = e.target.value;
            this.updateDisplay();
            this.addLog("🏊 Pool changed to: " + e.target.value);
        });
    }

    initMinerConnection() {
        window.updateMinerStats = (stats) => this.updateMinerStats(stats);
        window.addMiningLog = (message) => this.addMiningLog(message);
        
        console.log("✅ Miner connection initialized");
    }

    startMining() {
        console.log("🚀 Starting Crionic mining process...");
        
        const threads = parseInt(this.elements.threadSlider.value);
        const intensity = parseInt(this.elements.intensitySlider.value);
        const pool = this.elements.poolSelect.value;

        this.addLog("🔧 Starting with " + threads + " threads at " + intensity + "% intensity");
        this.addLog("🏊 Pool: " + pool);

        try {
            const success = window.crionicMiner.start(threads, intensity);
            
            if (success) {
                this.isMining = true;
                this.elements.startBtn.disabled = true;
                this.elements.stopBtn.disabled = false;
                this.elements.statusText.textContent = this.translations[this.currentLanguage].statusMining;
                this.elements.statusText.className = 'status-text status-mining';
                
                this.miningStats.currentPool = pool;
                this.updateDisplay();
                
                this.addLog("✅ Mining started successfully!");
            } else {
                this.addLog("❌ Failed to start mining!");
            }
            
        } catch (error) {
            this.addLog("💥 Error starting miner: " + error.message);
            console.error("Start Mining Error:", error);
        }
    }

    stopMining() {
        console.log("🛑 Stopping mining...");
        
        if (window.crionicMiner) {
            window.crionicMiner.stop();
        }
        
        this.isMining = false;
        this.elements.startBtn.disabled = false;
        this.elements.stopBtn.disabled = true;
        this.elements.statusText.textContent = this.translations[this.currentLanguage].statusIdle;
        this.elements.statusText.className = 'status-text status-idle';
        
        this.addLog("🛑 Mining stopped");
    }

    resetStats() {
        this.miningStats = {
            hashrate: 0,
            threads: 4,
            totalHashes: 0,
            acceptedHashes: 0,
            cpuUsage: 75,
            poolStatus: 'disconnected',
            currentPool: this.elements.poolSelect.value
        };
        this.updateDisplay();
        this.addLog("🔄 Statistics reset");
    }

    updateMinerStats(stats) {
        this.miningStats = { ...this.miningStats, ...stats };
        this.updateDisplay();
    }

    updateDisplay() {
        // Update statistics
        this.elements.hashrateValue.textContent = this.miningStats.hashrate.toLocaleString() + " H/s";
        this.elements.threadsValue.textContent = this.miningStats.threads;
        this.elements.sharesValue.textContent = this.miningStats.acceptedHashes;
        this.elements.cpuValue.textContent = this.miningStats.cpuUsage + "%";
        
        // Update progress bar
        this.elements.progressFill.style.width = this.miningStats.cpuUsage + "%";
        
        // Update pool information
        this.elements.currentPool.textContent = this.miningStats.currentPool;
        this.elements.poolStatus.textContent = this.miningStats.poolStatus;
        this.elements.poolStatus.className = 'status-' + this.miningStats.poolStatus;
    }

    addLog(message) {
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.textContent = message;
        
        this.elements.miningLog.appendChild(logEntry);
        this.elements.miningLog.scrollTop = this.elements.miningLog.scrollHeight;
        
        console.log("CrionicMiner UI: " + message);
    }
}

// Start the app when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log("📄 DOM fully loaded, starting Crionic Miner...");
    window.crionicMinerApp = new CrionicMinerApp();
    window.crionicMinerApp.init();
});

// Fallback initialization
setTimeout(() => {
    if (!window.crionicMinerApp) {
        console.log("🔄 Fallback initialization...");
        window.crionicMinerApp = new CrionicMinerApp();
        window.crionicMinerApp.init();
    }
}, 1000);
