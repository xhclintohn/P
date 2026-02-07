const axios = require("axios");
const cheerio = require("cheerio");

async function ffKarakter() {
  const { data: html } = await axios.get(
    "https://freefire.fandom.com/wiki/Characters"
  );
  const $ = cheerio.load(html);

  let result = [];

  $('tr').each((_, v) => {
    const tds = $(v).find('td');
    
    if (tds.length >= 2) {
      const nameTd = $(tds[0]);
      const imageTd = $(tds[1]);
      const name = nameTd.find('a').text().trim();
      const wikiLink = 'https://freefire.fandom.com' + nameTd.find('a').attr('href');
      
      const fileSpan = imageTd.find('span[typeof="mw:File/Frameless"]');
      const imgLink = fileSpan.find('a').attr('href');
      const img = fileSpan.find('img');
      
      result.push({
        index: _ + 1,
        name: name,
        wiki: wikiLink,
        image: {
          original: imgLink,
          thumbnail: img.attr('data-src') || img.attr('src'),
          alt: img.attr('alt'),
          name: img.attr('data-image-name'),
          key: img.attr('data-image-key'),
        }
      });
    }
  });
  
  return result;
}

ffKarakter().then(console.log);

module.exports = { ffKarakter };
