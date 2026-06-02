// White-label gap-closers, batch 2 — AsyncField · AvatarUpload · CsvImport.
// Built on the semantic token layer + lib/ primitives (Icon, Button, IconButton, Avatar, Label, Spinner).
// AsyncField  → field-level async validation (Checking… → available / taken) for the Form-validation pattern.
// AvatarUpload → circular single-image upload with live preview (profile-picture mode).
// CsvImport    → drop a .csv, parse, preview the first rows, confirm before import.

const { useState: useF, useEffect: useFE, useRef: useFR, useCallback: useFC } = React;

/* ─────────────────────────────────────────────────────────────────────────
   ASYNC FIELD — debounced field-level validation with live status.
   <AsyncField label="Username" validate={async v => ({ ok, message })} />
   States: idle → checking (spinner + "Checking…") → success | error.
   ───────────────────────────────────────────────────────────────────────── */
function AsyncField({
  label, hint, placeholder, required, leading, validate,
  debounce = 450, minChars = 2, size = "md", prefix,
}) {
  const [val, setVal] = useF("");
  const [state, setState] = useF("idle"); // idle | checking | success | error
  const [msg, setMsg] = useF("");
  const seq = useFR(0);
  const idRef = useFR("af_" + Math.random().toString(36).slice(2, 9));

  const SZ = { sm: "var(--ctl-h-sm)", md: "var(--ctl-h-md)", lg: "var(--ctl-h-lg)" }[size];
  const FS = { sm: "var(--ctl-fs-sm)", md: "var(--ctl-fs-md)", lg: "var(--ctl-fs-lg)" }[size];

  useFE(() => {
    const v = val.trim();
    if (v.length < minChars) { setState("idle"); setMsg(""); return; }
    setState("checking"); setMsg("Checking availability…");
    const my = ++seq.current;
    const t = setTimeout(async () => {
      try {
        const r = await validate(v);
        if (my !== seq.current) return;
        setState(r.ok ? "success" : "error");
        setMsg(r.message || (r.ok ? "Available" : "Not available"));
      } catch {
        if (my === seq.current) { setState("error"); setMsg("Couldn’t verify — try again"); }
      }
    }, debounce);
    return () => clearTimeout(t);
  }, [val]);

  const [focus, setFocus] = useF(false);
  const border = state === "error" ? "var(--border-danger)"
    : state === "success" ? "var(--border-success)"
    : focus ? "var(--border-focus)" : "var(--border-default)";
  const ring = state === "error" ? "var(--ring-danger)" : "var(--ring-focus)";
  const msgColor = state === "error" ? "var(--fg-danger)" : state === "success" ? "var(--fg-success)" : "var(--fg-muted)";

  return (
    <label htmlFor={idRef.current} style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      {label && <span style={{ fontSize: 13, fontWeight: 500, color: "var(--fg-default)", lineHeight: 1.3 }}>{label}{required && <span style={{ color: "var(--fg-danger)", marginLeft: 2 }}>*</span>}</span>}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, height: SZ, padding: "0 12px",
        background: "var(--bg-surface)", border: `1px solid ${border}`, borderRadius: "var(--radius-md)",
        boxShadow: focus ? ring : (state === "success" || state === "error" ? "none" : "var(--input-shadow)"),
        transition: "border-color var(--dur-fast), box-shadow var(--dur-fast)",
      }}>
        {leading && <Icon name={leading} size={16} color="var(--fg-muted)" />}
        {prefix && <span style={{ fontSize: FS, color: "var(--fg-subtle)", whiteSpace: "nowrap" }}>{prefix}</span>}
        <input id={idRef.current} value={val} placeholder={placeholder} required={required}
          aria-invalid={state === "error" || undefined} aria-describedby={idRef.current + "_m"}
          onChange={e => setVal(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: "transparent", fontFamily: "inherit", fontSize: FS, color: "var(--fg-default)" }} />
        {state === "checking" && <Icon name="loader" size={16} color="var(--fg-muted)" style={{ animation: "g-spin 0.9s linear infinite" }} />}
        {state === "success" && <Icon name="check-circle" size={16} color="var(--fg-success)" />}
        {state === "error" && <Icon name="alert-circle" size={16} color="var(--fg-danger)" />}
      </div>
      <span id={idRef.current + "_m"} role="status" aria-live="polite"
        style={{ fontSize: 12, lineHeight: 1.4, color: msgColor, minHeight: 16 }}>
        {msg || hint || ""}
      </span>
    </label>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   AVATAR UPLOAD — circular single-image upload with live preview.
   <AvatarUpload size={96} onChange={file => …} />
   ───────────────────────────────────────────────────────────────────────── */
