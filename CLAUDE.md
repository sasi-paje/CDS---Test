# Custom Design System

A brand-agnostic, white-label UI kit built on semantic tokens. Swap brand hue, light/dark theme, and density preset on the `<html>` element; every component reflows with no rebuild.

## What's here

- **`Whitelabel UI Kit.html`** — the showcase. Foundations + every component spec card with working JSX inline. Open it to pick the brand hue, theme, and copy any component's source.
- **`src/whitelabel/tokens.css`** — canonical token system. Primitive scales (`--neutral-*`, `--indigo-*`, etc.), the **semantic layer** (`--fg-*`, `--bg-*`, `--border-*`, `--space-*`, `--radius-*`, `--shadow-*`, `--text-*`, `--dur-*`, `--ease-*`), 12 brand hues, 2 themes, 5 style presets.
- **`src/whitelabel/*.jsx`** — React primitives loaded with Babel-in-browser. All export to `window`:
  - `Primitives.jsx` — Icon, Button, IconButton, Input, Textarea, Select, Checkbox, Radio, RadioGroup, Switch, Badge, Avatar, AvatarGroup, Card, Spinner, Alert, Tooltip, Progress, Tabs, Breadcrumbs, Kbd, Typography
  - `Overlays.jsx` — Dialog, Sheet, Popover, DropdownMenu, Toaster (+ `window.toast`)
  - `Display.jsx` — Table family, Pagination, Skeleton, Separator, Empty
  - `Sidebar.jsx` — collapsible app Sidebar with sections + sub-items
  - `Small.jsx` — Label, Field, ButtonGroup, InputGroup, Toggle, AspectRatio, Collapsible, ScrollArea, Item, AlertDialog, Direction / DirectionToggle / useDirection (RTL)
  - `Medium.jsx` — HoverCard, ContextMenu, InputOTP, Resizable, Drawer, Menubar
  - `MoreInputs.jsx` — Slider, ToggleGroup, Combobox, Accordion
  - `Complex.jsx` — Calendar, DatePicker, Command (⌘K), Carousel, Chart, DataTable, NavigationMenu
  - `Gaps.jsx` — FileUpload, MultiSelect (chips), Typeahead (async), DateRangePicker, FormErrorSummary
  - `Gaps2.jsx` — AsyncField (live validation), AvatarUpload (circular), CsvImport (preview-before-import)
  - `AppShell.jsx` — app shell layout
  - `Patterns.jsx` — reusable layout patterns
  - `SaaS.jsx` — SaaS-specific patterns

## How to start a new screen

```html
<!doctype html>
<html lang="en" data-theme="light" data-brand="indigo" data-style="standard">
<head>
  <link rel="stylesheet" href="src/whitelabel/tokens.css" />

  <script src="https://unpkg.com/react@18.3.1/umd/react.development.js" integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body>
  <div id="root"></div>

  <script type="text/babel" src="src/whitelabel/Primitives.jsx"></script>
  <!-- import only the other modules you actually use -->
  <script type="text/babel" src="src/whitelabel/Overlays.jsx"></script>

  <script type="text/babel">
    const { Button, Input, Card, Alert } = window;
    function App() {
      return (
        <Card>
          <Alert variant="success" title="Saved">Your changes were synced.</Alert>
          <Input label="Email" leading="mail" required />
          <Button variant="primary" leading="plus">Create</Button>
        </Card>
      );
    }
    ReactDOM.createRoot(document.getElementById("root")).render(<App />);
  </script>
</body>
</html>
```

## Brand + theme + style

The look swaps via three HTML attributes — no rebuild, no JS required. They're orthogonal: every style works in every hue × theme.

| Attribute | Values | What it changes |
|---|---|---|
| `data-theme` | `light`, `dark` | Surfaces, fg/bg, shadow palette |
| `data-brand` | `indigo`, `violet`, `fuchsia`, `pink`, `rose`, `red`, `orange`, `amber`, `emerald`, `teal`, `cyan`, `blue` | The `--brand-*` alias scale (primary buttons, links, focus rings) |
| `data-style` | `standard`, `enterprise`, `friendly`, `refined`, `data-dense` | Fonts, radii, shadows, type metrics |

`--brand-*` is an alias scale — it re-points to whichever hue family is selected. Always consume `--brand-*` (or its semantic descendants like `--bg-brand`, `--fg-brand`) — never reference a hue family directly.

### Picking a style — multi-client decision matrix

Use this to match a client brief to a preset. **One style per client / per product** — don't mix.

| Style | Pick when the client is… | Reference look |
|---|---|---|
| **standard** | A new product, no strong brand yet, or you want the safest modern web feel | shadcn / Linear / Vercel app |
| **enterprise** | Formal B2B, conservative buyers, dense tables, or compliance-heavy (legal, finance, healthcare) | Atlassian / Salesforce / IBM Carbon |
| **friendly** | Consumer SaaS, SMB tools, education, onboarding-heavy products, warmer brand | Notion / Front / Pitch |
| **refined** | Premium product feel, design-led brand, craft matters | Stripe Dashboard / Cursor / Arc |
| **data-dense** | Power-user tools, analytics, observability, finance dashboards — the screen IS the data | Stripe Dashboard (compact) / Datadog / Linear (compact) |

