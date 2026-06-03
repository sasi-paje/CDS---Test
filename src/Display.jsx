// White-label data & display: Table, Skeleton, Separator, Empty, Pagination.

const { useState: useStS } = React;

/* ─────────────────────────────────────────────────────────────────────────
   SEPARATOR
   <Separator />  or  <Separator orientation="vertical" />
   ───────────────────────────────────────────────────────────────────────── */
function Separator({ orientation = "horizontal", label, style }) {
  if (label) {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        color: "var(--fg-subtle)", fontSize: 11, fontWeight: 600,
        textTransform: "uppercase", letterSpacing: "0.06em", ...style,
      }}>
        <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
        <span>{label}</span>
        <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
      </div>
    );
  }
  const base = orientation === "vertical"
    ? { width: 1, alignSelf: "stretch", margin: "0 var(--space-3)" }
    : { height: 1, width: "100%", margin: "var(--space-5) 0" };
  return <div role="separator" aria-orientation={orientation}
    style={{ background: "var(--border-subtle)", ...base, ...style }} />;
}

/* ─────────────────────────────────────────────────────────────────────────
   SKELETON — animated loading placeholder
   <Skeleton width={120} height={16} />
   <Skeleton circle size={32} />
   ───────────────────────────────────────────────────────────────────────── */
function Skeleton({ width, height = 14, circle, size, style, className }) {
  const w = circle ? (size || 32) : (width || "100%");
  const h = circle ? (size || 32) : height;
  return (
    <span aria-hidden className={className} style={{
      display: "inline-block", width: w, height: h,
      borderRadius: circle ? "50%" : "var(--radius-sm)",
      background: "linear-gradient(90deg, var(--bg-muted) 0%, var(--bg-subtle) 50%, var(--bg-muted) 100%)",
      backgroundSize: "200% 100%",
      animation: "wlShimmer 1.4s linear infinite",
      ...style,
    }}>
      <style>{`@keyframes wlShimmer { 0%{background-position: 200% 0} 100%{background-position: -200% 0} }`}</style>
    </span>
  );
}

// Pre-built skeleton arrangements
function SkeletonText({ lines = 3, width }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={12}
          width={width || (i === lines - 1 ? "60%" : "100%")} />
      ))}
    </div>
  );
}

