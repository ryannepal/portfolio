# Ryan Nepal — Mechanical Engineering Portfolio

A static portfolio site. Plain HTML, CSS and vanilla JavaScript — no React, no npm,
no build step, no bundler. Everything you edit lives in **one file**: `content.json`.

**All instructions live in `Portfolio Editing Guide.docx`** — open it in Word. It
covers adding photos, editing every section, publishing to GitHub Pages, saving and
republishing after an edit, and what to do if something breaks.

This README is a short technical summary of how the code fits together.

---

## What's here

```
index.html                  Front page (Hero, About, Projects, Experience,
                            Skills, Education, Contact)
project.html                Project detail page. One file serves every project;
                            the project is chosen by the ?p= bit of the address,
                            e.g. project.html?p=mazda3-rebuild
404.html                    Friendly page for a bad address on GitHub Pages
favicon.svg                 The little icon in the browser tab

content.json     <-- ALL of your content. The only file you need to edit.
                     Starts with a "settings" block for site-wide switches,
                     then profile, about, projects, experience, skills,
                     education and contact.

assets/
  css/styles.css            All styling. Colours, fonts and spacing are the
                            first 60 lines; the rest is layout machinery.
  js/core.js                Shared plumbing: loads content.json, handles
                            missing photos, night mode, scroll animations, nav
  js/home.js                Builds the front page from content.json
  js/project.js             Builds a project detail page from content.json

images/
  profile/                  headshot.jpg and about.jpg go here
  projects/                 every project photo goes here

files/
  Ryan-Nepal-Resume.pdf     your resume, linked from the hero and Contact
                            replace this file to update your resume

.nojekyll                   Tells GitHub Pages to serve the files as-is
```

## How the pieces fit together

`index.html` is almost empty on purpose — it's a shell with one empty container per
section. When the page opens, `core.js` fetches `content.json`, then `home.js` reads
that data and builds the hero, projects, experience, skills, education and contact
sections into those containers. `project.html` works the same way: it reads the `?p=`
value out of the address bar, finds the matching project in `content.json`, and
renders its detail page. Because every word and photo filename comes from
`content.json`, adding a project or a job never means touching HTML, CSS or
JavaScript.

## Running it on your own computer

Browsers block a page from reading `content.json` when you open `index.html` straight
off your hard drive, so use a tiny local server. Open a terminal in this folder:

```
Windows:   py -m http.server 5180 --bind 127.0.0.1
Mac:       python3 -m http.server 5180 --bind 127.0.0.1
```

Then open <http://127.0.0.1:5180>.

Two details that save time. Use `py` on Windows, not `python`. And keep
`--bind 127.0.0.1` — without it Python may bind only to IPv6, and if anything else
on your machine is already using the port you'll silently end up looking at a
different site. Pick a different port number if 5180 is busy.

No Python? In VS Code, install the **Live Server** extension, right-click
`index.html`, choose *Open with Live Server*.

If you open `index.html` by double-clicking it, the page will tell you this in plain
English rather than showing a blank screen. Once the site is on GitHub Pages the
issue never comes up again — and honestly, editing straight on GitHub (see the Word
guide, section 12) means you may never need a local server at all.

## Things worth knowing

- **Missing photos are fine.** If a filename in `content.json` has no matching file
  yet, the site draws a neutral "Image pending" block instead of a broken image. Ship
  first, add photos later.
- **`TODO` is a magic word.** Any link whose address starts with `TODO` is hidden
  automatically, so unfinished links never render as broken buttons. `TODO` text in
  ordinary content *does* show on the page — that's deliberate, so you can spot what
  still needs writing.
- **Keys starting with `_`** in `content.json` (like `_note`) are reminders to you.
  The site ignores them. Leave them or delete them, either is fine.
- **Night mode** is the button at the top right. The choice is remembered per visitor.
- **Accessibility:** semantic HTML, alt text on every image, keyboard-navigable
  gallery and nav, visible focus rings, and colour contrast meeting WCAG AA. Full
  WCAG validation still needs manual testing with a screen reader.

## Current TODOs left in `content.json`

Search the file for `TODO` and you'll find these:

- GitHub profile URL (hero button and Contact row)
- One About paragraph in your own voice
- Programming languages under Skills
- Photo descriptions (`alt` text) once you add the photos
- Optional project links (team page, CAD file)

## Credits

Fonts: [Archivo](https://fonts.google.com/specimen/Archivo) and
[EB Garamond](https://fonts.google.com/specimen/EB+Garamond) via Google Fonts.
