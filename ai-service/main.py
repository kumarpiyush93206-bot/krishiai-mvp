from io import BytesIO
from typing import Protocol

import cv2
import numpy as np
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from PIL import Image

app = FastAPI(title='KrishiAI AI Service', version='0.1.0-demo')


class PredictionResult(dict):
    """Stable prediction schema used across the stack."""


class AIModel(Protocol):
    adapter: str

    def predict(self, image: Image.Image, crop: str) -> dict: ...


class DemoModel:
    """Development-only fallback. Replace with a trained PyTorch/TensorFlow model behind the same interface."""

    adapter = 'DEMO'

    def predict(self, image: Image.Image, crop: str) -> dict:
        pixels = np.asarray(image, dtype=np.float32)
        gray = cv2.cvtColor(pixels.astype(np.uint8), cv2.COLOR_RGB2GRAY)
        texture = min(float(gray.std()) / 80, 1)
        hsv = cv2.cvtColor(pixels.astype(np.uint8), cv2.COLOR_RGB2HSV)
        green = cv2.inRange(hsv, np.array([25, 35, 25]), np.array([95, 255, 255]))
        brown = cv2.inRange(hsv, np.array([5, 45, 25]), np.array([28, 255, 210]))
        yellow = cv2.inRange(hsv, np.array([20, 45, 80]), np.array([45, 255, 255]))
        white = cv2.inRange(hsv, np.array([0, 0, 150]), np.array([180, 70, 255]))
        area = green.size
        signals = {'leaf_area': round(float(np.count_nonzero(green)) / area, 3), 'brown_orange': round(float(np.count_nonzero(brown)) / area, 3), 'yellowing': round(float(np.count_nonzero(yellow)) / area, 3), 'white_powder_like': round(float(np.count_nonzero(white)) / area, 3), 'texture': round(texture, 3)}
        disease_scores = {'Healthy': max(0.05, 1 - signals['brown_orange'] * 3 - signals['yellowing'] * 2 - signals['white_powder_like'] * 1.5)}
        if crop == 'Tomato':
            disease_scores.update({'Early Blight': signals['brown_orange'] * 2 + signals['yellowing'], 'Leaf Mold': signals['yellowing'] * 1.4 + signals['white_powder_like'], 'Septoria Leaf Spot': signals['brown_orange'] * 1.4 + texture * 0.35, 'Bacterial Spot': signals['brown_orange'] * 1.2 + texture * 0.25, 'Fusarium Wilt': (1 - signals['leaf_area']) * 0.4})
        elif crop == 'Wheat':
            disease_scores.update({'Leaf Rust': signals['brown_orange'] * 2, 'Stripe Rust': signals['yellowing'] * 1.5 + signals['brown_orange'], 'Powdery Mildew': signals['white_powder_like'] * 2, 'Septoria Blotch': signals['brown_orange'] * 1.4 + texture * 0.3})
        else:
            disease_scores.update({'Anthracnose': signals['brown_orange'] * 2 + texture * 0.2, 'Powdery Mildew': signals['white_powder_like'] * 2, 'Bacterial Leaf Spot': signals['brown_orange'] * 1.3 + texture * 0.25, 'Bacterial Wilt': (1 - signals['leaf_area']) * 0.45})
        ranked = sorted(disease_scores.items(), key=lambda item: item[1], reverse=True)
        label, raw_score = ranked[0]
        if label != 'Healthy' and raw_score < 0.28:
            label, raw_score = 'Healthy', disease_scores['Healthy']
        confidence = min(0.78, round(0.52 + abs(raw_score - 0.28) * 0.35, 2))
        top = [{'label': name, 'confidence': round(min(0.78, max(0.05, score / max(ranked[0][1], 1) * confidence)), 2)} for name, score in ranked[:3]]
        return {
            'prediction': label,
            'confidence': confidence,
            'top_predictions': top,
            'visual_signals': signals,
            'model_type': 'DEMO_OPENCV_HEURISTIC',
            'adapter': 'DEMO',
        }


def as_prediction_contract(raw: dict) -> dict:
    """Normalize all predictions to the stable API contract used across services."""
    prediction = raw.get('prediction') or raw.get('label') or 'Healthy'
    confidence = float(raw.get('confidence', 0.5) or 0.5)
    top_predictions = raw.get('top_predictions') or [
        {'label': prediction, 'confidence': confidence},
        {'label': 'Healthy', 'confidence': max(0.05, 1 - confidence)}
    ]
    normalized = []
    for item in top_predictions:
        normalized.append({
            'label': item.get('label') or prediction,
            'confidence': float(item.get('confidence', confidence) or confidence),
        })
    payload = {
        'prediction': prediction,
        'confidence': round(min(max(confidence, 0.0), 1.0), 4),
        'top_predictions': normalized,
        'visual_signals': raw.get('visual_signals') or {},
        'quality': raw.get('quality') or {'acceptable': True},
        'model_type': raw.get('model_type') or 'MODEL_ADAPTER',
        'adapter': raw.get('adapter') or ('DEMO' if 'DEMO' in (raw.get('model_type') or '').upper() else 'PRODUCTION'),
    }
    if not payload['top_predictions']:
        payload['top_predictions'] = [
            {'label': prediction, 'confidence': payload['confidence']},
            {'label': 'Healthy', 'confidence': max(0.05, 1 - payload['confidence'])},
        ]
    return payload


model: AIModel = DemoModel()

def quality_check(raw: bytes) -> dict:
    if len(raw) > 8 * 1024 * 1024:
        return {'acceptable': False, 'message': 'Please upload a clearer crop image.'}
    array = np.frombuffer(raw, dtype=np.uint8)
    decoded = cv2.imdecode(array, cv2.IMREAD_COLOR)
    if decoded is None:
        return {'acceptable': False, 'message': 'Please upload a clearer crop image.'}
    height, width = decoded.shape[:2]
    gray = cv2.cvtColor(decoded, cv2.COLOR_BGR2GRAY)
    blur = cv2.Laplacian(gray, cv2.CV_64F).var()
    brightness = float(np.mean(gray))
    if width < 224 or height < 224 or blur < 20 or brightness < 25 or brightness > 245:
        return {'acceptable': False, 'message': 'Please upload a clearer crop image.'}
    return {'acceptable': True, 'width': width, 'height': height, 'blurScore': round(blur, 2), 'brightness': round(brightness, 2)}

@app.get('/health')
def health():
    return {'ok': True, 'model_type': 'DEMO_DEVELOPMENT_ADAPTER'}

@app.post('/predict')
async def predict(crop: str = Form(...), image: UploadFile = File(...)):
    if crop not in {'Tomato', 'Wheat', 'Chilli'}:
        raise HTTPException(status_code=400, detail='Only Tomato, Wheat, and Chilli are supported.')
    if image.content_type not in {'image/jpeg', 'image/png', 'image/webp'}:
        raise HTTPException(status_code=400, detail='Please upload a JPG, PNG, or WebP crop image.')
    raw = await image.read()
    quality = quality_check(raw)
    if not quality['acceptable']:
        raise HTTPException(status_code=422, detail=quality['message'])
    try:
        pil_image = Image.open(BytesIO(raw)).convert('RGB')
    except Exception as exc:
        raise HTTPException(status_code=422, detail='Please upload a clearer crop image.') from exc
    result = as_prediction_contract(model.predict(pil_image, crop))
    result['quality'] = quality
    return result
