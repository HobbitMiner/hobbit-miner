import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// MIDDLEWARE - musí byť PRVÉ
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// Store connected clients
const clients = new Set();

// SSE endpoint
app.get('/api/events', (req, res) => {
    console.log('📡 SSE connection request');
    
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    const clientId = Date.now();
    clients.add(res);
    
    console.log(`✅ SSE client connected: ${clientId}`);
    
    // Send welcome message
    res.write(`data: ${JSON.stringify({
        type: 'status',
        message: 'Connected to Hobbit Miner'
    })}\n\n`);

    // Handle client disconnect
    req.on('close', () => {
        console.log(`❌ SSE client disconnected: ${clientId}`);
        clients.delete(res);
    });
});

// Broadcast function
function broadcast(data) {
    clients.forEach(client => {
        try {
            client.write(`data: ${JSON.stringify(data)}\n\n`);
        } catch (error) {
            console.error('Broadcast error:', error);
        }
    });
}

// START MINING endpoint - OPAKOVANÉ VOLANIE
app.post('/api/start-mining', (req, res) => {
    console.log('📍 /api/start-mining called');
    
    try {
        // Skontroluj či je to JSON
        if (!req.is('application/json')) {
            return res.status(400).json({ 
                success: false, 
                error: 'Content-Type must be application/json' 
            });
        }

        const { wallet, worker, pool, threads } = req.body;
        
        if (!wallet || !worker) {
            return res.status(400).json({ 
                success: false, 
                error: 'Wallet and worker are required' 
            });
        }
        
        console.log(`🚀 Starting mining: ${wallet}.${worker} on ${pool} with ${threads} threads`);
        
        // Broadcast to all clients
        broadcast({
            type: 'pool_connected',
            pool: pool,
            message: `Connected to ${pool}`
        });
        
        // Simuluj nájdenie shares
        const shareInterval = setInterval(() => {
            if (Math.random() < 0.3) {
                broadcast({
                    type: 'share_accepted',
                    message: 'Share accepted by pool'
                });
            }
        }, 10000);
        
        // Cleanup after 1 hour
        setTimeout(() => {
            clearInterval(shareInterval);
        }, 3600000);
        
        res.json({ 
            success: true, 
            message: 'Mining started successfully',
            clientCount: clients.size
        });
        
    } catch (error) {
        console.error('Error in /api/start-mining:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error: ' + error.message 
        });
    }
});

// STOP MINING endpoint
app.post('/api/stop-mining', (req, res) => {
    console.log('📍 /api/stop-mining called');
    
    try {
        broadcast({
            type: 'status',
            message: 'Mining stopped by user'
        });
        
        res.json({ 
            success: true, 
            message: 'Mining stopped successfully'
        });
        
    } catch (error) {
        console.error('Error in /api/stop-mining:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

// HEALTH CHECK endpoint
app.get('/api/health', (req, res) => {
    console.log('📍 /api/health called');
    res.json({ 
        status: 'healthy',
        clients: clients.size,
        timestamp: new Date().toISOString()
    });
});

// STATUS endpoint
app.get('/api/status', (req, res) => {
    console.log('📍 /api/status called');
    res.json({ 
        status: 'online',
        clients: clients.size,
        message: 'Hobbit Miner is running! 🚀'
    });
});

// EXPLICITNE definuj všetky API routes pred catch-all
app.get('/api/test', (req, res) => {
    res.json({ message: 'API test successful' });
});

// Serve miner.js explicitly
app.get('/miner.js', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'miner.js'));
});

// CATCH-ALL ROUTE - MUSÍ BYŤ POSLEDNÁ
app.get('*', (req, res) => {
    console.log('📍 Catch-all route:', req.url);
    
    if (req.url.startsWith('/api/')) {
        // Ak je to API call a dostali sme sa sem, endpoint neexistuje
        res.status(404).json({ 
            error: 'API endpoint not found',
            url: req.url,
            availableEndpoints: [
                'GET /api/events',
                'POST /api/start-mining', 
                'POST /api/stop-mining',
                'GET /api/health',
                'GET /api/status'
            ]
        });
    } else {
        // Serve HTML pre všetky ostatné routes
        res.sendFile(join(__dirname, 'public', 'index.html'));
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`⚡ Hobbit Miner Server running on port ${PORT}`);
    console.log(`📊 Available endpoints:`);
    console.log(`   GET  /api/events`);
    console.log(`   POST /api/start-mining`);
    console.log(`   POST /api/stop-mining`);
    console.log(`   GET  /api/health`);
    console.log(`   GET  /api/status`);
    console.log(`   GET  /api/test`);
});
