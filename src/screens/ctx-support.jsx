/* ctx-support.jsx — Customer support (helpdesk tickets & SLA). Inbox context #2. */
(function () {
  const { Tile, MetaGrid, DetailShell, SectionTitle } = window;

  const PRI = {
    urgent: { label: "Urgent", variant: "danger", color: "var(--fg-danger)", accent: "var(--bg-danger)", tile: "color-mix(in oklab, var(--bg-danger-subtle) 72%, var(--bg-canvas))" },
    high: { label: "High", variant: "warning", color: "var(--fg-warning)", accent: "var(--bg-warning)", tile: "color-mix(in oklab, var(--bg-warning-subtle) 78%, var(--bg-canvas))" },
    normal: { label: "Normal", variant: "info", color: "var(--fg-info)", accent: "var(--bg-info)", tile: "color-mix(in oklab, var(--bg-info-subtle) 78%, var(--bg-canvas))" },
    low: { label: "Low", variant: "neutral", color: "var(--fg-muted)", accent: "var(--border-strong)", tile: "var(--bg-muted)" },
  };
  const STATUS = { open: { label: "Open", variant: "brand" }, pending: { label: "Pending", variant: "warning" }, hold: { label: "On hold", variant: "neutral" }, solved: { label: "Solved", variant: "success" } };
  const CHAN = { email: { label: "Email", icon: "mail" }, chat: { label: "Chat", icon: "message-circle" }, phone: { label: "Phone", icon: "phone" }, social: { label: "Social", icon: "at-sign" } };
  const active = m => m.status === "open" || m.status === "pending";

  function Sla({ sla }) {
    if (!sla) return <span style={{ fontSize: 11.5, color: "var(--fg-subtle)" }}>—</span>;
    const c = { breach: "var(--fg-danger)", warn: "var(--fg-warning)", ok: "var(--fg-success)" }[sla.state];
    return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 600, color: c, fontVariantNumeric: "tabular-nums" }}>
      <window.Icon name={sla.state === "breach" ? "alert-circle" : "clock"} size={12} color="currentColor" />{sla.label}</span>;
  }

  const SEED = [
    { id: 1, requester: "Marcus Lindqvist", company: "Atlas Freight", subject: "Cannot export monthly invoice as PDF", channel: "email", priority: "urgent", status: "open", assignee: null, time: "8m ago", seen: false, sla: { label: "29m left", state: "warn" }, body: "Hi — every time I click “Export PDF” on the invoices screen I get a spinner that never resolves. This is blocking our month-end close which is due today.\n\nI've tried Chrome and Safari, both fail the same way. Account: atlas-freight (Business plan)." },
    { id: 2, requester: "Yuki Tanaka", company: "Meridian Health", subject: "SSO login redirect loop after SAML change", channel: "chat", priority: "urgent", status: "open", assignee: "Priya Anand", time: "21m ago", seen: false, sla: { label: "12m left", state: "warn" }, body: "Since this morning, staff signing in through Okta get bounced between the IdP and your login page indefinitely. ~40 users affected.\n\nWe rotated our SAML signing certificate yesterday evening — could that be related?" },
    { id: 3, requester: "Dittmar GmbH", company: "Dittmar GmbH", subject: "Request: add seats to Enterprise plan", channel: "email", priority: "normal", status: "pending", assignee: "Dana Reyes", time: "1h ago", seen: true, sla: { label: "5h left", state: "ok" }, body: "We'd like to add 25 seats to our current Enterprise agreement, effective next billing cycle. Please advise on prorated cost and whether this changes our support tier." },
    { id: 4, requester: "Olivia Bennett", company: "Northstar Media", subject: "How do I bulk-import contacts from CSV?", channel: "chat", priority: "low", status: "open", assignee: null, time: "2h ago", seen: true, sla: { label: "1d left", state: "ok" }, body: "New here — I have about 4,000 contacts in a spreadsheet. Is there a supported way to import them in one go, and what columns do you expect?" },
    { id: 5, requester: "Raj Malhotra", company: "Kestrel Labs", subject: "Webhook signatures intermittently invalid", channel: "email", priority: "high", status: "pending", assignee: "Priya Anand", time: "3h ago", seen: true, sla: { label: "2h left", state: "warn" }, body: "Roughly 1 in 20 webhook deliveries fail HMAC verification on our end. The payload looks intact, so we suspect a trailing-newline or encoding difference. Can you confirm the exact bytes you sign?" },
    { id: 6, requester: "Sofia Reyes", company: "Cobalt Studios", subject: "Refund processed but not reflected", channel: "phone", priority: "high", status: "open", assignee: null, time: "4h ago", seen: false, sla: { label: "Breached", state: "breach" }, body: "I was told a refund of $480 was processed three days ago but it hasn't appeared on my statement. Calling because the chat queue was long. Order #DF-22910." },
    { id: 7, requester: "Tom Becker", company: "Lighthouse Co.", subject: "Feature request: dark mode for reports", channel: "social", priority: "low", status: "solved", assignee: "Dana Reyes", time: "Yesterday", seen: true, sla: null, body: "Loving the product! One ask from our analysts who work late — a dark theme for the reporting views would be easy on the eyes. Replied that it's on the roadmap for Q3." },
    { id: 8, requester: "Amélie Laurent", company: "Verdant Inc.", subject: "Duplicate charge on annual renewal", channel: "email", priority: "normal", status: "solved", assignee: "Dana Reyes", time: "Yesterday", seen: true, sla: null, body: "We were charged twice for our annual renewal. Confirmed the duplicate and issued a refund of $1,200 — should land in 5–7 business days. Closing this out." },
  ];

  function Detail({ m, api }) {
    const { Button, IconButton, Tooltip, Badge, Avatar, Composer } = window;
    return (
      <DetailShell
        tools={<>
          <Tooltip content="Assign to me"><IconButton icon="user-plus" variant="ghost" size="sm" ariaLabel="Assign" onClick={() => api.setItem(m.id, { assignee: "Dana Reyes" })} /></Tooltip>
          <Tooltip content="Merge ticket"><IconButton icon="git-merge" variant="ghost" size="sm" ariaLabel="Merge" /></Tooltip>
          <Tooltip content="Snooze"><IconButton icon="clock" variant="ghost" size="sm" ariaLabel="Snooze" onClick={() => api.setStatus(m.id, "pending", "Marked pending")} /></Tooltip>
        </>}
        actions={<>
          <Button variant="outline" size="sm" leading="corner-up-left" disabled={m.status === "solved"} onClick={() => api.setStatus(m.id, "pending", "Awaiting customer")}>Pending</Button>
          <Button variant="primary" size="sm" leading="check" disabled={m.status === "solved"} onClick={() => { api.setStatus(m.id, "solved"); window.toast?.success?.("Ticket solved"); }}>Solve</Button>
        </>}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: "var(--space-6)" }}>
          <Avatar name={m.requester} size={44} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--fg-strong)", letterSpacing: "-0.01em" }}>{m.subject}</div>
            <div style={{ fontSize: 13, color: "var(--fg-muted)", marginTop: 2 }}>{m.requester} · {m.company}</div>
          </div>
        </div>
        <MetaGrid rows={[
          ["Status", <Badge variant={STATUS[m.status].variant} dot>{STATUS[m.status].label}</Badge>],
          ["Priority", <Badge variant={PRI[m.priority].variant} dot>{PRI[m.priority].label}</Badge>],
          ["Channel", <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13.5, color: "var(--fg-default)" }}><window.Icon name={CHAN[m.channel].icon} size={15} color="var(--fg-muted)" />{CHAN[m.channel].label}</span>],
          ["SLA", <Sla sla={m.sla} />],
          ["Requester", <span style={{ fontSize: 13.5, color: "var(--fg-default)" }}>{m.requester}</span>],
          ["Assignee", m.assignee ? <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Avatar name={m.assignee} size={22} /><span style={{ fontSize: 13.5, color: "var(--fg-default)" }}>{m.assignee}</span></span> : <span style={{ fontSize: 13.5, color: "var(--fg-subtle)" }}>Unassigned</span>],
        ]} />
        <SectionTitle>Message</SectionTitle>
        <div style={{ fontSize: 14.5, lineHeight: 1.65, color: "var(--fg-default)", whiteSpace: "pre-wrap" }}>{m.body}</div>
        <Composer label="Reply to customer" placeholder="Type your reply…" primaryLabel="Send reply" primaryIcon="send" />
      </DetailShell>
    );
  }

  (window.INBOX_CONTEXTS = window.INBOX_CONTEXTS || []).push({
    id: "support", label: "Customer Support", sublabel: "Helpdesk & SLA", icon: "life-buoy",
    search: "Search tickets…", views: ["split", "table"], statusField: "status", STATUS,
    filterField: "priority", filters: [{ value: "urgent", label: "Urgent" }, { value: "high", label: "High" }, { value: "normal", label: "Normal" }, { value: "low", label: "Low" }],
    searchFields: ["subject", "requester", "company"], primaryAction: { label: "New ticket", icon: "plus" },
    footerNote: "Support · Tier 2", seed: SEED,
    feeds(items) {
      const open = items.filter(m => m.status === "open").length;
      return [{ group: "Views" },
        { id: "all", label: "All tickets", icon: "inbox", badge: open || undefined },
        { id: "unassigned", label: "Unassigned", icon: "user-x" },
        { id: "mine", label: "Assigned to me", icon: "user-check" },
        { id: "pending", label: "Pending", icon: "clock" },
        { id: "solved", label: "Solved", icon: "check-circle" },
        { group: "Channels" },
        { id: "ch:email", label: "Email", icon: "mail" },
        { id: "ch:chat", label: "Chat", icon: "message-circle" },
        { id: "ch:phone", label: "Phone", icon: "phone" },
        { id: "ch:social", label: "Social", icon: "at-sign" }];
    },
    feedTitle: f => f === "all" ? "All tickets" : f.startsWith("ch:") ? CHAN[f.slice(3)].label + " tickets"
      : { unassigned: "Unassigned", mine: "Assigned to me", pending: "Pending", solved: "Solved" }[f],
    matchFeed(m, f) {
      if (f === "all") return true;
      if (f === "unassigned") return !m.assignee;
      if (f === "mine") return m.assignee === "Dana Reyes";
      if (f.startsWith("ch:")) return m.channel === f.slice(3);
      return m.status === f;
    },
    headerStat: (items, vis) => `${items.filter(m => m.status === "open").length} open · ${vis.length} shown`,
    cell: {
      leading: m => <window.Avatar name={m.requester} size={40} />,
      title: m => m.subject,
      meta: m => `${m.requester} · ${m.company}`,
      time: m => m.time,
      accent: m => active(m) ? PRI[m.priority].accent : "transparent",
      dim: m => m.status === "solved",
      unseen: m => !m.seen,
      badges: m => <><window.Badge variant={STATUS[m.status].variant} size="sm" dot>{STATUS[m.status].label}</window.Badge><window.Badge variant={PRI[m.priority].variant} size="sm">{PRI[m.priority].label}</window.Badge></>,
      value: m => <Sla sla={m.sla} />,
    },
    columns: [
      { head: "Status", cell: m => <window.Badge variant={STATUS[m.status].variant} size="sm" dot>{STATUS[m.status].label}</window.Badge> },
      { head: "Requester", cell: m => <div style={{ display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}><window.Avatar name={m.requester} size={24} /><div style={{ display: "flex", flexDirection: "column", gap: 0 }}><span style={{ fontWeight: 600, color: "var(--fg-strong)" }}>{m.requester}</span><span style={{ fontSize: 12, color: "var(--fg-muted)" }}>{m.company}</span></div></div> },
      { head: "Subject", cell: m => <span style={{ display: "block", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--fg-default)" }}>{m.subject}</span> },
      { head: "Channel", cell: m => <span style={{ display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", color: "var(--fg-default)" }}><window.Icon name={CHAN[m.channel].icon} size={14} color="var(--fg-muted)" />{CHAN[m.channel].label}</span> },
      { head: "Priority", cell: m => <window.Badge variant={PRI[m.priority].variant} size="sm" dot>{PRI[m.priority].label}</window.Badge> },
      { head: "SLA", cell: m => <Sla sla={m.sla} /> },
      { head: "Assignee", cell: m => m.assignee ? <span style={{ display: "inline-flex", alignItems: "center", gap: 7, whiteSpace: "nowrap" }}><window.Avatar name={m.assignee} size={22} /><span style={{ fontSize: 13 }}>{m.assignee.split(" ")[0]}</span></span> : <span style={{ color: "var(--fg-subtle)" }}>Unassigned</span> },
    ],
    bulk: [{ label: "Pending", icon: "clock", to: "pending" }, { label: "Solve", icon: "check", variant: "primary", to: "solved" }],
    Detail,
  });
})();
