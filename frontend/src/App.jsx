import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  CloudRain,
  Leaf,
  LocateFixed,
  LogOut,
  MapPin,
  ShieldCheck,
  Sun,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import "./App.css";

const API = "http://localhost:4000/api";
const DEMO_ACCOUNTS = {
  farmer: ["farmer@demo.krishiai", "Demo@123"],
  expert: ["expert@demo.krishiai", "Demo@123"],
  officer: ["officer@demo.krishiai", "Demo@123"],
};
const fetchJson = async (path, options = {}) => {
  const token = localStorage.getItem("krishiai_token");
  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API}${path}`, { ...options, headers });
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      throw new Error(
        typeof data === "string"
          ? data
          : data.message || data.detail || "Something went wrong",
      );
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("KrishiAI backend is unavailable. Start the backend service first.");
    }
    throw error;
  }
};

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [language, setLanguage] = useState("en");
  const [error, setError] = useState("");
  useEffect(() => {
    const saved = localStorage.getItem("krishiai_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);
  const login = async (email, password) => {
    const data = await fetchJson("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem("krishiai_token", data.token);
    localStorage.setItem("krishiai_user", JSON.stringify(data.user));
    setUser(data.user);
    setPage("dashboard");
  };
  const logout = () => {
    localStorage.clear();
    setUser(null);
  };
  if (!user) return <Auth onLogin={login} onError={setError} error={error} />;
  return (
    <div className="app-shell">
      <Sidebar user={user} page={page} setPage={setPage} logout={logout} />
      <main className="main">
        <header className="topbar">
          <div className="mobile-brand">
            <Leaf size={20} /> KrishiAI
          </div>
          <button
            className="language"
            onClick={() => setLanguage(language === "en" ? "hi" : "en")}
          >
            {language === "en" ? "हिंदी" : "English"}
          </button>
        </header>
        {error && (
          <div className="toast error">
            {error}
            <button onClick={() => setError("")}>
              <X size={16} />
            </button>
          </div>
        )}
        {user.role === "farmer" && (
          <FarmerView page={page} setPage={setPage} onError={setError} />
        )}
        {user.role === "expert" && (
          <ExpertView page={page} onError={setError} />
        )}
        {user.role === "officer" && (
          <OfficerView page={page} onError={setError} />
        )}
      </main>
    </div>
  );
}

function Auth({ onLogin, onError, error }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const submit = async (event) => {
    event.preventDefault();
    try {
      if (mode === "register") {
        const response = await fetch(`${API}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        await onLogin(data.user.email, form.password);
      } else await onLogin(form.email, form.password);
    } catch (err) {
      onError(err.message);
    }
  };
  return (
    <div className="auth-page">
      <div className="auth-aside">
        <div className="brand">
          <Leaf size={30} /> KrishiAI
        </div>
        <div className="aside-copy">
          <p className="eyebrow">SMART INDIA HACKATHON 2026</p>
          <h1>
            Know your crop.
            <br />
            <em>Grow with confidence.</em>
          </h1>
          <p>
            Field intelligence for the farmers who feed India. Simple, timely,
            grounded in agricultural science.
          </p>
        </div>
        <div className="aside-stats">
          <span>
            <strong>3</strong> crops supported
          </span>
          <span>
            <strong>24/7</strong> field signals
          </span>
        </div>
      </div>
      <div className="auth-card">
        <div className="auth-mobile-brand">
          <Leaf size={24} /> KrishiAI
        </div>
        <p className="eyebrow">
          {mode === "login" ? "WELCOME BACK" : "JOIN THE FIELD NETWORK"}
        </p>
        <h2>
          {mode === "login"
            ? "Your field, at a glance."
            : "Start monitoring smarter."}
        </h2>
        <p className="muted">
          {mode === "login"
            ? "Sign in to continue your crop health journey."
            : "Create a farmer account to get clear, practical crop guidance."}
        </p>
        <form onSubmit={submit}>
          {mode === "register" && (
            <label>
              Full name
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
              />
            </label>
          )}
          <label>
            Email address
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="At least 6 characters"
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="primary full">
            {mode === "login" ? "Sign in" : "Create account"}{" "}
            <ArrowRight size={18} />
          </button>
        </form>
        <div className="demo-logins">
          <span>Demo access</span>
          {Object.entries(DEMO_ACCOUNTS).map(([role, account]) => (
            <button key={role} onClick={() => onLogin(...account)}>
              {role}
            </button>
          ))}
        </div>
        <button
          className="text-button"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login"
            ? "New to KrishiAI? Create account"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}

