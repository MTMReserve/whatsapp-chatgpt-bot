# BOT MTM

Sistema de automação inteligente para vendas via WhatsApp, com suporte a mensagens de texto e voz, integração com ChatGPT (OpenAI), ElevenLabs e WhatsApp Cloud API. Projetado para funcionar como um vendedor automatizado adaptável a qualquer negócio.

---

## 📌 Visão Geral

**BOT MTM** é um sistema completo de chatbot comercial, preparado para:

- Conduzir clientes por um funil de vendas automatizado
- Entender intenções com base em palavras-chave e contexto
- Adaptar sua linguagem conforme uma persona pré-definida
- Enviar e receber mensagens de voz (STT + TTS)
- Funcionar tanto localmente quanto em produção com Docker

---

## ⚙️ Arquitetura e Componentes

```ascii
[ WhatsApp Cloud API ]
        │
        ▼
[ webhookController.ts ] ← Recebe mensagens
        │
        ▼
[ conversationManager.ts ] ← Orquestra fluxo com base em:
        ├─ Estado do cliente (clientRepository)
        ├─ Intenção (intentMap)
        ├─ Etapa do funil (stateMachine)
        ├─ Prompts (por estágio)
        └─ Humanização (delay, variação de texto)
        │
        ▼
[ audioService.ts ] ← TTS se necessário
        │
        ▼
[ whatsapp.ts ] ← Envia resposta (texto ou voz)
```

---

## 🔄 Fluxo de Conversa

1. Cliente envia mensagem (texto ou áudio)
2. Bot identifica tipo da mensagem
3. Transcreve áudio se necessário (Whisper API)
4. Classifica intenção (intentMap)
5. Determina próximo estado (stateMachine)
6. Seleciona prompt do estágio
7. Aplica humanização (delay, variação, tom da persona)
8. Responde com texto ou voz (ElevenLabs)

---

## 📁 Estrutura de Diretórios (Resumo)

- `src/controllers/` → Webhook principal
- `src/services/` → Lógica de negócio (STT, TTS, intents, estados, DB, humanização)
- `src/prompts/` → Prompts de conversa por etapa do funil
- `src/tests/` → Testes unitários, integração e e2e
- `docker-compose.yml` / `Dockerfile` → Execução em containers

---

## 🧪 Testes Automatizados

Cobertura de testes completa para garantir estabilidade:

### 🔹 Unitários (pasta `tests/unit/`)

- `audioService.test.ts`
- `intentMap.test.ts`
- `stateMachine.test.ts`
- `conversationManager.test.ts`
- `clientRepository.test.ts`
- Middlewares (`validation`, `rateLimiter`, `errorHandler`)

### 🔹 Integração (pasta `tests/integration/`)

- Simulação completa do fluxo com cliente fictício
- Testes com entrada em texto e áudio

### 🔹 End-to-End (pasta `tests/e2e/`)

- `webhook.e2e.test.ts`: simula requisições reais do WhatsApp

---

## 🚀 Execução Local

Pré-requisitos:

- Node.js 18+
- MySQL (pode usar XAMPP)
- Ngrok (para testes com WhatsApp)

### Instalar dependências:

```bash
npm install
```

### Configurar variáveis de ambiente:

Crie o arquivo `.env.local` com base no `.env.example`

### Rodar localmente com ngrok:

```bash
npm run dev
```

---

## 🐳 Deploy com Docker (Produção)

1. Configure `.env.production`
2. Suba os containers:

```bash
docker-compose up -d
```

3. Acesse via porta `3000` e conecte o webhook na Meta

---

## 🔑 Integrações

- **OpenAI Whisper API** → Transcrição de voz
- **ElevenLabs API** → Síntese de fala
- **WhatsApp Cloud API** → Envio e recebimento de mensagens

---

## 👤 Persona do Bot

- Nome: Leo
- Tom: descontraído, persuasivo e educado
- Estilo: usa variações naturais de fala, emojis leves e adapta vocabulário conforme cliente

---

## 🎯 Funil de Vendas Implementado

| Etapa        | Descrição                                  |
| ------------ | ------------------------------------------ |
| Abordagem    | Saudação, identificação do cliente         |
| Levantamento | Entendimento das necessidades              |
| Proposta     | Apresentação da oferta com PNL e ancoragem |
| Objeções     | Contra-argumentação com empatia            |
| Negociação   | Ajuste de condições                        |
| Fechamento   | Encerramento da venda com urgência leve    |
| Pós-venda    | Confirmação de satisfação e indicações     |
| Reativação   | Recuperação de clientes inativos           |
| Encerramento | Fim do atendimento com gratidão            |

---

## 📦 Comandos Úteis

### Testes

```bash
npm test
```

### Lint

```bash
npm run lint
```

### Gerar Cobertura

```bash
npm test -- --coverage
```

---

## 🛠️ Manutenção e Extensibilidade

- Os prompts são organizados por estado e podem ser facilmente modificados para outros produtos
- A estrutura modular permite trocar os serviços (ex: usar Google TTS ao invés de ElevenLabs)
- É possível adaptar o funil para diferentes perfis de negócios (ex: agendamento, SAC)

---

## 📚 Histórico de Versões

Veja o arquivo [`CHANGELOG.md`](./CHANGELOG.md) para detalhes técnicos de cada versão, incluindo testes, arquivos alterados e comandos Git.

---

## 📞 Suporte e Contribuições

Este projeto foi desenvolvido por Maurício para automação comercial com IA. Caso queira adaptar para outros segmentos, entre em contato ou contribua com melhorias via pull request.

---

> Projeto escalável, documentado e pronto para automação de vendas inteligente via WhatsApp.
