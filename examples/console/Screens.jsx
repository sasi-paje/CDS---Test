// Console UI kit — screens. Each screen is composed purely from lib/ primitives.
const { useState: useScr } = React;

/* ─────────────── shared bits ─────────────── */
function SectionCard({ title, action, children, pad = "var(--space-6)" }) {
  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
      {title && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "var(--space-5) var(--space-6)", borderBottom: "1px solid var(--border-subtle)" }}>
          <h2 style={{ margin: 0, fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--fg-strong)" }}>{title}</h2>
          {action}
        </div>
      )}
      <div style={{ padding: pad }}>{children}</div>
    </div>
  );
}

function StatTile({ icon, label, value, delta, positive }) {
  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "var(--space-5)", display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ width: 38, height: 38, borderRadius: "var(--radius-md)", background: "var(--bg-brand-subtle)", color: "var(--fg-brand)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
        <Icon name={icon} size={19} />
      </div>
      <span style={{ fontSize: 13, color: "var(--fg-muted)", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: "var(--text-3xl)", fontWeight: 700, color: "var(--fg-strong)", lineHeight: 1.1 }}>{value}</span>
      {delta && (
        <span style={{ fontSize: 12, fontWeight: 500, color: positive ? "var(--fg-success)" : "var(--fg-danger)" }}>
          {positive ? "▲" : "▼"} {delta}
        </span>
      )}
    </div>
  );
}

