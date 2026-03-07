# Eleventy (11ty) Migration Plan: Indecisive Devices Website

**Version:** 1.0  
**Date:** March 7, 2026  
**Author:** Senior Web Developer  
**Goal:** Migrate the current static SPA to Eleventy on GitHub Pages with zero visual regressions

---

## Executive Summary

The Indecisive Devices website is a single-page application built with vanilla HTML/CSS/JS, Bootstrap 5, AOS animations, and Google Fonts. The migration to Eleventy is **low-risk** because the site has no backend dependencies, the CSS is self-contained with CSS custom properties, and the JavaScript is entirely client-side.

Eleventy is a simpler, faster, and more flexible static site generator — it runs on Node.js, has zero client-side JavaScript by default, and supports multiple templating languages out of the box.

**Estimated effort:** 2–3 focused sessions (5–8 hours total)  
**Risk level:** Low (incremental migration with Git branching)  
**Outcome:** Identical visual experience + data-driven content via JSON/YAML + easier long-term maintenance

---

## Section 1: Architectural Assessment

### 1.1 Current Project Inventory

| File                                    | Size                                                                  | Purpose                                                                   |
| --------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `index.html`                            | 543 lines / 19 KB                                                     | Monolithic SPA with all sections                                          |
| `css/style.css`                         | 712 lines / 12 KB                                                     | Complete styling with CSS variables, responsive breakpoints               |
| `js/main.js`                            | 371 lines / 10 KB                                                     | AOS init, contact form (mailto), smooth scroll, active nav, scroll-to-top |
| `assets/logo.png`                       | 1.9 MB                                                                | Team logo (used in navbar, hero, placeholders)                            |
| `assets/2025-26_bot.jpg`                | 1.2 MB                                                                | Current season robot photo                                                |
| `assets/Team Photo.jpg`                 | 965 KB                                                                | Team photo (About section)                                                |
| `assets/Johnson_Matthey _Logo_blue.svg` | 12 KB                                                                 | Sponsor logo (**space in filename**)                                      |
| `assets/acf-search.webp`                | 23 KB                                                                 | Sponsor logo                                                              |
| `data/`                                 | empty                                                                 | Unused directory                                                          |
| `.gitignore`                            | Node.js template (no Eleventy entries yet)                            |
| `README.md`                             | References `docs/` folder and `FtcRobotController` URL — **outdated** |

### 1.2 Current Architecture

- **Content delivery:** Single monolithic HTML file with anchor-based navigation
- **Styling:** Centralized CSS with `:root` custom properties for brand colors
- **Interactivity:** Bootstrap 5.3.0 (CDN) + AOS 2.3.1 (CDN) + custom vanilla JS
- **Fonts:** Google Fonts CDN — Montserrat (headings) + Lato (body)
- **Contact form:** Client-side `mailto:ShamRobotics@outlook.com` with form validation
- **Hosting:** GitHub Pages user/org site at `https://indecisivedevices.github.io/`

### 1.3 Sections in index.html (in order)

| Section      | Lines   | ID             | Notes                                                     |
| ------------ | ------- | -------------- | --------------------------------------------------------- |
| Navigation   | 35–80   | —              | Fixed navbar, Bootstrap collapse                          |
| Hero         | 82–110  | `home`         | Gradient background, CTAs, logo image                     |
| About        | 112–149 | `about`        | Team photo (`Team Photo.jpg`), mission text               |
| Robots       | 151–249 | `robots`       | Current bot (`2025-26_bot.jpg`) + 3 past robot cards      |
| Sponsors     | 251–307 | `sponsors`     | 2 sponsors: Johnson Matthey (platinum), ACF Search (gold) |
| Get Involved | 309–417 | `get-involved` | 3 involvement cards + contact form                        |
| Donate       | 419–467 | `donate`       | Mission/benefits list + QR placeholder                    |
| Google Form  | 469–489 | `google-form`  | **Commented out** (Trivia Night iframe)                   |
| Footer       | 491–531 | —              | Quick links, social emoji icons, copyright                |

### 1.4 What Should Become Data-Driven vs. Static

**Data-driven (`_data/` JSON or YAML):**

- Sponsors — logo paths, URLs, tier, display widths
- Robots — current robot specs + past robots list
- Navigation links (optional, future)

**Static (layouts/includes):**

