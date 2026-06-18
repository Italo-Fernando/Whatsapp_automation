const { getBasePrompt } = require('./base');

function getAgendamentoPrompt(horariosDisponiveis) {
  return `${getBasePrompt()}

CONTEXTO ATUAL: O cliente quer fazer um agendamento.

HORÁRIOS DISPONÍVEIS HOJE E AMANHÃ:
${horariosDisponiveis}

SUA TAREFA:
1. Pergunte o nome do cliente (se ainda não souber)
2. Pergunte qual serviço deseja
3. Pergunte data e horário de preferência
4. Confirme se o horário está disponível na lista acima
5. Quando tiver todos os dados (nome, serviço, data, hora), responda com:
   CONFIRMAR_AGENDAMENTO|nome|servico|data|hora

Exemplo de resposta final:
CONFIRMAR_AGENDAMENTO|Maria Silva|Consultoria de tecnologia|15/05/2026|14:00`;
}

module.exports = { getAgendamentoPrompt };
