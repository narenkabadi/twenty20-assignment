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

// Try to fetch the currently authenticated user from the API. When the API
// fails (e.g. because the backend is not configured), fall back to a user
// persisted in localStorage. This allows the frontend to operate without
// a database during development or if environment variables are missing.
async function requireAuth() {
  try {
    const me = await api("/api/me");
    return me.user;
  } catch {
    // Fallback: read user from localStorage if present
    const stored = localStorage.getItem('t20_user');
    if (stored) {
      const user = JSON.parse(stored);
      if (user && user.email) {
        return user;
      }
    }
    window.location.href = "/index.html";
    return null;
  }
}

// Remove the current user's session. Attempt to call the API logout
// endpoint, but always clear any locally stored user so that the
// application resets cleanly on logout.
async function doLogout() {
  try {
    await api("/api/logout", "POST");
  } catch {}
  // Also clear the locally stored user data
  localStorage.removeItem('t20_user');
  window.location.href = "/index.html";
}

// Persist user registration locally when the API is unavailable. The full
// user record is stored so that optional fields (phone, github, linkedin)
// are available for later display in the Portfolio/Contact pages.
function localRegister(user) {
  localStorage.setItem('t20_user', JSON.stringify(user));
}

// Authenticate against the locally stored user record. If the email and
// password match, return the user; otherwise return null.
function localLogin(email, password) {
  const stored = localStorage.getItem('t20_user');
  if (!stored) return null;
  try {
    const user = JSON.parse(stored);
    if (user.email === email && user.password === password) {
      return user;
    }
  } catch {
    // ignore JSON parse errors
  }
  return null;
}
