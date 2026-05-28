// White-label catalog — Phase 3 specs for the 25 added components.

const { useState: useS3 } = React;

/* ─── SMALL PRIMITIVES SECTION ────────────────────────────────────────── */

function LabelSpec() {
  return (
    <Spec name="Label" file="src/whitelabel/Small.jsx"
      summary="Standalone form label. Use when you compose your own field layout instead of using <Field> or the labelled built-in inputs."
      source={`<Label htmlFor="email" required>Email address</Label>
<input id="email" type="email" />`}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Label>Default label</Label>
        <Label required>With required asterisk</Label>
        <Label htmlFor="x" required>Linked label</Label>
      </div>
    </Spec>
  );
}

function ToggleSpec() {
  const [bold, setBold] = useS3(true);
  const [italic, setItalic] = useS3(false);
  return (
    <Spec name="Toggle" file="src/whitelabel/Small.jsx"
      summary="Single on/off button. Use for bold/italic toolbars, mute, like, follow. (Use ToggleGroup when you want a segmented choice.)"
      source={`<Toggle pressed={bold} onChange={setBold} icon="bold" ariaLabel="Bold" />
<Toggle pressed={italic} onChange={setItalic} icon="italic" ariaLabel="Italic" />
<Toggle variant="outline" icon="bookmark">Save</Toggle>`}>
      <Group label="Icon-only">
        <div style={{ display: "flex", gap: 6 }}>
          <Toggle pressed={bold} onChange={setBold} icon="bold" ariaLabel="Bold" />
          <Toggle pressed={italic} onChange={setItalic} icon="italic" ariaLabel="Italic" />
          <Toggle icon="underline" ariaLabel="Underline" />
          <Toggle icon="strikethrough" ariaLabel="Strike" />
        </div>
      </Group>
      <Group label="With label">
        <div style={{ display: "flex", gap: 8 }}>
          <Toggle variant="outline" icon="bookmark">Save</Toggle>
          <Toggle variant="outline" icon="heart" defaultPressed>Liked</Toggle>
          <Toggle variant="outline" icon="bell">Notify</Toggle>
        </div>
      </Group>
      <Group label="Sizes">
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Toggle size="sm" icon="bold" ariaLabel="sm" />
          <Toggle size="md" icon="bold" ariaLabel="md" defaultPressed />
          <Toggle size="lg" icon="bold" ariaLabel="lg" />
        </div>
      </Group>
    </Spec>
  );
}

function AspectRatioSpec() {
  return (
    <Spec name="AspectRatio" file="src/whitelabel/Small.jsx"
      summary="Locks any child to a fixed aspect ratio. Wrap images, videos, embeds, or placeholders."
      source={`<AspectRatio ratio={16/9}>
  <img src={url} style={{width:"100%", height:"100%", objectFit:"cover", borderRadius:"var(--radius-md)"}} />
</AspectRatio>`}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, width: "100%" }}>
        {[
          { r: 16/9, l: "16 : 9" },
          { r: 4/3,  l: "4 : 3" },
          { r: 1,    l: "1 : 1" },
        ].map(({ r, l }) => (
          <div key={l}>
            <div style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 6 }}>{l}</div>
            <AspectRatio ratio={r}>
              <div style={{
                width: "100%", height: "100%",
                background: "linear-gradient(135deg, var(--brand-200), var(--brand-500))",
                borderRadius: "var(--radius-md)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--neutral-0)", fontWeight: 700, fontSize: 18,
              }}>{l}</div>
            </AspectRatio>
          </div>
        ))}
      </div>
    </Spec>
  );
}

function ButtonGroupSpec() {
  return (
    <Spec name="ButtonGroup" file="src/whitelabel/Small.jsx"
      summary="Joins adjacent buttons into one visual unit. Borders collapse and radius rounds only the outermost corners."
      source={`<ButtonGroup>
  <Button variant="outline">Day</Button>
  <Button variant="outline">Week</Button>
  <Button variant="outline">Month</Button>
</ButtonGroup>`}>
      <Group label="Outline trio">
        <ButtonGroup>
          <Button variant="outline">Day</Button>
          <Button variant="outline">Week</Button>
          <Button variant="outline">Month</Button>
        </ButtonGroup>
      </Group>
      <Group label="With icons">
        <ButtonGroup>
          <Button variant="outline" leading="chevron-left" iconOnly ariaLabel="Prev" />
          <Button variant="outline">Today</Button>
          <Button variant="outline" leading="chevron-right" iconOnly ariaLabel="Next" />
        </ButtonGroup>
      </Group>
      <Group label="Primary + secondary">
        <ButtonGroup>
          <Button variant="primary">Save</Button>
          <Button variant="primary" iconOnly leading="chevron-down" ariaLabel="More save options" />
        </ButtonGroup>
      </Group>
    </Spec>
  );
}

