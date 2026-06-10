/* ctx-leads.jsx — Leads / CRM (incoming sales inquiries). Inbox context #4. */
(function () {
  const { Tile, MetaGrid, DetailShell, SectionTitle } = window;

  const STAGE = {
    new: { label: "New", variant: "info" }, contacted: { label: "Contacted", variant: "brand" },
    qualified: { label: "Qualified", variant: "warning" }, won: { label: "Won", variant: "success" },
    lost: { label: "Lost", variant: "neutral" },
  };
  const TEMP = {
    hot: { label: "Hot", icon: "flame", color: "var(--fg-danger)", accent: "var(--bg-danger)" },
    warm: { label: "Warm", icon: "thermometer-sun", color: "var(--fg-warning)", accent: "var(--bg-warning)" },
    cold: { label: "Cold", icon: "snowflake", color: "var(--fg-info)", accent: "var(--bg-info)" },
  };
  const SRC = { website: "Website", referral: "Referral", event: "Event", outbound: "Outbound" };
  const open = m => m.stage === "new" || m.stage === "contacted" || m.stage === "qualified";
  const money = n => "$" + n.toLocaleString("en-US");

  const SEED = [
    { id: 1, company: "Brightwave Logistics", contact: "Helena Vos", role: "VP Operations", value: 48000, source: "referral", stage: "qualified", temp: "hot", owner: "Dana Reyes", time: "12m ago", seen: false, notes: "Referred by Atlas Freight. 200-vehicle fleet, evaluating us against two competitors. Budget confirmed for Q3, decision by end of month. Wants a tailored demo of the routing analytics next week." },
    { id: 2, company: "Pinnacle Retail Group", contact: "Daniel Cho", role: "Head of IT", value: 92000, source: "outbound", stage: "new", temp: "warm", owner: null, time: "40m ago", seen: false, notes: "Responded to the Q2 outbound campaign. 14 store locations, looking to consolidate three tools into one platform. No timeline yet — needs internal buy-in from finance." },
    { id: 3, company: "Cedar & Stone Architects", contact: "Marcus Webb", role: "Principal", value: 18500, source: "website", stage: "contacted", temp: "warm", owner: "Priya Anand", time: "2h ago", seen: true, notes: "Inbound from the pricing page. Mid-size firm, 35 seats. Had a good intro call — interested in the collaboration features. Sending across the proposal and case studies today." },
    { id: 4, company: "Lumen Diagnostics", contact: "Aisha Khan", role: "COO", value: 134000, source: "event", stage: "qualified", temp: "hot", owner: "Dana Reyes", time: "Yesterday", seen: true, notes: "Met at the HealthTech Summit. Strong fit — compliance and audit trail are their priority. Security review scheduled; legal wants our SOC 2 report. High-value, moving fast." },
    { id: 5, company: "Northpeak Outdoors", contact: "Liam Foster", role: "Founder", value: 9500, source: "website", stage: "new", temp: "cold", owner: null, time: "Yesterday", seen: true, notes: "Free-trial signup that requested a call. Small team (8), early stage. Curious but price-sensitive — may be a better fit for the self-serve tier." },
    { id: 6, company: "Vanguard Capital", contact: "Sophie Tremblay", role: "Director", value: 76000, source: "referral", stage: "won", temp: "hot", owner: "Dana Reyes", time: "2 days ago", seen: true, notes: "Closed-won! Signed annual for 60 seats after a smooth security review. Kickoff scheduled for next Tuesday. Great reference potential in the finance vertical." },
    { id: 7, company: "Harbor Freight Co.", contact: "Owen Marsh", role: "Ops Manager", value: 22000, source: "outbound", stage: "lost", temp: "cold", owner: "Priya Anand", time: "3 days ago", seen: true, notes: "Went with an incumbent competitor on price. Worth revisiting in 6–9 months when their current contract renews. Left on good terms." },
    { id: 8, company: "Solstice Media", contact: "Nina Alvarez", role: "CMO", value: 41000, source: "event", stage: "contacted", temp: "warm", owner: "Dana Reyes", time: "3 days ago", seen: true, notes: "Booth conversation at AdWeek. Running a creative team of 40, frustrated with their current workflow tool. Demo booked for Thursday; bringing two stakeholders." },
  ];
  const NEXT = { new: "contacted", contacted: "qualified", qualified: "won" };

  function Detail({ m, api }) {
    const { Button, IconButton, Tooltip, Badge, Avatar, Composer } = window;
    const next = NEXT[m.stage];
    return (
      <DetailShell
        tools={<>
          <Tooltip content="Log a call"><IconButton icon="phone" variant="ghost" size="sm" ariaLabel="Call" /></Tooltip>
          <Tooltip content="Send email"><IconButton icon="mail" variant="ghost" size="sm" ariaLabel="Email" /></Tooltip>
          <Tooltip content="Schedule meeting"><IconButton icon="calendar-plus" variant="ghost" size="sm" ariaLabel="Schedule" /></Tooltip>
          {!m.owner && <Tooltip content="Claim lead"><IconButton icon="user-plus" variant="ghost" size="sm" ariaLabel="Claim" onClick={() => api.setItem(m.id, { owner: "Dana Reyes" })} /></Tooltip>}
        </>}
        actions={<>
          <Button variant="outline" size="sm" leading="x" disabled={m.stage === "lost" || m.stage === "won"} onClick={() => api.setStatus(m.id, "lost", "Marked lost")}>Mark lost</Button>
          {next
            ? <Button variant="primary" size="sm" trailing="arrow-right" onClick={() => api.setStatus(m.id, next, `Moved to ${STAGE[next].label}`)}>Move to {STAGE[next].label}</Button>
            : <Button variant="primary" size="sm" leading="check" disabled>{m.stage === "won" ? "Won" : "Lost"}</Button>}
        </>}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: "var(--space-6)" }}>
          <Avatar name={m.company} size={46} shape="square" />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--fg-strong)", letterSpacing: "-0.01em" }}>{m.company}</div>
            <div style={{ fontSize: 13, color: "var(--fg-muted)", marginTop: 2 }}>{m.contact} · {m.role}</div>
          </div>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: 26, fontWeight: 700, color: "var(--fg-strong)", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{money(m.value)}</span>
        </div>
        <MetaGrid rows={[
          ["Stage", <Badge variant={STAGE[m.stage].variant} dot>{STAGE[m.stage].label}</Badge>],
          ["Temperature", <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 600, color: TEMP[m.temp].color }}><window.Icon name={TEMP[m.temp].icon} size={15} color="currentColor" />{TEMP[m.temp].label}</span>],
          ["Deal value", <span style={{ fontSize: 13.5, color: "var(--fg-default)", fontVariantNumeric: "tabular-nums" }}>{money(m.value)}</span>],
          ["Source", <span style={{ fontSize: 13.5, color: "var(--fg-default)" }}>{SRC[m.source]}</span>],
          ["Contact", <span style={{ fontSize: 13.5, color: "var(--fg-default)" }}>{m.contact}</span>],
          ["Owner", m.owner ? <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Avatar name={m.owner} size={22} /><span style={{ fontSize: 13.5, color: "var(--fg-default)" }}>{m.owner}</span></span> : <span style={{ fontSize: 13.5, color: "var(--fg-subtle)" }}>Unassigned</span>],
        ]} />
        <SectionTitle>Notes</SectionTitle>
        <div style={{ fontSize: 14.5, lineHeight: 1.65, color: "var(--fg-default)", whiteSpace: "pre-wrap" }}>{m.notes}</div>
        <Composer label="Log activity" placeholder="Add a call summary, email or next step…" primaryLabel="Log activity" primaryIcon="plus" />
      </DetailShell>
    );
  }

  (window.INBOX_CONTEXTS = window.INBOX_CONTEXTS || []).push({
    id: "leads", label: "Sales Leads", sublabel: "CRM pipeline", icon: "trending-up",
    search: "Search leads…", views: ["split", "table", "board"], statusField: "stage", STATUS: STAGE,
    filterField: "temp", filters: [{ value: "hot", label: "Hot" }, { value: "warm", label: "Warm" }, { value: "cold", label: "Cold" }],
    searchFields: ["company", "contact"], primaryAction: { label: "New lead", icon: "plus" },
    footerNote: "Account executive", seed: SEED,
    feeds(items) {
      const fresh = items.filter(m => m.stage === "new").length;
      return [{ group: "Pipeline" },
        { id: "all", label: "All leads", icon: "users" },
        { id: "new", label: "New", icon: "sparkles", badge: fresh || undefined },
        { id: "contacted", label: "Contacted", icon: "phone-call" },
        { id: "qualified", label: "Qualified", icon: "badge-check" },
        { id: "won", label: "Won", icon: "trophy" },
        { id: "lost", label: "Lost", icon: "x-circle" },
        { group: "Sources" },
        { id: "sr:website", label: "Website", icon: "globe" },
        { id: "sr:referral", label: "Referral", icon: "gift" },
        { id: "sr:event", label: "Event", icon: "calendar" },
        { id: "sr:outbound", label: "Outbound", icon: "send" }];
    },
    feedTitle: f => f === "all" ? "All leads" : f.startsWith("sr:") ? SRC[f.slice(3)] + " leads" : STAGE[f].label + " leads",
    matchFeed(m, f) {
      if (f === "all") return true;
      if (f.startsWith("sr:")) return m.source === f.slice(3);
      return m.stage === f;
    },
    headerStat: (items, vis) => {
      const pipe = items.filter(m => open(m)).reduce((s, m) => s + m.value, 0);
      return `${money(pipe)} open pipeline · ${vis.length} shown`;
    },
    cell: {
      leading: m => <window.Avatar name={m.company} size={40} shape="square" />,
      title: m => m.company,
      meta: m => `${m.contact} · ${SRC[m.source]}`,
      time: m => m.time,
      accent: m => open(m) ? TEMP[m.temp].accent : "transparent",
      dim: m => m.stage === "lost",
      unseen: m => !m.seen,
      badges: m => <><window.Badge variant={STAGE[m.stage].variant} size="sm" dot>{STAGE[m.stage].label}</window.Badge><span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11.5, fontWeight: 600, color: TEMP[m.temp].color }}><window.Icon name={TEMP[m.temp].icon} size={12} color="currentColor" />{TEMP[m.temp].label}</span></>,
      value: m => <span style={{ fontSize: 13, fontWeight: 700, color: "var(--fg-strong)", fontVariantNumeric: "tabular-nums" }}>{money(m.value)}</span>,
    },
    columns: [
      { head: "Stage", cell: m => <window.Badge variant={STAGE[m.stage].variant} size="sm" dot>{STAGE[m.stage].label}</window.Badge> },
      { head: "Company", cell: m => <div style={{ display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}><window.Avatar name={m.company} size={24} shape="square" /><span style={{ fontWeight: 600, color: "var(--fg-strong)" }}>{m.company}</span></div> },
      { head: "Contact", cell: m => <div style={{ display: "flex", flexDirection: "column", gap: 0 }}><span style={{ color: "var(--fg-default)" }}>{m.contact}</span><span style={{ fontSize: 12, color: "var(--fg-muted)" }}>{m.role}</span></div> },
      { head: "Temp", cell: m => <span style={{ display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", fontWeight: 600, color: TEMP[m.temp].color }}><window.Icon name={TEMP[m.temp].icon} size={14} color="currentColor" />{TEMP[m.temp].label}</span> },
      { head: "Source", muted: true, cell: m => SRC[m.source] },
      { head: "Value", align: "right", mono: true, cell: m => <span style={{ fontWeight: 600, color: "var(--fg-strong)" }}>{money(m.value)}</span> },
      { head: "Owner", cell: m => m.owner ? <span style={{ display: "inline-flex", alignItems: "center", gap: 7, whiteSpace: "nowrap" }}><window.Avatar name={m.owner} size={22} /><span style={{ fontSize: 13 }}>{m.owner.split(" ")[0]}</span></span> : <span style={{ color: "var(--fg-subtle)" }}>Unassigned</span> },
    ],
    bulk: [{ label: "Mark contacted", icon: "phone-call", to: "contacted" }, { label: "Mark lost", icon: "x", to: "lost" }],
    board: { progressLabel: "Pipeline", columns: [
      { key: "new", label: "New", icon: "sparkles" }, { key: "contacted", label: "Contacted", icon: "phone-call" },
      { key: "qualified", label: "Qualified", icon: "badge-check" }, { key: "won", label: "Won", icon: "trophy" }, { key: "lost", label: "Lost", icon: "x-circle" }] },
    advance: { new: { label: "Contact", icon: "phone-call", to: "contacted" }, contacted: { label: "Qualify", icon: "badge-check", to: "qualified" }, qualified: { label: "Win", icon: "trophy", to: "won" } },
    Detail,
  });
})();
