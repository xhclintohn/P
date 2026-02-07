const axios = require('axios');
const cheerio = require('cheerio');
const qs = require('qs');

async function twitterDL(link) {
  try {
    const config = { 'url': link };

    const { data } = await axios.post('https://www.expertsphp.com/instagram-reels-downloader.php', qs.stringify(config), {
      headers: {
        "content-type": 'application/x-www-form-urlencoded',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
      },
    });

    const $ = cheerio.load(data);
    const videoUrl = $('table.table-condensed tbody tr td video').attr('src') ||
                     $('table.table-condensed tbody tr td a[download]').attr('href');

    if (!videoUrl) throw new Error("Video not found, please check the Twitter URL.");

    return {
      url: link,
      video: videoUrl
    };
  } catch (err) {
    throw new Error(err.message || "Failed to download Twitter video");
  }
}

module.exports = { twitterDL };
