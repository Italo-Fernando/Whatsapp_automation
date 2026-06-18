const { callGroq } = require('../services/groq');
const { getLeadsPrompt } = require('../prompts/leads');
const { salvarLead } = require('../services/sheets');

async function handleLeads(message, history, phone) {
  const prompt = getLeadsPrompt();
  const response = await callGroq(history, prompt, 250);

  if (response.includes('REGISTRAR_LEAD|')) {
    const parts = response.split('REGISTRAR_LEAD|')[1].split('|');
    const [nome, interesse] = parts.map(s => s.trim());

    await salvarLead({ telefone: phone, nome, interesse });

    return response.split('REGISTRAR_LEAD|')[0].trim();
  }

  return response;
}

module.exports = { handleLeads };
