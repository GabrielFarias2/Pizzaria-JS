# Comunicação Prisma e PostgreSQL

Este documento explica como o código do backend utiliza o **Prisma ORM** para interagir com o banco de dados **PostgreSQL**. Essa camada substitui o antigo armazenamento em memória, garantindo persistência dos dados.

## 1. O Papel do Prisma

O Prisma atua como uma ponte (ORM - Object-Relational Mapper) entre o código JavaScript/Node.js e o banco de dados SQL.
*   **Sem SQL Puro**: Em vez de escrever queries como `SELECT * FROM orders`, utilizamos métodos javascript como `prisma.order.findMany()`.
*   **Segurança e Tipagem**: O Prisma garante que os dados enviados estejam no formato correto definido no Schema.

## 2. Modelagem de Dados (`schema.prisma`)

A estrutura do banco é definida no arquivo `prisma/schema.prisma`.
*   **DataSource**: Configurado para `postgresql`, lendo a URL de conexão do arquivo `.env`.
*   **Models**:
    *   `Order`: Tabela de Pedidos (ID, total, status, data).
    *   `OrderItem`: Tabela de Itens (relacionada ao Pedido). Cada pedido tem vários itens (relação 1:N).
    *   `Pizza`: Catálogo de produtos.

## 3. Uso no Backend (`server.js`)

O `PrismaClient` é instanciado uma única vez e usado nas rotas.

### Criação de Pedido (`POST /api/orders`)
Aqui ocorre uma operação "Transacional" e "Aninhada":

```javascript
const newOrder = await prisma.order.create({
  data: {
    total: parseFloat(total),
    // ...
    items: {
      create: items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        // ...
      })),
    },
  },
  include: {
    items: true, // Retorna o pedido JÁ COM os itens criados
  },
});
```
**O que acontece aqui?**
1.  O Prisma abre uma transação no Postgres.
2.  Insere o registro na tabela `orders`.
3.  Usa o ID do novo pedido para inserir todos os itens na tabela `order_items` automaticamente.
4.  Se qualquer inserção falhar, tudo é cancelado (Rollback), garantindo integridade.

### Consulta de Histórico (`GET /api/orders`)
O código usa o `include` para fazer um "JOIN" automático:

```javascript
const orders = await prisma.order.findMany({
  include: { items: true }, // Traz os itens associados a cada pedido
  orderBy: { createdAt: "desc" }, // Ordena do mais recente para o mais antigo
});
```
Isso converte as linhas planas do banco de dados (que viriam separadas em tabelas) em um objeto JSON aninhado e estruturado, pronto para o frontend consumir.

## Conclusão

A comunicação é fluida: O backend chama um método do objeto `prisma`, o Prisma traduz para SQL otimizado, envia ao Postgres, recebe os dados brutos e os converte de volta para objetos JavaScript limpos.
