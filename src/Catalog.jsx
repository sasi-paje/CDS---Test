// White-label catalog — every component, every state, with copyable source.

const { useState: useStateCat } = React;

/* ─── Spec helpers ─────────────────────────────────────────────────────── */
function Spec({ name, file, summary, source, children }) {
  const [showSrc, setShowSrc] = useStateCat(false);
  const [copied, setCopied] = useStateCat(false);
  // Normalize: string source → { jsx: source }; object → as-is
  const sources = typeof source === "string" ? { jsx: source } : (source || {});
  const formats = Object.keys(sources);
  const [fmt, setFmt] = useStateCat(formats[0] || "jsx");
  const currentSource = sources[fmt] || sources[formats[0]] || "";
  const FORMAT_LABELS = { jsx: "React", json: "JSON", tailwind: "Tailwind", css: "CSS", html: "HTML" };
  const copy = () => {
    navigator.clipboard.writeText(currentSource || "").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }).catch(() => {});
  };
  return (
    <div className="spec" id={`spec-${name.toLowerCase().replace(/\W+/g, "-")}`}>
      <div className="spec-head">
        <div className="spec-title">
          <h3 className="spec-name">{name}</h3>
          {file && <code className="spec-file">{file}</code>}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          {currentSource && (
            <button className="spec-btn" onClick={copy} title={`Copy ${FORMAT_LABELS[fmt] || fmt}`}>
              <Icon name={copied ? "check" : "clipboard"} size={13} />
              {copied ? "Copied" : "Copy"}
            </button>
          )}
          {currentSource && (
            <button className="spec-btn" onClick={() => setShowSrc(s => !s)}>
              <Icon name={showSrc ? "x" : "code"} size={13} />
              {showSrc ? "Hide source" : "View source"}
            </button>
          )}
        </div>
      </div>
      {summary && <p className="spec-summary">{summary}</p>}
      <div className="spec-stage">{children}</div>
      {showSrc && formats.length > 1 && (
        <div className="spec-tabs" role="tablist">
          {formats.map(f => (
            <button key={f} role="tab" aria-selected={fmt === f}
              onClick={() => setFmt(f)}
              className={"spec-tab" + (fmt === f ? " active" : "")}>
              {FORMAT_LABELS[f] || f}
            </button>
          ))}
        </div>
      )}
      {showSrc && currentSource && <pre className="spec-source"><code>{currentSource.trim()}</code></pre>}
    </div>
  );
}

function Group({ label, children }) {
  return (
    <div className="vgroup">
      <div className="vgroup-label">{label}</div>
      <div className="vgroup-items">{children}</div>
    </div>
  );
}

