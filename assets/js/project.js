/* ==========================================================================
   project.js — builds a single project page from content.json
   --------------------------------------------------------------------------
   You do NOT need to edit this file to update your portfolio.
   All of your content lives in content.json.
   ========================================================================== */

(function () {
  "use strict";

  const { h, mono, blank, arr, pad2, slugify, imgPath, fillMedia } = window.PF;

  function usableUrl(url) {
    if (blank(url)) return false;
    return !/^todo/i.test(String(url).trim());
  }

  function projectId(project, index) {
    return project.id || slugify(project.title || "project-" + (index + 1));
  }

  /* -------------------------------------------------------------- text block */

  /* `wide` skips the readable-line-length cap — used for galleries and
     button rows, which should fill the column. */
  function block(label, content, wide) {
    if (!content) return null;
    return h("div", { class: "block reveal" },
      mono(label),
      h("div", { class: wide ? "body wide" : "body" }, content));
  }

  function paragraphs(value) {
    const items = arr(value);
    if (!items.length) return null;
    const box = h("div", {});
    items.forEach((p) => box.append(h("p", { text: p })));
    return box;
  }

  function bulletList(value) {
    const items = arr(value);
    if (!items.length) return null;
    const ul = h("ul", {});
    items.forEach((b) => ul.append(h("li", { text: b })));
    return ul;
  }

  /* ------------------------------------------------------------------ stats */

  function statRows(project) {
    const stats = arr(project.stats).filter((s) => s && (!blank(s.figure) || !blank(s.label)));
    if (!stats.length) return null;
    const box = h("div", { class: "stats reveal" });
    stats.forEach(function (s) {
      box.append(h("div", { class: "stat" },
        h("div", { class: "fig", text: s.figure || "\u2014" }),
        h("div", { class: "leader" }),
        h("div", { class: "mono meta" },
          h("span", { class: "l", text: s.label || "" }),
          blank(s.note) ? null : h("span", { class: "n", text: s.note })
        )
      ));
    });
    return box;
  }

  /* -------------------------------------------------------------- spec table */

  function specTable(project) {
    const rows = [];
    const push = (label, value, wide) => {
      if (blank(value)) return;
      rows.push({ label: label, value: value, wide: !!wide });
    };

    push("Project", project.title);
    push("Discipline", arr(project.disciplines).join(" / "));
    push("Date", project.date);
    push("Setting", project.setting);
    push("Role", project.role);
    push("Status", project.status);
    arr(project.specs).forEach(function (s) {
      if (s && !blank(s.label)) push(s.label, s.value, s.wide);
    });
    const tools = arr(project.tools);
    if (tools.length) push("Tools & methods", tools.join(" \u00B7 "), true);

    if (!rows.length) return null;

    const table = h("div", { class: "spec reveal" });
    rows.forEach(function (r) {
      table.append(h("div", { class: r.wide ? "wide" : "" },
        mono(r.label), h("div", { class: "v", text: r.value })));
    });
    return table;
  }

  /* ---------------------------------------------------------------- gallery */

  /**
   * Accepts "file.jpg" or { file, caption, alt, crop, maxWidth }.
   * An entry with no file but a "placeholder" label is kept: it draws a
   * clearly-marked reserved slot for a photo you haven't taken yet.
   */
  function normPhotos(list) {
    return arr(list)
      .map((p) => (typeof p === "string" ? { file: p } : p))
      .filter((p) => p && (!blank(p.file) || !blank(p.video) || !blank(p.placeholder)));
  }

  /** Wraps a frame and caption into the standard figure. */
  function figureShell(frame, figNo, photo) {
    const caption = "Fig. " + figNo + (blank(photo.caption) ? "" : " \u2014 " + photo.caption);
    const cls = "shot" + (photo.span === "full" ? " span-full" : "");
    const figEl = h("figure", { class: cls }, frame, h("figcaption", {}, mono(caption)));
    if (!blank(photo.maxWidth)) figEl.style.maxWidth = photo.maxWidth;
    return figEl;
  }

  /** A muted, inline-playable clip. Nothing autoplays and nothing makes noise. */
  function videoFigure(photo, figNo) {
    /* A "crop" matching the clip's own shape reserves the right height up
       front, so the page doesn't jump once the video loads. */
    const frame = blank(photo.crop)
      ? h("div", { class: "frame is-video" })
      : h("div", { class: "frame is-video", style: "aspect-ratio: " + photo.crop });
    const vid = h("video", {
      controls: "controls",
      muted: "muted",
      playsinline: "playsinline",
      preload: "metadata",
      loop: photo.loop ? "loop" : null,
      poster: blank(photo.poster) ? null : imgPath(photo.poster, "projects"),
      controlslist: "nodownload noplaybackrate",
      disablepictureinpicture: "",
      src: imgPath(photo.video, "projects"),
      "aria-label": photo.alt || photo.caption || "Project video"
    }, "Your browser cannot play this video format.");

    /* The attribute alone is not always honoured; the property always is. */
    vid.muted = true;
    vid.defaultMuted = true;
    vid.volume = 0;
    vid.addEventListener("volumechange", function () {
      if (!vid.muted) vid.muted = true;
    });

    frame.append(vid);
    return figureShell(frame, figNo, photo);
  }

  /** One captioned photo. `all` + `index` wire it into the lightbox. */
  function shotFigure(photo, figNo, all, index, project) {
    if (!blank(photo.video)) return videoFigure(photo, figNo);

    /* "crop": "1/1" (or "16/9", "4/3"...) shows the photo at that shape,
       trimmed from the centre, instead of at its own proportions. */
    const frame = blank(photo.crop)
      ? h("div", { class: "frame" })
      : h("div", { class: "frame is-cropped", style: "aspect-ratio: " + photo.crop });

    /* A reserved slot: no file yet, just a label saying what belongs here. */
    if (blank(photo.file)) {
      frame.classList.add("is-reserved");
      if (blank(photo.crop)) frame.classList.add("is-empty");
      frame.append(window.PF.placeholder("", photo.placeholder));
      return figureShell(frame, figNo, photo);
    }

    const img = fillMedia(
      frame,
      photo.file,
      photo.alt || photo.caption || project.title + " photo " + (index + 1),
      { subdir: "projects", label: "Image pending" }
    );
    if (img) {
      img.setAttribute("role", "button");
      img.setAttribute("tabindex", "0");
      img.addEventListener("click", () => openLightbox(all, index));
      img.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(all, index);
        }
      });
    }
    /* "maxWidth" holds a photo back from filling its column, and
       "span": "full" makes it run across every column. */
    return figureShell(frame, figNo, photo);
  }

  /**
   * Grouped gallery — a before/after matrix, used when a project has
   * "photoGroups" in content.json. Each group is a labelled column, and the
   * nth photo of every group shares a grid row so comparable photos line up
   * and sit centred against each other whatever their proportions.
   *
   * Figure numbers run down each column (1, 2 in the first group; 3, 4 in the
   * next), and the HTML stays in that column order so phones and screen
   * readers get a sensible reading sequence.
   */
  function galleryGroups(project, figStart) {
    const groups = arr(project.photoGroups).filter((g) => g && normPhotos(g.photos).length);
    if (!groups.length) return null;

    const lists = groups.map((g) => normPhotos(g.photos));

    const all = [];
    const cells = lists.map(function (list) {
      return list.map(function (p) {
        const isReal = !blank(p.file);
        const cell = { photo: p, fig: 0, idx: isReal ? all.length : -1 };
        if (isReal) all.push(p);
        return cell;
      });
    });
    let fig = figStart;
    cells.forEach((list) => list.forEach((c) => (c.fig = fig++)));

    /* Column proportions: "width": 1.7 on a group makes it 1.7fr wide. */
    const cols = groups.map((g) => (Number(g.width) > 0 ? Number(g.width) : 1) + "fr").join(" ");
    const box = h("div", { class: "gallery-matrix reveal", style: "--group-cols: " + cols });

    const hasLabels = groups.some((g) => !blank(g.label));
    const firstRow = hasLabels ? 2 : 1;

    groups.forEach(function (g, gi) {
      const col = gi + 1;
      if (hasLabels) {
        box.append(h("div", {
          class: "group-head", style: "--c: " + col + "; --r: 1"
        }, mono(g.label || ""), h("div", { class: "line" })));
      }
      cells[gi].forEach(function (c, ri) {
        const figEl = shotFigure(c.photo, c.fig, all, c.idx, project);
        figEl.style.setProperty("--c", String(col));
        figEl.style.setProperty("--r", String(firstRow + ri));
        box.append(figEl);
      });
    });

    return { node: box, photos: all };
  }

  /** Flat gallery — one grid, laid out by how many photos there are. */
  function gallery(project, figStart) {
    const photos = normPhotos(project.photos);

    /* No photos yet? Show a single friendly placeholder frame so the layout
       still reads as intentional until the photos are added. */
    if (!photos.length) {
      const frame = h("div", { class: "frame is-empty" });
      frame.append(window.PF.placeholder("", "Photos pending"));
      const fig = h("figure", { class: "shot" }, frame,
        h("figcaption", {}, mono("Fig. \u2014 photos to be added")));
      return { node: h("div", { class: "gallery n-1 reveal" }, fig), photos: [] };
    }

    /* Only photos with a file can be opened in the lightbox; reserved slots
       are skipped, so the arrows never land on an empty frame. */
    const real = photos.filter((p) => !blank(p.file));

    /* "galleryColumns": 2 pins the grid to that many columns, which is what
       makes a step-by-step progression read in pairs down the page. */
    const cols = Number(project.galleryColumns) > 0 ? Number(project.galleryColumns) : 0;
    const cls = cols ? "n-fixed" : photos.length === 1 ? "n-1" : photos.length === 2 ? "n-2" : "n-many";

    const style = [];
    if (cols) style.push("--gallery-cols: repeat(" + cols + ", minmax(0, 1fr))");
    if (!blank(project.galleryMaxWidth)) style.push("max-width: " + project.galleryMaxWidth);

    const grid = h("div", {
      class: "gallery " + cls + " reveal",
      style: style.length ? style.join("; ") : null
    });

    photos.forEach(function (p, i) {
      grid.append(shotFigure(p, figStart + i, real, real.indexOf(p), project));
    });

    return { node: grid, photos: real };
  }

  /* --------------------------------------------------------------- lightbox */

  let lb = null;
  let lbState = { photos: [], index: 0 };

  function buildLightbox() {
    const img = h("img", { alt: "" });
    const cap = h("figcaption", {});
    const box = h("div", { class: "lightbox", role: "dialog", "aria-modal": "true", "aria-label": "Photo viewer" },
      h("button", { class: "lightbox-close", type: "button", text: "Close \u00D7", onclick: closeLightbox }),
      h("figure", {}, img, cap),
      h("div", { class: "lightbox-nav" },
        h("button", { type: "button", text: "\u2190 Prev", onclick: () => step(-1) }),
        h("button", { type: "button", text: "Next \u2192", onclick: () => step(1) })
      )
    );
    box.addEventListener("click", function (e) { if (e.target === box) closeLightbox(); });
    document.body.append(box);
    lb = { box: box, img: img, cap: cap };
    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
  }

  function show() {
    const p = lbState.photos[lbState.index];
    if (!p) return;
    lb.img.src = imgPath(p.file, "projects");
    lb.img.alt = p.alt || p.caption || "Project photo";
    lb.cap.textContent = (blank(p.caption) ? "" : p.caption + "  ") +
      "(" + (lbState.index + 1) + " / " + lbState.photos.length + ")";
  }

  function openLightbox(photos, index) {
    if (!lb) buildLightbox();
    lbState = { photos: photos, index: index };
    show();
    lb.box.classList.add("is-open");
    document.body.style.overflow = "hidden";
    lb.box.querySelector(".lightbox-close").focus();
  }

  function closeLightbox() {
    if (!lb) return;
    lb.box.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function step(delta) {
    if (!lbState.photos.length) return;
    lbState.index = (lbState.index + delta + lbState.photos.length) % lbState.photos.length;
    show();
  }

  /* -------------------------------------------------------------- not found */

  function notFound(mount, projects) {
    const box = h("div", { class: "boot" },
      mono("Project not found"),
      h("h2", { class: "display", text: "That project link doesn't match anything" }),
      h("p", { text: "The address is missing a valid project id. Pick one below, or head back to the front page." })
    );
    const list = h("ul", { style: "margin:18px 0 0;padding-left:20px" });
    projects.forEach(function (p, i) {
      list.append(h("li", { style: "margin-bottom:8px" },
        h("a", { href: "project.html?p=" + encodeURIComponent(projectId(p, i)), text: p.title || "Untitled" })));
    });
    if (projects.length) box.append(list);
    box.append(h("p", { style: "margin-top:20px" }, h("a", { href: "index.html", text: "\u2190 Back to the portfolio" })));
    mount.append(box);
  }

  /* -------------------------------------------------------------- BOOTSTRAP */

  async function start() {
    window.PF.initTheme();
    window.PF.initNav();

    const data = await window.PF.loadContent("boot");
    const mount = document.getElementById("detail-mount");
    if (!data || !mount) return;

    window.PF.initChrome(data);

    /* Same hidden filter as the front page, so numbering stays in sync. */
    const projects = arr(data.projects).filter((p) => p && p.hidden !== true);
    const wanted = new URLSearchParams(location.search).get("p");
    let index = projects.findIndex((p, i) => projectId(p, i) === wanted);
    if (index < 0) {
      notFound(mount, projects);
      window.PF.setMeta("Project not found", "");
      window.PF.initReveal(document);
      return;
    }

    const project = projects[index];
    const name = (data.profile && data.profile.name) || "";
    window.PF.setMeta(
      (project.title || "Project") + (name ? " \u2014 " + name : ""),
      project.blurb || ""
    );

    /* ---- head ---- */
    const head = h("div", { class: "detail-head" });
    head.append(h("p", { class: "mono reveal", style: "margin-bottom:26px" },
      h("a", { href: "index.html#projects", text: "\u2190 All projects" })));
    head.append(h("div", { class: "detail-num reveal", text: pad2(index + 1) }));
    const disciplines = arr(project.disciplines);
    if (disciplines.length) {
      head.append(h("div", { class: "mono detail-disc reveal", text: disciplines.join(" \u00B7 ") }));
    }
    head.append(h("h1", { class: "detail-title reveal", text: project.title || "Untitled project" }));
    if (!blank(project.blurb)) {
      head.append(h("p", { class: "lede reveal", "data-reveal-delay": "70", text: project.blurb }));
    }
    mount.append(head);

    /* ---- stats + spec ---- */
    const stats = statRows(project);
    if (stats) mount.append(stats);
    const spec = specTable(project);
    if (spec) mount.append(spec);

    /* ---- prose + gallery ---- */
    const blocks = h("div", { class: "blocks" });

    const problem = block("The problem", paragraphs(project.problem));
    if (problem) blocks.append(problem);

    const roleBlock = block("My role", paragraphs(project.roleDetail));
    if (roleBlock) blocks.append(roleBlock);

    const approach = block("Approach", bulletList(project.approach) || paragraphs(project.approach));
    if (approach) blocks.append(approach);

    /* Grouped Before/After columns if the project defines them, otherwise the
       plain one-grid gallery. */
    const g = galleryGroups(project, 1) || gallery(project, 1);
    blocks.append(h("div", { class: "block block-full reveal" },
      h("div", { class: "group-head" }, mono("Gallery"), h("div", { class: "line" })),
      h("div", { class: "body wide" }, g.node)
    ));

    const results = block("Results", bulletList(project.results) || paragraphs(project.results));
    if (results) blocks.append(results);

    const links = arr(project.links).filter((l) => l && usableUrl(l.url));
    if (links.length) {
      const row = h("div", { class: "hero-actions" });
      links.forEach(function (l) {
        const external = /^https?:/i.test(l.url);
        row.append(h("a", {
          class: "btn btn-quiet", href: l.url,
          target: external ? "_blank" : null,
          rel: external ? "noopener" : null,
          text: l.label || "Link"
        }));
      });
      blocks.append(block("Files & links", row, true));
    }

    mount.append(blocks);

    /* ---- prev / next ---- */
    const nav = h("div", { class: "detail-nav reveal" });
    const prev = projects[(index - 1 + projects.length) % projects.length];
    const next = projects[(index + 1) % projects.length];
    if (projects.length > 1) {
      nav.append(h("a", { class: "btn btn-quiet", href: "project.html?p=" + encodeURIComponent(projectId(prev, projects.indexOf(prev))), text: "\u2190 Previous project" }));
      nav.append(h("a", { class: "btn", href: "project.html?p=" + encodeURIComponent(projectId(next, projects.indexOf(next))), text: "Next project \u2192" }));
    } else {
      nav.append(h("a", { class: "btn", href: "index.html#projects", text: "\u2190 Back to portfolio" }));
    }
    mount.append(nav);

    window.PF.initReveal(document);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
