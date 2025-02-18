import express from 'express';
import cors from 'cors';
import { remixContent } from './src/api/remix.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
let PORT = 3002;

app.use(cors());
app.use(express.json());

app.post('/api/remix', async (req, res) => {
  console.log('Received remix request');
  try {
    const { content } = req.body;
    console.log('Request content:', content);
    
    const result = await remixContent(content);
    console.log('Remix result before sending:', result);
    
    return res.json(result);
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
});

const startServer = () => {
  app.listen(PORT)
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy, trying ${PORT + 1}...`);
        PORT += 1;
        startServer();
      } else {
        console.error('Server error:', err);
      }
    })
    .on('listening', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
};

startServer(); 