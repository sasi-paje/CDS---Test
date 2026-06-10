/* ctx-approvals.jsx — Approvals (requests to approve / reject). Inbox context #3. */
(function () {
  const { Tile, MetaGrid, DetailShell, SectionTitle } = window;

  const TYPE = {
    expense: { label: "Expense", icon: "receipt", color: "var(--fg-info)", accent: "var(--bg-info)", tile: "color-mix(in oklab, var(--bg-info-subtle) 78%, var(--bg-canvas))" },
    access: { label: "Access", icon: "key-round", color: "var(--fg-warning)", accent: "var(--bg-warning)", tile: "color-mix(in oklab, var(--bg-warning-subtle) 80%, var(--bg-canvas))" },
    timeoff: { label: "Time off", icon: "palmtree", color: "var(--fg-success)", accent: "var(--bg-success)", tile: "color-mix(in oklab, var(--bg-success-subtle) 78%, var(--bg-canvas))" },
    purchase: { label: "Purchase", icon: "shopping-cart", color: "var(--fg-brand)", accent: "var(--bg-brand)", tile: "var(--bg-brand-subtle)" },
  };
  const STATUS = { pending: { label: "Pending", variant: "warning" }, approved: { label: "Approved", variant: "success" }, rejected: { label: "Rejected", variant: "danger" } };
  const money = n => "$" + n.toLocaleString("en-US");
  const detailValue = m => m.type === "expense" || m.type === "purchase" ? money(m.amount) : m.type === "timeoff" ? `${m.days} days` : m.scope;

  const SEED = [
    { id: 1, requester: "Marcus Lindqvist", type: "expense", title: "Client dinner — Atlas Freight Q2 review", amount: 412, submitted: "Today, 09:12", status: "pending", approver: "Dana Reyes", seen: false, justification: "Dinner with the Atlas Freight team after the Q2 business review. Four attendees including their VP of Ops. Itemised receipt attached; within the $150/head policy.", category: "Meals & entertainment" },
    { id: 2, requester: "Yuki Tanaka", type: "access", title: "Production database — read access", amount: 0, scope: "db-primary · read", submitted: "Today, 08:40", status: "pending", approver: "Dana Reyes", seen: false, justification: "Need read access to db-primary to investigate the recurring webhook signature mismatches reported by Kestrel Labs. Time-boxed to 14 days; happy to have it auto-expire.", category: "Engineering" },
    { id: 3, requester: "Olivia Bennett", type: "purchase", title: "Figma Organization — 12 seats", amount: 1740, submitted: "Yesterday", status: "pending", approver: "Dana Reyes", seen: true, justification: "Upgrading the design team from Professional to Organization for SSO and centralised admin. Annual, 12 seats. Replaces three separate Professional plans we currently expense.", category: "Software" },
    { id: 4, requester: "Raj Malhotra", type: "timeoff", title: "Paid time off — 5 days", amount: 0, days: 5, submitted: "Yesterday", status: "pending", approver: "Dana Reyes", seen: true, justification: "Family holiday, Jun 23–27. No releases scheduled that week; Priya will cover on-call. Cleared with the team in standup.", category: "Vacation" },
    { id: 5, requester: "Sofia Reyes", type: "expense", title: "Conference travel — DesignOps Summit", amount: 1280, submitted: "2 days ago", status: "approved", approver: "Dana Reyes", seen: true, justification: "Flights and two nights' hotel for the DesignOps Summit in Berlin. Speaking on our component pipeline. Approved — great visibility for the team.", category: "Travel" },
    { id: 6, requester: "Tom Becker", type: "access", title: "Billing admin — finance portal", amount: 0, scope: "billing · admin", submitted: "2 days ago", status: "rejected", approver: "Dana Reyes", seen: true, justification: "Requested standing admin access to the billing portal. Rejected — scope too broad for the task; granted time-limited read access instead and asked to re-request if write is genuinely needed.", category: "Finance" },
    { id: 7, requester: "Amélie Laurent", type: "purchase", title: "Standing desks — 4 units", amount: 2360, submitted: "3 days ago", status: "approved", approver: "Dana Reyes", seen: true, justification: "Four electric sit-stand desks for the new hires starting next month. Within the office fit-out budget for the quarter.", category: "Facilities" },
    { id: 8, requester: "Priya Anand", type: "expense", title: "Annual cloud certification", amount: 295, submitted: "4 days ago", status: "approved", approver: "Dana Reyes", seen: true, justification: "Renewal of professional cloud architecture certification, reimbursable under the learning budget.", category: "Learning & development" },
  ];

  function Value({ m }) {
    if (m.type === "expense" || m.type === "purchase") return <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--fg-strong)", fontVariantNumeric: "tabular-nums" }}>{money(m.amount)}</span>;
    if (m.type === "timeoff") return <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--fg-muted)" }}>{m.days} days</span>;
    return <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--fg-muted)", fontFamily: "var(--font-mono)" }}>{m.scope}</span>;
  }

  function Detail({ m, api }) {
    const { Button, IconButton, Tooltip, Badge, Avatar, Composer } = window;
    const T = TYPE[m.type];
    return (
      <DetailShell
        tools={<>
          <Tooltip content="Request changes"><IconButton icon="message-square" variant="ghost" size="sm" ariaLabel="Comment" /></Tooltip>
          <Tooltip content="Delegate"><IconButton icon="users" variant="ghost" size="sm" ariaLabel="Delegate" /></Tooltip>
          <Tooltip content="Forward"><IconButton icon="forward" variant="ghost" size="sm" ariaLabel="Forward" /></Tooltip>
        </>}
        actions={<>
          <Button variant="danger" size="sm" leading="x" disabled={m.status === "rejected"} onClick={() => api.setStatus(m.id, "rejected", "Request rejected")}>Reject</Button>
          <Button variant="primary" size="sm" leading="check" disabled={m.status === "approved"} onClick={() => { api.setStatus(m.id, "approved"); window.toast?.success?.("Request approved"); }}>Approve</Button>
        </>}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: "var(--space-6)" }}>
          <Tile icon={T.icon} color={T.color} bg={T.tile} size={46} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--fg-strong)", letterSpacing: "-0.01em" }}>{m.title}</div>
            <div style={{ fontSize: 13, color: "var(--fg-muted)", marginTop: 2 }}>{T.label} request · {m.requester}</div>
          </div>
          <span style={{ flex: 1 }} />
          {(m.type === "expense" || m.type === "purchase") && <span style={{ fontSize: 26, fontWeight: 700, color: "var(--fg-strong)", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{money(m.amount)}</span>}
        </div>
        <MetaGrid rows={[
          ["Status", <Badge variant={STATUS[m.status].variant} dot>{STATUS[m.status].label}</Badge>],
          ["Type", <Badge variant="neutral" leading={T.icon}>{T.label}</Badge>],
          ["Amount / scope", <span style={{ fontSize: 13.5, color: "var(--fg-default)", fontVariantNumeric: "tabular-nums" }}>{detailValue(m)}</span>],
          ["Category", <span style={{ fontSize: 13.5, color: "var(--fg-default)" }}>{m.category}</span>],
          ["Submitted", <span style={{ fontSize: 13.5, color: "var(--fg-default)" }}>{m.submitted}</span>],
          ["Requested by", <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Avatar name={m.requester} size={22} /><span style={{ fontSize: 13.5, color: "var(--fg-default)" }}>{m.requester}</span></span>],
        ]} />
        <SectionTitle>Justification</SectionTitle>
        <div style={{ fontSize: 14.5, lineHeight: 1.65, color: "var(--fg-default)", whiteSpace: "pre-wrap" }}>{m.justification}</div>
        <Composer label="Add a comment" placeholder="Add context for the requester…" primaryLabel="Comment" primaryIcon="message-square" />
      </DetailShell>
    );
  }

  (window.INBOX_CONTEXTS = window.INBOX_CONTEXTS || []).push({
    id: "approvals", label: "Approvals", sublabel: "Requests to review", icon: "check-square",
    search: "Search requests…", views: ["split", "board"], statusField: "status", STATUS,
    filterField: "type", filters: [{ value: "expense", label: "Expense" }, { value: "access", label: "Access" }, { value: "timeoff", label: "Time off" }, { value: "purchase", label: "Purchase" }],
    searchFields: ["title", "requester", "category"], primaryAction: { label: "New request", icon: "plus" },
    footerNote: "Approver · Operations", seed: SEED, defaultFeed: "pending-you",
    feeds(items) {
      const pending = items.filter(m => m.status === "pending").length;
      return [{ group: "Queue" },
        { id: "pending-you", label: "Pending you", icon: "inbox", badge: pending || undefined },
        { id: "all", label: "All requests", icon: "layers" },
        { id: "approved", label: "Approved", icon: "check-circle" },
        { id: "rejected", label: "Rejected", icon: "x-circle" },
        { group: "Types" },
        { id: "ty:expense", label: "Expenses", icon: "receipt" },
        { id: "ty:access", label: "Access", icon: "key-round" },
        { id: "ty:timeoff", label: "Time off", icon: "palmtree" },
        { id: "ty:purchase", label: "Purchases", icon: "shopping-cart" }];
    },
    feedTitle: f => f === "pending-you" ? "Pending your approval" : f === "all" ? "All requests"
      : f.startsWith("ty:") ? TYPE[f.slice(3)].label + " requests" : { approved: "Approved", rejected: "Rejected" }[f],
    matchFeed(m, f) {
      if (f === "all") return true;
      if (f === "pending-you") return m.status === "pending";
      if (f.startsWith("ty:")) return m.type === f.slice(3);
      return m.status === f;
    },
    headerStat: (items, vis) => `${items.filter(m => m.status === "pending").length} pending · ${vis.length} shown`,
    cell: {
      leading: m => <Tile icon={TYPE[m.type].icon} color={TYPE[m.type].color} bg={TYPE[m.type].tile} />,
      title: m => m.title,
      meta: m => `${TYPE[m.type].label} · ${m.requester}`,
      time: m => m.submitted,
      accent: m => m.status === "pending" ? TYPE[m.type].accent : "transparent",
      dim: m => m.status === "rejected",
      unseen: m => !m.seen,
      badges: m => <window.Badge variant={STATUS[m.status].variant} size="sm" dot>{STATUS[m.status].label}</window.Badge>,
      value: m => <Value m={m} />,
    },
    board: { progressLabel: "Decisions", columns: [
      { key: "pending", label: "Pending", icon: "clock" }, { key: "approved", label: "Approved", icon: "check-circle" }, { key: "rejected", label: "Rejected", icon: "x-circle" }] },
    advance: { pending: { label: "Approve", icon: "check", to: "approved" } },
    Detail,
  });
})();
