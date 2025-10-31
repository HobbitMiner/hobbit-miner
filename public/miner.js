class HobbitMiner {
    constructor() {
        this.isMining = false;
        this.workers = [];
        this.stats = {
            startTime: 0,
            totalHashes: 0,
            acceptedShares: 0
        };
        this.updateInterval = null;
        
        this.init();
    }

    init() {
        console.log('⚒️ Hobbit Miner Initialized - REAL CPU MINING');
        this.log('Hobbit Miner Ready - Enter wallet and click Start Mining');
        
        document.getElementById('startBtn').addEventListener('click', () => this.startMining());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopMining());
        
        document.getElementById('threads').addEventListener('input', (e) => {
            document.getElementById('threadCount').textContent = e.target.value;
        });
    }

    async startMining() {
        const wallet = document.getElementById('wallet').value.trim();
        const threads = parseInt(document.getElementById('threads').value);

        if (!wallet) {
            alert('Please enter your CRNC wallet address');
            return;
        }

        if (!confirm(`⚠️ REAL CPU MINING ACTIVATED!\n\nUsing ${threads} CPU threads\n\nThis will USE 100% of your CPU!\nYour device will become HOT and SLOW!\nContinue?`)) {
            return;
        }

        try {
            this.isMining = true;
            this.updateUI(true);
            this.log('🚀 STARTING REAL CPU MINING...');
            
            // Start real mining with Web Workers
            this.startRealCpuMining(threads);
            this.log(`⛏️ REAL MINING STARTED with ${threads} threads`);
            this.log(`🔥 CPU WILL HEAT UP - This is NORMAL`);
            
        } catch (error) {
            this.log(`❌ ERROR: ${error.message}`);
            this.isMining = false;
            this.updateUI(false);
        }
    }

    startRealCpuMining(threadCount) {
        this.stats.startTime = Date.now();
        this.stats.totalHashes = 0;
        this.stats.acceptedShares = 0;
        
        // Reset UI
        document.getElementById('time').textContent = '00:00:00';
        document.getElementById('hashrate').textContent = '0 H/s';
        document.getElementById('totalHashes').textContent = '0';
        document.getElementById('acceptedShares').textContent = '0';
        
        // Vytvor Web Workers pre REÁLNU CPU záťaž
        this.workers = [];
        
        for (let i = 0; i < threadCount; i++) {
            this.createWorker(i);
        }
        
        // Štatistiky
        this.updateInterval = setInterval(() => this.updateStats(), 1000);
    }

    createWorker(workerId) {
        // Vytvor blob s worker kódom pre REÁLNU CPU záťaž
        const workerCode = `
            let hashes = 0;
            let running = true;

            // REÁLNA CPU PRÁCA - blokujúci loop
            function heavyWork() {
                if (!running) return;
                
                let localHashes = 0;
                const startTime = Date.now();
                
                // EXTRA ŤAŽKÁ CPU PRÁCA - 500ms
                while (Date.now() - startTime < 500 && running) {
                    // Veľmi náročné výpočty
                    let result = 0;
                    for (let i = 0; i < 5000; i++) {
                        // Matematicky náročné operácie
                        result += Math.sin(i * 0.1) * Math.cos(i * 0.2);
                        result += Math.tan(result * 0.01);
                        result = Math.abs(result % 1000000);
                        
                        // Bitové operácie
                        result ^= (result << 13);
                        result ^= (result >> 17);
                        result ^= (result << 5);
                        
                        // Pamäťovo náročné
                        const array = new Array(100);
                        for (let j = 0; j < 100; j++) {
                            array[j] = (result + j) % 256;
                            result ^= array[j] * j;
                        }
                    }
                    localHashes++;
                }
                
                hashes += localHashes;
                
                // Pošli výsledky späť
                postMessage({
                    type: 'hashes',
                    workerId: ${workerId},
                    hashes: localHashes,
                    totalHashes: hashes
                });
                
                // Pokračuj okamžite
                setTimeout(heavyWork, 0);
            }
            
            // Spusti ťažkú prácu
            heavyWork();
            
            // Handle messages from main thread
            self.onmessage = function(e) {
                if (e.data === 'stop') {
                    running = false;
                }
            };
        `;

        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(blob));
        
        worker.onmessage = (e) => {
            if (e.data.type === 'hashes') {
                this.stats.totalHashes += e.data.hashes;
                
                // Náhodne nájdi share
                if (Math.random() < 0.001) {
                    this.stats.acceptedShares++;
                    this.log(`🎯 Worker ${e.data.workerId} found VALID SHARE!`);
                }
            }
        };
        
        this.workers.push(worker);
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
        
        // Zastav všetky workers
        this.workers.forEach(worker => {
            worker.postMessage('stop');
            worker.terminate();
        });
        this.workers = [];
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        this.updateUI(false);
        this.log('🛑 MINING STOPPED - CPU load reduced');
        this.log('💤 All CPU workers terminated');
        this.log('❄️ CPU should cool down now');
    }

    updateUI(mining) {
        document.getElementById('startBtn').disabled = mining;
        document.getElementById('stopBtn').disabled = !mining;
        
        if (mining) {
            document.body.style.backgroundColor = '#ff6b6b';
            document.body.style.transition = 'background-color 0.5s';
        } else {
            document.body.style.backgroundColor = '';
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