- Navigation bar structure, Hero section, About section content
- Get Involved cards + contact form, Donate section, Footer

**Unchanged (client-side JS):**

- AOS initialization, Contact form handling (mailto)
- Smooth scroll navigation, Active nav link highlighting, Scroll-to-top button

---

## Section 2: Migration Strategy

### Overview

```
Phase 0 (Preflight)   -> Safety net: branch, screenshots, asset inventory
Phase 1 (2-3 hours)   -> Structural conversion: get Eleventy building identically
Phase 2 (2-3 hours)   -> Data-driven content: sponsors + robots via JSON/YAML
Phase 3 (1-2 hours)   -> Polish: verification, SEO, GitHub Actions deploy
```

---

### ✅ Phase 0: Preflight and Safety Net

**Objective:** Ensure you can always roll back quickly.

#### ✅ 0.1 Create migration branch

```bash
git checkout -b feature/eleventy-migration
```

#### ✅ 0.2 Capture baseline screenshots

Take screenshots at 3 viewports (desktop 1440px, tablet 768px, mobile 390px).

#### ✅ 0.3 Confirm asset inventory

Verify these exact filenames (note the space in the Johnson Matthey filename):

```
assets/logo.png
assets/2025-26_bot.jpg
assets/Team Photo.jpg
assets/Johnson_Matthey _Logo_blue.svg   <-- space before _Logo
assets/acf-search.webp
```

#### ✅ 0.4 Set up local Eleventy environment

> **No Ruby required.** Eleventy runs on Node.js, which is likely already installed if you have `npm` available.

```bash
npm init -y
npm install --save-dev @11ty/eleventy
```

#### ✅ 0.5 Update .gitignore for Eleventy

Add at the end of the existing `.gitignore`:

```
# Eleventy
_site/
node_modules/
```

> **Note:** The existing `.gitignore` already has a Node.js template, which may already include `node_modules/`. Verify and only add what is missing.

**✅ Exit criteria:** Branch exists, baseline screenshots captured, `npx @11ty/eleventy --help` runs successfully, `.gitignore` updated.

---

### ✅ Phase 1: Structural Conversion (Zero Visual Changes)

**Goal:** Eleventy builds and produces HTML identical to the current site.

#### ✅ 1.1 Create `.eleventy.js` (Configuration File)

```js
module.exports = function (eleventyConfig) {
  // Pass through static assets (copy as-is to _site/)
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");

  // Watch for changes in CSS and JS during development
  eleventyConfig.addWatchTarget("css/");
  eleventyConfig.addWatchTarget("js/");

  return {
    // Use Nunjucks as the templating engine for .html files
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",

    dir: {
      input: "src", // Source directory
      includes: "_includes", // Relative to input dir: src/_includes/
      layouts: "_layouts", // Relative to input dir: src/_layouts/
      data: "_data", // Relative to input dir: src/_data/
      output: "_site", // Build output directory
    },
  };
};
```

> **Key decision: `src/` input directory.** Unlike Jekyll (which uses the project root), Eleventy best practice is to put source files in a `src/` directory. This cleanly separates source from config, `node_modules`, and build output. The `assets/`, `css/`, and `js/` directories are passed through from the project root, so their URLs remain unchanged.

> **Why Nunjucks?** Nunjucks is the most popular Eleventy templating language. It is powerful (supports macros, block inheritance, etc.) and is very well-suited for this project's needs.

#### ✅ 1.2 Create `src/_layouts/default.njk`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="{{ description or metadata.description }}"
    />
    <meta name="author" content="{{ metadata.author }}" />
    <title>{{ title or metadata.title }}</title>

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Lato:wght@400;500;700&display=swap"
      rel="stylesheet"
    />

    <!-- Bootstrap CSS -->
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
      rel="stylesheet"
    />

    <!-- AOS (Animate On Scroll) -->
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet" />

    <!-- Custom Styles -->
    <link rel="stylesheet" href="/css/style.css" />
  </head>
  <body>
    {% include "header.njk" %} {{ content | safe }} {% include "footer.njk" %}

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

    <!-- AOS JS -->
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>

    <!-- Custom JS -->
    <script src="/js/main.js"></script>
  </body>