function SkeletonAvatar({ size = 40, withText }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Skeleton circle size={size} />
      {withText && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <Skeleton width={120} height={12} />
          <Skeleton width={80}  height={10} />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   EMPTY STATE
   <Empty icon="inbox" title="No messages" description="..." action={<Button>Compose</Button>} />
   ───────────────────────────────────────────────────────────────────────── */
function Empty({ icon = "inbox", title, description, action, size = "md", style }) {
  const sizes = { sm: { pad: 24, ic: 28, fs: 14 }, md: { pad: 40, ic: 36, fs: 16 }, lg: { pad: 64, ic: 48, fs: 18 } };
  const s = sizes[size];
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 10, padding: s.pad, textAlign: "center",
      background: "var(--bg-subtle)", border: "1px dashed var(--border-default)",
      borderRadius: "var(--radius-lg)", color: "var(--fg-muted)", ...style,
    }}>
      <div style={{
        width: s.ic + 24, height: s.ic + 24, borderRadius: "50%",
        background: "var(--bg-muted)", color: "var(--fg-subtle)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name={icon} size={s.ic} />
      </div>
      {title && <div style={{ fontSize: s.fs, fontWeight: 600, color: "var(--fg-default)" }}>{title}</div>}
      {description && <div style={{ fontSize: 13.5, maxWidth: 380, lineHeight: 1.5 }}>{description}</div>}
      {action && <div style={{ marginTop: 6 }}>{action}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   TABLE — composable primitives (shadcn-style)
   <Table><TableHeader><TableRow><TableHead>…</TableHead></TableRow></TableHeader>
          <TableBody><TableRow><TableCell>…</TableCell></TableRow></TableBody></Table>
   ───────────────────────────────────────────────────────────────────────── */
function Table({ children, dense, style }) {
  return (
    <div style={{ overflowX: "auto", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
      <table style={{
        width: "100%", borderCollapse: "separate", borderSpacing: 0,
        fontSize: 13.5, color: "var(--fg-default)", "--tbl-py": dense ? "8px" : "12px",
        ...style,
      }}>{children}</table>
    </div>
  );
}
function TableHeader({ children }) {
  return <thead style={{ background: "var(--bg-subtle)" }}>{children}</thead>;
}
function TableBody({ children }) { return <tbody>{children}</tbody>; }
function TableFooter({ children }) {
  return <tfoot style={{ background: "var(--bg-subtle)", borderTop: "1px solid var(--border-subtle)" }}>{children}</tfoot>;
}
function TableRow({ children, selected, onClick, hoverable = true, style, tint, tintHover }) {
  const [hover, setH] = useStS(false);
  // Resting background priority: explicit selected → severity/priority tint → default.
  const rest = tint || "transparent";
  const bg = selected
    ? "var(--bg-brand-subtle)"
    : hover && hoverable
      ? (tintHover || tint || "var(--bg-subtle)")
      : rest;
  return (
    <tr onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: bg,
        cursor: onClick ? "pointer" : "default",
        transition: "background var(--dur-fast)",
        ...style,
      }}>{children}</tr>
  );
}
function TableHead({ children, align = "left", width, sortable, sorted, onSort }) {
  return (
    <th onClick={sortable ? onSort : undefined}
      style={{
        padding: "10px 14px", textAlign: align, width,
        fontSize: 11.5, color: "var(--fg-subtle)", fontWeight: 600,
        letterSpacing: "0.04em", textTransform: "uppercase",
        borderBottom: "1px solid var(--border-subtle)",
        cursor: sortable ? "pointer" : "default", userSelect: "none",
        whiteSpace: "nowrap",
      }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        {children}
        {sortable && <Icon name={sorted === "asc" ? "chevron-up" : sorted === "desc" ? "chevron-down" : "chevrons-up-down"} size={12} color="var(--fg-subtle)" />}
      </span>
    </th>
  );
}
function TableCell({ children, align = "left", muted, mono, width }) {
  return (
    <td style={{
      padding: "var(--tbl-py, 12px) 14px", textAlign: align, width,
      fontSize: 13.5, color: muted ? "var(--fg-muted)" : "var(--fg-default)",
      fontFamily: mono ? "var(--font-mono)" : "inherit",
      fontVariantNumeric: mono ? "tabular-nums" : "normal",
      borderTop: "1px solid var(--border-subtle)", verticalAlign: "middle",
    }}>{children}</td>
  );
}
function TableCaption({ children }) {
  return <caption style={{ captionSide: "bottom", padding: 12, fontSize: 12, color: "var(--fg-muted)", textAlign: "left" }}>{children}</caption>;
}

/* ─────────────────────────────────────────────────────────────────────────
   PAGINATION
   <Pagination page={p} total={n} pageSize={20} onPage={setP} />
   ───────────────────────────────────────────────────────────────────────── */
function Pagination({ page = 1, total = 0, pageSize = 20, onPage, siblings = 1, showSummary = true }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pages = pageList(page, totalPages, siblings);
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);
  const goto = (p) => () => onPage && onPage(Math.max(1, Math.min(totalPages, p)));
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
      {showSummary && (
        <span style={{ fontSize: 13, color: "var(--fg-muted)" }}>
          Showing <b style={{ color: "var(--fg-default)" }}>{start}–{end}</b> of <b style={{ color: "var(--fg-default)" }}>{total.toLocaleString()}</b>
        </span>
      )}
      <nav role="navigation" aria-label="Pagination" style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <Button variant="outline" size="sm" iconOnly leading="chevrons-left"  ariaLabel="First"    disabled={page <= 1} onClick={goto(1)} />
        <Button variant="outline" size="sm" iconOnly leading="chevron-left"   ariaLabel="Previous" disabled={page <= 1} onClick={goto(page - 1)} />
        {pages.map((p, i) => p === "…"
          ? <span key={i} style={{ width: 32, textAlign: "center", color: "var(--fg-subtle)" }}>…</span>
          : <Button key={i} variant={p === page ? "primary" : "outline"} size="sm"
              onClick={goto(p)} style={{ minWidth: 32, padding: "0 8px" }}>{p}</Button>
        )}
        <Button variant="outline" size="sm" iconOnly leading="chevron-right"  ariaLabel="Next" disabled={page >= totalPages} onClick={goto(page + 1)} />
        <Button variant="outline" size="sm" iconOnly leading="chevrons-right" ariaLabel="Last" disabled={page >= totalPages} onClick={goto(totalPages)} />
      </nav>
    </div>
  );
}
function pageList(page, total, sib = 1) {
  const range = (a, b) => { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; };
  if (total <= 7) return range(1, total);
  const left = Math.max(2, page - sib);
  const right = Math.min(total - 1, page + sib);
  const out = [1];
  if (left > 2) out.push("…");
  for (let i = left; i <= right; i++) out.push(i);
  if (right < total - 1) out.push("…");
  out.push(total);
  return out;
}

Object.assign(window, {
  Separator, Skeleton, SkeletonText, SkeletonAvatar, Empty,
  Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption,
  Pagination,
});