function Matrix({ rows, cols, build, headerCol = "Variant" }) {
  return (
    <div className="matrix-wrap">
      <table className="matrix">
        <thead><tr><th>{headerCol}</th>{cols.map(c => <th key={c.key || c}>{c.label || c}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={r.key || ri}>
              <th>{r.label || r}</th>
              {cols.map((c, ci) => <td key={ci}>{build(r, c)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── BUTTON ──────────────────────────────────────────────────────────── */
function ButtonSpec() {
  const variants = ["primary", "secondary", "tertiary", "tonal", "outline", "ghost", "text", "danger", "link"];
  const sizes = ["xs", "sm", "md", "lg"];
  return (
    <Spec name="Button" file="src/whitelabel/Primitives.jsx"
      summary="Nine variants × four sizes. Supports leading/trailing icons, icon-only, loading, disabled, and full-width. Hover/press/focus states are all token-driven."
      source={{
        jsx: `<Button variant="primary">Save</Button>
<Button variant="secondary" leading="plus">New project</Button>
<Button variant="tertiary">Brand-tinted hover</Button>
<Button variant="tonal" leading="sparkles">Suggested</Button>
<Button variant="outline" size="sm">Cancel</Button>
<Button variant="ghost">Quiet action</Button>
<Button variant="text">Inline text</Button>
<Button variant="danger" trailing="trash-2">Delete</Button>
<Button variant="link">Learn more</Button>
<Button variant="ghost" iconOnly leading="more-horizontal" ariaLabel="More" />
<Button variant="primary" loading>Saving…</Button>
<Button variant="primary" disabled>Disabled</Button>
<Button variant="primary" fullWidth>Continue</Button>`,
        json: `{
  "component": "Button",
  "props": {
    "variant": "primary | secondary | tertiary | tonal | outline | ghost | text | danger | link",
    "size": "xs | sm | md | lg",
    "leading": "lucide-icon-name",
    "trailing": "lucide-icon-name",
    "iconOnly": false,
    "loading": false,
    "disabled": false,
    "fullWidth": false,
    "ariaLabel": "Required when iconOnly"
  },
  "variantIntent": {
    "primary":   "Single most important action on the surface",
    "secondary": "Neutral filled (back, dismiss, supporting action)",
    "tertiary":  "Brand-colored low-emphasis (toolbar, inline action)",
    "tonal":     "Brand-tinted filled (suggested, AI / promoted)",
    "outline":   "Bordered alternative when a primary is too loud",
    "ghost":     "Transparent until hover; for icon bars and table actions",
    "text":      "Pure text button (no background); fg shifts to brand on hover",
    "danger":    "Destructive actions only — pair with a confirm step",
    "link":      "Inline in copy, underlines on hover"
  }
}`,
        tailwind: `<!-- Primary -->
<button class="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md
  bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40
  disabled:opacity-50 transition-colors">Save</button>

<!-- Secondary -->
<button class="inline-flex items-center gap-2 h-9 px-4 rounded-md
  bg-slate-100 text-slate-900 text-sm font-medium hover:bg-slate-200">Cancel</button>

<!-- Tertiary (brand text, brand-tinted hover) -->
<button class="inline-flex items-center gap-2 h-9 px-4 rounded-md
  bg-transparent text-indigo-700 text-sm font-medium hover:bg-indigo-50">More</button>

<!-- Tonal (brand-tinted filled) -->
<button class="inline-flex items-center gap-2 h-9 px-4 rounded-md
  bg-indigo-50 text-indigo-700 text-sm font-medium hover:bg-indigo-100">Suggested</button>

<!-- Outline -->
<button class="inline-flex items-center gap-2 h-9 px-4 rounded-md
  bg-white text-slate-900 text-sm font-medium border border-slate-300
  hover:bg-slate-50">Cancel</button>

<!-- Ghost -->
<button class="inline-flex items-center gap-2 h-9 px-4 rounded-md
  bg-transparent text-slate-900 text-sm font-medium hover:bg-slate-100">Quiet</button>

<!-- Text (no hover bg — fg shifts) -->
<button class="inline-flex items-center gap-2 h-9 px-4 rounded-md
  bg-transparent text-slate-900 text-sm font-medium hover:text-indigo-700">Inline</button>

<!-- Danger -->
<button class="inline-flex items-center gap-2 h-9 px-4 rounded-md
  bg-rose-600 text-white text-sm font-medium hover:bg-rose-700">Delete</button>

<!-- Link -->
<button class="text-sm font-medium text-indigo-600 hover:underline">Learn more</button>`,
        css: `/* Base */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  height: 38px; padding: 0 16px;
  font-family: var(--font-sans); font-size: 14px; font-weight: 500; line-height: 1;
  border: 1px solid transparent; border-radius: var(--radius-md);
  cursor: pointer; white-space: nowrap; user-select: none;
  transition: background-color var(--dur-fast) var(--ease-out),
              color var(--dur-fast) var(--ease-out),
              border-color var(--dur-fast) var(--ease-out);
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn:focus-visible { outline: none; box-shadow: var(--ring-focus); }

/* Variants */
.btn--primary   { background: var(--bg-brand);          color: var(--fg-on-brand); }
.btn--primary:hover  { background: var(--bg-brand-hover); }
.btn--primary:active { background: var(--bg-brand-active); }

.btn--secondary { background: var(--bg-muted);          color: var(--fg-default); }
.btn--secondary:hover { background: var(--neutral-200); }

.btn--tertiary  { background: transparent;              color: var(--fg-brand); }
.btn--tertiary:hover  { background: var(--bg-brand-subtle); }

.btn--tonal     { background: var(--bg-brand-subtle);   color: var(--fg-brand); }
.btn--tonal:hover { background: color-mix(in oklab, var(--brand-500) 16%, var(--bg-brand-subtle)); }

.btn--outline   { background: var(--bg-surface);        color: var(--fg-default);
                  border-color: var(--border-default); }
.btn--outline:hover { background: var(--bg-muted); }

.btn--ghost     { background: transparent;              color: var(--fg-default); }
.btn--ghost:hover { background: var(--bg-muted); }

.btn--text      { background: transparent;              color: var(--fg-default); }
.btn--text:hover { color: var(--fg-brand); }

.btn--danger    { background: var(--bg-danger);         color: var(--fg-on-brand); }
.btn--danger:hover { background: var(--rose-700); }

.btn--link      { background: transparent;              color: var(--fg-link);
                  padding: 0; height: auto; }
.btn--link:hover { text-decoration: underline; }

/* Sizes */
.btn--xs { height: 26px; padding: 0 8px;  font-size: 12px; }
.btn--sm { height: 32px; padding: 0 12px; font-size: 13px; }
.btn--lg { height: 46px; padding: 0 20px; font-size: 16px; }
.btn--icon { width: 38px; padding: 0; }`,
      }}>
      <Group label="Variants × sizes">
        <Matrix
          rows={variants}
          cols={sizes.map(s => ({ key: s, label: s.toUpperCase() }))}
          build={(v, c) => <Button variant={v} size={c.key}>Button</Button>}
        />
      </Group>
      <Group label="With icons">
        <Matrix
          rows={variants}
          cols={[{ key: "leading", label: "Leading" }, { key: "trailing", label: "Trailing" }, { key: "both", label: "Both" }, { key: "icon", label: "Icon-only" }]}
          build={(v, c) => {
            if (c.key === "leading")  return <Button variant={v} leading="plus">Create</Button>;
            if (c.key === "trailing") return <Button variant={v} trailing="arrow-right">Continue</Button>;
            if (c.key === "both")     return <Button variant={v} leading="download" trailing="external-link">Export</Button>;
            if (c.key === "icon")     return <Button variant={v} iconOnly leading="settings" ariaLabel="Settings" />;
          }}
        />
      </Group>
      <Group label="States">
        <Matrix
          rows={variants}
          cols={[{ key: "default", label: "Default" }, { key: "loading", label: "Loading" }, { key: "disabled", label: "Disabled" }]}
          build={(v, c) => {
            if (c.key === "loading")  return <Button variant={v} loading>Saving</Button>;
            if (c.key === "disabled") return <Button variant={v} disabled>Disabled</Button>;
            return <Button variant={v}>Default</Button>;
          }}
        />
      </Group>
      <Group label="Full width">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%" }}>
          <Button variant="primary" fullWidth leading="plus">Create project</Button>
          <Button variant="outline" fullWidth trailing="arrow-right">Continue</Button>
        </div>
      </Group>
    </Spec>
  );
}

/* ─── INPUT ──────────────────────────────────────────────────────────── */
function InputSpec() {
  const [v, setV] = useStateCat("alex@team.io");
  return (
    <Spec name="Input" file="src/whitelabel/Primitives.jsx"
      summary="Text input with optional label, hint, leading/trailing icons. States: default, focus, filled, error, disabled, read-only."
      source={{
        jsx: `<Input label="Email" leading="mail" placeholder="you@team.io" required />
<Input label="Password" type="password" leading="lock" trailing="eye" />
<Input label="Username" error hint="Already taken" value="admin" />
<Input label="API key" readOnly value="sk_live_•••" trailing="copy" />
<Input label="Locked" disabled value="cannot edit" />`,
        json: `{
  "component": "Input",
  "props": {
    "label":   "string",
    "hint":    "string",
    "error":   "boolean",
    "required":"boolean",
    "disabled":"boolean",
    "readOnly":"boolean",
    "leading": "lucide-icon-name",
    "trailing":"lucide-icon-name",
    "size":    "sm | md | lg",
    "type":    "text | email | password | number | tel | url | date | time",
    "placeholder": "string",
    "value":   "string",
    "onChange": "(value, event) => void"
  }
}`,
        tailwind: `<label class="flex flex-col gap-1.5">
  <span class="text-sm font-medium text-slate-900">Email</span>
  <div class="flex items-center gap-2 h-9 px-3 rounded-md
              bg-white border border-slate-300
              focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/30">
    <!-- leading icon -->
    <svg class="h-4 w-4 text-slate-500">…</svg>
    <input type="email" placeholder="you@team.io" required
      class="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm text-slate-900" />
  </div>
  <span class="text-xs text-slate-500">We won't share your email.</span>
</label>

<!-- Error variant: swap border-slate-300 → border-rose-500 + ring-rose-500/30 -->
<!-- Disabled: bg-slate-50 + text-slate-400 -->`,
        css: `.field { display: flex; flex-direction: column; gap: 6px; }
.field__label { font-size: 13px; font-weight: 500; color: var(--fg-default); }
.field__control {
  display: flex; align-items: center; gap: 8px;
  height: 38px; padding: 0 12px;
  background: var(--bg-surface); color: var(--fg-default);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  transition: border-color var(--dur-fast), box-shadow var(--dur-fast);
}
.field__control:focus-within {
  border-color: var(--border-focus);
  box-shadow: var(--ring-focus);
}
.field__control--error { border-color: var(--border-danger); }
.field__control--error:focus-within { box-shadow: var(--ring-danger); }
.field__control--disabled { background: var(--bg-muted); cursor: not-allowed; }
.field__input {
  flex: 1; min-width: 0;
  background: transparent; border: 0; outline: 0;
  font-family: inherit; font-size: 14px; color: var(--fg-default);
}
.field__hint { font-size: 12px; color: var(--fg-muted); }
.field__hint--error { color: var(--fg-danger); }`,
      }}>
      <Group label="Sizes">
        <div style={{ display: "grid", gap: 12, width: 360 }}>
          <Input size="sm" label="Small (32px)" placeholder="Type here" leading="search" />
          <Input size="md" label="Medium (38px) — default" placeholder="Type here" leading="search" />
          <Input size="lg" label="Large (46px)" placeholder="Type here" leading="search" />
        </div>
      </Group>
      <Group label="States">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, width: "100%" }}>
          <Input label="Default" placeholder="Placeholder text" />
          <Input label="Filled" value="Acme, Inc." onChange={() => {}} />
          <Input label="Required" required placeholder="Required field" />
          <Input label="With hint" hint="We'll never share your email." placeholder="you@team.io" />
          <Input label="Error" error hint="Email already taken" value="admin@team.io" onChange={() => {}} />
          <Input label="Disabled" disabled value="cannot edit" />
          <Input label="Read-only" readOnly value="sk_live_ABCDE" trailing="copy" />
          <Input label="Password" type="password" leading="lock" trailing="eye" value="hunter2" onChange={() => {}} />
        </div>
      </Group>
      <Group label="Live (controlled)">
        <div style={{ width: 360 }}>
          <Input label="Email" leading="mail" value={v} onChange={setV} hint={`${v.length}/120 characters`} />
        </div>
      </Group>
    </Spec>
  );
}

/* ─── TEXTAREA ──────────────────────────────────────────────────────── */
function TextareaSpec() {
  return (
    <Spec name="Textarea" file="src/whitelabel/Primitives.jsx"
      summary="Multiline input. Same states as Input. Resizable vertically by default."
      source={`<Textarea label="Description" rows={4} placeholder="Tell us more…" />
<Textarea label="Bio" error hint="Must be under 200 characters" />`}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, width: "100%" }}>
        <Textarea label="Default" placeholder="Tell us about your project…" />
        <Textarea label="Filled" defaultValue="A short description of the project that spans multiple lines so we can see the rendering." />
        <Textarea label="Error" error hint="Must be 10–200 characters" defaultValue="too short" />
        <Textarea label="Disabled" disabled defaultValue="cannot edit" />
      </div>
    </Spec>
  );
}

/* ─── SELECT ─────────────────────────────────────────────────────────── */
function SelectSpec() {
  const [v, setV] = useStateCat("staff");
  return (
    <Spec name="Select" file="src/whitelabel/Primitives.jsx"
      summary="Native select, styled. Accepts string options or `{value, label}` objects."
      source={`<Select label="Role" value={v} onChange={setV}
  options={[
    { value: "admin", label: "Administrator" },
    { value: "staff", label: "Staff member" },
    { value: "viewer", label: "Viewer" },
  ]} />`}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, width: "100%" }}>
        <Select label="Role" value={v} onChange={setV}
          options={[
            { value: "admin",  label: "Administrator" },
            { value: "staff",  label: "Staff member" },
            { value: "viewer", label: "Viewer" },
          ]} />
        <Select label="Timezone" defaultValue="UTC" placeholder="Pick one"
          options={["UTC", "America/Sao_Paulo", "Europe/Lisbon", "Asia/Tokyo"]} />
        <Select label="Error" error hint="Pick a value to continue"
          options={["—", "Option A", "Option B"]} />
        <Select label="Disabled" disabled options={["Locked"]} />
      </div>
    </Spec>
  );
}

/* ─── CHECKBOX / RADIO / SWITCH ──────────────────────────────────────── */
function ChoiceSpec() {
  const [terms, setTerms] = useStateCat(false);
  const [plan, setPlan]   = useStateCat("pro");
  const [notif, setNotif] = useStateCat(true);
  return (
    <Spec name="Checkbox / Radio / Switch" file="src/whitelabel/Primitives.jsx"
      summary="Selection controls. All consume brand tokens for active states."
      source={`<Checkbox label="Accept terms" checked={v} onChange={setV} />
<Checkbox label="Indeterminate" indeterminate />
<Radio name="plan" value="pro" checked={plan === "pro"} onChange={setPlan} label="Pro" />
<Switch label="Email notifications" checked={v} onChange={setV} />`}>
      <Group label="Checkbox states">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
          <Checkbox label="Unchecked" />
          <Checkbox label="Checked" defaultChecked />
          <Checkbox label="Indeterminate" indeterminate />
          <Checkbox label="Disabled" disabled />
          <Checkbox label="Disabled + checked" disabled defaultChecked />
        </div>
      </Group>
      <Group label="With hint">
        <Checkbox label="I accept the terms" hint="You'll be opted into our newsletter."
          checked={terms} onChange={setTerms} />
      </Group>
      <Group label="Radio group">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { value: "free", label: "Free", hint: "5 projects, community support" },
            { value: "pro",  label: "Pro",  hint: "Unlimited projects, email support" },
            { value: "team", label: "Team", hint: "Pro + SSO and audit logs" },
          ].map(o => (
            <Radio key={o.value} name="plan" value={o.value}
              label={o.label} hint={o.hint}
              checked={plan === o.value} onChange={setPlan} />
          ))}
        </div>
      </Group>
      <Group label="Switch sizes & states">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center" }}>
          <Switch size="sm" label="Small" defaultChecked />
          <Switch size="md" label="Medium" checked={notif} onChange={setNotif} />
          <Switch size="lg" label="Large" defaultChecked />
          <Switch label="Off" />
          <Switch label="Disabled" disabled />
          <Switch label="Disabled on" disabled defaultChecked />
        </div>
      </Group>
    </Spec>
  );
}

