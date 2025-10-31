// Main Application Logic
import { CONFIG, loadConfig, saveConfig, validateWallet } from './config.js';
import StratumClient from './stratum-client.js';
import YespowerMiner from './yespower-miner.js';

class CrionicWebMiner {
    constructor() {
        this.miner = new YespowerMiner();
        this.stratumClient = new StratumClient();
        this.config = loadConfig();
        this.stats = {
            startTime: 0,
            totalHashes: 0,
            acceptedShares: 0,
            rejectedShares: 0
        };
        this.updateInterval = null;
        
        this.initializeUI();
        this.setupEventListeners();
    }

    // Initialize UI elements
    initializeUI() {
        // Load saved configuration
        document.getElementById('threads').value = this.config.threads;
        document.getElementById('threadCount').textContent = this.config.threads;
        document.getElementById('intensity').value = this.config.intensity;
        document.getElementById('intensityValue').textContent = this.config.intensity + '%';
        document.getElementById('donationPercent').value = this.config.donation;
        document.getElementById('donationValue').textContent = this.config.donation + '%';
        document.getElementById('autoStart').checked = this.config.autoStart;
        document.getElementById('enableLogging').checked = this.config.enableLogging;
        
        // Update worker stats display
        this.updateWorkerStats();
    }

    // Set up event listeners
    setupEventListeners() {
        // Mining controls
        document.getElementById('startBtn').addEventListener('click', () => this.startMining());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopMining());
        document.getElementById('qrBtn').addEventListener('click', () => this.showQRCode());
        document.getElementById('configBtn').addEventListener('click', () => this.showConfig());
        document.getElementById('saveConfig').addEventListener('click', () => this.saveConfiguration());

        // Range inputs
        document.getElementById('threads').addEventListener('input', (e) => {
            document.getElementById('threadCount').textContent = e.target.value;
        });
        
        document.getElementById('intensity').addEventListener('input', (e) => {
            document.getElementById('intensityValue').textContent = e.target.value + '%';
        });
        
        document.getElementById('donationPercent').addEventListener('input', (e) => {
            document.getElementById('donationValue').textContent = e.target.value + '%';
        });

        // Modal controls
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });

        // Auto-start if configured
        if (this.config.autoStart) {
            setTimeout(() => this.startMining(), 1000);
        }
    }

    // Start mining process
    async startMining() {
        const wallet = document.getElementById('wallet').value.trim();
        const worker = document.getElementById('worker').value.trim();
        const pool = document.getElementById('pool').value;
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

        try {
            // Update UI
            this.updateMiningUI(true);
            
            // Initialize statistics
            this.stats.startTime = Date.now();
            this.stats.totalHashes = 0;
            this.stats.acceptedShares = 0;
            this.stats.rejectedShares = 0;

            // Setup stratum client callbacks
            this.setupStratumCallbacks();

            // Connect to pool
            await this.stratumClient.connect(pool, wallet, worker);
            
            // Start mining
            this.miner.startMining(threads, intensity, this.stratumClient);
            
            // Start stats updates
            this.startStatsUpdates();
            
            console.log('Mining started successfully');
            
        } catch (error) {
            console.error('Failed to start mining:', error);
            alert('Failed to connect to mining pool: ' + error.message);
            this.updateMiningUI(false);
        }
    }

    // Stop mining process
    stopMining() {
        this.miner.stopMining();
        this.stratumClient.disconnect();
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        this.updateMiningUI(false);
        console.log('Mining stopped');
    }

    // Set up stratum client callbacks
    setupStratumCallbacks() {
        this.stratumClient.on('onConnect', () => {
            document.getElementById('poolStatusIndicator').className = 'status-indicator connected';
            document.getElementById('poolStatusText').textContent = 'Connected';
        });
        
        this.stratumClient.on('onDisconnect', () => {
            document.getElementById('poolStatusIndicator').className = 'status-indicator';
            document.getElementById('poolStatusText').textContent = 'Disconnected';
        });
        
        this.stratumClient.on('onAccepted', (data) => {
            this.stats.acceptedShares++;
            this.updateStatsDisplay();
        });
        
        this.stratumClient.on('onRejected', (data) => {
            this.stats.rejectedShares++;
            this.updateStatsDisplay();
        });
        
        this.stratumClient.on('onError', (error) => {
            console.error('Stratum error:', error);
        });
    }

    // Start statistics updates
    startStatsUpdates() {
        this.updateInterval = setInterval(() => {
            const minerStats = this.miner.getStats();
            this.stats.totalHashes = minerStats.totalHashes;
            this.updateStatsDisplay();
            this.updateWorkerStats(minerStats.workers);
        }, 1000);
    }

    // Update statistics display
    updateStatsDisplay() {
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
        document.getElementById('rejectedShares').textContent = this.stats.rejectedShares;
        document.getElementById('difficulty').textContent = this.stratumClient.difficulty || 'N/A';
    }

    // Format hashrate for display
    formatHashrate(hashes) {
        if (hashes >= 1000000) {
            return (hashes / 1000000).toFixed(2) + ' MH/s';
        } else if (hashes >= 1000) {
            return (hashes / 1000).toFixed(2) + ' kH/s';
        } else {
            return hashes.toFixed(2) + ' H/s';
        }
    }

    // Update worker statistics display
    updateWorkerStats(workers = []) {
        const container = document.getElementById('workerStats');
        
        if (workers.length === 0) {
            container.innerHTML = '<div class="worker-thread">No active workers</div>';
            return;
        }
        
        container.innerHTML = workers.map(worker => `
            <div class="worker-thread">
                <strong>Worker ${worker.id}</strong><br>
                Hashes: ${worker.hashes.toLocaleString()}<br>
                Status: ${worker.running ? '🟢 Running' : '🔴 Stopped'}
            </div>
        `).join('');
    }

    // Update mining UI state
    updateMiningUI(mining) {
        document.getElementById('startBtn').disabled = mining;
        document.getElementById('stopBtn').disabled = !mining;
        
        if (mining) {
            document.getElementById('poolStatusIndicator').className = 'status-indicator connecting';
            document.getElementById('poolStatusText').textContent = 'Connecting...';
        } else {
            document.getElementById('poolStatusIndicator').className = 'status-indicator';
            document.getElementById('poolStatusText').textContent = 'Disconnected';
        }
    }

    // Show QR code modal
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
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        }, function(error) {
            if (error) {
                console.error('QR code generation failed:', error);
                document.getElementById('qrCode').innerHTML = 'QR Generation Failed';
            }
        });
        
        document.getElementById('qrModal').style.display = 'block';
    }

    // Show configuration modal
    showConfig() {
        document.getElementById('configModal').style.display = 'block';
    }

    // Save configuration
    saveConfiguration() {
        this.config.threads = parseInt(document.getElementById('threads').value);
        this.config.intensity = parseInt(document.getElementById('intensity').value);
        this.config.donation = parseFloat(document.getElementById('donationPercent').value);
        this.config.autoStart = document.getElementById('autoStart').checked;
        this.config.enableLogging = document.getElementById('enableLogging').checked;
        
        saveConfig(this.config);
        
        document.getElementById('configModal').style.display = 'none';
        alert('Configuration saved successfully!');
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.crionicMiner = new CrionicWebMiner();
});