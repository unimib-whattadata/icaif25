(() => {
  const path = window.location.pathname;
  if (!path.endsWith('.html')) return;

  const separator = path.lastIndexOf('/');
  const directory = path.slice(0, separator + 1);
  const slug = path.slice(separator + 1, -5);
  const destination = slug === 'index' ? directory : `${directory}${slug}/`;
  window.location.replace(destination + window.location.search + window.location.hash);
})();
