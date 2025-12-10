# Estruturas de Dados e Algoritmos no Pizza.js

Este documento fornece uma análise detalhada e educacional sobre as estruturas de dados, algoritmos e arquitetura utilizados no projeto **Pizza.js**. Ele foi desenhado para servir como um guia de estudos, conectando conceitos teóricos de Ciência da Computação diretamente ao código desta aplicação.

---

## 1. Introdução ao Projeto

O **Pizza.js** é uma aplicação web completa (Full Stack) que simula um sistema de pedidos de uma pizzaria.
- **Frontend**: Interface interativa construída com JavaScript Vanilla (sem frameworks), HTML5 e CSS3.
- **Backend**: Servidor Node.js com Express que fornece uma API REST para listar pizzas e gerenciar pedidos.

O objetivo deste documento é desmistificar como os dados fluem, como são armazenados e quais decisões de engenharia foram tomadas para resolver problemas comuns de desenvolvimento web.

---

## 2. Visão Geral da Arquitetura

A arquitetura do projeto segue o modelo **Cliente-Servidor** com comunicação via **API REST**.

```mermaid
graph LR
    Client[Frontend (Browser)] -- "HTTP GET /api/pizzas" --> Server[Backend (Node.js)]
    Client -- "HTTP POST /api/orders" --> Server
    Server -- "JSON Data" --> Client
    Server -- "Armazenamento em Memória" --> RAM[(Array em RAM)]
    Client -- "Armazenamento Local" --> LocalStorage[(Browser localStorage)]
```

- **Backend (`server.js`)**: Responsável pela "verdade" dos dados (lista de pizzas, registro de pedidos).
- **Frontend (`public/src/`)**: Responsável pela interação com o usuário e gerenciamento de estado local (carrinho).

---

## 3. Estruturas de Dados Presentes no Projeto

Estruturas de dados são formas de organizar e armazenar dados para que possam ser acessados e modificados de forma eficiente. Abaixo, analisamos as principais estruturas usadas no projeto.

### 3.1. Arrays (Listas)

O **Array** é a estrutura de dados mais predominante no projeto. É uma coleção ordenada de elementos indexados sequencialmente.

**Onde aparece:**
1.  **Backend (`server.js`)**:
    -   `const pizzas = [...]`: Armazena o catálogo de pizzas.
    -   `const orders = [...]`: Armazena a lista de pedidos recebidos.
2.  **Frontend (`cart.js`)**:
    -   `this.items = []`: Armazena os itens adicionados ao carrinho.
3.  **Frontend (`app.js`)**:
    -   `this.pizzas = []`: Cópia local do menu de pizzas.

**Por que foi escolhida:**
-   **Simplicidade**: Arrays são nativos e fáceis de manipular em JavaScript.
-   **Iteração**: É trivial percorrer todos os itens para renderizar na tela (usando `.map()` ou `.forEach()`).
-   **Ordem**: Mantém a ordem de inserção (importante para histórico de pedidos).

**Como funciona internamente:**
Em JavaScript, arrays são objetos dinâmicos. Eles podem crescer ou diminuir de tamanho automaticamente. O acesso por índice (ex: `pizzas[0]`) é muito rápido (**O(1)**), mas buscar um elemento específico sem saber o índice requer percorrer a lista (**O(n)**).

### 3.2. Objetos (Dicionários/Hash Maps)

**Objetos** em JavaScript funcionam como mapas de chave-valor.

**Onde aparece:**
1.  **Entidades de Dados**:
    -   Cada pizza (`{ id: 1, name: "Margherita", ... }`) e cada pedido são objetos.
2.  **Frontend (`orders.js`)**:
    -   `statusMap`: Um objeto usado para mapear códigos de status ("pending") para textos legíveis e classes CSS.

```javascript
// Exemplo do orders.js
const statusMap = {
  pending: { text: "Pendente", class: "status-pending" },
  delivered: { text: "Entregue", class: "status-delivered" },
  // ...
};
```

**Por que foi escolhida:**
-   **Acesso Rápido**: Permite acessar um valor instantaneamente se você souber a chave (ex: `statusMap['pending']`). A complexidade é **O(1)**.
-   **Modelagem**: É a forma natural de representar entidades do mundo real (uma Pizza tem nome, preço, etc.).

### 3.3. Filas (Implícitas)

Embora não haja uma classe `Queue` explícita, o array `orders` no backend funciona como uma **Fila (FIFO - First In, First Out)**.
-   Novos pedidos entram no final (`push`).
-   Em um cenário real de cozinha, os pedidos seriam processados na ordem de chegada.

---

## 4. Algoritmos Utilizados

Algoritmos são sequências de passos para resolver um problema. Aqui estão os principais algoritmos usados no seu código, com análise de complexidade (Big O Notation).

### 4.1. Busca Linear (Linear Search)

**Onde:** `orders.find(o => o.id === req.params.id)` no backend e `this.pizzas.find(...)` no frontend.

**Como funciona:**
O algoritmo percorre o array elemento por elemento até encontrar aquele que satisfaz a condição.

**Complexidade:**
-   **Tempo: O(n)** (Linear). Se houver 1.000 pedidos, no pior caso, ele verificará os 1.000.
-   **Espaço: O(1)**. Não cria novas estruturas de dados significativas.

**Análise:** Para a escala atual do projeto (poucos itens), é perfeitamente aceitável. Se tivéssemos milhões de pedidos, seria lento.

### 4.2. Filtragem (Filtering)

**Onde:** `this.items.filter(item => item.id !== itemId)` em `cart.js` (método `removeItem`).

**Como funciona:**
Cria um *novo* array contendo apenas os elementos que passam no teste (ou seja, aqueles cujo ID é diferente do que queremos remover).

