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

// SSE endpoint for mining
app.get('/api/events', (req, res) => {
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
        message: 'Connected to Hobbit Miner server'
    })}\n\n`);

    // Handle client disconnect
    req.on('close', () => {
        console.log(`❌ SSE client disconnected: ${clientId}`);
        clients.delete(res);
    });
});

// Broadcast to all clients
function broadcast(data) {
    clients.forEach(client => {
        try {
            client.write(`data: ${JSON.stringify(data)}\n\n`);
        } catch (error) {
            console.error('Error broadcasting to client:', error);
        }
    });
}

// Start mining endpoint
app.post('/api/start-mining', (req, res) => {
    try {
        const { wallet, worker, pool, threads } = req.body;
        
        console.log(`🚀 Starting mining: ${wallet}.${worker} on ${pool} with ${threads} threads`);
        
        // Broadcast to all clients
        broadcast({
            type: 'pool_connected',
            pool: pool,
            message: `Connected to ${pool}`
        });
        
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
app.post('/api/stop-mining', (req, res) => {
    try {
        broadcast({
            type: 'status',
            message: 'Mining stopped by user'
        });
        
        res.json({ 
            success: true, 
            message: 'Mining stopped'
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
        message: 'Hobbit Miner is running! 🚀'
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        clients: clients.size
    });
});

// Serve main page - MUST BE LAST
app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`⚡ Hobbit Miner Server running on port ${PORT}`);
});
