const axios = require('axios');

async function getAccessToken() {
  const response = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
    auth: {
      username: process.env.MPESA_CONSUMER_KEY,
      password: process.env.MPESA_CONSUMER_SECRET,
    },
  });
  return response.data.access_token;
}

async function sendSMS(phoneNumber, message) {
  const accessToken = await getAccessToken();
  const response = await axios.post('https://sandbox.safaricom.co.ke/sms/v1/send', {
    to: phoneNumber,
    message,
    from: process.env.SAFARICOM_SHORTCODE,
  }, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
}

module.exports = { sendSMS }; 