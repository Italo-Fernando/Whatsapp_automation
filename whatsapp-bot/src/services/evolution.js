const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.EVOLUTION_URL;
const INSTANCE = process.env.EVOLUTION_INSTANCE;
const API_KEY = process.env.EVOLUTION_KEY;

async function sendText(phone, text) {
  try {
    await axios.post(
      `${BASE_URL}/message/sendText/${INSTANCE}`,
      { number: phone, text },
      { headers: { apikey: API_KEY }, timeout: 15000 }
    );
  } catch (e) {
    const detail = e.response?.data;
    console.error('[sendText error] number=', phone, 'detail=', JSON.stringify(detail, null, 2));
    throw e;
  }
}

async function sendTyping(phone, seconds = 2) {
  try {
    await axios.post(
      `${BASE_URL}/chat/sendPresence/${INSTANCE}`,
      { number: phone, presence: 'composing', delay: seconds * 1000 },
      { headers: { apikey: API_KEY }, timeout: 5000 }
    );
  } catch (e) {
    // presence é "best effort" — versões/estados sem instância conectada falham silenciosamente
  }
  await new Promise(r => setTimeout(r, seconds * 1000));
}

module.exports = { sendText, sendTyping };
