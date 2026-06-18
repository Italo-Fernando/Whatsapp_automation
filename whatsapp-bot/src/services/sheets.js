const { google } = require('googleapis');
const path = require('path');
const os = require('os');
require('dotenv').config();

function resolvePath(p) {
  if (!p) return p;
  if (p.startsWith('~')) return path.join(os.homedir(), p.slice(1));
  return p;
}

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: resolvePath(process.env.GOOGLE_CREDENTIALS_PATH),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  return google.sheets({ version: 'v4', auth });
}

async function appendRow(sheetName, values) {
  const sheets = await getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${sheetName}!A1`,
    valueInputOption: 'USER_ENTERED',
    resource: { values: [values] }
  });
}

async function readSheet(sheetName) {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${sheetName}!A1:Z1000`
  });
  return res.data.values || [];
}

async function salvarAgendamento(dados) {
  const id = Date.now().toString();
  await appendRow('agendamentos', [
    id,
    dados.telefone,
    dados.nome,
    dados.data,
    dados.hora,
    dados.servico,
    'confirmado'
  ]);
  return id;
}

async function salvarLead(dados) {
  await appendRow('leads', [
    dados.telefone,
    dados.nome || 'Desconhecido',
    dados.interesse || '',
    new Date().toLocaleDateString('pt-BR'),
    'novo'
  ]);
}

module.exports = { salvarAgendamento, salvarLead, readSheet, appendRow };
