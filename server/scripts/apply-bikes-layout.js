const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', '..', 'assets', 'css', 'style.css');
const jsPath = path.join(__dirname, '..', '..', 'assets', 'js', 'app.js');
const bikesHtmlPath = path.join(__dirname, '..', '..', 'pages', 'bikes.html');

let css = fs.readFileSync(cssPath, 'utf8').replace(/\r\n/g, '\n');
let js = fs.readFileSync(jsPath, 'utf8').replace(/\r\n/g, '\n');
let bikesHtml = fs.readFileSync(bikesHtmlPath, 'utf8').replace(/\r\n/g, '\n');

// 1. Add body[data-page="bikes"] .container right after line .container { width: min(var(--max), calc(100% - 32px)); margin-inline: auto; }
const oldContainerRule = '.container { width: min(var(--max), calc(100% - 32px)); margin-inline: auto; }';
const newContainerRule = `.container { width: min(var(--max), calc(100% - 32px)); margin-inline: auto; }
body[data-page="bikes"] .container { width: min(94%, 1600px); margin-inline: auto; }`;

if (!css.includes(oldContainerRule)) {
  console.error('Target oldContainerRule not found in style.css');
  process.exit(1);
}
css = css.replace(oldContainerRule, newContainerRule);
console.log('✓ Added expanded container rule for Explore Fleet page.');

// 2. Update brand filter bar & riding style bar
const oldBrandBar = `/* 🏍️ Brand Filter Bar & Riding Style Chips */
.brand-filter-bar { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px; margin: 10px 0 6px; scrollbar-width: none; }
.brand-filter-bar::-webkit-scrollbar { display: none; }
.brand-filter-chip { padding: 5px 12px; border-radius: 999px; background: var(--surface); border: 1px solid var(--line); font-size: 11px; font-weight: 700; color: var(--ink); white-space: nowrap; cursor: pointer; transition: all 0.2s ease; }
.brand-filter-chip:hover, .brand-filter-chip.active { border-color: var(--lime, #f59e0b); background: var(--lime, #f59e0b); color: #070a0f; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(255,184,0,0.25); }

.riding-style-bar { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px; margin: 6px 0 14px; scrollbar-width: none; }
.riding-style-bar::-webkit-scrollbar { display: none; }
.riding-style-chip { padding: 5px 12px; border-radius: 999px; background: var(--paper); border: 1px solid var(--line); font-size: 11px; font-weight: 700; color: var(--ink-soft); white-space: nowrap; cursor: pointer; transition: all 0.2s ease; }
.riding-style-chip:hover, .riding-style-chip.active { border-color: var(--gold, #d97706); background: rgba(251,191,36,0.12); color: var(--ink); font-weight: 800; }
body.dark .riding-style-chip:hover, body.dark .riding-style-chip.active { border-color: var(--gold, #fbbf24); background: rgba(251,191,36,0.18); }`;

const newBrandBar = `/* 🏍️ Brand Filter Bar & Riding Style Chips */
.brand-filter-bar { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0 8px; padding-bottom: 2px; }
.brand-filter-bar::-webkit-scrollbar { display: none; }
.brand-filter-chip { padding: 6px 14px; border-radius: 999px; background: var(--surface); border: 1px solid var(--line); font-size: 11.5px; font-weight: 700; color: var(--ink); white-space: nowrap; cursor: pointer; transition: all 0.2s ease; }
.brand-filter-chip:hover, .brand-filter-chip.active { border-color: var(--lime, #f59e0b); background: var(--lime, #f59e0b); color: #070a0f; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(255,184,0,0.25); }

.riding-style-bar { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0 18px; padding-bottom: 2px; }
.riding-style-bar::-webkit-scrollbar { display: none; }
.riding-style-chip { padding: 6px 14px; border-radius: 999px; background: var(--paper); border: 1px solid var(--line); font-size: 11.5px; font-weight: 700; color: var(--ink-soft); white-space: nowrap; cursor: pointer; transition: all 0.2s ease; }
.riding-style-chip:hover, .riding-style-chip.active { border-color: var(--gold, #d97706); background: rgba(251,191,36,0.12); color: var(--ink); font-weight: 800; }
body.dark .riding-style-chip:hover, body.dark .riding-style-chip.active { border-color: var(--gold, #fbbf24); background: rgba(251,191,36,0.18); }`;

