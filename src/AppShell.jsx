// Custom DS — App-shell & navigation patterns: Navbar, Stepper, SettingsLayout.
// Same architecture as the core library: inline styles, semantic tokens only,
// every component exported to window. Light/dark/brand/style switch automatically.

const { useState: useShS, useEffect: useShE, useRef: useShR } = React;

/* ─────────────────────────────────────────────────────────────────────────
   NAVBAR — horizontal top bar (top-nav apps, or paired with a Sidebar).
   <Navbar logo={…} items={[{id,label,href,active}]} actions={…} border />
   ───────────────────────────────────────────────────────────────────────── */
function Navbar({ logo, items = [], actions, border = true, sticky = false, onSelect }) {
  return (
    <header
      style={{
        display: "flex", alignItems: "center", gap: "var(--space-6)",
        height: "calc(var(--ctl-h-lg) + var(--space-4))",
        padding: "0 var(--space-6)",
        background: "var(--bg-surface)",
        borderBottom: border ? "1px solid var(--border-default)" : "none",
        ...(sticky ? { position: "sticky", top: 0, zIndex: "var(--z-sticky, 30)" } : {}),
      }}
    >
      {logo && <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>{logo}</div>}

      {items.length > 0 && (
        <nav aria-label="Primary" style={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
          {items.map((it) => (
            <NavbarItem key={it.id} item={it} onSelect={onSelect} />
          ))}
        </nav>
      )}

      {actions && (
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
          {actions}
        </div>
      )}
    </header>
  );
}

function NavbarItem({ item, onSelect }) {
  const [hover, setHover] = useShS(false);
  const active = item.active;
  return (
    <a
      href={item.href || "#"}
      aria-current={active ? "page" : undefined}
      onClick={(e) => { if (onSelect) { e.preventDefault(); onSelect(item.id); } }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: "var(--ctl-gap-md)",
        height: "var(--ctl-h-md)", padding: "0 var(--ctl-px-sm)",
        fontSize: "var(--ctl-fs-md)", fontWeight: active ? 600 : 500,
        color: active ? "var(--fg-brand)" : "var(--fg-muted)",
        background: !active && hover ? "var(--bg-muted)" : "transparent",
        borderRadius: "var(--radius-md)", textDecoration: "none",
        transition: "background var(--dur-fast) var(--ease-default), color var(--dur-fast) var(--ease-default)",
        whiteSpace: "nowrap",
      }}
    >
      {item.icon && <Icon name={item.icon} size="var(--ctl-ic-md)" />}
      {item.label}
      {item.badge != null && <Badge variant={active ? "brand" : "neutral"} size="sm">{item.badge}</Badge>}
    </a>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   STEPPER — multi-step progress for wizards / onboarding.
   <Stepper steps={[{id,label,description}]} currentStep={1} orientation="horizontal" variant="default" />
   ───────────────────────────────────────────────────────────────────────── */
function Stepper({ steps = [], currentStep = 0, orientation = "horizontal", variant = "default", onStepClick }) {
  const vertical = orientation === "vertical";
  const minimal = variant === "minimal";
  const stateOf = (i) => (i < currentStep ? "completed" : i === currentStep ? "current" : "upcoming");

  const labelBlock = (step, state, align) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, textAlign: align, minWidth: 0 }}>
      <span style={{
        fontSize: "var(--text-sm)", lineHeight: 1.3,
        fontWeight: state === "current" ? 650 : 550,
        color: state === "upcoming" ? "var(--fg-subtle)" : "var(--fg-strong)",
      }}>{step.label}</span>
      {!minimal && step.description && (
        <span style={{ fontSize: "var(--text-xs)", lineHeight: 1.4, color: "var(--fg-muted)" }}>{step.description}</span>
      )}
    </div>
  );

  if (vertical) {
    return (
      <ol aria-label="Progress" style={{ display: "flex", flexDirection: "column", listStyle: "none", margin: 0, padding: 0 }}>
        {steps.map((step, i) => {
          const state = stateOf(i);
          const isLast = i === steps.length - 1;
          const clickable = onStepClick && i <= currentStep;
          return (
            <li key={step.id ?? i} aria-current={state === "current" ? "step" : undefined}
              style={{ display: "flex", gap: "var(--space-4)", alignItems: "stretch" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <StepMarker state={state} index={i} clickable={clickable} onClick={clickable ? () => onStepClick(i) : undefined} />
                {!isLast && <span aria-hidden="true" style={{ flex: 1, width: 2, minHeight: 22, background: state === "completed" ? "var(--bg-brand)" : "var(--border-default)", margin: "var(--space-1) 0", transition: "background var(--dur-base) var(--ease-default)" }} />}
              </div>
              <div style={{ paddingTop: 4, paddingBottom: isLast ? 0 : "var(--space-6)" }}>{labelBlock(step, state, "left")}</div>
            </li>
          );
        })}
      </ol>
    );
  }

  // horizontal — marker centered above label, connector drawn behind markers
  return (
    <ol aria-label="Progress" style={{ display: "flex", listStyle: "none", margin: 0, padding: 0, width: "100%" }}>
      {steps.map((step, i) => {
        const state = stateOf(i);
        const isLast = i === steps.length - 1;
        const clickable = onStepClick && i <= currentStep;
        return (
          <li key={step.id ?? i} aria-current={state === "current" ? "step" : undefined}
            style={{ flex: 1, minWidth: 0, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)" }}>
            {!isLast && (
              <span aria-hidden="true" style={{
                position: "absolute", top: 13, left: "calc(50% + 16px)", width: "calc(100% - 32px)", height: 2,
                background: state === "completed" ? "var(--bg-brand)" : "var(--border-default)",
                borderRadius: 9999, transition: "background var(--dur-base) var(--ease-default)",
              }} />
            )}
            <div style={{ position: "relative", zIndex: 1 }}>
              <StepMarker state={state} index={i} clickable={clickable} onClick={clickable ? () => onStepClick(i) : undefined} />
            </div>
            <div style={{ maxWidth: "94%", display: "flex", justifyContent: "center" }}>{labelBlock(step, state, "center")}</div>
          </li>
        );
      })}
    </ol>
  );
}

function StepMarker({ state, index, clickable, onClick }) {
  const completed = state === "completed";
  const current = state === "current";
  const Tag = clickable ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      type={clickable ? "button" : undefined}
      style={{
        appearance: "none", padding: 0, flexShrink: 0,
        width: 28, height: 28, borderRadius: "50%",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 650, fontFamily: "inherit",
        cursor: clickable ? "pointer" : "default",
        background: completed ? "var(--bg-brand)" : current ? "var(--bg-brand-subtle)" : "var(--bg-surface)",
        color: completed ? "var(--fg-on-brand)" : current ? "var(--fg-brand)" : "var(--fg-subtle)",
        border: `2px solid ${completed || current ? "var(--bg-brand)" : "var(--border-default)"}`,
        transition: "background var(--dur-base) var(--ease-default), border-color var(--dur-base) var(--ease-default), color var(--dur-base) var(--ease-default)",
      }}
    >
      {completed ? <Icon name="check" size={15} strokeWidth={3} /> : index + 1}
    </Tag>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   SETTINGS LAYOUT — left section nav + right content panel.
   Collapses to a horizontal Tabs strip under ~768px.
   <SettingsLayout sections={[{id,label,icon,description}]} activeSection onSectionChange title actions>{content}</SettingsLayout>
   ───────────────────────────────────────────────────────────────────────── */
function SettingsLayout({ sections = [], activeSection, onSectionChange, children, title, actions }) {
  const wrapRef = useShR(null);
  const [narrow, setNarrow] = useShS(false);

  useShE(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setNarrow(e.contentRect.width < 768);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const active = activeSection ?? sections[0]?.id;

  return (
    <div ref={wrapRef} style={{ background: "var(--bg-app)", width: "100%" }}>
      <div
        style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          gap: "var(--space-5)", flexWrap: "wrap",
          padding: narrow ? "var(--space-6) var(--space-6) 0" : "var(--space-8) var(--space-8) var(--space-6)",
          maxWidth: narrow ? "none" : 1100, margin: "0 auto", width: "100%",
        }}
      >
        {title && (
          <h1 style={{ margin: 0, fontSize: "var(--text-2xl)", fontWeight: 760, letterSpacing: "var(--tracking-tight)", color: "var(--fg-strong)" }}>
            {title}
          </h1>
        )}
        {actions && <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>{actions}</div>}
      </div>

      {narrow ? (
        <div style={{ padding: "var(--space-5) var(--space-6) var(--space-8)" }}>
          <div style={{ marginBottom: "var(--space-5)" }}>
            <Tabs
              value={active}
              onChange={onSectionChange}
              items={sections.map((s) => ({ value: s.id, label: s.label, icon: s.icon }))}
            />
          </div>
          <div style={{ maxWidth: 720 }}>{children}</div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "var(--space-8)", maxWidth: 1100, margin: "0 auto", padding: "var(--space-2) var(--space-8) var(--space-10)", alignItems: "flex-start" }}>
          <nav
            aria-label="Settings sections"
            style={{
              width: 240, flexShrink: 0, position: "sticky", top: "var(--space-6)",
              background: "var(--bg-subtle)", border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)", padding: "var(--space-3)",
              display: "flex", flexDirection: "column", gap: 2,
            }}
          >
            {sections.map((s) => (
              <SettingsNavItem key={s.id} section={s} active={s.id === active} onClick={() => onSectionChange && onSectionChange(s.id)} />
            ))}
          </nav>
          <div style={{ flex: 1, minWidth: 0, maxWidth: 720 }}>{children}</div>
        </div>
      )}
    </div>
  );
}

