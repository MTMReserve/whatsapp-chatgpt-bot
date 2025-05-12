## \[v1.6.0] – 2025-05-10

**Objetivo:**
Adicionar suporte completo a mensagens de voz (áudio), permitindo que o bot transcreva áudios recebidos via WhatsApp (STT) e responda com mensagens faladas (TTS), aumentando a naturalidade da interação.

**Funcionalidades Implementadas:**

- Reconhecimento de Áudio com OpenAI Whisper:

  - Ao receber uma mensagem de áudio (message.type === 'audio'), o bot realiza:

    - Download do arquivo com `downloadMedia(mediaId)`
    - Transcrição com `transcribeAudio(buffer)` usando a Whisper API
    - Injeção do texto transcrito no pipeline de resposta da conversa (state machine, intentMap, prompts)

- Geração de Áudio com ElevenLabs:

  - A resposta do bot é transformada em áudio com `synthesizeSpeech(text)`
  - O buffer gerado é enviado ao WhatsApp usando `sendAudio(phone, buffer)` após upload
  - Regra aplicada: se a entrada for áudio, a resposta será em áudio

**Arquivos Modificados/Criados:**

- `src/services/audioService.ts`: centraliza transcrição e síntese de voz
- `src/controllers/webhookController.ts`: detecta e trata mensagens de áudio, injeta texto no flow
- `src/services/conversationManager.ts`: processa entrada e retorna texto ou áudio
- `src/api/whatsapp.ts`: inclui `downloadMedia()` e `sendAudio()`

**Testes:**

- `audioService.test.ts`: mocks da Whisper e ElevenLabs para testar fluxo de sucesso e falha
- `voiceMessage.integration.test.ts`: simula payload do WhatsApp com áudio e valida resposta com áudio
- `webhook.e2e.test.ts`: testa comportamento real com message.type === 'audio'

**Variáveis de Ambiente Novas:**

```env
# Whisper API
OPENAI_KEY=

# ElevenLabs
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
```

**Compatibilidade e Observações Técnicas:**

- Mensagens de texto continuam funcionais
- Falhas no STT ou TTS são tratadas com fallback em texto
- Código modular permite trocar provedores de áudio futuramente
- Integração transparente ao fluxo existente do bot

**Comando Git:**

```bash
git tag -a v1.6.0 -m "feat: suporte completo a mensagens de voz (STT e TTS)"
git push origin v1.6.0
```

---

\[...texto das versões v1.5.0 a v1.3.0 inalterado, mantido acima...]

---

## \[v1.2.0] – 2025-05-06

**Objetivo:**
Finalizar a Dockerização do projeto e realizar o deploy para VPS com configuração de ambiente de produção.

**Funcionalidades Implementadas:**

- Criação de `Dockerfile` com build multi-stage
- Criação de `docker-compose.yml` com serviços para:

  - `app`: serviço principal do bot
  - `mysql`: banco de dados com volume persistente

- Deploy em VPS com Ubuntu 20.04
- Subida do projeto via Git, build com Docker e exposição do serviço com porta 3000
- Testes locais e em produção com `ngrok` e tokens temporários da Meta

**Arquivos Modificados/Criados:**

- `Dockerfile`
- `docker-compose.yml`
- `.env.production` e `.env.local`

**Testes:**

- `docker-compose up` levanta os serviços corretamente
- Verificação de acesso ao endpoint `/webhook`

**Compatibilidade:**

- Padronização total do ambiente local e produção

**Comando Git:**

```bash
git tag -a v1.2.0 -m "feat: dockerização e deploy completo do bot para VPS"
git push origin v1.2.0
```

---

## \[v1.1.0] – 2025-04-30

**Objetivo:**
Concluir infraestrutura base com documentação, testes e CI/CD estáveis

**Funcionalidades:**

- Swagger UI ativado com `swagger-jsdoc` e `swagger-ui-express` na rota `/api-docs`
- JSDoc nas rotas e controllers
- GitHub Actions configurado com lint e testes (`npm test`)
- Disparo automático do workflow em branches `main`, `develop` e tags `v*.*.*`
- Atualização do `README.md` com instruções de uso

**Arquivos:**

- `.github/workflows/ci.yml`
- `src/app.ts`
- `README.md`

**Compatibilidade:**

- Código padronizado, testado e validado via CI

**Comando Git:**

```bash
git tag -a v1.1.0 -m "Release v1.1.0 - CI/CD, Swagger docs e estabilização final"
git push origin v1.1.0
```

---

## \[v1.0.1] – 2025-04-29

**Objetivo:** Correção menor e estabilização geral.

**Funcionalidades:**

- Atualização de pacotes
- Validação da cobertura de testes

**Comando Git:**

```bash
git tag -a v1.0.1 -m "chore(release): v1.0.1"
git push origin v1.0.1
```

---

## \[v0.4.0] – 2025-04-28

**Objetivo:** Adicionar servidor Express e ponto de entrada da aplicação

**Funcionalidades:**

- `app.ts` com configurações de segurança, CORS, body-parser, e rota `/webhook`
- `server.ts` para levantar aplicação com Express

**Comando Git:**

```bash
git tag -a v0.4.0 -m "feat(app-server): add express app and server entrypoint"
git push origin v0.4.0
```

---

## \[v0.3.0] – 2025-04-28

**Objetivo:** Finalizar Etapa 7 – Implementação de serviços internos

**Funcionalidades:**

- `clientRepository.ts`: CRUD básico com mysql2
- `humanizer.ts`: funções delay e variação
- `conversationManager.ts`: orquestra fluxo de conversa

**Comando Git:**

```bash
git tag -a v0.3.0 -m "feat: finaliza etapa 7 - serviços e atualiza changelog detalhado"
git push origin v0.3.0
```

---

## \[v0.2.0] – 2025-04-27

**Objetivo:** Adicionar middlewares principais

**Funcionalidades:**

- `errorMiddleware.ts`: trata erros genéricos
- `validationMiddleware.ts`: usa `zod` para validar `req.body`
- `rateLimiterMiddleware.ts`: com rate-limiter-flexible

**Comando Git:**

```bash
git tag -a v0.2.0 -m "feat: middlewares de error, validation e rate limiter implementados"
git push origin v0.2.0
```

---

## \[v0.1.1-mvp1] – 2025-04-26

**Objetivo:** Criar changelog inicial do MVP1

**Funcionalidades:**

- Documentação inicial do que foi implementado no MVP1

**Comando Git:**

```bash
git tag -a v0.1.1-mvp1 -m "docs: criação do changelog v0.1.1-mvp1"
git push origin v0.1.1-mvp1
```

---

## \[v0.1.0-mvp1] – 2025-04-26

**Objetivo:** MVP com infraestrutura básica e testes

**Funcionalidades:**

- Conexão inicial com OpenAI e Twilio
- Setup básico para simulação de mensagens

**Comando Git:**

```bash
git tag -a v0.1.0-mvp1 -m "feat: infraestrutura de teste e clients OpenAI/Twilio funcionando"
git push origin v0.1.0-mvp1
```

---

## \[v0.0.1-alpha] – 2025-04-24

**Objetivo:** Setup inicial do projeto

**Funcionalidades:**

- Estrutura inicial do projeto com TypeScript, Express, Git, ESLint
- Configurações básicas de ambiente `.env` e `.gitignore`

**Comando Git:**

```bash
git tag -a v0.0.1-alpha -m "chore(setup): estrutura inicial do projeto"
git push origin v0.0.1-alpha
```

---
