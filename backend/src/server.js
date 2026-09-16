import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import mongoose from 'mongoose';
import crypto from 'node:crypto';

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-change-me';
const LOW_CONFIDENCE_THRESHOLD = Number(process.env.LOW_CONFIDENCE_THRESHOLD || 0.72);
const crops = ['Tomato', 'Wheat', 'Chilli'];
const allowedProblems = ['Healthy', 'Early Blight', 'Leaf Mold', 'Septoria Leaf Spot', 'Bacterial Spot', 'Fusarium Wilt', 'Leaf Rust', 'Stripe Rust', 'Powdery Mildew', 'Septoria Blotch', 'Anthracnose', 'Bacterial Leaf Spot', 'Bacterial Wilt'];
const cropProblems = { Tomato: ['Healthy', 'Early Blight', 'Leaf Mold', 'Septoria Leaf Spot', 'Bacterial Spot', 'Fusarium Wilt'], Wheat: ['Healthy', 'Leaf Rust', 'Stripe Rust', 'Powdery Mildew', 'Septoria Blotch'], Chilli: ['Healthy', 'Anthracnose', 'Powdery Mildew', 'Bacterial Leaf Spot', 'Bacterial Wilt'] };
const upload = multer({ limits: { fileSize: 8 * 1024 * 1024 }, storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static('uploads'));

const memory = { users: [], fields: [], reports: [], cases: [], notifications: [], predictions: [], weather: [], ipm: [] };
const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const safeUser = ({ password, ...user }) => user;
const issueToken = user => jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
const distanceKm = (a, b) => { const r = Math.PI / 180; const x = (b.lat - a.lat) * r; const y = (b.lng - a.lng) * r; return Math.sqrt(x * x + y * y) * 6371; };

const ipmSeed = [
  { crop: 'Tomato', problem: 'Early Blight', symptoms: 'Brown target-like spots on older leaves; yellowing around lesions.', monitoring: 'Inspect lower canopy twice weekly after rain.', culturalControl: 'Remove affected leaves, keep foliage dry, stake plants, and rotate crops.', biologicalControl: 'Prefer locally approved biological products after expert confirmation.', mechanicalControl: 'Sanitize tools and remove fallen infected debris.', chemicalControl: 'No dosage is provided here. Consult a qualified local expert for an approved label.', safety: 'Follow label, pre-harvest interval, PPE, and local regulations.', source: 'ICAR horticulture guidance foundation', sourceUrl: 'https://icar.gov.in', lastVerified: '2026-01-15' },
  { crop: 'Tomato', problem: 'Leaf Mold', symptoms: 'Pale yellow spots on the upper leaf surface with olive-green to brown velvety growth underneath.', monitoring: 'Inspect older leaves and the underside of foliage during humid conditions.', culturalControl: 'Improve ventilation, avoid wetting leaves, reduce humidity, and remove affected debris.', biologicalControl: 'Prefer locally approved biological products after expert confirmation.', mechanicalControl: 'Prune affected leaves with sanitized tools and dispose of them away from the field.', chemicalControl: 'No dosage is provided here. Consult a qualified local expert for an approved label.', safety: 'Follow label, pre-harvest interval, PPE, and local regulations.', source: 'ICAR horticulture guidance foundation', sourceUrl: 'https://icar.gov.in', lastVerified: '2026-01-15' },
  { crop: 'Tomato', problem: 'Septoria Leaf Spot', symptoms: 'Small circular spots with dark margins and pale centers, often on lower leaves.', monitoring: 'Scout lower leaves after rainfall and record spread across the field.', culturalControl: 'Use clean transplants, rotate crops, improve airflow, and avoid overhead irrigation.', biologicalControl: 'Prefer locally approved biological products after expert confirmation.', mechanicalControl: 'Remove infected leaves and crop debris with sanitized tools.', chemicalControl: 'No dosage is provided here. Consult a qualified local expert for an approved label.', safety: 'Follow the product label, PPE, re-entry, and pre-harvest requirements.', source: 'ICAR horticulture guidance foundation', sourceUrl: 'https://icar.gov.in', lastVerified: '2026-01-15' },
  { crop: 'Tomato', problem: 'Bacterial Spot', symptoms: 'Small dark water-soaked spots on leaves, stems, or fruit.', monitoring: 'Inspect new growth and fruit after wet weather; avoid handling wet plants.', culturalControl: 'Use clean seed and transplants, improve airflow, and avoid overhead irrigation.', biologicalControl: 'Ask an expert about locally registered biological products.', mechanicalControl: 'Remove severely affected plant parts and sanitize tools.', chemicalControl: 'No dosage is provided here. Use only expert-approved registered products.', safety: 'Follow label directions and use appropriate PPE.', source: 'ICAR horticulture guidance foundation', sourceUrl: 'https://icar.gov.in', lastVerified: '2026-01-15' },
  { crop: 'Tomato', problem: 'Fusarium Wilt', symptoms: 'One-sided yellowing, wilting, and brown vascular tissue in stems.', monitoring: 'Check individual plants and compare wilting with soil moisture.', culturalControl: 'Use resistant varieties, rotate away from solanaceous crops, and maintain drainage.', biologicalControl: 'Discuss approved biological soil-health options with an expert.', mechanicalControl: 'Remove and dispose of severely affected plants; clean tools and footwear.', chemicalControl: 'No dosage is provided here. Seek expert advice because soil-borne disease control is site-specific.', safety: 'Do not spread contaminated soil or plant debris between fields.', source: 'ICAR horticulture guidance foundation', sourceUrl: 'https://icar.gov.in', lastVerified: '2026-01-15' },
  { crop: 'Wheat', problem: 'Leaf Rust', symptoms: 'Orange-brown powdery pustules on leaves.', monitoring: 'Scout representative plants across the field weekly.', culturalControl: 'Use resistant varieties where available and avoid excess nitrogen.', biologicalControl: 'Discuss registered biological options with an expert.', mechanicalControl: 'Remove volunteer wheat and manage alternate hosts.', chemicalControl: 'No dosage is provided here. Use only expert-approved, registered products.', safety: 'Use PPE and respect label and re-entry instructions.', source: 'ICAR crop protection guidance foundation', sourceUrl: 'https://icar.gov.in', lastVerified: '2026-01-15' },
  { crop: 'Wheat', problem: 'Stripe Rust', symptoms: 'Yellow-orange pustules arranged in stripes along wheat leaves.', monitoring: 'Scout early in the season and inspect cool, humid field edges.', culturalControl: 'Use locally recommended resistant varieties and balanced nutrition.', biologicalControl: 'Ask an expert about registered biological options.', mechanicalControl: 'Manage volunteer wheat and field sanitation.', chemicalControl: 'No dosage is provided here. Use only expert-approved, registered products.', safety: 'Follow label, PPE, re-entry, and pre-harvest requirements.', source: 'ICAR crop protection guidance foundation', sourceUrl: 'https://icar.gov.in', lastVerified: '2026-01-15' },
  { crop: 'Wheat', problem: 'Powdery Mildew', symptoms: 'White powdery growth on leaves and stems.', monitoring: 'Inspect dense canopy areas weekly during cool humid periods.', culturalControl: 'Avoid excess nitrogen and maintain balanced crop density.', biologicalControl: 'Discuss registered biological options with an expert.', mechanicalControl: 'Remove volunteer hosts and manage field sanitation.', chemicalControl: 'No dosage is provided here. Use only expert-approved, registered products.', safety: 'Use PPE and follow the product label.', source: 'ICAR crop protection guidance foundation', sourceUrl: 'https://icar.gov.in', lastVerified: '2026-01-15' },
  { crop: 'Wheat', problem: 'Septoria Blotch', symptoms: 'Tan or brown leaf blotches, sometimes with dark fruiting bodies.', monitoring: 'Inspect lower leaves after prolonged wetness and record spread.', culturalControl: 'Use clean seed, rotate crops, manage residue, and avoid dense wet canopy.', biologicalControl: 'Ask an expert about registered biological options.', mechanicalControl: 'Manage infected residue and volunteer wheat.', chemicalControl: 'No dosage is provided here. Use only expert-approved, registered products.', safety: 'Follow local label and PPE requirements.', source: 'ICAR crop protection guidance foundation', sourceUrl: 'https://icar.gov.in', lastVerified: '2026-01-15' },
  { crop: 'Chilli', problem: 'Anthracnose', symptoms: 'Sunken dark fruit lesions and dieback on shoots.', monitoring: 'Check fruit and new growth twice weekly during humid weather.', culturalControl: 'Use clean seed, remove affected fruit, improve spacing and drainage.', biologicalControl: 'Ask an expert about registered biological controls.', mechanicalControl: 'Collect and destroy infected fruit away from the field.', chemicalControl: 'No dosage is provided here. Consult an expert for approved options.', safety: 'Never mix products or use unlabelled recommendations.', source: 'ICAR vegetable crop protection guidance foundation', sourceUrl: 'https://icar.gov.in', lastVerified: '2026-01-15' }
  , { crop: 'Chilli', problem: 'Powdery Mildew', symptoms: 'White powdery growth on leaves with yellowing and premature leaf drop.', monitoring: 'Inspect young leaves and shaded canopy areas weekly.', culturalControl: 'Improve spacing and airflow, avoid excess nitrogen, and manage humidity.', biologicalControl: 'Ask an expert about registered biological controls.', mechanicalControl: 'Remove severely affected leaves and sanitize tools.', chemicalControl: 'No dosage is provided here. Consult an expert for approved options.', safety: 'Use PPE and follow the registered product label.', source: 'ICAR vegetable crop protection guidance foundation', sourceUrl: 'https://icar.gov.in', lastVerified: '2026-01-15' }
  , { crop: 'Chilli', problem: 'Bacterial Leaf Spot', symptoms: 'Small dark water-soaked spots that may coalesce on leaves and fruit.', monitoring: 'Inspect leaves and fruit after rain; avoid working among wet plants.', culturalControl: 'Use clean seed, improve airflow, and avoid overhead irrigation.', biologicalControl: 'Ask an expert about registered biological controls.', mechanicalControl: 'Remove affected debris and sanitize tools between plants.', chemicalControl: 'No dosage is provided here. Consult an expert for approved options.', safety: 'Follow label directions and PPE requirements.', source: 'ICAR vegetable crop protection guidance foundation', sourceUrl: 'https://icar.gov.in', lastVerified: '2026-01-15' }
  , { crop: 'Chilli', problem: 'Bacterial Wilt', symptoms: 'Rapid wilting while leaves may remain green; brown discoloration in the stem may occur.', monitoring: 'Check isolated wilted plants and avoid moving soil or irrigation water.', culturalControl: 'Use healthy planting material, improve drainage, and rotate crops.', biologicalControl: 'Discuss approved biological soil-health options with an expert.', mechanicalControl: 'Remove affected plants with surrounding soil and clean tools.', chemicalControl: 'No dosage is provided here. Site-specific expert referral is required.', safety: 'Prevent movement of contaminated soil, water, and plant debris.', source: 'ICAR vegetable crop protection guidance foundation', sourceUrl: 'https://icar.gov.in', lastVerified: '2026-01-15' }
];

function seedDemo() {
  if (memory.users.length) return;
  const password = bcrypt.hashSync('Demo@123', 10);
  memory.users.push(
    { id: id(), name: 'Demo Farmer', email: 'farmer@demo.krishiai', password, role: 'farmer', language: 'en', isDemo: true },
    { id: id(), name: 'Dr. Meera Expert', email: 'expert@demo.krishiai', password, role: 'expert', language: 'en', isDemo: true },
    { id: id(), name: 'Amit Officer', email: 'officer@demo.krishiai', password, role: 'officer', language: 'en', isDemo: true }
  );
  memory.ipm.push(...ipmSeed.map(item => ({ ...item, id: id() })));
}
seedDemo();

async function connectMongo() {
  if (!process.env.MONGO_URI) return;
  try { await mongoose.connect(process.env.MONGO_URI); console.log('MongoDB connected'); }
  catch (error) { console.warn('MongoDB unavailable; using demo adapter:', error.message); }
}
function auth(req, res, next) { try { const token = req.headers.authorization?.replace('Bearer ', ''); if (!token) return res.status(401).json({ message: 'Login required' }); req.user = jwt.verify(token, JWT_SECRET); next(); } catch { res.status(401).json({ message: 'Invalid or expired session' }); } }
function roles(...allowed) { return (req, res, next) => allowed.includes(req.user.role) ? next() : res.status(403).json({ message: 'This role cannot access that workflow' }); }
function findUser(idValue) { return memory.users.find(user => user.id === idValue); }
function validateCrop(crop) { return crops.includes(crop); }
function riskFor({ confidence, weather, crop, stage, nearbyCount }) {
  let score = confidence < LOW_CONFIDENCE_THRESHOLD ? 2 : 0;
  const reasons = [];
  if (weather?.humidity >= 80) { score += 2; reasons.push('High humidity'); }
  if (weather?.temperature >= 20 && weather?.temperature <= 32) { score += 1; reasons.push('Suitable temperature for disease pressure'); }
  if (nearbyCount >= 2) { score += 2; reasons.push('Recent nearby reports'); }
  if (stage === 'flowering' || stage === 'fruiting') { score += 1; reasons.push(`Sensitive ${stage} stage`); }
  if (crop === 'Tomato' && weather?.precipitation >= 5) reasons.push('Recent rainfall can spread foliar disease');
  if (!reasons.length) reasons.push('No elevated weather or nearby-report signals');
  return { level: score >= 5 ? 'HIGH' : score >= 2 ? 'MEDIUM' : 'LOW', reasons };
}
async function getWeather(lat, lng) {
  try {
    const url = process.env.WEATHER_API_KEY
      ? `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&units=metric&appid=${process.env.WEATHER_API_KEY}`
      : `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation&hourly=temperature_2m,precipitation_probability&forecast_days=1&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('weather api error');
    const data = await response.json();
    if (!process.env.WEATHER_API_KEY) {
      return { available: true, provider: 'Open-Meteo', temperature: data.current?.temperature_2m, humidity: data.current?.relative_humidity_2m, precipitation: data.current?.precipitation || 0, forecast: data.hourly?.time?.slice(0, 4).map((time, index) => ({ time, temperature: data.hourly.temperature_2m[index], rain: data.hourly.precipitation_probability[index] })) || [] };
    }
    const current = data.list?.[0];
    return { available: true, provider: 'OpenWeather', temperature: current?.main?.temp, humidity: current?.main?.humidity, precipitation: (current?.rain?.['3h'] || 0), forecast: data.list?.slice(0, 4).map(item => ({ time: item.dt_txt, temperature: item.main.temp, rain: item.rain?.['3h'] || 0 })) || [] };
  } catch { return { available: false, message: 'Weather unavailable' }; }
}
async function predict(buffer, crop) {
  const form = new FormData(); form.append('crop', crop); form.append('image', new Blob([buffer]), 'crop.jpg');
  try { const response = await fetch(`${process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000'}/predict`, { method: 'POST', body: form }); if (response.ok) return response.json(); } catch { /* service can be started independently */ }
  const digest = crypto.createHash('sha256').update(buffer).digest();
  const diseaseLabels = {
    Tomato: ['Early Blight', 'Leaf Mold', 'Septoria Leaf Spot', 'Bacterial Spot', 'Fusarium Wilt'],
    Wheat: ['Leaf Rust', 'Stripe Rust', 'Powdery Mildew', 'Septoria Blotch'],
    Chilli: ['Anthracnose', 'Powdery Mildew', 'Bacterial Leaf Spot', 'Bacterial Wilt'],
  };
  const diseaseSignal = (digest[0] + digest[1]) / 510;
  const candidates = diseaseLabels[crop] || ['Crop stress'];
  const prediction = diseaseSignal >= 0.5 ? candidates[digest[2] % candidates.length] : 'Healthy';
  const confidence = Number((0.54 + Math.abs(diseaseSignal - 0.5) * 0.36).toFixed(2));
  const alternate = prediction === 'Healthy' ? candidates[digest[2] % candidates.length] : 'Healthy';
  return { prediction, confidence, top_predictions: [{ label: prediction, confidence }, { label: alternate, confidence: Number((1 - confidence).toFixed(2)) }], model_type: 'DEMO_HEURISTIC_FALLBACK', quality: { acceptable: true } };
}

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'KrishiAI API', mode: process.env.MONGO_URI ? 'mongo-configured' : 'demo-memory' }));
app.post('/api/auth/register', async (req, res) => { const { name, email, password, role = 'farmer' } = req.body; if (!name || !email || !password || password.length < 6) return res.status(400).json({ message: 'Name, email and a 6+ character password are required' }); if (memory.users.some(user => user.email === email.toLowerCase())) return res.status(409).json({ message: 'Email already registered' }); const user = { id: id(), name, email: email.toLowerCase(), password: await bcrypt.hash(password, 10), role: role === 'farmer' ? 'farmer' : 'farmer', language: 'en', isDemo: false }; memory.users.push(user); res.status(201).json({ user: safeUser(user), token: issueToken(user) }); });
app.post('/api/auth/login', async (req, res) => { const user = memory.users.find(item => item.email === req.body.email?.toLowerCase()); if (!user || !(await bcrypt.compare(req.body.password || '', user.password))) return res.status(401).json({ message: 'Invalid email or password' }); res.json({ user: safeUser(user), token: issueToken(user) }); });
app.get('/api/auth/me', auth, (req, res) => res.json({ user: safeUser(findUser(req.user.id)) }));
app.post('/api/fields', auth, roles('farmer'), (req, res) => { const { name, crop, sowingDate, stage, latitude, longitude } = req.body; if (!name || !validateCrop(crop)) return res.status(400).json({ message: 'Field name and one supported crop are required' }); const field = { id: id(), farmerId: req.user.id, name, crop, sowingDate, stage, latitude: Number(latitude), longitude: Number(longitude), createdAt: now() }; memory.fields.push(field); res.status(201).json(field); });
app.get('/api/fields', auth, (req, res) => res.json(memory.fields.filter(item => req.user.role === 'farmer' ? item.farmerId === req.user.id : true)));
app.post('/api/ai/predict', auth, roles('farmer'), upload.single('image'), async (req, res) => { if (!req.file || !validateCrop(req.body.crop)) return res.status(400).json({ message: 'Supported crop and image are required' }); if (!['image/jpeg', 'image/png', 'image/webp'].includes(req.file.mimetype)) return res.status(400).json({ message: 'Please upload a JPG, PNG, or WebP crop image.' }); res.json(await predict(req.file.buffer, req.body.crop)); });
app.get('/api/weather', auth, async (req, res) => res.json(await getWeather(Number(req.query.lat), Number(req.query.lng))));
app.post('/api/reports', auth, roles('farmer'), upload.single('image'), async (req, res) => { const { fieldId, crop, stage, latitude, longitude, imageDataUrl } = req.body; if (!validateCrop(crop) || !stage) return res.status(400).json({ message: 'Crop and crop stage are required' }); if (!req.file && !imageDataUrl) return res.status(400).json({ message: 'Crop image is required' }); if (req.file && !['image/jpeg', 'image/png', 'image/webp'].includes(req.file.mimetype)) return res.status(400).json({ message: 'Please upload a JPG, PNG, or WebP crop image.' }); if (req.file && req.file.size > 8 * 1024 * 1024) return res.status(400).json({ message: 'Please upload an image smaller than 8 MB.' }); const prediction = req.file ? await predict(req.file.buffer, crop) : { prediction: 'Healthy', confidence: 0.76, top_predictions: [], model_type: 'DEMO_FALLBACK' }; const weather = await getWeather(Number(latitude), Number(longitude)); const nearbyCount = memory.reports.filter(item => item.latitude && distanceKm(item, { lat: Number(latitude), lng: Number(longitude) }) < 25).length; const risk = riskFor({ confidence: prediction.confidence, weather, crop, stage, nearbyCount }); const report = { id: id(), farmerId: req.user.id, fieldId, crop, stage, latitude: Number(latitude), longitude: Number(longitude), imageUrl: imageDataUrl || `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, prediction, weather, risk, status: prediction.confidence < LOW_CONFIDENCE_THRESHOLD ? 'expert_review' : 'advisory_ready', followUp: null, createdAt: now() }; memory.reports.push(report); memory.predictions.push({ id: id(), reportId: report.id, ...prediction, createdAt: now() }); if (report.status === 'expert_review') memory.cases.push({ id: id(), reportId: report.id, status: 'pending', createdAt: now() }); res.status(201).json(report); });
app.get('/api/reports', auth, (req, res) => res.json(memory.reports.filter(item => req.user.role === 'farmer' ? item.farmerId === req.user.id : true).sort((a, b) => b.createdAt.localeCompare(a.createdAt))));
app.get('/api/reports/:id', auth, (req, res) => { const report = memory.reports.find(item => item.id === req.params.id); if (!report || (req.user.role === 'farmer' && report.farmerId !== req.user.id)) return res.status(404).json({ message: 'Report not found' }); res.json({ report, ipm: memory.ipm.find(item => item.crop === report.crop && item.problem === report.prediction.prediction) || memory.ipm.find(item => item.crop === report.crop) }); });
app.post('/api/reports/:id/follow-up', auth, roles('farmer'), (req, res) => { const report = memory.reports.find(item => item.id === req.params.id && item.farmerId === req.user.id); if (!report) return res.status(404).json({ message: 'Report not found' }); report.followUp = { note: req.body.note, createdAt: now() }; res.json(report); });
app.post('/api/reports/:id/expert-review', auth, roles('farmer'), (req, res) => { const report = memory.reports.find(item => item.id === req.params.id && item.farmerId === req.user.id); if (!report) return res.status(404).json({ message: 'Report not found' }); if (!memory.cases.some(item => item.reportId === report.id)) memory.cases.push({ id: id(), reportId: report.id, status: 'pending', createdAt: now(), requestedBy: req.user.id }); report.status = 'expert_review'; res.json({ message: 'Expert review requested' }); });
app.get('/api/ipm/:crop/:problem', auth, (req, res) => res.json(memory.ipm.find(item => item.crop === req.params.crop && item.problem === req.params.problem) || memory.ipm.find(item => item.crop === req.params.crop) || null));
app.get('/api/expert/cases', auth, roles('expert'), (req, res) => res.json(memory.cases.filter(item => item.status === 'pending').map(item => ({ ...item, report: memory.reports.find(report => report.id === item.reportId) }))));
app.put('/api/expert/cases/:id/validate', auth, roles('expert'), (req, res) => { const caseItem = memory.cases.find(item => item.id === req.params.id); if (!caseItem) return res.status(404).json({ message: 'Case not found' }); const report = memory.reports.find(item => item.id === caseItem.reportId); const prediction = req.body.prediction || report.prediction.prediction; if (!cropProblems[report.crop]?.includes(prediction)) return res.status(400).json({ message: `${prediction} is not a supported problem for ${report.crop}` }); report.prediction = { ...report.prediction, prediction, expertValidated: true, model_type: 'EXPERT_VALIDATED' }; report.status = 'validated'; report.expertRemarks = req.body.remarks || ''; caseItem.status = 'validated'; caseItem.validatedBy = req.user.id; caseItem.validatedAt = now(); res.json({ case: caseItem, report }); });
app.get('/api/hotspots', auth, roles('officer'), (_req, res) => { const points = memory.reports.map(report => ({ ...report, nearbyReports: memory.reports.filter(other => other.id !== report.id && distanceKm(report, other) < 25).length })).filter(item => item.nearbyReports >= 2); res.json(points); });
app.get('/api/dashboard/farmer', auth, roles('farmer'), (req, res) => { const reports = memory.reports.filter(item => item.farmerId === req.user.id); res.json({ reports, fields: memory.fields.filter(item => item.farmerId === req.user.id), pendingReviews: reports.filter(item => item.status === 'expert_review').length }); });
app.get('/api/dashboard/expert', auth, roles('expert'), (_req, res) => res.json({ pending: memory.cases.filter(item => item.status === 'pending').length, validated: memory.cases.filter(item => item.status === 'validated').length }));
app.get('/api/dashboard/officer', auth, roles('officer'), (_req, res) => { const counts = {}; memory.reports.forEach(report => { counts[report.prediction.prediction] = (counts[report.prediction.prediction] || 0) + 1; }); res.json({ totalReports: memory.reports.length, highRisk: memory.reports.filter(item => item.risk.level === 'HIGH').length, problemCounts: counts, recentReports: memory.reports.slice(-8).reverse(), hotspots: memory.reports.map(report => ({ latitude: report.latitude, longitude: report.longitude, crop: report.crop, risk: report.risk.level })) }); });

connectMongo().finally(() => app.listen(PORT, () => console.log(`KrishiAI API listening on http://localhost:${PORT}`)));
