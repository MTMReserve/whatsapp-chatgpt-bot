# Etapa 1: Compilação do TypeScript
FROM node:20 AS builder

# Define diretório de trabalho
WORKDIR /app

# Copia os arquivos de definição de dependências
COPY package*.json ./

# Instala todas as dependências (incluindo dev)
RUN npm ci

# Copia o restante do código para o container
COPY . .

# Compila o projeto (gera /dist)
RUN npm run build

# Etapa 2: Runtime - Imagem otimizada para produção
FROM node:20-slim

# Define diretório de trabalho
WORKDIR /app

# Copia os arquivos necessários para rodar em produção
COPY package*.json ./
RUN npm ci --omit=dev

# Copia o código transpilado da etapa de build
COPY --from=builder /app/dist ./dist

# Expõe a porta do servidor
EXPOSE 3000

# Comando padrão ao iniciar o container
CMD ["node", "dist/server.js"]
