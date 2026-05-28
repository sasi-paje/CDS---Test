// White-label overlays: Dialog, Sheet, Popover, DropdownMenu, Toast.
// Uses portals so they escape stacking contexts. ESC + outside-click dismiss.

const { useState: useS, useEffect: useE, useRef: useR, useLayoutEffect: useL } = React;

/* ─────────────────────────────────────────────────────────────────────────
   Portal helper — always renders into document.body
   ───────────────────────────────────────────────────────────────────────── */
function Portal({ children }) {
  const [el] = useS(() => {
    if (typeof document === "undefined") return null;
    const d = document.createElement("div");
    d.dataset.portal = "wl";
    return d;
  });
  useE(() => {
    if (!el) return;
    document.body.appendChild(el);
    return () => { document.body.removeChild(el); };
  }, [el]);
  return el ? ReactDOM.createPortal(children, el) : null;
}

/* ─────────────────────────────────────────────────────────────────────────
   Hook: closeOnEscape
   ───────────────────────────────────────────────────────────────────────── */
function useEscape(open, onClose) {
  useE(() => {
    if (!open) return;
    const fn = (e) => { if (e.key === "Escape") onClose && onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, onClose]);
}

/* ─────────────────────────────────────────────────────────────────────────
   DIALOG
   <Dialog open={open} onClose={() => setOpen(false)} title="..." description="..." footer={…}>{body}</Dialog>
   ───────────────────────────────────────────────────────────────────────── */
function Dialog({
  open, onClose, title, description,
  children, footer, size = "md",
  closeOnBackdrop = true, hideClose = false,
}) {
  useEscape(open, onClose);
  if (!open) return null;
  const widths = { sm: 360, md: 480, lg: 640, xl: 820, full: "calc(100vw - 32px)" };
  return (
    <Portal>
      <div role="dialog" aria-modal="true" aria-labelledby={title ? "dlg-title" : undefined}
        style={{
          position: "fixed", inset: 0, zIndex: "var(--z-modal)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 16, animation: "wlFade 160ms var(--ease-out)",
        }}>
        <div onClick={closeOnBackdrop ? onClose : undefined}
          style={{ position: "absolute", inset: 0, background: "var(--bg-overlay)" }} />
        <div style={{
          position: "relative", width: widths[size], maxWidth: "100%", maxHeight: "calc(100vh - 32px)",
          background: "var(--bg-raised)", border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          animation: "wlScale 200ms var(--ease-out)",
        }}>
          {(title || !hideClose) && (
            <div style={{
              padding: "18px 20px 12px", display: "flex", alignItems: "flex-start", gap: 12,
              borderBottom: description ? "0" : (children ? "1px solid var(--border-subtle)" : "0"),
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {title && <h2 id="dlg-title" style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "var(--fg-strong)", letterSpacing: "-0.01em" }}>{title}</h2>}
                {description && <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "var(--fg-muted)", lineHeight: 1.5 }}>{description}</p>}
              </div>
              {!hideClose && (
                <button onClick={onClose} aria-label="Close" style={{
                  appearance: "none", border: 0, background: "transparent",
                  cursor: "pointer", color: "var(--fg-muted)", padding: 4,
                  borderRadius: 5, lineHeight: 0,
                }}><Icon name="x" size={18} /></button>
              )}
            </div>
          )}
          {children != null && (
            <div style={{
              padding: title ? "8px 20px 20px" : "20px",
              overflow: "auto", color: "var(--fg-default)", fontSize: 14, lineHeight: 1.55,
            }}>{children}</div>
          )}
          {footer && (
            <div style={{
              display: "flex", justifyContent: "flex-end", gap: 8,
              padding: "12px 20px", borderTop: "1px solid var(--border-subtle)",
              background: "var(--bg-subtle)",
            }}>{footer}</div>
          )}
        </div>
        <style>{`
          @keyframes wlFade  { from{opacity:0} to{opacity:1} }
          @keyframes wlScale { from{opacity:0; transform: translateY(8px) scale(.98)} to{opacity:1; transform:none} }
          @keyframes wlSlideR { from{transform:translateX(100%)} to{transform:translateX(0)} }
          @keyframes wlSlideL { from{transform:translateX(-100%)} to{transform:translateX(0)} }
          @keyframes wlSlideT { from{transform:translateY(-100%)} to{transform:translateY(0)} }
          @keyframes wlSlideB { from{transform:translateY(100%)} to{transform:translateY(0)} }
        `}</style>
      </div>
    </Portal>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   SHEET — slides from any edge
   <Sheet open={open} onClose={…} side="right" title="…">{children}</Sheet>
   ───────────────────────────────────────────────────────────────────────── */
function Sheet({
  open, onClose, side = "right", title, description,
  children, footer, size = "md", closeOnBackdrop = true, hideClose = false,
}) {
  useEscape(open, onClose);
  if (!open) return null;
  const w = { sm: 320, md: 420, lg: 560, xl: 720 }[size] || 420;
  const isVertical = side === "left" || side === "right";
  const base = {
    position: "absolute", background: "var(--bg-raised)",
    display: "flex", flexDirection: "column",
    boxShadow: "var(--shadow-xl)", overflow: "hidden",
  };
  const placement = {
    right:  { ...base, top: 0, right: 0, bottom: 0, width: w, borderLeft: "1px solid var(--border-subtle)", animation: "wlSlideR 250ms var(--ease-out)" },
    left:   { ...base, top: 0, left: 0,  bottom: 0, width: w, borderRight: "1px solid var(--border-subtle)", animation: "wlSlideL 250ms var(--ease-out)" },
    top:    { ...base, top: 0, left: 0,  right: 0,  height: w, borderBottom: "1px solid var(--border-subtle)", animation: "wlSlideT 250ms var(--ease-out)" },
    bottom: { ...base, bottom: 0, left: 0, right: 0, height: w, borderTop: "1px solid var(--border-subtle)", animation: "wlSlideB 250ms var(--ease-out)" },
  }[side];
  return (
    <Portal>
      <div role="dialog" aria-modal="true"
        style={{ position: "fixed", inset: 0, zIndex: "var(--z-modal)" }}>
        <div onClick={closeOnBackdrop ? onClose : undefined}
          style={{ position: "absolute", inset: 0, background: "var(--bg-overlay)", animation: "wlFade 160ms var(--ease-out)" }} />
        <div style={placement}>
          <div style={{ padding: "18px 20px 14px", display: "flex", alignItems: "flex-start", gap: 12, borderBottom: "1px solid var(--border-subtle)" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {title && <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--fg-strong)" }}>{title}</h2>}
              {description && <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--fg-muted)" }}>{description}</p>}
            </div>
            {!hideClose && (
              <button onClick={onClose} aria-label="Close" style={{ appearance: "none", border: 0, background: "transparent", cursor: "pointer", color: "var(--fg-muted)", padding: 4 }}>
                <Icon name="x" size={18} />
              </button>
            )}
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: 20, fontSize: 14, color: "var(--fg-default)" }}>
            {children}
          </div>
          {footer && (
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "12px 20px", borderTop: "1px solid var(--border-subtle)", background: "var(--bg-subtle)" }}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   POPOVER — anchored floating panel.
   <Popover trigger={<Button>...</Button>} side="bottom" align="start">…content…</Popover>
   ───────────────────────────────────────────────────────────────────────── */
function Popover({ trigger, children, side = "bottom", align = "start", offset = 6, width }) {
  const [open, setOpen] = useS(false);
  const [pos, setPos] = useS({ top: 0, left: 0 });
  const anchorRef = useR(null);
  const popRef = useR(null);

  useL(() => {
    if (!open || !anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    const pw = popRef.current?.offsetWidth || 200;
    const ph = popRef.current?.offsetHeight || 80;
    let top, left;
    if (side === "bottom") top = r.bottom + offset;
    else if (side === "top") top = r.top - ph - offset;
    else if (side === "right") { top = r.top; left = r.right + offset; }
    else if (side === "left")  { top = r.top; left = r.left - pw - offset; }
    if (side === "bottom" || side === "top") {
      if (align === "start")  left = r.left;
      if (align === "center") left = r.left + r.width / 2 - pw / 2;
      if (align === "end")    left = r.right - pw;
    }
    setPos({ top, left });
  }, [open, side, align, offset]);

  useE(() => {
    if (!open) return;
    const click = (e) => {
      if (anchorRef.current?.contains(e.target)) return;
      if (popRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const esc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", click);
    window.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", click); window.removeEventListener("keydown", esc); };
  }, [open]);

  return (
    <>
      <span ref={anchorRef} onClick={() => setOpen(o => !o)} style={{ display: "inline-flex" }}>
        {trigger}
      </span>
      {open && (
        <Portal>
          <div ref={popRef} role="dialog"
            style={{
              position: "fixed", top: pos.top, left: pos.left,
              zIndex: "var(--z-popover)", width,
              background: "var(--bg-raised)", border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)",
              padding: 8, animation: "wlScale 140ms var(--ease-out)",
            }}>
            {typeof children === "function" ? children({ close: () => setOpen(false) }) : children}
          </div>
        </Portal>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   DROPDOWN MENU
   <DropdownMenu trigger={…} items={[{label, icon, shortcut, onSelect, danger}, { separator:true }, { label:"Label" } ]} />
   ───────────────────────────────────────────────────────────────────────── */
function DropdownMenu({ trigger, items, side = "bottom", align = "start", width = 220 }) {
  return (
    <Popover trigger={trigger} side={side} align={align} width={width}>
      {({ close }) => (
        <div role="menu" style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {items.map((it, i) => {
            if (it.separator) return (
              <div key={i} style={{ height: 1, background: "var(--border-subtle)", margin: "4px -4px" }} />
            );
            if (it.label && !it.onSelect) return (
              <div key={i} style={{
                padding: "6px 10px 4px", fontSize: 11, fontWeight: 600,
                color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.06em",
              }}>{it.label}</div>
            );
            return (
              <button key={i} role="menuitem"
                onClick={() => { it.onSelect && it.onSelect(); close(); }}
                disabled={it.disabled}
                style={{
                  appearance: "none", border: 0, background: "transparent", cursor: it.disabled ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "7px 10px", borderRadius: "var(--radius-sm)",
                  fontSize: 13.5, fontFamily: "inherit",
                  color: it.danger ? "var(--fg-danger)" : "var(--fg-default)",
                  opacity: it.disabled ? 0.5 : 1, textAlign: "left",
                }}
                onMouseEnter={e => !it.disabled && (e.currentTarget.style.background = it.danger ? "var(--bg-danger-subtle)" : "var(--bg-muted)")}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                {it.icon && <Icon name={it.icon} size={14} />}
                <span style={{ flex: 1 }}>{it.text || it.label}</span>
                {it.shortcut && <Kbd>{it.shortcut}</Kbd>}
                {it.trailing && <Icon name={it.trailing} size={14} />}
              </button>
            );
          })}
        </div>
      )}
    </Popover>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   TOAST — imperative API via window.toast({ title, description, variant, action })
   Mount <Toaster /> once near the root.
   ───────────────────────────────────────────────────────────────────────── */
const _toastBus = { listeners: new Set(), id: 0 };
function emitToast(toast) {
  const item = { id: ++_toastBus.id, ts: Date.now(), ...toast };
  _toastBus.listeners.forEach(fn => fn(item));
  return item.id;
}
function dismissToast(id) {
  _toastBus.listeners.forEach(fn => fn({ id, _dismiss: true }));
}

function Toaster({ position = "bottom-right", max = 4 }) {
  const [items, setItems] = useS([]);
  useE(() => {
    const fn = (item) => {
      if (item._dismiss) return setItems(arr => arr.filter(x => x.id !== item.id));
      setItems(arr => [...arr, item].slice(-max));
      const dur = item.duration ?? 4500;
      if (dur > 0) setTimeout(() => setItems(arr => arr.filter(x => x.id !== item.id)), dur);
    };
    _toastBus.listeners.add(fn);
    return () => { _toastBus.listeners.delete(fn); };
  }, [max]);
  const [vside, hside] = position.split("-");
  const wrap = {
    position: "fixed", zIndex: "var(--z-toast)",
    display: "flex", flexDirection: vside === "top" ? "column-reverse" : "column", gap: 8,
    pointerEvents: "none", padding: 24,
    [vside]: 0,
    [hside]: 0,
    ...(hside === "center" ? { left: "50%", transform: "translateX(-50%)", right: "auto" } : {}),
  };
  if (!items.length && typeof window === "undefined") return null;
  return (
    <Portal>
      <div style={wrap}>
        {items.map(it => <ToastItem key={it.id} item={it} onClose={() => setItems(arr => arr.filter(x => x.id !== it.id))} />)}
      </div>
    </Portal>
  );
}

function ToastItem({ item, onClose }) {
  const v = {
    default: { bg: "var(--bg-raised)",          fg: "var(--fg-default)",  bd: "var(--border-subtle)",  ic: null,                icColor: "var(--fg-muted)" },
    info:    { bg: "var(--bg-info-subtle)",     fg: "var(--fg-default)",  bd: "var(--border-info)",    ic: "info",              icColor: "var(--fg-info)" },
    success: { bg: "var(--bg-success-subtle)",  fg: "var(--fg-default)",  bd: "var(--border-success)", ic: "check-circle",      icColor: "var(--fg-success)" },
    warning: { bg: "var(--bg-warning-subtle)",  fg: "var(--fg-default)",  bd: "var(--border-warning)", ic: "alert-triangle",    icColor: "var(--fg-warning)" },
    danger:  { bg: "var(--bg-danger-subtle)",   fg: "var(--fg-default)",  bd: "var(--border-danger)",  ic: "alert-octagon",     icColor: "var(--fg-danger)" },
  }[item.variant || "default"];
  return (
    <div role="status" style={{
      pointerEvents: "auto",
      background: v.bg, color: v.fg,
      border: `1px solid ${v.bd}`, borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-lg)",
      padding: "12px 14px", minWidth: 280, maxWidth: 400,
      display: "flex", alignItems: "flex-start", gap: 10,
      animation: "wlScale 200ms var(--ease-out)",
    }}>
      {v.ic && <Icon name={v.ic} size={18} color={v.icColor} style={{ marginTop: 1, flexShrink: 0 }} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        {item.title && <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>{item.title}</div>}
        {item.description && <div style={{ fontSize: 13, color: "var(--fg-muted)", marginTop: item.title ? 2 : 0, lineHeight: 1.45 }}>{item.description}</div>}
        {item.action && (
          <div style={{ marginTop: 8 }}>
            <button onClick={() => { item.action.onClick && item.action.onClick(); onClose(); }}
              style={{
                appearance: "none", border: "1px solid var(--border-default)",
                background: "var(--bg-surface)", color: "var(--fg-default)",
                padding: "4px 10px", borderRadius: "var(--radius-sm)",
                fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
              }}>{item.action.label}</button>
          </div>
        )}
      </div>
      <button onClick={onClose} aria-label="Dismiss" style={{ appearance: "none", border: 0, background: "transparent", cursor: "pointer", color: "var(--fg-muted)", padding: 2, marginTop: -2 }}>
        <Icon name="x" size={14} />
      </button>
    </div>
  );
}

if (typeof window !== "undefined") {
  window.toast = (opts) => emitToast(typeof opts === "string" ? { title: opts } : opts);
  window.toast.success = (title, rest) => emitToast({ title, variant: "success", ...rest });
  window.toast.error   = (title, rest) => emitToast({ title, variant: "danger",  ...rest });
  window.toast.warning = (title, rest) => emitToast({ title, variant: "warning", ...rest });
  window.toast.info    = (title, rest) => emitToast({ title, variant: "info",    ...rest });
  window.toast.dismiss = dismissToast;
}

Object.assign(window, { Dialog, Sheet, Popover, DropdownMenu, Toaster, Portal });
