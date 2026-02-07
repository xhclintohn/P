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

const CRICKET_LEAGUES = [
  { id: 8048, name: 'Indian Premier League' },
  { id: 8043, name: 'Sheffield Shield' },
  { id: 8039, name: 'ICC Cricket World Cup' },
  { id: 8038, name: 'ICC World Cup Qualifier' },
  { id: 8044, name: 'Big Bash League' },
  { id: 8042, name: 'Standard Bank Cup' },
  { id: 8045, name: 'Super Smash' },
  { id: 8052, name: 'Pakistan Super League' },
  { id: 8041, name: 'County Championship' },
  { id: 8053, name: 'Bangladesh Premier League' },
  { id: 8050, name: 'Caribbean Premier League' },
  { id: 8040, name: 'ICC Champions Trophy' }
];

function parseEvent(event, leagueName) {
  const competition = event.competitions?.[0];
  const competitors = competition?.competitors || [];

  const team1 = competitors[0] || {};
  const team2 = competitors[1] || {};

  const getInnings = (team) => {
    const linescores = team.linescores || [];
    return linescores.map((inning, idx) => ({
      innings: idx + 1,
      runs: inning.value || 0,
      wickets: inning.wickets || 0,
      overs: inning.opiOvers || inning.overs || ''
    }));
  };

  return {
    id: event.id,
    name: event.name || '',
    shortName: event.shortName || '',
    league: leagueName || '',
    series: event.season?.name || '',
    format: competition?.note || '',
    date: event.date || '',
    status: event.status?.type?.description || 'Unknown',
    statusDetail: event.status?.type?.detail || '',
    statusText: competition?.status?.type?.shortDetail || '',
    team1: {
      name: team1.team?.displayName || team1.team?.name || 'Unknown',
      abbreviation: team1.team?.abbreviation || '',
      score: team1.score || '',
      logo: team1.team?.logo || '',
      innings: getInnings(team1),
      winner: team1.winner || false
    },
    team2: {
      name: team2.team?.displayName || team2.team?.name || 'Unknown',
      abbreviation: team2.team?.abbreviation || '',
      score: team2.score || '',
      logo: team2.team?.logo || '',
      innings: getInnings(team2),
      winner: team2.winner || false
    },
    venue: competition?.venue?.fullName || '',
    city: competition?.venue?.address?.city || '',
    country: competition?.venue?.address?.country || '',
    result: competition?.status?.type?.detail || '',
    notes: (competition?.notes || []).map(n => n.headline || '').filter(Boolean)
  };
}

async function getCricketScores() {
  try {
    const allMatches = [];

    const requests = CRICKET_LEAGUES.map(league =>
      axios.get(`https://site.api.espn.com/apis/site/v2/sports/cricket/${league.id}/scoreboard`, {
        headers,
        timeout: 15000
      })
      .then(res => {
        const events = res.data?.events || [];
        for (const event of events) {
          allMatches.push(parseEvent(event, league.name));
        }
      })
      .catch(() => {})
    );

    await Promise.all(requests);

    if (allMatches.length === 0) {
      return await getCricketScoresFallback();
    }

    return {
      success: true,
      count: allMatches.length,
      matches: allMatches
    };
  } catch (error) {
    return await getCricketScoresFallback();
  }
}

async function getCricketScoresFallback() {
  try {
    const url = 'https://www.espncricinfo.com/live-cricket-score';
    const { data: html } = await axios.get(url, {
      headers,
      timeout: 15000
    });

    const $ = cheerio.load(html);
    const matches = [];

    $('[class*="match-score-block"], [class*="MatchCard"], [class*="match-info"]').each((i, el) => {
      const matchEl = $(el);
      const teams = [];
      const scores = [];

      matchEl.find('[class*="team-name"], [class*="TeamName"]').each((j, teamEl) => {
        teams.push($(teamEl).text().trim());
      });

      matchEl.find('[class*="score"], [class*="Score"]').each((j, scoreEl) => {
        scores.push($(scoreEl).text().trim());
      });

      const status = matchEl.find('[class*="status"], [class*="Status"], [class*="result"]').first().text().trim();
      const venue = matchEl.find('[class*="venue"], [class*="Venue"]').first().text().trim();

      if (teams.length >= 2) {
        matches.push({
          id: `cricket-${i}`,
          team1: {
            name: teams[0] || 'Unknown',
            score: scores[0] || ''
          },
          team2: {
            name: teams[1] || 'Unknown',
            score: scores[1] || ''
          },
          status: status || 'Unknown',
          venue: venue || '',
          source: 'espncricinfo'
        });
      }
    });

    return {
      success: true,
      count: matches.length,
      matches,
      note: matches.length === 0 ? 'No live/recent matches found at this time' : undefined
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch cricket scores',
      matches: []
    };
  }
}

module.exports = { getCricketScores };