function Sidebar({ user, page, setPage, logout }) {
  const items =
    user.role === "farmer"
      ? [
          ["dashboard", "Overview", Activity],
          ["report", "New crop check", Upload],
          ["history", "Report history", Leaf],
        ]
      : user.role === "expert"
        ? [["dashboard", "Expert queue", ShieldCheck]]
        : [
            ["dashboard", "Command center", Activity],
            ["map", "Risk map", MapPin],
          ];
  return (
    <aside className="sidebar">
      <div className="brand">
        <Leaf size={24} /> KrishiAI
      </div>
      <div className="role-chip">
        <span className="avatar">
          <UserRound size={16} />
        </span>
        <div>
          <strong>{user.name}</strong>
          <small>
            {user.role} · {user.isDemo ? "demo account" : "verified"}
          </small>
        </div>
      </div>
      <nav>
        {items.map(([id, label, Icon]) => (
          <button
            className={page === id ? "active" : ""}
            onClick={() => setPage(id)}
            key={id}
          >
            <Icon size={18} /> {label}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="trust">
          <CheckCircle2 size={17} />
          <span>
            AI-assisted
            <br />
            <b>Expert-ready</b>
          </span>
        </div>
        <button className="logout" onClick={logout}>
          <LogOut size={17} /> Sign out
        </button>
      </div>
    </aside>
  );
}

function FarmerView({ page, setPage, onError }) {
  const [reports, setReports] = useState([]);
  const [fields, setFields] = useState([]);
  const [selected, setSelected] = useState(null);
  const refresh = async () => {
    try {
      const data = await fetchJson("/dashboard/farmer");
      setReports(data.reports);
      setFields(data.fields);
    } catch (err) {
      onError(err.message);
    }
  };
  useEffect(() => {
    refresh();
  }, []);
  if (page === "report")
    return (
      <ReportForm
        fields={fields}
        onDone={(report) => {
          setSelected(report);
          setPage("advisory");
          refresh();
        }}
        onError={onError}
      />
    );
  if (page === "history")
    return (
      <History reports={reports} setSelected={setSelected} setPage={setPage} />
    );
  if (page === "advisory" && selected)
    return <ReportDetail report={selected} onError={onError} />;
  return (
    <FarmerDashboard
      reports={reports}
      fields={fields}
      setPage={setPage}
      setSelected={setSelected}
    />
  );
}
function FarmerDashboard({ reports, fields, setPage, setSelected }) {
  const latest = reports[0];
  return (
    <div className="content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">FARMER OVERVIEW</p>
          <h1>Good morning, farmer.</h1>
          <p className="muted">
            A clear view of what your fields are telling you today.
          </p>
        </div>
        <button className="primary" onClick={() => setPage("report")}>
          <Upload size={18} /> Check a crop
        </button>
      </div>
      <section className="signal-banner">
        <div className="sun-disc">
          <Sun size={25} />
        </div>
        <div>
          <p className="eyebrow">FIELD SIGNAL</p>
          <h3>
            {latest
              ? `${latest.crop} check is ${latest.risk.level.toLowerCase()} risk`
              : "Your fields are ready"}
          </h3>
          <p>
            {latest
              ? latest.risk.reasons[0]
              : "Add your first field and upload a crop image to start."}
          </p>
        </div>
        <ArrowRight size={20} />
      </section>
      <div className="stats-grid">
        <Stat label="Fields monitored" value={fields.length} icon={MapPin} />
        <Stat label="Crop checks" value={reports.length} icon={Activity} />
        <Stat
          label="High-risk alerts"
          value={reports.filter((r) => r.risk.level === "HIGH").length}
          icon={CloudRain}
          alert
        />
      </div>
      {latest && (
        <section className="insight-section">
          <div className="section-intro">
            <div>
              <p className="eyebrow">LATEST FIELD CHECK</p>
              <h2>{latest.crop} health snapshot</h2>
            </div>
            <button
              className="text-button"
              onClick={() => {
                setSelected(latest);
                setPage("advisory");
              }}
            >
              Open full report <ArrowRight size={15} />
            </button>
          </div>
          <div className="insight-grid">
            <InsightCard
              icon={Activity}
              label="AI result"
              value={latest.prediction.prediction}
              detail={latest.prediction.model_type?.includes("DEMO") ? "DEMO model signal" : "AI model signal"}
              onClick={() => {
                setSelected(latest);
                setPage("advisory");
              }}
            />
            <InsightCard
              icon={Activity}
              label="Confidence"
              value={`${Math.round(latest.prediction.confidence * 100)}%`}
              detail="How certain the AI is"
              tone="lime"
            />
            <InsightCard
              icon={Sun}
              label="Weather"
              value={latest.weather?.available ? `${latest.weather.temperature}°C` : "Unavailable"}
              detail={latest.weather?.available ? `${latest.weather.humidity}% humidity` : "Check report details"}
              tone="sky"
            />
            <InsightCard
              icon={CloudRain}
              label="Risk level"
              value={latest.risk.level}
              detail={latest.risk.reasons[0]}
              tone={latest.risk.level === "HIGH" ? "red" : "amber"}
            />
            <InsightCard
              icon={Leaf}
              label="IPM advisory"
              value="Ready"
              detail="Practical crop-care guidance"
              tone="green"
              onClick={() => {
                setSelected(latest);
                setPage("advisory");
              }}
            />
            <InsightCard
              icon={ShieldCheck}
              label="Expert validation"
              value={latest.status === "validated" ? "Validated" : "Pending"}
              detail={latest.status === "validated" ? "Reviewed by an expert" : "Review recommended"}
              tone={latest.status === "validated" ? "green" : "amber"}
              onClick={() => {
                setSelected(latest);
                setPage("advisory");
              }}
            />
          </div>
        </section>
      )}
      <div className="section-row">
        <div className="panel wide">
          <div className="panel-head">
            <div>
              <p className="eyebrow">RECENT ACTIVITY</p>
              <h2>Crop health checks</h2>
            </div>
            <button className="text-button" onClick={() => setPage("history")}>
              View all <ArrowRight size={15} />
            </button>
          </div>
          {reports.length ? (
            reports.slice(0, 3).map((report) => (
              <ReportRow
                key={report.id}
                report={report}
                onClick={() => {
                  setSelected(report);
                  setPage("advisory");
                }}
              />
            ))
          ) : (
            <Empty onClick={() => setPage("report")} />
          )}
        </div>
        <div className="panel">
          <p className="eyebrow">SUPPORTED CROPS</p>
          <h2>Start with what you grow.</h2>
          <div className="crop-list">
            <span>
              <i className="crop-tomato" /> Tomato
            </span>
            <span>
              <i className="crop-wheat" /> Wheat
            </span>
            <span>
              <i className="crop-chilli" /> Chilli
            </span>
          </div>
          <p className="small muted">
            Our first release focuses on three crops so advice stays relevant
            and useful.
          </p>
        </div>
      </div>
    </div>
  );
}
function InsightCard({ icon: Icon, label, value, detail, tone = "green", onClick }) {
  const content = (
    <>
      <span className={`insight-icon insight-${tone}`}><Icon size={18} /></span>
      <span className="insight-copy">
        <span className="eyebrow">{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </span>
      {onClick && <ArrowRight className="insight-arrow" size={16} />}
    </>
  );
  return onClick ? <button className="insight-card" onClick={onClick}>{content}</button> : <div className="insight-card">{content}</div>;
}
function Stat({ label, value, icon: Icon, alert }) {
  return (
    <div className={`stat ${alert ? "stat-alert" : ""}`}>
      <div className="stat-icon">
        <Icon size={18} />
      </div>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}
function ReportRow({ report, onClick }) {
  return (
    <button className="report-row" onClick={onClick}>
      <span
        className="report-thumb"
        style={{ backgroundImage: `url(${report.imageUrl})` }}
      />
      <span className="report-main">
        <strong>
          {report.crop} · {report.prediction.prediction}
        </strong>
        <small>
          {new Date(report.createdAt).toLocaleDateString()} ·{" "}
          {report.status === "validated"
            ? "Expert validated"
            : report.prediction.model_type?.includes("DEMO")
              ? "Development model"
              : "AI assessment"}
        </small>
      </span>
      <RiskBadge level={report.risk.level} />
      <ArrowRight size={17} />
    </button>
  );
}
function RiskBadge({ level }) {
  return (
    <span className={`risk risk-${level.toLowerCase()}`}>
      <i /> {level}
    </span>
  );
}
function Empty({ onClick }) {
  return (
    <div className="empty">
      <Leaf size={30} />
      <p>No crop checks yet.</p>
      <button className="text-button" onClick={onClick}>
        Upload your first image <ArrowRight size={15} />
      </button>
    </div>
  );
}

function ReportForm({ fields, onDone, onError }) {
  const [form, setForm] = useState({
    name: "",
    crop: "Tomato",
    stage: "vegetative",
    sowingDate: "",
    latitude: "20.5937",
    longitude: "78.9629",
  });
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const existingField = fields.find((field) => field.crop === form.crop);
  const locate = () =>
    navigator.geolocation?.getCurrentPosition(
      (pos) =>
        setForm({
          ...form,
          latitude: pos.coords.latitude.toFixed(5),
          longitude: pos.coords.longitude.toFixed(5),
        }),
      () =>
        onError(
          "Location permission was not granted. Using the default location.",
        ),
    );
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      let fieldId = existingField?.id;
      if (!fieldId) {
        const field = await fetchJson("/fields", {
          method: "POST",
          body: JSON.stringify({
            ...form,
            name: form.name || `${form.crop} field`,
          }),
        });
        fieldId = field.id;
      }
      const body = new FormData();
      Object.entries({ ...form, fieldId }).forEach(([key, value]) =>
        body.append(key, value),
      );
      body.append("image", file);
      const report = await fetchJson("/reports", { method: "POST", body });
      onDone(report);
    } catch (err) {
      onError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="content narrow">
      <div className="page-heading">
        <div>
          <p className="eyebrow">NEW CROP CHECK</p>
          <h1>Let's read your field.</h1>
          <p className="muted">
            Upload one clear image. We will combine it with crop stage, weather,
            and nearby signals.
          </p>
        </div>
      </div>
      <form className="workflow" onSubmit={submit}>
        <section className="panel step">
          <div className="step-number">01</div>
          <div className="step-body">
            <p className="eyebrow">FIELD DETAILS</p>
            <h2>Where is this crop growing?</h2>
            <div className="form-grid">
              <label>
                Field name
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={existingField?.name || "North field"}
                  required={!existingField}
                />
              </label>
              <label>
                Crop
                <select
                  value={form.crop}
                  onChange={(e) => setForm({ ...form, crop: e.target.value })}
                >
                  <option>Tomato</option>
                  <option>Wheat</option>
                  <option>Chilli</option>
                </select>
              </label>
              <label>
                Sowing date
                <input
                  type="date"
                  value={form.sowingDate}
                  onChange={(e) =>
                    setForm({ ...form, sowingDate: e.target.value })
                  }
                />
              </label>
              <label>
                Crop stage
                <select
                  value={form.stage}
                  onChange={(e) => setForm({ ...form, stage: e.target.value })}
                >
                  <option value="seedling">Seedling</option>
                  <option value="vegetative">Vegetative</option>
                  <option value="flowering">Flowering</option>
                  <option value="fruiting">Fruiting</option>
                </select>
              </label>
            </div>
            <label className="location-input">
              Location{" "}
              <button
                type="button"
                className="outline small-button"
                onClick={locate}
              >
                <LocateFixed size={15} /> Use my GPS
              </button>
              <span>
                {Number(form.latitude).toFixed(3)},{" "}
                {Number(form.longitude).toFixed(3)}
              </span>
            </label>
          </div>
        </section>
        <section className="panel step">
          <div className="step-number">02</div>
          <div className="step-body">
            <p className="eyebrow">CROP IMAGE</p>
            <h2>Show us the leaves or fruit.</h2>
            <label className="dropzone">
              {file ? (
                <>
                  <CheckCircle2 size={28} />
                  <strong>{file.name}</strong>
                  <small>
                    {(file.size / 1024 / 1024).toFixed(1)} MB · ready for
                    quality check
                  </small>
                </>
              ) : (
                <>
                  <Upload size={28} />
                  <strong>Choose a clear crop image</strong>
                  <small>JPG, PNG or WebP · up to 8 MB · minimum 224px</small>
                </>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
            </label>
            <p className="demo-note">
              The current AI result is clearly labelled as a development model.
              It is an interface-ready adapter for a trained model.
            </p>
          </div>
        </section>
        <button className="primary full" disabled={busy || !file}>
          {busy ? "Checking field signals..." : "Run crop health check"}{" "}
          {!busy && <ArrowRight size={18} />}
        </button>
      </form>
    </div>
  );
}

function History({ reports, setSelected, setPage }) {
  return (
    <div className="content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">REPORT HISTORY</p>
          <h1>Every check, in one place.</h1>
          <p className="muted">Track how your fields change over time.</p>
        </div>
      </div>
      <div className="panel history-list">
        {reports.length ? (
          reports.map((report) => (
            <ReportRow
              key={report.id}
              report={report}
              onClick={() => {
                setSelected(report);
                setPage("advisory");
              }}
            />
          ))
        ) : (
          <Empty onClick={() => setPage("report")} />
        )}
      </div>
    </div>
  );
}

function ReportDetail({ report: initial, onError }) {
  const [report, setReport] = useState(initial);
  const [note, setNote] = useState("");
  const [ipm, setIpm] = useState(null);
  const visualSignals = report.prediction.visual_signals || {};
  const signalPercent = (value) => Math.round((Number.isFinite(Number(value)) ? Number(value) : 0) * 100);
  useEffect(() => {
    fetchJson(`/reports/${report.id}`)
      .then(({ report: savedReport, ipm: guidance }) =>
        Promise.all([
          Promise.resolve(savedReport),
          Promise.resolve(guidance),
          fetchJson(`/weather?lat=${savedReport.latitude}&lng=${savedReport.longitude}`),
        ]),
      )
      .then(([savedReport, guidance, weather]) => {
        setIpm(guidance);
        setReport({ ...savedReport, weather });
      })
      .catch((err) => onError(err.message));
  }, [report.id]);
  const submitFollowUp = async () => {
    try {
      const updated = await fetchJson(`/reports/${report.id}/follow-up`, {
        method: "POST",
        body: JSON.stringify({ note }),
      });
      setReport(updated);
      setNote("");
    } catch (err) {
      onError(err.message);
    }
  };
  const requestReview = async () => {
    try {
      await fetchJson(`/reports/${report.id}/expert-review`, {
        method: "POST",
      });
      setReport({ ...report, status: "expert_review" });
    } catch (err) {
      onError(err.message);
    }
  };
  return (
    <div className="content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">CROP HEALTH REPORT</p>
          <h1>{report.crop} health check</h1>
          <p className="muted">
            {new Date(report.createdAt).toLocaleString()} ·{" "}
            {report.prediction.model_type?.includes("DEMO")
              ? "Development AI model"
              : "AI model"}
          </p>
        </div>
        <RiskBadge level={report.risk.level} />
      </div>
      {report.status === "expert_review" && (
        <div className="review-banner">
          <ShieldCheck size={19} />
          <div><strong>Expert validation recommended</strong><span>AI confidence is below the review threshold. A qualified expert should confirm this possible problem.</span></div>
        </div>
      )}
      <div className="detail-grid">
        <div className="panel result-hero">
          <img src={report.imageUrl} alt={`${report.crop} crop`} />
          <div>
            <p className="eyebrow">POSSIBLE PROBLEM</p>
            <h2>{report.prediction.prediction}</h2>
            <div className="confidence">
              <span>AI confidence</span>
              <strong>{Math.round(report.prediction.confidence * 100)}%</strong>
              <div>
                <i
                  style={{ width: `${report.prediction.confidence * 100}%` }}
                />
              </div>
            </div>
            {report.prediction.top_predictions?.length > 1 && (
              <p className="alternate-signals">
                Other possible signal: <strong>{report.prediction.top_predictions[1].label}</strong> ({Math.round(report.prediction.top_predictions[1].confidence * 100)}%)
              </p>
            )}
            <p className="demo-note">
              POSSIBLE PROBLEM · AI can make mistakes. This is an assistive
              signal, not a final diagnosis.
            </p>
            <p className="stage-note"><strong>Farmer-selected stage:</strong> {report.stage}</p>
            {report.prediction.visual_signals && (
              <div className="visual-signals">
                <span>Leaf area {signalPercent(visualSignals.leaf_area)}%</span>
                <span>Brown/orange {signalPercent(visualSignals.brown_orange)}%</span>
                <span>Yellowing {signalPercent(visualSignals.yellowing)}%</span>
              </div>
            )}
          </div>
        </div>
        <div className="panel">
          <p className="eyebrow">RISK ASSESSMENT</p>
          <h2>Risk level: <RiskBadge level={report.risk.level} /></h2>
          <p className="risk-question">Why is the risk {report.risk.level.toLowerCase()}?</p>
          <ul className="reason-list">
            {report.risk.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
          <div className="weather">
            <div>
              <CloudRain size={18} />
              <span>Weather</span>
            </div>
            {report.weather.available ? (
              <strong>
                {report.weather.temperature}°C · {report.weather.humidity}%
                humidity
              </strong>
            ) : (
              <strong>Weather unavailable</strong>
            )}
            {report.weather.available && report.weather.forecast?.length > 0 && (
              <div className="weather-forecast">
                {report.weather.forecast.map((item) => (
                  <span key={item.time}>
                    {new Date(item.time).getHours()}:00 · {item.temperature}°C
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="detail-grid">
        <div className="panel">
          <p className="eyebrow">IPM ADVISORY</p>
          <h2>{ipm?.problem || report.prediction.prediction}</h2>
          {ipm ? (
            <div className="ipm-guidance">
              <p><strong>Symptoms:</strong> {ipm.symptoms}</p>
              <p><strong>Monitor:</strong> {ipm.monitoring}</p>
              <p><strong>Cultural:</strong> {ipm.culturalControl}</p>
              <p><strong>Biological:</strong> {ipm.biologicalControl}</p>
              <p><strong>Mechanical:</strong> {ipm.mechanicalControl}</p>
              <p><strong>Chemical:</strong> {ipm.chemicalControl}</p>
              <small>Source: <a href={ipm.sourceUrl} target="_blank" rel="noreferrer">{ipm.source}</a> · Verified {ipm.lastVerified}</small>
            </div>
          ) : <p className="muted">Loading structured advisory...</p>}
          <div className="recommended-action">
            <p className="eyebrow">RECOMMENDED ACTION</p>
            <strong>{ipm ? "Use verified IPM guidance" : "Wait for advisory guidance"}</strong>
          </div>
          <div className="advisory-pills">
            <span>Monitor regularly</span>
            <span>Improve airflow</span>
            <span>Ask an expert before chemicals</span>
          </div>
          <button className="outline" onClick={requestReview}>
            <ShieldCheck size={17} />{" "}
            {report.status === "expert_review"
              ? "Expert review requested"
              : "Request expert review"}
          </button>
          <div className="expert-status">
            <p className="eyebrow">EXPERT VALIDATION</p>
            <strong className={report.status === "validated" ? "validated" : "pending"}>
              {report.status === "validated" ? "● Validated" : "● Pending review"}
            </strong>
          </div>
        </div>
        <div className="panel">
          <p className="eyebrow">FOLLOW-UP</p>
          <h2>How is the crop now?</h2>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add an observation for your next check..."
          />
          <button className="primary" disabled={!note} onClick={submitFollowUp}>
            Save follow-up <CheckCircle2 size={17} />
          </button>
          {report.followUp && (
            <p className="saved-note">Saved: {report.followUp.note}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ExpertView({ onError }) {
  const [cases, setCases] = useState([]);
  const [active, setActive] = useState(null);
  const load = async () => {
    try {
      setCases(await fetchJson("/expert/cases"));
    } catch (err) {
      onError(err.message);
    }
  };
  useEffect(() => {
    load();
  }, []);
  if (active)
    return (
      <div className="content">
        <button className="text-button" onClick={() => setActive(null)}>
          ← Back to queue
        </button>
        <div className="page-heading">
          <div>
            <p className="eyebrow">CASE REVIEW</p>
            <h1>
              {active.report.crop} · {active.report.prediction.prediction}
            </h1>
            <p className="muted">
              {active.report.stage} stage · {active.report.latitude.toFixed(3)},{" "}
              {active.report.longitude.toFixed(3)}
            </p>
          </div>
          <RiskBadge level={active.report.risk.level} />
        </div>
        <div className="detail-grid">
          <div className="panel result-hero">
            <img src={active.report.imageUrl} alt="Farmer crop submission" />
            <div>
              <p className="eyebrow">AI SIGNAL</p>
              <h2>{active.report.prediction.prediction}</h2>
              <p className="muted">
                Confidence:{" "}
                {Math.round(active.report.prediction.confidence * 100)}% ·{" "}
                {active.report.prediction.model_type}
              </p>
            </div>
          </div>
          <ValidationForm
            caseItem={active}
            onDone={() => {
              setActive(null);
              load();
            }}
            onError={onError}
          />
        </div>
      </div>
    );
  return (
    <div className="content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">EXPERT WORKSPACE</p>
          <h1>Cases needing your eye.</h1>
          <p className="muted">
            Review lower-confidence signals and give farmers a validated answer.
          </p>
        </div>
      </div>
      <div className="stats-grid">
        <Stat
          label="Pending cases"
          value={cases.length}
          icon={ShieldCheck}
          alert
        />
        <Stat label="Model signals" value="Assistive" icon={Activity} />
      </div>
      <div className="panel case-list">
        {cases.length ? (
          cases.map((item) => (
            <button
              className="case-row"
              key={item.id}
              onClick={() => setActive(item)}
            >
              <span
                className="report-thumb"
                style={{ backgroundImage: `url(${item.report.imageUrl})` }}
              />
              <span>
                <strong>
                  {item.report.crop} · {item.report.prediction.prediction}
                </strong>
                <small>
                  {Math.round(item.report.prediction.confidence * 100)}%
                  confidence · {item.report.risk.level} risk
                </small>
              </span>
              <ArrowRight size={17} />
            </button>
          ))
        ) : (
          <Empty onClick={load} />
        )}
      </div>
    </div>
  );
}
function ValidationForm({ caseItem, onDone, onError }) {
  const [prediction, setPrediction] = useState(
    caseItem.report.prediction.prediction,
  );
  const [remarks, setRemarks] = useState("");
  const options = caseItem.report.crop === "Tomato"
    ? ["Healthy", "Early Blight", "Leaf Mold", "Septoria Leaf Spot", "Bacterial Spot", "Fusarium Wilt"]
    : caseItem.report.crop === "Wheat"
      ? ["Healthy", "Leaf Rust", "Stripe Rust", "Powdery Mildew", "Septoria Blotch"]
      : ["Healthy", "Anthracnose", "Powdery Mildew", "Bacterial Leaf Spot", "Bacterial Wilt"];
  const submit = async (e) => {
    e.preventDefault();
    try {
      await fetchJson(`/expert/cases/${caseItem.id}/validate`, {
        method: "PUT",
        body: JSON.stringify({ prediction, remarks }),
      });
      onDone();
    } catch (err) {
      onError(err.message);
    }
  };
  return (
    <form className="panel validation" onSubmit={submit}>
      <p className="eyebrow">EXPERT VALIDATION</p>
      <h2>What do you see?</h2>
      <label>
        Validated problem
        <select
          value={prediction}
          onChange={(e) => setPrediction(e.target.value)}
        >
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
      </label>
      <label>
        Remarks
        <textarea
          required
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Explain the field signal in simple terms..."
        />
      </label>
      <button className="primary full">
        Mark validated <CheckCircle2 size={17} />
      </button>
    </form>
  );
}

function OfficerView({ page, onError }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetchJson("/dashboard/officer")
      .then(setData)
      .catch((err) => onError(err.message));
  }, []);
  if (!data)
    return (
      <div className="content">
        <div className="loading">Loading command center...</div>
      </div>
    );
  return (
    <div className="content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">OFFICER COMMAND CENTER</p>
          <h1>See the bigger picture.</h1>
          <p className="muted">
            Aggregated signals from farmer reports. Potential hotspots are not
            automatic government action.
          </p>
        </div>
      </div>
      <div className="stats-grid">
        <Stat label="Total reports" value={data.totalReports} icon={Activity} />
        <Stat
          label="High-risk reports"
          value={data.highRisk}
          icon={CloudRain}
          alert
        />
        <Stat
          label="Potential hotspots"
          value={data.hotspots.length}
          icon={MapPin}
        />
      </div>
      <div className="section-row">
        <div className="panel wide">
          <div className="panel-head">
            <div>
              <p className="eyebrow">REPORT DISTRIBUTION</p>
              <h2>Problems observed</h2>
            </div>
          </div>
          {Object.entries(data.problemCounts).map(([problem, count]) => (
            <div className="bar-row" key={problem}>
              <span>{problem}</span>
              <div>
                <i
                  style={{
                    width: `${Math.max(12, (count / Math.max(data.totalReports, 1)) * 100)}%`,
                  }}
                />
              </div>
              <strong>{count}</strong>
            </div>
          ))}
        </div>
        <div className="panel">
          <p className="eyebrow">RECENT REPORTS</p>
          {data.recentReports.slice(0, 5).map((report) => (
            <div className="mini-report" key={report.id}>
              <span className={`dot dot-${report.risk.level.toLowerCase()}`} />
              <span>
                {report.crop} · {report.prediction.prediction}
                <small>{report.risk.level} risk</small>
              </span>
            </div>
          ))}
        </div>
      </div>
      {page === "map" && (
        <div className="panel map-panel">
          <p className="eyebrow">LOCATION VIEW</p>
          <h2>Potential hotspots</h2>
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {data.hotspots.map((point, index) => (
              <Marker key={index} position={[point.latitude, point.longitude]}>
                <Popup>
                  {point.crop} · {point.risk} risk
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
}

export default App;
