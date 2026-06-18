const { callGroq } = require('../services/groq');
const { getAgendamentoPrompt } = require('../prompts/agendamento');
const { salvarAgendamento } = require('../services/sheets');

function getHorariosDisponiveis() {
  const hoje = new Date().toLocaleDateString('pt-BR');
  const amanha = new Date(Date.now() + 86400000).toLocaleDateString('pt-BR');
  return `${hoje}: 09:00, 10:00, 11:00, 14:00, 15:00, 16:00\n${amanha}: 09:00, 10:30, 13:00, 14:30, 16:00`;
}

async function handleAgendamento(message, history, phone) {
  const horarios = getHorariosDisponiveis();
  const prompt = getAgendamentoPrompt(horarios);

  const response = await callGroq(history, prompt, 250);

  if (response.includes('CONFIRMAR_AGENDAMENTO|')) {
    const parts = response.split('CONFIRMAR_AGENDAMENTO|')[1].split('|');
    const [nome, servico, data, hora] = parts.map(s => s.trim());

    await salvarAgendamento({ telefone: phone, nome, servico, data, hora });

    return `✅ Agendamento confirmado!\n\n👤 Nome: ${nome}\n📋 Serviço: ${servico}\n📅 Data: ${data}\n⏰ Hora: ${hora}\n\nAté lá! Qualquer dúvida, é só chamar. 😊`;
  }

  return response;
}

module.exports = { handleAgendamento };
