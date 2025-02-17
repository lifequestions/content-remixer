import express from 'express';
import cors from 'cors';
import { remixContent } from './src/api/remix.js';

const app = express();
let PORT = 3002;

app.use(cors());
app.use(express.json());

app.post('/api/remix', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    console.log('Processing content:', content.substring(0, 50) + '...');
    const result = await remixContent(content);
    res.json(result);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message });
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