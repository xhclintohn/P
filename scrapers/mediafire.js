const axios = require('axios');
const cheerio = require('cheerio');

function getMimeTypeFromUrl(url) {
    if (!url) return 'unknown';
    
    const fileName = url.split('/').pop().split('?')[0];
    const extension = fileName.split('.').pop().toLowerCase();
    
    const mimeTypes = {
        '7z': 'application/x-7z-compressed',
        'zip': 'application/zip',
        'rar': 'application/x-rar-compressed',
        'apk': 'application/vnd.android.package-archive',
        'exe': 'application/x-msdownload',
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'mp3': 'audio/mpeg',
        'mp4': 'video/mp4',
        'txt': 'text/plain',
        'json': 'application/json',
        'js': 'application/javascript',
        'html': 'text/html',
        'css': 'text/css'
    };
    
    return mimeTypes[extension];
}

async function mediafire(url) {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    const title = $('meta[property="og:title"]').attr('content');
    const images = $('meta[property="og:image"]').attr('content');
    const link_download = $('#downloadButton').attr('href');
    const sizes = $('#downloadButton').text().trim();
    const description = $('meta[property="og:description"]').attr('content') || 'not found description.';
    const size = sizes.replace('Download (', '').replace(')', '');
    const mimetype = getMimeTypeFromUrl(link_download);

    return { 
        meta: {
            title,
            images,
            description
        },
        download: {
            link_download,
            size,
            mimetype
        }
    };
}

module.exports = { mediafire };
