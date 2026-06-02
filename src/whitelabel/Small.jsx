// White-label small primitives — 10 simple components.

const { useState: useSS, useEffect: useSE3, useRef: useSR, useMemo: useSM } = React;

/* ─── LABEL ────────────────────────────────────────────────────────────── */
function Label({ htmlFor, required, children, style }) {
  return (
    <label htmlFor={htmlFor} style={{
      display: "inline-block", fontSize: 13, fontWeight: 500,
      color: "var(--fg-default)", lineHeight: 1.3, ...style,
    }}>
      {children}
      {required && <span style={{ color: "var(--fg-danger)", marginLeft: 2 }}>*</span>}
    </label>
  );
}

/* ─── TOGGLE (single) ──────────────────────────────────────────────────── */
function Toggle({ pressed, defaultPressed, onChange, disabled, size = "md", variant = "ghost", icon, children, ariaLabel }) {
  const [internal, setInternal] = useSS(defaultPressed || false);
  const controlled = pressed !== undefined;
  const on = controlled ? pressed : internal;
  const click = () => {
    if (disabled) return;
    if (!controlled) setInternal(!on);
    onChange && onChange(!on);
  };
  const sizes = { sm: { h: 28, px: 8, fs: 12, ix: 14 }, md: { h: 34, px: 10, fs: 13, ix: 16 }, lg: { h: 40, px: 14, fs: 14, ix: 18 } };
  const sz = sizes[size];
  return (
    <button type="button" aria-pressed={on} aria-label={ariaLabel}
      disabled={disabled} onClick={click}
      style={{
        appearance: "none", cursor: disabled ? "not-allowed" : "pointer",
        height: sz.h, padding: children ? `0 ${sz.px}px` : 0,
        width: !children ? sz.h : undefined,
        background: on ? (variant === "outline" ? "var(--bg-brand-subtle)" : "var(--bg-muted)") : "transparent",
        color: on ? "var(--fg-brand)" : "var(--fg-muted)",
        border: variant === "outline" ? "1px solid var(--border-default)" : "0",
        borderRadius: "var(--radius-md)",
        fontFamily: "inherit", fontSize: sz.fs, fontWeight: 500,
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
        opacity: disabled ? 0.5 : 1, transition: "background var(--dur-fast)",
      }}
      onMouseEnter={e => !disabled && !on && (e.currentTarget.style.background = "var(--bg-subtle)")}
      onMouseLeave={e => !on && (e.currentTarget.style.background = "transparent")}>
      {icon && <Icon name={icon} size={sz.ix} />}
      {children}
    </button>
  );
}

/* ─── ASPECT RATIO ─────────────────────────────────────────────────────── */
function AspectRatio({ ratio = 16/9, children, style, ...rest }) {
  return (
    <div style={{ position: "relative", width: "100%", paddingBottom: `${100 / ratio}%`, ...style }} {...rest}>
      <div style={{ position: "absolute", inset: 0 }}>{children}</div>
    </div>
  );
}

/* ─── BUTTON GROUP ─────────────────────────────────────────────────────── */
// Joins adjacent buttons into a single visual group. Children should be Buttons.
function ButtonGroup({ children, style }) {
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <div role="group" style={{ display: "inline-flex", ...style }}>
      {items.map((child, i) => {
        const first = i === 0, last = i === items.length - 1;
        const inheritedStyle = child.props.style || {};
        return React.cloneElement(child, {
          style: {
            ...inheritedStyle,
            borderTopLeftRadius:    first ? undefined : 0,
            borderBottomLeftRadius: first ? undefined : 0,
            borderTopRightRadius:    last ? undefined : 0,
            borderBottomRightRadius: last ? undefined : 0,
            marginLeft: first ? 0 : -1,
            position: "relative",
          },
          key: i,
        });
      })}
    </div>
  );
}

/* ─── INPUT GROUP — input with attached addons / buttons ──────────────── */
// <InputGroup>
//   <InputGroupAddon>https://</InputGroupAddon>
//   <InputGroupInput placeholder="acme" />
//   <InputGroupAddon>.com</InputGroupAddon>
// </InputGroup>
function InputGroup({ children, size = "md", style }) {
  const items = React.Children.toArray(children).filter(Boolean);
  const sizes = { sm: 32, md: 38, lg: 46 };
  const h = sizes[size];
  return (
    <div style={{
      display: "flex", alignItems: "stretch", height: h,
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-md)",
      background: "var(--bg-surface)",
      overflow: "hidden",
      ...style,
    }}>
      {items.map((c, i) => React.cloneElement(c, { _groupIndex: i, _groupCount: items.length, key: i }))}
    </div>
  );
}

