# Mr. huolang Supermercado — Plataforma Digital

Website de e-commerce para o Mr. huolang Supermercado (Av. Guerra Popular Nr. 1128, Maputo).
Loja de utilidades para casa: mobiliário, electrodomésticos, loiça, decoração,
arrumação, limpeza, brinquedos e artigos para bebé.

## Estado do projecto

**FASE 1 — Fundação visual: CONCLUÍDA**
**FASE 2 — Homepage e estrutura de páginas: CONCLUÍDA (revista)**

- [x] Estrutura de pastas completa (todas as páginas do site)
- [x] Paleta de cores oficial (extraída da marca real), laranja como cor de destaque
- [x] Sistema tipográfico (Helvetica + Arial)
- [x] Componentes base (botões, cartões, etiqueta de preço, chips, placeholders visuais)
- [x] Guia de estilo vivo (`docs/guia-de-estilo.html`)
- [x] Header (desktop + mobile) com pesquisa e carrinho
- [x] Categorias correctas do negócio (utilidades para casa, não mercearia)
- [x] Catálogo de demonstração com 32 produtos e imagens em falta substituídas por
      placeholders visuais (ícone da categoria, sem texto)
- [x] Bloco "Porque comprar" removido — homepage mais visual, menos texto
- [x] "Continue a comprar" em **todas** as páginas do site
- [x] Localização da loja real (Guerra Popular) com botão "Como chegar" e WhatsApp
- [x] Rodapé completo
- [x] Carrinho funcional em memória (localStorage) com barra fixa mobile
- [ ] FASE 3 — Páginas de produto, carrinho e checkout completos
- [ ] FASE 4 — Backend (Cloudflare Workers + D1)
- [ ] FASE 5 — Pagamentos (pesquisar documentação oficial antes de implementar)
- [ ] FASE 6 — Painel de administração
- [ ] FASE 7 — Performance, SEO, segurança
- [ ] FASE 8 — Deploy em produção
- [ ] FASE 9 — Testes (QA)

## Estrutura de pastas

```
mr-huolang/
├── index.html               → homepage
├── produtos.html             → catálogo completo (grelha + filtros — Fase 3)
├── produto.html              → ficha de produto individual (Fase 3)
├── categoria.html            → produtos filtrados por categoria (Fase 3)
├── promocoes.html            → página de ofertas (Fase 3)
├── carrinho.html             → carrinho de compras (Fase 3)
├── checkout.html             → finalização de compra (Fase 3)
├── pedido-confirmado.html    → confirmação de pedido (Fase 3/4)
├── sobre.html / lojas.html / contactos.html
├── termos.html / privacidade.html / 404.html
├── assets/
│   ├── logo/        → logótipo oficial
│   ├── icons/        → ícones (a preencher)
│   └── products/       → fotos reais de produtos (a preencher — ver abaixo)
├── css/
│   ├── tokens.css      → cores, tipografia, espaçamento (NÃO alterar sem rever a marca)
│   ├── base.css       → reset e fundação tipográfica
│   ├── components.css    → botões, cartões, etiqueta de preço, chips, placeholders
│   └── layout.css      → header, secções, grelhas, footer
├── data/
│   └── products.json    → catálogo (demo) — categorias, produtos, loja
├── js/
│   └── main.js        → carrinho, renderização de produtos, "continue a comprar"
├── functions/           → (Fase 4) Cloudflare Pages Functions / API
├── docs/
│   └── guia-de-estilo.html → demonstração viva do design system
└── README.md
```

## Como adicionar fotos reais de produtos

Enquanto não há fotos reais, cada produto mostra automaticamente um
placeholder visual (fundo em gradiente laranja + ícone grande da categoria,
sem texto genérico).

Para trocar por uma foto real:
1. Guarda a foto em `assets/products/`, ex: `assets/products/mesa-dobravel.jpg`.
2. Em `data/products.json`, no produto correspondente, muda `"imagem": null`
   para `"imagem": "assets/products/mesa-dobravel.jpg"`.
3. Guarda — a foto aparece automaticamente em todas as grelhas onde esse
   produto surge (homepage, categoria, "continue a comprar", etc.).

## Como testar o site localmente (VS Code)

O site carrega os produtos a partir de `data/products.json` usando `fetch()`.
Os browsers bloqueiam isto ao abrir `index.html` directamente por duplo-clique
(protocolo `file://`). Para testar:

1. Instala a extensão **Live Server** no VS Code.
2. Clique com o botão direito em `index.html` → **Open with Live Server**.

## Fluxo de trabalho (VS Code + GitHub + Cloudflare Pages)

1. Recebes este zip com a estrutura completa do site — importa a pasta no VS Code.
2. Em cada fase seguinte, envio apenas o código dos ficheiros dessa fase — cola-o
   nos ficheiros/pastas indicados.
3. Inicializa o Git localmente e faz push para um repositório no GitHub.
4. No Cloudflare Pages: **Create a project → Connect to Git** → escolhe o
   repositório. Definições de build:
   - **Framework preset:** None
   - **Build command:** (vazio)
   - **Build output directory:** `/` (raiz do projecto)
5. Cada `git push` para o branch principal faz deploy automático — grátis.

## Paleta de marca (referência rápida)

| Nome | Uso | Hex |
|---|---|---|
| Laranja Huolang oficial | Cor principal, CTAs, preços, destaque | `#FF7900` |
| Laranja profundo | Hover, acentos | `#C67023` |
| Vermelho huolang | Promoções, desconto, urgência | `#E5002E` |
| Antracite | Texto | `#1A1A1A` |
| Creme | Fundo | `#FFF8F0` |

## Custos (recordar sempre)

- Hosting, código e base de dados: **0 MZN** (Cloudflare free tier + GitHub)
- Domínio: pago por si, uma vez por ano
- Pagamentos: comissão por transacção (a definir na Fase 5), não é custo fixo do website
