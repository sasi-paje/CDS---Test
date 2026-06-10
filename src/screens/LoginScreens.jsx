/* ============================================================================
   LoginScreens.jsx — three login STRUCTURES built entirely from the shared
   src/whitelabel/ primitives + semantic tokens. One interactive auth core,
   three frames:
     · CenteredLogin  — classic single card
     · SplitLogin     — brand panel + form (shows off the white-label hue)
     · MinimalLogin   — borderless, full-bleed, airy
   Exports to window: CenteredLogin, SplitLogin, MinimalLogin, BrandMark.
   ========================================================================== */
const { useState, useRef } = React;
const { Button, Input, Checkbox, Alert, Icon, Card } = window;

const PRODUCT = "CDS SaaS";

function BrandMark({ size = 36, showName = true, onDark = false, nameSize = 18 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
      <div style={{
        width: size, height: size, borderRadius: "calc(var(--radius-lg) + 1px)",
        display: "grid", placeItems: "center", flexShrink: 0,
        background: onDark
          ? "rgba(255,255,255,0.16)"
          : "linear-gradient(150deg, var(--brand-500), var(--brand-700))",
        boxShadow: onDark ? "inset 0 0 0 1px rgba(255,255,255,0.25)" : "var(--shadow-sm)",
        color: "#fff", fontWeight: 700, fontSize: size * 0.46, letterSpacing: "-0.02em",
        fontFamily: "var(--font-display, var(--font-sans))",
      }}>{PRODUCT[0]}</div>
      {showName && (
        <span style={{
          fontWeight: 600, fontSize: nameSize, letterSpacing: "-0.02em",
          color: onDark ? "#fff" : "var(--fg-strong)",
          fontFamily: "var(--font-display, var(--font-sans))",
        }}>{PRODUCT}</span>
      )}
    </div>
  );
}

function GoogleMark({ s = 17 }) {
  return (
    <svg width={s} height={s} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.3 13.2 17.7 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9.1h12.4c-.5 2.9-2.1 5.3-4.6 7l7.1 5.5c4.2-3.9 6.6-9.6 6.6-17z"/>
      <path fill="#FBBC05" d="M10.5 28.3c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.1 0 19.9 0 23.7s1 7.6 2.6 10.7l7.9-6.1z"/>
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.1-5.5c-2 1.3-4.6 2.1-8.8 2.1-6.3 0-11.7-3.7-13.5-9l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/>
    </svg>
  );
}
function GitHubMark({ s = 17 }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z"/>
    </svg>
  );
}
function AppleMark({ s = 18 }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.4 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9s-1.8-.9-3-.8c-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.2 0 2-1.1 2.8-2.2.9-1.3 1.2-2.5 1.3-2.6-.1 0-2.5-1-2.5-3.8zM14.3 5.8c.6-.8 1.1-1.9 1-3-.9 0-2.1.6-2.8 1.4-.6.7-1.1 1.8-1 2.9 1 .1 2.1-.5 2.8-1.3z"/>
    </svg>
  );
}

function SocialButton({ mark, label, onClick, full }) {
  const [hover, setHover] = useState(false);
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9,
        height: "var(--ctl-h-md)", padding: "0 14px", width: full ? "100%" : undefined,
        flex: full ? undefined : 1,
        background: hover ? "var(--bg-muted)" : "var(--bg-surface)",
        color: "var(--fg-default)",
        border: "var(--ctl-bw) solid var(--border-default)", borderRadius: "var(--radius-md)",
        fontFamily: "var(--font-sans)", fontWeight: "var(--ctl-fw)", fontSize: "var(--ctl-fs-md)",
        cursor: "pointer", transition: "background-color var(--dur-default) var(--ease-default)",
      }}>
      {mark}{label && <span>{label}</span>}
    </button>
  );
}

function PasswordField({ value, onChange, error, label = "Password", placeholder = "••••••••", onEnter }) {
  const [focus, setFocus] = useState(false);
  const [show, setShow] = useState(false);
  const id = useRef("pw_" + Math.random().toString(36).slice(2, 8));
  return (
    <label htmlFor={id.current} style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--fg-default)", lineHeight: 1.3 }}>{label}</span>
      <div style={{
        display: "flex", alignItems: "center", gap: 8, height: "var(--ctl-h-md)", padding: "0 12px",
        background: "var(--bg-surface)",
        border: `var(--input-bw) solid ${error ? "var(--border-danger)" : focus ? "var(--border-focus)" : "var(--border-default)"}`,
        borderRadius: "var(--radius-md)",
        boxShadow: focus ? (error ? "var(--ring-danger)" : "var(--ring-focus)") : "var(--input-shadow)",
        transition: "border-color var(--dur-default) var(--ease-default), box-shadow var(--dur-default) var(--ease-default)",
      }}>
        <Icon name="lock" size="var(--ctl-ic-md)" color="var(--fg-muted)" />
        <input id={id.current} type={show ? "text" : "password"} value={value}
          onChange={e => onChange(e.target.value)} placeholder={placeholder}
          onKeyDown={e => { if (e.key === "Enter" && onEnter) onEnter(); }}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          aria-invalid={error || undefined}
          style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: "transparent",
            fontFamily: "inherit", fontSize: "var(--ctl-fs-md)", color: "var(--fg-default)" }} />
        <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? "Hide password" : "Show password"}
          style={{ border: 0, background: "transparent", padding: 2, cursor: "pointer", display: "inline-flex", color: "var(--fg-subtle)" }}>
          <Icon name={show ? "eye-off" : "eye"} size={16} />
        </button>
      </div>
      {error && <span style={{ fontSize: 12, lineHeight: 1.4, color: "var(--fg-danger)" }}>{error}</span>}
    </label>
  );
}