if (!css.includes(oldBrandBar)) {
  console.error('Target oldBrandBar not found in style.css');
  process.exit(1);
}
css = css.replace(oldBrandBar, newBrandBar);
console.log('✓ Updated brand and riding style chip bars.');

// 3. Update Natural Language AI search styling
const oldNlSearch = `/* 🗣️ Natural Language Search Engine Styling */
.nl-search-container { background: var(--surface); border: 1.5px solid var(--lime); border-radius: 18px; padding: 20px; margin-bottom: 24px; box-shadow: var(--shadow-sm); }
.nl-search-input-wrap { display: flex; gap: 8px; align-items: center; margin-top: 10px; }
.nl-search-input { flex: 1; min-height: 46px; padding: 0 16px; border-radius: 12px; border: 1px solid var(--line); font-size: 13px; font-weight: 700; color: var(--ink); outline: 0; background: var(--paper); transition: border-color .2s; }
.nl-search-input:focus { border-color: var(--lime); box-shadow: 0 0 0 3px rgba(255,184,0,0.2); }
.nl-prompt-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.nl-prompt-chip { padding: 5px 12px; border-radius: 999px; background: var(--paper); border: 1px solid var(--line); font-size: 11px; font-weight: 700; color: var(--ink); cursor: pointer; transition: all 0.2s ease; }
.nl-prompt-chip:hover { border-color: var(--gold, #f59e0b); background: rgba(251,191,36,0.12); transform: translateY(-1px); }`;

const newNlSearch = `/* 🗣️ Natural Language Search Engine Styling */
.nl-search-container { background: var(--surface); border: 1.5px solid var(--lime); border-radius: 18px; padding: 22px 28px; margin-bottom: 22px; box-shadow: var(--shadow-sm); width: 100%; box-sizing: border-box; }
.nl-search-input-wrap { display: flex; gap: 12px; align-items: center; margin-top: 12px; width: 100%; }
.nl-search-input { flex: 1; min-height: 50px; padding: 0 20px; border-radius: 12px; border: 1.5px solid var(--line); font-size: 14px; font-weight: 600; color: var(--ink); outline: 0; background: var(--paper); transition: border-color .2s; width: 100%; }
.nl-search-input:focus { border-color: var(--lime); box-shadow: 0 0 0 3px rgba(255,184,0,0.2); }
#nl-search-btn { min-height: 50px; padding: 0 26px; border-radius: 12px; font-size: 13.5px; font-weight: 800; white-space: nowrap; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; }
.nl-prompt-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; align-items: center; }
.nl-prompt-chip { padding: 6px 14px; border-radius: 999px; background: var(--paper); border: 1px solid var(--line); font-size: 11.5px; font-weight: 700; color: var(--ink); cursor: pointer; transition: all 0.2s ease; }
.nl-prompt-chip:hover { border-color: var(--gold, #f59e0b); background: rgba(251,191,36,0.12); transform: translateY(-1px); }`;

if (!css.includes(oldNlSearch)) {
  console.error('Target oldNlSearch not found in style.css');
  process.exit(1);
}
css = css.replace(oldNlSearch, newNlSearch);
console.log('✓ Updated Natural Language AI search bar styling.');

