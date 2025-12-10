# Gerenciamento do Projeto pelo App.js

O arquivo `public/src/app.js` é o coração da lógica de frontend da aplicação ("Client-Side"). Ele é responsável por orquestrar a interação do usuário, o gerenciamento de estado da interface e a comunicação com os serviços de dados.

## Estrutura Principal: Classe `PizzaApp`

Todo o gerenciamento é centralizado na classe `PizzaApp`. Ao iniciar, ela cria instâncias de serviços auxiliares (`ApiService`, `OrderManager`, `Cart`) e prepara a aplicação.

### 1. Inicialização Integrada (`init`)
O método `init()` executa uma sequência lógica para preparar a tela:
1.  **Listeners**: Configura as ações de clique (botões, carrinho, formulários).
2.  **Dados Híbridos**:
    *   Primeiro, carrega **Cards Estáticos** direto do HTML (para garantir que algo apareça mesmo sem backend).
    *   Depois, tenta buscar o **Menu do Backend** via API. Se falhar, mantém os estáticos e avisa no console (sem travar a tela).
    *   Carrega o **Histórico de Pedidos** (se o backend estiver online).

### 2. Gerenciamento de Estado (State Management)
O `app.js` mantém o estado atual da aplicação em memória:
*   `this.pizzas`: Array com o catálogo de pizzas (vindo da API ou do HTML).
*   `this.cart`: Instância da classe `Cart` que gerencia os itens selecionados pelo usuário.
*   `this.addModalState`: Armazena qual pizza está sendo editada no modal de "Adicionar ao Carrinho" antes de confirmar.
*   `this.isLoading`: Controla a exibição do spinner de carregamento.

### 3. Comunicação Backend vs. Frontend
O `app.js` não faz chamadas `fetch` diretamente. Ele delega isso para o `this.apiService`.
*   **Padrão de Projeto**: Separação de Responsabilidades. O `app.js` diz "eu quero pizzas", e o `apiService` se vira para buscar.
*   **Fallback**: O `app.js` é resiliente. Ele usa `try/catch` ao chamar a API. Se o servidor estiver fora do ar, ele degrada a funcionalidade suavemente (exibe mensagens de erro ou mantém dados estáticos) em vez de deixar a tela em branco.

### 4. Interatividade e UI
O arquivo gerencia toda a manipulação do DOM (Document Object Model):
*   **Renderização Dinâmica**: Cria o HTML dos cards de pizza (`renderMenu`) e itens do carrinho (`renderCart`) via JavaScript, injetando na página.
*   **Modais**: Controla a abertura/fechamento do Modal de Carrinho e do Modal de Detalhes da Pizza.
*   **Feedback ao Usuário**: Exibe notificações (Toasts) de sucesso/erro e Spinners de loading (`showLoading`).

### Resumo do Fluxo
1.  Usuário clica em "Adicionar" -> `app.js` abre o Modal.
2.  Usuário confirma -> `app.js` adiciona ao `cart` e atualiza a UI do carrinho.
3.  Usuário clica em "Finalizar" -> `app.js` pega os dados do `cart`, envia para `apiService`, limpa o carrinho e atualiza o histórico.

O `app.js` age como o "controlador" que une a interface visual, os dados do usuário e o servidor.
