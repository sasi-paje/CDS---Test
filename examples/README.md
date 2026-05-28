# Whitelabel Design System — Examples

This folder contains production-ready examples built **using the actual Whitelabel Design System components** from the repo.

## ✅ Principles

1. **Use real components** — Sidebar, DataTable, Badge, Button, AlertDialog, Toaster (never vanilla HTML)
2. **All styling via tokens** — No hardcoded colors, spacing, or radii
3. **Proper script loading** — Primitives.jsx first, then only needed modules
4. **Light + Dark support** — Test both themes
5. **Emerald + Enterprise** — Demonstrates the style system in action
6. **Data-focused** — No unnecessary UI chrome

---

## 📦 Current Examples

### **Inbox SaaS Page** (`inbox/inbox.html`)

A task/ticket management inbox demonstrating the full design system.

**Components Used:**
- `Sidebar` — Navigation (All Tasks, My Tasks) with counts
- `DataTable` — Task list with built-in search, sort, pagination
- `Badge` — Status and Priority color-coded badges
- `Button` — Action buttons (delete)
- `AlertDialog` — Delete confirmation
- `Toaster` — Toast notifications
- `Input` — Search field (via DataTable)

**Features:**
- ✅ Sidebar navigation with active states
- ✅ Data-focused table (Title, Status, Priority, Assignee, Due Date)
- ✅ Real-time search across tasks
- ✅ Sortable columns (via DataTable)
- ✅ Pagination (via DataTable)
- ✅ Delete confirmation dialog
- ✅ Light/Dark theme toggle (top right)
- ✅ Toast notifications on actions

**How to view:**
```bash
open inbox/inbox.html
```

Or open directly in browser:
```
file:///tmp/Custom-Design-system/examples/inbox/inbox.html
```

**Design:**
- Brand: Emerald (growth-focused, professional)
- Style: Enterprise (tight density, formal structure)
- Theme: Light by default, toggle to Dark

---

## 🛠️ Building New Examples

**Checklist before pushing:**
- [ ] Uses actual design system components (never vanilla HTML)
- [ ] All colors via `var(--*)` CSS variables
- [ ] All spacing via `var(--space-*)` tokens
- [ ] All typography via `var(--text-*)` tokens
- [ ] Primitives.jsx loaded first
- [ ] Only used modules imported
- [ ] Form fields have labels
- [ ] iconOnly buttons have ariaLabel
- [ ] Works in both light and dark themes
- [ ] No console errors
- [ ] Responsive and accessible

**Template:**
1. Create a new folder: `examples/my-example/`
2. Create `my-example.html` using the boilerplate below
3. Use actual components from design system
4. Test in browser and both themes
5. Push to Git

**Boilerplate:**
```html
<!doctype html>
<html lang="en" data-theme="light" data-brand="emerald" data-style="enterprise">
<head>
  <meta charset="utf-8" />
  <title>Example</title>
  <link rel="stylesheet" href="https://raw.githubusercontent.com/eduardosicsu-Viber/Custom-Design-system/main/src/whitelabel/tokens.css" />
  <script src="https://unpkg.com/react@18.3.1/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body>
  <div id="root"></div>

  <!-- ALWAYS: Primitives first -->
  <script type="text/babel" src="https://raw.githubusercontent.com/eduardosicsu-Viber/Custom-Design-system/main/src/whitelabel/Primitives.jsx"></script>
  <!-- Then only what you need -->
  <script type="text/babel" src="https://raw.githubusercontent.com/eduardosicsu-Viber/Custom-Design-system/main/src/whitelabel/Sidebar.jsx"></script>
  <script type="text/babel" src="https://raw.githubusercontent.com/eduardosicsu-Viber/Custom-Design-system/main/src/whitelabel/Display.jsx"></script>

  <script type="text/babel">
    const { Sidebar, Button, Card } = window;
    
    function App() {
      return (
        <div>Your component tree here</div>
      );
    }

    ReactDOM.createRoot(document.getElementById("root")).render(<App />);
  </script>
</body>
</html>
```

---

## 🎨 Design System Reference

- **Tokens:** `/src/whitelabel/tokens.css`
- **Components:** `/src/whitelabel/*.jsx`
- **Showcase:** `Whitelabel UI Kit.html`
- **Build Guide:** `BUILD.md`

### Available Components

**Primitives** (Primitives.jsx):
- Button, IconButton, Input, Textarea, Select, Checkbox, Radio, Switch
- Badge, Avatar, Card, Spinner, Alert, Tooltip, Progress, Tabs, Breadcrumbs, Kbd

**Display** (Display.jsx):
- Table, Separator, Skeleton, Empty, Pagination

**Overlays** (Overlays.jsx):
- Dialog, Sheet, Popover, DropdownMenu, Toaster, AlertDialog

**Layout** (Sidebar.jsx):
- Sidebar (full-featured app sidebar)

**Advanced** (Complex.jsx, Small.jsx, Medium.jsx, MoreInputs.jsx):
- DataTable, Chart, Carousel, Combobox, DatePicker, Slider, etc.

---

**Built with:** https://github.com/eduardosicsu-Viber/Custom-Design-system
