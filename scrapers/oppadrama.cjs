const axios = require("axios");
const cheerio = require("cheerio");

async function search(query) {
  const { data: html } = await axios.get("http://45.11.57.217", {
    params: { s: query },
  });
  const $ = cheerio.load(html);
  let result = [];

  $("article.bs").each((i, v) => {
    const title = $(v).find(".tt h2").text().trim();
    const url = $(v).find("a").attr("href");
    const image = $(v).find("img").attr("src");
    const status = $(v).find(".status").text() || $(v).find(".bt .epx").text();
    const type = $(v).find(".typez").text();
    const subtitle = $(v).find(".sb").text();
    const episode = $(v).find(".epx").text();

    result.push({ title, 
      url, 
      image, 
      status, 
      type, 
      subtitle, 
      episode 
    });
  });
  return result;
}

async function getDetail(url) {
  const { data: html } = await axios.get(url);
  const $ = cheerio.load(html);

  const title = $(".entry-title").text().trim();
  const image = $(".bigcover img").attr("src") || $(".thumb img").attr("src");
  const synopsis = $(".entry-content").text().replace(/\s+/g, ' ').trim();
  const status = $(".spe span:contains('Status:')").text().replace("Status:", "").trim();
  const network = $(".spe span:contains('Network:')").text().replace("Network:", "").trim();
  const country = $(".spe span:contains('Negara:')").text().replace("Negara:", "").trim();
  const type = $(".spe span:contains('Tipe:')").text().replace("Tipe:", "").trim();
  const episodeCount = $(".spe span:contains('Episode:')").text().replace("Episode:", "").trim();
  const director = $(".spe span:contains('Sutradara:')").text().replace("Sutradara:", "").trim();
  const cast = $(".spe span:contains('Artis:')").text().replace("Artis:", "").trim();
  const releaseDate = $(".spe span:contains('Dirilis:')").first().text().replace("Dirilis:", "").trim();
  const lastUpdated = $(".spe span:contains('Diperbarui pada:')").text().replace("Diperbarui pada:", "").trim();
  
  const genres = [];
  $(".genxed a").each((i, el) => genres.push($(el).text().trim()));
  
  const tags = [];
  $(".bottom.tags a").each((i, el) => tags.push($(el).text().trim()));
  
  const episodes = [];
  $(".eplister ul li").each((i, el) => {
    episodes.push({
      number: $(el).find(".epl-num").text().trim(),
      title: $(el).find(".epl-title").text().trim(),
      date: $(el).find(".epl-date").text().trim(),
      url: $(el).find("a").attr("href")
    });
  });

  const alternativeTitles = $(".alter").text().trim().split(" / ");
  const firstEpisode = $(".inepcx .epcurfirst").text().trim();
  const lastEpisode = $(".inepcx .epcurlast").text().trim();

  return {
    title,
    image,
    synopsis,
    status,
    network,
    country,
    type,
    episodeCount,
    director,
    cast,
    releaseDate,
    lastUpdated,
    genres,
    tags,
    episodes,
    alternativeTitles,
    firstEpisode,
    lastEpisode
  };
}

module.exports = { search, getDetail };