function AvatarUpload({ label, hint, size = 96, name = "", onChange }) {
  const [src, setSrc] = useF(null);
  const [drag, setDrag] = useF(false);
  const inputRef = useFR(null);

  const onFile = useFC((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = e => setSrc(e.target.result);
    reader.readAsDataURL(file);
    onChange && onChange(file);
  }, [onChange]);

  const clear = (e) => { e.stopPropagation(); setSrc(null); onChange && onChange(null); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {label && <Label>{label}</Label>}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          role="button" tabIndex={0} aria-label="Upload profile picture. Drag and drop supported."
          onClick={() => inputRef.current?.click()}
          onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click(); } }}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files[0]); }}
          onFocus={e => e.currentTarget.style.boxShadow = "var(--ring-focus)"}
          onBlur={e => e.currentTarget.style.boxShadow = "none"}
          style={{
            position: "relative", width: size, height: size, flexShrink: 0, cursor: "pointer",
            borderRadius: "var(--radius-pill)", overflow: "hidden", outline: "none",
            border: `1.5px dashed ${drag ? "var(--border-brand)" : "var(--border-default)"}`,
            background: src ? "transparent" : drag ? "var(--bg-brand-subtle)" : "var(--bg-subtle)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "border-color var(--dur-fast), background var(--dur-fast), box-shadow var(--dur-fast)",
          }}>
          {src
            ? <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: "var(--fg-muted)" }}>
                <Icon name="camera" size={Math.round(size * 0.26)} />
                <span style={{ fontSize: 11, fontWeight: 600 }}>Add photo</span>
              </span>}
          {src && (
            <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 6, background: "linear-gradient(to top, color-mix(in oklab, var(--bg-inverse) 55%, transparent), transparent 55%)", color: "var(--fg-inverse)", fontSize: 10.5, fontWeight: 700, letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", opacity: 0 }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
              Change
            </span>
          )}
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={e => { onFile(e.target.files[0]); e.target.value = ""; }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="outline" size="sm" leading="upload" onClick={() => inputRef.current?.click()}>{src ? "Replace" : "Upload"}</Button>
            {src && <Button variant="ghost" size="sm" leading="trash-2" onClick={clear}>Remove</Button>}
          </div>
          {hint && <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>{hint}</span>}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   CSV IMPORT — drop a .csv, parse, preview rows, confirm before import.
   <CsvImport maxPreview={5} onConfirm={rows => …} />
   ───────────────────────────────────────────────────────────────────────── */
function parseCSV(text) {
  const out = [];
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter(l => l.length > 0);
  for (const line of lines) {
    const cells = []; let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQ) { if (ch === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else inQ = false; } else cur += ch; }
      else if (ch === '"') inQ = true;
      else if (ch === ",") { cells.push(cur); cur = ""; }
      else cur += ch;
    }
    cells.push(cur); out.push(cells);
  }
  return out;
}

