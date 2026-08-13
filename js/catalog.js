/* ==========================================================================
   MR. HUOLANG — CATALOG.JS (Fase 3)
   Lógica específica de páginas que mostram UM produto a partir do catálogo:
   por agora, a ficha de produto (produto.html?id=hl-XXX).
   Depende das funções globais definidas em main.js (deve ser carregado
   DEPOIS de main.js): loadCatalog, formatMZN, iconeCategoria, addToCart,
   updateCartUI, renderContinueShopping.
   ========================================================================== */

function getQueryParam(nome) {
  return new URLSearchParams(window.location.search).get(nome);
}

/* Breadcrumb simples: Início / Categoria / Produto */
function breadcrumbHTML(produto, categoria) {
  return `
    <nav class="breadcrumb" aria-label="Localização">
      <a href="index.html">Início</a>
      <span aria-hidden="true">/</span>
      <a href="produtos.html?categoria=${produto.categoria}">${categoria ? categoria.nome : 'Produtos'}</a>
      <span aria-hidden="true">/</span>
      <span aria-current="page">${produto.nome}</span>
    </nav>`;
}

/* Ficha completa do produto */
function produtoDetalheHTML(produto, catalogo) {
  const categoria = catalogo.categorias.find(c => c.id === produto.categoria);
  const temPromo = produto.precoPromo && produto.precoPromo < produto.preco;
  const desconto = temPromo ? Math.round(100 - (produto.precoPromo / produto.preco) * 100) : 0;

  const imagemHTML = produto.imagem
    ? `<img src="${produto.imagem}" alt="${produto.nome}" width="600" height="450">`
    : `<div class="product-card__placeholder product-detail__placeholder"><span aria-hidden="true">${iconeCategoria(produto.categoria, catalogo)}</span></div>`;

  return `
    ${breadcrumbHTML(produto, categoria)}

    <div class="product-detail">
      <div class="product-detail__media">
        ${temPromo ? `<span class="discount-badge">-${desconto}%</span>` : ''}
        ${imagemHTML}
      </div>

      <div class="product-detail__info">
        ${produto.marca ? `<span class="product-card__brand">${produto.marca}</span>` : ''}
        <h1>${produto.nome}</h1>

        <div class="product-detail__prices">
          ${temPromo ? `<span class="price-tag--old">${formatMZN(produto.preco)}</span>` : ''}
          <span class="price-tag">
            <span class="price-tag__current">${formatMZN(temPromo ? produto.precoPromo : produto.preco)}</span>
            <span class="price-tag__unit">${produto.unidade}</span>
          </span>
        </div>

        ${!produto.activo ? `<p class="badge" style="background:var(--hl-orange-light);">Temporariamente indisponível</p>` : ''}

        <div class="product-detail__actions">
          <div class="qty-stepper" role="group" aria-label="Quantidade">
            <button type="button" class="qty-stepper__btn" id="qtyDown" aria-label="Diminuir quantidade">−</button>
            <span class="qty-stepper__value" id="qtyValue">1</span>
            <button type="button" class="qty-stepper__btn" id="qtyUp" aria-label="Aumentar quantidade">+</button>
          </div>
          <button type="button" class="btn btn-primary btn-block" id="addToCartBtn" ${!produto.activo ? 'disabled' : ''}>
            Adicionar ao carrinho
          </button>
        </div>

        <ul class="product-detail__trust">
          <li>Disponível para levantamento na loja Guerra Popular</li>
          <li>Pagamento por M-Pesa, e-Mola, mKesh ou na entrega</li>
          <li>Dúvidas? <a href="https://wa.me/258879878888" target="_blank" rel="noopener">Fale connosco no WhatsApp</a></li>
        </ul>
      </div>
    </div>`;
}

async function renderProdutoDetalhe() {
  const wrap = document.getElementById('produtoDetalhe');
  if (!wrap) return; // esta página não tem ficha de produto, não faz nada

  const id = getQueryParam('id');
  const data = await loadCatalog();
  const produto = data.produtos.find(p => p.id === id);

  if (!id || !produto) {
    wrap.innerHTML = `
      <div class="cart-empty">
        <span aria-hidden="true" style="font-size:3rem;">🔎</span>
        <p>Não encontrámos este produto. Pode ter sido removido ou o link está incorrecto.</p>
        <a href="produtos.html" class="btn btn-primary">Ver todos os produtos</a>
      </div>`;
    return;
  }

  // Título e descrição da página actualizados para SEO/partilha
  document.title = `${produto.nome} — Mr. Huolang SuperMercado`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', `${produto.nome}${produto.marca ? ' · ' + produto.marca : ''} — ${formatMZN(produto.precoPromo ?? produto.preco)}. Disponível no Mr. Huolang SuperMercado, Maputo.`);
  }

  wrap.innerHTML = produtoDetalheHTML(produto, data);

  // Selector de quantidade
  let qty = 1;
  const qtyValueEl = document.getElementById('qtyValue');
  document.getElementById('qtyUp')?.addEventListener('click', () => {
    qty += 1;
    qtyValueEl.textContent = qty;
  });
  document.getElementById('qtyDown')?.addEventListener('click', () => {
    qty = Math.max(1, qty - 1);
    qtyValueEl.textContent = qty;
  });

  // Adicionar ao carrinho (respeita a quantidade escolhida)
  document.getElementById('addToCartBtn')?.addEventListener('click', () => {
    for (let i = 0; i < qty; i++) addToCart(produto.id, produto);
  });

  // "Continue a comprar" — prioriza produtos da mesma categoria, exclui este
  renderContinueShopping('continueComprarGrid', { categoria: produto.categoria, excluirId: produto.id, quantidade: 8 });
}

document.addEventListener('DOMContentLoaded', renderProdutoDetalhe);