class RealHobbitMinerApp {
    constructor() {
        this.currentLanguage = 'en';
        this.isMining = false;
        this.miningStats = {
            hashrate: 0,
            threads: 4,
            totalHashes: 0,
            acceptedHashes: 0,
            cpuUsage: 75
        };
        
        this.translations = {
            en: {
                title: "Hobbit Miner",
                cryptoLabel: "Select Cryptocurrency:",
                threadLabel: "CPU Threads:",
                intensityLabel: "Mining Intensity:",
                walletLabel: "Your XMR Wallet Address:",
                startBtn: "Start Real Mining",
                stopBtn: "Stop Mining",
                statsBtn: "View Stats",
                hashrateTitle: "Hashrate",
                threadsTitle: "Active Threads",
                minedTitle: "Total Hashes",
                cpuTitle: "CPU Usage",
                statusTitle: "Mining Status",
                statusIdle: "Ready to start real mining",
                statusMining: "Real mining in progress...",
                statusError: "Mining error occurred",
                footerText: "Hobbit Miner - Real Browser Mining | Open Source | No Data Collection",
                walletWarning: "Please enter your Monero wallet address",
                walletHelp: "Example wallet address - replace with your own!",
                earningsTitle: "Estimated Earnings"
            },
            sk: {
                title: "Hobbit Miner",
                cryptoLabel: "Vyberte kryptomenu:",
                threadLabel: "CPU Vlákna:",
                intensityLabel: "Intenzita ťažby:",
                walletLabel: "Vaša XMR adresa peňaženky:",
                startBtn: "Spustiť reálnu ťažbu",
                stopBtn: "Zastaviť ťažbu",
                statsBtn: "Zobraziť štatistiky",
                hashrateTitle: "Hashrate",
                threadsTitle: "Aktívne vlákna",
                minedTitle: "Celkový počet hashov",
                cpuTitle: "Využitie CPU",
                statusTitle: "Stav ťažby",
                statusIdle: "Pripravené na reálnu ťažbu",
                statusMining: "Prebieha reálna ťažba...",
                statusError: "Nastala chyba pri ťažbe",
                footerText: "Hobbit Miner - Reálna webová ťažba | Open Source | Žiadne zbieranie údajov",
                walletWarning: "Zadajte adresu svojej Monero peňaženky",
                walletHelp: "Príklad adresy - nahraďte svojou vlastnou!",
                earningsTitle: "Odhadovaný zárobok"
            },
            ru: {
                title: "Hobbit Miner",
                cryptoLabel: "Выберите криптовалюту:",
                threadLabel: "Потоки CPU:",
                intensityLabel: "Интенсивность майнинга:",
                walletLabel: "Адрес вашего XMR кошелька:",
                startBtn: "Начать реальный майнинг",
                stopBtn: "Остановить майнинг",
                statsBtn: "Посмотреть статистику",
                hashrateTitle: "Хешрейт",
                threadsTitle: "Активные потоки",
                minedTitle: "Всего хешей",
                cpuTitle: "Использование CPU",
                statusTitle: "Статус майнинга",
                statusIdle: "Готов к началу реального майнинга",
                statusMining: "Реальный майнинг в процессе...",
                statusError: "Произошла ошибка майнинга",
                footerText: "Hobbit Miner - Реальный браузерный майнинг | Открытый исходный код | Сбор данных отсутствует",
                walletWarning: "Введите адрес вашего Monero кошелька",
                walletHelp: "Пример адреса - замените на свой собственный!",
                earningsTitle: "Расчетный заработок"
            }
        };
    }

    init() {
        console.log("Initializing Hobbit Miner App...");
        this.cacheDomElements();
        this.initLanguage();
        this.initEventListeners();
        this.initMinerConnection();
        this.updateDisplay();
        
        this.addLog("Hobbit Miner App initialized successfully!");
    }

