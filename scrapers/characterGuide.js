const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeCharacterGuide(characterName) {
    const formattedName = characterName.toLowerCase().replace(/\s+/g, '-');
    const url = `https://keqingmains.com/q/${formattedName}-quickguide/`;
    
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    
    const pageCharacterName = $('h1.entry-title').text().trim();
    
    let infographicUrl = null;
    
    const infographicHeading = $('h1').filter(function() {
        return $(this).text().trim() === 'Infographic';
    }).first();
    
    if (infographicHeading.length) {
        const nextImage = infographicHeading.nextAll('.wp-block-image').first().find('img');
        if (nextImage.length) {
            infographicUrl = nextImage.attr('src');
        }
    }
    
    if (!infographicUrl) {
        $('img').each(function() {
            const src = $(this).attr('src');
            if (src && src.includes('kqm-uploads')) {
                infographicUrl = src;
                return false;
            }
        });
    }
    
    if (infographicUrl) {
        if (infographicUrl.startsWith('/')) {
            const baseUrl = new URL(url);
            infographicUrl = `${baseUrl.origin}${infographicUrl}`;
        } else if (!infographicUrl.startsWith('http')) {
            infographicUrl = new URL(infographicUrl, url).href;
        }
    }
    
    const versionText = $('h6.wp-block-heading').first().text().trim();
    
    return {
        character: pageCharacterName,
        infographic: infographicUrl,
        url: url,
        version: versionText
    };
}

module.exports = { scrapeCharacterGuide };
