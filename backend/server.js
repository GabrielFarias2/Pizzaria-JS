const express = require("express");
const app = express();
const port = 8081;

app.get("/api", (req, res) => {
  res.send("Servidor Express rodando corretamente.");
});

app.listen(port, () => {
  console.log(`server has started on port ${port}`);
});
