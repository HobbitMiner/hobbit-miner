import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const app = express();
const server = createServer(app);

// Serve static files
app.use(express.static('public'));

// WebSocket for mining
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('Miner connected');
    
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        
        if (data.action === 'start') {
            // Simulate pool connection
            ws.send(JSON.stringify({
                type: 'connected',
                pool: data.pool
            }));
            
            // Send fake mining job
            setInterval(() => {
                ws.send(JSON.stringify({
                    type: 'job',
                    jobId: Date.now().toString(),
                    target: '0000ffff00000000000000000000000000000000000000000000000000000000'
                }));
            }, 30000);
        }
    });
});

// API route
app.get('/api/status', (req, res) => {
    res.json({ status: 'Hobbit Miner is running!' });
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/public/index.html');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Hobbit Miner running on port ${PORT}`);
});