// 4. Update fleet hero content & typography
const oldFleetHero = `.fleet-hero-container {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  width: 100%;
  padding-top: 32px;
  padding-bottom: 32px;
}

.fleet-hero-content {
  max-width: 620px;
}

.fleet-breadcrumbs {
  display: none !important;
}

.fleet-bread-bar {
  display: none !important;
}

.fleet-bread-active {
  display: none !important;
}

.fleet-hero-eyebrow {
  display: none !important;
}

.fleet-hero-title {
  margin: 4px 0 8px;
  font-size: clamp(28px, 4vw, 44px);
  font-family: var(--font-serif);
  line-height: 1.15;
  color: #ffffff;
  letter-spacing: -0.02em;
}

.fleet-hero-accent {
  color: #f5a900 !important;
  font-style: italic;
  font-weight: 700;
  text-shadow: 0 0 24px rgba(245, 169, 0, 0.35);
}

.fleet-hero-desc {
  color: #cbd5e1;
  font-size: 13.5px;
  line-height: 1.6;
  margin: 0;
  max-width: 520px;
}`;

const newFleetHero = `.fleet-hero-container {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  width: 100%;
  padding-top: 36px;
  padding-bottom: 36px;
}

.fleet-hero-content {
  max-width: 800px;
}

.fleet-breadcrumbs {
  display: none !important;
}

.fleet-bread-bar {
  display: none !important;
}

.fleet-bread-active {
  display: none !important;
}

.fleet-hero-eyebrow {
  display: none !important;
}

.fleet-hero-title {
  margin: 4px 0 10px;
  font-size: clamp(30px, 3.8vw, 48px);
  font-family: var(--font-serif);
  line-height: 1.15;
  color: #ffffff;
  letter-spacing: -0.02em;
}

.fleet-hero-accent {
  color: #f5a900 !important;
  font-style: italic;
  font-weight: 700;
  text-shadow: 0 0 24px rgba(245, 169, 0, 0.35);
}

.fleet-hero-desc {
  color: #cbd5e1;
  font-size: 14.5px;
  line-height: 1.6;
  margin: 0;
  max-width: 650px;
}`;

if (!css.includes(oldFleetHero)) {
  console.error('Target oldFleetHero not found in style.css');
  process.exit(1);
}
css = css.replace(oldFleetHero, newFleetHero);
console.log('✓ Updated fleet hero content and typography.');

