# Fuck you brawlstars Backend

This repository now includes a small Node.js backend that serves the existing app and proxies requests to the official Brawl Stars API.

## Setup

1. Install dependencies:
   npm install
2. Copy `.env.example` to `.env` and add your Brawl Stars API key.
3. Start the app:
   npm start

## Endpoints

- `GET /api/health`
- `GET /api/players/:tag`
- `GET /api/clubs/:tag`
- `GET /api/brawlers`

## Important

- Do not expose the API key in browser code.
- Only use the official Brawl Stars API from the backend.
- Directly connecting to live game servers is not a supported or safe pattern for a web app.
