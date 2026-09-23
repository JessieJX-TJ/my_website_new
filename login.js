const PASSWORD = "19092026";
const AUTH_ENABLED = window.__XJ_AUTH_ENABLED__ !== false;

const form = document.querySelector(".login-card");
const input = document.querySelector("#password");
const error = document.querySelector(".login-error");

function safeNext(raw) {
  if (!raw) return "./index.html";
  try {
    const url = new URL(raw, location.origin);
    if (url.origin !== location.origin) return "./index.html";
    const file = url.pathname.split("/").pop() || "index.html";
    if (file.toLowerCase() === "login.html") return "./index.html";
    return url.pathname + url.search + url.hash;
  } catch {
    return "./index.html";
  }
}

if (!AUTH_ENABLED) {
  location.replace("./index.html");
} else if (sessionStorage.getItem("xj-site-auth") === "1") {
  location.replace(safeNext(new URLSearchParams(location.search).get("next")));
}

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!AUTH_ENABLED) {
    location.replace("./index.html");
    return;
  }

  const value = input.value.trim();

  if (value === PASSWORD) {
    sessionStorage.setItem("xj-site-auth", "1");
    error.hidden = true;
    location.replace(safeNext(new URLSearchParams(location.search).get("next")));
    return;
  }

  error.hidden = false;
  form.classList.remove("is-shaking");
  void form.offsetWidth;
  form.classList.add("is-shaking");
  input.select();
});