// 5. Update catalog layout, filters, search tools, catalog grid, and responsive rules
const oldCatalogBlock = `.catalog-layout { display: grid; grid-template-columns: 250px 1fr; gap: 24px; align-items: start; }
.filters { position: sticky; top: 86px; padding: 16px; border-radius: 16px; }
.filter-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.filter-head h3 { margin: 0; font-size: 14px; font-weight: 800; color: var(--ink); }
.clear { background: none; border: 0; color: var(--gold, #d97706); font-size: 11px; font-weight: 800; cursor: pointer; padding: 2px 4px; }
body.dark .clear { color: var(--gold, #fbbf24); }
.filter-group { padding: 9px 0; border-top: 1px solid var(--line); }
.filter-group strong { display: block; margin-bottom: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--ink-soft); letter-spacing: 0.06em; }
.check { display: flex; align-items: center; justify-content: space-between; margin: 4px 0; font-size: 11.5px; color: var(--ink); cursor: pointer; transition: color 0.15s ease; }
.check:hover { color: var(--gold, #d97706); }
body.dark .check:hover { color: var(--gold, #fbbf24); }
.check input[type="checkbox"] { accent-color: var(--gold, #f59e0b); cursor: pointer; width: 14px; height: 14px; }

/* Compact Scroll for Brand List */
.filter-brand-scroll { max-height: 140px; overflow-y: auto; padding-right: 4px; scrollbar-width: thin; }
.filter-brand-scroll::-webkit-scrollbar { width: 4px; }
.filter-brand-scroll::-webkit-scrollbar-thumb { background: var(--line); border-radius: 4px; }

/* Inline Transmission Row */
.filter-transmission-row { display: flex; gap: 10px; align-items: center; }
.filter-transmission-row .check { flex: 1; margin: 0; padding: 4px 8px; background: var(--paper); border: 1px solid var(--line); border-radius: 8px; }

/* Modern Fleet Budget Slider Component */
.budget-filter-group { padding: 6px 0 10px; }
.budget-header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.budget-header-row strong { margin-bottom: 0 !important; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-soft); }
.budget-badge { font-size: 11px; font-weight: 700; font-family: var(--font-mono, monospace); padding: 2px 7px; border-radius: 6px; background: rgba(212, 175, 55, 0.12); color: #b48310; border: 1px solid rgba(212, 175, 55, 0.35); transition: all 0.2s ease; white-space: nowrap; }
body.dark .budget-badge { background: rgba(212, 175, 55, 0.18); color: #fbbf24; border-color: rgba(251, 191, 36, 0.35); }
.modern-slider-wrap { position: relative; width: 100%; margin-bottom: 6px; }
.modern-price-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 5px; border-radius: 4px; background: linear-gradient(to right, #d4af37 0%, #d4af37 100%, rgba(148, 163, 184, 0.25) 100%, rgba(148, 163, 184, 0.25) 100%); outline: none; cursor: pointer; margin: 6px 0 4px; transition: background 0.15s ease; }
body.dark .modern-price-slider { background: linear-gradient(to right, #fbbf24 0%, #fbbf24 100%, rgba(255, 255, 255, 0.12) 100%, rgba(255, 255, 255, 0.12) 100%); }
.modern-price-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #d4af37; border: 2px solid #ffffff; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25); cursor: grab; transition: transform 0.15s ease, box-shadow 0.15s ease; }
body.dark .modern-price-slider::-webkit-slider-thumb { background: #fbbf24; border: 2px solid #070a0f; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6); }
.modern-price-slider::-webkit-slider-thumb:hover { transform: scale(1.18); box-shadow: 0 0 10px rgba(212, 175, 55, 0.6); }
.modern-price-slider:active::-webkit-slider-thumb { cursor: grabbing; transform: scale(1.25); }
.modern-price-slider::-moz-range-thumb { width: 16px; height: 16px; border-radius: 50%; background: #d4af37; border: 2px solid #ffffff; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25); cursor: grab; transition: transform 0.15s ease, box-shadow 0.15s ease; }
body.dark .modern-price-slider::-moz-range-thumb { background: #fbbf24; border: 2px solid #070a0f; }
.budget-range-ticks { display: flex; justify-content: space-between; font-size: 9.5px; color: var(--ink-soft); font-family: var(--font-mono, monospace); margin-top: 1px; }
.budget-quick-pills { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin-top: 8px; }
.budget-pill-btn { width: 100%; padding: 3px 2px; font-size: 9.5px; font-weight: 700; border-radius: 8px; background: var(--paper, rgba(148, 163, 184, 0.08)); color: var(--ink-soft); border: 1px solid var(--line); cursor: pointer; transition: all 0.15s ease; line-height: 1.2; text-align: center; white-space: nowrap; }
.budget-pill-btn:hover { border-color: #d4af37; color: var(--ink); }
.budget-pill-btn.active { background: rgba(212, 175, 55, 0.16); border-color: #d4af37; color: #b48310; font-weight: 800; }
body.dark .budget-pill-btn.active { background: rgba(212, 175, 55, 0.22); border-color: #fbbf24; color: #fbbf24; }

.filter-select, .catalog-search { width: 100%; min-height: 40px; padding: 0 12px; border: 1px solid var(--line); border-radius: 10px; color: var(--ink); background: var(--surface); outline: 0; font-size: 12px; transition: border-color .2s; }
.filter-select:focus, .catalog-search:focus { border-color: var(--lime); }
.catalog-search { width: 180px; }
.catalog-tools { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; flex-wrap: wrap; gap: 8px; }
.catalog-tools p { margin: 0; font-size: 12px; color: var(--ink-soft); }
.tool-controls { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.view-switch { display: flex; }
.view-switch button { width: 34px; height: 34px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); display: grid; place-items: center; }
.view-switch button:first-child { border-radius: 8px 0 0 8px; }
.view-switch button:last-child { border-radius: 0 8px 8px 0; }
.view-switch button.active { background: var(--lime); border-color: var(--lime); color: #070a0f; }

.catalog-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.fleet-pagination { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 20px; flex-wrap: wrap; }
.fleet-pagination .fleet-page-btn { min-width: 34px; height: 34px; justify-content: center; font-size: 11.5px; }
.fleet-pagination .fleet-page-nav { min-width: 90px; height: 34px; font-size: 11.5px; }
.fleet-pagination .fleet-page-btn:disabled { opacity: .45; cursor: not-allowed; }
.menu-filter { display: none; }

@media (max-width: 960px) {
  .catalog-layout { grid-template-columns: 1fr; }
  .catalog-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .menu-filter { display: inline-flex; }
  .filters { position: fixed; left: 0; right: 0; bottom: 0; top: auto; z-index: 1101; max-height: 82vh; display: block; padding: 16px 20px calc(20px + env(safe-area-inset-bottom)); border-radius: 20px 20px 0 0; transform: translateY(105%); transition: transform 0.35s cubic-bezier(0.22,0.9,0.3,1); overflow-y: auto; background: var(--surface); box-shadow: 0 -20px 50px rgba(0,0,0,0.4); }
  .filters.open { transform: translateY(0); }
}
@media (max-width: 560px) {
  .catalog-grid { grid-template-columns: 1fr; gap: 12px; }
  .catalog-search { width: 100%; }
  .fleet-pagination { gap: 4px; margin-top: 16px; }
  .fleet-pagination .fleet-page-nav { min-width: 36px; padding-inline: 10px; }
  .fleet-pagination .fleet-page-nav span { display: none; }
}`;

