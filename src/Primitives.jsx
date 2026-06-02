// White-label primitives — every common product component.
// All consume semantic tokens, so light/dark/brand switches are automatic.

const { useState, useEffect, useRef } = React;

/* ─────────────────────────────────────────────────────────────────────────
   ICON — lucide wrapper, inherits currentColor
   ───────────────────────────────────────────────────────────────────────── */
function Icon({ name, size = 16, color = "currentColor", strokeWidth = 2, style, className }) {
  const pascal = String(name).replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase());
  const def = window.lucide?.icons?.[pascal] || window.lucide?.icons?.[name];
  // size may be a number (px) or a CSS-var string ("var(--ctl-ic-md)"); use style for CSS vars.
  const isCssVar = typeof size === "string";
  const svgSize = isCssVar ? 16 : size;             // sensible attribute fallback
  const sizeStyle = isCssVar ? { width: size, height: size } : null;
  if (!def) return <span aria-hidden style={{ width: svgSize, height: svgSize, display: "inline-block", ...sizeStyle, ...style }} />;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={svgSize} height={svgSize} viewBox="0 0 24 24"
      fill="none" stroke={color} strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round"
      className={className || `lc lc-${name}`}
      style={{ display: "inline-block", flexShrink: 0, ...sizeStyle, ...style }}>
      {def.map((n, i) => React.createElement(n[0], { key: i, ...n[1] }))}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   BUTTON — variant × size × state matrix
   variants: primary | secondary | outline | ghost | danger | link
   sizes:    xs | sm | md | lg
   ───────────────────────────────────────────────────────────────────────── */
function Button({
  variant = "primary", size = "md",
  leading, trailing, loading, disabled,
  iconOnly, fullWidth, type = "button",
  children, onClick, style, className, ariaLabel,
}) {
  const sizeMap = {
    xs: { h: "var(--ctl-h-xs)", px: "var(--ctl-px-xs)", fs: "var(--ctl-fs-xs)", ix: "var(--ctl-ic-xs)", gap: "var(--ctl-gap-xs)" },
    sm: { h: "var(--ctl-h-sm)", px: "var(--ctl-px-sm)", fs: "var(--ctl-fs-sm)", ix: "var(--ctl-ic-sm)", gap: "var(--ctl-gap-sm)" },
    md: { h: "var(--ctl-h-md)", px: "var(--ctl-px-md)", fs: "var(--ctl-fs-md)", ix: "var(--ctl-ic-md)", gap: "var(--ctl-gap-md)" },
    lg: { h: "var(--ctl-h-lg)", px: "var(--ctl-px-lg)", fs: "var(--ctl-fs-lg)", ix: "var(--ctl-ic-lg)", gap: "var(--ctl-gap-lg)" },
  };
  const s = sizeMap[size];
  const base = {
    appearance: "none", border: 0, cursor: disabled || loading ? "not-allowed" : "pointer",
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: s.gap,
    height: s.h, padding: iconOnly ? 0 : `0 ${s.px}`,
    width: iconOnly ? s.h : (fullWidth ? "100%" : undefined),
    fontFamily: "var(--font-sans)", fontWeight: "var(--ctl-fw)", fontSize: s.fs, lineHeight: 1,
    borderRadius: "var(--radius-md)",
    transition: "background-color var(--dur-default) var(--ease-default), color var(--dur-default) var(--ease-default), box-shadow var(--dur-default) var(--ease-default), border-color var(--dur-default) var(--ease-default)",
    opacity: disabled ? 0.5 : 1,
    whiteSpace: "nowrap", userSelect: "none",
  };
  const variants = {
    primary:   { bg: "var(--bg-brand)",       fg: "var(--fg-on-brand)", bd: "transparent",
                 hov: "var(--bg-brand-hover)", act: "var(--bg-brand-active)" },
    secondary: { bg: "var(--bg-muted)",       fg: "var(--fg-default)",  bd: "transparent",
                 hov: "var(--neutral-200)",    act: "var(--neutral-300)" },
    tertiary:  { bg: "transparent",           fg: "var(--fg-brand)",    bd: "transparent",
                 hov: "var(--bg-brand-subtle)",
                 act: "color-mix(in oklab, var(--brand-500) 22%, transparent)" },
    tonal:     { bg: "var(--bg-brand-subtle)", fg: "var(--fg-brand)",   bd: "transparent",
                 hov: "color-mix(in oklab, var(--brand-500) 16%, var(--bg-brand-subtle))",
                 act: "color-mix(in oklab, var(--brand-500) 28%, var(--bg-brand-subtle))" },
    outline:   { bg: "var(--bg-surface)",     fg: "var(--fg-default)",  bd: "var(--border-default)",
                 hov: "var(--bg-muted)",       act: "var(--neutral-200)" },
    ghost:     { bg: "transparent",           fg: "var(--fg-default)",  bd: "transparent",
                 hov: "var(--bg-muted)",       act: "var(--neutral-200)" },
    text:      { bg: "transparent",           fg: "var(--fg-default)",  bd: "transparent",
                 hov: "transparent",           act: "transparent",
                 hovFg: "var(--fg-brand)" },
    danger:    { bg: "var(--bg-danger)",      fg: "var(--fg-on-brand)", bd: "transparent",
                 hov: "color-mix(in oklab, var(--rose-700) 100%, transparent)",
                 act: "var(--rose-800)" },
    link:      { bg: "transparent",           fg: "var(--fg-link)",     bd: "transparent",
                 hov: "transparent",           act: "transparent",       underline: true },
  };
  const v = variants[variant];
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  const [focus, setFocus] = useState(false);
  const bg = press ? v.act : hover && !disabled ? v.hov : v.bg;
  const fg = hover && !disabled && v.hovFg ? v.hovFg : v.fg;
  return (
    <button
      type={type} onClick={disabled || loading ? undefined : onClick}
      aria-label={ariaLabel} aria-disabled={disabled || loading || undefined}
      aria-busy={loading || undefined}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)} onMouseUp={() => setPress(false)}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      className={className}
      style={{
        ...base, background: bg, color: fg,
        border: `var(--ctl-bw) solid ${v.bd}`,
        textDecoration: v.underline && hover ? "underline" : "none",
        boxShadow: focus
          ? "var(--ring-focus)"
          : (hover && !disabled ? "var(--button-shadow-hover)" : "var(--button-shadow)"),
        ...style,
      }}>
      {loading ? <Spinner size={s.ix} /> : leading && <Icon name={leading} size={s.ix} />}
      {!iconOnly && children}
      {trailing && !loading && <Icon name={trailing} size={s.ix} />}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   ICON BUTTON — convenience wrapper
   ───────────────────────────────────────────────────────────────────────── */
