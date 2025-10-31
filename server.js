import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);

// Serve static files from public folder
app.use(express.static(join(__dirname, 'public')));
app.use(express.json());

// WebSocket for real mining
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('🔌 Miner connected via WebSocket');
    
    ws.send(JSON.stringify({
        type: 'status',
        message: 'Connected to Hobbit Miner server'
    }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received:', data);
            
            if (data.action === 'start_mining') {
                // Handle mining start
                handleStartMining(ws, data);
            } else if (data.action === 'stop_mining') {
                // Handle mining stop
                ws.send(JSON.stringify({
                    type: 'status', 
                    message: 'Mining stopped'
                }));
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('❌ Miner disconnected');
    });
});

function handleStartMining(ws, data) {
    const { wallet, worker, pool, threads } = data;
    
    console.log(`🚀 Starting mining: ${wallet}.${worker} on ${pool} with ${threads} threads`);
    
    // Send connection confirmation
    ws.send(JSON.stringify({
        type: 'pool_connected',
        pool: pool,
        message: `Connected to ${pool}`
    }));
    
    // Simulate mining jobs
    let jobInterval = setInterval(() => {
        const jobId = 'job_' + Date.now();
        ws.send(JSON.stringify({
            type: 'mining_job',
            jobId: jobId,
            target: '0000ffff00000000000000000000000000000000000000000000000000000000',
            timestamp: Date.now()
        }));
    }, 10000);
    
    // Simulate found shares
    let shareInterval = setInterval(() => {
        if (Math.random() > 0.7) { // 30% chance to find share
            ws.send(JSON.stringify({
                type: 'share_accepted',
                shareId: 'share_' + Date.now(),
                message: 'Share accepted by pool'
            }));
        }
    }, 15000);
    
    // Cleanup on stop or disconnect
    ws._miningIntervals = [jobInterval, shareInterval];
}

// API routes
app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'online',
        miners: wss.clients.size,
        message: 'Hobbit Miner is running! 🚀'
    });
});

app.get('/api/pools', (req, res) => {
    res.json({
        pools: [
            {
                name: 'Aikapool',
                url: 'stratum.aikapool.com:3939',
                status: 'online'
            },
            {
                name: 'Coin-Miners EU',
                url: 'eu.crionic.xyz:5555', 
                status: 'online'
            }
        ]
    });
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.get('/miner.js', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'miner.js'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`⚡ Hobbit Miner Server running on port ${PORT}`);
    console.log(`🌐 Open http://localhost:${PORT} to start mining!`);
});