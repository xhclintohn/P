const axios = require('axios');
const cheerio = require('cheerio');

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Cache-Control': 'no-cache'
};

async function getNBAScores(date) {
  try {
    let url = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard';

    if (date) {
      const dateStr = date.replace(/-/g, '');
      url += `?dates=${dateStr}`;
    }

    const { data } = await axios.get(url, {
      headers,
      timeout: 15000
    });

    if (!data || !data.events) {
      return { success: false, error: 'No NBA events data found', games: [] };
    }

    const games = data.events.map(event => {
      const competition = event.competitions?.[0];
      const competitors = competition?.competitors || [];

      const homeTeam = competitors.find(c => c.homeAway === 'home');
      const awayTeam = competitors.find(c => c.homeAway === 'away');

      const homeLeaders = homeTeam?.leaders || [];
      const awayLeaders = awayTeam?.leaders || [];

      const getLeader = (leaders, category) => {
        const leader = leaders.find(l => l.abbreviation === category || l.name === category);
        if (leader && leader.leaders?.[0]) {
          const athlete = leader.leaders[0];
          return {
            name: athlete.athlete?.displayName || '',
            value: athlete.displayValue || ''
          };
        }
        return null;
      };

      return {
        id: event.id,
        name: event.name || '',
        shortName: event.shortName || '',
        date: event.date || '',
        status: event.status?.type?.description || 'Unknown',
        statusDetail: event.status?.type?.detail || '',
        clock: event.status?.displayClock || '',
        period: event.status?.period || 0,
        homeTeam: {
          name: homeTeam?.team?.displayName || 'Unknown',
          abbreviation: homeTeam?.team?.abbreviation || '',
          score: homeTeam?.score || '0',
          record: homeTeam?.records?.[0]?.summary || '',
          logo: homeTeam?.team?.logo || '',
          winner: homeTeam?.winner || false
        },
        awayTeam: {
          name: awayTeam?.team?.displayName || 'Unknown',
          abbreviation: awayTeam?.team?.abbreviation || '',
          score: awayTeam?.score || '0',
          record: awayTeam?.records?.[0]?.summary || '',
          logo: awayTeam?.team?.logo || '',
          winner: awayTeam?.winner || false
        },
        venue: competition?.venue?.fullName || '',
        city: competition?.venue?.address?.city || '',
        state: competition?.venue?.address?.state || '',
        broadcast: competition?.broadcasts?.[0]?.names?.[0] || '',
        leaders: {
          homePoints: getLeader(homeLeaders, 'PTS'),
          homeRebounds: getLeader(homeLeaders, 'REB'),
          homeAssists: getLeader(homeLeaders, 'AST'),
          awayPoints: getLeader(awayLeaders, 'PTS'),
          awayRebounds: getLeader(awayLeaders, 'REB'),
          awayAssists: getLeader(awayLeaders, 'AST')
        }
      };
    });

    return {
      success: true,
      date: data.day?.date || new Date().toISOString().split('T')[0],
      count: games.length,
      games
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch NBA scores',
      games: []
    };
  }
}

module.exports = { getNBAScores };
