const axios = require('axios');

async function XeCurrency(amount = 1000, from = 'IDR', to = 'USD') {
  const { data } = await axios.get(`https://api.exchangerate-api.com/v4/latest/${from}`, {
    timeout: 10000
  });

  const rate = data.rates[to];
  if (!rate) {
    throw new Error(`Currency ${to} not found`);
  }

  const converted = (amount * rate).toFixed(4);

  return {
    title: `${amount} ${from} to ${to}`,
    conversion: `${amount} ${from} = ${converted} ${to}`,
    rate: `1 ${from} = ${rate} ${to}`,
    from: from,
    to: to,
    amount: amount,
    result: parseFloat(converted),
    timestamp: new Date().toISOString()
  };
}

module.exports = { XeCurrency };
