const storageKey = "petshop_theme";
const listeners = new Set();

function readTheme() {
  try {
    return localStorage.getItem(storageKey) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

let theme = readTheme();

function applyTheme() {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#111b24" : "#087f83");
}

applyTheme();

export function getTheme() {
  return theme;
}

export function subscribeTheme(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function toggleTheme() {
  theme = theme === "dark" ? "light" : "dark";
  try {
    localStorage.setItem(storageKey, theme);
  } catch {
    // Keep the toggle usable when browser storage is unavailable.
  }
  applyTheme();
  listeners.forEach((listener) => listener());
}

window.addEventListener("storage", (event) => {
  if (event.key === storageKey || event.key === null) {
    theme = readTheme();
    applyTheme();
    listeners.forEach((listener) => listener());
  }
});
