// Custom DS — data & analytics surfaces: StatCard, ActivityFeed, UsageBar.
// Inline styles, semantic tokens only. Exported to window.

const { useState: usePatS } = React;

/* ── shared helpers ─────────────────────────────────────────── */
const ICON_FG = {
  brand: "var(--fg-brand)", success: "var(--fg-success)", warning: "var(--fg-warning)",
  danger: "var(--fg-danger)", info: "var(--fg-info)", neutral: "var(--fg-muted)",
};
const ICON_BG = {
  brand: "var(--bg-brand-subtle)", success: "var(--bg-success-subtle)", warning: "var(--bg-warning-subtle)",
  danger: "var(--bg-danger-subtle)", info: "var(--bg-info-subtle)", neutral: "var(--bg-muted)",
};

function relTime(input) {
  const then = input instanceof Date ? input.getTime() : new Date(input).getTime();
  if (isNaN(then)) return String(input);
  const diff = Math.round((Date.now() - then) / 1000); // seconds
  const abs = Math.abs(diff);
  const units = [
    [60, "second", 1], [3600, "minute", 60], [86400, "hour", 3600],
    [604800, "day", 86400], [2592000, "week", 604800], [31536000, "month", 2592000],
    [Infinity, "year", 31536000],
  ];
  if (abs < 45) return "just now";
  for (const [limit, name, div] of units) {
    if (abs < limit) {
      const n = Math.round(abs / div);
      return `${n} ${name}${n !== 1 ? "s" : ""} ${diff < 0 ? "from now" : "ago"}`;
    }
  }
  return "just now";
}

function dayKey(input) {
  const d = input instanceof Date ? input : new Date(input);
  const today = new Date(); const yest = new Date(); yest.setDate(today.getDate() - 1);
  const same = (a, b) => a.toDateString() === b.toDateString();
  if (same(d, today)) return "Today";
  if (same(d, yest)) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: d.getFullYear() === today.getFullYear() ? undefined : "numeric" });
}

/* ─────────────────────────────────────────────────────────────────────────
   STAT CARD — a single KPI/metric tile for dashboards.
   <StatCard label value trend={{value,direction,label}} icon iconColor sparkline loading size />
   ───────────────────────────────────────────────────────────────────────── */
function StatCard({ label, value, trend, icon, iconColor = "brand", sparkline, loading, size = "md", style }) {
  const sz = {
    sm: { pad: "var(--space-5)", value: "var(--text-2xl)", ic: 32, icon: 16 },
    md: { pad: "var(--space-6)", value: "var(--text-3xl)", ic: 38, icon: 18 },
    lg: { pad: "var(--space-7)", value: "var(--text-4xl)", ic: 44, icon: 22 },
  }[size];

  if (loading) {
    return (
      <Card padding={sz.pad} style={style}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <Skeleton width={96} height={12} />
          <Skeleton width={130} height={Number(sz.ic)} />
          <Skeleton width={72} height={12} />
        </div>
      </Card>
    );
  }

  const dir = trend?.direction || "neutral";
  const trendColor = dir === "up" ? "var(--fg-success)" : dir === "down" ? "var(--fg-danger)" : "var(--fg-muted)";
  const trendIcon = dir === "up" ? "trending-up" : dir === "down" ? "trending-down" : "minus";

  return (
    <Card padding={sz.pad} style={style}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-4)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", minWidth: 0 }}>
          <span style={{ fontSize: "var(--text-sm)", fontWeight: 550, color: "var(--fg-muted)", lineHeight: 1.3 }}>{label}</span>
          <span style={{ fontSize: sz.value, fontWeight: 740, letterSpacing: "var(--tracking-tight)", color: "var(--fg-strong)", lineHeight: 1.05, fontVariantNumeric: "tabular-nums" }}>
            {value}
          </span>
          {trend && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--text-sm)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontWeight: 600, color: trendColor }}>
                <Icon name={trendIcon} size={15} />{Math.abs(trend.value)}%
              </span>
              {trend.label && <span style={{ color: "var(--fg-subtle)" }}>{trend.label}</span>}
            </span>
          )}
        </div>
        {icon && (
          <span style={{
            flexShrink: 0, width: sz.ic, height: sz.ic, borderRadius: "var(--radius-md)",
            background: ICON_BG[iconColor], color: ICON_FG[iconColor],
            display: "inline-flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name={icon} size={sz.icon} />
          </span>
        )}
      </div>
      {sparkline && sparkline.length > 1 && <Sparkline data={sparkline} />}
    </Card>
  );
}

