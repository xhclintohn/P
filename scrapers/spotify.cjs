const axios = require('axios');

async function spotifySearch(query) {
  if (!query) throw new Error('query parameter is required');

  const encoded = encodeURIComponent(query);

  const { data } = await axios.get(`https://spotdown.org/api/song-details?url=${encoded}`, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  if (!data.songs || !data.songs.length) {
    throw new Error('No results found');
  }

  return data.songs.map(v => ({
    title: v.title || 'Unknown',
    artist: v.artist || 'Unknown',
    duration: v.duration || 'N/A',
    url: v.url || '',
    album: v.album || '',
    cover: v.cover || ''
  }));
}

module.exports = { spotifySearch };