function InputGroupSpec() {
  return (
    <Spec name="InputGroup" file="src/whitelabel/Small.jsx"
      summary="Input with attached text or button addons. Use for URL prefixes, currency symbols, copy buttons, search submit."
      source={`<InputGroup>
  <InputGroupAddon>https://</InputGroupAddon>
  <InputGroupInput placeholder="your-site" />
  <InputGroupAddon>.acme.com</InputGroupAddon>
</InputGroup>`}>
      <Group label="URL builder">
        <div style={{ width: 460 }}>
          <InputGroup>
            <InputGroupAddon>https://</InputGroupAddon>
            <InputGroupInput placeholder="your-site" defaultValue="acme" />
            <InputGroupAddon>.acme.com</InputGroupAddon>
          </InputGroup>
        </div>
      </Group>
      <Group label="With submit button">
        <div style={{ width: 360 }}>
          <InputGroup>
            <InputGroupAddon><Icon name="search" size={14} /></InputGroupAddon>
            <InputGroupInput placeholder="Search…" />
            <InputGroupButton>Search</InputGroupButton>
          </InputGroup>
        </div>
      </Group>
      <Group label="Currency">
        <div style={{ width: 200 }}>
          <InputGroup>
            <InputGroupAddon>$</InputGroupAddon>
            <InputGroupInput placeholder="0.00" />
            <InputGroupAddon>USD</InputGroupAddon>
          </InputGroup>
        </div>
      </Group>
    </Spec>
  );
}

function FieldSpec() {
  return (
    <Spec name="Field" file="src/whitelabel/Small.jsx"
      summary="Form-row wrapper: bundles a Label, any input child, plus hint/error helper text. Use when the built-in `label` prop on Input isn't flexible enough (e.g. wrapping a Combobox or DatePicker)."
      source={`<Field label="Country" required hint="Used for tax calculation">
  <Combobox value={v} onChange={setV} options={countries} />
</Field>

<Field label="Card" error="Card number is invalid">
  <InputOTP length={4} />
</Field>`}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, width: "100%" }}>
        <Field label="Country" required hint="Used for tax calculation">
          <Select options={["—", "Brazil", "United States", "Portugal"]} />
        </Field>
        <Field label="Webhook URL" error="URL must be HTTPS">
          <Input placeholder="https://example.com/hook" defaultValue="http://example.com/hook" />
        </Field>
        <Field label="Tags">
          <Input placeholder="comma, separated, tags" />
        </Field>
        <Field label="Send digest at">
          <Input type="time" defaultValue="09:00" />
        </Field>
      </div>
    </Spec>
  );
}

function ItemSpec() {
  return (
    <Spec name="Item" file="src/whitelabel/Small.jsx"
      summary="Generic list-item primitive: leading slot, title, description, trailing slot. Hover and selected states built in."
      source={`<Item leading={<Avatar name="Marina C" />}
  title="Marina Costa" description="Admin — added 3 days ago"
  trailing={<Icon name="chevron-right" />}
  onClick={…} />`}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%", maxWidth: 460 }}>
        <Item leading={<Avatar name="Marina Costa" />}
          title="Marina Costa"
          description="Admin · added 3 days ago"
          trailing={<Icon name="chevron-right" size={16} />}
          onClick={() => {}} />
        <Item leading={<Avatar name="Lucas T" color="var(--emerald-600)" />}
          title="Lucas Tavares"
          description="Editor · last active 2h ago"
          trailing={<Badge variant="success" dot>online</Badge>}
          onClick={() => {}} />
        <Item leading={<Avatar name="Sofia A" color="var(--violet-600)" />}
          title="Sofia Almeida"
          description="Viewer · invited"
          selected
          trailing={<Icon name="check" size={16} />} />
        <Item leading={<Icon name="folder" size={20} color="var(--fg-muted)" />}
          title="Marketing"
          description="34 projects · 12 members"
          trailing={<Icon name="chevron-right" size={16} />}
          onClick={() => {}} />
      </div>
    </Spec>
  );
}

function CollapsibleSpec() {
  return (
    <Spec name="Collapsible" file="src/whitelabel/Small.jsx"
      summary="Single open/close section — simpler than Accordion (which handles a list)."
      source={`<Collapsible trigger="See advanced options">
  <div>Hidden content here</div>
</Collapsible>`}>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
        <Collapsible trigger={<span style={{ fontSize: 13, fontWeight: 500 }}>See advanced options</span>}>
          <div style={{ padding: 12, background: "var(--bg-subtle)", borderRadius: "var(--radius-md)", fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.5 }}>
            Hidden by default. Use Collapsible for low-priority controls — keep the surface clean while letting power users dig deeper.
          </div>
        </Collapsible>
        <Collapsible defaultOpen
          trigger={({ open }) => (
            <Button variant="ghost" leading={open ? "chevron-down" : "chevron-right"}>
              {open ? "Hide" : "Show"} 4 hidden items
            </Button>
          )}>
          <div style={{ paddingLeft: 24, display: "flex", flexDirection: "column", gap: 4 }}>
            <Item title="Archived: Project Atlas" />
            <Item title="Archived: Q4 Roadmap" />
            <Item title="Archived: Beta release" />
            <Item title="Archived: Marketing site v2" />
          </div>
        </Collapsible>
      </div>
    </Spec>
  );
}