function Sparkline({ data, width = 132, height = 36 }) {
  const min = Math.min(...data), max = Math.max(...data);
  const span = max - min || 1;
  const stepX = width / (data.length - 1);
  const pts = data.map((v, i) => [i * stepX, height - 4 - ((v - min) / span) * (height - 8)]);
  const line = pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `0,${height} ${line} ${width},${height}`;
  const gid = "spark_" + Math.random().toString(36).slice(2, 8);
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none"
      style={{ marginTop: "var(--space-4)", display: "block", overflow: "visible" }} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--bg-brand)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--bg-brand)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gid})`} />
      <polyline points={line} fill="none" stroke="var(--fg-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   ACTIVITY FEED — chronological event list (audit logs, timelines, CRM).
   <ActivityFeed items={[{id,actor,action,target,timestamp,icon,iconColor,metadata}]}
                 groupByDate maxVisible loading emptyState />
   ───────────────────────────────────────────────────────────────────────── */
function ActivityFeed({ items = [], loading, emptyState, groupByDate, maxVisible }) {
  const [expanded, setExpanded] = usePatS(false);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", padding: "var(--space-2) 0" }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ display: "flex", gap: "var(--space-4)", alignItems: "flex-start" }}>
            <Skeleton circle size={32} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <Skeleton width={i % 2 ? "62%" : "48%"} height={13} />
              <Skeleton width={84} height={11} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return emptyState ?? <Empty icon="history" title="No activity yet" description="Events will show up here as they happen." />;
  }

  const visible = !expanded && maxVisible ? items.slice(0, maxVisible) : items;
  const hidden = items.length - visible.length;

  // build a flat render list with optional date separators
  const rows = [];
  let lastDay = null;
  visible.forEach((it, i) => {
    if (groupByDate && it.timestamp) {
      const k = dayKey(it.timestamp);
      if (k !== lastDay) { rows.push({ sep: k, key: "sep-" + k }); lastDay = k; }
    }
    rows.push({ item: it, key: it.id ?? i, last: i === visible.length - 1 });
  });

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {rows.map((r) =>
        r.sep ? (
          <div key={r.key} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--fg-subtle)", padding: "var(--space-4) 0 var(--space-3)" }}>
            {r.sep}
          </div>
        ) : (
          <ActivityItem key={r.key} item={r.item} last={r.last && hidden <= 0} />
        )
      )}
      {hidden > 0 && (
        <div style={{ paddingTop: "var(--space-3)", paddingLeft: 44 }}>
          <Button variant="ghost" size="sm" trailing="chevron-down" onClick={() => setExpanded(true)}>
            Show {hidden} more
          </Button>
        </div>
      )}
    </div>
  );
}

function ActivityItem({ item, last }) {
  const color = item.iconColor || "neutral";
  return (
    <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "stretch" }}>
      {/* rail */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        {item.actor?.avatar || item.actor?.name && !item.icon ? (
          <Avatar name={item.actor.name} src={item.actor.avatar} size={32} />
        ) : (
          <span style={{
            width: 32, height: 32, borderRadius: "50%",
            background: ICON_BG[color], color: ICON_FG[color],
            border: "2px solid var(--bg-surface)",
            display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Icon name={item.icon || "circle"} size={15} />
          </span>
        )}
        {!last && <span aria-hidden="true" style={{ flex: 1, width: 2, minHeight: 12, background: "var(--border-subtle)", marginTop: 4 }} />}
      </div>

      {/* body */}
      <div style={{ flex: 1, minWidth: 0, paddingBottom: last ? 0 : "var(--space-6)" }}>
        <div style={{ fontSize: "var(--text-sm)", lineHeight: 1.5, color: "var(--fg-muted)" }}>
          {item.actor?.name && <span style={{ fontWeight: 650, color: "var(--fg-strong)" }}>{item.actor.name} </span>}
          {item.action}
          {item.target && <span style={{ color: "var(--fg-default)", fontWeight: 500 }}> {item.target}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginTop: 3, flexWrap: "wrap" }}>
          {item.timestamp && (
            <span style={{ fontSize: "var(--text-xs)", color: "var(--fg-subtle)" }}>{relTime(item.timestamp)}</span>
          )}
          {item.metadata && (
            <span style={{ fontSize: "var(--text-xs)", color: "var(--fg-subtle)", fontFamily: "var(--font-mono)" }}>{item.metadata}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   USAGE BAR — labeled quota bar; color shifts warning/danger by fill.
   <UsageBar label used total unit thresholds={{warning,danger}} size showValues />
   ───────────────────────────────────────────────────────────────────────── */
function UsageBar({ label, used = 0, total = 100, unit, thresholds = { warning: 0.8, danger: 0.95 }, size = "md", showValues = true }) {
  const frac = total > 0 ? Math.min(1, used / total) : 0;
  const pct = Math.round(frac * 100);
  const level = frac >= (thresholds.danger ?? 0.95) ? "danger" : frac >= (thresholds.warning ?? 0.8) ? "warning" : "brand";
  const fill = { brand: "var(--bg-brand)", warning: "var(--bg-warning)", danger: "var(--bg-danger)" }[level];
  const valueColor = level === "danger" ? "var(--fg-danger)" : level === "warning" ? "var(--fg-warning)" : "var(--fg-default)";
  const h = size === "sm" ? 6 : 8;
  const fmt = (n) => (typeof n === "number" ? n.toLocaleString() : n);

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      {(label || showValues) && (
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--space-4)" }}>
          {label && <span style={{ fontSize: "var(--text-sm)", fontWeight: 550, color: "var(--fg-default)" }}>{label}</span>}
          {showValues && (
            <span style={{ fontSize: "var(--text-sm)", fontVariantNumeric: "tabular-nums", color: "var(--fg-muted)" }}>
              <span style={{ fontWeight: 650, color: valueColor }}>{fmt(used)}</span>
              {" of "}{fmt(total)}{unit ? ` ${unit}` : ""}
            </span>
          )}
        </div>
      )}
      <div role="progressbar" aria-valuenow={used} aria-valuemin={0} aria-valuemax={total}
        aria-label={label ? `${label} usage` : "Usage"}
        style={{ height: h, background: "var(--bg-muted)", borderRadius: 9999, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: fill, borderRadius: 9999, transition: "width var(--dur-base) var(--ease-out), background var(--dur-base) var(--ease-default)" }} />
      </div>
    </div>
  );
}

Object.assign(window, { StatCard, ActivityFeed, UsageBar });
