// White-label app chrome: Sidebar (collapsible, sections, sub-items)

const { useState: useStLay } = React;

function Sidebar({
  items,            // [{ id, label, icon, badge, sub?: [...] }, { group: "Label" }]
  active,
  onSelect,
  collapsed,
  onToggle,
  brand = "App",    // string or React node — top-left mark/wordmark
  footer,           // bottom area (user card etc.)
  width = 248,
  collapsedWidth = 64,
  height = "100vh",
}) {
  const W = collapsed ? collapsedWidth : width;
  return (
    <aside style={{
      width: W, flexShrink: 0, height,
      background: "var(--bg-canvas)",
      borderRight: "1px solid var(--border-subtle)",
      display: "flex", flexDirection: "column",
      transition: "width var(--dur-base) var(--ease-out)",
      overflow: "hidden",
    }}>
      {/* Brand / top */}
      <div style={{
        padding: collapsed ? "16px 12px" : "16px 18px",
        display: "flex", alignItems: "center",
        gap: 10, justifyContent: "space-between",
        borderBottom: "1px solid var(--border-subtle)", minHeight: 60,
      }}>
        {typeof brand === "string"
          ? <SidebarMark label={brand} collapsed={collapsed} />
          : brand}
        {!collapsed && onToggle && (
          <button onClick={onToggle} aria-label="Collapse sidebar" style={{
            appearance: "none", border: 0, background: "transparent",
            padding: 4, borderRadius: 4, cursor: "pointer", color: "var(--fg-muted)",
          }}><Icon name="panel-left-close" size={16} /></button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 8px", overflow: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map((it, i) => {
          if (it.group) return (
            !collapsed && (
              <div key={i} style={{
                padding: "12px 10px 4px", fontSize: 10.5, fontWeight: 700,
                color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.08em",
              }}>{it.group}</div>
            )
          );
          if (it.spacer) return <div key={i} style={{ flex: 1 }} />;
          return <SidebarItem key={it.id || i} item={it}
            active={active} onSelect={onSelect} collapsed={collapsed} />;
        })}
      </nav>

      {/* Footer */}
      {footer && (
        <div style={{ borderTop: "1px solid var(--border-subtle)", padding: collapsed ? "10px 12px" : "10px 14px" }}>
          {footer}
        </div>
      )}

      {/* Expand button when collapsed */}
      {collapsed && onToggle && (
        <button onClick={onToggle} aria-label="Expand sidebar" style={{
          margin: "8px auto 12px", width: 32, height: 32, borderRadius: 6,
          appearance: "none", border: "1px solid var(--border-subtle)",
          background: "var(--bg-surface)", color: "var(--fg-muted)", cursor: "pointer",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Icon name="panel-left-open" size={16} /></button>
      )}
    </aside>
  );
}

function SidebarMark({ label, collapsed }) {
  const initial = (label || "?").trim().charAt(0).toUpperCase();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
      <span style={{
        width: 28, height: 28, borderRadius: 7,
        background: "linear-gradient(135deg, var(--brand-500), var(--brand-700))",
        color: "var(--neutral-0)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontWeight: 700, fontSize: 14, flexShrink: 0,
      }}>{initial}</span>
      {!collapsed && (
        <span style={{
          fontSize: 14, fontWeight: 600, color: "var(--fg-strong)", letterSpacing: "-0.01em",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{label}</span>
      )}
    </div>
  );
}

function SidebarItem({ item, active, onSelect, collapsed }) {
  const [open, setOpen] = useStLay(item.sub?.some(s => s.id === active) || false);
  const isActive = item.id === active;
  const [hover, setHover] = useStLay(false);
  const click = () => {
    if (item.sub?.length) setOpen(o => !o);
    else if (item.id && onSelect && !item.disabled) onSelect(item.id);
    if (item.onClick && !item.disabled) item.onClick();
  };
  const fg = item.disabled
    ? "var(--fg-disabled)"
    : isActive ? "var(--fg-brand)" : "var(--fg-default)";
  const bg = isActive
    ? "var(--bg-brand-subtle)"
    : hover && !item.disabled ? "var(--bg-muted)" : "transparent";
  return (
    <>
      <button onClick={click}
        title={collapsed ? item.label : undefined}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        disabled={item.disabled}
        style={{
          appearance: "none", border: 0, cursor: item.disabled ? "not-allowed" : "pointer",
          background: bg, color: fg, fontFamily: "inherit",
          padding: collapsed ? "9px 0" : "8px 10px", borderRadius: "var(--radius-sm)",
          display: "flex", alignItems: "center", gap: 10,
          justifyContent: collapsed ? "center" : "flex-start",
          fontSize: 13.5, fontWeight: isActive ? 600 : 500,
          textAlign: "left", width: "100%",
          transition: "background var(--dur-fast)",
          position: "relative",
        }}>
        {item.icon && <Icon name={item.icon} size={17} />}
        {!collapsed && <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>}
        {!collapsed && item.badge != null && (
          <Badge size="sm" variant={isActive ? "brand" : "neutral"}>{item.badge}</Badge>
        )}
        {!collapsed && item.sub?.length > 0 && (
          <Icon name="chevron-down" size={14} style={{ transform: open ? "rotate(0)" : "rotate(-90deg)", transition: "transform var(--dur-fast)" }} />
        )}
        {collapsed && item.badge != null && (
          <span style={{ position: "absolute", top: 4, right: 8, minWidth: 6, height: 6, borderRadius: 9999, background: "var(--bg-danger)" }} />
        )}
      </button>
      {!collapsed && open && item.sub?.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingLeft: 24, paddingTop: 2, paddingBottom: 4 }}>
          {item.sub.map(s => {
            const a = s.id === active;
            return (
              <button key={s.id} onClick={() => onSelect && onSelect(s.id)}
                style={{
                  appearance: "none", border: 0, cursor: "pointer",
                  background: a ? "var(--bg-brand-subtle)" : "transparent",
                  color: a ? "var(--fg-brand)" : "var(--fg-muted)",
                  padding: "6px 10px", borderRadius: "var(--radius-sm)",
                  fontFamily: "inherit", fontSize: 13, textAlign: "left",
                  fontWeight: a ? 600 : 500,
                }}>
                {s.label}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}

Object.assign(window, { Sidebar });
