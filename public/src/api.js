/**
 * ApiService - Classe para comunicação com a API do backend
 */
class ApiService {
  constructor(baseUrl = "/api") {
    this.baseUrl = baseUrl;
  }

  /**
   * Faz uma requisição HTTP genérica
   * @param {string} endpoint - Endpoint da API
   * @param {object} options - Opções do fetch (method, body, etc.)
   * @returns {Promise<object>} - Resposta da API
   */
  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const config = {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Erro detalhado da API:", errorData); // Log full error object
        const errorMessage = errorData.message || `Erro HTTP: ${response.status}`;
        const detailedError = errorData.error ? ` | Detalhes: ${errorData.error}` : "";
        throw new Error(errorMessage + detailedError);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Erro na requisição: ${error.message}`);
    }
  }

  /**
   * Busca todas as pizzas do cardápio
   * @returns {Promise<Array>} - Lista de pizzas
   */
  async getPizzas() {
    return await this.request("/pizzas");
  }

  /**
   * Cria um novo pedido
   * @param {object} orderData - Dados do pedido
   * @returns {Promise<object>} - Pedido criado
   */
  async createOrder(orderData) {
    return await this.request("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  /**
   * Busca detalhes de um pedido específico
   * @param {string|number} id - ID do pedido
   * @returns {Promise<object>} - Detalhes do pedido
   */
  async getOrder(id) {
    return await this.request(`/orders/${id}`);
  }

  /**
   * Busca histórico de pedidos
   * @returns {Promise<Array>} - Lista de pedidos anteriores
   */
  async getOrderHistory() {
    return await this.request("/orders");
  }
  /**
   * Cancela um pedido
   * @param {string|number} id - ID do pedido
   * @returns {Promise<object>} - Resultado da operação
   */

  async cancelOrder(id) {
    return await this.request(`/orders/${id}/cancel`, {
      method: "PATCH",
    });
  }

  /**
   * Deleta um pedido (Remove do banco)
   * @param {string|number} id - ID do pedido
   * @returns {Promise<object>} - Resultado da operação
   */
  async deleteOrder(id) {
    return await this.request(`/orders/${id}`, {
      method: "DELETE",
    });
  }
}
