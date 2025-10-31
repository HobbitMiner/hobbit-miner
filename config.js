// Crionic WebMiner Configuration
const CONFIG = {
    // Supported mining pools
    pools: [
        {
            name: "Aikapool",
            url: "stratum.aikapool.com:3939",
            type: "stratum",
            algorithm: "yespowerltncg"
        },
        {
            name: "Coin-Miners EU", 
            url: "eu.crionic.xyz:5555",
            type: "stratum",
            algorithm: "yespowerltncg"
        },
        {
            name: "Cryptoverse",
            url: "crn.cryptoverse.mining:5555", 
            type: "stratum",
            algorithm: "yespowerltncg"
        }
    ],
    
    // Default settings
    defaults: {
        threads: 2,
        intensity: 85,
        donation: 1.0,
        autoStart: false,
        enableLogging: true
    },
    
    // Mining parameters
    mining: {
        maxThreads: 8,
        batchSize: 1000,
        updateInterval: 2000,
        timeout: 30000
    },
    
    // Algorithm specific settings
    algorithm: {
        name: "yespowerltncg",
        version: 1.0,
        n: 2048,
        r: 8,
        key: "Litecoin Chain Games"
    }
};

// Load configuration from localStorage
function loadConfig() {
    const saved = localStorage.getItem('crionicMinerConfig');
    if (saved) {
        return {...CONFIG.defaults, ...JSON.parse(saved)};
    }
    return CONFIG.defaults;
}

// Save configuration to localStorage
function saveConfig(config) {
    localStorage.setItem('crionicMinerConfig', JSON.stringify(config));
}

// Validate wallet address format
function validateWallet(address) {
    // Basic CRNC wallet validation
    return address && address.length >= 30 && address.startsWith('CRNC');
}

// Get pool information by URL
function getPoolInfo(poolUrl) {
    return CONFIG.pools.find(pool => pool.url === poolUrl) || {
        name: "Custom Pool",
        url: poolUrl,
        type: "stratum",
        algorithm: "yespowerltncg"
    };
}

export { CONFIG, loadConfig, saveConfig, validateWallet, getPoolInfo };