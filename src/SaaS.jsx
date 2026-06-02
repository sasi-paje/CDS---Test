// Custom DS — SaaS activation & billing patterns:
// OnboardingChecklist, PlanCard, EmptyLocked, ApiKeyDisplay.
// Inline styles, semantic tokens only. Exported to window.

const { useState: useSaasS, useRef: useSaasR } = React;

/* ─────────────────────────────────────────────────────────────────────────
   ONBOARDING CHECKLIST — collapsible activation task list.
   <OnboardingChecklist steps={[{id,label,description,completed,cta:{label,onClick}}]}
                        title dismissible onDismiss collapsed onToggle />
   ───────────────────────────────────────────────────────────────────────── */
function OnboardingChecklist({ steps = [], title = "Get started", dismissible, onDismiss, collapsed, onToggle }) {
  const [internalCollapsed, setInternalCollapsed] = useSaasS(false);
  const isControlled = collapsed !== undefined;
  const open = !(isControlled ? collapsed : internalCollapsed);
  const toggle = () => { if (onToggle) onToggle(); if (!isControlled) setInternalCollapsed((c) => !c); };

  const done = steps.filter((s) => s.completed).length;
  const allDone = done === steps.length && steps.length > 0;
  const firstIncomplete = steps.findIndex((s) => !s.completed);

  return (
    <Card padding={0} style={{ overflow: "hidden" }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-5) var(--space-6)" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <h3 style={{ margin: 0, fontSize: "var(--text-lg)", fontWeight: 680, letterSpacing: "var(--tracking-snug)", color: "var(--fg-strong)" }}>{title}</h3>
            {allDone && <Badge variant="success" leading="check" size="sm">All done</Badge>}
          </div>
          <span style={{ fontSize: "var(--text-sm)", color: "var(--fg-muted)" }}>{done} of {steps.length} complete</span>
        </div>
        <button type="button" onClick={toggle} aria-label={open ? "Collapse" : "Expand"} aria-expanded={open}
          style={{ appearance: "none", border: 0, background: "transparent", cursor: "pointer", color: "var(--fg-muted)", padding: 4, display: "inline-flex" }}>
          <Icon name={open ? "chevron-up" : "chevron-down"} size={18} />
        </button>
        {dismissible && (
          <button type="button" onClick={onDismiss} aria-label="Dismiss checklist"
            style={{ appearance: "none", border: 0, background: "transparent", cursor: "pointer", color: "var(--fg-subtle)", padding: 4, display: "inline-flex" }}>
            <Icon name="x" size={16} />
          </button>
        )}
      </div>

      <div style={{ padding: "0 var(--space-6)" }}>
        <Progress value={done} max={steps.length || 1} variant={allDone ? "success" : "brand"} size="sm" />
      </div>

      {open && (
        <ul style={{ listStyle: "none", margin: 0, padding: "var(--space-5) var(--space-4) var(--space-4)", display: "flex", flexDirection: "column", gap: 2 }}>
          {steps.map((s, i) => (
            <OnboardingStep key={s.id ?? i} step={s} expanded={i === firstIncomplete} />
          ))}
        </ul>
      )}
    </Card>
  );
}

function OnboardingStep({ step, expanded }) {
  const done = step.completed;
  return (
    <li
      style={{
        display: "flex", gap: "var(--space-4)", alignItems: "flex-start",
        padding: "var(--space-4)", borderRadius: "var(--radius-md)",
        background: done ? "var(--bg-success-subtle)" : expanded ? "var(--bg-subtle)" : "transparent",
        transition: "background var(--dur-fast) var(--ease-default)",
      }}
    >
      <span style={{
        flexShrink: 0, width: 22, height: 22, borderRadius: "50%", marginTop: 1,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        background: done ? "var(--bg-success)" : "transparent",
        border: done ? "none" : "2px solid var(--border-default)",
        color: "var(--fg-on-brand)",
      }}>
        {done && <Icon name="check" size={13} strokeWidth={3} />}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: "var(--text-sm)", fontWeight: 600, lineHeight: 1.35,
          color: done ? "var(--fg-muted)" : "var(--fg-strong)",
          textDecoration: done ? "line-through" : "none",
        }}>
          {step.label}
        </div>
        {!done && expanded && step.description && (
          <p style={{ margin: "4px 0 0", fontSize: "var(--text-sm)", lineHeight: 1.5, color: "var(--fg-muted)" }}>{step.description}</p>
        )}
        {!done && expanded && step.cta && (
          <div style={{ marginTop: "var(--space-4)" }}>
            <Button size="sm" onClick={step.cta.onClick} trailing="arrow-right">{step.cta.label}</Button>
          </div>
        )}
      </div>
    </li>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   PLAN CARD — a pricing / subscription tier.
   <PlanCard name description price={{amount,period,currency}} features={[{label,included,note}]}
             cta={{label,onClick,variant}} badge highlighted current />
   ───────────────────────────────────────────────────────────────────────── */
