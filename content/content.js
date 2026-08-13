// BooruBrapper – on-page floating panel for soybooru.com

(function () {
  if (window.__boorubrapperLoaded) return;
  window.__boorubrapperLoaded = true;

  const TAGS = [
    { label: "B", open: "[b]", close: "[/b]", title: "Bold" },
    { label: "I", open: "[i]", close: "[/i]", title: "Italic" },
    { label: "U", open: "[u]", close: "[/u]", title: "Underline" },
    { label: "S", open: "[s]", close: "[/s]", title: "Strikethrough" },
    { label: ">", open: ">", close: "", title: "Greentext (line prefix)", single: true },
    { label: "GT", open: "[greentext]", close: "[/greentext]", title: "Greentext tag" },
    { label: "==", open: "==", close: "==", title: "Redtext" },
    { label: "RT", open: "[redtext]", close: "[/redtext]", title: "Redtext tag" },
    { label: "<", open: "<", close: "", title: "Orangetext (line prefix)", single: true },
    { label: "OT", open: "[orangetext]", close: "[/orangetext]", title: "Orangetext tag" },
    { label: "BT", open: "[bluetext]", close: "[/bluetext]", title: "Bluetext" },
    { label: "Sp", open: "[spoiler]", close: "[/spoiler]", title: "Spoiler" },
    { label: "Code", open: "[code]", close: "[/code]", title: "Code" },
    { label: "Q", open: "[quote]", close: "[/quote]", title: "Quote" },
    { label: "URL", open: "[url]", close: "[/url]", title: "URL" },
    { label: "Thumb", open: "[thumb]", close: "[/thumb]", title: "Thumb (post ID)" },
    { label: "H1", open: "[h1]", close: "[/h1]", title: "Heading 1" },
    { label: "H2", open: "[h2]", close: "[/h2]", title: "Heading 2" },
    { label: "H3", open: "[h3]", close: "[/h3]", title: "Heading 3" },
  ];

  function getPostId() {
    const m = location.pathname.match(/\/post\/view\/(\d+)/);
    return m ? m[1] : null;
  }

  function bbToHtml(text) {
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const rules = [
      [/\[b\]([\s\S]*?)\[\/b\]/gi, '<span class="ezc-b">$1</span>'],
      [/\[i\]([\s\S]*?)\[\/i\]/gi, '<span class="ezc-i">$1</span>'],
      [/\[u\]([\s\S]*?)\[\/u\]/gi, '<span class="ezc-u">$1</span>'],
      [/\[s\]([\s\S]*?)\[\/s\]/gi, '<span class="ezc-s">$1</span>'],
      [/\[greentext\]([\s\S]*?)\[\/greentext\]/gi, '<span class="ezc-green">&gt;$1</span>'],
      [/^&gt;(.*)$/gm, '<span class="ezc-green">&gt;$1</span>'],
      [/\[redtext\]([\s\S]*?)\[\/redtext\]/gi, '<span class="ezc-red">$1</span>'],
      [/==([\s\S]*?)==/g, '<span class="ezc-red">$1</span>'],
      [/\[orangetext\]([\s\S]*?)\[\/orangetext\]/gi, '<span class="ezc-orange">&lt;$1</span>'],
      [/^&lt;(.*)$/gm, '<span class="ezc-orange">&lt;$1</span>'],
      [/\[bluetext\]([\s\S]*?)\[\/bluetext\]/gi, '<span class="ezc-blue">$1</span>'],
      [/\[spoiler\]([\s\S]*?)\[\/spoiler\]/gi, '<span class="ezc-spoiler">$1</span>'],
      [/\[code\]([\s\S]*?)\[\/code\]/gi, '<span class="ezc-code">$1</span>'],
      [/\[quote\]([\s\S]*?)\[\/quote\]/gi, '<div class="ezc-quote">$1</div>'],
      [/\[url\]([\s\S]*?)\[\/url\]/gi, '<a href="$1" class="ezc-link">$1</a>'],
      [/\[url=([^\]]+)\]([\s\S]*?)\[\/url\]/gi, '<a href="$1" class="ezc-link">$2</a>'],
      [/\[thumb\](\d+)\[\/thumb\]/gi, '<span class="ezc-thumb">[thumb $1]</span>'],
      [/\[h1\]([\s\S]*?)\[\/h1\]/gi, '<div class="ezc-h1">$1</div>'],
      [/\[h2\]([\s\S]*?)\[\/h2\]/gi, '<div class="ezc-h2">$1</div>'],
      [/\[h3\]([\s\S]*?)\[\/h3\]/gi, '<div class="ezc-h3">$1</div>'],
    ];
    rules.forEach(([re, rep]) => { html = html.replace(re, rep); });
    return html;
  }

  const panel = document.createElement("div");
  panel.id = "boorubrapper-panel";
  panel.innerHTML = `
    <div class="ezc-header">
      <strong>BooruBrapper</strong>
      <span class="ezc-sub">Soybooru Spammer</span>
      <button type="button" class="ezc-minimize" title="Minimize">−</button>
      <button type="button" class="ezc-close" title="Close">×</button>
    </div>
    <div class="ezc-body">
      <div class="ezc-toolbar"></div>
      <textarea class="ezc-editor" placeholder="Write your comment…&#10;Use buttons above or type BBCode.&#10;Post uses your login session."></textarea>
      <div class="ezc-preview-label">Preview</div>
      <div class="ezc-preview"></div>
      <div class="ezc-repeat">
        <label title="How many times to post this same comment">Post <input type="number" class="ezc-count" value="1" min="1" max="50" step="1" /> times</label>
        <label title="Delay between each post in seconds">Delay <input type="number" class="ezc-delay" value="1.2" min="0" max="60" step="0.1" /> s</label>
      </div>
      <div class="ezc-actions">
        <button type="button" class="ezc-btn-post">Brap Comments</button>
        <button type="button" class="ezc-btn-clear">Ack</button>
      </div>
      <div class="ezc-status"></div>
    </div>
  `;
  document.body.appendChild(panel);

  const fab = document.createElement("button");
  fab.id = "boorubrapper-fab";
  fab.textContent = "BB";
  fab.title = "Open BooruBrapper";
  document.body.appendChild(fab);

  const toolbar = panel.querySelector(".ezc-toolbar");
  const editor = panel.querySelector(".ezc-editor");
  const preview = panel.querySelector(".ezc-preview");
  const statusEl = panel.querySelector(".ezc-status");

  TAGS.forEach((tag) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = tag.label;
    btn.title = tag.title;
    btn.addEventListener("click", () => applyTag(tag));
    toolbar.appendChild(btn);
  });

  function applyTag(tag) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = editor.value.substring(start, end);
    let insertion;
    if (tag.single) {
      insertion = tag.open + (selected || "text");
    } else {
      insertion = tag.open + (selected || "text") + tag.close;
    }
    editor.setRangeText(insertion, start, end, "select");
    if (!selected) {
      const openLen = tag.open.length;
      editor.setSelectionRange(start + openLen, start + openLen + 4);
    }
    editor.focus();
    updatePreview();
  }

  function updatePreview() {
    preview.innerHTML = bbToHtml(editor.value) ||
      '<span style="color:#71717a">preview…</span>';
  }

  function setStatus(msg, type) {
    statusEl.textContent = msg || "";
    statusEl.className = "ezc-status" + (type ? " " + type : "");
  }

  editor.addEventListener("input", updatePreview);

  try {
    const draft = localStorage.getItem("boorubrapper_draft");
    if (draft) {
      editor.value = draft;
      updatePreview();
    }
    const savedCount = localStorage.getItem("boorubrapper_count");
    const savedDelay = localStorage.getItem("boorubrapper_delay");
    const countEl = panel.querySelector(".ezc-count");
    const delayEl = panel.querySelector(".ezc-delay");
    if (savedCount && countEl) {
      const n = parseInt(savedCount, 10);
      if (Number.isFinite(n) && n >= 1 && n <= 50) countEl.value = String(n);
    }
    if (savedDelay && delayEl) {
      const d = parseFloat(savedDelay);
      if (Number.isFinite(d) && d >= 0 && d <= 60) delayEl.value = String(d);
    }
  } catch (_) {}

  editor.addEventListener("input", () => {
    try { localStorage.setItem("boorubrapper_draft", editor.value); } catch (_) {}
  });

  panel.querySelector(".ezc-btn-clear").addEventListener("click", () => {
    editor.value = "";
    updatePreview();
    try { localStorage.removeItem("boorubrapper_draft"); } catch (_) {}
    setStatus("Cleared");
  });

  panel.querySelector(".ezc-close").addEventListener("click", () => {
    panel.classList.remove("ezc-open");
    fab.style.display = "flex";
  });

  panel.querySelector(".ezc-minimize").addEventListener("click", () => {
    panel.classList.toggle("ezc-minimized");
  });

  fab.addEventListener("click", () => {
    panel.classList.add("ezc-open");
    fab.style.display = "none";
    editor.focus();
  });

  function extractErrorMessage(data, status, statusText) {
    if (!data || typeof data !== "object") {
      return statusText ? `HTTP ${status} ${statusText}` : `HTTP ${status}`;
    }
    const candidates = [
      data.message,
      data.error,
      data.detail,
      data.title,
      typeof data.error === "object" && data.error && data.error.message,
      Array.isArray(data.errors) && data.errors.map(e =>
        typeof e === "string" ? e : (e && (e.message || e.msg) || JSON.stringify(e))
      ).filter(Boolean).join("; "),
      data.errors && typeof data.errors === "object" && !Array.isArray(data.errors)
        && Object.entries(data.errors).map(([k, v]) =>
          `${k}: ${Array.isArray(v) ? v.join(", ") : v}`
        ).join("; "),
    ];
    for (const c of candidates) {
      if (c && typeof c === "string" && c.trim()) return c.trim();
    }
    try {
      const s = JSON.stringify(data);
      if (s && s !== "{}") return s.length > 180 ? s.slice(0, 180) + "…" : s;
    } catch (_) {}
    return statusText ? `HTTP ${status} ${statusText}` : `HTTP ${status}`;
  }

  function getAuthToken() {
    try {
      return localStorage.getItem("auth_token") || null;
    } catch (_) {
      return null;
    }
  }

  // window.Integrity lives in the *page* JS world, not the content-script isolate.
  // Prefer Firefox wrappedJSObject; fall back to injected page script + postMessage.
  function getIntegrityTokenOnce() {
    return new Promise((resolve) => {
      const done = (v) => resolve(v || null);
      const timeout = setTimeout(() => done(null), 8000);

      // 1) Firefox Xray / wrappedJSObject path
      try {
        const pageWin = window.wrappedJSObject || window;
        if (pageWin.Integrity && typeof pageWin.Integrity.check === "function") {
          Promise.resolve(pageWin.Integrity.check()).then(
            (token) => { clearTimeout(timeout); done(token); },
            (err) => {
              console.warn("[BooruBrapper] Integrity.check (wrapped) failed", err);
              injectFallback();
            }
          );
          return;
        }
      } catch (e) {
        console.warn("[BooruBrapper] wrappedJSObject path failed", e);
      }

      injectFallback();

      function injectFallback() {
        const id = "boorubrapper_integrity_" + Math.random().toString(36).slice(2);
        function onMsg(ev) {
          if (!ev.data || ev.data.source !== "boorubrapper" || ev.data.id !== id) return;
          clearTimeout(timeout);
          window.removeEventListener("message", onMsg);
          done(ev.data.token);
        }
        window.addEventListener("message", onMsg);

        try {
          const script = document.createElement("script");
          script.textContent =
            "(async function(){var t=null;try{if(window.Integrity&&typeof window.Integrity.check===\"function\"){t=await window.Integrity.check();}}catch(e){console.warn(e);}" +
            "window.postMessage({source:\"boorubrapper\",id:\"" + id + "\",token:t},\"*\");})();";
          (document.documentElement || document.head).appendChild(script);
          script.remove();
        } catch (e) {
          console.warn("[BooruBrapper] inject failed", e);
          clearTimeout(timeout);
          done(null);
        }
      }
    });
  }

  // Generate a fresh integrity token, retrying a few times if needed.
  // Each successful call should produce a one-shot token usable for a single post.
  async function getIntegrityToken(maxAttempts) {
    const attempts = maxAttempts || 3;
    for (let a = 1; a <= attempts; a++) {
      try {
        const token = await getIntegrityTokenOnce();
        if (token) return token;
      } catch (e) {
        console.warn("[BooruBrapper] integrity attempt", a, e);
      }
      if (a < attempts) await sleep(400);
    }
    return null;
  }

  async function postOnce(text, postId, token, origin, integrity) {
    if (!integrity) {
      try {
        integrity = await getIntegrityToken();
      } catch (e) {
        console.warn("[BooruBrapper] integrity error", e);
      }
    }

    if (!integrity) {
      return { ok: false, msg: "Security token missing – refresh the page and wait a few seconds", fatal: true };
    }

    const attempts = [];
    if (token) {
      attempts.push({
        label: "auth",
        url: new URL(`/api/booru/posts/${postId}/comments`, origin).href,
        body: { content: text, isAnonymous: false, "integrity-v3": integrity },
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    }
    attempts.push({
      label: "anonymous",
      url: new URL(`/api/anonymous/posts/${postId}/comments`, origin).href,
      body: { content: text, captchaToken: "", "integrity-v3": integrity },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    if (token) {
      attempts.push({
        label: "auth-minimal",
        url: new URL(`/api/booru/posts/${postId}/comments`, origin).href,
        body: { content: text, "integrity-v3": integrity },
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    }

    let lastMsg = null;
    let lastStatus = null;

    for (const attempt of attempts) {
      if (attempt !== attempts[0]) {
        const fresh = await getIntegrityToken();
        if (fresh) attempt.body["integrity-v3"] = fresh;
      }

      let res;
      try {
        res = await fetch(attempt.url, {
          method: "POST",
          credentials: "include",
          headers: attempt.headers,
          body: JSON.stringify(attempt.body),
        });
      } catch (err) {
        lastMsg = err && err.message
          ? `Network error: ${err.message}`
          : "Network error – check connection";
        console.error("[BooruBrapper] fetch failed", attempt.label, err);
        continue;
      }

      const rawText = await res.text().catch(() => "");
      let data = {};
      if (rawText) {
        try { data = JSON.parse(rawText); } catch (_) {
          data = { message: rawText.slice(0, 200) };
        }
      }

      if (res.ok) {
        return { ok: true };
      }

      const msg = extractErrorMessage(data, res.status, res.statusText);
      lastMsg = msg;
      lastStatus = res.status;
      console.warn("[BooruBrapper] API error", attempt.label, res.status, data);

      if (res.status === 449) {
        return { ok: false, msg: "Page security check pending – refresh and try again", fatal: true };
      }

      if (
        data.error === "captcha_required" ||
        /captcha/i.test(String(msg))
      ) {
        return { ok: false, msg: "Captcha required – complete it on the page or log in", fatal: true };
      }

      if (
        data.error === "integrity_token_missing" ||
        /integrity/i.test(String(msg))
      ) {
        continue;
      }

      if (res.status === 401 || res.status === 403) {
        continue;
      }
      if (res.status === 400 || res.status === 422) {
        continue;
      }
      if (res.status >= 500) {
        return { ok: false, msg: `Server error (${res.status}): ${msg}`, fatal: true };
      }
    }

    if (lastMsg && /integrity/i.test(String(lastMsg))) {
      return { ok: false, msg: "Integrity token rejected – refresh the page fully and retry", fatal: true };
    }
    if (lastStatus === 401 || lastStatus === 403) {
      return {
        ok: false,
        msg: lastMsg || "Auth failed – refresh after logging in",
        fatal: true,
      };
    }
    return {
      ok: false,
      msg: lastMsg ? `${lastMsg}${lastStatus ? ` (${lastStatus})` : ""}` : "Post failed",
      fatal: false,
    };
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async function postComment() {
    const text = editor.value.trim();
    if (!text) {
      setStatus("Nothing to post", "error");
      return;
    }
    const postId = getPostId();
    if (!postId) {
      setStatus("Could not detect post ID from URL", "error");
      return;
    }

    const countInput = panel.querySelector(".ezc-count");
    const delayInput = panel.querySelector(".ezc-delay");
    let count = parseInt(countInput && countInput.value, 10);
    if (!Number.isFinite(count) || count < 1) count = 1;
    if (count > 50) count = 50;
    if (countInput) countInput.value = String(count);

    let delaySec = parseFloat(delayInput && delayInput.value);
    if (!Number.isFinite(delaySec) || delaySec < 0) delaySec = 1.2;
    if (delaySec > 60) delaySec = 60;
    if (delayInput) delayInput.value = String(delaySec);
    const delayMs = Math.round(delaySec * 1000);

    try {
      localStorage.setItem("boorubrapper_count", String(count));
      localStorage.setItem("boorubrapper_delay", String(delaySec));
    } catch (_) {}

    const postBtn = panel.querySelector(".ezc-btn-post");
    postBtn.disabled = true;
    if (countInput) countInput.disabled = true;
    if (delayInput) delayInput.disabled = true;

    const token = getAuthToken();
    const origin = location.origin;
    let succeeded = 0;

    try {
      for (let i = 1; i <= count; i++) {
        setStatus(
          count === 1
            ? "Generating security token…"
            : `Generating token ${i}/${count}…`
        );
        let integrity = null;
        try {
          integrity = await getIntegrityToken(3);
        } catch (e) {
          console.warn("[BooruBrapper] token gen error", e);
        }
        if (!integrity) {
          const prefix = count > 1 ? `Stopped after ${succeeded}/${count}. ` : "";
          setStatus(
            prefix + "Security token missing – refresh the page and wait a few seconds",
            "error"
          );
          return;
        }

        setStatus(count === 1 ? "Posting…" : `Posting ${i}/${count}…`);
        const result = await postOnce(text, postId, token, origin, integrity);
        if (result.ok) {
          succeeded++;
          if (i < count) {
            setStatus(
              delayMs > 0
                ? `Posted ${succeeded}/${count} – waiting ${delaySec}s…`
                : `Posted ${succeeded}/${count}…`,
              "ok"
            );
            if (delayMs > 0) await sleep(delayMs);
          }
        } else {
          const prefix = count > 1 ? `Stopped after ${succeeded}/${count}. ` : "";
          setStatus(prefix + (result.msg || "Post failed"), "error");
          return;
        }
      }

      if (succeeded === count) {
        setStatus(
          count === 1 ? "Posted! Reloading…" : `Posted ${count} times! Reloading…`,
          "ok"
        );
        try { localStorage.removeItem("boorubrapper_draft"); } catch (_) {}
        editor.value = "";
        updatePreview();
        setTimeout(() => location.reload(), 700);
      }
    } finally {
      postBtn.disabled = false;
      if (countInput) countInput.disabled = false;
      if (delayInput) delayInput.disabled = false;
    }
  }

  panel.querySelector(".ezc-btn-post").addEventListener("click", postComment);

  // Open panel immediately on post pages
  panel.classList.add("ezc-open");
  fab.style.display = "none";
  updatePreview();

  // Toolbar icon can toggle
  if (typeof browser !== "undefined" && browser.runtime) {
    browser.runtime.onMessage.addListener((msg) => {
      if (msg.action === "togglePanel") {
        if (panel.classList.contains("ezc-open")) {
          panel.classList.remove("ezc-open");
          fab.style.display = "flex";
        } else {
          panel.classList.add("ezc-open");
          fab.style.display = "none";
        }
      }
    });
  }
})();
