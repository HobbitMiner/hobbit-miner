// Stratum Protocol Client for Crionic Mining
class StratumClient {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.subscribed = false;
        this.authorized = false;
        this.job = null;
        this.extraNonce1 = null;
        this.extraNonce2Size = null;
        this.difficulty = 1;
        this.sessionId = null;
        this.callbacks = {
            onConnect: null,
            onDisconnect: null,
            onJob: null,
            onAccepted: null,
            onRejected: null,
            onError: null
        };
    }

    // Connect to stratum pool
    async connect(poolUrl, wallet, workerName) {
        return new Promise((resolve, reject) => {
            try {
                // Convert stratum URL to WebSocket
                const wsUrl = this.getWebSocketUrl(poolUrl);
                this.socket = new WebSocket(wsUrl);
                
                this.socket.onopen = () => {
                    console.log('Stratum: Connected to pool');
                    this.connected = true;
                    this.setupMessageHandler();
                    this.subscribe(wallet, workerName);
                    
                    if (this.callbacks.onConnect) {
                        this.callbacks.onConnect();
                    }
                    resolve();
                };
                
                this.socket.onerror = (error) => {
                    console.error('Stratum: Connection error', error);
                    if (this.callbacks.onError) {
                        this.callbacks.onError('Connection failed');
                    }
                    reject(error);
                };
                
                this.socket.onclose = () => {
                    console.log('Stratum: Connection closed');
                    this.connected = false;
                    if (this.callbacks.onDisconnect) {
                        this.callbacks.onDisconnect();
                    }
                };
                
                // Set timeout for connection
                setTimeout(() => {
                    if (!this.connected) {
                        reject(new Error('Connection timeout'));
                    }
                }, 10000);
                
            } catch (error) {
                reject(error);
            }
        });
    }

    // Convert stratum URL to WebSocket URL
    getWebSocketUrl(poolUrl) {
        // This would typically connect through a proxy due to CORS restrictions
        // For demo purposes, we'll use a simulated connection
        return `wss://stratum-proxy.crionic.com/${btoa(poolUrl)}`;
    }

    // Set up message handler
    setupMessageHandler() {
        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            } catch (error) {
                console.error('Stratum: Failed to parse message', error);
            }
        };
    }

    // Handle incoming stratum messages
    handleMessage(data) {
        if (data.id === 1) {
            // Subscription response
            this.handleSubscriptionResponse(data);
        } else if (data.id === 2) {
            // Authorization response
            this.handleAuthorizationResponse(data);
        } else if (data.method === "mining.set_difficulty") {
            this.handleSetDifficulty(data);
        } else if (data.method === "mining.notify") {
            this.handleNotify(data);
        } else if (data.method === "mining.set_extranonce") {
            this.handleSetExtranonce(data);
        } else if (data.id && data.error) {
            this.handleError(data);
        } else if (data.result === true && data.id > 2) {
            this.handleShareAccepted(data);
        } else if (data.result === false && data.id > 2) {
            this.handleShareRejected(data);
        }
    }

    // Subscribe to mining
    subscribe(wallet, workerName) {
        const message = {
            id: 1,
            method: "mining.subscribe",
            params: [`CrionicWebMiner/1.0.0`, workerName]
        };
        this.send(message);
    }

    // Authorize worker
    authorize(wallet, workerName) {
        const message = {
            id: 2,
            method: "mining.authorize",
            params: [`${wallet}.${workerName}`, "x"]
        };
        this.send(message);
    }

    // Submit share
    submitShare(workerName, jobId, extranonce2, ntime, nonce) {
        const message = {
            id: Date.now(),
            method: "mining.submit",
            params: [
                workerName,
                jobId,
                extranonce2,
                ntime,
                nonce
            ]
        };
        this.send(message);
        return message.id;
    }

    // Handle subscription response
    handleSubscriptionResponse(data) {
        if (data.error) {
            console.error('Stratum: Subscription failed', data.error);
            return;
        }
        
        this.subscribed = true;
        this.extraNonce1 = data.result[1];
        this.extraNonce2Size = data.result[2];
        
        console.log('Stratum: Subscribed successfully');
    }

    // Handle authorization response
    handleAuthorizationResponse(data) {
        if (data.result === true) {
            this.authorized = true;
            console.log('Stratum: Authorized successfully');
        } else {
            console.error('Stratum: Authorization failed');
        }
    }

    // Handle difficulty update
    handleSetDifficulty(data) {
        this.difficulty = data.params[0];
        console.log(`Stratum: Difficulty updated to ${this.difficulty}`);
    }

    // Handle new mining job
    handleNotify(data) {
        this.job = {
            jobId: data.params[0],
            prevhash: data.params[1],
            coinb1: data.params[2],
            coinb2: data.params[3],
            merkle_branch: data.params[4],
            version: data.params[5],
            nbits: data.params[6],
            ntime: data.params[7],
            clean: data.params[8]
        };
        
        console.log('Stratum: New job received', this.job.jobId);
        
        if (this.callbacks.onJob) {
            this.callbacks.onJob(this.job);
        }
    }

    // Handle share accepted
    handleShareAccepted(data) {
        console.log('Stratum: Share accepted');
        if (this.callbacks.onAccepted) {
            this.callbacks.onAccepted(data);
        }
    }

    // Handle share rejected
    handleShareRejected(data) {
        console.log('Stratum: Share rejected', data.error);
        if (this.callbacks.onRejected) {
            this.callbacks.onRejected(data);
        }
    }

    // Handle error
    handleError(data) {
        console.error('Stratum: Error', data.error);
        if (this.callbacks.onError) {
            this.callbacks.onError(data.error);
        }
    }

    // Send message to pool
    send(message) {
        if (this.socket && this.connected) {
            this.socket.send(JSON.stringify(message));
        }
    }

    // Disconnect from pool
    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
        this.connected = false;
        this.subscribed = false;
        this.authorized = false;
    }

    // Set callback for events
    on(event, callback) {
        this.callbacks[event] = callback;
    }
}

export default StratumClient;