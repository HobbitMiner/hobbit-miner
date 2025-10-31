// Hobbit Miner - Main Application with Real Mining
class RealHobbitMinerApp {
    constructor() {
        this.currentLanguage = 'en';
        this.isMining = false;
        this.miningStats = {
            hashrate: 0,
            threads: 0,
            mined: 0,
            cpuUsage: 0,
            totalHashes: 0,
            acceptedHashes: 0
        };
        
        this.translations = {
            en: {
                title: "Hobbit Miner",
                cryptoLabel: "Select Cryptocurrency:",
                threadLabel: "CPU Threads:",
                intensityLabel: "Mining Intensity:",
                walletLabel: "Your Wallet Address:",
                startBtn: "Start Real Mining",
                stopBtn: "Stop Mining",
                withdrawBtn: "Check Balance",
                hashrateTitle: "Hashrate",
                threadsTitle: "Active Threads",
                minedTitle: "Total Mined",
                cpuTitle: "CPU Usage",
                statusTitle: "Mining Status",
                statusIdle: "Ready to start real mining",
                statusMining: "Real mining in progress...",
                statusError: "Mining error occurred",
                footerText: "Hobbit Miner - Real Browser Mining | Open Source | No Data Collection",
                walletWarning: "Please enter your Monero wallet address",
                walletHelp: "We recommend: 48edfHu7V9Z84YzzMa6fUueoELZ9ZRXq9VetWzYGzKt52XU5xvqgzYnDK9URnRoJMk1j8nLwEVsaSWJ4fhdUyZijBGUicoD",
                earningsTitle: "Estimated Earnings"
            },
            sk: {
                title: "Hobbit Miner",
                cryptoLabel: "Vyberte kryptomenu:",
                threadLabel: "CPU Vlákna:",
                intensityLabel: "Intenzita ťažby:",
                walletLabel: "Vaša adresa peňaženky:",
                startBtn: "Spustiť reálnu ťažbu",
                stopBtn: "Zastaviť ťažbu",
                withdrawBtn: "Skontrolovať zostatok",
                hashrateTitle: "Hashrate",
                threadsTitle: "Aktívne vlákna",
                minedTitle: "Celkovo vytŕžené",
                cpuTitle: "Využitie CPU",
                statusTitle: "Stav ťažby",
                statusIdle: "Pripravené na reálnu ťažbu",
                statusMining: "Prebieha reálna ťažba...",
                statusError: "Nastala chyba pri ťažbe",
                footerText: "Hobbit Miner - Reálna webová ťažba | Open Source | Žiadne zbieranie údajov",
                walletWarning: "Zadajte adresu svojej Monero peňaženky",
                walletHelp: "Odporúčame: 48edfHu7V9Z84YzzMa6fUueoELZ9ZRXq9VetWzYGzKt52XU5xvqgzYnDK9URnRoJMk1j8nLwEVsaSWJ4fhdUyZijBGUicoD",
                earningsTitle: "Odhadovaný zárobok"
            },
            ru: {
                title: "Hobbit Miner",
                cryptoLabel: "Выберите криптовалюту:",
                threadLabel: "Потоки CPU:",
                intensityLabel: "Интенсивность майнинга:",
                walletLabel: "Адрес вашего кошелька:",
                startBtn: "Начать реальный майнинг",
                stopBtn: "Остановить майнинг",
                withdrawBtn: "Проверить баланс",
                hashrateTitle: "Хешрейт",
                threadsTitle: "Активные потоки",
                minedTitle: "Всего добыто",
                cpuTitle: "Использование CPU",
                statusTitle: "Статус майнинга",
                statusIdle: "Готов к началу реального майнинга",
                statusMining: "Реальный майнинг в процессе...",
                statusError: "Произошла ошибка майнинга",
                footerText: "Hobbit Miner - Реальный браузерный майнинг | Открытый исходный код | Сбор данных отсутствует",
                walletWarning: "Введите адрес вашего Monero кошелька",
                walletHelp: "Рекомендуем: 48edfHu7V9Z84YzzMa6fUueoELZ9ZRXq9VetWzYGzKt52XU5xvqgzYnDK9URnRoJMk1j8nLwEVsaSWJ4fhdUyZijBGUicoD",
                earningsTitle: "Расчетный заработок"
            }
        };
    }

    init() {
        this.cacheDomElements();
        this.initLanguage();
        this.initEventListeners();
        this.initMinerConnection();
        this.updateDisplay();
        
        console.log("Hobbit Miner with Real Mining initialized successfully");
    }

    cacheDomElements() {
        this.elements = {
            // Text elements
            title: document.getElementById('title'),
            cryptoLabel: document.getElementById('crypto-label'),
            threadLabel: document.getElementById('thread-label'),
            intensityLabel: document.getElementById('intensity-label'),
            walletLabel: document.getElementById('wallet-label'),
            startBtn: document.getElementById('start-btn'),
            stopBtn: document.getElementById('stop-btn'),
            withdrawBtn: document.getElementById('withdraw-btn'),
            hashrateTitle: document.getElementById('hashrate-title'),
            threadsTitle: document.getElementById('threads-title'),
            minedTitle: document.getElementById('mined-title'),
            cpuTitle: document.getElementById('cpu-title'),
            statusTitle: document.getElementById('status-title'),
            statusText: document.getElementById('status-text'),
            footerText: document.getElementById('footer-text'),
            walletHelp: document.getElementById('wallet-help'),
            
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
            walletInput: document.getElementById('wallet-input'),
            cryptoSelect: document.getElementById('crypto-select'),
            
            // Progress and log
            progressFill: document.getElementById('progress-fill'),
            miningLog: document.getElementById('mining-log'),
            
            // Earnings
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
        this.elements.withdrawBtn.textContent = t.withdrawBtn;
        this.elements.hashrateTitle.textContent = t.hashrateTitle;
        this.elements.threadsTitle.textContent = t.threadsTitle;
        this.elements.minedTitle.textContent = t.minedTitle;
        this.elements.cpuTitle.textContent = t.cpuTitle;
        this.elements.statusTitle.textContent = t.statusTitle;
        this.elements.footerText.textContent = t.footerText;
        this.elements.walletHelp.textContent = t.walletHelp;
        
        // Update earnings title
        document.querySelector('.earnings-container h3').textContent = t.earningsTitle;
        
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
            if (window.realHobbitMiner) {
                window.realHobbitMiner.setThreads(threads);
            }
        });
        
