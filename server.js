const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const fetch = require('node-fetch');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// Stratum proxy WebSocket
const wss = new WebSocket.Server({ server });

// Pool connections cache
const poolConnections = new Map();

wss.on('connection', (ws, request) => {
    console.log('New WebSocket connection');
    
    let poolSocket = null;
    let poolUrl = null;

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            
            if (data.type === 'connect') {
                // Connect to actual stratum pool
                poolUrl = data.poolUrl;
                await connectToStratumPool(data.poolUrl, data.wallet, data.worker);
            } else if (data.type === 'stratum') {
                // Forward stratum message to pool
                if (poolSocket && poolSocket.readyState === WebSocket.OPEN) {
                    poolSocket.send(JSON.stringify(data.message));
                }
            }
        } catch (error) {
            console.error('Error handling message:', error);
            ws.send(JSON.stringify({ error: error.message }));
        }
    });

    async function connectToStratumPool(poolUrl, wallet, worker) {
        try {
            // Convert to WebSocket URL (this is a simulation - real pools use TCP)
            // For demo, we'll simulate stratum connection
            console.log(`Connecting to pool: ${poolUrl}`);
            
            // Simulate successful connection
            ws.send(JSON.stringify({
                type: 'connected',
                pool: poolUrl
            }));

            // Simulate subscription response
            setTimeout(() => {
                ws.send(JSON.stringify({
                    type: 'stratum',
                    message: {
                        id: 1,
                        error: null,
                        result: [
                            ["mining.set_difficulty", "mining.notify"],
                            "ae6812eb4cd7735a302a8a9dd95cf71",
                            4
                        ]
                    }
                }));
            }, 1000);

            // Simulate authorization
            setTimeout(() => {
                ws.send(JSON.stringify({
                    type: 'stratum', 
                    message: {
                        id: 2,
                        error: null,
                        result: true
                    }
                }));

                // Send fake job
                sendFakeJob();
            }, 2000);

        } catch (error) {
            console.error('Pool connection failed:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: `Pool connection failed: ${error.message}`
            }));
        }
    }

    function sendFakeJob() {
        const job = {
            id: null,
            method: "mining.notify",
            params: [
                "a1b2c3d4",
                "0000000000000000000000000000000000000000000000000000000000000000",
                "01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff2003b2a905",
                "0d2f6e6f64655374726174756d2f00000000020000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf90000000000000000266a24b9e11b6d00000000",
                [],
                "20000000",
                "1d00ffff",
                Math.floor(Date.now() / 1000).toString(16),
                true
            ]
        };

        setInterval(() => {
            ws.send(JSON.stringify({
                type: 'stratum',
                message: job
            }));
        }, 30000); // New job every 30 seconds
    }

    ws.on('close', () => {
        console.log('WebSocket connection closed');
        if (poolSocket) {
            poolSocket.close();
        }
    });
});

// API endpoint for pool status
app.get('/api/pool-status/:poolUrl', async (req, res) => {
    try {
        const poolUrl = req.params.poolUrl;
        // Simulate pool status check
        res.json({
            online: true,
            latency: Math.floor(Math.random() * 100) + 50,
            workers: Math.floor(Math.random() * 1000) + 100,
            hashrate: (Math.random() * 1000).toFixed(2) + ' GH/s'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Hobbit Miner server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} to start mining!`);
});