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
            const isCancelled = order.status === "cancelled";

            return `
            <div class="order-history-item" data-order-id="${order.id}">
              <div class="order-history-header">
                <div>
                  <h4>Pedido #${order.id}</h4>
                  <p class="order-history-date">${formattedDate}</p>
                </div>
                <div class="order-status-wrapper">
                    <span class="order-status ${status.class}">${status.text}</span>
                    ${
                        isCancelled
                        ? `<button class="btn-remove-order" data-action="remove" data-id="${order.id}" title="Remover do histórico">×</button>`
                        : ''
                    }
                </div>
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

    // Adiciona event listeners aos botões
    this.attachEventListeners(container);
  }

  /**
   * Adiciona event listeners aos botões de cancelar e remover
   * @param {HTMLElement} container - Container com os botões
   */
  attachEventListeners(container) {
    // Cancel buttons
    const cancelButtons = container.querySelectorAll('[data-action="cancel"]');
    cancelButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const orderId = e.target.dataset.id;
        this.openCancelModal(orderId);
      });
    });

    // Remove buttons (X)
    const removeButtons = container.querySelectorAll('[data-action="remove"]');
    removeButtons.forEach((button) => {
        button.addEventListener("click", async (e) => {
            e.stopPropagation();
            const orderId = e.target.dataset.id;
            try {
                await this.apiService.deleteOrder(orderId);
                // Remove element from DOM visual effect
                const item = button.closest('.order-history-item');
                if(item) {
                    item.style.transition = 'all 0.3s ease';
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.9)';
                    setTimeout(() => item.remove(), 300);
                }
                // Optional: Recalculate history if empty
                const remaining = container.querySelectorAll('.order-history-item').length - 1;
                if (remaining <= 0) {
                     setTimeout(() => this.getOrderHistory().then(orders => this.displayOrderHistory(orders, container)), 300);
                }
            } catch (error) {
                console.error("Erro ao remover pedido:", error);
                alert(`Erro ao remover pedido: ${error.message}`);
            }
        });
    });
  }

  setupCancelModal() {
      const modal = document.getElementById('cancel-modal');
      const yesBtn = document.getElementById('cancel-modal-yes');
      const noBtn = document.getElementById('cancel-modal-no');
      const idDisplay = document.getElementById('cancel-order-id-display');

      if (!modal || !yesBtn || !noBtn) return;

      this.cancelModalElements = { modal, yesBtn, noBtn, idDisplay };

      const closeModal = () => {
          modal.classList.remove('active');
          modal.setAttribute('aria-hidden', 'true');
          this.orderToCancel = null;
      };

      noBtn.addEventListener('click', closeModal);
      modal.addEventListener('click', (e) => {
          if(e.target === modal) closeModal();
      });

      yesBtn.addEventListener('click', async () => {
          if (!this.orderToCancel) return;

          const orderId = this.orderToCancel;
          yesBtn.disabled = true;
          yesBtn.textContent = 'Cancelando...';

          try {
              await this.cancelOrder(orderId);
              
              // Refresh history
              const historyContainer = document.querySelector('.order-history-container');
              if (historyContainer) {
                  const orders = await this.getOrderHistory();
                  this.displayOrderHistory(orders, historyContainer);
              }
              
              closeModal();
              // Show notification if app is global or use alert
              // Ideally communicate back to app, but alert is fine for now as requested by user effectively
              // User asked for modal instead of alert.
              // We can use a custom toast if available, but I'll stick to non-alert success feedback if possible, 
              // but standard success is often just UI update.
              // I'll show a simple alert or reuse the notification system if I can access it.
              // Since OrderManager doesn't have access to PizzaApp directly, I'll rely on UI update.
              
          } catch (error) {
              console.error("Erro ao cancelar:", error);
              alert(`Erro: ${error.message}`);
          } finally {
              yesBtn.disabled = false;
              yesBtn.textContent = 'Sim, cancelar';
          }
      });
  }

  openCancelModal(orderId) {
      if (!this.cancelModalElements) {
          // Fallback if setup wasn't called
          if(confirm(`Deseja cancelar o pedido #${orderId}?`)) {
              this.cancelOrder(orderId).then(() => {
                  window.location.reload(); // Simple fallback
              });
          }
          return;
      }
      
      this.orderToCancel = orderId;
      this.cancelModalElements.idDisplay.textContent = `Pedido #${orderId}`;
      this.cancelModalElements.modal.classList.add('active');
      this.cancelModalElements.modal.setAttribute('aria-hidden', 'false');
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
