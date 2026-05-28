# Custom Design System

A brand-agnostic, white-label UI kit built on semantic design tokens. Swap brand hue, light/dark theme, and style preset on the `<html>` element—every component reflows instantly with no rebuild needed.

## Features

✨ **5 Style Presets**
- `standard` — Modern web baseline (Inter, balanced)
- `enterprise` — Formal B2B (IBM Plex Sans, tight density)
- `friendly` — Consumer SaaS (DM Sans, generous)
- `refined` — Premium feel (Geist, minimal elevation)
- `data-dense` — Analytics/dashboards (compact, tabular numerals)

🎨 **6 Brand Hues**
- Indigo, Violet, Emerald, Rose, Amber, Slate

🌓 **Light & Dark Themes**
- Automatic semantic token swapping

📦 **Component Library**
- **Primitives:** Button, Input, Card, Badge, Avatar, Spinner, Alert, etc.
- **Overlays:** Dialog, Sheet, Popover, Dropdown, Toast, etc.
- **Display:** Table, Pagination, Skeleton, EmptyState
- **Layout:** Sidebar, Tabs, Breadcrumbs, NavigationMenu
- **Inputs:** Slider, DatePicker, Combobox, Accordion, etc.
- **Complex:** Carousel, Chart, DataTable

## Quick Start

### Use the Interactive Showcase

Open `Whitelabel UI Kit.html` in a browser to:
- Preview all components
- Swap theme, brand, and style
- Copy any component's JSX source

```bash
open "Whitelabel UI Kit.html"
```

### Use in Your Project

Copy the CSS tokens and React components into your app:

```html
<html lang="en" data-theme="light" data-brand="indigo" data-style="standard">
<head>
  <link rel="stylesheet" href="src/whitelabel/tokens.css" />
  <script src="https://unpkg.com/react@18.3.1/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js"></script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" src="src/whitelabel/Primitives.jsx"></script>
  <script type="text/babel">
    const { Button, Input, Card } = window;
    function App() {
      return (
        <Card>
          <Input label="Email" required />
          <Button variant="primary">Submit</Button>
        </Card>
      );
    }
    ReactDOM.createRoot(document.getElementById("root")).render(<App />);
  </script>
</body>
</html>
```

## Project Structure

```
.
├── src/whitelabel/
│   ├── tokens.css               # Design token definitions
│   ├── Primitives.jsx           # Button, Input, Card, Badge, etc.
│   ├── Overlays.jsx             # Dialog, Sheet, Popover, Dropdown, etc.
│   ├── Display.jsx              # Table, Pagination, Skeleton
│   ├── Sidebar.jsx              # Sidebar layout
│   ├── Small.jsx                # Label, DatePicker, Calendar
│   ├── Medium.jsx               # AspectRatio, Collapsible, ScrollArea
│   ├── MoreInputs.jsx           # Slider, ToggleGroup, Combobox, Accordion
│   ├── Complex.jsx              # Carousel, Chart, DataTable
│   └── Catalog*.jsx             # Documentation & examples
├── Whitelabel UI Kit.html       # Interactive showcase
├── CLAUDE.md                    # Detailed architecture & rules
└── package.json
```

## How to Switch Themes

Change the `<html>` attributes—no CSS changes needed:

```html
<!-- Light indigo standard -->
<html data-theme="light" data-brand="indigo" data-style="standard">

<!-- Dark emerald enterprise -->
<html data-theme="dark" data-brand="emerald" data-style="enterprise">

<!-- Light rose friendly -->
<html data-theme="light" data-brand="rose" data-style="friendly">
```

## Semantic Tokens

All components consume the semantic layer, never raw values:

```css
--bg-app              /* Page background */
--bg-canvas           /* Default surface */
--bg-surface          /* Cards, modals */
--fg-default          /* Body text */
--fg-strong           /* Headings */
--fg-muted            /* Secondary text */
--border-subtle       /* Faint borders */
--brand-500           /* Primary brand hue */
--space-3             /* 8px spacing */
--radius-md           /* 6px border-radius */
--shadow-sm           /* Subtle shadow */
--dur-base            /* Motion timing */
```

See `src/whitelabel/tokens.css` for the complete token system.

## Design Rules

1. **Never inline raw values** — use CSS variables
2. **Consume semantic tokens** — `--fg-muted`, not `--neutral-500`
3. **One brand, one accent** — don't add second hues
4. **Match size to context** — `xs`/`sm` for tables, `md` for forms, `lg` for CTAs
5. **Test in both themes** — light and dark are equal citizens
6. **Accessibility floor:** AA contrast (4.5:1), touch targets ≥32px
7. **Form fields:** always set `label` and `placeholder` or `hint`
8. **Respect spacing rhythm** — use `--space-2`, `--space-3`, `--space-4`, `--space-5`, `--space-7`, `--space-8`

## When in Doubt

Open `Whitelabel UI Kit.html` → find the component → every spec card has a working JSX example. Copy that.

## Documentation

See `CLAUDE.md` for:
- Complete style preset comparison
- Multi-client decision matrix
- Component variant guidelines
- Status taxonomy rules
- Contrast requirements

## License

MIT
