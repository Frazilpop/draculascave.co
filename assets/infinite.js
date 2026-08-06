// Infinite scroll: as the reader nears the bottom of a post listing, fetch the
// next /page/N/ and append its articles. Pure enhancement — without JS the
// "Older posts" pagination links work as normal pages.
(function () {
  var nav = document.querySelector('nav.pagination');
  if (!nav || !('IntersectionObserver' in window) || !window.fetch) return;
  var next = nav.querySelector('a[data-next]');
  if (!next) return;

  var loading = false;
  var io = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) load();
  }, { rootMargin: '600px' });
  io.observe(nav);

  function load() {
    if (loading || !next) return;
    loading = true;
    fetch(next.getAttribute('href'))
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.text();
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        doc.querySelectorAll('#content article.post').forEach(function (a) {
          nav.parentNode.insertBefore(a, nav);
        });
        var newNext = doc.querySelector('nav.pagination a[data-next]');
        if (newNext) {
          next.setAttribute('href', newNext.getAttribute('href'));
          loading = false;
          io.unobserve(nav);
          io.observe(nav); // re-check: still near the bottom?
        } else {
          io.disconnect(); // reached 2013 — nothing older
          nav.remove();
          next = null;
        }
      })
      .catch(function () {
        // network hiccup: stop auto-loading, leave the links clickable
        io.disconnect();
        loading = false;
      });
  }
})();