</html>
```

> **Key Nunjucks details:**
>
> - Uses `{{ content | safe }}` instead of `{{ content }}` — Nunjucks requires `| safe` to render raw HTML without escaping.
> - Uses `{{ title or metadata.title }}` — Nunjucks uses `or` for defaults, and global data lives in `metadata` (from `_data/metadata.json`).
> - CSS/JS paths use leading `/` (root-relative) — no `relative_url` filter needed because the site is at the root.
> - The `<title>` avoids duplication.

#### ✅ 1.3 Create Global Data: `src/_data/metadata.json`

```json
{
  "title": "Indecisive Devices",
  "description": "Indecisive Devices - FIRST Tech Challenge Team",
  "author": "Indecisive Devices",
  "url": "https://indecisivedevices.github.io"
}
```

> **Eleventy global data:** Any file in `_data/` is automatically available as a global variable. `metadata.json` becomes `{{ metadata.title }}`, `{{ metadata.url }}`, etc. in all templates.

#### ✅ 1.4 Extract Includes

Create `src/_includes/` directory with Nunjucks partials extracted from `index.html`:

- **`src/_includes/header.njk`** (Lines 34–80): Navbar. Replace hardcoded brand text with `{{ metadata.title }}`. Keep all nav link anchors unchanged.
- **`src/_includes/hero.njk`** (Lines 82–110): Keep `id="home"`. Image paths use root-relative `/assets/` prefix.
- **`src/_includes/about.njk`** (Lines 112–149): Image `src="/assets/Team Photo.jpg"` (root-relative).
- **`src/_includes/robots.njk`** (Lines 151–249): Keep hardcoded for Phase 1. Update image paths with `/assets/` prefix.
- **`src/_includes/sponsors.njk`** (Lines 251–307): Keep hardcoded for Phase 1. **Preserve exact Johnson Matthey filename with space.**
- **`src/_includes/get-involved.njk`** (Lines 309–417): Includes involvement cards AND contact form. Keep form `id="contact-form"` (JS depends on it).
- **`src/_includes/donate.njk`** (Lines 419–467): Keep `id="donate"` unchanged.
- **`src/_includes/footer.njk`** (Lines 491–531): Replace hardcoded team name with `{{ metadata.title }}`.

> The commented-out Google Form section (lines 469–489) should be preserved in a comment within `index.njk`.

> **File extension:** All includes use `.njk` (Nunjucks) instead of `.html`. This is Eleventy convention and enables Nunjucks syntax highlighting in editors.

#### ✅ 1.5 Convert index.html to Eleventy Page

Create `src/index.njk`:

```html
---
layout: default.njk
title: Indecisive Devices | FTC Team
description: "Indecisive Devices - FIRST Tech Challenge Team"
---