function IconButton({ icon, ariaLabel, ...rest }) {
  return <Button {...rest} iconOnly ariaLabel={ariaLabel} leading={icon} />;
}

/* ─────────────────────────────────────────────────────────────────────────
   INPUT — text input with leading/trailing slots, hint, error
   ───────────────────────────────────────────────────────────────────────── */
function Input({
  label, hint, error, success, required,
  value, defaultValue, onChange, onBlur, onFocus,
  placeholder, type = "text", disabled, readOnly,
  leading, trailing, size = "md", id,
  fullWidth = true,
}) {
  const [focus, setFocus] = useState(false);
  const autoId = useRef(id || "in_" + Math.random().toString(36).slice(2, 9));
  const sizeMap = {
    sm: { h: "var(--ctl-h-sm)", fs: "var(--ctl-fs-sm)", px: "var(--ctl-px-sm)", ic: "var(--ctl-ic-sm)" },
    md: { h: "var(--ctl-h-md)", fs: "var(--ctl-fs-md)", px: "var(--ctl-px-md)", ic: "var(--ctl-ic-md)" },
    lg: { h: "var(--ctl-h-lg)", fs: "var(--ctl-fs-lg)", px: "var(--ctl-px-lg)", ic: "var(--ctl-ic-lg)" },
  };
  const sz = sizeMap[size];
  // valid/success is a positive sibling of error — never show both; error wins.
  const isSuccess = success && !error;
  const borderColor = error ? "var(--border-danger)"
    : isSuccess ? "var(--border-success)"
    : focus ? "var(--border-focus)" : "var(--border-default)";
  return (
    <label htmlFor={autoId.current} style={{
      display: "flex", flexDirection: "column", gap: 6,
      width: fullWidth ? "100%" : undefined,
    }}>
      {label && (
        <span style={{
          fontSize: 13, fontWeight: 500, color: "var(--fg-default)", lineHeight: 1.3,
        }}>
          {label}
          {required && <span style={{ color: "var(--fg-danger)", marginLeft: 2 }}>*</span>}
        </span>
      )}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        height: sz.h, padding: `0 ${sz.px}`,
        background: disabled ? "var(--bg-muted)" : "var(--bg-surface)",
        border: `var(--input-bw) solid ${borderColor}`,
        borderRadius: "var(--radius-md)",
        boxShadow: focus
          ? (error ? "var(--ring-danger)" : "var(--ring-focus)")
          : "var(--input-shadow)",
        transition: "border-color var(--dur-default) var(--ease-default), box-shadow var(--dur-default) var(--ease-default)",
      }}>
        {leading && <Icon name={leading} size={sz.ic} color="var(--fg-muted)" />}
        <input
          id={autoId.current} type={type}
          value={value} defaultValue={defaultValue}
          onChange={e => onChange && onChange(e.target.value, e)}
          placeholder={placeholder}
          disabled={disabled} readOnly={readOnly} required={required}
          aria-invalid={error || undefined}
          aria-describedby={hint ? autoId.current + "_hint" : undefined}
          onFocus={(e) => { setFocus(true); onFocus && onFocus(e); }}
          onBlur={(e) => { setFocus(false); onBlur && onBlur(e); }}
          style={{
            flex: 1, minWidth: 0, border: 0, outline: 0, background: "transparent",
            fontFamily: "inherit", fontSize: sz.fs, color: "var(--fg-default)",
          }}
        />
        {trailing && <Icon name={trailing} size={sz.ic} color="var(--fg-muted)" />}
        {isSuccess && !trailing && <Icon name="check-circle" size={sz.ic} color="var(--fg-success)" />}
      </div>
      {hint && (
        <span id={autoId.current + "_hint"} style={{
          fontSize: 12, lineHeight: 1.4,
          color: error ? "var(--fg-danger)" : isSuccess ? "var(--fg-success)" : "var(--fg-muted)",
        }}>{hint}</span>
      )}
    </label>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   TEXTAREA
   ───────────────────────────────────────────────────────────────────────── */