### Style rules

- **Always set `data-style` on `<html>`** — never on a subtree of a real product (only the showcase does that for previews).
- **Never override radii, fonts, or shadows inline.** If a style preset doesn't give you what you want, edit `tokens.css` and add a new preset. Don't fork a button.
- All 5 styles share the same primitive color scales, semantic layer, and component library — switching is risk-free at any point in the build.

## Rules — apply to every screen

1. **Never inline raw values.** No hex, no raw px for spacing/radius, no raw ms. Always reach for a token: `var(--fg-default)`, `var(--space-5)`, `var(--radius-md)`, `var(--dur-base)`.
2. **Consume the semantic layer, not the scale.** `--fg-muted`, never `--neutral-500`. `--bg-brand`, never `--indigo-600`. Only `tokens.css` itself should reference primitive scales.
3. **One brand, one accent.** Don't introduce a second hue alongside `--brand-*`. If you need a second color, pick from the **status taxonomy** — `success` / `warning` / `danger` / `info`.
4. **Variant maps to intent.**
   - `Button variant="primary"` — the single most important action per surface (submit, save, confirm)
   - `Button variant="secondary"` / `"outline"` — supporting actions (cancel, back)
   - `Button variant="ghost"` — toolbar / table-row / icon-bar actions
   - `Button variant="danger"` — destructive only, always with a confirmation step
   - `Button variant="link"` — inline within copy
5. **Match size to context.** `xs`/`sm` for tables and toolbars; `md` (default) for forms and page actions; `lg` for landing CTAs and empty states.
6. **Status taxonomy is closed.** `success`, `warning`, `danger`, `info` — never invent a fifth. `Badge`, `Alert`, `Progress` all share this set.
7. **Light + dark are equal citizens.** Test every screen in both. Components inherit this for free via tokens; custom CSS you add must too.
8. **Accessibility floor:** AA contrast (4.5:1) on text, AAA preferred (see the Contrast section of the showcase); touch targets ≥ 32px (`size="md"` by default); `iconOnly` buttons need `ariaLabel`; status communicated by color must also carry an icon or text.
9. **Form fields:** always set `label` and either `placeholder` or `hint`. Errors use `error` + `hint` together. Required fields get `required`.
10. **Respect spacing rhythm.** Most layouts only need `--space-2` / `--space-3` / `--space-4` / `--space-5` / `--space-7` / `--space-8` (4 / 8 / 12 / 16 / 24 / 32). Don't break the 4-point grid.

## Examples

Full-page reference implementations in `examples/`. Each is self-contained and opens directly in a browser.

| Folder | What it is | Components exercised |
|---|---|---|
| `examples/inbox/` | Task management — feed rail, severity list, triage detail | Sidebar, DataTable, Badge, Input, AlertDialog, Toaster |
| `examples/dashboard/` | Analytics dashboard — KPIs, charts, date-range, tabs | Chart, DataTable, Progress, Tabs |
| `examples/console/` | Admin console — Dashboard, Members CRUD, Billing, Settings, ⌘K | Sidebar, DataTable, Chart, Dialog, AlertDialog, Command, Field, Switch |
| `examples/datatable/` | Advanced data table — multi-sort, facets, bulk actions, CSV export, drag-reorder | Checkbox, Badge, Avatar, Popover, Pagination, Tooltip |
| `examples/spreadsheet/` | Editable spreadsheet — keyboard nav, range selection, typed cells, multiple sheets | Checkbox, Badge, IconButton, DropdownMenu, Tooltip |

## When in doubt

Open `Whitelabel UI Kit.html` → find the component → every spec card has a working JSX example. Copy that.

## Project Setup

Run `pnpm setup` after forking and cloning. The wizard configures:

- **Brand** — one of 12 hues or a custom hex (generates scale in `tokens.css`)
- **Style** — standard / enterprise / friendly / refined / data-dense
- **Theme** — light or dark default
- **Size** — default component size (xs / sm / md / lg)
- **Font** — use the style preset default or override

Outputs: `project.config.json` (machine-readable), updated **Project Config** section below (binding rules for Claude Code), and a pre-configured `index.html` starter.

## Project Config
<!-- generated by `pnpm setup` — re-run to change -->

Run `pnpm setup` to configure this project. Until then, use design system defaults:
- `<html data-brand="indigo" data-style="standard" data-theme="light">`
- Default component size: `md`
- Only use components from `src/whitelabel/` — never invent new components
- Never reference a raw color scale — only semantic tokens (`--fg-*`, `--bg-*`, `--border-*`, `--space-*`)