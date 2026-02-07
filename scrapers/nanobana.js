const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

class NanoBanaAI {
    constructor() {
        this.baseURL = 'https://www.nanobana.net';
        this.filesURL = 'https://files.nanobana.net';
        
        this.cookies = `
            _ga=GA1.1.309218641.1769387797;
            __Host-authjs.csrf-token=17fe51370791f8a8954e97f29e0215e719c4ee8261b7512c338f7dd9c1959e74%7Cff3c9b2687ecc7ef888d6702fb770b74aacd14a663a590d1fb69968cad932279;
            g_state={"i_l":0,"i_ll":1769387829757,"i_b":"t0s3zZOEe06UZTr2hNxOCjcPYUYfJSFl5DsruHCh+AY","i_e":{"enable_itp_optimization":0}};
            __Secure-authjs.callback-url=https%3A%2F%2Fwww.nanobana.net%2Fauth%2Fsignin;
            _ga_SSP816TWDM=GS2.1.s1769387796$o1$g1$t1769387842$j14$l0$h0;
            __Secure-authjs.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiSWRmbEhwMk0teEF1V3l6Nkg1bHZrRHdOc0ZiM3BBOHVvMjNjaXhaZ1MxT1hHWUFNUUc0MGY0bW5XZnFtdWZyWnFYbHM2SFZILUZncDlvaUk5dTdIbHcifQ..0rSg9CIgGPysfI75pklIbw.HGWQX1WRLyzhg6IXDpiI-6r5WXwQheA9LV4vM3IiMMT-K1D96bT1qMbZWEaUL_4WMZV8supywxzJKQaEat_N-zj529y-UCD7m11s7yLaiHzjh8_YQ5TWeAwe5C8glkKD8ibRYyrzJHMxHc1z_hWjC8fzJXA3TIvZgM-3Sj_1HN9i3uicqxHj4DCTywYixgoVYrsRRB4Tez9pLDF4Bc6IOzncS4i9z6fYKfzkyB4UU1mIn-O0XMXe6B-iXaU_iTAjT_yolrcorTTaC6Mz6dctFe1DV0uF-MXpYnjUWJUG6WU994gnZoHetc-ZWupHEiowWvWAJOlMvK36tEDx2_qHJ9lVSV1jgOIM7DNZCoKU1CF1MuKg_CjOWK0zwPUr5hMCxzmOiJlAxOFP33ihoo3ICra5yJiqQTwrz-raUPvxlYJ-O8wb6hYaGGxyWlDzznk_ktGNha0kA6VVagX5RBEtXJMJKW-lMWr320Axkcs1PeoFFZZRjgeW4QNqccRffOVW8xgVCUYYuKtg69WWda_cS1pFLax_yOzm-sTYS0TOd-i_2nA5QTCMVcz8tiFatBXgEAgByXjn1himNuHlWiyDxJh-gXp4zytidKhTg46YCNGmSrYpdcVDN7kXx0Mqb9VaXGl1VUonM5PkAhMQv8XZdha2KbUifNZhAUsqPAX4UEiTDA4wiKvazwpl8zUqJC3wFxyMqXLBsemyY2Jfl6FjTr6b7ihGqm24FKZZhJyKcOKk.lzxeJe36s5fppqa_cppFR4J7cqHI0LrrjDeFMR0ksi8
        `.replace(/\n/g, '').replace(/\s+/g, ' ').trim();
        
        this.headers = {
            'authority': 'www.nanobana.net',
            'accept': '*/*',
            'accept-encoding': 'gzip, deflate, br, zstd',
            'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
            'content-type': 'application/json',
            'origin': this.baseURL,
            'priority': 'u=1,i',
            'referer': `${this.baseURL}/`,
            'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
            'sec-ch-ua-mobile': '?1',
            'sec-ch-ua-platform': '"Android"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36',
            'cookie': this.cookies
        };
    }

    async uploadImage(imagePath) {
        const formData = new FormData();
        const fileBuffer = fs.readFileSync(imagePath);
        
        formData.append('file', fileBuffer, {
            filename: path.basename(imagePath),
            contentType: 'image/png'
        });
        
        const uploadHeaders = {
            ...this.headers,
            ...formData.getHeaders(),
            'content-type': 'multipart/form-data'
        };
        
        const response = await axios.post(`${this.baseURL}/api/upload/image`, formData, {
            headers: uploadHeaders
        });
        
        return response.data.url;
    }

    async generateTask(imageUrl, prompt, options = {}) {
        const payload = {
            prompt: prompt,
            image_input: [imageUrl],
            output_format: options.format || 'png',
            aspect_ratio: options.aspect || '1:1',
            resolution: options.resolution || '1K'
        };
        
        const response = await axios.post(`${this.baseURL}/api/nano-banana-pro/generate`, payload, {
            headers: this.headers
        });
        
        return response.data.data.taskId;
    }

    async checkTask(taskId, prompt) {
        const response = await axios.get(`${this.baseURL}/api/nano-banana-pro/task/${taskId}`, {
            headers: this.headers,
            params: {
                save: 1,
                prompt: prompt
            }
        });
        
        const data = response.data.data;
        
        if (data.status === 'completed' && data.provider_state === 'success') {
            return data.savedFiles[0]?.publicUrl || data.result.images[0]?.url;
        }
        
        return null;
    }

    async waitForTask(taskId, prompt, interval = 2000, maxAttempts = 60) {
        for (let i = 0; i < maxAttempts; i++) {
            const result = await this.checkTask(taskId, prompt);
            
            if (result) {
                return result;
            }
            
            await new Promise(resolve => setTimeout(resolve, interval));
        }
        
        return null;
    }

    async downloadImage(imageUrl, savePath = './downloads') {
        if (!fs.existsSync(savePath)) {
            fs.mkdirSync(savePath, { recursive: true });
        }
        
        const filename = path.basename(imageUrl);
        const filePath = path.join(savePath, filename);
        
        const response = await axios.get(imageUrl, {
            responseType: 'stream',
            headers: {
                'Referer': this.baseURL
            }
        });
        
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);
        
        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(filePath));
            writer.on('error', reject);
        });
    }

    async generateImage(imagePath, prompt, options = {}) {
        const imageUrl = await this.uploadImage(imagePath);
        const taskId = await this.generateTask(imageUrl, prompt, options);
        const resultUrl = await this.waitForTask(taskId, prompt);

        if (resultUrl) {
            const savedPath = await this.downloadImage(resultUrl);
            return {
                success: true,
                taskId: taskId,
                resultUrl: resultUrl,
                savedPath: savedPath
            };
        }
        
        return {
            success: false,
            taskId: taskId
        };
    }

    async process(requests) {
        if (Array.isArray(requests)) {
            const results = [];
            for (const req of requests) {
                const result = await this.generateImage(
                    req.image,
                    req.prompt,
                    req.options || {}
                );
                results.push(result);
            }
            return results;
        }
        else {
            return await this.generateImage(
                requests.image,
                requests.prompt,
                requests.options || {}
            );
        }
    }
}

module.exports = { NanoBanaAI };