function useAuth({ onLogin } = {}) {
  const [mode, setMode] = useState("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState({});
  const [loading, setLoading] = useState(false);

  const reset = () => setErr({});
  function submit() {
    const e = {};
    if (mode === "signup" && !name.trim()) e.name = "Enter your name.";
    if (!email.trim()) e.email = "Enter your email.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = "That doesn't look like a valid email.";
    if (!pw) e.pw = "Enter your password.";
    else if (mode === "signup" && pw.length < 8) e.pw = "Use at least 8 characters.";
    setErr(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (mode === "signin" && pw.toLowerCase() === "wrong") {
        setErr({ form: "Incorrect email or password. Please try again." });
        return;
      }
      window.toast?.success(mode === "signin" ? "Welcome back" : "Account created", { description: email });
      onLogin?.();
    }, 1150);
  }
  return { mode, setMode, name, setName, email, setEmail, pw, setPw,
    remember, setRemember, err, reset, loading, submit };
}

function AuthForm({ a, align = "left", socialLabels = false }) {
  const isSignup = a.mode !== "signin";
  return (
    <form onSubmit={e => { e.preventDefault(); a.submit(); }}
      style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>

      {a.err.form && <Alert variant="danger">{a.err.form}</Alert>}

      <div style={{ display: "flex", gap: 10 }}>
        <SocialButton full={socialLabels} mark={<GoogleMark />} label={socialLabels ? "Google" : null}
          onClick={() => window.toast?.("Continue with Google", { description: "Demo — no real OAuth." })} />
        <SocialButton full={socialLabels} mark={<GitHubMark />} label={socialLabels ? "GitHub" : null}
          onClick={() => window.toast?.("Continue with GitHub", { description: "Demo — no real OAuth." })} />
        <SocialButton full={socialLabels} mark={<AppleMark />} label={socialLabels ? "Apple" : null}
          onClick={() => window.toast?.("Continue with Apple", { description: "Demo — no real OAuth." })} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--fg-subtle)" }}>
        <span style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
        <span style={{ fontSize: 12, whiteSpace: "nowrap", flexShrink: 0 }}>or continue with email</span>
        <span style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
      </div>

      {isSignup && (
        <Input label="Full name" placeholder="Dana Okonkwo" leading="user"
          value={a.name} onChange={a.setName} error={!!a.err.name} hint={a.err.name} />
      )}
      <Input label="Email" type="email" placeholder="you@company.com" leading="mail"
        value={a.email} onChange={v => { a.setEmail(v); }} error={!!a.err.email} hint={a.err.email} />
      <PasswordField value={a.pw} onChange={a.setPw} error={a.err.pw}
        onEnter={a.submit} placeholder={isSignup ? "Create a password" : "••••••••"} />

      {!isSignup && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <span style={{ flexShrink: 0, whiteSpace: "nowrap" }}><Checkbox checked={a.remember} onChange={a.setRemember} label="Remember me" /></span>
          <a href="#" onClick={e => { e.preventDefault(); window.toast?.("Reset link sent", { description: "Check your inbox." }); }}
            style={{ fontSize: 13, whiteSpace: "nowrap", flexShrink: 0 }}>Forgot password?</a>
        </div>
      )}

      <Button type="submit" fullWidth size="lg" loading={a.loading}
        trailing={a.loading ? undefined : "arrow-right"}>
        {isSignup ? "Create account" : "Sign in"}
      </Button>

      <p style={{ margin: 0, fontSize: 13, color: "var(--fg-muted)", textAlign: align === "center" ? "center" : "left" }}>
        {isSignup ? "Already have an account? " : "Don't have an account? "}
        <a href="#" onClick={e => { e.preventDefault(); a.reset(); a.setMode(isSignup ? "signin" : "signup"); }}
          style={{ fontWeight: 500 }}>{isSignup ? "Sign in" : "Sign up"}</a>
      </p>
    </form>
  );
}

