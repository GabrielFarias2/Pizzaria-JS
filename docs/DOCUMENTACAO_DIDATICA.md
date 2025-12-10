# 📘 Guia de Estudo: Pizzaria Deliver's

Este documento foi criado para servir como material didático, explicando detalhadamente como o projeto funciona, a arquitetura utilizada e como o Frontend e Backend se comunicam.

---

## 🏗️ Arquitetura do Projeto

O projeto segue uma arquitetura **Cliente-Servidor** simples:

1.  **Frontend (Cliente)**: A interface que o usuário vê. Feito com HTML, CSS e JavaScript Puro (Vanilla JS).
2.  **Backend (Servidor)**: O sistema que processa os pedidos e fornece os dados. Feito com Node.js e Express.

### Estrutura de Pastas

```
pizza.js-backend/
├── backend/
│   └── server.js       # 🧠 O Cérebro do Backend
├── public/             # 🎨 O Frontend (Arquivos Estáticos)
│   ├── index.html      # Estrutura da página
│   ├── style.css       # Estilos
│   ├── images/         # Imagens das pizzas
│   └── src/            # Lógica do Frontend (Classes)
│       ├── api.js      # Comunicação com o Backend
│       ├── app.js      # Controlador Principal
│       ├── cart.js     # Lógica do Carrinho
│       └── orders.js   # Gerenciamento de Pedidos
├── .md/                # Documentação
│   └── DOCUMENTACAO_DIDATICA.md
├── README.md           # Instruções rápidas
└── package.json        # Dependências do projeto
```

---

## 🔄 Fluxo de Dados (Como tudo funciona)

Quando você abre o site, o seguinte acontece:

1.  **Carregamento**: O navegador baixa `index.html`, `style.css` e os scripts JS.
2.  **Inicialização**: O `app.js` cria uma instância da aplicação (`new PizzaApp()`) e chama `init()`.
3.  **Busca de Dados**:
    *   O `app.js` pede ao `api.js`: "Busque as pizzas!" (`apiService.getPizzas()`).
    *   O `api.js` faz uma requisição HTTP (`fetch`) para o Backend: `GET http://localhost:8081/api/pizzas`.
    *   O Backend (`server.js`) recebe o pedido, pega a lista de pizzas (do array na memória) e devolve como JSON.
    *   O Frontend recebe o JSON e cria os cards na tela.

---

## 🖥️ Backend: Node.js + Express (`server.js`)

O backend é responsável por **servir os arquivos do site** e **responder aos dados**.

### Principais Conceitos Usados:

1.  **Servidor Web (Express)**:
    ```javascript
    const app = express();
    // ...
    app.listen(port, ...); // Inicia o servidor
    ```

2.  **Arquivos Estáticos**:
    Isso é o que permite acessar `http://localhost:8081` e ver o site. O backend "entrega" a pasta `public` para o navegador.
    ```javascript
    app.use(express.static(path.join(__dirname, "../public")));
    ```

3.  **API Endpoints (Rotas)**:
    São as "portas" que o frontend bate para pedir ou enviar dados.

    *   `GET /api/pizzas`: Retorna a lista de pizzas.
    *   `POST /api/orders`: Recebe um novo pedido e salva.
    *   `GET /api/orders`: Mostra o histórico.

4.  **Armazenamento em Memória**:
    ```javascript
    const orders = []; // Array simples para guardar pedidos
    ```
    *Nota: Como é uma variável, se o servidor reiniciar, os pedidos somem. Em um sistema real, usaríamos um Banco de Dados.*

---

## 🎨 Frontend: Orientação a Objetos (OOP)

O frontend foi organizado em **Classes** para separar responsabilidades. Isso facilita a manutenção.

### 1. `ApiService` (`src/api.js`)
**Responsabilidade**: Falar com o Backend.
Ninguém mais no frontend deve fazer `fetch` diretamente. Se precisar buscar dados, chame o `ApiService`.
*   Exemplo: `getPizzas()`, `createOrder()`.

### 2. `Cart` (`src/cart.js`)
**Responsabilidade**: Cuidar do Carrinho de Compras.
Ele não sabe o que é backend nem HTML. Ele só sabe somar, adicionar item, remover item e salvar no `localStorage` (para não perder o carrinho se fechar a aba).

### 3. `OrderManager` (`src/orders.js`)
**Responsabilidade**: Cuidar dos Pedidos.
Rastrear status, buscar histórico e formatar como esses dados aparecem.

### 4. `PizzaApp` (`src/app.js`)
**Responsabilidade**: O Gerente (Controller).
Ele conecta tudo.
*   Quando o usuário clica em "Adicionar", ele avisa o `Cart`.
*   Quando o usuário clica em "Finalizar", ele pega os dados do `Cart`, manda para o `ApiService` e avisa o `OrderManager`.
*   Ele manipula o DOM (HTML) para mostrar as coisas na tela.

---

## 🚀 Como Continuar Melhorando (Desafios)

Agora que você entende a base, aqui estão sugestões para evoluir seus estudos:

### Nível 1: Validação
*   **Backend**: No `POST /api/orders`, verifique se o pedido tem itens antes de salvar. Se estiver vazio, retorne erro 400.
*   **Frontend**: Mostre uma mensagem de erro amigável se o backend rejeitar o pedido.

### Nível 2: Persistência de Dados
*   Atualmente, os pedidos somem ao reiniciar.
*   **Desafio**: Tente salvar os pedidos em um arquivo `orders.json` usando o módulo `fs` do Node.js. Assim, eles persistem mesmo reiniciando o servidor.

### Nível 3: Banco de Dados Real
*   Substitua o array `orders` e o arquivo JSON por um banco de dados real como **SQLite** ou **MongoDB**.

### Nível 4: Status Dinâmico
*   Crie um endpoint `PUT /api/orders/:id/status` para atualizar o status do pedido (ex: de "pending" para "delivered").
*   Crie uma "Área Administrativa" simples (outra página HTML) para a cozinha ver os pedidos e mudar o status.

---

## 📚 Glossário Rápido

*   **API (Application Programming Interface)**: Contrato de comunicação entre Frontend e Backend.
*   **JSON (JavaScript Object Notation)**: Formato de texto usado para trocar dados.
*   **Endpoint**: Uma URL específica da API (ex: `/api/pizzas`).
*   **HTTP Verbs**:
    *   `GET`: Buscar dados.
    *   `POST`: Enviar/Criar dados.
    *   `PUT`: Atualizar dados.
    *   `DELETE`: Remover dados.