function InputGroupAddon({ children, _groupIndex, _groupCount }) {
  const isLast = _groupIndex === _groupCount - 1;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      padding: "0 12px", background: "var(--bg-muted)",
      color: "var(--fg-muted)", fontSize: 13,
      borderRight: !isLast ? "1px solid var(--border-default)" : "0",
      borderLeft:  _groupIndex !== 0 ? "1px solid var(--border-default)" : "0",
      whiteSpace: "nowrap", flexShrink: 0,
    }}>{children}</div>
  );
}

function InputGroupInput({ value, defaultValue, onChange, placeholder, type = "text" }) {
  return (
    <input type={type} value={value} defaultValue={defaultValue}
      onChange={e => onChange && onChange(e.target.value)} placeholder={placeholder}
      style={{
        flex: 1, minWidth: 0, padding: "0 12px", border: 0, outline: 0,
        background: "transparent", fontFamily: "inherit", fontSize: 14,
        color: "var(--fg-default)",
      }} />
  );
}

function InputGroupButton({ children, onClick, _groupIndex, _groupCount, ...rest }) {
  return (
    <button type="button" onClick={onClick} {...rest} style={{
      appearance: "none", border: 0, padding: "0 14px",
      background: "var(--bg-muted)", color: "var(--fg-default)",
      cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 500,
      borderLeft: "1px solid var(--border-default)",
    }}>{children}</button>
  );
}

/* ─── FIELD — form-row wrapper that bundles Label + Input + hint/error ── */
function Field({ label, hint, error, required, htmlFor, children, style }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      {label && <Label htmlFor={htmlFor} required={required}>{label}</Label>}
      {children}
      {(hint || error) && (
        <span style={{ fontSize: 12, lineHeight: 1.4, color: error ? "var(--fg-danger)" : "var(--fg-muted)" }}>
          {error || hint}
        </span>
      )}
    </div>
  );
}

/* ─── ITEM — generic list-item primitive ──────────────────────────────── */
function Item({ leading, trailing, title, description, onClick, selected, disabled, style }) {
  const [hover, setHover] = useSS(false);
  const bg = selected ? "var(--bg-brand-subtle)" : hover && !disabled && onClick ? "var(--bg-subtle)" : "transparent";
  return (
    <div role={onClick ? "button" : undefined}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "10px 12px", background: bg,
        borderRadius: "var(--radius-md)",
        cursor: onClick && !disabled ? "pointer" : "default",
        opacity: disabled ? 0.5 : 1,
        transition: "background var(--dur-fast)",
        ...style,
      }}>
      {leading && <div style={{ flexShrink: 0 }}>{leading}</div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <div style={{ fontSize: 14, fontWeight: 500, color: selected ? "var(--fg-brand)" : "var(--fg-default)", lineHeight: 1.3 }}>{title}</div>}
        {description && <div style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 1, lineHeight: 1.4 }}>{description}</div>}
      </div>
      {trailing && <div style={{ flexShrink: 0, color: "var(--fg-muted)" }}>{trailing}</div>}
    </div>
  );
}

/* ─── COLLAPSIBLE — single open/close section ─────────────────────────── */
function Collapsible({ open, defaultOpen, onChange, trigger, children, style }) {
  const [internal, setInternal] = useSS(defaultOpen || false);
  const controlled = open !== undefined;
  const cur = controlled ? open : internal;
  const toggle = () => {
    if (!controlled) setInternal(!cur);
    onChange && onChange(!cur);
  };
  return (
    <div style={style}>
      <div onClick={toggle} style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
        {typeof trigger === "function" ? trigger({ open: cur, toggle }) : (
          <>
            <Icon name="chevron-right" size={14}
              style={{ transform: cur ? "rotate(90deg)" : "rotate(0)", transition: "transform var(--dur-fast)", color: "var(--fg-muted)" }} />
            {trigger}
          </>
        )}
      </div>
      {cur && <div style={{ paddingTop: 8 }}>{children}</div>}
    </div>
  );
}

/* ─── SCROLL AREA — element with styled custom scrollbar ──────────────── */
function ScrollArea({ children, height = 240, width, style, className }) {
  return (
    <div className={`wl-scroll ${className || ""}`}
      style={{
        height, width, overflow: "auto",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        ...style,
      }}>
      {children}
      <style>{`
        .wl-scroll::-webkit-scrollbar { width: 10px; height: 10px; }
        .wl-scroll::-webkit-scrollbar-track { background: transparent; }
        .wl-scroll::-webkit-scrollbar-thumb {
          background: var(--border-default); border-radius: 9999px;
          border: 2px solid transparent; background-clip: padding-box;
        }
        .wl-scroll::-webkit-scrollbar-thumb:hover { background: var(--border-strong); background-clip: padding-box; border: 2px solid transparent; }
        .wl-scroll { scrollbar-width: thin; scrollbar-color: var(--border-default) transparent; }
      `}</style>
    </div>
  );
}

