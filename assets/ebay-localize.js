// Point eBay links at the visitor's local marketplace (by browser language).
// Content links canonically use www.ebay.com; this swaps the domain so UK
// readers get ebay.co.uk etc. EPN Smart Links adds tracking at click time.
(function () {
  var map = {
    'en-gb': 'www.ebay.co.uk',
    'en-ie': 'www.ebay.ie',
    'en-au': 'www.ebay.com.au',
    'en-ca': 'www.ebay.ca',
    'fr-ca': 'www.ebay.ca',
    'de': 'www.ebay.de',
    'de-de': 'www.ebay.de',
    'de-at': 'www.ebay.at',
    'de-ch': 'www.ebay.ch',
    'fr': 'www.ebay.fr',
    'fr-fr': 'www.ebay.fr',
    'fr-be': 'www.befr.ebay.be',
    'it': 'www.ebay.it',
    'it-it': 'www.ebay.it',
    'es': 'www.ebay.es',
    'es-es': 'www.ebay.es',
    'nl': 'www.ebay.nl',
    'nl-nl': 'www.ebay.nl',
    'nl-be': 'www.benl.ebay.be',
    'pl': 'www.ebay.pl',
    'pl-pl': 'www.ebay.pl'
  };
  var lang = (navigator.language || '').toLowerCase();
  var host = map[lang] || map[lang.split('-')[0]];
  if (!host) return; // en-US and everyone else: stay on ebay.com

  document.querySelectorAll('a[href^="https://www.ebay.com/"]').forEach(function (a) {
    try {
      var u = new URL(a.href);
      u.hostname = host;
      a.href = u.href;
    } catch (e) { /* leave the link alone */ }
  });
})();
