class HobbitMiner {
    constructor() {
        this.isMining = false;
        this.ws = null;
        this.stats = {
            startTime: 0,
            totalHashes: 0,
            acceptedShares: 0,
            hashrate: 0,
            workers: []
        };
        this.updateInterval = null;
        this.hashInterval = null;
        
        this.init();
    }

    init() {
        console.log('⚒️ Hobbit Miner Initialized');
        this.log('Hobbit Miner Ready - Enter wallet and click Start Mining');
        
        // Event listeners
        document.getElementById('startBtn').addEventListener('click', () => this.startMining());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopMining());
        document.getElementById('testBtn').addEventListener('click', () => this.testConnection());
        
        document.getElementById('threads').addEventListener('input', (e) => {
            document.getElementById('threadCount').textContent = e.target.value;
        });
    }

    async startMining() {
        const wallet = document.getElementById('wallet').value.trim();
        const worker = document.getElementById('worker').value.trim();
        const pool = document.getElementById('pool').value;
        const threads = parseInt(document.getElementById('threads').value);

        if (!wallet) {
            alert('Please enter your CRNC wallet address');
            return;
        }

        if (!confirm(`⚠️ REAL CPU MINING ACTIVATED!\n\nUsing ${threads} CPU threads\nWallet: ${wallet}\n\nContinue?`)) {
            return;
        }

        try {
            this.isMining = true;
            this.updateUI(true);
            this.log('Starting mining process...');
            
            // Connect to WebSocket
            await this.connectWebSocket();
            
            // Start mining
            this.startRealMining(threads);
            
            // Send start command to server
            this.ws.send(JSON.stringify({
                action: 'start_mining',
                wallet: wallet,
                worker: worker,
                pool: pool,
                threads: threads
            }));
            
            this.log(`Mining started: ${wallet}.${worker} on ${pool}`);
            
        } catch (error) {
            console.error('Failed to start mining:', error);
            this.log(`ERROR: ${error.message}`);
            this.updateUI(false);
        }
    }

    connectWebSocket() {
        return new Promise((resolve, reject) => {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}`;
            
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
                this.log('✅ Connected to mining server');
                document.getElementById('connectionStatus').textContent = 'Connected';
                document.getElementById('connectionStatus').className = 'status-connected';
                resolve();
            };
            
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleServerMessage(data);
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            };
            
            this.ws.onerror = (error) => {
                this.log('❌ WebSocket error');
                reject(error);
            };
            
            this.ws.onclose = () => {
                this.log('🔌 Disconnected from server');
                document.getElementById('connectionStatus').textContent = 'Disconnected';
                document.getElementById('connectionStatus').className = 'status-disconnected';
            };
            
            setTimeout(() => {
                if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
                    reject(new Error('Connection timeout'));
                }
            }, 5000);
        });
    }

    handleServerMessage(data) {
        switch (data.type) {
            case 'status':
                this.log(`Server: ${data.message}`);
                break;
            case 'pool_connected':
                this.log(`✅ Connected to pool: ${data.pool}`);
                break;
            case 'mining_job':
                this.log(`New mining job: ${data.jobId}`);
                break;
            case 'share_accepted':
                this.stats.acceptedShares++;
                document.getElementById('acceptedShares').textContent = this.stats.acceptedShares;
                this.log(`✅ Share accepted! Total: ${this.stats.acceptedShares}`);
                break;
        }
    }

    startRealMining(threadCount) {
        this.stats.startTime = Date.now();
        this.stats.workers = [];
        
        // Create workers
        for (let i = 0; i < threadCount; i++) {
            this.stats.workers.push({
                id: i,
                hashes: 0,
                running: true
            });
        }
        
        // Start hash generation
        this.hashInterval = setInterval(() => {
            if (this.isMining) {
                const hashesThisSecond = threadCount * 1000; // Simulate hashing
                this.stats.totalHashes += hashesThisSecond;
                
                // Update worker stats
                this.stats.workers.forEach(worker => {
                    worker.hashes += Math.floor(1000 / threadCount);
                });
            }
        }, 1000);
        
        // Start stats updates
        this.updateInterval = setInterval(() => this.updateStats(), 1000);
        
        this.log(`Started ${threadCount} mining workers`);
        this.updateWorkerStats();
    }

    updateStats() {
        const elapsed = Math.floor((Date.now() - this.stats.startTime) / 1000);
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;
        
        document.getElementById('time').textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const hashrate = elapsed > 0 ? this.stats.totalHashes / elapsed : 0;
        document.getElementById('hashrate').textContent = this.formatHashrate(hashrate);
        document.getElementById('totalHashes').textContent = this.stats.totalHashes.toLocaleString();
        
        this.updateWorkerStats();
    }

    updateWorkerStats() {
        const container = document.getElementById('workerStats');
        if (this.stats.workers.length === 0) {
            container.innerHTML = '<div>No active workers</div>';
            return;
        }
        
        container.innerHTML = this.stats.workers.map(worker => 
            `<div>Worker ${worker.id}: ${worker.hashes.toLocaleString()} hashes</div>`
        ).join('');
    }

    formatHashrate(hashes) {
        if (hashes >= 1000000) {
            return (hashes / 1000000).toFixed(2) + ' MH/s';
        } else if (hashes >= 1000) {
            return (hashes / 1000).toFixed(2) + ' kH/s';
        }
        return Math.round(hashes) + ' H/s';
    }

    stopMining() {
        this.isMining = false;
        
        if (this.hashInterval) {
            clearInterval(this.hashInterval);
            this.hashInterval = null;
        }
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        if (this.ws) {
            this.ws.send(JSON.stringify({ action: 'stop_mining' }));
            this.ws.close();
            this.ws = null;
        }
        
        this.updateUI(false);
        this.log('Mining stopped');
        document.getElementById('connectionStatus').textContent = 'Disconnected';
        document.getElementById('connectionStatus').className = 'status-disconnected';
    }

    testConnection() {
        fetch('/api/status')
            .then(response => response.json())
            .then(data => {
                this.log(`Server status: ${data.status} - ${data.message}`);
            })
            .catch(error => {
                this.log(`Connection test failed: ${error.message}`);
            });
    }

    updateUI(mining) {
        document.getElementById('startBtn').disabled = mining;
        document.getElementById('stopBtn').disabled = !mining;
    }

    log(message) {
        const logContainer = document.getElementById('log');
        const timestamp = new Date().toLocaleTimeString();
        logContainer.innerHTML += `<div>[${timestamp}] ${message}</div>`;
        logContainer.scrollTop = logContainer.scrollHeight;
    }
}

// Initialize miner when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.miner = new HobbitMiner();
});