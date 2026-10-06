(() => {
  const API_KEY = "AIzaSyAElo858z5FEHm-l0WzPCnTv5oVZ4H76rk";
  const AUTH_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`;
  const TOKEN_URL = `https://securetoken.googleapis.com/v1/token?key=${API_KEY}`;

  async function parseResponse(response) {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const code = data.error?.message;
      const messages = {
        INVALID_LOGIN_CREDENTIALS: "Email or password is incorrect.",
        EMAIL_NOT_FOUND: "No account exists for this email.",
        INVALID_PASSWORD: "Email or password is incorrect.",
        USER_DISABLED: "This account has been disabled.",
        TOO_MANY_ATTEMPTS_TRY_LATER: "Too many attempts. Try again later.",
      };
      throw new Error(messages[code] || "Firebase sign-in failed. Check your credentials and try again.");
    }
    return data;
  }

  async function signIn(email, password) {
    const response = await fetch(AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    });
    const data = await parseResponse(response);
    await chrome.storage.local.set({
      buddyEmail: data.email || email,
      buddyRefreshToken: data.refreshToken,
      buddyIdToken: data.idToken,
      buddyTokenExpiresAt: Date.now() + Number(data.expiresIn || 3600) * 1000,
    });
    return data.email || email;
  }

  async function getIdToken() {
    const stored = await chrome.storage.local.get([
      "buddyIdToken",
      "buddyRefreshToken",
      "buddyTokenExpiresAt",
    ]);
    if (!stored.buddyRefreshToken) throw new Error("Sign in to your Interview AI account first.");
    if (stored.buddyIdToken && stored.buddyTokenExpiresAt > Date.now() + 60000) {
      return stored.buddyIdToken;
    }

    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: stored.buddyRefreshToken,
      }),
    });
    const data = await parseResponse(response);
    await chrome.storage.local.set({
      buddyIdToken: data.id_token,
      buddyRefreshToken: data.refresh_token || stored.buddyRefreshToken,
      buddyTokenExpiresAt: Date.now() + Number(data.expires_in || 3600) * 1000,
    });
    return data.id_token;
  }

  async function signOut() {
    await chrome.storage.local.remove([
      "buddyEmail",
      "buddyRefreshToken",
      "buddyIdToken",
      "buddyTokenExpiresAt",
    ]);
  }

  window.BuddyAuth = { signIn, getIdToken, signOut };
})();
