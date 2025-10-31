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
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    const clientId = Date.now();
    clients.add(res);
    
    console.log(`✅ Client connected: ${clientId}`);
    
    // Send welcome message
    res.write(`data: ${JSON.stringify({
        type: 'status',
        message: 'Connected to Hobbit Miner'
    })}\n\n`);

    // Handle client disconnect
    req.on('close', () => {
        console.log(`❌ Client disconnected: ${clientId}`);
        clients.delete(res);
    });
});

// Start mining endpoint
app.post('/api/start-mining', (req, res) => {
    try {
        const { wallet, worker, pool, threads } = req.body;
        
        console.log(`🚀 Start mining: ${wallet}.${worker}`);
        
        res.json({ 
            success: true, 
            message: 'Mining started successfully'
        });
        
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Server error' 
        });
    }
});

// Stop mining endpoint
app.post('/api/stop-mining', (req, res) => {
    res.json({ success: true, message: 'Mining stopped' });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        clients: clients.size
    });
});

// Serve miner.js explicitly
app.get('/miner.js', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'miner.js'));
});

// CATCH-ALL ROUTE - MUSÍ BYŤ POSLEDNÁ
app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`⚡ Hobbit Miner running on port ${PORT}`);
});
