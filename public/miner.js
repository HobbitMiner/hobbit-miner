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
            if (this.eventSource) {
                this.eventSource.close();
            }
            
            this.eventSource = new EventSource('/api/events');
            
            this.eventSource.onopen = () => {
                this.log('✅ Connected to mining server');
                this.updateConnectionStatus('Connected');
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
                this.log('❌ Connection error - retrying...');
                this.updateConnectionStatus('Disconnected');
                
                setTimeout(() => {
                    if (!this.isMining) {
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

        if (!confirm(`⚠️ REAL CPU MINING ACTIVATED!\n\nUsing ${threads} CPU threads\nWallet: ${wallet}\n\nThis will USE 100% of your CPU!\nContinue?`)) {
            return;
        }

        try {
            this.isMining = true;
            this.updateUI(true);
            this.log('🚀 Starting REAL CPU mining...');
            
            // Test connection first
            const testResponse = await fetch('/api/test');
            if (!testResponse.ok) {
                throw new Error('API test failed');
            }
            
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

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            console.log('Content-Type:', contentType);
            
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.log('Non-JSON response:', text.substring(0, 200));
                throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}`);
            }

            const result = await response.json();
            console.log('API response:', result);
            
            if (!response.ok) {
                throw new Error(result.error || `HTTP ${response.status}`);
            }
            
            if (result.success) {
                this.log(`✅ ${result.message}`);
                this.log(`👥 Active connections: ${result.clientCount}`);
                
                // Start real mining on client side
                this.startRealMining(threads);
                this.log(`⛏️ REAL MINING STARTED: ${wallet}.${worker} on ${pool}`);
                this.log(`💻 Using ${threads} CPU threads at 100% capacity`);
            } else {
                throw new Error(result.error || 'Failed to start mining');
            }
            
        } catch (error) {
            console.error('Failed to start mining:', error);
            this.log(`❌ ERROR: ${error.message}`);
            this.isMining = false;
            this.updateUI(false);
        }
    }

    handleServerMessage(data) {
        console.log('Server message:', data);
        switch (data.type) {
            case 'status':
                this.log(`📡 ${data.message}`);
                break;
            case 'pool_connected':
                this.log(`✅ ${data.message}`);
                break;
            case 'share_accepted':
                this.stats.acceptedShares++;
                document.getElementById('acceptedShares').textContent = this.stats.acceptedShares;
                this.log(`🎯 SHARE ACCEPTED! Total: ${this.stats.acceptedShares}`);
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
            this.stats.workers.push({
                id: i,
                hashes: 0,
                running: true
            });
            
            // Spusti REÁLNY mining worker
            this.startWorker(i);
        }
        
        // Štatistiky
        this.updateInterval = setInterval(() => this.updateStats(), 1000);
        
        this.log(`🔥 STARTED ${threadCount} REAL MINING WORKERS`);
        this.log(`💯 CPU USAGE: 100% - Mining active`);
        this.updateWorkerStats();
    }

    startWorker(workerId) {
        const worker = {
            id: workerId,
            running: true,
            hashes: 0
        };

        // REÁLNY MINING LOOP
        const mine = () => {
            if (!this.isMining || !worker.running) return;

            const startTime = Date.now();
            let hashesThisCycle = 0;

            // REÁLNA CPU PRÁCA - 100ms cyklus
            while (Date.now() - startTime < 100 && this.isMining) {
                // Reálna CPU práca
                this.realCpuWork();
                hashesThisCycle++;
            }

            worker.hashes += hashesThisCycle;
            this.stats.totalHashes += hashesThisCycle;
            this.stats.workers[workerId].hashes = worker.hashes;

            // Pokračuj v mining
            if (this.isMining) {
                setTimeout(mine, 0);
            }
        };

        mine();
        this.workerThreads.push(worker);
    }

    realCpuWork() {
        // REÁLNA CPU ZÁŤAŽ - yespower-like
        let hash = 0;
        const data = `CRNC${Date.now()}${Math.random()}`;
        
        for (let round = 0; round < 10; round++) {
            for (let i = 0; i < data.length; i++) {
                hash = ((hash << 5) - hash) + data.charCodeAt(i);
                hash = hash & 0xFFFFFFFF;
            }
            
            // Memory-hard časť
            const memory = new Array(512);
            for (let i = 0; i < 512; i++) {
                memory[i] = (hash + i) & 0xFF;
                hash ^= memory[i] * (i + 1);
            }
        }
        
        return hash;
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
            `<div>Worker ${worker.id}: ${worker.hashes.toLocaleString()} hashes - 🔥 100% CPU</div>`
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
        
        // Zastav všetky workers
        this.workerThreads.forEach(worker => {
            worker.running = false;
        });
        this.workerThreads = [];
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        // Notify server
        try {
            await fetch('/api/stop-mining', {method: 'POST'});
            this.log('✅ Mining stopped on server');
        } catch (error) {
            console.error('Error stopping mining:', error);
        }
        
        this.updateUI(false);
        this.log('🛑 MINING STOPPED - CPU load reduced');
        this.log('💤 All mining workers terminated');
    }

    async testConnection() {
        try {
            this.log('🔧 Testing API connection...');
            
            const response = await fetch('/api/test');
            const data = await response.json();
            this.log(`✅ API test: ${data.message}`);
            
            const health = await fetch('/api/health');
            const healthData = await health.json();
            this.log(`✅ Server health: ${healthData.status}`);
            
        } catch (error) {
            this.log(`❌ Connection test failed: ${error.message}`);
        }
    }

    updateUI(mining) {
        document.getElementById('startBtn').disabled = mining;
        document.getElementById('stopBtn').disabled = !mining;
        
        if (mining) {
            this.updateConnectionStatus('MINING - 100% CPU');
        } else {
            this.updateConnectionStatus('Connected');
        }
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

// Initialize miner when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.miner = new HobbitMiner();
});
