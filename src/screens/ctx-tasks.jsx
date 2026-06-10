/* ctx-tasks.jsx — Tasks (assigned to-dos with due dates). Inbox context #5. */
(function () {
  const { Tile, MetaGrid, DetailShell, SectionTitle } = window;

  const STATUS = {
    todo: { label: "To do", variant: "neutral" }, inprogress: { label: "In progress", variant: "brand" },
    blocked: { label: "Blocked", variant: "danger" }, done: { label: "Done", variant: "success" },
  };
  const PRI = {
    high: { label: "High", variant: "danger", accent: "var(--bg-danger)" },
    medium: { label: "Medium", variant: "warning", accent: "var(--bg-warning)" },
    low: { label: "Low", variant: "neutral", accent: "var(--border-strong)" },
  };
  const PROJ = { platform: "Platform", mobile: "Mobile App", billing: "Billing", onboarding: "Onboarding" };
  const openT = m => m.status !== "done";

  function Due({ due }) {
    if (!due) return <span style={{ fontSize: 11.5, color: "var(--fg-subtle)" }}>No date</span>;
    const c = { overdue: "var(--fg-danger)", soon: "var(--fg-warning)", ok: "var(--fg-muted)", done: "var(--fg-success)" }[due.state];
    const ic = due.state === "overdue" ? "alert-circle" : due.state === "done" ? "check" : "calendar";
    return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 600, color: c }}>
      <window.Icon name={ic} size={12} color="currentColor" />{due.label}</span>;
  }

  function CircleCheck({ done, accent, onToggle }) {
    return (
      <button onClick={e => { e.stopPropagation(); onToggle(); }} aria-label={done ? "Mark not done" : "Mark done"}
        style={{ marginTop: 1, width: 24, height: 24, flexShrink: 0, borderRadius: "50%", cursor: "pointer",
          border: `2px solid ${done ? "var(--bg-success)" : accent}`, background: done ? "var(--bg-success)" : "transparent",
          display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0, transition: "all var(--dur-fast)" }}>
        {done && <window.Icon name="check" size={13} color="var(--fg-on-brand)" strokeWidth={3} />}
      </button>
    );
  }

  const SEED = [
    { id: 1, title: "Finalize Q3 routing-analytics spec", project: "platform", assignee: "Dana Reyes", priority: "high", status: "inprogress", due: { label: "Today", state: "soon" }, seen: false, created: "Mon, Jun 8", description: "Lock the data model and API surface for the routing-analytics module before the Brightwave demo. Circulate to eng for estimation.\n\nNeeds sign-off from Priya on the query shapes.", subtasks: [{ label: "Draft data model", done: true }, { label: "Review with eng", done: false }, { label: "Get Priya's sign-off", done: false }] },
    { id: 2, title: "Fix webhook signature mismatch (Kestrel)", project: "platform", assignee: "Priya Anand", priority: "high", status: "blocked", due: { label: "Overdue · 1d", state: "overdue" }, seen: false, created: "Fri, Jun 5", description: "Intermittent HMAC failures reported by Kestrel Labs. Blocked on getting the exact signed bytes from the payments vendor — ticket open with them.", subtasks: [{ label: "Reproduce locally", done: true }, { label: "Vendor confirms byte order", done: false }] },
    { id: 3, title: "Ship dark-mode for reporting views", project: "platform", assignee: "Dana Reyes", priority: "medium", status: "todo", due: { label: "Thu, Jun 11", state: "ok" }, seen: true, created: "Thu, Jun 4", description: "Requested by several analysts. Apply the existing token theme to the reporting surface; most of it should come for free.", subtasks: [{ label: "Audit hard-coded colors", done: false }, { label: "QA in both themes", done: false }] },
    { id: 4, title: "Onboarding checklist redesign", project: "onboarding", assignee: "Olivia Bennett", priority: "medium", status: "inprogress", due: { label: "Fri, Jun 12", state: "ok" }, seen: true, created: "Wed, Jun 3", description: "New-user activation is dropping at step 3. Reorder the checklist and add inline help. Working from the new wireframes.", subtasks: [{ label: "Reorder steps", done: true }, { label: "Write inline help copy", done: false }, { label: "Hand off to eng", done: false }] },
    { id: 5, title: "Migrate billing to new invoice service", project: "billing", assignee: "Raj Malhotra", priority: "high", status: "todo", due: { label: "Mon, Jun 15", state: "ok" }, seen: true, created: "Wed, Jun 3", description: "Cut over from the legacy invoice generator. Dual-write first, then flip reads. Coordinate a maintenance window with ops.", subtasks: [{ label: "Dual-write behind flag", done: false }, { label: "Backfill validation", done: false }] },
    { id: 6, title: "Mobile push-notification opt-in flow", project: "mobile", assignee: "Sofia Reyes", priority: "low", status: "todo", due: { label: "Jun 20", state: "ok" }, seen: true, created: "Tue, Jun 2", description: "Add a soft pre-prompt before the OS permission dialog to lift opt-in rates. Follow the platform guidelines.", subtasks: [{ label: "Design pre-prompt", done: false }] },
    { id: 7, title: "Audit SOC 2 evidence for Lumen review", project: "platform", assignee: "Dana Reyes", priority: "high", status: "done", due: { label: "Done Jun 6", state: "done" }, seen: true, created: "Mon, Jun 1", description: "Gathered and packaged the SOC 2 evidence requested during the Lumen Diagnostics security review. Sent to their legal team.", subtasks: [{ label: "Collect access logs", done: true }, { label: "Package report", done: true }] },
    { id: 8, title: "Update pricing page copy", project: "onboarding", assignee: "Olivia Bennett", priority: "low", status: "done", due: { label: "Done Jun 4", state: "done" }, seen: true, created: "Thu, May 29", description: "Refreshed the tier descriptions and added the new Organization plan. Live.", subtasks: [{ label: "Draft copy", done: true }, { label: "Publish", done: true }] },
    { id: 9, title: "Standing-desk order for new hires", project: "onboarding", assignee: "Raj Malhotra", priority: "low", status: "inprogress", due: { label: "Jun 18", state: "ok" }, seen: true, created: "Fri, May 30", description: "Order four sit-stand desks ahead of the June cohort. Approved on the Approvals queue.", subtasks: [{ label: "Place order", done: true }, { label: "Confirm delivery date", done: false }] },
  ];

  function Detail({ m, api }) {
    const { Button, IconButton, Tooltip, Badge, Avatar, Composer, Checkbox } = window;
    const isDone = m.status === "done";
    const toggleSub = i => api.setItem(m.id, { subtasks: m.subtasks.map((s, j) => j === i ? { ...s, done: !s.done } : s) });
    const subDone = m.subtasks.filter(s => s.done).length;
    return (
      <DetailShell
        tools={<>
          <Tooltip content="Assign to me"><IconButton icon="user-plus" variant="ghost" size="sm" ariaLabel="Assign" onClick={() => api.setItem(m.id, { assignee: "Dana Reyes" })} /></Tooltip>
          <Tooltip content="Set due date"><IconButton icon="calendar" variant="ghost" size="sm" ariaLabel="Due date" /></Tooltip>
          <Tooltip content="Add subtask"><IconButton icon="plus" variant="ghost" size="sm" ariaLabel="Add subtask" /></Tooltip>
        </>}
        actions={<>
          <Button variant="outline" size="sm" leading="ban" disabled={isDone} onClick={() => api.setStatus(m.id, m.status === "blocked" ? "todo" : "blocked", m.status === "blocked" ? "Unblocked" : "Marked blocked")}>{m.status === "blocked" ? "Unblock" : "Block"}</Button>
          {isDone
            ? <Button variant="outline" size="sm" leading="rotate-ccw" onClick={() => api.setStatus(m.id, "todo", "Reopened")}>Reopen</Button>
            : <Button variant="primary" size="sm" leading="check" onClick={() => { api.setStatus(m.id, "done"); window.toast?.success?.("Task completed"); }}>Mark done</Button>}
        </>}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: "var(--space-6)" }}>
          <CircleCheck done={isDone} accent={PRI[m.priority].accent} onToggle={() => api.setStatus(m.id, isDone ? "todo" : "done", isDone ? "Reopened" : "Task completed")} />
          <div style={{ minWidth: 0, marginTop: -1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--fg-strong)", letterSpacing: "-0.015em", textDecorationLine: isDone ? "line-through" : "none", textDecorationColor: "var(--fg-subtle)" }}>{m.title}</div>
            <div style={{ fontSize: 13, color: "var(--fg-muted)", marginTop: 3 }}>{PROJ[m.project]} · assigned to {m.assignee}</div>
          </div>
        </div>
        <MetaGrid rows={[
          ["Status", <Badge variant={STATUS[m.status].variant} dot>{STATUS[m.status].label}</Badge>],
          ["Priority", <Badge variant={PRI[m.priority].variant} dot>{PRI[m.priority].label}</Badge>],
          ["Due", <Due due={m.due} />],
          ["Project", <span style={{ fontSize: 13.5, color: "var(--fg-default)" }}>{PROJ[m.project]}</span>],
          ["Assignee", <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Avatar name={m.assignee} size={22} /><span style={{ fontSize: 13.5, color: "var(--fg-default)" }}>{m.assignee}</span></span>],
          ["Created", <span style={{ fontSize: 13.5, color: "var(--fg-default)" }}>{m.created}</span>],
        ]} />
        <SectionTitle>Description</SectionTitle>
        <div style={{ fontSize: 14.5, lineHeight: 1.65, color: "var(--fg-default)", whiteSpace: "pre-wrap" }}>{m.description}</div>
        <div style={{ marginTop: "var(--space-7)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-3)" }}>
            <SectionTitle>Subtasks</SectionTitle>
            <span style={{ fontSize: 12.5, color: "var(--fg-muted)", fontVariantNumeric: "tabular-nums" }}>{subDone}/{m.subtasks.length}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {m.subtasks.map((s, i) => (
              <label key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: "var(--radius-md)", cursor: "pointer", background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
                <Checkbox checked={s.done} onChange={() => toggleSub(i)} />
                <span style={{ fontSize: 14, color: s.done ? "var(--fg-subtle)" : "var(--fg-default)", textDecoration: s.done ? "line-through" : "none" }}>{s.label}</span>
              </label>
            ))}
          </div>
        </div>
        <Composer label="Add a comment" placeholder="Leave an update for the assignee…" primaryLabel="Comment" primaryIcon="message-square" />
      </DetailShell>
    );
  }

  (window.INBOX_CONTEXTS = window.INBOX_CONTEXTS || []).push({
    id: "tasks", label: "My Tasks", sublabel: "To-dos & due dates", icon: "check-circle",
    search: "Search tasks…", views: ["split", "table", "board"], statusField: "status", STATUS,
    filterField: "priority", filters: [{ value: "high", label: "High" }, { value: "medium", label: "Medium" }, { value: "low", label: "Low" }],
    searchFields: ["title", "assignee"], primaryAction: { label: "New task", icon: "plus" },
    footerNote: "Platform team", seed: SEED,
    feeds(items) {
      const open = items.filter(m => m.status !== "done").length;
      return [{ group: "Tasks" },
        { id: "all", label: "All tasks", icon: "list-todo", badge: open || undefined },
        { id: "mine", label: "My tasks", icon: "user-check" },
        { id: "today", label: "Due today", icon: "calendar-clock" },
        { id: "overdue", label: "Overdue", icon: "alert-circle" },
        { id: "done", label: "Completed", icon: "check-circle" },
        { group: "Projects" },
        { id: "pr:platform", label: "Platform", icon: "box" },
        { id: "pr:mobile", label: "Mobile App", icon: "smartphone" },
        { id: "pr:billing", label: "Billing", icon: "credit-card" },
        { id: "pr:onboarding", label: "Onboarding", icon: "rocket" }];
    },
    feedTitle: f => f === "all" ? "All tasks" : f.startsWith("pr:") ? PROJ[f.slice(3)]
      : { mine: "My tasks", today: "Due today", overdue: "Overdue", done: "Completed" }[f],
    matchFeed(m, f) {
      if (f === "all") return true;
      if (f === "mine") return m.assignee === "Dana Reyes";
      if (f === "today") return m.due && m.due.state === "soon";
      if (f === "overdue") return m.due && m.due.state === "overdue";
      if (f === "done") return m.status === "done";
      if (f.startsWith("pr:")) return m.project === f.slice(3);
      return true;
    },
    headerStat: (items, vis) => `${items.filter(m => m.status !== "done").length} open · ${vis.length} shown`,
    cell: {
      leading: (m, api) => <CircleCheck done={m.status === "done"} accent={PRI[m.priority].accent} onToggle={() => api.setStatus(m.id, m.status === "done" ? "todo" : "done", m.status === "done" ? "Reopened" : "Task completed")} />,
      title: m => m.title,
      strike: m => m.status === "done",
      meta: m => `${PROJ[m.project]} · ${m.assignee}`,
      accent: m => m.status === "done" ? "transparent" : m.due && m.due.state === "overdue" ? "var(--bg-danger)" : PRI[m.priority].accent,
      dim: m => m.status === "done",
      unseen: m => !m.seen,
      badges: m => <><window.Badge variant={STATUS[m.status].variant} size="sm" dot>{STATUS[m.status].label}</window.Badge><window.Badge variant={PRI[m.priority].variant} size="sm">{PRI[m.priority].label}</window.Badge></>,
      value: m => <Due due={m.due} />,
    },
    columns: [
      { head: "Status", cell: m => <window.Badge variant={STATUS[m.status].variant} size="sm" dot>{STATUS[m.status].label}</window.Badge> },
      { head: "Task", cell: m => <span style={{ display: "block", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--fg-default)", textDecorationLine: m.status === "done" ? "line-through" : "none", textDecorationColor: "var(--fg-subtle)" }}>{m.title}</span> },
      { head: "Project", muted: true, cell: m => PROJ[m.project] },
      { head: "Priority", cell: m => <window.Badge variant={PRI[m.priority].variant} size="sm" dot>{PRI[m.priority].label}</window.Badge> },
      { head: "Due", cell: m => <Due due={m.due} /> },
      { head: "Assignee", cell: m => <span style={{ display: "inline-flex", alignItems: "center", gap: 7, whiteSpace: "nowrap" }}><window.Avatar name={m.assignee} size={22} /><span style={{ fontSize: 13 }}>{m.assignee.split(" ")[0]}</span></span> },
    ],
    bulk: [{ label: "Start", icon: "play", to: "inprogress" }, { label: "Complete", icon: "check", variant: "primary", to: "done" }],
    board: { progressLabel: "Completion", columns: [
      { key: "todo", label: "To do", icon: "circle" }, { key: "inprogress", label: "In progress", icon: "loader" },
      { key: "blocked", label: "Blocked", icon: "ban" }, { key: "done", label: "Done", icon: "check-circle" }] },
    advance: { todo: { label: "Start", icon: "play", to: "inprogress" }, inprogress: { label: "Done", icon: "check", to: "done" }, blocked: { label: "Unblock", icon: "rotate-ccw", to: "todo" } },
    Detail,
  });
})();
