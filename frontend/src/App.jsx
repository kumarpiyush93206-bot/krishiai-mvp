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

const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const DEMO_ACCOUNTS = {
  farmer: ["farmer@demo.krishiai", "Demo@123"],
  expert: ["expert@demo.krishiai", "Demo@123"],
  officer: ["officer@demo.krishiai", "Demo@123"],
};
const LANG = {
  en: {
    welcomeBack: "WELCOME BACK",
    joinField: "JOIN THE FIELD NETWORK",
    farmHeading: "Your field, at a glance.",
    startMonitoring: "Start monitoring smarter.",
    signInPrompt: "Sign in to continue your crop health journey.",
    createPrompt: "Create a farmer account to get clear, practical crop guidance.",
    fullName: "Full name",
    email: "Email address",
    password: "Password",
    demoAccess: "Demo access",
    signIn: "Sign in",
    createAccount: "Create account",
    newToKrishi: "New to KrishiAI? Create account",
    alreadyHave: "Already have an account? Sign in",
    farmerOverview: "FARMER OVERVIEW",
    goodMorning: "Good morning, farmer.",
    fieldSummary: "A clear view of what your fields are telling you today.",
    checkCrop: "Check a crop",
    fieldSignal: "FIELD SIGNAL",
    fieldsReady: "Your fields are ready",
    addFirstField: "Add your first field and upload a crop image to start.",
    supportedCrops: "SUPPORTED CROPS",
    startWithWhatYouGrow: "Start with what you grow.",
    cropAdvice: "Our first release focuses on three crops so advice stays relevant and useful.",
    viewAll: "View all",
    openFullReport: "Open full report",
    latestFieldCheck: "LATEST FIELD CHECK",
    cropHealthSnapshot: "health snapshot",
    aiResult: "AI result",
    confidence: "Confidence",
    weather: "Weather",
    riskLevel: "Risk level",
    ipmAdvisory: "IPM advisory",
    expertValidation: "Expert validation",
    recentActivity: "RECENT ACTIVITY",
    cropHealthChecks: "Crop health checks",
    newCropCheck: "NEW CROP CHECK",
    readYourField: "Let's read your field.",
    uploadPrompt: "Upload one clear image. We will combine it with crop stage, weather, and nearby signals.",
    fieldDetails: "FIELD DETAILS",
    whereCropGrows: "Where is this crop growing?",
    fieldName: "Field name",
    crop: "Crop",
    sowingDate: "Sowing date",
    cropStage: "Crop stage",
    location: "Location",
    locateMe: "Locate me",
    submit: "Check crop health",
    review: "REVIEW",
    recordSummary: "Record summary",
    save: "Save",
    clear: "Clear",
    weatherUnavailable: "Weather unavailable",
    riskLabel: "Risk",
    actions: "Action items",
    recommendedAction: "Recommended action",
    noReports: "No crop checks yet.",
    uploadFirstImage: "Upload your first image",
    fullReport: "Full report",
    everyCheck: "Every check, in one place.",
    trackFields: "Track how your fields change over time.",
    cropHealthReport: "CROP HEALTH REPORT",
    aiConfidence: "AI confidence",
    possibleProblem: "POSSIBLE PROBLEM",
    expertValidationRecommended: "Expert validation recommended",
    expertReviewHint: "AI confidence is below the review threshold. A qualified expert should confirm this possible problem.",
    riskAssessment: "RISK ASSESSMENT",
    whyRisk: "Why is the risk",
    weatherLabel: "Weather",
    ipmGuidance: "IPM ADVISORY",
    loadingGuidance: "Loading structured advisory...",
    followUp: "FOLLOW-UP",
    howCropNow: "How is the crop now?",
    saveFollowUp: "Save follow-up",
    savedNote: "Saved:",
    byStage: "Farmer-selected stage:",
    otherSignal: "Other possible signal:",
    checkSignals: "Checking field signals...",
    useGps: "Use my GPS",
    chooseCropImage: "Choose a clear crop image",
    demoNote: "The current AI result is clearly labelled as a development model. It is an interface-ready adapter for a trained model.",
    askExpertBeforeChemicals: "Ask an expert before chemicals",
    useVerifiedIpm: "Use verified IPM guidance",
    waitAdvisory: "Wait for advisory guidance",
    requestExpertReview: "Request expert review",
    expertReviewRequested: "Expert review requested",
    fieldSignalText: "Field intelligence for the farmers who feed India. Simple, timely, grounded in agricultural science.",
    smartIndia: "SMART INDIA HACKATHON 2026",
    knowCrop: "Know your crop.",
    growConfidence: "Grow with confidence.",
    supportedCropsCount: "3 crops supported",
    fieldSignalsAllDay: "24/7 field signals",
    useMyGpsCaps: "Use my GPS",
    verified: "verified",
    demo: "demo account",
    commandCenter: "OFFICER COMMAND CENTER",
    seeBiggerPicture: "See the bigger picture.",
    officerMsg: "Aggregated signals from farmer reports. Potential hotspots are not automatic government action.",
    totalReports: "Total reports",
    highRiskReports: "High-risk reports",
    potentialHotspots: "Potential hotspots",
    reportDistribution: "REPORT DISTRIBUTION",
    problemsObserved: "Problems observed",
    recentReports: "RECENT REPORTS",
    locationView: "LOCATION VIEW",
    hotspots: "Potential hotspots",
    expertWorkspace: "EXPERT WORKSPACE",
    casesNeedingEye: "Cases needing your eye.",
    reviewLowerConfidence: "Review lower-confidence signals and give farmers a validated answer.",
    pendingCases: "Pending cases",
    modelSignals: "Model signals",
    assistive: "Assistive",
    backToQueue: "Back to queue",
    caseReview: "CASE REVIEW",
    whatDoYouSee: "What do you see?",
    validatedProblem: "Validated problem",
    remarks: "Remarks",
    markValidated: "Mark validated",
    fieldsMonitored: "Fields monitored",
    cropChecks: "Crop checks",
    highRiskAlerts: "High-risk alerts",
    noChecksYet: "No crop checks yet.",
    uploadImage: "Upload your first image",
    recentActivityLabel: "RECENT ACTIVITY",
    startWithWhatGrow: "Start with what you grow.",
    aiAssessment: "AI assessment",
    developmentModel: "Development model",
    expertValidated: "Expert validated",
    reviewRecommended: "Review recommended",
    reviewPending: "Pending review",
    validated: "Validated",
    pending: "Pending",
  },
  hi: {
    welcomeBack: "आपका फिर से स्वागत है",
    joinField: "फ़ील्ड नेटवर्क में शामिल हों",
    farmHeading: "आपका खेत, एक नज़र में।",
    startMonitoring: "अधिक स्मार्ट तरीके से निगरानी शुरू करें।",
    signInPrompt: "अपने फसल स्वास्थ्य पथ पर जारी रहने के लिए साइन इन करें।",
    createPrompt: "स्पष्ट और व्यावहारिक फसल मार्गदर्शन पाने के लिए किसान अकाउंट बनाएं।",
    fullName: "पूरा नाम",
    email: "ईमेल पता",
    password: "पासवर्ड",
    demoAccess: "डेमो एक्सेस",
    signIn: "साइन इन",
    createAccount: "अकाउंट बनाएं",
    newToKrishi: "KrishiAI से नए हैं? अकाउंट बनाएं",
    alreadyHave: "अकाउंट पहले से है? साइन इन",
    farmerOverview: "किसान अवलोकन",
    goodMorning: "शुभ प्रभात, किसान।",
    fieldSummary: "आज आपके खेत आपको क्या बता रहे हैं, यह साफ़ दृश्य।",
    checkCrop: "फसल जांचें",
    fieldSignal: "फ़ील्ड सिग्नल",
    fieldsReady: "आपके खेत तैयार हैं",
    addFirstField: "पहला खेत जोड़ें और फसल की तस्वीर अपलोड करें।",
    supportedCrops: "सामर्थ्यपूर्ण फसलें",
    startWithWhatYouGrow: "आपकी फसल से शुरू करें।",
    cropAdvice: "हमारा पहला रिलीज़ केवल तीन फसलों पर केंद्रित है ताकि सलाह प्रासंगिक और उपयोगी रहे।",
    viewAll: "सभी देखें",
    openFullReport: "पूर्ण रिपोर्ट खोलें",
    latestFieldCheck: "नवीनतम फील्ड चेक",
    cropHealthSnapshot: "स्वास्थ्य स्नैपशॉट",
    aiResult: "एआई परिणाम",
    confidence: "विश्वास",
    weather: "मौसम",
    riskLevel: "जोखिम स्तर",
    ipmAdvisory: "IPM सलाह",
    expertValidation: "विशेषज्ञ सत्यापन",
    recentActivity: "हाल की गतिविधि",
    cropHealthChecks: "फसल स्वास्थ्य जांच",
    newCropCheck: "नई फसल जांच",
    readYourField: "आइए आपके खेत को पढ़ें।",
    uploadPrompt: "एक स्पष्ट तस्वीर अपलोड करें। हम इसे फसल की अवस्था, मौसम और पास के संकेतों के साथ संयोजित करेंगे।",
    fieldDetails: "फ़ील्ड विवरण",
    whereCropGrows: "यह फसल कहाँ उग रही है?",
    fieldName: "फ़ील्ड नाम",
    crop: "फसल",
    sowingDate: "बुवाई की तिथि",
    cropStage: "फसल अवस्था",
    location: "स्थान",
    locateMe: "मुझे ढूंढें",
    submit: "फसल स्वास्थ्य जांचें",
    review: "समीक्षा",
    recordSummary: "रिकॉर्ड सारांश",
    save: "सेव करें",
    clear: "साफ़ करें",
    weatherUnavailable: "मौसम उपलब्ध नहीं",
    riskLabel: "जोखिम",
    actions: "कार्रवाई आइटम",
    recommendedAction: "सिफारिश की गई कार्रवाई",
    noReports: "अभी तक कोई फसल जांच नहीं है।",
    uploadFirstImage: "पहली तस्वीर अपलोड करें",
    fullReport: "पूर्ण रिपोर्ट",
    everyCheck: "हर जांच एक ही जगह।",
    trackFields: "ट्रैक करें कि आपके खेत समय के साथ कैसे बदलते हैं।",
    cropHealthReport: "फसल स्वास्थ्य रिपोर्ट",
    aiConfidence: "एआई विश्वास",
    possibleProblem: "संभव समस्या",
    expertValidationRecommended: "विशेषज्ञ सत्यापन की सिफारिश",
    expertReviewHint: "एआई विश्वास समीक्षा सीमा से नीचे है। एक योग्य विशेषज्ञ को यह संभावित समस्या सत्यापित करनी चाहिए।",
    riskAssessment: "जोखिम मूल्यांकन",
    whyRisk: "जोखिम क्यों",
    weatherLabel: "मौसम",
    ipmGuidance: "IPM सलाह",
    loadingGuidance: "संरचित सलाह लोड हो रही है...",
    followUp: "फॉलो-अप",
    howCropNow: "फसल अब कैसी है?",
    saveFollowUp: "फॉलो-अप सेव करें",
    savedNote: "सेव किया गया:",
    byStage: "किसान द्वारा चुनी गई अवस्था:",
    otherSignal: "अन्य संभावित संकेत:",
    checkSignals: "फ़ील्ड संकेत जाँच रहे हैं...",
    useGps: "मेरा जीपीएस उपयोग करें",
    chooseCropImage: "स्पष्ट फसल फोटो चुनें",
    demoNote: "वर्तमान एआई परिणाम को स्पष्ट रूप से विकास मॉडल के रूप में लेबल किया गया है। यह प्रशिक्षित मॉडल के लिए इंटरफ़ेस तैयार एडाप्टर है।",
    askExpertBeforeChemicals: "रसायनों से पहले विशेषज्ञ से सलाह लें",
    useVerifiedIpm: "सत्यापित IPM मार्गदर्शन लागू करें",
    waitAdvisory: "सलाह का इंतजार करें",
    requestExpertReview: "विशेषज्ञ समीक्षा का अनुरोध करें",
    expertReviewRequested: "विशेषज्ञ समीक्षा अनुरोधित",
    fieldSignalText: "भारत की फ़सलें खिलाने वाले किसानों के लिए फ़ील्ड इंटेलिजेंस। सरल, समय पर, कृषि विज्ञान पर आधारित।",
    smartIndia: "स्मार्ट इंडिया हैकाथॉन 2026",
    knowCrop: "अपना फसल जानें।",
    growConfidence: "आत्मविश्वास से बढ़ें।",
    supportedCropsCount: "3 फसलें समर्थित",
    fieldSignalsAllDay: "24/7 फ़ील्ड संकेत",
    useMyGpsCaps: "मेरा जीपीएस उपयोग करें",
    verified: "सत्यापित",
    demo: "डेमो अकाउंट",
    commandCenter: "अधिकारी कमांड सेंटर",
    seeBiggerPicture: "बड़ी तस्वीर देखें।",
    officerMsg: "किसानों की रिपोर्टों से एकत्रित संकेत। संभावित हॉटस्पॉट स्वचालित सरकारी कार्रवाई नहीं हैं।",
    totalReports: "कुल रिपोर्टें",
    highRiskReports: "उच्च जोखिम रिपोर्टें",
    potentialHotspots: "संभावित हॉटस्पॉट",
    reportDistribution: "रिपोर्ट वितरण",
    problemsObserved: "देखी गई समस्याएँ",
    recentReports: "हाल की रिपोर्टें",
    locationView: "स्थान दृश्य",
    hotspots: "संभावित हॉटस्पॉट",
    expertWorkspace: "विशेषज्ञ कार्यक्षेत्र",
    casesNeedingEye: "ऐसे मामले जिनमें आपकी आँख की ज़रूरत है।",
    reviewLowerConfidence: "कम भरोसे वाले संकेतों की समीक्षा करें और किसानों को सत्यापित उत्तर दें।",
    pendingCases: "लंबित मामले",
    modelSignals: "मॉडल संकेत",
    assistive: "सहायक",
    backToQueue: "कतार पर वापस",
    caseReview: "मामला समीक्षा",
    whatDoYouSee: "आप क्या देखते हैं?",
    validatedProblem: "सत्यापित समस्या",
    remarks: "टिप्पणियाँ",
    markValidated: "सत्यापित करें",
    fieldsMonitored: "पर्यवेक्षित खेत",
    cropChecks: "फसल जांचें",
    highRiskAlerts: "उच्च जोखिम अलर्ट",
    noChecksYet: "अभी तक कोई फसल जांच नहीं है।",
    uploadImage: "पहली तस्वीर अपलोड करें",
    recentActivityLabel: "हाल की गतिविधि",
    startWithWhatGrow: "आपकी फसल से शुरू करें।",
    aiAssessment: "एआई मूल्यांकन",
    developmentModel: "विकास मॉडल",
    expertValidated: "विशेषज्ञ सत्यापित",
    reviewRecommended: "समीक्षा की सिफारिश",
    reviewPending: "लंबित समीक्षा",
    validated: "सत्यापित",
    pending: "लंबित",
  },
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
  const copy = LANG[language] || LANG.en;
  if (!user) return <Auth onLogin={login} onError={setError} error={error} language={language} />;
  return (
    <div className="app-shell">
      <Sidebar user={user} page={page} setPage={setPage} logout={logout} language={language} />
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
          <FarmerView page={page} setPage={setPage} onError={setError} language={language} />
        )}
        {user.role === "expert" && (
          <ExpertView page={page} onError={setError} language={language} />
        )}
        {user.role === "officer" && (
          <OfficerView page={page} onError={setError} language={language} />
        )}
      </main>
    </div>
  );
}