function Textarea({ label, hint, error, required, value, defaultValue, onChange, placeholder, disabled, rows = 4 }) {
  const [focus, setFocus] = useState(false);
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      {label && <span style={{ fontSize: 13, fontWeight: 500 }}>{label}{required && <span style={{ color: "var(--fg-danger)", marginLeft: 2 }}>*</span>}</span>}
      <textarea
        rows={rows} value={value} defaultValue={defaultValue}
        onChange={e => onChange && onChange(e.target.value)}
        placeholder={placeholder} disabled={disabled} aria-invalid={error || undefined}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          width: "100%", padding: "10px 12px", resize: "vertical",
          background: disabled ? "var(--bg-muted)" : "var(--bg-surface)",
          color: "var(--fg-default)", fontFamily: "inherit", fontSize: 14,
          border: `1px solid ${error ? "var(--border-danger)" : focus ? "var(--border-focus)" : "var(--border-default)"}`,
          borderRadius: "var(--radius-md)",
          boxShadow: focus ? (error ? "var(--ring-danger)" : "var(--ring-focus)") : "none",
          outline: 0,
        }}
      />
      {hint && <span style={{ fontSize: 12, color: error ? "var(--fg-danger)" : "var(--fg-muted)" }}>{hint}</span>}
    </label>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   SELECT (native, styled)
   ───────────────────────────────────────────────────────────────────────── */
