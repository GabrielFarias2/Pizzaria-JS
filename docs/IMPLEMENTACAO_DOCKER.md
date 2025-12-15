# Implementação de Docker no Projeto

Este documento serve como um guia para entender como o **Docker** funciona neste projeto e justificar as decisões arquiteturais tomadas.

## Como o Docker funciona no seu projeto

Atualmente, sua aplicação utiliza uma arquitetura composta por **dois containers** principais orquestrados pelo `docker-compose`:

1.  **Container da Aplicação (api)**:
    *   Este container roda o Node.js.
    *   Ele é responsável por **TUDO**: serve a API (rotas `/api/...`) e também entrega os arquivos do Frontend (HTML, CSS, JS na pasta `public`).
    *   Comando de inicalização: Roda as migrações do banco (`prisma migrate`) e depois inicia o servidor (`npm start`).
2.  **Container do Banco de Dados (db)**:
    *   Roda o PostgreSQL oficial.
    *   Armazena os dados dos pedidos e cardápio.

---

## Por que usar um Container Único (Monólito) vs. Separar Frontend e Backend?

Você perguntou sobre os benefícios de manter a estrutura em um container só (onde o Backend serve o Frontend) ao invés de separá-los totalmente. Aqui está a explicação:

### ✅ Benefícios da Arquitetura Atual (Container Único / Monólito)

Esta foi a abordagem escolhida para o seu projeto e é a **mais recomendada** para projetos deste porte.

1.  **Simplicidade Extrema**:
    *   Você só precisa gerenciar **um** serviço de deploy (no Render, Railway, etc).
    *   Menos arquivos de configuração: não precisa de um Dockerfile para o back e outro para o front, nem configurar Nginx ou servidores estáticos adicionais.
2.  **Zero Problemas de CORS**:
    *   Como o mesmo servidor que entrega a página (`dominio.com/`) também responde a API (`dominio.com/api/orders`), o navegador entende que é a mesma origem.
    *   Se fossem separados (`front.com` e `api.com`), você teria que configurar cabeçalhos CORS complexos e lidar com preflight requests (OPTIONS), o que pode ser uma dor de cabeça em desenvolvimento.
3.  **Custo Menor**:
    *   Na maioria das plataformas (Render, Heroku), você paga por instância de serviço. Ter Front e Back juntos conta como **1 serviço**. Separados seriam **2 serviços**, dobrando o custo potencial ou consumindo mais recursos do plano grátis.
4.  **Deploy Atômico**:
    *   Quando você atualiza o site, o Frontend e o Backend são atualizados juntos. Você nunca terá o risco de um usuário estar com o "Frontend Novo" tentando falar com o "Backend Velho" e quebrando a aplicação.

### ❌ Quando Separar (Microserviços / Front-Back Detached) valeria a pena?

Separar os containers (ex: um container React/Vite e outro Node/Express) só seria melhor se:

1.  **Escala Massiva**: O Frontend tem milhões de acessos e precisa ser distribuído em uma CDN global (como Vercel/Cloudflare) enquanto o Backend fica centralizado.
2.  **Equipes Diferentes**: Há um time só de Frontend e um só de Backend que trabalham em ritmos muito diferentes.
3.  **Complexidade do Front**: Se o seu Frontend fosse uma aplicação React/Angular/Vue muito pesada que precisasse de um processo de "Build" complexo separado do Backend.

---

## Detalhes Técnicos dos Arquivos

### Dockerfile (Backend + Frontend Estático)
O arquivo `Dockerfile` constrói a imagem unificada:
1.  Começa com uma imagem Linux leve com Node.js (`FROM node:18-alpine`).
2.  Instala as dependências (`npm ci`).
3.  Gera o cliente do banco (`prisma generate`).
4.  Copia todo o código, incluindo a pasta `public` (Frontend).
5.  O servidor `express` está configurado (`app.use(express.static...)`) para servir essa pasta `public` quando o usuário acessa a raiz.

### docker-compose.yml
O arquivo define a "orquestração":
*   Cria a rede virtual entre a `api` e o `db`.
*   Define que a `api` depende do `db` (`depends_on`).
*   Configura volumes para que os dados do banco não sumam quando você desliga o Docker (`volumes: postgres_data`).

## Conclusão

Para o **Pizza.js Backend**, a estrutura de **container único** é a escolha inteligente: é mais barata, mais fácil de manter, elimina bugs de conexão (CORS) e simplifica o processo de deploy.
