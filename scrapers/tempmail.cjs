const axios = require('axios');

const API_BASE = 'https://api.mail.tm';
const HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

async function getDomains() {
  const { data } = await axios.get(`${API_BASE}/domains`, { headers: HEADERS });
  return Array.isArray(data) ? data : (data['hydra:member'] || []);
}

async function generateEmail(count = 1) {
  const domains = await getDomains();
  if (!domains.length) throw new Error('No domains available');

  const emails = [];
  for (let i = 0; i < Math.min(count, 5); i++) {
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const domainName = domain.domain || domain;
    const username = 'user' + Date.now() + Math.random().toString(36).slice(2, 8);
    const address = `${username}@${domainName}`;
    const password = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);

    try {
      const { data: account } = await axios.post(`${API_BASE}/accounts`, {
        address,
        password
      }, { headers: HEADERS });

      const { data: tokenData } = await axios.post(`${API_BASE}/token`, {
        address,
        password
      }, { headers: HEADERS });

      emails.push({
        email: account.address || address,
        id: account.id,
        token: tokenData.token,
        createdAt: account.createdAt
      });
    } catch (err) {
      if (i === 0) throw err;
    }
  }
  return emails;
}

async function getMessages(token) {
  if (!token) throw new Error('token parameter is required (from generateEmail response)');

  const { data } = await axios.get(`${API_BASE}/messages`, {
    headers: { ...HEADERS, 'Authorization': `Bearer ${token}` }
  });
  return Array.isArray(data) ? data : (data['hydra:member'] || []);
}

module.exports = { generateEmail, getMessages, getDomains };
