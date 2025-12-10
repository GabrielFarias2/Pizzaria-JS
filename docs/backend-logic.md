# Documentação da Lógica do Backend

Este documento explica a estrutura e o funcionamento do backend da aplicação Pizza.js, que agora está integrado com um banco de dados PostgreSQL via Prisma ORM.

## Tecnologias Utilizadas

- **Node.js**: Ambiente de execução JavaScript.
- **Express**: Framework web para criação da API e servidor de arquivos estáticos.
- **Prisma ORM**: Camada de abstração de banco de dados para comunicação com PostgreSQL.
- **PostgreSQL**: Banco de dados relacional (persistência dos pedidos).
- **Cors**: Middleware para habilitar requisições de outras origens (CORS).

## Estrutura do Servidor (`backend/server.js`)

O servidor foi projetado para ser simples, servindo tanto a API JSON quanto os arquivos estáticos do frontend.

### 1. Configuração Inicial
- Conexão com o banco de dados é inicializada via `new PrismaClient()`.
- Middleware `cors` e `express.json()` são configurados para aceitar requisições externas e corpos em JSON.
- `express.static` serve a pasta `public/`, permitindo o acesso direto ao frontend (HTML, CSS, JS e imagens).

### 2. Catálogo de Pizzas (Mock)
Atualmente, as pizzas disponíveis para venda não estão no banco de dados, mas sim "hardcoded" em um array no servidor. Isso simplifica o gerenciamento do cardápio para este estágio do projeto.

- **Endpoint**: `GET /api/pizzas`
- **Lógica**: Retorna o array de objetos `pizzas` contendo ID, nome, descrição, preço e caminho da imagem.

### 3. Gestão de Pedidos (Banco de Dados)
Os pedidos são a parte dinâmica e persistente da aplicação. Eles são armazenados no PostgreSQL.

#### Criar Pedido
- **Endpoint**: `POST /api/orders`
- **Lógica**:
    1. Recebe `items`, `total` e `observations` no corpo da requisição.
    2. Valida se `items` é um array.
    3. Usa `prisma.order.create` para inserir o pedido e seus itens (tabela relacionada) em uma única transação atômica.
    4. O status padrão do pedido é definido como `"pending"`.
- **Modelo de Dados Relacionado**: Cria registros na tabela `orders` e múltiplos registros na tabela `order_items`.

#### Listar Histórico
- **Endpoint**: `GET /api/orders`
- **Lógica**: Busca todos os pedidos no banco com `prisma.order.findMany`, ordenados por data de criação (`desc`), e inclui os itens relacionados (`include: { items: true }`).

#### Detalhes do Pedido
- **Endpoint**: `GET /api/orders/:id`
- **Lógica**: Busca um pedido específico pelo UUID. Retorna 404 se não encontrado.

## Modelo de Dados (`prisma/schema.prisma`)

O banco de dados possui duas tabelas principais relacionadas:

### Tabela `orders`
Armazena as informações gerais do pedido.
- `id`: UUID (Chave Primária)
- `total`: Valor total do pedido.
- `status`: Estado atual (ex: "pending").
- `observations`: Observações gerais.
- `createdAt`: Data de criação.

### Tabela `order_items`
Armazena cada item individual de um pedido.
- `id`: UUID.
- `orderId`: Chave estrangeira ligando ao pedido.
- `name`, `size`, `quantity`, `price`: Detalhes do item no momento da compra.
- `observations`: Observações específicas do item.

## Fluxo de Dados
1. O Frontend solicita o cardápio (`GET /api/pizzas`).
2. Usuário monta o carrinho e finaliza o pedido.
3. O Frontend envia o JSON do pedido para `POST /api/orders`.
4. O Backend salva tudo no PostgreSQL e retorna o ID do pedido gerado.
5. O Frontend pode consultar o histórico ou status via `GET /api/orders`.
