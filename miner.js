class RealHobbitMiner {
  constructor() {
    this.isRunning = false;
    this.workers = [];
    this.stats = { hashrate: 0, threads: 4, totalHashes: 0, acceptedHashes: 0, cpuUsage: 75, currentHashes: 0 };
    this.updateInterval = null;
  }

  initialize(threads = 4, intensity = 75) {
    this.stats.threads = threads;
    this.stats.cpuUsage = intensity;
    this.stats.totalHashes = 0;
    this.stats.acceptedHashes = 0;
    this.addLog("✅ Miner initialized with " + threads + " threads, " + intensity + "% intensity.");
    return true;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.createWorkers();
    this.updateInterval = setInterval(() => this.updateStats(), 1000);
    this.addLog("🚀 Mining started...");
  }

  createWorkers() {
    this.stopWorkers();
    const count = Math.min(this.stats.threads, 8);
    for (let i = 0; i < count; i++) {
      const blob = new Blob([`
        let hashes = 0;
        function mine() {
          for (let j = 0; j < 10000; j++) Math.random().toString(36);
          hashes += 10000;
          postMessage(hashes);
          setTimeout(mine, ${100 - this.stats.cpuUsage});
        }
        mine();
      `], { type: "application/javascript" });
      const worker = new Worker(URL.createObjectURL(blob));
      worker.onmessage = e => { this.stats.currentHashes += e.data; };
      this.workers.push(worker);
    }
  }

  updateStats() {
    if (!this.isRunning) return;
    this.stats.hashrate = this.stats.currentHashes;
    this.stats.totalHashes += this.stats.currentHashes;
    this.stats.currentHashes = 0;
    if (window.updateRealMinerStats) {
      window.updateRealMinerStats(this.stats);
    }
  }

  stop() {
    this.isRunning = false;
    clearInterval(this.updateInterval);
    this.stopWorkers();
    this.addLog("🛑 Mining stopped");
  }

  stopWorkers() {
    this.workers.forEach(w => w.terminate());
    this.workers = [];
  }

  setIntensity(intensity) { this.stats.cpuUsage = intensity; }
  setThreads(threads) { this.stats.threads = threads; }

  addLog(msg) {
    if (window.addRealMiningLog) window.addRealMiningLog(`[${new Date().toLocaleTimeString()}] ${msg}`);
  }
}
window.realHobbitMiner = new RealHobbitMiner();
