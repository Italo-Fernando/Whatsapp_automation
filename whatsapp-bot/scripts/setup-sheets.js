// Cria as abas agendamentos / leads / faq na planilha configurada
// e popula cabeçalhos. Idempotente (não duplica abas existentes).
const { google } = require('googleapis');
const path = require('path');
const os = require('os');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

function resolvePath(p) {
  if (!p) return p;
  if (p.startsWith('~')) return path.join(os.homedir(), p.slice(1));
  return p;
}

const SPECS = {
  agendamentos: ['id', 'telefone', 'nome', 'data', 'hora', 'servico', 'status'],
  leads: ['telefone', 'nome', 'interesse', 'data_contato', 'status'],
  faq: ['pergunta', 'resposta'],
};

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: resolvePath(process.env.GOOGLE_CREDENTIALS_PATH),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existing = new Set(meta.data.sheets.map(s => s.properties.title));
  console.log('Abas existentes:', [...existing]);

  const toCreate = Object.keys(SPECS).filter(name => !existing.has(name));
  if (toCreate.length) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: toCreate.map(title => ({ addSheet: { properties: { title } } })),
      },
    });
    console.log('Abas criadas:', toCreate);
  } else {
    console.log('Todas as abas já existem.');
  }

  for (const [name, headers] of Object.entries(SPECS)) {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${name}!1:1`,
    });
    const firstRow = res.data.values?.[0] || [];
    if (firstRow.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${name}!A1`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [headers] },
      });
      console.log(`Cabeçalho gravado em "${name}"`);
    } else {
      console.log(`Cabeçalho em "${name}" já existe — não toquei.`);
    }
  }

  console.log('\nOK ✅');
}

main().catch(err => {
  console.error('FALHA:', err.errors || err.message);
  process.exit(1);
});
