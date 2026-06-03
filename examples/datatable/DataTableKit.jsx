// Data Table UI kit — a fully-interactive data grid built from lib/ primitives.
// Global search · faceted filters · multi-column sort · row selection + bulk actions ·
// column show/hide + drag-reorder · row expansion · density toggle · CSV export ·
// pagination. Two layout variations: Rows (table) and Cards.
const { useState: useDT, useMemo: useDTMemo, useRef: useDTRef } = React;

const REGIONS = ["NA", "EU", "APAC", "LATAM"];
const ROLES = ["Admin", "Editor", "Viewer"];
const STATUSES = ["active", "invited", "suspended"];
const PLANS = ["Enterprise", "Scale", "Pro", "Starter"];
const FIRST = ["Amanda", "David", "Emma", "James", "Lisa", "Noah", "Olivia", "Liam", "Sophia", "Mason", "Ava", "Lucas", "Mia", "Ethan", "Isla", "Leo", "Aria", "Kai", "Nora", "Owen", "Maya", "Ruth", "Theo", "Zoe", "Ian", "Priya", "Marcus", "Bianca"];
const LAST = ["Martinez", "Lee", "Wilson", "Brown", "Anderson", "Patel", "Nguyen", "Kim", "Garcia", "Klein", "Lyle", "Anand", "Tran", "Reyes", "Cole", "Frost", "Hale", "Vega", "Ono", "Diaz"];

function seedRows(n) {
  let s = 12345;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const rows = [];
  for (let i = 0; i < n; i++) {
    const first = FIRST[i % FIRST.length];
    const last = pick(LAST);
    const name = `${first} ${last}`;
    const plan = pick(PLANS);
    const mrr = plan === "Enterprise" ? 1800 + Math.round(rnd() * 1200) : plan === "Scale" ? 600 + Math.round(rnd() * 600) : plan === "Pro" ? 180 + Math.round(rnd() * 220) : Math.round(rnd() * 80);
    const y = 2023 + Math.floor(rnd() * 3);
    const mo = 1 + Math.floor(rnd() * 12);
    const da = 1 + Math.floor(rnd() * 27);
    rows.push({
      id: i + 1, name, email: `${first.toLowerCase()}.${last[0].toLowerCase()}@company.com`,
      role: pick(ROLES), status: pick(STATUSES), plan, seats: 1 + Math.floor(rnd() * 40),
      mrr, region: pick(REGIONS),
      joined: new Date(y, mo - 1, da), lastActive: ["2m ago", "1h ago", "Today", "Yesterday", "3d ago", "2w ago"][Math.floor(rnd() * 6)],
    });
  }
  return rows;
}
const DATA = seedRows(47);
const fmtDate = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const statusVariant = (s) => s === "active" ? "success" : s === "invited" ? "warning" : "danger";
const planVariant = (p) => p === "Enterprise" ? "brand" : p === "Scale" ? "info" : p === "Pro" ? "neutral" : "neutral";

const ALL_COLUMNS = [
  { key: "name", label: "Member", sortable: true, always: true },
  { key: "role", label: "Role", sortable: true, facet: ROLES },
  { key: "status", label: "Status", sortable: true, facet: STATUSES },
  { key: "plan", label: "Plan", sortable: true, facet: PLANS },
  { key: "seats", label: "Seats", sortable: true, align: "right", num: true },
  { key: "mrr", label: "MRR", sortable: true, align: "right", num: true },
  { key: "region", label: "Region", sortable: true, facet: REGIONS },
  { key: "joined", label: "Joined", sortable: true },
];

