// Main Application
class HobbitMinerApp {
    constructor() {
        this.miner = window.hobbitMiner;
        this.isMining = false;
        this.setupEventListeners();
        this.updateUI();
    }

    setupEventListeners() {
        // Mining controls
        document.getElementById('startBtn').addEventListener('click', () => this.startMining());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopMining());
        document.getElementById('qrBtn').addEventListener('click', () => this.showQRCode());

        // Range inputs
        document.getElementById('threads').addEventListener('input', (e) => {
            document.getElementById('threadCount').textContent = e.target.value;
        });
        
        document.getElementById('intensity').addEventListener('input', (e) => {
            document.getElementById('intensityValue').textContent = e.target.value + '%';
        });

        // Modal controls
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });
    }

    startMining() {
        const wallet = document.getElementById('wallet').value.trim();
        const worker = document.getElementById('worker').value.trim();
        const threads = parseInt(document.getElementById('threads').value);
        const intensity = parseInt(document.getElementById('intensity').value);

        // Validation
        if (!validateWallet(wallet)) {
            alert('Please enter a valid CRNC wallet address starting with "CRNC"');
            return;
        }

        if (!worker) {
            alert('Please enter a worker name');
            return;
        }

        if (!confirm(`⚠️ REAL CPU MINING ACTIVATED!\n\nThis will use ${threads} CPU threads at ${intensity}% intensity.\n\nYour device may become slow and hot. Continue?`)) {
            return;
        }

        this.miner.startMining(wallet, worker, threads, intensity);
        this.isMining = true;
        this.updateUI();
    }

    stopMining() {
        this.miner.stopMining();
        this.isMining = false;
        this.updateUI();
    }

    updateUI() {
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        const poolStatus = document.getElementById('poolStatusIndicator');

        if (this.isMining) {
            startBtn.disabled = true;
            stopBtn.disabled = false;
            poolStatus.className = 'status-indicator connecting';
            document.getElementById('poolStatusText').textContent = 'Mining...';
        } else {
            startBtn.disabled = false;
            stopBtn.disabled = true;
            poolStatus.className = 'status-indicator';
            document.getElementById('poolStatusText').textContent = 'Ready';
        }
    }

    showQRCode() {
        const wallet = document.getElementById('wallet').value.trim();
        
        if (!validateWallet(wallet)) {
            alert('Please enter a valid CRNC wallet address first');
            return;
        }
        
        document.getElementById('walletAddress').textContent = wallet;
        document.getElementById('qrCode').innerHTML = '';
        
        QRCode.toCanvas(document.getElementById('qrCode'), wallet, {
            width: 200,
            height: 200,
            colorDark: '#000000',
            colorLight: '#ffffff'
        }, function(error) {
            if (error) {
                console.error('QR code generation failed:', error);
                document.getElementById('qrCode').innerHTML = 'QR Generation Failed';
            }
        });
        
        document.getElementById('qrModal').style.display = 'block';
    }
}

// Global functions for miner to call
function updateMiningStats(stats) {
    const elapsed = Math.floor((Date.now() - stats.startTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    
    document.getElementById('time').textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    document.getElementById('hashrate').textContent = formatHashrate(stats.hashrate);
    document.getElementById('totalHashes').textContent = stats.totalHashes.toLocaleString();
    document.getElementById('acceptedShares').textContent = stats.acceptedShares;
    document.getElementById('rejectedShares').textContent = stats.rejectedShares;
    
    // Calculate CPU usage based on intensity
    const intensity = parseInt(document.getElementById('intensity').value);
    document.getElementById('cpuUsage').textContent = intensity + '%';
}

function updateShareCount(count) {
    document.getElementById('acceptedShares').textContent = count;
}

function updatePoolStatus(status) {
    const indicator = document.getElementById('poolStatusIndicator');
    const text = document.getElementById('poolStatusText');
    
    if (status === 'connected') {
        indicator.className = 'status-indicator connected';
        text.textContent = 'Connected';
    }
}

function formatHashrate(hashes) {
    if (hashes >= 1000000) {
        return (hashes / 1000000).toFixed(2) + ' MH/s';
    } else if (hashes >= 1000) {
        return (hashes / 1000).toFixed(2) + ' kH/s';
    } else {
        return hashes.toFixed(2) + ' H/s';
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.hobbitMinerApp = new HobbitMinerApp();
});