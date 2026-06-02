# Whitelabel Design System Documentation

Welcome to the **Whitelabel Design System** — a brand-agnostic, token-driven UI kit for building modern interfaces.

## Quick Links

- **[Developer Guide](guide.html)** — Fork → setup → build with Claude Code. Start here.
- **[Component Docs](index.html)** — Full interactive component reference
- **[Configurator](../configure/index.html)** — Visual brand/style picker, generates boilerplate
- **[Component Examples](../examples/inbox/inbox.html)** — Live working examples
- **[Source Code](../src/whitelabel/)** — All component definitions

## What's This?

A complete design system that swaps appearance via HTML attributes — **no rebuild required**:

```html
<html data-theme="light" data-brand="emerald" data-style="enterprise">
```

Change any attribute, and the entire interface reflows.

## Structure

```
docs/
├── index.html           ← Interactive documentation site
└── README.md            ← You are here

src/whitelabel/
├── tokens.css           ← All design tokens (colors, spacing, typography)
├── Primitives.jsx       ← Basic components (Button, Input, Badge, etc.)
├── Sidebar.jsx          ← Sidebar/navigation component
├── Display.jsx          ← Data display (Table, Pagination, etc.)
├── Overlays.jsx         ← Modals (Dialog, Toaster, DropdownMenu, etc.)
└── Complex.jsx          ← Advanced (DataTable, Chart, Carousel, etc.)

examples/
├── inbox/               ← Full-page example: Task management
└── README.md            ← Examples documentation
```

## Opening the Docs

1. **In your browser:**
   ```bash
   open docs/index.html
   ```

2. **Or navigate to:**
   ```
   /path/to/repo/docs/index.html
   ```

3. The docs are **fully interactive** — switch themes, brands, and styles in real-time.

## What's Included

✅ **6 brand hues** — Indigo, Violet, Emerald, Rose, Amber, Slate  
✅ **Light + Dark themes** — Automatic via CSS variables  
✅ **5 style presets** — Standard, Enterprise, Friendly, Refined, Data-dense  
✅ **50+ components** — Everything you need  
✅ **Semantic tokens** — Colors, spacing, typography, shadows, motion  
✅ **Accessibility first** — WCAG AA built-in  

## Core Rules

1. **Never inline raw values** — Use CSS variables (`var(--fg-default)`, `var(--space-4)`)
2. **Consume semantic tokens** — Use `--fg-muted`, not `--neutral-500`
3. **One brand, one accent** — Use status taxonomy (success, warning, danger, info)
4. **Light + dark are equal** — Test in both themes
5. **Form fields need labels** — Always set `label` on inputs
6. **Status conveyed three ways** — Color + icon + text (not color alone)
7. **Accessibility floor: AA** — 4.5:1 contrast, 32px touch targets
8. **Respect spacing rhythm** — Stick to 4-point grid

## Starting a New Screen

```html
<!doctype html>
<html lang="en" data-theme="light" data-brand="indigo" data-style="standard">
<head>
  <link rel="stylesheet" href="src/whitelabel/tokens.css" />
  <script src="https://unpkg.com/react@18.3.1/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body>
  <div id="root"></div>
  
  <script type="text/babel" src="src/whitelabel/Primitives.jsx"></script>
  <script type="text/babel" src="src/whitelabel/Overlays.jsx"></script>

  <script type="text/babel">
    const { Button, Card, Input } = window;
    
    function App() {
      return (
        <Card>
          <Input label="Email" placeholder="you@example.com" />
          <Button variant="primary">Submit</Button>
        </Card>
      );
    }

    ReactDOM.createRoot(document.getElementById("root")).render(<App />);
  </script>
</body>
</html>
```

## Sharing with Others

The docs site is **fully self-contained** and shareable:

1. **Push to GitHub** — The entire repo with docs can be cloned and opened
2. **Host on any server** — It's just HTML/CSS/JS
3. **Email the link** — Anyone can open `/docs/index.html` in their browser
4. **No build required** — No npm install, no compilation

### Sharing Steps

```bash
# 1. Push repo to GitHub
git push origin main

# 2. Send them the link:
# https://github.com/you/Custom-Design-system
# or
# file:///path/to/repo/docs/index.html

# 3. They can:
# - View docs interactively
# - Copy component code
# - Build examples
# - Reference tokens
```

## Building a New Example

1. Create a folder: `examples/my-page/`
2. Copy the HTML boilerplate from "Quick Start" above
3. Use **only design system components**
4. Test in light + dark themes
5. Push to Git when ready

See `examples/inbox/inbox.html` for a complete, production-ready example.

## Customization

To create a **new style preset**:

1. Edit `src/whitelabel/tokens.css`
2. Add your preset values (fonts, radii, shadows, type metrics)
3. Set `data-style="my-preset"` on `<html>`

To add **a new color hue**:

1. Add scale values to `tokens.css`: `--my-hue-50` through `--my-hue-950`
2. Add to brand selector: `[data-brand="my-hue"] { --brand-*: var(--my-hue-*); }`

## FAQ

**Q: Can I use this without React?**  
A: The components are React, but you can use just the tokens.css + HTML/CSS.

**Q: Can I change the component styles?**  
A: Yes. Edit `src/whitelabel/*.jsx` to customize. Or create a new style preset in `tokens.css`.

**Q: What about TypeScript?**  
A: The components work as-is in JavaScript. Add TS separately if needed.

**Q: Can I sell products built with this?**  
A: Yes. The design system is yours to use, modify, and redistribute.

## Support

- **Docs:** Open `/docs/index.html` and find the component you need
- **Examples:** See `/examples/` for working code
- **Source:** Check `/src/whitelabel/` for component implementations

---

Built to be shared. Use it, fork it, adapt it.
