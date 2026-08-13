/* ==========================================================================
   MR. HOULANG — PEDIDO CONFIRMADO (Fase 3)
   Mostra o resumo da encomenda guardada localmente e gera uma mensagem
   pronta a enviar por WhatsApp — enquanto não há backend (Fase 4), este é
   o canal real de confirmação com a loja.
   ========================================================================== */

const WHATSAPP_LOJA = '258879878888';

function montarMensagemWhatsApp(order) {
  const linhas = order.itens.map(i => `• ${i.qtd}× ${i.nome} — ${formatMZN(i.subtotal)}`).join('\n');
  const entrega = order.entrega.tipo === 'domicilio'
    ? `Entrega ao domicílio: ${order.entrega.endereco}`
    : 'Levantamento na loja (Av. Guerra Popular)';

  const msg = `Olá! Acabei de fazer o pedido *${order.id}* no site do Mr. Houlang.\n\n`
    + `${linhas}\n\nTotal: ${formatMZN(order.total)}\n${entrega}\n`
    + `Pagamento: ${order.pagamento}\n\nNome: ${order.cliente.nome}\nTelefone: ${order.cliente.telefone}`;

  return encodeURIComponent(msg);
}

function renderPedidoConfirmado() {
  const wrap = document.getElementById('pedidoConfirmadoConteudo');
  if (!wrap) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const order = (id && getOrder(id)) || getLastOrder();

  if (!order) {
    wrap.innerHTML = `
      <div class="section-head"><h2>Pedido não encontrado</h2></div>
      <p>Não encontrámos nenhum pedido recente neste dispositivo.</p>
      <a href="produtos.html" class="btn btn-primary">Ver produtos</a>`;
    return;
  }

  const entregaTexto = order.entrega.tipo === 'domicilio'
    ? `🚚 Entrega ao domicílio — ${order.entrega.endereco}`
    : '🏪 Levantamento na loja — Av. Guerra Popular Nr. 1128, Maputo';

  wrap.innerHTML = `
    <div class="order-confirm">
      <span class="order-confirm__icon" aria-hidden="true">✅</span>
      <h2>Pedido confirmado!</h2>
      <p>Número do pedido: <strong>${order.id}</strong></p>

      <div class="card checkout-summary" style="text-align:left; margin-top:var(--sp-5);">
        <h3>Resumo</h3>
        <div class="checkout-summary__list">
          ${order.itens.map(i => `
            <div class="checkout-summary__item">
              <span>${i.qtd}× ${i.nome}</span>
              <span>${formatMZN(i.subtotal)}</span>
            </div>`).join('')}
        </div>
        <div class="cart-summary__row cart-summary__row--total">
          <span>Total</span>
          <span>${formatMZN(order.total)}</span>
        </div>
        <p style="margin-top:var(--sp-3);">${entregaTexto}</p>
        <p>💳 Pagamento: ${order.pagamento}</p>
      </div>

      <p style="max-width:48ch; margin:var(--sp-5) auto;">
        Para confirmarmos o seu pedido o mais rápido possível, envie-nos os
        detalhes por WhatsApp — é o nosso canal directo enquanto a confirmação
        automática ainda está a ser construída.
      </p>

      <a class="btn btn-primary" target="_blank" rel="noopener"
         href="https://wa.me/${WHATSAPP_LOJA}?text=${montarMensagemWhatsApp(order)}">
        Enviar pedido por WhatsApp
      </a>
      <a href="produtos.html" class="btn btn-outline" style="margin-left:var(--sp-2);">Continuar a comprar</a>
    </div>`;
}

document.addEventListener('DOMContentLoaded', renderPedidoConfirmado);