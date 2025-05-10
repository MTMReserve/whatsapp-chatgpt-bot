[v1.6.0] – 2025-05-10
Etapa 16 – Suporte a Mensagens de Voz (Áudio)

Objetivo
Adicionar capacidade ao bot de interpretar mensagens de voz recebidas no WhatsApp e responder com mensagens de voz geradas por IA (TTS), tornando a interação mais natural, humanizada e acessível.

Funcionalidades Implementadas
🎙️ Reconhecimento de Áudio (STT – Speech to Text)
Novo módulo audioService.ts criado em src/services com função:

transcribeAudio(audioBuffer: Buffer): Promise<string> usando Whisper API da OpenAI

Ao receber um áudio no webhook, o bot:

Baixa o arquivo via downloadMedia(mediaId)

Transcreve o conteúdo

Injeta o texto no pipeline de resposta (state machine, intents etc.)

🔊 Geração de Respostas em Áudio (TTS – Text to Speech)
Mesmo módulo audioService.ts agora também oferece:

synthesizeSpeech(text: string): Promise<Buffer> com ElevenLabs API

Se o usuário enviar áudio, o bot responde em áudio também

Regra simples implementada: "entrada áudio → resposta áudio"

O áudio gerado é enviado via sendAudio(phone, buffer) após upload para o WhatsApp Cloud

🔄 Integrações modificadas
webhookController.ts:

Suporte total a message.type === 'audio'

Fluxo com try/catch e fallback textual em caso de erro

Detecta tipo da mensagem, transcreve e injeta no handleMessage(...)

Envia resposta como texto ou áudio conforme decisão do conversationManager

conversationManager.ts:

Nova função handleMessage(...) agora retorna { text?, audioBuffer? }

Se options.isAudio === true, gera resposta falada via synthesizeSpeech(...)

whatsapp.ts:

Criadas funções:

downloadMedia(mediaId)

sendAudio(to, buffer)

sendText(to, text) já existia, foi mantida

🧪 Testes Automatizados
audioService.test.ts (unit):

Mock de chamadas HTTP para Whisper e ElevenLabs

Testes com sucesso e falha (erro simulado)

voiceMessage.integration.test.ts (integração):

Simula payload do WhatsApp com áudio

Stub de downloadMedia, transcribeAudio, synthesizeSpeech, sendAudio

Verifica que o bot responde corretamente com áudio

webhook.e2e.test.ts atualizado com:

Simulação de entrada message.type: "audio" e validação da resposta

Cobertura mantida em nível adequado e sem regressões

Variáveis de Ambiente Novas
env
Copiar
Editar

# OpenAI Whisper

OPENAI_KEY=

# ElevenLabs

ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
Impactos e Compatibilidade
✅ Mensagens de texto continuam funcionando normalmente

✅ Falhas no áudio são tratadas com resposta alternativa em texto

✅ Código modular permite trocar o provedor de STT/TTS no futuro

✅ Nenhuma dependência anterior foi quebrada

✅ Pronto para testes reais com usuários e produção## [v1.1.0] – 2025-04-30

**Release final das Etapas 11 a 13 – Documentação, CI/CD e versão final**

### Etapa 11 – Documentação

- Ativado Swagger UI em `src/app.ts` com:
  - `swagger-jsdoc`
  - `swagger-ui-express`
  - Rota `/api-docs`
- Adicionado JSDoc nas rotas
- Atualizado `README.md` com instruções de instalação e exemplos de uso

### Etapa 12 – CI/CD com GitHub Actions

- Criado workflow `.github/workflows/ci.yml`
  - Roda `npm run lint`
  - Executa `npm test`
- Disparo automático em `main`, `develop`, e `v*.*.*` (tags)

### Etapa 13 – Versão Final e Release

- Atualizado `package.json` para `1.1.0`
- Tag criada com:
  ```bash
  git tag -a v1.1.0 -m "Release v1.1.0 - CI/CD, Swagger docs e estabilização final"
  git push origin v1.1.0
  ```

---

## [v1.0.0] – 2025-04-29

**Etapa 10 – Testes Automatizados**

- **Testes unitários (Jest)** para:
  - `clientRepository.ts`
  - `rateLimiterMiddleware.ts`
  - `humanizer.ts`, `conversationManager.ts`, `OpenAI`, `Twilio`, `validation`, `errorMiddleware`
- **Testes de integração (Supertest + Jest)**:
  - `webhook.integration.test.ts`
  - `clientRepository.integration.test.ts`
- Configurações:
  - `tsconfig.json`: `strict: true`, `esModuleInterop: true`
  - `package.json`: versão `1.0.0`
- Cobertura ≥ 86 %

