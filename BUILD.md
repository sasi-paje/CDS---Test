# BUILD.md — Whitelabel Interface Builder

**TL;DR:** This file teaches an AI how to interview a client, select components from the Whitelabel Design System, and generate a complete, working HTML interface. If you want to build something, skip to **[Client Intake Workflow](#client-intake-workflow)**.

---

## What Is This?

You have a brand-agnostic, white-label design system: **tokens.css** + 35+ React components that all consume semantic CSS variables. This file is the entrypoint for building any new interface.

When you ask an AI (or Claude Code) to build an interface, this file:
1. **Orients the AI** to the design system architecture and available components
2. **Defines the intake interview** — questions to ask about your needs
3. **Provides component selection logic** — which component for which UI pattern
4. **Enforces code generation rules** — accessibility, tokens, consistency
5. **Supplies copy-paste patterns** — pre-built layout shells and form sections
6. **Outputs a single HTML file** that works offline, renders with React-in-browser (Babel), and looks perfect in light/dark and any brand color

---

## The Design System in 30 Seconds

Your entire visual look is controlled by **three HTML attributes on `<html>`**:

```html
<html 
  data-theme="light"      <!-- or "dark" -->
  data-brand="indigo"     <!-- or violet, emerald, rose, amber, slate -->
  data-style="standard"   <!-- or enterprise, friendly, refined, data-dense -->
>
```

Change these, and **every component** reflows—no CSS edits, no rebuild. The semantic token layer (`--bg-app`, `--fg-default`, `--border-subtle`, `--space-5`, `--radius-md`, `--shadow-sm`, etc.) in `src/whitelabel/tokens.css` handles the rest.

### Design System Files

- **`src/whitelabel/tokens.css`** — All design tokens: primitives (`--neutral-*`, `--indigo-*`) + semantic layer (`--bg-*`, `--fg-*`, `--border-*`, `--space-*`, `--radius-*`, `--shadow-*`, `--duration-*`, `--ease-*`, `--text-*`)
- **`src/whitelabel/*.jsx`** — React components, loaded via Babel-in-browser:
  - `Primitives.jsx` — Button, Input, Card, Badge, Avatar, Alert, Tabs, etc.
  - `Overlays.jsx` — Dialog, Sheet, Popover, DropdownMenu, Toast, etc.
  - `Display.jsx` — Table, Pagination, Skeleton, Empty, etc.
  - `Sidebar.jsx` — Full navigation sidebar
  - `Small.jsx`, `MoreInputs.jsx`, `Medium.jsx`, `Complex.jsx` — Specialized inputs, layout, advanced components
- **`Whitelabel UI Kit.html`** — Interactive showcase of all components + foundations

---

## Client Intake Workflow

Ask the following questions **in order** before writing any code. The AI should wait for an answer to each question before proceeding to the next.

### 1. Product Type

**What kind of product is this?**

Options (user picks one or describes):
- SaaS application (web-based service)
- Dashboard / Admin panel (data visualization, tables, analytics)
- Marketing / Landing page
- E-commerce (shopping cart, catalog)
- Internal tool (CRUD, forms, reporting)
- Mobile app (responsive web)
- Other: ___________

### 2. Main Page(s)

**What page(s) or views do you want to build?** (comma-separated or one per line)

Examples:
- Login page
- Dashboard with metrics and chart
- User list with CRUD actions
- Product detail page with reviews
- Settings page with toggles and forms
- Checkout flow
- etc.

### 3. Brand & Style

**a) Brand color hue?** (pick one, or describe if custom)
- Indigo (cool, professional)
- Violet (creative, premium)
- Emerald (growth, health)
- Rose (warm, approachable)
- Amber (attention, warmth)
- Slate (neutral, formal)

**b) Style preset?** (pick one that matches your vibe)
- `standard` — Modern web baseline, balanced. (Default. Good for most products.)
- `enterprise` — Formal, tight density, minimal elevation. (B2B, conservative buyers, compliance-heavy.)
- `friendly` — Generous padding, soft shadows, warm beige. (Consumer SaaS, education, onboarding.)
- `refined` — Premium feel, minimal chrome, composed. (Design-led brands, luxury.)
- `data-dense` — Compact UI, instant motion, tabular numerals. (Analytics, observability, dashboards.)

