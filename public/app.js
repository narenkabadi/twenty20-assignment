async function api(path, method = "GET", body) {
  const res = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

function toast(el, msg, type) {
  el.textContent = msg;
  el.className = `toast ${type}`;
  el.style.display = "block";
  setTimeout(() => (el.style.display = "none"), 2600);
}

async function requireAuth() {
  try {
    const me = await api("/api/me");
    return me.user;
  } catch {
    window.location.href = "/index.html";
    return null;
  }
}

async function doLogout() {
  try {
    await api("/api/logout", "POST");
  } catch {}
  window.location.href = "/index.html";
}
