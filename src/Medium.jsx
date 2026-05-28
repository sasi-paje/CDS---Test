// White-label medium primitives — HoverCard, ContextMenu, InputOTP, Resizable, Drawer, Menubar.

const { useState: useM, useEffect: useME3, useRef: useMR, useLayoutEffect: useML } = React;

/* ─── HOVER CARD ──────────────────────────────────────────────────────── */
// Rich popover triggered by hover/focus (think mention preview, user card).
function HoverCard({ trigger, children, side = "bottom", align = "start", offset = 8, openDelay = 200, closeDelay = 100, width = 280 }) {
  const [open, setOpen] = useM(false);
  const [pos, setPos] = useM({ top: 0, left: 0 });
  const anchorRef = useMR(null);
  const popRef = useMR(null);
  const openT = useMR(null);
  const closeT = useMR(null);

  const startOpen = () => {
    clearTimeout(closeT.current);
    openT.current = setTimeout(() => setOpen(true), openDelay);
  };
  const startClose = () => {
    clearTimeout(openT.current);
    closeT.current = setTimeout(() => setOpen(false), closeDelay);
  };

  useML(() => {
    if (!open || !anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    const pw = popRef.current?.offsetWidth || width;
    const ph = popRef.current?.offsetHeight || 80;
    let top, left;
    if (side === "bottom") top = r.bottom + offset;
    else if (side === "top") top = r.top - ph - offset;
    if (align === "start") left = r.left;
    if (align === "center") left = r.left + r.width / 2 - pw / 2;
    if (align === "end") left = r.right - pw;
    setPos({ top, left });
  }, [open]);

  return (
    <>
      <span ref={anchorRef}
        onMouseEnter={startOpen} onMouseLeave={startClose}
        onFocus={startOpen} onBlur={startClose}
        style={{ display: "inline-flex" }}>
        {trigger}
      </span>
      {open && (
        <Portal>
          <div ref={popRef}
            onMouseEnter={() => clearTimeout(closeT.current)}
            onMouseLeave={startClose}
            style={{
              position: "fixed", top: pos.top, left: pos.left, width,
              zIndex: "var(--z-popover)",
              background: "var(--bg-raised)", border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)",
              padding: 14, animation: "wlScale 140ms var(--ease-out)",
            }}>{children}</div>
        </Portal>
      )}
    </>
  );
}

