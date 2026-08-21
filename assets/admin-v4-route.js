(() => {
  try {
    const p = new URLSearchParams(location.search);
    if (p.get('admin') === '1') {
      location.replace('admin-v4.html');
    }
  } catch {}
})();
