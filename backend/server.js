const express = require("express");
const cors = require("cors");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 8081;

app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "../public")));

// Mock de pizzas (Mantido como catálogo)
const pizzas = [
  {
    id: 1,
    name: "Margherita",
    description: "Tomate, mussarela, manjericão e azeite",
    price: 28.9,
    image: "images/uma-deliciosa-pizza-margarita-com-manjericao-fresco.jpg",
  },
  {
    id: 2,
    name: "Pepperoni",
    description: "Pepperoni crocante com queijo extra",
    price: 34.5,
    image:
      "images/pizza-recem-assada-na-mesa-de-madeira-rustica-gerada-por-ia.jpg",
  },
  {
    id: 3,
    name: "Quatro Queijos",
    description: "Mussarela, provolone, gorgonzola e parmesão",
    price: 36.0,
    image: "images/uma-apresentacao-epica-de-comida-deliciosa.jpg",
  },
];

// GET /api/pizzas - Retorna o catálogo
app.get("/api/pizzas", (req, res) => {
  res.json(pizzas);
});

// POST /api/orders - Cria um novo pedido no banco de dados
app.post("/api/orders", async (req, res) => {
  try {
    const { items, total, observations } = req.body;

    // Se vier do formulário simples (um item), normaliza para array
    // (Caso o frontend envie formato diferente, mas pelo que vi no app.js, o api.js normaliza)
    // O app.js 'handleOrderFormSubmit' envia { items: [...], total, observations }
    // O app.js 'handleCartCheckout' envia { items: [...], total }

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Dados do pedido inválidos" });
    }

    const newOrder = await prisma.order.create({
      data: {
        total: parseFloat(total) || 0,
        observations: observations || null,
        status: "pending",
        items: {
          create: items.map((item) => ({
            name: item.name,
            size: item.size,
            quantity: parseInt(item.quantity) || 1,
            price: parseFloat(item.price) || 0,
            observations: item.observations || null,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    res.json(newOrder);
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    res.status(500).json({ message: "Erro ao criar pedido" });
  }
});

// GET /api/orders/:id - Busca pedido pelo ID
app.get("/api/orders/:id", async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    });

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: "Pedido não encontrado" });
    }
  } catch (error) {
    console.error("Erro ao buscar pedido:", error);
    res.status(500).json({ message: "Erro ao buscar pedido" });
  }
});

// GET /api/orders - Busca histórico de pedidos
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    res.status(500).json({ message: "Erro ao buscar pedidos" });
  }
});

// DELETE /api/orders/:id - Deleta um pedido (apenas se estiver cancelado ou entregue, idealmente)
app.delete("/api/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Use transaction to ensure both operations succeed or fail together
    await prisma.$transaction([
      prisma.orderItem.deleteMany({
        where: { orderId: id },
      }),
      prisma.order.delete({
        where: { id: id },
      }),
    ]);

    res.json({ message: "Pedido removido com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar pedido:", error);
    // Check if it's the specific constraint error to give a better message if still fails
    if (error.code === 'P2003') {
        return res.status(400).json({ message: "Não é possível remover este pedido pois existem itens associados." });
    }
    res.status(500).json({ message: "Erro ao deletar pedido: " + error.message });
  }
});

// PATCH /api/orders/:id/cancel - Cancela um pedido
app.patch("/api/orders/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verifica se o pedido existe e se pode ser cancelado (opcional)
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return res.status(404).json({ message: "Pedido não encontrado" });
    }

    if (order.status !== 'pending' && order.status !== 'preparing') {
        // Opcional: impedir cancelamento se já saiu, mas vamos permitir por enquanto ou seguir regra de negocio
        // User didn't specify strict rules, so assume all can be cancelled for now.
    }

    const updatedOrder = await prisma.order.update({
      where: { id: id },
      data: { status: "cancelled" },
      include: { items: true },
    });
    
    res.json(updatedOrder);
  } catch (error) {
    console.error("Erro ao cancelar pedido:", error);
    res.status(500).json({ message: "Erro ao cancelar pedido" });
  }
});

/*
// Fallback to index.html is handled by static middleware for existing files.
// Any other route just 404s or we could serve index.html for SPA if needed.
*/

app.listen(port, () => {
  console.log(
    `Servidor rodando em http://localhost:${port} (env: ${
      process.env.NODE_ENV || "dev"
    })`
  );
});
