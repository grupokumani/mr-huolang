/* ==========================================================================
   MR. HOULANG — JS PRINCIPAL (Fase 2: homepage)
   Vanilla JS, sem dependências. Carrinho guardado em localStorage
   (no dispositivo do cliente) — na Fase 4 passa a sincronizar com o servidor.
   ========================================================================== */

const CART_KEY = 'hl_cart_v1';

/* ---------- Utilidades ---------- */
function formatMZN(valor) {
  return new Intl.NumberFormat('pt-MZ', { minimumFractionDigits: 0 }).format(valor) + ' MT';
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || {};
  } catch { return {}; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartUI();
}

function addToCart(produtoId, produto) {
  const cart = getCart();
  if (!cart[produtoId]) {
    cart[produtoId] = { ...produto, qtd: 0 };
  }
  cart[produtoId].qtd += 1;
  saveCart(cart);
  toast(`${produto.nome} adicionado ao carrinho`);
}

function removeFromCart(produtoId) {
  const cart = getCart();
  const produto = cart[produtoId];
  delete cart[produtoId];
  saveCart(cart);
  if (produto) toast(`${produto.nome} removido do carrinho`);
}

function updateQty(produtoId, novaQtd) {
  const cart = getCart();
  if (!cart[produtoId]) return;
  if (novaQtd <= 0) {
    delete cart[produtoId];
  } else {
    cart[produtoId].qtd = novaQtd;
  }
  saveCart(cart);
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartUI();
}

function cartTotals() {
  const cart = getCart();
  let itens = 0, total = 0;
  Object.values(cart).forEach(p => {
    itens += p.qtd;
    total += p.qtd * (p.precoPromo ?? p.preco);
  });
  return { itens, total };
}

/* ---------- Encomendas (Fase 3: guardadas no dispositivo — Fase 4 passa para o servidor) ---------- */
const ORDERS_KEY = 'hl_orders_v1';
const LAST_ORDER_KEY = 'hl_last_order_id';

