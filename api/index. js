const axios = require('axios');

const FF_ACCOUNT_ID = process.env.FF_ACCOUNT_ID;
const FF_API_BASE = 'https://fuckingfast.net/api';
const FF_DOMAIN = 'https://fuckingfast.net';

const manifest = {
  id: 'org.aicurv.fsl',
  version: '1.0.0',
  name: 'FSL Relay',
  description: 'Your personal fuckingfast.net library',
  resources: ['catalog', 'stream'],
  types: ['movie'],
  catalogs: [{ type: 'movie', id: 'fsl_files', name: 'My Files' }],
};

async function getFiles() {
  try {
    const resp = await axios.get(`${FF_API_BASE}/fs`, {
      headers: { Authorization: `Bearer ${FF_ACCOUNT_ID}` },
    });
    return resp.data.data.filter((item) => !item.isDirectory);
  } catch (error) {
    console.error('Failed to fetch files:', error.message);
    return [];
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  if (path.includes('manifest.json')) {
    return res.status(200).json(manifest);
  }

  if (path.includes('/catalog/movie/')) {
    const files = await getFiles();
    const metas = files.map((file) => ({
      id: file.id,
      type: 'movie',
      name: file.name,
      description: `Size: ${(file.size / 1e9).toFixed(2)} GB`,
    }));
    return res.status(200).json({ metas });
  }

  if (path.includes('/stream/movie/')) {
    const parts = path.split('/');
    const fileId = parts[parts.length - 1].replace('.json', '');
    const streamUrl = `${FF_DOMAIN}/${fileId}`;
    return res.status(200).json({
      streams: [{ title: 'Direct Download', url: streamUrl }],
    });
  }

  return res.status(404).json({ error: 'Not found. Path: ' + path });
};