    cacheDomElements() {
        this.elements = {
            title: document.getElementById('title'),
            cryptoLabel: document.getElementById('crypto-label'),
            threadLabel: document.getElementById('thread-label'),
            intensityLabel: document.getElementById('intensity-label'),
            walletLabel: document.getElementById('wallet-label'),
            startBtn: document.getElementById('start-btn'),
            stopBtn: document.getElementById('stop-btn'),
            statsBtn: document.getElementById('stats-btn'),
            hashrateTitle: document.getElementById('hashrate-title'),
            threadsTitle: document.getElementById('threads-title'),
            minedTitle: document.getElementById('mined-title'),
            cpuTitle: document.getElementById('cpu-title'),
            statusTitle: document.getElementById('status-title'),
            statusText: document.getElementById('status-text'),
            footerText: document.getElementById('footer-text'),
            walletHelp: document.getElementById('wallet-help'),
            threadValue: document.getElementById('thread-value'),
            intensityValue: document.getElementById('intensity-value'),
            hashrateValue: document.getElementById('hashrate-value'),
            threadsValue: document.getElementById('threads-value'),
            minedValue: document.getElementById('mined-value'),
            cpuValue: document.getElementById('cpu-value'),
            threadSlider: document.getElementById('thread-slider'),
            intensitySlider: document.getElementById('intensity-slider'),
            walletInput: document.getElementById('wallet-input'),
            cryptoSelect: document.getElementById('crypto-select'),
            progressFill: document.getElementById('progress-fill'),
            miningLog: document.getElementById('mining-log'),
            hourlyEarnings: document.getElementById('hourly-earnings'),
            dailyEarnings: document.getElementById('daily-earnings'),
            weeklyEarnings: document.getElementById('weekly-earnings'),
            monthlyEarnings: document.getElementById('monthly-earnings')
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
        this.elements.walletLabel.textContent = t.walletLabel;
        this.elements.startBtn.textContent = t.startBtn;
        this.elements.stopBtn.textContent = t.stopBtn;
        this.elements.statsBtn.textContent = t.statsBtn;
        this.elements.hashrateTitle.textContent = t.hashrateTitle;
        this.elements.threadsTitle.textContent = t.threadsTitle;
        this.elements.minedTitle.textContent = t.minedTitle;
        this.elements.cpuTitle.textContent = t.cpuTitle;
        this.elements.statusTitle.textContent = t.statusTitle;
        this.elements.footerText.textContent = t.footerText;
        this.elements.walletHelp.textContent = t.walletHelp;
        
        document.querySelector('.earnings-container h3').textContent = t.earningsTitle;
        
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
            if (window.realHobbitMiner) {
                window.realHobbitMiner.setThreads(threads);
            }
        });
        
        this.elements.intensitySlider.addEventListener('input', (e) => {
            const intensity = parseInt(e.target.value);
            this.elements.intensityValue.textContent = intensity;
            this.miningStats.cpuUsage = intensity;
            if (window.realHobbitMiner) {
                window.realHobbitMiner.setIntensity(intensity);
            }
        });
        
        this.elements.startBtn.addEventListener('click', () => {
            console.log("Start button clicked!");
            this.startRealMining();
        });
        
        this.elements.stopBtn.addEventListener('click', () => {
            console.log("Stop button clicked!");
            this.stopRealMining();
        });
        
        this.elements.statsBtn.addEventListener('click', () => {
            this.showStats();
        });

