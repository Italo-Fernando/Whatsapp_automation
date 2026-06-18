const express = require('express');
const { classifyIntent } = require('./router');
const { handleAgendamento } = require('./handlers/agendamento');
const { handleLeads } = require('./handlers/leads');
const { handleFAQ } = require('./handlers/faq');
const { callGroq } = require('./services/groq');
const { sendText, sendTyping } = require('./services/evolution');
const { getHistory, addMessage } = require('./memory/store');
const { getBasePrompt } = require('./prompts/base');

require('dotenv').config();

const app = express();
app.use(express.json({ limit: '5mb' }));

const sessionIntent = new Map();
let seenMessageIds = new Set();

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/webhook', async (req, res) => {
  res.status(200).send('OK');

  try {
    const data = req.body;
    const payload = data?.data || data;

    const event = (data?.event || '').toLowerCase();
    if (event && event !== 'messages.upsert' && event !== 'messages-upsert') return;

    if (!payload?.message) return;
    if (payload.key?.fromMe) return;
    if (payload.messageType === 'audioMessage') return;

    const messageId = payload.key?.id;
    if (messageId) {
      if (seenMessageIds.has(messageId)) return;
      seenMessageIds.add(messageId);
      if (seenMessageIds.size > 500) {
        seenMessageIds = new Set([...seenMessageIds].slice(-250));
      }
    }

    const remoteJid = payload.key?.remoteJid || '';
    if (remoteJid.endsWith('@g.us')) return; // ignora grupos

    // DEBUG TEMPORÁRIO: descobrir onde está o telefone real quando o JID é @lid
    console.log('[DEBUG payload.key]', JSON.stringify(payload.key));
    console.log('[DEBUG payload top-level keys]', Object.keys(payload));
    if (payload.pushName) console.log('[DEBUG pushName]', payload.pushName);
    if (payload.participant) console.log('[DEBUG participant]', payload.participant);
    if (payload.sender) console.log('[DEBUG sender]', payload.sender);

    // Para JIDs comuns (@s.whatsapp.net), Evolution aceita só o número.
    // Para LIDs (@lid) precisamos passar o JID completo, pois o "número" do LID
    // não é um telefone real e Evolution só roteia se receber o JID inteiro.
    const phone = remoteJid.endsWith('@lid')
      ? remoteJid
      : remoteJid.replace('@s.whatsapp.net', '');
    const messageText =
      payload.message?.conversation ||
      payload.message?.extendedTextMessage?.text ||
      '';

    if (!messageText.trim()) return;

    console.log(`[${phone}] ${messageText}`);

    addMessage(phone, 'user', messageText);
    const history = getHistory(phone);

    let intent = sessionIntent.get(phone);
    const lower = messageText.toLowerCase();
    if (!intent || lower.includes('menu') || lower.includes('início') || lower.includes('inicio')) {
      intent = await classifyIntent(messageText, history);
      sessionIntent.set(phone, intent);
    }

    await sendTyping(phone, 1.5);

    let response;
    switch (intent) {
      case 'agendamento':
        response = await handleAgendamento(messageText, history, phone);
        break;
      case 'leads':
        response = await handleLeads(messageText, history, phone);
        break;
      case 'faq':
        response = await handleFAQ(messageText, history);
        break;
      default:
        response = await callGroq(history, getBasePrompt(), 200);
    }

    addMessage(phone, 'assistant', response);
    await sendText(phone, response);

    console.log(`[BOT → ${phone}] ${response}`);
  } catch (error) {
    console.error('Erro no webhook:', error.response?.data || error.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🤖 Bot rodando na porta ${PORT}`);
});
