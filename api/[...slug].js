const axios = require('axios');

const FF_ACCOUNT_ID = process.env.FF_ACCOUNT_ID;
const FF_API_BASE = 'https://fuckingfast.net/api';
const FF_DOMAIN = 'https://fuckingfast.net';

// 1. Manifest
const manifest = {
  id: 'org.aicurv.fsl',
  version: '1.0.0',
  name: 'FSL Relay',
  description: 'Your personal fuckingfast.net library',
  resources: ['catalog', 'stream'],
  types: ['movie'],
  catalogs: [
    {
      type: 'movie',
      id: 'fsl_files',
      name: 'My Files',
    },
  ],
};

async function getFiles() {
  try {
    const resp = await axios.get(`${FF_API_BASE}/fs`, {
      headers: { Authorization: `Bearer ${FF_ACCOUNT_ID}` },
    });
    // The API returns data, we need to filter out directories
    return resp.data.data.filter((item) => !item.isDirectory);
  } catch (error) {
    console.error('Failed to fetch files:', error.message);
    return [];
  }
}

// 2. Handler
module.exports = async (req, res) => {
  // Allow all origins (important for Nuvio TV)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  // Serve manifest
  if (pathname === '/manifest.json') {
    return res.status(200).json(manifest);
  }

  // Serve catalog
  if (pathname.startsWith('/catalog/movie/fsl_files')) {
    const files = await getFiles();
    const metas = files.map((file) => ({
      id: file.id,
      type: 'movie',
      name: file.name,
      poster: 'https://via.placeholder.com/300x450?text=File', // Optional
      description: `Size: ${(file.size / 1e9).toFixed(2)} GB`,
    }));
    return res.status(200).json({ metas });
  }

  // Serve stream
  if (pathname.startsWith('/stream/movie/')) {
    const fileId = pathname.split('/').pop().replace('.json', '');
    const streamUrl = `${FF_DOMAIN}/${fileId}`;
    return res.status(200).json({
      streams: [
        {
          title: 'Direct Download',
          url: streamUrl,
        },
      ],
    });
  }

  return res.status(404).json({ error: 'Not found' });
};
