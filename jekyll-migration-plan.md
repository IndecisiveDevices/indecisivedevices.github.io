# Jekyll Migration Plan: Indecisive Devices Website (Opus)

**Version:** 1.0  
**Date:** March 6, 2026  
**Author:** Senior Web Developer (Opus review)  
**Goal:** Migrate the current static SPA to Jekyll on GitHub Pages with zero visual regressions  

---

## Executive Summary

The Indecisive Devices website is a single-page application built with vanilla HTML/CSS/JS, Bootstrap 5, AOS animations, and Google Fonts. The migration to Jekyll is **low-risk** because the site has no backend dependencies, the CSS is self-contained with CSS custom properties, and the JavaScript is entirely client-side.

**Estimated effort:** 2–3 focused sessions (6–10 hours total, including local Ruby/Bundler setup)  
**Risk level:** Low (incremental migration with Git branching)  
**Outcome:** Identical visual experience + data-driven content via YAML + easier long-term maintenance  

---

## Section 1: Architectural Assessment

### 1.1 Current Project Inventory

| File | Size | Purpose |
|------|------|---------|
| `index.html` | 543 lines / 19 KB | Monolithic SPA with all sections |
| `css/style.css` | 712 lines / 12 KB | Complete styling with CSS variables, responsive breakpoints |
| `js/main.js` | 371 lines / 10 KB | AOS init, contact form (mailto), smooth scroll, active nav, scroll-to-top |
| `assets/logo.png` | 1.9 MB | Team logo (used in navbar, hero, placeholders) |
| `assets/2025-26_bot.jpg` | 1.2 MB | Current season robot photo |
| `assets/Team Photo.jpg` | 965 KB | Team photo (About section) |
| `assets/Johnson_Matthey _Logo_blue.svg` | 12 KB | Sponsor logo (**space in filename**) |
| `assets/acf-search.webp` | 23 KB | Sponsor logo |
| `data/` | empty | Unused directory |
| `.gitignore` | Node.js template (no Jekyll entries yet) |
| `README.md` | References `docs/` folder and `FtcRobotController` URL — **outdated** |

### 1.2 Current Architecture

- **Content delivery:** Single monolithic HTML file with anchor-based navigation
- **Styling:** Centralized CSS with `:root` custom properties for brand colors
- **Interactivity:** Bootstrap 5.3.0 (CDN) + AOS 2.3.1 (CDN) + custom vanilla JS
- **Fonts:** Google Fonts CDN — Montserrat (headings) + Lato (body)
- **Contact form:** Client-side `mailto:ShamRobotics@outlook.com` with form validation
- **Hosting:** GitHub Pages user/org site at `https://indecisivedevices.github.io/`

### 1.3 Sections in index.html (in order)

| Section | Lines | ID | Notes |
|---------|-------|----|-------|
| Navigation | 35–80 | — | Fixed navbar, Bootstrap collapse |
| Hero | 82–110 | `home` | Gradient background, CTAs, logo image |
| About | 112–149 | `about` | Team photo (`Team Photo.jpg`), mission text |
| Robots | 151–249 | `robots` | Current bot (`2025-26_bot.jpg`) + 3 past robot cards |
| Sponsors | 251–307 | `sponsors` | 2 sponsors: Johnson Matthey (platinum), ACF Search (gold) |
| Get Involved | 309–417 | `get-involved` | 3 involvement cards + contact form |
| Donate | 419–467 | `donate` | Mission/benefits list + QR placeholder |
| Google Form | 469–489 | `google-form` | **Commented out** (Trivia Night iframe) |
| Footer | 491–531 | — | Quick links, social emoji icons, copyright |

### 1.4 What Should Become Data-Driven vs. Static

