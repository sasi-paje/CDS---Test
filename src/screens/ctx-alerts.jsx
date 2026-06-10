/* ctx-alerts.jsx — Operational alerts (on-call triage). Inbox context #1. */
(function () {
  const { Tile, ListRow, MetaGrid, DetailShell, SectionTitle } = window;

  const SEV = {
    critical: { label: "Critical", variant: "danger", icon: "alert-octagon", color: "var(--fg-danger)",
      tile: "color-mix(in oklab, var(--bg-danger-subtle) 72%, var(--bg-canvas))", accent: "var(--bg-danger)",
      tint: "color-mix(in oklab, var(--bg-danger-subtle) 38%, var(--bg-canvas))" },
    warning: { label: "Warning", variant: "warning", icon: "alert-triangle", color: "var(--fg-warning)",
      tile: "color-mix(in oklab, var(--bg-warning-subtle) 78%, var(--bg-canvas))", accent: "var(--bg-warning)",
      tint: "color-mix(in oklab, var(--bg-warning-subtle) 42%, var(--bg-canvas))" },
    info: { label: "Info", variant: "info", icon: "info", color: "var(--fg-info)",
      tile: "color-mix(in oklab, var(--bg-info-subtle) 78%, var(--bg-canvas))", accent: "var(--bg-info)",
      tint: "color-mix(in oklab, var(--bg-info-subtle) 40%, var(--bg-canvas))" },
  };
  const STATUS = {
    firing: { label: "Firing", variant: "danger" }, acknowledged: { label: "Acknowledged", variant: "info" },
    snoozed: { label: "Snoozed", variant: "neutral" }, resolved: { label: "Resolved", variant: "success" },
  };
  const SRC = { system: "System", security: "Security", billing: "Billing", integrations: "Integrations" };
  const live = m => m.status === "firing" || m.status === "acknowledged";

  const SEED = [
    { id: 1, title: "API error rate exceeded 5%", source: "system", resource: "api-gateway", severity: "critical", status: "firing", time: "2m ago", seen: false, occurrences: 142, firstSeen: "Today, 09:38", lastSeen: "Today, 09:41", assignee: null, body: "The 5xx error rate on api-gateway crossed the 5% threshold (currently 7.8%) for two consecutive evaluation windows.\n\nMost failures originate from the /v2/checkout route. Upstream latency to the payments service is elevated. Page the on-call engineer if the rate does not recover within 10 minutes." },
    { id: 2, title: "Payment webhook delivery failing", source: "billing", resource: "stripe-webhook", severity: "critical", status: "firing", time: "11m ago", seen: false, occurrences: 23, firstSeen: "Today, 09:30", lastSeen: "Today, 09:41", assignee: null, body: "23 outbound webhook deliveries to the billing processor returned HTTP 410 in the last 15 minutes.\n\nFailed events are queued for retry with exponential backoff. No invoices have been lost. Verify the endpoint signing secret was rotated correctly." },
    { id: 3, title: "Primary database CPU at 87%", source: "system", resource: "db-primary", severity: "warning", status: "acknowledged", time: "38m ago", seen: true, occurrences: 6, firstSeen: "Today, 09:03", lastSeen: "Today, 09:24", assignee: "Priya Anand", body: "Sustained CPU utilisation on db-primary has held above 85% for 30 minutes.\n\nThe nightly analytics rollup is overlapping with peak traffic. Consider deferring the rollup or scaling the read replica. Acknowledged by Priya — monitoring." },
    { id: 4, title: "TLS certificate expires in 7 days", source: "security", resource: "*.northwind.co", severity: "warning", status: "firing", time: "1h ago", seen: true, occurrences: 1, firstSeen: "Today, 08:40", lastSeen: "Today, 08:40", assignee: null, body: "The wildcard certificate for *.northwind.co expires on Jun 16, 2026.\n\nAuto-renewal is configured but the last ACME challenge failed. Renew manually or fix the DNS-01 challenge record before expiry to avoid downtime." },
    { id: 5, title: "Nightly data sync completed", source: "integrations", resource: "etl-nightly", severity: "info", status: "resolved", time: "3h ago", seen: true, occurrences: 1, firstSeen: "Today, 02:00", lastSeen: "Today, 02:14", assignee: null, body: "The scheduled overnight sync finished cleanly — 14,022 rows across 8 workspaces in 14 minutes.\n\nNo records were skipped. The export is available in the downloads panel for 7 days." },
    { id: 6, title: "Disk usage at 94% on storage-02", source: "system", resource: "storage-02", severity: "critical", status: "firing", time: "5m ago", seen: false, occurrences: 4, firstSeen: "Today, 09:21", lastSeen: "Today, 09:40", assignee: null, body: "Volume /data on storage-02 is at 94% capacity and climbing ~1.5% per hour.\n\nLog rotation is behind. Free space or expand the volume before it reaches 100% — writes will fail at saturation." },
    { id: 7, title: "Unusual sign-in from new location", source: "security", resource: "auth-service", severity: "warning", status: "snoozed", time: "Yesterday", seen: true, occurrences: 2, firstSeen: "Yesterday, 22:11", lastSeen: "Yesterday, 22:14", assignee: "Dana Reyes", body: "A sign-in to an admin account came from Lisbon, Portugal — a location not seen before for this user.\n\nThe session was challenged with MFA and passed. Snoozed by Dana pending confirmation from the account owner." },
    { id: 8, title: "Scheduled maintenance completed", source: "system", resource: "maintenance", severity: "info", status: "resolved", time: "Yesterday", seen: true, occurrences: 1, firstSeen: "Yesterday, 02:00", lastSeen: "Yesterday, 02:35", assignee: null, body: "The maintenance window for the database failover drill closed on schedule.\n\nAll services returned healthy. No customer-facing impact was recorded." },
  ];

  function Detail({ m, api }) {
    const { Button, IconButton, Tooltip, Badge, Avatar, Alert, Composer } = window;
    const S = SEV[m.severity];
    return (
      <DetailShell
        tools={<>
          <Tooltip content="Snooze 1 hour"><IconButton icon="clock" variant="ghost" size="sm" ariaLabel="Snooze" onClick={() => api.setStatus(m.id, "snoozed", "Snoozed for 1 hour")} /></Tooltip>
          <Tooltip content="Assign"><IconButton icon="user-plus" variant="ghost" size="sm" ariaLabel="Assign" /></Tooltip>
          <Tooltip content="Mute resource"><IconButton icon="bell-off" variant="ghost" size="sm" ariaLabel="Mute" /></Tooltip>
        </>}
        actions={<>
          <Button variant="outline" size="sm" leading="eye" disabled={m.status !== "firing"} onClick={() => api.setStatus(m.id, "acknowledged", "Alert acknowledged")}>Acknowledge</Button>
          <Button variant="primary" size="sm" leading="check" disabled={m.status === "resolved"} onClick={() => { api.setStatus(m.id, "resolved"); window.toast?.success?.("Alert resolved"); }}>Resolve</Button>
        </>}>
        <Alert variant={S.variant} title={m.title}>{S.label} · {SRC[m.source]} · first seen {m.firstSeen}</Alert>
        <MetaGrid rows={[
          ["Status", <Badge variant={STATUS[m.status].variant} dot>{STATUS[m.status].label}</Badge>],
          ["Severity", <Badge variant={S.variant} leading={S.icon}>{S.label}</Badge>],
          ["Resource", <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--fg-default)", whiteSpace: "nowrap" }}>{m.resource}</span>],
          ["Occurrences", <span style={{ fontSize: 13.5, color: "var(--fg-default)", fontVariantNumeric: "tabular-nums" }}>{m.occurrences}</span>],
          ["Last seen", <span style={{ fontSize: 13.5, color: "var(--fg-default)" }}>{m.lastSeen}</span>],
          ["Assignee", m.assignee ? <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Avatar name={m.assignee} size={22} /><span style={{ fontSize: 13.5, color: "var(--fg-default)" }}>{m.assignee}</span></span> : <span style={{ fontSize: 13.5, color: "var(--fg-subtle)" }}>Unassigned</span>],
        ]} />
        <SectionTitle>What happened</SectionTitle>
        <div style={{ fontSize: 14.5, lineHeight: 1.65, color: "var(--fg-default)", whiteSpace: "pre-wrap" }}>{m.body}</div>
        <Composer label="Add a note" placeholder="Leave context for the on-call team…" primaryLabel="Add note" primaryIcon="message-square" />
      </DetailShell>
    );
  }

  const Badge2 = window.Badge;

  (window.INBOX_CONTEXTS = window.INBOX_CONTEXTS || []).push({
    id: "alerts", label: "Operational Alerts", sublabel: "On-call triage", icon: "bell",
    search: "Search alerts…", views: ["split", "table", "board"], statusField: "status", STATUS,
    filterField: "severity", filters: [{ value: "critical", label: "Critical" }, { value: "warning", label: "Warning" }, { value: "info", label: "Info" }],
    searchFields: ["title", "resource"], primaryAction: { label: "New rule", icon: "plus" },
    footerNote: "On-call · this week", seed: SEED,
    feeds(items) {
      const firing = items.filter(m => m.status === "firing").length;
      return [{ group: "Feeds" },
        { id: "all", label: "All alerts", icon: "bell", badge: firing || undefined },
        { id: "unresolved", label: "Unresolved", icon: "alert-circle" },
        { id: "acknowledged", label: "Acknowledged", icon: "eye" },
        { id: "snoozed", label: "Snoozed", icon: "clock" },
        { id: "resolved", label: "Resolved", icon: "check-circle" },
        { group: "Sources" },
        { id: "src:system", label: "System", icon: "server" },
        { id: "src:security", label: "Security", icon: "shield" },
        { id: "src:billing", label: "Billing", icon: "credit-card" },
        { id: "src:integrations", label: "Integrations", icon: "plug" }];
    },
    feedTitle: f => f === "all" ? "All alerts" : f.startsWith("src:") ? SRC[f.slice(4)]
      : { unresolved: "Unresolved", acknowledged: "Acknowledged", snoozed: "Snoozed", resolved: "Resolved" }[f],
    matchFeed(m, f) {
      if (f === "all") return true;
      if (f === "unresolved") return live(m);
      if (f.startsWith("src:")) return m.source === f.slice(4);
      return m.status === f;
    },
    headerStat: (items, vis) => `${items.filter(m => m.status === "firing").length} firing · ${vis.length} shown`,
    cell: {
      leading: m => <Tile icon={SEV[m.severity].icon} color={SEV[m.severity].color} bg={SEV[m.severity].tile} />,
      title: m => m.title,
      meta: m => <span style={{ fontFamily: "var(--font-mono)" }}>{SRC[m.source]} · {m.resource}</span>,
      time: m => m.time,
      accent: m => live(m) ? SEV[m.severity].accent : "transparent",
      dim: m => m.status === "resolved",
      unseen: m => !m.seen,
      badges: m => <><window.Badge variant={STATUS[m.status].variant} size="sm" dot>{STATUS[m.status].label}</window.Badge>{m.occurrences > 1 && <span style={{ fontSize: 11.5, color: "var(--fg-subtle)", fontVariantNumeric: "tabular-nums" }}>×{m.occurrences}</span>}</>,
    },
    columns: [
      { head: "Status", cell: m => <window.Badge variant={STATUS[m.status].variant} size="sm" dot>{STATUS[m.status].label}</window.Badge> },
      { head: "Created", mono: true, muted: true, cell: m => <span style={{ whiteSpace: "nowrap" }}>{m.firstSeen}</span> },
      { head: "Source / Resource", cell: m => <div style={{ display: "flex", flexDirection: "column", gap: 1 }}><span style={{ fontWeight: 600, color: "var(--fg-strong)" }}>{SRC[m.source]}</span><span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg-muted)" }}>{m.resource}</span></div> },
      { head: "Severity", cell: m => <span style={{ display: "inline-flex", alignItems: "center", gap: 9, whiteSpace: "nowrap" }}><Tile icon={SEV[m.severity].icon} color={SEV[m.severity].color} bg={SEV[m.severity].tile} size={28} radius="var(--radius-md)" /><span style={{ fontSize: 13, fontWeight: 600, color: SEV[m.severity].color }}>{SEV[m.severity].label}</span></span> },
      { head: "Count", align: "right", mono: true, cell: m => m.occurrences },
      { head: "Assignee", cell: m => m.assignee ? <span style={{ display: "inline-flex", alignItems: "center", gap: 7, whiteSpace: "nowrap" }}><window.Avatar name={m.assignee} size={22} /><span style={{ fontSize: 13 }}>{m.assignee}</span></span> : <span style={{ color: "var(--fg-subtle)" }}>Unassigned</span> },
      { head: "Message", cell: m => <span style={{ display: "block", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--fg-default)" }}>{m.title}</span> },
    ],
    bulk: [{ label: "Acknowledge", icon: "eye", to: "acknowledged" }, { label: "Snooze", icon: "clock", to: "snoozed" }, { label: "Resolve", icon: "check", variant: "primary", to: "resolved" }],
    board: { progressLabel: "Triage progress", columns: [
      { key: "firing", label: "Firing", icon: "alert-circle" }, { key: "acknowledged", label: "Acknowledged", icon: "eye" },
      { key: "snoozed", label: "Snoozed", icon: "clock" }, { key: "resolved", label: "Resolved", icon: "check-circle" }] },
    advance: { firing: { label: "Acknowledge", icon: "eye", to: "acknowledged" }, acknowledged: { label: "Resolve", icon: "check", to: "resolved" }, snoozed: { label: "Resolve", icon: "check", to: "resolved" } },
    Detail,
  });
})();
