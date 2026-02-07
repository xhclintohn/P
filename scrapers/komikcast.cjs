const axios = require("axios");

const headers = {
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
  'Connection': 'keep-alive',
  'Host': 'be.komikcast.fit',
  'Origin': 'https://v1.komikcast.fit',
  'Referer': 'https://v1.komikcast.fit/',
  'Sec-Ch-Ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
  'Sec-Ch-Ua-Mobile': '?1',
  'Sec-Ch-Ua-Platform': '"Android"',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-site',
  'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36'
};

async function search(query, page = 1) {
  const { data: v } = await axios.get("https://be.komikcast.fit/series", {
    params: {
      filter: `title=like="${query}",nativeTitle=like="${query}"`,
      takeChapter: 2,
      includeMeta: true,
      take: 12,
      page: page,
    },
    headers: headers,
  });

  return {
    total: v.meta.total,
    page: v.meta.page,
    lastPage: v.meta.lastPage,
    series: v.data.map((series) => ({
      id: series.id,
      title: series.data.title,
      slug: series.data.slug,
      author: series.data.author,
      status: series.data.status,
      rating: series.data.rating,
      totalChapters: series.data.totalChapters,
      releaseDate: series.data.releaseDate,
      coverImage: series.data.coverImage,
      backgroundImage: series.data.backgroundImage,
      synopsis: series.data.synopsis,
      genres: series.data.genres.map((genre) => genre.data.name),
      chapters: series.chapters.map((chapter) => ({
        id: chapter.id,
        index: chapter.data.index,
        imageCount: Object.keys(chapter.dataImages || {}).length,
        images: chapter.dataImages,
      })),
      metadata: {
        views: series.metadata?.views?.total || 0,
        bookmarkCount: series.metadata?.bookmarkCount || 0,
        ranking: series.metadata?.ranking || 0,
      },
      createdAt: series.createdAt,
      updatedAt: series.updatedAt,
    })),
  };
}

async function detail(slug) {
  const { data: v } = await axios.get(`https://be.komikcast.fit/series/${slug}`, {
    params: {
      includeMeta: true
    },
    headers: headers,
  });

  return {
    id: v.data.id,
    title: v.data.data.title,
    slug: v.data.data.slug,
    author: v.data.data.author,
    status: v.data.data.status,
    rating: v.data.data.rating,
    totalChapters: v.data.data.totalChapters,
    releaseDate: v.data.data.releaseDate,
    coverImage: v.data.data.coverImage,
    backgroundImage: v.data.data.backgroundImage,
    synopsis: v.data.data.synopsis,
    genres: v.data.data.genres.map((genre) => genre.data.name),
    metadata: {
      views: v.data.metadata?.views?.total || 0,
      bookmarkCount: v.data.metadata?.bookmarkCount || 0,
      ranking: v.data.metadata?.ranking || 0,
    },
    createdAt: v.data.createdAt,
    updatedAt: v.data.updatedAt
  };
}

async function trending(page = 1, take = 10) {
  const { data: v } = await axios.get("https://be.komikcast.fit/series/trending", {
    params: {
      take: take,
      page: page,
    },
    headers: headers,
  });

  return {
    total: v.meta.total,
    page: v.meta.page,
    lastPage: v.meta.lastPage,
    take: v.meta.take,
    series: v.data.map((series) => ({
      id: series.id,
      title: series.data.title,
      slug: series.data.slug,
      author: series.data.author,
      status: series.data.status,
      rating: series.data.rating,
      totalChapters: series.data.totalChapters,
      releaseDate: series.data.releaseDate,
      coverImage: series.data.coverImage,
      backgroundImage: series.data.backgroundImage,
      synopsis: series.data.synopsis,
      genres: series.data.genres.map((genre) => genre.data.name),
      isHot: series.data.isHot,
      isRecommended: series.data.isRecommended,
      monthlyViews: series.data.monthlyViews,
      bookmarkCount: series.data.bookmarkCount,
      createdAt: series.createdAt,
      updatedAt: series.updatedAt,
    })),
  };
}

/*
(async() => {
    const data = await search('boruto');
    // console.log(JSON.stringify(data, null, 2));
    console.log(data);
})();
(async() => {
    const data = await detail('boruto-naruto-next-generations');
    console.log(JSON.stringify(data, null, 2));
})();

trending().then(console.log);
*/

module.exports = { search, detail, trending };
