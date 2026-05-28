// White-label catalog — Phase 2 specs for the new components.
// Reuses Spec / Group / Matrix from Catalog.jsx (which is loaded first).

const { useState: useSx2 } = React;

/* ─── DIALOG ──────────────────────────────────────────────────────── */
function DialogSpec() {
  const [a, setA] = useSx2(false);
  const [b, setB] = useSx2(false);
  const [c, setC] = useSx2(false);
  const [d, setD] = useSx2(false);
  return (
    <Spec name="Dialog" file="src/whitelabel/Overlays.jsx"
      summary="Modal dialog with overlay scrim, focus trap (escape + click-outside dismissable). Five sizes (sm / md / lg / xl / full)."
      source={{
        jsx: `const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Open dialog</Button>

<Dialog
  open={open}
  onClose={() => setOpen(false)}
  title="Confirm changes"
  description="This will publish your changes to production."
  footer={<>
    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
    <Button variant="primary" onClick={handleSubmit}>Publish</Button>
  </>}>
  {/* dialog body */}
</Dialog>`,
        json: `{
  "component": "Dialog",
  "props": {
    "open":            "boolean",
    "onClose":         "() => void",
    "title":           "string",
    "description":     "string",
    "size":            "sm | md | lg | xl | full",
    "closeOnBackdrop": "boolean (default: true)",
    "hideClose":       "boolean (default: false)",
    "footer":          "ReactNode",
    "children":        "ReactNode (body)"
  }
}`,
        tailwind: `<!-- Backdrop + dialog (rendered conditionally via state) -->
<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div class="fixed inset-0 bg-slate-900/55" onclick="close()"></div>
  <div role="dialog" aria-modal="true"
       class="relative w-[480px] max-w-full max-h-[calc(100vh-32px)]
              bg-white border border-slate-200 rounded-xl shadow-xl
              flex flex-col overflow-hidden">
    <div class="px-5 pt-5 pb-3 flex items-start gap-3">
      <div class="flex-1">
        <h2 class="text-base font-semibold text-slate-900">Confirm changes</h2>
        <p class="mt-1 text-sm text-slate-500">This will publish to production.</p>
      </div>
      <button aria-label="Close" class="text-slate-500 hover:text-slate-900 p-1">✕</button>
    </div>
    <div class="px-5 pb-5 text-sm text-slate-900">
      <!-- body content -->
    </div>
    <div class="px-5 py-3 flex justify-end gap-2 border-t border-slate-200 bg-slate-50">
      <button class="btn-outline">Cancel</button>
      <button class="btn-primary">Publish</button>
    </div>
  </div>
</div>`,
        css: `.dialog-overlay {
  position: fixed; inset: 0; z-index: var(--z-modal);
  display: flex; align-items: center; justify-content: center;
  padding: var(--space-5);
}
.dialog-scrim { position: absolute; inset: 0; background: var(--bg-overlay); }
.dialog {
  position: relative; max-height: calc(100vh - 32px);
  background: var(--bg-raised); border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl); box-shadow: var(--shadow-xl);
  display: flex; flex-direction: column; overflow: hidden;
}
.dialog--sm  { width: 360px; }
.dialog--md  { width: 480px; }   /* default */
.dialog--lg  { width: 640px; }
.dialog--xl  { width: 820px; }
.dialog__head   { padding: 18px 20px 12px; display: flex; gap: 12px; }
.dialog__title  { font-size: 17px; font-weight: 600; color: var(--fg-strong); margin: 0; }
.dialog__desc   { font-size: 13px; color: var(--fg-muted); margin: 4px 0 0; }
.dialog__body   { padding: 8px 20px 20px; overflow: auto; }
.dialog__footer {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 12px 20px; border-top: 1px solid var(--border-subtle);
  background: var(--bg-subtle);
}`,
      }}>
      <Group label="Sizes">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button variant="outline" onClick={() => setA(true)}>Open small</Button>
          <Button variant="outline" onClick={() => setB(true)}>Open default</Button>
          <Button variant="outline" onClick={() => setC(true)}>Open large</Button>
          <Button variant="danger"  onClick={() => setD(true)}>Open destructive</Button>
        </div>
        <Dialog open={a} onClose={() => setA(false)} size="sm" title="Small dialog"
          description="A compact confirmation, e.g. 'unsaved changes'."
          footer={<><Button variant="outline" onClick={() => setA(false)}>Cancel</Button><Button variant="primary" onClick={() => setA(false)}>OK</Button></>}>
          Use the small size for binary confirmations.
        </Dialog>
        <Dialog open={b} onClose={() => setB(false)} title="Invite teammates"
          description="Send invitations by email. New members will get viewer access by default."
          footer={<><Button variant="outline" onClick={() => setB(false)}>Cancel</Button><Button variant="primary" leading="send">Send invites</Button></>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="Email addresses" placeholder="alex@team.io, dana@team.io" />
            <Select label="Default role" options={[{value:"viewer",label:"Viewer"},{value:"editor",label:"Editor"},{value:"admin",label:"Admin"}]} defaultValue="viewer" />
            <Checkbox label="Send a welcome message" defaultChecked />
          </div>
        </Dialog>
        <Dialog open={c} onClose={() => setC(false)} size="lg" title="Project settings"
          footer={<><Button variant="outline" onClick={() => setC(false)}>Cancel</Button><Button variant="primary">Save changes</Button></>}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Input label="Name" defaultValue="Q3 Launch Plan" />
            <Select label="Status" defaultValue="active" options={[{value:"active",label:"Active"},{value:"archived",label:"Archived"}]} />
            <Textarea label="Description" rows={4} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Notifications</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Switch label="Email digest" defaultChecked />
                <Switch label="Mentions" defaultChecked />
                <Switch label="Mobile push" />
              </div>
            </div>
          </div>
        </Dialog>
        <Dialog open={d} onClose={() => setD(false)} size="sm" title="Delete project?"
          description="This action cannot be undone. All data will be permanently removed."
          footer={<><Button variant="outline" onClick={() => setD(false)}>Keep project</Button><Button variant="danger" leading="trash-2" onClick={() => setD(false)}>Delete forever</Button></>} />
      </Group>
    </Spec>
  );
}

/* ─── SHEET ──────────────────────────────────────────────────────── */
function SheetSpec() {
  const [r, setR] = useSx2(false);
  const [l, setL] = useSx2(false);
  const [b, setB] = useSx2(false);
  const [t, setT] = useSx2(false);
  return (
    <Spec name="Sheet (Drawer)" file="src/whitelabel/Overlays.jsx"
      summary="Off-canvas panel sliding from any edge. Use for filters, detail panes, command palettes, mobile menus."
      source={`<Sheet open={open} onClose={…} side="right" title="Filters">
  {/* filters */}
</Sheet>`}>
      <Group label="Sides">
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="outline" onClick={() => setR(true)} leading="panel-right">Right</Button>
          <Button variant="outline" onClick={() => setL(true)} leading="panel-left">Left</Button>
          <Button variant="outline" onClick={() => setT(true)} leading="panel-top">Top</Button>
          <Button variant="outline" onClick={() => setB(true)} leading="panel-bottom">Bottom</Button>
        </div>
        <Sheet open={r} onClose={() => setR(false)} side="right" title="Filters" description="Narrow down results."
          footer={<><Button variant="outline" onClick={() => setR(false)}>Reset</Button><Button variant="primary">Apply</Button></>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Select label="Status" options={["Active", "Archived", "All"]} />
            <Select label="Owner"  options={["Anyone", "Me", "Team"]} />
            <Input label="Tags" placeholder="comma, separated" />
            <Checkbox label="Has attachments" />
            <Checkbox label="Starred only" />
          </div>
        </Sheet>
        <Sheet open={l} onClose={() => setL(false)} side="left" title="Navigation">
          Use a left sheet for mobile navigation drawers.
        </Sheet>
        <Sheet open={t} onClose={() => setT(false)} side="top" size="sm" title="Search">
          <Input leading="search" placeholder="Search everywhere…" />
        </Sheet>
        <Sheet open={b} onClose={() => setB(false)} side="bottom" size="md" title="Quick actions">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {["plus", "share-2", "download", "bookmark"].map(n => (
              <Button key={n} variant="outline" leading={n} style={{ height: 56, flexDirection: "column" }}>{n}</Button>
            ))}
          </div>
        </Sheet>
      </Group>
    </Spec>
  );
}

/* ─── POPOVER ──────────────────────────────────────────────────── */
function PopoverSpec() {
  return (
    <Spec name="Popover" file="src/whitelabel/Overlays.jsx"
      summary="Anchored floating panel. Click trigger to open, click outside or press Escape to close. Supports top/right/bottom/left with start/center/end alignment."
      source={`<Popover trigger={<Button>Open</Button>} side="bottom" align="start">
  <div style={{ width: 240 }}>Any content here.</div>
</Popover>`}>
      <Group label="Sides">
        <div style={{ display: "flex", gap: 16, padding: "30px 0", flexWrap: "wrap" }}>
          {["bottom", "top", "right", "left"].map(side => (
            <Popover key={side} side={side} trigger={<Button variant="outline">{side}</Button>}>
              <div style={{ padding: 6, fontSize: 13, color: "var(--fg-default)", maxWidth: 220 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Anchored to {side}</div>
                <div style={{ color: "var(--fg-muted)" }}>Click outside or press Escape to dismiss.</div>
              </div>
            </Popover>
          ))}
        </div>
      </Group>
      <Group label="With form content">
        <Popover trigger={<Button variant="outline" leading="filter">Filter</Button>} width={280}>
          {({ close }) => (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 4 }}>
              <Input size="sm" label="Tag" placeholder="bug, feature, …" />
              <Select size="sm" label="Status" options={["Open", "In progress", "Closed"]} />
              <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                <Button variant="outline" size="sm" fullWidth onClick={close}>Cancel</Button>
                <Button variant="primary" size="sm" fullWidth onClick={close}>Apply</Button>
              </div>
            </div>
          )}
        </Popover>
      </Group>
    </Spec>
  );
}

/* ─── DROPDOWN MENU ─────────────────────────────────────────────── */
function DropdownMenuSpec() {
  return (
    <Spec name="DropdownMenu" file="src/whitelabel/Overlays.jsx"
      summary="Action menu attached to a trigger. Items support icons, shortcuts, sub-labels, separators, and a danger variant."
      source={`<DropdownMenu trigger={<Button leading="more-horizontal" iconOnly ariaLabel="More" />}
  items={[
    { label: "Project" },
    { text: "Open",       icon: "external-link", shortcut: "↵", onSelect: () => {} },
    { text: "Duplicate",  icon: "copy",          shortcut: "⌘D", onSelect: () => {} },
    { text: "Share…",     icon: "share-2",       onSelect: () => {} },
    { separator: true },
    { text: "Delete",     icon: "trash-2",       danger: true, onSelect: () => {} },
  ]} />`}>
      <Group label="Trigger styles">
        <div style={{ display: "flex", gap: 12 }}>
          <DropdownMenu trigger={<Button variant="outline" trailing="chevron-down">Options</Button>}
            items={defaultMenu()} />
          <DropdownMenu trigger={<IconButton icon="more-horizontal" variant="ghost" ariaLabel="More" />}
            items={defaultMenu()} />
          <DropdownMenu trigger={<Avatar name="MC" />}
            items={[
              { label: "Marina Costa" },
              { text: "Profile", icon: "user" },
              { text: "Settings", icon: "settings", shortcut: "⌘," },
              { separator: true },
              { text: "Sign out", icon: "log-out", danger: true },
            ]} />
        </div>
      </Group>
    </Spec>
  );
}
function defaultMenu() {
  return [
    { label: "Project" },
    { text: "Open",       icon: "external-link", shortcut: "↵" },
    { text: "Duplicate",  icon: "copy",          shortcut: "⌘D" },
    { text: "Rename",     icon: "edit-3" },
    { text: "Share…",     icon: "share-2",       trailing: "chevron-right" },
    { separator: true },
    { label: "Danger zone" },
    { text: "Archive",    icon: "archive" },
    { text: "Delete",     icon: "trash-2",       danger: true, shortcut: "⌘⌫" },
  ];
}

/* ─── TOAST ─────────────────────────────────────────────────────── */
function ToastSpec() {
  return (
    <Spec name="Toast" file="src/whitelabel/Overlays.jsx"
      summary="Imperative API: call window.toast.success() / .error() / .warning() / .info() from anywhere. Mount <Toaster /> once near the root."
      source={`// 1. Mount once
<Toaster position="bottom-right" />

// 2. Call from anywhere
toast.success("Saved", { description: "Your changes are synced." });
toast.error("Could not save", { description: "Check your connection." });
toast("Custom title", { description: "...", action: { label: "Undo", onClick: …} });`}>
      <Group label="Triggers">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <Button variant="primary"  onClick={() => window.toast.success("Saved", { description: "All changes synced just now." })}>Success</Button>
          <Button variant="outline"  onClick={() => window.toast.info("New version available", { description: "Reload to get the latest." })}>Info</Button>
          <Button variant="outline"  onClick={() => window.toast.warning("Quota at 80%", { description: "Consider upgrading your plan." })}>Warning</Button>
          <Button variant="danger"   onClick={() => window.toast.error("Could not save", { description: "Network error — please retry." })}>Error</Button>
          <Button variant="secondary" onClick={() => window.toast({ title: "File uploaded", description: "report.pdf — 2.4 MB",
            action: { label: "Undo", onClick: () => window.toast.success("Reverted") } })}>With action</Button>
        </div>
      </Group>
    </Spec>
  );
}

/* ─── TABLE ─────────────────────────────────────────────────────── */
function TableSpec() {
  const [sortKey, setSortKey] = useSx2("name");
  const [sortDir, setSortDir] = useSx2("asc");
  const rows = [
    { id: 1, name: "Marina Costa",   role: "Admin",  status: "active",   joined: "Jan 12, 2026", spend: 8420 },
    { id: 2, name: "Lucas Tavares",  role: "Editor", status: "active",   joined: "Feb 04, 2026", spend: 1290 },
    { id: 3, name: "Sofia Almeida",  role: "Viewer", status: "invited",  joined: "Mar 22, 2026", spend: 0 },
    { id: 4, name: "Daniel Pereira", role: "Editor", status: "active",   joined: "Apr 01, 2026", spend: 540 },
    { id: 5, name: "Beatriz Reis",   role: "Admin",  status: "suspended",joined: "Apr 18, 2026", spend: 3320 },
  ];
  const sorted = [...rows].sort((a, b) => {
    const x = a[sortKey], y = b[sortKey];
    if (typeof x === "number") return sortDir === "asc" ? x - y : y - x;
    return sortDir === "asc" ? String(x).localeCompare(String(y)) : String(y).localeCompare(String(x));
  });
  const click = (k) => () => {
    if (sortKey === k) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
  };
  return (
    <Spec name="Table" file="src/whitelabel/Display.jsx"
      summary="Composable primitives — Table, TableHeader, TableBody, TableRow, TableHead, TableCell. Supports sortable headers, selected rows, hover states, dense mode."
      source={`<Table>
  <TableHeader>
    <TableRow>
      <TableHead sortable sorted={dir} onSort={…}>Name</TableHead>
      <TableHead>Role</TableHead>
      <TableHead align="right">Spend</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {rows.map(r => (
      <TableRow key={r.id} onClick={…}>
        <TableCell>{r.name}</TableCell>
        <TableCell>{r.role}</TableCell>
        <TableCell mono align="right">{r.spend}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>`}>
      <Group label="With sortable headers, row hover">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead sortable sorted={sortKey === "name" ? sortDir : null} onSort={click("name")}>Member</TableHead>
              <TableHead sortable sorted={sortKey === "role" ? sortDir : null} onSort={click("role")}>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead sortable sorted={sortKey === "joined" ? sortDir : null} onSort={click("joined")}>Joined</TableHead>
              <TableHead align="right" sortable sorted={sortKey === "spend" ? sortDir : null} onSort={click("spend")}>Spend</TableHead>
              <TableHead align="right" width={60}></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map(r => (
              <TableRow key={r.id} onClick={() => {}}>
                <TableCell>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={r.name} />
                    <div><div style={{ fontWeight: 500 }}>{r.name}</div><div style={{ fontSize: 11, color: "var(--fg-muted)" }}>id: {r.id}</div></div>
                  </div>
                </TableCell>
                <TableCell>{r.role}</TableCell>
                <TableCell><Badge size="sm" variant={r.status === "active" ? "success" : r.status === "invited" ? "info" : "warning"} dot>{r.status}</Badge></TableCell>
                <TableCell muted>{r.joined}</TableCell>
                <TableCell align="right" mono>${r.spend.toLocaleString()}</TableCell>
                <TableCell align="right">
                  <DropdownMenu trigger={<IconButton icon="more-horizontal" variant="ghost" size="sm" ariaLabel="More" />}
                    items={[
                      { text: "Edit",    icon: "edit-3" },
                      { text: "Resend invite", icon: "send" },
                      { separator: true },
                      { text: "Remove", icon: "user-x", danger: true },
                    ]} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Group>
      <Group label="Dense mode">
        <Table dense>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Description</TableHead>
              <TableHead align="right">Qty</TableHead>
              <TableHead align="right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow><TableCell mono>AC-001</TableCell><TableCell>USB-C cable, 1m</TableCell><TableCell mono align="right">120</TableCell><TableCell mono align="right">$8.00</TableCell></TableRow>
            <TableRow><TableCell mono>AC-002</TableCell><TableCell>Wireless mouse</TableCell><TableCell mono align="right">48</TableCell><TableCell mono align="right">$22.50</TableCell></TableRow>
            <TableRow><TableCell mono>AC-003</TableCell><TableCell>Mechanical keyboard</TableCell><TableCell mono align="right">12</TableCell><TableCell mono align="right">$129.00</TableCell></TableRow>
          </TableBody>
        </Table>
      </Group>
    </Spec>
  );
}

/* ─── PAGINATION ─────────────────────────────────────────────── */
function PaginationSpec() {
  const [p, setP] = useSx2(3);
  return (
    <Spec name="Pagination" file="src/whitelabel/Display.jsx"
      summary="Page navigation with first/prev/next/last, ellipsis trimming, and optional summary."
      source={`<Pagination page={page} total={total} pageSize={20} onPage={setPage} />`}>
      <Group label="With summary">
        <Pagination page={p} total={487} pageSize={20} onPage={setP} />
      </Group>
      <Group label="Without summary">
        <Pagination page={p} total={487} pageSize={20} onPage={setP} showSummary={false} />
      </Group>
      <Group label="Few pages">
        <Pagination page={2} total={45} pageSize={10} onPage={() => {}} />
      </Group>
    </Spec>
  );
}

/* ─── SKELETON ─────────────────────────────────────────────── */
function SkeletonSpec() {
  return (
    <Spec name="Skeleton" file="src/whitelabel/Display.jsx"
      summary="Animated loading placeholder. Shimmer animation is GPU-friendly."
      source={`<Skeleton width={120} height={16} />
<Skeleton circle size={32} />
<SkeletonText lines={3} />
<SkeletonAvatar size={40} withText />`}>
      <Group label="Primitives">
        <div style={{ display: "flex", flexDirection: "column", gap: 6, width: 280 }}>
          <Skeleton width="100%" height={14} />
          <Skeleton width="80%"  height={14} />
          <Skeleton width="60%"  height={14} />
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 16, alignItems: "center" }}>
          <Skeleton circle size={32} />
          <Skeleton circle size={48} />
          <Skeleton width={120} height={48} />
        </div>
      </Group>
      <Group label="Card skeleton">
        <Card style={{ width: 360 }}>
          <SkeletonAvatar size={40} withText />
          <div style={{ height: 16 }} />
          <SkeletonText lines={3} />
          <div style={{ height: 12 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <Skeleton width={80} height={28} />
            <Skeleton width={80} height={28} />
          </div>
        </Card>
      </Group>
    </Spec>
  );
}

/* ─── SEPARATOR ─────────────────────────────────────────────── */
function SeparatorSpec() {
  return (
    <Spec name="Separator" file="src/whitelabel/Display.jsx"
      summary="Visual divider. Horizontal by default; supports vertical, and a labelled variant for section breaks."
      source={`<Separator />
<Separator orientation="vertical" />
<Separator label="Or continue with" />`}>
      <Group label="Horizontal">
        <div style={{ width: "100%" }}>
          <div style={{ padding: "8px 0" }}>Above</div>
          <Separator />
          <div style={{ padding: "8px 0" }}>Below</div>
        </div>
      </Group>
      <Group label="Labelled">
        <div style={{ width: 360 }}>
          <Button fullWidth variant="outline" leading="github">Continue with GitHub</Button>
          <Separator label="Or continue with email" />
          <Input label="Email" placeholder="you@team.io" leading="mail" />
        </div>
      </Group>
      <Group label="Vertical">
        <div style={{ display: "flex", alignItems: "center", height: 28, fontSize: 13 }}>
          <span>Inbox</span><Separator orientation="vertical" />
          <span>Snoozed</span><Separator orientation="vertical" />
          <span>Archive</span>
        </div>
      </Group>
    </Spec>
  );
}

/* ─── EMPTY ─────────────────────────────────────────────────── */
function EmptySpec() {
  return (
    <Spec name="Empty" file="src/whitelabel/Display.jsx"
      summary="Empty-state placeholder. Use whenever data is genuinely absent — not as a generic loading state."
      source={`<Empty icon="inbox" title="No messages" description="When you receive a message it will appear here." action={<Button>Compose</Button>} />`}>
      <Group label="Sizes">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, width: "100%" }}>
          <Empty size="sm" icon="search" title="No results" description="Try a different keyword." />
          <Empty size="md" icon="inbox" title="Inbox is empty" description="When you receive a message it will appear here."
            action={<Button variant="primary" leading="plus">Compose</Button>} />
        </div>
      </Group>
      <Group label="Large landing">
        <Empty size="lg" icon="folder-plus" title="Create your first project"
          description="Projects group your work, members, and integrations. Get started by creating one."
          action={<Button variant="primary" leading="plus">New project</Button>} />
      </Group>
    </Spec>
  );
}

/* ─── SIDEBAR ──────────────────────────────────────────────── */
function SidebarSpec() {
  const [active, setActive] = useSx2("overview");
  const [collapsed, setCollapsed] = useSx2(false);
  const items = [
    { id: "overview",  label: "Overview",  icon: "layout-dashboard" },
    { id: "projects",  label: "Projects",  icon: "folder-kanban", badge: 4 },
    { id: "members",   label: "Members",   icon: "users" },
    { id: "billing",   label: "Billing",   icon: "credit-card", badge: "!" },
    { group: "Workspace" },
    { id: "integrations", label: "Integrations", icon: "plug" },
    { id: "settings", label: "Settings", icon: "settings",
      sub: [
        { id: "settings.general", label: "General" },
        { id: "settings.security", label: "Security" },
        { id: "settings.api", label: "API keys" },
      ] },
    { spacer: true },
    { id: "docs", label: "Documentation", icon: "book-open" },
  ];
  const footer = (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Avatar name="Jamie Stone" />
      {!collapsed && (
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Jamie Stone</div>
          <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>Admin</div>
        </div>
      )}
      {!collapsed && <IconButton icon="chevron-up" variant="ghost" size="sm" ariaLabel="Account menu" />}
    </div>
  );
  return (
    <Spec name="Sidebar" file="src/whitelabel/Sidebar.jsx"
      summary="App navigation rail. Expanded (248px) or collapsed (64px). Groups, badges, sub-items, optional footer card."
      source={{
        jsx: `<Sidebar
  brand="Acme"
  collapsed={collapsed}
  onToggle={() => setCollapsed(c => !c)}
  active={active}
  onSelect={setActive}
  items={[
    { id: "overview", label: "Overview", icon: "layout-dashboard" },
    { id: "projects", label: "Projects", icon: "folder-kanban", badge: 4 },
    { group: "Workspace" },
    { id: "settings", label: "Settings", icon: "settings",
      sub: [{ id: "settings.general", label: "General" }] },
    { spacer: true },
    { id: "docs", label: "Docs", icon: "book-open" },
  ]}
  footer={<UserCard />}
/>`,
        json: `{
  "component": "Sidebar",
  "props": {
    "brand":          "string | ReactNode",
    "collapsed":      "boolean",
    "onToggle":       "() => void",
    "active":         "string (item id)",
    "onSelect":       "(id) => void",
    "width":          "number (default 248)",
    "collapsedWidth": "number (default 64)",
    "footer":         "ReactNode"
  },
  "items": [
    { "id":"overview", "label":"Overview", "icon":"layout-dashboard" },
    { "id":"projects", "label":"Projects", "icon":"folder-kanban", "badge": 4 },
    { "group":"Workspace" },
    { "id":"settings", "label":"Settings", "icon":"settings",
      "sub": [
        { "id":"settings.general",  "label":"General" },
        { "id":"settings.security", "label":"Security" }
      ]
    },
    { "spacer": true },
    { "id":"docs", "label":"Docs", "icon":"book-open" }
  ]
}`,
        tailwind: `<aside class="w-[248px] h-screen flex flex-col flex-shrink-0
              bg-white border-r border-slate-200">
  <!-- Brand -->
  <div class="px-4 py-3 flex items-center gap-2.5 border-b border-slate-200 min-h-[60px]">
    <span class="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700
      text-white text-sm font-bold flex items-center justify-center">A</span>
    <span class="text-sm font-semibold tracking-tight">Acme</span>
  </div>

  <!-- Nav -->
  <nav class="flex-1 px-2 py-2.5 flex flex-col gap-0.5 overflow-auto">
    <a class="flex items-center gap-2.5 px-2.5 py-2 rounded text-sm font-medium
              bg-indigo-50 text-indigo-700">
      <svg class="h-4 w-4">…</svg> Overview
    </a>
    <a class="flex items-center gap-2.5 px-2.5 py-2 rounded text-sm font-medium
              text-slate-900 hover:bg-slate-100">
      <svg class="h-4 w-4">…</svg>
      <span class="flex-1">Projects</span>
      <span class="text-xs bg-slate-100 px-1.5 py-0.5 rounded">4</span>
    </a>

    <div class="px-2.5 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
      Workspace
    </div>
    <!-- … -->
  </nav>

  <!-- Footer -->
  <div class="px-3.5 py-2.5 border-t border-slate-200">
    <!-- user card -->
  </div>
</aside>`,
        css: `.sidebar {
  width: 248px; height: 100vh;
  background: var(--bg-canvas); border-right: 1px solid var(--border-subtle);
  display: flex; flex-direction: column; flex-shrink: 0;
  transition: width var(--dur-base) var(--ease-out);
}
.sidebar--collapsed { width: 64px; }

.sidebar__brand {
  padding: 16px 18px; display: flex; align-items: center; gap: 10px;
  border-bottom: 1px solid var(--border-subtle); min-height: 60px;
}
.sidebar__nav { flex: 1; overflow: auto; padding: 10px 8px;
                display: flex; flex-direction: column; gap: 2px; }
.sidebar__group {
  padding: 12px 10px 4px; font-size: 10.5px; font-weight: 700;
  color: var(--fg-subtle); text-transform: uppercase; letter-spacing: 0.08em;
}
.sidebar__item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px; border-radius: var(--radius-sm);
  font-size: 13.5px; font-weight: 500; color: var(--fg-default);
  background: transparent; cursor: pointer; border: 0;
  transition: background var(--dur-fast);
}
.sidebar__item:hover { background: var(--bg-muted); }
.sidebar__item--active { background: var(--bg-brand-subtle); color: var(--fg-brand); font-weight: 600; }
.sidebar__footer { padding: 10px 14px; border-top: 1px solid var(--border-subtle); }`,
      }}>
      <Group label="Expanded">
        <div style={{ border: "1px solid var(--border-subtle)", borderRadius: 8, overflow: "hidden", display: "flex", height: 560, width: "100%" }}>
          <Sidebar brand="Acme Console" items={items} active={active} onSelect={setActive}
            collapsed={false} height="100%" footer={footer} />
          <div style={{ flex: 1, background: "var(--bg-subtle)", padding: 18, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg-muted)" }}>
            active = {active}
          </div>
        </div>
      </Group>
      <Group label="With toggle">
        <div style={{ border: "1px solid var(--border-subtle)", borderRadius: 8, overflow: "hidden", display: "flex", height: 560, width: "100%" }}>
          <Sidebar brand="Acme Console" items={items} active={active} onSelect={setActive}
            collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} height="100%" footer={footer} />
          <div style={{ flex: 1, background: "var(--bg-subtle)", padding: 18, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg-muted)" }}>
            collapsed = {String(collapsed)}
            <div style={{ marginTop: 8 }}>
              <Button variant="outline" size="sm" onClick={() => setCollapsed(c => !c)}>Toggle</Button>
            </div>
          </div>
        </div>
      </Group>
    </Spec>
  );
}

/* ─── SLIDER ──────────────────────────────────────────────── */
function SliderSpec() {
  const [v1, setV1] = useSx2(40);
  const [v2, setV2] = useSx2([20, 80]);
  return (
    <Spec name="Slider" file="src/whitelabel/MoreInputs.jsx"
      summary="Single value or [min, max] range. Three sizes. Click the track to jump; drag the knob."
      source={`<Slider value={v} onChange={setV} min={0} max={100} step={1} label="Volume" showValue />
<Slider value={[20, 80]} onChange={setV} min={0} max={100} label="Price range" showValue formatValue={n => "$" + n} />`}>
      <Group label="Single value">
        <div style={{ width: 360 }}>
          <Slider value={v1} onChange={setV1} label="Volume" showValue formatValue={n => n + "%"} />
        </div>
      </Group>
      <Group label="Range">
        <div style={{ width: 360 }}>
          <Slider value={v2} onChange={setV2} label="Price range" showValue formatValue={n => "$" + n} />
        </div>
      </Group>
      <Group label="Sizes">
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 360 }}>
          <Slider size="sm" value={35} onChange={() => {}} label="Small" showValue />
          <Slider size="md" value={50} onChange={() => {}} label="Medium" showValue />
          <Slider size="lg" value={75} onChange={() => {}} label="Large" showValue />
        </div>
      </Group>
      <Group label="Disabled">
        <div style={{ width: 360 }}>
          <Slider value={60} onChange={() => {}} disabled label="Disabled" showValue />
        </div>
      </Group>
    </Spec>
  );
}

/* ─── TOGGLE GROUP ─────────────────────────────────────── */
function ToggleGroupSpec() {
  const [view, setView] = useSx2("grid");
  const [align, setAlign] = useSx2(["bold"]);
  const [zoom, setZoom] = useSx2("100");
  return (
    <Spec name="ToggleGroup" file="src/whitelabel/MoreInputs.jsx"
      summary="Segmented control. `type=single` for views/zoom; `type=multiple` for formatting toolbars. Two visual variants (outline / pill)."
      source={`<ToggleGroup type="single" value={view} onChange={setView}
  items={[
    { value: "grid", label: "Grid", icon: "grid-3x3" },
    { value: "list", label: "List", icon: "list" },
  ]} />

<ToggleGroup type="multiple" value={["bold"]} onChange={…}
  items={[{ value: "bold", icon: "bold" }, …]} />`}>
      <Group label="Single — outline">
        <ToggleGroup type="single" value={view} onChange={setView}
          items={[
            { value: "grid",  label: "Grid",  icon: "grid-3x3" },
            { value: "list",  label: "List",  icon: "list" },
            { value: "board", label: "Board", icon: "kanban" },
          ]} />
      </Group>
      <Group label="Single — pill">
        <ToggleGroup type="single" variant="pill" value={zoom} onChange={setZoom}
          items={[
            { value: "50",  label: "50%" },
            { value: "100", label: "100%" },
            { value: "150", label: "150%" },
            { value: "200", label: "200%" },
          ]} />
      </Group>
      <Group label="Multiple — formatting toolbar">
        <ToggleGroup type="multiple" value={align} onChange={setAlign} size="sm"
          items={[
            { value: "bold",      icon: "bold" },
            { value: "italic",    icon: "italic" },
            { value: "underline", icon: "underline" },
            { value: "strike",    icon: "strikethrough" },
          ]} />
      </Group>
      <Group label="Sizes">
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
          <ToggleGroup type="single" size="sm" value="a"
            items={[{ value: "a", label: "Small" }, { value: "b", label: "Small" }, { value: "c", label: "Small" }]} />
          <ToggleGroup type="single" size="md" value="a"
            items={[{ value: "a", label: "Medium" }, { value: "b", label: "Medium" }, { value: "c", label: "Medium" }]} />
          <ToggleGroup type="single" size="lg" value="a"
            items={[{ value: "a", label: "Large" }, { value: "b", label: "Large" }, { value: "c", label: "Large" }]} />
        </div>
      </Group>
    </Spec>
  );
}

/* ─── COMBOBOX ──────────────────────────────────────────── */
function ComboboxSpec() {
  const [v1, setV1] = useSx2(null);
  const [v2, setV2] = useSx2("us");
  const countries = [
    { value: "br", label: "Brazil", sub: "BR · GMT-3" },
    { value: "us", label: "United States", sub: "US · GMT-5 to -10" },
    { value: "pt", label: "Portugal", sub: "PT · GMT" },
    { value: "es", label: "Spain", sub: "ES · GMT+1" },
    { value: "jp", label: "Japan", sub: "JP · GMT+9" },
    { value: "au", label: "Australia", sub: "AU · GMT+8 to +11" },
    { value: "de", label: "Germany", sub: "DE · GMT+1" },
    { value: "fr", label: "France", sub: "FR · GMT+1" },
    { value: "in", label: "India", sub: "IN · GMT+5:30" },
    { value: "cn", label: "China", sub: "CN · GMT+8" },
  ];
  const cmds = [
    { value: "new",   label: "New project",  icon: "plus" },
    { value: "open",  label: "Open recent…", icon: "history" },
    { value: "share", label: "Share link",   icon: "share-2" },
    { value: "exp",   label: "Export as PDF",icon: "file-text" },
    { value: "imp",   label: "Import…",      icon: "upload" },
    { value: "set",   label: "Settings",     icon: "settings" },
  ];
  return (
    <Spec name="Combobox" file="src/whitelabel/MoreInputs.jsx"
      summary="Searchable single-select with custom popover. Filter matches both label and optional sub-label. Clearable."
      source={`<Combobox value={v} onChange={setV} label="Country"
  options={[
    { value: "br", label: "Brazil", sub: "BR · GMT-3" },
    { value: "us", label: "United States", sub: "US" },
    ...
  ]} />`}>
      <Group label="With sub-labels">
        <div style={{ width: 320 }}>
          <Combobox label="Country" value={v2} onChange={setV2} options={countries} />
        </div>
      </Group>
      <Group label="With icons">
        <div style={{ width: 320 }}>
          <Combobox label="Quick command" value={v1} onChange={setV1} options={cmds}
            placeholder="Pick a command…" searchPlaceholder="Type to find…" />
        </div>
      </Group>
      <Group label="Disabled">
        <div style={{ width: 320 }}>
          <Combobox label="Disabled" disabled options={countries} placeholder="Locked" />
        </div>
      </Group>
    </Spec>
  );
}

/* ─── ACCORDION ─────────────────────────────────────────── */
function AccordionSpec() {
  return (
    <Spec name="Accordion" file="src/whitelabel/MoreInputs.jsx"
      summary="Collapsible section list. `type=single` lets one open at a time; `type=multiple` lets many be open."
      source={`<Accordion items={[
  { id: "billing", title: "Billing", icon: "credit-card", content: "..." },
  { id: "team",    title: "Team",    icon: "users",       content: "..." },
]} type="single" defaultValue="billing" />`}>
      <Group label="Single (default)">
        <div style={{ width: "100%" }}>
          <Accordion type="single" defaultValue="billing" items={[
            { id: "billing", title: "How does billing work?", icon: "credit-card",
              content: "You're billed monthly based on the number of active seats in your workspace. Add or remove members anytime — prorated charges apply." },
            { id: "trial",   title: "Is there a free trial?", icon: "gift",
              content: "Yes — every new workspace gets 14 days of Pro features. No card required to start." },
            { id: "cancel",  title: "Can I cancel any time?", icon: "x-circle",
              content: "Absolutely. You'll keep Pro features until the end of the current billing period, then drop to the free plan." },
            { id: "data",    title: "What happens to my data if I delete the workspace?", icon: "database",
              content: "It's archived for 30 days and then permanently deleted. Export at any time before deletion." },
          ]} />
        </div>
      </Group>
      <Group label="Multiple">
        <div style={{ width: "100%" }}>
          <Accordion type="multiple" defaultValue={["a", "b"]} items={[
            { id: "a", title: "Notifications",  icon: "bell",     content: "Configure how and when you're notified." },
            { id: "b", title: "Privacy",        icon: "shield",   content: "Manage who can see your profile and activity." },
            { id: "c", title: "API access",     icon: "key",      content: "Create and rotate API keys for integrations." },
          ]} />
        </div>
      </Group>
    </Spec>
  );
}

/* ─── ROOT ─────────────────────────────────────────────── */
function Catalog2() {
  return (
    <>
      <section className="dsx-sect" id="comp-dialog"><DialogSpec /></section>
      <section className="dsx-sect" id="comp-sheet"><SheetSpec /></section>
      <section className="dsx-sect" id="comp-popover"><PopoverSpec /></section>
      <section className="dsx-sect" id="comp-dropdown"><DropdownMenuSpec /></section>
      <section className="dsx-sect" id="comp-toast"><ToastSpec /></section>
      <section className="dsx-sect" id="comp-table"><TableSpec /></section>
      <section className="dsx-sect" id="comp-pagination"><PaginationSpec /></section>
      <section className="dsx-sect" id="comp-skeleton"><SkeletonSpec /></section>
      <section className="dsx-sect" id="comp-separator"><SeparatorSpec /></section>
      <section className="dsx-sect" id="comp-empty"><EmptySpec /></section>
      <section className="dsx-sect" id="comp-sidebar"><SidebarSpec /></section>
      <section className="dsx-sect" id="comp-slider"><SliderSpec /></section>
      <section className="dsx-sect" id="comp-toggle"><ToggleGroupSpec /></section>
      <section className="dsx-sect" id="comp-combobox"><ComboboxSpec /></section>
      <section className="dsx-sect" id="comp-accordion"><AccordionSpec /></section>
    </>
  );
}

Object.assign(window, { Catalog2 });