/* ─── BADGE ──────────────────────────────────────────────────────────── */
function BadgeSpec() {
  const variants = ["neutral", "brand", "success", "warning", "danger", "info", "solid"];
  return (
    <Spec name="Badge" file="src/whitelabel/Primitives.jsx"
      summary="Compact pill for counts, status, and labels. 7 variants × 3 sizes; optional dot or leading icon."
      source={{
        jsx: `<Badge variant="success">Active</Badge>
<Badge variant="warning" dot>Pending</Badge>
<Badge variant="brand" leading="sparkles">New</Badge>
<Badge variant="solid" size="lg">12</Badge>`,
        json: `{
  "component": "Badge",
  "props": {
    "variant": "neutral | brand | success | warning | danger | info | solid",
    "size":    "sm | md | lg",
    "dot":     "boolean",
    "leading": "lucide-icon-name"
  }
}`,
        tailwind: `<!-- Variants share base classes -->
<!-- success --><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
<!-- warning --><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50  text-amber-700  border border-amber-200"><span class="w-1.5 h-1.5 rounded-full bg-current"></span>Pending</span>
<!-- danger  --><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50   text-rose-700   border border-rose-200">Failed</span>
<!-- info    --><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-sky-50    text-sky-700    border border-sky-200">Beta</span>
<!-- solid   --><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-600 text-white">12</span>`,
        css: `.badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 8px; font-size: 12px; font-weight: 500; line-height: 1.2;
  border: 1px solid transparent; border-radius: var(--radius-pill);
  white-space: nowrap;
}
.badge__dot { width: 6px; height: 6px; border-radius: 9999px; background: currentColor; }

.badge--neutral { background: var(--bg-muted);          color: var(--fg-default); border-color: var(--border-subtle); }
.badge--brand   { background: var(--bg-brand-subtle);   color: var(--fg-brand); }
.badge--success { background: var(--bg-success-subtle); color: var(--fg-success); border-color: var(--border-success); }
.badge--warning { background: var(--bg-warning-subtle); color: var(--fg-warning); border-color: var(--border-warning); }
.badge--danger  { background: var(--bg-danger-subtle);  color: var(--fg-danger);  border-color: var(--border-danger); }
.badge--info    { background: var(--bg-info-subtle);    color: var(--fg-info);    border-color: var(--border-info); }
.badge--solid   { background: var(--bg-brand);          color: var(--fg-on-brand); }`,
      }}>
      <Group label="Variants">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {variants.map(v => <Badge key={v} variant={v}>{v}</Badge>)}
        </div>
      </Group>
      <Group label="Sizes">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <Badge size="sm" variant="brand">Small</Badge>
          <Badge size="md" variant="brand">Medium</Badge>
          <Badge size="lg" variant="brand">Large</Badge>
        </div>
      </Group>
      <Group label="With dot">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {variants.map(v => <Badge key={v} variant={v} dot>{v}</Badge>)}
        </div>
      </Group>
      <Group label="With icon">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <Badge variant="brand" leading="sparkles">New</Badge>
          <Badge variant="success" leading="check">Verified</Badge>
          <Badge variant="warning" leading="alert-triangle">Watch</Badge>
          <Badge variant="danger" leading="alert-octagon">Critical</Badge>
          <Badge variant="info" leading="info">Beta</Badge>
        </div>
      </Group>
    </Spec>
  );
}