const newCatalogBlock = `.catalog-layout { display: grid; grid-template-columns: 280px 1fr; gap: 28px; align-items: start; }
.filters { position: sticky; top: 86px; padding: 20px 18px; border-radius: 18px; }
.filter-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.filter-head h3 { margin: 0; font-size: 15px; font-weight: 800; color: var(--ink); }
.clear { background: none; border: 0; color: var(--gold, #d97706); font-size: 11.5px; font-weight: 800; cursor: pointer; padding: 2px 4px; }
body.dark .clear { color: var(--gold, #fbbf24); }
.filter-group { padding: 10px 0; border-top: 1px solid var(--line); }
.filter-group strong { display: block; margin-bottom: 6px; font-size: 10.5px; font-weight: 800; text-transform: uppercase; color: var(--ink-soft); letter-spacing: 0.06em; }
.check { display: flex; align-items: center; justify-content: space-between; margin: 4px 0; font-size: 12px; color: var(--ink); cursor: pointer; transition: color 0.15s ease; }
.check:hover { color: var(--gold, #d97706); }
body.dark .check:hover { color: var(--gold, #fbbf24); }
.check input[type="checkbox"] { accent-color: var(--gold, #f59e0b); cursor: pointer; width: 15px; height: 15px; }

/* Compact Scroll for Brand List */
.filter-brand-scroll { max-height: 140px; overflow-y: auto; padding-right: 4px; scrollbar-width: thin; }
.filter-brand-scroll::-webkit-scrollbar { width: 4px; }
.filter-brand-scroll::-webkit-scrollbar-thumb { background: var(--line); border-radius: 4px; }

/* Inline Transmission Row */
.filter-transmission-row { display: flex; gap: 10px; align-items: center; }
.filter-transmission-row .check { flex: 1; margin: 0; padding: 5px 8px; background: var(--paper); border: 1px solid var(--line); border-radius: 8px; }

/* Modern Fleet Budget Slider Component */
.budget-filter-group { padding: 6px 0 10px; }
.budget-header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.budget-header-row strong { margin-bottom: 0 !important; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-soft); }
.budget-badge { font-size: 11px; font-weight: 700; font-family: var(--font-mono, monospace); padding: 2px 7px; border-radius: 6px; background: rgba(212, 175, 55, 0.12); color: #b48310; border: 1px solid rgba(212, 175, 55, 0.35); transition: all 0.2s ease; white-space: nowrap; }
body.dark .budget-badge { background: rgba(212, 175, 55, 0.18); color: #fbbf24; border-color: rgba(251, 191, 36, 0.35); }
.modern-slider-wrap { position: relative; width: 100%; margin-bottom: 6px; }
.modern-price-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 5px; border-radius: 4px; background: linear-gradient(to right, #d4af37 0%, #d4af37 100%, rgba(148, 163, 184, 0.25) 100%, rgba(148, 163, 184, 0.25) 100%); outline: none; cursor: pointer; margin: 6px 0 4px; transition: background 0.15s ease; }
body.dark .modern-price-slider { background: linear-gradient(to right, #fbbf24 0%, #fbbf24 100%, rgba(255, 255, 255, 0.12) 100%, rgba(255, 255, 255, 0.12) 100%); }
.modern-price-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #d4af37; border: 2px solid #ffffff; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25); cursor: grab; transition: transform 0.15s ease, box-shadow 0.15s ease; }
body.dark .modern-price-slider::-webkit-slider-thumb { background: #fbbf24; border: 2px solid #070a0f; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6); }
.modern-price-slider::-webkit-slider-thumb:hover { transform: scale(1.18); box-shadow: 0 0 10px rgba(212, 175, 55, 0.6); }
.modern-price-slider:active::-webkit-slider-thumb { cursor: grabbing; transform: scale(1.25); }
.modern-price-slider::-moz-range-thumb { width: 16px; height: 16px; border-radius: 50%; background: #d4af37; border: 2px solid #ffffff; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25); cursor: grab; transition: transform 0.15s ease, box-shadow 0.15s ease; }
body.dark .modern-price-slider::-moz-range-thumb { background: #fbbf24; border: 2px solid #070a0f; }
.budget-range-ticks { display: flex; justify-content: space-between; font-size: 9.5px; color: var(--ink-soft); font-family: var(--font-mono, monospace); margin-top: 1px; }
.budget-quick-pills { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin-top: 8px; }
.budget-pill-btn { width: 100%; padding: 3px 2px; font-size: 9.5px; font-weight: 700; border-radius: 8px; background: var(--paper, rgba(148, 163, 184, 0.08)); color: var(--ink-soft); border: 1px solid var(--line); cursor: pointer; transition: all 0.15s ease; line-height: 1.2; text-align: center; white-space: nowrap; }
.budget-pill-btn:hover { border-color: #d4af37; color: var(--ink); }
.budget-pill-btn.active { background: rgba(212, 175, 55, 0.16); border-color: #d4af37; color: #b48310; font-weight: 800; }
body.dark .budget-pill-btn.active { background: rgba(212, 175, 55, 0.22); border-color: #fbbf24; color: #fbbf24; }

.filter-select, .catalog-search { width: 100%; min-height: 42px; padding: 0 14px; border: 1px solid var(--line); border-radius: 10px; color: var(--ink); background: var(--surface); outline: 0; font-size: 13px; transition: border-color .2s; }
.filter-select:focus, .catalog-search:focus { border-color: var(--lime); }
.catalog-search { width: 250px; }
.catalog-tools { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.catalog-tools p { margin: 0; font-size: 13px; font-weight: 700; color: var(--ink-soft); }
.tool-controls { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.tool-controls select { min-height: 42px; padding: 0 12px; border-radius: 10px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); font-size: 12.5px; font-weight: 600; cursor: pointer; }
.view-switch { display: flex; }
.view-switch button { width: 38px; height: 42px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); display: grid; place-items: center; font-size: 15px; }
.view-switch button:first-child { border-radius: 8px 0 0 8px; }
.view-switch button:last-child { border-radius: 0 8px 8px 0; }
.view-switch button.active { background: var(--lime); border-color: var(--lime); color: #070a0f; }

.catalog-main { min-width: 0; }
.catalog-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
.fleet-pagination { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 24px; flex-wrap: wrap; }
.fleet-pagination .fleet-page-btn { min-width: 36px; height: 36px; justify-content: center; font-size: 12px; font-weight: 700; border-radius: 8px; }
.fleet-pagination .fleet-page-nav { min-width: 90px; height: 36px; font-size: 12px; font-weight: 700; border-radius: 8px; }
.fleet-pagination .fleet-page-btn:disabled { opacity: .45; cursor: not-allowed; }
.menu-filter { display: none; }

/* Responsive adjustments across breakpoints */
@media (max-width: 1399px) {
  .catalog-layout { grid-template-columns: 260px 1fr; gap: 24px; }
  .catalog-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
}

@media (max-width: 1099px) {
  .catalog-layout { grid-template-columns: 240px 1fr; gap: 20px; }
  .catalog-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
  .catalog-search { width: 200px; }
}

@media (max-width: 900px) {
  .catalog-layout { grid-template-columns: 1fr; gap: 16px; }
  .catalog-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .menu-filter { display: inline-flex; }
  .filters { position: fixed; left: 0; right: 0; bottom: 0; top: auto; z-index: 1101; max-height: 82vh; display: block; padding: 16px 20px calc(20px + env(safe-area-inset-bottom)); border-radius: 20px 20px 0 0; transform: translateY(105%); transition: transform 0.35s cubic-bezier(0.22,0.9,0.3,1); overflow-y: auto; background: var(--surface); box-shadow: 0 -20px 50px rgba(0,0,0,0.4); }
  .filters.open { transform: translateY(0); }
  .brand-filter-bar, .riding-style-bar { flex-wrap: nowrap; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
  .catalog-tools { flex-direction: column; align-items: stretch; gap: 10px; }
  .tool-controls { width: 100%; justify-content: space-between; }
  .catalog-search { width: 100%; flex: 1; }
  .nl-search-input-wrap { flex-direction: column; align-items: stretch; }
  #nl-search-btn { width: 100%; }
}

@media (max-width: 560px) {
  .catalog-grid { grid-template-columns: 1fr; gap: 12px; }
  .tool-controls { flex-wrap: wrap; }
  .fleet-pagination { gap: 4px; margin-top: 16px; }
  .fleet-pagination .fleet-page-nav { min-width: 36px; padding-inline: 10px; }
  .fleet-pagination .fleet-page-nav span { display: none; }
}`;

