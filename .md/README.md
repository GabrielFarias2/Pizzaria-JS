# 🍕 Pizzaria Deliver's - Frontend

Frontend moderno para sistema de pedidos de pizzaria, construído com JavaScript puro usando Programação Orientada a Objetos (OOP).

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Arquitetura OOP](#arquitetura-oop)
- [Como Funciona](#como-funciona)
- [Integração com Backend](#integração-com-backend)
- [Endpoints da API](#endpoints-da-api)
- [Formato de Dados](#formato-de-dados)
- [Como Testar](#como-testar)

## 🎯 Visão Geral

Este projeto é um frontend completo para uma pizzaria, desenvolvido com:
- **JavaScript puro** (sem frameworks)
- **Programação Orientada a Objetos** (classes ES6+)
- **Design moderno** (tema preto, branco e vermelho)
- **Responsivo** (funciona em mobile e desktop)

### Funcionalidades

- ✅ Visualização do cardápio de pizzas
- ✅ Carrinho de compras com localStorage
- ✅ Formulário de pedidos
- ✅ Rastreamento de pedidos
- ✅ Histórico de pedidos
- ✅ Notificações toast
- ✅ Loading states

## 📁 Estrutura do Projeto

```
pizza.js-backend/
├── index.html          # Página principal HTML
├── style.css          # Estilos do site
├── api.js             # Classe ApiService (comunicação com backend)
├── cart.js            # Classe Cart (gerenciamento do carrinho)
├── orders.js          # Classe OrderManager (pedidos e histórico)
├── app.js             # Classe PizzaApp (controlador principal)
└── README.md          # Esta documentação
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

### 2. `Cart` (cart.js)
Gerencia o carrinho de compras localmente.

**Métodos principais:**
- `addItem(pizza, size, quantity, observations)` - Adiciona item
- `removeItem(itemId)` - Remove item
- `updateQuantity(itemId, quantity)` - Atualiza quantidade
- `getTotal()` - Calcula total
- `clear()` - Limpa o carrinho

**Persistência:** Os dados são salvos automaticamente no `localStorage`.

### 3. `OrderManager` (orders.js)
Gerencia pedidos e histórico.

**Métodos principais:**
- `trackOrder(orderId)` - Rastreia um pedido
- `getOrderHistory()` - Busca histórico
- `displayOrderStatus(order, container)` - Exibe status na tela
- `displayOrderHistory(orders, container)` - Exibe histórico na tela
- `startOrderPolling(orderId, callback)` - Inicia atualização automática

### 4. `PizzaApp` (app.js)
**Controlador principal** que coordena todas as outras classes.

**Métodos principais:**
- `init()` - Inicializa a aplicação
- `renderMenu()` - Renderiza o cardápio
- `renderCart()` - Atualiza o carrinho na tela
- `handleAddToCart(pizza)` - Adiciona pizza ao carrinho
- `handleOrderFormSubmit(event)` - Processa formulário de pedido
- `showNotification(message, type)` - Exibe notificações

## 🔄 Como Funciona

### Fluxo de Inicialização

1. Quando a página carrega, o `PizzaApp` é instanciado
2. O método `init()` é chamado, que:
   - Configura os event listeners
   - Carrega o menu de pizzas da API
   - Renderiza o carrinho (se houver itens salvos)
   - Carrega o histórico de pedidos

### Fluxo de Pedido

1. **Usuário adiciona pizza ao carrinho:**
   - Clica em "Adicionar" no card da pizza
   - Escolhe tamanho e quantidade
   - Item é adicionado ao `Cart`
   - Carrinho é atualizado na tela

2. **Usuário finaliza pedido:**
   - Clica em "Finalizar pedido" no carrinho
   - Dados são enviados via `ApiService.createOrder()`
   - Se sucesso: carrinho é limpo e notificação é exibida
   - Histórico é atualizado automaticamente

## 🔌 Integração com Backend

### Passo 1: Configurar a URL da API

Por padrão, a API está configurada para:
```
http://localhost:3000/api
```

Para mudar, edite o arquivo `api.js`:

```javascript
class ApiService {
  constructor(baseUrl = 'http://localhost:3000/api') {
    this.baseUrl = baseUrl;
  }
  // ...
}
```

Ou ao instanciar:
```javascript
const apiService = new ApiService('http://seu-servidor.com/api');
```

### Passo 2: Configurar CORS no Backend

O backend precisa permitir requisições do frontend. Configure CORS:

```javascript
// Exemplo com Express
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000', // ou a URL do seu frontend
  credentials: true
}));
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
    "image": "https://exemplo.com/pizza.jpg"
  },
  {
    "id": 2,
    "name": "Pepperoni",
    "description": "Pepperoni crocante com queijo extra",
    "price": 34.50,
    "image": "https://exemplo.com/pepperoni.jpg"
  }
]
```

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

### 3. GET `/api/orders/:id`
Busca detalhes de um pedido específico.

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

## 📦 Formato de Dados

### Estrutura de Pizza
```javascript
{
  id: Number,              // ID único da pizza
  name: String,            // Nome da pizza
  description: String,     // Descrição (opcional)
  price: Number,           // Preço em reais
  image: String            // URL da imagem (opcional)
}
```

### Estrutura de Item do Pedido
```javascript
{
  pizzaId: Number,         // ID da pizza
  name: String,            // Nome da pizza
  size: String,            // "Pequena", "Média" ou "Grande"
  quantity: Number,         // Quantidade
  price: Number,           // Preço unitário
  observations: String      // Observações (opcional)
}
```

### Estrutura de Pedido
```javascript
{
  id: String,              // ID único do pedido
  items: Array,            // Array de itens
  total: Number,           // Valor total
  status: String,          // Status do pedido
  createdAt: String,        // Data de criação (ISO 8601)
  estimatedDelivery: String // Data estimada de entrega (opcional)
}
```

## 🧪 Como Testar

### 1. Testar sem Backend (Modo Offline)

O carrinho funciona mesmo sem backend, pois usa `localStorage`. Você pode:
- Adicionar pizzas ao carrinho
- Ver o carrinho funcionando
- Testar a interface

### 2. Testar com Backend Mock

Crie um servidor simples para testar:

```javascript
// server.js (exemplo básico)
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock de pizzas
app.get('/api/pizzas', (req, res) => {
  res.json([
    {
      id: 1,
      name: "Margherita",
      description: "Tomate, mussarela, manjericão e azeite",
      price: 28.90,
      image: "https://exemplo.com/pizza.jpg"
    }
  ]);
});

// Mock de criar pedido
app.post('/api/orders', (req, res) => {
  const order = {
    id: `ORD-${Date.now()}`,
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  res.json(order);
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
```

### 3. Verificar no Console do Navegador

Abra o DevTools (F12) e verifique:
- **Console**: Erros de requisição
- **Network**: Requisições HTTP sendo feitas
- **Application > Local Storage**: Dados do carrinho salvos

## 🔧 Troubleshooting

### Erro: "Erro ao carregar menu"
- Verifique se o backend está rodando
- Verifique a URL da API em `api.js`
- Verifique CORS no backend

### Carrinho não aparece
- Verifique o console do navegador
- Verifique se `localStorage` está habilitado
- Limpe o `localStorage` e tente novamente

### Pedido não é criado
- Verifique o formato dos dados enviados
- Verifique o console para erros
- Verifique se o endpoint `/api/orders` está funcionando

## 📝 Notas Importantes

1. **CORS**: O backend precisa permitir requisições do frontend
2. **Content-Type**: Todas as requisições POST usam `application/json`
3. **IDs**: Os IDs podem ser números ou strings (o frontend aceita ambos)
4. **Datas**: Use formato ISO 8601 para datas (`YYYY-MM-DDTHH:mm:ss.sssZ`)
5. **Preços**: Use números decimais (ex: `28.90`, não `"28,90"`)

## 🚀 Próximos Passos

1. Implementar os endpoints no backend
2. Configurar banco de dados para persistir pedidos
3. Adicionar autenticação (se necessário)
4. Implementar atualização de status em tempo real (WebSockets opcional)

---

**Boa sorte com o desenvolvimento do backend! 🎉**

Se tiver dúvidas sobre como o frontend funciona, verifique os comentários no código ou os métodos das classes.

