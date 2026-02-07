const axios = require("axios");
const FormData = require("form-data");
const crypto = require("crypto");

async function ytdown2(url) {
    const form = new FormData();
    form.append("url", url);

    function generateCookies() {
        const timestamp = Date.now();
        const phpsessid = crypto
            .createHash('md5')
            .update(timestamp.toString())
            .digest('hex')
            .substring(0, 26);
        
        const gaClientId = `GA1.1.${timestamp}.${crypto.randomInt(1000000000, 9999999999)}`;
        const gaSessionId = `GS2.1.s${timestamp}${String(Math.random()).substring(2, 4)}$${crypto.randomInt(0, 2)}$${crypto.randomInt(0, 2)}$${timestamp}$${crypto.randomInt(10, 99)}$${crypto.randomInt(0, 1)}$${crypto.randomInt(0, 1)}`;

        return `PHPSESSID=${phpsessid}; _ga=${gaClientId}; _ga_2K69M9RN1B=${gaSessionId}`;
    }
    const cookies = generateCookies();

    const headers = {
        "accept": "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        "cookie": cookies,
        "origin": "https://ytdown.to",
        "priority": "u=1, i",
        "referer": "https://ytdown.to/id2/",
        "sec-ch-ua": '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": '"Android"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36",
        "x-requested-with": "XMLHttpRequest",
        ...form.getHeaders()
    };

        const response = await axios.post("https://ytdown.to/proxy.php", 
            form, 
            { headers: headers }
        );
        
        return response.data;
}

module.exports = { ytdown2 };
