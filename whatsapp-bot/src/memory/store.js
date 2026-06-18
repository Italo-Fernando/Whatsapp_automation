const conversations = new Map();
const MAX_HISTORY = 10;

function getHistory(phone) {
  return conversations.get(phone) || [];
}

function addMessage(phone, role, content) {
  const history = getHistory(phone);
  history.push({ role, content });
  if (history.length > MAX_HISTORY) {
    history.splice(0, history.length - MAX_HISTORY);
  }
  conversations.set(phone, history);
}

function clearHistory(phone) {
  conversations.delete(phone);
}

module.exports = { getHistory, addMessage, clearHistory };