**Data-driven (_data/ YAML):**
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
Phase 1 (2-3 hours)   -> Structural conversion: get Jekyll building identically
Phase 2 (2-3 hours)   -> Data-driven content: sponsors + robots via YAML
Phase 3 (1-2 hours)   -> Polish: verification, SEO, cleanup
```

---

### Phase 0: Preflight and Safety Net

**Objective:** Ensure you can always roll back quickly.

#### 0.1 Create migration branch
```bash
git checkout -b feature/jekyll-migration
```

#### 0.2 Capture baseline screenshots
Take screenshots at 3 viewports (desktop 1440px, tablet 768px, mobile 390px).

#### 0.3 Confirm asset inventory
Verify these exact filenames (note the space in the Johnson Matthey filename):
```
assets/logo.png
assets/2025-26_bot.jpg
assets/Team Photo.jpg
assets/Johnson_Matthey _Logo_blue.svg   <-- space before _Logo
assets/acf-search.webp
```

#### 0.4 Set up local Jekyll environment
```bash
gem install jekyll bundler
```

Create `Gemfile`:
```ruby
source "https://rubygems.org"
gem "github-pages", group: :jekyll_plugins
```

> **Why `github-pages` gem?** GitHub Pages pins specific Jekyll and plugin versions. Developing against this gem prevents "works locally, fails on Pages" issues.

```bash
bundle install
```

#### 0.5 Update .gitignore for Jekyll
Add at the end of the existing `.gitignore`:
```
# Jekyll
_site/
.sass-cache/
.jekyll-cache/
.jekyll-metadata
Gemfile.lock
```

**Exit criteria:** Branch exists, baseline screenshots captured, `bundle install` succeeds, `.gitignore` updated.

---

### Phase 1: Structural Conversion (Zero Visual Changes)

**Goal:** Jekyll builds and produces HTML identical to the current site.

#### 1.1 Create `_config.yml`

```yaml
# Site settings
title: Indecisive Devices
description: "Indecisive Devices - FIRST Tech Challenge Team"
author: Indecisive Devices
url: https://indecisivedevices.github.io
baseurl: ""

# Build settings
markdown: kramdown
kramdown:
  input: GFM

# Plugins (GitHub Pages whitelisted only)
plugins:
  - jekyll-seo-tag
  - jekyll-sitemap

# Exclude from build
exclude:
  - Gemfile
  - Gemfile.lock
  - README.md
  - jekyll-migration-plan.md
  - jekyll-migration-plan-haiku.md
  - jekyll-migration-plan-opus.md
  - jekyll-migration-final-plan.md
  - data/

# Defaults
defaults:
  - scope:
      path: ""
    values:
      layout: default
```

> **Corrections from other plans:**
> - The Haiku plan included `jekyll-compress-html` — this is **NOT** a GitHub Pages whitelisted plugin. Removed.
> - Neither plan excluded all the migration plan `.md` files from the build.
> - Both plans mentioned `sass` config — not needed since we keep CSS as-is.

#### 1.2 Create `_layouts/default.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="{{ page.description | default: site.description }}" />
    <meta name="author" content="{{ site.author }}" />
    <title>{{ page.title | default: site.title }}</title>

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Lato:wght@400;500;700&display=swap"
      rel="stylesheet"
    />

    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />

    <!-- AOS (Animate On Scroll) -->
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet" />

    <!-- Custom Styles -->
    <link rel="stylesheet" href="{{ '/css/style.css' | relative_url }}" />

    {% seo %}
  </head>
  <body>
    {% include header.html %}

    {{ content }}

    {% include footer.html %}

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

    <!-- AOS JS -->
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>

    <!-- Custom JS -->
    <script src="{{ '/js/main.js' | relative_url }}"></script>
  </body>
