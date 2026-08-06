/* ==========================================================================
   home.js — builds the front page from content.json
   --------------------------------------------------------------------------
   You do NOT need to edit this file to update your portfolio.
   All of your content lives in content.json.
   ========================================================================== */

(function () {
  "use strict";

  const { h, mono, blank, arr, pad2, fillMedia, figCaption } = window.PF;

  /* Links that are empty or still say TODO are skipped instead of rendering
     as broken buttons. Fill them in later and they appear automatically. */
  function usableUrl(url) {
    if (blank(url)) return false;
    return !/^todo/i.test(String(url).trim());
  }

  function sectionHead(kicker, countText) {
    return h("div", { class: "section-head reveal" },
      mono(kicker),
      h("div", { class: "line" }),
      countText ? h("div", { class: "mono count", text: countText }) : null
    );
  }

  /* ------------------------------------------------------------------- HERO */

  function renderHero(mount, data) {
    const p = data.profile || {};
    const parts = String(p.name || "Your Name").trim().split(/\s+/);
    const first = parts.shift();
    const last = parts.join(" ");

    const left = h("div", { class: "hero-left" });

    left.append(h("div", { class: "hero-kicker reveal" },
      mono(p.kicker || "Mechanical Engineering \u2014 Project Portfolio"),
      h("div", { class: "line" })
    ));

    left.append(h("h1", { class: "reveal", "data-reveal-delay": "60" },
      h("span", { class: "first", text: first }),
      last ? h("span", { class: "last", text: last }) : null
    ));

    if (!blank(p.tagline)) {
      left.append(h("p", { class: "tagline reveal", "data-reveal-delay": "140", text: p.tagline }));
    }

    const buttons = arr(p.buttons).filter((b) => b && usableUrl(b.url));
    if (buttons.length) {
      const row = h("div", { class: "hero-actions reveal", "data-reveal-delay": "200" });
      buttons.forEach(function (b) {
        const external = /^https?:/i.test(b.url);
        row.append(h("a", {
          class: "btn" + (b.primary ? " btn-primary" : (b.quiet ? " btn-quiet" : "")),
          href: b.url,
          target: external ? "_blank" : null,
          rel: external ? "noopener" : null,
          text: b.label || "Link"
        }));
      });
      left.append(row);
    }

    /* Portrait */
    const right = h("div", { class: "portrait-block reveal", "data-reveal-delay": "120" });
    const frame = h("div", { class: "frame" });
    fillMedia(frame, p.photo, p.photoAlt || (p.name ? "Portrait of " + p.name : "Portrait"), {
      subdir: "profile", label: "Headshot pending", eager: true
    });
    const portrait = h("div", { class: "portrait" }, frame);
    right.append(portrait);
    right.append(figCaption(p.photoCaption || "Fig. 1 \u2014 " + (p.name || "")));

    mount.append(h("div", { class: "hero-grid" }, left, right));

    /* Fact bar */
    const facts = arr(p.facts).filter((f) => f && !blank(f.label));
    if (facts.length) {
      const bar = h("div", { class: "factbar reveal" });
      facts.forEach(function (f) {
        bar.append(h("div", {}, mono(f.label), h("div", { class: "v", text: f.value || "\u2014" })));
      });
      mount.append(bar);
    }
  }

  /* ------------------------------------------------------------------ ABOUT */

  function renderAbout(mount, data) {
    const a = data.about || {};
    mount.append(sectionHead("About"));

    const left = h("div", {});
    if (!blank(a.heading)) {
      left.append(h("p", { class: "lede reveal", text: a.heading, style: "margin-top:0" }));
    }
    const body = h("div", { class: "about-body reveal", "data-reveal-delay": "80", style: "margin-top:28px" });
    arr(a.paragraphs).forEach((para) => body.append(h("p", { text: para })));
    left.append(body);

    const highlights = arr(a.highlights).filter((x) => x && !blank(x.label));
    if (highlights.length) {
      const box = h("div", { class: "about-highlights reveal" });
      highlights.forEach(function (x) {
        box.append(h("div", { class: "row" },
          h("div", { class: "fig", text: x.figure || "\u2014" }),
          h("div", {}, h("div", { class: "mono", text: x.label }),
            blank(x.note) ? null : h("div", { class: "rowtext", text: x.note }))
        ));
      });
      left.append(box);
    }

    const right = h("div", { class: "about-portrait reveal", "data-reveal-delay": "120" });
    const frame = h("div", { class: "frame" });
    fillMedia(frame, a.photo, a.photoAlt || "Photo", { subdir: "profile", label: "Photo pending" });
    right.append(h("div", { class: "portrait" }, frame));
    right.append(figCaption(a.photoCaption || "Fig. 2 \u2014 In the shop"));

    mount.append(h("div", { class: "about-grid" }, left, right));
  }

  /* --------------------------------------------------------------- PROJECTS */

  function projectCard(project, index) {
    const id = project.id || window.PF.slugify(project.title || "project-" + (index + 1));

    const media = h("div", { class: "card-media" });
    fillMedia(media, project.coverPhoto, project.coverAlt || project.title || "Project photo", {
      subdir: "projects", label: "Cover photo pending"
    });
    media.append(h("div", { class: "card-num", text: pad2(index + 1) }));

    const body = h("div", { class: "card-body" });
    const disciplines = arr(project.disciplines);
    if (disciplines.length) {
      body.append(h("div", { class: "mono card-disc", text: disciplines.join(" \u00B7 ") }));
    }
    body.append(h("div", { class: "card-title", text: project.title || "Untitled project" }));
    if (!blank(project.blurb)) body.append(h("p", { class: "card-blurb", text: project.blurb }));

    const tools = arr(project.tools).slice(0, 6);
    if (tools.length) {
      const tags = h("div", { class: "tags" });
      tools.forEach((t) => tags.append(h("span", { class: "tag", text: t })));
      body.append(tags);
    }

    body.append(h("div", { class: "card-more" },
      mono("See project details"),
      h("span", { class: "mono arrow", text: "\u2192" })
    ));

    const card = h("a", {
      class: "card reveal",
      href: "project.html?p=" + encodeURIComponent(id),
      "data-reveal-delay": String(Math.min(index, 4) * 70),
      "data-disciplines": disciplines.join("|").toLowerCase(),
      "aria-label": (project.title || "Project") + " \u2014 view details"
    }, media, body);

    return card;
  }

  function renderProjects(mount, data) {
    /* Projects marked "hidden": true stay in content.json but never render.
       That's how the TEMPLATE block is kept as a copy-paste reference. */
    const projects = arr(data.projects).filter((p) => p && p.hidden !== true);
    mount.append(sectionHead("Selected projects", projects.length + (projects.length === 1 ? " entry" : " entries")));

    if (!projects.length) {
      mount.append(h("div", { class: "empty-note" },
        mono("No projects yet"),
        h("p", { style: "margin-top:10px", text: "Add your first project to the \"projects\" list in content.json." })
      ));
      return;
    }

    /* Filter chips built from the disciplines you list on each project.
       Off by default — turn them on with "showProjectFilters": true in the
       "settings" block of content.json once you have enough projects for
       filtering to earn its space. */
    const settings = data.settings || {};
    const showFilters = settings.showProjectFilters === true;

    const all = new Set();
    projects.forEach((p) => arr(p.disciplines).forEach((d) => all.add(d)));
    const tagList = Array.from(all).sort((x, y) => x.localeCompare(y));

    const grid = h("div", { class: "cards" });
    projects.forEach((p, i) => grid.append(projectCard(p, i)));

    if (showFilters && tagList.length > 1) {
      const bar = h("div", { class: "filters reveal" });
      bar.append(mono("Filter"));
      const shown = h("div", { class: "mono shown" });

      const chips = [];
      function setFilter(value, chip) {
        chips.forEach((c) => c.setAttribute("aria-pressed", c === chip ? "true" : "false"));
        let visible = 0;
        Array.from(grid.children).forEach(function (card) {
          const list = (card.dataset.disciplines || "").split("|");
          const match = value === "*" || list.includes(value.toLowerCase());
          card.hidden = !match;
          if (match) visible++;
        });
        shown.textContent = visible + " of " + projects.length + " shown";
      }

      const allChip = h("button", {
        class: "chip", type: "button", "aria-pressed": "true", text: "All",
        onclick: () => setFilter("*", allChip)
      });
      chips.push(allChip);
      bar.append(allChip);

      tagList.forEach(function (t) {
        const chip = h("button", {
          class: "chip", type: "button", "aria-pressed": "false", text: t,
          onclick: () => setFilter(t, chip)
        });
        chips.push(chip);
        bar.append(chip);
      });

      shown.textContent = projects.length + " of " + projects.length + " shown";
      bar.append(shown);
      mount.append(bar);
    }

    mount.append(grid);
  }

  /* ------------------------------------------------------------- EXPERIENCE */

  function renderExperience(mount, data) {
    const jobs = arr(data.experience);
    mount.append(sectionHead("Experience"));

    if (!jobs.length) return;

    const list = h("div", { class: "timeline" });
    jobs.forEach(function (job, i) {
      const when = h("div", { class: "tl-when" });
      when.append(mono(job.dates || ""));
      if (!blank(job.kind)) when.append(h("div", { class: "tl-kind", text: job.kind }));

      const main = h("div", {});
      main.append(h("div", { class: "tl-role", text: job.jobTitle || "Role" }));
      if (!blank(job.organization)) main.append(h("div", { class: "tl-org", text: job.organization }));
      if (!blank(job.location)) main.append(h("div", { class: "mono tl-where", text: job.location }));

      const bullets = arr(job.bullets);
      if (bullets.length) {
        const ul = h("ul", { class: "tl-bullets" });
        bullets.forEach((b) => ul.append(h("li", { text: b })));
        main.append(ul);
      }

      list.append(h("div", {
        class: "tl-item reveal",
        "data-reveal-delay": String(Math.min(i, 4) * 60)
      }, when, main));
    });
    mount.append(list);
  }

  /* ----------------------------------------------------------------- SKILLS */

  function renderSkills(mount, data) {
    const groups = arr(data.skills);
    mount.append(sectionHead("Skills & tools"));
    if (!groups.length) return;

    const wrapEl = h("div", { class: "skill-groups" });
    groups.forEach(function (g, i) {
      const box = h("div", { class: "skill-group reveal", "data-reveal-delay": String(Math.min(i, 5) * 55) });
      box.append(h("h4", { text: g.group || "Skills" }));
      const ul = h("ul", { class: "skill-list" });
      arr(g.items).forEach(function (item) {
        if (typeof item === "string") {
          ul.append(h("li", { text: item }));
        } else {
          ul.append(h("li", {}, item.name || "",
            blank(item.note) ? null : h("span", { class: "note", text: item.note })));
        }
      });
      box.append(ul);
      wrapEl.append(box);
    });
    mount.append(wrapEl);
  }

  /* -------------------------------------------------------------- EDUCATION */

  function renderEducation(mount, data) {
    const e = data.education || {};
    mount.append(sectionHead("Education"));

    const card = h("div", { class: "edu-card reveal" });
    card.append(h("div", { class: "edu-degree", text: e.degree || "Degree" }));
    if (!blank(e.school)) card.append(h("div", { class: "edu-school", text: e.school }));

    const meta = h("div", { class: "edu-meta" });
    [
      ["Graduating", e.graduation],
      ["Location", e.location]
    ].forEach(function (pair) {
      if (blank(pair[1])) return;
      meta.append(h("div", {}, mono(pair[0]), h("div", { class: "v", text: pair[1] })));
    });
    if (meta.children.length) card.append(meta);

    const honors = arr(e.honors);
    if (honors.length) {
      card.append(h("div", { class: "subhead" }, mono("Honors"), h("div", { class: "line" })));
      const row = h("div", { class: "pill-row" });
      honors.forEach((x) => row.append(h("span", { class: "pill", text: x })));
      card.append(row);
    }

    const certs = arr(e.certifications);
    if (certs.length) {
      card.append(h("div", { class: "subhead" }, mono("Certifications"), h("div", { class: "line" })));
      const ul = h("ul", { class: "cert-list" });
      certs.forEach(function (c) {
        const detail = [c.issuer, c.year].filter((x) => !blank(x)).join(" \u00B7 ");
        ul.append(h("li", {},
          h("span", { class: "name", text: c.name || "" }),
          detail ? h("span", { class: "mono", text: detail }) : null
        ));
      });
      card.append(ul);
    }

    const courses = arr(e.coursework);
    if (courses.length) {
      card.append(h("div", { class: "subhead" }, mono("Relevant coursework"), h("div", { class: "line" })));
      const row = h("div", { class: "pill-row" });
      courses.forEach((c) => row.append(h("span", { class: "pill", text: c })));
      card.append(row);
    }

    mount.append(card);
  }

  /* ---------------------------------------------------------------- CONTACT */

  function renderContact(mount, data) {
    const c = data.contact || {};
    mount.append(sectionHead("Get in touch"));

    const box = h("div", { class: "contact-block" });

    if (!blank(c.heading)) {
      box.append(h("p", { class: "lede reveal", style: "margin-top:0", text: c.heading }));
    }

    /* Action buttons — the fastest route to reaching you. */
    const actions = [
      { label: "Email me", url: blank(c.email) ? null : "mailto:" + c.email, primary: true },
      { label: "LinkedIn", url: c.linkedin, quiet: true },
      { label: "GitHub", url: c.github, quiet: true },
      { label: "Resume (PDF)", url: c.resume, quiet: true }
    ].filter((b) => usableUrl(b.url));

    if (actions.length) {
      const row = h("div", {
        class: "hero-actions contact-actions reveal",
        "data-reveal-delay": "70"
      });
      actions.forEach(function (b) {
        const external = /^https?:/i.test(b.url);
        row.append(h("a", {
          class: "btn" + (b.primary ? " btn-primary" : " btn-quiet"),
          href: b.url,
          target: external ? "_blank" : null,
          rel: external ? "noopener" : null,
          text: b.label
        }));
      });
      box.append(row);
    }

    /* Detail strip — same styling as the fact bar under the hero. */
    const rows = [
      ["Email", c.email, blank(c.email) ? null : "mailto:" + c.email],
      ["Phone", c.phone, blank(c.phone) ? null : "tel:" + String(c.phone).replace(/[^\d+]/g, "")],
      ["LinkedIn", c.linkedinLabel || c.linkedin, c.linkedin],
      ["GitHub", c.githubLabel || c.github, c.github],
      ["Based in", c.location, null]
    ];

    const strip = h("div", { class: "factbar reveal", "data-reveal-delay": "120" });
    rows.forEach(function (r) {
      const [label, value, href] = r;
      if (blank(value) || /^todo/i.test(String(value).trim())) return;
      let val;
      if (usableUrl(href)) {
        const external = /^https?:/i.test(href);
        val = h("a", {
          href: href,
          target: external ? "_blank" : null,
          rel: external ? "noopener" : null,
          text: value
        });
      } else {
        val = document.createTextNode(value);
      }
      strip.append(h("div", {}, mono(label), h("div", { class: "v" }, val)));
    });
    if (strip.children.length) box.append(strip);

    mount.append(box);
  }

  /* -------------------------------------------------------------- BOOTSTRAP */

  async function start() {
    window.PF.initTheme();
    window.PF.initNav();

    const data = await window.PF.loadContent("boot");
    if (!data) {
      const page = document.getElementById("page");
      if (page) page.hidden = true;
      return;
    }

    window.PF.initChrome(data);

    const name = (data.profile && data.profile.name) || "Portfolio";
    const field = (data.profile && data.profile.field) || "Mechanical Engineering";
    window.PF.setMeta(
      name + " \u2014 " + field + " Portfolio",
      (data.profile && data.profile.metaDescription) || (data.profile && data.profile.tagline) || ""
    );

    const steps = [
      ["hero-mount", renderHero],
      ["about-mount", renderAbout],
      ["projects-mount", renderProjects],
      ["experience-mount", renderExperience],
      ["skills-mount", renderSkills],
      ["education-mount", renderEducation],
      ["contact-mount", renderContact]
    ];

    steps.forEach(function (step) {
      const el = document.getElementById(step[0]);
      if (!el) return;
      try {
        step[1](el, data);
      } catch (err) {
        el.append(window.PF.bootError(
          "One section could not be built",
          "The rest of the page is fine. Check this section's entry in content.json.",
          String(err.message || err)
        ));
      }
    });

    window.PF.initReveal(document);
    window.PF.initActiveNav();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
