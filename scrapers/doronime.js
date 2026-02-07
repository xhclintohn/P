const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');

class DoronimeScraper {
    constructor() {
        this.baseURL = 'https://doronime.id';
        this.headers = {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
            'priority': 'u=0, i',
            'referer': 'https://doronime.id/',
            'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
            'sec-ch-ua-mobile': '?1',
            'sec-ch-ua-platform': '"Android"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36'
        };
    }

    generateCookie() {
        const timestamp = Math.floor(Date.now() / 1000);
        const ga1 = `GA1.2.${Math.floor(Math.random() * 1000000000)}.${timestamp}`;
        const gid = `GA1.2.${Math.floor(Math.random() * 1000000000)}.${timestamp}`;
        
        const cfClearance = crypto.randomBytes(32).toString('hex');
        
        return `_ga=${ga1}; _gid=${gid}; cf_clearance=${cfClearance}`;
    }

    async search(keyword) {
        const cookie = this.generateCookie();
        const headers = {
            ...this.headers,
            'cookie': cookie
        };

        const params = {
            s: keyword
        };

        const response = await axios.get(`${this.baseURL}/search`, {
            headers,
            params
        });

        const $ = cheerio.load(response.data);
        const results = [];

        $('.Card--column').each((index, element) => {
            const $el = $(element);
            const title = $el.attr('title');
            const url = $el.attr('href');
            const image = $el.find('img').attr('src');
            const type = $el.find('.Card__badge--bottom').text().trim();
            const status = $el.find('.Badge--success').text().trim();

            results.push({
                title,
                url,
                image,
                type,
                status
            });
        });

        return results;
    }

    async getDetails(animeUrl) {
        const cookie = this.generateCookie();
        const headers = {
            ...this.headers,
            'cookie': cookie
        };

        const response = await axios.get(animeUrl, { headers });
        const $ = cheerio.load(response.data);

        const title = $('.Content__title').text().trim();
        const japaneseTitle = $('.Content__tabs-content-title span').text().trim();
        const description = $('meta[property="og:description"]').attr('content');
        const image = $('meta[property="og:image"]').attr('content');
        
        const info = {};
        $('.Content__header-caption-item').each((index, element) => {
            const $el = $(element);
            const label = $el.find('b').text().replace(':', '').trim();
            const value = $el.find('span, a').map((i, el) => $(el).text().trim()).get().join(', ');
            
            if (label && value) {
                info[label.toLowerCase()] = value;
            }
        });

        const episodes = [];
        $('.Content__table-body').each((index, element) => {
            const $el = $(element);
            const episodeNumber = $el.find('.col:first-child a').text().trim();
            const episodeTitle = $el.find('.col-9.col-md-7 a').text().trim();
            const episodeUrl = $el.find('.col:first-child a').attr('href');
            const releaseDate = $el.find('.d-none.d-md-block.col:first-of-type').text().trim();
            const downloadUrl = $el.find('.d-none.d-md-block.col:last-of-type a').attr('href');

            episodes.push({
                episode: episodeNumber,
                title: episodeTitle,
                url: episodeUrl,
                releaseDate: releaseDate,
                downloadUrl: downloadUrl
            });
        });

        const synopsis = $('.Content__tabs-content--small p').text().trim();

        return {
            title,
            japaneseTitle,
            description,
            image,
            info,
            synopsis,
            episodes
        };
    }

    async searchWithDetails(keyword) {
        const searchResults = await this.search(keyword);
        
        const allResultsWithDetails = [];
        
        for (const result of searchResults) {
            const details = await this.getDetails(result.url);
            allResultsWithDetails.push({
                searchResult: result,
                details: details
            });
        }
        
        return allResultsWithDetails;
    }
}

module.exports = { DoronimeScraper };
