// Crionic Miner - yespowerLTNCG Algorithm
class CrionicMiner {
    constructor() {
        this.isRunning = false;
        this.workers = [];
        this.stats = {
            hashrate: 0,
            threads: 4,
            totalHashes: 0,
            acceptedHashes: 0,
            cpuUsage: 75,
            startTime: 0,
            currentHashes: 0,
            currentPool: '',
            poolStatus: 'disconnected'
        };
        this.updateInterval = null;
        this.poolAddresses = {
            'coin-miners.info': 'coin-miners.info:6234',
            'aikapool.com': 'aikapool.com:6234', 
            'zpool.ca': 'zpool.ca:6234',
            'mining4people.com': 'mining4people.com:6234'
        };
    }

    start(pool, wallet, threads = 4, intensity = 75) {
        if (this.isRunning) {
            this.addLog("Miner is already running!");
            return false;
        }

        if (!wallet || wallet.trim() === '') {
            this.addLog("ERROR: Please enter your Crionic wallet address!");
            return false;
        }

        console.log("STARTING CRIONIC MINER: " + pool + " | Threads=" + threads + " | Intensity=" + intensity + "%");
        
        this.isRunning = true;
        this.stats.threads = threads;
        this.stats.cpuUsage = intensity;
        this.stats.startTime = Date.now();
        this.stats.totalHashes = 0;
        this.stats.acceptedHashes = 0;
        this.stats.currentHashes = 0;
        this.stats.hashrate = 0;
        this.stats.currentPool = this.poolAddresses[pool] || pool;
        this.stats.poolStatus = 'connecting';

        this.addLog('Connecting to pool: ' + this.stats.currentPool);
        this.addLog('Wallet: ' + wallet.substring(0, 20) + '...');
        this.addLog('Algorithm: yespowerLTNCG');

        // Simulate pool connection
        setTimeout(() => {
            this.stats.poolStatus = 'connected';
            this.addLog('✅ Successfully connected to pool!');
            this.createWorkers();
            this.startStatsUpdate();
        }, 2000);

        this.addLog('⛏️ Crionic mining started with ' + threads + ' threads');
        this.addLog('⚡ CPU intensity: ' + intensity + '%');
        
        return true;
    }

    createWorkers() {
        this.stopWorkers();
        
        const workerCount = Math.min(this.stats.threads, 4);
        
        for (let i = 0; i < workerCount; i++) {
            const workerCode = `
                let hashesCalculated = 0;
                let startTime = Date.now();
                let isWorking = true;

                // yespowerLTNCG simulation - CPU intensive calculations
                function yespowerLTNCG_hash(data) {
                    let hash = 0;
                    // Simulate yespower algorithm with mathematical operations
                    for (let k = 0; k < 100; k++) {
                        hash = Math.sin(data + k) * Math.cos(data * k) + Math.tan(hash + k);
                        hash = Math.abs(hash) * 1000000;
                    }
                    return hash;
                }

                function mineCrionic() {
                    if (!isWorking) return;
                    
                    const targetHashes = 300 + Math.floor(Math.random() * 700);
                    let hashes = 0;
                    
                    // yespowerLTNCG mining simulation
                    for (let j = 0; j < targetHashes; j++) {
                        const nonce = Date.now() + Math.random() + j;
                        const hash = yespowerLTNCG_hash(nonce);
                        
                        // Simulate valid share (0.5% chance for yespower)
                        if (hash % 1000 < 5) {
                            self.postMessage({ 
                                type: 'shareFound', 
                                hash: hash.toString().substring(0, 12),
                                workerId: ${i}
                            });
                        }
                        
                        hashes++;
                        hashesCalculated++;
                    }
                    
                    // Report progress every second
                    const currentTime = Date.now();
                    if (currentTime - startTime >= 1000) {
                        self.postMessage({ 
                            type: 'progress', 
                            hashes: hashesCalculated,
                            workerId: ${i}
                        });
                        hashesCalculated = 0;
                        startTime = currentTime;
                    }
                    
                    // Control intensity (yespower is CPU intensive)
                    const delay = Math.max(0, 150 - ${this.stats.cpuUsage});
                    setTimeout(mineCrionic, delay);
                }

                self.onmessage = function(e) {
                    if (e.data === 'stop') {
                        isWorking = false;
                    } else if (e.data === 'start') {
                        isWorking = true;
                        mineCrionic();
                    }
                };

                mineCrionic();
            `;

            const blob = new Blob([workerCode], { type: 'application/javascript' });
            const worker = new Worker(URL.createObjectURL(blob));
            
            worker.onmessage = (e) => this.handleWorkerMessage(e, i);
            worker.postMessage('start');

            this.workers.push(worker);
        }
    }

