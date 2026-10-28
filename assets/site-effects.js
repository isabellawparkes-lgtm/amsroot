(() => {
  const sections = [...document.querySelectorAll('[data-scroll-theme]')];
  let themeFrame = 0;

  function setThemeAtViewportCentre() {
    themeFrame = 0;
    const atCentre = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
    const section = atCentre && atCentre.closest('[data-scroll-theme]');
    if (section) document.body.dataset.theme = section.dataset.scrollTheme;
  }

  function requestThemeUpdate() {
    if (!themeFrame) themeFrame = requestAnimationFrame(setThemeAtViewportCentre);
  }

  if (sections.length) {
    window.addEventListener('scroll', requestThemeUpdate, { passive: true });
    window.addEventListener('resize', requestThemeUpdate);
    window.addEventListener('pageshow', requestThemeUpdate);
    requestThemeUpdate();
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const headings = [...document.querySelectorAll('main h1, main h2')];
  for (const heading of headings) {
    const name = [...heading.childNodes].map(node => node.nodeName === 'BR' ? ' ' : node.textContent).join('').replace(/\s+/g, ' ').trim();
    const content = document.createDocumentFragment();
    let wordIndex = 0;

    for (const node of [...heading.childNodes]) {
      if (node.nodeName === 'BR') {
        content.append(node.cloneNode());
        continue;
      }
      for (const token of (node.textContent || '').split(/(\s+)/)) {
        if (!token) continue;
        if (/^\s+$/.test(token)) {
          content.append(document.createTextNode(token));
        } else {
          const mask = document.createElement('span');
          const word = document.createElement('span');
          mask.className = 'reveal-word';
          mask.setAttribute('aria-hidden', 'true');
          mask.style.setProperty('--reveal-delay', `${Math.min(wordIndex, 9) * 65}ms`);
          word.textContent = token;
          mask.append(word);
          content.append(mask);
          wordIndex++;
        }
      }
    }

    heading.replaceChildren(content);
    heading.setAttribute('aria-label', name);
    heading.classList.add('reveal-heading');
  }

  document.documentElement.classList.add('motion-ready');
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: .12 });
  headings.forEach(heading => observer.observe(heading));
})();
