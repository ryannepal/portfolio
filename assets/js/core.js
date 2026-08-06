/* ==========================================================================
   core.js — shared plumbing for every page
   --------------------------------------------------------------------------
   You do NOT need to edit this file to update your portfolio.
   All of your content lives in content.json.
   ========================================================================== */

(function () {
  "use strict";

  /* ---------------------------------------------------------------- helpers */

  /** Create an element. h("div", {class:"x"}, "text", childEl) */
  function h(tag, attrs, ...kids) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v === null || v === undefined || v === false) continue;
        if (k === "class") node.className = v;
        else if (k === "text") node.textContent = v;
        else if (k === "html") node.innerHTML = v;
        else if (k.startsWith("on") && typeof v === "function") {
          node.addEventListener(k.slice(2).toLowerCase(), v);
        } else node.setAttribute(k, v);
      }
    }
    for (const kid of kids.flat()) {
      if (kid === null || kid === undefined || kid === false) continue;
      node.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
    }
    return node;
  }

  /** A small uppercase drafting label. */
  function mono(text, extraClass) {
    return h("div", { class: "mono" + (extraClass ? " " + extraClass : ""), text: text });
  }

  /** True for values that should be treated as "not filled in". */
  function blank(v) {
    return v === null || v === undefined || (typeof v === "string" && v.trim() === "");
  }

  /** Always returns an array (tolerates a single string in content.json). */
  function arr(v) {
    if (Array.isArray(v)) return v.filter((x) => !blank(x));
    if (blank(v)) return [];
    return [v];
  }

  /** Turn "Rebuild of a Salvage 2008 Mazda3" into "rebuild-of-a-salvage-2008-mazda3" */
  function slugify(s) {
    return String(s).toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  /** Zero-padded project number: 1 -> "01" */
  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  /* ------------------------------------------------------------ image paths */

  /**
   * Work out where a photo lives.
   *  "headshot.jpg"                -> "images/profile/headshot.jpg"  (subdir)
   *  "images/projects/a.jpg"       -> used as-is
   *  "https://example.com/a.jpg"   -> used as-is
   * Always relative, so it works at a repo root OR at /username.github.io/repo/.
   */
  function imgPath(file, subdir) {
    if (blank(file)) return "";
    const f = String(file).trim();
    if (/^(https?:)?\/\//i.test(f) || f.startsWith("data:")) return f;
    if (f.includes("/")) return f.replace(/^\/+/, "");
    return "images/" + subdir + "/" + f;
  }

  /** The tasteful stand-in shown when a photo hasn't been added yet. */
  function placeholder(file, label) {
    return h("div", { class: "ph", "aria-hidden": "true" },
      h("div", { class: "ph-mark", text: "+" }),
      h("div", { class: "mono-sm mono", text: label || "Image pending" }),
      blank(file) ? null : h("div", { class: "ph-file", text: String(file) })
    );
  }

  /**
   * Put a photo inside `mount`. If the filename is empty, or the file is not
   * on disk yet, a neutral placeholder is shown instead of a broken image.
   */
  function fillMedia(mount, file, alt, opts) {
    opts = opts || {};
    const subdir = opts.subdir || "projects";
    const label = opts.label || "Image pending";
    const src = imgPath(file, subdir);

    if (!src) {
      mount.append(placeholder(file, label));
      return null;
    }

    const img = h("img", {
      src: src,
      alt: blank(alt) ? "" : alt,
      loading: opts.eager ? "eager" : "lazy",
      decoding: "async"
    });
    img.addEventListener("error", function () {
      mount.textContent = "";
      mount.append(placeholder(file, "Image not found"));
    });
    mount.append(img);
    return img;
  }

  /** figure caption line: "— FIG. 3 — ASSEMBLED ROVER" */
  function figCaption(text) {
    return h("div", { class: "fig-caption" }, mono(text));
  }

  /* ----------------------------------------------------------------- themes */

  const THEME_KEY = "rn-portfolio-theme";

  function applyTheme(mode) {
    document.documentElement.setAttribute("data-theme", mode);
    const btn = document.getElementById("theme-toggle");
    if (btn) {
      const night = mode === "night";
      btn.querySelector("[data-theme-label]").textContent = night ? "Day" : "Night";
      btn.setAttribute("aria-pressed", night ? "true" : "false");
      btn.setAttribute("aria-label", night ? "Switch to day mode" : "Switch to night mode");
    }
  }

  function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) { /* private mode */ }
    applyTheme(saved || "day");
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      const next = document.documentElement.getAttribute("data-theme") === "night" ? "day" : "night";
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
    });
  }

  /* ------------------------------------------------------------ scroll reveal */

  function initReveal(root) {
    const targets = (root || document).querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      targets.forEach((t) => t.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = Number(el.dataset.revealDelay || 0);
        setTimeout(() => el.classList.add("is-in"), delay);
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.06 });
    targets.forEach((t) => io.observe(t));
  }

  /* ---------------------------------------------------------------- nav bits */

  function initNav() {
    const nav = document.querySelector(".nav");
    const toggle = document.querySelector(".nav-toggle");
    const links = document.querySelector(".nav-links");

    if (toggle && links) {
      toggle.addEventListener("click", function () {
        const open = links.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      links.addEventListener("click", function (e) {
        if (e.target.closest("a")) {
          links.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }

    if (nav) {
      const onScroll = () => nav.classList.toggle("is-stuck", window.scrollY > 8);
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }

  /** Highlights the nav item for whichever section is on screen. */
  function initActiveNav() {
    const items = Array.from(document.querySelectorAll(".nav-links a[href^='#']"));
    if (!items.length || !("IntersectionObserver" in window)) return;

    const map = new Map();
    items.forEach(function (a) {
      const target = document.getElementById(a.getAttribute("href").slice(1));
      if (target) map.set(target, a);
    });

    let current = null;
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const a = map.get(entry.target);
        if (!a || a === current) return;
        items.forEach((x) => x.classList.remove("is-active"));
        a.classList.add("is-active");
        current = a;
      });
    }, { rootMargin: "-88px 0px -55% 0px", threshold: 0 });

    map.forEach((_a, section) => io.observe(section));
  }

  /* ------------------------------------------------------------ load content */

  /**
   * Reads content.json. Two failure modes are handled with plain-English
   * messages instead of a blank page:
   *   1. Opened straight off the disk (file:// blocks reading JSON)
   *   2. A typo in content.json (usually a missing or extra comma)
   */
  async function loadContent(mountId) {
    const mount = document.getElementById(mountId);
    const isFile = location.protocol === "file:";

    let raw;
    try {
      const res = await fetch("content.json?v=" + Date.now(), { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status + " fetching content.json");
      raw = await res.text();
    } catch (err) {
      if (mount) {
        mount.append(isFile ? bootFileError() : bootError(
          "Couldn't load content.json",
          "The browser could not fetch content.json. Check that the file sits next to index.html and that the name is exactly content.json (all lowercase).",
          String(err.message || err)
        ));
      }
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch (err) {
      if (mount) {
        mount.append(bootError(
          "content.json has a typo in it",
          "The site is fine \u2014 the content file just has a small syntax error. Nine times out of ten it is a missing comma, an extra comma before a } or ], or a \u201Ccurly\u201D quote pasted in from Word. Paste the file into jsonlint.com to see the exact line.",
          String(err.message || err)
        ));
      }
      return null;
    }
  }

  function bootError(title, body, detail) {
    return h("div", { class: "boot" },
      mono("Site notice"),
      h("h2", { class: "display", text: title }),
      h("p", { text: body }),
      detail ? h("pre", { text: detail }) : null
    );
  }

  function bootFileError() {
    const box = h("div", { class: "boot" },
      mono("Local preview"),
      h("h2", { class: "display", text: "Start a tiny local server to preview" }),
      h("p", { text: "Browsers refuse to read content.json when a page is opened directly from your hard drive. Open a terminal in this folder and run one line:" }),
      h("pre", { text: "Windows:  py -m http.server 5180 --bind 127.0.0.1\nMac:      python3 -m http.server 5180 --bind 127.0.0.1" }),
      h("p", {}, "Then visit ", h("code", { text: "http://127.0.0.1:5180" }), " in your browser."),
      h("p", { text: "No Python? In VS Code, install the \u201CLive Server\u201D extension, right-click index.html and choose \u201COpen with Live Server\u201D. Once the site is on GitHub Pages this never comes up again." })
    );
    return box;
  }

  /* ------------------------------------------------------------------ chrome */

  /** Fills in nav brand + footer from content.json. */
  function initChrome(data) {
    const name = (data.profile && data.profile.name) || "Portfolio";
    document.querySelectorAll("[data-brand]").forEach((n) => (n.textContent = name));

    const footer = document.getElementById("footer-line");
    if (footer) {
      const bits = [name.toUpperCase()];
      if (!blank(data.profile && data.profile.field)) bits.push(String(data.profile.field).toUpperCase());
      bits.push(String(new Date().getFullYear()));
      footer.textContent = bits.join(" \u2014 ");
    }
  }

  /** Sets <title> and the meta description. */
  function setMeta(title, description) {
    if (!blank(title)) document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && !blank(description)) meta.setAttribute("content", description);
  }

  /* ------------------------------------------------------------------ export */

  window.PF = {
    h: h,
    mono: mono,
    blank: blank,
    arr: arr,
    slugify: slugify,
    pad2: pad2,
    imgPath: imgPath,
    placeholder: placeholder,
    fillMedia: fillMedia,
    figCaption: figCaption,
    initTheme: initTheme,
    initReveal: initReveal,
    initNav: initNav,
    initActiveNav: initActiveNav,
    loadContent: loadContent,
    initChrome: initChrome,
    setMeta: setMeta,
    bootError: bootError
  };
})();
