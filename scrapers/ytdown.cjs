const axios = require('axios');

async function ytmp3(bitrate, mode, url) {
  try {
  const headers = {
    'accept': 'application/json',
    'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'content-type': 'application/json',
    'origin': 'https://ytmp3.gg',
    'priority': 'u=1, i',
    'referer': 'https://ytmp3.gg/',
    'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
    'sec-ch-ua-mobile': '?1',
    'sec-ch-ua-platform': '"Android"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36'
  };

  const { data: v } = await axios.post('https://hub.y2mp3.co/', {
    audioBitrate: bitrate,
    audioFormat: "mp3", 
    brandName: "ytmp3.gg",
    downloadMode: mode,
    url: url
  }, {
    headers
  });

  return {
    title: v?.filename,
    url: v?.url,
    porgsurl: v?.progressUrl || null,
    size: v?.size || null
  }
} catch (e) {
  throw e;
}
}

module.exports = { ytmp3 };