### 4. Theme

**Light, dark, or both?**
- Light only (most clients use this)
- Dark only (rare)
- Both (user can toggle)

### 5. Key Content & Data

**What content or data does your page display?** Be specific.

Examples:
- "A list of users with their status (active/inactive/pending), avatar, name, email, last login date"
- "A dashboard showing 4 metric cards (users, revenue, churn, growth) + a line chart of user growth over time"
- "A form with email, password, remember-me checkbox, and a submit button"
- "A product image, title, price, star rating, stock status, and add-to-cart button"

### 6. User Actions

**What can the user do on this page?**

Examples:
- "Create, edit, delete users"
- "Filter table by status, sort by name, export to CSV"
- "Fill out and submit a form"
- "Add items to cart, proceed to checkout"
- "Toggle settings on/off, save preferences"

### 7. Layout Preference

**How should the layout be structured?**
- Sidebar + main content (best for multi-page apps)
- Centered/card-based (login, onboarding, simple forms)
- Full-width (dashboards, data tables)
- Split / two-column (editor + preview, list + detail)
- Other: ___________

### 8. Constraints & Brand

**Any existing constraints or brand requirements?**
- Existing logo/wordmark (describe or paste URL if possible)
- Company name (for headers/branding)
- Copy tone (professional, friendly, casual, etc.)
- Language (English assumed; specify if other)
- Specific fonts? (we default to Inter + JetBrains Mono; only override if critical)

### 9. Output Format

**How do you want the final output?**
- **Single HTML file** (works offline, open in any browser, email to clients, zero setup). Recommended for prototypes, client reviews, static pages.
- **Next.js / Vite project** (npm install, dev server, production-ready build). Recommended for actual products, integration with backends, further development.

---

## Component Selection Guide

Use this matrix to map UI patterns to the right components:

### Navigation & Structure
| Need | Component | Notes |
|---|---|---|
| Full-height app sidebar with nav items | `Sidebar` | Supports groups, sub-items, badges, collapsed mode |
| Top navigation bar with dropdowns | `Menubar` | Desktop-style horizontal menus |
| Horizontal tabs / segmented control | `Tabs` | Underline or pill variants; can include icons + counts |
| Breadcrumb trail | `Breadcrumbs` | Shows current page and parent pages |
| Step-by-step wizard | Use `Tabs` or chain `Card` + `Button` | Tabs can show step numbers via count or custom |

### Data Display
| Need | Component | Notes |
|---|---|---|
| Data table with search/sort/pagination/selection | `DataTable` | Full-featured; pass `columns` array |
| Simple data table (no extra features) | `Table` + `TableHeader/Body/Row/Head/Cell` | Composable; build custom with these primitives |
| Chart (line, area, bar, multi-series) | `Chart` | Responsive; supports `x`/`y` data mapping |
| List of items (user profiles, posts, etc.) | `Card` (repeated) or `Item` | Cards for grid; Item for single-column with avatar + title/description |
| Progress indicator | `Progress` | Shows percentage, optional label, status variant |
| Empty state (no data) | `Empty` | Icon + title + description + optional action |
| Loading skeleton | `Skeleton`, `SkeletonText`, `SkeletonAvatar` | Shimmer effect for async data |

### Forms & Input
| Need | Component | Notes |
|---|---|---|
| Single-line text input | `Input` | Has label, hint, error, leading/trailing icons |
| Multi-line text input | `Textarea` | Has label, hint, error, rows |
| Dropdown select | `Select` | Native styled; label, hint, error |
| Searchable/filterable select | `Combobox` | Fuzzy search dropdown |
| Date picker | `DatePicker` | Button + calendar popover |
| Checkbox | `Checkbox` | Single or group; label + hint |
| Radio button group | `Radio` (multiple) | Each radio in a group; label + hint |
| Toggle / on-off switch | `Switch` | Label, size options |
| Slider (single value or range) | `Slider` | Shows value, optional label |
| Segmented buttons (single/multi select) | `ToggleGroup` | Outlined or pill style |
| OTP / PIN input (N digits) | `InputOTP` | Auto-focus, backspace, paste, mask option |
| Input group (prefix + input + suffix) | `InputGroup` + `InputGroupAddon` + `InputGroupInput` | e.g. "$" + "100.00" or search icon + field |
| Form field (label + input + hint/error) | `Field` (wrapper) | Semantically groups label, input, and helper text |

