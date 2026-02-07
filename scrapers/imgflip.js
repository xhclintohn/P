const axios = require('axios');
const cheerio = require('cheerio');

class ImgFlipScraper {
    constructor() {
        this.baseURL = 'https://imgflip.com';
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0'
        };
    }

    async scrapePopularMemes(page = 1) {
        const url = `${this.baseURL}/memetemplates${page > 1 ? `?page=${page}` : ''}`;
        
        const response = await axios.get(url, {
            headers: this.headers
        });

        const $ = cheerio.load(response.data);
        const memes = [];

        $('.mt-boxes .mt-box').each((index, element) => {
            const $element = $(element);
            
            const title = $element.find('.mt-title a').attr('title') || $element.find('.mt-title a').text().trim();
            const memeUrl = this.baseURL + $element.find('.mt-title a').attr('href');
            const imageUrl = 'https:' + $element.find('.mt-img-wrap img').attr('src');
            const generatorUrl = this.baseURL + $element.find('.mt-caption').attr('href');
            const altText = $element.find('.mt-img-wrap img').attr('alt');

            const style = $element.find('.mt-img-wrap img').attr('style') || '';
            const widthMatch = style.match(/width:([\d.]+)px/);
            const heightMatch = style.match(/height:([\d.]+)px/);
            
            const paddingStyle = $element.find('.mt-img-wrap').attr('style') || '';
            const paddingTopMatch = paddingStyle.match(/padding-top:([\d.]+)px/);
            const paddingBottomMatch = paddingStyle.match(/padding-bottom:([\d.]+)px/);

            const meme = {
                id: index + 1,
                title: title,
                memeUrl: memeUrl,
                imageUrl: imageUrl,
                generatorUrl: generatorUrl,
                altText: altText,
                dimensions: {
                    width: widthMatch ? parseFloat(widthMatch[1]) : null,
                    height: heightMatch ? parseFloat(heightMatch[1]) : null
                },
                padding: {
                    top: paddingTopMatch ? parseFloat(paddingTopMatch[1]) : null,
                    bottom: paddingBottomMatch ? parseFloat(paddingBottomMatch[1]) : null
                }
            };

            memes.push(meme);
        });

        return {
            page: page,
            totalMemes: memes.length,
            memes: memes
        };
    }

    async searchMemes(query, page = 1) {
        const url = `${this.baseURL}/memesearch`;
        const params = {
            q: query,
            page: page
        };

        const response = await axios.get(url, {
            headers: this.headers,
            params: params
        });

        const $ = cheerio.load(response.data);
        const memes = [];

        $('.mt-boxes .mt-box').each((index, element) => {
            const $element = $(element);
            
            const title = $element.find('.mt-title a').attr('title') || $element.find('.mt-title a').text().trim();
            const memeUrl = this.baseURL + $element.find('.mt-title a').attr('href');
            const imageUrl = 'https:' + $element.find('.mt-img-wrap img').attr('src');
            const generatorUrl = this.baseURL + $element.find('.mt-caption').attr('href');

            const meme = {
                id: index + 1,
                title: title,
                memeUrl: memeUrl,
                imageUrl: imageUrl,
                generatorUrl: generatorUrl
            };

            memes.push(meme);
        });

        const pagination = [];
        $('.pager a').each((index, element) => {
            const pageNum = $(element).text().trim();
            if (pageNum && !isNaN(pageNum)) {
                pagination.push(parseInt(pageNum));
            }
        });

        return {
            query: query,
            page: page,
            totalResults: memes.length,
            pagination: pagination,
            memes: memes
        };
    }

    async getMemeDetails(memeIdOrUrl) {
        let url;
        if (memeIdOrUrl.startsWith('http')) {
            url = memeIdOrUrl;
        } else {
            url = `${this.baseURL}/meme/${memeIdOrUrl}`;
        }

        const response = await axios.get(url, {
            headers: this.headers
        });

        const $ = cheerio.load(response.data);

        const title = $('h1').first().text().trim();
        const imageUrl = 'https:' + $('#mtm-img').attr('src');
        const viewsText = $('.mt-views').text().trim();
        const viewsMatch = viewsText.match(/([\d,]+)/);
        const views = viewsMatch ? parseInt(viewsMatch[1].replace(/,/g, '')) : 0;

        const tags = [];
        $('.mt-tags a').each((index, element) => {
            tags.push($(element).text().trim());
        });

        const description = $('.mt-description').text().trim();

        return {
            title: title,
            imageUrl: imageUrl,
            views: views,
            tags: tags,
            description: description,
            pageUrl: url
        };
    }

    async downloadMemeImage(imageUrl, savePath) {
        const fs = require('fs');
        const path = require('path');

        if (!fs.existsSync(savePath)) {
            fs.mkdirSync(savePath, { recursive: true });
        }

        const filename = path.basename(imageUrl);
        const filePath = path.join(savePath, filename);

        const response = await axios({
            method: 'GET',
            url: imageUrl,
            responseType: 'stream',
            headers: {
                'Referer': this.baseURL,
                'User-Agent': this.headers['User-Agent']
            }
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                resolve(filePath);
            });
            writer.on('error', reject);
        });
    }
}

module.exports = { ImgFlipScraper };
