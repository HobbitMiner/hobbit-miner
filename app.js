class RealHobbitMinerApp {
  constructor() {
    this.isMining = false;
    this.stats = { hashrate: 0, threads: 4, totalHashes: 0, cpuUsage: 75 };
  }

  init() {
    this.el = {
      start: document.getElementById('start-btn'),
      stop: document.getElementById('stop-btn'),
      reset: document.getElementById('reset-btn'),
      thread: document.getElementById('thread-slider'),
      intensity: document.getElementById('intensity-slider'),
      threadVal: document.getElementById('thread-value'),
      intensityVal: document.getElementById('intensity-value'),
      hashrate: document.getElementById('hashrate-value'),
      threads: document.getElementById('threads-value'),
      mined: document.getElementById('mined-value'),
      cpu: document.getElementById('cpu-value'),
      progress: document.getElementById('progress-fill'),
      log: document.getElementById('mining-log'),
      status: document.getElementById('status-text')
    };
    this.bindEvents();
    window.updateRealMinerStats = s => this.updateStats(s);
    window.addRealMiningLog = t => this.addLog(t);
  }

  bindEvents() {
    this.el.thread.oninput = e => {
      this.stats.threads = +e.target.value;
      this.el.threadVal.textContent = e.target.value;
      window.realHobbitMiner.setThreads(+e.target.value);
    };
    this.el.intensity.oninput = e => {
      this.stats.cpuUsage = +e.target.value;
      this.el.intensityVal.textContent = e.target.value;
      window.realHobbitMiner.setIntensity(+e.target.value);
    };
    this.el.start.onclick = () => this.startMining();
    this.el.stop.onclick = () => this.stopMining();
    this.el.reset.onclick = () => this.resetStats();
  }

  startMining() {
    if (this.isMining) return;
    if (window.realHobbitMiner.initialize(this.stats.threads, this.stats.cpuUsage)) {
      window.realHobbitMiner.start();
      this.isMining = true;
      this.el.start.disabled = true;
      this.el.stop.disabled = false;
      this.el.status.textContent = "Mining...";
      this.el.status.className = "status-text status-mining";
    }
  }

  stopMining() {
    window.realHobbitMiner.stop();
    this.isMining = false;
    this.el.start.disabled = false;
    this.el.stop.disabled = true;
    this.el.status.textContent = "Ready to start real mining";
    this.el.status.className = "status-text status-idle";
  }

  resetStats() {
    this.stats = { hashrate: 0, threads: 4, totalHashes: 0, cpuUsage: 75 };
    this.updateStats(this.stats);
    this.addLog("🔄 Stats reset");
  }

  updateStats(s) {
    this.el.hashrate.textContent = s.hashrate.toFixed(2) + " H/s";
    this.el.threads.textContent = s.threads;
    this.el.mined.textContent = s.totalHashes.toLocaleString();
    this.el.cpu.textContent = s.cpuUsage + "%";
    this.el.progress.style.width = s.cpuUsage + "%";
  }

  addLog(msg) {
    const div = document.createElement('div');
    div.className = 'log-entry';
    div.textContent = msg;
    this.el.log.appendChild(div);
    this.el.log.scrollTop = this.el.log.scrollHeight;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.realHobbitMinerApp = new RealHobbitMinerApp();
  window.realHobbitMinerApp.init();
});
