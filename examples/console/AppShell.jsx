// Console UI kit — app shell: collapsible sidebar + topbar with the
// white-label switcher (theme / brand / style) so the kit demonstrates
// the system's core promise live.

const { useState: useShellState } = React;

function ConsoleShell({ page, onNavigate, theme, brand, style, onTheme, onBrand, onStyle, onOpenCommand, children, title, actions }) {
  const { Sidebar, IconButton, Avatar, Badge, Button, DropdownMenu, Kbd } = window;

  const nav = [
    { group: "Workspace" },
    { id: "dashboard", label: "Dashboard", icon: "layout-dashboard" },
    { id: "members",   label: "Members",   icon: "users", badge: 8 },
    { id: "billing",   label: "Billing",   icon: "credit-card" },
    { group: "Account" },
    { id: "settings",  label: "Settings",  icon: "settings" },
    { spacer: true },
    { id: "help",      label: "Help & docs", icon: "life-buoy" },
  ];

  const brands = ["indigo", "violet", "emerald", "rose", "amber", "slate"];
  const styles = ["standard", "enterprise", "friendly", "refined", "data-dense"];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-app)" }}>
      <Sidebar
        items={nav}
        active={page}
        onSelect={onNavigate}
        brand="Northwind"
        footer={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar name="Dana Reyes" size={32} status="online" />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg-strong)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Dana Reyes</div>
              <div style={{ fontSize: 11.5, color: "var(--fg-muted)" }}>Owner</div>
            </div>
            <IconButton icon="log-out" variant="ghost" size="sm" ariaLabel="Sign out" />
          </div>
        }
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Topbar */}
        <header style={{
          position: "sticky", top: 0, zIndex: "var(--z-sticky)",
          display: "flex", alignItems: "center", gap: "var(--space-5)",
          padding: "var(--space-4) var(--space-7)",
          background: "var(--bg-canvas)", borderBottom: "1px solid var(--border-subtle)",
        }}>
          <h1 style={{ margin: 0, fontSize: "var(--text-xl)", fontWeight: 600, color: "var(--fg-strong)" }}>{title}</h1>

          <button onClick={onOpenCommand} style={{
            marginLeft: "auto", display: "flex", alignItems: "center", gap: 8,
            height: 34, padding: "0 10px 0 12px", cursor: "pointer",
            background: "var(--bg-subtle)", border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)", color: "var(--fg-subtle)", fontFamily: "inherit", fontSize: 13,
          }}>
            <Icon name="search" size={15} />
            <span style={{ width: 120, textAlign: "left" }}>Search…</span>
            <Kbd>⌘K</Kbd>
          </button>

          {actions}

          {/* White-label switcher */}
          <DropdownMenu
            align="end"
            trigger={<IconButton icon="palette" variant="outline" size="md" ariaLabel="Theme & brand" />}
            items={[
              { label: "Brand hue" },
              ...brands.map(b => ({ label: b[0].toUpperCase() + b.slice(1), icon: b === brand ? "check" : "circle", onSelect: () => onBrand(b) })),
            ]}
          />
          <DropdownMenu
            align="end"
            trigger={<Button variant="outline" size="md" trailing="chevron-down">{style}</Button>}
            items={styles.map(s => ({ label: s, icon: s === style ? "check" : "square", onSelect: () => onStyle(s) }))}
          />
          <IconButton icon={theme === "light" ? "moon" : "sun"} variant="ghost" size="md"
            ariaLabel="Toggle theme" onClick={() => onTheme(theme === "light" ? "dark" : "light")} />
        </header>

        <main style={{ flex: 1, padding: "var(--space-7)", overflow: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

window.ConsoleShell = ConsoleShell;
