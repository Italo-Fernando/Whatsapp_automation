const { callGroq } = require('../services/groq');
const { getBasePrompt } = require('../prompts/base');
const { readSheet } = require('../services/sheets');

async function handleFAQ(message, history) {
  let faqContext = '';
  try {
    const rows = await readSheet('faq');
    faqContext = rows.slice(1)
      .filter(row => row[0])
      .map(row => `P: ${row[0]}\nR: ${row[1] || ''}`)
      .join('\n\n');
    if (!faqContext) faqContext = '(Nenhuma FAQ cadastrada ainda — use o conhecimento geral do negócio.)';
  } catch (e) {
    faqContext = 'FAQ não disponível no momento.';
  }

  const prompt = `${getBasePrompt()}

BASE DE CONHECIMENTO (use como referência para responder):
${faqContext}

Responda a dúvida do cliente baseando-se nas informações acima.
Se a informação não estiver na base, diga que vai verificar e pedirá para um atendente retornar.`;

  return await callGroq(history, prompt, 250);
}

module.exports = { handleFAQ };
