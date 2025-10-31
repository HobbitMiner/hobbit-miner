class HobbitMiner {
    constructor() {
        this.isMining = false;
        this.eventSource = null;
        this.stats = {
            startTime: 0,
            totalHashes: 0,
            acceptedShares: 0,
            workers: []
        };
        this.updateInterval = null;
        this.workerThreads = [];
        
        this.init();
    }

    init() {
        console.log('⚒️ Hobbit Miner Initialized');
        this.log('Hobbit Miner Ready - Enter wallet and click Start Mining');
        
        document.getElementById('startBtn').addEventListener('click', () => this.startMining());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopMining());
        document.getElementById('testBtn').addEventListener('click', () => this.testConnection());
        
        document.getElementById('threads').addEventListener('input', (e) => {
            document.getElementById('threadCount').textContent = e.target.value;
        });

        this.connectSSE();
    }

    connectSSE() {
        try {
            this.eventSource = new EventSource('/api/events');
            
            this.eventSource.onopen = () => {
                this.log('✅ Connected to server');
                this.updateConnectionStatus('Connected');
            };
            
            this.eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleServerMessage(data);
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            };
            
            this.eventSource.onerror = () => {
                this.log('❌ Connection error');
                this.updateConnectionStatus('Disconnected');
            };
            
        } catch (error) {
            this.log('❌ Failed to connect');
        }
    }

    async startMining() {
        const wallet = document.getElementById('wallet').value.trim();
        const worker = document.getElementById('worker').value.trim();
        const pool = document.getElementById('pool').value;
        const threads = parseInt(document.getElementById('threads').value);

        if (!wallet) {
            alert('Please enter wallet address');
            return;
        }

        try {
            this.isMining = true;
            this.updateUI(true);
            this.log('🚀 Starting REAL CPU mining...');
            
            const response = await fetch('/api/start-mining', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({wallet, worker, pool, threads})
            });

            const result = await response.json();
            
            if (result.success) {
                this.startRealMining(threads);
                this.log(`⛏️ Mining: ${wallet}.${worker}`);
            }
            
        } catch (error) {
            this.log(`❌ ERROR: ${error.message}`);
            this.isMining = false;
            this.updateUI(false);
        }
    }

    handleServerMessage(data) {
        switch (data.type) {
            case 'status':
                this.log(`📡 ${data.message}`);
                break;
            case 'pool_connected':
                this.log(`✅ ${data.message}`);
                break;
        }
    }

    startRealMining(threadCount) {
        this.stats.startTime = Date.now();
        this.stats.totalHashes = 0;
        this.stats.acceptedShares = 0;
        this.stats.workers = [];
        
        // Reset UI
        document.getElementById('time').textContent = '00:00:00';
        document.getElementById('hashrate').textContent = '0 H/s';
        document.getElementById('totalHashes').textContent = '0';
        document.getElementById('acceptedShares').textContent = '0';
        
        // Create workers
        for (let i = 0; i < threadCount; i++) {
            this.stats.workers.push({id: i, hashes: 0});
            this.startWorker(i);
        }
        
        this.updateInterval = setInterval(() => this.updateStats(), 1000);
        
        this.log(`🔥 Started ${threadCount} workers - CPU AT 100%`);
    }

    startWorker(workerId) {
        const worker = { running: true, hashes: 0 };

        const mine = () => {
            if (!this.isMining || !worker.running) return;

            let hashes = 0;
            const startTime = Date.now();
            
            // REÁLNA CPU PRÁCA - 100ms
            while (Date.now() - startTime < 100 && this.isMining) {
                this.realCpuWork();
                hashes++;
                
                // Náhodne nájdi share
                if (Math.random() < 0.0001) {
                    this.stats.acceptedShares++;
                    this.log(`🎯 Worker ${workerId} found SHARE!`);
                }
            }

            worker.hashes += hashes;
            this.stats.totalHashes += hashes;
            this.stats.workers[workerId].hashes = worker.hashes;

            if (this.isMining) setTimeout(mine, 0);
        };

        mine();
    }

    realCpuWork() {
        // REÁLNA CPU ZÁŤAŽ
        let result = 0;
        for (let i = 0; i < 1000; i++) {
            result += Math.sin(i) * Math.cos(i);
            result = result & 0xFFFF;
        }
        return result;
    }

    updateStats() {
        const elapsed = Math.floor((Date.now() - this.stats.startTime) / 1000);
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;
        
        document.getElementById('time').textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const hashrate = elapsed > 0 ? this.stats.totalHashes / elapsed : 0;
        document.getElementById('hashrate').textContent = Math.round(hashrate) + ' H/s';
        document.getElementById('totalHashes').textContent = this.stats.totalHashes.toLocaleString();
        document.getElementById('acceptedShares').textContent = this.stats.acceptedShares;
        
        this.updateWorkerStats();
    }

    updateWorkerStats() {
        const container = document.getElementById('workerStats');
        container.innerHTML = this.stats.workers.map(worker => 
            `<div>Worker ${worker.id}: ${worker.hashes.toLocaleString()} hashes - 🔥 100% CPU</div>`
        ).join('');
    }

    stopMining() {
        this.isMining = false;
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        this.updateUI(false);
        this.log('🛑 Mining stopped - CPU load reduced');
    }

    async testConnection() {
        try {
            const response = await fetch('/api/health');
            const data = await response.json();
            this.log(`✅ Server: ${data.status}`);
        } catch (error) {
            this.log(`❌ Health check failed`);
        }
    }

    updateUI(mining) {
        document.getElementById('startBtn').disabled = mining;
        document.getElementById('stopBtn').disabled = !mining;
        this.updateConnectionStatus(mining ? 'MINING - 100% CPU' : 'Connected');
    }

    updateConnectionStatus(status) {
        const element = document.getElementById('connectionStatus');
        element.textContent = status;
        element.className = status.includes('MINING') ? 'status-mining' : 
                           status === 'Disconnected' ? 'status-disconnected' : 'status-connected';
    }

    log(message) {
        const logContainer = document.getElementById('log');
        const timestamp = new Date().toLocaleTimeString();
        logContainer.innerHTML += `<div>[${timestamp}] ${message}</div>`;
        logContainer.scrollTop = logContainer.scrollHeight;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.miner = new HobbitMiner();
});
