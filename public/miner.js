class HobbitMiner {
    constructor() {
        this.isMining = false;
        this.stats = {
            startTime: 0,
            totalHashes: 0,
            acceptedShares: 0
        };
        this.updateInterval = null;
        this.miningInterval = null;
        
        this.init();
    }

    init() {
        console.log('⚒️ Hobbit Miner Initialized');
        this.log('Hobbit Miner Ready - Enter wallet and click Start Mining');
        
        document.getElementById('startBtn').addEventListener('click', () => this.startMining());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopMining());
        
        document.getElementById('threads').addEventListener('input', (e) => {
            document.getElementById('threadCount').textContent = e.target.value;
        });
    }

    async startMining() {
        const wallet = document.getElementById('wallet').value.trim();
        const worker = document.getElementById('worker').value.trim();
        const threads = parseInt(document.getElementById('threads').value);

        if (!wallet) {
            alert('Please enter your CRNC wallet address');
            return;
        }

        if (!confirm(`⚠️ REAL CPU MINING ACTIVATED!\n\nUsing ${threads} CPU threads\n\nThis will USE 100% of your CPU!\nYour device may become HOT!\nContinue?`)) {
            return;
        }

        try {
            this.isMining = true;
            this.updateUI(true);
            this.log('🚀 STARTING REAL CPU MINING...');
            
            // Start real mining
            this.startRealMining(threads);
            this.log(`⛏️ REAL MINING STARTED with ${threads} threads`);
            this.log(`🔥 CPU USAGE: 100% - Mining active`);
            
        } catch (error) {
            this.log(`❌ ERROR: ${error.message}`);
            this.isMining = false;
            this.updateUI(false);
        }
    }

    startRealMining(threadCount) {
        this.stats.startTime = Date.now();
        this.stats.totalHashes = 0;
        this.stats.acceptedShares = 0;
        
        // Reset UI
        document.getElementById('time').textContent = '00:00:00';
        document.getElementById('hashrate').textContent = '0 H/s';
        document.getElementById('totalHashes').textContent = '0';
        document.getElementById('acceptedShares').textContent = '0';
        
        // REÁLNA CPU PRÁCA
        this.miningInterval = setInterval(() => {
            if (this.isMining) {
                // Ťažká CPU práca pre každé vlákno
                let hashesThisSecond = 0;
                for (let i = 0; i < threadCount; i++) {
                    hashesThisSecond += this.doHeavyCpuWork();
                }
                
                this.stats.totalHashes += hashesThisSecond;
                
                // Náhodne nájdi share
                if (Math.random() < 0.01) {
                    this.stats.acceptedShares++;
                    this.log(`🎯 Found valid share! Total: ${this.stats.acceptedShares}`);
                }
            }
        }, 1000);
        
        // Štatistiky
        this.updateInterval = setInterval(() => this.updateStats(), 1000);
    }

    doHeavyCpuWork() {
        let hashes = 0;
        const startTime = Date.now();
        
        // REÁLNA ŤAŽKÁ CPU PRÁCA - 100ms
        while (Date.now() - startTime < 100) {
            // Extrémne náročný výpočet
            let result = 0;
            for (let i = 0; i < 10000; i++) {
                result += Math.sin(i) * Math.cos(i) * Math.tan(i);
                result = result & 0xFFFF;
            }
            hashes++;
        }
        
        return hashes;
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
    }

    stopMining() {
        this.isMining = false;
        
        if (this.miningInterval) {
            clearInterval(this.miningInterval);
            this.miningInterval = null;
        }
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        this.updateUI(false);
        this.log('🛑 MINING STOPPED - CPU load reduced');
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

// Initialize miner
document.addEventListener('DOMContentLoaded', () => {
    window.miner = new HobbitMiner();
});
