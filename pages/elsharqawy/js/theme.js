(function () {
  window.PC = window.PC || {};

  PC.STORAGE_THEME = "pc_theme";

  PC.detectSystemTheme = function detectSystemTheme() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  PC.applyTheme = function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);

    var themeToggle = document.getElementById("themeToggle");
    var icon = themeToggle && themeToggle.querySelector(".toggle__icon");
    if (icon) icon.textContent = theme === "dark" ? "☾" : "☀";
  };
})();