function CsvImport({ label, hint, maxPreview = 5, hasHeader = true, onConfirm }) {
  const [drag, setDrag] = useF(false);
  const [state, setState] = useF("idle"); // idle | error | preview
  const [rows, setRows] = useF([]);
  const [fileName, setFileName] = useF("");
  const [err, setErr] = useF("");
  const inputRef = useFR(null);

  const handle = useFC((file) => {
    if (!file) return;
    if (!/\.csv$/i.test(file.name) && file.type !== "text/csv") { setState("error"); setErr("That isn’t a .csv file"); return; }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = e => {
      const parsed = parseCSV(e.target.result);
      if (!parsed.length) { setState("error"); setErr("The file looks empty"); return; }
      setRows(parsed); setState("preview"); setErr("");
    };
    reader.onerror = () => { setState("error"); setErr("Couldn’t read the file"); };
    reader.readAsText(file);
  }, []);

  const reset = () => { setState("idle"); setRows([]); setFileName(""); setErr(""); };

  const header = hasHeader ? rows[0] : rows[0]?.map((_, i) => `Column ${i + 1}`);
  const body = hasHeader ? rows.slice(1) : rows;
  const preview = body.slice(0, maxPreview);

  if (state === "preview") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {label && <Label>{label}</Label>}
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--fg-default)" }}>
          <Icon name="file-text" size={16} color="var(--fg-muted)" />
          <span style={{ fontWeight: 600 }}>{fileName}</span>
          <span style={{ color: "var(--fg-subtle)" }}>· {body.length} rows · {header.length} columns</span>
        </div>
        <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr>{header.map((h, i) => <th key={i} style={{ textAlign: "left", padding: "8px 12px", background: "var(--bg-subtle)", borderBottom: "1px solid var(--border-subtle)", color: "var(--fg-muted)", fontWeight: 600, whiteSpace: "nowrap", textTransform: "uppercase", fontSize: 11, letterSpacing: "var(--tracking-wide)" }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {preview.map((r, ri) => (
                  <tr key={ri}>{header.map((_, ci) => <td key={ci} style={{ padding: "8px 12px", borderBottom: ri < preview.length - 1 ? "1px solid var(--border-subtle)" : 0, color: "var(--fg-default)", whiteSpace: "nowrap" }}>{r[ci] ?? ""}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
          {body.length > maxPreview && <div style={{ padding: "7px 12px", fontSize: 12, color: "var(--fg-subtle)", background: "var(--bg-subtle)", borderTop: "1px solid var(--border-subtle)" }}>+ {body.length - maxPreview} more rows</div>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="primary" size="sm" leading="check" onClick={() => onConfirm && onConfirm({ header, rows: body })}>Import {body.length} rows</Button>
          <Button variant="ghost" size="sm" onClick={reset}>Choose another file</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {label && <Label>{label}</Label>}
      <div
        role="button" tabIndex={0} aria-label="CSV import. Drag and drop a .csv file, or press Enter to browse."
        onClick={() => inputRef.current?.click()}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click(); } }}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}
        onFocus={e => e.currentTarget.style.boxShadow = "var(--ring-focus)"}
        onBlur={e => e.currentTarget.style.boxShadow = "none"}
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "26px 20px",
          cursor: "pointer", textAlign: "center", outline: "none",
          border: `1.5px dashed ${state === "error" ? "var(--border-danger)" : drag ? "var(--border-brand)" : "var(--border-default)"}`,
          background: drag ? "var(--bg-brand-subtle)" : "var(--bg-subtle)", borderRadius: "var(--radius-lg)",
          transition: "background var(--dur-fast), border-color var(--dur-fast), box-shadow var(--dur-fast)",
        }}>
        <span style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", display: "inline-flex", alignItems: "center", justifyContent: "center", background: state === "error" ? "var(--bg-danger-subtle)" : "var(--bg-brand-subtle)", color: state === "error" ? "var(--fg-danger)" : "var(--fg-brand)" }}>
          <Icon name={state === "error" ? "alert-circle" : "file-up"} size={20} />
        </span>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg-strong)", width: "100%" }}>
          {drag ? "Release to import" : <>Drop a CSV here, or <span style={{ color: "var(--fg-brand)" }}>browse</span></>}
        </div>
        <div style={{ fontSize: 12, color: state === "error" ? "var(--fg-danger)" : "var(--fg-subtle)" }}>
          {state === "error" ? err : ".csv · first row treated as headers"}
        </div>
        <input ref={inputRef} type="file" accept=".csv,text/csv" hidden onChange={e => { handle(e.target.files[0]); e.target.value = ""; }} />
      </div>
      {hint && <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>{hint}</span>}
    </div>
  );
}

Object.assign(window, { AsyncField, AvatarUpload, CsvImport });