/* ─── AVATAR ─────────────────────────────────────────────────────────── */
function AvatarSpec() {
  return (
    <Spec name="Avatar / AvatarGroup" file="src/whitelabel/Primitives.jsx"
      summary="Initials from name, photo via src, shape + size + status indicator. Group stacks overlapping avatars with a +N overflow chip."
      source={{
        jsx: `<Avatar name="Marina Costa" />
<Avatar name="Lucas Tavares" size={48} status="online" />
<Avatar name="Beatriz Reis" shape="square" color="var(--violet-500)" />
<AvatarGroup max={3}>
  <Avatar name="A B" />
  <Avatar name="C D" />
  <Avatar name="E F" />
  <Avatar name="G H" />
  <Avatar name="I J" />
</AvatarGroup>`,
        json: `{
  "component": "Avatar",
  "props": {
    "name":   "string (used to derive initials)",
    "src":    "string (image URL; overrides initials)",
    "size":   "number (px) | default: 32",
    "shape":  "circle | square",
    "status": "online | busy | away | offline",
    "color":  "CSS color (default: var(--bg-brand))"
  }
}`,
        tailwind: `<!-- Circle with initials -->
<span class="inline-flex h-10 w-10 items-center justify-center rounded-full
  bg-indigo-600 text-white text-sm font-semibold border-2 border-white">
  MC
</span>

<!-- With status dot -->
<span class="relative inline-flex">
  <span class="inline-flex h-10 w-10 items-center justify-center rounded-full
    bg-indigo-600 text-white text-sm font-semibold border-2 border-white">LT</span>
  <span class="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500
    border-2 border-white"></span>
</span>

<!-- Group (stack with -ml-2) -->
<div class="inline-flex">
  <span class="...avatar-circle">MC</span>
  <span class="...avatar-circle -ml-2">LT</span>
  <span class="...avatar-circle -ml-2 bg-slate-500">+3</span>
</div>`,
        css: `.avatar {
  display: inline-flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--bg-brand); color: var(--fg-on-brand);
  font-size: 13px; font-weight: 600;
  border: 2px solid var(--bg-surface); overflow: hidden;
}
.avatar--square { border-radius: var(--radius-md); }
.avatar__status {
  position: absolute; bottom: 0; right: 0;
  width: 30%; height: 30%; min-width: 8px; min-height: 8px;
  border-radius: 50%; border: 2px solid var(--bg-surface);
}
.avatar__status--online  { background: var(--bg-success); }
.avatar__status--busy    { background: var(--bg-danger); }
.avatar__status--away    { background: var(--bg-warning); }
.avatar__status--offline { background: var(--neutral-400); }`,
      }}>
      <Group label="Sizes">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {[20, 24, 28, 32, 40, 48, 56, 72].map(s => <Avatar key={s} name="Marina Costa" size={s} />)}
        </div>
      </Group>
      <Group label="Shapes">
        <div style={{ display: "flex", gap: 12 }}>
          <Avatar name="Marina Costa" size={48} />
          <Avatar name="Marina Costa" size={48} shape="square" />
        </div>
      </Group>
      <Group label="Status">
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Avatar name="Marina C" size={48} status="online" />
          <Avatar name="Sofia A"  size={48} status="busy" />
          <Avatar name="Daniel P" size={48} status="away" />
          <Avatar name="Carla M"  size={48} status="offline" />
        </div>
      </Group>
      <Group label="Colors">
        <div style={{ display: "flex", gap: 8 }}>
          <Avatar name="MC" color="var(--brand-600)" />
          <Avatar name="SA" color="var(--emerald-600)" />
          <Avatar name="DP" color="var(--violet-600)" />
          <Avatar name="LR" color="var(--amber-600)" />
          <Avatar name="BR" color="var(--rose-600)" />
          <Avatar name="GH" color="var(--neutral-500)" />
        </div>
      </Group>
      <Group label="Group">
        <AvatarGroup max={4}>
          <Avatar name="Marina Costa" />
          <Avatar name="Lucas Tavares" color="var(--emerald-600)" />
          <Avatar name="Sofia Almeida" color="var(--violet-600)" />
          <Avatar name="Beatriz Reis" color="var(--amber-600)" />
          <Avatar name="Henrique Lima" color="var(--rose-600)" />
          <Avatar name="Daniel Pereira" />
        </AvatarGroup>
      </Group>
    </Spec>
  );
}