### Buttons & Actions
| Need | Component | Notes |
|---|---|---|
| Primary action button | `Button variant="primary"` | Solid brand color; main call-to-action |
| Secondary / supporting action | `Button variant="secondary"` or `"outline"` | Lower emphasis; cancel, back, etc. |
| Tertiary / toolbar button | `Button variant="ghost"` or `"text"` | Minimal; table rows, icon bars |
| Icon button (no label) | `Button iconOnly` with `ariaLabel` | Always use ariaLabel for accessibility |
| Destructive action (delete, etc.) | `Button variant="danger"` | Red; always pair with confirm dialog |
| Inline link within copy | `Button variant="link"` | Renders as text; acts like a link |
| Button group (joined) | `ButtonGroup` | Multiple buttons joined into one strip |
| Menu with multiple actions | `DropdownMenu` | Click trigger; list of items with icons/shortcuts |
| Command palette (⌘K) | `Command` | Keyboard-driven, fuzzy searchable command list |

### Feedback & Status
| Need | Component | Notes |
|---|---|---|
| Inline status banner (info, error, etc.) | `Alert` | Icon + title + description + optional dismiss |
| Notification / toast | `Toaster` (mount once) + `window.toast(...)` | Imperative; auto-dismiss or persistent |
| Confirmation dialog (destructive) | `AlertDialog` | Styled for delete/dangerous actions; explicit confirm/cancel |
| Loading spinner | `Spinner` | Animated circle; can be in-line or full-page |
| Status badge / label | `Badge` | Inline label; supports all status variants |
| User avatar / profile circle | `Avatar` | Shows image or initials; optional status indicator |
| Multiple avatars (stack) | `AvatarGroup` | Overlapping stack with overflow count |

### Modals & Overlays
| Need | Component | Notes |
|---|---|---|
| Centered modal dialog | `Dialog` | Title, description, body, footer buttons; sizes: sm/md/lg/xl/full |
| Slide-in panel (side sheet) | `Sheet` | From left/right/top/bottom; sizes vary by edge |
| Mobile bottom sheet | `Drawer` | Slide-up from bottom; rounded top, grab handle |
| Floating dropdown / popover | `Popover` | Anchored to trigger; auto-position; custom content |
| Hover/focus tooltip or card | `Tooltip` or `HoverCard` | Tooltip: simple text; HoverCard: rich content with delay |
| Right-click context menu | `ContextMenu` | Portal-rendered; auto-clamped to screen edges |

### Layout & Composition
| Need | Component | Notes |
|---|---|---|
| Card / surface container | `Card` | Optional interactive (hover lift); padding + border + shadow |
| Vertical divider line | `Separator` | Horizontal or vertical; optional centered label |
| Scrollable container | `ScrollArea` | Custom styled scrollbars |
| Resizable panes (split view) | `Resizable` | 2+ panes; draggable handle; min size constraint |
| Forced aspect ratio (video, image) | `AspectRatio` | Wrapper that maintains ratio; child fills |
| Expandable / collapsible section | `Collapsible` | Trigger + body; controlled or uncontrolled |
| Carousel / slideshow | `Carousel` | Slides, dots, arrows, autoplay |
| Mega-menu / nav bar | `NavigationMenu` | Horizontal with fly-out panels |

### Typography & Formatting
| Need | Component | Notes |
|---|---|---|
| Keyboard shortcut display | `Kbd` | Shows "⌘K", "Esc", etc. in a capsule |
| Semantic heading / text styles | CSS classes `.t-h1`, `.t-body`, `.t-caption`, etc. | No component; apply to `<h1>`, `<p>`, etc. |
| Monospace / code-style text | CSS class `.t-mono` or apply `font-family: var(--font-mono)` | For code snippets, identifiers |

