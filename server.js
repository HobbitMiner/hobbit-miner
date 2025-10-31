import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Serve static files from public folder
app.use(express.static(join(__dirname, 'public')));
app.use(express.json());

// Store connected clients for Server-Sent Events
const clients = new Set();

// Middleware to log requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// SSE endpoint for mining
app.get('/api/events', (req, res) => {
    console.log('🔌 New SSE connection request');
    
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
    });

    const clientId = Date.now();
    clients.add(res);
    
    console.log(`✅ SSE client connected: ${clientId}`);
    
    // Send welcome message
    res.write(`data: ${JSON.stringify({
        type: 'status',
        message: 'Connected to Hobbit Miner server'
    })}\n\n`);

    // Send initial pool connection
    setTimeout(() => {
        res.write(`data: ${JSON.stringify({
            type: 'pool_connected',
            pool: 'Hobbit Miner Pool',
            message: 'Ready to start mining'
        })}\n\n`);
    }, 1000);

    // Handle client disconnect
    req.on('close', () => {
        console.log(`❌ SSE client disconnected: ${clientId}`);
        clients.delete(res);
    });
});

// Broadcast to all clients
function broadcast(data) {
    console.log(`📢 Broadcasting to ${clients.size} clients:`, data.type);
    clients.forEach(client => {
        try {
            client.write(`data: ${JSON.stringify(data)}\n\n`);
        } catch (error) {
            console.error('Error broadcasting to client:', error);
        }
    });
}

// Start mining endpoint
app.post('/api/start-mining', express.json(), (req, res) => {
    try {
        const { wallet, worker, pool, threads } = req.body;
        
        if (!wallet || !worker || !pool || !threads) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields' 
            });
        }
        
        console.log(`🚀 Starting mining: ${wallet}.${worker} on ${pool} with ${threads} threads`);
        
        // Broadcast to all clients
        broadcast({
            type: 'pool_connected',
            pool: pool,
            message: `Connected to ${pool}`
        });
        
        // Simulate mining jobs
        const jobInterval = setInterval(() => {
            const jobId = 'job_' + Date.now();
            broadcast({
                type: 'mining_job',
                jobId: jobId,
                target: '0000ffff00000000000000000000000000000000000000000000000000000000',
                timestamp: Date.now()
            });
        }, 10000);
        
        // Simulate found shares
        const shareInterval = setInterval(() => {
            if (Math.random() > 0.7) { // 30% chance to find share
                broadcast({
                    type: 'share_accepted',
                    shareId: 'share_' + Date.now(),
                    message: 'Share accepted by pool'
                });
            }
        }, 15000);
        
        // Store intervals for cleanup
        const intervals = { jobInterval, shareInterval };
        setTimeout(() => {
            clearInterval(intervals.jobInterval);
            clearInterval(intervals.shareInterval);
            console.log('🔄 Mining intervals cleaned up');
        }, 3600000); // Cleanup after 1 hour
        
        res.json({ 
            success: true, 
            message: 'Mining started successfully',
            clientCount: clients.size
        });
        
    } catch (error) {
        console.error('Error in start-mining:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

// Stop mining endpoint
app.post('/api/stop-mining', express.json(), (req, res) => {
    try {
        broadcast({
            type: 'status',
            message: 'Mining stopped by user'
        });
        
        res.json({ 
            success: true, 
            message: 'Mining stopped',
            clientCount: clients.size
        });
        
    } catch (error) {
        console.error('Error in stop-mining:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

// API routes
app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'online',
        clients: clients.size,
        message: 'Hobbit Miner is running! 🚀',
        timestamp: new Date().toISOString()
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

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        uptime: process.uptime(),
        clients: clients.size,
        timestamp: new Date().toISOString()
    });
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.get('/miner.js', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'miner.js'));
});

// Catch all handler - must be last
app.get('*', (req, res) => {
    if (req.url.startsWith('/api/')) {
        res.status(404).json({ error: 'API endpoint not found' });
    } else {
        res.sendFile(join(__dirname, 'public', 'index.html'));
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`⚡ Hobbit Miner Server running on port ${PORT}`);
    console.log(`🌐 Open http://localhost:${PORT} to start mining!`);
    console.log(`📊 API endpoints available at /api/status, /api/health`);
});
