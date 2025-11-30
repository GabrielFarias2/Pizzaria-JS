/**
 * PizzaApp - Classe principal do aplicativo
 */
class PizzaApp {
  constructor() {
    this.apiService = new ApiService();
    this.cart = new Cart();
    this.orderManager = new OrderManager(this.apiService);
    this.pizzas = [];
    this.isLoading = false;
  }

  /**
   * Inicializa a aplicação
   */
  async init() {
    console.log('Inicializando PizzaApp...');
    this.setupEventListeners();
    this.setupCartUpdates();
    
    // Carrega cards estáticos do HTML primeiro
    this.loadStaticCards();
    
    // Tenta carregar menu do backend, mas não falha se não houver backend
    try {
      await this.renderMenu();
    } catch (error) {
      console.warn('Erro ao carregar menu do backend (normal se backend não estiver rodando):', error.message);
    }
    
    this.renderCart();
    
    // Tenta carregar histórico, mas não falha se não houver backend
    try {
      await this.loadOrderHistory();
    } catch (error) {
      console.warn('Erro ao carregar histórico (normal se backend não estiver rodando):', error.message);
    }
    
    console.log('PizzaApp inicializado com sucesso!');
  }

  /**
   * Carrega os cards estáticos do HTML e adiciona ao array de pizzas
   */
  loadStaticCards() {
    const cards = document.querySelectorAll('.cards .card[data-pizza-name]');
    cards.forEach((card, index) => {
      const name = card.dataset.pizzaName;
      const priceText = card.querySelector('.price')?.textContent;
      const description = card.querySelector('.card-body p')?.textContent || '';
      const image = card.querySelector('.card-img')?.src || '';
      
      if (priceText) {
        const price = parseFloat(priceText.replace('R$', '').replace(',', '.').trim());
        
        // Verifica se a pizza já existe no array (evita duplicatas)
        const exists = this.pizzas.find(p => p.name === name);
        if (!exists) {
          this.pizzas.push({
            id: `static-${index + 1}`,
            name: name,
            description: description,
            price: price,
            image: image
          });
        }
      }
    });
    
    if (this.pizzas.length > 0) {
      console.log(`${this.pizzas.length} pizza(s) estática(s) carregada(s) do HTML`);
      // Atualiza o select do formulário
      this.updateOrderFormSelect();
    }
  }

  /**
   * Configura os event listeners do carrinho
   */
  setupCartUpdates() {
    this.cart.onUpdate(() => {
      this.renderCart();
    });
  }