---

## Code Generation Rules

**The AI MUST follow these rules when writing output HTML:**

### 1. No Raw Values
Never inline hex colors, px units, or ms timings. Always use CSS variables:

❌ **Bad:**
```jsx
<Button style={{ color: '#6366F1', padding: '8px 16px' }}>Save</Button>
```

✅ **Good:**
```jsx
<Button variant="primary">Save</Button>
```

If you need custom spacing: `<div style={{ gap: 'var(--space-5)' }}>` or `padding: 'var(--card-pad)'`

### 2. Script Loading Order
Always load **Primitives.jsx first**, then only the modules you actually use:

```html
<!-- ✅ Always first -->
<script type="text/babel" src="src/whitelabel/Primitives.jsx"></script>

<!-- Then conditionally: -->
<script type="text/babel" src="src/whitelabel/Overlays.jsx"></script>    <!-- if using Dialog, Sheet, Toast, etc. -->
<script type="text/babel" src="src/whitelabel/Display.jsx"></script>      <!-- if using Table, Chart, Empty, etc. -->
<script type="text/babel" src="src/whitelabel/Sidebar.jsx"></script>      <!-- if using Sidebar -->
<script type="text/babel" src="src/whitelabel/Small.jsx"></script>        <!-- if using DatePicker, Combobox, etc. -->
<script type="text/babel" src="src/whitelabel/MoreInputs.jsx"></script>   <!-- if using Slider, ToggleGroup, etc. -->
<script type="text/babel" src="src/whitelabel/Medium.jsx"></script>       <!-- if using HoverCard, ContextMenu, Resizable, etc. -->
<script type="text/babel" src="src/whitelabel/Complex.jsx"></script>      <!-- if using DataTable, Chart, NavigationMenu, etc. -->
```

### 3. Accessibility Basement Rules

- **`iconOnly` buttons**: Always include `ariaLabel`. Example: `<Button iconOnly icon="trash" ariaLabel="Delete user" />`
- **Form fields**: Always set `label`. Use `hint` for helper text or `error` for validation. Example: `<Input label="Email" hint="We'll send a verification link" />`
- **Data communicated by color**: Pair with icon or text. A red button needs an icon or confirmation dialog.
- **Touch targets**: Use `size="md"` (38px) or larger for clickable elements; `size="sm"` only in dense tables.
- **Focus visible**: All interactive elements receive focus rings (automatic via component CSS).

### 4. Status Taxonomy (Closed Set)
Use only these four status variants; never invent a fifth:
- `success` — positive, achieved, completed
- `warning` — caution, needs attention
- `danger` — error, destructive, failure
- `info` — neutral information, help

Used consistently across: `Alert`, `Badge`, `Progress`, `Button`, toasts.

### 5. Toaster Mount
If using toasts, mount `Toaster` **once** at the root:

```jsx
<Toaster position="bottom-right" />
```

Then call it anywhere in the component:

```jsx
window.toast.success("Saved!")
window.toast.error("Error saving.", { description: "Check your connection." })
window.toast({ title: "Custom", variant: "info", duration: 3000 })
```

### 6. Table Composition
Always nest `Table` with the provided sub-components:

```jsx
<Table dense={false}>
  <TableHeader>
    <TableRow>
      <TableHead sortable sorted="asc" onSort={...}>Name</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow selected={id === selected}>
      <TableCell>{name}</TableCell>
      <TableCell>{email}</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### 7. Test Both Themes
Test **every** generated interface in both light + dark (even if the client only asked for light). Swap `data-theme` to verify contrast, readability, and no color hardcodes.

```html
<!-- Toggle this to test both -->
<html data-theme="light">  <!-- or "dark" -->
```

### 8. Always Set `data-*` Attributes
Every output HTML must have these three attributes on `<html>`:

```html
<html 
  lang="en"
  data-theme="light"
  data-brand="indigo"
  data-style="standard"