function Auth({ onLogin, onError, error, language }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const copy = LANG[language] || LANG.en;
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
          <p className="eyebrow">{language === "hi" ? copy.smartIndia : "SMART INDIA HACKATHON 2026"}</p>
          <h1>
            {language === "hi" ? copy.knowCrop : "Know your crop."}
            <br />
            <em>{language === "hi" ? copy.growConfidence : "Grow with confidence."}</em>
          </h1>
          <p>
            {language === "hi" ? copy.fieldSignalText : "Field intelligence for the farmers who feed India. Simple, timely, grounded in agricultural science."}
          </p>
        </div>
        <div className="aside-stats">
          <span>
            <strong>3</strong> {language === "hi" ? copy.supportedCropsCount : "crops supported"}
          </span>
          <span>
            <strong>24/7</strong> {language === "hi" ? copy.fieldSignalsAllDay : "field signals"}
          </span>
        </div>
      </div>
      <div className="auth-card">
        <div className="auth-mobile-brand">
          <Leaf size={24} /> KrishiAI
        </div>
        <p className="eyebrow">
          {mode === "login" ? copy.welcomeBack : copy.joinField}
        </p>
        <h2>
          {mode === "login" ? copy.farmHeading : copy.startMonitoring}
        </h2>
        <p className="muted">
          {mode === "login" ? copy.signInPrompt : copy.createPrompt}
        </p>
        <form onSubmit={submit}>
          {mode === "register" && (
            <label>
              {copy.fullName}
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
              />
            </label>
          )}
          <label>
            {copy.email}
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </label>
          <label>
            {copy.password}
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
            {mode === "login" ? copy.signIn : copy.createAccount}{" "}
            <ArrowRight size={18} />
          </button>
        </form>
        <div className="demo-logins">
          <span>{copy.demoAccess}</span>
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
          {mode === "login" ? copy.newToKrishi : copy.alreadyHave}
        </button>
      </div>
    </div>
  );
}

