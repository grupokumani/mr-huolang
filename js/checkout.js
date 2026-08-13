/* ==========================================================================
   MR. HOULANG — CHECKOUT (Fase 3)
   Formulário de entrega/levantamento + resumo do pedido.
   Sem conta obrigatória (checkout como convidado).
   O pagamento aqui é apenas informativo — a integração real entra na Fase 5.
   ========================================================================== */

function checkoutSummaryHTML(cart, total) {
  const linhas = Object.entries(cart).map(([id, p]) => {
    const precoUnit = p.precoPromo ?? p.preco;
    return `
      <div class="checkout-summary__item">
        <span>${p.qtd}× ${p.nome}</span>
        <span>${formatMZN(precoUnit * p.qtd)}</span>
      </div>`;
  }).join('');

  return `
    <h3>Resumo do Pedido</h3>
    <div class="checkout-summary__list">${linhas}</div>
    <div class="cart-summary__row cart-summary__row--total">
      <span>Total</span>
      <span id="checkoutTotal">${formatMZN(total)}</span>
    </div>`;
}

function renderCheckout() {
  const wrap = document.getElementById('checkoutConteudo');
  if (!wrap) return;

  const cart = getCart();
  const ids = Object.keys(cart);

  if (ids.length === 0) {
    wrap.innerHTML = `
      <div class="section-head"><h2>Finalizar Compra</h2></div>
      <div class="cart-empty">
        <span aria-hidden="true" style="font-size:3rem;">🛒</span>
        <p>O seu carrinho está vazio — adicione produtos antes de finalizar a compra.</p>
        <a href="produtos.html" class="btn btn-primary">Ver produtos</a>
      </div>`;
    return;
  }

  const { total } = cartTotals();

  wrap.innerHTML = `
    <div class="section-head"><h2>Finalizar Compra</h2></div>
    <form id="checkoutForm" class="checkout-layout" novalidate>
      <div class="checkout-form">
        <div class="form-group">
          <label class="form-label" for="fNome">Nome completo *</label>
          <input class="form-input" type="text" id="fNome" name="nome" required autocomplete="name">
        </div>
        <div class="form-group">
          <label class="form-label" for="fTelefone">Telefone (WhatsApp) *</label>
          <input class="form-input" type="tel" id="fTelefone" name="telefone" placeholder="8X XXX XXXX" required autocomplete="tel">
        </div>

        <div class="form-group">
          <span class="form-label">Como quer receber o pedido? *</span>
          <div class="form-radio-group">
            <label class="radio-option">
              <input type="radio" name="entrega" value="levantamento" checked>
              <span>🏪 Levantar na loja — Av. Guerra Popular</span>
            </label>
            <label class="radio-option">
              <input type="radio" name="entrega" value="domicilio">
              <span>🚚 Entrega ao domicílio</span>
            </label>
          </div>
        </div>

        <div class="form-group" id="grupoEndereco" style="display:none;">
          <label class="form-label" for="fEndereco">Endereço de entrega *</label>
          <textarea class="form-input form-textarea" id="fEndereco" name="endereco" rows="2" placeholder="Bairro, rua, referência…"></textarea>
        </div>

        <div class="form-group">
          <label class="form-label" for="fPagamento">Forma de pagamento *</label>
          <select class="form-input form-select" id="fPagamento" name="pagamento" required>
            <option value="">Escolha uma opção</option>
            <option value="entrega">Pagamento na entrega / levantamento</option>
            <option value="mpesa">M-Pesa</option>
            <option value="emola">e-Mola</option>
            <option value="mkesh">mKesh</option>
            <option value="cartao">Cartão</option>
          </select>
          <p style="font-size:var(--fs-xs); color:var(--hl-gray-500); margin-top:var(--sp-1);">
            O pagamento é confirmado por telefone/WhatsApp após o pedido — a cobrança automática entra na Fase 5.
          </p>
        </div>

        <div class="form-group">
          <label class="form-label" for="fObs">Observações (opcional)</label>
          <textarea class="form-input form-textarea" id="fObs" name="observacoes" rows="2" placeholder="Ex: ligar antes de entregar"></textarea>
        </div>
      </div>

      <aside class="card cart-summary checkout-summary">
        ${checkoutSummaryHTML(cart, total)}
        <button type="submit" class="btn btn-primary btn-block">Confirmar Pedido</button>
        <a href="carrinho.html" class="btn btn-outline btn-block" style="margin-top:var(--sp-2);">Voltar ao carrinho</a>
      </aside>
    </form>`;

  wireCheckoutEvents(cart, total);
}

function wireCheckoutEvents(cart, total) {
  const form = document.getElementById('checkoutForm');
  const radios = form.querySelectorAll('input[name="entrega"]');
  const grupoEndereco = document.getElementById('grupoEndereco');
  const enderecoInput = document.getElementById('fEndereco');

  radios.forEach(r => {
    r.addEventListener('change', () => {
      const domicilio = form.entrega.value === 'domicilio';
      grupoEndereco.style.display = domicilio ? 'block' : 'none';
      enderecoInput.required = domicilio;
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const dados = new FormData(form);
    const order = {
      id: generateOrderId(),
      criadoEm: new Date().toISOString(),
      cliente: {
        nome: dados.get('nome'),
        telefone: dados.get('telefone'),
      },
      entrega: {
        tipo: dados.get('entrega'),
        endereco: dados.get('endereco') || null,
      },
      pagamento: dados.get('pagamento'),
      observacoes: dados.get('observacoes') || null,
      itens: Object.entries(cart).map(([id, p]) => ({
        id, nome: p.nome, qtd: p.qtd,
        precoUnitario: p.precoPromo ?? p.preco,
        subtotal: (p.precoPromo ?? p.preco) * p.qtd,
      })),
      total,
      estado: 'pendente',
    };

    saveOrder(order);
    clearCart();
    window.location.href = `pedido-confirmado.html?id=${encodeURIComponent(order.id)}`;
  });
}

document.addEventListener('DOMContentLoaded', renderCheckout);