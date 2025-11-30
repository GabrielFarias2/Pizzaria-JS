# 🍕 Pizzaria Deliver's - Frontend

Frontend moderno para sistema de pedidos de pizzaria, construído com JavaScript puro usando Programação Orientada a Objetos (OOP).

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Arquitetura OOP](#arquitetura-oop)
- [Funcionalidades](#funcionalidades)
- [Como Funciona sem Backend](#como-funciona-sem-backend)
- [Integração com Backend](#integração-com-backend)
- [Endpoints da API](#endpoints-da-api)
- [Formato de Dados](#formato-de-dados)
- [Configuração](#configuração)
- [Testes](#testes)

## 🎯 Visão Geral

Este projeto é um frontend completo para uma pizzaria, desenvolvido com:
- **JavaScript puro** (sem frameworks)
- **Programação Orientada a Objetos** (classes ES6+)
- **Design moderno** (tema preto, branco e vermelho)
- **Responsivo** (funciona em mobile e desktop)
- **Funciona offline** (carrinho usa localStorage)

### Funcionalidades

- ✅ Visualização do cardápio de pizzas (estático ou dinâmico)
- ✅ Carrinho de compras com localStorage (funciona sem backend)
- ✅ Formulário de pedidos
- ✅ Rastreamento de pedidos
- ✅ Histórico de pedidos
- ✅ Notificações toast
- ✅ Loading states
- ✅ Fallback para cards estáticos quando backend não está disponível

## 📁 Estrutura do Projeto

```
pizza.js-backend/
├── public/
│   ├── index.html          # Página principal HTML
│   ├── style.css          # Estilos do site
│   └── images/            # Imagens das pizzas
├── api.js                 # Classe ApiService (comunicação com backend)
├── cart.js                # Classe Cart (gerenciamento do carrinho)
├── orders.js              # Classe OrderManager (pedidos e histórico)
├── app.js                 # Classe PizzaApp (controlador principal)
└── README.md             # Esta documentação
```

## 🏗️ Arquitetura OOP

O projeto foi construído usando **4 classes principais**:

### 1. `ApiService` (api.js)
Responsável por todas as comunicações com o backend.

**Métodos:**
- `getPizzas()` - Busca todas as pizzas do cardápio
- `createOrder(orderData)` - Cria um novo pedido
- `getOrder(id)` - Busca detalhes de um pedido específico
- `getOrderHistory()` - Busca histórico de pedidos

**Configuração:**
```javascript
// URL padrão: http://localhost:3000/api
// Para mudar, edite o construtor em api.js:
const apiService = new ApiService('http://seu-servidor.com/api');
```

### 2. `Cart` (cart.js)
Gerencia o carrinho de compras localmente.

**Métodos principais:**
- `addItem(pizza, size, quantity, observations)` - Adiciona item
- `removeItem(itemId)` - Remove item
- `updateQuantity(itemId, quantity)` - Atualiza quantidade
- `getTotal()` - Calcula total
- `clear()` - Limpa o carrinho
- `getItems()` - Retorna todos os itens
- `getItemCount()` - Retorna quantidade total de itens

**Persistência:** Os dados são salvos automaticamente no `localStorage` (chave: `pizzaria_cart`).

### 3. `OrderManager` (orders.js)
Gerencia pedidos e histórico.

**Métodos principais:**
- `trackOrder(orderId)` - Rastreia um pedido
- `getOrderHistory()` - Busca histórico
- `displayOrderStatus(order, container)` - Exibe status na tela
- `displayOrderHistory(orders, container)` - Exibe histórico na tela
- `startOrderPolling(orderId, callback)` - Inicia atualização automática
- `stopOrderPolling()` - Para o polling

### 4. `PizzaApp` (app.js)
**Controlador principal** que coordena todas as outras classes.

**Métodos principais:**
- `init()` - Inicializa a aplicação
- `renderMenu()` - Renderiza o cardápio (backend ou estático)
- `loadStaticCards()` - Carrega cards estáticos do HTML
- `renderCart()` - Atualiza o carrinho na tela
- `handleAddToCart(pizza)` - Adiciona pizza ao carrinho
- `handleOrderFormSubmit(event)` - Processa formulário de pedido
- `handleCartCheckout()` - Finaliza pedido do carrinho
- `showNotification(message, type)` - Exibe notificações
- `showLoading(show)` - Mostra/esconde loading

## 🔄 Como Funciona sem Backend

O frontend foi projetado para funcionar **parcialmente sem backend**:

### ✅ Funciona sem Backend:
- **Cards estáticos:** 3 pizzas pré-definidas no HTML (Margherita, Pepperoni, Quatro Queijos)
- **Carrinho completo:** Adicionar, remover, atualizar quantidades
- **Persistência:** Dados do carrinho salvos em localStorage
- **Interface:** Todos os componentes visuais funcionam

### ❌ Não funciona sem Backend:
- **Finalizar pedido:** Precisa enviar para API
- **Menu dinâmico:** Cards estáticos não são substituídos
- **Rastreamento:** Não há pedidos para rastrear
- **Histórico:** Não há histórico de pedidos

### Comportamento:
1. Ao carregar, tenta buscar pizzas do backend
2. Se falhar, mantém os cards estáticos do HTML
3. Carrinho funciona normalmente (localStorage)
4. Ao finalizar pedido, mostra erro (esperado sem backend)

## 🔌 Integração com Backend

### Passo 1: Configurar a URL da API

Por padrão, a API está configurada para:
```
http://localhost:3000/api
```

**Para mudar:**

Edite o arquivo `api.js`:
```javascript
class ApiService {
  constructor(baseUrl = 'http://localhost:3000/api') {
    this.baseUrl = baseUrl;
  }
  // ...
}
```

Ou ao instanciar (se necessário):
```javascript
const apiService = new ApiService('http://seu-servidor.com/api');
```

### Passo 2: Configurar CORS no Backend

O backend precisa permitir requisições do frontend. Configure CORS:

**Exemplo com Express:**
```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: 'http://localhost:3002', // ou a URL do seu frontend
  credentials: true
}));

// Ou para desenvolvimento:
app.use(cors());
```

### Passo 3: Implementar os Endpoints

O frontend espera que o backend tenha os seguintes endpoints implementados.

## 📡 Endpoints da API

### 1. GET `/api/pizzas`
Retorna a lista de todas as pizzas disponíveis.

**Resposta esperada:**
```json
[
  {
    "id": 1,
    "name": "Margherita",
    "description": "Tomate, mussarela, manjericão e azeite",
    "price": 28.90,
    "image": "images/margherita.jpg"
  },
  {
    "id": 2,
    "name": "Pepperoni",
    "description": "Pepperoni crocante com queijo extra",
    "price": 34.50,
    "image": "images/pepperoni.jpg"
  }
]
```

**Nota:** Se este endpoint não estiver disponível, o frontend mantém os cards estáticos do HTML.

---

### 2. POST `/api/orders`
Cria um novo pedido.

**Request Body:**
```json
{
  "items": [
    {
      "pizzaId": 1,
      "name": "Margherita",
      "size": "Média",
      "quantity": 2,
      "price": 28.90,
      "observations": "Sem cebola"
    }
  ],
  "total": 57.80
}
```

**Resposta esperada:**
```json
{
  "id": "ORD-123",
  "items": [
    {
      "pizzaId": 1,
      "name": "Margherita",
      "size": "Média",
      "quantity": 2,
      "price": 28.90,
      "subtotal": 57.80,
      "observations": "Sem cebola"
    }
  ],
  "total": 57.80,
  "status": "pending",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Headers necessários:**
```
Content-Type: application/json
```

---

### 3. GET `/api/orders/:id`
Busca detalhes de um pedido específico.

**Parâmetros:**
- `id` (path parameter): ID do pedido

**Resposta esperada:**
```json
{
  "id": "ORD-123",
  "items": [
    {
      "pizzaId": 1,
      "name": "Margherita",
      "size": "Média",
      "quantity": 2,
      "price": 28.90,
      "subtotal": 57.80
    }
  ],
  "total": 57.80,
  "status": "preparing",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "estimatedDelivery": "2024-01-15T11:15:00.000Z"
}
```

**Status possíveis:**
- `pending` - Pedido pendente
- `preparing` - Em preparação
- `out-for-delivery` - Saiu para entrega
- `delivered` - Entregue
- `cancelled` - Cancelado

---

### 4. GET `/api/orders`
Retorna o histórico de pedidos do usuário.

**Resposta esperada:**
```json
[
  {
    "id": "ORD-123",
    "items": [
      {
        "pizzaId": 1,
        "name": "Margherita",
        "size": "Média",
        "quantity": 2,
        "price": 28.90
      }
    ],
    "total": 57.80,
    "status": "delivered",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "id": "ORD-122",
    "items": [...],
    "total": 34.50,
    "status": "preparing",
    "createdAt": "2024-01-15T09:15:00.000Z"
  }
]
```

---

## 📦 Formato de Dados

### Estrutura de Pizza
```javascript
{
  id: Number,              // ID único da pizza (obrigatório)
  name: String,            // Nome da pizza (obrigatório)
  description: String,     // Descrição (opcional)
  price: Number,           // Preço em reais (obrigatório)
  image: String            // URL da imagem (opcional)
}
```

### Estrutura de Item do Pedido
```javascript
{
  pizzaId: Number,         // ID da pizza (obrigatório)
  name: String,            // Nome da pizza (obrigatório)
  size: String,            // "Pequena", "Média" ou "Grande" (obrigatório)
  quantity: Number,        // Quantidade (obrigatório)
  price: Number,           // Preço unitário (obrigatório)
  observations: String     // Observações (opcional)
}
```

### Estrutura de Pedido
```javascript
{
  id: String,              // ID único do pedido (obrigatório)
  items: Array,            // Array de itens (obrigatório)
  total: Number,           // Valor total (obrigatório)
  status: String,          // Status do pedido (obrigatório)
  createdAt: String,       // Data de criação ISO 8601 (obrigatório)
  estimatedDelivery: String // Data estimada de entrega (opcional)
}
```

---

## ⚙️ Configuração

### URLs dos Scripts

Os scripts estão configurados para serem carregados da raiz do projeto:
```html
<script src="../api.js"></script>
<script src="../cart.js"></script>
<script src="../orders.js"></script>
<script src="../app.js"></script>
```

Se você mover os arquivos, atualize os caminhos no `index.html`.

### Porta do Servidor

O frontend está configurado para rodar em qualquer porta. O backend deve estar em:
- **Padrão:** `http://localhost:3000/api`
- **Para mudar:** Edite `api.js`

---

## 🧪 Testes

### Teste 1: Funcionamento sem Backend

1. Abra o site sem iniciar o backend
2. **Resultado esperado:**
   - ✅ 3 cards de pizza aparecem (Margherita, Pepperoni, Quatro Queijos)
   - ✅ É possível adicionar pizzas ao carrinho
   - ✅ Carrinho funciona normalmente
   - ⚠️ Finalizar pedido mostra erro (esperado)

### Teste 2: Funcionamento com Backend

1. Inicie o backend na porta 3000
2. Recarregue a página
3. **Resultado esperado:**
   - ✅ Cards estáticos são substituídos pelos do backend
   - ✅ É possível finalizar pedidos
   - ✅ Histórico de pedidos funciona
   - ✅ Rastreamento funciona

### Teste 3: Carrinho (Offline)

1. Adicione pizzas ao carrinho
2. Feche o navegador
3. Abra novamente
4. **Resultado esperado:**
   - ✅ Itens ainda estão no carrinho (localStorage)

### Teste 4: Console do Navegador

Abra o DevTools (F12) e verifique:
- **Console:** Logs de inicialização e erros
- **Network:** Requisições HTTP sendo feitas
- **Application > Local Storage:** Dados do carrinho salvos

---

## 🔧 Troubleshooting

### Erro: "Erro ao carregar menu"
- **Causa:** Backend não está rodando ou URL incorreta
- **Solução:** 
  - Verifique se o backend está rodando
  - Verifique a URL em `api.js`
  - Cards estáticos devem aparecer mesmo com erro

### Erro: "Failed to fetch"
- **Causa:** Problema de CORS ou backend não acessível
- **Solução:**
  - Configure CORS no backend
  - Verifique se a URL está correta
  - Verifique firewall/antivírus

### Carrinho não aparece
- **Causa:** localStorage desabilitado ou erro no JavaScript
- **Solução:**
  - Verifique o console do navegador
  - Verifique se localStorage está habilitado
  - Limpe o localStorage e tente novamente

### Cards estáticos não aparecem
- **Causa:** Erro no HTML ou JavaScript
- **Solução:**
  - Verifique se os cards estão no HTML
  - Verifique o console para erros
  - Verifique se os scripts estão carregando

### Botões não funcionam
- **Causa:** Event listeners não foram configurados
- **Solução:**
  - Verifique se `app.init()` está sendo chamado
  - Verifique o console para erros
  - Verifique se os scripts estão na ordem correta

---

## 📝 Notas Importantes

1. **CORS:** O backend precisa permitir requisições do frontend
2. **Content-Type:** Todas as requisições POST usam `application/json`
3. **IDs:** Os IDs podem ser números ou strings (o frontend aceita ambos)
4. **Datas:** Use formato ISO 8601 para datas (`YYYY-MM-DDTHH:mm:ss.sssZ`)
5. **Preços:** Use números decimais (ex: `28.90`, não `"28,90"`)
6. **Fallback:** O frontend sempre mantém cards estáticos se o backend falhar
7. **localStorage:** O carrinho funciona completamente offline

---

## 🚀 Exemplo de Backend Básico (Node.js + Express)

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock de pizzas
const pizzas = [
  {
    id: 1,
    name: "Margherita",
    description: "Tomate, mussarela, manjericão e azeite",
    price: 28.90,
    image: "images/margherita.jpg"
  },
  {
    id: 2,
    name: "Pepperoni",
    description: "Pepperoni crocante com queijo extra",
    price: 34.50,
    image: "images/pepperoni.jpg"
  }
];

// GET /api/pizzas
app.get('/api/pizzas', (req, res) => {
  res.json(pizzas);
});

// POST /api/orders
app.post('/api/orders', (req, res) => {
  const order = {
    id: `ORD-${Date.now()}`,
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  res.json(order);
});

// GET /api/orders/:id
app.get('/api/orders/:id', (req, res) => {
  // Implementar busca do pedido
  res.json({
    id: req.params.id,
    status: 'preparing',
    // ... outros dados
  });
});

// GET /api/orders
app.get('/api/orders', (req, res) => {
  // Implementar busca do histórico
  res.json([]);
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
```

---

## 📚 Próximos Passos

1. ✅ Implementar os endpoints no backend
2. ✅ Configurar banco de dados para persistir pedidos
3. ✅ Adicionar autenticação (se necessário)
4. ✅ Implementar atualização de status em tempo real (WebSockets opcional)
5. ✅ Adicionar validações no backend
6. ✅ Implementar tratamento de erros robusto

---

**Boa sorte com o desenvolvimento do backend! 🎉**

Se tiver dúvidas sobre como o frontend funciona, verifique os comentários no código ou os métodos das classes.