function PlanCard({ name, description, price, features = [], cta, badge, highlighted, current }) {
  const custom = price === "custom";
  const currency = (price && price.currency) || "$";
  const amount = custom ? "Custom" : (price ? price.amount : "");
  const period = price && price.period;

  return (
    <Card
      padding="var(--space-7)"
      style={{
        position: "relative", display: "flex", flexDirection: "column",
        height: "100%", minWidth: 0,
        border: highlighted ? "2px solid var(--border-focus)" : "1px solid var(--border-subtle)",
        boxShadow: highlighted ? "var(--shadow-md)" : "var(--card-shadow)",
      }}
    >
      {badge && (
        <span style={{
          position: "absolute", top: 0, right: "var(--space-6)", transform: "translateY(-50%)",
          background: "var(--bg-brand)", color: "var(--fg-on-brand)",
          fontSize: 11, fontWeight: 650, letterSpacing: "var(--tracking-wide)", textTransform: "uppercase",
          padding: "4px 10px", borderRadius: "var(--radius-pill)", boxShadow: "var(--shadow-sm)",
        }}>{badge}</span>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <h3 style={{ margin: 0, fontSize: "var(--text-lg)", fontWeight: 680, color: "var(--fg-strong)" }}>{name}</h3>
        {description && <p style={{ margin: 0, fontSize: "var(--text-sm)", lineHeight: 1.5, color: "var(--fg-muted)" }}>{description}</p>}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 3, margin: "var(--space-5) 0 var(--space-6)" }}>
        {!custom && typeof amount === "number" && <span style={{ fontSize: "var(--text-xl)", fontWeight: 600, color: "var(--fg-strong)", alignSelf: "flex-start", marginTop: 4 }}>{currency}</span>}
        <span style={{ fontSize: "var(--text-5xl)", fontWeight: 760, letterSpacing: "var(--tracking-tight)", color: "var(--fg-strong)", lineHeight: 1 }}>
          {typeof amount === "number" ? amount.toLocaleString() : amount}
        </span>
        {period && <span style={{ fontSize: "var(--text-sm)", color: "var(--fg-muted)" }}>/{period}</span>}
      </div>

      <div style={{ marginBottom: "var(--space-6)" }}>
        {current ? (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--space-2)",
            height: "var(--ctl-h-lg)", borderRadius: "var(--radius-md)",
            background: "var(--bg-muted)", color: "var(--fg-muted)", fontSize: "var(--text-sm)", fontWeight: 600,
          }}>
            <Icon name="check" size={16} /> Current plan
          </div>
        ) : cta && (
          <Button variant={cta.variant || (highlighted ? "primary" : "outline")} size="lg" fullWidth onClick={cta.onClick}>
            {cta.label}
          </Button>
        )}
      </div>

      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        {features.map((f, i) => (
          <li key={i} style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start", fontSize: "var(--text-sm)", lineHeight: 1.45 }}>
            <Icon
              name={f.included ? "check" : "minus"}
              size={16}
              style={{ marginTop: 1, flexShrink: 0, color: f.included ? "var(--fg-success)" : "var(--fg-disabled)" }}
            />
            <span style={{ color: f.included ? "var(--fg-default)" : "var(--fg-disabled)", minWidth: 0 }}>
              {f.label}
              {f.note && <span style={{ color: "var(--fg-subtle)" }}> — {f.note}</span>}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   EMPTY LOCKED — empty state for paywalled / permission-gated features.
   <EmptyLocked title description illustration="lock" cta={{label,onClick,variant}} secondaryCta />
   ───────────────────────────────────────────────────────────────────────── */
function EmptyLocked({ title, description, illustration = "lock", cta, secondaryCta }) {
  const map = {
    lock: { icon: "lock", color: "neutral" },
    upgrade: { icon: "sparkles", color: "brand" },
    team: { icon: "users", color: "info" },
    feature: { icon: "wand-sparkles", color: "brand" },
  };
  const art = map[illustration] || map.lock;
  const fg = { neutral: "var(--fg-muted)", brand: "var(--fg-brand)", info: "var(--fg-info)" }[art.color];
  const bg = { neutral: "var(--bg-muted)", brand: "var(--bg-brand-subtle)", info: "var(--bg-info-subtle)" }[art.color];

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
      padding: "var(--space-10) var(--space-7)", gap: "var(--space-4)",
      background: "var(--bg-subtle)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-xl)",
    }}>
      <span style={{ position: "relative", width: 64, height: 64, marginBottom: "var(--space-2)" }}>
        <span style={{ position: "absolute", inset: 0, borderRadius: "var(--radius-2xl)", background: bg, opacity: 0.6 }} />
        <span style={{ position: "absolute", inset: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", color: fg }}>
          <Icon name={art.icon} size={28} />
        </span>
      </span>
      <h3 style={{ margin: 0, fontSize: "var(--text-xl)", fontWeight: 700, letterSpacing: "var(--tracking-snug)", color: "var(--fg-strong)" }}>{title}</h3>
      {description && <p style={{ margin: 0, fontSize: "var(--text-sm)", lineHeight: 1.55, color: "var(--fg-muted)", maxWidth: 380 }}>{description}</p>}
      {(cta || secondaryCta) && (
        <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-3)", flexWrap: "wrap", justifyContent: "center" }}>
          {cta && <Button variant={cta.variant || "primary"} leading={illustration === "lock" ? "lock-open" : illustration === "team" ? "user-plus" : "sparkles"} onClick={cta.onClick}>{cta.label}</Button>}
          {secondaryCta && <Button variant="ghost" onClick={secondaryCta.onClick}>{secondaryCta.label}</Button>}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   API KEY DISPLAY — read-only secret with reveal + copy.
   <ApiKeyDisplay value label masked copyable onReveal actions />
   ───────────────────────────────────────────────────────────────────────── */
function ApiKeyDisplay({ value = "", label, masked = true, copyable = true, onReveal, actions }) {
  const [revealed, setRevealed] = useSaasS(!masked);
  const [copied, setCopied] = useSaasS(false);

  const maskDisplay = () => {
    if (revealed) return value;
    const tail = value.slice(-4);
    return value.slice(0, 3) + "•".repeat(Math.max(8, Math.min(20, value.length - 7))) + tail;
  };

  const toggle = () => { const next = !revealed; setRevealed(next); if (next && onReveal) onReveal(); };
  const copy = () => {
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(true);
      if (window.toast) window.toast.success("Copied to clipboard", { description: label ? `${label} copied.` : undefined });
      setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      {label && <span style={{ fontSize: 13, fontWeight: 500, color: "var(--fg-default)", lineHeight: 1.3 }}>{label}</span>}
      <div style={{
        display: "flex", alignItems: "center", gap: "var(--space-3)",
        height: "var(--ctl-h-lg)", padding: "0 var(--space-2) 0 var(--space-4)",
        background: "var(--bg-muted)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)",
      }}>
        <code style={{
          flex: 1, minWidth: 0, fontFamily: "var(--font-mono)", fontSize: 13,
          color: "var(--fg-default)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          letterSpacing: revealed ? 0 : "0.04em",
        }}>
          {maskDisplay()}
        </code>
        <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
          {masked && (
            <Tooltip content={revealed ? "Hide" : "Reveal"}>
              <IconButton icon={revealed ? "eye-off" : "eye"} ariaLabel={revealed ? "Hide key" : "Reveal key"} variant="ghost" size="sm" onClick={toggle} />
            </Tooltip>
          )}
          {copyable && (
            <Tooltip content={copied ? "Copied" : "Copy"}>
              <IconButton icon={copied ? "check" : "copy"} ariaLabel="Copy key" variant="ghost" size="sm" onClick={copy} />
            </Tooltip>
          )}
          {actions}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { OnboardingChecklist, PlanCard, EmptyLocked, ApiKeyDisplay });
