// White-label: Slider, ToggleGroup, Combobox, Accordion.

const { useState: useSE, useEffect: useEE, useRef: useRE, useMemo: useME } = React;

/* ─────────────────────────────────────────────────────────────────────────
   SLIDER — single value or [min, max] range
   <Slider value={v} onChange={setV} min={0} max={100} />
   <Slider value={[20, 80]} onChange={setV} min={0} max={100} />
   ───────────────────────────────────────────────────────────────────────── */
function Slider({
  value, defaultValue, onChange,
  min = 0, max = 100, step = 1,
  disabled, label, showValue, formatValue,
  size = "md",
}) {
  const isRange = Array.isArray(value ?? defaultValue);
  const [v, setV] = useSE(value ?? defaultValue ?? (isRange ? [min, max] : min));
  const controlled = value !== undefined;
  const cur = controlled ? value : v;
  const trackRef = useRE(null);
  const draggingRef = useRE(null);
  const sizes = { sm: { track: 4, knob: 14 }, md: { track: 6, knob: 18 }, lg: { track: 8, knob: 22 } };
  const sz = sizes[size];
  const fmt = formatValue || ((n) => n);

  const pctOf = (n) => ((n - min) / (max - min)) * 100;
  const setVal = (next) => {
    if (!controlled) setV(next);
    onChange && onChange(next);
  };

  const onPointerDown = (e, idx) => {
    if (disabled) return;
    draggingRef.current = idx;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (draggingRef.current === null || !trackRef.current) return;
    const r = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    let n = min + pct * (max - min);
    n = Math.round(n / step) * step;
    n = Math.max(min, Math.min(max, n));
    if (isRange) {
      const idx = draggingRef.current;
      const next = [...cur]; next[idx] = n;
      // keep min <= max
      if (idx === 0 && next[0] > next[1]) next[0] = next[1];
      if (idx === 1 && next[1] < next[0]) next[1] = next[0];
      setVal(next);
    } else setVal(n);
  };
  const onPointerUp = (e) => {
    draggingRef.current = null;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) {}
  };

  const trackClick = (e) => {
    if (disabled) return;
    const r = trackRef.current.getBoundingClientRect();
    const pct = (e.clientX - r.left) / r.width;
    let n = Math.round((min + pct * (max - min)) / step) * step;
    n = Math.max(min, Math.min(max, n));
    if (isRange) {
      const next = [...cur];
      const dStart = Math.abs(n - next[0]);
      const dEnd   = Math.abs(n - next[1]);
      if (dStart < dEnd) next[0] = n; else next[1] = n;
      setVal(next);
    } else setVal(n);
  };

  const knobs = isRange ? [{ idx: 0, v: cur[0] }, { idx: 1, v: cur[1] }] : [{ idx: 0, v: cur }];
  const fillStart = isRange ? pctOf(cur[0]) : 0;
  const fillEnd   = isRange ? pctOf(cur[1]) : pctOf(cur);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", opacity: disabled ? 0.5 : 1 }}>
      {(label || showValue) && (
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          {label && <span style={{ fontWeight: 500 }}>{label}</span>}
          {showValue && (
            <span style={{ color: "var(--fg-muted)", fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-mono)", fontSize: 12 }}>
              {isRange ? `${fmt(cur[0])} – ${fmt(cur[1])}` : fmt(cur)}
            </span>
          )}
        </div>
      )}
      <div ref={trackRef} onClick={trackClick}
        style={{
          position: "relative", height: sz.knob, cursor: disabled ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center",
        }}>
        <div style={{ position: "absolute", left: 0, right: 0, height: sz.track, borderRadius: 9999, background: "var(--bg-muted)" }} />
        <div style={{
          position: "absolute", left: `${fillStart}%`, right: `${100 - fillEnd}%`,
          height: sz.track, borderRadius: 9999, background: "var(--bg-brand)",
        }} />
        {knobs.map(k => (
          <button key={k.idx} type="button"
            onPointerDown={(e) => onPointerDown(e, k.idx)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            disabled={disabled}
            role="slider" aria-valuenow={k.v} aria-valuemin={min} aria-valuemax={max}
            style={{
              position: "absolute", left: `calc(${pctOf(k.v)}% - ${sz.knob/2}px)`,
              width: sz.knob, height: sz.knob, borderRadius: "50%",
              background: "var(--bg-canvas)",
              border: "2px solid var(--bg-brand)",
              cursor: disabled ? "not-allowed" : "grab",
              padding: 0, boxShadow: "var(--shadow-sm)",
              touchAction: "none",
            }} />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   TOGGLE GROUP — single or multiple selection
   <ToggleGroup type="single" value={v} onChange={setV} items={[{value, label, icon}]} />
   <ToggleGroup type="multiple" value={arr} onChange={setArr} items={…} />
   ───────────────────────────────────────────────────────────────────────── */
function ToggleGroup({ type = "single", value, onChange, items, size = "md", variant = "outline" }) {
  const isOn = (v) => type === "multiple" ? value?.includes(v) : value === v;
  const toggle = (v) => {
    if (type === "multiple") {
      const set = new Set(value || []);
      set.has(v) ? set.delete(v) : set.add(v);
      onChange && onChange([...set]);
    } else {
      onChange && onChange(value === v ? null : v);
    }
  };
  const sizes = { sm: { h: 28, fs: 12, ix: 13, px: 8 }, md: { h: 34, fs: 13, ix: 15, px: 12 }, lg: { h: 40, fs: 14, ix: 17, px: 16 } };
  const sz = sizes[size];
  return (
    <div role="group" style={{
      display: "inline-flex",
      background: variant === "outline" ? "var(--bg-surface)" : "var(--bg-muted)",
      borderRadius: "var(--radius-md)",
      padding: variant === "outline" ? 0 : 3,
      border: variant === "outline" ? "1px solid var(--border-default)" : "0",
    }}>
      {items.map((it, i) => {
        const on = isOn(it.value);
        const first = i === 0, last = i === items.length - 1;
        const btn = (
          <button key={it.value} onClick={() => toggle(it.value)}
            aria-pressed={on} aria-label={it.ariaLabel || it.tooltip}
            title={!it.tooltip && !it.label ? (it.ariaLabel || undefined) : undefined}
            style={{
              appearance: "none", border: 0, cursor: "pointer", fontFamily: "inherit",
              height: sz.h, padding: `0 ${sz.px}px`, fontSize: sz.fs, fontWeight: 500,
              display: "inline-flex", alignItems: "center", gap: 5,
              background: variant === "outline"
                ? (on ? "var(--bg-brand-subtle)" : "transparent")
                : (on ? "var(--bg-surface)" : "transparent"),
              color: on ? "var(--fg-brand)" : "var(--fg-muted)",
              borderRadius: variant === "outline"
                ? `${first ? "var(--radius-md)" : 0} ${last ? "var(--radius-md)" : 0} ${last ? "var(--radius-md)" : 0} ${first ? "var(--radius-md)" : 0}`
                : "var(--radius-sm)",
              borderRight: variant === "outline" && !last ? "1px solid var(--border-default)" : "0",
              boxShadow: variant === "pill" && on ? "var(--shadow-xs)" : "none",
              transition: "background var(--dur-fast), color var(--dur-fast)",
            }}>
            {it.icon && <Icon name={it.icon} size={sz.ix} />}
            {it.label}
          </button>
        );
        return it.tooltip
          ? <Tooltip key={it.value} content={it.tooltip}>{btn}</Tooltip>
          : btn;
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   COMBOBOX — searchable select with custom dropdown
   <Combobox value={v} onChange={setV} options={[{value, label, sub?, icon?}]} placeholder="…" />
   ───────────────────────────────────────────────────────────────────────── */
function Combobox({
  value, onChange, options, placeholder = "Select…",
  label, hint, error, disabled, size = "md", emptyText = "No results",
  searchPlaceholder = "Search…", clearable = true, width = "100%",
}) {
  const [open, setOpen] = useSE(false);
  const [q, setQ] = useSE("");
  const [pos, setPos] = useSE({ top: 0, left: 0, width: 200 });
  const anchorRef = useRE(null);
  const popRef = useRE(null);
  const inputRef = useRE(null);

  const current = options.find(o => o.value === value);
  const filtered = useME(() => {
    if (!q) return options;
    const Q = q.toLowerCase();
    return options.filter(o => (o.label + " " + (o.sub || "")).toLowerCase().includes(Q));
  }, [q, options]);

  useEE(() => {
    if (!open || !anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 4, left: r.left, width: r.width });
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  useEE(() => {
    if (!open) return;
    const click = (e) => {
      if (anchorRef.current?.contains(e.target) || popRef.current?.contains(e.target)) return;
      setOpen(false); setQ("");
    };
    const esc = (e) => { if (e.key === "Escape") { setOpen(false); setQ(""); } };
    document.addEventListener("mousedown", click);
    window.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", click); window.removeEventListener("keydown", esc); };
  }, [open]);

  const sizes = { sm: 32, md: 38, lg: 46 }[size];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width }}>
      {label && <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>}
      <button ref={anchorRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        style={{
          appearance: "none", height: sizes, padding: "0 12px",
          background: disabled ? "var(--bg-muted)" : "var(--bg-surface)",
          color: current ? "var(--fg-default)" : "var(--fg-subtle)",
          border: `1px solid ${error ? "var(--border-danger)" : open ? "var(--border-focus)" : "var(--border-default)"}`,
          borderRadius: "var(--radius-md)",
          boxShadow: open ? (error ? "var(--ring-danger)" : "var(--ring-focus)") : "none",
          display: "flex", alignItems: "center", gap: 8, cursor: disabled ? "not-allowed" : "pointer",
          fontFamily: "inherit", fontSize: 14, textAlign: "left",
        }}>
        {current?.icon && <Icon name={current.icon} size={15} color="var(--fg-muted)" />}
        <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {current ? current.label : placeholder}
        </span>
        {clearable && current && (
          <span onClick={(e) => { e.stopPropagation(); onChange && onChange(null); }}
            style={{ color: "var(--fg-muted)", cursor: "pointer", display: "inline-flex" }}>
            <Icon name="x" size={14} />
          </span>
        )}
        <Icon name="chevron-down" size={16} color="var(--fg-muted)" />
      </button>
      {hint && <span style={{ fontSize: 12, color: error ? "var(--fg-danger)" : "var(--fg-muted)" }}>{hint}</span>}

      {open && (
        <Portal>
          <div ref={popRef}
            style={{
              position: "fixed", top: pos.top, left: pos.left, width: pos.width,
              maxHeight: 320, zIndex: "var(--z-popover)",
              background: "var(--bg-raised)", border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)",
              display: "flex", flexDirection: "column", overflow: "hidden",
            }}>
            <div style={{ padding: 8, borderBottom: "1px solid var(--border-subtle)" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "var(--bg-subtle)", padding: "6px 10px",
                borderRadius: "var(--radius-sm)",
              }}>
                <Icon name="search" size={14} color="var(--fg-muted)" />
                <input ref={inputRef}
                  value={q} onChange={e => setQ(e.target.value)}
                  placeholder={searchPlaceholder}
                  style={{
                    flex: 1, background: "transparent", border: 0, outline: 0,
                    fontFamily: "inherit", fontSize: 13, color: "var(--fg-default)",
                  }} />
                {q && <button onClick={() => setQ("")} style={{ border: 0, background: "transparent", color: "var(--fg-muted)", cursor: "pointer", padding: 0, display: "inline-flex" }}>
                  <Icon name="x" size={12} />
                </button>}
              </div>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: 4 }}>
              {filtered.length === 0 && (
                <div style={{ padding: "14px 12px", fontSize: 13, color: "var(--fg-muted)", textAlign: "center" }}>{emptyText}</div>
              )}
              {filtered.map(o => {
                const sel = o.value === value;
                return (
                  <button key={o.value}
                    onClick={() => { onChange && onChange(o.value); setOpen(false); setQ(""); }}
                    style={{
                      appearance: "none", border: 0, width: "100%",
                      background: sel ? "var(--bg-brand-subtle)" : "transparent",
                      color: sel ? "var(--fg-brand)" : "var(--fg-default)",
                      padding: "7px 10px", borderRadius: "var(--radius-sm)",
                      display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
                      fontFamily: "inherit", fontSize: 13.5, textAlign: "left",
                    }}
                    onMouseEnter={e => !sel && (e.currentTarget.style.background = "var(--bg-muted)")}
                    onMouseLeave={e => !sel && (e.currentTarget.style.background = "transparent")}>
                    {o.icon && <Icon name={o.icon} size={14} color="var(--fg-muted)" />}
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: sel ? 600 : 500 }}>{o.label}</div>
                      {o.sub && <div style={{ fontSize: 11.5, color: "var(--fg-muted)", marginTop: 1 }}>{o.sub}</div>}
                    </span>
                    {sel && <Icon name="check" size={14} />}
                  </button>
                );
              })}
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   ACCORDION
   <Accordion type="single" defaultValue="..." items={[{ id, title, content, icon? }]} />
   ───────────────────────────────────────────────────────────────────────── */
function Accordion({ items, type = "single", defaultValue, value, onChange, variant = "bordered" }) {
  const initial = defaultValue ?? (type === "multiple" ? [] : null);
  const [internal, setInternal] = useSE(initial);
  const controlled = value !== undefined;
  const cur = controlled ? value : internal;
  const isOpen = (id) => type === "multiple" ? cur.includes(id) : cur === id;
  const toggle = (id) => {
    let next;
    if (type === "multiple") {
      next = cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id];
    } else {
      next = cur === id ? null : id;
    }
    if (!controlled) setInternal(next);
    onChange && onChange(next);
  };
  return (
    <div style={{
      ...(variant === "bordered" ? {
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
      } : {})
    }}>
      {items.map((it, i) => {
        const open = isOpen(it.id);
        return (
          <div key={it.id} style={{
            borderTop: i === 0 ? "0" : "1px solid var(--border-subtle)",
          }}>
            <button onClick={() => toggle(it.id)}
              aria-expanded={open}
              style={{
                appearance: "none", border: 0, width: "100%",
                background: "transparent", cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 10,
                padding: "14px 16px", textAlign: "left",
                color: "var(--fg-default)", fontSize: 14, fontWeight: 500,
              }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--bg-subtle)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              {it.icon && <Icon name={it.icon} size={16} color="var(--fg-muted)" />}
              <span style={{ flex: 1 }}>{it.title}</span>
              <Icon name="chevron-down" size={16}
                style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform var(--dur-fast)", color: "var(--fg-muted)" }} />
            </button>
            {open && (
              <div style={{
                padding: "0 16px 16px", fontSize: 13.5,
                color: "var(--fg-muted)", lineHeight: 1.6,
              }}>{it.content}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { Slider, ToggleGroup, Combobox, Accordion });