function Select({ label, hint, error, value, onChange, options, placeholder, disabled, required, size = "md" }) {
  const [focus, setFocus] = useState(false);
  const sizeMap = { sm: { h: 32, fs: 13 }, md: { h: 38, fs: 14 }, lg: { h: 46, fs: 15 } };
  const sz = sizeMap[size];
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      {label && <span style={{ fontSize: 13, fontWeight: 500 }}>{label}{required && <span style={{ color: "var(--fg-danger)", marginLeft: 2 }}>*</span>}</span>}
      <div style={{
        position: "relative", display: "flex", alignItems: "center",
        height: sz.h,
        background: disabled ? "var(--bg-muted)" : "var(--bg-surface)",
        border: `1px solid ${error ? "var(--border-danger)" : focus ? "var(--border-focus)" : "var(--border-default)"}`,
        borderRadius: "var(--radius-md)",
        boxShadow: focus ? (error ? "var(--ring-danger)" : "var(--ring-focus)") : "none",
      }}>
        <select value={value} onChange={e => onChange && onChange(e.target.value)}
          disabled={disabled} required={required}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{
            width: "100%", height: "100%", padding: "0 36px 0 12px",
            background: "transparent", color: "var(--fg-default)",
            fontFamily: "inherit", fontSize: sz.fs, border: 0, outline: 0,
            appearance: "none", WebkitAppearance: "none", MozAppearance: "none", cursor: "pointer",
          }}>
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map(o => {
            const value = typeof o === "object" ? o.value : o;
            const label = typeof o === "object" ? o.label : o;
            return <option key={value} value={value}>{label}</option>;
          })}
        </select>
        <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--fg-muted)" }}>
          <Icon name="chevron-down" size={16} />
        </span>
      </div>
      {hint && <span style={{ fontSize: 12, color: error ? "var(--fg-danger)" : "var(--fg-muted)" }}>{hint}</span>}
    </label>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   CHECKBOX / RADIO / SWITCH
   ───────────────────────────────────────────────────────────────────────── */
function Checkbox({ checked, defaultChecked, onChange, indeterminate, disabled, label, hint, id }) {
  const ref = useRef(null);
  const autoId = useRef(id || "cb_" + Math.random().toString(36).slice(2, 9));
  useEffect(() => { if (ref.current) ref.current.indeterminate = !!indeterminate; }, [indeterminate]);
  return (
    <label htmlFor={autoId.current} style={{
      display: "inline-flex", alignItems: "flex-start", gap: 8,
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
    }}>
      <span style={{ position: "relative", display: "inline-block", width: 18, height: 18, flexShrink: 0, marginTop: 1 }}>
        <input ref={ref} id={autoId.current} type="checkbox"
          checked={checked} defaultChecked={defaultChecked}
          onChange={e => onChange && onChange(e.target.checked, e)}
          disabled={disabled}
          style={{ position: "absolute", inset: 0, opacity: 0, margin: 0, cursor: "inherit" }} />
        <span style={{
          position: "absolute", inset: 0,
          background: (checked || indeterminate) ? "var(--bg-brand)" : "var(--bg-surface)",
          border: `1.5px solid ${(checked || indeterminate) ? "var(--bg-brand)" : "var(--border-default)"}`,
          borderRadius: 4, transition: "background var(--dur-fast), border-color var(--dur-fast)",
          display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--fg-on-brand)",
        }}>
          {indeterminate ? <Icon name="minus" size={12} strokeWidth={3} /> :
            checked ? <Icon name="check" size={12} strokeWidth={3} /> : null}
        </span>
      </span>
      {(label || hint) && (
        <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {label && <span style={{ fontSize: 14, lineHeight: 1.3, color: "var(--fg-default)" }}>{label}</span>}
          {hint && <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>{hint}</span>}
        </span>
      )}
    </label>
  );
}

function Radio({ checked, onChange, value, name, disabled, label, hint, id }) {
  const autoId = useRef(id || "rd_" + Math.random().toString(36).slice(2, 9));
  return (
    <label htmlFor={autoId.current} style={{
      display: "inline-flex", alignItems: "flex-start", gap: 8,
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
    }}>
      <span style={{ position: "relative", display: "inline-block", width: 18, height: 18, flexShrink: 0, marginTop: 1 }}>
        <input id={autoId.current} type="radio" name={name} value={value}
          checked={checked} onChange={e => onChange && onChange(value, e)} disabled={disabled}
          style={{ position: "absolute", inset: 0, opacity: 0, margin: 0, cursor: "inherit" }} />
        <span style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: "var(--bg-surface)",
          border: `1.5px solid ${checked ? "var(--bg-brand)" : "var(--border-default)"}`,
          transition: "border-color var(--dur-fast)",
        }} />
        {checked && (
          <span style={{
            position: "absolute", top: 4, left: 4, width: 10, height: 10,
            borderRadius: "50%", background: "var(--bg-brand)",
          }} />
        )}
      </span>
      {(label || hint) && (
        <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {label && <span style={{ fontSize: 14, lineHeight: 1.3, color: "var(--fg-default)" }}>{label}</span>}
          {hint && <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>{hint}</span>}
        </span>
      )}
    </label>
  );
}

