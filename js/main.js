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

function cartTotals() {
  const cart = getCart();
  let itens = 0, total = 0;
  Object.values(cart).forEach(p => {
    itens += p.qtd;
    total += p.qtd * (p.precoPromo ?? p.preco);
  });
  return { itens, total };
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

function categoryCardHTML(c) {
  return `
    <a href="produtos.html?categoria=${c.id}" class="category-card tap-target">
      <span class="emoji" aria-hidden="true">${c.icone}</span>
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
  if (catGrid) catGrid.innerHTML = data.categorias.map(categoryCardHTML).join('');

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
  // "Continue a comprar" — só corre se a página tiver o contentor (todas têm, excepto a homepage completa)
  renderContinueShopping('continueComprarGrid', { quantidade: 8 });
});
