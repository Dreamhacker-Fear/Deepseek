const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const API_KEY = process.env.BRAWLSTARS_API_KEY;
const API_BASE_URL = process.env.BRAWLSTARS_API_BASE_URL || 'https://api.brawlstars.com/v1';

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'Deepseek backend',
    apiConfigured: Boolean(API_KEY),
    apiBaseUrl: API_BASE_URL
  });
});

async function proxyBrawlStars(req, res, resourcePath) {
  if (!API_KEY) {
    return res.status(503).json({
      error: 'BRAWLSTARS_API_KEY is missing. Set it in a .env file before using the API.'
    });
  }

  try {
    const url = new URL(`${API_BASE_URL}${resourcePath}`);
    const response = await fetch(url, {
      method: req.method,
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const text = await response.text();
    let payload;

    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = text;
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Brawl Stars API request failed',
        details: payload
      });
    }

    return res.status(response.status).json(payload);
  } catch (error) {
    console.error('Brawl Stars proxy error:', error);
    return res.status(500).json({
      error: 'Failed to reach the Brawl Stars API',
      details: error.message
    });
  }
}

app.get('/api/players/:tag', async (req, res) => {
  const tag = encodeURIComponent(req.params.tag.trim());
  return proxyBrawlStars(req, res, `/players/%23${tag.replace(/^%23/, '')}`);
});

app.get('/api/clubs/:tag', async (req, res) => {
  const tag = encodeURIComponent(req.params.tag.trim());
  return proxyBrawlStars(req, res, `/clubs/%23${tag.replace(/^%23/, '')}`);
});

app.get('/api/brawlers', async (req, res) => {
  return proxyBrawlStars(req, res, '/brawlers');
});

app.get('/api/players', (req, res) => {
  res.status(400).json({ error: 'Player tag is required. Example: /api/players/2P9QJ2Y' });
});

app.get('/api/clubs', (req, res) => {
  res.status(400).json({ error: 'Club tag is required. Example: /api/clubs/2P9QJ2Y' });
});

const rootDir = __dirname;
const staticFile = path.join(rootDir, 'menu-1.html');

app.use(express.static(rootDir));

app.get('/', (req, res) => {
  res.sendFile(staticFile);
});

app.get('*', (req, res) => {
  res.sendFile(staticFile);
});

app.listen(PORT, () => {
  console.log(`Deepseek backend running on http://localhost:${PORT}`);
});
