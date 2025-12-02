/**
 * Cart - Classe para gerenciamento do carrinho de compras
 */
class Cart {
  constructor() {
    this.items = [];
    this.storageKey = "pizzaria_cart";
    this.callbacks = [];
    this.loadFromStorage();
  }

  /**
   * Adiciona um callback para ser executado quando o carrinho for atualizado
   * @param {Function} callback - Função callback
   */
  onUpdate(callback) {
    this.callbacks.push(callback);
  }

  /**
   * Notifica todos os callbacks registrados
   */
  notifyUpdate() {
    this.callbacks.forEach((callback) => callback(this.items, this.getTotal()));
  }

  /**
   * Gera um ID único para o item do carrinho
   * @returns {string} - ID único
   */
  generateItemId() {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Adiciona um item ao carrinho
   * @param {object} pizza - Objeto da pizza
   * @param {string} size - Tamanho da pizza
   * @param {number} quantity - Quantidade
   * @param {string} observations - Observações do pedido
   */
  addItem(pizza, size, quantity = 1, observations = "") {
    const item = {
      id: this.generateItemId(),
      pizza: {
        id: pizza.id,
        name: pizza.name,
        description: pizza.description,
        price: pizza.price,
        image: pizza.image,
      },
      size,
      quantity: parseInt(quantity),
      observations,
      subtotal: pizza.price * parseInt(quantity),
    };

    this.items.push(item);
    this.saveToStorage();
    this.notifyUpdate();
    return item;
  }

  /**
   * Remove um item do carrinho
   * @param {string} itemId - ID do item
   */
  removeItem(itemId) {
    this.items = this.items.filter((item) => item.id !== itemId);
    this.saveToStorage();
    this.notifyUpdate();
  }

  /**
   * Atualiza a quantidade de um item
   * @param {string} itemId - ID do item
   * @param {number} quantity - Nova quantidade
   */
  updateQuantity(itemId, quantity) {
    const item = this.items.find((item) => item.id === itemId);
    if (item) {
      item.quantity = Math.max(1, parseInt(quantity));
      item.subtotal = item.pizza.price * item.quantity;
      this.saveToStorage();
      this.notifyUpdate();
    }
  }

  /**
   * Calcula o total do carrinho
   * @returns {number} - Valor total
   */
  getTotal() {
    return this.items.reduce((total, item) => total + item.subtotal, 0);
  }

  /**
   * Retorna todos os itens do carrinho
   * @returns {Array} - Lista de itens
   */
  getItems() {
    return this.items;
  }

  /**
   * Retorna a quantidade total de itens no carrinho
   * @returns {number} - Quantidade total
   */
  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  /**
   * Limpa o carrinho
   */
  clear() {
    this.items = [];
    this.saveToStorage();
    this.notifyUpdate();
  }

  /**
   * Salva o carrinho no localStorage
   */
  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    } catch (error) {
      console.error("Erro ao salvar carrinho:", error);
    }
  }

  /**
   * Carrega o carrinho do localStorage
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.items = JSON.parse(stored);
        this.notifyUpdate();
      }
    } catch (error) {
      console.error("Erro ao carregar carrinho:", error);
      this.items = [];
    }
  }
}
