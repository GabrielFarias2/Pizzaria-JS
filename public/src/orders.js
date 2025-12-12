/**
 * OrderManager - Classe para gerenciamento de pedidos e histórico
 */
class OrderManager {
  constructor(apiService) {
    this.apiService = apiService;
    this.pollingInterval = null;
    this.currentOrderId = null;
  }

  /**
   * Rastreia o status de um pedido
   * @param {string|number} orderId - ID do pedido
   * @returns {Promise<object>} - Dados do pedido
   */
  async trackOrder(orderId) {
    try {
      const order = await this.apiService.getOrder(orderId);
      return order;
    } catch (error) {
      throw new Error(`Erro ao buscar pedido: ${error.message}`);
    }
  }

  /**
   * Busca o histórico de pedidos
   * @returns {Promise<Array>} - Lista de pedidos
   */
  async getOrderHistory() {
    try {
      const orders = await this.apiService.getOrderHistory();
      return orders;
    } catch (error) {
      throw new Error(`Erro ao buscar histórico: ${error.message}`);
    }
  }

  /**
   * Cancela um pedido
   * @param {string|number} orderId - ID do pedido
   * @returns {Promise<object>} - Resultado da operação
   */
  async cancelOrder(orderId) {
    try {
      const result = await this.apiService.cancelOrder(orderId);
      return result;
    } catch (error) {
      throw new Error(`Erro ao cancelar pedido: ${error.message}`);
    }
  }

  /**
   * Exibe o status do pedido na UI
   * @param {object} order - Dados do pedido
   * @param {HTMLElement} container - Container onde renderizar
   */
  displayOrderStatus(order, container) {
    if (!container) return;

    const statusMap = {
      pending: { text: "Pendente", class: "status-pending" },
      preparing: { text: "Preparando", class: "status-preparing" },
      "out-for-delivery": {
        text: "Saiu para entrega",
        class: "status-delivery",
      },
      delivered: { text: "Entregue", class: "status-delivered" },
      cancelled: { text: "Cancelado", class: "status-cancelled" },
    };

    const status = statusMap[order.status] || {
      text: order.status,
      class: "status-pending",
    };
    const formattedDate = new Date(
      order.createdAt || Date.now()
    ).toLocaleString("pt-BR");

    container.innerHTML = `
      <div class="order-status-card">
        <div class="order-header">
          <h4>Pedido #${order.id}</h4>
          <span class="order-status ${status.class}">${status.text}</span>
        </div>
        <div class="order-details">
          <p class="order-date">Data: ${formattedDate}</p>
          ${
            order.estimatedDelivery
              ? `<p class="order-delivery">Entrega estimada: ${order.estimatedDelivery}</p>`
              : ""
          }
        </div>
        <div class="order-items">
          <h5>Itens do pedido:</h5>
          <ul class="order-items-list">
            ${
              order.items
                ? order.items
                    .map(
                      (item) => `
              <li>
                <span>${item.quantity}x ${item.pizza?.name || item.name} (${
                        item.size
                      })</span>
                <span>R$ ${(
                  item.subtotal || item.price * item.quantity
                ).toFixed(2)}</span>
              </li>
            `
                    )
                    .join("")
                : ""
            }
          </ul>
        </div>
        <div class="order-total">
          <strong>Total: R$ ${(order.total || 0).toFixed(2)}</strong>
        </div>
        ${
          order.observations
            ? `<p class="order-observations">Observações: ${order.observations}</p>`
            : ""
        }
      </div>
    `;
  }

  /**
   * Exibe o histórico de pedidos na UI
   * @param {Array} orders - Lista de pedidos
   * @param {HTMLElement} container - Container onde renderizar
   */
  displayOrderHistory(orders, container) {
    if (!container) return;

    if (!orders || orders.length === 0) {
      container.innerHTML =
        '<p class="no-orders">Nenhum pedido encontrado.</p>';
      return;
    }

    const statusMap = {
      pending: { text: "Pendente", class: "status-pending" },
      preparing: { text: "Preparando", class: "status-preparing" },
      "out-for-delivery": {
        text: "Saiu para entrega",
        class: "status-delivery",
      },
      delivered: { text: "Entregue", class: "status-delivered" },
      cancelled: { text: "Cancelado", class: "status-cancelled" },
    };

    container.innerHTML = `
      <div class="order-history-list">
        ${orders
          .map((order) => {
            const status = statusMap[order.status] || {
              text: order.status,
              class: "status-pending",
            };
            const formattedDate = new Date(
              order.createdAt || Date.now()
            ).toLocaleString("pt-BR");
            const itemCount = order.items
              ? order.items.reduce((sum, item) => sum + item.quantity, 0)
              : 0;
            const isPending = order.status === "pending";

            return `
            <div class="order-history-item" data-order-id="${order.id}">
              <div class="order-history-header">
                <div>
                  <h4>Pedido #${order.id}</h4>
                  <p class="order-history-date">${formattedDate}</p>
                </div>
                <span class="order-status ${status.class}">${status.text}</span>
              </div>
              <div class="order-history-info">
                <p>${itemCount} item(ns) • Total: R$ ${(
              order.total || 0
            ).toFixed(2)}</p>
              </div>
              
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
          })
          .join("")}
      </div>
    `;

    // Adiciona event listeners aos botões de cancelar
    this.attachCancelEventListeners(container);
  }

  /**
   * Adiciona event listeners aos botões de cancelar
   * @param {HTMLElement} container - Container com os botões
   */
  attachCancelEventListeners(container) {
    const cancelButtons = container.querySelectorAll('[data-action="cancel"]');

    cancelButtons.forEach((button) => {
      button.addEventListener("click", async (e) => {
        const orderId = e.target.dataset.id;

        // Confirmação do usuário
        if (!confirm(`Deseja realmente cancelar o pedido #${orderId}?`)) {
          return;
        }

        try {
          // Desabilita o botão durante o processamento
          button.disabled = true;
          button.textContent = "Cancelando...";

          // Cancela o pedido
          await this.cancelOrder(orderId);

          // Atualiza a lista de pedidos
          const orders = await this.getOrderHistory();
          this.displayOrderHistory(orders, container);

          // Feedback de sucesso
          alert(`Pedido #${orderId} cancelado com sucesso!`);
        } catch (error) {
          console.error("Erro ao cancelar pedido:", error);
          alert(`Erro ao cancelar pedido: ${error.message}`);

          // Reabilita o botão em caso de erro
          button.disabled = false;
          button.textContent = "Cancelar Pedido";
        }
      });
    });
  }

  /**
   * Inicia o polling para atualizar o status do pedido
   * @param {string|number} orderId - ID do pedido
   * @param {Function} callback - Callback chamado a cada atualização
   * @param {number} interval - Intervalo em milissegundos (padrão: 5000)
   */
  startOrderPolling(orderId, callback, interval = 5000) {
    this.stopOrderPolling();
    this.currentOrderId = orderId;

    const poll = async () => {
      try {
        const order = await this.trackOrder(orderId);
        if (callback) callback(order);

        // Para o polling se o pedido foi entregue ou cancelado
        if (order.status === "delivered" || order.status === "cancelled") {
          this.stopOrderPolling();
        }
      } catch (error) {
        console.error("Erro no polling:", error);
      }
    };

    // Primeira chamada imediata
    poll();

    // Polling periódico
    this.pollingInterval = setInterval(poll, interval);
  }

  /**
   * Para o polling de status do pedido
   */
  stopOrderPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      this.currentOrderId = null;
    }
  }
}
