const axios = require('axios');
const FormData = require('form-data');
const dayat = require('fs');

function createGofileHeaders(token) {
    return {
        'authority': 'api.gofile.io',
        'accept': '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'authorization': `Bearer a0Wjaw8paeuRCl1FqHKK4XlPW8Jo8J6o`,
        'content-type': 'application/json',
        'origin': 'https://gofile.io',
        'referer': 'https://gofile.io/',
        'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-platform': '"Android"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36'
    };
}

function createUploadHeaders() {
    return {
        'authority': 'upload.gofile.io',
        'accept': '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'origin': 'https://gofile.io',
        'referer': 'https://gofile.io/',
        'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-platform': '"Android"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36'
    };
}

async function createFolder(parentFolderId, isPublic = true,) {
    const headers = createGofileHeaders('a0Wjaw8paeuRCl1FqHKK4XlPW8Jo8J6o');
    const payload = { parentFolderId, public: isPublic };
    
    const response = await axios.post('https://api.gofile.io/contents/createfolder', payload, { headers });
    return { success: true, data: response.data };
}

async function uploadFile(filePath, folderId, customToken = null) {
    const token = customToken || 'a0Wjaw8paeuRCl1FqHKK4XlPW8Jo8J6o';
    const form = new FormData();
    form.append('token', 'a0Wjaw8paeuRCl1FqHKK4XlPW8Jo8J6o');
    form.append('folderId', folderId);
    form.append('file', dayat.createReadStream(filePath));
    
    const headers = { ...createUploadHeaders(), ...form.getHeaders() };
    
    const response = await axios.post('https://upload.gofile.io/uploadfile', form, { headers });
    return { success: true, token, data: response.data };
}

module.exports = { createFolder, uploadFile };