function generateOrderId() {
  const d = new Date();
  const ymd = d.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MH-${ymd}-${rand}`;
}

function saveOrder(order) {
  const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
  orders.push(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  localStorage.setItem(LAST_ORDER_KEY, order.id);
  return order;
}

function getOrder(id) {
  const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
  return orders.find(o => o.id === id) || null;
}

function getLastOrder() {
  const id = localStorage.getItem(LAST_ORDER_KEY);
  return id ? getOrder(id) : null;
}

function updateCartUI() {
  const { itens, total } = cartTotals();
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = itens;
    el.style.display = itens > 0 ? 'flex' : 'none';
  });
  const bar = document.getElementById('cartBar');
  if (bar) {
    bar.classList.toggle('is-visible', itens > 0);
    const info = bar.querySelector('.cart-bar__info');
    if (info) info.innerHTML = `<strong>${itens}</strong> ${itens === 1 ? 'item' : 'itens'} · ${formatMZN(total)}`;
  }
}

/* ---------- Toast simples de feedback ---------- */
let toastTimer;
function toast(msg) {
  let el = document.getElementById('hlToast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'hlToast';
    el.style.cssText = `
      position:fixed; left:50%; bottom:90px; transform:translateX(-50%) translateY(20px);
      background:var(--hl-ink); color:#fff; padding:10px 18px; border-radius:999px;
      font-size:14px; z-index:300; opacity:0; transition:opacity .2s ease, transform .2s ease;
      box-shadow:0 8px 24px rgba(0,0,0,.2); pointer-events:none; white-space:nowrap;`;
    document.body.appendChild(el);
  }
  el.textContent = msg;
  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateX(-50%) translateY(0)';
  });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-50%) translateY(20px)';
  }, 1800);
}

/* ---------- Renderização de produtos ---------- */

/* Devolve o ícone da categoria de um produto (usado no placeholder). */
function iconeCategoria(categoriaId, catalogo) {
  const cat = catalogo?.categorias?.find(c => c.id === categoriaId);
  return cat ? cat.icone : '🛒';
}

function productCardHTML(p, catalogo) {
  const temPromo = p.precoPromo && p.precoPromo < p.preco;
  const desconto = temPromo ? Math.round(100 - (p.precoPromo / p.preco) * 100) : 0;
  const imagemHTML = p.imagem
    ? `<img src="${p.imagem}" alt="${p.nome}" loading="lazy" width="400" height="300">`
    : `<div class="product-card__placeholder"><span aria-hidden="true">${iconeCategoria(p.categoria, catalogo)}</span></div>`;
  return `
    <article class="card product-card" data-id="${p.id}">
      <a href="produto.html?id=${p.id}" class="product-card__img-wrap" aria-label="${p.nome}">
        ${temPromo ? `<span class="discount-badge">-${desconto}%</span>` : ''}
        ${imagemHTML}
      </a>
      <div class="product-card__body">
        ${p.marca ? `<span class="product-card__brand">${p.marca}</span>` : ''}
        <h3 class="product-card__name"><a href="produto.html?id=${p.id}">${p.nome}</a></h3>
        <div class="product-card__prices">
          ${temPromo ? `<span class="price-tag--old">${formatMZN(p.preco)}</span>` : ''}
          <span class="price-tag"><span class="price-tag__current">${formatMZN(temPromo ? p.precoPromo : p.preco)}</span><span class="price-tag__unit">${p.unidade}</span></span>
        </div>
      </div>
      <button class="product-card__add" aria-label="Adicionar ${p.nome} ao carrinho" data-add="${p.id}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
      </button>
    </article>`;
}

/* Ícones SVG de linha, 24x24, sem dependência externa — substituem os emojis
   apenas na apresentação (data/products.json mantém-se intocado). */
const CATEGORY_ICONS_SVG = {
  'mobiliario': '<path d="M6 10V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4"/><rect x="4" y="10" width="16" height="7" rx="1.5"/><path d="M5 17v2M19 17v2"/>',
  'electrodomesticos': '<path d="M9 3v4M15 3v4"/><rect x="7" y="7" width="10" height="7" rx="2"/><path d="M12 14v4"/><path d="M9 21h6"/>',
  'loica-cozinha': '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/>',
  'decoracao': '<path d="M9 3h6l2 6H7z"/><path d="M12 9v8"/><path d="M8 21h8"/><path d="M9 21c0-2 1.5-3 3-3s3 1 3 3"/>',
  'arrumacao': '<path d="M3 8l9-4 9 4-9 4-9-4z"/><path d="M3 8v8l9 4 9-4V8"/><path d="M12 12v8"/>',
  'limpeza': '<path d="M10 3h3v3h-3z"/><path d="M9 6h5l2 2-1 1H8l-1-1z"/><path d="M8 9h6v11a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1z"/><path d="M16 8l3-2M17 6l1 1M16 5l1 1"/>',
  'banho-cama': '<path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6"/><path d="M3 14h18"/><path d="M7 14v-3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3"/><path d="M3 18v2M21 18v2"/>',
  'brinquedos': '<rect x="4" y="12" width="7" height="7" rx="1"/><rect x="13" y="12" width="7" height="7" rx="1"/><rect x="8.5" y="5" width="7" height="7" rx="1"/>',
  'bebe-crianca': '<path d="M10 2h4v3h-4z"/><path d="M9 5h6l1 2-1 1H9L8 7z"/><path d="M8 8h8v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z"/><path d="M8 13h8"/>',
  'malas-acessorios': '<path d="M8 7V5a4 4 0 0 1 8 0v2"/><rect x="4" y="7" width="16" height="13" rx="2"/><path d="M4 12h16"/>',
  'jardim-exterior': '<path d="M6 20C6 10 14 4 20 4c0 8-6 14-14 16z"/><path d="M6 20c2-4 5-7 9-9"/>',
  'beleza-higiene': '<path d="M10 2h4v3h-4z"/><path d="M9 5h6l1 2v2H8V7z"/><path d="M8 9h8v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z"/><path d="M12 13v5M9.5 15.5h5"/>',
};

function categoryIconSVG(c) {
  const paths = CATEGORY_ICONS_SVG[c.id];
  if (!paths) return `<span aria-hidden="true">${c.icone}</span>`; // recuo seguro
  return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

function category_icons_svg(c) {
  return `
    <a href="produtos.html?categoria=${c.id}" class="category-card tap-target">
      <span class="emoji">${categoryIconSVG(c)}</span>
      <span>${c.nome}</span>
    </a>`;
}

/* ---------- "Continue a comprar" — usado em TODAS as páginas ----------
   Mostra uma grelha de produtos (aleatórios ou de uma categoria) para o
   cliente nunca ficar numa página "morta" sem opções de compra. */
async function renderContinueShopping(containerId, opts = {}) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const data = await loadCatalog();
  let lista = data.produtos.filter(p => p.activo);

  if (opts.excluirId) lista = lista.filter(p => p.id !== opts.excluirId);
  if (opts.categoria) {
    const mesma = lista.filter(p => p.categoria === opts.categoria);
    const outras = lista.filter(p => p.categoria !== opts.categoria);
    lista = [...mesma, ...outras];
  } else {
    lista = lista.sort(() => Math.random() - 0.5);
  }

  const quantidade = opts.quantidade || 8;
  el.innerHTML = lista.slice(0, quantidade).map(p => productCardHTML(p, data)).join('');

  el.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-add');
      const produto = data.produtos.find(p => p.id === id);
      if (produto) addToCart(id, produto);
    });
  });
}

async function loadCatalog() {
  try {
    const res = await fetch('data/products.json');
    const data = await res.json();
    return data;
  } catch (e) {
    console.error('Não foi possível carregar o catálogo demo:', e);
    return { categorias: [], produtos: [], lojas: [] };
  }
}

async function renderHomepage() {
  const data = await loadCatalog();
  const produtosActivos = data.produtos.filter(p => p.activo);

  const catGrid = document.getElementById('categoryGrid');
  if (catGrid) catGrid.innerHTML = data.categorias.map(category_icons_svg).join('');

  const ofertas = produtosActivos.filter(p => p.destaque === 'oferta-semana');
  const ofertasGrid = document.getElementById('ofertasGrid');
  if (ofertasGrid) ofertasGrid.innerHTML = ofertas.map(p => productCardHTML(p, data)).join('');

  const populares = produtosActivos.filter(p => p.destaque === 'popular');
  const popularesGrid = document.getElementById('popularesGrid');
  if (popularesGrid) popularesGrid.innerHTML = populares.map(p => productCardHTML(p, data)).join('');

  // "Mais Produtos" — catálogo geral, para a homepage nunca parecer curta
  const resto = produtosActivos.filter(p => !['oferta-semana', 'popular'].includes(p.destaque));
  const maisGrid = document.getElementById('maisProdutosGrid');
  if (maisGrid) maisGrid.innerHTML = resto.map(p => productCardHTML(p, data)).join('');

  document.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-add');
      const produto = data.produtos.find(p => p.id === id);
      if (produto) addToCart(id, produto);
    });
  });

  updateCartUI();
}

/* ---------- Contador de ofertas da semana ---------- */
function startCountdown(el) {
  // Demo: termina sempre à meia-noite de domingo (hora local)
  function tick() {
    const now = new Date();
    const end = new Date();
    end.setDate(now.getDate() + ((7 - now.getDay()) % 7 || 7));
    end.setHours(0, 0, 0, 0);
    const diff = Math.max(0, end - now);
    const h = String(Math.floor(diff / 3.6e6)).padStart(2, '0');
    const m = String(Math.floor((diff % 3.6e6) / 6e4)).padStart(2, '0');
    const s = String(Math.floor((diff % 6e4) / 1000)).padStart(2, '0');
    el.textContent = `${h}:${m}:${s}`;
  }
  tick();
  setInterval(tick, 1000);
}

/* ---------- Menu mobile ---------- */
function initMobileMenu() {
  const toggle = document.getElementById('menuToggle');
  const menu = document.getElementById('mobileMenu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

/* ---------- Pesquisa (Fase 2: liga à página de produtos) ---------- */
function initSearch() {
  document.querySelectorAll('form[data-search-form]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = form.querySelector('input').value.trim();
      if (q) window.location.href = `produtos.html?q=${encodeURIComponent(q)}`;
    });
  });
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  renderHomepage();
  initMobileMenu();
  initSearch();
  updateCartUI();
  const cd = document.getElementById('heroCountdown');
  if (cd) startCountdown(cd);
 // "Continue a comprar" — só corre aqui se a página NÃO for a ficha de produto
  // (produto.html usa o catalog.js para mostrar produtos da MESMA categoria)
  if (!document.getElementById('produtoDetalhe')) {
    renderContinueShopping('continueComprarGrid', { quantidade: 8 });
  }
});