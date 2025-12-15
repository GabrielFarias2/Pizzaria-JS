# Guia de Deploy no Render

Este guia explica como fazer o deploy da API "Pizza.js Backend" na plataforma Render.com.

## Pré-requisitos

1. Conta no [Render](https://render.com).
2. Código fonte hospedado no GitHub ou GitLab.
3. Um banco de dados PostgreSQL acessível externamente (Ex: Neon, Supabase, Railway ou o próprio Render se tiver plano pago/trial).

## Método 1: Deploy Automático via Blueprint (Recomendado)

O arquivo `render.yaml` já está configurado no projeto.

1. No Dashboard do Render, clique em **New +** e selecione **Blueprint**.
2. Conecte seu repositório do GitHub.
3. O Render detectará o `render.yaml`.
4. **Importante:** Você precisará fornecer a variável de ambiente `DATABASE_URL` se não estiver usando o banco criado pelo Blueprint (o Blueprint atual sugere usar banco externo para evitar custos inesperados ou perda de dados do plano free expirável).
   - Se usar banco externo (ex: Neon Tech), adicione a variável `DATABASE_URL` na tela de configuração.

## Método 2: Configuração Manual (Web Service)

1. No Dashboard, clique em **New +** -> **Web Service**.
2. Conecte o repositório.
3. Configure os seguintes campos:
   - **Name:** pizza-backend (ou outro de sua escolha)
   - **Region:** Escolha a mais próxima (ex: Ohio ou Frankfurt)
   - **Branch:** main (ou master)
   - **Runtime:** Node
   - **Build Command:** `npm ci && npx prisma generate`
   - **Start Command:** `npx prisma migrate deploy && npm start`
4. Adicione as Variáveis de Ambiente (Environment Variables):
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: `postgresql://usuario:senha@host:5432/banco?sslmode=require` (Sua string de conexão)
   - `PORT`: `10000` (Render usa esta porta por padrão, o código já suporta `process.env.PORT`)

## Variáveis de Ambiente Necessárias

| Variável      | Descrição                                                                 |
|To | ------------------------------------------------------------------------- |
| `DATABASE_URL`| String de conexão PostgreSQL (ex: `postgres://...`)                       |
| `NODE_ENV`    | Define o ambiente como `production` para otimizações.                     |
| `PORT`        | Inteiro. O Render injeta isso automaticamente, mas bom deixar `10000`.    |

---

## Comparativo de Plataformas de Deploy

### Render vs. Outras Alternativas

| Característica | **Render** | **Vercel** | **Netlify** | **Railway** |
| :--- | :--- | :--- | :--- | :--- |
| **Foco Principal** | Full Stack (Web Services, Dockers, Cron) | Frontend & Serverless Functions | Frontend & Serverless Functions | Backend & Databases |
| **Hospedagem Node.js** | **Excelente**. Roda como processo persistente (Express.js, etc). | Limitado. Converte Express para Serverless (pode ter cold starts). | Limitado. Focado em Functions (AWS Lambda). | **Excelente**. Similar ao Render. |
| **Banco de Dados** | Possui (Postgres/Redis), mas Free Tier expira. | Apenas via integrações (Neon, Turso, etc). | Apenas via integrações. | Possui (Postgres/Redis/MySQL). Muito fácil de usar. |
| **Docker** | Suporte nativo. | Não suporta containers arbitrários facilmente. | Não suporta containers. | Suporte nativo excelente. |
| **Facilidade de Uso** | Média/Alta. Blueprints ajudam muito. | Muito Alta (para Frontend). | Muito Alta (para Frontend). | Muito Alta. |
| **Preço Free Tier** | Generoso para Web Services (hiberna após inatividade). | Generoso, mas limites de execução em functions. | Generoso para sites estáticos. | Trial ($5 de crédito), depois pago. |

### Conclusão

- **Use o Render** (ou Railway) para este projeto (`pizza.js-backend`) porque é uma API Node.js tradicional (Express) que precisa ficar rodando continuamente.
- **Vercel e Netlify** são incríveis para o Frontend (React, Vue, HTML estático), mas podem exigir adaptações no código do Backend para rodar como "Serverless Functions".
