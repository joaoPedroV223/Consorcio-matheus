/* =========================================================
   MARIAS CAFETERIA & BISTRÔ — Script principal
   Protótipo para demonstração comercial
   ---------------------------------------------------------
   Funcionalidades organizadas por bloco. As melhorias de
   usabilidade seguem as heurísticas de Nielsen (comentadas).
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  const NUMERO_WHATS = '5527996121830';  // WhatsApp real do Instagram

  /* 1. HEADER AO ROLAR + VOLTAR AO TOPO (H1 status) --------- */
  const header = document.querySelector('.header');
  const topoBtn = document.querySelector('.topo-btn');
  const aoRolar = () => {
    if (window.scrollY > 60) header && header.classList.add('rolado');
    else header && header.classList.remove('rolado');
    if (topoBtn) topoBtn.classList.toggle('visivel', window.scrollY > 500);
  };
  window.addEventListener('scroll', aoRolar);
  aoRolar();
  topoBtn && topoBtn.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* 2. MENU MOBILE (H3 controle e liberdade) ---------------- */
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const aberto = menu.classList.toggle('aberto');
      toggle.classList.toggle('ativo');
      toggle.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      menu.classList.remove('aberto');
      toggle.classList.remove('ativo');
    }));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menu.classList.contains('aberto')) {
        menu.classList.remove('aberto');
        toggle.classList.remove('ativo');
      }
    });
  }

  /* 3. ANIMAÇÕES DE ENTRADA --------------------------------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entradas) => {
      entradas.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('visivel'); obs.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    reveals.forEach(el => obs.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('visivel'));
  }

  /* 4. STATUS ABERTO / FECHADO (H1 visibilidade do status) --
     Horário: Seg–Sex 8h–19h | Sáb–Dom 8h–20h (fictício p/ demo)
     -------------------------------------------------------- */
  const statusEls = document.querySelectorAll('.status-loja');
  if (statusEls.length) {
    const agora = new Date();
    const dia = agora.getDay();
    const hora = agora.getHours();
    const fds = (dia === 0 || dia === 6);
    const abre = 8;
    const fecha = fds ? 20 : 19;
    const aberto = hora >= abre && hora < fecha;
    statusEls.forEach(el => {
      el.classList.add(aberto ? 'aberto' : 'fechado');
      el.innerHTML = aberto
        ? `<span class="ponto"></span> Aberto agora — até ${fecha}h`
        : `<span class="ponto"></span> Fechado — abrimos às ${abre}h`;
    });
  }

  /* 5. ABAS + BUSCA DO CARDÁPIO (H7 flexibilidade) ---------- */
  const abas = document.querySelectorAll('.aba');
  const categorias = document.querySelectorAll('.categoria');
  const buscaInput = document.querySelector('.busca-input');
  const buscaVazia = document.querySelector('.busca-vazia');

  const trocarAba = (alvo) => {
    abas.forEach(a => {
      const on = a.dataset.categoria === alvo;
      a.classList.toggle('ativa', on);
      a.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    categorias.forEach(c => c.classList.toggle('ativa', c.id === alvo));
  };
  abas.forEach(aba => aba.addEventListener('click', () => {
    if (buscaInput) buscaInput.value = '';
    filtrarBusca('');
    trocarAba(aba.dataset.categoria);
  }));

  function filtrarBusca(termo) {
    if (!buscaInput) return;
    termo = termo.trim().toLowerCase();
    const wrapper = document.querySelector('.cardapio-abas');
    if (termo === '') {
      if (wrapper) wrapper.style.display = '';
      document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('oculto'));
      categorias.forEach(c => c.style.display = '');
      const ativa = document.querySelector('.aba.ativa');
      categorias.forEach(c => c.classList.toggle('ativa', c.id === (ativa && ativa.dataset.categoria)));
      buscaVazia && buscaVazia.classList.remove('mostrar');
      return;
    }
    if (wrapper) wrapper.style.display = 'none';
    categorias.forEach(c => { c.classList.add('ativa'); c.style.display = ''; });
    let achou = 0;
    document.querySelectorAll('.menu-item').forEach(item => {
      const nome = (item.dataset.nome || '').toLowerCase();
      const desc = item.querySelector('.desc')?.textContent.toLowerCase() || '';
      const ok = nome.includes(termo) || desc.includes(termo);
      item.classList.toggle('oculto', !ok);
      if (ok) achou++;
    });
    categorias.forEach(c => {
      const vis = c.querySelectorAll('.menu-item:not(.oculto)').length;
      c.style.display = vis ? 'block' : 'none';
    });
    buscaVazia && buscaVazia.classList.toggle('mostrar', achou === 0);
  }
  buscaInput && buscaInput.addEventListener('input', e => filtrarBusca(e.target.value));

  /* 6. SISTEMA DE PEDIDO (H6/H3/H7) ------------------------- */
  const pedido = {};
  const barra = document.querySelector('.pedido-barra');
  const painel = document.querySelector('.pedido-painel');
  const overlay = document.querySelector('.overlay-fundo');
  const listaEl = document.querySelector('.pedido-lista');
  const contadorEls = document.querySelectorAll('.pedido-contador');
  const totalEl = document.querySelector('.pedido-total strong');

  const formatar = v => 'R$ ' + v.toFixed(2).replace('.', ',');
  const totais = () => {
    let qtd = 0, valor = 0;
    Object.values(pedido).forEach(i => { qtd += i.qtd; valor += i.qtd * i.preco; });
    return { qtd, valor };
  };

  function renderizar() {
    const { qtd, valor } = totais();
    contadorEls.forEach(c => c.textContent = qtd);
    if (totalEl) totalEl.textContent = formatar(valor);
    if (barra) barra.classList.toggle('visivel', qtd > 0);
    if (!listaEl) return;
    if (qtd === 0) {
      listaEl.innerHTML = `<div class="pedido-vazio"><span class="emoji">🛒</span><p>Seu pedido está vazio.<br>Escolha suas delícias no cardápio!</p></div>`;
      return;
    }
    listaEl.innerHTML = Object.entries(pedido).map(([nome, i]) => `
      <div class="pedido-item">
        <div class="nome"><strong>${nome}</strong><small>${formatar(i.preco)} cada</small></div>
        <div class="pedido-qtd">
          <button data-acao="menos" data-nome="${nome}" aria-label="Diminuir">−</button>
          <span>${i.qtd}</span>
          <button data-acao="mais" data-nome="${nome}" aria-label="Aumentar">+</button>
        </div>
      </div>`).join('');
  }

  function adicionar(nome, preco) {
    if (!pedido[nome]) pedido[nome] = { preco, qtd: 0 };
    pedido[nome].qtd++;
    renderizar();
    mostrarToast(`${nome} adicionado`);
  }
  function alterar(nome, d) {
    if (!pedido[nome]) return;
    pedido[nome].qtd += d;
    if (pedido[nome].qtd <= 0) delete pedido[nome];
    renderizar();
  }

  document.querySelectorAll('.btn-add').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('[data-nome]');
      const nome = item?.dataset.nome;
      const preco = parseFloat(item?.dataset.preco || '0');
      if (!nome) return;
      adicionar(nome, preco);
      btn.classList.add('adicionado');
      const html = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-check"></i>';
      setTimeout(() => { btn.classList.remove('adicionado'); btn.innerHTML = html; }, 1200);
    });
  });

  listaEl && listaEl.addEventListener('click', e => {
    const b = e.target.closest('button[data-acao]');
    if (b) alterar(b.dataset.nome, b.dataset.acao === 'mais' ? 1 : -1);
  });

  const abrirPainel = () => {
    painel && painel.classList.add('aberto');
    overlay && overlay.classList.add('aberto');
    document.body.style.overflow = 'hidden';
  };
  const fecharPainel = () => {
    painel && painel.classList.remove('aberto');
    overlay && overlay.classList.remove('aberto');
    document.body.style.overflow = '';
  };
  document.querySelectorAll('.abrir-pedido').forEach(b => b.addEventListener('click', abrirPainel));
  document.querySelector('.pedido-painel-fechar')?.addEventListener('click', fecharPainel);
  overlay?.addEventListener('click', fecharPainel);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && painel?.classList.contains('aberto')) fecharPainel();
  });

  document.querySelector('.pedido-limpar')?.addEventListener('click', () => {
    if (totais().qtd === 0) return;
    if (confirm('Deseja remover todos os itens do pedido?')) {
      Object.keys(pedido).forEach(k => delete pedido[k]);
      renderizar();
      mostrarToast('Pedido limpo');
    }
  });

  document.querySelectorAll('.pedido-enviar').forEach(btn => btn.addEventListener('click', () => {
    const { qtd, valor } = totais();
    if (qtd === 0) { mostrarToast('Adicione itens antes de enviar'); return; }
    let msg = 'Olá, Maria\'s! Gostaria de fazer este pedido:%0A%0A';
    Object.entries(pedido).forEach(([nome, i]) => {
      msg += `• ${i.qtd}x ${nome} — ${formatar(i.qtd * i.preco)}%0A`;
    });
    msg += `%0A*Total: ${formatar(valor)}*`;
    window.open(`https://wa.me/${NUMERO_WHATS}?text=${msg}`, '_blank');
  }));

  renderizar();

  /* 7. TOAST (H1 feedback) ---------------------------------- */
  let toastTimer;
  function mostrarToast(txt) {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.innerHTML = `<span class="ic"><i class="fa-solid fa-circle-check"></i></span> ${txt}`;
    t.classList.add('mostrar');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('mostrar'), 2500);
  }

  /* 8. LIGHTBOX DA GALERIA (H3 controle) -------------------- */
  const itens = document.querySelectorAll('.galeria-item');
  const lightbox = document.querySelector('.lightbox');
  if (lightbox && itens.length) {
    const img = lightbox.querySelector('img');
    const contador = lightbox.querySelector('.lightbox-contador');
    const imagens = Array.from(itens).map(it => {
      const i = it.querySelector('img');
      return { src: i.dataset.full || i.src, alt: i.alt };
    });
    let idx = 0;
    const atualizar = () => {
      img.src = imagens[idx].src;
      img.alt = imagens[idx].alt;
      if (contador) contador.textContent = `${idx + 1} / ${imagens.length}`;
    };
    const abrir = i => { idx = i; atualizar(); lightbox.classList.add('aberto'); document.body.style.overflow = 'hidden'; };
    const fechar = () => { lightbox.classList.remove('aberto'); document.body.style.overflow = ''; };
    const nav = d => { idx = (idx + d + imagens.length) % imagens.length; atualizar(); };
    itens.forEach((it, i) => {
      it.addEventListener('click', () => abrir(i));
      it.setAttribute('tabindex', '0');
      it.setAttribute('role', 'button');
      it.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(i); } });
    });
    lightbox.querySelector('.lightbox-fechar')?.addEventListener('click', fechar);
    lightbox.querySelector('.lightbox-nav.anterior')?.addEventListener('click', () => nav(-1));
    lightbox.querySelector('.lightbox-nav.proximo')?.addEventListener('click', () => nav(1));
    lightbox.addEventListener('click', e => { if (e.target === lightbox) fechar(); });
    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('aberto')) return;
      if (e.key === 'Escape') fechar();
      if (e.key === 'ArrowLeft') nav(-1);
      if (e.key === 'ArrowRight') nav(1);
    });
  }

  /* 9. FAQ ACORDEÃO (H10 ajuda) ----------------------------- */
  document.querySelectorAll('.faq-pergunta').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const aberto = item.classList.contains('aberto');
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('aberto');
        i.querySelector('.faq-pergunta').setAttribute('aria-expanded', 'false');
      });
      if (!aberto) { item.classList.add('aberto'); btn.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* 10. FORMULÁRIO COM VALIDAÇÃO (H5/H9) -------------------- */
  const form = document.querySelector('.form-contato');
  const formMsg = document.querySelector('.form-msg');
  if (form) {
    const validar = campo => {
      const grupo = campo.closest('.form-grupo');
      let ok = true;
      if (campo.hasAttribute('required') && campo.value.trim() === '') ok = false;
      else if (campo.type === 'email' && campo.value.trim() !== '')
        ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campo.value);
      grupo.classList.toggle('invalido', !ok);
      return ok;
    };
    form.querySelectorAll('input, textarea').forEach(c => {
      c.addEventListener('blur', () => validar(c));
      c.addEventListener('input', () => { if (c.closest('.form-grupo').classList.contains('invalido')) validar(c); });
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true;
      form.querySelectorAll('input, textarea').forEach(c => { if (!validar(c)) ok = false; });
      if (!ok) { form.querySelector('.form-grupo.invalido input, .form-grupo.invalido textarea')?.focus(); return; }
      if (formMsg) {
        formMsg.classList.add('mostrar');
        formMsg.innerHTML = '<i class="fa-solid fa-circle-check"></i> Mensagem enviada com sucesso! Logo entraremos em contato. ☕';
      }
      form.reset();
      setTimeout(() => formMsg && formMsg.classList.remove('mostrar'), 6000);
    });
  }

});