function ScrollAreaSpec() {
  return (
    <Spec name="ScrollArea" file="src/whitelabel/Small.jsx"
      summary="Styled scroll container with a slim, themed scrollbar. Use when the default OS scrollbar feels heavy."
      source={`<ScrollArea height={240}>
  <!-- long content -->
</ScrollArea>`}>
      <div style={{ width: 380 }}>
        <ScrollArea height={220}>
          <div style={{ padding: 14 }}>
            {Array.from({ length: 24 }).map((_, i) => (
              <Item key={i} leading={<Avatar name={`User ${i + 1}`} color={`hsl(${i * 23 % 360} 60% 55%)`} />}
                title={`Row ${i + 1}`}
                description={`Description for row ${i + 1}`} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </Spec>
  );
}

function AlertDialogSpec() {
  const [a, setA] = useS3(false);
  const [b, setB] = useS3(false);
  return (
    <Spec name="AlertDialog" file="src/whitelabel/Small.jsx"
      summary="Modal confirmation that cannot be dismissed by backdrop click — used for destructive or irreversible actions. Variants: default, warning, danger."
      source={`const [open, setOpen] = useState(false);

<AlertDialog
  open={open} variant="danger"
  title="Delete this project?"
  description="This action cannot be undone. All data will be lost."
  confirmLabel="Delete forever"
  onCancel={() => setOpen(false)}
  onConfirm={() => { deleteProject(); setOpen(false); }}
/>`}>
      <Group label="Triggers">
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="outline" onClick={() => setA(true)}>Sign out</Button>
          <Button variant="danger"  onClick={() => setB(true)} leading="trash-2">Delete project</Button>
        </div>
      </Group>
      <AlertDialog open={a} variant="warning" title="Sign out?"
        description="You have unsaved changes that will be discarded."
        confirmLabel="Sign out anyway"
        onCancel={() => setA(false)} onConfirm={() => setA(false)} />
      <AlertDialog open={b} variant="danger" title="Delete Q3 Launch Plan?"
        description="This deletes all 47 documents, 12 issues, and 3 integrations associated with this project. This action cannot be undone."
        confirmLabel="Delete forever"
        onCancel={() => setB(false)} onConfirm={() => setB(false)} />
    </Spec>
  );
}

/* ─── MEDIUM SECTION ──────────────────────────────────────────────────── */

function HoverCardSpec() {
  return (
    <Spec name="HoverCard" file="src/whitelabel/Medium.jsx"
      summary="Rich preview triggered by hover. Like a tooltip, but with structured content (user cards, link previews)."
      source={`<HoverCard trigger={<a href="#">@marina</a>}>
  <UserCard name="Marina Costa" role="Admin" />
</HoverCard>`}>
      <div style={{ padding: "30px 0", fontSize: 14, color: "var(--fg-muted)", lineHeight: 1.6 }}>
        The project was completed by{" "}
        <HoverCard width={280} trigger={
          <a href="#" onClick={(e) => e.preventDefault()} style={{ color: "var(--fg-link)", fontWeight: 500 }}>@marina</a>
        }>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <Avatar name="Marina Costa" size={40} status="online" />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Marina Costa</div>
              <div style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 2 }}>Admin · joined Jan 2025</div>
              <div style={{ fontSize: 13, marginTop: 8, lineHeight: 1.45 }}>Design lead. Owns the marketing site and the design system. Currently on Q3 Launch Plan.</div>
              <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                <Button size="sm" variant="primary">Message</Button>
                <Button size="sm" variant="outline">View profile</Button>
              </div>
            </div>
          </div>
        </HoverCard>
        {" "}with help from{" "}
        <HoverCard width={280} trigger={
          <a href="#" onClick={(e) => e.preventDefault()} style={{ color: "var(--fg-link)", fontWeight: 500 }}>@lucas</a>
        }>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <Avatar name="Lucas Tavares" size={40} color="var(--emerald-600)" status="away" />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Lucas Tavares</div>
              <div style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 2 }}>Engineer · 12 projects</div>
              <div style={{ fontSize: 13, marginTop: 8, lineHeight: 1.45 }}>Backend engineer. Owns the auth and billing services.</div>
            </div>
          </div>
        </HoverCard>.
      </div>
    </Spec>
  );
}