function Switch({ checked, defaultChecked, onChange, disabled, label, size = "md", id }) {
  const [v, setV] = useState(checked ?? defaultChecked ?? false);
  const isControlled = checked !== undefined;
  const actual = isControlled ? checked : v;
  const autoId = useRef(id || "sw_" + Math.random().toString(36).slice(2, 9));
  const sizes = { sm: { w: 28, h: 16, knob: 12 }, md: { w: 36, h: 20, knob: 16 }, lg: { w: 44, h: 24, knob: 20 } };
  const sz = sizes[size];
  const toggle = () => {
    if (disabled) return;
    const next = !actual;
    if (!isControlled) setV(next);
    onChange && onChange(next);
  };
  return (
    <label htmlFor={autoId.current} style={{
      display: "inline-flex", alignItems: "center", gap: 10,
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
    }}>
      <button
        type="button" id={autoId.current} role="switch" aria-checked={actual}
        disabled={disabled} onClick={toggle}
        style={{
          appearance: "none", border: 0, padding: 0,
          width: sz.w, height: sz.h, borderRadius: 9999,
          background: actual ? "var(--bg-brand)" : "var(--neutral-300)",
          position: "relative", cursor: "inherit",
          transition: "background var(--dur-fast)",
        }}>
        <span style={{
          position: "absolute", top: 2, left: actual ? sz.w - sz.knob - 2 : 2,
          width: sz.knob, height: sz.knob, borderRadius: "50%",
          background: "var(--neutral-0)",
          boxShadow: "0 1px 3px rgba(0,0,0,.2)",
          transition: "left var(--dur-fast) var(--ease-out)",
        }} />
      </button>
      {label && <span style={{ fontSize: 14 }}>{label}</span>}
    </label>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   BADGE / CHIP / TAG
   ───────────────────────────────────────────────────────────────────────── */
function Badge({ variant = "neutral", size = "md", dot, leading, children, style }) {
  const sizes = { sm: { fs: 11, px: 6, py: 2 }, md: { fs: 12, px: 8, py: 3 }, lg: { fs: 13, px: 10, py: 4 } };
  const s = sizes[size];
  const variants = {
    neutral: { bg: "var(--bg-muted)",       fg: "var(--fg-default)",  bd: "var(--border-subtle)" },
    brand:   { bg: "var(--bg-brand-subtle)",fg: "var(--fg-brand)",    bd: "transparent" },
    success: { bg: "var(--bg-success-subtle)", fg: "var(--fg-success)", bd: "var(--border-success)" },
    warning: { bg: "var(--bg-warning-subtle)", fg: "var(--fg-warning)", bd: "var(--border-warning)" },
    danger:  { bg: "var(--bg-danger-subtle)",  fg: "var(--fg-danger)",  bd: "var(--border-danger)" },
    info:    { bg: "var(--bg-info-subtle)",    fg: "var(--fg-info)",    bd: "var(--border-info)" },
    solid:   { bg: "var(--bg-brand)",          fg: "var(--fg-on-brand)",bd: "transparent" },
  };
  const v = variants[variant];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: `${s.py}px ${s.px}px`, fontSize: s.fs, fontWeight: 500, lineHeight: 1.2,
      background: v.bg, color: v.fg, border: `1px solid ${v.bd}`,
      borderRadius: "var(--radius-pill)", whiteSpace: "nowrap",
      ...style,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 9999, background: "currentColor", flexShrink: 0 }} />}
      {leading && <Icon name={leading} size={s.fs - 1} />}
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   AVATAR
   ───────────────────────────────────────────────────────────────────────── */
