// Link2QR popup — generate a QR from the current tab / given text.
(() => {
  const $ = (id) => document.getElementById(id);
  const canvas = $("qrCanvas");
  const ctx = canvas.getContext("2d");
  const DEFAULTS = { fg: "#18181b", bg: "#ffffff", size: 512 };

  // byte-mode encoding for Chinese / emoji
  qrcode.stringToBytes = qrcode.stringToBytesFuncs["UTF-8"];

  const store = {
    get(key) {
      try {
        if (typeof chrome !== "undefined" && chrome.storage?.local) {
          return new Promise((res) =>
            chrome.storage.local.get(key, (o) => res(o[key])),
          );
        }
        const v = localStorage.getItem("l2qr:" + key);
        return Promise.resolve(v == null ? null : JSON.parse(v));
      } catch {
        return Promise.resolve(null);
      }
    },
    set(obj) {
      try {
        if (typeof chrome !== "undefined" && chrome.storage?.local) {
          chrome.storage.local.set(obj);
          return;
        }
        for (const [k, v] of Object.entries(obj)) {
          localStorage.setItem("l2qr:" + k, JSON.stringify(v));
        }
      } catch {
        /* ignore */
      }
    },
  };

  const state = {
    text: "",
    fg: DEFAULTS.fg,
    bg: DEFAULTS.bg,
    size: DEFAULTS.size,
    fromTab: false,
  };

  function render() {
    const text = state.text.trim();
    $("caption").textContent = text;
    $("caption").title = text;

    if (!text) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      $("emptyHint").hidden = false;
      canvas.style.visibility = "hidden";
      return;
    }
    $("emptyHint").hidden = true;
    canvas.style.visibility = "visible";

    const qr = qrcode(0, "M");
    qr.addData(text);
    qr.make();

    const n = qr.getModuleCount();
    const margin = 4; // quiet zone in modules
    const total = n + margin * 2;
    const cell = Math.max(1, Math.floor(state.size / total));
    canvas.width = cell * total;
    canvas.height = cell * total;

    ctx.fillStyle = state.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = state.fg;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (qr.isDark(r, c)) {
          ctx.fillRect((c + margin) * cell, (r + margin) * cell, cell, cell);
        }
      }
    }
  }

  let timer = null;
  function scheduleRender() {
    clearTimeout(timer);
    timer = setTimeout(render, 120);
  }

  function flash(btn, label) {
    const old = btn.dataset.label || btn.textContent;
    btn.dataset.label = old;
    btn.textContent = label;
    btn.classList.add("ok");
    clearTimeout(btn._t);
    btn._t = setTimeout(() => {
      btn.textContent = btn.dataset.label;
      btn.classList.remove("ok");
    }, 1200);
  }

  function toBlob() {
    return new Promise((res) => canvas.toBlob(res, "image/png"));
  }

  async function initText() {
    const t = new URLSearchParams(location.search).get("t");
    if (t != null && t !== "") {
      document.body.classList.add("page");
      $("sourceChip").textContent = "右键生成";
      return t;
    }
    if (typeof chrome !== "undefined" && chrome.tabs?.query) {
      try {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        if (tab?.url && /^(https?|file|ftp):/.test(tab.url)) {
          $("sourceChip").textContent = "当前页面";
          return tab.url;
        }
      } catch {
        /* fall through */
      }
    }
    $("sourceChip").textContent = "手动输入";
    return "";
  }

  async function init() {
    const [fg, bg, size] = await Promise.all([
      store.get("fg"),
      store.get("bg"),
      store.get("size"),
    ]);
    if (fg) state.fg = fg;
    if (bg) state.bg = bg;
    if (size) state.size = size;
    $("fgColor").value = state.fg;
    $("bgColor").value = state.bg;
    $("sizeSel").value = String(state.size);

    state.text = (await initText()) || "";
    $("textInput").value = state.text;
    render();
  }

  $("textInput").addEventListener("input", (e) => {
    state.text = e.target.value;
    if (!state.fromTab) $("sourceChip").textContent = "自定义内容";
    state.fromTab = true;
    scheduleRender();
  });

  $("fgColor").addEventListener("input", (e) => {
    state.fg = e.target.value;
    store.set({ fg: state.fg });
    render();
  });
  $("bgColor").addEventListener("input", (e) => {
    state.bg = e.target.value;
    store.set({ bg: state.bg });
    render();
  });
  $("sizeSel").addEventListener("change", (e) => {
    state.size = Number(e.target.value);
    store.set({ size: state.size });
    render();
  });

  $("btnDownload").addEventListener("click", async () => {
    if (!state.text.trim()) return;
    const blob = await toBlob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "qrcode.png";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    flash($("btnDownload"), "✓ 已下载");
  });

  $("btnCopyImg").addEventListener("click", async () => {
    if (!state.text.trim()) return;
    try {
      const blob = await toBlob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      flash($("btnCopyImg"), "✓ 已复制");
    } catch {
      flash($("btnCopyImg"), "复制失败");
    }
  });

  $("btnCopyText").addEventListener("click", async () => {
    if (!state.text.trim()) return;
    try {
      await navigator.clipboard.writeText(state.text);
      flash($("btnCopyText"), "✓ 已复制");
    } catch {
      flash($("btnCopyText"), "复制失败");
    }
  });

  init();
})();