</html>
```

> **Key decisions:**
> - CSS stays at `css/style.css` (not moved to `assets/css/`). This avoids path churn. The Haiku plan proposed moving — unnecessary.
> - JS stays at `js/main.js` for the same reason.
> - The `<title>` avoids duplication — the Haiku plan used `{{ page.title }} | {{ site.title }}` which would produce "Indecisive Devices | Indecisive Devices" on the homepage.

#### 1.3 Extract Includes

Create `_includes/` directory with files extracted from `index.html`:

- **`_includes/header.html`** (Lines 34–80): Navbar. Replace hardcoded brand text with `{{ site.title }}`. Keep all nav link anchors unchanged.
- **`_includes/hero.html`** (Lines 82–110): Keep `id="home"`. Image paths use `relative_url` filter.
- **`_includes/about.html`** (Lines 112–149): Image `src="assets/Team Photo.jpg"` uses `relative_url`.
- **`_includes/robots.html`** (Lines 151–249): Keep hardcoded for Phase 1. Update image paths with `relative_url`.
- **`_includes/sponsors.html`** (Lines 251–307): Keep hardcoded for Phase 1. **Preserve exact Johnson Matthey filename with space.**
- **`_includes/get-involved.html`** (Lines 309–417): Includes involvement cards AND contact form. Keep form `id="contact-form"` (JS depends on it).
- **`_includes/donate.html`** (Lines 419–467): Keep `id="donate"` unchanged.
- **`_includes/footer.html`** (Lines 491–531): Replace hardcoded team name with `{{ site.title }}`.

> The commented-out Google Form section (lines 469–489) should be preserved in a comment within `index.html`.

#### 1.4 Convert index.html to Jekyll Page

```html
---
layout: default
title: Indecisive Devices | FTC Team
description: "Indecisive Devices - FIRST Tech Challenge Team"
---

{% include hero.html %}
{% include about.html %}
{% include robots.html %}
{% include sponsors.html %}
{% include get-involved.html %}
{% include donate.html %}
```

> **Why `index.html` not `index.md`?** Content is all HTML includes. Using `.html` avoids Markdown processing surprises. The Haiku plan used `index.md` but content was raw HTML.

#### 1.5 Test Phase 1

```bash
bundle exec jekyll serve
```

**Phase 1 checklist:**
- [ ] `jekyll serve` runs without build errors
- [ ] Homepage loads at `localhost:4000`
- [ ] Navbar visible with logo and all 6 links
- [ ] Hero section renders with gradient and CTAs
- [ ] All 6 sections scroll correctly via nav links
- [ ] Team Photo and robot photos display
- [ ] Both sponsor logos load (especially Johnson Matthey SVG)
- [ ] Contact form submits and opens mail client
- [ ] AOS animations trigger on scroll
- [ ] Scroll-to-top button appears on scroll
- [ ] No JavaScript errors in browser console
- [ ] Mobile navbar hamburger works

**Exit criteria:** Side-by-side comparison with baseline screenshots shows no visual differences.

---

### Phase 2: Data-Driven Content

**Goal:** Move sponsors and robots into YAML for easier maintenance.

#### 2.1 Create `_data/sponsors.yml`

```yaml
- name: "Johnson Matthey"
  url: "https://matthey.com/about-us"
  logo: "Johnson_Matthey _Logo_blue.svg"
  logo_alt: "Johnson Matthey Logo"
  tier: platinum
  width: "250px"

- name: "ACF Search"
  url: "https://acfsearch.com"
  logo: "acf-search.webp"
  logo_alt: "ACF Search Logo"
  tier: gold
  width: "150px"
```

> **Filename with space:** The Johnson Matthey `logo` value must include the space. Both other plans had the filename wrong. This is the #1 break risk.

#### 2.2 Update `_includes/sponsors.html` (data-driven)

```html
<section id="sponsors" class="sponsors-section py-5">
  <div class="container">
    <h2 class="section-title text-center mb-5" data-aos="fade-up">Our Sponsors</h2>
    <p class="text-center section-text mb-5" data-aos="fade-up" data-aos-delay="100">
      We are grateful for the support of our amazing sponsors who make our team possible.
    </p>
    <div class="sponsor-tier mb-5">
      <div class="row justify-content-center">
        {% for sponsor in site.data.sponsors %}
        <div class="col-md-4 mb-4" data-aos="fade-up" data-aos-delay="{{ forloop.index | times: 100 }}">
          <div class="sponsor-logo">
            <a href="{{ sponsor.url }}" target="_blank" rel="noopener noreferrer">
              <img src="{{ '/assets/' | append: sponsor.logo | relative_url }}"
                   width="{{ sponsor.width }}" alt="{{ sponsor.logo_alt }}" />
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

#### 2.3 Create `_data/robots.yml`