  /**
   * Configura todos os event listeners
   */
  setupEventListeners() {
    // Formulário de pedido
    const orderForm = document.querySelector('.order-form');
    if (orderForm) {
      orderForm.addEventListener('submit', (e) => this.handleOrderFormSubmit(e));
    }

    // Botões "Adicionar ao carrinho" nos cards do menu
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-add-to-cart')) {
        const card = e.target.closest('.card');
        if (card) {
          const pizzaId = card.dataset.pizzaId;
          let pizza = null;
          
          // Tenta encontrar a pizza pelo ID (cards dinâmicos do backend)
          if (pizzaId) {
            pizza = this.pizzas.find(p => p.id == pizzaId);
          }
          
          // Se não encontrou pelo ID, tenta pelo nome (cards estáticos)
          if (!pizza) {
            const pizzaName = card.querySelector('h4')?.textContent;
            if (pizzaName) {
              // Busca no array de pizzas do backend
              pizza = this.pizzas.find(p => p.name === pizzaName);
              
              // Se ainda não encontrou, cria um objeto mock para cards estáticos
              if (!pizza) {
                const priceText = card.querySelector('.price')?.textContent;
                const price = priceText ? parseFloat(priceText.replace('R$', '').replace(',', '.').trim()) : 0;
                const description = card.querySelector('.card-body p')?.textContent || '';
                const image = card.querySelector('.card-img')?.src || '';
                
                pizza = {
                  id: null,
                  name: pizzaName,
                  description: description,
                  price: price,
                  image: image
                };
              }
            }
          }
          
          if (pizza) {
            this.handleAddToCart(pizza);
          } else {
            this.showNotification('Erro ao adicionar pizza ao carrinho. Tente novamente.', 'error');
          }
        }
      }
    });

    // Toggle do carrinho
    const cartIcon = document.querySelector('.cart-icon');
    const cartModal = document.querySelector('.cart-modal');
    const cartClose = document.querySelector('.cart-close');
    
    if (cartIcon && cartModal) {
      cartIcon.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Carrinho clicado - abrindo modal');
        cartModal.classList.toggle('active');
        // Garante que o carrinho está atualizado ao abrir
        this.renderCart();
      });
    } else {
      console.warn('Cart icon or modal not found', { cartIcon, cartModal });
    }

    if (cartClose && cartModal) {
      cartClose.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        cartModal.classList.remove('active');
      });
    }

    // Botão "Pedir" (mobile)
    const mobileOrderBtn = document.querySelector('.mobile-order');
    if (mobileOrderBtn) {
      mobileOrderBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Rola até a seção de pedido
        const pedidoSection = document.querySelector('#pedido');
        if (pedidoSection) {
          pedidoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          console.warn('Seção #pedido não encontrada');
        }
      });
    } else {
      console.warn('Botão .mobile-order não encontrado');
    }

    // Remover item do carrinho
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('cart-remove-item')) {
        const itemId = e.target.dataset.itemId;
        this.cart.removeItem(itemId);
      }
    });

    // Atualizar quantidade no carrinho
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('cart-quantity')) {
        const itemId = e.target.dataset.itemId;
        const quantity = e.target.value;
        this.cart.updateQuantity(itemId, quantity);
      }
    });

    // Finalizar pedido do carrinho
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('cart-checkout')) {
        this.handleCartCheckout();
      }
    });

    // Navegação para histórico de pedidos
    const historyLink = document.querySelector('[href="#historico"]');
    if (historyLink) {
      historyLink.addEventListener('click', async (e) => {
        e.preventDefault();
        await this.loadOrderHistory();
      });
    }

    // Fechar modal ao clicar fora
    if (cartModal) {
      cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) {
          cartModal.classList.remove('active');
        }
      });
    }
  }

  /**
   * Renderiza o menu de pizzas
   */
  async renderMenu() {
    const menuContainer = document.querySelector('.cards');
    if (!menuContainer) return;

    // Verifica se já existem cards estáticos no HTML
    const existingCards = menuContainer.querySelectorAll('.card');
    const hasStaticCards = existingCards.length > 0;

    this.showLoading(true);
    try {
      this.pizzas = await this.apiService.getPizzas();
      
      if (!this.pizzas || this.pizzas.length === 0) {
        // Se não há pizzas do backend mas há cards estáticos, mantém os estáticos
        if (hasStaticCards) {
          console.log('Backend não retornou pizzas, mantendo cards estáticos');
          return;
        }
        // Só mostra mensagem se não houver cards estáticos
        menuContainer.innerHTML = '<p>Nenhuma pizza disponível no momento.</p>';
        return;
      }

      // Se chegou aqui, o backend retornou dados - substitui os cards
      menuContainer.innerHTML = this.pizzas.map(pizza => `
        <article class="card" data-pizza-id="${pizza.id}">
          <img 
            src="${pizza.image || 'images/uma-pizza-deliciosa-no-estudio (1).jpg'}" 
            alt="${pizza.name}" 
            class="card-img"
          />
          <div class="card-body">
            <h4>${pizza.name}</h4>
            <p>${pizza.description || ''}</p>
            <div class="card-footer">
              <span class="price">R$ ${pizza.price.toFixed(2)}</span>
              <button class="btn btn-sm btn-add-to-cart">Adicionar</button>
            </div>
          </div>
        </article>
      `).join('');

      // Atualiza o select do formulário com as pizzas disponíveis
      this.updateOrderFormSelect();
    } catch (error) {
      // Se houver erro mas existirem cards estáticos, mantém os estáticos
      if (hasStaticCards) {
        console.log('Erro ao carregar menu do backend, mantendo cards estáticos:', error.message);
        // Não mostra notificação de erro se há cards estáticos funcionando
        return;
      }
      // Só mostra erro se não houver cards estáticos
      this.showNotification(`Erro ao carregar menu: ${error.message}`, 'error');
      menuContainer.innerHTML = '<p>Erro ao carregar o cardápio. Tente novamente mais tarde.</p>';
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Atualiza o select de sabores no formulário de pedido
   */
  updateOrderFormSelect() {
    const saborSelect = document.getElementById('sabor');
    if (!saborSelect || !this.pizzas || this.pizzas.length === 0) return;

    // Mantém a primeira opção (placeholder)
    const firstOption = saborSelect.querySelector('option[value=""]');
    saborSelect.innerHTML = '';
    if (firstOption) {
      saborSelect.appendChild(firstOption);
    }

    // Adiciona as pizzas
    this.pizzas.forEach(pizza => {
      const option = document.createElement('option');
      option.value = pizza.name;
      option.textContent = pizza.name;
      saborSelect.appendChild(option);
    });
  }

  /**
   * Manipula o clique em "Adicionar ao carrinho" nos cards
   * @param {object} pizza - Objeto da pizza
   */
  handleAddToCart(pizza) {
    console.log('Adicionando pizza ao carrinho:', pizza);
    
    // Abre um modal simples para escolher tamanho e quantidade
    const size = prompt('Escolha o tamanho:\n1 - Pequena\n2 - Média\n3 - Grande', '2');
    if (!size) {
      console.log('Usuário cancelou seleção de tamanho');
      return;
    }

    const sizeMap = { '1': 'Pequena', '2': 'Média', '3': 'Grande' };
    const selectedSize = sizeMap[size] || 'Média';

    const quantity = prompt('Quantidade:', '1');
    if (!quantity || parseInt(quantity) < 1) {
      console.log('Quantidade inválida ou cancelada');
      return;
    }

    const observations = prompt('Observações (opcional):', '');

    try {
      this.cart.addItem(pizza, selectedSize, parseInt(quantity), observations || '');
      console.log('Pizza adicionada ao carrinho com sucesso');
      this.showNotification(`${pizza.name} adicionada ao carrinho!`, 'success');
      
      // Abre o carrinho
      const cartModal = document.querySelector('.cart-modal');
      if (cartModal) {
        cartModal.classList.add('active');
      } else {
        console.warn('Modal do carrinho não encontrado');
      }
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      this.showNotification('Erro ao adicionar item ao carrinho. Tente novamente.', 'error');
    }
  }

  /**
   * Manipula o envio do formulário de pedido
   * @param {Event} event - Evento do formulário
   */
  async handleOrderFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const sabor = formData.get('sabor');
    const tamanho = formData.get('tamanho');
    const quantidade = parseInt(formData.get('quantidade')) || 1;
    const observacoes = formData.get('observacoes') || '';

    if (!sabor || !tamanho) {
      this.showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
      return;
    }

    // Encontra a pizza pelo nome
    const pizza = this.pizzas.find(p => p.name === sabor);
    if (!pizza) {
      this.showNotification('Pizza não encontrada.', 'error');
      return;
    }

    this.showLoading(true);
    try {
      const orderData = {
        items: [{
          pizzaId: pizza.id,
          name: pizza.name,
          size: tamanho,
          quantity: quantidade,
          price: pizza.price,
        }],
        observations: observacoes,
        total: pizza.price * quantidade,
      };

      const order = await this.apiService.createOrder(orderData);
      this.showNotification(`Pedido #${order.id} criado com sucesso!`, 'success');
      form.reset();
      
      // Carrega o histórico de pedidos
      await this.loadOrderHistory();
    } catch (error) {
      this.showNotification(`Erro ao criar pedido: ${error.message}`, 'error');
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Manipula o checkout do carrinho
   */
  async handleCartCheckout() {
    const items = this.cart.getItems();
    
    if (items.length === 0) {
      this.showNotification('O carrinho está vazio.', 'error');
      return;
    }

    this.showLoading(true);
    try {
      const orderData = {
        items: items.map(item => ({
          pizzaId: item.pizza.id,
          name: item.pizza.name,
          size: item.size,
          quantity: item.quantity,
          price: item.pizza.price,
          observations: item.observations,
        })),
        total: this.cart.getTotal(),
      };

      const order = await this.apiService.createOrder(orderData);
      this.showNotification(`Pedido #${order.id} criado com sucesso!`, 'success');
      
      this.cart.clear();
      const cartModal = document.querySelector('.cart-modal');
      if (cartModal) {
        cartModal.classList.remove('active');
      }

      // Carrega o histórico de pedidos
      await this.loadOrderHistory();
    } catch (error) {
      this.showNotification(`Erro ao criar pedido: ${error.message}`, 'error');
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Renderiza o carrinho na UI
   */
  renderCart() {
    const cartBadge = document.querySelector('.cart-badge');
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartTotal = document.querySelector('.cart-total');

    const items = this.cart.getItems();
    const itemCount = this.cart.getItemCount();
    const total = this.cart.getTotal();

    // Atualiza badge
    if (cartBadge) {
      cartBadge.textContent = itemCount;
      cartBadge.style.display = itemCount > 0 ? 'flex' : 'none';
    }

    // Renderiza itens
    if (cartItemsContainer) {
      if (items.length === 0) {
        cartItemsContainer.innerHTML = '<p class="cart-empty">Carrinho vazio</p>';
      } else {
        cartItemsContainer.innerHTML = items.map(item => `
          <div class="cart-item">
            <div class="cart-item-info">
              <h5>${item.pizza.name}</h5>
              <p>${item.size} • ${item.quantity}x</p>
              ${item.observations ? `<p class="cart-item-obs">${item.observations}</p>` : ''}
            </div>
            <div class="cart-item-controls">
              <input type="number" class="cart-quantity" data-item-id="${item.id}" value="${item.quantity}" min="1" />
              <span class="cart-item-price">R$ ${item.subtotal.toFixed(2)}</span>
              <button class="cart-remove-item" data-item-id="${item.id}" aria-label="Remover">×</button>
            </div>
          </div>
        `).join('');
      }
    }

    // Atualiza total
    if (cartTotal) {
      cartTotal.textContent = `R$ ${total.toFixed(2)}`;
    }
  }

  /**
   * Carrega e exibe o histórico de pedidos
   */
  async loadOrderHistory() {
    const historyContainer = document.querySelector('#historico .order-history-container');
    if (!historyContainer) return;

    this.showLoading(true);
    try {
      const orders = await this.orderManager.getOrderHistory();
      this.orderManager.displayOrderHistory(orders, historyContainer);
    } catch (error) {
      this.showNotification(`Erro ao carregar histórico: ${error.message}`, 'error');
      historyContainer.innerHTML = '<p>Erro ao carregar histórico de pedidos.</p>';
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Exibe uma notificação toast
   * @param {string} message - Mensagem
   * @param {string} type - Tipo (success, error, info)
   */
  showNotification(message, type = 'info') {
    try {
      // Remove notificação anterior se existir
      const existing = document.querySelector('.toast');
      if (existing) {
        existing.remove();
      }

      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.textContent = message;
      document.body.appendChild(toast);

      // Anima entrada
      setTimeout(() => {
        if (toast.parentNode) {
          toast.classList.add('show');
        }
      }, 10);

      // Remove após 3 segundos
      setTimeout(() => {
        if (toast.parentNode) {
          toast.classList.remove('show');
          setTimeout(() => {
            if (toast.parentNode) {
              toast.remove();
            }
          }, 300);
        }
      }, 3000);
    } catch (error) {
      // Fallback: usa alert se toast não funcionar
      console.error('Erro ao exibir notificação:', error);
      alert(message);
    }
  }

  /**
   * Mostra ou esconde o indicador de carregamento
   * @param {boolean} show - Mostrar ou esconder
   */
  showLoading(show) {
    this.isLoading = show;
    let loader = document.querySelector('.loader');
    
    if (show) {
      if (!loader) {
        loader = document.createElement('div');
        loader.className = 'loader';
        loader.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(loader);
      }
      loader.classList.add('active');
    } else {
      if (loader) {
        loader.classList.remove('active');
      }
    }
  }
}

