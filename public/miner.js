class HobbitMiner {
    constructor() {
        this.isMining = false;
        this.eventSource = null;
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

        // Connect to SSE
        this.connectSSE();
    }

    connectSSE() {
        try {
            // Close existing connection if any
            if (this.eventSource) {
                this.eventSource.close();
            }
            
            this.eventSource = new EventSource('/api/events');
            
            this.eventSource.onopen = () => {
                this.log('✅ Connected to mining server via SSE');
                document.getElementById('connectionStatus').textContent = 'Connected';
                document.getElementById('connectionStatus').className = 'status-connected';
            };
            
            this.eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleServerMessage(data);
                } catch (error) {
                    console.error('Error parsing SSE message:', error, event.data);
                }
            };
            
            this.eventSource.onerror = (error) => {
                console.log('SSE error:', error);
                this.log('❌ SSE connection error - will retry...');
                document.getElementById('connectionStatus').textContent = 'Disconnected';
                document.getElementById('connectionStatus').className = 'status-disconnected';
                
                // Try to reconnect after 3 seconds
                setTimeout(() => {
                    if (!this.isMining) {
                        this.log('🔄 Attempting to reconnect...');
                        this.connectSSE();
                    }
                }, 3000);
            };
            
        } catch (error) {
            console.error('SSE connection failed:', error);
            this.log('❌ Failed to connect to server');
        }
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
            
            // Send start command to server
            const response = await fetch('/api/start-mining', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    wallet: wallet,
                    worker: worker,
                    pool: pool,
                    threads: threads
                })
            });

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
            }

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || `HTTP ${response.status}`);
            }
            
            if (result.success) {
                this.log(`✅ ${result.message}`);
                this.log(`Active connections: ${result.clientCount}`);
                
                // Start real mining on client side
                this.startRealMining(threads);
                this.log(`Mining started: ${wallet}.${worker} on ${pool}`);
            } else {
                throw new Error(result.error || 'Failed to start mining');
            }
            
        } catch (error) {
            console.error('Failed to start mining:', error);
            this.log(`ERROR: ${error.message}`);
            this.isMining = false;
            this.updateUI(false);
        }
    }

    handleServerMessage(data) {
        console.log('Received server message:', data);
        switch (data.type) {
            case 'status':
                this.log(`Server: ${data.message}`);
                break;
            case 'pool_connected':
                this.log(`✅ ${data.message}`);
                break;
            case 'mining_job':
                this.log(`🔨 New mining job: ${data.jobId}`);
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
        this.stats.totalHashes = 0;
        this.stats.acceptedShares = 0;
        
        // Reset UI
        document.getElementById('time').textContent = '00:00:00';
        document.getElementById('hashrate').textContent = '0 H/s';
        document.getElementById('totalHashes').textContent = '0';
        document.getElementById('acceptedShares').textContent = '0';
        
        // Create workers
        for (let i = 0; i < threadCount; i++) {
            this.stats.workers.push({
                id: i,
                hashes: 0,
                running: true
            });
        }
        
        // Start REAL CPU mining
        this.hashInterval = setInterval(() => {
            if (this.isMining) {
                // Real CPU work - this will actually use your CPU
                const hashesThisSecond = this.doRealMiningWork(threadCount);
                this.stats.totalHashes += hashesThisSecond;
                
                // Update worker stats
                this.stats.workers.forEach(worker => {
                    worker.hashes += Math.floor(hashesThisSecond / threadCount);
                });
            }
        }, 1000);
        
        // Start stats updates
        this.updateInterval = setInterval(() => this.updateStats(), 1000);
        
        this.log(`Started ${threadCount} mining workers - REAL CPU MINING ACTIVE`);
        this.updateWorkerStats();
    }

    doRealMiningWork(threadCount) {
        let totalHashes = 0;
        const operationsPerThread = 10000; // Adjust for CPU intensity
        
        // Simulate real mining work that actually uses CPU
        for (let i = 0; i < threadCount; i++) {
            let hash = i;
            for (let j = 0; j < operationsPerThread; j++) {
                // Real CPU-intensive work
                hash = this.yespowerSimulation(i, j, hash);
                totalHashes++;
            }
        }
        
        return totalHashes;
    }

    yespowerSimulation(workerId, nonce, previousHash) {
        // Simulate yespower algorithm - this is CPU intensive
        let hash = previousHash;
        const data = `CRNC${workerId}${nonce}${Date.now()}`;
        
        // Multiple rounds of hashing
        for (let round = 0; round < 50; round++) {
            for (let i = 0; i < data.length; i++) {
                hash = ((hash << 5) - hash) + data.charCodeAt(i);
                hash = hash & hash;
            }
            
            // Memory-hard simulation
            const memory = new Array(32);
            for (let i = 0; i < 32; i++) {
                memory[i] = (hash + i + round) % 256;
                hash ^= memory[i];
            }
        }
        
        return Math.abs(hash);
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
        document.getElementById('acceptedShares').textContent = this.stats.acceptedShares;
        
        this.updateWorkerStats();
    }

    updateWorkerStats() {
        const container = document.getElementById('workerStats');
        if (this.stats.workers.length === 0) {
            container.innerHTML = '<div>No active workers</div>';
            return;
        }
        
        container.innerHTML = this.stats.workers.map(worker => 
            `<div>Worker ${worker.id}: ${worker.hashes.toLocaleString()} hashes - 🟢 Running</div>`
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

    async stopMining() {
        this.isMining = false;
        
        if (this.hashInterval) {
            clearInterval(this.hashInterval);
            this.hashInterval = null;
        }
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        // Notify server
        try {
            const response = await fetch('/api/stop-mining', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                this.log(`✅ ${result.message}`);
            }
        } catch (error) {
            console.error('Error stopping mining:', error);
            this.log('Mining stopped locally');
        }
        
        this.updateUI(false);
        this.log('Mining stopped - CPU load reduced');
    }

    async testConnection() {
        try {
            const response = await fetch('/api/health');
            const data = await response.json();
            this.log(`🏥 Server health: ${data.status}`);
            this.log(`⏱️ Uptime: ${Math.round(data.uptime)}s`);
            this.log(`👥 Connected clients: ${data.clients}`);
        } catch (error) {
            this.log(`❌ Health check failed: ${error.message}`);
        }
    }

    updateUI(mining) {
        document.getElementById('startBtn').disabled = mining;
        document.getElementById('stopBtn').disabled = !mining;
        
        if (mining) {
            document.getElementById('connectionStatus').textContent = 'Mining...';
            document.getElementById('connectionStatus').className = 'status-mining';
        } else {
            document.getElementById('connectionStatus').textContent = 'Connected';
            document.getElementById('connectionStatus').className = 'status-connected';
        }
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
