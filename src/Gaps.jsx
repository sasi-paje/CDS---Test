// White-label gap-closers — components that fill the audited holes.
// FileUpload · MultiSelect (chips) · Typeahead (async) · DateRangePicker · FormErrorSummary
// All consume the semantic token layer and reuse lib/ primitives (Icon, Button, Badge, Progress, Label, Portal, Spinner).

const { useState: useG, useEffect: useGE, useRef: useGR, useMemo: useGM, useLayoutEffect: useGL, useCallback: useGC } = React;

/* ─────────────────────────────────────────────────────────────────────────
   FILE UPLOAD — drag-drop zone, per-file progress, multiple files, error/retry
   <FileUpload multiple accept="image/*" maxSize={5*1024*1024} onChange={files=>…} />
   Files are tracked client-side with a simulated upload so the states are real.
   ───────────────────────────────────────────────────────────────────────── */
function FileUpload({
  label, hint, multiple = true, accept, maxSize = 10 * 1024 * 1024,
  autoUpload = true,
  onChange, uploader, // uploader(file, onProgress) -> Promise; omitted = simulated
}) {
  const [items, setItems] = useG([]); // {id, file, name, size, pct, status: 'uploading'|'done'|'error', error}
  const [drag, setDrag] = useG(false);
  const inputRef = useGR(null);
  const idRef = useGR(0);

  const fmtSize = (b) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  const sim = (item, patch) => setItems(arr => arr.map(x => x.id === item.id ? { ...x, ...patch } : x));

  const runUpload = useGC((item) => {
    sim(item, { status: "uploading", pct: 0, error: null });
    const onProgress = (p) => sim(item, { pct: Math.round(p) });
    const job = uploader
      ? uploader(item.file, onProgress)
      : new Promise((res, rej) => {
          let p = 0;
          const t = setInterval(() => {
            p += Math.random() * 22 + 8;
            if (p >= 100) { clearInterval(t); onProgress(100); (item.file.size % 7 === 3 ? rej(new Error("Network error")) : res()); }
            else onProgress(p);
          }, 180);
        });
    job.then(() => sim(item, { status: "done", pct: 100, at: new Date() }))
       .catch((e) => sim(item, { status: "error", error: e.message || "Upload failed" }));
  }, [uploader]);

  const addFiles = useGC((fileList) => {
    const incoming = Array.from(fileList);
    const next = [];
    for (const file of incoming) {
      if (maxSize && file.size > maxSize) {
        next.push({ id: ++idRef.current, file, name: file.name, size: file.size, pct: 0, status: "error", error: `Exceeds ${fmtSize(maxSize)} limit` });
      } else {
        next.push({ id: ++idRef.current, file, name: file.name, size: file.size, pct: 0, status: autoUpload ? "uploading" : "queued", error: null });
      }
    }
    setItems(arr => {
      const merged = multiple ? [...arr, ...next] : next.slice(-1);
      return merged;
    });
    if (autoUpload) next.filter(n => n.status === "uploading").forEach(runUpload);
  }, [multiple, maxSize, runUpload, autoUpload]);

  const startAll = () => setItems(arr => {
    const queued = arr.filter(i => i.status === "queued");
    queued.forEach(q => runUpload(q));
    return arr.map(i => i.status === "queued" ? { ...i, status: "uploading" } : i);
  });

  useGE(() => { onChange && onChange(items.filter(i => i.status === "done").map(i => i.file)); }, [items]);

  const remove = (id) => setItems(arr => arr.filter(x => x.id !== id));
  const retry = (item) => runUpload(item);

  const statusIcon = { queued: "clock", uploading: "loader", done: "check-circle", error: "alert-circle" };
  const statusColor = { queued: "var(--fg-muted)", uploading: "var(--fg-muted)", done: "var(--fg-success)", error: "var(--fg-danger)" };
  const queuedCount = items.filter(i => i.status === "queued").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {label && <Label>{label}</Label>}
      <div
        role="button" tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click(); } }}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
        onFocus={(e) => { e.currentTarget.style.boxShadow = "var(--ring-focus)"; e.currentTarget.style.borderColor = "var(--border-brand)"; }}
        onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = drag ? "var(--border-brand)" : "var(--border-default)"; }}
        aria-label="File upload. Drag and drop supported, or press Enter to browse."
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          padding: "26px 20px", cursor: "pointer", textAlign: "center",
          border: `1.5px dashed ${drag ? "var(--border-brand)" : "var(--border-default)"}`,
          background: drag ? "var(--bg-brand-subtle)" : "var(--bg-subtle)",
          borderRadius: "var(--radius-lg)",
          transition: "background var(--dur-fast), border-color var(--dur-fast), box-shadow var(--dur-fast)",
          outline: "none",
        }}>
        <span style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "var(--bg-brand-subtle)", color: "var(--fg-brand)" }}>
          <Icon name="upload-cloud" size={20} />
        </span>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg-strong)", width: "100%" }}>
          {drag
            ? "Release to upload"
            : <>Drop file{multiple ? "s" : ""} here, or <span style={{ color: "var(--fg-brand)" }}>browse</span></>}
        </div>
        <div style={{ fontSize: 12, color: "var(--fg-subtle)" }}>
          {accept ? `${accept} · ` : ""}up to {fmtSize(maxSize)}{multiple ? " each" : ""}
        </div>
        <input ref={inputRef} type="file" multiple={multiple} accept={accept} hidden
          onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
      </div>
      {hint && <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>{hint}</span>}

      {items.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 2 }}>
          {items.map(it => (
            <div key={it.id} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
              border: `1px solid ${it.status === "error" ? "var(--border-danger)" : "var(--border-subtle)"}`,
              background: "var(--bg-surface)", borderRadius: "var(--radius-md)",
            }}>
              <span style={{ color: statusColor[it.status], display: "inline-flex", flexShrink: 0 }}>
                <Icon name={statusIcon[it.status]} size={18} style={it.status === "uploading" ? { animation: "g-spin 0.9s linear infinite" } : undefined} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 550, color: "var(--fg-default)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.name}</span>
                  <span style={{ fontSize: 12, color: "var(--fg-subtle)", flexShrink: 0, fontFamily: "var(--font-mono)" }}>{fmtSize(it.size)}</span>
                </div>
                {it.status === "uploading" && (
                  <>
                    <div style={{ marginTop: 6, height: 5, background: "var(--bg-muted)", borderRadius: 9999, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${it.pct}%`, background: "var(--bg-brand)", borderRadius: 9999, transition: "width var(--dur-fast)" }} />
                    </div>
                    <div style={{ marginTop: 3, fontSize: 11.5, color: "var(--fg-muted)" }}>Uploading… {Math.round(it.pct)}%</div>
                  </>
                )}
                {it.status === "queued" && <div style={{ marginTop: 3, fontSize: 12, color: "var(--fg-muted)" }}>Ready to upload</div>}
                {it.status === "error" && <div style={{ marginTop: 3, fontSize: 12, color: "var(--fg-danger)" }}>{it.error}</div>}
                {it.status === "done" && <div style={{ marginTop: 3, fontSize: 12, color: "var(--fg-success)" }}>Uploaded{it.at ? ` · ${it.at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}</div>}
              </div>
              <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                {it.status === "error" && it.file.size <= maxSize && <IconButton icon="rotate-ccw" variant="ghost" size="sm" ariaLabel="Retry" onClick={() => retry(it)} />}
                <IconButton icon="x" variant="ghost" size="sm" ariaLabel="Remove" onClick={() => remove(it.id)} />
              </div>
            </div>
          ))}
        </div>
      )}
      {!autoUpload && queuedCount > 0 && (
        <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
          <Button variant="primary" size="sm" leading="upload" onClick={startAll}>Upload {queuedCount} file{queuedCount > 1 ? "s" : ""}</Button>
          <Button variant="ghost" size="sm" onClick={() => setItems(arr => arr.filter(i => i.status !== "queued"))}>Clear</Button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   MULTI-SELECT (chips) — removable tokens + overflow, searchable checklist
   <MultiSelect options={[{value,label}]} value={[…]} onChange={…} max={?} />
   ───────────────────────────────────────────────────────────────────────── */
function MultiSelect({
  label, hint, error, options = [], value = [], onChange, placeholder = "Select…",
  max, disabled, width = "100%", size = "md", clearable = true,
}) {
  const [open, setOpen] = useG(false);
  const [q, setQ] = useG("");
  const [active, setActive] = useG(0);
  const [pos, setPos] = useG({ top: 0, left: 0, width: 0 });
  const anchorRef = useGR(null);
  const popRef = useGR(null);
  const inputRef = useGR(null);
  const listRef = useGR(null);
  const optRefs = useGR({});
  const lid = useGR("ms_" + Math.random().toString(36).slice(2, 8));

  // size geometry — sm/md/lg, parallels the control-geometry tokens
  const SZ = { sm: { min: 30, fs: 13, chip: 11.5, pad: "3px 6px" },
               md: { min: 38, fs: 14, chip: 12.5, pad: "5px 8px" },
               lg: { min: 46, fs: 15, chip: 13.5, pad: "7px 10px" } }[size];

  useGL(() => {
    if (!open || !anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 4, left: r.left, width: r.width });
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  useGE(() => {
    if (!open) return;
    const click = (e) => { if (anchorRef.current?.contains(e.target) || popRef.current?.contains(e.target)) return; setOpen(false); setQ(""); };
    document.addEventListener("mousedown", click);
    return () => document.removeEventListener("mousedown", click);
  }, [open]);

  const byValue = useGM(() => Object.fromEntries(options.map(o => [o.value, o])), [options]);
  const selected = value.map(v => byValue[v]).filter(Boolean);
  const flat = useGM(() => options.filter(o => o.label.toLowerCase().includes(q.toLowerCase())), [options, q]);
  const grouped = useGM(() => options.some(o => o.group), [options]);
  // ordered groups built from the filtered flat list
  const groups = useGM(() => {
    if (!grouped) return [{ name: null, items: flat }];
    const map = new Map();
    flat.forEach(o => { const g = o.group || "Other"; if (!map.has(g)) map.set(g, []); map.get(g).push(o); });
    return [...map.entries()].map(([name, items]) => ({ name, items }));
  }, [flat, grouped]);
  const atMax = max != null && value.length >= max;

  // keep active index in range as the filtered list changes
  useGE(() => { setActive(a => Math.min(a, Math.max(0, flat.length - 1))); }, [flat.length]);
  // scroll the active option into view without scrollIntoView (which breaks the host)
  useGE(() => {
    const el = optRefs.current[active], box = listRef.current;
    if (!el || !box) return;
    const top = el.offsetTop, bottom = top + el.offsetHeight;
    if (top < box.scrollTop) box.scrollTop = top - 4;
    else if (bottom > box.scrollTop + box.clientHeight) box.scrollTop = bottom - box.clientHeight + 4;
  }, [active, open]);

  const toggle = (v) => {
    if (value.includes(v)) onChange(value.filter(x => x !== v));
    else if (!atMax) onChange([...value, v]);
  };

  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); if (!open) setOpen(true); else setActive(a => Math.min(a + 1, flat.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (flat[active]) toggle(flat[active].value); }
    else if (e.key === "Escape") { setOpen(false); setQ(""); }
    else if (e.key === "Backspace" && q === "" && value.length) { onChange(value.slice(0, -1)); }
  };

  let flatIdx = -1; // running index across groups so keyboard active maps to render
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width }}>
      {label && <Label>{label}</Label>}
      <div ref={anchorRef}
        onClick={() => !disabled && (setOpen(true), inputRef.current?.focus())}
        style={{
          minHeight: SZ.min, padding: SZ.pad, cursor: disabled ? "not-allowed" : "text",
          display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center",
          background: disabled ? "var(--bg-muted)" : "var(--bg-surface)",
          border: `1px solid ${error ? "var(--border-danger)" : open ? "var(--border-focus)" : "var(--border-default)"}`,
          borderRadius: "var(--radius-md)",
          boxShadow: open ? (error ? "var(--ring-danger)" : "var(--ring-focus)") : "none",
          transition: "border-color var(--dur-fast), box-shadow var(--dur-fast)",
        }}>
        {selected.length === 0 && <span style={{ fontSize: SZ.fs, color: "var(--fg-subtle)", padding: "2px 4px" }}>{placeholder}</span>}
        {selected.map(o => (
          <span key={o.value} style={{
            display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 5px 3px 9px",
            background: "var(--bg-brand-subtle)", color: "var(--fg-brand)", borderRadius: "var(--radius-pill)",
            fontSize: SZ.chip, fontWeight: 600,
          }}>
            {o.label}
            <button onClick={(e) => { e.stopPropagation(); toggle(o.value); }} aria-label={`Remove ${o.label}`} tabIndex={-1}
              style={{ appearance: "none", border: 0, background: "transparent", color: "inherit", cursor: "pointer", display: "inline-flex", padding: 0, opacity: 0.7 }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.7}>
              <Icon name="x" size={13} />
            </button>
          </span>
        ))}
        {/* inline keyboard entry point — lets Tab land here and arrows open the list */}
        <input ref={inputRef} value={q} disabled={disabled}
          onChange={e => { setQ(e.target.value); if (!open) setOpen(true); }}
          onKeyDown={onKey} onFocus={() => setOpen(true)}
          role="combobox" aria-expanded={open} aria-controls={lid.current}
          aria-activedescendant={open && flat[active] ? `${lid.current}-${flat[active].value}` : undefined}
          aria-label={label || placeholder}
          style={{ flex: 1, minWidth: 60, background: "transparent", border: 0, outline: 0, fontFamily: "inherit", fontSize: SZ.fs, color: "var(--fg-default)", padding: "2px 2px" }} />
        {clearable && value.length > 0 && !disabled && (
          <button onClick={(e) => { e.stopPropagation(); onChange([]); }} aria-label="Clear all" tabIndex={-1}
            style={{ appearance: "none", border: 0, background: "transparent", color: "var(--fg-muted)", cursor: "pointer", display: "inline-flex", padding: 0 }}>
            <Icon name="x" size={15} />
          </button>
        )}
        <span style={{ color: "var(--fg-muted)", display: "inline-flex", paddingLeft: 2 }}><Icon name="chevron-down" size={16} /></span>
      </div>
      {(hint || error) && <span style={{ fontSize: 12, color: error ? "var(--fg-danger)" : "var(--fg-muted)" }}>{error || hint}</span>}

      {open && (
        <Portal>
          <div ref={popRef} style={{
            position: "fixed", top: pos.top, left: pos.left, width: pos.width, maxHeight: 300, zIndex: "var(--z-popover)",
            background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-lg)", display: "flex", flexDirection: "column", overflow: "hidden",
          }}>
            {max != null && <div style={{ fontSize: 11.5, color: "var(--fg-subtle)", padding: "8px 12px 4px" }}>{value.length} of {max} selected</div>}
            <div ref={listRef} id={lid.current} role="listbox" aria-multiselectable="true" style={{ flex: 1, overflow: "auto", padding: 4 }}>
              {flat.length === 0 && <div style={{ padding: "14px 12px", fontSize: 13, color: "var(--fg-muted)", textAlign: "center" }}>No matches</div>}
              {groups.map((grp, gi) => (
                <div key={gi}>
                  {grp.name && <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--fg-subtle)", padding: "8px 10px 4px" }}>{grp.name}</div>}
                  {grp.items.map(o => {
                    flatIdx += 1; const idx = flatIdx;
                    const sel = value.includes(o.value);
                    const blocked = !sel && atMax;
                    const isActive = idx === active;
                    return (
                      <button key={o.value} id={`${lid.current}-${o.value}`} role="option" aria-selected={sel}
                        ref={el => optRefs.current[idx] = el}
                        disabled={blocked} onClick={() => toggle(o.value)} onMouseEnter={() => setActive(idx)}
                        style={{
                          appearance: "none", border: 0, width: "100%", cursor: blocked ? "not-allowed" : "pointer",
                          background: isActive ? "var(--bg-muted)" : sel ? "var(--bg-brand-subtle)" : "transparent", opacity: blocked ? 0.45 : 1,
                          color: sel ? "var(--fg-brand)" : "var(--fg-default)", padding: "7px 10px", borderRadius: "var(--radius-sm)",
                          display: "flex", alignItems: "center", gap: 10, fontFamily: "inherit", fontSize: 13.5, textAlign: "left",
                        }}>
                        <span style={{
                          width: 16, height: 16, borderRadius: "var(--radius-sm)", flexShrink: 0,
                          border: `1.5px solid ${sel ? "var(--bg-brand)" : "var(--border-default)"}`,
                          background: sel ? "var(--bg-brand)" : "transparent",
                          display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--fg-on-brand)",
                        }}>{sel && <Icon name="check" size={12} />}</span>
                        <span style={{ flex: 1 }}>{o.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   TYPEAHEAD — async autocomplete. onSearch(query) -> Promise<[{value,label,sub?}]>
   Debounced, with loading + empty states and keyboard nav (↑/↓/Enter/Esc).
   ───────────────────────────────────────────────────────────────────────── */
function Typeahead({ label, hint, error, placeholder = "Search…", onSearch, onSelect, debounce = 250, minChars = 1, width = "100%", renderItem }) {
  const [q, setQ] = useG("");
  const [open, setOpen] = useG(false);
  const [loading, setLoading] = useG(false);
  const [failed, setFailed] = useG(false);
  const [results, setResults] = useG([]);
  const [active, setActive] = useG(0);
  const [pos, setPos] = useG({ top: 0, left: 0, width: 0 });
  const anchorRef = useGR(null);
  const popRef = useGR(null);
  const seq = useGR(0);

  useGL(() => {
    if (!open || !anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 4, left: r.left, width: r.width });
  }, [open, results]);

  useGE(() => {
    const term = q.trim();
    if (term.length < minChars) { setResults([]); setLoading(false); setOpen(false); return; }
    setLoading(true); setOpen(true); setFailed(false);
    const my = ++seq.current;
    const t = setTimeout(async () => {
      try {
        const r = await onSearch(term);
        if (my === seq.current) { setResults(r || []); setActive(0); }
      } catch { if (my === seq.current) { setResults([]); setFailed(true); } }
      finally { if (my === seq.current) setLoading(false); }
    }, debounce);
    return () => clearTimeout(t);
  }, [q]);

  useGE(() => {
    if (!open) return;
    const click = (e) => { if (anchorRef.current?.contains(e.target) || popRef.current?.contains(e.target)) return; setOpen(false); };
    document.addEventListener("mousedown", click);
    return () => document.removeEventListener("mousedown", click);
  }, [open]);

  const choose = (r) => { setQ(r.label); setOpen(false); onSelect && onSelect(r); };
  // highlight the matched substring — token-colored, so match is not by weight alone
  const highlight = (text) => {
    const i = text.toLowerCase().indexOf(q.trim().toLowerCase());
    if (i < 0 || !q.trim()) return text;
    return [<span key="a">{text.slice(0, i)}</span>,
      <mark key="b" style={{ background: "transparent", color: "var(--fg-brand)", fontWeight: 700 }}>{text.slice(i, i + q.trim().length)}</mark>,
      <span key="c">{text.slice(i + q.trim().length)}</span>];
  };
  const onKey = (e) => {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && results[active]) { e.preventDefault(); choose(results[active]); }
    else if (e.key === "Escape") setOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width }}>
      {label && <Label>{label}</Label>}
      <div ref={anchorRef} style={{
        height: 38, padding: "0 12px", display: "flex", alignItems: "center", gap: 8,
        background: "var(--bg-surface)",
        border: `1px solid ${error ? "var(--border-danger)" : open ? "var(--border-focus)" : "var(--border-default)"}`,
        borderRadius: "var(--radius-md)", boxShadow: open ? "var(--ring-focus)" : "none",
        transition: "border-color var(--dur-fast), box-shadow var(--dur-fast)",
      }}>
        <Icon name="search" size={15} color="var(--fg-muted)" />
        <input value={q} placeholder={placeholder} onChange={e => setQ(e.target.value)} onKeyDown={onKey}
          onFocus={() => results.length && setOpen(true)}
          style={{ flex: 1, background: "transparent", border: 0, outline: 0, fontFamily: "inherit", fontSize: 14, color: "var(--fg-default)" }} />
        {loading && <Icon name="loader" size={15} color="var(--fg-muted)" style={{ animation: "g-spin 0.9s linear infinite" }} />}
        {!loading && q && <button onClick={() => { setQ(""); setResults([]); setOpen(false); }} style={{ appearance: "none", border: 0, background: "transparent", color: "var(--fg-muted)", cursor: "pointer", display: "inline-flex", padding: 0 }}><Icon name="x" size={14} /></button>}
      </div>
      {hint && <span style={{ fontSize: 12, color: error ? "var(--fg-danger)" : "var(--fg-muted)" }}>{error || hint}</span>}

      {open && (
        <Portal>
          <div ref={popRef} style={{
            position: "fixed", top: pos.top, left: pos.left, width: pos.width, maxHeight: 320, zIndex: "var(--z-popover)",
            background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-lg)", overflow: "auto", padding: 4,
          }}>
            {loading && results.length === 0 && <div style={{ padding: "14px 12px", fontSize: 13, color: "var(--fg-muted)", display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}><Icon name="loader" size={14} style={{ animation: "g-spin 0.9s linear infinite" }} /> Searching…</div>}
            {!loading && failed && <div style={{ padding: "14px 12px", fontSize: 13, color: "var(--fg-danger)", display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}><Icon name="alert-circle" size={14} /> Error loading results</div>}
            {!loading && !failed && results.length === 0 && <div style={{ padding: "14px 12px", fontSize: 13, color: "var(--fg-muted)", textAlign: "center" }}>No results for “{q}”</div>}
            {!failed && results.map((r, i) => (
              <button key={r.value} onMouseEnter={() => setActive(i)} onClick={() => choose(r)}
                role="option" aria-selected={i === active}
                style={{
                  appearance: "none", border: 0, width: "100%", cursor: "pointer",
                  background: i === active ? "var(--bg-muted)" : "transparent", color: "var(--fg-default)",
                  padding: "8px 10px", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: 10,
                  fontFamily: "inherit", fontSize: 13.5, textAlign: "left",
                }}>
                {renderItem ? renderItem(r, { highlight, active: i === active }) : <>
                  {r.avatar !== undefined
                    ? <Avatar src={typeof r.avatar === "string" ? r.avatar : undefined} name={r.label} size={28} />
                    : r.icon && <Icon name={r.icon} size={15} color="var(--fg-muted)" />}
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 550, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{highlight(r.label)}</div>
                    {r.sub && <div style={{ fontSize: 11.5, color: "var(--fg-muted)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.sub}</div>}
                  </span>
                </>}
              </button>
            ))}
          </div>
        </Portal>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   DATE RANGE PICKER — dual-month range calendar + quick presets
   <DateRangePicker value={{start,end}} onChange={r=>…} />
   ───────────────────────────────────────────────────────────────────────── */
function DateRangePicker({ value, onChange, label, placeholder = "Pick a range", disabled, hint }) {
  const [open, setOpen] = useG(false);
  const [pos, setPos] = useG({ top: 0, left: 0 });
  const [view, setView] = useG(() => { const d = value?.start ? new Date(value.start) : new Date(); return { year: d.getFullYear(), month: d.getMonth() }; });
  const [hover, setHover] = useG(null);
  const anchorRef = useGR(null);
  const popRef = useGR(null);
  const range = value || { start: null, end: null };

  useGL(() => { if (!open || !anchorRef.current) return; const r = anchorRef.current.getBoundingClientRect(); setPos({ top: r.bottom + 6, left: r.left }); }, [open]);
  useGE(() => {
    if (!open) return;
    const click = (e) => { if (anchorRef.current?.contains(e.target) || popRef.current?.contains(e.target)) return; setOpen(false); };
    const esc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", click); window.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", click); window.removeEventListener("keydown", esc); };
  }, [open]);

  const sameDay = (a, b) => a && b && a.toDateString() === b.toDateString();
  const monthGrid = (year, month) => {
    const first = new Date(year, month, 1);
    const start = new Date(year, month, 1 - first.getDay());
    return Array.from({ length: 42 }).map((_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  };

  const pick = (d) => {
    if (!range.start || (range.start && range.end)) { onChange({ start: d, end: null }); }
    else { if (d < range.start) onChange({ start: d, end: range.start }); else onChange({ start: range.start, end: d }); }
  };

  const inRange = (d) => {
    const end = range.end || hover;
    if (!range.start || !end) return false;
    const lo = range.start < end ? range.start : end, hi = range.start < end ? end : range.start;
    return d > lo && d < hi;
  };

  const presets = [
    { label: "Today", fn: () => { const t = new Date(); return { start: t, end: t }; } },
    { label: "Last 7 days", fn: () => { const e = new Date(); const s = new Date(); s.setDate(e.getDate() - 6); return { start: s, end: e }; } },
    { label: "Last 30 days", fn: () => { const e = new Date(); const s = new Date(); s.setDate(e.getDate() - 29); return { start: s, end: e }; } },
    { label: "Month to date", fn: () => { const e = new Date(); return { start: new Date(e.getFullYear(), e.getMonth(), 1), end: e }; } },
    { label: "Last month", fn: () => { const n = new Date(); const s = new Date(n.getFullYear(), n.getMonth() - 1, 1); const e = new Date(n.getFullYear(), n.getMonth(), 0); return { start: s, end: e }; } },
  ];

  const fmt = (d) => d ? d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "";
  const display = range.start ? (range.end ? `${fmt(range.start)} — ${fmt(range.end)}` : `${fmt(range.start)} — …`) : placeholder;
  const shift = (n) => setView(v => { const d = new Date(v.year, v.month + n); return { year: d.getFullYear(), month: d.getMonth() }; });

  const renderMonth = (year, month) => {
    const label = new Date(year, month).toLocaleDateString(undefined, { month: "long", year: "numeric" });
    const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    return (
      <div style={{ width: 248 }}>
        <div style={{ textAlign: "center", fontWeight: 600, fontSize: 13, color: "var(--fg-default)", marginBottom: 8, textTransform: "capitalize" }}>{label}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1 }}>
          {dayNames.map((n, i) => <div key={i} style={{ textAlign: "center", fontSize: 10.5, fontWeight: 600, color: "var(--fg-subtle)", padding: "3px 0" }}>{n}</div>)}
          {monthGrid(year, month).map((d, i) => {
            const out = d.getMonth() !== month;
            const isStart = sameDay(d, range.start), isEnd = sameDay(d, range.end);
            const isEdge = isStart || isEnd;
            const between = inRange(d);
            return (
              <button key={i} onClick={() => pick(new Date(d))} onMouseEnter={() => setHover(new Date(d))}
                style={{
                  appearance: "none", border: 0, height: 30, fontFamily: "inherit", fontSize: 12, cursor: "pointer",
                  background: isEdge ? "var(--bg-brand)" : between ? "var(--bg-brand-subtle)" : "transparent",
                  color: isEdge ? "var(--fg-on-brand)" : out ? "var(--fg-disabled)" : "var(--fg-default)",
                  fontWeight: isEdge ? 600 : 500,
                  borderRadius: between && !isEdge ? 0 : "var(--radius-sm)",
                  transition: "background var(--dur-fast)",
                }}
                onMouseOver={e => !isEdge && !between && (e.currentTarget.style.background = "var(--bg-muted)")}
                onMouseOut={e => !isEdge && !between && (e.currentTarget.style.background = "transparent")}>
                {d.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const nextView = view.month === 11 ? { year: view.year + 1, month: 0 } : { year: view.year, month: view.month + 1 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <Label>{label}</Label>}
      <button ref={anchorRef} type="button" disabled={disabled} onClick={() => !disabled && setOpen(o => !o)}
        style={{
          appearance: "none", height: 38, padding: "0 12px", minWidth: 260,
          background: disabled ? "var(--bg-muted)" : "var(--bg-surface)",
          color: range.start ? "var(--fg-default)" : "var(--fg-subtle)",
          border: `1px solid ${open ? "var(--border-focus)" : "var(--border-default)"}`,
          borderRadius: "var(--radius-md)", boxShadow: open ? "var(--ring-focus)" : "none",
          display: "flex", alignItems: "center", gap: 8, cursor: disabled ? "not-allowed" : "pointer",
          fontFamily: "inherit", fontSize: 14, textAlign: "left",
        }}>
        <Icon name="calendar-range" size={15} color="var(--fg-muted)" />
        <span style={{ flex: 1 }}>{display}</span>
        {range.start && !disabled && <span onClick={(e) => { e.stopPropagation(); onChange({ start: null, end: null }); }} style={{ color: "var(--fg-muted)", display: "inline-flex" }}><Icon name="x" size={14} /></span>}
      </button>
      {hint && <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>{hint}</span>}

      {open && (
        <Portal>
          <div ref={popRef} onMouseLeave={() => setHover(null)} style={{
            position: "fixed", top: pos.top, left: pos.left, zIndex: "var(--z-popover)",
            background: "var(--bg-raised)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-xl)", display: "flex", overflow: "hidden",
          }}>
            <div style={{ width: 150, borderRight: "1px solid var(--border-subtle)", padding: 8, display: "flex", flexDirection: "column", gap: 2, background: "var(--bg-subtle)" }}>
              {presets.map(p => (
                <button key={p.label} onClick={() => { const r = p.fn(); onChange(r); setView({ year: r.start.getFullYear(), month: r.start.getMonth() }); }}
                  style={{ appearance: "none", border: 0, background: "transparent", cursor: "pointer", textAlign: "left", padding: "7px 10px", borderRadius: "var(--radius-sm)", fontFamily: "inherit", fontSize: 13, color: "var(--fg-default)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--bg-muted)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  {p.label}
                </button>
              ))}
            </div>
            <div style={{ padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <IconButton icon="chevron-left" variant="ghost" size="sm" ariaLabel="Previous month" onClick={() => shift(-1)} />
                <IconButton icon="chevron-right" variant="ghost" size="sm" ariaLabel="Next month" onClick={() => shift(1)} />
              </div>
              <div style={{ display: "flex", gap: 20 }}>
                {renderMonth(view.year, view.month)}
                {renderMonth(nextView.year, nextView.month)}
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   FORM ERROR SUMMARY — aggregates field errors, links/focuses each field
   <FormErrorSummary errors={[{id, field, message}]} title="…" />
   Anchors to inputs by id; role=alert so SR announces it.
   ───────────────────────────────────────────────────────────────────────── */
function FormErrorSummary({ errors = [], title = "There’s a problem with your submission" }) {
  const ref = useGR(null);
  useGE(() => { if (errors.length && ref.current) ref.current.focus(); }, [errors.length]);
  if (!errors.length) return null;
  const go = (id) => {
    const el = document.getElementById(id);
    if (el) { el.focus({ preventScroll: false }); }
  };
  return (
    <div ref={ref} role="alert" tabIndex={-1} style={{
      border: "1px solid var(--border-danger)", background: "var(--bg-danger-subtle)",
      borderRadius: "var(--radius-md)", padding: "14px 16px", outline: "none",
      display: "flex", gap: 12,
    }}>
      <span style={{ color: "var(--fg-danger)", display: "inline-flex", flexShrink: 0, marginTop: 1 }}><Icon name="alert-octagon" size={18} /></span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fg-danger)" }}>{title}</div>
        <div style={{ fontSize: 13, color: "var(--fg-default)", marginTop: 2 }}>
          {errors.length} {errors.length === 1 ? "field needs" : "fields need"} your attention:
        </div>
        <ul style={{ margin: "8px 0 0", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
          {errors.map((e, i) => (
            <li key={i} style={{ fontSize: 13, color: "var(--fg-danger)" }}>
              <a href={`#${e.id}`} onClick={(ev) => { ev.preventDefault(); go(e.id); }}
                style={{ color: "var(--fg-danger)", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 2, cursor: "pointer" }}>
                {e.field}
              </a>
              {e.message ? <span style={{ color: "var(--fg-default)", fontWeight: 400 }}> — {e.message}</span> : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// keyframes for spinners (scoped, injected once)
if (typeof document !== "undefined" && !document.getElementById("g-gaps-anim")) {
  const s = document.createElement("style"); s.id = "g-gaps-anim";
  s.textContent = "@keyframes g-spin{to{transform:rotate(360deg)}}";
  document.head.appendChild(s);
}

Object.assign(window, { FileUpload, MultiSelect, Typeahead, DateRangePicker, FormErrorSummary });
