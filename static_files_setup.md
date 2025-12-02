# Configuração de Arquivos Estáticos

Este documento descreve como o servidor Express foi configurado para servir os arquivos do frontend (`index.html`, CSS, JS).

## Estrutura de Pastas

A pasta `public` contém todos os arquivos estáticos:
- `index.html`: Página principal.
- `style.css`: Estilos globais.
- `src/`: Scripts JavaScript do frontend.

## Configuração no Servidor (`backend/server.js`)

O servidor foi configurado para servir a pasta `public` na raiz da URL.

```javascript
const publicPath = path.join(__dirname, "..", "public");
app.use(express.static(publicPath));
```

Isso significa que:
- `public/index.html` é acessível em `http://localhost:8081/`
- `public/style.css` é acessível em `http://localhost:8081/style.css`
- `public/src/app.js` é acessível em `http://localhost:8081/src/app.js`

## Fallback para SPA

Para garantir que o `index.html` seja servido em rotas desconhecidas (útil para Single Page Applications), foi adicionado um handler para `*`:

```javascript
app.get("*", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});
```

## Correção no `index.html`

As tags `<script>` no `index.html` foram atualizadas para usar caminhos relativos corretos, considerando que `public` é a raiz do servidor:

```html
<script src="src/api.js"></script>
<!-- ... -->
```