function Sidebar({ user, page, setPage, logout, language }) {
  const isHindi = language === "hi";
  const items =
    user.role === "farmer"
      ? [
          ["dashboard", isHindi ? "अवलोकन" : "Overview", Activity],
          ["report", isHindi ? "नई फसल जांच" : "New crop check", Upload],
          ["history", isHindi ? "रिपोर्ट इतिहास" : "Report history", Leaf],
        ]
      : user.role === "expert"
        ? [["dashboard", isHindi ? "विशेषज्ञ कतार" : "Expert queue", ShieldCheck]]
        : [
            ["dashboard", isHindi ? "कमांड सेंटर" : "Command center", Activity],
            ["map", isHindi ? "जोखिम मानचित्र" : "Risk map", MapPin],
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
            {user.role} · {user.isDemo ? (isHindi ? "डेमो अकाउंट" : "demo account") : (isHindi ? "सत्यापित" : "verified")}
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
            {isHindi ? "एआई-सहायता" : "AI-assisted"}
            <br />
            <b>{isHindi ? "विशेषज्ञ-तैयार" : "Expert-ready"}</b>
          </span>
        </div>
        <button className="logout" onClick={logout}>
          <LogOut size={17} /> {isHindi ? "साइन आउट" : "Sign out"}
        </button>
      </div>
    </aside>
  );
}

