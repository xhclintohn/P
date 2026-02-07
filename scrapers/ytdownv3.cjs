const axios = require('axios');

const delay = ms => new Promise(r => setTimeout(r, ms));

async function ytdown(url, type = 'video') {
  if (!url) throw new Error('url parameter is required');

  const { data } = await axios.post('https://ytdown.to/proxy.php', new URLSearchParams({ url }), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  const api = data.api;
  if (!api) throw new Error('Failed to fetch video info');

  const media = api.mediaItems.find((m) => m.type.toLowerCase() === type.toLowerCase());
  if (!media) throw new Error('Media type not found. Available: video, audio');

  let attempts = 0;
  const maxAttempts = 12;

  while (attempts < maxAttempts) {
    const { data: res } = await axios.get(media.mediaUrl);

    if (res?.error === 'METADATA_NOT_FOUND') throw new Error('Metadata not found');

    if (res.percent === 'Completed' && res.fileUrl !== 'In Processing...') {
      return {
        info: {
          title: api.title,
          desc: api.description,
          thumbnail: api.imagePreviewUrl,
          views: api.mediaStats?.viewsCount,
          uploader: api.userInfo?.name,
          quality: media.mediaQuality,
          duration: media.mediaDuration,
          extension: media.mediaExtension,
          size: media.mediaFileSize,
        },
        download: res.fileUrl,
      };
    }

    await delay(5000);
    attempts++;
  }

  throw new Error('Download processing timed out');
}

module.exports = { ytdown };
