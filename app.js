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
                statsBtn: "POOL STATS",
                hashrateTitle: "Hashrate",
                threadsTitle: "Active Threads",
                sharesTitle: "Accepted Shares",
                cpuTitle: "CPU Usage",
                statusTitle: "Mining Status",
                statusIdle: "Ready to mine Crionic",
                statusMining: "Mining Crionic...",
                poolTitle: "Current Pool",
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
                statsBtn: "ŠTATISTIKY POOLU",
                hashrateTitle: "Hashrate",
                threadsTitle: "Aktívne vlákna",
                sharesTitle: "Akceptované share",
                cpuTitle: "Využitie CPU",
                statusTitle: "Stav ťažby",
                statusIdle: "Pripravené na ťažbu Crionic",
                statusMining: "Ťažba Crionic...",
                poolTitle: "Aktuálny Pool",
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
                statsBtn: "СТАТИСТИКА ПУЛА",
                hashrateTitle: "Хешрейт",
                threadsTitle: "Активные потоки",
                sharesTitle: "Принятые шары",
                cpuTitle: "Использование CPU",
                statusTitle: "Статус майнинга",
                statusIdle: "Готов к майнингу Crionic",
                statusMining: "Майнинг Crionic...",
                poolTitle: "Текущий пул",
                footerText: "Crionic Miner - yespowerLTNCG CPU Майнинг | Открытый код"
            }
        };
    }

    init() {
        console.log("Starting Crionic Miner...");
        this.cacheDomElements();
        this.initLanguage();
        this.initEventListeners();
        this.initMinerConnection();
        this.updateDisplay();
        
        this.addLog("Crionic Miner ready! Algorithm: yespowerLTNCG");
    }

    cacheDomElements() {
        this.elements = {
            title: document.getElementById('title'),
            poolLabel: document.getElementById('pool-label'),
            walletLabel: document.getElementById('wallet-label'),
            threadLabel: document.getElementById('thread-label'),
            intensityLabel: document.getElementById('intensity-label'),
            startBtn: document.getElementById('start-btn'),
            stopBtn: document.getElementById('stop-btn'),
            statsBtn: document.getElementById('stats-btn'),
            hashrateTitle: document.getElementById('hashrate-title'),
            threadsTitle: document.getElementById('threads-title'),
            sharesTitle: document.getElementById('shares-title'),
            cpuTitle: document.getElementById('cpu-title'),
            statusTitle: document.getElementById('status-title'),
            statusText: document.getElementById('status-text'),
            footerText: document.getElementById('footer-text'),
            threadValue: document.getElementById('thread-value'),
            intensityValue: document.getElementById('intensity-value'),
            hashrateValue: document.getElementById('hashrate-value'),
            threadsValue: document.getElementById('threads-value'),
            sharesValue: document.getElementById('shares-value'),
            cpuValue: document.getElementById('cpu-value'),
            threadSlider: document.getElementById('thread-slider'),
            intensitySlider: document.getElementById('intensity-slider'),
            poolSelect: document.getElementById('pool-select'),
            walletInput: document.getElementById('wallet-input'),
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
        this.elements.statsBtn.textContent = t.statsBtn;
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
        this.elements.threadSlider.addEventListener('input', (e) => {
            const threads = parseInt(e.target.value);
            this.elements.threadValue.textContent = threads;
            this.miningStats.threads = threads;
            if (window.crionicMiner) {
                window.crionicMiner.setThreads(threads);
            }
        });
        
        this.elements.intensitySlider.addEventListener('input', (e) => {
            const intensity = parseInt(e.target.value);
            this.elements.intensityValue.textContent = intensity;
            this.miningStats.cpuUsage = intensity;
            if (window.crionicMiner) {
                window.crionicMiner.setIntensity(intensity);
            }
        });
        
        this.elements.startBtn.addEventListener('click', () => {
            this.startMining();
        });
        
        this.elements.stopBtn.addEventListener('click', () => {
            this.stopMining();
        });
        
        this.elements.statsBtn.addEventListener('click', () => {
            this.showPoolStats();
        });
    }

    initMinerConnection() {
        window.updateMinerStats = (stats) => this.updateMinerStats(stats);
        window.addMiningLog = (message) => this.addMiningLog(message);
    }

    startMining() {
        const pool = this.elements.poolSelect.value;
        const wallet = this.elements.walletInput.value.trim();
        const threads = parseInt(this.elements.threadSlider.value);
        const intensity = parseInt(this.elements.intensitySlider.value);

        if (!wallet) {
            this.addLog("ERROR: Please enter Crionic wallet address!");
            return;
        }

        this.addLog("Starting Crionic mining on " + pool + "...");

        try {
            const success = window.crionicMiner.start(pool, wallet, threads, intensity);
            
            if (success) {
                this.isMining = true;
                this.elements.startBtn.disabled = true;
                this.elements.stopBtn.disabled = false;
                this.elements.statusText.textContent = this.translations[this.currentLanguage].statusMining;
                this.elements.statusText.className = 'status-text status-mining';
            }
            
        } catch (error) {
            this.addLog("Error: " + error.message);
        }
    }

    stopMining() {
        if (window.crionicMiner) {
            window.crionicMiner.stop();
        }
        
        this.isMining = false;
        this.elements.startBtn.disabled = false;
        this.elements.stopBtn.disabled = true;
        this.elements.statusText.textContent = this.translations[this.currentLanguage].statusIdle;
        this.elements.statusText.className = 'status-text status-idle';
        
        this.addLog("Mining stopped");
    }

    showPoolStats() {
        if (window.crionicMiner) {
            const poolStats = window.crionicMiner.getPoolStats();
            const currentPool = this.elements.poolSelect.value;
            const stats = poolStats[currentPool];
            
            if (stats) {
                this.addLog("Pool " + currentPool + " stats:");
                this.addLog("  Workers: " + stats.workers);
                this.addLog("  Hashrate: " + stats.hashrate);
                this.addLog("  Blocks: " + stats.blocks);
            }
        }
    }

    updateMinerStats(stats) {
        this.miningStats = { ...this.miningStats, ...stats };
        this.updateDisplay();
    }

    updateDisplay() {
        this.elements.hashrateValue.textContent = this.miningStats.hashrate.toLocaleString() + " H/s";
        this.elements.threadsValue.textContent = this.miningStats.threads;
        this.elements.sharesValue.textContent = this.miningStats.acceptedHashes;
        this.elements.cpuValue.textContent = this.miningStats.cpuUsage + "%";
        
        this.elements.progressFill.style.width = this.miningStats.cpuUsage + "%";
        
        this.elements.currentPool.textContent = this.miningStats.currentPool;
        
        // Update pool status
        this.elements.poolStatus.textContent = this.miningStats.poolStatus;
        this.elements.poolStatus.className = 'status-' + this.miningStats.poolStatus;
    }

    addLog(message) {
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.textContent = message;
        
        this.elements.miningLog.appendChild(logEntry);
        this.elements.miningLog.scrollTop = this.elements.miningLog.scrollHeight;
    }
}

// Start the app
document.addEventListener('DOMContentLoaded', () => {
    window.crionicMinerApp = new CrionicMinerApp();
    window.crionicMinerApp.init();
});
