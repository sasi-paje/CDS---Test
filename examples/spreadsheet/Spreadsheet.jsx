// Spreadsheet UI kit — an editable grid built from lib/ primitives + system tokens.
// A1 column/row headers · click-to-edit cells · keyboard navigation · range selection ·
// frozen header row + first column · formatting toolbar (bold/italic/align/number format) ·
// typed cells (text/number/date/dropdown/checkbox) · multiple sheets · density variation.
const { useState: useSh, useRef: useShRef, useEffect: useShEffect, useCallback: useShCb } = React;

const STAGES = ["Lead", "Qualified", "Proposal", "Won", "Lost"];
const stageColor = { Lead: "neutral", Qualified: "info", Proposal: "warning", Won: "success", Lost: "danger" };

const SHEETS = {
  Pipeline: {
    columns: [
      { key: "account", name: "Account", type: "text", width: 168 },
      { key: "owner", name: "Owner", type: "text", width: 140 },
      { key: "stage", name: "Stage", type: "dropdown", options: STAGES, width: 130 },
      { key: "value", name: "Value", type: "number", format: "currency", width: 120, align: "right" },
      { key: "prob", name: "Win %", type: "number", format: "percent", width: 86, align: "right" },
      { key: "close", name: "Close date", type: "date", width: 130 },
      { key: "active", name: "Active", type: "checkbox", width: 74, align: "center" },
    ],
    rows: [
      { account: "Acme Corp", owner: "Bianca Klein", stage: "Proposal", value: 24800, prob: 60, close: "2026-06-15", active: true },
      { account: "Globex", owner: "Marcus Lyle", stage: "Qualified", value: 15600, prob: 40, close: "2026-07-02", active: true },
      { account: "Initech", owner: "Priya Anand", stage: "Won", value: 11200, prob: 100, close: "2026-05-20", active: false },
      { account: "Umbrella", owner: "Dev Tran", stage: "Lead", value: 9800, prob: 20, close: "2026-08-11", active: true },
      { account: "Soylent", owner: "Dana Reyes", stage: "Proposal", value: 7300, prob: 55, close: "2026-06-28", active: true },
      { account: "Hooli", owner: "Bianca Klein", stage: "Lost", value: 3200, prob: 0, close: "2026-04-30", active: false },
      { account: "Stark Industries", owner: "Marcus Lyle", stage: "Qualified", value: 42000, prob: 35, close: "2026-09-01", active: true },
      { account: "Wayne Enterprises", owner: "Priya Anand", stage: "Lead", value: 18500, prob: 15, close: "2026-08-22", active: true },
    ],
  },
  Headcount: {
    columns: [
      { key: "team", name: "Team", type: "text", width: 150 },
      { key: "lead", name: "Lead", type: "text", width: 140 },
      { key: "dept", name: "Department", type: "dropdown", options: ["Engineering", "Sales", "Ops", "Design"], width: 140 },
      { key: "headcount", name: "Headcount", type: "number", width: 100, align: "right" },
      { key: "budget", name: "Budget", type: "number", format: "currency", width: 120, align: "right" },
      { key: "review", name: "Next review", type: "date", width: 130 },
      { key: "hiring", name: "Hiring", type: "checkbox", width: 74, align: "center" },
    ],
    rows: [
      { team: "Platform", lead: "Dev Tran", dept: "Engineering", headcount: 12, budget: 184000, review: "2026-07-01", hiring: true },
      { team: "Growth", lead: "Marcus Lyle", dept: "Sales", headcount: 8, budget: 96000, review: "2026-06-15", hiring: true },
      { team: "Design Systems", lead: "Dana Reyes", dept: "Design", headcount: 5, budget: 72000, review: "2026-08-01", hiring: false },
      { team: "Revenue Ops", lead: "Priya Anand", dept: "Ops", headcount: 6, budget: 88000, review: "2026-07-20", hiring: true },
      { team: "Frontend", lead: "Bianca Klein", dept: "Engineering", headcount: 9, budget: 142000, review: "2026-09-10", hiring: false },
    ],
  },
};
const TOTAL_ROWS = 14; // pad grid with blank rows
const colLetter = (i) => String.fromCharCode(65 + i);

