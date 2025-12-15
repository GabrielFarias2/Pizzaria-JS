# 🍕 Pizzaria Deliver's - Backend & Frontend
  ## DEMO: https://pizzaria-js-production.up.railway.app/
Este repositório contém o código-fonte de uma aplicação web completa para uma pizzaria, incluindo o frontend (interface do usuário) e o backend (API e banco de dados). O projeto foi desenvolvido com foco em simplicidade, performance e boas práticas de desenvolvimento web moderno.

## 🚀 Tecnologias Utilizadas

O projeto foi construído utilizando uma stack robusta e moderna:

### Backend
*   **Node.js**: Plataforma de execução JavaScript server-side. Escolhido por sua alta performance em I/O assíncrono e por permitir usar a mesma linguagem (JS) no front e no back.
*   **Express.js**: Framework web minimalista para Node.js. Utilizado para criar a API REST e gerenciar rotas de forma simples e flexível.
*   **Prisma ORM**: Ferramenta moderna para interação com o banco de dados. Escolhida por sua segurança de tipos (type-safety), facilidade de criação de schemas e migrações automáticas.
*   **PostgreSQL**: Banco de dados relacional robusto. Escolhido por sua confiabilidade e compatibilidade excelente com o Prisma.

### Frontend
*   **HTML5 & CSS3**: Estrutura semântica e estilização responsiva. Uso de variáveis CSS e Flexbox/Grid para layouts modernos.
*   **JavaScript (Vanilla)**: Lógica do cliente implementada sem frameworks pesados, garantindo carregamento rápido e total controle sobre o DOM.
*   **Fetch API**: Para comunicação assíncrona com o backend (GET, POST, PATCH, DELETE).

### Infraestrutura & DevOps
*   **Docker**: Containerização da aplicação para garantir que ela rode da mesma forma em qualquer ambiente (desenvolvimento ou produção).
*   **Railway**: Plataforma de deploy escolhida pela facilidade de uso e integração nativa com GitHub e PostgreSQL.

---

## 📂 Estrutura do Projeto

A estrutura de pastas foi organizada para separar claramente as responsabilidades:

```
pizza.js-backend/
├── backend/            # Código do servidor Node.js
│   ├── server.js       # Ponto de entrada da API e configurações do Express
│   └── docs/           # Documentações técnicas adicionais
├── public/             # Arquivos estáticos do Frontend (servidos pelo Express)
│   ├── images/         # Imagens das pizzas e ícones
│   ├── src/            # Scripts JavaScript do frontend (Lógica da UI)
│   │   ├── api.js      # Camada de serviço para chamadas HTTP
│   │   ├── app.js      # Controlador principal da aplicação
│   │   ├── cart.js     # Lógica do carrinho de compras
│   │   └── orders.js   # Gerenciamento de pedidos
│   ├── index.html      # Página principal
│   └── style.css       # Estilos globais
├── prisma/             # Configurações do Banco de Dados
│   ├── schema.prisma   # Definição das tabelas e modelos
│   └── migrations/     # Histórico de alterações do banco
├── dockerfile          # Configuração da imagem Docker
├── docker-compose.yml  # Orquestração de containers (App + DB) local
└── package.json        # Dependências e scripts do projeto
```

---

## ⚙️ Como Executar o Projeto

## Opçao 1: acesse o link do Railway: https://pizzaria-js-production.up.railway.app/

## Opçao 2: 
### Pré-requisitos
*   Node.js (v18+)
*   NPM
*   PostgreSQL (Local ou via Docker)

### 1. Instalação e Configuração

1.  Clone o repositório:
    ```bash
    git clone https://github.com/GabrielFarias2/Pizzaria-JS.git
    cd pizza.js-backend
    ```

2.  Instale as dependências:
    ```bash
    npm install
    ```

3.  Configure o banco de dados:
    Crie um arquivo `.env` na raiz do projeto com a URL do seu banco PostgreSQL:
    ```env
    DATABASE_URL="postgresql://usuario:senha@localhost:5432/pizzaria?schema=public"
    ```

### 2. Rodando as Migrações
Para criar as tabelas no banco de dados:
```bash
npx prisma db push
```

### 3. Iniciando o Servidor
Para rodar em modo de desenvolvimento (com reinício automático):
```bash
npm run dev
```
Para rodar em modo de produção:
```bash
npm start
```
O servidor estará disponível em: `http://localhost:8081`

---

## 🛠️ API Endpoints

A API fornece os seguintes recursos principais:

*   `GET /api/pizzas`: Retorna a lista de pizzas disponíveis (catálogo).
*   `GET /api/orders`: Retorna o histórico de pedidos.
*   `POST /api/orders`: Cria um novo pedido.
*   `GET /api/orders/:id`: Busca detalhes de um pedido.
*   `PATCH /api/orders/:id/cancel`: Cancela um pedido existente.
*   `DELETE /api/orders/:id`: Remove um pedido do banco.

---

## 🐳 Docker (Opcional)

Para rodar todo o ambiente (App + Banco) com Docker:

```bash
docker-compose up --build
```

---

## 📝 Autor

Desenvolvido como parte de um projeto de aprendizado Fullstack.
