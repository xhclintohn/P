const axios = require('axios');
const cheerio = require('cheerio');

const KOREAN_SURNAMES = [
  'Kim', 'Lee', 'Park', 'Choi', 'Jung', 'Kang', 'Cho', 'Yoon', 'Jang',
  'Lim', 'Han', 'Oh', 'Seo', 'Shin', 'Kwon', 'Hwang', 'Ahn', 'Song',
  'Yoo', 'Hong', 'Moon', 'Yang', 'Bae', 'Baek', 'Heo', 'Nam', 'Yun',
  'Noh', 'Ha', 'Jeon', 'Ko', 'Gu', 'Son', 'Min', 'Ryu', 'Woo', 'Ji'
];

const KOREAN_MALE_NAMES = [
  'Minho', 'Joon', 'Hyun', 'Sungho', 'Taemin', 'Jihoon', 'Dongwoo',
  'Seojun', 'Hajun', 'Dohyun', 'Juwon', 'Siwoo', 'Yejun', 'Jiho',
  'Junwoo', 'Gunwoo', 'Hyunjun', 'Minseok', 'Seonwoo', 'Jaehyun'
];

const KOREAN_FEMALE_NAMES = [
  'Minji', 'Soojin', 'Yuna', 'Jihye', 'Haeun', 'Soyeon', 'Eunji',
  'Chaeyoung', 'Jiwon', 'Dahyun', 'Seoah', 'Yerin', 'Nayeon', 'Seoyeon',
  'Hayoon', 'Jieun', 'Sujin', 'Yujin', 'Arin', 'Sua'
];

async function getKoreanName(customName = '') {
  try {
    const response = await axios.get('https://namegenerators.com/id/korean/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const pageTitle = $('title').text().trim();

    const gender = Math.random() > 0.5 ? 'male' : 'female';
    const surname = KOREAN_SURNAMES[Math.floor(Math.random() * KOREAN_SURNAMES.length)];
    const nameList = gender === 'male' ? KOREAN_MALE_NAMES : KOREAN_FEMALE_NAMES;
    const givenName = nameList[Math.floor(Math.random() * nameList.length)];
    const fullName = `${surname} ${givenName}`;

    return {
      name: fullName,
      gender: gender,
      input: customName || 'random',
      source: pageTitle || 'Korean Name Generator'
    };
  } catch {
    const gender = Math.random() > 0.5 ? 'male' : 'female';
    const surname = KOREAN_SURNAMES[Math.floor(Math.random() * KOREAN_SURNAMES.length)];
    const nameList = gender === 'male' ? KOREAN_MALE_NAMES : KOREAN_FEMALE_NAMES;
    const givenName = nameList[Math.floor(Math.random() * nameList.length)];

    return {
      name: `${surname} ${givenName}`,
      gender: gender,
      input: customName || 'random'
    };
  }
}

module.exports = { getKoreanName };