function Avatar({ name = "", src, size = 32, shape = "circle", status, color }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(s => s[0]?.toUpperCase()).join("");
  const bg = color || "var(--bg-brand)";
  return (
    <span style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
      <span style={{
        width: size, height: size,
        borderRadius: shape === "square" ? "var(--radius-md)" : "50%",
        background: bg, color: "var(--fg-on-brand)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontSize: Math.max(10, Math.round(size * 0.4)), fontWeight: 600,
        overflow: "hidden", border: "2px solid var(--bg-surface)",
      }}>
        {src ? <img src={src} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
      </span>
      {status && (
        <span style={{
          position: "absolute", bottom: 0, right: 0,
          width: Math.max(8, Math.round(size * 0.28)),
          height: Math.max(8, Math.round(size * 0.28)),
          borderRadius: "50%", border: "2px solid var(--bg-surface)",
          background: status === "online" ? "var(--bg-success)" : status === "busy" ? "var(--bg-danger)" : status === "away" ? "var(--bg-warning)" : "var(--neutral-400)",
        }} />
      )}
    </span>
  );
}

function AvatarGroup({ children, max = 4 }) {
  const items = React.Children.toArray(children);
  const visible = items.slice(0, max);
  const extra = items.length - visible.length;
  return (
    <div style={{ display: "inline-flex" }}>
      {visible.map((c, i) => (
        <span key={i} style={{ marginLeft: i === 0 ? 0 : -8 }}>{c}</span>
      ))}
      {extra > 0 && (
        <span style={{ marginLeft: -8 }}>
          <Avatar name={`+${extra}`} color="var(--neutral-500)" />
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   CARD
   ───────────────────────────────────────────────────────────────────────── */
function Card({ children, padding, interactive, style, className, onClick, onMouseEnter, onMouseLeave, role, ariaLabel, ...rest }) {
  const [hover, setHover] = useState(false);
  // Only forward props we explicitly allow — avoids leaking custom props like `interactive` onto the DOM.
  return (
    <div
      className={className}
      role={role}
      aria-label={ariaLabel}
      onClick={onClick}
      onMouseEnter={(e) => { setHover(true); onMouseEnter && onMouseEnter(e); }}
      onMouseLeave={(e) => { setHover(false); onMouseLeave && onMouseLeave(e); }}
      style={{
        background: "var(--bg-raised)",
        border: "var(--card-bw) solid var(--border-subtle)",
        borderRadius: "var(--card-radius)",
        padding: padding ?? "var(--card-pad)",
        boxShadow: interactive && hover ? "var(--shadow-md)" : "var(--card-shadow)",
        transition: "box-shadow var(--dur-default) var(--ease-default), transform var(--dur-default) var(--ease-default)",
        transform: interactive && hover ? "translateY(-1px)" : "none",
        cursor: interactive ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   SPINNER
   ───────────────────────────────────────────────────────────────────────── */
function Spinner({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-label="Loading"
      style={{ animation: "wl-spin 0.8s linear infinite" }}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeOpacity="0.2" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <style>{`@keyframes wl-spin{to{transform:rotate(360deg)}}`}</style>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   ALERT (banner / inline)
   ───────────────────────────────────────────────────────────────────────── */
function Alert({ variant = "info", title, children, onDismiss, leadingIcon }) {
  const v = {
    info:    { bg: "var(--bg-info-subtle)",    fg: "var(--fg-info)",    bd: "var(--border-info)",    icon: "info" },
    success: { bg: "var(--bg-success-subtle)", fg: "var(--fg-success)", bd: "var(--border-success)", icon: "check-circle" },
    warning: { bg: "var(--bg-warning-subtle)", fg: "var(--fg-warning)", bd: "var(--border-warning)", icon: "alert-triangle" },
    danger:  { bg: "var(--bg-danger-subtle)",  fg: "var(--fg-danger)",  bd: "var(--border-danger)",  icon: "alert-octagon" },
  }[variant];
  return (
    <div role="alert" style={{
      display: "flex", gap: 12, padding: 14,
      background: v.bg, border: `1px solid ${v.bd}`,
      borderRadius: "var(--radius-md)",
      color: "var(--fg-default)",
    }}>
      <Icon name={leadingIcon || v.icon} size={18} color={v.fg} style={{ marginTop: 1, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg-default)", lineHeight: 1.3 }}>{title}</div>}
        {children && <div style={{ fontSize: 13, color: "var(--fg-muted)", marginTop: title ? 2 : 0, lineHeight: 1.5 }}>{children}</div>}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss" style={{
          appearance: "none", border: 0, background: "transparent",
          color: "var(--fg-muted)", cursor: "pointer", padding: 4, marginTop: -2,
        }}><Icon name="x" size={16} /></button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   TOOLTIP — wraps a child, shows on hover/focus
   ───────────────────────────────────────────────────────────────────────── */
function Tooltip({ content, side = "top", children }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);
  return (
    <span ref={wrap}
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
      style={{ position: "relative", display: "inline-flex" }}>
      {children}
      {open && (
        <span role="tooltip" style={{
          position: "absolute", zIndex: "var(--z-tooltip)",
          left: "50%", transform: "translateX(-50%)",
          ...(side === "top"    ? { bottom: "calc(100% + 6px)" } : {}),
          ...(side === "bottom" ? { top: "calc(100% + 6px)" } : {}),
          padding: "6px 10px",
          background: "var(--bg-inverse)", color: "var(--fg-inverse)",
          fontSize: 12, lineHeight: 1.3, borderRadius: "var(--radius-sm)",
          whiteSpace: "nowrap", pointerEvents: "none",
          boxShadow: "var(--shadow-md)", fontWeight: 500,
        }}>{content}</span>
      )}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   PROGRESS
   ───────────────────────────────────────────────────────────────────────── */
function Progress({ value = 0, max = 100, label, variant = "brand", size = "md" }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const heights = { sm: 4, md: 8, lg: 12 };
  const fills = {
    brand:   "var(--bg-brand)",
    success: "var(--bg-success)",
    warning: "var(--bg-warning)",
    danger:  "var(--bg-danger)",
  };
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 4 }}>
      {label && (
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--fg-muted)" }}>
          <span>{label}</span><span style={{ fontVariantNumeric: "tabular-nums" }}>{Math.round(pct)}%</span>
        </div>
      )}
      <div role="progressbar" aria-valuenow={value} aria-valuemax={max} aria-valuemin={0}
        style={{ height: heights[size], background: "var(--bg-muted)", borderRadius: 9999, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: fills[variant], transition: "width var(--dur-base) var(--ease-out)" }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   TABS
   ───────────────────────────────────────────────────────────────────────── */
function Tabs({ value, onChange, items, variant = "underline" }) {
  return (
    <div role="tablist" style={{
      display: "flex", gap: variant === "pill" ? 4 : 0,
      borderBottom: variant === "underline" ? "1px solid var(--border-subtle)" : "none",
      padding: variant === "pill" ? 4 : 0,
      background: variant === "pill" ? "var(--bg-muted)" : "transparent",
      borderRadius: variant === "pill" ? "var(--radius-md)" : 0,
    }}>
      {items.map(it => {
        const active = it.value === value;
        return (
          <button key={it.value} role="tab" aria-selected={active}
            onClick={() => onChange && onChange(it.value)}
            style={{
              appearance: "none", border: 0, cursor: "pointer",
              padding: variant === "pill" ? "6px 12px" : "10px 14px",
              fontSize: 14, fontWeight: 500, fontFamily: "inherit",
              background: variant === "pill" ? (active ? "var(--bg-surface)" : "transparent") : "transparent",
              color: active ? "var(--fg-default)" : "var(--fg-muted)",
              borderRadius: variant === "pill" ? "var(--radius-sm)" : 0,
              borderBottom: variant === "underline" ? `2px solid ${active ? "var(--bg-brand)" : "transparent"}` : "none",
              boxShadow: variant === "pill" && active ? "var(--shadow-xs)" : "none",
              marginBottom: variant === "underline" ? -1 : 0,
              transition: "all var(--dur-fast)",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}>
            {it.icon && <Icon name={it.icon} size={14} />}
            {it.label}
            {it.count != null && (
              <Badge variant={active ? "brand" : "neutral"} size="sm">{it.count}</Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   BREADCRUMBS
   ───────────────────────────────────────────────────────────────────────── */
function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol style={{ display: "flex", alignItems: "center", gap: 6, listStyle: "none", margin: 0, padding: 0, fontSize: 13 }}>
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <React.Fragment key={i}>
              <li>
                {last
                  ? <span aria-current="page" style={{ color: "var(--fg-default)", fontWeight: 500 }}>{it.label}</span>
                  : <a href={it.href || "#"} style={{ color: "var(--fg-muted)" }}>{it.label}</a>}
              </li>
              {!last && <Icon name="chevron-right" size={14} color="var(--fg-subtle)" />}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   KBD
   ───────────────────────────────────────────────────────────────────────── */
function Kbd({ children }) {
  return (
    <kbd style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      minWidth: 22, height: 22, padding: "0 6px",
      fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500,
      background: "var(--bg-surface)", color: "var(--fg-muted)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-sm)",
      boxShadow: "inset 0 -1px 0 var(--border-subtle)",
    }}>{children}</kbd>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   TYPOGRAPHY — renders the semantic type scale as a component.
   variant: display | h1–h6 | body-lg | body | body-sm | caption | label | overline | mono
   Maps 1:1 to the .t-* classes in tokens.css; `as` overrides the element.
   ───────────────────────────────────────────────────────────────────────── */
function Typography({ variant = "body", as, align, color, weight, truncate, children, style, className, ...rest }) {
  const tagMap = {
    display: "h1", h1: "h1", h2: "h2", h3: "h3", h4: "h4", h5: "h5", h6: "h6",
    "body-lg": "p", body: "p", "body-sm": "p",
    caption: "span", label: "span", overline: "div", mono: "span",
  };
  const Tag = as || tagMap[variant] || "p";
  const cls = `t-${variant}${className ? " " + className : ""}`;
  return (
    <Tag className={cls} style={{
      margin: 0,
      ...(align ? { textAlign: align } : {}),
      ...(color ? { color } : {}),
      ...(weight ? { fontWeight: weight } : {}),
      ...(truncate ? { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } : {}),
      ...style,
    }} {...rest}>{children}</Tag>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   RADIO GROUP — manages a set of Radios under one name + value.
   <RadioGroup value={v} onChange={setV} options={[{value,label,hint?,disabled?}]} />
   Also accepts <Radio> children (their `name`/`checked`/`onChange` are injected).
   ───────────────────────────────────────────────────────────────────────── */
function RadioGroup({
  value, defaultValue, onChange, name, options,
  orientation = "vertical", label, hint, error, required, disabled, children,
}) {
  const [internal, setInternal] = useState(defaultValue);
  const controlled = value !== undefined;
  const val = controlled ? value : internal;
  const groupName = useRef(name || "rg_" + Math.random().toString(36).slice(2, 9));
  const select = (v) => { if (!controlled) setInternal(v); onChange && onChange(v); };

  const radios = options
    ? options.map(o => {
        const ov = typeof o === "object" ? o.value : o;
        const ol = typeof o === "object" ? o.label : o;
        const oh = typeof o === "object" ? o.hint : undefined;
        const od = disabled || (typeof o === "object" && o.disabled) || false;
        return <Radio key={ov} value={ov} name={groupName.current} checked={val === ov} onChange={select} disabled={od} label={ol} hint={oh} />;
      })
    : React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, {
          name: groupName.current,
          checked: val === child.props.value,
          onChange: select,
          disabled: disabled || child.props.disabled,
        });
      });

  return (
    <fieldset role="radiogroup" aria-required={required || undefined} aria-invalid={error || undefined}
      style={{ border: 0, margin: 0, padding: 0, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
      {label && (
        <legend style={{ padding: 0, fontSize: 13, fontWeight: 500, color: "var(--fg-default)", lineHeight: 1.3 }}>
          {label}{required && <span style={{ color: "var(--fg-danger)", marginLeft: 2 }}>*</span>}
        </legend>
      )}
      <div style={{ display: "flex", flexDirection: orientation === "horizontal" ? "row" : "column", gap: orientation === "horizontal" ? 20 : 10, flexWrap: orientation === "horizontal" ? "wrap" : "nowrap" }}>
        {radios}
      </div>
      {(hint || error) && (
        <span style={{ fontSize: 12, lineHeight: 1.4, color: error ? "var(--fg-danger)" : "var(--fg-muted)" }}>{error || hint}</span>
      )}
    </fieldset>
  );
}

Object.assign(window, {
  Icon, Button, IconButton, Input, Textarea, Select,
  Checkbox, Radio, RadioGroup, Switch, Badge, Avatar, AvatarGroup,
  Card, Spinner, Alert, Tooltip, Progress, Tabs, Breadcrumbs, Kbd, Typography,
});
