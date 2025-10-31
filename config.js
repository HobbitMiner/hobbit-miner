// Hobbit Miner Configuration
const CONFIG = {
    pools: [
        {
            name: "Aikapool",
            url: "stratum.aikapool.com:3939",
            algorithm: "yespowerltncg"
        },
        {
            name: "Coin-Miners EU", 
            url: "eu.crionic.xyz:5555",
            algorithm: "yespowerltncg"
        }
    ],
    
    defaults: {
        threads: 2,
        intensity: 85
    }
};

// Validate CRNC wallet address
function validateWallet(address) {
    return address && address.length >= 30 && address.startsWith('CRNC');
}

// Get pool info
function getPoolInfo(poolUrl) {
    return CONFIG.pools.find(pool => pool.url === poolUrl) || {
        name: "Custom Pool",
        url: poolUrl,
        algorithm: "yespowerltncg"
    };
}