/* ─── CARD ───────────────────────────────────────────────────────────── */
function CardSpec() {
  return (
    <Spec name="Card" file="src/whitelabel/Primitives.jsx"
      summary="Surface with token-driven background, border and shadow. Set `interactive` for hover lift."
      source={{
        jsx: `<Card>Default card</Card>
<Card interactive>Hover for elevation</Card>
<Card padding={0}>
  <header>Header</header>
  <body>Edge-to-edge content</body>
</Card>`,
        json: `{
  "component": "Card",
  "props": {
    "padding":     "number (px) | default: 20",
    "interactive": "boolean — hover lifts the card",
    "style":       "CSSProperties"
  }
}`,
        tailwind: `<!-- Default -->
<div class="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
  Default card
</div>

<!-- Interactive (hover) -->
<div class="bg-white border border-slate-200 rounded-lg p-5 shadow-sm
            hover:shadow-md hover:-translate-y-px
            transition-all cursor-pointer">
  Hover for elevation
</div>

<!-- Sectioned (padding 0) -->
<div class="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
  <header class="p-3.5 border-b border-slate-200 font-semibold">Header</header>
  <div class="p-3.5 text-slate-500 text-sm">Body</div>
</div>`,
        css: `.card {
  background: var(--bg-raised);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-xs);
  transition: box-shadow var(--dur-fast), transform var(--dur-fast);
}
.card--interactive { cursor: pointer; }
.card--interactive:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}
.card--flush { padding: 0; }`,
      }}>
      <Group label="Variants">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, width: "100%" }}>
          <Card><div style={{ fontWeight: 600 }}>Default</div><div style={{ color: "var(--fg-muted)", fontSize: 13, marginTop: 4 }}>Subtle border, xs shadow</div></Card>
          <Card interactive><div style={{ fontWeight: 600 }}>Interactive</div><div style={{ color: "var(--fg-muted)", fontSize: 13, marginTop: 4 }}>Hover to lift</div></Card>
          <Card padding={0}>
            <div style={{ padding: 14, borderBottom: "1px solid var(--border-subtle)", fontWeight: 600 }}>Sectioned</div>
            <div style={{ padding: 14, color: "var(--fg-muted)", fontSize: 13 }}>padding={`{0}`} for edge-to-edge content.</div>
          </Card>
        </div>
      </Group>
    </Spec>
  );
}

