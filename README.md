# WhatsApp Bot com IA

Bot inteligente do WhatsApp que classifica intenções e automatiza respostas usando Evolution API, Groq IA e Google Sheets.

## 🚀 Funcionalidades

- **Classificação de Intenção**: Detecta automaticamente se é agendamento, lead ou FAQ
- **Respostas com IA**: Integração com Groq para respostas naturais
- **Agendamento**: Gerencia horários e consultas
- **Leads**: Captura e qualifica contatos
- **FAQ**: Respostas rápidas para perguntas frequentes
- **Histórico**: Mantém contexto da conversa

## 📋 Pré-requisitos

- [Node.js 16+](https://nodejs.org)
- [Evolution API](https://github.com/EvolutionAPI/evolution-api) rodando localmente ou em nuvem
- [Groq API Key](https://console.groq.com)
- [Google Sheets API](https://developers.google.com/sheets/api)
- Credenciais do Google Cloud (JSON)

## 💻 Instalação Local

### 1. Clone o repositório
```bash
git clone <seu-repo>
cd Whatsapp_automation/whatsapp-bot
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Copie `.env.example` para `.env` e preencha seus valores:

```bash
cp whatsapp-bot/.env.example whatsapp-bot/.env
```

Edite o arquivo `.env` com suas credenciais:

```env
# Evolution API
EVOLUTION_URL=http://localhost:8080
EVOLUTION_KEY=sua-chave-evolution-aqui
EVOLUTION_INSTANCE=sua-instancia-aqui

# Groq
GROQ_API_KEY=sua-chave-groq-aqui

# Google Sheets
GOOGLE_SHEET_ID=seu-sheet-id-aqui
GOOGLE_CREDENTIALS_PATH=/caminho/para/credenciais.json

# Negócio (personalize com seus dados)
BUSINESS_NAME=Seu Nome da Empresa
BUSINESS_TYPE=seu-tipo-negocio
BUSINESS_HOURS=Segunda a Sexta, 8h às 18h
ATTENDANT_NAME=Seu Nome

# Servidor
PORT=3000
```

**⚠️ IMPORTANTE:** Nunca commite o arquivo `.env` com dados reais. Ele está no `.gitignore`.

### 4. Inicie o bot
```bash
node src/index.js
```

O bot estará rodando em `http://localhost:3000` e aguardando webhooks da Evolution API.

## 🐳 Rodando com Docker

```bash
docker build -t whatsapp-bot .
docker run -p 3000:3000 --env-file .env whatsapp-bot
```

## ☁️ Deploy na Nuvem

### Railway.app (Recomendado)
1. Faça push para GitHub
2. Acesse https://railway.app
3. Conecte seu repositório GitHub
4. Configure as variáveis de ambiente no painel
5. Deploy automático ✅

**Custo:** ~$5-10/mês

### AWS EC2 ou App Runner
Veja documentação de deploy na wiki do projeto.

## 📦 Estrutura do Projeto

```
whatsapp-bot/
├── src/
│   ├── index.js          # Servidor Express principal
│   ├── router.js         # Classificação de intenção
│   ├── handlers/         # Lógica de agendamento, leads, FAQ
│   ├── services/         # Integrações (Groq, Evolution, Google Sheets)
│   ├── prompts/          # Prompts de IA
│   └── memory/           # Armazenamento de histórico
├── scripts/              # Utilitários (setup-sheets.js)
├── package.json
└── .env                  # Variáveis de ambiente (gitignore)
```

## 🔧 Configuração Windows (Sem Ficar Ligando)

### Opção 1: PM2 (Recomendado)
```bash
npm install -g pm2
pm2 start src/index.js --name "whatsapp-bot"
pm2 save
pm2 startup windows
```

### Opção 2: Task Scheduler
Crie uma tarefa que execute o script em horários específicos.

## 📊 Webhooks

O bot recebe webhooks da Evolution API em:
```
POST http://seu-servidor:3000/webhook
```

Health check:
```
GET http://seu-servidor:3000/health
```

## 🛠️ Desenvolvendo

### Adicionar novo handler de intenção
1. Crie novo arquivo em `src/handlers/`
2. Importe em `src/index.js`
3. Adicione ao switch de intenção
4. Atualize keywords em `src/router.js`

### Testar localmente
```bash
# Terminal 1: Evolution API
# Configure conforme sua instalação

# Terminal 2: Bot
node src/index.js

# Terminal 3: Envie mensagens via WhatsApp para o número cadastrado
```

## 📝 Variáveis de Ambiente

| Variável | Descrição | Obrigatório |
|----------|-----------|------------|
| `EVOLUTION_URL` | URL da Evolution API | ✅ |
| `EVOLUTION_KEY` | Chave de autenticação | ✅ |
| `EVOLUTION_INSTANCE` | Nome da instância | ✅ |
| `GROQ_API_KEY` | Chave da API Groq | ✅ |
| `GOOGLE_SHEET_ID` | ID da planilha Google | ✅ |
| `GOOGLE_CREDENTIALS_PATH` | Caminho do JSON de credenciais | ✅ |
| `BUSINESS_NAME` | Nome do negócio | ✅ |
| `BUSINESS_TYPE` | Tipo de negócio | ✅ |
| `BUSINESS_HOURS` | Horário de funcionamento | ✅ |
| `ATTENDANT_NAME` | Nome do atendente | ✅ |
| `PORT` | Porta do servidor | ❌ (padrão: 3000) |

## 🐛 Troubleshooting

**Bot parou de responder:**
- Verifique se a Evolution API está rodando
- Confirme que `EVOLUTION_INSTANCE` existe
- Cheque os logs: `pm2 logs` ou console

**Webhooks não chegam:**
- Verifique a URL no painel da Evolution API
- Certifique-se que a porta 3000 está acessível
- Teste com: `GET http://localhost:3000/health`

**Erro de credenciais Google:**
- Verifique o caminho em `GOOGLE_CREDENTIALS_PATH`
- Confirme que tem permissões de read/write na planilha

## 📚 Recursos

- [Evolution API](https://github.com/EvolutionAPI/evolution-api)
- [Groq API](https://console.groq.com)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Express.js](https://expressjs.com)

## 📄 Licença

ISC

## 👨‍💻 Autor

Desenvolvido com ❤️
