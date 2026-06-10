/* ============================================================================
   InboxEngine.jsx — config-driven, multi-context inbox.
   One tenant with five inbox contexts, each described by a config object
   registered onto window.INBOX_CONTEXTS. Exports: InboxApp, WorkspaceSwitcher,
   SplitView, TableView, BoardView, Tile, ListRow, MetaGrid, DetailShell,
   SectionTitle, Composer, surfaceFor.
   ========================================================================== */
const { useState: useEng, useRef: useRefEng, useEffect: useEffEng } = React;

/* ─────────────────────────── shared atoms ─────────────────────────── */

function Tile({ icon, color, bg, size = 40, radius = "var(--radius-xl)", strokeWidth = 2.1, children }) {
  return (
    <span style={{ width: size, height: size, flexShrink: 0, borderRadius: radius, background: bg, color,
      display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700,
      fontSize: size * 0.4, letterSpacing: "-0.02em" }}>
      {icon ? <window.Icon name={icon} size={Math.round(size * 0.46)} color="currentColor" strokeWidth={strokeWidth} /> : children}
    </span>
  );
}

function surfaceFor({ accent, tint, live, settled }) {
  if (!live) return { surface: "var(--bg-canvas)", bar: "transparent", hover: "var(--bg-subtle)", dim: settled };
  return { surface: tint, bar: accent, hover: "color-mix(in oklab, " + tint + " 60%, var(--bg-canvas))", dim: false };
}