>
```

If the client specifies a style, use it. If they don't, default to `standard`.

---

## HTML Boilerplate Template

Copy-paste this starter and fill in the JSX content:

```html
<!doctype html>
<html lang="en" data-theme="light" data-brand="indigo" data-style="standard">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Your App Title</title>
  
  <!-- Design system tokens -->
  <link rel="stylesheet" href="https://raw.githubusercontent.com/eduardosicsu-Viber/Custom-Design-system/main/src/whitelabel/tokens.css" />
  
  <!-- React & Babel (run JSX in browser) -->
  <script src="https://unpkg.com/react@18.3.1/umd/react.development.js" 
    integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L" 
    crossorigin="anonymous"></script>
  <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" 
    integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm" 
    crossorigin="anonymous"></script>
  <script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" 
    integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y" 
    crossorigin="anonymous"></script>
  
  <!-- Lucide icons -->
  <script src="https://unpkg.com/lucide@latest"></script>
  
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
  </style>
</head>
<body>
  <div id="root"></div>

  <!-- Load components (Primitives first, then conditionally) -->
  <script type="text/babel" src="https://raw.githubusercontent.com/eduardosicsu-Viber/Custom-Design-system/main/src/whitelabel/Primitives.jsx"></script>
  <!-- Add other modules as needed: Overlays, Display, Sidebar, Small, MoreInputs, Medium, Complex -->

  <!-- Your app code -->
  <script type="text/babel">
    const { Button, Card, Input } = window;
    
    function App() {
      return (
        <div style={{ padding: 'var(--space-8)', background: 'var(--bg-app)', minHeight: '100vh' }}>
          <Card>
            <h1>Hello, World!</h1>
            <Input label="Your name" placeholder="Enter name" />
            <Button variant="primary">Submit</Button>
          </Card>
        </div>
      );
    }
    
    ReactDOM.createRoot(document.getElementById("root")).render(<App />);
  </script>
</body>
</html>
```

**Key points:**
- `data-theme`, `data-brand`, `data-style` on `<html>` control the entire look
- tokens.css loaded from GitHub (use the raw CDN URL)
- Components loaded from GitHub (use the raw CDN URL)
- Your JSX destructures components from `window` (they're exported to the global scope)
- Babel transforms JSX in-browser

---

## Component API Quick Reference

### Primitives

#### Button
```jsx
<Button 
  variant="primary"  // primary, secondary, tertiary, tonal, outline, ghost, text, danger, link
  size="md"          // xs, sm, md, lg
  leading="plus"     // Lucide icon name (optional)
  trailing="arrow-right"
  loading={false}
  disabled={false}
  iconOnly={false}   // If true, requires ariaLabel
  ariaLabel={iconOnly ? "Label" : undefined}
  onClick={handler}
>
  Label
</Button>
```

#### Input
```jsx
<Input 
  label="Email"
  hint="We'll send a code"
  error={false}      // or error message string
  required={false}
  placeholder="name@example.com"
  value={value}
  onChange={(val) => {}}
  type="text"        // email, password, tel, etc.
  leading="mail"     // Lucide icon
  trailing="check"
  size="md"          // sm, md, lg
/>
```

#### Card
```jsx
<Card interactive={false} padding="var(--card-pad)" onClick={handler}>
  Content
</Card>
```

#### Badge
```jsx
<Badge 
  variant="neutral"  // neutral, brand, success, warning, danger, info, solid
  size="md"          // sm, md, lg
  dot={false}        // Colored dot before children
  leading="check"    // Lucide icon
>
  Label
</Badge>
```

#### Alert
```jsx
<Alert 
  variant="info"     // info, success, warning, danger
  title="Saved"
  onDismiss={handler}  // If set, shows X to close
>
  Description text
</Alert>
```

#### Tabs
```jsx
<Tabs 
  value="tab1"       // Controlled
  onChange={(val) => {}}
  items={[
    { value: "tab1", label: "Users", icon: "users", count: 42 },
    { value: "tab2", label: "Settings" }
  ]}
  variant="underline"  // underline, pill