{% include "hero.njk" %} {% include "about.njk" %} {% include "robots.njk" %} {%
include "sponsors.njk" %} {% include "get-involved.njk" %} {% include
"donate.njk" %}
```

> **Why `index.njk` not `index.md`?** Content is all HTML includes. Using `.njk` avoids Markdown processing surprises.

> **Why `.njk` not `.html`?** Using `.njk` clearly signals this is a template file processed by Nunjucks. Eleventy will output it as `index.html` in `_site/`.

#### ✅ 1.6 Update Passthrough Copy for Root-Level Assets

Since assets, CSS, and JS are at the project root (not inside `src/`), the `.eleventy.js` config already uses `addPassthroughCopy` to copy them to the output. The key insight:

```
Project root:
├── assets/         → copied to _site/assets/
├── css/            → copied to _site/css/
├── js/             → copied to _site/js/
├── src/
│   ├── index.njk   → processed to _site/index.html
│   ├── _layouts/
│   ├── _includes/
│   └── _data/
└── _site/          → build output (gitignored)
```

> **Why keep assets at root?** This avoids unnecessary path churn. The passthrough copy preserves all URLs.

#### ✅ 1.7 Test Phase 1

```bash
npx @11ty/eleventy --serve
```

This starts a dev server with live reload (BrowserSync built-in) at `localhost:8080`.

**Phase 1 checklist:**

- [x] `eleventy --serve` runs without build errors
- [x] Homepage loads at `localhost:8080`
- [x] Navbar visible with logo and all 6 links
- [x] Hero section renders with gradient and CTAs
- [x] All 6 sections scroll correctly via nav links
- [x] Team Photo and robot photos display
- [x] Both sponsor logos load (especially Johnson Matthey SVG)
- [x] Contact form submits and opens mail client
- [x] AOS animations trigger on scroll
- [x] Scroll-to-top button appears on scroll
- [x] No JavaScript errors in browser console
- [x] Mobile navbar hamburger works

**✅ Exit criteria:** Side-by-side comparison with baseline screenshots shows no visual differences.

---

### ✅ Phase 2: Data-Driven Content

**Goal:** Move sponsors and robots into data files for easier maintenance.

#### ✅ 2.1 Create `src/_data/sponsors.json`

```json
[
  {
    "name": "Johnson Matthey",
    "url": "https://matthey.com/about-us",
    "logo": "Johnson_Matthey _Logo_blue.svg",
    "logo_alt": "Johnson Matthey Logo",
    "tier": "platinum",
    "width": "250px"
  },
  {
    "name": "ACF Search",
    "url": "https://acfsearch.com",
    "logo": "acf-search.webp",
    "logo_alt": "ACF Search Logo",
    "tier": "gold",
    "width": "150px"
  }
]
```

> **JSON vs YAML:** Eleventy supports both. JSON is used here because it is native to the Node.js ecosystem and avoids YAML indentation pitfalls. You may use YAML (`sponsors.yaml`) if you prefer — Eleventy handles both identically.

> **Filename with space:** The Johnson Matthey `logo` value must include the space. This is a high break risk.

#### ✅ 2.2 Update `src/_includes/sponsors.njk` (data-driven)

```html
<section id="sponsors" class="sponsors-section py-5">
  <div class="container">
    <h2 class="section-title text-center mb-5" data-aos="fade-up">
      Our Sponsors
    </h2>
    <p
      class="text-center section-text mb-5"
      data-aos="fade-up"
      data-aos-delay="100"
    >
      We are grateful for the support of our amazing sponsors who make our team
      possible.
    </p>
    <div class="sponsor-tier mb-5">
      <div class="row justify-content-center">
        {% for sponsor in sponsors %}
        <div
          class="col-md-4 mb-4"
          data-aos="fade-up"
          data-aos-delay="{{ loop.index * 100 }}"
        >
          <div class="sponsor-logo">
            <a
              href="{{ sponsor.url }}"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/assets/{{ sponsor.logo }}"
                width="{{ sponsor.width }}"
                alt="{{ sponsor.logo_alt }}"
              />
            </a>
          </div>
        </div>
        {% endfor %}
      </div>
    </div>
    <p class="text-center mt-5" data-aos="fade-up">
      <strong>Interested in sponsoring us?</strong>
      <a href="#get-involved" class="highlight-link">Get in touch!</a>
    </p>
  </div>
</section>
```

> **Key Nunjucks features:**
>
> - `{% for sponsor in sponsors %}` — data file name becomes the variable directly.
> - `{{ loop.index * 100 }}` — Nunjucks uses `loop.index` and supports inline math.

#### ✅ 2.3 Create `src/_data/robots.json`

```json
{
  "current": {
    "name": "2025-2026 Season Robot",
    "season": "2025-2026",
    "image": "2025-26_bot.jpg",
    "image_alt": "2025-2026 Robot",
    "description": "Our flagship robot for the 2025-2026 season, designed and built by our talented team of engineers and mechanics.",
    "features": [
      { "label": "Drive System", "value": "Mecanum" },
      {
        "label": "Autonomous Capabilities",
        "value": "Pick up and launch game elements"
      },
      { "label": "Manipulators", "value": "Lift Kit and kicker mechanisms" },
      {
        "label": "Motor, Servo, and Sensor count",
        "value": "8 motors, 2 servos, and 3 sensors"
      }
    ]
  },
  "past": [
    {
      "name": "2024-2025 Robot",
      "image": "logo.png",
      "image_alt": "2024-2025 Robot",
      "status": "Coming Soon..."
    },
    {
      "name": "Upcoming Generations",
      "image": "logo.png",
      "image_alt": "Robot 2",
      "status": "Check back for more!"
    },
    {
      "name": "Future Innovations",
      "image": "logo.png",
      "image_alt": "Robot 3",
      "status": "The future is bright!"
    }
  ]
}
```

> **Real data, not placeholders.** The actual `index.html` has real robot specs (Mecanum drive, 8 motors, etc.).

#### ✅ 2.4 Update `src/_includes/robots.njk` (data-driven)

```html
<section id="robots" class="robots-section py-5">
  <div class="container">
    <h2 class="section-title text-center mb-5" data-aos="fade-up">
      Our Robots
    </h2>
    <div class="row mb-5">
      <div class="col-lg-6" data-aos="fade-right">
        <img
          src="/assets/{{ robots.current.image }}"
          alt="{{ robots.current.image_alt }}"
          class="img-fluid rounded-lg shadow-lg"
        />
      </div>
      <div class="col-lg-6" data-aos="fade-left">
        <h3 class="robot-title">{{ robots.current.name }}</h3>
        <p class="section-text">{{ robots.current.description }}</p>
        <h5>Key Features:</h5>
        <ul class="robot-features">
          {% for feature in robots.current.features %}
          <li><strong>{{ feature.label }}:</strong> {{ feature.value }}</li>
          {% endfor %}
        </ul>
      </div>
    </div>
    <div class="past-robots mt-5">
      <h4 class="mb-4" data-aos="fade-up">Past Robots</h4>
      <div class="row">
        {% for robot in robots.past %}
        <div
          class="col-md-4 mb-4"
          data-aos="fade-up"
          data-aos-delay="{{ loop.index * 100 }}"
        >
          <div class="robot-card">
            <img
              src="/assets/{{ robot.image }}"
              alt="{{ robot.image_alt }}"
              class="img-fluid rounded-lg"
              style="max-width: 40px; max-height: 50px; width: auto; height: auto;"
            />
            <h5 class="mt-3">{{ robot.name }}</h5>
            <p class="small text-muted">{{ robot.status }}</p>
          </div>
        </div>
        {% endfor %}
      </div>
    </div>
  </div>
