# 📦 Roteiro de Deploy para Produção (VPS)

Este documento descreve o passo a passo para aplicar uma nova versão do projeto em produção com segurança, usando Git, Docker e boas práticas.

---

## ✅ Pré-requisitos na VPS

- Docker instalado e funcionando
- Docker Compose instalado
- Acesso SSH habilitado
- Projeto clonado via Git (acesso ao repositório)
- Banco MySQL rodando via Docker (serviço: `db`)

---

## 🚀 Passo a passo do deploy

### 1. Acesse a VPS

```bash
ssh root@SEU_IP_DA_VPS
cd /caminho/do/projeto
```

---

### 2. Obtenha as atualizações do Git

```bash
git fetch origin
git checkout v1.3.0
```

Verifique se está na versão correta:

```bash
git log --oneline --decorate
```

---

### 3. Atualize o arquivo `.env`

```bash
nano .env
```

Verifique se contém:

- Tokens reais da OpenAI e WhatsApp Cloud API
- `DB_HOST=db` se o banco roda em container
- `OPENAI_MODEL`, `RATE_LIMIT_*`, etc.

---

### 4. Derrube containers antigos (se necessário)

```bash
docker-compose down
```

---

### 5. Rebuild e subida dos containers

```bash
docker-compose build --no-cache
docker-compose up -d
```

---

### 6. Verifique se os containers estão no ar

```bash
docker ps
```

Deve mostrar `whatsapp_bot_app` e `whatsapp_bot_db` como "Up".

---

### 7. Testes rápidos

- Acesse `http://SEU_IP:3000/api-docs` → deve carregar o Swagger
- Envie mensagem de teste pelo WhatsApp → o bot deve responder

---

## 📦 Manutenção

### Atualizar para nova versão

```bash
git fetch origin
git checkout vX.X.X
docker-compose build --no-cache
docker-compose up -d
```

### Ver logs da aplicação

```bash
docker logs -f whatsapp_bot_app
```

---

## 🛡️ Segurança recomendada

- Use firewall para expor apenas porta 3000 (API) e 3306 (se necessário)
- Evite alterar arquivos diretamente na VPS
- Sempre faça `git pull` e `docker-compose` com versões controladas

---

Fim do guia.