function ListRow({ leading, title, strike, time, meta, badges, value, accent = "transparent", active, dim, unseen, onClick }) {
  return (
    <div onClick={onClick} style={{
      position: "relative", display: "flex", gap: 14,
      padding: "var(--space-4) var(--space-5)", marginBottom: 4, cursor: "pointer",
      borderRadius: "var(--radius-lg)",
      background: active ? "var(--bg-brand-subtle)" : "transparent",
      boxShadow: active ? "inset 0 0 0 1px color-mix(in oklab, var(--bg-brand) 22%, transparent)" : "none",
      opacity: dim ? 0.68 : 1, transition: "background var(--dur-fast)",
    }}>
      {(active || accent !== "transparent") && (
        <span style={{ position: "absolute", left: 4, top: 14, bottom: 14, width: 3, borderRadius: 9999,
          background: active ? "var(--bg-brand)" : accent }} />
      )}
      {leading}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {unseen && <span style={{ width: 7, height: 7, borderRadius: 9999, background: accent === "transparent" ? "var(--bg-brand)" : accent, flexShrink: 0 }} />}
          <span style={{ fontSize: 14, fontWeight: unseen ? 700 : 600, color: "var(--fg-strong)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecorationLine: strike ? "line-through" : "none", textDecorationColor: "var(--fg-subtle)" }}>{title}</span>
          {time && <span style={{ fontSize: 11.5, color: "var(--fg-subtle)", flexShrink: 0 }}>{time}</span>}
        </div>
        {meta && <div style={{ fontSize: 12, color: "var(--fg-muted)", margin: "3px 0 9px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{meta}</div>}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {badges}
          <span style={{ flex: 1 }} />
          {value}
        </div>
      </div>
    </div>
  );
}

function MetaGrid({ rows }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--space-4) var(--space-7)",
      margin: "var(--space-7) 0", padding: "var(--space-5) var(--space-6)", border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-lg)", background: "var(--bg-surface)" }}>
      {rows.map(([k, v], i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--fg-subtle)" }}>{k}</span>
          <span style={{ display: "inline-flex", alignItems: "center", minWidth: 0 }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

function DetailShell({ tools, actions, children }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "var(--space-4) var(--space-7)", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-canvas)" }}>
        {tools}
        <div style={{ flex: 1 }} />
        {actions}
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "var(--space-7) var(--space-9)" }}>
        <div style={{ maxWidth: 720 }}>{children}</div>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return <h3 style={{ margin: "0 0 var(--space-3)", fontSize: 14, fontWeight: 600, color: "var(--fg-strong)" }}>{children}</h3>;
}

function Composer({ label, placeholder, primaryLabel, primaryIcon, onSend }) {
  return (
    <div style={{ marginTop: "var(--space-7)", paddingTop: "var(--space-6)", borderTop: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      <window.Textarea label={label} rows={3} placeholder={placeholder} />
      <div style={{ display: "flex", gap: 10 }}>
        <window.Button variant="primary" leading={primaryIcon} onClick={() => window.toast?.success?.(primaryLabel + "ed")}>{primaryLabel}</window.Button>
        <window.Button variant="outline" leading="link">Copy link</window.Button>
      </div>
    </div>
  );
}

Object.assign(window, { Tile, surfaceFor, ListRow, MetaGrid, DetailShell, SectionTitle, Composer });

/* ─────────────────────── workspace switcher ─────────────────────── */
function WorkspaceSwitcher({ contexts, activeId, onSelect, tenant }) {
  const [open, setOpen] = useEng(false);
  const [rect, setRect] = useEng(null);
  const btn = useRefEng(null);
  const active = contexts.find(c => c.id === activeId);
  const toggle = () => { if (!open && btn.current) setRect(btn.current.getBoundingClientRect()); setOpen(o => !o); };

  return (
    <>
      <button ref={btn} onClick={toggle} style={{
        appearance: "none", border: "1px solid transparent", background: open ? "var(--bg-muted)" : "transparent",
        width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "6px 8px", borderRadius: "var(--radius-md)",
        cursor: "pointer", fontFamily: "inherit", transition: "background var(--dur-fast)",
      }}>
        <span style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg, var(--brand-500), var(--brand-700))", color: "var(--neutral-0)", fontWeight: 700, fontSize: 14 }}>
          {tenant.charAt(0)}
        </span>
        <span style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
          <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: "var(--fg-strong)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>{active.label}</span>
          <span style={{ display: "block", fontSize: 11, color: "var(--fg-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tenant}</span>
        </span>
        <window.Icon name="chevrons-up-down" size={15} color="var(--fg-subtle)" />
      </button>

      {open && rect && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 80 }} />
          <div style={{ position: "fixed", top: rect.bottom + 6, left: rect.left, width: rect.width, zIndex: 81,
            background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-lg)", padding: 6, display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ padding: "6px 8px 4px", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-subtle)" }}>Inboxes</div>
            {contexts.map(c => {
              const on = c.id === activeId;
              return (
                <button key={c.id} onClick={() => { onSelect(c.id); setOpen(false); }} style={{
                  appearance: "none", border: 0, cursor: "pointer", width: "100%", textAlign: "left",
                  display: "flex", alignItems: "center", gap: 11, padding: "8px 8px", borderRadius: "var(--radius-md)",
                  background: on ? "var(--bg-brand-subtle)" : "transparent", fontFamily: "inherit",
                }}
                  onMouseEnter={e => { if (!on) e.currentTarget.style.background = "var(--bg-muted)"; }}
                  onMouseLeave={e => { if (!on) e.currentTarget.style.background = "transparent"; }}>
                  <Tile icon={c.icon} size={30} radius="var(--radius-md)" strokeWidth={2}
                    color={on ? "var(--fg-brand)" : "var(--fg-muted)"}
                    bg={on ? "var(--bg-brand-subtle)" : "var(--bg-muted)"} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: on ? "var(--fg-brand)" : "var(--fg-strong)" }}>{c.label}</span>
                    <span style={{ display: "block", fontSize: 11.5, color: "var(--fg-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.sublabel}</span>
                  </span>
                  {on && <window.Icon name="check" size={16} color="var(--fg-brand)" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

/* ───────────────────────────── view toggle ───────────────────────────── */
const VIEW_META = {
  split: { icon: "panel-left", tooltip: "Split view" },
  table: { icon: "table-2", tooltip: "Table" },
  board: { icon: "kanban-square", tooltip: "Board" },
};

/* ───────────────────────────── generic bodies ───────────────────────────── */

function SplitView({ ctx, visible, sel, api }) {
  const { Empty } = window;
  return (
    <>
      <div style={{ width: 404, flexShrink: 0, display: "flex", flexDirection: "column", borderRight: "1px solid var(--border-subtle)", background: "var(--bg-canvas)" }}>
        <div style={{ flex: 1, overflow: "auto", padding: "var(--space-3)" }}>
          {visible.length === 0 && <div style={{ padding: 40 }}><Empty icon={ctx.icon} title="Nothing here" description="Nothing matches this view. You're all caught up." size="sm" /></div>}
          {visible.map(m => {
            const c = ctx.cell;
            return (
              <ListRow key={m.id} active={m.id === api.selId} onClick={() => api.open(m)}
                accent={c.accent ? c.accent(m) : "transparent"} dim={c.dim ? c.dim(m) : false}
                unseen={c.unseen ? c.unseen(m) : false} strike={c.strike ? c.strike(m) : false}
                leading={c.leading(m, api)} title={c.title(m)} time={c.time ? c.time(m) : null}
                meta={c.meta ? c.meta(m) : null} badges={c.badges ? c.badges(m) : null}
                value={c.value ? c.value(m) : null} />
            );
          })}
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {sel ? <ctx.Detail m={sel} api={api} />
          : <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Empty icon={ctx.icon} title="Nothing selected" description="Pick an item from the list to see its details here." />
            </div>}
      </div>
    </>
  );
}

function TableView({ ctx, visible, api }) {
  const { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Checkbox, Button, Empty, Pagination } = window;
  const [picked, setPicked] = useEng([]);
  const [page, setPage] = useEng(1);
  const allOn = visible.length > 0 && picked.length === visible.length;
  const toggleAll = () => setPicked(allOn ? [] : visible.map(m => m.id));
  const toggle = id => setPicked(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const runBulk = (b) => { picked.forEach(id => api.setStatus(id, b.to)); window.toast?.success?.(`${picked.length} ${b.label.toLowerCase()}`); setPicked([]); };

  if (visible.length === 0) return <div style={{ padding: 64, flex: 1 }}><Empty icon="table-2" title="No rows" description="Nothing matches the current filters." /></div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, height: "100%", minHeight: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "var(--space-3) var(--space-7)", borderBottom: "1px solid var(--border-subtle)", background: picked.length ? "var(--bg-brand-subtle)" : "var(--bg-canvas)", minHeight: 30 }}>
        {picked.length > 0 ? (
          <>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--fg-strong)" }}>{picked.length} selected</span>
            <div style={{ width: 1, height: 18, background: "var(--border-default)" }} />
            {(ctx.bulk || []).map(b => <Button key={b.to} variant={b.variant || "outline"} size="sm" leading={b.icon} onClick={() => runBulk(b)}>{b.label}</Button>)}
            <div style={{ flex: 1 }} />
            <Button variant="ghost" size="sm" onClick={() => setPicked([])}>Clear</Button>
          </>
        ) : <span style={{ fontSize: 12.5, color: "var(--fg-muted)" }}>Select rows for bulk actions · {visible.length} rows</span>}
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "var(--space-5) var(--space-7)" }}>
        <Table dense>
          <TableHeader>
            <TableRow hoverable={false}>
              <TableHead width={40}><Checkbox checked={allOn} indeterminate={picked.length > 0 && !allOn} onChange={toggleAll} /></TableHead>
              {ctx.columns.map((col, i) => <TableHead key={i} width={col.width} align={col.align}>{col.head}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map(m => {
              const on = picked.includes(m.id);
              const c = ctx.cell;
              const accent = c.accent ? c.accent(m) : "transparent";
              const dim = c.dim ? c.dim(m) : false;
              return (
                <TableRow key={m.id} selected={on || m.id === api.selId} onClick={() => api.open(m)}
                  style={{ boxShadow: accent !== "transparent" ? `inset 3px 0 0 ${accent}` : "none", opacity: dim ? 0.66 : 1 }}>
                  <TableCell><span onClick={e => { e.stopPropagation(); toggle(m.id); }} style={{ display: "inline-flex" }}><Checkbox checked={on} onChange={() => toggle(m.id)} /></span></TableCell>
                  {ctx.columns.map((col, i) => <TableCell key={i} align={col.align} mono={col.mono} muted={col.muted}>{col.cell(m)}</TableCell>)}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <div style={{ padding: "var(--space-4) var(--space-7)", borderTop: "1px solid var(--border-subtle)", background: "var(--bg-canvas)" }}>
        <Pagination page={page} total={visible.length} pageSize={visible.length || 1} onPage={setPage} />
      </div>
    </div>
  );
}

function BoardView({ ctx, visible, items, api }) {
  const { Badge, Button, Empty } = window;
  const [dragId, setDragId] = useEng(null);
  const [over, setOver] = useEng(null);
  const field = ctx.statusField;
  const cols = ctx.board.columns;

  const drop = (key) => {
    if (dragId != null) {
      const card = items.find(m => m.id === dragId);
      if (card && card[field] !== key) api.setStatus(dragId, key, `Moved to ${ctx.STATUS[key].label}`);
    }
    setDragId(null); setOver(null);
  };
  const done = cols[cols.length - 1].key;
  const total = items.length;
  const closed = items.filter(m => m[field] === done).length;
  const overall = total ? Math.round((closed / total) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, height: "100%", minHeight: 0, background: "var(--bg-app)" }}>
      <div style={{ padding: "var(--space-6) var(--space-7)", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-canvas)", display: "flex", alignItems: "center", gap: "var(--space-9)", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--fg-strong)", whiteSpace: "nowrap" }}>{ctx.board.progressLabel || "Progress"}</span>
            <span style={{ fontSize: 13, color: "var(--fg-muted)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{closed} of {total} · drag cards to move</span>
          </div>
          <window.Progress value={overall} variant={overall === 100 ? "success" : "brand"} size="lg" />
        </div>
        <div style={{ display: "flex", gap: "var(--space-6)", flexShrink: 0 }}>
          {cols.map(c => (
            <div key={c.key} style={{ textAlign: "center", minWidth: 52 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--fg-strong)", fontVariantNumeric: "tabular-nums" }}>{items.filter(m => m[field] === c.key).length}</div>
              <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--fg-subtle)" }}>{c.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "var(--space-6) var(--space-7)" }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols.length}, minmax(244px, 1fr))`, gap: "var(--space-5)", minWidth: cols.length * 260, height: "100%" }}>
          {cols.map(col => {
            const cards = visible.filter(m => m[field] === col.key);
            const isOver = over === col.key;
            return (
              <div key={col.key}
                onDragOver={e => { e.preventDefault(); if (over !== col.key) setOver(col.key); }}
                onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setOver(c => c === col.key ? null : c); }}
                onDrop={e => { e.preventDefault(); drop(col.key); }}
                style={{ display: "flex", flexDirection: "column", minHeight: 0, borderRadius: "var(--radius-lg)", outline: isOver ? "2px dashed var(--border-strong)" : "2px dashed transparent", outlineOffset: 4, background: isOver ? "var(--bg-subtle)" : "transparent", transition: "background var(--dur-fast)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 4px 12px" }}>
                  <window.Icon name={col.icon} size={15} color="var(--fg-muted)" />
                  <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--fg-default)" }}>{col.label}</span>
                  <Badge variant="neutral" size="sm">{cards.length}</Badge>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", overflow: "auto", paddingRight: 2, flex: 1 }}>
                  {cards.length === 0 && <div style={{ padding: "var(--space-6)", textAlign: "center", fontSize: 12.5, color: "var(--fg-subtle)", border: "1px dashed var(--border-default)", borderRadius: "var(--radius-lg)" }}>{isOver ? "Drop here" : "Empty"}</div>}
                  {cards.map(m => {
                    const c = ctx.cell;
                    const adv = ctx.advance && ctx.advance[m[field]];
                    const dragging = dragId === m.id;
                    const accent = c.accent ? c.accent(m) : "var(--border-default)";
                    return (
                      <div key={m.id} draggable
                        onDragStart={e => { setDragId(m.id); e.dataTransfer.effectAllowed = "move"; }}
                        onDragEnd={() => { setDragId(null); setOver(null); }}
                        onClick={() => api.open(m)}
                        style={{ cursor: "grab", background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderLeft: `3px solid ${accent}`, borderRadius: "var(--radius-lg)", padding: "var(--space-4) var(--space-5)", display: "flex", flexDirection: "column", gap: 10, boxShadow: "var(--shadow-xs)", opacity: dragging ? 0.4 : 1, transition: "opacity var(--dur-fast)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {c.badges ? c.badges(m) : null}
                          <span style={{ flex: 1 }} />
                          {c.time && <span style={{ fontSize: 11.5, color: "var(--fg-subtle)" }}>{c.time(m)}</span>}
                          <window.Icon name="grip-vertical" size={14} color="var(--fg-subtle)" />
                        </div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--fg-strong)", lineHeight: 1.35 }}>{c.title(m)}</div>
                        {c.meta && <div style={{ fontSize: 11.5, color: "var(--fg-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.meta(m)}</div>}
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {c.value ? c.value(m) : <span />}
                          <span style={{ flex: 1 }} />
                          {adv && (
                            <span onClick={e => e.stopPropagation()} style={{ display: "inline-flex" }}>
                              <Button variant="ghost" size="sm" leading={adv.icon} onClick={() => api.setStatus(m.id, adv.to, `${adv.label}d`)}>{adv.label}</Button>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────── the app shell ───────────────────────────── */
const TENANT = "CDS SaaS";

function InboxApp({ onLogout }) {
  const { Sidebar, Avatar, Input, ToggleGroup, Button, Icon } = window;
  const contexts = window.INBOX_CONTEXTS;
  const [activeId, setActiveId] = useEng(contexts[0].id);

  const [store, setStore] = useEng(() => {
    const s = {};
    contexts.forEach(c => { s[c.id] = { items: c.seed.map(x => ({ ...x })), selId: c.seed[0]?.id ?? null, feed: c.defaultFeed || "all", filter: "all", query: "", view: c.views[0] }; });
    return s;
  });

  const ctx = contexts.find(c => c.id === activeId);
  const slice = store[activeId];
  const upd = patch => setStore(s => ({ ...s, [activeId]: { ...s[activeId], ...patch } }));
  const setItem = (id, patch) => setStore(s => ({ ...s, [activeId]: { ...s[activeId], items: s[activeId].items.map(m => m.id === id ? { ...m, ...patch } : m) } }));

  const items = slice.items;
  const matchFeed = m => ctx.matchFeed(m, slice.feed);
  const matchFilter = m => !ctx.filters || slice.filter === "all" || m[ctx.filterField] === slice.filter;
  const matchQuery = m => !slice.query || ctx.searchFields.some(f => String(m[f] || "").toLowerCase().includes(slice.query.toLowerCase()));
  const visible = items.filter(m => matchFeed(m) && matchFilter(m) && matchQuery(m));
  const boardItems = items.filter(m => matchFilter(m) && matchQuery(m));
  const shown = slice.view === "board" ? boardItems : visible;
  const sel = items.find(m => m.id === slice.selId);

  const api = {
    selId: slice.selId,
    open: m => { upd({ selId: m.id }); if (m.seen === false) setItem(m.id, { seen: true }); },
    setItem,
    setStatus: (id, key, note) => { setItem(id, { [ctx.statusField]: key, seen: true }); if (note) window.toast?.info?.(note); },
    toast: window.toast,
  };

  const feeds = ctx.feeds(items);
  const views = ctx.views;

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg-app)" }}>
      <Sidebar
        items={feeds} active={slice.feed} onSelect={f => upd({ feed: f })} width={244}
        brand={<WorkspaceSwitcher contexts={contexts} activeId={activeId} onSelect={setActiveId} tenant={TENANT} />}
        footer={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar name="Eduardo Sicsu" size={30} status="online" />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg-strong)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Eduardo Sicsu</div>
              <div style={{ fontSize: 11.5, color: "var(--fg-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ctx.footerNote || "CDS SaaS workspace"}</div>
            </div>
            {onLogout && (
              <button onClick={onLogout} title="Sign out"
                style={{ appearance: "none", border: 0, background: "transparent", padding: 4, cursor: "pointer", color: "var(--fg-muted)", display: "inline-flex", borderRadius: "var(--radius-sm)", flexShrink: 0 }}>
                <Icon name="log-out" size={14} />
              </button>
            )}
          </div>
        }
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "var(--space-4) var(--space-7)", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-canvas)", flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--fg-strong)" }}>{ctx.feedTitle(slice.feed)}</h1>
            <div style={{ fontSize: 12.5, color: "var(--fg-muted)", marginTop: 2 }}>{ctx.headerStat(items, shown)}</div>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ width: 220 }}>
            <Input leading="search" placeholder={ctx.search} size="sm" value={slice.query} onChange={v => upd({ query: v })} />
          </div>
          {ctx.filters && (
            <ToggleGroup type="single" size="sm" variant="pill" value={slice.filter} onChange={v => upd({ filter: v || "all" })}
              items={[{ value: "all", label: "All" }, ...ctx.filters]} />
          )}
          {views.length > 1 && (
            <ToggleGroup type="single" size="sm" value={slice.view} onChange={v => v && upd({ view: v })}
              items={views.map(v => ({ value: v, icon: VIEW_META[v].icon, tooltip: VIEW_META[v].tooltip, ariaLabel: VIEW_META[v].tooltip }))} />
          )}
          <Button variant="primary" size="sm" leading={ctx.primaryAction.icon} onClick={() => window.toast?.success?.(ctx.primaryAction.label)}>{ctx.primaryAction.label}</Button>
        </div>

        <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
          {slice.view === "split" && <SplitView ctx={ctx} visible={visible} sel={sel} api={api} />}
          {slice.view === "table" && <TableView key={activeId} ctx={ctx} visible={visible} api={api} />}
          {slice.view === "board" && <BoardView key={activeId} ctx={ctx} visible={boardItems} items={boardItems} api={api} />}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { WorkspaceSwitcher, SplitView, TableView, BoardView, InboxApp });
