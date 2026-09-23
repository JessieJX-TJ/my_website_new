(function () {
  // Set to true to require login again.
  window.__XJ_AUTH_ENABLED__ = false;

  if (!window.__XJ_AUTH_ENABLED__) return;

  const file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  if (file === "login.html") return;
  if (sessionStorage.getItem("xj-site-auth") === "1") return;

  const next = location.pathname + location.search + location.hash;
  location.replace("./login.html?next=" + encodeURIComponent(next));
})();