```yaml
current:
  name: "2025-2026 Season Robot"
  season: "2025-2026"
  image: "2025-26_bot.jpg"
  image_alt: "2025-2026 Robot"
  description: "Our flagship robot for the 2025-2026 season, designed and built by our talented team of engineers and mechanics."
  features:
    - label: "Drive System"
      value: "Mecanum"
    - label: "Autonomous Capabilities"
      value: "Pick up and launch game elements"
    - label: "Manipulators"
      value: "Lift Kit and kicker mechanisms"
    - label: "Motor, Servo, and Sensor count"
      value: "8 motors, 2 servos, and 3 sensors"

past:
  - name: "2024-2025 Robot"
    image: "logo.png"
    image_alt: "2024-2025 Robot"
    status: "Coming Soon..."
  - name: "Upcoming Generations"
    image: "logo.png"
    image_alt: "Robot 2"
    status: "Check back for more!"
  - name: "Future Innovations"
    image: "logo.png"
    image_alt: "Robot 3"
    status: "The future is bright!"
```

> **Correction:** The Haiku plan used placeholder text `[Placeholder - Drive type]` for robot features. The actual `index.html` has real data (Mecanum drive, 8 motors, etc.). This plan uses the real values.

#### 2.4 Update `_includes/robots.html` (data-driven)

```html
<section id="robots" class="robots-section py-5">
  <div class="container">
    <h2 class="section-title text-center mb-5" data-aos="fade-up">Our Robots</h2>
    <div class="row mb-5">
      <div class="col-lg-6" data-aos="fade-right">
        <img src="{{ '/assets/' | append: site.data.robots.current.image | relative_url }}"
             alt="{{ site.data.robots.current.image_alt }}" class="img-fluid rounded-lg shadow-lg" />
      </div>
      <div class="col-lg-6" data-aos="fade-left">
        <h3 class="robot-title">{{ site.data.robots.current.name }}</h3>
        <p class="section-text">{{ site.data.robots.current.description }}</p>
        <h5>Key Features:</h5>
        <ul class="robot-features">
          {% for feature in site.data.robots.current.features %}
          <li><strong>{{ feature.label }}:</strong> {{ feature.value }}</li>
          {% endfor %}
        </ul>
      </div>
    </div>
    <div class="past-robots mt-5">
      <h4 class="mb-4" data-aos="fade-up">Past Robots</h4>
      <div class="row">
        {% for robot in site.data.robots.past %}
        <div class="col-md-4 mb-4" data-aos="fade-up" data-aos-delay="{{ forloop.index | times: 100 }}">
          <div class="robot-card">
            <img src="{{ '/assets/' | append: robot.image | relative_url }}" alt="{{ robot.image_alt }}"
                 class="img-fluid rounded-lg"
                 style="max-width: 40px; max-height: 50px; width: auto; height: auto;" />
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

#### 2.5 Test Phase 2

- [ ] All sponsor logos render correctly with links
- [ ] Johnson Matthey SVG loads (verify the space in filename)
- [ ] Current robot section shows real specs (Mecanum, 8 motors, etc.)
- [ ] Past robot cards display correctly (3 cards)
- [ ] AOS delay animations stagger properly

**Exit criteria:** Data-driven sections render identically to Phase 1.

---

### Phase 3: Polish, SEO, and Verification

#### 3.1 Branding Verification

**Color scheme (CSS variables — must be unchanged):**
- `--primary: #0ca598` (Teal) | `--secondary: #c7bb39` (Yellow) | `--accent: #c23e46` (Red)
- `--dark: #1a1a1a` | `--light: #f8f9fa`

**Typography:** Montserrat (headings: 600/700/800) + Lato (body: 400/500/700) via Google Fonts CDN.

**Key measurements:** Hero `min-height: 100vh`, navbar `padding: 1rem 0`, `py-5` sections, `--border-radius: 12px`, breakpoints at 992px/768px/576px.

#### 3.2 Final Verification Checklist

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
- [ ] `jekyll build` completes without warnings

#### 3.3 Deploy

```bash
git add .
git commit -m "Migrate to Jekyll: structural conversion + data-driven content"
git push origin feature/jekyll-migration
```

Create a Pull Request, merge to `main`. GitHub Pages auto-builds within 2–3 minutes.

---