        this.elements.walletInput.addEventListener('input', (e) => {
            if (e.target.value.length > 10) {
                this.addLog("Wallet address updated");
            }
        });
    }

    initMinerConnection() {
        window.updateRealMinerStats = (stats) => this.updateRealMinerStats(stats);
        window.addRealMiningLog = (message) => this.addRealMiningLog(message);
        
        this.addLog("Miner connection initialized");
    }

    startRealMining() {
        console.log("Starting REAL mining process...");
        
        const wallet = this.elements.walletInput.value.trim();
        const threads = parseInt(this.elements.threadSlider.value);
        const intensity = parseInt(this.elements.intensitySlider.value);

        if (!wallet) {
            alert(this.translations[this.currentLanguage].walletWarning);
            this.addLog("Please enter wallet address!");
            return;
        }

        if (wallet.length < 95) {
            this.addLog("Wallet address seems too short. Please check!");
            return;
        }

        this.addLog("Initializing miner with your settings...");

        try {
            const success = window.realHobbitMiner.initialize(wallet, threads, intensity);
            
            if (success) {
                setTimeout(() => {
                    window.realHobbitMiner.start();
                    this.isMining = true;
                    
                    this.elements.startBtn.disabled = true;
                    this.elements.stopBtn.disabled = false;
                    this.elements.statusText.textContent = this.translations[this.currentLanguage].statusMining;
                    this.elements.statusText.className = 'status-text status-mining';
                    
                    this.addLog("Mining started successfully!");
                    
                }, 1000);
            } else {
                this.addLog("Failed to initialize miner!");
            }
            
        } catch (error) {
            this.addLog("Error: " + error.message);
            console.error("Start Mining Error:", error);
        }
    }

    stopRealMining() {
        console.log("Stopping mining...");
        
        if (window.realHobbitMiner) {
            window.realHobbitMiner.stop();
        }
        
        this.isMining = false;
        this.elements.startBtn.disabled = false;
        this.elements.stopBtn.disabled = true;
        this.elements.statusText.textContent = this.translations[this.currentLanguage].statusIdle;
        this.elements.statusText.className = 'status-text status-idle';
        
        this.addLog("Mining stopped");
    }

    showStats() {
        if (window.realHobbitMiner) {
            const stats = window.realHobbitMiner.getStats();
            this.addLog("Current Stats - Hashrate: " + stats.hashrate.toFixed(2) + " H/s, Hashes: " + stats.totalHashes + ", Accepted: " + stats.acceptedHashes);
        } else {
            this.addLog("No active mining session");
        }
    }

    updateRealMinerStats(stats) {
        this.miningStats = { ...this.miningStats, ...stats };
        this.updateDisplay();
    }

    updateDisplay() {
        this.elements.hashrateValue.textContent = this.miningStats.hashrate.toFixed(2) + " H/s";
        this.elements.threadsValue.textContent = this.miningStats.threads;
        this.elements.minedValue.textContent = this.miningStats.totalHashes.toLocaleString();
        this.elements.cpuValue.textContent = this.miningStats.cpuUsage + "%";
        
        this.elements.progressFill.style.width = this.miningStats.cpuUsage + "%";
        
        this.updateEarningsDisplay();
    }

    updateEarningsDisplay() {
        const xmrPerDay = (this.miningStats.hashrate * 86400) / 1000000000;
        const hourly = xmrPerDay / 24;
        const daily = xmrPerDay;
        const weekly = xmrPerDay * 7;
        const monthly = xmrPerDay * 30;

        this.elements.hourlyEarnings.textContent = hourly.toFixed(8) + " XMR";
        this.elements.dailyEarnings.textContent = daily.toFixed(8) + " XMR";
        this.elements.weeklyEarnings.textContent = weekly.toFixed(8) + " XMR";
        this.elements.monthlyEarnings.textContent = monthly.toFixed(8) + " XMR";
    }

    addLog(message) {
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.innerHTML = message;
        
        this.elements.miningLog.appendChild(logEntry);
        this.elements.miningLog.scrollTop = this.elements.miningLog.scrollHeight;
        
        console.log("HobbitMiner UI: " + message);
    }

    getTranslation(key) {
        return this.translations[this.currentLanguage][key] || key;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded, starting Hobbit Miner...");
    window.realHobbitMinerApp = new RealHobbitMinerApp();
    window.realHobbitMinerApp.init();
});

setTimeout(() => {
    if (!window.realHobbitMinerApp) {
        console.log("Fallback initialization...");
        window.realHobbitMinerApp = new RealHobbitMinerApp();
        window.realHobbitMinerApp.init();
    }
}, 1000);