</section>
```

> **Cleaner data access:** Eleventy's data cascade makes global data accessible directly by filename (e.g., `robots.current.image`).

#### ✅ 2.5 Test Phase 2

- [x] All sponsor logos render correctly with links
- [x] Johnson Matthey SVG loads (verify the space in filename)
- [x] Current robot section shows real specs (Mecanum, 8 motors, etc.)
- [x] Past robot cards display correctly (3 cards)
- [x] AOS delay animations stagger properly

**✅ Exit criteria:** Data-driven sections render identically to Phase 1.

---

### Phase 3: Polish, SEO, and Deployment

#### 3.1 SEO: Manual Meta Tags

Eleventy gives you full control over your layout templates. The layout already includes `<title>`, `<meta description>`, and `<meta author>`. For a single-page site like this, manual meta tags in the `<head>` of your layout are sufficient and highly recommended. No extra plugins are necessary.

#### 3.2 Generate a Sitemap

```bash
npm install --save-dev @11ty/eleventy-plugin-sitemap
```

Alternatively, since this is a single-page site, create a simple `src/sitemap.njk`:

```xml
---
permalink: /sitemap.xml
eleventyExcludeFromCollections: true
---
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>{{ metadata.url }}/</loc>
    <lastmod>{{ page.date | date: "%Y-%m-%d" }}</lastmod>
  </url>
</urlset>
```

#### 3.3 Branding Verification

**Color scheme (CSS variables — must be unchanged):**

- `--primary: #0ca598` (Teal) | `--secondary: #c7bb39` (Yellow) | `--accent: #c23e46` (Red)
- `--dark: #1a1a1a` | `--light: #f8f9fa`

**Typography:** Montserrat (headings: 600/700/800) + Lato (body: 400/500/700) via Google Fonts CDN.

**Key measurements:** Hero `min-height: 100vh`, navbar `padding: 1rem 0`, `py-5` sections, `--border-radius: 12px`, breakpoints at 992px/768px/576px.

#### 3.4 Final Verification Checklist

**Functional:**

- [ ] All 6 navbar links scroll to correct sections
- [ ] Active nav link highlighting works while scrolling
- [ ] Contact form validates and opens mail client
- [ ] Scroll-to-top button appears after scrolling 300px
- [ ] AOS animations trigger once on scroll
- [ ] Mobile navbar hamburger toggles and closes on link click

**Visual:**

- [ ] Navbar: dark gradient, teal brand name, white links
- [ ] Hero: teal gradient, yellow primary CTA, white-border secondary CTA
- [ ] Sponsor logos: correct sizes (250px / 150px)
- [ ] Robot cards: hover effect with shadow
- [ ] Footer: dark gradient, teal headings
- [ ] Responsive: single column on mobile, hamburger menu

