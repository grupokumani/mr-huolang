/* ==========================================================================
   MR. HOULANG — CARRINHO (Fase 3)
   Lê o carrinho do localStorage (gerido em main.js) e permite alterar
   quantidades, remover itens e avançar para o checkout.
   ========================================================================== */

function cartItemHTML(id, p, catalogo) {
  const precoUnit = p.precoPromo ?? p.preco;
  const subtotal = precoUnit * p.qtd;
  const imagemHTML = p.imagem
    ? `<img src="${p.imagem}" alt="${p.nome}" loading="lazy" width="96" height="96">`
    : `<div class="product-card__placeholder"><span aria-hidden="true">${iconeCategoria(p.categoria, catalogo)}</span></div>`;

  return `
    <article class="cart-item" data-id="${id}">
      <div class="cart-item__img">${imagemHTML}</div>
      <div class="cart-item__info">
        ${p.marca ? `<span class="product-card__brand">${p.marca}</span>` : ''}
        <h3 class="cart-item__name">${p.nome}</h3>
        <span class="cart-item__unit-price">${formatMZN(precoUnit)} · ${p.unidade}</span>
      </div>
      <div class="qty-stepper" role="group" aria-label="Quantidade de ${p.nome}">
        <button type="button" class="qty-stepper__btn" data-qty-down="${id}" aria-label="Diminuir quantidade">−</button>
        <span class="qty-stepper__value">${p.qtd}</span>
        <button type="button" class="qty-stepper__btn" data-qty-up="${id}" aria-label="Aumentar quantidade">+</button>
      </div>
      <span class="cart-item__subtotal">${formatMZN(subtotal)}</span>
      <button type="button" class="cart-item__remove" data-remove="${id}" aria-label="Remover ${p.nome} do carrinho">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z"/></svg>
      </button>
    </article>`;
}

async function renderCarrinho() {
  const wrap = document.getElementById('carrinhoConteudo');
  if (!wrap) return;

  const data = await loadCatalog();
  const cart = getCart();
  const ids = Object.keys(cart);

  if (ids.length === 0) {
    wrap.innerHTML = `
      <div class="section-head"><h2>O seu Carrinho</h2></div>
      <div class="cart-empty">
        <span aria-hidden="true" style="font-size:3rem;">🛒</span>
        <p>O seu carrinho está vazio.</p>
        <a href="produtos.html" class="btn btn-primary">Ver produtos</a>
      </div>`;
    return;
  }

  const { itens, total } = cartTotals();

  wrap.innerHTML = `
    <div class="section-head"><h2>O seu Carrinho</h2></div>
    <div class="cart-layout">
      <div class="cart-items" id="cartItems">
        ${ids.map(id => cartItemHTML(id, cart[id], data)).join('')}
      </div>
      <aside class="card cart-summary">
        <h3>Resumo do Pedido</h3>
        <div class="cart-summary__row">
          <span>${itens} ${itens === 1 ? 'item' : 'itens'}</span>
          <span>${formatMZN(total)}</span>
        </div>
        <div class="cart-summary__row cart-summary__row--muted">
          <span>Entrega / Levantamento</span>
          <span>A definir no checkout</span>
        </div>
        <div class="cart-summary__row cart-summary__row--total">
          <span>Total</span>
          <span>${formatMZN(total)}</span>
        </div>
        <a href="checkout.html" class="btn btn-primary btn-block">Finalizar Compra</a>
        <a href="produtos.html" class="btn btn-outline btn-block" style="margin-top:var(--sp-2);">Continuar a comprar</a>
      </aside>
    </div>`;

  wireCartEvents(data);
}

function wireCartEvents(data) {
  const wrap = document.getElementById('carrinhoConteudo');
  wrap.querySelectorAll('[data-qty-up]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-qty-up');
      const cart = getCart();
      updateQty(id, (cart[id]?.qtd || 0) + 1);
      renderCarrinho();
    });
  });
  wrap.querySelectorAll('[data-qty-down]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-qty-down');
      const cart = getCart();
      updateQty(id, (cart[id]?.qtd || 0) - 1);
      renderCarrinho();
    });
  });
  wrap.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      removeFromCart(btn.getAttribute('data-remove'));
      renderCarrinho();
    });
  });
}

document.addEventListener('DOMContentLoaded', renderCarrinho);