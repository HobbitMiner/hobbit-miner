// Language translations
const translations = {
    en: {
        title: "Hobbit Miner",
        cryptoLabel: "Select Cryptocurrency:",
        threadLabel: "CPU Threads:",
        poolLabel: "Mining Pool:",
        walletLabel: "Wallet Address:",
        startBtn: "Start Mining",
        stopBtn: "Stop Mining",
        hashrateTitle: "Hashrate",
        threadsTitle: "Active Threads",
        minedTitle: "Total Mined",
        statusTitle: "Mining Status",
        statusIdle: "Ready to start mining",
        statusMining: "Mining in progress...",
        statusError: "Mining error occurred",
        footerText: "Hobbit Miner - Open Source Browser Mining Tool"
    },
    sk: {
        title: "Hobbit Miner",
        cryptoLabel: "Vyberte kryptomenu:",
        threadLabel: "CPU Vlákna:",
        poolLabel: "Ťažobný pool:",
        walletLabel: "Adresa peňaženky:",
        startBtn: "Začať ťažiť",
        stopBtn: "Zastaviť ťažbu",
        hashrateTitle: "Hashrate",
        threadsTitle: "Aktívne vlákna",
        minedTitle: "Celkovo vytŕžené",
        statusTitle: "Stav ťažby",
        statusIdle: "Pripravené na začatie ťažby",
        statusMining: "Prebieha ťažba...",
        statusError: "Nastala chyba pri ťažbe",
        footerText: "Hobbit Miner - Open Source Webový Ťažobný Nástroj"
    },
    ru: {
        title: "Hobbit Miner",
        cryptoLabel: "Выберите криптовалюту:",
        threadLabel: "Потоки CPU:",
        poolLabel: "Майнинг пул:",
        walletLabel: "Адрес кошелька:",
        startBtn: "Начать майнинг",
        stopBtn: "Остановить майнинг",
        hashrateTitle: "Хешрейт",
        threadsTitle: "Активные потоки",
        minedTitle: "Всего добыто",
        statusTitle: "Статус майнинга",
        statusIdle: "Готов к началу майнинга",
        statusMining: "Майнинг в процессе...",
        statusError: "Произошла ошибка майнинга",
        footerText: "Hobbit Miner - Майнинг инструмент с открытым исходным кодом"
    }
};

// Current language
let currentLanguage = 'en';

// DOM Elements
const elements = {
    title: document.getElementById('title'),
    cryptoLabel: document.getElementById('crypto-label'),
    threadLabel: document.getElementById('thread-label'),
    poolLabel: document.getElementById('pool-label'),
    walletLabel: document.getElementById('wallet-label'),
    startBtn: document.getElementById('start-btn'),
    stopBtn: document.getElementById('stop-btn'),
    hashrateTitle: document.getElementById('hashrate-title'),
    threadsTitle: document.getElementById('threads-title'),
    minedTitle: document.getElementById('mined-title'),
    statusTitle: document.getElementById('status-title'),
    statusText: document.getElementById('status-text'),
    footerText: document.getElementById('footer-text'),
    threadValue: document.getElementById('thread-value'),
    threadSlider: document.getElementById('thread-slider'),
    hashrateValue: document.getElementById('hashrate-value'),
    threadsValue: document.getElementById('threads-value'),
    minedValue: document.getElementById('mined-value')
};

// Language buttons
const langButtons = {
    'lang-en': document.getElementById('lang-en'),
    'lang-sk': document.getElementById('lang-sk'),
    'lang-ru': document.getElementById('lang-ru')
};

// Initialize language
function initLanguage() {
    // Set initial language
    updateLanguage(currentLanguage);
    
    // Add event listeners for language buttons
    Object.keys(langButtons).forEach(langId => {
        langButtons[langId].addEventListener('click', () => {
            const lang = langId.split('-')[1];
            setLanguage(lang);
        });
    });
}

