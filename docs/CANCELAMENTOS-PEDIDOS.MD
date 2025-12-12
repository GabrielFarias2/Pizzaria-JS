# Implementação de Cancelamento de Pedidos

Esta documentação detalha o passo a passo para adicionar a funcionalidade de "Cancelar Pedido" no sistema da Pizzaria Deliver's. O objetivo é permitir que o usuário cancele um pedido pendente diretamente pelo histórico de pedidos.

---

## 1. Visão Geral das Mudanças

Teremos que alterar 4 arquivos principais:
1.  **`backend/server.js`**: Criar um novo endpoint API (`DELETE /api/orders/:id`) para processar o cancelamento.
2.  **`public/src/api.js`**: Adicionar método para chamar esse novo endpoint.
3.  **`public/src/orders.js`**: Adicionar o botão "Cancelar" na interface e a lógica de clique.
4.  **`public/style.css`**: Estilizar o botão de cancelamento (vermelho).

---

## 2. Alterações no Backend (`backend/server.js`)

Precisamos adicionar uma rota que recebe o ID do pedido e o remove do banco de dados, mas **apenas se o status permitir**.

**O que fazer:**
Adicione o seguinte código no final do arquivo, antes do `app.listen`:

```javascript
// DELETE /api/orders/:id - Cancela um pedido (apenas se status for 'pending')
app.delete("/api/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Busca o pedido para verificar status
    const order = await prisma.order.findUnique({
      where: { id: id }, // Se id for string/uuid. Se for int, use parseInt(id)
    });

    if (!order) {
      return res.status(404).json({ message: "Pedido não encontrado" });
    }

    // 2. Verificação de Segurança (Regra de Negócio)
    if (order.status !== "pending") {
      return res.status(400).json({ 
        message: "Apenas pedidos pendentes podem ser cancelados." 
      });
    }

    // 3. Deleta o pedido (ou atualiza status para 'cancelled' se preferir soft delete)
    // Opção A: Soft Delete (Recomendado para histórico)
    const updatedOrder = await prisma.order.update({
      where: { id: id },
      data: { status: "cancelled" },
    });
    
    // Opção B: Hard Delete (Apaga do banco)
    // await prisma.order.delete({ where: { id: id } });

    res.json({ message: "Pedido cancelado com sucesso", order: updatedOrder });

  } catch (error) {
    console.error("Erro ao cancelar pedido:", error);
    res.status(500).json({ message: "Erro ao cancelar pedido" });
  }
});
```

---

## 3. Alterações no Frontend

### 3.1. API Service (`public/src/api.js`)

Adicione o método `cancelOrder` na classe `ApiService` para comunicar com o backend.

```javascript
  /**
   * Cancela um pedido
   * @param {string|number} id - ID do pedido
   * @returns {Promise<object>} - Resultado da operação
   */
  async cancelOrder(id) {
    return await this.request(`/orders/${id}`, {
      method: "DELETE",
    });
  }
```

### 3.2. Gerenciador de Pedidos (`public/src/orders.js`)

Precisamos fazer duas coisas aqui:
1.  Adicionar o botão no HTML gerado.
2.  Adicionar o evento de clique para esse botão.

**No método `displayOrderHistory`:**

Encontre onde o HTML de cada item é gerado (`mapped`) e adicione o botão condicionalmente (apenas para status 'pending'):

```javascript
// ... dentro do map((order) => { ...
const isPending = order.status === "pending";

return `
  <div class="order-history-item" data-order-id="${order.id}">
    <div class="order-history-header">
      <!-- ... (código existente) ... -->
      <span class="order-status ${status.class}">${status.text}</span>
    </div>
    <div class="order-history-info">
      <p>${itemCount} item(ns) • Total: R$ ${(order.total || 0).toFixed(2)}</p>
    </div>
    
    <!-- NOVO: Botão de Cancelar (Apenas se pendente) -->
    ${
      isPending
        ? `<div class="order-actions" style="margin-top: 10px; text-align: right;">
             <button class="btn btn-sm btn-delete" data-action="cancel" data-id="${order.id}">
               Cancelar Pedido
             </button>
           </div>`
        : ""
    }
  </div>
`;
```

**Adicionar Listener de Eventos:**

No `app.js` (ou onde você inicializa os listeners), adicione a lógica para capturar o clique nesse botão. Como os botões são criados dinamicamente, é melhor adicionar um listener no container pai ou refreshar os listeners após renderizar.

Sugestão: Adicionar no `app.js` dentro do `setupEventListeners`:

```javascript
// Listener para cancelamento de pedido (Event Delegation)
const historyContainer = document.querySelector(".order-history-container");
if (historyContainer) {
  historyContainer.addEventListener("click", async (e) => {
    if (e.target.classList.contains("btn-delete")) {
      e.stopPropagation(); // Evita abrir o detalhe do pedido se houver clique no card
      
      const orderId = e.target.dataset.id;
      
      // Confirmação (Simples)
      if (!confirm("Tem certeza que deseja cancelar este pedido?")) {
        return;
      }

      this.showLoading(true);
      try {
        await this.apiService.cancelOrder(orderId);
        this.showNotification("Pedido cancelado com sucesso!", "success");
        await this.loadOrderHistory(); // Recarrega a lista
      } catch (error) {
        this.showNotification(`Erro: ${error.message}`, "error");
      } finally {
        this.showLoading(false);
      }
    }
  });
}
```

### 3.3. Estilização (`public/style.css`)

Adicione o estilo para o botão de delete para que ele se destaque como uma ação destrutiva.

```css
/* Botão de Delete (Cancelar) */
.btn-delete {
  background-color: transparent;
  border: 1px solid var(--red);
  color: var(--red);
  padding: 4px 12px;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}

.btn-delete:hover {
  background-color: var(--red);
  color: var(--white);
  box-shadow: 0 2px 5px rgba(220, 38, 38, 0.4);
}
```

---

## 4. Fluxo de Segurança

O fluxo implementado garante a segurança de duas formas:

1.  **Frontend**: O botão "Cancelar" só é exibido se o status do pedido for `pending`.
2.  **Backend (Principal)**: Mesmo que alguém tente forçar a chamada da API (via Postman ou console), o backend verifica `if (order.status !== "pending")` antes de executar a ação. Se o pedido já estiver em preparo ou saiu para entrega, a API retorna Erro 400.

---

## Resumo dos Arquivos a Modificar

| Arquivo | Ação | Descrição |
| :--- | :--- | :--- |
| `backend/server.js` | Modificar | Adicionar `app.delete('/api/orders/:id')` |
| `public/src/api.js` | Modificar | Adicionar método `cancelOrder()` |
| `public/src/orders.js` | Modificar | Inserir botão de DELETE no HTML do histórico |
| `public/src/app.js` | Modificar | Capturar o clique no botão e chamar a API |
| `public/style.css` | Modificar | Criar classe `.btn-delete` |