/* ─── SPINNER ────────────────────────────────────────────────────────── */
function SpinnerSpec() {
  return (
    <Spec name="Spinner" file="src/whitelabel/Primitives.jsx"
      summary="Loading indicator. Inherits currentColor so it picks up the surrounding text color."
      source={`<Spinner size={20} />
<Spinner size={32} color="var(--bg-brand)" />`}>
      <Group label="Sizes">
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Spinner size={12} />
          <Spinner size={16} />
          <Spinner size={20} />
          <Spinner size={28} />
          <Spinner size={40} />
        </div>
      </Group>
      <Group label="Colors">
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Spinner size={24} color="var(--bg-brand)" />
          <Spinner size={24} color="var(--bg-success)" />
          <Spinner size={24} color="var(--bg-warning)" />
          <Spinner size={24} color="var(--bg-danger)" />
          <Spinner size={24} color="var(--fg-muted)" />
        </div>
      </Group>
    </Spec>
  );
}

/* ─── ALERT ──────────────────────────────────────────────────────────── */
function AlertSpec() {
  return (
    <Spec name="Alert" file="src/whitelabel/Primitives.jsx"
      summary="Inline messaging banner. Four variants with matching icon, dismissible, optional title."
      source={{
        jsx: `<Alert variant="info" title="Heads up">A new version is available.</Alert>
<Alert variant="success">Your changes have been saved.</Alert>
<Alert variant="warning" title="Quota at 80%" onDismiss={…}>You're approaching your limit.</Alert>
<Alert variant="danger" title="Payment failed" onDismiss={…}>Update your card to continue.</Alert>`,
        json: `{
  "component": "Alert",
  "props": {
    "variant": "info | success | warning | danger",
    "title":   "string",
    "children":"ReactNode (description)",
    "leadingIcon": "lucide-icon-name (overrides variant default)",
    "onDismiss":   "() => void (shows X button if set)"
  }
}`,
        tailwind: `<!-- Info -->
<div role="alert" class="flex gap-3 p-3.5 rounded-md
  bg-sky-50 border border-sky-200 text-slate-900">
  <svg class="h-4 w-4 mt-0.5 text-sky-700 shrink-0">…</svg>
  <div class="flex-1">
    <div class="text-sm font-semibold">Heads up</div>
    <div class="text-sm text-slate-500 mt-0.5">A new version is available.</div>
  </div>
  <button class="text-slate-500 hover:text-slate-900" aria-label="Dismiss">✕</button>
</div>

<!-- Recolor for variants: -->
<!-- success: bg-emerald-50  border-emerald-200  icon: text-emerald-700 -->
<!-- warning: bg-amber-50    border-amber-200    icon: text-amber-700 -->
<!-- danger:  bg-rose-50     border-rose-200     icon: text-rose-700 -->`,
        css: `.alert {
  display: flex; gap: 12px; padding: 14px;
  border: 1px solid transparent; border-radius: var(--radius-md);
  color: var(--fg-default);
}
.alert__icon { flex-shrink: 0; margin-top: 1px; }
.alert__title { font-size: 14px; font-weight: 600; line-height: 1.3; }
.alert__desc  { font-size: 13px; color: var(--fg-muted); margin-top: 2px; line-height: 1.5; }

.alert--info    { background: var(--bg-info-subtle);    border-color: var(--border-info);    }
.alert--info    .alert__icon { color: var(--fg-info); }
.alert--success { background: var(--bg-success-subtle); border-color: var(--border-success); }
.alert--success .alert__icon { color: var(--fg-success); }
.alert--warning { background: var(--bg-warning-subtle); border-color: var(--border-warning); }
.alert--warning .alert__icon { color: var(--fg-warning); }
.alert--danger  { background: var(--bg-danger-subtle);  border-color: var(--border-danger);  }
.alert--danger  .alert__icon { color: var(--fg-danger); }`,
      }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Alert variant="info"    title="Heads up">A new version of the SDK is available. <a href="#">View release notes</a>.</Alert>
        <Alert variant="success" title="Saved">All changes were synced to the cloud just now.</Alert>
        <Alert variant="warning" title="Quota at 80%" onDismiss={() => {}}>You're approaching your monthly limit. Consider upgrading.</Alert>
        <Alert variant="danger"  title="Payment failed" onDismiss={() => {}}>We couldn't charge your card ending in 4242. Update your billing details.</Alert>
        <Alert variant="info">Plain alert — no title.</Alert>
      </div>
    </Spec>
  );
}

/* ─── TOOLTIP ────────────────────────────────────────────────────────── */
function TooltipSpec() {
  return (
    <Spec name="Tooltip" file="src/whitelabel/Primitives.jsx"
      summary="Hover/focus tooltip. Inverse surface for high contrast."
      source={`<Tooltip content="Saves and closes">
  <Button leading="check">Save</Button>
</Tooltip>`}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, padding: "20px 0" }}>
        <Tooltip content="Saves and closes"><Button variant="primary" leading="check">Save</Button></Tooltip>
        <Tooltip content="Discards changes"><Button variant="outline">Cancel</Button></Tooltip>
        <Tooltip content="Tooltips support up to 60 chars of plain text"><Button variant="ghost" iconOnly leading="info" ariaLabel="Info" /></Tooltip>
        <Tooltip content="Below" side="bottom"><Button variant="outline">Below tip</Button></Tooltip>
      </div>
    </Spec>
  );
}

