// miner.js - COINIMP integration with hardcoded site key
// Tvůj site key vložený priamo (bez závislosti na <script> v HTML)
(() => {
  const SITE_KEY = '3dfdd63fc13d571996eea951f52647ba563ae58483cd94278cc0b6b05af75bf2';

  class RealCoinImpMiner {
    constructor() {
      this.client = null;
      this.isRunning = false;
      this.stats = { hashrate:0, threads:4, totalHashes:0, acceptedHashes:0, cpuUsage:75 };
      this.updateInterval = null;
    }

    loadScript(url) {
      return new Promise((res, rej) => {
        if (window.Client) return res();
        const s = document.createElement('script');
        s.src = url;
        s.onload = () => res();
        s.onerror = () => rej(new Error('Script load failed: '+url));
        document.head.appendChild(s);
      });
    }

    async initialize(walletAddress, threads=4, intensity=75) {
      this.stats.threads = threads;
      this.stats.cpuUsage = intensity;
      this.wallet = walletAddress || '';
      if (!SITE_KEY) {
        this._log('ERROR: SITE_KEY missing');
        return false;
      }

      try {
        // pokus načítať coinimp min.js; ak URL zmenené, uprav tu
        await this.loadScript('https://www.coinimp.com/scripts/min.js').catch(()=>{});
        if (typeof Client === 'undefined') {
          this._log('WARNING: Client undefined after loading script. Browser/adblock/CORS may block it.');
          // stále vytvoríme fallback klient, ale štart nemusí fungovať
          return false;
        }

        // vytvorenie klienta podľa API coinimpu
        this.client = new Client.Anonymous(SITE_KEY, { throttle: (100 - intensity)/100, threads: threads });
        this._hookEvents();
        this._log('Miner initialized (site key set).');
        return true;
      } catch (e) {
        this._log('Miner initialize error: '+e.message);
        return false;
      }
    }

    _hookEvents() {
      if (!this.client) return;
      if (typeof this.client.on === 'function') {
        this.client.on('update', (data)=>{
          this.stats.hashrate = data.hashesPerSecond || this.stats.hashrate;
          this.stats.totalHashes = data.totalHashes || this.stats.totalHashes;
          if (window.updateRealMinerStats) window.updateRealMinerStats(this.stats);
        });
        this.client.on('found', ()=>{ this.stats.acceptedHashes++; this._log('Hash found'); });
        this.client.on('accepted', ()=>{ this.stats.acceptedHashes++; this._log('Share accepted'); });
        this.client.on('error', (err)=>{ this._log('Miner error: '+err); });
      } else {
        // fallback polling (ak implementácia skriptu iná)
        this.updateInterval = setInterval(()=>{
          try {
            if (this.client && typeof this.client.getHashesPerSecond === 'function') {
              this.stats.hashrate = this.client.getHashesPerSecond();
              this.stats.totalHashes = this.client.getTotalHashes();
              if (window.updateRealMinerStats) window.updateRealMinerStats(this.stats);
            }
          } catch(e){}
        },1000);
      }
    }

    start() {
      if (!this.client) { this._log('Cannot start: miner not initialized'); return; }
      if (this.isRunning) return;
      if (typeof this.client.start === 'function') this.client.start();
      this.isRunning = true;
      this._log('Mining started via CoinImp.');
    }

    stop() {
      if (!this.client) return;
      if (typeof this.client.stop === 'function') this.client.stop();
      this.isRunning = false;
      this._log('Mining stopped.');
      if (this.updateInterval) { clearInterval(this.updateInterval); this.updateInterval = null; }
    }

    setIntensity(i){ this.stats.cpuUsage = i; if (this.client && typeof this.client.setThrottle==='function') this.client.setThrottle((100-i)/100); }
    setThreads(t){ this.stats.threads = t; if (this.client && typeof this.client.setNumThreads==='function') this.client.setNumThreads(t); }

    _log(m){ if (window.addRealMiningLog) window.addRealMiningLog('['+new Date().toLocaleTimeString()+'] '+m); console.log('Miner:',m); }
  }

  window.realCoinImpMiner = new RealCoinImpMiner();
})();
