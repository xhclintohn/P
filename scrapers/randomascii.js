const crypto = require('crypto');

const CHARSETS = {
  all: Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join(''),
  alphalc: 'abcdefghijklmnopqrstuvwxyz',
  alphauc: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  alpha: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  alphanum: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  digits: '0123456789',
  hex: '0123456789abcdef',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

function generateRandomString(length, charset) {
  let result = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += charset[bytes[i] % charset.length];
  }
  return result;
}

async function scrapeRandomAscii(options = {}) {
  const length = parseInt(options.length) || 32;
  const count = parseInt(options.count) || 5;
  const charsetKey = options.charset || 'all';
  const charset = options.customCharset || CHARSETS[charsetKey] || CHARSETS.all;

  const results = [];
  for (let i = 0; i < count; i++) {
    results.push(generateRandomString(length, charset));
  }

  return {
    result: results.join('\n'),
    options: {
      length: length.toString(),
      count: count.toString(),
      charset: charsetKey,
      charsetLabel: charsetKey
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = { scrapeRandomAscii };
