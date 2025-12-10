# Implementação de Docker no Projeto

Este documento serve como um guia para transformar o projeto atual em uma aplicação containerizada utilizando **Docker**.

## O que é e Por que usar?

Docker permite "empacotar" sua aplicação e todas as suas dependências (Node.js, bibliotecas, banco de dados) em containers leves e isolados.

### Vantagens Principais
1.  **"Funciona na minha máquina" (e na sua também)**:
    *   Docker garante que o ambiente de execução seja IDÊNTICO em desenvolvimento, testes e produção. Acaba com problemas de versões diferentes do Node ou do Postgres.
2.  **Setup Rápido**:
    *   Um novo desenvolvedor não precisa instalar Node, Postgres ou configurar variáveis de ambiente manualmente. Basta ter o Docker e rodar um comando (`docker-compose up`) para subir tudo.
3.  **Isolamento**:
    *   O banco de dados do projeto roda em um container isolado, sem poluir sua instalação local do Windows/Linux.

---

## Como Implementar (Passo a Passo)

Para preparar este projeto para Docker, precisaríamos criar dois arquivos principais na raiz:

### 1. Dockerfile (Para o Backend)
Este arquivo ensina o Docker a construir a imagem da sua aplicação Node.js.

```dockerfile
# Usa uma imagem leve do Node
FROM node:18-alpine

# Define diretório de trabalho no container
WORKDIR /app

# Copia arquivos de definição de dependência
COPY package*.json ./
COPY prisma ./prisma/

# Instala as dependências
RUN npm install

# Gera o cliente do Prisma
RUN npx prisma generate

# Copia o restante do código
COPY . .

# Expõe a porta que o servidor usa
EXPOSE 8081

# Comando para iniciar
CMD ["npm", "start"]
```

### 2. docker-compose.yml (Orquestração)
Este arquivo define como os serviços (Backend e Banco de Dados) conversam entre si.

```yaml
version: '3.8'

services:
  # Serviço do Backend (Node.js)
  api:
    build: .
    ports:
      - "8081:8081"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/pizzaria?schema=public
      - PORT=8081
    depends_on:
      - db
    command: sh -c "npx prisma migrate deploy && npm start"

  # Serviço do Banco de Dados (PostgreSQL)
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: pizzaria
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

## Como Rodar

Após criar esses arquivos, o fluxo de trabalho mudaria para:

1.  **Subir o projeto**:
    ```bash
    docker-compose up --build
    ```
    Isso baixaria o Postgres, instalaria as dependências do Node, rodaria as migrações do banco e iniciaria o servidor, tudo automaticamente.

2.  **Parar o projeto**:
    ```bash
    docker-compose down
    ```

Esta transformação moderniza o deploy e facilita muito a manutenção do ambiente de desenvolvimento.