---

## [v0.2.1] – 2025-04-28

**Etapa 7 – Services**

- `clientRepository.ts`: CRUD básico usando `mysql2/promise`
- `humanizer.ts`: funções `delay(ms)` e `randomDelay(min,max)`
- `conversationManager.ts`: lógica de camadas de prompt
- Testes unitários para todos os serviços

---

## [v0.2.0] – 2025-04-28

**Etapa 8 – Prompts**

- Criados arquivos:
  - `01-sistema.ts`, `02-perfilCliente.ts`, `03-abordagem.ts`, `04-levantamento.ts`, `05-proposta.ts`, `06-negociacao.ts`, `07-posVenda.ts`
- Todos os arquivos exportam uma constante com prompt-base
- Comentários `TODO` incluídos para ajustes de conteúdo

---

## [v0.1.5] – 2025-04-27

**Etapa 9 – App & Server**

- `app.ts`: Express configurado com:
  - `body-parser`, CORS, helmet
  - Middlewares de validação, erro, rate-limit
  - Rota `/webhook`
- `server.ts`: instancia `app` e inicia servidor
- Teste: `npm run dev` funciona corretamente

---

## [v0.1.4] – 2025-04-27

**Etapa 6 – Controllers**

- `webhookController.ts`: exporta `handleWebhook(req, res)` → `res.sendStatus(200)`
- Rota `/webhook` aceita GET e POST
- Testes de integração com Supertest

---

## [v0.1.3] – 2025-04-27

**Etapa 5 – Middlewares**

- `errorMiddleware.ts`: captura erros e retorna 500
- `validationMiddleware.ts`: usa `Zod` para validar `req.body`
- `rateLimiterMiddleware.ts`: `rate-limiter-flexible` com controle de requisições
- Testes unitários para todos os middlewares

---

## [v0.1.2] – 2025-04-26

**Etapa 4 – Utilitários**

- `db.ts`: cria pool MySQL com `mysql2/promise`, função `testDbConnection()`
- `logger.ts`: usa Winston com níveis e cores para o console
- Testes:
  - `SELECT 1` na base
  - `logger.info('test')` imprime corretamente

---

## [v0.1.1] – 2025-04-26

**Etapa 3 – Clientes de API**

- `openai.ts`: instancia `OpenAI({ apiKey })`
- `twilio.ts`: instancia `Twilio(accountSid, authToken)`
- Testes:
  - Listar modelos OpenAI
  - `twilioClient.api.accounts.fetch()` retorna dados da conta

---

## [v0.1.0] – 2025-04-25

**Etapa 2 – Configuração de Ambiente**

- `.env.example` criado com:
  ```env
  TWILIO_ACCOUNT_SID=
  TWILIO_AUTH_TOKEN=
  TWILIO_WHATSAPP_NUMBER_FROM=
  TWILIO_WHATSAPP_NUMBER_TO=
  OPENAI_KEY=
  DB_HOST=
  DB_PORT=
  DB_USER=
  DB_PASSWORD=
  DB_NAME=
  RATE_LIMIT_POINTS=
  RATE_LIMIT_DURATION=
  HUMANIZER_MIN_DELAY_MS=
  HUMANIZER_MAX_DELAY_MS=
  LOG_LEVEL=
  ```
- `env.ts`: usa `zod` para validar `.env`
- Teste:
  - Sem `.env` → erro de validação
  - Com `.env` válido → sucesso

---

## [v0.0.1-alpha] – 2025-04-24

**Etapa 1 – Setup Inicial**

- Criados arquivos:
  - `package.json` com `npm init -y`
  - `.gitignore` com `node_modules`, `.env`
  - `tsconfig.json`: `strict: true`, `rootDir: src`
- Git:
  - Branch: `feat/setup`
  - Commit: `chore: setup initial project structure`
- Testes:
  - `npm install` sem erros
  - `npm run dev` inicializa o servidor

---

## 📦 Dependências Essenciais

### Produção

- `express`, `body-parser`, `cors`, `helmet`
- `openai`, `twilio`
- `mysql2/promise`, `dotenv`
- `winston`, `rate-limiter-flexible`, `zod`

### Desenvolvimento e Testes

- `typescript`, `ts-node-dev`
- `jest`, `ts-jest`, `supertest`
- `eslint`, `prettier`
- `@typescript-eslint/*`, `eslint-plugin-prettier`, `eslint-config-prettier`
- `swagger-jsdoc`, `swagger-ui-express`

---

> Cada etapa foi testada com scripts e coberta por testes automatizados.  
> A tag `v1.1.0` representa a primeira release final **estável**, com documentação, CI e testes concluídos.
