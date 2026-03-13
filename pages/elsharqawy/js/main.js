// Load order is important: config.js -> i18n.js -> theme.js -> ui.js -> main.js
(function () {
  if (!window.PC || typeof PC.initSite !== "function") return;
  PC.initSite();
})();