function ContextMenuSpec() {
  return (
    <Spec name="ContextMenu" file="src/whitelabel/Medium.jsx"
      summary="Right-click activated menu. Same items API as DropdownMenu."
      source={`<ContextMenu items={[
  { text: "Open", icon: "external-link", onSelect: …, shortcut: "↵" },
  { separator: true },
  { text: "Delete", icon: "trash-2", danger: true, shortcut: "⌘⌫", onSelect: … },
]}>
  <div>Right-click anywhere inside this box</div>
</ContextMenu>`}>
      <ContextMenu items={[
        { label: "Actions" },
        { text: "Open",       icon: "external-link", shortcut: "↵" },
        { text: "Duplicate",  icon: "copy",          shortcut: "⌘D" },
        { text: "Rename",     icon: "edit-3" },
        { separator: true },
        { text: "Share…",     icon: "share-2" },
        { text: "Export PDF", icon: "file-text" },
        { separator: true },
        { text: "Delete",     icon: "trash-2", danger: true, shortcut: "⌘⌫" },
      ]}>
        <div style={{
          height: 140, borderRadius: "var(--radius-md)",
          background: "linear-gradient(135deg, var(--bg-muted), var(--bg-subtle))",
          border: "1px dashed var(--border-default)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--fg-muted)", fontSize: 13,
        }}>Right-click anywhere inside this box</div>
      </ContextMenu>
    </Spec>
  );
}

function InputOTPSpec() {
  const [v, setV] = useS3("");
  return (
    <Spec name="InputOTP" file="src/whitelabel/Medium.jsx"
      summary="N-digit one-time-password input. Auto-advances on input, supports paste, arrow nav, backspace-to-previous."
      source={`<InputOTP length={6} value={v} onChange={setV} autoFocus />
<InputOTP length={4} mask />        // password-style dots
<InputOTP length={6} error />`}>
      <Group label="6-digit code">
        <InputOTP length={6} value={v} onChange={setV} />
        <div style={{ marginTop: 8, fontSize: 12, color: "var(--fg-muted)", fontFamily: "var(--font-mono)" }}>value = "{v}"</div>
      </Group>
      <Group label="Lengths">
        <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start" }}>
          <div><div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 4 }}>4-digit PIN</div><InputOTP length={4} /></div>
          <div><div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 4 }}>6-digit OTP</div><InputOTP length={6} /></div>
          <div><div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 4 }}>Masked</div><InputOTP length={4} mask defaultValue="1234" /></div>
        </div>
      </Group>
      <Group label="Error">
        <InputOTP length={6} error defaultValue="123456" />
      </Group>
    </Spec>
  );
}