**Technical:**

- [ ] No browser console errors
- [ ] No 404s in Network tab
- [ ] `npx @11ty/eleventy` completes without warnings

#### 3.5 Deploy via GitHub Actions

> **Deployment note:** GitHub Pages does **not** natively build Eleventy sites. You must use a GitHub Actions workflow to build and deploy.

Create `.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy Eleventy Site

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build Eleventy
        run: npx @11ty/eleventy

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: "_site"

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

> **GitHub Pages settings:** After merging, go to **Settings → Pages** and change the source from "Deploy from a branch" to **"GitHub Actions"**.

#### 3.6 Commit and Deploy

```bash
git add .
git commit -m "Migrate to Eleventy: structural conversion + data-driven content"
git push origin feature/eleventy-migration
```

Create a Pull Request, merge to `main`. The GitHub Actions workflow builds and deploys within ~1 minute.

---

## Section 3: Risk Analysis

| Risk                                 | Likelihood | Impact            | Mitigation                                                    |
| ------------------------------------ | ---------- | ----------------- | ------------------------------------------------------------- |
| **Johnson Matthey filename** (space) | High       | Broken image      | Match exact filename in data file                             |
| **Asset path changes**               | Medium     | 404 errors        | Use `addPassthroughCopy` for `assets/`, `css/`, `js/` at root |
| **Section ID changes**               | Low        | Broken nav        | Preserve all IDs unchanged                                    |
| **GitHub Pages deploy**              | Medium     | Site not updating | Requires GitHub Actions workflow                              |
| **Node.js version mismatch**         | Low        | Build failure     | Pin Node.js version in GitHub Actions + `.nvmrc`              |
| **Nunjucks syntax**                  | Low        | Template errors   | Nunjucks uses `loop.index`, `or` for fallback values, etc.    |

### Rollback Plan

```bash
git revert HEAD
git push origin main
# GitHub Actions auto-redeploys within ~1 minute
```

---

## Section 4: Proposed Eleventy Directory Structure

```
indecisivedevices.github.io/
├── .eleventy.js                # Eleventy configuration
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deploy workflow
├── src/                        # Source directory
│   ├── _layouts/
│   │   └── default.njk
│   ├── _includes/
│   │   ├── header.njk
│   │   ├── hero.njk
│   │   ├── about.njk
│   │   ├── robots.njk
│   │   ├── sponsors.njk
│   │   ├── get-involved.njk
│   │   ├── donate.njk
│   │   └── footer.njk
│   ├── _data/
│   │   ├── metadata.json       # Site-wide settings (replaces _config.yml)
│   │   ├── sponsors.json
│   │   └── robots.json
│   └── index.njk               # Homepage (front matter + includes)
├── assets/                     # Images (unchanged location, passthrough copy)
├── css/
│   └── style.css               # Unchanged (passthrough copy)
├── js/
│   └── main.js                 # Unchanged (passthrough copy)
├── package.json
├── .nvmrc                      # Optional: pin Node.js version
└── .gitignore                  # Updated with Eleventy entries
```

> **Structure note:** All template files live inside `src/`, while static assets remain at the project root. The `_site/` output mirrors the same URL structure.

## Section 5: Future Enhancements (Post-Migration)

1. **Blog system** — Eleventy collections with `src/posts/` directory
2. **SCSS/PostCSS** — Add `eleventy-plugin-sass` or PostCSS for CSS preprocessing
3. **Team profiles** — `src/_data/team.json`
4. **Events calendar** — `src/_data/events.json`
5. **Image optimization** — Use `@11ty/eleventy-img` plugin to auto-resize and convert images (WebP, AVIF)
6. **SRI tags** — Subresource Integrity for CDN scripts
7. **Rename** — Remove space from `Johnson_Matthey _Logo_blue.svg`
8. **Contact form** — Consider Formspree instead of mailto
9. **RSS feed** — `@11ty/eleventy-plugin-rss` for blog posts
10. **Incremental builds** — Eleventy supports incremental builds for faster development

> **Eleventy advantage:** The `@11ty/eleventy-img` plugin can automatically optimize the large images (`logo.png` at 1.9MB, `2025-26_bot.jpg` at 1.2MB) during the build — generating responsive sizes and modern formats (WebP/AVIF) without manual work.
