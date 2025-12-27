function enviarWhats(event) {
  event.preventDefault();

  clearAllErrors();

  const nome = document.getElementById("nome").value.trim();
  const mensagem = document.getElementById("mensagem").value.trim();
  const telefone = document.getElementById("telefone") ? document.getElementById("telefone").value.trim() : "";

  if (nome === "") {
    showError('nome', 'Por favor, preencha o campo Nome.');
    document.getElementById("nome").focus();
    return;
  }

  if (telefone === "") {
    showError('telefone', 'Por favor, preencha o campo Telefone.');
    const telEl = document.getElementById("telefone");
    if (telEl) telEl.focus();
    return;
  }

  if (mensagem === "") {
    showError('mensagem', 'Por favor, preencha o campo Mensagem.');
    document.getElementById("mensagem").focus();
    return;
  }

  const texto = `Olá! me chamo ${nome}, ${mensagem}`;

  const msgFormatada = encodeURIComponent(texto);

  // valida e normaliza telefone: aceita 10 ou 11 dígitos (DDD + número)
  let telRaw = telefone.replace(/\D/g, "");
  // remove código do país se o usuário tiver digitado
  let telLocal = telRaw.replace(/^55/, "");
  if (!(telLocal.length === 10 || telLocal.length === 11)) {
    showError('telefone', 'Telefone inválido. Informe DDD + número (10 ou 11 dígitos).');
    const telEl = document.getElementById("telefone");
    if (telEl) telEl.focus();
    return;
  }

  const telDigits = "55" + telLocal;
  const url = `https://wa.me/${telDigits}?text=${msgFormatada}`;
  window.open(url, "_blank");
}

// Máscara simples para telefone brasileiro durante a digitação
document.addEventListener('DOMContentLoaded', function () {
  const telEl = document.getElementById('telefone');
  const nomeEl = document.getElementById('nome');
  const msgEl = document.getElementById('mensagem');
  if (telEl) {
    telEl.addEventListener('input', function (e) {
      const cursorPos = telEl.selectionStart;
      const beforeLength = telEl.value.length;
      telEl.value = formatTelefone(telEl.value);
      const afterLength = telEl.value.length;
      // tenta manter cursor no fim aproximado
      telEl.selectionStart = telEl.selectionEnd = cursorPos + (afterLength - beforeLength);
      clearError('telefone');
    });

    telEl.addEventListener('blur', function () {
      telEl.value = formatTelefone(telEl.value);
    });
  }

  if (nomeEl) {
    nomeEl.addEventListener('input', function () { clearError('nome'); });
  }

  if (msgEl) {
    msgEl.addEventListener('input', function () { clearError('mensagem'); });
  }
});

// Navegação: toggle mobile, destaque ativo ao rolar e sombra na nav
document.addEventListener('DOMContentLoaded', function () {
  const navToggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('menu');
  const nav = document.querySelector('.navegacao');

  if (navToggle && menu) {
    navToggle.addEventListener('click', function () {
      const expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!expanded));
      menu.classList.toggle('open');
    });

    // fechar menu ao clicar em um link (mobile)
    menu.querySelectorAll('a.menu-link').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('open');
        if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // sombra ao rolar
  function handleScroll() {
    if (!nav) return;
    if (window.scrollY > 10) nav.classList.add('scrolled'); else nav.classList.remove('scrolled');
  }
  handleScroll();
  window.addEventListener('scroll', handleScroll);

  // destacar link ativo usando IntersectionObserver
  const sections = document.querySelectorAll('section[id], man[id]');
  const linkMap = {};
  document.querySelectorAll('a.menu-link').forEach(function (a) {
    const href = a.getAttribute('href');
    if (href && href.startsWith('#')) linkMap[href.substring(1)] = a;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.id;
      const link = linkMap[id];
      if (!link) return;
      if (entry.isIntersecting) {
        document.querySelectorAll('a.menu-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { root: null, rootMargin: '0px', threshold: 0.5 });

  sections.forEach(s => observer.observe(s));
});

function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (field) field.classList.add('invalid');
  const err = document.getElementById(fieldId + '-error');
  if (err) err.textContent = message;
}

function clearError(fieldId) {
  const field = document.getElementById(fieldId);
  if (field) field.classList.remove('invalid');
  const err = document.getElementById(fieldId + '-error');
  if (err) err.textContent = '';
}

function clearAllErrors() {
  ['nome', 'telefone', 'mensagem'].forEach(clearError);
}

function formatTelefone(value) {
  if (!value) return '';
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('55')) digits = digits.replace(/^55/, '');
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
  return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7,11)}`;
}
