# 📸 Guia: Onde Adicionar Imagens no Projeto

Este documento mostra **exatamente** onde você pode adicionar imagens das pizzas no HTML.

## 🎯 Locais para Adicionar Imagens

### 1. **Imagem Hero (Seção Principal)** - Linha 53

**Localização no HTML:**
```html
<div class="hero-image" aria-hidden="true"></div>
```

**Como adicionar a imagem:**

**Opção A - Via CSS (Recomendado):**
Edite o arquivo `public/style.css` e procure por `.hero-image`. Você verá algo como:
```css
.hero-image {
  background-image: url("https://exemplo.com/sua-imagem.jpg");
}
```

**Opção B - Direto no HTML:**
Substitua a div por uma tag `<img>`:
```html
<img src="imagens/hero-pizza.jpg" alt="Pizza artesanal" class="hero-image" />
```

---

### 2. **Cards de Pizza Estáticos (Cardápio)** - Linhas 61-65, 77-81, 93-97

Estes são os cards que aparecem **antes** do JavaScript carregar as pizzas do backend.

**Localização no HTML:**

**Card 1 - Margherita (Linhas 61-65):**
```html
<div
  class="card-img margherita"
  role="img"
  aria-label="Pizza Margherita"
></div>
```

**Card 2 - Pepperoni (Linhas 77-81):**
```html
<div
  class="card-img pepperoni"
  role="img"
  aria-label="Pizza Pepperoni"
></div>
```

**Card 3 - Quatro Queijos (Linhas 93-97):**
```html
<div
  class="card-img quatro"
  role="img"
  aria-label="Pizza Quatro Queijos"
></div>
```

**Como adicionar imagens:**

**Opção A - Via CSS (Atual):**
As imagens são definidas no CSS. Procure no arquivo `public/style.css` por:
- `.card-img.margherita`
- `.card-img.pepperoni`
- `.card-img.quatro`

E altere as URLs:
```css
.card-img.margherita {
  background-image: url("imagens/margherita.jpg");
}

.card-img.pepperoni {
  background-image: url("imagens/pepperoni.jpg");
}

.card-img.quatro {
  background-image: url("imagens/quatro-queijos.jpg");
}
```

**Opção B - Direto no HTML (Mais Simples):**
Substitua as divs por tags `<img>`:

**Para Margherita:**
```html
<img 
  src="imagens/margherita.jpg" 
  alt="Pizza Margherita" 
  class="card-img"
/>
```

**Para Pepperoni:**
```html
<img 
  src="imagens/pepperoni.jpg" 
  alt="Pizza Pepperoni" 
  class="card-img"
/>
```

**Para Quatro Queijos:**
```html
<img 
  src="imagens/quatro-queijos.jpg" 
  alt="Pizza Quatro Queijos" 
  class="card-img"
/>
```

---

### 3. **Imagens Dinâmicas (Carregadas do Backend)** - JavaScript

Quando o JavaScript carrega as pizzas do backend, ele renderiza automaticamente. As imagens vêm da propriedade `image` de cada pizza.

**Localização no código:**
Arquivo: `app.js` (método `renderMenu()`)

**Como funciona:**
O JavaScript usa a URL da imagem que vem do backend:
```javascript
background-image: url('${pizza.image || 'imagem-padrao.jpg'}')
```

**Para adicionar imagens dinâmicas:**

1. **Via Backend (Recomendado):**
   Quando você criar a API, inclua a propriedade `image` em cada pizza:
   ```json
   {
     "id": 1,
     "name": "Margherita",
     "price": 28.90,
     "image": "https://seusite.com/imagens/margherita.jpg"
   }
   ```

2. **Imagem padrão:**
   Se uma pizza não tiver imagem, você pode definir uma padrão editando `app.js`:
   ```javascript
   background-image: url('${pizza.image || 'imagens/pizza-padrao.jpg'}')
   ```

---

## 📁 Estrutura Recomendada de Pastas

Crie uma pasta `imagens` dentro de `public`:

```
public/
├── index.html
├── style.css
├── imagens/
│   ├── hero-pizza.jpg
│   ├── margherita.jpg
│   ├── pepperoni.jpg
│   ├── quatro-queijos.jpg
│   └── pizza-padrao.jpg
└── ...
```

---

## 🔧 Exemplos Práticos

### Exemplo 1: Adicionar imagem hero

**No HTML (linha 53):**
```html
<!-- ANTES -->
<div class="hero-image" aria-hidden="true"></div>

<!-- DEPOIS -->
<img src="imagens/hero-pizza.jpg" alt="Pizza artesanal" class="hero-image" />
```

### Exemplo 2: Adicionar imagem no card Margherita

**No HTML (linhas 61-65):**
```html
<!-- ANTES -->
<div
  class="card-img margherita"
  role="img"
  aria-label="Pizza Margherita"
></div>

<!-- DEPOIS -->
<img 
  src="imagens/margherita.jpg" 
  alt="Pizza Margherita" 
  class="card-img"
/>
```

### Exemplo 3: Usar imagens de URL externa

```html
<img 
  src="https://exemplo.com/pizzas/margherita.jpg" 
  alt="Pizza Margherita" 
  class="card-img"
/>
```

---

## ⚠️ Observações Importantes

1. **Formato de arquivo:** Use `.jpg`, `.png` ou `.webp` para melhor performance
2. **Tamanho:** Recomenda-se imagens entre 800x600px e 1200x800px
3. **Otimização:** Comprima as imagens antes de usar (ferramentas como TinyPNG)
4. **Caminhos relativos:** Se usar `imagens/pizza.jpg`, a pasta `imagens` deve estar na mesma pasta do `index.html`
5. **Caminhos absolutos:** URLs completas funcionam: `https://seusite.com/imagem.jpg`

---

## 🎨 Dica: Imagens Responsivas

Para garantir que as imagens funcionem bem em mobile, adicione no CSS:

```css
.card-img,
.hero-image {
  width: 100%;
  height: auto;
  object-fit: cover;
}
```

---

## 📝 Resumo Rápido

| Local | Linha HTML | Como Adicionar |
|-------|------------|----------------|
| Hero | 53 | Substituir div por `<img>` ou editar CSS |
| Card Margherita | 61-65 | Substituir div por `<img>` ou editar CSS |
| Card Pepperoni | 77-81 | Substituir div por `<img>` ou editar CSS |
| Card Quatro Queijos | 93-97 | Substituir div por `<img>` ou editar CSS |
| Cards Dinâmicos | app.js | Via propriedade `image` do backend |

---

**Pronto! Agora você sabe exatamente onde adicionar suas imagens! 🎉**

