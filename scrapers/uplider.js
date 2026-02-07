const Formdata = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function uplider(filePath) {
    const form = new Formdata();
    form.append('file', fs.createReadStream(filePath));
    const { data: v } = await axios.post('https://uplider.my.id/upload', form, {
        headers: {
            ...form.getHeaders(),
            "user-agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36",
            "origin": "https://uplider.my.id/",
            "content-type": "multipart/form-data; boundary=----WebKitFormBoundarysCJEdfTMBKwBpWzZ",
            "accept": "*/*"
        },
    });

    return {
        status: 'succes',
        urls: 'https://uplider.my.id' + v?.url
    };
};

module.exports = { uplider };
