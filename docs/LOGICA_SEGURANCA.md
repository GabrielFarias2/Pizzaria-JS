# Lógica de Segurança do Projeto

Este documento descreve as camadas e práticas de segurança implementadas no backend da aplicação de Pizzaria. Embora seja um projeto simplificado, existem mecanismos importantes para garantir o funcionamento correto e seguro da comunicação entre cliente e servidor.

## 1. CORS (Cross-Origin Resource Sharing)

O projeto utiliza o middleware `cors` no Express.

```javascript
const cors = require("cors");
app.use(cors());
```

*   **Função**: Permitir que o frontend (que pode estar rodando em uma porta ou domínio diferente do backend durante o desenvolvimento) faça requisições HTTP para a API.
*   **Comportamento**: A configuração padrão (`app.use(cors())`) libera o acesso para qualquer origem (`*`). Em um ambiente de produção real, isso geralmente é restringido para permitir apenas o domínio oficial da aplicação.

## 2. Validação de Dados de Entrada

Existe uma camada básica de validação nos endpoints para garantir a integridade dos dados antes de processá-los.

*   **Endpoint `/api/orders`**:
    *   Verifica se o campo `items` existe e se é um array.
    *   Se a validação falhar, retorna status **400 Bad Request**, prevenindo erros de execução posteriores que poderiam crashar o servidor.

```javascript
if (!items || !Array.isArray(items)) {
  return res.status(400).json({ message: "Dados do pedido inválidos" });
}
```

## 3. Tratamento de Erros e Exceções

O servidor utiliza blocos `try/catch` em todas as rotas assíncronas (async/await).

*   **Objetivo**: Capturar erros inesperados (como falha na conexão com o banco de dados) e respondê-los graciosamente com **status 500** e uma mensagem JSON, em vez de deixar o processo do Node.js encerrar abruptamente (crash).
*   **Log**: Os erros são logados no console (`console.error`) para fins de debug, mas não expõem a stack trace completa para o cliente final.

## 4. Segurança de Banco de Dados (Via Prisma)

A comunicação com o banco de dados é feita através do **Prisma ORM**.

*   **Proteção contra SQL Injection**: O Prisma utiliza *Prepared Statements* e parametrização de queries "por baixo dos panos". Isso significa que valores passados pelo usuário (como observações de pizza) são tratados estritamente como dados, não como código SQL executável.
*   **UUIDs**: O uso de UUIDs para os IDs (`@default(uuid())` no schema) torna os identificadores dos recursos não-sequenciais e difíceis de adivinhar, dificultando ataques de enumeração de recursos.

## Resumo

A segurança atual foca na **estabilidade da aplicação** (validação e error handling) e na **segurança dos dados** (ORM). Não há implementação de autenticação (Login) ou autorização, pois o sistema foi desenhado como um catálogo público de pedidos.
