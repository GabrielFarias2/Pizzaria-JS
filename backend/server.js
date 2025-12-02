const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const port = process.env.PORT || 8081;

app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "../public")));

// Mock de pizzas
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

// In-memory storage for orders
const orders = [];

// GET /api/pizzas
app.get("/api/pizzas", (req, res) => {
  res.json(pizzas);
});

// POST /api/orders
app.post("/api/orders", (req, res) => {
  const newOrder = {
    id: `ORD-${Date.now()}`,
    ...req.body,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  orders.push(newOrder);
  res.json(newOrder);
});

// GET /api/orders/:id
app.get("/api/orders/:id", (req, res) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ message: "Pedido não encontrado" });
  }
});

// GET /api/orders
app.get("/api/orders", (req, res) => {
  res.json(orders);
});

// Fallback to index.html for SPA (optional, but good for history mode if used later)
// For now, just ensuring root serves index.html is handled by express.static
// But if we want to be explicit or handle 404s for API differently:

app.listen(port, () => {
  console.log(
    `Servidor rodando em http://localhost:${port} (env: ${
      process.env.NODE_ENV || "dev"
    })`
  );
});