/>
```

#### Select
```jsx
<Select 
  label="Status"
  value={value}
  onChange={(val) => {}}
  options={["Active", "Inactive"]}  // or [{value, label}]
  placeholder="Choose one"
  error={false}
/>
```

#### Checkbox, Radio, Switch
```jsx
<Checkbox label="Remember me" hint="For 30 days" />
<Radio name="choice" value="a" label="Option A" />
<Switch label="Dark mode" />
```

#### Dialog (from Overlays)
```jsx
<Dialog
  open={isOpen}
  onClose={() => setOpen(false)}
  title="Confirm"
  description="Are you sure?"
  footer={
    <>
      <Button onClick={() => setOpen(false)}>Cancel</Button>
      <Button variant="primary" onClick={onConfirm}>Delete</Button>
    </>
  }
>
  Body content
</Dialog>
```

### Display Components

#### DataTable
```jsx
<DataTable 
  data={[
    { id: 1, name: "Alice", email: "alice@example.com" },
    { id: 2, name: "Bob", email: "bob@example.com" }
  ]}
  columns={[
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email" }
  ]}
  searchable={true}
  selectable={true}
  pageSize={10}
  emptyText="No users found"
/>
```

#### Progress
```jsx
<Progress value={65} max={100} label="Upload" variant="brand" />
```

#### Empty
```jsx
<Empty 
  icon="inbox"
  title="No data"
  description="Create something to get started"
  action={<Button>Create</Button>}
/>
```

#### Table (Primitive)
```jsx
<Table dense={false}>
  <TableHeader>
    <TableRow>
      <TableHead sortable sorted="asc">Name</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow selected={false}>
      <TableCell>Alice</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Specialized Components

#### DatePicker (Small.jsx)
```jsx
<DatePicker 
  value={date}
  onChange={(d) => {}}
  label="Birth date"
  placeholder="Pick a date"
/>
```

#### Combobox (MoreInputs.jsx)
```jsx
<Combobox 
  value={value}
  onChange={(val) => {}}
  options={[
    { value: "us", label: "United States" },
    { value: "uk", label: "United Kingdom" }
  ]}
  label="Country"
  searchPlaceholder="Search countries…"
/>
```

#### Slider (MoreInputs.jsx)
```jsx
<Slider 
  value={50}
  onChange={(val) => {}}
  min={0}
  max={100}
  label="Volume"
  showValue={true}
/>
```

#### Sidebar (Sidebar.jsx)
```jsx
<Sidebar 
  brand="MyApp"
  items={[
    { group: "Main" },
    { id: "home", label: "Home", icon: "home" },
    { id: "users", label: "Users", icon: "users", badge: "3" },
    { id: "settings", label: "Settings", icon: "settings" },
    { spacer: true },
    { group: "Admin" },
    { id: "debug", label: "Debug", icon: "bug" }
  ]}
  active={activeId}
  onSelect={(id) => setActive(id)}
/>
```

#### Chart (Complex.jsx)
```jsx
<Chart 
  type="line"
  data={[
    { month: "Jan", users: 100, revenue: 5000 },
    { month: "Feb", users: 120, revenue: 6000 }
  ]}
  x="month"
  y={["users", "revenue"]}  // multi-series
  height={240}
  label="Growth"
/>
```

---

## Pattern Library (Copy-Paste Sections)

### Pattern 1: Sidebar + Content Layout

```jsx
function App() {
  const [activeNav, setActiveNav] = React.useState("dashboard");
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar 
        brand="MyApp"
        items={[
          { group: "Navigation" },
          { id: "dashboard", label: "Dashboard", icon: "grid" },
          { id: "users", label: "Users", icon: "users" },
          { id: "settings", label: "Settings", icon: "settings" }
        ]}
        active={activeNav}
        onSelect={setActiveNav}
      />
      <main style={{ flex: 1, padding: 'var(--space-8)', overflow: 'auto', background: 'var(--bg-app)' }}>
        <h1 style={{ marginTop: 0 }}>
          {activeNav === 'dashboard' && 'Dashboard'}
          {activeNav === 'users' && 'Users'}
          {activeNav === 'settings' && 'Settings'}
        </h1>
        {/* Content goes here */}
      </main>
    </div>
  );
}
```

