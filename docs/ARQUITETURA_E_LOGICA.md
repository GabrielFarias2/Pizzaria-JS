# Guia Completo do Projeto Pizza Express

Este documento serve como um mapa para entender como o projeto **Pizza Express** foi construído. O objetivo é explicar a arquitetura, a lógica e o fluxo de dados de maneira simples, ideal para quem está aprendendo desenvolvimento web Full Stack.

---

## 1. Visão Geral da Arquitetura

O projeto utiliza uma arquitetura clássica de 3 camadas (3-Tier Architecture):

1.  **Frontend (O que o usuário vê):** HTML, CSS e JavaScript. É a "casca" do site rodando no navegador.
2.  **Backend (O cérebro):** Servidor Node.js com Express. Ele recebe os pedidos do Frontend e processa as regras de negócio.
3.  **Banco de Dados (A memória):** PostgreSQL. É onde os dados (pedidos, itens) ficam salvos permanentemente.

### Diagrama Simplificado

```mermaid
graph LR
    User[Usuário] -- 1. Clica em 'Pedir' --> Frontend[Frontend (Browser)]
    Frontend -- 2. Envia dados (JSON) --> Backend[Backend API (Node.js)]
    Backend -- 3. Pede para salvar --> Prisma[Prisma ORM]
    Prisma -- 4. Escreve no Banco --> DB[(PostgreSQL)]
    DB -- 5. Confirmação --> Backend
    Backend -- 6. Resposta: 'Pedido Criado' --> Frontend
    Frontend -- 7. Mostra aviso de Sucesso --> User
```

---

## 2. Tecnologias Usadas

*   **Frontend:** HTML5, CSS3, JavaScript (Vanilla - sem frameworks como React ou Vue).
*   **Backend:** Node.js, Express (para criar o servidor web).
*   **Banco de Dados:** PostgreSQL.
*   **ORM (Object-Relational Mapping):** Prisma (Ferramenta que facilita a comunicação entre o código JavaScript e o banco de dados SQL).

---

## 3. Mergulhando na Lógica (Como funciona?)

### A. O Banco de Dados e Prisma (`schema.prisma`)
O Prisma funciona como um tradutor. Em vez de escrevermos SQL complexo (`INSERT INTO orders...`), escrevemos código JavaScript simples.

No arquivo `schema.prisma`, definimos os **Modelos**:
*   **Order**: Representa um pedido. Tem `id`, `status` (pendente, entregue...), `total`.
*   **OrderItem**: São os itens dentro de um pedido (ex: 2 pizzas de Calabresa).
*   **Pizza**: O catálogo de pizzas disponíveis.

### B. O Servidor Backend (`server.js`)
O servidor Express faz duas coisas principais:
1.  **Serve os arquivos estáticos**: Entrega o HTML/CSS/JS quando você acessa `http://localhost:8081`.
2.  **Disponibiliza uma API**: Cria endereços (rotas) que o Frontend pode chamar para buscar ou enviar dados.

**Principais Rotas da API:**
*   `GET /api/pizzas`: "Me dê a lista de pizzas".
*   `GET /api/orders`: "Me dê o histórico de pedidos".
*   `POST /api/orders`: "Tome aqui um novo pedido para salvar".
*   `DELETE /api/orders/:id`: "Apague esse pedido".

### C. O Frontend (`public/src/`)
O JavaScript do Frontend é dividido em classes para ficar organizado:

1.  **`api.js` (ApiService)**
    *   É a única parte que sabe "falar" com o servidor.
    *   Exemplo: A função `createOrder(data)` usa o `fetch` para enviar os dados para o servidor. Se mudar o endereço do servidor, você só precisa alterar aqui.

2.  **`app.js` (PizzaApp)**
    *   É quem manda no pedaço.
    *   Quando a página carrega (`init`), ele:
        *   Carrega o menu.
        *   Configura os botões ("Adicionar ao Carrinho").
        *   Observa o formulário de pedido.

3.  **`orders.js` (OrderManager)**
    *   Cuida especificamente da parte visual dos pedidos.
    *   Ele sabe desenhar o HTML da lista de histórico (`displayOrderHistory`).
    *   Ele cuida da lógica do modal de cancelamento (`setupCancelModal`).

---

## 4. Exemplo Prático: O Fluxo de um Pedido

Vamos rastrear o que acontece quando você clica em "Finalizar Pedido" no carrinho:

1.  **Ação do Usuário**: Clicou no botão.
2.  **`app.js`**: Detecta o clique (`handleCartCheckout`).
3.  **Preparação**: O `app.js` pega os itens do carrinho (`this.cart.getItems()`) e monta um objeto JSON bonito.
4.  **Envio**: O `app.js` chama `this.apiService.createOrder(dados)`.
5.  **Transporte**: O `api.js` envia uma requisição `POST` pela internet (network) para o servidor.
6.  **Backend (`server.js`)**:
    *   Recebe os dados.
    *   Chama `prisma.order.create(...)`.
    *   O Prisma salva no PostgreSQL e recebe um "OK" com o ID do novo pedido.
    *   O servidor devolve esse novo pedido para o Frontend.
7.  **Retorno**: O Frontend recebe a confirmação.
8.  **Atualização**: O `app.js` limpa o carrinho, fecha o modal e chama `loadOrderHistory()` para mostrar o novo pedido na lista.

---