/* ─── ALERT DIALOG — destructive confirm variant of Dialog ────────────── */
// Differs from Dialog: no backdrop dismiss, no close-X, action buttons in footer with explicit destructive variant.
function AlertDialog({ open, onCancel, onConfirm, title, description, confirmLabel = "Continue", cancelLabel = "Cancel", variant = "default", icon }) {
  const v = {
    default: { ic: icon || "alert-circle", bg: "var(--bg-info-subtle)",    fg: "var(--fg-info)",    confirmVariant: "primary" },
    danger:  { ic: icon || "alert-octagon",bg: "var(--bg-danger-subtle)",  fg: "var(--fg-danger)",  confirmVariant: "danger" },
    warning: { ic: icon || "alert-triangle", bg: "var(--bg-warning-subtle)", fg: "var(--fg-warning)", confirmVariant: "primary" },
  }[variant];
  return (
    <Dialog open={open} onClose={onCancel} closeOnBackdrop={false} hideClose size="sm"
      footer={<>
        <Button variant="outline" onClick={onCancel}>{cancelLabel}</Button>
        <Button variant={v.confirmVariant} onClick={onConfirm}>{confirmLabel}</Button>
      </>}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <span style={{
          width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
          background: v.bg, color: v.fg,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Icon name={v.ic} size={20} /></span>
        <div>
          {title && <div style={{ fontSize: 16, fontWeight: 600, color: "var(--fg-strong)", marginBottom: 4 }}>{title}</div>}
          {description && <div style={{ fontSize: 14, color: "var(--fg-muted)", lineHeight: 1.5 }}>{description}</div>}
        </div>
      </div>
    </Dialog>
  );
}

/* ─── DIRECTION — LTR / RTL provider + toggle ─────────────────────────────
   White-label apps ship to RTL locales. <Direction dir="rtl"> sets the `dir`
   attribute + CSS `direction` on a wrapper (and optionally the document), so
   native flow, text alignment, and logical spacing mirror. `useDirection()`
   lets components read the active direction (e.g. to flip a chevron).
   Note: inline-styled components that hard-code left/right won't auto-mirror —
   prefer logical properties or read useDirection() where it matters. */
const DirectionContext = React.createContext("ltr");
function useDirection() { return React.useContext(DirectionContext); }

function Direction({ dir = "ltr", applyToDocument = false, children, style, className }) {
  useSE3(() => {
    if (!applyToDocument) return;
    const root = document.documentElement;
    const prev = root.getAttribute("dir");
    root.setAttribute("dir", dir);
    return () => { if (prev) root.setAttribute("dir", prev); else root.removeAttribute("dir"); };
  }, [dir, applyToDocument]);
  return (
    <DirectionContext.Provider value={dir}>
      <div dir={dir} className={className} style={{ direction: dir, ...style }}>{children}</div>
    </DirectionContext.Provider>
  );
}

function DirectionToggle({ value, defaultValue = "ltr", onChange, size = "md" }) {
  const [internal, setInternal] = useSS(defaultValue);
  const controlled = value !== undefined;
  const dir = controlled ? value : internal;
  const set = (d) => { if (!controlled) setInternal(d); onChange && onChange(d); };
  const h = size === "sm" ? 30 : 36;
  const opts = [{ v: "ltr", label: "LTR", icon: "align-left" }, { v: "rtl", label: "RTL", icon: "align-right" }];
  return (
    <div role="group" aria-label="Text direction" style={{
      display: "inline-flex", padding: 3, gap: 2, background: "var(--bg-muted)",
      borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)",
    }}>
      {opts.map(o => {
        const active = dir === o.v;
        return (
          <button key={o.v} type="button" onClick={() => set(o.v)} aria-pressed={active} style={{
            appearance: "none", border: 0, cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 6, height: h - 6, padding: "0 12px",
            fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 500,
            color: active ? "var(--fg-default)" : "var(--fg-muted)",
            background: active ? "var(--bg-surface)" : "transparent",
            borderRadius: "var(--radius-sm)",
            boxShadow: active ? "var(--shadow-xs)" : "none",
            transition: "all var(--dur-fast) var(--ease-out)",
          }}>
            <Icon name={o.icon} size={15} />{o.label}
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, {
  Label, Toggle, AspectRatio, ButtonGroup,
  InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton,
  Field, Item, Collapsible, ScrollArea, AlertDialog,
  Direction, DirectionToggle, useDirection,
});
