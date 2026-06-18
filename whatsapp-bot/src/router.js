const { callGroq } = require('./services/groq');
const { getBasePrompt } = require('./prompts/base');

const INTENT_KEYWORDS = {
  agendamento: ['agendar', 'marcar', 'horário', 'horario', 'consulta', 'disponível', 'disponivel', 'agenda', 'remarcar', 'cancelar'],
  leads: ['interesse', 'informação', 'informacao', 'quanto custa', 'preço', 'preco', 'valor', 'quero saber', 'primeira vez', 'conhecer'],
  faq: ['dúvida', 'duvida', 'pergunta', 'como funciona', 'o que é', 'aceita', 'estaciona', 'endereço', 'endereco', 'localização', 'localizacao']
};

function detectIntentByKeyword(text) {
  const lower = text.toLowerCase();
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return intent;
    }
  }
  return null;
}

async function classifyIntent(message, history) {
  const keywordIntent = detectIntentByKeyword(message);
  if (keywordIntent) return keywordIntent;

  if (history.length === 0 || history.length === 1) {
    const prompt = `${getBasePrompt()}

Classifique a intenção desta mensagem em UMA das categorias:
- agendamento: quer marcar, remarcar ou cancelar horário
- leads: primeiro contato, quer saber sobre serviços/preços
- faq: dúvida sobre funcionamento, endereço, horários
- outro: não se encaixa em nenhuma categoria acima

Responda APENAS com a palavra da categoria, nada mais.

Mensagem: "${message}"`;

    const intent = await callGroq(
      [{ role: 'user', content: message }],
      prompt,
      10
    );
    return intent.trim().toLowerCase();
  }

  return 'outro';
}

module.exports = { classifyIntent };