// Set language
function setLanguage(lang) {
    currentLanguage = lang;
    updateLanguage(lang);
    
    // Update active button
    Object.keys(langButtons).forEach(langId => {
        const button = langButtons[langId];
        if (langId === `lang-${lang}`) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// Update UI with current language
function updateLanguage(lang) {
    const t = translations[lang];
    
    elements.title.textContent = t.title;
    elements.cryptoLabel.textContent = t.cryptoLabel;
    elements.threadLabel.textContent = t.threadLabel;
    elements.poolLabel.textContent = t.poolLabel;
    elements.walletLabel.textContent = t.walletLabel;
    elements.startBtn.textContent = t.startBtn;
    elements.stopBtn.textContent = t.stopBtn;
    elements.hashrateTitle.textContent = t.hashrateTitle;
    elements.threadsTitle.textContent = t.threadsTitle;
    elements.minedTitle.textContent = t.minedTitle;
    elements.statusTitle.textContent = t.statusTitle;
    elements.footerText.textContent = t.footerText;
    
    // Update status text if not mining
    if (!window.isMining) {
        elements.statusText.textContent = t.statusIdle;
        elements.statusText.className = 'status-text status-idle';
    }
}

// Mining state
window.isMining = false;
let miningStats = {
    hashrate: 0,
    threads: 0,
    mined: 0
};

// Initialize app
function initApp() {
    initLanguage();
    
    // Thread slider
    elements.threadSlider.addEventListener('input', (e) => {
        elements.threadValue.textContent = e.target.value;
    });
    
    // Start mining button
    elements.startBtn.addEventListener('click', startMining);
    
    // Stop mining button
    elements.stopBtn.addEventListener('click', stopMining);
    
    // Initialize stats
    updateStats();
}

// Start mining
function startMining() {
    const wallet = document.getElementById('wallet-input').value.trim();
    const pool = document.getElementById('pool-input').value.trim();
    const threads = parseInt(elements.threadSlider.value);
    const crypto = document.getElementById('crypto-select').value;
    
    if (!wallet) {
        alert(getTranslation('walletWarning'));
        return;
    }
    
    if (!pool) {
        alert(getTranslation('poolWarning'));
        return;
    }
    
    // Update UI
    window.isMining = true;
    elements.startBtn.disabled = true;
    elements.stopBtn.disabled = false;
    elements.statusText.textContent = translations[currentLanguage].statusMining;
    elements.statusText.className = 'status-text status-mining';
    
    // Start simulated mining (in a real implementation, this would connect to WebAssembly miner)
    startSimulatedMining(threads);
}

// Stop mining
function stopMining() {
    window.isMining = false;
    elements.startBtn.disabled = false;
    elements.stopBtn.disabled = true;
    elements.statusText.textContent = translations[currentLanguage].statusIdle;
    elements.statusText.className = 'status-text status-idle';
    
    // Stop simulated mining
    stopSimulatedMining();
}

// Simulated mining (replace with actual WebAssembly implementation)
let miningInterval;
function startSimulatedMining(threads) {
    miningStats.threads = threads;
    miningStats.hashrate = threads * 15; // Simulated hashrate
    
    miningInterval = setInterval(() => {
        if (window.isMining) {
            // Simulate mining progress
            miningStats.mined += 0.000001;
            miningStats.hashrate = threads * 15 + Math.random() * 10;
            
            updateStats();
        }
    }, 1000);
}

function stopSimulatedMining() {
    if (miningInterval) {
        clearInterval(miningInterval);
        miningInterval = null;
    }
    
    miningStats.hashrate = 0;
    miningStats.threads = 0;
    updateStats();
}

// Update statistics display
function updateStats() {
    elements.hashrateValue.textContent = `${miningStats.hashrate.toFixed(2)} H/s`;
    elements.threadsValue.textContent = miningStats.threads;
    elements.minedValue.textContent = miningStats.mined.toFixed(6);
}

// Get translation for current language
function getTranslation(key) {
    return translations[currentLanguage][key] || key;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);