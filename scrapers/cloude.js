/*
- [ Cloude ]
- Created: Rizki
- Base: https://claude.online
- Channel: https://whatsapp.com/channel/0029VaxtSLDGZNCjvEXsw93f
*/

const axios = require('axios');

async function claude(prompt) {
    const headers = {
        "accept": "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        "connection": "keep-alive",
        "content-type": "application/json",
        "origin": "https://claude.online",
        "referer": "https://claude.online/",
        "sec-ch-ua": '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": '"Android"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "user-agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36"
    };
    const { data: chat } = await axios.post('https://wewordle.org/gptapi/v1/web/turbo', {
        messages: [
            {
                content: prompt,
                role: "user"
            }
        ],
    }, { headers });

    return {
        limit: chat?.limit,
        fullLimit: chat?.fullLimit,
        messages: {
            id: chat?.message?.id,
            created: chat?.message?.created,
            role: chat?.message?.role,
            result: chat?.message?.content
        },
    };
};

module.exports = { claude };