function DataTableKit() {
  const { Icon, Button, IconButton, Input, Checkbox, Badge, Avatar, Popover, Pagination, Empty, Tooltip, Separator } = window;

  const [query, setQuery] = useDT("");
  const [filters, setFilters] = useDT({ role: [], status: [], plan: [], region: [] });
  const [sort, setSort] = useDT([{ key: "mrr", dir: "desc" }]);
  const [selected, setSelected] = useDT(() => new Set());
  const [expanded, setExpanded] = useDT(() => new Set());
  const [page, setPage] = useDT(1);
  const [pageSize] = useDT(8);
  const [cols, setCols] = useDT(ALL_COLUMNS.map(c => ({ ...c, visible: true })));
  const [density, setDensity] = useDT("comfortable");
  const [view, setView] = useDT("rows");
  const dragKey = useDTRef(null);

  const activeFacets = Object.values(filters).reduce((a, v) => a + v.length, 0);

  const filtered = useDTMemo(() => {
    const q = query.trim().toLowerCase();
    return DATA.filter(r => {
      if (q && !(`${r.name} ${r.email}`.toLowerCase().includes(q))) return false;
      for (const key of ["role", "status", "plan", "region"]) {
        if (filters[key].length && !filters[key].includes(r[key])) return false;
      }
      return true;
    });
  }, [query, filters]);

  const sorted = useDTMemo(() => {
    if (!sort.length) return filtered;
    const arr = [...filtered];
    arr.sort((a, b) => {
      for (const { key, dir } of sort) {
        let av = a[key], bv = b[key];
        if (key === "joined") { av = a.joined.getTime(); bv = b.joined.getTime(); }
        if (typeof av === "string") { av = av.toLowerCase(); bv = bv.toLowerCase(); }
        if (av < bv) return dir === "asc" ? -1 : 1;
        if (av > bv) return dir === "asc" ? 1 : -1;
      }
      return 0;
    });
    return arr;
  }, [filtered, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageRows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);
  const visibleCols = cols.filter(c => c.visible);

  // ── interactions ──
  const toggleSort = (key, additive) => {
    setSort(prev => {
      const existing = prev.find(s => s.key === key);
      if (additive) {
        if (!existing) return [...prev, { key, dir: "asc" }];
        if (existing.dir === "asc") return prev.map(s => s.key === key ? { ...s, dir: "desc" } : s);
        return prev.filter(s => s.key !== key);
      }
      if (!existing) return [{ key, dir: "asc" }];
      if (existing.dir === "asc") return [{ key, dir: "desc" }];
      return [];
    });
  };
  const sortState = (key) => sort.find(s => s.key === key);
  const sortIndex = (key) => sort.length > 1 ? sort.findIndex(s => s.key === key) + 1 : 0;

  const toggleRow = (id) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allOnPage = pageRows.every(r => selected.has(r.id)) && pageRows.length > 0;
  const someOnPage = pageRows.some(r => selected.has(r.id));
  const toggleAll = () => setSelected(s => { const n = new Set(s); allOnPage ? pageRows.forEach(r => n.delete(r.id)) : pageRows.forEach(r => n.add(r.id)); return n; });
  const toggleExpand = (id) => setExpanded(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const setFacet = (key, val) => setFilters(f => { const has = f[key].includes(val); return { ...f, [key]: has ? f[key].filter(x => x !== val) : [...f[key], val] }; });
  const clearFilters = () => { setFilters({ role: [], status: [], plan: [], region: [] }); setQuery(""); };
  const toggleCol = (key) => setCols(cs => cs.map(c => c.key === key ? { ...c, visible: !c.visible } : c));

  const onDrop = (key) => {
    const from = cols.findIndex(c => c.key === dragKey.current);
    const to = cols.findIndex(c => c.key === key);
    if (from < 0 || to < 0 || from === to) return;
    setCols(cs => { const n = [...cs]; const [m] = n.splice(from, 1); n.splice(to, 0, m); return n; });
    dragKey.current = null;
  };

  const exportCSV = (onlySelected) => {
    const rows = onlySelected ? sorted.filter(r => selected.has(r.id)) : sorted;
    const heads = visibleCols.map(c => c.label);
    const cell = (r, c) => c.key === "joined" ? fmtDate(r.joined) : c.key === "mrr" ? r.mrr : c.key === "name" ? `${r.name} <${r.email}>` : r[c.key];
    const lines = [heads.join(","), ...rows.map(r => visibleCols.map(c => `"${String(cell(r, c)).replace(/"/g, '""')}"`).join(","))];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "members.csv"; a.click();
    URL.revokeObjectURL(url);
    window.toast?.success?.(`Exported ${rows.length} rows`);
  };

  const cellPad = density === "compact" ? "7px 12px" : "12px 14px";
  const renderCell = (r, key) => {
    switch (key) {
      case "name": return <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar name={r.name} size={density === "compact" ? 24 : 30} /><div style={{ minWidth: 0 }}><div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--fg-strong)" }}>{r.name}</div>{density !== "compact" && <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>{r.email}</div>}</div></div>;
      case "role": return <Badge size="sm" variant={r.role === "Admin" ? "brand" : r.role === "Editor" ? "info" : "neutral"}>{r.role}</Badge>;
      case "status": return <Badge size="sm" variant={statusVariant(r.status)} dot>{r.status[0].toUpperCase() + r.status.slice(1)}</Badge>;
      case "plan": return <Badge size="sm" variant={planVariant(r.plan)}>{r.plan}</Badge>;
      case "seats": return <span style={{ fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-mono)" }}>{r.seats}</span>;
      case "mrr": return <span style={{ fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-mono)" }}>${r.mrr.toLocaleString()}</span>;
      case "region": return <span style={{ color: "var(--fg-muted)" }}>{r.region}</span>;
      case "joined": return <span style={{ color: "var(--fg-muted)" }}>{fmtDate(r.joined)}</span>;
      default: return r[key];
    }
  };

  const FacetFilter = ({ col }) => {
    const sel = filters[col.key];
    return (
      <Popover side="bottom" align="start" width={200} trigger={
        <Button variant="outline" size="sm" leading="list-filter" trailing="chevron-down">
          {col.label}{sel.length > 0 && <Badge size="sm" variant="brand" style={{ marginLeft: 2 }}>{sel.length}</Badge>}
        </Button>
      }>
        <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 4 }}>
          {col.facet.map(v => (
            <label key={v} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: "var(--radius-sm)", cursor: "pointer" }}>
              <Checkbox checked={sel.includes(v)} onChange={() => setFacet(col.key, v)} />
              <span style={{ fontSize: 13.5, textTransform: col.key === "status" ? "capitalize" : "none" }}>{v}</span>
            </label>
          ))}
        </div>
      </Popover>
    );
  };

  const facetCols = ALL_COLUMNS.filter(c => c.facet);

  const Toolbar = () => (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
      <div style={{ width: 260 }}><Input leading="search" placeholder="Search name or email…" size="sm" value={query} onChange={(v) => { setQuery(v); setPage(1); }} /></div>
      {facetCols.map(c => <FacetFilter key={c.key} col={c} />)}
      {(activeFacets > 0 || query) && <Button variant="ghost" size="sm" leading="x" onClick={clearFilters}>Clear</Button>}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        {/* view variation */}
        <div role="group" aria-label="Layout" style={{ display: "inline-flex", padding: 3, gap: 2, background: "var(--bg-muted)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
          {[{ v: "rows", i: "table-2", t: "Rows" }, { v: "cards", i: "layout-grid", t: "Cards" }].map(o => {
            const active = view === o.v;
            return <Tooltip key={o.v} content={o.t}><button type="button" onClick={() => setView(o.v)} aria-pressed={active} aria-label={o.t} style={{ appearance: "none", border: 0, cursor: "pointer", width: 30, height: 26, display: "inline-flex", alignItems: "center", justifyContent: "center", color: active ? "var(--fg-default)" : "var(--fg-muted)", background: active ? "var(--bg-surface)" : "transparent", borderRadius: "var(--radius-sm)", boxShadow: active ? "var(--shadow-xs)" : "none" }}><Icon name={o.i} size={15} /></button></Tooltip>;
          })}
        </div>
        {view === "rows" && (
          <Tooltip content={density === "compact" ? "Comfortable rows" : "Compact rows"}>
            <IconButton icon={density === "compact" ? "rows-3" : "rows-4"} variant="outline" size="sm" ariaLabel="Density" onClick={() => setDensity(d => d === "compact" ? "comfortable" : "compact")} />
          </Tooltip>
        )}
        {/* column visibility */}
        <Popover side="bottom" align="end" width={210} trigger={<Button variant="outline" size="sm" leading="columns-3" trailing="chevron-down">Columns</Button>}>
          <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--fg-subtle)", padding: "4px 8px" }}>Toggle columns</div>
            {cols.map(c => (
              <label key={c.key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: "var(--radius-sm)", cursor: c.always ? "not-allowed" : "pointer", opacity: c.always ? 0.5 : 1 }}>
                <Checkbox checked={c.visible} disabled={c.always} onChange={() => toggleCol(c.key)} />
                <span style={{ fontSize: 13.5 }}>{c.label}</span>
              </label>
            ))}
          </div>
        </Popover>
        <Button variant="outline" size="sm" leading="download" onClick={() => exportCSV(false)}>Export</Button>
      </div>
    </div>
  );

  const BulkBar = () => (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "10px 14px", background: "var(--bg-brand-subtle)", border: "1px solid var(--border-info)", borderRadius: "var(--radius-md)" }}>
      <Checkbox checked indeterminate={!allOnPage} onChange={() => setSelected(new Set())} />
      <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--fg-strong)" }}>{selected.size} selected</span>
      <Separator orientation="vertical" style={{ height: 20, margin: "0 4px" }} />
      <Button variant="ghost" size="sm" leading="download" onClick={() => exportCSV(true)}>Export</Button>
      <Button variant="ghost" size="sm" leading="repeat" onClick={() => window.toast?.info?.("Plan change queued")}>Change plan</Button>
      <Button variant="ghost" size="sm" leading="pause" onClick={() => window.toast?.info?.(`${selected.size} members suspended`)}>Suspend</Button>
      <div style={{ marginLeft: "auto" }}><Button variant="ghost" size="sm" leading="x" onClick={() => setSelected(new Set())}>Clear</Button></div>
    </div>
  );

  const RowDetail = ({ r }) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, padding: "14px 16px 16px 60px", background: "var(--bg-subtle)" }}>
      {[["Email", r.email], ["Region", r.region], ["Seats", r.seats], ["Last active", r.lastActive], ["Joined", fmtDate(r.joined)], ["MRR", "$" + r.mrr.toLocaleString()]].map(([k, v]) => (
        <div key={k}><div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--fg-subtle)" }}>{k}</div><div style={{ fontSize: 13.5, color: "var(--fg-default)", marginTop: 3 }}>{v}</div></div>
      ))}
    </div>
  );

  // ── table view ──
  const TableView = () => (
    <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", overflow: "hidden", background: "var(--bg-surface)" }}>
      <div style={{ maxHeight: 520, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 13.5 }}>
          <thead>
            <tr>
              <th style={{ position: "sticky", top: 0, zIndex: 2, background: "var(--bg-subtle)", padding: cellPad, borderBottom: "1px solid var(--border-subtle)", width: 40 }}>
                <Checkbox checked={allOnPage} indeterminate={someOnPage && !allOnPage} onChange={toggleAll} />
              </th>
              <th style={{ position: "sticky", top: 0, zIndex: 2, background: "var(--bg-subtle)", borderBottom: "1px solid var(--border-subtle)", width: 32 }} />
              {visibleCols.map(c => {
                const st = sortState(c.key); const idx = sortIndex(c.key);
                return (
                  <th key={c.key} draggable onDragStart={() => (dragKey.current = c.key)} onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(c.key)}
                    onClick={c.sortable ? (e) => toggleSort(c.key, e.shiftKey) : undefined}
                    style={{ position: "sticky", top: 0, zIndex: 2, background: "var(--bg-subtle)", padding: cellPad, textAlign: c.align || "left", borderBottom: "1px solid var(--border-subtle)", fontSize: 11.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: st ? "var(--fg-default)" : "var(--fg-subtle)", cursor: c.sortable ? "pointer" : "grab", userSelect: "none", whiteSpace: "nowrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, flexDirection: c.align === "right" ? "row-reverse" : "row" }}>
                      {c.label}
                      {c.sortable && <Icon name={st ? (st.dir === "asc" ? "arrow-up" : "arrow-down") : "chevrons-up-down"} size={12} color={st ? "var(--fg-brand)" : "var(--fg-subtle)"} />}
                      {idx > 0 && <span style={{ fontSize: 9, color: "var(--fg-brand)", fontWeight: 700 }}>{idx}</span>}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pageRows.map(r => {
              const isSel = selected.has(r.id); const isExp = expanded.has(r.id);
              return (
                <React.Fragment key={r.id}>
                  <tr style={{ background: isSel ? "var(--bg-brand-subtle)" : "transparent", transition: "background var(--dur-fast)" }}>
                    <td style={{ padding: cellPad, borderTop: "1px solid var(--border-subtle)" }}><Checkbox checked={isSel} onChange={() => toggleRow(r.id)} /></td>
                    <td style={{ padding: cellPad, borderTop: "1px solid var(--border-subtle)" }}>
                      <button onClick={() => toggleExpand(r.id)} aria-label="Expand" style={{ appearance: "none", border: 0, background: "transparent", cursor: "pointer", color: "var(--fg-muted)", display: "inline-flex", padding: 2 }}>
                        <Icon name="chevron-right" size={16} style={{ transform: isExp ? "rotate(90deg)" : "none", transition: "transform var(--dur-fast)" }} />
                      </button>
                    </td>
                    {visibleCols.map(c => <td key={c.key} style={{ padding: cellPad, textAlign: c.align || "left", borderTop: "1px solid var(--border-subtle)", color: "var(--fg-default)", whiteSpace: "nowrap" }}>{renderCell(r, c.key)}</td>)}
                  </tr>
                  {isExp && <tr><td colSpan={visibleCols.length + 2} style={{ borderTop: "1px solid var(--border-subtle)", padding: 0 }}><RowDetail r={r} /></td></tr>}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        {pageRows.length === 0 && <div style={{ padding: 40 }}><Empty icon="search-x" title="No matches" description="No members match your search and filters." action={<Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>} /></div>}
      </div>
    </div>
  );

  // ── cards view (variation) ──
  const CardsView = () => (
    pageRows.length === 0
      ? <div style={{ padding: 40 }}><Empty icon="search-x" title="No matches" description="No members match your search and filters." action={<Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>} /></div>
      : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--space-4)" }}>
          {pageRows.map(r => {
            const isSel = selected.has(r.id);
            return (
              <div key={r.id} style={{ background: "var(--bg-surface)", border: `1px solid ${isSel ? "var(--border-info)" : "var(--border-subtle)"}`, outline: isSel ? "1px solid var(--border-info)" : "none", borderRadius: "var(--radius-lg)", padding: "var(--space-5)", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <Avatar name={r.name} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg-strong)" }}>{r.name}</div><div style={{ fontSize: 12.5, color: "var(--fg-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.email}</div></div>
                  <Checkbox checked={isSel} onChange={() => toggleRow(r.id)} />
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <Badge size="sm" variant={statusVariant(r.status)} dot>{r.status[0].toUpperCase() + r.status.slice(1)}</Badge>
                  <Badge size="sm" variant={planVariant(r.plan)}>{r.plan}</Badge>
                  <Badge size="sm" variant="neutral">{r.region}</Badge>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-subtle)", paddingTop: 10, fontSize: 13 }}>
                  <span style={{ color: "var(--fg-muted)" }}>{r.seats} seats</span>
                  <span style={{ fontWeight: 600, color: "var(--fg-strong)", fontFamily: "var(--font-mono)" }}>${r.mrr.toLocaleString()}<span style={{ color: "var(--fg-muted)", fontWeight: 400 }}>/mo</span></span>
                </div>
              </div>
            );
          })}
        </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-app)", padding: "var(--space-7)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--fg-strong)" }}>Members</h1>
            <div style={{ fontSize: 13.5, color: "var(--fg-muted)", marginTop: 2 }}>{sorted.length} of {DATA.length} members{activeFacets > 0 ? ` · ${activeFacets} filter${activeFacets > 1 ? "s" : ""}` : ""}</div>
          </div>
          <Button variant="primary" leading="plus" onClick={() => window.toast?.success?.("Invite sent")}>Invite member</Button>
        </div>

        <Toolbar />
        {selected.size > 0 && <BulkBar />}
        {view === "rows" ? <TableView /> : <CardsView />}
        <Pagination page={safePage} total={sorted.length} pageSize={pageSize} onPage={setPage} />
      </div>
    </div>
  );
}

window.DataTableKit = DataTableKit;
