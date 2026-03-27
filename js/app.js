(function () {
  'use strict';

  /**
   * İmza / kredi (tek yerden yönetim):
   * - SITE_CREDIT_HTML doluysa bağlantılı metin için kullanılır (innerHTML).
   * - Aksi halde SITE_CREDIT_TEXT düz metin olarak yazılır.
   * İkisi de boşsa satırlar gizlenir.
   */
  const SITE_CREDIT_TEXT = '';
  const SITE_CREDIT_HTML =
    '© 2026 <a href="https://github.com/umtylmzl?tab=repositories" target="_blank" rel="noopener noreferrer">Umut Yılmaz</a> · Heart Print';

  const sizes = [
    { mm: 15, label: 'Mini', popular: false },
    { mm: 16, label: 'Çok Küçük', popular: false },
    { mm: 17, label: 'Küçük', popular: false },
    { mm: 18, label: 'Küçük-Orta', popular: false },
    { mm: 19, label: 'Orta', popular: true },
    { mm: 20, label: 'Standart', popular: true },
    { mm: 21, label: 'Orta-Büyük', popular: true },
    { mm: 22, label: 'Büyük', popular: false },
    { mm: 24, label: 'Çok Büyük', popular: false },
    { mm: 25, label: 'XL', popular: false },
  ];

  const uploadScreen = document.getElementById('uploadScreen');
  const mainScreen = document.getElementById('mainScreen');
  const uploadAreaMain = document.getElementById('uploadAreaMain');
  const uploadBtnMain = document.getElementById('uploadBtnMain');
  const uploadBarSmall = document.getElementById('uploadBarSmall');
  const uploadBtnSmall = document.getElementById('uploadBtnSmall');
  const fileInput = document.getElementById('fileInput');
  const previewThumb = document.getElementById('previewThumb');
  const fileName = document.getElementById('fileName');
  const fileSize = document.getElementById('fileSize');
  const sizesGrid = document.getElementById('sizesGrid');
  const printBtn = document.getElementById('printBtn');
  const globalMobileNav = document.getElementById('globalMobileNav');
  const infoOverlay = document.getElementById('infoOverlay');
  const infoPanelContent = document.getElementById('infoPanelContent');
  const infoPanelClose = document.getElementById('infoPanelClose');
  const tplHow = document.getElementById('tpl-how');
  const tplHelp = document.getElementById('tpl-help');

  let currentImageSrc = null;

  function isMainVisible() {
    return mainScreen && !mainScreen.classList.contains('screen-hidden');
  }

  function setMobileNavOpen(open) {
    if (!globalMobileNav) return;
    globalMobileNav.classList.toggle('hidden', !open);
    document.querySelectorAll('.js-menu-toggle').forEach((btn) => {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
    });
  }

  function closeInfoPanel() {
    if (!infoOverlay || !infoPanelContent) return;
    infoOverlay.classList.remove('is-open');
    infoOverlay.setAttribute('aria-hidden', 'true');
    infoPanelContent.innerHTML = '';
    document.body.classList.remove('info-modal-open');
  }

  function openInfo(kind) {
    const tpl = kind === 'help' ? tplHelp : tplHow;
    if (!tpl || !infoOverlay || !infoPanelContent) return;
    infoPanelContent.innerHTML = '';
    infoPanelContent.appendChild(tpl.content.cloneNode(true));
    infoOverlay.classList.add('is-open');
    infoOverlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('info-modal-open');
    setMobileNavOpen(false);
    if (infoPanelClose) infoPanelClose.focus();
  }

  function goHome() {
    currentImageSrc = null;
    if (fileInput) fileInput.value = '';
    if (previewThumb) {
      previewThumb.removeAttribute('src');
      previewThumb.alt = 'Yüklenen fotoğraf önizlemesi';
    }
    if (fileName) fileName.textContent = 'dosya.jpg';
    if (fileSize) fileSize.textContent = '0 KB';
    renderCards(null);
    uploadScreen.classList.remove('screen-hidden');
    mainScreen.classList.add('screen-hidden');
    document.body.classList.remove('has-main-bar');
    closeInfoPanel();
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function onBrandClick() {
    if (isMainVisible()) {
      goHome();
    } else {
      closeInfoPanel();
      setMobileNavOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + units[i];
  }

  function renderCards(imageSrc) {
    const hasImage = !!imageSrc;
    sizesGrid.innerHTML = sizes
      .map(
        (s) => `
          <div class="print-card relative flex flex-col items-center justify-center p-4 sm:p-5 md:p-6 rounded-2xl cursor-pointer transition-all duration-300 bg-white shadow-card hover:shadow-lg sm:hover:-translate-y-1 border border-transparent" data-mm="${s.mm}">
            <div class="relative w-full max-w-[7.5rem] sm:w-28 aspect-[7/6] mb-3 sm:mb-4 min-h-[4.5rem] sm:min-h-0 drop-shadow-md flex items-center justify-center size-preview-wrap">
              <div class="cut-guide hidden" aria-hidden="true"></div>
              <div class="heart-print heart-mask heart-screen flex items-center justify-center shrink-0" style="--mm: ${s.mm}; background-color: ${hasImage ? 'transparent' : '#ff6b95'};">
                ${hasImage ? `<img src="${imageSrc}" alt="${s.label} ${s.mm} mm" />` : ''}
              </div>
            </div>
            <h3 class="text-gray-900 font-bold text-base sm:text-lg mb-0.5 sm:mb-1 text-center leading-tight px-0.5">${s.label}</h3>
            <p class="print-label text-gray-500 text-xs sm:text-sm font-medium text-center">${s.mm} mm × ${s.mm} mm</p>
          </div>
        `
      )
      .join('');
  }

  function showMainScreen() {
    uploadScreen.classList.add('screen-hidden');
    mainScreen.classList.remove('screen-hidden');
    document.body.classList.add('has-main-bar');
    setMobileNavOpen(false);
  }

  /** Aynı dosyayı tekrar seçince tarayıcı change tetiklemez; her açılışta sıfırlanır */
  function openFilePicker() {
    if (!fileInput) return;
    fileInput.value = '';
    fileInput.click();
  }

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      alert('Lütfen bir resim dosyası seçin (JPG, PNG veya WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      currentImageSrc = e.target.result;
      previewThumb.src = currentImageSrc;
      fileName.textContent = file.name;
      fileSize.textContent = formatFileSize(file.size);
      renderCards(currentImageSrc);
      showMainScreen();
    };
    reader.readAsDataURL(file);
  }

  document.querySelectorAll('.js-brand-logo').forEach((btn) => {
    btn.addEventListener('click', onBrandClick);
  });

  document.querySelectorAll('.js-nav-home').forEach((btn) => {
    btn.addEventListener('click', () => goHome());
  });

  document.querySelectorAll('.js-nav-how').forEach((btn) => {
    btn.addEventListener('click', () => openInfo('how'));
  });

  document.querySelectorAll('.js-nav-help').forEach((btn) => {
    btn.addEventListener('click', () => openInfo('help'));
  });

  document.querySelectorAll('.js-menu-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const open = globalMobileNav && globalMobileNav.classList.contains('hidden');
      setMobileNavOpen(!!open);
    });
  });

  if (infoOverlay) {
    infoOverlay.addEventListener('click', (e) => {
      if (e.target === infoOverlay) closeInfoPanel();
    });
  }

  if (infoPanelClose) {
    infoPanelClose.addEventListener('click', closeInfoPanel);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (infoOverlay && !infoOverlay.classList.contains('hidden')) {
        closeInfoPanel();
        return;
      }
      setMobileNavOpen(false);
    }
  });

  uploadBtnMain.addEventListener('click', (e) => {
    e.stopPropagation();
    openFilePicker();
  });
  uploadAreaMain.addEventListener('click', () => openFilePicker());

  uploadAreaMain.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadAreaMain.classList.add('border-white', 'bg-white', 'scale-105');
  });
  uploadAreaMain.addEventListener('dragleave', () => {
    uploadAreaMain.classList.remove('border-white', 'bg-white', 'scale-105');
  });
  uploadAreaMain.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadAreaMain.classList.remove('border-white', 'bg-white', 'scale-105');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  uploadBtnSmall.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    openFilePicker();
  });
  uploadBarSmall.addEventListener('click', () => openFilePicker());

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  });

  if (printBtn) {
    printBtn.addEventListener('click', () => window.print());
  }

  document.querySelectorAll('[data-site-credit]').forEach((el) => {
    const html = typeof SITE_CREDIT_HTML === 'string' ? SITE_CREDIT_HTML.trim() : '';
    const text = typeof SITE_CREDIT_TEXT === 'string' ? SITE_CREDIT_TEXT.trim() : '';
    if (!html && !text) {
      el.classList.add('hidden');
      el.setAttribute('aria-hidden', 'true');
      return;
    }
    if (html) {
      el.innerHTML = html;
    } else {
      el.textContent = text;
    }
    el.classList.remove('hidden');
    el.removeAttribute('aria-hidden');
  });

  renderCards(null);
})();