        // Intensity slider
        this.elements.intensitySlider.addEventListener('input', (e) => {
            const intensity = parseInt(e.target.value);
            this.elements.intensityValue.textContent = intensity;
            if (window.realHobbitMiner) {
                window.realHobbitMiner.setIntensity(intensity);
            }
        });
        
        // Start/Stop buttons
        this.elements.startBtn.addEventListener('click', () => this.startRealMining());
        this.elements.stopBtn.addEventListener('click', () => this.stopRealMining());
        this.elements.withdrawBtn.addEventListener('click', () => this.checkBalance());
    }

    initMinerConnection() {
        // Make miner functions available globally
        window.updateRealMinerStats = (stats) => this.updateRealMinerStats(stats);
        window.addRealMiningLog = (message) => this.addRealMiningLog(message);
    }

    async startRealMining() {
        const wallet = this.elements.walletInput.value.trim();
        const threads = parseInt(this.elements.threadSlider.value);
        const intensity = parseInt(this.elements.intensitySlider.value);
        const crypto = this.elements.cryptoSelect.value;

        if (!wallet) {
            alert(this.translations[this.currentLanguage].walletWarning);
            return;
        }

        try {
            this.addRealMiningLog("🔄 Starting real mining process...");
            
            // Initialize real miner
            await window.realHobbitMiner.initialize(wallet, threads, intensity);
            
            // Start mining
            window.realHobbitMiner.start();
            this.isMining = true;
            
            // Update UI
            this.elements.startBtn.disabled = true;
            this.elements.stopBtn.disabled = false;
            this.elements.statusText.textContent = this.translations[this.currentLanguage].statusMining;
            this.elements.statusText.className = 'status-text status-mining';
            
            // Start earnings calculation
            this.startEarningsCalculation();
            
        } catch (error) {
            this.addRealMiningLog(`❌ Error starting real miner: ${error.message}`);
            this.elements.statusText.textContent = this.translations[this.currentLanguage].statusError;
            this.elements.statusText.className = 'status-text status-error';
        }
    }

    stopRealMining() {
        if (window.realHobbitMiner) {
            window.realHobbitMiner.stop();
        }
        
        this.isMining = false;
        this.elements.startBtn.disabled = false;
        this.elements.stopBtn.disabled = true;
        this.elements.statusText.textContent = this.translations[this.currentLanguage].statusIdle;
        this.elements.statusText.className = 'status-text status-idle';
        
        this.addRealMiningLog("🛑 Real mining stopped");
    }

    checkBalance() {
        const wallet = this.elements.walletInput.value.trim();
        if (!wallet) {
            alert(this.translations[this.currentLanguage].walletWarning);
            return;
        }

        if (window.realHobbitMiner) {
            window.realHobbitMiner.checkBalance(wallet);
        }
    }

    updateRealMinerStats(stats) {
        this.miningStats = { ...this.miningStats, ...stats };
        this.updateDisplay();
    }

    updateDisplay() {
        // Update statistics with real data
        this.elements.hashrateValue.textContent = `${this.miningStats.hashrate.toFixed(2)} H/s`;
        this.elements.threadsValue.textContent = this.miningStats.threads;
        this.elements.minedValue.textContent = `${this.miningStats.mined.toFixed(8)} XMR`;
        this.elements.cpuValue.textContent = `${this.miningStats.cpuUsage}%`;
        
        // Update progress bar based on CPU usage
        this.elements.progressFill.style.width = `${this.miningStats.cpuUsage}%`;
        
        // Update earnings display
        this.updateEarningsDisplay();
    }

    updateEarningsDisplay() {
        const hourly = this.miningStats.mined / (this.miningStats.totalHashes > 0 ? 1 : 1) * 3600;
        const daily = hourly * 24;
        const weekly = daily * 7;
        const monthly = daily * 30;

        this.elements.hourlyEarnings.textContent = `${hourly.toFixed(8)} XMR`;
        this.elements.dailyEarnings.textContent = `${daily.toFixed(8)} XMR`;
        this.elements.weeklyEarnings.textContent = `${weekly.toFixed(8)} XMR`;
        this.elements.monthlyEarnings.textContent = `${monthly.toFixed(8)} XMR`;
    }

    startEarningsCalculation() {
        // Earnings are calculated in real-time based on actual mining performance
        setInterval(() => {
            if (this.isMining) {
                this.updateEarningsDisplay();
            }
        }, 5000);
    }

    addRealMiningLog(message) {
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.innerHTML = message; // Using innerHTML to support emojis
        
        this.elements.miningLog.appendChild(logEntry);
        this.elements.miningLog.scrollTop = this.elements.miningLog.scrollHeight;
    }

    getTranslation(key) {
        return this.translations[this.currentLanguage][key] || key;
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.realHobbitMinerApp = new RealHobbitMinerApp();
    window.realHobbitMinerApp.init();
});