**Complexidade:**
-   **Tempo: O(n)**. Precisa visitar todos os itens.
-   **Espaço: O(n)**. Cria uma cópia do array (menos um item).

### 4.3. Redução (Reduce)

**Onde:** `this.items.reduce(...)` em `cart.js` (métodos `getTotal` e `getItemCount`).

**Como funciona:**
Percorre o array acumulando um valor único (soma de preços ou quantidades).

**Complexidade:**
-   **Tempo: O(n)**.

### 4.4. Mapeamento (Mapping)

**Onde:** `this.pizzas.map(...)` em `app.js` (método `renderMenu`).

**Como funciona:**
Transforma cada item de um array em outra coisa. No seu caso, transforma objetos de dados (Pizzas) em strings HTML para exibição.

**Complexidade:**
-   **Tempo: O(n)**.

---

## 5. Modelos de Armazenamento

### 5.1. In-Memory Storage (Backend)
No `server.js`, os dados são guardados em variáveis globais (`const orders = []`).

-   **Vantagens**: Extremamente rápido (acesso à memória RAM é nanosegundos). Implementação trivial.
-   **Limitações**: **Volátil**. Se o servidor reiniciar ou cair, **todos os pedidos são perdidos**. Não escala horizontalmente (se tiver 2 servidores, eles não compartilham os dados).

### 5.2. LocalStorage (Frontend)
No `cart.js`, o carrinho é salvo no `localStorage` do navegador.

-   **Como funciona**: Armazena dados como strings (chave-valor) no navegador do usuário.
-   **Vantagens**: Persiste os dados mesmo se o usuário fechar a aba ou reiniciar o computador.
-   **Limitações**: Capacidade limitada (~5MB). Síncrono (pode travar a UI se houver muitos dados). Apenas strings (necessário usar `JSON.stringify` e `JSON.parse`).

---

## 6. Possíveis Melhorias

Como Engenheiro Sênior, aqui estão sugestões para evoluir o projeto:

### 6.1. Otimização de Busca com Mapas (Hash Maps)
Atualmente, buscamos pedidos com `find` (O(n)). Se tivermos muitos pedidos, isso ficará lento.
**Solução:** Usar um `Map` ou um Objeto indexado por ID no backend.

```javascript
// Backend Otimizado
const ordersMap = new Map();

// Inserção: O(1)
ordersMap.set(newOrder.id, newOrder);

// Busca: O(1) - Instantâneo, independente do número de pedidos
const order = ordersMap.get(orderId);
```

### 6.2. Persistência Real (Banco de Dados)
Para resolver o problema da perda de dados ao reiniciar o servidor:
-   **Simples (Arquivo JSON)**: Salvar o array `orders` em um arquivo `orders.json` sempre que mudar.
-   **Robusto (Banco SQL/NoSQL)**: Usar SQLite, PostgreSQL ou MongoDB. Isso permite buscas complexas e garante integridade dos dados.

### 6.3. Sets para Unicidade
Se quiséssemos garantir que não existem duas pizzas com o mesmo nome no cadastro, poderíamos usar um `Set`.

```javascript
const nomesPizzas = new Set();
if (nomesPizzas.has(novoNome)) {
    throw new Error("Pizza já existe!");
}
nomesPizzas.add(novoNome);
```
Complexidade de verificação: **O(1)**.

---

## 7. Exemplos Práticos da Codebase

### Exemplo 1: O Padrão Observer no Carrinho
No arquivo `cart.js`, você implementou uma versão simplificada do **Padrão Observer**.

```javascript
// cart.js
onUpdate(callback) {
    this.callbacks.push(callback); // Inscreve um ouvinte
}

notifyUpdate() {
    // Notifica todos os ouvintes
    this.callbacks.forEach(callback => callback(this.items, this.getTotal()));
}
```
Isso desacopla a lógica do carrinho da lógica de interface. O carrinho não sabe *quem* está ouvindo, ele apenas avisa "mudei!".

### Exemplo 2: Geração de IDs
No `server.js`:
```javascript
id: `ORD-${Date.now()}`
```
Isso usa o timestamp atual como ID. É simples e eficaz para baixo volume, mas em alta escala pode gerar colisões (dois pedidos no exato mesmo milissegundo).
**Melhoria**: Usar UUIDs (`crypto.randomUUID()`).

---

## 8. Glossário

-   **Big O Notation (O(n), O(1))**: Uma notação matemática para descrever como o tempo de execução ou espaço de um algoritmo cresce à medida que o tamanho da entrada aumenta.
-   **API REST**: Estilo de arquitetura onde o cliente e servidor trocam representações de recursos (geralmente JSON) via HTTP.
-   **JSON (JavaScript Object Notation)**: Formato leve de troca de dados.
-   **Full Stack**: Desenvolvimento que envolve tanto o lado do cliente (Frontend) quanto o do servidor (Backend).
-   **Imutabilidade**: Prática de não alterar dados existentes, mas sim criar novas cópias com as alterações (visto no `filter` do carrinho).

---

## 9. Conclusão

O projeto **Pizza.js** utiliza estruturas de dados fundamentais (**Arrays** e **Objetos**) de maneira eficaz para o escopo atual. A escolha de algoritmos lineares (**O(n)**) é adequada para listas pequenas, mantendo o código legível e fácil de manter.

Para avançar seus estudos:
1.  Tente implementar a persistência em arquivo JSON no backend.
2.  Experimente trocar o array de `orders` por um `Map` e veja como a busca por ID fica mais semântica.
3.  Estude como bancos de dados relacionais (SQL) implementam essas estruturas internamente (B-Trees) para buscas rápidas em milhões de registros.