/* ─── PROGRESS ───────────────────────────────────────────────────────── */
function ProgressSpec() {
  const [v, setV] = useStateCat(42);
  return (
    <Spec name="Progress" file="src/whitelabel/Primitives.jsx"
      summary="Determinate progress bar. 3 sizes × 4 variants."
      source={`<Progress value={42} max={100} label="Uploading" />
<Progress value={80} variant="warning" size="lg" />`}>
      <Group label="Sizes">
        <div style={{ display: "grid", gap: 12, width: 360 }}>
          <Progress value={v} size="sm" label="Small" />
          <Progress value={v} size="md" label="Medium" />
          <Progress value={v} size="lg" label="Large" />
        </div>
      </Group>
      <Group label="Variants">
        <div style={{ display: "grid", gap: 12, width: 360 }}>
          <Progress value={v} variant="brand"   label="Brand" />
          <Progress value={v} variant="success" label="Success" />
          <Progress value={v} variant="warning" label="Warning" />
          <Progress value={v} variant="danger"  label="Danger" />
        </div>
      </Group>
      <Group label="Interactive">
        <div style={{ width: 360, display: "flex", gap: 8, alignItems: "center" }}>
          <Button variant="outline" size="sm" leading="minus" onClick={() => setV(x => Math.max(0, x - 10))} />
          <input type="range" min="0" max="100" value={v} onChange={e => setV(+e.target.value)} style={{ flex: 1 }} />
          <Button variant="outline" size="sm" leading="plus" onClick={() => setV(x => Math.min(100, x + 10))} />
        </div>
      </Group>
    </Spec>
  );
}

/* ─── TABS ───────────────────────────────────────────────────────────── */
function TabsSpec() {
  const [v1, setV1] = useStateCat("overview");
  const [v2, setV2] = useStateCat("today");
  return (
    <Spec name="Tabs" file="src/whitelabel/Primitives.jsx"
      summary="Two visual variants. `underline` for top-level page tabs, `pill` for inline scoping."
      source={`<Tabs value={v} onChange={setV} items={[
  { value: "overview", label: "Overview", icon: "layout-dashboard" },
  { value: "members",  label: "Members",  count: 12 },
  { value: "settings", label: "Settings" },
]} />`}>
      <Group label="Underline (default)">
        <Tabs value={v1} onChange={setV1} items={[
          { value: "overview", label: "Overview", icon: "layout-dashboard" },
          { value: "members",  label: "Members", count: 12 },
          { value: "billing",  label: "Billing" },
          { value: "settings", label: "Settings", icon: "settings" },
        ]} />
      </Group>
      <Group label="Pill (segmented)">
        <Tabs variant="pill" value={v2} onChange={setV2} items={[
          { value: "today",     label: "Today" },
          { value: "week",      label: "This week" },
          { value: "month",     label: "This month" },
          { value: "quarter",   label: "This quarter" },
        ]} />
      </Group>
    </Spec>
  );
}

