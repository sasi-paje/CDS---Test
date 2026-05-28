# Custom Design System — Examples & Builds

This folder contains working examples built with the **Whitelabel Design System** from https://github.com/eduardosicsu-Viber/Custom-Design-system.

## Current Examples

### 1. `/inbox` — SaaS Task Management Inbox
- **File:** `inbox.html`
- **Style:** Enterprise (professional, dense)
- **Components:** Sidebar, DataTable, Input, Badge, Button, AlertDialog, Toaster
- **Features:**
  - Sidebar navigation with task counts
  - Data-focused table (Title, Status, Priority, Assignee, Due Date)
  - Real-time search across tasks
  - Delete confirmation dialog
  - Light/Dark theme toggle
  - Toast notifications

**Open:** 
```bash
open inbox/inbox.html
```

### 2. `/dashboard` — Admin User Management Dashboard
- **File:** `dashboard.html`
- **Style:** Enterprise (formal, data-focused)
- **Components:** Sidebar (expandable), DataTable, Dialog, AlertDialog, Badge, Button, Card
- **Features:**
  - **Expandable sidebar** with smooth collapse/expand animation
  - **Statistics cards** at top (Total Users, Active, Admins, This Month)
  - **User data table** with search, sort, pagination
  - **Create user dialog** with form validation
  - **Edit user dialog** for in-place updates
  - **Delete confirmation** with AlertDialog
  - **Status badges** (Active/Inactive) with semantic colors
  - **Role badges** (Admin/Editor/Viewer) with semantic colors
  - **CRUD operations** (Create, Read, Update, Delete)
  - **Toast notifications** on actions
  - **Light/Dark theme toggle**

**Open:** 
```bash
open dashboard/dashboard.html
```

---

## Design System Rules (Applied to All Examples)

✅ **Always Used:**
- Actual design system components (Sidebar, DataTable, Input, Badge, Button, etc.)
- CSS variables only (no hardcoded colors/spacing)
- Proper script loading order (Primitives.jsx first)
- Both light & dark themes supported
- Accessibility rules (iconOnly buttons have ariaLabel, form fields have labels)
- Status taxonomy (success/warning/danger/info only)
- Toaster mounted once at root

## Adding New Examples

1. Create a new folder: `/my-example`
2. Create `my-example.html` using this template:
   ```html
   <!doctype html>
   <html lang="en" data-theme="light" data-brand="indigo" data-style="enterprise">
   <head>
     <meta charset="utf-8" />
     <meta name="viewport" content="width=device-width, initial-scale=1" />
     <title>Example</title>
     <link rel="stylesheet" href="../../src/whitelabel/tokens.css" />
     <script src="https://unpkg.com/react@18.3.1/umd/react.development.js"></script>
     <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"></script>
     <script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js"></script>
     <script src="https://unpkg.com/lucide@latest"></script>
   </head>
   <body>
     <div id="root"></div>
     <script type="text/babel" src="../../src/whitelabel/Primitives.jsx"></script>
     <!-- Load only the modules you use -->
     <script type="text/babel" src="../../src/whitelabel/Overlays.jsx"></script>
     <script type="text/babel">
       const { Button, Card } = window;
       function App() {
         return <Card><Button variant="primary">Hello</Button></Card>;
       }
       ReactDOM.createRoot(document.getElementById("root")).render(<App />);
     </script>
   </body>
   </html>
   ```
3. Use actual design system components only
4. Test in light + dark themes
5. Update this README with the new example
6. Push to Git when production-ready

## Verification Checklist (Before Pushing)

- [ ] Uses actual design system components (Sidebar, DataTable, etc.)
- [ ] All styling via CSS variables (no inline hex codes or px values)
- [ ] Script loading order correct (Primitives.jsx first)
- [ ] Tested in both light and dark themes
- [ ] All form fields have labels
- [ ] All iconOnly buttons have ariaLabel
- [ ] Status variants limited to success/warning/danger/info
- [ ] Toaster mounted and working
- [ ] No console errors
- [ ] Layout is clean and readable

---

**Built with:** https://github.com/eduardosicsu-Viber/Custom-Design-system