function FarmerView({ page, setPage, onError, language }) {
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
        language={language}
      />
    );
  if (page === "history")
    return (
      <History reports={reports} setSelected={setSelected} setPage={setPage} language={language} />
    );
  if (page === "advisory" && selected)
    return <ReportDetail report={selected} onError={onError} language={language} />;
  return (
    <FarmerDashboard
      reports={reports}
      fields={fields}
      setPage={setPage}
      setSelected={setSelected}
      language={language}
    />
  );
}
function FarmerDashboard({ reports, fields, setPage, setSelected, language }) {
  const latest = reports[0];
  const copy = LANG[language] || LANG.en;
  return (
    <div className="content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{copy.farmerOverview}</p>
          <h1>{copy.goodMorning}</h1>
          <p className="muted">{copy.fieldSummary}</p>
        </div>
        <button className="primary" onClick={() => setPage("report")}>
          <Upload size={18} /> {copy.checkCrop}
        </button>
      </div>
      <section className="signal-banner">
        <div className="sun-disc">
          <Sun size={25} />
        </div>
        <div>
          <p className="eyebrow">{copy.fieldSignal}</p>
          <h3>
            {latest
              ? `${latest.crop} check is ${latest.risk.level.toLowerCase()} risk`
              : copy.fieldsReady}
          </h3>
          <p>
            {latest ? latest.risk.reasons[0] : copy.addFirstField}
          </p>
        </div>
        <ArrowRight size={20} />
      </section>
      <div className="stats-grid">
        <Stat label={language === "hi" ? "पर्यवेक्षित खेत" : "Fields monitored"} value={fields.length} icon={MapPin} />
        <Stat label={language === "hi" ? "फसल जांचें" : "Crop checks"} value={reports.length} icon={Activity} />
        <Stat
          label={language === "hi" ? "उच्च जोखिम अलर्ट" : "High-risk alerts"}
          value={reports.filter((r) => r.risk.level === "HIGH").length}
          icon={CloudRain}
          alert
        />
      </div>
      {latest && (
        <section className="insight-section">
          <div className="section-intro">
            <div>
              <p className="eyebrow">{language === "hi" ? "नवीनतम फील्ड चेक" : "LATEST FIELD CHECK"}</p>
              <h2>{latest.crop} {language === "hi" ? "स्वास्थ्य स्नैपशॉट" : "health snapshot"}</h2>
            </div>
            <button
              className="text-button"
              onClick={() => {
                setSelected(latest);
                setPage("advisory");
              }}
            >
              {language === "hi" ? "पूर्ण रिपोर्ट खोलें" : "Open full report"} <ArrowRight size={15} />
            </button>
          </div>
          <div className="insight-grid">
            <InsightCard
              icon={Activity}
              label={language === "hi" ? "एआई परिणाम" : "AI result"}
              value={latest.prediction.prediction}
              detail={latest.prediction.model_type?.includes("DEMO") ? (language === "hi" ? "DEMO मॉडल संकेत" : "DEMO model signal") : (language === "hi" ? "एआई मॉडल संकेत" : "AI model signal") }
              onClick={() => {
                setSelected(latest);
                setPage("advisory");
              }}
            />
            <InsightCard
              icon={Activity}
              label={language === "hi" ? "विश्वास" : "Confidence"}
              value={`${Math.round(latest.prediction.confidence * 100)}%`}
              detail={language === "hi" ? "एआई कितने निश्चित है" : "How certain the AI is"}
              tone="lime"
            />
            <InsightCard
              icon={Sun}
              label={language === "hi" ? "मौसम" : "Weather"}
              value={latest.weather?.available ? `${latest.weather.temperature}°C` : (language === "hi" ? "उपलब्ध नहीं" : "Unavailable")}
              detail={latest.weather?.available ? `${latest.weather.humidity}% आर्द्रता` : (language === "hi" ? "रिपोर्ट विवरण देखें" : "Check report details")}
              tone="sky"
            />
            <InsightCard
              icon={CloudRain}
              label={language === "hi" ? "जोखिम स्तर" : "Risk level"}
              value={latest.risk.level}
              detail={latest.risk.reasons[0]}
              tone={latest.risk.level === "HIGH" ? "red" : "amber"}
            />
            <InsightCard
              icon={Leaf}
              label={language === "hi" ? "IPM सलाह" : "IPM advisory"}
              value={language === "hi" ? "तैयार" : "Ready"}
              detail={language === "hi" ? "व्यावहारिक फसल-संरक्षण मार्गदर्शन" : "Practical crop-care guidance"}
              tone="green"
              onClick={() => {
                setSelected(latest);
                setPage("advisory");
              }}
            />
            <InsightCard
              icon={ShieldCheck}
              label={language === "hi" ? "विशेषज्ञ सत्यापन" : "Expert validation"}
              value={latest.status === "validated" ? (language === "hi" ? "सत्यापित" : "Validated") : (language === "hi" ? "लंबित" : "Pending")}
              detail={latest.status === "validated" ? (language === "hi" ? "विशेषज्ञ द्वारा समीक्षा की गई" : "Reviewed by an expert") : (language === "hi" ? "समीक्षा की सिफारिश" : "Review recommended")}
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
              <p className="eyebrow">{language === "hi" ? "हाल की गतिविधि" : "RECENT ACTIVITY"}</p>
              <h2>{language === "hi" ? "फसल स्वास्थ्य जांच" : "Crop health checks"}</h2>
            </div>
            <button className="text-button" onClick={() => setPage("history")}>
              {language === "hi" ? "सभी देखें" : "View all"} <ArrowRight size={15} />
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
            <Empty onClick={() => setPage("report")} language={language} />
          )}
        </div>
        <div className="panel">
          <p className="eyebrow">{language === "hi" ? "सामर्थ्यपूर्ण फसलें" : "SUPPORTED CROPS"}</p>
          <h2>{language === "hi" ? "आपकी फसल से शुरू करें।" : "Start with what you grow."}</h2>
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
            {language === "hi" ? "हमारा पहला रिलीज़ केवल तीन फसलों पर केंद्रित है ताकि सलाह प्रासंगिक और उपयोगी रहे।" : "Our first release focuses on three crops so advice stays relevant and useful."}
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
function Empty({ onClick, language }) {
  return (
    <div className="empty">
      <Leaf size={30} />
      <p>{language === "hi" ? "अभी तक कोई फसल जांच नहीं है।" : "No crop checks yet."}</p>
      <button className="text-button" onClick={onClick}>
        {language === "hi" ? "पहली तस्वीर अपलोड करें" : "Upload your first image"} <ArrowRight size={15} />
      </button>
    </div>
  );
}

function ReportForm({ fields, onDone, onError, language }) {
  const t = LANG[language] || LANG.en;
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
          language === "hi" ? "स्थान की अनुमति नहीं दी गई। डिफ़ॉल्ट स्थान का उपयोग किया जा रहा है।" : "Location permission was not granted. Using the default location.",
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
          <p className="eyebrow">{language === "hi" ? "नई फसल जांच" : "NEW CROP CHECK"}</p>
          <h1>{language === "hi" ? "आइए आपके खेत को पढ़ें।" : "Let's read your field."}</h1>
          <p className="muted">
            {language === "hi" ? "एक स्पष्ट तस्वीर अपलोड करें। हम इसे फसल की अवस्था, मौसम और पास के संकेतों के साथ संयोजित करेंगे।" : "Upload one clear image. We will combine it with crop stage, weather, and nearby signals."}
          </p>
        </div>
      </div>
      <form className="workflow" onSubmit={submit}>
        <section className="panel step">
          <div className="step-number">01</div>
          <div className="step-body">
            <p className="eyebrow">{language === "hi" ? "फ़ील्ड विवरण" : "FIELD DETAILS"}</p>
            <h2>{language === "hi" ? "यह फसल कहाँ उग रही है?" : "Where is this crop growing?"}</h2>
            <div className="form-grid">
              <label>
                {language === "hi" ? "फ़ील्ड नाम" : "Field name"}
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={existingField?.name || (language === "hi" ? "उत्तर खेत" : "North field")}
                  required={!existingField}
                />
              </label>
              <label>
                {language === "hi" ? "फसल" : "Crop"}
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
                {language === "hi" ? "बुवाई की तिथि" : "Sowing date"}
                <input
                  type="date"
                  value={form.sowingDate}
                  onChange={(e) =>
                    setForm({ ...form, sowingDate: e.target.value })
                  }
                />
              </label>
              <label>
                {language === "hi" ? "फसल अवस्था" : "Crop stage"}
                <select
                  value={form.stage}
                  onChange={(e) => setForm({ ...form, stage: e.target.value })}
                >
                  <option value="seedling">{language === "hi" ? "नर्सरी" : "Seedling"}</option>
                  <option value="vegetative">{language === "hi" ? "वनस्पति" : "Vegetative"}</option>
                  <option value="flowering">{language === "hi" ? "फूलना" : "Flowering"}</option>
                  <option value="fruiting">{language === "hi" ? "फलना" : "Fruiting"}</option>
                </select>
              </label>
            </div>
            <label className="location-input">
              {language === "hi" ? "स्थान" : "Location"}{" "}
              <button
                type="button"
                className="outline small-button"
                onClick={locate}
              >
                <LocateFixed size={15} /> {language === "hi" ? "मेरा जीपीएस उपयोग करें" : "Use my GPS"}
              </button>
              <span>
                {Number(form.latitude).toFixed(3)}, {Number(form.longitude).toFixed(3)}
              </span>
            </label>
          </div>
        </section>
        <section className="panel step">
          <div className="step-number">02</div>
          <div className="step-body">
            <p className="eyebrow">{language === "hi" ? "फसल चित्र" : "CROP IMAGE"}</p>
            <h2>{language === "hi" ? "हमें पत्तियों या फलों दिखाएँ।" : "Show us the leaves or fruit."}</h2>
            <label className="dropzone">
              {file ? (
                <>
                  <CheckCircle2 size={28} />
                  <strong>{file.name}</strong>
                  <small>
                    {(file.size / 1024 / 1024).toFixed(1)} MB · {language === "hi" ? "गुणवत्ता जांच के लिए तैयार" : "ready for quality check"}
                  </small>
                </>
              ) : (
                <>
                  <Upload size={28} />
                  <strong>{language === "hi" ? "स्पष्ट फसल फोटो चुनें" : "Choose a clear crop image"}</strong>
                  <small>{language === "hi" ? "JPG, PNG या WebP · अधिकतम 8 MB · न्यूनतम 224px" : "JPG, PNG or WebP · up to 8 MB · minimum 224px"}</small>
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
              {language === "hi" ? t.demoNote : "The current AI result is clearly labelled as a development model. It is an interface-ready adapter for a trained model."}
            </p>
          </div>
        </section>
        <button className="primary full" disabled={busy || !file}>
          {busy ? (language === "hi" ? "फ़ील्ड संकेत जाँच रहे हैं..." : "Checking field signals...") : (language === "hi" ? "फसल स्वास्थ्य जांचें" : "Run crop health check")}{" "}
          {!busy && <ArrowRight size={18} />}
        </button>
      </form>
    </div>
  );
}

function History({ reports, setSelected, setPage, language }) {
  return (
    <div className="content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{language === "hi" ? "रिपोर्ट इतिहास" : "REPORT HISTORY"}</p>
          <h1>{language === "hi" ? "हर जांच एक ही जगह।" : "Every check, in one place."}</h1>
          <p className="muted">{language === "hi" ? "समय के साथ आपके खेत कैसे बदलते हैं, इसे ट्रैक करें।" : "Track how your fields change over time."}</p>
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
          <Empty onClick={() => setPage("report")} language={language} />
        )}
      </div>
    </div>
  );
}

function ReportDetail({ report: initial, onError, language }) {
  const t = LANG[language] || LANG.en;
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
          <p className="eyebrow">{language === "hi" ? "फसल स्वास्थ्य रिपोर्ट" : "CROP HEALTH REPORT"}</p>
          <h1>{report.crop} {language === "hi" ? "स्वास्थ्य जांच" : "health check"}</h1>
          <p className="muted">
            {new Date(report.createdAt).toLocaleString()} · {report.prediction.model_type?.includes("DEMO") ? (language === "hi" ? "विकास एआई मॉडल" : "Development AI model") : (language === "hi" ? "एआई मॉडल" : "AI model")}
          </p>
        </div>
        <RiskBadge level={report.risk.level} />
      </div>
      {report.status === "expert_review" && (
        <div className="review-banner">
          <ShieldCheck size={19} />
          <div><strong>{language === "hi" ? "विशेषज्ञ सत्यापन की सिफारिश" : "Expert validation recommended"}</strong><span>{language === "hi" ? "एआई विश्वास समीक्षा सीमा से नीचे है। एक योग्य विशेषज्ञ को इस संभावित समस्या की पुष्टि करनी चाहिए।" : "AI confidence is below the review threshold. A qualified expert should confirm this possible problem."}</span></div>
        </div>
      )}
      <div className="detail-grid">
        <div className="panel result-hero">
          <img src={report.imageUrl} alt={`${report.crop} crop`} />
          <div>
            <p className="eyebrow">{language === "hi" ? "संभव समस्या" : "POSSIBLE PROBLEM"}</p>
            <h2>{report.prediction.prediction}</h2>
            <div className="confidence">
              <span>{language === "hi" ? "एआई विश्वास" : "AI confidence"}</span>
              <strong>{Math.round(report.prediction.confidence * 100)}%</strong>
              <div>
                <i
                  style={{ width: `${report.prediction.confidence * 100}%` }}
                />
              </div>
            </div>
            {report.prediction.top_predictions?.length > 1 && (
              <p className="alternate-signals">
                {language === "hi" ? "अन्य संभावित संकेत:" : "Other possible signal:"} <strong>{report.prediction.top_predictions[1].label}</strong> ({Math.round(report.prediction.top_predictions[1].confidence * 100)}%)
              </p>
            )}
            <p className="demo-note">
              {language === "hi" ? "संभव समस्या · एआई गलतियाँ कर सकता है। यह सहायक संकेत है, अंतिम निदान नहीं है।" : "POSSIBLE PROBLEM · AI can make mistakes. This is an assistive signal, not a final diagnosis."}
            </p>
            <p className="stage-note"><strong>{language === "hi" ? "किसान द्वारा चुनी गई अवस्था:" : "Farmer-selected stage:"}</strong> {report.stage}</p>
            {report.prediction.visual_signals && (
              <div className="visual-signals">
                <span>{language === "hi" ? "पत्ती क्षेत्र" : "Leaf area"} {signalPercent(visualSignals.leaf_area)}%</span>
                <span>{language === "hi" ? "भूरा/नारंगी" : "Brown/orange"} {signalPercent(visualSignals.brown_orange)}%</span>
                <span>{language === "hi" ? "पीलापन" : "Yellowing"} {signalPercent(visualSignals.yellowing)}%</span>
              </div>
            )}
          </div>
        </div>
        <div className="panel">
          <p className="eyebrow">{language === "hi" ? "जोखिम मूल्यांकन" : "RISK ASSESSMENT"}</p>
          <h2>{language === "hi" ? "जोखिम स्तर:" : "Risk level:"} <RiskBadge level={report.risk.level} /></h2>
          <p className="risk-question">{language === "hi" ? "जोखिम क्यों" : "Why is the risk"} {report.risk.level.toLowerCase()}?</p>
          <ul className="reason-list">
            {report.risk.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
          <div className="weather">
            <div>
              <CloudRain size={18} />
              <span>{language === "hi" ? "मौसम" : "Weather"}</span>
            </div>
            {report.weather.available ? (
              <strong>
                {report.weather.temperature}°C · {report.weather.humidity}%
                {language === "hi" ? " आर्द्रता" : " humidity"}
              </strong>
            ) : (
              <strong>{language === "hi" ? "मौसम उपलब्ध नहीं" : "Weather unavailable"}</strong>
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
          <p className="eyebrow">{language === "hi" ? "IPM सलाह" : "IPM ADVISORY"}</p>
          <h2>{ipm?.problem || report.prediction.prediction}</h2>
          {ipm ? (
            <div className="ipm-guidance">
              <p><strong>{language === "hi" ? "लक्षण:" : "Symptoms:"}</strong> {ipm.symptoms}</p>
              <p><strong>{language === "hi" ? "निगरानी:" : "Monitor:"}</strong> {ipm.monitoring}</p>
              <p><strong>{language === "hi" ? "सांस्कृतिक:" : "Cultural:"}</strong> {ipm.culturalControl}</p>
              <p><strong>{language === "hi" ? "जैविक:" : "Biological:"}</strong> {ipm.biologicalControl}</p>
              <p><strong>{language === "hi" ? "यांत्रिक:" : "Mechanical:"}</strong> {ipm.mechanicalControl}</p>
              <p><strong>{language === "hi" ? "रासायनिक:" : "Chemical:"}</strong> {ipm.chemicalControl}</p>
              <small>{language === "hi" ? "स्रोत:" : "Source:"} <a href={ipm.sourceUrl} target="_blank" rel="noreferrer">{ipm.source}</a> · {language === "hi" ? "सत्यापित" : "Verified"} {ipm.lastVerified}</small>
            </div>
          ) : <p className="muted">{language === "hi" ? "संरचित सलाह लोड हो रही है..." : "Loading structured advisory..."}</p>}
          <div className="recommended-action">
            <p className="eyebrow">{language === "hi" ? "सिफारिश की गई कार्रवाई" : "RECOMMENDED ACTION"}</p>
            <strong>{ipm ? (language === "hi" ? "सत्यापित IPM मार्गदर्शन का उपयोग करें" : "Use verified IPM guidance") : (language === "hi" ? "सलाह मार्गदर्शन का इंतजार करें" : "Wait for advisory guidance")}</strong>
          </div>
          <div className="advisory-pills">
            <span>{language === "hi" ? "नियमित रूप से निगरानी करें" : "Monitor regularly"}</span>
            <span>{language === "hi" ? "हवा का प्रवाह बेहतर करें" : "Improve airflow"}</span>
            <span>{language === "hi" ? "रसायनों से पहले विशेषज्ञ से सलाह लें" : "Ask an expert before chemicals"}</span>
          </div>
          <button className="outline" onClick={requestReview}>
            <ShieldCheck size={17} /> {report.status === "expert_review" ? (language === "hi" ? "विशेषज्ञ समीक्षा अनुरोधित" : "Expert review requested") : (language === "hi" ? "विशेषज्ञ समीक्षा का अनुरोध करें" : "Request expert review")}
          </button>
          <div className="expert-status">
            <p className="eyebrow">{language === "hi" ? "विशेषज्ञ सत्यापन" : "EXPERT VALIDATION"}</p>
            <strong className={report.status === "validated" ? "validated" : "pending"}>
              {report.status === "validated" ? (language === "hi" ? "● सत्यापित" : "● Validated") : (language === "hi" ? "● लंबित समीक्षा" : "● Pending review")}
            </strong>
          </div>
        </div>
        <div className="panel">
          <p className="eyebrow">{language === "hi" ? "फॉलो-अप" : "FOLLOW-UP"}</p>
          <h2>{language === "hi" ? "फसल अब कैसी है?" : "How is the crop now?"}</h2>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={language === "hi" ? "अगली जांच के लिए एक अवलोकन जोड़ें..." : "Add an observation for your next check..."}
          />
          <button className="primary" disabled={!note} onClick={submitFollowUp}>
            {language === "hi" ? "फॉलो-अप सेव करें" : "Save follow-up"} <CheckCircle2 size={17} />
          </button>
          {report.followUp && (
            <p className="saved-note">{language === "hi" ? "सेव किया गया:" : "Saved:"} {report.followUp.note}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ExpertView({ onError, language }) {
  const t = LANG[language] || LANG.en;
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
          ← {language === "hi" ? "कतार पर वापस" : "Back to queue"}
        </button>
        <div className="page-heading">
          <div>
            <p className="eyebrow">{language === "hi" ? "मामला समीक्षा" : "CASE REVIEW"}</p>
            <h1>
              {active.report.crop} · {active.report.prediction.prediction}
            </h1>
            <p className="muted">
              {active.report.stage} {language === "hi" ? "अवस्था" : "stage"} · {active.report.latitude.toFixed(3)}, {active.report.longitude.toFixed(3)}
            </p>
          </div>
          <RiskBadge level={active.report.risk.level} />
        </div>
        <div className="detail-grid">
          <div className="panel result-hero">
            <img src={active.report.imageUrl} alt="Farmer crop submission" />
            <div>
              <p className="eyebrow">{language === "hi" ? "एआई संकेत" : "AI SIGNAL"}</p>
              <h2>{active.report.prediction.prediction}</h2>
              <p className="muted">
                {language === "hi" ? "विश्वास:" : "Confidence:"} {Math.round(active.report.prediction.confidence * 100)}% · {active.report.prediction.model_type}
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
            language={language}
          />
        </div>
      </div>
    );
  return (
    <div className="content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{language === "hi" ? "विशेषज्ञ कार्यक्षेत्र" : "EXPERT WORKSPACE"}</p>
          <h1>{language === "hi" ? "ऐसे मामले जिनमें आपकी आँख की ज़रूरत है।" : "Cases needing your eye."}</h1>
          <p className="muted">
            {language === "hi" ? "कम विश्वास वाले संकेतों की समीक्षा करें और किसानों को सत्यापित उत्तर दें।" : "Review lower-confidence signals and give farmers a validated answer."}
          </p>
        </div>
      </div>
      <div className="stats-grid">
        <Stat
          label={language === "hi" ? "लंबित मामले" : "Pending cases"}
          value={cases.length}
          icon={ShieldCheck}
          alert
        />
        <Stat label={language === "hi" ? "मॉडल संकेत" : "Model signals"} value={language === "hi" ? "सहायक" : "Assistive"} icon={Activity} />
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
                  {language === "hi" ? " विश्वास · " : " confidence · "}{item.report.risk.level} {language === "hi" ? "जोखिम" : "risk"}
                </small>
              </span>
              <ArrowRight size={17} />
            </button>
          ))
        ) : (
          <Empty onClick={load} language={language} />
        )}
      </div>
    </div>
  );
}
function ValidationForm({ caseItem, onDone, onError, language }) {
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
      <p className="eyebrow">{language === "hi" ? "विशेषज्ञ सत्यापन" : "EXPERT VALIDATION"}</p>
      <h2>{language === "hi" ? "आप क्या देखते हैं?" : "What do you see?"}</h2>
      <label>
        {language === "hi" ? "सत्यापित समस्या" : "Validated problem"}
        <select
          value={prediction}
          onChange={(e) => setPrediction(e.target.value)}
        >
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
      </label>
      <label>
        {language === "hi" ? "टिप्पणियाँ" : "Remarks"}
        <textarea
          required
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder={language === "hi" ? "फ़ील्ड संकेत को सरल भाषा में समझाइए..." : "Explain the field signal in simple terms..."}
        />
      </label>
      <button className="primary full">
        {language === "hi" ? "सत्यापित करें" : "Mark validated"} <CheckCircle2 size={17} />
      </button>
    </form>
  );
}

function OfficerView({ page, onError, language }) {
  const t = LANG[language] || LANG.en;
  const [data, setData] = useState(null);
  useEffect(() => {
    fetchJson("/dashboard/officer")
      .then(setData)
      .catch((err) => onError(err.message));
  }, []);
  if (!data)
    return (
      <div className="content">
        <div className="loading">{language === "hi" ? "कमांड सेंटर लोड हो रहा है..." : "Loading command center..."}</div>
      </div>
    );
  return (
    <div className="content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{language === "hi" ? "अधिकारी कमांड सेंटर" : "OFFICER COMMAND CENTER"}</p>
          <h1>{language === "hi" ? "बड़ी तस्वीर देखें।" : "See the bigger picture."}</h1>
          <p className="muted">
            {language === "hi" ? "किसानों की रिपोर्टों से एकत्रित संकेत। संभावित हॉटस्पॉट स्वचालित सरकारी कार्रवाई नहीं हैं।" : "Aggregated signals from farmer reports. Potential hotspots are not automatic government action."}
          </p>
        </div>
      </div>
      <div className="stats-grid">
        <Stat label={language === "hi" ? "कुल रिपोर्टें" : "Total reports"} value={data.totalReports} icon={Activity} />
        <Stat
          label={language === "hi" ? "उच्च जोखिम रिपोर्टें" : "High-risk reports"}
          value={data.highRisk}
          icon={CloudRain}
          alert
        />
        <Stat
          label={language === "hi" ? "संभावित हॉटस्पॉट" : "Potential hotspots"}
          value={data.hotspots.length}
          icon={MapPin}
        />
      </div>
      <div className="section-row">
        <div className="panel wide">
          <div className="panel-head">
            <div>
              <p className="eyebrow">{language === "hi" ? "रिपोर्ट वितरण" : "REPORT DISTRIBUTION"}</p>
              <h2>{language === "hi" ? "देखी गई समस्याएँ" : "Problems observed"}</h2>
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
          <p className="eyebrow">{language === "hi" ? "हाल की रिपोर्टें" : "RECENT REPORTS"}</p>
          {data.recentReports.slice(0, 5).map((report) => (
            <div className="mini-report" key={report.id}>
              <span className={`dot dot-${report.risk.level.toLowerCase()}`} />
              <span>
                {report.crop} · {report.prediction.prediction}
                <small>{report.risk.level} {language === "hi" ? "जोखिम" : "risk"}</small>
              </span>
            </div>
          ))}
        </div>
      </div>
      {page === "map" && (
        <div className="panel map-panel">
          <p className="eyebrow">{language === "hi" ? "स्थान दृश्य" : "LOCATION VIEW"}</p>
          <h2>{language === "hi" ? "संभावित हॉटस्पॉट" : "Potential hotspots"}</h2>
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
                  {point.crop} · {point.risk} {language === "hi" ? "जोखिम" : "risk"}
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