## Section 3: Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Johnson Matthey filename** (space) | High | Broken image | Match exact filename in YAML |
| **Asset path changes** | Medium | 404 errors | Keep `css/`, `js/`, `assets/` at root |
| **Section ID changes** | Low | Broken nav | Preserve all IDs unchanged |
| **GitHub Pages version mismatch** | Medium | Build failure | Use `github-pages` gem locally |
| **Non-whitelisted plugin** | Medium | Build failure | Only use plugins from Pages dependency list |

### Rollback Plan

```bash
git revert HEAD
git push origin main
# GitHub Pages redeploys automatically in 2-3 minutes
```

---

## Section 4: Proposed Jekyll Directory Structure

```
indecisivedevices.github.io/
├── _config.yml
├── _layouts/
│   └── default.html
├── _includes/
│   ├── header.html
│   ├── hero.html
│   ├── about.html
│   ├── robots.html
│   ├── sponsors.html
│   ├── get-involved.html
│   ├── donate.html
│   └── footer.html
├── _data/
│   ├── sponsors.yml
│   └── robots.yml
├── assets/                     # Images (unchanged location)
├── css/
│   └── style.css               # Unchanged
├── js/
│   └── main.js                 # Unchanged
├── index.html                  # Homepage (front matter + includes)
├── Gemfile
└── .gitignore                  # Updated with Jekyll entries
```

> Both other plans proposed moving CSS to `assets/css/` and JS to `assets/js/`. This is unnecessary churn that risks path breakage.

---

## Section 5: Comparison with Other Plans

### vs. Haiku Plan (jekyll-migration-plan-haiku.md)

| Topic | Haiku Plan | This Plan | Verdict |
|-------|-----------|-----------|---------|
| Timeline | 4–6 hours | 6–10 hours | **This plan** — includes Ruby setup |
| Index file | `index.md` | `index.html` | **This plan** — content is HTML, not Markdown |
| Asset paths | Move to `assets/css/`, `assets/js/` | Keep at `css/`, `js/` | **This plan** — less churn |
| Plugins | Includes `jekyll-compress-html` | Excludes it | **This plan** — not whitelisted |
| Robot specs | Placeholder text | Real data (Mecanum, etc.) | **This plan** — matches source |
| SCSS conversion | Proposed in Phase 1 | Deferred | **This plan** — no immediate benefit |
| Title tag | `page.title \| site.title` | `page.title \| default: site.title` | **This plan** — avoids duplication |
| Sponsor filename | Missing space | Includes space | **This plan** — matches disk |
| Google Form section | Not mentioned | Preserved in comment | **This plan** |
| Phase 0 (preflight) | Not included | Included | **This plan** — safety net |

### vs. Sonnet Plan (jekyll-migration-plan.md)

| Topic | Sonnet Plan | This Plan | Verdict |
|-------|-----------|-----------|---------|
| Timeline | 8 days | 2–3 sessions | **This plan** — 8 days is excessive |
| Sponsor YAML | Nested by tier | Flat list with tier field | **Either works** — flat is simpler |
| Robot image | `logo.png` for current | `2025-26_bot.jpg` (actual) | **This plan** — matches source |
| `_includes/head.html` | Separate include | Kept in layout | **Either works** |
| Separate pages | `pages/robots.md`, etc. | Not in Phase 1 | **Defer** — this is an SPA |
| Gzip claim | "Enable gzip on Pages" | Not mentioned | **This plan** — you can't control this |
| Logo optimization | Target <200KB | Noted as future task | **Agree** — separate from migration |

---

## Section 6: Future Enhancements (Post-Migration)

1. **Blog system** — `_posts/` for team updates
2. **SCSS conversion** — Move CSS to `_sass/` for variables/mixins
3. **Team profiles** — `_data/team.yml`
4. **Events calendar** — `_data/events.yml`
5. **Image optimization** — Compress `logo.png` (1.9MB) and `2025-26_bot.jpg` (1.2MB)
6. **SRI tags** — Subresource Integrity for CDN scripts
7. **Rename** — Remove space from `Johnson_Matthey _Logo_blue.svg`
8. **Contact form** — Consider Formspree instead of mailto
