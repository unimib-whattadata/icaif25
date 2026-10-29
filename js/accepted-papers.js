(() => {
  'use strict';
  const input = document.getElementById('paper-search');
  if (!input) return;
  const categorySelect = document.getElementById('paper-category');
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const groups = [...document.querySelectorAll('[data-paper-group]')].map(element => ({
    element,
    id: element.dataset.category,
    shortLabel: categorySelect.querySelector(`option[value="${element.dataset.category}"]`).textContent.replace(/ \(\d+\)$/, ''),
    papers: [...element.querySelectorAll('[data-paper]')].map(element => ({ element, text: normalize(element.textContent) })),
  }));
  const total = groups.reduce((count, group) => count + group.papers.length, 0);
  const status = document.getElementById('paper-search-status');
  const resetButtons = [...document.querySelectorAll('[data-paper-reset]')];
  let category = 'all';

  // Static category anchors remain usable without JavaScript.
  document.querySelectorAll('a[data-paper-filter]').forEach(link => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.paperFilter = link.dataset.paperFilter;
    button.append(...link.childNodes);
    link.replaceWith(button);
  });
  const categoryButtons = [...document.querySelectorAll('button[data-paper-filter]')];
  const filter = () => {
    const terms = normalize(input.value.trim()).split(/\s+/).filter(Boolean);
    let visible = 0;
    let queryMatches = 0;
    for (const group of groups) {
      let count = 0;
      let matching = 0;
      for (const paper of group.papers) {
        const matches = terms.every(term => paper.text.includes(term));
        if (matches) matching += 1;
        paper.element.hidden = !matches || (category !== 'all' && category !== group.id);
        if (!paper.element.hidden) count += 1;
      }
      visible += count;
      queryMatches += matching;
      group.element.hidden = count === 0;
      group.element.querySelector('[data-group-count]').textContent = `${count} ${count === 1 ? 'paper' : 'papers'}`;
      document.querySelector(`[data-category-count="${group.id}"]`).textContent = matching;
      categorySelect.querySelector(`option[value="${group.id}"]`).textContent = `${group.shortLabel} (${matching})`;
    }
    document.querySelector('[data-category-count="all"]').textContent = queryMatches;
    categorySelect.querySelector('option[value="all"]').textContent = `All papers (${queryMatches})`;
    categorySelect.value = category;
    categoryButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.paperFilter === category)));
    resetButtons.forEach(button => { button.disabled = !terms.length && category === 'all'; });
    status.textContent = !terms.length && category === 'all' ? `${total} papers` : `${visible} of ${total} papers`;
    document.getElementById('papers-empty').hidden = visible > 0;
  };
  const chooseCategory = value => {
    category = value;
    filter();
    document.getElementById('paper-results').scrollIntoView({ block: 'start', behavior: 'instant' });
  };
  categoryButtons.forEach(button => button.addEventListener('click', () => chooseCategory(button.dataset.paperFilter)));
  categorySelect.addEventListener('change', () => chooseCategory(categorySelect.value));
  input.addEventListener('input', filter);
  resetButtons.forEach(button => button.addEventListener('click', () => {
    input.value = '';
    category = 'all';
    filter();
    input.focus({ preventScroll: true });
  }));
  const revealHash = () => {
    const target = document.getElementById(location.hash.slice(1));
    const group = target?.closest('[data-paper-group]');
    if (group) {
      if (group.hidden || target.hidden) {
        input.value = '';
        category = 'all';
        filter();
      }
      target.scrollIntoView({ block: 'start', behavior: 'instant' });
      if (target.matches('[data-paper]')) target.focus({ preventScroll: true });
    }
  };
  window.addEventListener('hashchange', revealHash);
  filter();
  document.getElementById('paper-search-panel').hidden = false;
  document.querySelector('[data-all-papers]').hidden = false;
  document.querySelector('.papers-mobile-category').hidden = false;
  document.getElementById('paper-controls').classList.add('is-enhanced');
  const measureControls = () => {
    const height = document.getElementById('paper-controls').getBoundingClientRect().height;
    document.querySelector('main').style.setProperty('--papers-controls-height', `${height}px`);
  };
  new ResizeObserver(measureControls).observe(document.getElementById('paper-controls'));
  measureControls();
  revealHash();
})();