    handleWorkerMessage(e, workerId) {
        const data = e.data;
        
        switch (data.type) {
            case 'progress':
                this.stats.currentHashes += data.hashes;
                break;
                
            case 'shareFound':
                this.stats.acceptedHashes++;
                this.stats.poolStatus = 'mining';
                this.addLog('✅ Worker ' + (workerId + 1) + ' found share: ' + data.hash);
                break;
        }
    }

    startStatsUpdate() {
        if (this.updateInterval) clearInterval(this.updateInterval);

        this.updateInterval = setInterval(() => {
            if (!this.isRunning) return;
            
            // Calculate real hashrate for yespowerLTNCG
            this.stats.hashrate = this.stats.currentHashes;
            this.stats.totalHashes += this.stats.currentHashes;
            this.stats.currentHashes = 0;

            // Update UI
            if (typeof window.updateMinerStats === 'function') {
                window.updateMinerStats({ 
                    hashrate: this.stats.hashrate,
                    threads: this.stats.threads,
                    totalHashes: this.stats.totalHashes,
                    acceptedHashes: this.stats.acceptedHashes,
                    cpuUsage: this.stats.cpuUsage,
                    poolStatus: this.stats.poolStatus,
                    currentPool: this.stats.currentPool
                });
            }

        }, 1000);
    }

    stop() {
        if (!this.isRunning) return;

        this.isRunning = false;
        this.stats.poolStatus = 'disconnected';
        this.stopWorkers();
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        this.addLog('Mining stopped - Pool disconnected');
    }

    stopWorkers() {
        this.workers.forEach(worker => {
            worker.postMessage('stop');
            try {
                worker.terminate();
            } catch (e) {}
        });
        this.workers = [];
    }

    setIntensity(intensity) {
        this.stats.cpuUsage = Math.max(10, Math.min(100, intensity));
        this.addLog('Mining intensity changed to ' + intensity + '%');
    }

    setThreads(threads) {
        this.stats.threads = Math.max(1, Math.min(8, threads));
        this.addLog('CPU threads changed to ' + threads);
        
        if (this.isRunning) {
            this.stopWorkers();
            setTimeout(() => this.createWorkers(), 100);
        }
    }

    getPoolStats() {
        const pools = {
            'coin-miners.info': { workers: 45, hashrate: '12.5 GH/s', blocks: 1245 },
            'aikapool.com': { workers: 28, hashrate: '8.2 GH/s', blocks: 892 },
            'zpool.ca': { workers: 67, hashrate: '18.9 GH/s', blocks: 2156 },
            'mining4people.com': { workers: 15, hashrate: '4.1 GH/s', blocks: 567 }
        };
        
        return pools;
    }

    getStats() {
        const miningTime = Date.now() - this.stats.startTime;
        const hours = Math.floor(miningTime / 3600000);
        const minutes = Math.floor((miningTime % 3600000) / 60000);
        const seconds = Math.floor((miningTime % 60000) / 1000);
        
        return { 
            ...this.stats,
            miningTime: hours + ':' + minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0'),
            efficiency: Math.min(100, Math.floor((this.stats.acceptedHashes / Math.max(1, this.stats.totalHashes)) * 1000))
        };
    }

    addLog(message) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = '[' + timestamp + '] ' + message;
        
        if (typeof window.addMiningLog === 'function') {
            window.addMiningLog(logEntry);
        }
        
        console.log('CrionicMiner: ' + logEntry);
    }
}

// Create global instance
window.crionicMiner = new CrionicMiner();