/* ─── CONTEXT MENU — right-click activated dropdown ────────────────────── */
function ContextMenu({ items, children, style }) {
  const [pos, setPos] = useM(null);
  const popRef = useMR(null);

  useME3(() => {
    if (!pos) return;
    const click = (e) => { if (!popRef.current?.contains(e.target)) setPos(null); };
    const esc = (e) => { if (e.key === "Escape") setPos(null); };
    document.addEventListener("mousedown", click);
    window.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", click); window.removeEventListener("keydown", esc); };
  }, [pos]);

  const onCtx = (e) => {
    e.preventDefault();
    // Clamp position so the menu stays on-screen
    const W = 220, H = items.length * 32 + 12;
    let x = e.clientX, y = e.clientY;
    if (x + W > window.innerWidth)  x = window.innerWidth - W - 8;
    if (y + H > window.innerHeight) y = window.innerHeight - H - 8;
    setPos({ x, y });
  };

  return (
    <>
      <div onContextMenu={onCtx} style={style}>{children}</div>
      {pos && (
        <Portal>
          <div ref={popRef} role="menu"
            style={{
              position: "fixed", top: pos.y, left: pos.x, width: 220,
              zIndex: "var(--z-popover)",
              background: "var(--bg-raised)", border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)",
              padding: 4, animation: "wlScale 120ms var(--ease-out)",
              display: "flex", flexDirection: "column", gap: 1,
            }}>
            {items.map((it, i) => {
              if (it.separator) return <div key={i} style={{ height: 1, background: "var(--border-subtle)", margin: "4px 0" }} />;
              if (it.label && !it.onSelect) return (
                <div key={i} style={{ padding: "6px 10px 4px", fontSize: 10.5, fontWeight: 700, color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{it.label}</div>
              );
              return (
                <button key={i} onClick={() => { it.onSelect && it.onSelect(); setPos(null); }}
                  disabled={it.disabled}
                  style={{
                    appearance: "none", border: 0, background: "transparent", cursor: it.disabled ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", gap: 8, padding: "7px 10px",
                    borderRadius: "var(--radius-sm)", fontFamily: "inherit", fontSize: 13.5, textAlign: "left",
                    color: it.danger ? "var(--fg-danger)" : "var(--fg-default)", opacity: it.disabled ? 0.5 : 1,
                  }}
                  onMouseEnter={e => !it.disabled && (e.currentTarget.style.background = it.danger ? "var(--bg-danger-subtle)" : "var(--bg-muted)")}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  {it.icon && <Icon name={it.icon} size={14} />}
                  <span style={{ flex: 1 }}>{it.text || it.label}</span>
                  {it.shortcut && <Kbd>{it.shortcut}</Kbd>}
                </button>
              );
            })}
          </div>
        </Portal>
      )}
    </>
  );
}

/* ─── INPUT OTP — N-digit one-time-password input ──────────────────────── */
function InputOTP({ length = 6, value, defaultValue, onChange, disabled, error, autoFocus, mask }) {
  const [internal, setInternal] = useM(defaultValue || "");
  const controlled = value !== undefined;
  const cur = (controlled ? value : internal) || "";
  const refs = useMR([]);

  const set = (v) => {
    const clean = v.replace(/\D/g, "").slice(0, length);
    if (!controlled) setInternal(clean);
    onChange && onChange(clean);
  };

  const onChangeAt = (i, ch) => {
    const digit = (ch.match(/\d/) || [""])[0] || "";
    const arr = cur.split("");
    while (arr.length < length) arr.push("");
    arr[i] = digit;
    const next = arr.join("").slice(0, length);
    set(next);
    if (digit && i < length - 1) refs.current[i + 1]?.focus();
  };

  const onKeyDownAt = (i, e) => {
    if (e.key === "Backspace") {
      if (!cur[i] && i > 0) {
        e.preventDefault();
        const arr = cur.split(""); arr[i - 1] = "";
        set(arr.join(""));
        refs.current[i - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    else if (e.key === "ArrowRight" && i < length - 1) refs.current[i + 1]?.focus();
  };

  const onPaste = (e) => {
    e.preventDefault();
    const txt = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "").slice(0, length);
    set(txt);
    refs.current[Math.min(txt.length, length - 1)]?.focus();
  };

  useME3(() => { if (autoFocus) refs.current[0]?.focus(); }, []);

  return (
    <div onPaste={onPaste} style={{ display: "inline-flex", gap: 6 }}>
      {Array.from({ length }).map((_, i) => (
        <input key={i} ref={el => refs.current[i] = el}
          inputMode="numeric" pattern="[0-9]*" type={mask ? "password" : "text"}
          maxLength={1} disabled={disabled}
          value={cur[i] || ""}
          onChange={(e) => onChangeAt(i, e.target.value)}
          onKeyDown={(e) => onKeyDownAt(i, e)}
          style={{
            width: 40, height: 48, textAlign: "center",
            fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 600,
            background: disabled ? "var(--bg-muted)" : "var(--bg-surface)",
            color: "var(--fg-default)", caretColor: "var(--bg-brand)",
            border: `1px solid ${error ? "var(--border-danger)" : (cur[i] ? "var(--border-strong)" : "var(--border-default)")}`,
            borderRadius: "var(--radius-md)", outline: 0,
            transition: "border-color var(--dur-fast), box-shadow var(--dur-fast)",
          }}
          onFocus={(e) => e.target.style.boxShadow = error ? "var(--ring-danger)" : "var(--ring-focus)"}
          onBlur={(e) => e.target.style.boxShadow = "none"} />
      ))}
    </div>
  );
}

/* ─── RESIZABLE — two- or three-pane split with draggable handle ───────── */
function Resizable({ direction = "horizontal", initialSizes, minSize = 80, children, style }) {
  const childArr = React.Children.toArray(children).filter(Boolean);
  const [sizes, setSizes] = useM(initialSizes || childArr.map(() => 100 / childArr.length));
  const wrapRef = useMR(null);
  const dragRef = useMR(null);

  const onPointerDown = (idx) => (e) => {
    dragRef.current = idx;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (dragRef.current == null || !wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const isH = direction === "horizontal";
    const total = isH ? r.width : r.height;
    const px = isH ? (e.clientX - r.left) : (e.clientY - r.top);
    const i = dragRef.current;
    // pixel boundary of handle in question = sum of sizes[0..i] as pct of total
    let acc = 0;
    for (let k = 0; k < i; k++) acc += sizes[k];
    const target = (px / total) * 100;
    const min = (minSize / total) * 100;
    const delta = target - acc;
    if (Math.abs(delta) < 0.1) return;
    const next = [...sizes];
    next[i] = Math.max(min, next[i] + delta);
    next[i+1] = Math.max(min, next[i+1] - delta);
    setSizes(next);
  };
  const onPointerUp = (e) => {
    dragRef.current = null;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) {}
  };

  const isH = direction === "horizontal";

  return (
    <div ref={wrapRef} style={{
      display: "flex", flexDirection: isH ? "row" : "column",
      width: "100%", height: "100%", ...style,
    }}>
      {childArr.map((c, i) => (
        <React.Fragment key={i}>
          <div style={{
            [isH ? "width" : "height"]: `${sizes[i]}%`,
            overflow: "auto",
          }}>{c}</div>
          {i < childArr.length - 1 && (
            <div onPointerDown={onPointerDown(i)} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
              style={{
                [isH ? "width" : "height"]: 8, [isH ? "minWidth" : "minHeight"]: 8,
                background: "var(--bg-subtle)",
                cursor: isH ? "ew-resize" : "ns-resize",
                display: "flex", alignItems: "center", justifyContent: "center",
                touchAction: "none", borderLeft: isH ? "1px solid var(--border-subtle)" : "0",
                borderRight: isH ? "1px solid var(--border-subtle)" : "0",
                borderTop: !isH ? "1px solid var(--border-subtle)" : "0",
                borderBottom: !isH ? "1px solid var(--border-subtle)" : "0",
              }}>
              <span style={{
                [isH ? "width" : "height"]: 2,
                [isH ? "height" : "width"]: 24,
                background: "var(--border-strong)", borderRadius: 9999,
              }} />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ─── DRAWER — mobile bottom-sheet with a grab handle ──────────────────── */
// Distinct from Sheet (which is full edge slide-in). Drawer is shorter, rounded top, with drag handle.
function Drawer({ open, onClose, title, description, children, footer, maxHeight = "80vh" }) {
  useEscape && useEscape(open, onClose); // shared util from Overlays.jsx
  if (!open) return null;
  return (
    <Portal>
      <div style={{ position: "fixed", inset: 0, zIndex: "var(--z-modal)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
        <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "var(--bg-overlay)", animation: "wlFade 160ms var(--ease-out)" }} />
        <div style={{
          position: "relative", width: "100%", maxWidth: 540, maxHeight,
          background: "var(--bg-raised)",
          borderTopLeftRadius: "var(--radius-2xl)", borderTopRightRadius: "var(--radius-2xl)",
          boxShadow: "var(--shadow-xl)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          animation: "wlSlideB 280ms var(--ease-out)",
        }}>
          <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 0" }}>
            <span style={{ width: 36, height: 4, borderRadius: 9999, background: "var(--border-strong)" }} />
          </div>
          {(title || description) && (
            <div style={{ padding: "12px 20px 8px" }}>
              {title && <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--fg-strong)" }}>{title}</h2>}
              {description && <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--fg-muted)" }}>{description}</p>}
            </div>
          )}
          <div style={{ flex: 1, overflow: "auto", padding: "8px 20px 20px" }}>{children}</div>
          {footer && (
            <div style={{ display: "flex", gap: 8, padding: "12px 20px", borderTop: "1px solid var(--border-subtle)", background: "var(--bg-subtle)" }}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}

/* ─── MENUBAR — desktop-style horizontal menu bar ──────────────────────── */
// items: [{ label: "File", items: [{text, shortcut, onSelect}|{separator}|{label}] }, …]
function Menubar({ items, style }) {
  const [open, setOpen] = useM(null);  // index of open menu
  const [pos, setPos] = useM({ top: 0, left: 0 });
  const refs = useMR([]);
  const popRef = useMR(null);

  useML(() => {
    if (open == null) return;
    const r = refs.current[open]?.getBoundingClientRect();
    if (r) setPos({ top: r.bottom + 4, left: r.left });
  }, [open]);

  useME3(() => {
    if (open == null) return;
    const click = (e) => {
      if (popRef.current?.contains(e.target)) return;
      if (refs.current.some(r => r?.contains(e.target))) return;
      setOpen(null);
    };
    const esc = (e) => { if (e.key === "Escape") setOpen(null); };
    document.addEventListener("mousedown", click);
    window.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", click); window.removeEventListener("keydown", esc); };
  }, [open]);

  return (
    <>
      <div role="menubar" style={{
        display: "inline-flex", gap: 1, padding: 3,
        background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-xs)", ...style,
      }}>
        {items.map((m, i) => {
          const isOpen = open === i;
          return (
            <button key={i} ref={el => refs.current[i] = el}
              onClick={() => setOpen(o => o === i ? null : i)}
              onMouseEnter={() => { if (open != null) setOpen(i); }}
              style={{
                appearance: "none", border: 0, padding: "5px 10px",
                background: isOpen ? "var(--bg-muted)" : "transparent",
                color: "var(--fg-default)", cursor: "pointer",
                borderRadius: "var(--radius-sm)", fontFamily: "inherit",
                fontSize: 13, fontWeight: 500,
              }}>
              {m.label}
            </button>
          );
        })}
      </div>
      {open != null && (
        <Portal>
          <div ref={popRef} role="menu"
            style={{
              position: "fixed", top: pos.top, left: pos.left, minWidth: 220,
              zIndex: "var(--z-popover)",
              background: "var(--bg-raised)", border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)",
              padding: 4, display: "flex", flexDirection: "column", gap: 1,
              animation: "wlScale 120ms var(--ease-out)",
            }}>
            {items[open].items.map((it, i) => {
              if (it.separator) return <div key={i} style={{ height: 1, background: "var(--border-subtle)", margin: "4px 0" }} />;
              if (it.label && !it.onSelect) return (
                <div key={i} style={{ padding: "6px 10px 4px", fontSize: 10.5, fontWeight: 700, color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{it.label}</div>
              );
              return (
                <button key={i} onClick={() => { it.onSelect && it.onSelect(); setOpen(null); }}
                  style={{
                    appearance: "none", border: 0, background: "transparent", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 8, padding: "7px 10px",
                    borderRadius: "var(--radius-sm)", fontFamily: "inherit", fontSize: 13.5, textAlign: "left",
                    color: it.danger ? "var(--fg-danger)" : "var(--fg-default)",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = it.danger ? "var(--bg-danger-subtle)" : "var(--bg-muted)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  {it.icon && <Icon name={it.icon} size={14} />}
                  <span style={{ flex: 1 }}>{it.text || it.label}</span>
                  {it.shortcut && <Kbd>{it.shortcut}</Kbd>}
                </button>
              );
            })}
          </div>
        </Portal>
      )}
    </>
  );
}

Object.assign(window, { HoverCard, ContextMenu, InputOTP, Resizable, Drawer, Menubar });
