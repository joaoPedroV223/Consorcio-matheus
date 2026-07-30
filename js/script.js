/* =========================================================
   MATHEUS ARAUJO — ALAVANCAGEM PATRIMONIAL
   Script principal — protótipo de demonstração comercial
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  const NUMERO_WHATS = '5541999538240';

  /* ---------- 1. HEADER AO ROLAR ---------- */
  const header = document.querySelector('.header');
  const aoRolar = () => header && header.classList.toggle('rolado', window.scrollY > 40);
  window.addEventListener('scroll', aoRolar);
  aoRolar();

  /* ---------- 2. MENU MOBILE ---------- */
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('aberto');
      toggle.classList.toggle('ativo');
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      menu.classList.remove('aberto');
      toggle.classList.remove('ativo');
    }));
  }

  /* ---------- 3. REVEAL ON SCROLL ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('visivel'); obs.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    reveals.forEach(el => obs.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('visivel'));
  }

  /* ---------- 4. FORMATAÇÃO DE MOEDA ---------- */
  const formatarBRL = v => 'R$ ' + Math.round(v).toLocaleString('pt-BR');

  /* ---------- 5. SIMULADOR INTELIGENTE ---------- */
  const simBens = document.querySelectorAll('.sim-bem');
  const sliderValor = document.getElementById('sim-valor');
  const sliderParcela = document.getElementById('sim-parcela');
  const labelValor = document.getElementById('sim-valor-label');
  const labelParcela = document.getElementById('sim-parcela-label');
  const simPrazos = document.querySelectorAll('.sim-prazo');
  const btnSimular = document.querySelector('.sim-cta .btn-laranja');

  let simEstado = { bem: 'Imóvel', valor: 300000, parcela: 2500, prazo: 180 };

  simBens.forEach(bem => {
    bem.addEventListener('click', () => {
      simBens.forEach(b => b.classList.remove('selecionado'));
      bem.classList.add('selecionado');
      simEstado.bem = bem.dataset.bem;
    });
  });

  if (sliderValor && labelValor) {
    sliderValor.addEventListener('input', () => {
      simEstado.valor = parseInt(sliderValor.value, 10);
      labelValor.textContent = formatarBRL(simEstado.valor);
    });
  }
  if (sliderParcela && labelParcela) {
    sliderParcela.addEventListener('input', () => {
      simEstado.parcela = parseInt(sliderParcela.value, 10);
      labelParcela.textContent = formatarBRL(simEstado.parcela);
    });
  }
  simPrazos.forEach(p => {
    p.addEventListener('click', () => {
      simPrazos.forEach(x => x.classList.remove('selecionado'));
      p.classList.add('selecionado');
      simEstado.prazo = parseInt(p.dataset.prazo, 10);
    });
  });

  // Cálculo simplificado do plano ideal (fins demonstrativos)
  function calcularPlano() {
    const taxaAdm = 0.18; // taxa de administração média fictícia p/ demo
    const totalComTaxa = simEstado.valor * (1 + taxaAdm);
    const parcelaEstimada = totalComTaxa / simEstado.prazo;
    // ajusta prazo sugerido se a parcela desejada for muito diferente da calculada
    const prazoIdeal = Math.ceil(totalComTaxa / Math.max(simEstado.parcela, 1));
    return {
      credito: simEstado.valor,
      parcelaEstimada,
      prazoIdeal: Math.min(Math.max(prazoIdeal, 12), 220),
      totalComTaxa
    };
  }

  if (btnSimular) {
    btnSimular.addEventListener('click', () => {
      abrirModalLead('simulador');
    });
  }

  /* ---------- 6. MODAL DE CAPTURA DE LEAD ---------- */
  const modal = document.querySelector('.modal-fundo');
  const modalForm = document.querySelector('.lead-form');
  const modalFechar = document.querySelector('.modal-fechar');
  let origemLead = 'geral';

  function abrirModalLead(origem) {
    origemLead = origem;
    if (!modal) return;
    modal.classList.add('aberto');
    document.body.style.overflow = 'hidden';
  }
  function fecharModalLead() {
    modal && modal.classList.remove('aberto');
    document.body.style.overflow = '';
  }
  modalFechar && modalFechar.addEventListener('click', fecharModalLead);
  modal && modal.addEventListener('click', e => { if (e.target === modal) fecharModalLead(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal?.classList.contains('aberto')) fecharModalLead(); });

  // Qualquer botão com data-lead abre o modal (CTA finais, "Simular Agora" etc.)
  document.querySelectorAll('[data-lead]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      abrirModalLead(btn.dataset.lead || 'geral');
    });
  });

  if (modalForm) {
    const validarCampo = campo => {
      const grupo = campo.closest('.lead-campo');
      let ok = campo.value.trim() !== '';
      if (campo.type === 'email' && ok) ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campo.value);
      grupo.classList.toggle('invalido', !ok);
      return ok;
    };
    modalForm.querySelectorAll('input').forEach(c => {
      c.addEventListener('blur', () => validarCampo(c));
      c.addEventListener('input', () => { if (c.closest('.lead-campo').classList.contains('invalido')) validarCampo(c); });
    });

    modalForm.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true;
      modalForm.querySelectorAll('input').forEach(c => { if (!validarCampo(c)) ok = false; });
      if (!ok) return;

      const nome = modalForm.querySelector('#lead-nome').value.trim();
      const whats = modalForm.querySelector('#lead-whats').value.trim();
      const email = modalForm.querySelector('#lead-email').value.trim();

      // monta mensagem para o WhatsApp com os dados da simulação (se aplicável)
      let msg = `Olá, Matheus! Me chamo ${nome} e quero saber mais sobre alavancagem patrimonial.%0A%0A`;
      if (origemLead === 'simulador') {
        const plano = calcularPlano();
        msg = `Olá, Matheus! Me chamo ${nome} e simulei um consórcio no site:%0A%0A` +
              `• Bem: ${simEstado.bem}%0A` +
              `• Valor: ${formatarBRL(simEstado.valor)}%0A` +
              `• Parcela desejada: ${formatarBRL(simEstado.parcela)}%0A` +
              `• Prazo: ${simEstado.prazo} meses%0A%0A` +
              `Quero entender o melhor plano pra mim.%0A%0A` +
              `Meu e-mail: ${email}`;
      } else {
        msg += `Meu e-mail: ${email}`;
      }

      fecharModalLead();

      // Mostra o resultado do simulador na página, se essa foi a origem
      if (origemLead === 'simulador') {
        mostrarResultadoSimulador(nome);
      } else {
        mostrarToast(`Obrigado, ${nome.split(' ')[0]}! Te chamando no WhatsApp agora.`);
      }

      window.open(`https://wa.me/${NUMERO_WHATS}?text=${msg}`, '_blank');
      modalForm.reset();
    });
  }

  function mostrarResultadoSimulador(nome) {
    const resultado = document.querySelector('.sim-resultado');
    if (!resultado) return;
    const plano = calcularPlano();
    resultado.querySelector('.res-credito').textContent = formatarBRL(plano.credito);
    resultado.querySelector('.res-parcela').textContent = formatarBRL(plano.parcelaEstimada);
    resultado.querySelector('.res-prazo').textContent = `${plano.prazoIdeal} meses`;
    resultado.querySelector('.res-nome').textContent = nome.split(' ')[0];
    resultado.classList.add('mostrar');
    resultado.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ---------- 7. TOAST ---------- */
  let toastTimer;
  function mostrarToast(texto) {
    let t = document.querySelector('.toast-lead');
    if (!t) {
      t = document.createElement('div');
      t.className = 'toast-lead';
      t.style.cssText = 'position:fixed;bottom:96px;left:50%;transform:translateX(-50%);background:#0f0f0f;color:#fff;padding:14px 26px;border-radius:999px;font-weight:500;box-shadow:0 20px 50px rgba(0,0,0,0.3);z-index:3100;opacity:0;transition:.3s;';
      document.body.appendChild(t);
    }
    t.textContent = texto;
    requestAnimationFrame(() => { t.style.opacity = '1'; });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.style.opacity = '0'; }, 3200);
  }

  /* ---------- 8. CALCULADORA CONSÓRCIO x FINANCIAMENTO ---------- */
  const calcValor = document.getElementById('calc-valor');
  const calcEntrada = document.getElementById('calc-entrada');
  const calcTaxa = document.getElementById('calc-taxa');
  const calcBtn = document.querySelector('.calc-form .btn-laranja');

  function calcularEconomia() {
    const valor = parseFloat(calcValor?.value) || 0;
    const entrada = parseFloat(calcEntrada?.value) || 0;
    const taxaAno = (parseFloat(calcTaxa?.value) || 0) / 100;
    if (valor <= 0) return;

    const prazoMeses = 60; // padrão de comparação
    const taxaAdmConsorcio = 0.16; // taxa administrativa média fictícia

    // Financiamento: sistema Price simplificado
    const principalFin = valor - entrada;
    const taxaMensal = taxaAno / 12;
    let totalFinanciamento;
    if (taxaMensal > 0) {
      const parcela = principalFin * (taxaMensal * Math.pow(1 + taxaMensal, prazoMeses)) / (Math.pow(1 + taxaMensal, prazoMeses) - 1);
      totalFinanciamento = parcela * prazoMeses + entrada;
    } else {
      totalFinanciamento = principalFin + entrada;
    }

    // Consórcio: valor + taxa de administração, sem juros
    const totalConsorcio = valor * (1 + taxaAdmConsorcio);

    const economia = Math.max(totalFinanciamento - totalConsorcio, 0);
    const percConsorcio = (totalConsorcio / Math.max(totalFinanciamento, totalConsorcio)) * 100;
    const percFinanciamento = (totalFinanciamento / Math.max(totalFinanciamento, totalConsorcio)) * 100;

    const elEconomia = document.querySelector('.calc-resultado-num');
    const elSub = document.querySelector('.calc-resultado-sub');
    const barraConsorcio = document.querySelector('.preenchido.consorcio');
    const barraFinanciamento = document.querySelector('.preenchido.financiamento');
    const valConsorcio = document.querySelector('.valor-consorcio');
    const valFinanciamento = document.querySelector('.valor-financiamento');

    if (elEconomia) elEconomia.textContent = formatarBRL(economia);
    if (elSub) elSub.textContent = `economia estimada ao escolher consórcio, num prazo de ${prazoMeses} meses`;
    if (valConsorcio) valConsorcio.textContent = formatarBRL(totalConsorcio);
    if (valFinanciamento) valFinanciamento.textContent = formatarBRL(totalFinanciamento);
    if (barraConsorcio) setTimeout(() => barraConsorcio.style.width = percConsorcio + '%', 50);
    if (barraFinanciamento) setTimeout(() => barraFinanciamento.style.width = percFinanciamento + '%', 50);
  }

  calcBtn && calcBtn.addEventListener('click', calcularEconomia);
  // calcula uma vez com os valores padrão ao carregar
  calcularEconomia();

  /* ---------- 9. FAQ ACORDEÃO ---------- */
  document.querySelectorAll('.faq-pergunta').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const jaAberto = item.classList.contains('aberto');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('aberto'));
      if (!jaAberto) item.classList.add('aberto');
    });
  });

  /* ---------- 10. CONTADOR ANIMADO NAS ESTATÍSTICAS ---------- */
  const contadores = document.querySelectorAll('[data-contador]');
  if (contadores.length && 'IntersectionObserver' in window) {
    const obsContador = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const alvo = parseFloat(el.dataset.contador);
        const sufixo = el.dataset.sufixo || '';
        const duracao = 1400;
        const inicio = performance.now();
        function passo(agora) {
          const prog = Math.min((agora - inicio) / duracao, 1);
          const valorAtual = alvo * (1 - Math.pow(1 - prog, 3));
          el.textContent = (alvo % 1 === 0 ? Math.round(valorAtual) : valorAtual.toFixed(1)) + sufixo;
          if (prog < 1) requestAnimationFrame(passo);
        }
        requestAnimationFrame(passo);
        obsContador.unobserve(el);
      });
    }, { threshold: 0.4 });
    contadores.forEach(el => obsContador.observe(el));
  }

});
