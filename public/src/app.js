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
    this.addModalState = null; // Estado do modal de adicionar
  }

  /**
   * Inicializa a aplicação
   */
  async init() {
    console.log("Inicializando PizzaApp...");
    this.setupEventListeners();
    this.setupCartUpdates();
    this.setupAddModal(); // NOVO: inicializa modal de adicionar

    // Carrega cards estáticos do HTML primeiro
    this.loadStaticCards();

    // Tenta carregar menu do backend, mas não falha se não houver backend
    try {
      await this.renderMenu();
    } catch (error) {
      console.warn(
        "Erro ao carregar menu do backend (normal se backend não estiver rodando):",
        error.message
      );
    }

    this.renderCart();

    // Tenta carregar histórico, mas não falha se não houver backend
    try {
      await this.loadOrderHistory();
    } catch (error) {
      console.warn(
        "Erro ao carregar histórico (normal se backend não estiver rodando):",
        error.message
      );
    }

    console.log("PizzaApp inicializado com sucesso!");
  }

  /**
   * NOVO: Configura o modal de adicionar ao carrinho
   */
  setupAddModal() {
    const modal = document.getElementById("add-modal");
    if (!modal) return;

    const closeBtn = modal.querySelector(".add-modal-close");
    const cancelBtn = modal.querySelector(".add-cancel");
    const confirmBtn = modal.querySelector(".add-confirm");
    const nameEl = modal.querySelector(".add-modal-pizza-name");
    const descEl = modal.querySelector(".add-modal-pizza-desc");
    const sizeEl = document.getElementById("add-size");
    const qtyEl = document.getElementById("add-quantity");
    const obsEl = document.getElementById("add-obs");

    const closeAddModal = () => {
      modal.classList.remove("active");
      modal.setAttribute("aria-hidden", "true");
      this.addModalState = null;
    };

    const openAddModal = (pizza) => {
      this.addModalState = pizza;
      nameEl.textContent = pizza.name;
      descEl.textContent = pizza.description || "";
      sizeEl.value = "Média";
      qtyEl.value = 1;
      obsEl.value = "";
      modal.classList.add("active");
      modal.setAttribute("aria-hidden", "false");
      setTimeout(() => confirmBtn.focus(), 120);
    };

    // Close handlers
    closeBtn?.addEventListener("click", closeAddModal);
    cancelBtn?.addEventListener("click", closeAddModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeAddModal();
    });

    // Confirm add
    confirmBtn?.addEventListener("click", () => {
      if (!this.addModalState) {
        closeAddModal();
        return;
      }

      const pizza = this.addModalState;
      const size = sizeEl.value;
      const quantity = Math.max(1, parseInt(qtyEl.value || "1", 10));
      const observations = obsEl.value || "";

      try {
        this.cart.addItem(pizza, size, quantity, observations);
        this.showNotification(
          `${pizza.name} adicionada ao carrinho!`,
          "success"
        );

        // Abre o carrinho
        const cartModal = document.querySelector(".cart-modal");
        if (cartModal) {
          cartModal.classList.add("active");
        }
      } catch (error) {
        console.error("Erro ao adicionar ao carrinho:", error);
        this.showNotification(
          "Erro ao adicionar item ao carrinho. Tente novamente.",
          "error"
        );
      }

      closeAddModal();
    });

    // Tecla Esc fecha modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("active")) {
        closeAddModal();
      }
    });

    // Expõe método para abrir modal
    this.openAddModal = openAddModal;
  }

  /**
   * Carrega os cards estáticos do HTML e adiciona ao array de pizzas
   */
  loadStaticCards() {
    const cards = document.querySelectorAll(".cards .card[data-pizza-name]");
    cards.forEach((card, index) => {
      const name = card.dataset.pizzaName;
      const priceText = card.querySelector(".price")?.textContent;
      const description = card.querySelector(".card-body p")?.textContent || "";
      const image = card.querySelector(".card-img")?.src || "";

      if (priceText) {
        const price = parseFloat(
          priceText.replace("R$", "").replace(",", ".").trim()
        );

        // Verifica se a pizza já existe no array (evita duplicatas)
        const exists = this.pizzas.find((p) => p.name === name);
        if (!exists) {
          this.pizzas.push({
            id: `static-${index + 1}`,
            name: name,
            description: description,
            price: price,
            image: image,
          });
        }
      }
    });

    if (this.pizzas.length > 0) {
      console.log(
        `${this.pizzas.length} pizza(s) estática(s) carregada(s) do HTML`
      );
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
    const orderForm = document.querySelector(".order-form");
    if (orderForm) {
      orderForm.addEventListener("submit", (e) =>
        this.handleOrderFormSubmit(e)
      );

      const historyContainer = document.querySelector(
        ".order-history-container"
      );
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
    }

    // Botões "Adicionar ao carrinho" nos cards do menu
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-add-to-cart")) {
        e.preventDefault();
        e.stopPropagation();

        const card = e.target.closest(".card");
        if (!card) return;

        const pizzaId = card.dataset.pizzaId;
        let pizza = null;

        // Tenta encontrar a pizza pelo ID (cards dinâmicos do backend)
        if (pizzaId) {
          pizza = this.pizzas.find((p) => p.id == pizzaId);
        }

        // Se não encontrou pelo ID, tenta pelo nome (cards estáticos)
        if (!pizza) {
          const pizzaName = card.querySelector("h4")?.textContent;
          if (pizzaName) {
            pizza = this.pizzas.find((p) => p.name === pizzaName);

            if (!pizza) {
              const priceText = card.querySelector(".price")?.textContent;
              const price = priceText
                ? parseFloat(
                    priceText.replace("R$", "").replace(",", ".").trim()
                  )
                : 0;
              const description =
                card.querySelector(".card-body p")?.textContent || "";
              const image = card.querySelector(".card-img")?.src || "";

              pizza = {
                id: null,
                name: pizzaName,
                description: description,
                price: price,
                image: image,
              };
            }
          }
        }

        if (pizza) {
          this.handleAddToCart(pizza);
        } else {
          this.showNotification(
            "Erro ao adicionar pizza ao carrinho. Tente novamente.",
            "error"
          );
        }
      }
    });

    // Toggle do carrinho
    const cartIcon = document.querySelector(".cart-icon");
    const cartModal = document.querySelector(".cart-modal");
    const cartClose = document.querySelector(".cart-close");

    if (cartIcon && cartModal) {
      cartIcon.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Carrinho clicado - abrindo modal");
        cartModal.classList.toggle("active");
        this.renderCart();
      });
    }

    if (cartClose && cartModal) {
      cartClose.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        cartModal.classList.remove("active");
      });
    }

    // Botão "Pedir" (mobile)
    const mobileOrderBtn = document.querySelector(".mobile-order");
    if (mobileOrderBtn) {
      mobileOrderBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const pedidoSection = document.querySelector("#pedido");
        if (pedidoSection) {
          pedidoSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }

    // Remover item do carrinho
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("cart-remove-item")) {
        const itemId = e.target.dataset.itemId;
        this.cart.removeItem(itemId);
      }
    });

    // Atualizar quantidade no carrinho
    document.addEventListener("change", (e) => {
      if (e.target.classList.contains("cart-quantity")) {
        const itemId = e.target.dataset.itemId;
        const quantity = e.target.value;
        this.cart.updateQuantity(itemId, quantity);
      }
    });

    // Finalizar pedido do carrinho
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("cart-checkout")) {
        this.handleCartCheckout();
      }
    });

    // Navegação para histórico de pedidos
    const historyLink = document.querySelector('[href="#historico"]');
    if (historyLink) {
      historyLink.addEventListener("click", async (e) => {
        e.preventDefault();
        await this.loadOrderHistory();
      });
    }

    // Fechar modal ao clicar fora
    if (cartModal) {
      cartModal.addEventListener("click", (e) => {
        if (e.target === cartModal) {
          cartModal.classList.remove("active");
        }
      });
    }
  }

  /**
   * Renderiza o menu de pizzas
   */
  async renderMenu() {
    const menuContainer = document.querySelector(".cards");
    if (!menuContainer) return;

    const existingCards = menuContainer.querySelectorAll(".card");
    const hasStaticCards = existingCards.length > 0;

    this.showLoading(true);
    try {
      this.pizzas = await this.apiService.getPizzas();

      if (!this.pizzas || this.pizzas.length === 0) {
        if (hasStaticCards) {
          console.log("Backend não retornou pizzas, mantendo cards estáticos");
          return;
        }
        menuContainer.innerHTML = "<p>Nenhuma pizza disponível no momento.</p>";
        return;
      }

      menuContainer.innerHTML = this.pizzas
        .map(
          (pizza) => `
        <article class="card" data-pizza-id="${pizza.id}">
          <img 
            src="${
              pizza.image || "images/uma-pizza-deliciosa-no-estudio (1).jpg"
            }" 
            alt="${pizza.name}" 
            class="card-img"
          />
          <div class="card-body">
            <h4>${pizza.name}</h4>
            <p>${pizza.description || ""}</p>
            <div class="card-footer">
              <span class="price">R$ ${pizza.price.toFixed(2)}</span>
              <button class="btn btn-sm btn-add-to-cart">Adicionar</button>
            </div>
          </div>
        </article>
      `
        )
        .join("");

      this.updateOrderFormSelect();
    } catch (error) {
      if (hasStaticCards) {
        console.log(
          "Erro ao carregar menu do backend, mantendo cards estáticos:",
          error.message
        );
        return;
      }
      this.showNotification(`Erro ao carregar menu: ${error.message}`, "error");
      menuContainer.innerHTML =
        "<p>Erro ao carregar o cardápio. Tente novamente mais tarde.</p>";
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Atualiza o select de sabores no formulário de pedido
   */
  updateOrderFormSelect() {
    const saborSelect = document.getElementById("sabor");
    if (!saborSelect || !this.pizzas || this.pizzas.length === 0) return;

    const firstOption = saborSelect.querySelector('option[value=""]');
    saborSelect.innerHTML = "";
    if (firstOption) {
      saborSelect.appendChild(firstOption);
    }

    this.pizzas.forEach((pizza) => {
      const option = document.createElement("option");
      option.value = pizza.name;
      option.textContent = pizza.name;
      saborSelect.appendChild(option);
    });
  }

  /**
   * MODIFICADO: Manipula o clique em "Adicionar ao carrinho" nos cards
   * Abre o modal estilizado em vez de usar prompt()
   * @param {object} pizza - Objeto da pizza
   */
  handleAddToCart(pizza) {
    console.log("Adicionando pizza ao carrinho:", pizza);

    if (typeof this.openAddModal === "function") {
      this.openAddModal(pizza);
    } else {
      this.showNotification("Modal de adicionar não disponível.", "error");
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

    const sabor = formData.get("sabor");
    const tamanho = formData.get("tamanho");
    const quantidade = parseInt(formData.get("quantidade")) || 1;
    const observacoes = formData.get("observacoes") || "";

    if (!sabor || !tamanho) {
      this.showNotification(
        "Por favor, preencha todos os campos obrigatórios.",
        "error"
      );
      return;
    }

    const pizza = this.pizzas.find((p) => p.name === sabor);
    if (!pizza) {
      this.showNotification("Pizza não encontrada.", "error");
      return;
    }

    this.showLoading(true);
    try {
      const orderData = {
        items: [
          {
            pizzaId: pizza.id,
            name: pizza.name,
            size: tamanho,
            quantity: quantidade,
            price: pizza.price,
          },
        ],
        observations: observacoes,
        total: pizza.price * quantidade,
      };

      const order = await this.apiService.createOrder(orderData);
      this.showNotification(
        `Pedido #${order.id} criado com sucesso!`,
        "success"
      );
      form.reset();

      await this.loadOrderHistory();
    } catch (error) {
      this.showNotification(`Erro ao criar pedido: ${error.message}`, "error");
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
      this.showNotification("O carrinho está vazio.", "error");
      return;
    }

    this.showLoading(true);
    try {
      const orderData = {
        items: items.map((item) => ({
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
      this.showNotification(
        `Pedido #${order.id} criado com sucesso!`,
        "success"
      );

      this.cart.clear();
      const cartModal = document.querySelector(".cart-modal");
      if (cartModal) {
        cartModal.classList.remove("active");
      }

      await this.loadOrderHistory();
    } catch (error) {
      this.showNotification(`Erro ao criar pedido: ${error.message}`, "error");
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Renderiza o carrinho na UI
   */
  renderCart() {
    const cartBadge = document.querySelector(".cart-badge");
    const cartItemsContainer = document.querySelector(".cart-items");
    const cartTotal = document.querySelector(".cart-total");

    const items = this.cart.getItems();
    const itemCount = this.cart.getItemCount();
    const total = this.cart.getTotal();

    if (cartBadge) {
      cartBadge.textContent = itemCount;
      cartBadge.style.display = itemCount > 0 ? "flex" : "none";
    }

    if (cartItemsContainer) {
      if (items.length === 0) {
        cartItemsContainer.innerHTML =
          '<p class="cart-empty">Carrinho vazio</p>';
      } else {
        cartItemsContainer.innerHTML = items
          .map(
            (item) => `
          <div class="cart-item">
            <div class="cart-item-info">
              <h5>${item.pizza.name}</h5>
              <p>${item.size} • ${item.quantity}x</p>
              ${
                item.observations
                  ? `<p class="cart-item-obs">${item.observations}</p>`
                  : ""
              }
            </div>
            <div class="cart-item-controls">
              <input type="number" class="cart-quantity" data-item-id="${
                item.id
              }" value="${item.quantity}" min="1" />
              <span class="cart-item-price">R$ ${item.subtotal.toFixed(
                2
              )}</span>
              <button class="cart-remove-item" data-item-id="${
                item.id
              }" aria-label="Remover">×</button>
            </div>
          </div>
        `
          )
          .join("");
      }
    }

    if (cartTotal) {
      cartTotal.textContent = `R$ ${total.toFixed(2)}`;
    }
  }

  /**
   * Carrega e exibe o histórico de pedidos
   */
  async loadOrderHistory() {
    const historyContainer = document.querySelector(
      "#historico .order-history-container"
    );
    if (!historyContainer) return;

    this.showLoading(true);
    try {
      const orders = await this.orderManager.getOrderHistory();
      this.orderManager.displayOrderHistory(orders, historyContainer);
    } catch (error) {
      this.showNotification(
        `Erro ao carregar histórico: ${error.message}`,
        "error"
      );
      historyContainer.innerHTML =
        "<p>Erro ao carregar histórico de pedidos.</p>";
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Exibe uma notificação toast
   * @param {string} message - Mensagem
   * @param {string} type - Tipo (success, error, info)
   */
  showNotification(message, type = "info") {
    try {
      const existing = document.querySelector(".toast");
      if (existing) {
        existing.remove();
      }

      const toast = document.createElement("div");
      toast.className = `toast toast-${type}`;
      toast.textContent = message;
      document.body.appendChild(toast);

      setTimeout(() => {
        if (toast.parentNode) {
          toast.classList.add("show");
        }
      }, 10);

      setTimeout(() => {
        if (toast.parentNode) {
          toast.classList.remove("show");
          setTimeout(() => {
            if (toast.parentNode) {
              toast.remove();
            }
          }, 300);
        }
      }, 3000);
    } catch (error) {
      console.error("Erro ao exibir notificação:", error);
      alert(message);
    }
  }

  /**
   * Mostra ou esconde o indicador de carregamento
   * @param {boolean} show - Mostrar ou esconder
   */
  showLoading(show) {
    this.isLoading = show;
    let loader = document.querySelector(".loader");

    if (show) {
      if (!loader) {
        loader = document.createElement("div");
        loader.className = "loader";
        loader.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(loader);
      }
      loader.classList.add("active");
    } else {
      if (loader) {
        loader.classList.remove("active");
      }
    }
  }
}