/* ─────────────── DASHBOARD ─────────────── */
function DashboardScreen() {
  const { Chart, Badge, Avatar } = window;
  const revenue = [
    { x: "Jan", y: 32 }, { x: "Feb", y: 38 }, { x: "Mar", y: 35 },
    { x: "Apr", y: 46 }, { x: "May", y: 52 }, { x: "Jun", y: 49 },
    { x: "Jul", y: 61 }, { x: "Aug", y: 68 },
  ];
  const activity = [
    { who: "Bianca Klein", what: "invited 3 members to the workspace", when: "2m ago", icon: "user-plus" },
    { who: "Marcus Lyle", what: "upgraded the plan to Scale", when: "1h ago", icon: "arrow-up-circle" },
    { who: "Priya Anand", what: "exported the Q3 revenue report", when: "3h ago", icon: "download" },
    { who: "System", what: "ran the nightly data sync", when: "6h ago", icon: "refresh-cw" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "var(--space-5)" }}>
        <StatTile icon="dollar-sign" label="MRR" value="$68.4k" delta="8.2% MoM" positive />
        <StatTile icon="users" label="Active members" value="1,284" delta="3.1% MoM" positive />
        <StatTile icon="activity" label="API calls" value="9.7M" delta="12% MoM" positive />
        <StatTile icon="alert-triangle" label="Churn" value="1.9%" delta="0.4 pts" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "var(--space-6)", alignItems: "start" }}>
        <SectionCard title="Recurring revenue" action={<Badge variant="success" dot>Live</Badge>}>
          <Chart type="area" data={revenue} x="x" y="y" height={220} formatY={(v) => "$" + v + "k"} />
        </SectionCard>

        <SectionCard title="Recent activity" pad="var(--space-3)">
          <div style={{ display: "flex", flexDirection: "column" }}>
            {activity.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "var(--space-4) var(--space-3)", borderBottom: i < activity.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                <div style={{ width: 30, height: 30, borderRadius: "var(--radius-md)", background: "var(--bg-muted)", color: "var(--fg-muted)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name={a.icon} size={15} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, color: "var(--fg-default)", lineHeight: 1.4 }}>
                    <span style={{ fontWeight: 600, color: "var(--fg-strong)" }}>{a.who}</span> {a.what}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--fg-subtle)", marginTop: 2 }}>{a.when}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

/* ─────────────── MEMBERS ─────────────── */
const SEED_MEMBERS = [
  { id: 1, name: "Alice Johnson", email: "alice@northwind.co", role: "Admin", status: "active", seat: "Paid" },
  { id: 2, name: "Bob Smith", email: "bob@northwind.co", role: "Editor", status: "active", seat: "Paid" },
  { id: 3, name: "Carol White", email: "carol@northwind.co", role: "Viewer", status: "invited", seat: "Free" },
  { id: 4, name: "David Brown", email: "david@northwind.co", role: "Editor", status: "active", seat: "Paid" },
  { id: 5, name: "Eve Davis", email: "eve@northwind.co", role: "Admin", status: "active", seat: "Paid" },
  { id: 6, name: "Frank Miller", email: "frank@northwind.co", role: "Viewer", status: "suspended", seat: "Free" },
  { id: 7, name: "Grace Lee", email: "grace@northwind.co", role: "Editor", status: "active", seat: "Paid" },
  { id: 8, name: "Henry Wilson", email: "henry@northwind.co", role: "Admin", status: "invited", seat: "Free" },
];

function MembersScreen() {
  const { DataTable, Badge, Button, Avatar, Dialog, AlertDialog, Field, Input, Select } = window;
  const [members, setMembers] = useScr(SEED_MEMBERS);
  const [editing, setEditing] = useScr(null);     // member obj or {} for new
  const [delId, setDelId] = useScr(null);
  const [form, setForm] = useScr({ name: "", email: "", role: "Viewer" });

  const openNew = () => { setForm({ name: "", email: "", role: "Viewer" }); setEditing({}); };
  const openEdit = (m) => { setForm({ name: m.name, email: m.email, role: m.role }); setEditing(m); };
  const save = () => {
    if (editing.id) {
      setMembers(ms => ms.map(m => m.id === editing.id ? { ...m, ...form } : m));
      window.toast?.success?.("Member updated");
    } else {
      setMembers(ms => [...ms, { id: Math.max(...ms.map(m => m.id)) + 1, ...form, status: "invited", seat: "Free" }]);
      window.toast?.success?.("Invitation sent");
    }
    setEditing(null);
  };
  const del = () => {
    setMembers(ms => ms.filter(m => m.id !== delId));
    setDelId(null);
    window.toast?.info?.("Member removed");
  };

  const roleVariant = (r) => r === "Admin" ? "brand" : r === "Editor" ? "info" : "neutral";
  const statusVariant = (s) => s === "active" ? "success" : s === "invited" ? "warning" : "danger";

  const columns = [
    { key: "name", label: "Member", sortable: true, width: "30%", render: (r) => (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name={r.name} size={30} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--fg-strong)" }}>{r.name}</div>
          <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>{r.email}</div>
        </div>
      </div>
    ) },
    { key: "role", label: "Role", sortable: true, render: (r) => <Badge variant={roleVariant(r.role)}>{r.role}</Badge> },
    { key: "status", label: "Status", sortable: true, render: (r) => <Badge variant={statusVariant(r.status)} dot>{r.status[0].toUpperCase() + r.status.slice(1)}</Badge> },
    { key: "seat", label: "Seat" },
    { key: "actions", label: "", width: "1%", render: (r) => (
      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
        <Button size="sm" variant="ghost" iconOnly leading="pencil" ariaLabel="Edit" onClick={() => openEdit(r)} />
        <Button size="sm" variant="ghost" iconOnly leading="trash-2" ariaLabel="Remove" onClick={() => setDelId(r.id)} />
      </div>
    ) },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "var(--space-5)" }}>
        <StatTile icon="users" label="Total members" value={members.length} />
        <StatTile icon="check-circle" label="Active" value={members.filter(m => m.status === "active").length} />
        <StatTile icon="mail" label="Invited" value={members.filter(m => m.status === "invited").length} />
        <StatTile icon="shield" label="Admins" value={members.filter(m => m.role === "Admin").length} />
      </div>

      <SectionCard
        title="All members"
        action={<Button variant="primary" size="sm" leading="plus" onClick={openNew}>Invite member</Button>}
        pad="var(--space-5)"
      >
        <DataTable data={members} columns={columns} searchable searchPlaceholder="Search by name or email…" pageSize={6} emptyText="No members found" />
      </SectionCard>

      {editing && (
        <Dialog open onClose={() => setEditing(null)} title={editing.id ? "Edit member" : "Invite member"} size="md"
          footer={<><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button variant="primary" onClick={save}>{editing.id ? "Save changes" : "Send invite"}</Button></>}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
            <Input label="Full name" value={form.name} onChange={(v) => setForm(f => ({ ...f, name: v }))} placeholder="Jane Cooper" required />
            <Input label="Email" type="email" leading="mail" value={form.email} onChange={(v) => setForm(f => ({ ...f, email: v }))} placeholder="jane@company.com" required />
            <Select label="Role" value={form.role} onChange={(v) => setForm(f => ({ ...f, role: v }))} options={["Viewer", "Editor", "Admin"]} hint="Admins can manage billing and members." />
          </div>
        </Dialog>
      )}

      {delId != null && (
        <AlertDialog open onCancel={() => setDelId(null)} onConfirm={del}
          title="Remove this member?" description="They'll immediately lose access to the workspace. This can't be undone."
          confirmLabel="Remove" variant="danger" />
      )}
    </div>
  );
}

