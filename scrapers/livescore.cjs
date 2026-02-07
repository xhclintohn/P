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

async function getLiveScores() {
  try {
    const url = 'https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard';
    const { data } = await axios.get(url, {
      headers,
      timeout: 15000
    });

    if (!data || !data.events) {
      return { success: false, error: 'No events data found', scores: [] };
    }

    const scores = data.events.map(event => {
      const competition = event.competitions?.[0];
      const competitors = competition?.competitors || [];

      const homeTeam = competitors.find(c => c.homeAway === 'home');
      const awayTeam = competitors.find(c => c.homeAway === 'away');

      return {
        id: event.id,
        name: event.name || '',
        league: event.season?.type?.abbreviation || event.league?.abbreviation || '',
        date: event.date || '',
        status: event.status?.type?.description || 'Unknown',
        statusDetail: event.status?.type?.detail || '',
        clock: event.status?.displayClock || '',
        period: event.status?.period || 0,
        homeTeam: {
          name: homeTeam?.team?.displayName || homeTeam?.team?.name || 'Unknown',
          abbreviation: homeTeam?.team?.abbreviation || '',
          score: homeTeam?.score || '0',
          logo: homeTeam?.team?.logo || ''
        },
        awayTeam: {
          name: awayTeam?.team?.displayName || awayTeam?.team?.name || 'Unknown',
          abbreviation: awayTeam?.team?.abbreviation || '',
          score: awayTeam?.score || '0',
          logo: awayTeam?.team?.logo || ''
        },
        venue: competition?.venue?.fullName || '',
        broadcast: competition?.broadcasts?.[0]?.names?.[0] || ''
      };
    });

    return {
      success: true,
      count: scores.length,
      scores
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch live scores',
      scores: []
    };
  }
}

async function getLeagueStandings(league) {
  try {
    const leagueMap = {
      'epl': 'eng.1',
      'premier-league': 'eng.1',
      'laliga': 'esp.1',
      'la-liga': 'esp.1',
      'bundesliga': 'ger.1',
      'serie-a': 'ita.1',
      'seriea': 'ita.1',
      'ligue1': 'fra.1',
      'ligue-1': 'fra.1',
      'mls': 'usa.1',
      'liga-mx': 'mex.1',
      'eredivisie': 'ned.1',
      'primeira-liga': 'por.1',
      'championship': 'eng.2'
    };

    const leagueSlug = leagueMap[league?.toLowerCase()] || league || 'eng.1';

    const url = `https://site.api.espn.com/apis/v2/sports/soccer/${leagueSlug}/standings`;
    const { data } = await axios.get(url, {
      headers,
      timeout: 15000
    });

    if (!data || !data.children) {
      return { success: false, error: 'No standings data found', standings: [] };
    }

    const standings = [];

    for (const group of data.children) {
      const groupName = group.name || 'Overall';
      const entries = group.standings?.entries || [];

      for (const entry of entries) {
        const team = entry.team || {};
        const stats = {};

        for (const stat of (entry.stats || [])) {
          stats[stat.abbreviation || stat.name] = stat.displayValue || stat.value;
        }

        standings.push({
          group: groupName,
          rank: stats['R'] || stats['RANK'] || 0,
          team: {
            name: team.displayName || team.name || 'Unknown',
            abbreviation: team.abbreviation || '',
            logo: team.logos?.[0]?.href || ''
          },
          gamesPlayed: stats['GP'] || stats['P'] || '0',
          wins: stats['W'] || '0',
          draws: stats['D'] || '0',
          losses: stats['L'] || '0',
          goalsFor: stats['GF'] || stats['F'] || '0',
          goalsAgainst: stats['GA'] || stats['A'] || '0',
          goalDifference: stats['GD'] || '0',
          points: stats['PTS'] || stats['P'] || '0'
        });
      }
    }

    return {
      success: true,
      league: leagueSlug,
      count: standings.length,
      standings
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch league standings',
      league: league || 'unknown',
      standings: []
    };
  }
}

module.exports = { getLiveScores, getLeagueStandings };