function ResizableSpec() {
  return (
    <Spec name="Resizable" file="src/whitelabel/Medium.jsx"
      summary="Resizable horizontal or vertical split panes. Drag the handle to reflow."
      source={`<Resizable direction="horizontal" initialSizes={[25, 75]}>
  <div>Sidebar</div>
  <div>Main</div>
</Resizable>`}>
      <Group label="Horizontal">
        <div style={{ height: 240, width: "100%", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
          <Resizable direction="horizontal" initialSizes={[28, 72]}>
            <div style={{ padding: 14, background: "var(--bg-subtle)", height: "100%", fontSize: 13 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Sidebar</div>
              <div style={{ color: "var(--fg-muted)" }}>Drag the handle to resize.</div>
            </div>
            <div style={{ padding: 14, height: "100%", fontSize: 13 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Content</div>
              <div style={{ color: "var(--fg-muted)" }}>The two panels share width — when one grows, the other shrinks.</div>
            </div>
          </Resizable>
        </div>
      </Group>
      <Group label="Three panes">
        <div style={{ height: 240, width: "100%", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
          <Resizable direction="horizontal" initialSizes={[25, 50, 25]}>
            <div style={{ padding: 14, background: "var(--bg-subtle)", height: "100%" }}>List</div>
            <div style={{ padding: 14, height: "100%" }}>Detail</div>
            <div style={{ padding: 14, background: "var(--bg-subtle)", height: "100%" }}>Inspector</div>
          </Resizable>
        </div>
      </Group>
    </Spec>
  );
}

function DrawerSpec() {
  const [open, setOpen] = useS3(false);
  return (
    <Spec name="Drawer" file="src/whitelabel/Medium.jsx"
      summary="Mobile-style bottom sheet with a drag handle and rounded top. Use on mobile or for quick actions where Sheet would feel too large."
      source={`<Drawer open={open} onClose={() => setOpen(false)} title="Quick actions">
  {/* drawer body */}
</Drawer>`}>
      <Group label="Trigger">
        <Button variant="outline" leading="panel-bottom" onClick={() => setOpen(true)}>Open drawer</Button>
        <Drawer open={open} onClose={() => setOpen(false)} title="Add to project" description="Choose where to add this file."
          footer={<><Button variant="outline" fullWidth onClick={() => setOpen(false)}>Cancel</Button><Button variant="primary" fullWidth onClick={() => setOpen(false)}>Add</Button></>}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {[
              { i: "folder", l: "Q3 Launch" },
              { i: "folder", l: "Marketing" },
              { i: "folder", l: "Design" },
              { i: "folder-plus", l: "New folder" },
            ].map(({ i, l }) => (
              <Card key={l} interactive padding={12}>
                <Icon name={i} size={22} color="var(--fg-muted)" />
                <div style={{ marginTop: 6, fontSize: 12, fontWeight: 500 }}>{l}</div>
              </Card>
            ))}
          </div>
        </Drawer>
      </Group>
    </Spec>
  );
}

function MenubarSpec() {
  return (
    <Spec name="Menubar" file="src/whitelabel/Medium.jsx"
      summary="Desktop-style top menu bar (File / Edit / View). Each entry opens a flat menu."
      source={`<Menubar items={[
  { label: "File", items: [
    { text: "New",  icon: "plus",     shortcut: "⌘N", onSelect: … },
    { text: "Open…", icon: "folder",  shortcut: "⌘O" },
    { separator: true },
    { text: "Save", icon: "save", shortcut: "⌘S" },
  ]},
  { label: "Edit", items: [...] },
]} />`}>
      <Menubar items={[
        { label: "File", items: [
          { text: "New",   icon: "plus",   shortcut: "⌘N" },
          { text: "Open…", icon: "folder", shortcut: "⌘O" },
          { separator: true },
          { text: "Save",  icon: "save",   shortcut: "⌘S" },
          { text: "Save As…",            shortcut: "⇧⌘S" },
          { separator: true },
          { text: "Export…", icon: "download" },
          { text: "Close",   icon: "x",       shortcut: "⌘W" },
        ]},
        { label: "Edit", items: [
          { text: "Undo",  icon: "rotate-ccw", shortcut: "⌘Z" },
          { text: "Redo",  icon: "rotate-cw",  shortcut: "⇧⌘Z" },
          { separator: true },
          { text: "Cut",   shortcut: "⌘X" },
          { text: "Copy",  shortcut: "⌘C" },
          { text: "Paste", shortcut: "⌘V" },
        ]},
        { label: "View", items: [
          { text: "Zoom in",  shortcut: "⌘=" },
          { text: "Zoom out", shortcut: "⌘-" },
          { text: "Actual size", shortcut: "⌘0" },
          { separator: true },
          { text: "Toggle sidebar", icon: "panel-left" },
        ]},
        { label: "Help", items: [
          { text: "Documentation", icon: "book-open" },
          { text: "Keyboard shortcuts", icon: "command" },
          { separator: true },
          { text: "Report an issue", icon: "alert-octagon", danger: true },
        ]},
      ]} />
    </Spec>
  );
}

/* ─── COMPLEX SECTION ─────────────────────────────────────────────────── */

function CalendarSpec() {
  const [d, setD] = useS3(new Date());
  return (
    <Spec name="Calendar" file="src/whitelabel/Complex.jsx"
      summary="Standalone date picker grid. Single-date selection, month navigation, today indicator, optional min/max."
      source={`const [date, setDate] = useState(null);

<Calendar value={date} onChange={setDate} />
<Calendar value={date} onChange={setDate} min={new Date()} weekStartsOn={1} />`}>
      <Group label="Default">
        <Calendar value={d} onChange={setD} />
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg-muted)", marginTop: 6 }}>
          value = {d ? d.toISOString().slice(0, 10) : "null"}
        </div>
      </Group>
      <Group label="Min today, Monday-first">
        <Calendar value={null} onChange={() => {}} min={new Date()} weekStartsOn={1} />
      </Group>
    </Spec>
  );
}

function DatePickerSpec() {
  const [d1, setD1] = useS3(null);
  const [d2, setD2] = useS3(new Date());
  return (
    <Spec name="DatePicker" file="src/whitelabel/Complex.jsx"
      summary="Input field that opens a Calendar in a popover on click. Clear button when a value is set."
      source={`<DatePicker label="Due date" value={date} onChange={setDate} hint="Optional" />
<DatePicker value={date} onChange={setDate} placeholder="Pick a date" />`}>
      <Group label="With label">
        <div style={{ width: 280 }}>
          <DatePicker label="Due date" value={d1} onChange={setD1} hint="When this task is expected to ship." />
        </div>
      </Group>
      <Group label="Pre-filled">
        <div style={{ width: 280 }}>
          <DatePicker label="Birthday" value={d2} onChange={setD2} />
        </div>
      </Group>
      <Group label="Error">
        <div style={{ width: 280 }}>
          <DatePicker label="Deadline" value={null} onChange={() => {}} error hint="Required field" />
        </div>
      </Group>
    </Spec>
  );
}

function CommandSpec() {
  const [open, setOpen] = useS3(false);
  return (
    <Spec name="Command (⌘K palette)" file="src/whitelabel/Complex.jsx"
      summary="Power-user search palette. Keyboard-driven, sectioned results, fuzzy filter. Mount once globally; trigger with ⌘K."
      source={`const [open, setOpen] = useState(false);

useEffect(() => {
  const fn = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(o => !o); } };
  window.addEventListener("keydown", fn);
  return () => window.removeEventListener("keydown", fn);
}, []);

<Command open={open} onClose={() => setOpen(false)} sections={[
  { section: "Suggestions", commands: [...] },
  { section: "Navigate",    commands: [...] },
]} />`}>
      <Group label="Triggers">
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Button variant="outline" onClick={() => setOpen(true)} leading="search">Open palette</Button>
          <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>or press <Kbd>⌘</Kbd><Kbd>K</Kbd></span>
        </div>
      </Group>
      <Command open={open} onClose={() => setOpen(false)} sections={[
        { section: "Suggestions", commands: [
          { id: "n",    label: "New project",       icon: "plus",        shortcut: "⌘N", onSelect: () => window.toast?.success("New project") },
          { id: "inv",  label: "Invite teammate",   icon: "user-plus",   shortcut: "⌘I" },
          { id: "sh",   label: "Share workspace",   icon: "share-2" },
        ]},
        { section: "Navigate", commands: [
          { id: "ovr",  label: "Overview",          icon: "layout-dashboard", hint: "Workspace dashboard" },
          { id: "prj",  label: "Projects",          icon: "folder-kanban" },
          { id: "mem",  label: "Members",           icon: "users" },
          { id: "bil",  label: "Billing",           icon: "credit-card",  hint: "Plan, invoices, usage" },
          { id: "set",  label: "Settings",          icon: "settings",     shortcut: "⌘," },
        ]},
        { section: "Account", commands: [
          { id: "out",  label: "Sign out",          icon: "log-out" },
        ]},
      ]} />
      <div style={{ marginTop: 10, padding: 12, background: "var(--bg-muted)", borderRadius: "var(--radius-md)", fontSize: 12, color: "var(--fg-muted)" }}>
        Keyboard: <Kbd>↑</Kbd><Kbd>↓</Kbd> to navigate · <Kbd>↵</Kbd> to select · <Kbd>Esc</Kbd> to close. Try typing "set", "new", or "bill".
      </div>
    </Spec>
  );
}

function CarouselSpec() {
  return (
    <Spec name="Carousel" file="src/whitelabel/Complex.jsx"
      summary="Slide-by-slide carousel with prev/next arrows and dot indicators. Optional autoplay."
      source={`<Carousel>
  <img src={url1} />
  <img src={url2} />
  <img src={url3} />
</Carousel>

<Carousel autoplay interval={3000} showDots showArrows={false} />`}>
      <div style={{ width: "100%", maxWidth: 560 }}>
        <Carousel autoplay interval={4000}>
          {[
            { c: "var(--brand-500)",   t: "Slide one",   d: "Welcome to your dashboard." },
            { c: "var(--emerald-500)", t: "Slide two",   d: "Track progress and invite teammates." },
            { c: "var(--amber-500)",   t: "Slide three", d: "Ship your project on time." },
            { c: "var(--rose-500)",    t: "Slide four",  d: "Celebrate the launch." },
          ].map((s, i) => (
            <div key={i} style={{
              height: 240, padding: 28,
              background: `linear-gradient(135deg, ${s.c} 0%, color-mix(in oklab, ${s.c} 50%, var(--neutral-900)) 100%)`,
              color: "var(--neutral-0)",
              display: "flex", flexDirection: "column", justifyContent: "flex-end",
            }}>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{s.t}</div>
              <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>{s.d}</div>
            </div>
          ))}
        </Carousel>
      </div>
    </Spec>
  );
}

function ChartSpec() {
  const series = useS3([
    { x: "Mon", a: 12, b: 18 }, { x: "Tue", a: 22, b: 14 }, { x: "Wed", a: 18, b: 26 },
    { x: "Thu", a: 32, b: 22 }, { x: "Fri", a: 28, b: 36 }, { x: "Sat", a: 38, b: 30 }, { x: "Sun", a: 44, b: 28 },
  ])[0];
  return (
    <Spec name="Chart (Line / Bar / Area)" file="src/whitelabel/Complex.jsx"
      summary="Lightweight SVG chart. Single or multi-series. Three types: line, bar, area. Tokens-driven colors."
      source={`<Chart type="line" data={data} x="x" y="value" />
<Chart type="area" data={data} x="x" y="value" />
<Chart type="bar"  data={data} x="x" y={["a", "b"]} />`}>
      <Group label="Line">
        <Chart type="line" data={series} y="a" height={180} label="Active users" />
      </Group>
      <Group label="Area (multi-series)">
        <Chart type="area" data={series} y={["a", "b"]} height={180} label="Sessions vs. Pageviews" />
      </Group>
      <Group label="Bar">
        <Chart type="bar" data={series} y={["a", "b"]} height={180} />
      </Group>
    </Spec>
  );
}

function DataTableSpec() {
  const rows = useS3([
    { id: 1, name: "Marina Costa",   role: "Admin",  status: "active",    spend: 8420, joined: "2026-01-12" },
    { id: 2, name: "Lucas Tavares",  role: "Editor", status: "active",    spend: 1290, joined: "2026-02-04" },
    { id: 3, name: "Sofia Almeida",  role: "Viewer", status: "invited",   spend: 0,    joined: "2026-03-22" },
    { id: 4, name: "Daniel Pereira", role: "Editor", status: "active",    spend: 540,  joined: "2026-04-01" },
    { id: 5, name: "Beatriz Reis",   role: "Admin",  status: "suspended", spend: 3320, joined: "2026-04-18" },
    { id: 6, name: "Henrique Lima",  role: "Editor", status: "active",    spend: 720,  joined: "2026-05-02" },
    { id: 7, name: "Carla Mendonça", role: "Viewer", status: "invited",   spend: 0,    joined: "2026-05-19" },
    { id: 8, name: "Felipe Castro",  role: "Editor", status: "active",    spend: 2100, joined: "2026-06-04" },
    { id: 9, name: "Renata Aguilar", role: "Admin",  status: "active",    spend: 9800, joined: "2026-06-21" },
    { id:10, name: "Vitor Sandes",   role: "Viewer", status: "active",    spend: 60,   joined: "2026-07-08" },
    { id:11, name: "Aline Borges",   role: "Editor", status: "active",    spend: 1840, joined: "2026-07-22" },
    { id:12, name: "Tomás Galvão",   role: "Viewer", status: "invited",   spend: 0,    joined: "2026-08-01" },
  ])[0];
  return (
    <Spec name="DataTable" file="src/whitelabel/Complex.jsx"
      summary="Higher-level table with built-in search, sortable columns, row selection, pagination. Columns config drives layout and rendering."
      source={`<DataTable
  data={rows}
  columns={[
    { key: "name",   label: "Member", sortable: true, render: r => <UserCell {...r} /> },
    { key: "role",   label: "Role",   sortable: true },
    { key: "status", label: "Status", render: r => <Badge dot variant={…}>{r.status}</Badge> },
    { key: "spend",  label: "Spend",  align: "right", mono: true, sortable: true,
      render: r => "$" + r.spend.toLocaleString() },
  ]}
  searchable searchKey={["name", "role"]}
  selectable onSelectionChange={…}
  pageSize={8}
/>`}>
      <DataTable data={rows} searchable searchKey={["name", "role"]} selectable pageSize={8}
        caption={`${rows.length} members in this workspace.`}
        columns={[
          { key: "name", label: "Member", sortable: true, render: r => (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar name={r.name} />
              <div><div style={{ fontWeight: 500 }}>{r.name}</div><div style={{ fontSize: 11, color: "var(--fg-muted)" }}>id: {r.id}</div></div>
            </div>
          )},
          { key: "role",   label: "Role",   sortable: true },
          { key: "status", label: "Status", render: r =>
            <Badge size="sm" variant={r.status === "active" ? "success" : r.status === "invited" ? "info" : "warning"} dot>{r.status}</Badge>
          },
          { key: "joined", label: "Joined", sortable: true, mono: true },
          { key: "spend",  label: "Spend",  align: "right", mono: true, sortable: true,
            render: r => "$" + r.spend.toLocaleString() },
        ]} />
    </Spec>
  );
}

function NavigationMenuSpec() {
  return (
    <Spec name="NavigationMenu" file="src/whitelabel/Complex.jsx"
      summary="Top-of-page navigation with optional mega-menu panels per item. Use for marketing sites and dashboards with rich menus."
      source={{
        jsx: `<NavigationMenu items={[
  { label: "Products", panel: <ProductsPanel /> },
  { label: "Pricing",  href: "/pricing" },
  { label: "Company",  panel: <CompanyPanel /> },
]} />`,
        json: `{
  "component": "NavigationMenu",
  "props": {
    "items": [
      {
        "label": "Products",
        "panel": "ReactNode (mega-menu content)",
        "panelWidth": "number (default 480)"
      },
      { "label": "Pricing", "href": "/pricing" },
      { "label": "Company", "panel": "ReactNode" }
    ]
  }
}`,
        tailwind: `<nav class="inline-flex gap-0.5 p-1 bg-white border border-slate-200 rounded-md">
  <button class="inline-flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium
                 text-slate-900 hover:bg-slate-100">
    Products
    <svg class="h-3 w-3 text-slate-500">▾</svg>
  </button>
  <a href="/pricing" class="px-3 py-1.5 rounded text-sm font-medium
                            text-slate-900 hover:bg-slate-100">Pricing</a>
  <a href="/docs"    class="px-3 py-1.5 rounded text-sm font-medium
                            text-slate-900 hover:bg-slate-100">Docs</a>
</nav>

<!-- Mega-menu panel (rendered on toggle, e.g. via JS) -->
<div class="absolute mt-1 w-[480px] p-4
            bg-white border border-slate-200 rounded-lg shadow-lg">
  <!-- panel content -->
</div>`,
        css: `.nav {
  display: inline-flex; gap: 2px; padding: 4px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xs);
}
.nav__item {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 7px 12px; border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 500; color: var(--fg-default);
  background: transparent; border: 0; cursor: pointer;
  text-decoration: none;
}
.nav__item:hover, .nav__item[aria-expanded="true"] {
  background: var(--bg-muted);
}
.nav__panel {
  position: absolute;
  background: var(--bg-raised);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 16px; min-width: 320px;
}`,
      }}>
      <div style={{ padding: "8px 0" }}>
        <NavigationMenu items={[
          { label: "Products", panelWidth: 520, panel: (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Item leading={<div style={iconWrap("var(--brand-500)")}><Icon name="layers" size={16} color="var(--neutral-0)" /></div>}
                title="Platform" description="The core dashboard for teams" onClick={() => {}} />
              <Item leading={<div style={iconWrap("var(--emerald-500)")}><Icon name="bar-chart-3" size={16} color="var(--neutral-0)" /></div>}
                title="Analytics" description="Insights from your data" onClick={() => {}} />
              <Item leading={<div style={iconWrap("var(--amber-500)")}><Icon name="zap" size={16} color="var(--neutral-0)" /></div>}
                title="Automations" description="Triggers and webhooks" onClick={() => {}} />
              <Item leading={<div style={iconWrap("var(--rose-500)")}><Icon name="users" size={16} color="var(--neutral-0)" /></div>}
                title="Teams" description="Roles, billing, SSO" onClick={() => {}} />
            </div>
          ) },
          { label: "Solutions", panelWidth: 380, panel: (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <Item title="For startups" onClick={() => {}} trailing={<Icon name="arrow-up-right" size={14} />} />
              <Item title="For enterprise" onClick={() => {}} trailing={<Icon name="arrow-up-right" size={14} />} />
              <Item title="For agencies" onClick={() => {}} trailing={<Icon name="arrow-up-right" size={14} />} />
              <Item title="For education" onClick={() => {}} trailing={<Icon name="arrow-up-right" size={14} />} />
            </div>
          )},
          { label: "Pricing", href: "#" },
          { label: "Docs",    href: "#" },
          { label: "Company", href: "#" },
        ]} />
      </div>
    </Spec>
  );
}
function iconWrap(c) {
  return {
    width: 32, height: 32, borderRadius: 8, background: c,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
  };
}

/* ─── ROOT ─────────────────────────────────────────────────────────── */

function Catalog3() {
  return (
    <>
      <section className="dsx-sect" id="comp-label"><LabelSpec /></section>
      <section className="dsx-sect" id="comp-toggle-single"><ToggleSpec /></section>
      <section className="dsx-sect" id="comp-aspect"><AspectRatioSpec /></section>
      <section className="dsx-sect" id="comp-button-group"><ButtonGroupSpec /></section>
      <section className="dsx-sect" id="comp-input-group"><InputGroupSpec /></section>
      <section className="dsx-sect" id="comp-field"><FieldSpec /></section>
      <section className="dsx-sect" id="comp-item"><ItemSpec /></section>
      <section className="dsx-sect" id="comp-collapsible"><CollapsibleSpec /></section>
      <section className="dsx-sect" id="comp-scrollarea"><ScrollAreaSpec /></section>
      <section className="dsx-sect" id="comp-alert-dialog"><AlertDialogSpec /></section>

      <section className="dsx-sect" id="comp-hovercard"><HoverCardSpec /></section>
      <section className="dsx-sect" id="comp-contextmenu"><ContextMenuSpec /></section>
      <section className="dsx-sect" id="comp-inputotp"><InputOTPSpec /></section>
      <section className="dsx-sect" id="comp-resizable"><ResizableSpec /></section>
      <section className="dsx-sect" id="comp-drawer"><DrawerSpec /></section>
      <section className="dsx-sect" id="comp-menubar"><MenubarSpec /></section>

      <section className="dsx-sect" id="comp-calendar"><CalendarSpec /></section>
      <section className="dsx-sect" id="comp-datepicker"><DatePickerSpec /></section>
      <section className="dsx-sect" id="comp-command"><CommandSpec /></section>
      <section className="dsx-sect" id="comp-carousel"><CarouselSpec /></section>
      <section className="dsx-sect" id="comp-chart"><ChartSpec /></section>
      <section className="dsx-sect" id="comp-datatable"><DataTableSpec /></section>
      <section className="dsx-sect" id="comp-navmenu"><NavigationMenuSpec /></section>
    </>
  );
}

Object.assign(window, { Catalog3 });