/* ─────────────── BILLING ─────────────── */
function BillingScreen() {
  const { Badge, Button, Progress, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } = window;
  const invoices = [
    { id: "INV-0098", date: "Aug 1, 2026", amount: "$2,400.00", status: "Paid" },
    { id: "INV-0091", date: "Jul 1, 2026", amount: "$2,400.00", status: "Paid" },
    { id: "INV-0084", date: "Jun 1, 2026", amount: "$1,920.00", status: "Paid" },
    { id: "INV-0077", date: "May 1, 2026", amount: "$1,920.00", status: "Refunded" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)", alignItems: "start" }}>
      <SectionCard title="Current plan">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: "var(--text-3xl)", fontWeight: 700, color: "var(--fg-strong)" }}>Scale</span>
            <Badge variant="brand">Annual</Badge>
            <span style={{ marginLeft: "auto", fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--fg-strong)" }}>$2,400<span style={{ fontSize: 13, fontWeight: 500, color: "var(--fg-muted)" }}>/mo</span></span>
          </div>
          <Progress label="Seats used — 18 of 25" value={18} max={25} />
          <Progress label="API quota — 9.7M of 15M" value={9.7} max={15} variant="brand" />
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <Button variant="primary" leading="arrow-up-circle">Upgrade</Button>
            <Button variant="outline">Manage seats</Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Payment method">
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "var(--space-4)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", marginBottom: "var(--space-5)" }}>
          <div style={{ width: 42, height: 30, borderRadius: 5, background: "var(--bg-inverse)", color: "var(--fg-inverse)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>VISA</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg-strong)" }}>•••• •••• •••• 4242</div>
            <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>Expires 09 / 27</div>
          </div>
          <Button variant="ghost" size="sm">Update</Button>
        </div>
        <h3 style={{ margin: "0 0 var(--space-4)", fontSize: 14, fontWeight: 600, color: "var(--fg-strong)" }}>Invoices</h3>
        <Table dense>
          <TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Date</TableHead><TableHead align="right">Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {invoices.map(inv => (
              <TableRow key={inv.id}>
                <TableCell mono>{inv.id}</TableCell>
                <TableCell muted>{inv.date}</TableCell>
                <TableCell align="right" mono>{inv.amount}</TableCell>
                <TableCell><Badge size="sm" variant={inv.status === "Paid" ? "success" : "neutral"}>{inv.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SectionCard>
    </div>
  );
}

/* ─────────────── SETTINGS ─────────────── */
function SettingsScreen() {
  const { Input, Select, Switch, Button, Separator, Textarea } = window;
  const [notif, setNotif] = useScr({ product: true, weekly: true, security: true });
  return (
    <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <SectionCard title="Workspace">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          <Input label="Workspace name" defaultValue="Northwind" required />
          <Input label="Subdomain" defaultValue="northwind" trailing="link" hint="northwind.app.example.com" />
          <Textarea label="Description" rows={3} defaultValue="Internal operations and analytics workspace for the Northwind team." />
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="primary" onClick={() => window.toast?.success?.("Settings saved")}>Save changes</Button>
            <Button variant="ghost">Discard</Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Notifications">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          {[
            ["product", "Product updates", "New features and improvements"],
            ["weekly", "Weekly digest", "A Monday summary of workspace activity"],
            ["security", "Security alerts", "Sign-ins from new devices and locations"],
          ].map(([key, title, desc]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg-strong)" }}>{title}</div>
                <div style={{ fontSize: 13, color: "var(--fg-muted)" }}>{desc}</div>
              </div>
              <Switch checked={notif[key]} onChange={(v) => setNotif(n => ({ ...n, [key]: v }))} />
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

Object.assign(window, { DashboardScreen, MembersScreen, BillingScreen, SettingsScreen });