function SettingsNavItem({ section, active, onClick }) {
  const [hover, setHover] = useShS(false);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        appearance: "none", border: 0, cursor: "pointer", fontFamily: "inherit",
        textAlign: "left", width: "100%",
        display: "flex", alignItems: "flex-start", gap: "var(--space-3)",
        padding: "var(--space-3) var(--space-4)", borderRadius: "var(--radius-md)",
        background: active ? "var(--bg-brand-subtle)" : hover ? "var(--bg-muted)" : "transparent",
        color: active ? "var(--fg-brand)" : "var(--fg-default)",
        transition: "background var(--dur-fast) var(--ease-default), color var(--dur-fast) var(--ease-default)",
      }}
    >
      {section.icon && (
        <Icon name={section.icon} size={16} style={{ marginTop: 1, color: active ? "var(--fg-brand)" : "var(--fg-subtle)" }} />
      )}
      <span style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
        <span style={{ fontSize: "var(--text-sm)", fontWeight: active ? 600 : 500, lineHeight: 1.3 }}>{section.label}</span>
        {section.description && (
          <span style={{ fontSize: "var(--text-xs)", lineHeight: 1.4, color: "var(--fg-muted)" }}>{section.description}</span>
        )}
      </span>
    </button>
  );
}

Object.assign(window, { Navbar, Stepper, SettingsLayout });