/* ─── BREADCRUMBS + KBD ─────────────────────────────────────────────── */
function MiscSpec() {
  return (
    <>
      <Spec name="Breadcrumbs" file="src/whitelabel/Primitives.jsx"
        summary="Page location trail. The last item is rendered as the current page (no link)."
        source={`<Breadcrumbs items={[
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Q3 Launch Plan" },
]} />`}>
        <Breadcrumbs items={[
          { label: "Home", href: "#" },
          { label: "Projects", href: "#" },
          { label: "Q3 Launch Plan" },
        ]} />
      </Spec>

      <Spec name="Kbd" file="src/whitelabel/Primitives.jsx"
        summary="Keyboard key. Use inside a sentence or inside a search input as a hint."
        source={`Press <Kbd>⌘</Kbd> + <Kbd>K</Kbd> to search.`}>
        <div style={{ fontSize: 14, color: "var(--fg-muted)" }}>
          Press <Kbd>⌘</Kbd> + <Kbd>K</Kbd> to open the command palette. <Kbd>?</Kbd> shows shortcuts. <Kbd>Esc</Kbd> closes any dialog.
        </div>
      </Spec>
    </>
  );
}

/* ─── ICON ───────────────────────────────────────────────────────────── */
function IconSpec() {
  const ICONS = [
    "home", "search", "settings", "user", "users", "bell", "mail", "calendar",
    "folder", "file", "image", "download", "upload", "trash-2", "edit", "copy",
    "check", "x", "plus", "minus", "chevron-right", "chevron-down", "arrow-right",
    "arrow-up-right", "external-link", "more-horizontal", "filter", "sliders",
    "heart", "star", "bookmark", "share-2", "link", "lock", "shield",
    "alert-triangle", "alert-octagon", "info", "check-circle", "help-circle",
    "play", "pause", "skip-forward", "volume-2", "wifi", "battery", "moon", "sun",
    "credit-card", "package", "shopping-cart", "tag", "trending-up", "bar-chart-3",
    "layout-dashboard", "kanban", "list", "grid-3x3", "code", "terminal", "git-branch",
  ];
  return (
    <Spec name="Icon" file="src/whitelabel/Primitives.jsx"
      summary="Renders any Lucide icon. Inherits currentColor; pass color or wrap in a colored container."
      source={`<Icon name="bell" size={16} />
<Icon name="check" size={20} color="var(--bg-success)" />
<Icon name="alert-triangle" size={24} color="var(--bg-warning)" strokeWidth={2.5} />`}>
      <Group label="Sizes">
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {[12, 14, 16, 20, 24, 32, 40, 56].map(s => (
            <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <Icon name="bell" size={s} />
              <span className="cap">{s}px</span>
            </div>
          ))}
        </div>
      </Group>
      <Group label="Semantic colors">
        <div style={{ display: "flex", gap: 18 }}>
          {[
            ["check-circle",  "var(--bg-success)", "success"],
            ["alert-triangle","var(--bg-warning)", "warning"],
            ["alert-octagon", "var(--bg-danger)",  "danger"],
            ["info",          "var(--bg-info)",    "info"],
            ["star",          "var(--bg-brand)",   "brand"],
            ["circle",        "var(--fg-muted)",   "muted"],
          ].map(([n, c, lbl]) => (
            <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <Icon name={n} size={24} color={c} />
              <span className="cap">{lbl}</span>
            </div>
          ))}
        </div>
      </Group>
      <Group label="Icon set (sample)">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 12, width: "100%" }}>
          {ICONS.map(n => (
            <div key={n} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              padding: 10, border: "1px solid var(--border-subtle)", borderRadius: 6,
              color: "var(--fg-default)",
            }}>
              <Icon name={n} size={18} />
              <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--fg-muted)", textAlign: "center" }}>{n}</span>
            </div>
          ))}
        </div>
      </Group>
    </Spec>
  );
}

/* ─── ROOT ─────────────────────────────────────────────────────────── */
function Catalog() {
  return (
    <>
      <section className="dsx-sect" id="comp-button"><ButtonSpec /></section>
      <section className="dsx-sect" id="comp-input"><InputSpec /></section>
      <section className="dsx-sect" id="comp-textarea"><TextareaSpec /></section>
      <section className="dsx-sect" id="comp-select"><SelectSpec /></section>
      <section className="dsx-sect" id="comp-choice"><ChoiceSpec /></section>
      <section className="dsx-sect" id="comp-badge"><BadgeSpec /></section>
      <section className="dsx-sect" id="comp-avatar"><AvatarSpec /></section>
      <section className="dsx-sect" id="comp-card"><CardSpec /></section>
      <section className="dsx-sect" id="comp-spinner"><SpinnerSpec /></section>
      <section className="dsx-sect" id="comp-alert"><AlertSpec /></section>
      <section className="dsx-sect" id="comp-tooltip"><TooltipSpec /></section>
      <section className="dsx-sect" id="comp-progress"><ProgressSpec /></section>
      <section className="dsx-sect" id="comp-tabs"><TabsSpec /></section>
      <section className="dsx-sect" id="comp-misc"><MiscSpec /></section>
      <section className="dsx-sect" id="comp-icon"><IconSpec /></section>
    </>
  );
}

Object.assign(window, { Catalog });
