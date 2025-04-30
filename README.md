# WhatsApp ChatGPT Bot

## 📝 Visão Geral

Este projeto fornece uma API em **Node.js** e **TypeScript** para automatizar conversas de vendas via WhatsApp, utilizando a API da OpenAI (ChatGPT) e o Twilio WhatsApp API. Principais funcionalidades:

- Receber e validar mensagens do WhatsApp (/webhook)
- Limitar requisições por IP (rate limiting)
- Simular delays humanos (humanizer)
- Gerenciar estado de conversa e prompts (conversation manager)
- CRUD de clientes via MySQL (client repository)
- Documentação interativa via Swagger UI
- Cobertura de testes: unitários, integração e E2E

## 📁 Estrutura de Pastas

```
whatsapp-chatgpt-bot/
├── src/
│   ├── api/                # Clientes HTTP (OpenAI, Twilio)
│   │   ├── openai.ts       # Instancia OpenAI SDK
│   │   └── twilio.ts       # Instancia Twilio SDK
│   ├── config/
│   │   ├── env.ts          # Validação de env com Zod
│   │   └── swagger.ts      # Configuração Swagger JSdoc
│   ├── controllers/
│   │   └── webhookController.ts  # Lida com requisições do webhook
│   ├── middlewares/
│   │   ├── errorMiddleware.ts      # Tratamento global de erros (500)
│   │   ├── validationMiddleware.ts # Validação de payloads (400)
│   │   └── rateLimiterMiddleware.ts # Rate limiting (429)
│   ├── prompts/            # Templates de prompts para cada etapa do funil
│   │   ├── 01-sistema.ts
│   │   └── … até 07-posVenda.ts
│   ├── routes/
│   │   └── webhook.routes.ts       # Definição de rotas Express
│   ├── services/
│   │   ├── clientRepository.ts     # CRUD clientes MySQL
│   │   ├── humanizer.ts            # Simula delays humanos
│   │   └── conversationManager.ts  # Gerencia fluxo de prompts
│   ├── tests/
│   │   ├── unit/           # Testes unitários (Jest)
│   │   ├── integration/    # Testes de integração (Supertest)
│   │   └── e2e/            # Testes end-to-end (Supertest)
│   ├── types/             # Declarações customizadas (.d.ts)
│   ├── utils/
│   │   ├── db.ts           # Pool MySQL + testDbConnection()
│   │   └── logger.ts       # Logger Winston
│   ├── app.ts             # Configuração Express + Swagger UI
│   └── server.ts          # Entrypoint que carrega .env e inicia servidor
├── .env.example           # Exemplo de variáveis de ambiente
├── .eslintrc.js
├── .prettierrc
├── jest.config.js         # Configura Jest + ts-jest
├── tsconfig.json          # Configuração TS (strict, rootDir=src)
├── package.json           # Dependências e scripts
├── Dockerfile             # (Etapa 14) Containerização
├── docker-compose.yml     # (Etapa 14) MySQL + App
└── README.md              # Este arquivo
```

## ⚙️ Instalação e Execução

1. Clone o repositório e acesse a pasta:
   ```bash
   git clone <URL-do-repo>
   cd whatsapp-chatgpt-bot
   ```

````
2. Instale dependências:
   ```bash
npm install
````

3. Copie `.env.example` para `.env` e configure:
   ```text
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

````
4. Inicie em modo desenvolvimento (hot-reload):
   ```bash
npm run dev
````

5. Acesse a documentação interativa no navegador:
   ```
   http://localhost:3000/api-docs
   ```

````

## 🚀 Scripts úteis (package.json)
```json
"scripts": {
  "dev": "ts-node-dev --respawn src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "lint": "eslint 'src/**/*.ts'",
  "format": "prettier --write 'src/**/*.ts'",
  "test": "jest --coverage"
}
````

## 📦 Dependências Principais

- **Produção**: express, body-parser, cors, helmet, openai, twilio, mysql2, dotenv, winston, rate-limiter-flexible, zod, swagger-jsdoc, swagger-ui-express
- **Dev**: typescript, ts-node-dev, jest, ts-jest, supertest, eslint, prettier, @types/\*, @types/swagger-jsdoc, @types/swagger-ui-express
