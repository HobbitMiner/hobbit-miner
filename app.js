class HobbitMinerApp {
    constructor() {
        this.currentLanguage = 'en';
        this.isMining = false;
        this.miningStats = {
            hashrate: 0,
            threads: 4,
            totalHashes: 0,
            acceptedHashes: 0,
            cpuUsage: 75,
            miningTime: '00:00:00',
            efficiency: 0
        };
        
        this.translations = {
            en: {
                title: "Hobbit Miner",
                cryptoLabel: "Cryptocurrency:",
                threadLabel: "CPU Threads:",
                intensityLabel: "Mining Intensity:",
                startBtn: "START MINING",
                stopBtn: "STOP MINING",
                resetBtn: "RESET",
                hashrateTitle: "Hashrate",
                threadsTitle: "Active Threads",
                minedTitle: "Total Hashes",
                cpuTitle: "CPU Usage",
                statusTitle: "Mining Status",
                statusIdle: "Ready to start mining",
                statusMining: "Mining in progress...",
                footerText: "Hobbit Miner - CPU Mining | Open Source"
            },
            sk: {
                title: "Hobbit Miner",
                cryptoLabel: "Kryptomena:",
                threadLabel: "CPU Vlákna:",
                intensityLabel: "Intenzita ťažby:",
                startBtn: "SPUSTIŤ ŤAŽBU",
                stopBtn: "ZASTAVIŤ ŤAŽBU",
                resetBtn: "RESET",
                hashrateTitle: "Hashrate",
                threadsTitle: "Aktívne vlákna",
                minedTitle: "Celkový počet hashov",
                cpuTitle: "Využitie CPU",
                statusTitle: "Stav ťažby",
                statusIdle: "Pripravené na ťažbu",
                statusMining: "Prebieha ťažba...",
                footerText: "Hobbit Miner - CPU Ťažba | Open Source"
            },
            ru: {
                title: "Hobbit Miner",
                cryptoLabel: "Криптовалюта:",
                threadLabel: "Потоки CPU:",
                intensityLabel: "Интенсивность майнинга:",
                startBtn: "НАЧАТЬ МАЙНИНГ",
                stopBtn: "ОСТАНОВИТЬ МАЙНИНГ",
                resetBtn: "СБРОС",
                hashrateTitle: "Хешрейт",
                threadsTitle: "Активные потоки",
                minedTitle: "Всего хешей",
                cpuTitle: "Использование CPU",
                statusTitle: "Статус майнинга",
                statusIdle: "Готов к майнингу",
                statusMining: "Майнинг в процессе...",
                footerText: "Hobbit Miner - CPU Майнинг | Открытый код"
            }
        };
    }

    init() {
        console.log("Starting Hobbit Miner...");
        this.cacheDomElements();
        this.initLanguage();
        this.initEventListeners();
        this.initMinerConnection();
        this.updateDisplay();
        
        this.addLog("Hobbit Miner ready!");
    }

    cacheDomElements() {
        this.elements = {
            title: document.getElementById('title'),
            cryptoLabel: document.getElementById('crypto-label'),
            threadLabel: document.getElementById('thread-label'),
            intensityLabel: document.getElementById('intensity-label'),
            startBtn: document.getElementById('start-btn'),
            stopBtn: document.getElementById('stop-btn'),
            resetBtn: document.getElementById('reset-btn'),
            hashrateTitle: document.getElementById('hashrate-title'),
            threadsTitle: document.getElementById('threads-title'),
            minedTitle: document.getElementById('mined-title'),
            cpuTitle: document.getElementById('cpu-title'),
            statusTitle: document.getElementById('status-title'),
            statusText: document.getElementById('status-text'),
            footerText: document.getElementById('footer-text'),
            threadValue: document.getElementById('thread-value'),
            intensityValue: document.getElementById('intensity-value'),
            hashrateValue: document.getElementById('hashrate-value'),
            threadsValue: document.getElementById('threads-value'),
            minedValue: document.getElementById('mined-value'),
            cpuValue: document.getElementById('cpu-value'),
            threadSlider: document.getElementById('thread-slider'),
            intensitySlider: document.getElementById('intensity-slider'),
            progressFill: document.getElementById('progress-fill'),
            miningLog: document.getElementById('mining-log'),
            hpsValue: document.getElementById('hps-value'),
            sharesValue: document.getElementById('shares-value'),
            timeValue: document.getElementById('time-value'),
            efficiencyValue: document.getElementById('efficiency-value')
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
        this.elements.startBtn.textContent = t.startBtn;
        this.elements.stopBtn.textContent = t.stopBtn;
        this.elements.resetBtn.textContent = t.resetBtn;
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
            const threads = parseInt(e.target.value);
            this.elements.threadValue.textContent = threads;
            this.miningStats.threads = threads;
            if (window.hobbitMiner) {
                window.hobbitMiner.setThreads(threads);
            }
        });
        
        // Intensity slider
        this.elements.intensitySlider.addEventListener('input', (e) => {
            const intensity = parseInt(e.target.value);
            this.elements.intensityValue.textContent = intensity;
            this.miningStats.cpuUsage = intensity;
            if (window.hobbitMiner) {
                window.hobbitMiner.setIntensity(intensity);
            }
        });
        
        // START MINING button - FIXED!
        this.elements.startBtn.addEventListener('click', () => {
            console.log("START MINING clicked!");
            this.startMining();
        });
        
        // STOP MINING button
        this.elements.stopBtn.addEventListener('click', () => {
            console.log("STOP MINING clicked!");
            this.stopMining();
        });
        
        // RESET button
        this.elements.resetBtn.addEventListener('click', () => {
            this.resetStats();
        });
    }

    initMinerConnection() {
        window.updateMinerStats = (stats) => this.updateMinerStats(stats);
        window.addMiningLog = (message) => this.addMiningLog(message);
    }

    startMining() {
        console.log("Starting mining...");
        
        const threads = parseInt(this.elements.threadSlider.value);
        const intensity = parseInt(this.elements.intensitySlider.value);

        this.addLog("Starting with " + threads + " threads at " + intensity + "%");

        try {
            const success = window.hobbitMiner.start(threads, intensity);
            
            if (success) {
                this.isMining = true;
                this.elements.startBtn.disabled = true;
                this.elements.stopBtn.disabled = false;
                this.elements.statusText.textContent = this.translations[this.currentLanguage].statusMining;
                this.elements.statusText.className = 'status-text status-mining';
                
                this.addLog("Mining started successfully!");
            }
            
        } catch (error) {
            this.addLog("Error: " + error.message);
        }
    }

    stopMining() {
        console.log("Stopping mining...");
        
        if (window.hobbitMiner) {
            window.hobbitMiner.stop();
        }
        
        this.isMining = false;
        this.elements.startBtn.disabled = false;
        this.elements.stopBtn.disabled = true;
        this.elements.statusText.textContent = this.translations[this.currentLanguage].statusIdle;
        this.elements.statusText.className = 'status-text status-idle';
        
        this.addLog("Mining stopped");
    }

    resetStats() {
        this.miningStats = {
            hashrate: 0,
            threads: 4,
            totalHashes: 0,
            acceptedHashes: 0,
            cpuUsage: 75,
            miningTime: '00:00:00',
            efficiency: 0
        };
        this.updateDisplay();
        this.addLog("Statistics reset");
    }

    updateMinerStats(stats) {
        this.miningStats = { ...this.miningStats, ...stats };
        
        if (window.hobbitMiner) {
            const minerStats = window.hobbitMiner.getStats();
            this.miningStats.miningTime = minerStats.miningTime;
            this.miningStats.efficiency = minerStats.efficiency;
        }
        
        this.updateDisplay();
    }

    updateDisplay() {
        this.elements.hashrateValue.textContent = this.miningStats.hashrate.toLocaleString() + " H/s";
        this.elements.threadsValue.textContent = this.miningStats.threads;
        this.elements.minedValue.textContent = this.miningStats.totalHashes.toLocaleString();
        this.elements.cpuValue.textContent = this.miningStats.cpuUsage + "%";
        
        this.elements.progressFill.style.width = this.miningStats.cpuUsage + "%";
        
        this.elements.hpsValue.textContent = this.miningStats.hashrate.toLocaleString();
        this.elements.sharesValue.textContent = this.miningStats.acceptedHashes;
        this.elements.timeValue.textContent = this.miningStats.miningTime;
        this.elements.efficiencyValue.textContent = this.miningStats.efficiency + "%";
    }

    addLog(message) {
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.textContent = message;
        
        this.elements.miningLog.appendChild(logEntry);
        this.elements.miningLog.scrollTop = this.elements.miningLog.scrollHeight;
    }
}

// Start the app when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.hobbitMinerApp = new HobbitMinerApp();
    window.hobbitMinerApp.init();
});
