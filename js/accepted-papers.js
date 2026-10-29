(() => {
  'use strict';
  const input = document.getElementById('paper-search');
  if (!input) return;
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const groups = [...document.querySelectorAll('[data-paper-group]')].map(element => ({
    element,
    papers: [...element.querySelectorAll('[data-paper]')].map(element => ({ element, text: normalize(element.textContent) })),
  }));
  const total = groups.reduce((count, group) => count + group.papers.length, 0);
  const status = document.getElementById('paper-search-status');
  const filter = () => {
    const terms = normalize(input.value.trim()).split(/\s+/).filter(Boolean);
    let visible = 0;
    for (const group of groups) {
      let count = 0;
      for (const paper of group.papers) {
        paper.element.hidden = !terms.every(term => paper.text.includes(term));
        if (!paper.element.hidden) count += 1;
      }
      visible += count;
      group.element.querySelector('[data-group-count]').textContent = `${count} ${count === 1 ? 'paper' : 'papers'}`;
      group.element.querySelector('[data-group-empty]').hidden = count > 0;
    }
    status.textContent = terms.length ? `Showing ${visible} of ${total} papers` : `${total} papers`;
  };
  input.addEventListener('input', filter);
  // A bookmarked paper remains reachable after a search in the current visit.
  window.addEventListener('hashchange', () => {
    const paper = document.getElementById(location.hash.slice(1));
    if (paper?.matches('[data-paper]') && paper.hidden) {
      input.value = '';
      filter();
      paper.scrollIntoView();
    }
  });
  filter();
  document.getElementById('paper-search-panel').hidden = false;
})();