if (!css.includes(oldCatalogBlock)) {
  console.error('Target oldCatalogBlock not found in style.css');
  process.exit(1);
}
css = css.replace(oldCatalogBlock, newCatalogBlock);
console.log('✓ Updated catalog layout, grid columns (4-col on desktop, 3-col on laptop, 2-col on tablet), and search controls.');

// 6. In assets/js/app.js, update FLEET_ITEMS_PER_PAGE from 9 to 12
const oldItemsPerPage = 'const FLEET_ITEMS_PER_PAGE = 9;';
const newItemsPerPage = 'const FLEET_ITEMS_PER_PAGE = 12;';

if (!js.includes(oldItemsPerPage)) {
  console.error('Target oldItemsPerPage not found in app.js');
  process.exit(1);
}
js = js.replace(oldItemsPerPage, newItemsPerPage);
console.log('✓ Updated FLEET_ITEMS_PER_PAGE to 12 in app.js.');

// 7. In pages/bikes.html, update CSS cachebuster version to ?v=98
bikesHtml = bikesHtml.replace(/style\.css\?v=\d+/, 'style.css?v=98');
console.log('✓ Updated CSS version in pages/bikes.html to v=98.');

fs.writeFileSync(cssPath, css, 'utf8');
fs.writeFileSync(jsPath, js, 'utf8');
fs.writeFileSync(bikesHtmlPath, bikesHtml, 'utf8');

console.log('🎉 Successfully applied all Explore Fleet layout improvements!');