### Pattern 2: CRUD Table Page

```jsx
function UsersPage() {
  const [users, setUsers] = React.useState([
    { id: 1, name: "Alice", email: "alice@example.com", status: "active" },
    { id: 2, name: "Bob", email: "bob@example.com", status: "inactive" }
  ]);
  const [editingId, setEditingId] = React.useState(null);
  const [deleteId, setDeleteId] = React.useState(null);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Users</h2>
        <Button variant="primary" leading="plus">Add User</Button>
      </div>
      
      <DataTable 
        data={users}
        columns={[
          { key: "name", label: "Name", sortable: true },
          { key: "email", label: "Email", sortable: true },
          { 
            key: "status", 
            label: "Status",
            render: (row) => (
              <Badge variant={row.status === 'active' ? 'success' : 'warning'}>
                {row.status}
              </Badge>
            )
          },
          {
            key: "actions",
            label: "Actions",
            render: (row) => (
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(row.id)}>Edit</Button>
                <Button size="sm" variant="ghost" danger onClick={() => setDeleteId(row.id)}>Delete</Button>
              </div>
            )
          }
        ]}
        searchable
        emptyText="No users found"
      />
      
      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteId}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          setUsers(users.filter(u => u.id !== deleteId));
          setDeleteId(null);
          window.toast.success("User deleted");
        }}
        title="Delete user?"
        description="This action cannot be undone."
        variant="danger"
      />
    </div>
  );
}
```

### Pattern 3: Settings Form

```jsx
function SettingsPage() {
  const [email, setEmail] = React.useState("user@example.com");
  const [darkMode, setDarkMode] = React.useState(false);
  const [saveLoading, setSaveLoading] = React.useState(false);
  
  const handleSave = async () => {
    setSaveLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));
    setSaveLoading(false);
    window.toast.success("Settings saved");
  };
  
  return (
    <Card style={{ maxWidth: '600px' }}>
      <h2 style={{ marginTop: 0 }}>Preferences</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <Input 
          label="Email" 
          value={email}
          onChange={setEmail}
          hint="Your login email"
        />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ margin: '0 0 var(--space-1) 0' }}>Dark mode</h4>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--fg-muted)' }}>
              Use dark theme
            </p>
          </div>
          <Switch checked={darkMode} onChange={setDarkMode} />
        </div>
        
        <Separator />
        
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button variant="primary" loading={saveLoading} onClick={handleSave}>
            Save Changes
          </Button>
          <Button variant="secondary">Cancel</Button>
        </div>
      </div>
    </Card>
  );
}
```

### Pattern 4: Login Page

```jsx
function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      // Simulate API call
      if (!email.includes("@")) throw new Error("Invalid email");
      window.toast.success("Logged in!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'var(--bg-app)'
    }}>
      <Card style={{ width: '100%', maxWidth: '400px' }}>
        <h1 style={{ textAlign: 'center', marginTop: 0 }}>Sign In</h1>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {error && <Alert variant="danger" title="Error" children={error} />}
          
          <Input 
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            required
          />
          
          <Input 
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            required
          />
          
          <Checkbox label="Remember me" />
          
          <Button type="submit" variant="primary" fullWidth loading={loading}>
            Sign In
          </Button>
          
          <p style={{ textAlign: 'center', margin: 0, fontSize: 'var(--text-sm)' }}>
            Don't have an account? <a href="#signup">Sign up</a>
          </p>
        </form>
      </Card>
      
      <Toaster position="bottom-right" />
    </div>
  );
}
```

### Pattern 5: Dashboard Metrics

