// app.js - UI glue
class RealHobbitMinerApp {
  constructor(){ this.isMining=false; }
  init(){
    this.cache();
    this.bind();
    window.updateRealMinerStats = s => this.updateDisplay(s);
    window.addRealMiningLog = t => this.addLog(t);
    this.addLog('App initialized');
  }
  cache(){
    this.el = {
      start: document.getElementById('start-btn'),
      stop: document.getElementById('stop-btn'),
      wallet: document.getElementById('wallet-input'),
      threadSlider: document.getElementById('thread-slider'),
      intensitySlider: document.getElementById('intensity-slider'),
      threadValue: document.getElementById('thread-value'),
      intensityValue: document.getElementById('intensity-value'),
      hashrate: document.getElementById('hashrate-value'),
      threads: document.getElementById('threads-value'),
      mined: document.getElementById('mined-value'),
      cpu: document.getElementById('cpu-value'),
      progress: document.getElementById('progress-fill'),
      log: document.getElementById('mining-log'),
      status: document.getElementById('status-text')
    };
  }
  bind(){
    this.el.threadSlider.oninput = e=>{ this.el.threadValue.textContent = e.target.value; if(window.realCoinImpMiner) window.realCoinImpMiner.setThreads(+e.target.value); }
    this.el.intensitySlider.oninput = e=>{ this.el.intensityValue.textContent = e.target.value; if(window.realCoinImpMiner) window.realCoinImpMiner.setIntensity(+e.target.value); }
    this.el.start.onclick = ()=> this.start();
    this.el.stop.onclick = ()=> this.stop();
  }
  async start(){
    const wallet = this.el.wallet.value.trim();
    if (!wallet) { alert('Enter your XMR wallet address'); this.addLog('Start aborted - missing wallet'); return; }
    const threads = +this.el.threadSlider.value;
    const intensity = +this.el.intensitySlider.value;
    this.addLog('Initializing miner...');
    const ok = await window.realCoinImpMiner.initialize(wallet, threads, intensity);
    if (!ok) { this.addLog('Initialization failed. See logs.'); return; }
    window.realCoinImpMiner.start();
    this.isMining=true;
    this.el.start.disabled=true; this.el.stop.disabled=false;
    this.el.status.textContent = 'Mining...'; this.el.status.className='status-mining';
  }
  stop(){ window.realCoinImpMiner.stop(); this.isMining=false; this.el.start.disabled=false; this.el.stop.disabled=true; this.el.status.textContent='Stopped'; this.el.status.className=''; }
  updateDisplay(s){
    if (!s) return;
    this.el.hashrate.textContent = (s.hashrate||0).toFixed(2) + ' H/s';
    this.el.threads.textContent = s.threads||0;
    this.el.mined.textContent = (s.totalHashes||0).toLocaleString();
    this.el.cpu.textContent = (s.cpuUsage||0) + '%';
    this.el.progress.style.width = (s.cpuUsage||0) + '%';
  }
  addLog(m){ const d = document.createElement('div'); d.className='log-entry'; d.textContent = m; this.el.log.appendChild(d); this.el.log.scrollTop = this.el.log.scrollHeight; }
}

document.addEventListener('DOMContentLoaded', ()=>{ window.realHobbitMinerApp = new RealHobbitMinerApp(); window.realHobbitMinerApp.init(); });
