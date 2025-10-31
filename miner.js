// Hobbit Miner - WebAssembly Cryptocurrency Miner
class HobbitMiner {
    constructor() {
        this.isRunning = false;
        this.threads = 0;
        this.hashrate = 0;
        this.totalHashes = 0;
        this.startTime = 0;
        this.workers = [];
        this.intensity = 50;
        this.currentPool = '';
        this.currentWallet = '';
    }

    async initialize(poolUrl, walletAddress, threadCount, intensity) {
        this.currentPool = poolUrl;
        this.currentWallet = walletAddress;
        this.threads = threadCount;
        this.intensity = intensity;
        
        this.addLog(`Initializing miner with ${threadCount} threads`);
        this.addLog(`Pool: ${poolUrl}`);
        this.addLog(`Wallet: ${walletAddress.substring(0, 15)}...`);
        this.addLog(`Intensity: ${intensity}%`);

        // Simulate WebAssembly module loading
        await this.loadWasmModule();
        
        return true;
    }

    async loadWasmModule() {
        // In a real implementation, this would load actual WebAssembly mining code
        // For demonstration, we simulate the loading process
        return new Promise((resolve) => {
            setTimeout(() => {
                this.addLog("WebAssembly mining module loaded successfully");
                resolve(true);
            }, 1000);
        });
    }

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.startTime = Date.now();
        this.totalHashes = 0;
        
        this.addLog("Starting mining process...");
        this.addLog(`Using ${this.threads} CPU threads`);

        // Create web workers for mining
        this.createWorkers();
        
        // Start statistics update
        this.statsInterval = setInterval(() => this.updateStats(), 1000);
    }

    createWorkers() {
        // Clear existing workers
        this.stopWorkers();

        const threadsPerWorker = Math.max(1, Math.floor(this.threads / 2));
        const workerCount = Math.min(2, this.threads); // Max 2 workers for browser stability

        for (let i = 0; i < workerCount; i++) {
            const workerCode = `
                self.addEventListener('message', function(e) {
                    const { intensity, workerId } = e.data;
                    let hashes = 0;
                    const startTime = Date.now();
                    
                    // Simulate mining work based on intensity
                    function mine() {
                        if (!e.data.running) return;
                        
                        // CPU-intensive mining simulation
                        let nonce = 0;
                        const target = Math.max(1000, 100000 * (intensity / 100));
                        
                        while (nonce < target && e.data.running) {
                            // Simulate hash calculation
                            const hash = CryptoJS.MD5(nonce + Math.random()).toString();
                            if (hash.substring(0, 2) === '00') {
                                self.postMessage({ 
                                    type: 'hashFound', 
                                    hash: hash,
                                    nonce: nonce 
                                });
                            }
                            nonce++;
                            hashes++;
                        }
                        
                        // Report hashrate every second
                        if (Date.now() - startTime >= 1000) {
                            self.postMessage({ 
                                type: 'stats', 
                                hashes: hashes,
                                workerId: workerId
                            });
                            hashes = 0;
                        }
                        
                        setTimeout(mine, 0);
                    }
                    
                    mine();
                });
            `;

            const blob = new Blob([workerCode], { type: 'application/javascript' });
            const worker = new Worker(URL.createObjectURL(blob));
            
            worker.onmessage = (e) => {
                this.handleWorkerMessage(e, i);
            };

            worker.postMessage({
                intensity: this.intensity,
                workerId: i,
                running: true
            });

            this.workers.push(worker);
        }
    }

    handleWorkerMessage(e, workerId) {
        const data = e.data;
        
        switch (data.type) {
            case 'stats':
                this.totalHashes += data.hashes;
                this.hashrate = this.totalHashes / ((Date.now() - this.startTime) / 1000);
                break;
                
            case 'hashFound':
                this.addLog(`Worker ${workerId + 1}: Found hash ${data.hash.substring(0, 16)}...`);
                this.submitShare(data.hash, data.nonce);
                break;
        }
    }

    submitShare(hash, nonce) {
        // Simulate share submission to pool
        const shareValue = 0.0000001 * (this.intensity / 100);
        if (typeof window.updateMined !== 'undefined') {
            window.updateMined(shareValue);
        }
        
        this.addLog(`Share submitted to pool - Value: ${shareValue.toFixed(8)}`);
    }

    updateStats() {
        if (!this.isRunning) return;

        const currentTime = Date.now();
        const elapsed = (currentTime - this.startTime) / 1000;
        
        if (elapsed > 0) {
            this.hashrate = this.totalHashes / elapsed;
        }

        // Update UI if update function exists
        if (typeof window.updateMinerStats !== 'undefined') {
            window.updateMinerStats({
                hashrate: this.hashrate,
                threads: this.threads,
                totalHashes: this.totalHashes,
                cpuUsage: this.intensity
            });
        }
    }

    stop() {
        this.isRunning = false;
        this.addLog("Stopping mining process...");
        
        clearInterval(this.statsInterval);
        this.stopWorkers();
        
        this.hashrate = 0;
    }

    stopWorkers() {
        this.workers.forEach(worker => {
            worker.terminate();
        });
        this.workers = [];
    }

    setIntensity(intensity) {
        this.intensity = Math.max(10, Math.min(100, intensity));
        this.addLog(`Mining intensity set to ${this.intensity}%`);
        
        if (this.isRunning) {
            this.stop();
            setTimeout(() => this.start(), 100);
        }
    }

    addLog(message) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${message}`;
        
        // Update UI log if function exists
        if (typeof window.addMiningLog !== 'undefined') {
            window.addMiningLog(logEntry);
        }
        
        console.log(`HobbitMiner: ${logEntry}`);
    }

    getStats() {
        return {
            isRunning: this.isRunning,
            hashrate: this.hashrate,
            threads: this.threads,
            totalHashes: this.totalHashes,
            intensity: this.intensity,
            pool: this.currentPool,
            wallet: this.currentWallet
        };
    }
}

// Initialize global miner instance
window.hobbitMiner = new HobbitMiner();

// Include CryptoJS for hashing (in real implementation, this would be WebAssembly)
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js';
document.head.appendChild(script);
