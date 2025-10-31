import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// Store connected clients
const clients = new Set();

// API routes - MUST come first
app.get('/api/events', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    const clientId = Date.now();
    clients.add(res);
    
    console.log(`✅ Client connected: ${clientId}`);
    
    // Send welcome
    res.write(`data: ${JSON.stringify({
        type: 'status',
        message: 'Connected to Hobbit Miner'
    })}\n\n`);

    // Handle disconnect
    req.on('close', () => {
        console.log(`❌ Client disconnected: ${clientId}`);
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

// Start mining
app.post('/api/start-mining', (req, res) => {
    try {
        const { wallet, worker, pool, threads } = req.body;
        
        console.log(`🚀 Start mining: ${wallet}.${worker}`);
        
        broadcast({
            type: 'pool_connected',
            pool: pool,
            message: `Connected to ${pool}`
        });
        
        res.json({ 
            success: true, 
            message: 'Mining started',
            clientCount: clients.size
        });
        
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Server error' 
        });
    }
});

// Stop mining
app.post('/api/stop-mining', (req, res) => {
    broadcast({
        type: 'status',
        message: 'Mining stopped'
    });
    
    res.json({ success: true, message: 'Mining stopped' });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        clients: clients.size
    });
});

// Status
app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'online',
        message: 'Hobbit Miner 🚀'
    });
});

// Serve miner.js
app.get('/miner.js', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'miner.js'));
});

// Catch-all - MUST BE LAST
app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`⚡ Server running on port ${PORT}`);
});