function buildGrid(def) {
  const rows = [];
  for (let r = 0; r < TOTAL_ROWS; r++) {
    const src = def.rows[r] || {};
    rows.push(def.columns.map(c => (src[c.key] !== undefined ? src[c.key] : (c.type === "checkbox" ? false : ""))));
  }
  return rows;
}

function Spreadsheet() {
  const { Icon, IconButton, Badge, Checkbox, Tooltip, DropdownMenu } = window;
  const [sheet, setSheet] = useSh("Pipeline");
  const [grids, setGrids] = useSh(() => ({ Pipeline: buildGrid(SHEETS.Pipeline), Headcount: buildGrid(SHEETS.Headcount) }));
  const [fmt, setFmt] = useSh({});            // key `sheet:r:c` -> {bold, italic, align}
  const [sel, setSel] = useSh({ r: 0, c: 0, ar: 0, ac: 0 }); // active r,c + anchor ar,ac
  const [editing, setEditing] = useSh(null);  // {r,c} | null
  const [editVal, setEditVal] = useSh("");
  const [density, setDensity] = useSh("comfortable");
  const dragging = useShRef(false);
  const gridRef = useShRef(null);
  const editRef = useShRef(null);

  const def = SHEETS[sheet];
  const columns = def.columns;
  const grid = grids[sheet];
  const nCols = columns.length;
  const rowH = density === "compact" ? 28 : 34;

  const r1 = Math.min(sel.r, sel.ar), r2 = Math.max(sel.r, sel.ar);
  const c1 = Math.min(sel.c, sel.ac), c2 = Math.max(sel.c, sel.ac);
  const inRange = (r, c) => r >= r1 && r <= r2 && c >= c1 && c <= c2;
  const isActive = (r, c) => sel.r === r && sel.c === c;
  const fkey = (r, c) => `${sheet}:${r}:${c}`;
  const cellFmt = (r, c) => fmt[fkey(r, c)] || {};

  useShEffect(() => { if (editing && editRef.current) { editRef.current.focus(); editRef.current.select?.(); } }, [editing]);

  const setCell = (r, c, v) => setGrids(g => {
    const ng = g[sheet].map(row => row.slice());
    ng[r][c] = v;
    return { ...g, [sheet]: ng };
  });

  const commitEdit = (move) => {
    if (editing) {
      const col = columns[editing.c];
      let v = editVal;
      if (col.type === "number") v = v === "" ? "" : Number(v.replace(/[^0-9.-]/g, "")) || 0;
      setCell(editing.r, editing.c, v);
      setEditing(null);
    }
    if (move) moveActive(move.dr, move.dc);
  };

  const startEdit = (r, c, initial) => {
    const col = columns[c];
    if (col.type === "checkbox") { setCell(r, c, !grid[r][c]); return; }
    setEditing({ r, c });
    setEditVal(initial != null ? initial : (grid[r][c] === "" ? "" : String(grid[r][c])));
  };

  const moveActive = (dr, dc, extend) => {
    setSel(s => {
      const nr = Math.max(0, Math.min(TOTAL_ROWS - 1, s.r + dr));
      const nc = Math.max(0, Math.min(nCols - 1, s.c + dc));
      return extend ? { ...s, r: nr, c: nc } : { r: nr, c: nc, ar: nr, ac: nc };
    });
  };

  const selectCell = (r, c, extend) => setSel(s => extend ? { ...s, r, c } : { r, c, ar: r, ac: c });

  const onKeyDown = (e) => {
    if (editing) {
      if (e.key === "Enter") { e.preventDefault(); commitEdit({ dr: 1, dc: 0 }); }
      else if (e.key === "Tab") { e.preventDefault(); commitEdit({ dr: 0, dc: e.shiftKey ? -1 : 1 }); }
      else if (e.key === "Escape") { e.preventDefault(); setEditing(null); }
      return;
    }
    const k = e.key;
    if (k === "ArrowUp") { e.preventDefault(); moveActive(-1, 0, e.shiftKey); }
    else if (k === "ArrowDown") { e.preventDefault(); moveActive(1, 0, e.shiftKey); }
    else if (k === "ArrowLeft") { e.preventDefault(); moveActive(0, -1, e.shiftKey); }
    else if (k === "ArrowRight" || k === "Tab") { e.preventDefault(); moveActive(0, e.shiftKey && k === "Tab" ? -1 : 1, e.shiftKey && k !== "Tab"); }
    else if (k === "Enter" || k === "F2") { e.preventDefault(); startEdit(sel.r, sel.c); }
    else if (k === "Backspace" || k === "Delete") { e.preventDefault(); forEachInRange((r, c) => { if (columns[c].type !== "checkbox") setCell(r, c, ""); }); }
    else if (k === " " && columns[sel.c].type === "checkbox") { e.preventDefault(); setCell(sel.r, sel.c, !grid[sel.r][sel.c]); }
    else if (k.length === 1 && !e.metaKey && !e.ctrlKey && columns[sel.c].type !== "checkbox") { startEdit(sel.r, sel.c, k); }
  };

  const forEachInRange = (fn) => { for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) fn(r, c); };

  // ── toolbar ops ──
  const applyFmt = (patch) => setFmt(f => {
    const nf = { ...f };
    forEachInRange((r, c) => { nf[fkey(r, c)] = { ...(nf[fkey(r, c)] || {}), ...patch }; });
    return nf;
  });
  const toggleFmt = (key) => {
    let all = true; forEachInRange((r, c) => { if (!cellFmt(r, c)[key]) all = false; });
    applyFmt({ [key]: !all });
  };
  const activeFmt = cellFmt(sel.r, sel.c);

  const display = (col, v) => {
    if (v === "" || v == null) return "";
    if (col.type === "number") {
      if (col.format === "currency") return "$" + Number(v).toLocaleString();
      if (col.format === "percent") return v + "%";
      return Number(v).toLocaleString();
    }
    if (col.type === "date") { const d = new Date(v); return isNaN(d) ? v : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
    return v;
  };

  const corner = { position: "sticky", background: "var(--bg-muted)", borderRight: "1px solid var(--border-default)", borderBottom: "1px solid var(--border-default)" };
  const headBase = { position: "sticky", top: 0, zIndex: 3, background: "var(--bg-subtle)", borderBottom: "1px solid var(--border-default)", borderRight: "1px solid var(--border-subtle)", userSelect: "none" };
  const rowNumBase = { position: "sticky", left: 0, zIndex: 2, background: "var(--bg-subtle)", borderRight: "1px solid var(--border-default)", borderBottom: "1px solid var(--border-subtle)", textAlign: "center", color: "var(--fg-subtle)", fontSize: 11.5, fontFamily: "var(--font-mono)", userSelect: "none" };

  const ToolBtn = ({ icon, on, onClick, label, disabled }) => (
    <Tooltip content={label}><button type="button" onClick={onClick} aria-label={label} aria-pressed={on} disabled={disabled} style={{
      appearance: "none", border: 0, cursor: disabled ? "default" : "pointer", width: 30, height: 30, borderRadius: "var(--radius-sm)",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      background: on ? "var(--bg-brand-subtle)" : "transparent", color: on ? "var(--fg-brand)" : disabled ? "var(--fg-subtle)" : "var(--fg-default)",
    }}><Icon name={icon} size={16} /></button></Tooltip>
  );

  const selLabel = `${colLetter(c1)}${r1 + 1}` + (r1 !== r2 || c1 !== c2 ? `:${colLetter(c2)}${r2 + 1}` : "");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg-app)" }}>
      {/* Title bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "var(--space-4) var(--space-6)", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-canvas)" }}>
        <div style={{ width: 30, height: 30, borderRadius: "var(--radius-md)", background: "var(--bg-success-subtle)", color: "var(--fg-success)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="table" size={17} /></div>
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--fg-strong)" }}>Q3 Workbook</div>
          <div style={{ fontSize: 11.5, color: "var(--fg-muted)" }}>Saved to Northwind · just now</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <Tooltip content={density === "compact" ? "Comfortable rows" : "Compact rows"}>
            <IconButton icon={density === "compact" ? "rows-3" : "rows-4"} variant="outline" size="sm" ariaLabel="Density" onClick={() => setDensity(d => d === "compact" ? "comfortable" : "compact")} />
          </Tooltip>
          <IconButton icon="share-2" variant="ghost" size="sm" ariaLabel="Share" />
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px var(--space-5)", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-canvas)" }}>
        <div style={{ minWidth: 64, fontFamily: "var(--font-mono)", fontSize: 12.5, fontWeight: 600, color: "var(--fg-default)", padding: "0 8px" }}>{selLabel}</div>
        <div style={{ width: 1, height: 22, background: "var(--border-subtle)", margin: "0 4px" }} />
        <ToolBtn icon="bold" label="Bold" on={!!activeFmt.bold} onClick={() => toggleFmt("bold")} />
        <ToolBtn icon="italic" label="Italic" on={!!activeFmt.italic} onClick={() => toggleFmt("italic")} />
        <div style={{ width: 1, height: 22, background: "var(--border-subtle)", margin: "0 4px" }} />
        <ToolBtn icon="align-left" label="Align left" on={(activeFmt.align || "left") === "left"} onClick={() => applyFmt({ align: "left" })} />
        <ToolBtn icon="align-center" label="Align center" on={activeFmt.align === "center"} onClick={() => applyFmt({ align: "center" })} />
        <ToolBtn icon="align-right" label="Align right" on={activeFmt.align === "right"} onClick={() => applyFmt({ align: "right" })} />
        <div style={{ width: 1, height: 22, background: "var(--border-subtle)", margin: "0 4px" }} />
        <DropdownMenu align="start" trigger={<button type="button" aria-label="Number format" style={{ appearance: "none", border: 0, cursor: "pointer", height: 30, padding: "0 8px", borderRadius: "var(--radius-sm)", background: "transparent", color: "var(--fg-default)", display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "inherit", fontSize: 13 }}><Icon name="hash" size={15} />Format<Icon name="chevron-down" size={13} /></button>}
          items={[
            { label: "Number format" },
            { label: "Currency  ($1,200)", icon: "dollar-sign", onSelect: () => window.toast?.info?.("Format applies to number columns") },
            { label: "Percent  (60%)", icon: "percent", onSelect: () => window.toast?.info?.("Format applies to number columns") },
            { label: "Plain number", icon: "hash", onSelect: () => window.toast?.info?.("Format applies to number columns") },
          ]} />
        <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--fg-subtle)" }}>Double-click or type to edit · arrows to move · Shift+arrows to select</div>
      </div>

      {/* Grid */}
      <div ref={gridRef} tabIndex={0} onKeyDown={onKeyDown}
        onMouseUp={() => (dragging.current = false)}
        style={{ flex: 1, overflow: "auto", outline: "none", background: "var(--bg-surface)" }}>
        <table style={{ borderCollapse: "separate", borderSpacing: 0, tableLayout: "fixed", fontSize: 13 }}>
          <thead>
            <tr style={{ height: 30 }}>
              <th style={{ ...corner, top: 0, left: 0, zIndex: 5, width: 42, minWidth: 42 }} />
              {columns.map((col, c) => (
                <th key={col.key} onMouseDown={() => { setSel({ r: 0, c, ar: TOTAL_ROWS - 1, ac: c }); }}
                  style={{ ...headBase, width: col.width, minWidth: col.width, padding: "0 8px", textAlign: "left", cursor: "pointer" }}>
                  <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15, padding: "4px 0" }}>
                    <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--fg-subtle)", letterSpacing: "0.04em" }}>{colLetter(c)}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-default)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "inline-flex", alignItems: "center", gap: 4 }}>
                      {col.name}{col.type === "dropdown" && <Icon name="chevron-down" size={11} color="var(--fg-subtle)" />}{col.type === "checkbox" && <Icon name="check-square" size={11} color="var(--fg-subtle)" />}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, r) => (
              <tr key={r} style={{ height: rowH }}>
                <td onMouseDown={() => setSel({ r, c: 0, ar: r, ac: nCols - 1 })}
                  style={{ ...rowNumBase, width: 42, minWidth: 42, height: rowH }}>{r + 1}</td>
                {columns.map((col, c) => {
                  const active = isActive(r, c);
                  const ranged = inRange(r, c) && !active;
                  const f = cellFmt(r, c);
                  const editingThis = editing && editing.r === r && editing.c === c;
                  const align = f.align || col.align || "left";
                  return (
                    <td key={col.key}
                      onMouseDown={(e) => { e.preventDefault(); gridRef.current?.focus(); dragging.current = true; selectCell(r, c, e.shiftKey); }}
                      onMouseEnter={() => { if (dragging.current) selectCell(r, c, true); }}
                      onDoubleClick={() => startEdit(r, c)}
                      style={{
                        width: col.width, minWidth: col.width, height: rowH, padding: 0,
                        borderRight: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)",
                        background: active ? "var(--bg-surface)" : ranged ? "var(--bg-brand-subtle)" : "var(--bg-surface)",
                        boxShadow: active ? "inset 0 0 0 2px var(--bg-brand)" : "none",
                        cursor: "cell", position: "relative",
                      }}>
                      {editingThis ? (
                        col.type === "dropdown" ? (
                          <select ref={editRef} value={editVal} autoFocus
                            onChange={(e) => { setCell(r, c, e.target.value); setEditing(null); }}
                            onBlur={() => setEditing(null)}
                            style={{ width: "100%", height: "100%", border: 0, outline: 0, background: "var(--bg-surface)", font: "inherit", padding: "0 6px", color: "var(--fg-default)" }}>
                            {col.options.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <input ref={editRef} value={editVal}
                            type={col.type === "date" ? "date" : col.type === "number" ? "text" : "text"}
                            onChange={(e) => setEditVal(e.target.value)}
                            onBlur={() => commitEdit()}
                            style={{ width: "100%", height: "100%", border: 0, outline: 0, background: "var(--bg-surface)", font: "inherit", fontWeight: f.bold ? 700 : 400, fontStyle: f.italic ? "italic" : "normal", padding: "0 7px", textAlign: align, color: "var(--fg-default)", boxShadow: "inset 0 0 0 2px var(--bg-brand)" }} />
                        )
                      ) : (
                        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start", padding: "0 7px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", fontWeight: f.bold ? 700 : (col.type === "text" && c === 0 ? 600 : 400), fontStyle: f.italic ? "italic" : "normal", fontFamily: col.type === "number" ? "var(--font-mono)" : "inherit", fontVariantNumeric: col.type === "number" ? "tabular-nums" : "normal", color: col.type === "number" && col.key === "value" ? "var(--fg-strong)" : "var(--fg-default)" }}>
                          {col.type === "checkbox" ? (
                            <Checkbox checked={!!row[c]} onChange={() => setCell(r, c, !row[c])} />
                          ) : col.type === "dropdown" && row[c] ? (
                            <Badge size="sm" variant={stageColor[row[c]] || "neutral"}>{row[c]}</Badge>
                          ) : display(col, row[c])}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sheet tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "0 var(--space-4)", borderTop: "1px solid var(--border-subtle)", background: "var(--bg-canvas)", height: 38 }}>
        <Icon name="table-2" size={15} color="var(--fg-subtle)" style={{ marginRight: 6 }} />
        {Object.keys(SHEETS).map(name => {
          const active = sheet === name;
          return (
            <button key={name} type="button" onClick={() => { setSheet(name); setSel({ r: 0, c: 0, ar: 0, ac: 0 }); setEditing(null); }}
              style={{ appearance: "none", border: 0, borderTop: `2px solid ${active ? "var(--bg-brand)" : "transparent"}`, cursor: "pointer", height: "100%", padding: "0 16px", fontFamily: "inherit", fontSize: 13, fontWeight: active ? 600 : 500, color: active ? "var(--fg-strong)" : "var(--fg-muted)", background: active ? "var(--bg-surface)" : "transparent" }}>
              {name}
            </button>
          );
        })}
        <Tooltip content="New sheet"><button type="button" aria-label="New sheet" style={{ appearance: "none", border: 0, background: "transparent", cursor: "pointer", color: "var(--fg-subtle)", display: "inline-flex", padding: 6, marginLeft: 4 }} onClick={() => window.toast?.info?.("Sheets are a demo set")}><Icon name="plus" size={16} /></button></Tooltip>
      </div>
    </div>
  );
}

window.Spreadsheet = Spreadsheet;