function Heading({ a, align = "left" }) {
  const isSignup = a.mode === "signup";
  return (
    <div style={{ textAlign: align, marginBottom: 4 }}>
      <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: "-0.025em", color: "var(--fg-strong)" }}>
        {isSignup ? "Create your account" : "Welcome back"}
      </h1>
      <p style={{ margin: "8px 0 0", fontSize: 14.5, color: "var(--fg-muted)", lineHeight: 1.5 }}>
        {isSignup ? `Start your ${PRODUCT} workspace in minutes.` : `Sign in to your ${PRODUCT} workspace.`}
      </p>
    </div>
  );
}

/* ============================ 1 · CENTERED ================================ */
function CenteredLogin({ onLogin }) {
  const a = useAuth({ onLogin });
  return (
    <div style={{ minHeight: "100%", display: "grid", placeItems: "center",
      background: "var(--bg-app)", padding: 32 }}>
      <div style={{ width: "100%", maxWidth: 408, display: "flex", flexDirection: "column", gap: 26 }}>
        <div style={{ display: "flex", justifyContent: "center" }}><BrandMark size={40} /></div>
        <Card style={{ padding: 32, display: "flex", flexDirection: "column", gap: 24, boxShadow: "var(--shadow-lg)" }}>
          <Heading a={a} align="center" />
          <AuthForm a={a} align="center" />
        </Card>
        <p style={{ margin: 0, textAlign: "center", fontSize: 12.5, color: "var(--fg-subtle)" }}>
          Protected by enterprise-grade encryption.
        </p>
      </div>
    </div>
  );
}

/* ============================ 2 · SPLIT =================================== */
function SplitLogin({ onLogin }) {
  const a = useAuth({ onLogin });
  return (
    <div style={{ minHeight: "100%", display: "grid", gridTemplateColumns: "1fr 1fr",
      background: "var(--bg-canvas)" }}>
      <div style={{ display: "grid", placeItems: "center", padding: "48px 40px" }}>
        <div style={{ width: "100%", maxWidth: 392, display: "flex", flexDirection: "column", gap: 26 }}>
          <BrandMark size={34} />
          <Heading a={a} />
          <AuthForm a={a} />
        </div>
      </div>
      <div style={{
        position: "relative", overflow: "hidden", color: "#fff",
        background: "linear-gradient(150deg, var(--brand-500), var(--brand-700) 70%, var(--brand-800))",
        display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 48,
      }}>
        <div aria-hidden="true" style={{ position: "absolute", inset: 0,
          background: "radial-gradient(120% 80% at 90% 0%, rgba(255,255,255,0.22), transparent 55%)" }} />
        <div aria-hidden="true" style={{ position: "absolute", right: -80, bottom: -80, width: 320, height: 320,
          borderRadius: "50%", border: "1px solid rgba(255,255,255,0.18)" }} />
        <div aria-hidden="true" style={{ position: "absolute", right: -30, bottom: -30, width: 220, height: 220,
          borderRadius: "50%", border: "1px solid rgba(255,255,255,0.14)" }} />

        <BrandMark size={34} onDark />

        <div style={{ position: "relative", maxWidth: 420 }}>
          <h2 style={{ margin: 0, fontSize: 34, lineHeight: 1.15, fontWeight: 700, letterSpacing: "-0.03em" }}>
            One platform for your entire operation.
          </h2>
          <p style={{ margin: "18px 0 0", fontSize: 16, lineHeight: 1.6, color: "rgba(255,255,255,0.82)" }}>
            Dashboards, alerts, approvals and pipelines — unified, and ready the moment you sign in.
          </p>
          <div style={{ display: "flex", gap: 26, marginTop: 34 }}>
            {[["70+", "components"], ["12×5×2", "configurations"], ["5", "inboxes"]].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>{n}</div>
                <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12,
          padding: 16, borderRadius: "var(--radius-xl)", background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.16)", backdropFilter: "blur(4px)" }}>
          <span style={{ fontSize: 14, lineHeight: 1.5, color: "rgba(255,255,255,0.92)" }}>
            "Any client gets a product that looks like us — independent of style, colors, or language."
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============================ 3 · MINIMAL ================================= */
function MinimalLogin({ onLogin }) {
  const a = useAuth({ onLogin });
  return (
    <div style={{ minHeight: "100%", position: "relative", display: "grid", placeItems: "center",
      padding: 32, background: "var(--bg-canvas)" }}>
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(60% 50% at 50% 0%, var(--bg-brand-subtle), transparent 70%)" }} />
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.5,
        backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
        maskImage: "radial-gradient(70% 60% at 50% 30%, #000, transparent 80%)",
        WebkitMaskImage: "radial-gradient(70% 60% at 50% 30%, #000, transparent 80%)" }} />
      <div style={{ position: "relative", width: "100%", maxWidth: 384,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
        <BrandMark size={44} showName={false} />
        <Heading a={a} align="center" />
        <div style={{ width: "100%" }}><AuthForm a={a} align="center" /></div>
      </div>
    </div>
  );
}

Object.assign(window, { CenteredLogin, SplitLogin, MinimalLogin, BrandMark });
