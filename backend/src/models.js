import mongoose from 'mongoose';

const base = { timestamps: true };
export const User = mongoose.model('User', new mongoose.Schema({ name: String, email: { type: String, unique: true }, password: String, role: { type: String, enum: ['farmer', 'expert', 'officer'] }, language: String }, base));
export const Field = mongoose.model('Field', new mongoose.Schema({ farmerId: mongoose.Schema.Types.ObjectId, name: String, crop: String, sowingDate: Date, stage: String, location: { latitude: Number, longitude: Number } }, base));
export const CropReport = mongoose.model('CropReport', new mongoose.Schema({ farmerId: mongoose.Schema.Types.ObjectId, fieldId: mongoose.Schema.Types.ObjectId, crop: String, stage: String, imageUrl: String, location: { latitude: Number, longitude: Number }, prediction: Object, weather: Object, risk: Object, status: String }, base));
export const Prediction = mongoose.model('Prediction', new mongoose.Schema({ reportId: mongoose.Schema.Types.ObjectId, prediction: String, confidence: Number, top_predictions: Array, model_type: String }, base));
export const WeatherData = mongoose.model('WeatherData', new mongoose.Schema({ reportId: mongoose.Schema.Types.ObjectId, available: Boolean, temperature: Number, humidity: Number, precipitation: Number, forecast: Array }, base));
export const IPMGuidance = mongoose.model('IPMGuidance', new mongoose.Schema({ crop: String, problem: String, symptoms: String, monitoring: String, culturalControl: String, biologicalControl: String, mechanicalControl: String, chemicalControl: String, safety: String, source: String, sourceUrl: String, lastVerified: String }, base));
export const ExpertCase = mongoose.model('ExpertCase', new mongoose.Schema({ reportId: mongoose.Schema.Types.ObjectId, status: String, validatedBy: mongoose.Schema.Types.ObjectId, remarks: String }, base));
export const ExpertValidation = mongoose.model('ExpertValidation', new mongoose.Schema({ caseId: mongoose.Schema.Types.ObjectId, expertId: mongoose.Schema.Types.ObjectId, prediction: String, remarks: String }, base));
export const Notification = mongoose.model('Notification', new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, type: String, message: String, read: Boolean }, base));
