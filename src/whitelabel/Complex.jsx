// White-label complex components.

const { useState: useC, useEffect: useCE, useRef: useCR, useMemo: useCM, useLayoutEffect: useCL } = React;

/* ─── CALENDAR ─────────────────────────────────────────────────────────── */
// Single date selection. value = Date | null. Pass {min, max} to restrict.
function Calendar({ value, onChange, min, max, weekStartsOn = 0 }) {
  const [view, setView] = useC(() => {
    const d = value ? new Date(value) : new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const today = new Date();
  const isSameDay = (a, b) => a && b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth() &&
    a.getDate()     === b.getDate();
  const within = (d) => (!min || d >= min) && (!max || d <= max);

  const monthDays = useCM(() => {
    const first = new Date(view.year, view.month, 1);
    const startDow = (first.getDay() - weekStartsOn + 7) % 7;
    const start = new Date(view.year, view.month, 1 - startDow);
    return Array.from({ length: 42 }).map((_, i) => {
      const d = new Date(start); d.setDate(start.getDate() + i); return d;
    });
  }, [view, weekStartsOn]);

  const monthLabel = new Date(view.year, view.month).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const dayNames = useCM(() => {
    const base = new Date(2024, 0, 7); // Sun
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(base); d.setDate(base.getDate() + ((i + weekStartsOn) % 7));
      return d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2);
    });
  }, [weekStartsOn]);

  const shift = (n) => setView(v => {
    const d = new Date(v.year, v.month + n);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  return (
    <div style={{
      background: "var(--bg-raised)", border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-lg)", padding: 14, width: 280, fontFamily: "var(--font-sans)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <IconButton icon="chevron-left"  variant="ghost" size="sm" ariaLabel="Previous month" onClick={() => shift(-1)} />
        <div style={{ fontWeight: 600, fontSize: 13, textTransform: "capitalize", color: "var(--fg-default)" }}>{monthLabel}</div>
        <IconButton icon="chevron-right" variant="ghost" size="sm" ariaLabel="Next month" onClick={() => shift(1)} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {dayNames.map((n, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "var(--fg-subtle)", padding: "4px 0" }}>{n}</div>
        ))}
        {monthDays.map((d, i) => {
          const outOfMonth = d.getMonth() !== view.month;
          const isToday = isSameDay(d, today);
          const isSelected = isSameDay(d, value);
          const allowed = within(d);
          return (
            <button key={i} disabled={!allowed}
              onClick={() => allowed && onChange && onChange(new Date(d))}
              style={{
                appearance: "none", border: 0, cursor: allowed ? "pointer" : "not-allowed",
                height: 32, fontFamily: "inherit", fontSize: 12.5, fontWeight: isSelected ? 600 : 500,
                background: isSelected ? "var(--bg-brand)" : "transparent",
                color: isSelected ? "var(--fg-on-brand)"
                  : outOfMonth ? "var(--fg-disabled)"
                  : !allowed ? "var(--fg-disabled)"
                  : "var(--fg-default)",
                borderRadius: "var(--radius-sm)",
                position: "relative",
                opacity: !allowed ? 0.4 : 1,
                transition: "background var(--dur-fast)",
              }}
              onMouseEnter={e => !isSelected && allowed && (e.currentTarget.style.background = "var(--bg-muted)")}
              onMouseLeave={e => !isSelected && (e.currentTarget.style.background = "transparent")}>
              {d.getDate()}
              {isToday && !isSelected && (
                <span style={{ position: "absolute", bottom: 3, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: 9999, background: "var(--bg-brand)" }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── DATE PICKER ─────────────────────────────────────────────────────── */
function DatePicker({ value, onChange, label, placeholder = "Pick a date", disabled, error, hint, min, max }) {
  const [open, setOpen] = useC(false);
  const [pos, setPos] = useC({ top: 0, left: 0 });
  const anchorRef = useCR(null);
  const popRef = useCR(null);

  useCL(() => {
    if (!open || !anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left });
  }, [open]);

  useCE(() => {
    if (!open) return;
    const click = (e) => {
      if (anchorRef.current?.contains(e.target) || popRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const esc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", click);
    window.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", click); window.removeEventListener("keydown", esc); };
  }, [open]);

  const display = value ? value.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : placeholder;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <Label>{label}</Label>}
      <button ref={anchorRef} type="button" disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        style={{
          appearance: "none", height: 38, padding: "0 12px",
          background: disabled ? "var(--bg-muted)" : "var(--bg-surface)",
          color: value ? "var(--fg-default)" : "var(--fg-subtle)",
          border: `1px solid ${error ? "var(--border-danger)" : open ? "var(--border-focus)" : "var(--border-default)"}`,
          borderRadius: "var(--radius-md)",
          boxShadow: open ? (error ? "var(--ring-danger)" : "var(--ring-focus)") : "none",
          display: "flex", alignItems: "center", gap: 8, cursor: disabled ? "not-allowed" : "pointer",
          fontFamily: "inherit", fontSize: 14, textAlign: "left",
        }}>
        <Icon name="calendar" size={15} color="var(--fg-muted)" />
        <span style={{ flex: 1 }}>{display}</span>
        {value && !disabled && (
          <span onClick={(e) => { e.stopPropagation(); onChange && onChange(null); }}
            style={{ color: "var(--fg-muted)", display: "inline-flex" }}>
            <Icon name="x" size={14} />
          </span>
        )}
      </button>
      {hint && <span style={{ fontSize: 12, color: error ? "var(--fg-danger)" : "var(--fg-muted)" }}>{hint}</span>}
      {open && (
        <Portal>
          <div ref={popRef} style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: "var(--z-popover)" }}>
            <Calendar value={value} onChange={(d) => { onChange && onChange(d); setOpen(false); }} min={min} max={max} />
          </div>
        </Portal>
      )}
    </div>
  );
}

/* ─── COMMAND — ⌘K palette ────────────────────────────────────────────── */
// items: [{ section: "Section name", commands: [{ id, label, icon, shortcut, hint, onSelect }] }]
function Command({ open, onClose, sections, placeholder = "Type a command…", emptyText = "No results" }) {
  const [q, setQ] = useC("");
  const inputRef = useCR(null);
  const listRef = useCR(null);
  const [active, setActive] = useC(0);

  useCE(() => { if (open) { setQ(""); setActive(0); setTimeout(() => inputRef.current?.focus(), 30); } }, [open]);
  useEscape && useEscape(open, onClose);

  const filtered = useCM(() => {
    const Q = q.trim().toLowerCase();
    return sections.map(s => ({
      section: s.section,
      commands: s.commands.filter(c => !Q || (c.label + " " + (c.hint || "")).toLowerCase().includes(Q)),
    })).filter(s => s.commands.length);
  }, [q, sections]);

  // Flatten for keyboard nav
  const flat = useCM(() => filtered.flatMap(s => s.commands), [filtered]);

  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(flat.length - 1, a + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(a => Math.max(0, a - 1)); }
    else if (e.key === "Enter")    { e.preventDefault(); flat[active]?.onSelect && flat[active].onSelect(); onClose && onClose(); }
  };

  if (!open) return null;
  return (
    <Portal>
      <div style={{ position: "fixed", inset: 0, zIndex: "var(--z-modal)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "12vh" }}>
        <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "var(--bg-overlay)" }} />
        <div style={{
          position: "relative", width: 540, maxWidth: "92vw", maxHeight: "70vh",
          background: "var(--bg-raised)", border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          animation: "wlScale 200ms var(--ease-out)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 14, borderBottom: "1px solid var(--border-subtle)" }}>
            <Icon name="search" size={16} color="var(--fg-muted)" />
            <input ref={inputRef} value={q} onChange={e => { setQ(e.target.value); setActive(0); }} onKeyDown={onKey}
              placeholder={placeholder}
              style={{ flex: 1, background: "transparent", border: 0, outline: 0, fontFamily: "inherit", fontSize: 15, color: "var(--fg-default)" }} />
            <Kbd>Esc</Kbd>
          </div>
          <div ref={listRef} style={{ flex: 1, overflow: "auto", padding: 8 }}>
            {filtered.length === 0 && (
              <div style={{ padding: "32px 12px", textAlign: "center", color: "var(--fg-muted)", fontSize: 14 }}>{emptyText}</div>
            )}
            {filtered.map((s, si) => (
              <div key={si} style={{ padding: "6px 0" }}>
                {s.section && <div style={{ padding: "6px 10px 4px", fontSize: 11, fontWeight: 700, color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.section}</div>}
                {s.commands.map((c, ci) => {
                  const idx = filtered.slice(0, si).reduce((a, s) => a + s.commands.length, 0) + ci;
                  const isActive = idx === active;
                  return (
                    <button key={c.id || ci}
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => { c.onSelect && c.onSelect(); onClose && onClose(); }}
                      style={{
                        appearance: "none", border: 0, width: "100%",
                        background: isActive ? "var(--bg-muted)" : "transparent",
                        color: "var(--fg-default)", cursor: "pointer",
                        padding: "9px 10px", borderRadius: "var(--radius-sm)",
                        display: "flex", alignItems: "center", gap: 10, textAlign: "left",
                        fontFamily: "inherit", fontSize: 13.5,
                      }}>
                      {c.icon && <Icon name={c.icon} size={15} color="var(--fg-muted)" />}
                      <span style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{c.label}</div>
                        {c.hint && <div style={{ fontSize: 11.5, color: "var(--fg-muted)", marginTop: 1 }}>{c.hint}</div>}
                      </span>
                      {c.shortcut && <Kbd>{c.shortcut}</Kbd>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 14px", borderTop: "1px solid var(--border-subtle)", fontSize: 11, color: "var(--fg-muted)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Kbd>↑</Kbd><Kbd>↓</Kbd> navigate</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Kbd>↵</Kbd> select</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Kbd>Esc</Kbd> close</span>
          </div>
        </div>
      </div>
    </Portal>
  );
}

/* ─── CAROUSEL ────────────────────────────────────────────────────────── */
function Carousel({ children, autoplay = false, interval = 4000, showDots = true, showArrows = true, ariaLabel = "Carousel" }) {
  const items = React.Children.toArray(children).filter(Boolean);
  const [idx, setIdx] = useC(0);
  useCE(() => {
    if (!autoplay) return;
    const t = setTimeout(() => setIdx(i => (i + 1) % items.length), interval);
    return () => clearTimeout(t);
  }, [idx, autoplay, interval, items.length]);
  const go = (n) => setIdx(((n % items.length) + items.length) % items.length);
  return (
    <div role="region" aria-label={ariaLabel} style={{ position: "relative", overflow: "hidden", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
      <div style={{
        display: "flex", transition: "transform var(--dur-slow) var(--ease-out)",
        transform: `translateX(-${idx * 100}%)`,
      }}>
        {items.map((c, i) => (
          <div key={i} style={{ flex: "0 0 100%", minWidth: 0 }}>{c}</div>
        ))}
      </div>
      {showArrows && items.length > 1 && (
        <>
          <button onClick={() => go(idx - 1)} aria-label="Previous"
            style={arrowStyle("left")}><Icon name="chevron-left" size={18} /></button>
          <button onClick={() => go(idx + 1)} aria-label="Next"
            style={arrowStyle("right")}><Icon name="chevron-right" size={18} /></button>
        </>
      )}
      {showDots && items.length > 1 && (
        <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
          {items.map((_, i) => (
            <button key={i} onClick={() => go(i)} aria-label={`Go to ${i + 1}`}
              style={{
                appearance: "none", border: 0, padding: 0,
                width: i === idx ? 18 : 6, height: 6, borderRadius: 9999,
                background: i === idx ? "var(--bg-brand)" : "var(--neutral-300)",
                cursor: "pointer", transition: "all var(--dur-fast)",
              }} />
          ))}
        </div>
      )}
    </div>
  );
}
function arrowStyle(side) {
  return {
    appearance: "none", position: "absolute", top: "50%", [side]: 10, transform: "translateY(-50%)",
    width: 36, height: 36, borderRadius: "50%",
    background: "var(--bg-raised)", border: "1px solid var(--border-subtle)",
    color: "var(--fg-default)", cursor: "pointer", boxShadow: "var(--shadow-md)",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
  };
}

/* ─── CHART (Line, Bar, Area) — minimal SVG ──────────────────────────── */
function Chart({ type = "line", data, x = "x", y = "y", height = 200, color, formatY, label, showGrid = true, showAxis = true, innerRadius, seriesLabels, legend = true }) {
  // data: [{ x: ..., y: number }, ...] OR multi-series: [{ x, a: 1, b: 2 }]
  // For multi-series, `y` may be an array of keys.
  // type: line | area | bar | pie | donut | heatmap
  //   pie/donut: data = [{ x: label, y: value }]
  //   heatmap:   data = [{ x: col, row: rowLabel, y: value }]  (auto-buckets a grid)
  const sliceColors = ["var(--bg-brand)", "var(--emerald-500)", "var(--amber-500)", "var(--rose-500)", "var(--violet-500)", "var(--cyan-500)", "var(--fuchsia-500)", "var(--teal-500)"];
  const fmtV = formatY || (n => n);
  const series = Array.isArray(y) ? y : [y];
  const seriesLabel = (s) => (seriesLabels && seriesLabels[s]) || s;
  const [hi, setHi] = useC(null); // hovered / keyboard-active index

  // accessibility floor — a visually-hidden data table so a screen reader
  // reads the numbers, not the picture. Color is never the sole signal.
  const srOnly = { position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0 };
  const SrTable = () => (
    <table style={srOnly}>
      <caption>{label || `${type} chart`}</caption>
      <thead><tr><th>{x}</th>{series.map(s => <th key={s}>{seriesLabel(s)}</th>)}</tr></thead>
      <tbody>{data.map((d, i) => <tr key={i}><th>{d[x]}</th>{series.map(s => <td key={s}>{fmtV(+d[s] || 0)}</td>)}</tr>)}</tbody>
    </table>
  );
  const ariaSummary = `${type} chart, ${data.length} points. ` + data.map(d => `${d[x]}: ${series.map(s => fmtV(+d[s] || 0)).join(", ")}`).join(". ");
  const Legend = ({ items }) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 12 }}>
      {items.map((it, i) => (
        <div key={i} onMouseEnter={() => it.idx != null && setHi(it.idx)} onMouseLeave={() => setHi(null)}
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--fg-muted)", fontWeight: hi != null && it.idx === hi ? 700 : 500 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: it.color, flexShrink: 0 }} />
          {it.label}
        </div>
      ))}
    </div>
  );

  // ── PIE / DONUT ─────────────────────────────────────────────
  if (type === "pie" || type === "donut") {
    const total = data.reduce((s, d) => s + (+d[y] || 0), 0) || 1;
    const size = height, cx = size / 2, cy = size / 2, R = size / 2 - 4;
    const ir = type === "donut" ? (innerRadius ?? R * 0.58) : 0;
    const TAU = Math.PI * 2;
    const p = (ang, r) => [cx + Math.cos(ang) * r, cy + Math.sin(ang) * r];
    let a0 = -Math.PI / 2;
    const slices = data.map((d, i) => {
      const val = +d[y] || 0;
      const a1 = a0 + (val / total) * TAU;
      const large = a1 - a0 > Math.PI ? 1 : 0;
      const mid = (a0 + a1) / 2;
      const [x0, y0] = p(a0, R), [x1, y1] = p(a1, R);
      let path;
      if (ir > 0) { const [ix1, iy1] = p(a1, ir), [ix0, iy0] = p(a0, ir);
        path = `M ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} L ${ix1} ${iy1} A ${ir} ${ir} 0 ${large} 0 ${ix0} ${iy0} Z`; }
      else path = `M ${cx} ${cy} L ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} Z`;
      a0 = a1;
      return { val, i, path, mid, pct: Math.round(val / total * 100), color: color || sliceColors[i % sliceColors.length] };
    });
    const onKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); setHi(h => h == null ? 0 : Math.min(h + 1, data.length - 1)); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); setHi(h => h == null ? 0 : Math.max(h - 1, 0)); }
      else if (e.key === "Escape") setHi(null);
    };
    const act = hi != null ? slices[hi] : null;
    return (
      <div style={{ width: "100%" }}>
        {label && <div style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 6 }}>{label}</div>}
        <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
          <div tabIndex={0} role="img" aria-label={ariaSummary} onKeyDown={onKey}
            onFocus={() => setHi(h => h == null ? 0 : h)} onBlur={() => setHi(null)}
            style={{ flexShrink: 0, lineHeight: 0, outline: "none", borderRadius: "var(--radius-sm)" }}
            onFocusCapture={e => e.currentTarget.style.boxShadow = "var(--ring-focus)"}
            onBlurCapture={e => e.currentTarget.style.boxShadow = "none"}>
            <svg width={size} height={size} style={{ overflow: "visible" }} aria-hidden="true">
              {slices.map((s) => {
                const on = hi === s.i;
                const dx = on ? Math.cos(s.mid) * 5 : 0, dy = on ? Math.sin(s.mid) * 5 : 0;
                return <path key={s.i} d={s.path} transform={`translate(${dx} ${dy})`}
                  fill={s.color} stroke="var(--bg-surface)" strokeWidth="2"
                  opacity={hi == null || on ? 1 : 0.5}
                  style={{ transition: "opacity var(--dur-fast), transform var(--dur-fast)", cursor: "pointer" }}
                  onMouseEnter={() => setHi(s.i)} onMouseLeave={() => setHi(null)} />;
              })}
              {type === "donut" && <text x={cx} y={act ? cy - 6 : cy} textAnchor="middle" dominantBaseline="central" fontSize="20" fontWeight="700" fill="var(--fg-strong)" fontFamily="var(--font-sans)">{act ? fmtV(act.val) : fmtV(total)}</text>}
              {type === "donut" && act && <text x={cx} y={cy + 16} textAnchor="middle" fontSize="11" fill="var(--fg-muted)" fontFamily="var(--font-sans)">{act.pct}% · {data[act.i][x]}</text>}
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 140 }}>
            {slices.map((s) => (
              <div key={s.i} onMouseEnter={() => setHi(s.i)} onMouseLeave={() => setHi(null)}
                style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, padding: "3px 6px", borderRadius: "var(--radius-sm)", cursor: "pointer", background: hi === s.i ? "var(--bg-muted)" : "transparent", transition: "background var(--dur-fast)" }}>
                <span style={{ width: 11, height: 11, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                <span style={{ color: "var(--fg-default)", flex: 1 }}>{data[s.i][x]}</span>
                <span style={{ color: "var(--fg-muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
        <SrTable />
      </div>
    );
  }

  // ── HEATMAP ─────────────────────────────────────────────────
  if (type === "heatmap") {
    const cols = [...new Set(data.map(d => d[x]))];
    const rows = [...new Set(data.map(d => d.row))];
    const lookup = Object.fromEntries(data.map(d => [`${d.row}|${d[x]}`, +d[y] || 0]));
    const max = Math.max(...data.map(d => +d[y] || 0), 1);
    const cell = 30, rowLabelW = 56, gap = 3;
    const gridW = rowLabelW + cols.length * (cell + gap);
    return (
      <div style={{ width: "100%", overflowX: "auto" }}>
        {label && <div style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 6 }}>{label}</div>}
        <div style={{ display: "inline-flex", flexDirection: "column", gap }}>
          {rows.map((r, ri) => (
            <div key={ri} style={{ display: "flex", gap, alignItems: "center" }}>
              <div style={{ width: rowLabelW, fontSize: 11, color: "var(--fg-subtle)", textAlign: "right", paddingRight: 8, fontFamily: "var(--font-mono)" }}>{r}</div>
              {cols.map((c, ci) => {
                const v = lookup[`${r}|${c}`] || 0;
                const t = v / max;
                return (
                  <div key={ci} title={`${r} · ${c}: ${fmtV(v)}`} style={{
                    width: cell, height: cell, borderRadius: "var(--radius-sm)", flexShrink: 0,
                    background: t === 0 ? "var(--bg-muted)" : `color-mix(in oklch, var(--bg-brand) ${Math.round(15 + t * 85)}%, transparent)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, color: t > 0.55 ? "var(--fg-on-brand)" : "var(--fg-muted)", fontFamily: "var(--font-mono)",
                  }}>{v || ""}</div>
                );
              })}
            </div>
          ))}
          <div style={{ display: "flex", gap, paddingLeft: rowLabelW + 0 }}>
            {cols.map((c, ci) => <div key={ci} style={{ width: cell, fontSize: 10, color: "var(--fg-subtle)", textAlign: "center", fontFamily: "var(--font-mono)" }}>{c}</div>)}
          </div>
        </div>
        {/* intensity scale — value legend so color isn't the only signal */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 11, color: "var(--fg-muted)" }}>
          <span style={{ fontFamily: "var(--font-mono)" }}>0</span>
          <div style={{ display: "flex", gap: 2 }}>
            {[0.15, 0.35, 0.55, 0.75, 0.95].map((t, i) => <span key={i} style={{ width: 18, height: 10, borderRadius: 2, background: `color-mix(in oklch, var(--bg-brand) ${Math.round(t * 100)}%, transparent)` }} />)}
          </div>
          <span style={{ fontFamily: "var(--font-mono)" }}>{fmtV(max)}</span>
          <span>intensity</span>
        </div>
        <table style={srOnly}>
          <caption>{label || "heatmap"}</caption>
          <thead><tr><th></th>{cols.map(c => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>{rows.map(r => <tr key={r}><th>{r}</th>{cols.map(c => <td key={c}>{fmtV(lookup[`${r}|${c}`] || 0)}</td>)}</tr>)}</tbody>
        </table>
      </div>
    );
  }

  const ref = useCR(null);
  const [w, setW] = useC(420);
  useCE(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  const pad = { l: 36, r: 12, t: 16, b: 26 };
  const W = w, H = height;
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const xs = data.map(d => d[x]);
  const ys = data.flatMap(d => series.map(s => +d[s] || 0));
  const yMax = Math.max(...ys, 1);
  const yMin = type === "bar" ? 0 : Math.min(...ys, 0);
  const xStep = innerW / Math.max(1, data.length - 1);
  const yScale = (v) => pad.t + innerH - ((v - yMin) / (yMax - yMin)) * innerH;
  const seriesColor = (si) => color || sliceColors[si % sliceColors.length];
  const fmt = formatY || (n => n);

  const onKey = (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); setHi(h => h == null ? 0 : Math.min(h + 1, data.length - 1)); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); setHi(h => h == null ? data.length - 1 : Math.max(h - 1, 0)); }
    else if (e.key === "Escape") setHi(null);
  };
  const tipX = hi != null ? pad.l + hi * xStep : 0;
  const tipY = hi != null ? Math.min(...series.map(s => yScale(+data[hi][s] || 0))) : 0;

  return (
    <div ref={ref} style={{ width: "100%" }}>
      {label && <div style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 6 }}>{label}</div>}
      <div tabIndex={0} role="img" aria-label={ariaSummary} onKeyDown={onKey}
        onFocus={() => setHi(h => h == null ? 0 : h)} onBlur={() => setHi(null)}
        onFocusCapture={e => e.currentTarget.style.boxShadow = "var(--ring-focus)"}
        onBlurCapture={e => e.currentTarget.style.boxShadow = "none"}
        style={{ position: "relative", outline: "none", borderRadius: "var(--radius-sm)" }}>
        <svg width={W} height={H} aria-hidden="true" style={{ display: "block" }}>
          {showGrid && [0.25, 0.5, 0.75, 1].map((p, i) => {
            const yv = yMin + (yMax - yMin) * (1 - p);
            const yy = yScale(yv);
            return (
              <g key={i}>
                <line x1={pad.l} x2={W - pad.r} y1={yy} y2={yy} stroke="var(--border-subtle)" strokeDasharray="2 4" />
                {showAxis && <text x={pad.l - 6} y={yy + 3} fontSize="10" fill="var(--fg-subtle)" textAnchor="end" fontFamily="var(--font-mono)">{fmt(Math.round(yv))}</text>}
              </g>
            );
          })}
          {showAxis && xs.map((xv, i) => {
            const show = i === 0 || i === xs.length - 1 || i === Math.floor(xs.length / 2);
            if (!show) return null;
            return <text key={i} x={pad.l + i * xStep} y={H - 8} fontSize="10" fill="var(--fg-subtle)" textAnchor="middle" fontFamily="var(--font-mono)">{xv}</text>;
          })}
          {/* active guide line */}
          {hi != null && <line x1={tipX} x2={tipX} y1={pad.t} y2={pad.t + innerH} stroke="var(--border-default)" strokeDasharray="3 3" />}
          {series.map((s, si) => {
            const c = seriesColor(si);
            if (type === "bar") {
              const bw = Math.max(4, xStep * 0.6 / series.length);
              return data.map((d, i) => {
                const X = pad.l + i * xStep - (series.length * bw) / 2 + si * bw;
                const Y = yScale(+d[s] || 0);
                return <rect key={`${si}-${i}`} x={X} y={Y} width={bw} height={pad.t + innerH - Y} fill={c} rx="2"
                  opacity={hi == null || hi === i ? 1 : 0.45} style={{ transition: "opacity var(--dur-fast)" }} />;
              });
            }
            const pts = data.map((d, i) => `${pad.l + i * xStep},${yScale(+d[s] || 0)}`).join(" ");
            const lastPt = data.length - 1;
            const area = `M ${pad.l},${yScale(0)} L ${pts.split(" ").join(" L ")} L ${pad.l + lastPt * xStep},${yScale(0)} Z`;
            return (
              <g key={si}>
                {type === "area" && <path d={area} fill={c} opacity="0.18" />}
                <polyline points={pts} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                {data.map((d, i) => (
                  <circle key={i} cx={pad.l + i * xStep} cy={yScale(+d[s] || 0)} r={hi === i ? 5 : 3} fill={c}
                    stroke="var(--bg-surface)" strokeWidth={hi === i ? 2 : 0} style={{ transition: "r var(--dur-fast)" }} />
                ))}
              </g>
            );
          })}
          {/* transparent hit area drives hover */}
          <rect x={pad.l - xStep / 2} y={pad.t} width={innerW + xStep} height={innerH} fill="transparent"
            onMouseMove={e => { const r = e.currentTarget.getBoundingClientRect(); const idx = Math.round((e.clientX - r.left - xStep / 2) / xStep); setHi(Math.max(0, Math.min(idx, data.length - 1))); }}
            onMouseLeave={() => setHi(null)} />
        </svg>
        {hi != null && data[hi] && (
          <div style={{
            position: "absolute", left: tipX, top: tipY, transform: "translate(-50%, -115%)", pointerEvents: "none",
            background: "var(--tooltip-bg)", color: "var(--tooltip-fg)", borderRadius: "var(--radius-sm)",
            padding: "6px 9px", fontSize: 11.5, whiteSpace: "nowrap", boxShadow: "var(--shadow-lg)", zIndex: 2, minWidth: 70,
          }}>
            <div style={{ fontWeight: 700, marginBottom: series.length > 1 ? 4 : 0 }}>{data[hi][x]}</div>
            {series.map((s, si) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: seriesColor(si), flexShrink: 0 }} />
                {series.length > 1 && <span style={{ opacity: 0.85 }}>{seriesLabel(s)}</span>}
                <span style={{ marginLeft: "auto", paddingLeft: 10, fontFamily: "var(--font-mono)", fontWeight: 600 }}>{fmtV(+data[hi][s] || 0)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {legend && series.length > 1 && <Legend items={series.map((s, si) => ({ label: seriesLabel(s), color: seriesColor(si) }))} />}
      <SrTable />
    </div>
  );
}

/* ─── DATA TABLE — higher-level Table wrapper ─────────────────────────── */
function DataTable({
  data, columns,
  // columns: [{ key, label, render?, align?, sortable?, width?, mono? }]
  searchable, searchKey, searchPlaceholder = "Search…",
  selectable, onSelectionChange,
  pageSize = 10, showPagination = true,
  emptyText = "No data", caption,
}) {
  const [q, setQ] = useC("");
  const [sortKey, setSortKey] = useC(null);
  const [sortDir, setSortDir] = useC("asc");
  const [page, setPage] = useC(1);
  const [selected, setSelected] = useC(new Set());

  useCE(() => { setPage(1); }, [q, sortKey, sortDir]);

  const filtered = useCM(() => {
    let arr = data;
    if (searchable && q) {
      const Q = q.toLowerCase();
      const keys = searchKey ? (Array.isArray(searchKey) ? searchKey : [searchKey])
        : columns.map(c => c.key);
      arr = arr.filter(row => keys.some(k => String(row[k] ?? "").toLowerCase().includes(Q)));
    }
    if (sortKey) {
      arr = [...arr].sort((a, b) => {
        const x = a[sortKey], y = b[sortKey];
        if (typeof x === "number" && typeof y === "number") return sortDir === "asc" ? x - y : y - x;
        return sortDir === "asc" ? String(x).localeCompare(String(y)) : String(y).localeCompare(String(x));
      });
    }
    return arr;
  }, [data, q, sortKey, sortDir, searchable, searchKey, columns]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const slice = showPagination ? filtered.slice((page - 1) * pageSize, page * pageSize) : filtered;

  const toggleAll = () => {
    if (selected.size === slice.length) setSelected(new Set());
    else setSelected(new Set(slice.map((_, i) => (page - 1) * pageSize + i)));
    if (onSelectionChange) {
      const ids = selected.size === slice.length ? [] : slice.map((_, i) => (page - 1) * pageSize + i);
      onSelectionChange(ids);
    }
  };
  const toggleOne = (i) => {
    const next = new Set(selected);
    next.has(i) ? next.delete(i) : next.add(i);
    setSelected(next);
    if (onSelectionChange) onSelectionChange([...next]);
  };

  const onSort = (key) => () => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
      {searchable && (
        <Input size="sm" placeholder={searchPlaceholder} value={q} onChange={setQ} leading="search" fullWidth={false} />
      )}
      <Table>
        {caption && <TableCaption>{caption}</TableCaption>}
        <TableHeader>
          <TableRow hoverable={false}>
            {selectable && (
              <TableHead width={36}>
                <Checkbox indeterminate={selected.size > 0 && selected.size < slice.length}
                  checked={slice.length > 0 && selected.size === slice.length}
                  onChange={toggleAll} />
              </TableHead>
            )}
            {columns.map(c => (
              <TableHead key={c.key} align={c.align} width={c.width}
                sortable={c.sortable} sorted={sortKey === c.key ? sortDir : null}
                onSort={c.sortable ? onSort(c.key) : undefined}>
                {c.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {slice.length === 0 && (
            <TableRow hoverable={false}>
              <TableCell align="center" /* span all */ >
                <div style={{ color: "var(--fg-muted)", padding: "32px 0" }}>{emptyText}</div>
              </TableCell>
            </TableRow>
          )}
          {slice.map((row, i) => {
            const realIdx = (page - 1) * pageSize + i;
            const sel = selected.has(realIdx);
            return (
              <TableRow key={i} selected={sel}>
                {selectable && (
                  <TableCell><Checkbox checked={sel} onChange={() => toggleOne(realIdx)} /></TableCell>
                )}
                {columns.map(c => (
                  <TableCell key={c.key} align={c.align} mono={c.mono}>
                    {c.render ? c.render(row, realIdx) : row[c.key]}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {showPagination && filtered.length > pageSize && (
        <Pagination page={page} total={filtered.length} pageSize={pageSize} onPage={setPage} />
      )}
    </div>
  );
}

/* ─── NAVIGATION MENU ─────────────────────────────────────────────────── */
// items: [{ label, panel: ReactNode }] for mega menus, or { label, href } for simple links
function NavigationMenu({ items, style }) {
  const [open, setOpen] = useC(null);
  const refs = useCR([]);
  const [panelPos, setPanelPos] = useC({ left: 0, top: 0, width: 480 });
  const panelRef = useCR(null);
  useCL(() => {
    if (open == null) return;
    const r = refs.current[open]?.getBoundingClientRect();
    if (r) setPanelPos({ left: r.left, top: r.bottom + 4, width: items[open].panelWidth || 480 });
  }, [open]);
  useCE(() => {
    if (open == null) return;
    const click = (e) => {
      if (panelRef.current?.contains(e.target)) return;
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
      <nav style={{ display: "inline-flex", gap: 2, padding: 4, background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", ...style }}>
        {items.map((m, i) => {
          const isOpen = open === i;
          if (m.href) return (
            <a key={i} href={m.href} style={{
              padding: "7px 12px", borderRadius: "var(--radius-sm)",
              color: "var(--fg-default)", fontSize: 13, fontWeight: 500,
              textDecoration: "none",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--bg-muted)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>{m.label}</a>
          );
          return (
            <button key={i} ref={el => refs.current[i] = el}
              onClick={() => setOpen(o => o === i ? null : i)}
              onMouseEnter={() => { if (open != null) setOpen(i); }}
              style={{
                appearance: "none", border: 0, padding: "7px 12px",
                background: isOpen ? "var(--bg-muted)" : "transparent",
                color: "var(--fg-default)", cursor: "pointer",
                borderRadius: "var(--radius-sm)", fontFamily: "inherit",
                fontSize: 13, fontWeight: 500,
                display: "inline-flex", alignItems: "center", gap: 4,
              }}>
              {m.label}
              <Icon name="chevron-down" size={12}
                style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform var(--dur-fast)" }} />
            </button>
          );
        })}
      </nav>
      {open != null && items[open].panel && (
        <Portal>
          <div ref={panelRef}
            style={{
              position: "fixed", top: panelPos.top, left: panelPos.left, width: panelPos.width,
              zIndex: "var(--z-popover)",
              background: "var(--bg-raised)", border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)",
              padding: 16, animation: "wlScale 140ms var(--ease-out)",
            }}>
            {items[open].panel}
          </div>
        </Portal>
      )}
    </>
  );
}

Object.assign(window, { Calendar, DatePicker, Command, Carousel, Chart, DataTable, NavigationMenu });