```jsx
function Dashboard() {
  const metrics = [
    { label: "Total Users", value: "2,453", change: "+12%", icon: "users" },
    { label: "Revenue", value: "$45.2K", change: "+8%", icon: "dollar-sign" },
    { label: "Churn Rate", value: "2.1%", change: "-0.5%", icon: "trending-down" },
    { label: "NPS", value: "72", change: "+4", icon: "smile" }
  ];
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <h2>Dashboard</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
        {metrics.map((m) => (
          <Card key={m.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: '0 0 var(--space-1) 0', fontSize: 'var(--text-sm)', color: 'var(--fg-muted)' }}>
                  {m.label}
                </p>
                <h3 style={{ margin: 0, fontSize: 'var(--text-3xl)', color: 'var(--fg-strong)' }}>
                  {m.value}
                </h3>
              </div>
              <Badge variant="success">{m.change}</Badge>
            </div>
          </Card>
        ))}
      </div>
      
      <Card>
        <h3 style={{ marginTop: 0 }}>User Growth</h3>
        <Chart 
          type="line"
          data={[
            { month: "Jan", users: 1000 },
            { month: "Feb", users: 1200 },
            { month: "Mar", users: 1450 },
            { month: "Apr", users: 1800 },
            { month: "May", users: 2100 },
            { month: "Jun", users: 2453 }
          ]}
          x="month"
          y="users"
          height={300}
        />
      </Card>
    </div>
  );
}
```

---

## Output Checklist

Before delivering the generated HTML file to the client, verify:

- [ ] **Single file** — No external local imports except tokens.css and JSX modules (all via CDN)
- [ ] **data-* attributes** — `data-theme`, `data-brand`, `data-style` all set on `<html>`
- [ ] **Script load order** — Primitives.jsx loaded first; only needed modules included
- [ ] **Form accessibility** — Every `Input`, `Select`, `Textarea` has a `label`; `iconOnly` buttons have `ariaLabel`
- [ ] **No raw colors** — All colors use `var(--*)` CSS variables or component props
- [ ] **No raw spacing** — All spacing uses `var(--space-*)` or built-in component padding
- [ ] **Status variants** — Only `success`, `warning`, `danger`, `info` used (no custom colors)
- [ ] **Toaster mounted** — If using toasts, `<Toaster>` is in the JSX root
- [ ] **Light + dark tested** — Toggle `data-theme="light"` and `data-theme="dark"` in the HTML; both look correct
- [ ] **Responsive** — Page looks good on mobile (test with browser dev tools)
- [ ] **No console errors** — Open dev console and verify no JavaScript errors
- [ ] **Accessible** — Tested keyboard nav, checked color contrast, labels present

---

## How to Use This File

### For Clients/Users Requesting an Interface:

1. Find an AI (Claude, ChatGPT, etc.) or open [Claude Code](https://claude.com/claude-code)
2. Give it this file (BUILD.md) and say something like:
   > "I want to build a new page for my app. Here's our design system guide (BUILD.md). What do you need to know?"
3. Answer the intake questions (the AI will ask one at a time)
4. The AI will generate a complete HTML file
5. Open the HTML in a browser, test it, and send to stakeholders

### For AI/Claude Code:

1. Read the entire BUILD.md file (this is your brief)
2. When a user asks to build, start the **[Client Intake Workflow](#client-intake-workflow)** — ask questions 1–9 in order, waiting for answers
3. Based on the answers, select components from **[Component Selection Guide](#component-selection-guide)**
4. Generate a single HTML file using **[HTML Boilerplate Template](#html-boilerplate-template)** + patterns from **[Pattern Library](#pattern-library)**
5. Follow all rules in **[Code Generation Rules](#code-generation-rules)**
6. Before returning the file, verify the **[Output Checklist](#output-checklist)**
7. Return the HTML as a single code block, ready to save and open in a browser

---

## Repository

The design system source lives at:
**https://github.com/eduardosicsu-Viber/Custom-Design-system.git**

- **tokens.css** — All design tokens (all styles are controlled by this file)
- **`src/whitelabel/*.jsx`** — React components
- **Whitelabel UI Kit.html** — Interactive showcase of all components

For detailed architecture and component guidelines, see `CLAUDE.md` in the repo.

---

## Questions?

Refer back to:
- **Component API** — Find your component's props in this file
- **Pattern Library** — Copy a similar pattern and adapt
- **Code Generation Rules** — Check accessibility, no raw values, theme testing
- **Design System README** — Full project documentation

Happy building! 🎨
