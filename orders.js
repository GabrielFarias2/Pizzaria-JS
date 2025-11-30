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
            </div>
          `;
          })
          .join("")}
      </div>
    `;
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
